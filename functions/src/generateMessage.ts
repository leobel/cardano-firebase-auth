interface RequestMessageData {
    address: string;
    network: string;
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
    const response = {
        id: '1',
        message: 'sign this message',
        profileId: '1'
    }
    return Promise.resolve(response);
}