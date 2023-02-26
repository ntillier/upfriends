import { createContext } from "preact";
import { useContext, useState, useMemo } from "preact/hooks";
import styles from './index.css';

export const Modals = createContext();

export function ModalsProvider({ children }) {
    const [modals, setModals] = useState([]);

    const popModal = () => setModals((m) => m.splice(0, m.length - 1));

    const context = useMemo(() => {
        return {
            modals,
            addModal(title, factory, props) {
                setModals((m) => {
                    return [
                        ...m,
                        { title, props, factory }
                    ];
                });
            },
            popModal
        }
    }, [modals]);

    return (
        <Modals.Provider value={context}>
            {
                children
            }
            {
                modals.length > 0 &&
                <div className={styles.dialog}>
                    {
                        modals.map((i, j) =>
                            <div key={j} className={styles.modal}>
                                <div className={styles.modalbox}>
                                    <div className={styles.modalbar}>
                                        <label>{i.title}</label>
                                        <svg onClick={popModal} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" height="32" width="32">
                                            <path d="M24 26.1 13.5 36.6q-.45.45-1.05.45-.6 0-1.05-.45-.45-.45-.45-1.05 0-.6.45-1.05L21.9 24 11.4 13.5q-.45-.45-.45-1.05 0-.6.45-1.05.45-.45 1.05-.45.6 0 1.05.45L24 21.9l10.5-10.5q.45-.45 1.05-.45.6 0 1.05.45.45.45.45 1.05 0 .6-.45 1.05L26.1 24l10.5 10.5q.45.45.45 1.05 0 .6-.45 1.05-.45.45-1.05.45-.6 0-1.05-.45Z" />
                                        </svg>
                                    </div>
                                    <div className={styles.preview}>
                                        <i.factory close={popModal} {...i.props} />
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div>
            }
        </Modals.Provider>
    );
}

export const useModals = () => useContext(Modals);