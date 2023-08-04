import { Address, BaseAddress } from "@emurgo/cardano-serialization-lib-nodejs";
import * as crypto from "crypto";
import { RequestMessageData } from "../generateMessage";

export function uuid() {
    return crypto.randomUUID().replace(/-/g, '');
}

export function nonce(size = 16): string {
    return crypto.randomBytes(size).toString('base64');
}

export function getProfileId(address: string): string | undefined {
    const hash = BaseAddress.from_address(
        Address.from_bech32(address)
    )
    ?.payment_cred()
    .to_keyhash()
    ?.to_hex();
    return hash;
}

export function buildMessage(data: RequestMessageData, version = 1): string {
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
