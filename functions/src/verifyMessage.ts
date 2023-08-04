import { getMessageInfo, getProfileId, getSignatureInfo, validateMessageSignature } from "./utils";

interface VerifyMessageData {
    message:  string;
    signature: string;
    key: string;
}

interface ResponseVerifyData {
    profileId: string;
    address: string;
}

export function verifyMessage(data: VerifyMessageData): Promise<ResponseVerifyData> {
    const { message, signature, key } = data;
    const { address, expirationTime, notBefore } = getMessageInfo(message);
    const now = Date.now();
    if (notBefore && now < new Date(notBefore).getTime()) {
        throw new Error(`Cannot sign message before: ${notBefore}`);
    }
    if (expirationTime && now > new Date(expirationTime).getTime()) {
        throw new Error(`Cannot sign message after: ${expirationTime}`);
    }
    const signatureInfo = getSignatureInfo(signature, key);
    const valid = validateMessageSignature(address, message, signatureInfo);
    if (!valid) {
        throw new Error(`Invalid signature`);
    }
    const profileId = getProfileId(address);
    const response = {
        address: address,
        profileId: profileId
    }
    return Promise.resolve(response);
}