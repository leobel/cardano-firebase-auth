import { Address, BaseAddress, Ed25519KeyHash, Ed25519Signature, PublicKey } from "@emurgo/cardano-serialization-lib-nodejs";
import * as crypto from "crypto";
import { RequestMessageData } from "../generateMessage";
import { COSESign1, Label, Int as MInt, BigNum as MBigNum, COSEKey } from "@emurgo/cardano-message-signing-nodejs";

export function uuid() {
    return crypto.randomUUID().replace(/-/g, '');
}

export function nonce(size = 16): string {
    return crypto.randomBytes(size).toString('base64');
}

export function getProfileId(address: string): string {
    const hash = getAddressPaymentKeyHash(address)?.to_hex();
    return '0x'+hash;
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
Issued At: ${issuedAt}`;
    if (expirationTime) {
        message += `\nExpiration Time: ${expirationTime}`;
    }
    if (notBefore) {
        message += `\nNot Before: ${notBefore}`
    }

    return message;
}

export interface InfoMessageData {
    domain: string;
    address: string;
    network: string;
    statement: string;
    uri: string;
    expirationTime?: string;
    notBefore?: string;
}

export function getMessageInfo(message: string): InfoMessageData {
    const components = message.split('\n');
    const domain = components[0].split('wants you to sign in with your')[0].trim();
    const address = components[1];
    const statement = components[3].trim();
    const uri = components[5].replace(/URI:/, '').trim();
    const network = components[7].replace(/Chain ID:/, '').trim();
    const expirationTime = components[10]?.replace(/Expiration Time:/, '').trim();
    const notBefore = components[11]?.replace(/Not Before:/, '').trim();

    return {
        domain,
        address,
        network,
        statement,
        uri,
        expirationTime,
        notBefore
    }
}

export interface SignatureInfo {
    pubKey: PublicKey;
    address: Address;
    signature: Ed25519Signature;
    data: Uint8Array;
    message: string;
}

export function getSignatureInfo(signature: string, key: string): SignatureInfo {
    // signature info
    const signedMessage = COSESign1.from_bytes(Buffer.from(signature, "hex"));
    const edSignature = Ed25519Signature.from_bytes(signedMessage.signature());
    const data = signedMessage.signed_data().to_bytes();
    const message = Buffer.from(signedMessage.payload()!).toString('utf8');
    const address = Address.from_bytes(signedMessage.headers().protected().deserialized_headers().header(Label.new_text("address"))!.as_bytes()!);

    // key info
    const coseKey = COSEKey.from_bytes(Buffer.from(key, "hex"));
    const pubKey = PublicKey.from_bytes(coseKey.header(Label.new_int(MInt.new_negative(MBigNum.from_str("2"))))!.as_bytes()!);

    // const stakeKeyHash = Seed.getAddressStakeKeyHash(addr);
    return {
        pubKey,
        address,
        signature: edSignature,
        data,
        message
    }
}

export function validateMessageSignature(address: string, message: string, signatureInfo: SignatureInfo): boolean {
    const { pubKey, signature, data } = signatureInfo;
    return pubKey.verify(data, signature) 
    && message == signatureInfo.message
    && pubKey.hash().to_hex() == getAddressPaymentKeyHash(address)?.to_hex()
    ;
}

function getAddressPaymentKeyHash(address: string): Ed25519KeyHash | undefined {
    return BaseAddress.from_address(
        Address.from_bech32(address)
    )
        ?.payment_cred()
        .to_keyhash();
} 