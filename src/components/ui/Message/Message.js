import { deleteDoc, doc, getFirestore, updateDoc } from "firebase/firestore";
import { useRef, useState } from "preact/hooks";
import { memo } from 'preact/compat';
import { getTime } from "../../../util/time";
import styles from './styles.css';

const  ActionBox = memo(({ onReply, onEdit, onDelete, isMe, canEdit }) => {
    return (
        <div className={styles.actions}>
            <svg onClick={onReply} xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 0 24 24" width="32px" fill="#000000">
                <path d="M0 0h24v24H0V0z" fill="none" /><path fill="currentColor" d="M10 9V7.41c0-.89-1.08-1.34-1.71-.71L3.7 11.29c-.39.39-.39 1.02 0 1.41l4.59 4.59c.63.63 1.71.19 1.71-.7V14.9c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
            </svg>
            {
                isMe && canEdit &&
                <svg onClick={onEdit} xmlns="http://www.w3.org/2000/svg" height="32px" width="32px" viewBox="0 0 24 24" fill="var(--grey)">
                    <path d="M0 0h24v24H0V0z" fill="none" /><path fill="currentColor" d="M3 17.46v3.04c0 .28.22.5.5.5h3.04c.13 0 .26-.05.35-.15L17.81 9.94l-3.75-3.75L3.15 17.1c-.1.1-.15.22-.15.36zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
            }
            {
                isMe &&
                <svg onClick={onDelete} xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 0 24 24" width="32px" fill="var(--grey)">
                    <path d="M0 0h24v24H0V0z" fill="none" /><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v10zM18 4h-2.5l-.71-.71c-.18-.18-.44-.29-.7-.29H9.91c-.26 0-.52.11-.7.29L8.5 4H6c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1z" />
                </svg>
            }
        </div>
    );
}, (prev, next) => prev.isMe === next.isMe && prev.canEdit === next.canEdit);

function ReplyBox({ reply }) {
    return (
        <div className={styles.replybox}>
            <label>{ reply.author?.name || 'Deleted user' }</label>
            <div dangerouslySetInnerHTML={{ __html: reply.content }} />
        </div>
    );
}

export default function Message({ message, me, isSame, setReply }) {
    let [edit, setEdit] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const input = useRef();
    let isMe = (me.uid === message.author.id);

    function deleteMessage() {
        if (confirm('Do you want to delete this message?')) {
            deleteDoc(
                doc(getFirestore(), 'messages', message.id)
            );
        }
    }

    function changeReply() {
        setReply(message);
    }

    function saveMessage() {
        if (input.current.value.length <= 1) return;
        setDisabled(true);
        updateDoc(
            doc(getFirestore(), 'messages', message.id),
            {
                content: input.current.value,
                edited: true
            }
        )
            .then(() => {
                setEdit(false);
                setDisabled(false)
            })
            .catch((e) => {
                console.log(e);
                setDisabled(false);
            });
    }

    function keyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveMessage();
        } else if (e.key === 'Escape') {
            setEdit(false);
        }
    }

    return (
        <div className={styles.message}>
            <ActionBox onReply={changeReply} onDelete={deleteMessage} canEdit={message.date.toDate().getTime() > Date.now() - 90000} onEdit={() => setEdit(true)} isMe={isMe} />
            {
                isSame
                    ? <div className={styles.datePlaceholder}>{getTime(message.date.toDate())}</div>
                    : <img src={message.author?.image} />
            }
            <div className={styles.content}>
                {
                    !isSame &&
                    <div className={styles.label}>
                        <label>{ message.author?.name }</label>
                        <span>{ getTime(message.date.toDate()) }</span>
                    </div>
                }
                {
                    message.reply && <ReplyBox reply={message.reply} />
                }
                {
                    !edit &&
                    <div className={styles.bubble} dangerouslySetInnerHTML={{ __html: message.content }} />
                }
                {
                    edit &&
                    <div className={styles.editable}>
                        <textarea rows="1" disabled={disabled} ref={input} onKeyDown={keyDown} spellCheck="false">{message.original}</textarea>
                        <span>
                            Press escape to <a onClick={() => setEdit(false)}>cancel</a> or enter to <a onClick={saveMessage}>save</a>
                        </span>
                    </div>
                }
                {
                    message.edited && !edit && <span className={styles.edited}>(edited)</span>
                }
            </div>
        </div>
    );
}