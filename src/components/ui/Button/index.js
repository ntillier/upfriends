import { route } from 'preact-router';
import styles from './index.css';

export default function Button ({ children, to = false, onClick, disabled = false }) {

    function clickEvent (e) {
        if (to !== false) {
            return route(to);
        }
        onClick(e);
    }

    return (
        <button onClick={clickEvent} disabled={disabled} className={styles.button}>{ children }</button>
    );
}