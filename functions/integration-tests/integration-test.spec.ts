import axios from "axios";
import * as chai from "chai";
import * as chaiAsPromised from 'chai-as-promised';
import { getApp, initializeApp } from "firebase/app";
import { Functions, connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth, connectAuthEmulator } from "firebase/auth";

chai.use(chaiAsPromised)
const expect = chai.expect;

describe("tangocrypto-auth", () => {
  let functions: Functions;

  before(() => {
    initializeApp({ projectId: 'demo-test', appId: 'demo-id', apiKey: 'demo-key' });
    const app = getApp()
    functions = getFunctions(app);
    const auth = getAuth(app);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  })

  it("should respond with the configured greeting", async () => {
    const expected = "Hello World from tangocrypto-auth";

    const httpFunctionUri = "http://localhost:5001/demo-test/us-central1/ext-tangocrypto-auth-greetTheWorld/";
    const res = await axios.get(httpFunctionUri);

    expect(res.data).to.eql(expected);
  })

  it("should respond with a message to sign", async () => {
    const data = {
      "address": "addr1q97saku7cvu25at5feh5zq822j3apv9kaktc2w6jrp8d4h77e28nn969w0auevwz6dylkf8hg8l8knwpj6flp53g0naqe2v2ec",
      "networkType": "cardano",
      "network": "testnet",
      "wallet": 'Eternl'
    }

    const response = await httpsCallable<any, any>(functions, 'ext-tangocrypto-auth-requestMessage')(data);
    expect(response.data.id.length).to.equal(32);
    expect(response.data.profileId.length).to.equal(58);
  })

  it('should success verifying signed message and issue token', async () => {
    const data = {
      networkType: "cardano",
      message: `continent.io wants you to sign in with your Eternl account:
addr1q97saku7cvu25at5feh5zq822j3apv9kaktc2w6jrp8d4h77e28nn969w0auevwz6dylkf8hg8l8knwpj6flp53g0naqe2v2ec

To authenticate please sign this message.

URI: https://continent.io/
Version: 1
Chain ID: testnet
Nonce: pE/P2TpeXko+T292lCvvpQ==
Issued At: 2023-08-04T12:32:31.364Z
Expiration Time: 2023-08-05T12:47:31.364Z
Not Before: 2023-08-04T12:32:31.364Z`,
      signature: "845846a2012767616464726573735839017d0edb9ec338aa75744e6f4100ea54a3d0b0b6ed97853b52184edadfdeca8f39974573fbccb1c2d349fb24f741fe7b4dc19693f0d2287cfaa166686173686564f459019a636f6e74696e656e742e696f2077616e747320796f7520746f207369676e20696e207769746820796f757220457465726e6c206163636f756e743a0a616464723171393773616b75376376753235617435666568357a713832326a33617076396b616b74633277366a72703864346837376532386e6e393639773061756576777a3664796c6b66386867386c386b6e77706a36666c70353367306e61716532763265630a0a546f2061757468656e74696361746520706c65617365207369676e2074686973206d6573736167652e0a0a5552493a2068747470733a2f2f636f6e74696e656e742e696f2f0a56657273696f6e3a20310a436861696e2049443a20746573746e65740a4e6f6e63653a2070452f5032547065586b6f2b543239326c43767670513d3d0a4973737565642041743a20323032332d30382d30345431323a33323a33312e3336345a0a45787069726174696f6e2054696d653a20323032332d30382d30355431323a34373a33312e3336345a0a4e6f74204265666f72653a20323032332d30382d30345431323a33323a33312e3336345a58408f8d2527032a2fb733d60484310383f08e8525b30bd42f5bd0e31d8ad6f1ccd2bc4c4ca0198dcf608efe12e5658a7f9502e547497ef60c13ff81e6804aae3505",
      key: "a401010327200621582083320c141cc15bcea0857d2ecea37a63ec4b05ccc0f37c9abe4b367b5da8c0f8"
    }

    const response = await httpsCallable<any, any>(functions, 'ext-greet-the-world-issueToken')(data);
    expect(response.data.token).not.null;

  })

  it('should fail verifying signed message: Invalid signature', async () => {
    const data = {
      networkType: "cardano",
      message: `continent.io wants you to sign in with your Eternl account:
addr1q8ku5x2khrepfkxe4hr9vfyjfkv3sqx8yj0mdar2m7us536xttlhqwksd9f3uq6w2glddpwvl6gg2ed9s60ev8f262usxu2j4l

To authenticate please sign this message.

URI: https://continent.io/
Version: 1
Chain ID: testnet
Nonce: pE/P2TpeXko+T292lCvvpQ==
Issued At: 2023-08-04T12:32:31.364Z
Expiration Time: 2023-08-05T12:47:31.364Z
Not Before: 2023-08-04T12:32:31.364Z`,
      signature: "845846a2012767616464726573735839017d0edb9ec338aa75744e6f4100ea54a3d0b0b6ed97853b52184edadfdeca8f39974573fbccb1c2d349fb24f741fe7b4dc19693f0d2287cfaa166686173686564f459019a636f6e74696e656e742e696f2077616e747320796f7520746f207369676e20696e207769746820796f757220457465726e6c206163636f756e743a0a616464723171393773616b75376376753235617435666568357a713832326a33617076396b616b74633277366a72703864346837376532386e6e393639773061756576777a3664796c6b66386867386c386b6e77706a36666c70353367306e61716532763265630a0a546f2061757468656e74696361746520706c65617365207369676e2074686973206d6573736167652e0a0a5552493a2068747470733a2f2f636f6e74696e656e742e696f2f0a56657273696f6e3a20310a436861696e2049443a20746573746e65740a4e6f6e63653a2070452f5032547065586b6f2b543239326c43767670513d3d0a4973737565642041743a20323032332d30382d30345431323a33323a33312e3336345a0a45787069726174696f6e2054696d653a20323032332d30382d30355431323a34373a33312e3336345a0a4e6f74204265666f72653a20323032332d30382d30345431323a33323a33312e3336345a58408f8d2527032a2fb733d60484310383f08e8525b30bd42f5bd0e31d8ad6f1ccd2bc4c4ca0198dcf608efe12e5658a7f9502e547497ef60c13ff81e6804aae3505",
      key: "a401010327200621582083320c141cc15bcea0857d2ecea37a63ec4b05ccc0f37c9abe4b367b5da8c0f8"
    }

    await expect(httpsCallable<any, any>(functions, 'ext-tangocrypto-auth-issueToken')(data)).to.eventually.rejectedWith(Error)

  })

  it('should fail verifying signed message: Cannot sign before time', async () => {
    const data = {
      networkType: "cardano",
      message: `continent.io wants you to sign in with your Eternl account:
addr1q97saku7cvu25at5feh5zq822j3apv9kaktc2w6jrp8d4h77e28nn969w0auevwz6dylkf8hg8l8knwpj6flp53g0naqe2v2ec

To authenticate please sign this message.

URI: https://continent.io/
Version: 1
Chain ID: testnet
Nonce: pE/P2TpeXko+T292lCvvpQ==
Issued At: 2023-08-04T12:32:31.364Z
Expiration Time: 2023-08-05T12:47:31.364Z
Not Before: 2300-08-04T12:32:31.364Z`,
      signature: "845846a2012767616464726573735839017d0edb9ec338aa75744e6f4100ea54a3d0b0b6ed97853b52184edadfdeca8f39974573fbccb1c2d349fb24f741fe7b4dc19693f0d2287cfaa166686173686564f459019a636f6e74696e656e742e696f2077616e747320796f7520746f207369676e20696e207769746820796f757220457465726e6c206163636f756e743a0a616464723171393773616b75376376753235617435666568357a713832326a33617076396b616b74633277366a72703864346837376532386e6e393639773061756576777a3664796c6b66386867386c386b6e77706a36666c70353367306e61716532763265630a0a546f2061757468656e74696361746520706c65617365207369676e2074686973206d6573736167652e0a0a5552493a2068747470733a2f2f636f6e74696e656e742e696f2f0a56657273696f6e3a20310a436861696e2049443a20746573746e65740a4e6f6e63653a2070452f5032547065586b6f2b543239326c43767670513d3d0a4973737565642041743a20323032332d30382d30345431323a33323a33312e3336345a0a45787069726174696f6e2054696d653a20323032332d30382d30355431323a34373a33312e3336345a0a4e6f74204265666f72653a20323032332d30382d30345431323a33323a33312e3336345a58408f8d2527032a2fb733d60484310383f08e8525b30bd42f5bd0e31d8ad6f1ccd2bc4c4ca0198dcf608efe12e5658a7f9502e547497ef60c13ff81e6804aae3505",
      key: "a401010327200621582083320c141cc15bcea0857d2ecea37a63ec4b05ccc0f37c9abe4b367b5da8c0f8"
    }

    await expect(httpsCallable<any, any>(functions, 'ext-tangocrypto-auth-issueToken')(data)).to.eventually.rejectedWith(Error)

  })

  it('should fail verifying signed message: Cannot sign after time', async () => {
    const data = {
      networkType: "cardano",
      message: `continent.io wants you to sign in with your Eternl account:
addr1q97saku7cvu25at5feh5zq822j3apv9kaktc2w6jrp8d4h77e28nn969w0auevwz6dylkf8hg8l8knwpj6flp53g0naqe2v2ec

To authenticate please sign this message.

URI: https://continent.io/
Version: 1
Chain ID: testnet
Nonce: pE/P2TpeXko+T292lCvvpQ==
Issued At: 2023-08-04T12:32:31.364Z
Expiration Time: 2023-08-04T12:47:31.364Z
Not Before: 2023-08-04T12:32:31.364Z`,
      signature: "845846a2012767616464726573735839017d0edb9ec338aa75744e6f4100ea54a3d0b0b6ed97853b52184edadfdeca8f39974573fbccb1c2d349fb24f741fe7b4dc19693f0d2287cfaa166686173686564f459019a636f6e74696e656e742e696f2077616e747320796f7520746f207369676e20696e207769746820796f757220457465726e6c206163636f756e743a0a616464723171393773616b75376376753235617435666568357a713832326a33617076396b616b74633277366a72703864346837376532386e6e393639773061756576777a3664796c6b66386867386c386b6e77706a36666c70353367306e61716532763265630a0a546f2061757468656e74696361746520706c65617365207369676e2074686973206d6573736167652e0a0a5552493a2068747470733a2f2f636f6e74696e656e742e696f2f0a56657273696f6e3a20310a436861696e2049443a20746573746e65740a4e6f6e63653a2070452f5032547065586b6f2b543239326c43767670513d3d0a4973737565642041743a20323032332d30382d30345431323a33323a33312e3336345a0a45787069726174696f6e2054696d653a20323032332d30382d30355431323a34373a33312e3336345a0a4e6f74204265666f72653a20323032332d30382d30345431323a33323a33312e3336345a58408f8d2527032a2fb733d60484310383f08e8525b30bd42f5bd0e31d8ad6f1ccd2bc4c4ca0198dcf608efe12e5658a7f9502e547497ef60c13ff81e6804aae3505",
      key: "a401010327200621582083320c141cc15bcea0857d2ecea37a63ec4b05ccc0f37c9abe4b367b5da8c0f8"
    }

    await expect(httpsCallable<any, any>(functions, 'ext-tangocrypto-auth-issueToken')(data)).to.eventually.rejectedWith(Error)

  })
});

// const strToHex = (str: string) => {
//   return bufferToStr(new TextEncoder().encode(str));
// }

// const bufferToStr = (buffer: Uint8Array) => {
//   return Array.from(buffer).map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
// }
