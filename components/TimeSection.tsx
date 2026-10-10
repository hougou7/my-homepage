'use client';

import { useState, useEffect } from 'react';
import styles from './TimeSection.module.css';

type TimeSectionProps = {
    hourFormat: '12' | '24';
    showDate: boolean;
    showSeconds: boolean;
};

export default function TimeSection({ hourFormat, showDate, showSeconds }: TimeSectionProps) {
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

    const time = now?.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hourCycle: hourFormat === '12' ? 'h12' : 'h23',
    })
    
    const date = now?.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
    const weekday = now?.toLocaleDateString('zh-CN',{
        weekday: 'long',
    })

    return(
        <section className={styles.timeSection} aria-label="当前时间">
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
