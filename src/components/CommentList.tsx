import { IonButton, IonButtons, IonImg, IonItem, IonList, IonText } from "@ionic/react";
import { getAuth } from "firebase/auth";
import { collection, doc, getFirestore, limit, limitToLast, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { app } from "../App";
import { uniqId } from "../lib/sugar";
import { Message } from "../models/Message";
import { MemberAlias, MemberPfp } from "./MemberBadge";
import Voter from "./Voter";
type CommentListProps = {
    postId: string;
    uid: string
    amount: number | undefined
    total: number
};


export const CommentList: React.FC<CommentListProps> = ({ postId, amount, uid }) => {
    const [comments, setComments] = useState<Message[]>([]);

    const modMessage = (channel: any, message: Message) => {
        setComments(x => {
            const newCommentId = x.findIndex(x => x.id === message.id);
            x[newCommentId] = message;
            return x;
        })
        // Function implementation for modifying the message
    };

    useEffect(() => {
        if (!postId) {
            return;
        }

        (async () => {
            const db = getFirestore(app);
            const messagesCol = query(collection(db, "post", postId, "comments"));

            onSnapshot(
                query(
                    messagesCol,
                    orderBy("score", "desc"),
                    orderBy("sent", "asc")

                ),
                (channelDocs) => {
                    const changes = channelDocs.docChanges();
                    changes.forEach((change) => {
                        if (change.type === 'added') {
                            const newMessage = { ...change.doc.data() as Message, id: change.doc.id };
                            setComments(prevComments => uniqId([...prevComments, newMessage]) as any);
                        } else if (change.type === 'modified') {
                            const newMessageTimestamped = change.doc.data() as Message;
                            modMessage(postId, newMessageTimestamped); // Assuming channel refers to postId
                        }
                    });
                }
            );
        })();
    }, [postId]);

    return (
        <IonList style={{ marginTop: -40 }}>
            <IonItem lines='none' />
            {comments.map((comment, i) => (
                < div key={i}>
                    <IonItem color={'paper'} >
                        <IonButtons style={{ paddingRight: 0, marginRight: 3, marginBottom: -2 }} slot='start'>
                            <MemberPfp size='smol' address={comment.author} />
                        </IonButtons>
                        {comment.content && comment.content?.length < 300 && <IonText color='medium' style={{ fontSize: 8, position: 'absolute', left: 0, right: 0, width: 1000, top: 5 }}>
                            <MemberAlias color='medium' address={comment.author} />
                        </IonText>}
                        <IonText style={{ whitespace: 'pre-wrap', marginTop: 5 }} color={'medium'}>
                            {comment.content}

                        </IonText>
                        <IonButtons slot='end'>
                            <Voter score={comment.score || 0} commentId={comment.id} postId={postId} uid={uid} handleVote={function (upvote: boolean): void {
                                const db = getFirestore(app);
                                const uid = getAuth().currentUser!.uid;
                                const postRef = doc(db, 'post', postId);
                                const commentRef = doc(postRef, 'comments', comment.id);
                                const voteRef = doc(commentRef, 'votes', uid);
                                const vote = upvote ? 1 : -1;
                                setDoc(voteRef, ({ vote }))
                            }} />

                        </IonButtons>
                    </IonItem>
                    {comment.media &&
                        <IonItem lines="none" color='paper'>
                            <img style={{ borderRadius: 20 }} src={comment.media.src} />
                        </IonItem>
                    }
                </div>))
            }
        </IonList >
    );
};
