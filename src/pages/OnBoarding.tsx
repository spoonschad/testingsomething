import { Browser } from '@capacitor/browser'
import { IonBadge, IonButton, IonContent, IonIcon, IonLabel, IonLoading, IonSpinner, IonText, IonTitle, isPlatform } from "@ionic/react"
import { usePrivy } from "@privy-io/react-auth"
import axios from "axios"
import { signInWithCustomToken } from "firebase/auth"
import { doc, getDoc, getFirestore } from "firebase/firestore"
import { getFunctions, httpsCallable } from "firebase/functions"
import { checkmark } from "ionicons/icons"
import { useEffect, useMemo, useState } from "react"
import { app } from "../App"
import { nativeAuth } from "../lib/sugar"
import { useMember } from '../hooks/useMember'
import { useLocation, useHistory } from 'react-router'
export const OnBoarding: React.FC<{ me: any, dismiss: () => void }> = ({ me, dismiss }) => {
    const auth = nativeAuth()
    const { search } = useLocation();

    const searchParams = useMemo(() => new URLSearchParams(search), [search]);
    const [error, setError] = useState<string | undefined>();
    const { user, linkTwitter, login, getAccessToken, ready } = usePrivy()
    const walletAddress = user?.wallet?.address;
    const { setCurrentUser } = useMember();
    const [refresh, setRefresh] = useState<number>(0)
    const [tribeLoading, setLoading] = useState<boolean>(false)
    useEffect(() => {
        auth.onAuthStateChanged(async (currentUser) => {
            setRefresh(x => x + 1);
            const database = getFirestore(app);
            const privyUid = currentUser?.uid as any;
            if (typeof privyUid === 'undefined' || privyUid === null) {
                return;
            }
            const docRef = doc(database, 'member', privyUid);
            getDoc(docRef).then((snap) => {
                if (!snap.exists()) {
                    const joinTribe = httpsCallable(getFunctions(app), 'syncPrivy');
                    const referrer = searchParams.get("ref") || "lil_esper"

                    joinTribe({ referrer }).then((res) => {
                        getDoc(docRef).then((snap) => {
                            setCurrentUser(snap.data() as any);
                        })
                    }).catch((e) => {
                        console.log(e);
                    })
                } else {
                    setCurrentUser(snap.data() as any);
                }
            }).catch(() => {

            });
        }, (e) => {
            setError(e.message);
        })
    }, [])
    useEffect(() => {
        if (user === null) {
            return;
        }
        auth.authStateReady().then((state) => {
            getAccessToken().then((privyToken) => {
                axios.post('https://us-central1-remilio-tribe.cloudfunctions.net/privyAuth', { token: privyToken }, { headers: { Authorization: 'Bearer ' + privyToken } }).then((res) => {
                    signInWithCustomToken(auth, res.data.authToken)
                });
            });
        })
    }, [user, ready, auth])

    const navigate = useHistory();
    const path = location.pathname
    return (
        <IonContent>
            {useMemo(() => (
                <IonTitle className="ion-text-center">
                    {ready ? (
                        <>
                            {user === null ? (
                                <IonButton color='tribe' onClick={() => {
                                    if (isPlatform("capacitor")) {
                                        Browser.open({ url: 'https://tribe.computer/#/auth', presentationStyle: 'fullscreen', windowName: 'auth' });
                                    } else {
                                        linkTwitter();
                                    }
                                }}>
                                    Connect to {isPlatform("capacitor") ? "tribe" : "privy"}
                                </IonButton>
                            ) : (
                                <>
                                    <IonButton onClick={dismiss} fill='clear'></IonButton>
                                    <br />
                                </>
                            )}
                            <br />
                            <IonLabel color='dark'>
                                {!ready && <></>}
                                {me === null && ready && user !== null && (
                                    <>
                                        <br />
                                        <IonSpinner name="crescent" />
                                        <br />
                                    </>
                                )}
                            </IonLabel>
                            <br />
                            {error && <IonBadge color='danger'>{error}</IonBadge>}
                        </>
                    ) : (
                        <span aria-disabled="true"></span>
                    )}
                </IonTitle>
            ), [refresh, me, walletAddress, user, ready])}
            <IonLoading isOpen={tribeLoading} />
        </IonContent>
    );
}