
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from '@/lib/i18n';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        // Load from local storage
        const saved = localStorage.getItem('jsonote_language') as Language;
        if (saved && (saved === 'en' || saved === 'ko' || saved === 'ja')) {
            setLanguageState(saved);
        } else {
            // Detect browser language
            const browserLang = navigator.language.split('-')[0];
            if (browserLang === 'ko') setLanguageState('ko');
            else if (browserLang === 'ja') setLanguageState('ja');
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('jsonote_language', lang);
    };

    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = translations[language];

        // Simple dot notation traversal (though our structure is flat for now)
        // But our dictionary IS flat with dots in keys, so direct lookup first
        if (translations[language][key as keyof typeof translations['en']]) {
            return translations[language][key as keyof typeof translations['en']];
        }

        return key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
