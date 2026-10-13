'use client';

import type { CSSProperties } from 'react';
import styles from '@/app/page.module.css';
import { isBackgroundImage, isWebUrl, searchEngines } from '@/lib/settings';
import { formatMessage, messages } from '@/lib/i18n';
import { getLinkIcon } from '@/lib/quick-links';
import { useSettings } from './SettingsProvider';
import SettingsPanel from './SettingsPanel';
import TimeSection from './TimeSection';

export default function Homepage() {
  const { settings, ready, editing, notice } = useSettings();
  const engine = searchEngines[settings.searchEngine];
  const text = messages[settings.language];
  const engineName = settings.searchEngine === 'baidu' ? text.baidu : engine.name;
  const background = isBackgroundImage(settings.backgroundImage) ? settings.backgroundImage : '';
  const themeStyles = {
    '--accent': settings.accentColor,
    '--background-image': background ? `url(${JSON.stringify(background)})` : 'none',
  } as CSSProperties;

  return (
    <main className={styles.homepage} data-theme={settings.theme} data-card-size={settings.cardSize} style={themeStyles}>
      
      <header className={styles.header}>
        <div>
          <h1>{settings.title || text.defaultTitle}</h1>
          {settings.greeting && <p>{settings.greeting}</p>}
        </div>
        <SettingsPanel />
      </header>
      
      {!editing && notice && <p className={styles.notice} role="status">{notice}</p>}
      
      <div className={styles.modules} aria-busy={!ready}>
        {settings.modules.map((moduleId) => {
          if (!settings.visible[moduleId]) return null;
          if (moduleId === 'time') {
            return <TimeSection key={moduleId} 
            language={settings.language}
            hourFormat={settings.hourFormat} 
            showDate={settings.showDate} 
            showSeconds={settings.showSeconds} 
            />;
          }
          if (moduleId === 'search') {
            return (
              <section key={moduleId} className={styles.searchSection} aria-label={text.webSearch}>
                <form action={engine.action} 
                      method="GET" 
                      target={settings.searchNewTab ? '_blank' : undefined} 
                      rel="noopener noreferrer">
                  <span className={styles.engine}>{engineName}</span>
                  <input type="search" name={engine.query} 
                        aria-label={formatMessage(text.searchWith, { engine: engineName })}
                        placeholder={formatMessage(text.searchPlaceholder, { engine: engineName })}
                        onInvalid={(event) => event.currentTarget.setCustomValidity(text.searchRequired)}
                        onInput={(event) => event.currentTarget.setCustomValidity('')}
                        required className={styles.searchInput} />
                </form>
              </section>
            );
          }
          return (
            <section key={moduleId} className={styles.quickLinksSection} aria-labelledby="quick-links-title">
              <div className={styles.sectionHeading}>
                <h2 id="quick-links-title">{text.links}</h2>
              </div>
              <div className={styles.quickLinksSectionGrid}>
                {settings.quickLinks.map((link) => (
                  <a key={link.id} href={isWebUrl(link.url) ? link.url : undefined} target={settings.linksNewTab ? '_blank' : undefined} rel="noopener noreferrer" className={styles.quicklink}>
                    <span className={styles.linkIcon} aria-hidden="true">{getLinkIcon(link.name)}</span>
                    <span className={styles.linkName}>{link.name || text.unnamedLink}</span>
                    <span className={styles.linkHost}>{isWebUrl(link.url) ? new URL(link.url).hostname : text.enterUrl}</span>
                  </a>
                ))}
              </div>
              {settings.quickLinks.length === 0 && <p className={styles.empty}>{text.noLinks}</p>}
            </section>
          );
        })}
        {settings.modules.every((moduleId) => !settings.visible[moduleId]) && <p className={styles.empty}>{text.noModules}</p>}
      </div>
    
    </main>
  );
}
