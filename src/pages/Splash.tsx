import React, { useState, useEffect, useCallback, useMemo } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import {
    IonPage, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardContent,
    IonText, IonToolbar, IonButton, IonBadge, IonIcon, IonItem, IonButtons, IonChip, IonRouterLink, IonTabBar, IonTabButton, IonTabs, IonFooter, IonSegment, IonSegmentButton, IonLabel, IonItemDivider, IonSpinner
} from '@ionic/react';
import { albums, albumsOutline, call, chevronDown, chevronUp, heartSharp, person, pulse, pulseOutline, settings, wallet } from 'ionicons/icons';
import { MemberCardHeader, MemberChip, MemberPfp, MemberToolbar } from '../components/MemberBadge';
import { TribeContent } from '../components/TribeContent';
import { TribeHeader } from '../components/TribeHeader';
import { WriteMessage } from '../components/WriteMessage';
import { collection, onSnapshot, doc, updateDoc, addDoc, getFirestore, serverTimestamp, limit, orderBy, query, Timestamp, setDoc, runTransaction, getDoc, increment, where, sum } from 'firebase/firestore';
import { app } from '../App';
import { useMember } from '../hooks/useMember';
import { getAuth } from 'firebase/auth';
import { getAggregateFromServer } from 'firebase/firestore'
import { uniq, uniqId } from '../lib/sugar';
import { TribeFooter } from '../components/TribeFooter';
import { timeAgo } from '../components/TradeItem';
import { CommentList } from '../components/CommentList';



