'use client';

import type { CSSProperties } from 'react';
import styles from '@/app/page.module.css';
import { isBackgroundImage, isWebUrl, searchEngines } from '@/lib/settings';
import { useSettings } from './SettingsProvider';
import SettingsPanel from './SettingsPanel';
import TimeSection from './TimeSection';

export default function Homepage() {
  const { settings, ready, editing, notice } = useSettings();
  const engine = searchEngines[settings.searchEngine];
  const background = isBackgroundImage(settings.backgroundImage) ? settings.backgroundImage : '';
  const themeStyles = {
    '--accent': settings.accentColor,
    '--background-image': background ? `url(${JSON.stringify(background)})` : 'none',
  } as CSSProperties;

  return (
    <main className={styles.homepage} data-theme={settings.theme} data-card-size={settings.cardSize} style={themeStyles}>
      <header className={styles.header}>
        <div>
          <h1>{settings.title || 'My Homepage'}</h1>
          {settings.greeting && <p>{settings.greeting}</p>}
        </div>
        <SettingsPanel />
      </header>
      {!editing && notice && <p className={styles.notice} role="status">{notice}</p>}
      <div className={styles.modules} aria-busy={!ready}>
        {settings.modules.map((moduleId) => {
          if (!settings.visible[moduleId]) return null;
          if (moduleId === 'time') {
            return <TimeSection key={moduleId} hourFormat={settings.hourFormat} showDate={settings.showDate} showSeconds={settings.showSeconds} />;
          }
          if (moduleId === 'search') {
            return (
              <section key={moduleId} className={styles.searchSection} aria-label="网页搜索">
                <form action={engine.action} method="GET" target={settings.searchNewTab ? '_blank' : undefined} rel="noopener noreferrer">
                  <span className={styles.engine}>{engine.name}</span>
                  <input type="search" name={engine.query} aria-label={`使用 ${engine.name} 搜索`} placeholder={`使用 ${engine.name} 搜索…`} required className={styles.searchInput} />
                  <button type="submit" className={styles.searchButton}>搜索</button>
                </form>
              </section>
            );
          }
          return (
            <section key={moduleId} className={styles.quickLinksSection} aria-labelledby="quick-links-title">
              <div className={styles.sectionHeading}>
                <h2 id="quick-links-title">快捷链接</h2>
                <span>{settings.quickLinks.length} 个站点</span>
              </div>
              <div className={styles.quickLinksSectionGrid}>
                {settings.quickLinks.map((link) => (
                  <a key={link.id} href={isWebUrl(link.url) ? link.url : undefined} target={settings.linksNewTab ? '_blank' : undefined} rel="noopener noreferrer" className={styles.quicklink}>
                    <span className={styles.linkIcon} aria-hidden="true">{link.name.trim().slice(0, 1).toUpperCase() || '+'}</span>
                    <span className={styles.linkName}>{link.name || '未命名链接'}</span>
                    <span className={styles.linkHost}>{isWebUrl(link.url) ? new URL(link.url).hostname : '请输入网址'}</span>
                  </a>
                ))}
              </div>
              {settings.quickLinks.length === 0 && <p className={styles.empty}>还没有快捷链接，可以在设置中添加。</p>}
            </section>
          );
        })}
        {settings.modules.every((moduleId) => !settings.visible[moduleId]) && <p className={styles.empty}>所有模块已隐藏，可以在设置中重新开启。</p>}
      </div>
    </main>
  );
}
