import { Timestamp, addDoc, collection, doc, getDoc, getDocs, getFirestore, limit, limitToLast, onSnapshot, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { app } from "../App";
import { useMember } from "../hooks/useMember";
import { nativeAuth } from "../lib/sugar";
import { PostCard } from "./PostCard";
import { IonButton, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonRefresher, IonRefresherContent } from "@ionic/react";

export const PostList: React.FC<{ type: 'top' | 'recent', max: number, from?: string }> = ({ type, max, from }) => {
    const [posts, setPosts] = useState<any[]>([]);
    const [currentMax, setMax] = useState(max)
    const [pullRefresh, setPullRefresh] = useState<number>(0)
    const auth = nativeAuth();
    const me = useMember(x => x.getCurrentUser())
    useEffect(() => {
        if (!auth.currentUser) {
            return;
        }
        const db = getFirestore(app);
        const postsRef = query(collection(db, 'post'), orderBy(type == 'top' ? 'score' : 'sent', type == 'top' ? 'desc' : 'desc'), limit(currentMax));
        const authorPostsRef = query(collection(db, 'post'), orderBy('author'), where('author', from ? '==' : '!=', from ? from : null), orderBy(type == 'top' ? 'score' : 'sent', 'desc'), limit(currentMax));
        getDocs(from ? authorPostsRef : postsRef).then(snapshot => {
            setPosts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, sent: doc.data().sent == null ? new Timestamp(new Date().getSeconds(), 0) : doc.data().sent })));
        });
    }, [type, from, me, auth.currentUser, pullRefresh, currentMax]);

    function handleVote(postId: string, uid: string, upvote: boolean) {
        const vote = upvote ? 1 : -1;

        let diff = 0;
        if (upvote && voted[postId] == -1) {
            diff = 2;
        }
        if (!upvote && voted[postId] == 1) {
            diff = -2;
        }
        if (voted[postId] === null || typeof voted[postId] === 'undefined') {
            diff = vote;
        }
        const index = posts.findIndex(x => x.id === postId);
        let y = [...posts];
        y[index].score += diff;
        setPosts(y);
        const db = getFirestore(app);
        const postRef = doc(db, 'post', postId);
        const voteRef = doc(postRef, 'votes', uid);
        setVoteCache((x) => ({ ...x, [postId]: vote }))
        setDoc(voteRef, ({ vote }))
    }


    const makeComment = useCallback(async (postId: string, comment: { content: string, media?: { src: string, type: string } }) => {
        const author = me!.address;
        const newMessage = ({ ...comment, author, sent: serverTimestamp(), type: 'string', score: 0 });
        const db = getFirestore(app);
        const commentCol = collection(db, "post", postId, "comments");

        try {
            await addDoc(commentCol, newMessage);
        } catch (error) {
            console.error("Error sending message: ", error);
        }
    }, [me])


    const [voted, setVoteCache] = useState<Record<string, 1 | -1 | null>>({});
    useEffect(() => {
        if (me === null) {
            return;
        }
        posts.forEach(({ id }) => {
            if (typeof voted[id] === 'undefined') {
                setVoteCache(x => ({ ...x, [id]: null }))
                const db = getFirestore(app);
                const postRef = doc(db, 'post', id);
                const voteRef = doc(postRef, 'votes', auth.currentUser!.uid);
                getDoc(voteRef).then((doc) => {
                    const data = doc.data() || { vote: null }
                    setVoteCache(x => ({ ...x, [id]: data.vote }))
                })
            }
        })
    }, [posts])
    const infiniteRef = useRef<HTMLIonInfiniteScrollElement>(null)
    return <>
        <IonRefresher style={{ "--background": 'blue' }} slot="fixed" onIonRefresh={(event) => {
            setTimeout(() => {
                event.detail.complete();
            }, 1000)
        }}>
            <IonRefresherContent refreshingSpinner={'circular'} />
        </IonRefresher>

        {useMemo(() => posts.map((post) => (
            <PostCard hideComments key={post.id} {...post} handleVote={handleVote} makeComment={makeComment} voted={voted[post.id]} uid={auth.currentUser?.uid} />
        )), [type, posts, voted])}
        <IonInfiniteScroll ref={infiniteRef} onIonInfinite={(event) => {
            setMax(currentMax + 10);
            setTimeout(() => {
                infiniteRef.current?.complete()
            }, 1000)
        }}>

            <IonInfiniteScrollContent loadingSpinner={undefined}>
            </IonInfiniteScrollContent>
        </IonInfiniteScroll>
    </>
}