const Splash: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const auth = getAuth();
    const me = useMember(x => x.getCurrentUser(auth.currentUser?.uid));
    useEffect(() => {
        const db = getFirestore(app);

        const postsRef = collection(db, 'post');
        const unsubscribe = onSnapshot(postsRef, snapshot => {
            setPosts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, sent: doc.data().sent == null ? new Timestamp(new Date().getSeconds(), 0) : doc.data().sent })));
        });
        return unsubscribe;
    }, []);
    function handleVote(postId: string, uid: string, upvote: boolean) {
        const db = getFirestore(app);
        const postRef = doc(db, 'post', postId);
        const voteRef = doc(postRef, 'votes', uid);
        console.log(upvote, postId);
        const vote = upvote ? 1 : -1;
        if (voted[postId] != vote) {
            setVoteScore(x => ({ ...x, [postId]: (x[postId] || 0) + vote }));
        }
        setVoteCache((x) => ({ ...x, [postId]: vote }))
        setDoc(voteRef, ({ vote }))
    }


    const addPost = async (content: string) => {
        const db = getFirestore(app);

        await addDoc(collection(db, 'post'), {
            author: me!.address, // Replace with actual user's address or ID
            content,
            sent: serverTimestamp(),
        });
        setPostType('recent');
    };

    const makeComment = useCallback(async (postId: string, content: string) => {
        const author = me!.address;
        const newMessage = ({ content, author, sent: serverTimestamp(), type: 'string' });
        const db = getFirestore(app);
        const commentCol = collection(db, "post", postId, "comments");

        try {
            await addDoc(commentCol, newMessage);
        } catch (error) {
            console.error("Error sending message: ", error);
        }
    }, [me])
    const [postType, setPostType] = useState('top')

    const getSort = useCallback((a: any, b: any) => {
        // if (postType === 'top') {
        //     return voteScore(b.votes) - voteScore(a.votes);
        // } else if (postType == 'recent') {
        return b.sent.seconds - a.sent.seconds;
        // }
    }, [postType])


    const [voted, setVoteCache] = useState<Record<string, 1 | -1 | null>>({});
    const [voteScore, setVoteScore] = useState<Record<string, number>>({});
    useEffect(() => {
        if (typeof auth.currentUser?.uid === 'undefined') {
            return;
        }
        posts.forEach(({ id }) => {
            if (typeof voted[id] === 'undefined') {
                setVoteCache(x => ({ ...x, [id]: null }))
                const db = getFirestore(app);
                const postRef = doc(db, 'post', id);
                const voteRef = doc(postRef, 'votes', auth.currentUser!.uid);
                getDoc(voteRef).then((doc) => {
                    console.log("GOT DOC", doc.data());
                    const data = doc.data() || { vote: null }
                    console.log("GOT DOC", data);
                    setVoteCache(x => ({ ...x, [id]: data.vote }))
                })
            }
        })
    }, [posts])
    useEffect(() => {
        if (typeof auth.currentUser?.uid === 'undefined') {
            return;
        }
        posts.forEach(async ({ id }) => {
            if (typeof voted[id] === 'undefined') {
                setVoteScore(x => ({ ...x, [id]: null }))
                const db = getFirestore(app);
                const postRef = doc(db, 'post', id);
                const snapshot = await getAggregateFromServer(collection(postRef, 'votes'), {
                    voteScore: sum('vote')
                });
                console.log(snapshot.data(), "DATA")
                setVoteScore(x => ({ ...x, [id]: snapshot.data().voteScore }));
            }
        })
    }, [posts])
    console.log(voted)
    return (
        <IonPage id='main-content'>
            <TribeHeader color='success' title={'TRIBE'} />
            <TribeContent fullscreen>
                <IonGrid>
                    <IonRow>
                        <IonCol sizeLg='6' offsetLg='3' sizeMd='8' offsetMd='2' offsetXs='0' sizeXs='12'>
                            <IonSegment value={postType} onIonChange={(e) => {
                                setPostType(e.detail.value?.toString() || "top")
                            }}>
                                <IonSegmentButton value={'top'}>
                                    TOP
                                </IonSegmentButton>
                                <IonSegmentButton value={'recent'}>
                                    RECENT
                                </IonSegmentButton>
                            </IonSegment>
                            <IonCard>
                                <WriteMessage
                                    placeHolder='Whats happnin'
                                    address={''}
                                    sendMessage={addPost}
                                />
                            </IonCard>
                            {useMemo(() => posts.sort(getSort).map(({ id, author, content, sent }: any) => (
                                <IonCard key={id}>

                                    <IonCardHeader color='light' >
                                        {/* <IonBadge color='light' style={{ position: 'absolute', left: '45%', top: 0 }}>
                                            <IonText color='tertiary'>
                                                {timeAgo(new Date(sent.seconds * 1000))}
                                            </IonText>
                                        </IonBadge> */}
                                        <MemberCardHeader address={author} />

                                        <IonButton fill='clear' onClick={() => handleVote(id, auth.currentUser!.uid, true)} style={{ position: 'absolute', top: -12, right: 0 }}>
                                            <IonBadge color={typeof voted[id] !== 'undefined' && voted[id] !== null && voted[id] === 1 ? 'success' : 'medium'}>
                                                <IonIcon icon={chevronUp} />

                                            </IonBadge>
                                        </IonButton>

                                        <IonLabel style={{ position: 'absolute', bottom: '40%', right: 31 }}>
                                            <IonText className='ion-text-center'>{voteScore[id] === null ? <></> : voteScore[id]}</IonText>
                                        </IonLabel>
                                        <IonButton fill='clear' onClick={() => handleVote(id, auth.currentUser!.uid, false)} style={{ position: 'absolute', bottom: -12, right: 0 }}>
                                            <IonBadge color={typeof voted[id] !== 'undefined' && voted[id] !== null && voted[id] === -1 ? 'danger' : 'medium'}>
                                                <IonIcon icon={chevronDown} />
                                            </IonBadge>
                                        </IonButton>

                                    </IonCardHeader>
                                    <IonCardContent style={{ padding: 20 }} >
                                        <IonText >
                                            {content}
                                        </IonText>

                                    </IonCardContent>

                                    <CommentList postId={id} />
                                    <WriteMessage
                                        placeHolder='write a comment'
                                        address={''}
                                        sendMessage={(content: any) => { makeComment(id, content) }} // Modify this if you want to handle comments
                                    />
                                </IonCard>
                            )), [postType, posts, voted, voteScore])}
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </TribeContent>
            <TribeFooter page='posts' />
        </IonPage >
    );
};


type Message = {
    content: string;
    author: string;
    sent: Date;
    //... Add other necessary fields
};


export default Splash;