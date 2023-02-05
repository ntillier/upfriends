/* eslint-disable react/no-danger */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "preact/hooks";
import styles from './index.css';
import { addDoc, collection, deleteDoc, doc, getDoc, getFirestore, limitToLast, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import { completeQuery } from "../../util/firebase";
import { getTime } from "../../util/time";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { parseAndRender } from "../../util/parse";
import { Loading } from "../../components/ui";


const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function ActionBox({ onEdit, onDelete }) {
    return (
        <div className={styles.actions}>
            <svg onClick={onEdit} xmlns="http://www.w3.org/2000/svg" height="32px" width="32px" viewBox="0 0 24 24" fill="var(--grey)">
                <path d="M0 0h24v24H0V0z" fill="none" /><path fill="var(--grey)" d="M3 17.46v3.04c0 .28.22.5.5.5h3.04c.13 0 .26-.05.35-.15L17.81 9.94l-3.75-3.75L3.15 17.1c-.1.1-.15.22-.15.36zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            <svg onClick={onDelete} xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 0 24 24" width="32px" fill="var(--grey)">
                <path d="M0 0h24v24H0V0z" fill="none" /><path fill="var(--grey)" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v10zM18 4h-2.5l-.71-.71c-.18-.18-.44-.29-.7-.29H9.91c-.26 0-.52.11-.7.29L8.5 4H6c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1z" />
            </svg>
        </div>
    );
}

function Message({ message, me, isSame }) {

    function deleteMessage () {
        if (confirm('Do you want to delete this message?')) {
            deleteDoc(
                doc(getFirestore(), 'messages', message.id)
            );
        }
    }

    if (isSame) {
        return (
            <div className={styles.message}>
                {
                    me && <ActionBox onDelete={deleteMessage} />
                }
                <div className={styles.datePlaceholder}>{ getTime(message.date.toDate()) }</div>
                <div className={styles.content}>
                    <div className={styles.bubble} dangerouslySetInnerHTML={{ __html: message.content }} />
                </div>
            </div>
        );
    }
    return (
        <div className={styles.message}>
            {
                me && <ActionBox onDelete={deleteMessage} />
            }
            <img src={message.author?.image} />
            <div className={styles.content}>
                <div className={styles.label}>
                    <label>{message.author?.name}</label>
                    <span>{getTime(message.date.toDate())}</span>
                </div>
                <div className={styles.bubble} dangerouslySetInnerHTML={{ __html: message.content }} />
            </div>
        </div>
    );
}

export default function ChatRoom({ channel }) {
    const [room, setRoom] = useState({});
    const [messages, setMessages] = useState([]);
    const [exists, setExists] = useState(true);
    const [user, setUser] = useState({});
    const [disabled, setDisabled] = useState(true);
    const [loading, setLoading] = useState(true);
    const config = useRef({ listener: null, count: Math.round(window.innerHeight / 20), db: null, bottom: true, end: false, loading: true, diff: 0 });
    const input = useRef();
    const container = useRef();
    const scroll = useRef();

    const now = [Date.now(), new Date().getDate()];
    let date = new Date(), lastDate = new Date(), isSame = false;

    function scrollToBottom() {
        scroll.current?.scrollIntoView();
    }

    function onScroll() {
        if (config.current.loading) return;

        if (container.current.scrollHeight - Math.ceil(container.current.scrollTop) <= container.current.clientHeight + 100) {
            config.current.bottom = true;
        } else {
            config.current.bottom = false;
        }

        if (container.current.scrollTop < 20 && config.current.end === false) {
            loadMore();
        }
    }

    function loadMore() {
        if (config.current.loading) return;
        config.current.loading = true;
        config.current.count += 15;
        config.current.diff = container.current.scrollHeight - Math.floor(container.current.scrollTop) - container.current.clientHeight;
        
        if (config.current.listener) {
            config.current.listener();
        }

        container.current.style.scrollBehavior = "auto";

        setLoading(true);

        config.current.listener = onSnapshot(
            query(collection(config.current.db, "messages"), where("channel", "==", channel), orderBy('date', 'asc'), limitToLast(config.current.count)),
            async (querySnapshot) => {
                completeQuery(config.current.db, querySnapshot, [['author', 'users']])
                    .then((arr) => {
                        if (arr.length < config.current.count) {
                            config.current.end = true;
                        }
                        for (let i in arr) {
                            arr[i].content = parseAndRender(arr[i].content);
                        }
                        setLoading(false);
                        setMessages(arr);
                    });
            }
        );
    }

    function waitImages () {
        const promises = [];

        Array.from(container.current.getElementsByClassName('image'))
            .forEach((i) => {
                if (!i.xfine) {
                    promises.push(new Promise((r) => i.xload = r));
                }
            });

        return Promise.all(promises);
    }

    async function waitForImages () {
        await waitImages();

        container.current.style.scrollBehavior = "smooth";

        if (config.current.bottom) {
            scrollToBottom();
        } else {
            container.current.scrollTop = container.current.scrollHeight - container.current.clientHeight - config.current.diff;
        }

        config.current.loading = false;
    }

    this.componentDidUpdate = function () {
        if (config.current.bottom) {
            scrollToBottom();
        }
        if (config.current.loading && container.current) {
            waitForImages();
        }
    };

    useEffect(() => {
        if (!config.current.db) {
            config.current.db = getFirestore();
        }
        config.current.bottom = true;

        if (config.current.listener) {
            config.current.listener();
        }

        onAuthStateChanged(getAuth(), (u) => {
            setUser(u);
        });

        if (channel.length === 0) {
            return;
        }

        getDoc(doc(config.current.db, 'channels', channel))
            .then((ref) => {
                setExists(ref.exists());
                if (ref.exists()) {
                    document.title = `${ref.data().title} | UPFriends`
                    setDisabled(false);
                    completeQuery(config.current.db, { docs: new Array(ref) }, [['author', 'users']])
                        .then((arr) => setRoom(arr[0]));

                    loadMore();
                } else {
                    setLoading(false);
                }
            });
    }, [channel]);

    useEffect(() => {
        if (!container.current) return;
        container.current.addEventListener('scroll', onScroll, { passive: true });
    }, [container]);

    function watchForKey(e) {
        if (e.key === 'Enter' && !e.shiftKey && user && input.current.value.length > 1) {
            e.preventDefault();
            addDoc(collection(config.current.db, 'messages'), {
                author: user.uid,
                channel,
                content: input.current.value.trim(),
                edited: false,
                date: new Date()
            }).then((i) => {
                updateDoc(
                    doc(config.current.db, 'channels', channel),
                    {
                        last: i.id
                    }
                );
            }).catch(console.log);

            input.current.value = '';
            input.current.rows = 1;
            input.current.focus();
        }
    }

    if (channel.length === 0) {
        return (
            <div className={styles.box}>
                <h1 className={styles.warning}>Please choose a channel on the left.</h1>
            </div>
        );
    }

    if (!exists) {
        return (
            <div className={styles.box}>
                <h1 className={styles.warning}>The channel doesn't exists.</h1>
            </div>
        );
    }

    return (
        <div className={styles.box}>
            <div className={styles.room}>
                <img src={room.author?.image} />
                <div className={styles.infos}>
                    <label>{room.title}</label>
                    <span>{room.description}</span>
                </div>
            </div>
            <div ref={container} className={styles.messages}>
                {
                    loading && <Loading />
                }
                {
                    messages.map((i, j) => {
                        date = i.date.toDate();
                        isSame = j === 0 ? false : messages[j - 1].author.id === i.author.id && i.date.seconds - messages[j-1].date.seconds  < 900;
                        if (date.toLocaleDateString() !== lastDate) {
                            lastDate = date.toLocaleDateString();
                            isSame = false;
                            return (
                                <div key={i.id}>
                                    <div className={styles.indicator} style={`--text:'${now[0] - date.valueOf() < 604800000 ? (date.getDate() === now[1] ? 'Today' : days[date.getDay()]) : `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`}'`} />
                                    <Message isSame={isSame} key={i.id} message={i} me={user.uid === i.author.id} />
                                </div>
                            );
                        }
                        return <Message key={i.id} isSame={isSame} message={i} me={user.uid === i.author.id} />;
                    })
                }

                <div ref={scroll} />
            </div>
            <div className={styles.form}>
                <textarea maxLength="400" disabled={disabled} rows="1" ref={input} onKeyDown={watchForKey} placeholder="Write a message..." className={styles.input} />
                <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 0 24 24" width="32px" fill="var(--grey)">
                    <path d="M0 0h24v24H0V0z" fill="none" /><path fill="var(--grey)" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v10zM18 4h-2.5l-.71-.71c-.18-.18-.44-.29-.7-.29H9.91c-.26 0-.52.11-.7.29L8.5 4H6c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1z" />
                </svg>
            </div>
        </div>
    );
}