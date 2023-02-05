import { collection, getFirestore, onSnapshot, query } from 'firebase/firestore';
import { completeQuery } from '../../util/firebase';
import { route } from 'preact-router';
import { useEffect, useRef, useState } from 'preact/hooks';
import { getTime } from '../../util/time';
import styles from './index.css';

export default function ChatList({ channel }) {
    const [channels, setChannels] = useState([]);
    const db = useRef();


    useEffect(() => {
        db.current = getFirestore();

        // for the channels
        onSnapshot(
            query(collection(db.current, "channels")),
            (querySnapshot) => {
                completeQuery(db.current, querySnapshot, [['author', 'users'], ['last', 'messages']]).then((arr) => {
                    setChannels(arr.sort((a, b) => b.last?.date.seconds - a.last?.date.seconds));
                });
            });
    }, []);

    return (
        <div className={styles.list}>
            <h1>Channels</h1>
            <div className={styles.channels}>
                {
                    channels.length === 0 &&
                    <span className={styles.nothing}>There are no channels.</span>
                }
                {
                    channels.map((i, j) =>
                        <div
                            style={{ background: i.id === channel ? 'var(--grey-dimmest)' : 'transparent' }}
                            onClick={() => route(`/chats/${i.id}`)}
                            key={j}
                            className={styles.channel}
                        >
                            <img className={styles.image} src={i.author.image} alt={i.title} />
                            <div className={styles.infos}>
                                <div className={styles.up}>
                                    <label>{i.title}</label>
                                    {
                                        i.last &&
                                        <span>{getTime(i.last.date.toDate())}</span>
                                    }
                                </div>
                                {
                                    i.last &&
                                    <div className={styles.down}>{i.last.content}</div>
                                }
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    );
}