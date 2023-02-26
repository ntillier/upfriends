import styles from './index.css';

export default function Role ({ id }) {
    return (
        <div className={styles.role}>{ id }</div>
    );
}