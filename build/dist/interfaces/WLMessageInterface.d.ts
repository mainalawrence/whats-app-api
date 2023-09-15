export default interface WLMessageInterface {
    id: number;
    body: string;
    caption: string;
    messageType: string;
    fileName: string;
    fromMe: string;
    author: string;
    chatName: string;
    pushName: string;
    time: string;
    timeFormatted: string;
    status: number;
    statusText: string;
    deviceSentFrom: string;
    expirationFormatted: string;
    expiration: string;
    remoteJid?: string;
}
