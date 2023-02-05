import { createUserWithEmailAndPassword, onAuthStateChanged, getAuth } from "firebase/auth";
import styles from '../login/index.css';
import { Button, Input } from "../../components/ui";
import { useState, useRef, useEffect } from 'preact/hooks';
import { Link, route } from "preact-router";
import useRedirect from "../../hooks/useRedirect";

export default function SignUp() {
    const values = useRef(['', '']);
    const [valid, setValid] = useState([false, false]);
    const [error, setError] = useState('');
    useRedirect();

    useEffect(() => {
        onAuthStateChanged(getAuth(), (user) => {
            if (user) {
                route('/onboarding');
            }
          });
    });

    function updateValue(index, evt) {
        values.current[index] = evt.target.value;
        setValid([/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(values.current[0]), values.current[1].length >= 8]);
    }

    function signup() {
        if (valid.filter((i) => i === false).length !== 0) {
            return;
        }
        setValid([false, false]);
        createUserWithEmailAndPassword(getAuth(), values.current[0], values.current[1])
            .then((userCredential) => {
                const user = userCredential.user;
                if (user) {
                    route('/onboarding');
                }
            })
            .catch((error) => {
                console.log(error);
                setError(error.message);
            });

    }

    return (
        <div className={styles.login}>
            <form onSubmit={(e) => e.preventDefault()} className={styles.wrapper} style={{ gap: '12px' }}>
                <h2>Sign up</h2>
                <Input onInput={(e) => updateValue(0, e)} placeholder="Email" />
                <Input onInput={(e) => updateValue(1, e)} type='password' placeholder="Password" autocomplete="new-password" />
                <Button disabled={valid.filter((i) => i === false).length !== 0} onClick={signup}>SIGNUP</Button>
                <span style={{ margin: '4px 0' }}>Already have an account? <Link href="/login">Log in</Link> instead.</span>
                <span  className={styles.warning}>{ error }</span>
            </form>
        </div>
    );
}