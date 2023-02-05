import { getDatabase, onValue, query, ref } from 'firebase/database';
import { getDoc, getFirestore, doc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'preact/hooks';
import styles from './index.css';

function User({ user }) {
    return (
        <div className={styles.status}>
            <img src={user.image} />
            <label>{ user.name }</label>
        </div>
    );
}

export default function OnlineUsers() {
    const [online, setOnline] = useState([]);
    const [offline, setOffline] = useState([]);
    const db = useRef();

    useEffect(() => {
        db.current = getFirestore();
        const statusRef = ref(getDatabase(), 'status');
        const q = query(statusRef/*, equalTo('online'), limitToFirst(10)*/);

        onValue(q, async (snap) => {
            const data = snap.val();
            const users = await Promise.all(
                Object.keys(data)
                .map(async (i) => Object.assign((await getDoc(doc(db.current, 'users', i))).data(), { online: data[i].state === 'online', id: i }))
            );

            const on = [];
            const off = [];

            for (let i of users) {
                if (i.online === true) {
                    on.push(i);
                } else {
                    off.push(i);
                }
            }

            setOnline(on);
            setOffline(off);
        });
    }, []);

    return (
        <div className={styles.online}>
            {
                online.length > 0 && <h1>Online</h1>
            }
            <div className={styles.list}>
                {
                    online.map((i) =>
                        <User key={i.id} user={i} />
                    )
                }
            </div>

            {
                offline.length > 0 && <h1>Offline</h1>
            }
            <div className={styles.list}>
                {
                    offline.map((i) =>
                        <User key={i.id} user={i} />
                    )
                }
            </div>
        </div>
    );
}