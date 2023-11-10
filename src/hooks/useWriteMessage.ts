import { create } from 'zustand'
import { Trade } from '../models/Trade'
import { httpsCallable, getFunctions } from 'firebase/functions'
import { app } from '../App'
import { PushNotifications } from '@capacitor/push-notifications'
import { Message } from '../models/Message'
import { serverTimestamp } from 'firebase/firestore'

export type MessageFunction = (message: Message) => void;


export type WriteMessageHook = {
    isOpen: boolean;
    message?: Message;
    placeholder?: string
    send?: MessageFunction
    author: string
    open: (callback: MessageFunction, author: string, placeHolder: string) => void
    setMedia: (media: { src: string, type: string }) => void
    removeMedia: () => void
    setContent: (content: string) => void
    dismiss: (shouldSend: boolean) => void
    setIsOpen: (open: boolean) => void
}

export const useWriteMessage = create<WriteMessageHook>((set, store) => ({
    isOpen: false,
    author: '',
    setIsOpen: (isOpen) => {
        set({ isOpen })
    },
    dismiss: (shouldSend) => {
        const message = store().message;
        const send = store().send;
        if (shouldSend && message && typeof send !== 'undefined') {
            send(message)
        }
        set({ isOpen: false, message: { author: "", id: "", sent: null } })
    },
    open: (send, author, placeholder) => {
        set({ send, author, isOpen: true, placeholder })
    },
    setMedia(media) {
        set({ message: { author: store().author, media: media, ...store().message, content: store().message?.content, sent: null, id: '' } });
    },
    removeMedia: () => {
        const message = store().message;
        delete message?.media
        set({ message });
    },
    setContent(content: string) {
        set({ message: { author: store().author, ...store().message, content, sent: null, id: '' } });
    },

}))
