import { Address } from "@emurgo/cardano-serialization-lib-nodejs";
import * as crypto from "crypto";

interface RequestMessageData {
    address: string;
    network: string;
    wallet: string;
    domain: string,
    uri: string,
    statement?: string | undefined;
    expirationTime?: string | undefined;
    notBefore?: string | undefined;
    resources?: string[] | undefined;
    timeout: number;
}

interface ResponseMessageData {
    id: string;
    message: string;
    profileId: string;
}

export function generateMessage(data: RequestMessageData): Promise<ResponseMessageData> {
    const id = uuid();
    const message = buildMessage(data);
    const prodfleId = Address.from_bech32(data.address).to_hex();
    const response = {
        id: id,
        message: message,
        profileId: '0x'+prodfleId
    }
    return Promise.resolve(response);
}

function uuid() {
    return crypto.randomUUID().replace(/-/g, '');
}

function nonce(size = 16): string {
    return crypto.randomBytes(size).toString('base64');
}

function buildMessage(data: RequestMessageData, version = 1): string {
    const { address, domain, network, wallet, statement, uri, expirationTime, notBefore } = data;
    const _nonce = nonce();
    const issuedAt = new Date().toISOString();
    let message = `${domain} wants you to sign in with your ${wallet[0].toUpperCase() + wallet.slice(1)} account:
    ${address}
    
    ${statement}
    
    URI: ${uri}
    Version: ${version}
    Chain ID: ${network}
    Nonce: ${_nonce}
    Issued At: ${issuedAt}`
    if (expirationTime) {
        message += `\nExpiration Time: ${expirationTime}`;
    }
    if (notBefore) {
        message += `\nNot Before: ${notBefore}`
    }

    return message;
}
