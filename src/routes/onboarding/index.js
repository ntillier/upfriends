import { Button, FileInput, Input } from '../../components/ui';
import { useRef, useState } from 'preact/hooks';
import { getAuth, sendEmailVerification, signOut, updateProfile } from 'firebase/auth';
import { route } from 'preact-router';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import styles from './index.css';
import useRedirect from '../../hooks/useRedirect';

export default function Onboarding () {
    const [step, setStep] = useRedirect();
    const [valid, setValid] = useState([false, false]);
    const [error, setError] = useState('');
    const values = useRef({ username: '', image: '' });
    const image = useRef();

    function sendEmail () {
        sendEmailVerification(getAuth().currentUser, { url: `${window.location.origin}/onboarding` }).then(() => setStep(2));
    }

    function setImage (e) {
        const file = e.target.files[0];

        if (file) {
            values.current.image = file;
            setValid((v) => [v[0], true]);

            const reader = new FileReader();
            reader.readAsDataURL(file, "UTF-8");
            reader.onload = function () {
                image.current.src = reader.result;
            }
        }
    }

    function changeUsername (e) {
        values.current.username = e.target.value;
        if (e.target.value.length >= 4) {
            setValid((v) => [true, v[1]]);
        } else {
            setValid((v) => [false, v[1]]);
        }
    }

    function logout () {
        signOut(getAuth());
    }

    function submit () {
        setStep(4);
        const auth = getAuth();
        const storage = getStorage();
        const imageRef= ref(storage, `/profile_images/${auth.currentUser.uid}`);

        uploadBytes(imageRef, values.current.image)
            .then(() => {
                updateProfile(auth.currentUser, {
                    displayName: values.current.username, photoURL: `https://storage.googleapis.com/upfriends.appspot.com/profile_images/${auth.currentUser.uid}`
                  }).then(() => {
                    route('/chats');
                  }).catch((error) => {
                    setStep(3);
                    setError(error.message);
                  });
            })
            .catch((error) => {
                setStep(3);
                setValid([false, false]);
                console.log(error);
                setError(error.message);
            });
        
        
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.box}>
                {
                    step === 1 &&
                        <>
                            <Button onClick={sendEmail}>Send verification email</Button>
                            <a onClick={logout}>Logout</a>
                        </>
                }
                {
                    step === 2 &&
                        <>
                            <Button disabled={true}>Email sent.</Button>
                            <a onClick={logout}>Logout</a>
                        </>
                }
                {
                    step === 3 &&
                        <>
                            <h1>Create your profile</h1>
                            <img alt="preview" ref={image} src="/assets/icons/image.svg" className={styles['user-image-preview']} />
                            <Input onInput={changeUsername} placeholder="Username" />
                            <FileInput onChange={setImage} />
                            <Button disabled={valid.filter((i) => i !== true).length !== 0} onClick={submit}>Continue</Button>
                            <a onClick={logout}>Logout</a>
                            <span className={styles.warning} style={{ display: 'block', textAlign: 'center' }}>{ error }</span>
                        </>
                }
                {
                    step === 4 &&
                        <>
                            <h1>Saving infos...</h1>
                        </>
                }
            </div>
        </div>
    );
}