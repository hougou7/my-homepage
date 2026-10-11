'use client';

import { useState, useEffect } from 'react';
import styles from './TimeSection.module.css';
import { messages, type Language } from '@/lib/i18n';

type TimeSectionProps = {
    language: Language;
    hourFormat: '12' | '24';
    showDate: boolean;
    showSeconds: boolean;
};

export default function TimeSection({ language, hourFormat, showDate, showSeconds }: TimeSectionProps) {
    const [now, setNow] = useState<Date | null>(null);
    useEffect(() => {
        const updateTime = () => setNow(new Date());
        const initialUpdate = window.setTimeout(updateTime,0);
        const intervalId = window.setInterval(updateTime, 1000);
        return () => {
            window.clearTimeout(initialUpdate);
            window.clearInterval(intervalId);
        };
    },[]) 

    const time = now?.toLocaleTimeString(language, {
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hourCycle: hourFormat === '12' ? 'h12' : 'h23',
    })
    
    const date = now?.toLocaleDateString(language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
    const weekday = now?.toLocaleDateString(language,{
        weekday: 'long',
    })

    return(
        <section className={styles.timeSection} aria-label={messages[language].currentTime}>
            <time
                className={styles.clock}
                dateTime={now?.toISOString()}
            >
                {time ?? '--:--'}
            </time>
            {showDate && <p className={styles.date}>
                {now ? `${date} ${weekday}` : '--'}
            </p>}
        </section>
    )
}
