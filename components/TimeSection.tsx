"use client";

import {useState,useEffect} from "react";

import styles from "./TimeSection.module.css";
import { time } from "console";

export default function TimeSection() {
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
    hourCycle: 'h23',
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
        <section className={styles.timeSection}>
            <time
                className={styles.clock}
                dateTime={now?.toISOString()}
            >
                {time ?? '--:--'}
            </time>
            <p className={styles.date}>
                {now ? `${date} ${weekday}` : '--'}
            </p>
        </section>
    )
}