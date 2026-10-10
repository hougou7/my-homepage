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

    return(
        <section className={styles.timeSection}>
            <time
                className={styles.clock}
                dateTime={now?.toISOString()}
            >
                {time ?? '--:--'}
            </time>
    
        </section>
    )
}