import { IonToolbar, IonTextarea, IonButtons, IonButton, IonIcon } from "@ionic/react";
import { imageOutline, paperPlane } from "ionicons/icons";
import { useState } from "react";
import PfpUploader from "./UploadComponent";
import { getAuth } from "firebase/auth";

export const WriteMessage: React.FC<{ placeHolder: string, address: string, sendMessage: (message: { content: string, media?: { src: string, type: string } }) => void }> = ({ address, placeHolder, sendMessage }) => {
    const [content, setNewNote] = useState<string | undefined>(undefined)
    const [image, setImage] = useState<string | undefined>(undefined)
    const [sent, setSent] = useState<boolean>(false);
    const makeComment = () => {
        const message = typeof image === 'undefined' ? { content: content || "" } : { content: content || "", media: { src: image, type: 'image' } }
        sendMessage(message);
        setNewNote(undefined);
        setSent(true);
        setImage(undefined);
    }
    const uid = getAuth().currentUser?.uid;
    return <IonToolbar>
        <IonButtons slot='start'>
            {uid && <PfpUploader done={sent} userId={uid} onUpload={(path) => {
                setImage(path);
            }} />}
        </IonButtons>
        <IonTextarea autoGrow style={{ padding: 5, marginLeft: 10 }} value={content} placeholder={placeHolder} onKeyUp={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                makeComment();
            }
        }} onIonInput={(e) => {
            setNewNote(e.detail.value!)
        }} />
        <IonButtons slot='end'>
            <IonButton onClick={async () => {
                makeComment();
            }}>
                <IonIcon color={typeof content !== 'undefined' && content.length > 0 ? 'primary' : 'light'} icon={paperPlane} />
            </IonButton>
        </IonButtons>
    </IonToolbar>
}