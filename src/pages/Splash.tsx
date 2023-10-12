import { IonButton, IonCol, IonGrid, IonHeader, IonIcon, IonPage, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import { TribeContent } from '../components/TribeContent';
import { chatboxEllipsesOutline, journalOutline, leafSharp, manOutline, pulseOutline } from 'ionicons/icons';

const Splash: React.FC = () => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>TRIBE</IonTitle>
                </IonToolbar>
            </IonHeader>
            <TribeContent fullscreen>
                <IonGrid>
                    <IonRow>
                        <IonCol>
                            <IonButton style={{ height: 200 }} size='large' expand='full' color='light' routerLink='/activity'>
                                <IonText color='danger'>
                                    Activity <IonIcon icon={pulseOutline} />
                                </IonText>
                            </IonButton>
                        </IonCol>
                        <IonCol>

                            <IonButton style={{ height: 200 }} size='large' expand='full' color='light' routerLink='/discover'>
                                <IonText color='success'>
                                    Discover <IonIcon icon={leafSharp} />
                                </IonText>
                            </IonButton>
                        </IonCol>
                        <IonCol>

                            <IonButton style={{ height: 200 }} size='large' expand='full' color='light' routerLink='/chat'>
                                <IonText color='primary'>

                                    Chat <IonIcon icon={chatboxEllipsesOutline} />
                                </IonText>
                            </IonButton>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            <IonButton style={{ height: 200 }} size='large' expand='full' color='light' routerLink='/onboarding'>
                                <IonText color='tertiary'>

                                    Join <IonIcon icon={manOutline} />
                                </IonText>
                            </IonButton>
                        </IonCol>
                    </IonRow>

                </IonGrid>
            </TribeContent>
        </IonPage >
    );
};

export default Splash;
