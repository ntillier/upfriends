import { useEffect, useState } from "preact/hooks";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { getCurrentUrl, route } from "preact-router";

export default function useRedirect() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        onAuthStateChanged(getAuth(), (user) => {
            const url = getCurrentUrl();
            if (user) {
                if (!user.emailVerified) {
                    return setStep(1);
                } else if (!user.displayName || !user.photoURL) {
                    return setStep(3);
                }
                return url.startsWith('/login') || url.startsWith('/signup') || url.startsWith('/onboarding') ?  route('/chats', true) : null;
            }
            if (!url.startsWith('/signup') && !url.startsWith('/login')) {
                route('/login', true)
            }
        });
    }, []);

    return [step, setStep];
}