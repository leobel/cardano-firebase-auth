import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { cert } from 'firebase-admin/app';
import { config } from './config';
import { userExists } from './userExists';
import { generateMessage } from './generateMessage';
import { verifyMessage } from './verifyMessage';

export const greetTheWorld = functions.https.onRequest(
  (req: functions.Request, res: functions.Response) => {
    // Here we reference a user-provided parameter
    // (its value is provided by the user during installation)
    const consumerProvidedGreeting = process.env.GREETING;

    // And here we reference an auto-populated parameter
    // (its value is provided by Firebase after installation)
    const instanceId = process.env.EXT_INSTANCE_ID;

    const greeting = `${consumerProvidedGreeting} World from ${instanceId}`;

    res.send(greeting);
  });

const app = admin.initializeApp(
  // { projectId: 'demo-test' } // this is for auth works properly and insert users in demo-test db (internally they have the users but not show in the UI)
  {
    credential: cert({
      projectId: config.serviceAccountProjectId,
      clientEmail: config.serviceAccountEmail,
      privateKey: config.serviceAccountPrivateKey,
    })
  }
);

const auth = admin.auth(app);

type NetworkType = 'cardano';

// ~/ext-cardano-auth-requestMessage

interface RequestMessageData {
  networkType: NetworkType;

  // addr...:
  address: string;

  // mainnet:
  network: string;

  // wallet
  wallet: string;
}

export const requestMessage = functions.https.onCall(async (data: RequestMessageData) => {
  if (!data.address) {
    throw new functions.https.HttpsError('invalid-argument', 'Address is required');
  }

  const now = new Date();
  const fifteenMinutes = 900000;
  const expirationTime = new Date(now.getTime() + fifteenMinutes);
  const websiteUrl = new URL(config.websiteUri);

  const params = {
    domain: websiteUrl.hostname,
    uri: websiteUrl.toString(),
    statement: 'To authenticate please sign this message.',
    expirationTime: expirationTime.toISOString(),
    notBefore: now.toISOString(),
    timeout: 60,
  };


  if (data.networkType === 'cardano') {
    if (!data.network) {
      throw new functions.https.HttpsError('invalid-argument', 'Cardano network is required');
    }

    const response = await generateMessage({
      ...params,
      address: data.address,
      network: data.network,
      wallet: data.wallet
    });
    return response;
  }

  throw new functions.https.HttpsError('invalid-argument', `Not supported network type: ${data.networkType}`);
});

// ~/ext-cardano-auth-issueToken

interface IssueTokenData {
  networkType: NetworkType;
  message: string;
  signature: string;
  key: string;
}

export const issueToken = functions.https.onCall(async (data: IssueTokenData) => {
  if (!data.message) {
    throw new functions.https.HttpsError('invalid-argument', 'Message is required');
  }
  if (!data.signature) {
    throw new functions.https.HttpsError('invalid-argument', 'Signature is required');
  }

  const params = {
    message: data.message,
    signature: data.signature,
    key: data.key
  };

  let uid: string | null = null;
  let address: string | null = null;

  if (data.networkType === 'cardano') {
    try {
      const response = await verifyMessage({
        ...params,
      });
      uid = response.profileId;
      address = response.address;
    } catch (error) {
      throw new functions.https.HttpsError('invalid-argument', `Invalid signature: ${data.signature}`);
    }
  }
  else {
    throw new functions.https.HttpsError('invalid-argument', `Not supported network type: ${data.networkType}`);
  }

  if (!(await userExists(auth, uid))) {
    await auth.createUser({
      uid,
      displayName: address,
    });
  }

  const token = await auth.createCustomToken(uid);
  return { token };
});
