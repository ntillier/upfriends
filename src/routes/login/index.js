import styles from './index.css';
import { Button, Input } from "../../components/ui";
import { useState, useRef } from 'preact/hooks';
import { Link } from 'preact-router/match';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { route } from 'preact-router';
import useRedirect from '../../hooks/useRedirect';

export default function Login() {
    const values = useRef(['', '']);
    const [valid, setValid] = useState([false, false]);
    const [error, setError] = useState('');

    useRedirect();

    function updateValue(index, evt) {
        values.current[index] = evt.target.value;
        setValid([/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(values.current[0]), values.current[1].length > 8]);
    }

    function logIn() {
        if (valid.filter((i) => i !== true).length === 0) {
            console.log('valid!');
            signInWithEmailAndPassword(getAuth(), values.current[0], values.current[1])
                .then(() => {
                    route('/onboarding');
                })
                .catch((error) => {
                    setError(error.message);
                });
        }
    }
    return (
        <div className={styles.login}>
            <div className={styles.wrapper}>
                <h2>Log in</h2>
                <Input onInput={(e) => updateValue(0, e)} placeholder="Email" />
                <span style={{ visibility: valid[0] ? 'hidden' : 'visible' }} className={styles.warning}>Invalid email address.</span>
                <Input onInput={(e) => updateValue(1, e)} type='password' autocomplete="current-password" placeholder="Password" />
                <span style={{ visibility: valid[1] ? 'hidden' : 'visible' }} className={styles.warning}>Your password must have at least 8 characters.</span>
                <Button disabled={valid.filter((i) => i === false).length !== 0} onClick={logIn}>LOGIN</Button>
                <span style={{ margin: '4px 0' }}>Don't have an account? <Link href="/signup">Sign up</Link> instead.</span>
                <span className={styles.warning}>{error}</span>
            </div>
        </div>
    );
}