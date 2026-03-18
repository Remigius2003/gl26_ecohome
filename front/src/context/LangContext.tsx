import { createContext, useContext, useState } from "react";
import { Lang, Translations, translations } from "../i18n/translations";

const LS_KEY = "portfolio_lang";

function readLang(): Lang {
    try {
        const v = localStorage.getItem(LS_KEY);
        if (v === "en" || v === "fr") return v;
    } catch {}
    return "fr";
}

interface LangContextType {
    lang:    Lang;
    t:       Translations;
    setLang: (l: Lang) => void;
}

const LangContext = createContext<LangContextType>({
    lang:    "fr",
    t:       translations.fr,
    setLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
    const [lang, _setLang] = useState<Lang>(readLang);

    function setLang(l: Lang) {
        try { localStorage.setItem(LS_KEY, l); } catch {}
        _setLang(l);
    }

    return (
        <LangContext.Provider value={{ lang, t: translations[lang], setLang }}>
            {children}
        </LangContext.Provider>
    );
}

export function useLang() {
    return useContext(LangContext);
}
