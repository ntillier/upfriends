/* eslint-disable react-hooks/exhaustive-deps */
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "preact/hooks";
import useRedirect from "/hooks/useRedirect";
import styles from './index.css';
import { Loading } from "/components/ui";
import ChatList from "/components/chats";
import ChatRoom from "/components/chat";
import { getDatabase, onDisconnect, onValue, ref, set } from "firebase/database";
import OnlineUsers from "/components/online";

export default function Chats({ channel }) {
    const db = useRef({});
    const [user, setUser] = useState({});
    const [authUser, setAuthUser] = useState({});

    useRedirect();

    function getUser(uid) {
        return new Promise((resolve) => {
            getDoc(
                doc(db.current.firestore, 'users', uid)
            )
                .then((d) => {
                    if (d.exists()) {
                        return resolve({
                            exists: true,
                            data: Object.assign(d.data(), { id: uid })
                        });
                    }
                    resolve({
                        exists: false,
                        data: null
                    });
                });
        });
    }

    useEffect(() => {
        db.current.firestore = getFirestore();
        db.current.database = getDatabase();

        onAuthStateChanged(getAuth(), (u) => {
            setAuthUser(u);

            if (u) {
                const userStatusDatabaseRef = ref(db.current.database, `/status/${u.uid}`);

                const isOfflineForDatabase = {
                    state: 'offline'
                };

                const isOnlineForDatabase = {
                    state: 'online'
                };

                onValue(
                    ref(db.current.database, '.info/connected'),
                    (snapshot) => {
                        if (snapshot.val() == false) {
                            return;
                        }

                        onDisconnect(userStatusDatabaseRef)
                            .set(isOfflineForDatabase)
                            .then(() => {
                                set(userStatusDatabaseRef, isOnlineForDatabase);
                            });
                    });
            }
        });

    }, []);

    useEffect(() => {
        if (authUser?.uid) {
            getUser(authUser.uid)
                .then((obj) => {
                    if (obj.exists) {
                        setUser(obj.data);
                    } else {
                        setDoc(
                            doc(collection(db.current.firestore, 'users'), authUser.uid),
                            {
                                name: authUser.displayName,
                                image: authUser.photoURL
                            }
                        ).then(() => {
                            getUser(authUser.uid)
                                .then((u) => {
                                    setUser(u.data);
                                });
                        }).catch(console.log);
                    }
                });

        }
    }, [authUser]);

    if (!user) {
        return (
            <div className={styles.wrapper}>
                <Loading />
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.app}>
                <ChatList channel={channel} />
                <ChatRoom channel={channel} />
                <OnlineUsers />
            </div>
        </div>
    );
}