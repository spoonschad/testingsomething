import { IonBadge, IonList, IonButtons, IonAvatar, IonImg, IonSearchbar, IonCard, IonCol, IonGrid, IonInput, IonItem, IonRow, IonSpinner, IonTitle, useIonViewWillEnter, useIonViewDidEnter, IonButton, IonLoading, IonHeader, IonToolbar } from '@ionic/react';
import { Timestamp, collection, doc, getDocs, getFirestore, limit, or, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { app } from '../App';
import { MemberPfp, MemberAlias, MemberPfpImg } from '../components/MemberBadge';
import { timeAgo } from '../components/TradeItem';
import { TribeContent } from '../components/TribeContent';
import { TribeFooter } from '../components/TribeFooter';
import { TribeHeader } from '../components/TribeHeader';
import { useMember, Member } from '../hooks/useMember';
import useTabs from '../hooks/useTabVisibility';
import { formatEth, nativeAuth, showTabs, uniqByProp } from '../lib/sugar';
import { TribePage } from './TribePage';
import useERCBalance from '../hooks/useERCBalance';
import { usePrivy } from '@privy-io/react-auth';
import algoliasearch from 'algoliasearch';
import { Message } from '../models/Message';
import { getFunctions, httpsCallable } from 'firebase/functions';


const searchClient = algoliasearch('LR3IQNACLB', 'd486674e7123556e91d7557fa704eb20');



const Chat: React.FC = () => {
    const auth = nativeAuth()
    const uid = auth.currentUser ? auth.currentUser.uid : undefined;
    const me = useMember(x => x.getCurrentUser());

    const [members, setMembers] = useState<[{ address: string }]>()
    useEffect(() => {
        const address = me?.address;
        if (typeof address === 'undefined') {
            return;
        }
        const channelsRef = collection(getFirestore(app), "channel");
        const walletField = me?.injectedWallet;
        const conditions = [
            where(`holders.${address}`, '>', 0)
        ];
        // If walletField is defined, add an additional condition
        // if (walletField) {
        //     const q2 = query(channelsRef, where(walletField, '!=', null));
        //     getDocs(q2)
        //         .then(querySnapshot => {
        //             if (!querySnapshot.empty) {
        //                 const result = querySnapshot.docs.map(doc => ({ ...doc.data(), address: doc.id }));
        //                 setMembers(x => uniqByProp([...x ? x : [], ...result] as any, 'address') as any);
        //             }
        //         })

        // }

        const q = query(channelsRef, ...conditions);
        getDocs(q)
            .then(querySnapshot => {
                if (!querySnapshot.empty) {
                    const result = querySnapshot.docs.map(doc => ({ ...doc.data(), address: doc.id }));
                    setMembers(x => uniqByProp([...x ? x : [], ...result] as any, 'address') as any);
                } else {
                    const joinTribe = httpsCallable(getFunctions(app), 'joinBeta');
                    setJoining(true);
                    joinTribe().then(() => {
                        setJoining(false);
                        setMembers([{ "address": "0x0000000000000000000000000000000000000000" }, ...members || []] as any)
                    })
                }
            })
            .catch(error => {
            });

    }, [me])
    const { user } = usePrivy();
    const [joining, setJoining] = useState<boolean>(false);
    return (
        <TribePage page='chat'>
            <IonHeader>
                <IonToolbar color={'transparent'} >
                    <IonTitle className='bold' color={'dark'} style={{ paddingTop: 0, fontSize: '1.25rem' }}>
                        Chats
                    </IonTitle>
                </IonToolbar>
            </IonHeader>
            <TribeContent >
                <IonGrid style={{ padding: 0, marginTop: '1rem' }}>
                    <IonRow>
                        <IonLoading isOpen={joining} />
                        <IonCol sizeMd='6' offsetMd='3' sizeXs='12' style={{ padding: 0 }}>
                            <IonCard style={{ margin: 0, borderRadius: 0 }}>
                                {useMemo(() => members && members !== null ? members.map(({ address, }, i) =>
                                    <IonItem routerDirection='forward' lines='full' style={{ '--border-color': 'var(--ion-color-light)' }} routerLink={'/channel/' + address} key={address} >
                                        <LastMessage address={address} />
                                    </IonItem>) : <><br /><br /><br /><IonTitle>
                                        <IonSpinner name='crescent' /></IonTitle></>, [members])}
                            </IonCard>
                        </IonCol>
                    </IonRow>
                    {/* <IonRow>
                        <IonInput value={'0x6982508145454Ce325dDbE47a25d4ec3d2311933'} onIonChange={(e) => {
                            setChannelAddress(e.detail?.value as any)
                        }} placeholder='address' />
                    </IonRow> */}
                </IonGrid>
            </TribeContent>
            <TribeFooter page='chat' />
        </TribePage >
    );
};
const LastMessage: React.FC<{ address: string }> = ({ address }) => {
    const [msg, setMsg] = useState<Message | null>(null);
    useEffect(() => {
        const channelsRef = doc(getFirestore(app), "channel", address);
        const q = query(collection(channelsRef, 'messages'), orderBy('sent', 'desc'), limit(1));
        getDocs(q)
            .then(querySnapshot => {
                const data = querySnapshot.docs[0].data();
                data && setMsg(data as any);
            });
    }, [address]);

    return (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '6px 0' }}>
            <IonButtons slot='start'>
                <MemberPfpImg address={address} size='double-smol' />
            </IonButtons>
            <div style={{ flex: 1, minWidth: 0, paddingLeft: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ marginBottom: '4px' }}>
                    <MemberAlias clickable={false} address={address} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '.9rem', opacity: 0.5, marginRight: '-4px' }}>
                        <MemberAlias clickable={false} address={msg?.author as any} />
                    </span>
                    <span style={{ fontSize: '.9rem', opacity: 0.5 }}>
                        : {msg?.content?.slice(0, 20)}
                    </span>
                </div>
            </div>
            <IonButtons slot='end'>
                <IonBadge color={'transparent'} style={{ opacity: 0.5 }}>
                    {msg && msg?.sent !== null ? timeAgo(new Date(msg.sent.seconds * 1000)) : <IonSpinner name='dots' />}
                </IonBadge>
            </IonButtons>
        </div>
    );
};

export default Chat;

