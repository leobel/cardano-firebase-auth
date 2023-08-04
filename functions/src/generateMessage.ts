import { buildMessage, getProfileId, uuid } from "./utils";


export interface RequestMessageData {
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

export interface ResponseMessageData {
    id: string;
    message: string;
    profileId: string;
}

export function generateMessage(data: RequestMessageData): Promise<ResponseMessageData> {
    const id = uuid();
    const message = buildMessage(data);
    const profileId = getProfileId(data.address);
    const response = {
        id: id,
        message: message,
        profileId: profileId
    }
    return Promise.resolve(response);
}