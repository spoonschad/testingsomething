// Create a client using keys returned from getKeys
const ENCODING = "binary";

export const getEnv = (): "dev" | "production" | "local" => {
    return "dev";
};

export const buildLocalStorageKey = (walletAddress: string) =>
    walletAddress ? `xmtp:tribe:dev:${getEnv()}:keys:${walletAddress}` : "";

export const loadKeys = (walletAddress: string): Uint8Array | null => {
    const val = localStorage.getItem(buildLocalStorageKey(walletAddress));
    return val ? Buffer.from(val, ENCODING) : null;
};

export const storeKeys = (walletAddress: string, keys: Uint8Array) => {
    localStorage.setItem(
        buildLocalStorageKey(walletAddress),
        Buffer.from(keys).toString(ENCODING),
    );
};

export const wipeKeys = (walletAddress: string) => {
    // This will clear the conversation cache + the private keys
    localStorage.removeItem(buildLocalStorageKey(walletAddress));
};

// This method receives the message.content as attachment, the xmtp client and the RemoteAttachmentCodec
export const deloadFile = async (attachment: any, client: any, RemoteAttachmentCodec: any) => {
    return RemoteAttachmentCodec.load(attachment, client)
        .then((decryptedAttachment: any) => {
            // Create a blob URL from the decrypted attachment data
            const blob = new Blob([decryptedAttachment.data], {
                type: decryptedAttachment.mimeType,
            });
            return URL.createObjectURL(blob);
        })
        .catch((error: Error) => {
            console.error("Failed to load and decrypt remote attachment:", error);
        });
};
export const loadFile = async (file: any) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
                resolve(new Uint8Array(reader.result));
            } else {
                reject(new Error("Not an ArrayBuffer"));
            }
        };
        reader.readAsArrayBuffer(file);
    });
};