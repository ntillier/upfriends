import styles from './index.css';

export default function FileInput ({ onChange, id = 'fileInput' }) {
    return (
        <label className={styles['file-input']} htmlFor={id}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox='0 0 48 48'>
                <path fill="var(--white)" d="M9 42q-1.25 0-2.125-.875T6 39V9q0-1.25.875-2.125T9 6h20.45v3H9v30h30V18.6h3V39q0 1.25-.875 2.125T39 42Zm26-24.9v-4.05h-4.05v-3H35V6h3v4.05h4.05v3H38v4.05ZM12 33.9h24l-7.2-9.6-6.35 8.35-4.7-6.2ZM9 9v30V9Z" />
            </svg>
            <span>Choose a file</span>
            <input onChange={onChange} id={id} type="file" accept='image/*' />
        </label>
    );
}