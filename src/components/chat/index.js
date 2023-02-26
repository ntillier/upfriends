/* eslint-disable react/no-danger */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "preact/hooks";
import styles from './index.css';
import { addDoc, collection, doc, getDoc, getFirestore, limitToLast, onSnapshot, orderBy, query, serverTimestamp,  updateDoc, where } from "firebase/firestore";
import { completeQuery } from "/util/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { parseAndRender } from "/util/parse";
import { Loading, Message } from "/components/ui";

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ChatRoom({ channel }) {
    const [room, setRoom] = useState({});
    const [messages, setMessages] = useState([]);
    const [auth, setAuth] = useState({});
    const [user, setUser] = useState({});

    const [disabled, setDisabled] = useState(true);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState(null);

    const config = useRef({ listener: null, count: Math.round(window.innerHeight / 40), db: null, bottom: true, end: false, loading: true, diff: 0 });
    const input = useRef();
    const container = useRef();
    const scroll = useRef();

    const now = [Date.now(), new Date().getDate()];
    let date = new Date(), lastDate = new Date(), isSame = false;

    const scrollToBottom = () => scroll.current?.scrollIntoView();
    function onScroll() {
        if (config.current.loading) return;

        if (container.current.scrollHeight - Math.ceil(container.current.scrollTop) <= container.current.clientHeight + 100) {
            config.current.bottom = true;
        } else {
            config.current.bottom = false;
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
                completeQuery(config.current.db, querySnapshot, [['author', 'users'], ['reply', 'messages']])
                    .then(async (arr) => {
                        if (arr.length < config.current.count) {
                            config.current.end = true;
                        }
                        for (let i in arr) {
                            if (arr[i].reply) {
                                let id = arr[i].reply.author;
                                arr[i].reply.author = (await getDoc(doc(config.current.db, 'users', id))).data() || {};
                                arr[i].reply.author.id = id;
                                if (arr[i].reply.content) {
                                    arr[i].reply.content = parseAndRender(arr[i].reply.content);
                                }
                            }
                            arr[i].original = arr[i].content;
                            arr[i].content = parseAndRender(arr[i].content);
                        }
                        setLoading(false);
                        setMessages(arr);
                    });
            }
        );
    }

    function waitImages() {
        const promises = [];

        Array.from(container.current.getElementsByClassName('image'))
            .forEach((i) => {
                if (!i.xfine) {
                    promises.push(new Promise((r) => i.xload = r));
                }
            });

        return Promise.all(promises);
    }

    async function waitForImages() {
        await waitImages();

        if (config.current.bottom) {
            scrollToBottom();
        } else {
            container.current.scrollTop = container.current.scrollHeight - container.current.clientHeight - config.current.diff;
        }

        container.current.style.scrollBehavior = "smooth";

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
        config.current.end = false;
        config.current.count = Math.round(window.innerHeight / 40);
        config.current.diff = 0;

        setLoading(true);
        setMessages([]);

        if (channel.length === 0) {
            return;
        }

        getDoc(doc(config.current.db, 'channels', channel))
            .then((ref) => {
                setRoom(ref.exists() || null);
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

    useEffect(() => {
        if (!room || !user) return;
        setRoom((r) => Object.assign(r, { canSend: r.restricted ? user.roles.includes(r.min_role) : true }));
    }, [room, user])

    useEffect(() => {
        onAuthStateChanged(getAuth(), (u) => {
            setAuth(u);
            getDoc(
                doc(config.current.db, 'users', u.uid)
            ).then((data) => {
                if (data.exists()) {
                    setUser(data.data());
                }
            });
        });
    }, []);

    function sendMessage() {
        addDoc(collection(config.current.db, 'messages'), {
            author: auth.uid,
            channel,
            content: input.current.value.trim(),
            edited: false,
            date: serverTimestamp(),
            ...(reply ? { reply: reply.id } : {})
        }).then((i) => {
            updateDoc(
                doc(config.current.db, 'channels', channel),
                {
                    last: i.id
                }
            );
            setReply(null);
        }).catch(console.log);

        input.current.value = '';
        input.current.focus();
    }

    function watchForKey(e) {
        if (e.key === 'Enter' && !e.shiftKey && auth && input.current.value.length > 1) {
            e.preventDefault();
            sendMessage();
        }
    }

    function updateInputHeight() {
        input.current.style.height = 'auto';
        input.current.style.height = `${input.current.scrollHeight}px`;

        if (config.current.bottom) {
            scrollToBottom();
        }
    }

    if (channel.length === 0) {
        return (
            <div className={styles.box}>
                <h1 className={styles.warning}>Please choose a channel on the left.</h1>
            </div>
        );
    }

    if (room === null) {
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
                <button
                    className={styles.more}onClick={loadMore}
                    style={{ display: !loading && !config.current.end ? 'block' : 'none' }}
                    >More</button>
                <Loading display={loading} />
                {
                    messages.map((i, j) => {
                        if (!i.date) return;
                        date = i.date.toDate();
                        isSame = j === 0 ? false : messages[j - 1].author.id === i.author.id && i.date.seconds - messages[j - 1].date.seconds < 900;
                        if (date.toLocaleDateString() !== lastDate) {
                            lastDate = date.toLocaleDateString();
                            isSame = false;
                            return (
                                <div key={i.id}>
                                    <div className={styles.indicator} style={`--text:'${now[0] - date.valueOf() < 604800000 ? (date.getDate() === now[1] ? 'Today' : days[date.getDay()]) : `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`}'`} />
                                    <Message me={auth} setReply={setReply} isSame={isSame} key={i.id} message={i} />
                                </div>
                            );
                        }
                        return <Message me={auth} setReply={setReply} key={i.id} isSame={isSame} message={i} />;
                    })
                }

                <div ref={scroll} />
            </div>
            {
                reply &&
                    <div className={styles.reply}>
                        <span>Replying to <label>{ reply.author.name }</label></span>
                        <svg onClick={() => setReply(null)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" height="16" width="16">
                            <path d="M24 26.1 13.5 36.6q-.45.45-1.05.45-.6 0-1.05-.45-.45-.45-.45-1.05 0-.6.45-1.05L21.9 24 11.4 13.5q-.45-.45-.45-1.05 0-.6.45-1.05.45-.45 1.05-.45.6 0 1.05.45L24 21.9l10.5-10.5q.45-.45 1.05-.45.6 0 1.05.45.45.45.45 1.05 0 .6-.45 1.05L26.1 24l10.5 10.5q.45.45.45 1.05 0 .6-.45 1.05-.45.45-1.05.45-.6 0-1.05-.45Z" />
                        </svg>
                    </div>
            }
            <div tabIndex={-1} onFocus={() => input.current.focus()} className={styles.form}>
                <textarea
                    spellCheck="false"
                    rows="1"
                    maxLength="400"
                    disabled={ room.canSend ? disabled : true }
                    ref={input}
                    onKeyDown={watchForKey}
                    onInput={updateInputHeight}
                    placeholder={ room.canSend ? "Write a message..." : 'You can\'t send a message in this channel' }
                    className={styles.input} />
                <svg
                    tabIndex={-1}
                    onClick={sendMessage}
                    xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
                    <path d="M0 0h24v24H0V0z" fill="none" /><path d="M3.4 20.4l17.45-7.48c.81-.35.81-1.49 0-1.84L3.4 3.6c-.66-.29-1.39.2-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z" />
                </svg>
            </div>
        </div>
    );
}

/*
<VirtualList
    data={['a', 'b', 'c']}
    renderRow={ row => <div>{row}</div> }
    rowHeight={22}
    overscanCount={10}
    sync
/>
*/