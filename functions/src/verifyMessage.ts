
interface VerifyMessageData {
    message:  string;
    signature: string;
}

interface ResponseVerifyData {
    profileId: string;
    address: string;
}

export function verifyMessage(data: VerifyMessageData): Promise<ResponseVerifyData> {
    const response = {
        address: 'addr1...',
        profileId: '1'
    }
    return Promise.resolve(response);
}