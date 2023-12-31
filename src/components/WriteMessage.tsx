import { IonToolbar, IonTextarea, IonButtons, IonButton, IonIcon, IonImg, IonAvatar, IonBadge, IonChip, IonText } from "@ionic/react";
import { close, imageOutline, paperPlane, text } from "ionicons/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import PfpUploader from "./UploadComponent";
import { getAuth } from "firebase/auth";
import { MemberCardHeader, MemberPfp, TwitterNameLink } from "./MemberBadge"
import { useMember } from "../hooks/useMember"
import { useWriteMessage } from "../hooks/useWriteMessage";
export function removeUndefinedProperties(obj: any) {
  Object.keys(obj).forEach(key => {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  });
  return obj;
}
export const WriteMessage: React.FC<{ placeHolder: string, address: string, sendMessage: (message: { content: string, media?: { src: string, type: string } }) => void, isModal?: boolean, shouldFocus?: boolean }> = ({ address, isModal, placeHolder, sendMessage, shouldFocus }) => {
  const [sent, setSent] = useState<boolean>(false);
  const [isTextAreaFocused, setIsTextAreaFocused] = useState(false);
  const me = useMember(x => x.getCurrentUser());
  const darkmode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const bgColor = darkmode ? undefined : 'white';
  const [showMediaButton, setShowMediaButton] = useState(false);
  const author = me!.address;

  const handleBlur = () => {
    setIsTextAreaFocused(false);
    // Optionally, add logic to determine when to hide the media button
  };
  const { isOpen, removeMedia, message, setContent, setMedia, clearMessage} = useWriteMessage();
  const makeComment = useCallback(() => {
    
    const content = textAreaRef.current?.value!;
    sendMessage(removeUndefinedProperties({ ...message, content }));
    setMedia(undefined as any);
    setContent(undefined as any)
    setSent(true);
    clearMessage();
  }, [message])
  const uid = getAuth().currentUser?.uid;
  const textAreaRef = useRef<HTMLIonTextareaElement>(null);

  useEffect(() => {
    setTimeout(() => {
      (document.querySelector("#modal-write-message textarea") as any)?.focus();
    }, 0)
    setTimeout(() => {
      (document.querySelector("#modal-write-message textarea") as any)?.focus();
    }, 10)
    setTimeout(() => {
      (document.querySelector("#modal-write-message textarea") as any)?.focus();
    }, 100)
  }, [isOpen])

  useEffect(() => {
    if (shouldFocus) {
      textAreaRef.current!.querySelector('textarea')!.focus();
      setTimeout(() => {
        textAreaRef.current!.querySelector('textarea')!.focus();
      }, 0)
      setTimeout(() => {
        textAreaRef.current!.querySelector('textarea')!.focus();
      }, 100)
      setTimeout(() => {
        textAreaRef.current!.querySelector('textarea')!.focus();
      }, 200)

    }
  }, [shouldFocus])

  useEffect(() => {
    if (shouldFocus) {
      // Focus on the hidden input first
      const hiddenInput = document.getElementById('hiddenInput');
      hiddenInput?.focus();
  
      // Then, shift focus to the textarea
      setTimeout(() => {
        textAreaRef.current?.setFocus();
      }, 100); // Adjust timeout as needed
    }
  }, [shouldFocus]);


  const strippedLength = message?.content ? message.content.replaceAll(' ', '').replaceAll('\n', '').length : 0

  return (
    <IonToolbar autoFocus={shouldFocus} color={bgColor} style={{ padding: 4, border: 0 }} >
      <div style={{display: 'flex', width: '100%'}}>
      <div style={{backgroundColor: 'var(--ion-color-light)', marginLeft: 0, marginTop: 4,paddingRight: 0, borderRadius: '12px', maxHeight: 52, width: '100%',display: 'flex'}}> 
      {showMediaButton && (
      <IonButtons slot='start'>
        {uid && <PfpUploader done={sent} userId={uid} onUpload={(path) => {
        }} />}

        {message?.media &&
          <IonChip onMouseDown={() => { removeMedia() }}>
            <IonAvatar>

              {message?.media?.type.includes('image') ? <IonImg src={message.media.src} /> :
                <video webkit-playsinline playsInline preload="metadata" controls style={{ borderRadius: 20, margin: 'auto', width: "100%", marginTop: 5, marginLeft: 4 }} src={message.media.src + '#t=0.5'} />}
            </IonAvatar>
            <IonText color='danger'>
              <IonIcon icon={close} />
            </IonText>
          </IonChip>}
      </IonButtons>
      )}
      <label htmlFor="hiddenInput" style={{ display: "none" }}>Hidden Label for Focus</label>
      <input type="text" id="hiddenInput" style={{ display: "none" }} />

      <IonTextarea
        autoFocus={shouldFocus}
        id={isModal ? 'modal-write-message' : undefined}
        ref={textAreaRef}
        autoGrow
        onBlur={handleBlur}
        className="regular"
        style={{ flex: 1, paddingTop: 0, paddingLeft: 16, marginTop: -4, minHeight: 50 }} /* flex: 1 allows the textarea to grow and fill available space */
        value={message?.content}
        placeholder={placeHolder}
        onKeyUp={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && strippedLength > 0) {
            makeComment();
          }
        }}
        onIonInput={(e) => {
          setContent(e.detail.value!)
        }}
      />
      <IonButtons slot='end'  style={{ maxHeight: 40, marginLeft: 8, marginTop: 6, marginRight: 6, backgroundColor: 'var(--ion-color-tribe)', borderRadius: 8, padding: 8, paddingBottom: 10}}>
        <IonButton 
            disabled={strippedLength < 1} 
            onClick={async () => {
                makeComment();
            }} 
            style={{display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <IonText color={(typeof message?.content !== 'undefined' && message.content.length > 0) && message !== null ? 'primary' : 'dark'} className="bold">
                Send
            </IonText>
        </IonButton>
      </IonButtons>
      </div>

      </div>
    </IonToolbar>
  );
}