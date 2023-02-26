import { addDoc, collection, getFirestore, onSnapshot, query } from 'firebase/firestore';
import { completeQuery } from '/util/firebase';
import { route } from 'preact-router';
import { useEffect, useRef, useState } from 'preact/hooks';
import { getTime } from '/util/time';
import styles from './index.css';
import { Button, Input } from '/components/ui';
import { useModals } from '/context/modals';
import { getAuth } from 'firebase/auth';

function CreateChatModal ({ close, pushModal }) {

    function createChat (e) {
        const title = e.target.parentElement.children[0];
        const description = e.target.parentElement.children[1];

        if (title.value.length >= 5 && description.value.length >= 2) {
            addDoc(collection(getFirestore(), 'channels'), {
                last: null,
                author: getAuth().currentUser.uid,
                restricted: false,
                description: description.value.trim(),
                title: title.value.trim()
            })
                .then(close)
                .catch((e) => {
                    pushModal('Error', () => <div>{ e.message }</div>);
                });
        } else {
            pushModal('Error', () => <div>The title should have at least 5 characters, and the description 2.</div>);
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
            <Input max="40" placeholder="Title" />
            <Input max="150" placeholder="Description" />
            <Button onClick={createChat} >CREATE</Button>
        </div>
    );
}

export default function ChatList({ channel }) {
    const [channels, setChannels] = useState([]);
    const db = useRef();
    const modals = useModals();

    function openNewChatModal () {
        modals.addModal('NEW CHAT', CreateChatModal, { pushModal: modals.addModal, close: modals.popModal });
    }


    useEffect(() => {
        db.current = getFirestore();

        // for the channels
        onSnapshot(
            query(collection(db.current, "channels")),
            (querySnapshot) => {
                completeQuery(db.current, querySnapshot, [['author', 'users'], ['last', 'messages']]).then((arr) => {
                    setChannels(arr.sort((a, b) => {
                        if (!a || !a.last) return 1;
                        if (!b || !b.last) return -1;
                        return b.last?.date.seconds - a.last?.date.seconds;
                    }));
                });
            });
    }, []);

    return (
        <div className={styles.list}>
            <div className={styles.bar}>
                <h1>Channels</h1>
                <svg onClick={openNewChatModal} xmlns="http://www.w3.org/2000/svg" viewBox='0 0 48 48' height="38" width="38">
                    <path d="M24 38q-.65 0-1.075-.425-.425-.425-.425-1.075v-11h-11q-.65 0-1.075-.425Q10 24.65 10 24q0-.65.425-1.075.425-.425 1.075-.425h11v-11q0-.65.425-1.075Q23.35 10 24 10q.65 0 1.075.425.425.425.425 1.075v11h11q.65 0 1.075.425Q38 23.35 38 24q0 .65-.425 1.075-.425.425-1.075.425h-11v11q0 .65-.425 1.075Q24.65 38 24 38Z" />
                </svg>
            </div>
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