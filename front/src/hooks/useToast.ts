import { useCallback, useRef, useState } from "react";

export function useToast() {
    const [msg, setMsg] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const show = useCallback((m: string) => {
        setMsg(m);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setMsg(null), 2500);
    }, []);
    return { msg, show };
}
