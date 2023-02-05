import styles from './index.css';

export default function Input ({ placeholder, style, disabled = false, onInput, onEnter = () => {}, type = 'Text', autocomplete }) {

    function keyDown (e) {
        if (e.key === 'Enter') {
            onEnter(e);
        }
    }

    return (
        <input autoComplete={autocomplete} style={style} className={styles.input} placeholder={placeholder} disabled={disabled} onInput={onInput} type={type} onKeyDown={keyDown} />
    );
}