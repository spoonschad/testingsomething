import { Timestamp } from "firebase/firestore"

export interface Message {
    content: string
    author: string
    channel: string
    sent: Timestamp | null
    reply?: string
    id: string
}
