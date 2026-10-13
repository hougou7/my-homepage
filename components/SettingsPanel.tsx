'use client';

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { changeLanguage, getDefaultSettings, MAX_IMAGE_BYTES, moveItem, parseSettings, searchEngines, SettingsValidationError, type QuickLink, type Settings } from '@/lib/settings';
import { formatMessage, messages, type Language, type MessageKey } from '@/lib/i18n';
import { createQuickLinkId } from '@/lib/quick-links';
import { useSettings } from './SettingsProvider';
import styles from './SettingsPanel.module.css';

const sections = ['general', 'links', 'search', 'appearance', 'time', 'layout', 'data'] as const;
type Section = typeof sections[number];

function FilePicker({ label, buttonText, accept, onChange }: {
  label: string;
  buttonText: string;
  accept: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <span className={styles.filePicker}>
        <input type="file" aria-label={label} accept={accept} onChange={onChange} />
        <span>{buttonText}</span>
      </span>
    </label>
  );
}

export default function SettingsPanel() {
  const { settings, ready, editing, notice, update, begin, cancel, save } = useSettings();
  const text = messages[settings.language];
  const dialogRef = useRef<HTMLDialogElement>(null);
  const operationRef = useRef(0);
  const [section, setSection] = useState<Section>('general');
  const [message, setMessage] = useState<MessageKey | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  function open() {
    operationRef.current += 1;
    setMessage(null);
    setBusy(false);
    setConfirmReset(false);
    begin();
    dialogRef.current?.showModal();
  }

  function close() {
    operationRef.current += 1;
    cancel();
    dialogRef.current?.close();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    if (save()) {
      operationRef.current += 1;
      dialogRef.current?.close();
    }
  }

  function editLink(id: string, changes: Partial<QuickLink>) {
    update({ quickLinks: settings.quickLinks.map((link) => link.id === id ? { ...link, ...changes } : link) });
  }

  async function importConfig(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const operation = ++operationRef.current;
    setMessage(null);
    setBusy(true);
    try {
      if (file.size > 3_000_000) throw new SettingsValidationError('configTooLarge');
      const parsed: unknown = JSON.parse(await file.text());
      const imported = parseSettings(parsed, settings.language);
      if (operation !== operationRef.current) return;
      update((parsed as Record<string, unknown>).language === undefined
        ? { ...imported, ...changeLanguage(imported, settings.language) } : imported);
      setMessage('imported');
    } catch (error) {
      if (operation === operationRef.current) setMessage(error instanceof SyntaxError ? 'invalidJson' : error instanceof SettingsValidationError ? error.key : 'importFailed');
    } finally {
      if (operation === operationRef.current) setBusy(false);
    }
  }

  async function uploadBackground(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const operation = ++operationRef.current;
    setMessage(null);
    setBusy(true);
    try {
      if (file.size > MAX_IMAGE_BYTES) throw new SettingsValidationError('imageTooLarge');
      if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
        throw new SettingsValidationError('imageType');
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new SettingsValidationError('imageReadFailed'));
        reader.readAsDataURL(file);
      });
      const image = new Image();
      image.src = dataUrl;
      await image.decode();
      if (operation !== operationRef.current) return;
      update({ backgroundImage: dataUrl });
      setMessage('imageUploaded');
    } catch (error) {
      if (operation === operationRef.current) setMessage(error instanceof SettingsValidationError ? error.key : 'imageReadFailed');
    } finally {
      if (operation === operationRef.current) setBusy(false);
    }
  }

  function exportConfig() {
    setMessage(null);
    try {
      const validated = parseSettings(settings);
      const blob = new Blob([JSON.stringify(validated, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'my-homepage-settings.json';
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage('exported');
    } catch (error) {
      setMessage(error instanceof SettingsValidationError ? error.key : 'exportFailed');
    }
  }

  return (
    <>
      <button type="button" className={styles.openButton} onClick={open} disabled={!ready} aria-haspopup="dialog">
        <span aria-hidden="true">⚙</span> {text.settings}
      </button>
      <dialog ref={dialogRef} className={styles.panel} aria-labelledby="settings-title" aria-describedby="settings-description" onCancel={(event) => { event.preventDefault(); close(); }}>
        <header className={styles.header}>
          <div>
            <h2 id="settings-title">{text.settingsTitle}</h2>
            <p id="settings-description">{text.settingsDescription}</p>
          </div>
          <button type="button" className={styles.iconButton} onClick={close} aria-label={text.closeSettings}>×</button>
        </header>
        <nav className={styles.navigation} aria-label={text.settingsCategories}>
          {sections.map((key) => (
            <button type="button" key={key} aria-pressed={section === key} onClick={() => { setSection(key); setMessage(null); setConfirmReset(false); }}>{text[key]}</button>
          ))}
        </nav>

        <form id="settings-form" className={styles.content} onSubmit={submit} noValidate>
          <fieldset disabled={busy} className={styles.fields}>
            <legend className={styles.sectionTitle}>{text[section]}</legend>
            {section === 'general' && <>
              <label className={styles.field}>{text.language}
                <select aria-label={text.language} value={settings.language} onChange={(event) => update(changeLanguage(settings, event.target.value as Language))}>
                  <option value="zh-CN">简体中文</option><option value="en">English</option>
                </select>
              </label>
              <label className={styles.field}>{text.title}
                <input autoFocus type="text" value={settings.title} maxLength={80} required onChange={(event) => update({ title: event.target.value })} />
              </label>
              <label className={styles.field}>{text.greeting}
                <textarea value={settings.greeting} maxLength={200} rows={3} onChange={(event) => update({ greeting: event.target.value })} />
              </label>
              <p className={styles.help}>{text.greetingHelp}</p>
            </>}

            {section === 'links' && <>
              <label className={styles.toggle}><span>{text.linksNewTab}</span><input type="checkbox" checked={settings.linksNewTab} onChange={(event) => update({ linksNewTab: event.target.checked })} /></label>
              <p className={styles.help}>{text.linksHelp}</p>
              {settings.quickLinks.map((link, index) => (
                <div key={link.id} className={styles.linkEditor}>
                  <div className={styles.row}>
                    <strong>{formatMessage(text.linkNumber, { number: index + 1 })}</strong>
                    <div className={styles.actions}>
                      <button type="button" className={styles.iconButton} disabled={index === 0} aria-label={formatMessage(text.moveLinkUp, { number: index + 1 })} onClick={() => update({ quickLinks: moveItem(settings.quickLinks, index, -1) })}>↑</button>
                      <button type="button" className={styles.iconButton} disabled={index === settings.quickLinks.length - 1} aria-label={formatMessage(text.moveLinkDown, { number: index + 1 })} onClick={() => update({ quickLinks: moveItem(settings.quickLinks, index, 1) })}>↓</button>
                      <button type="button" className={styles.deleteButton} aria-label={formatMessage(text.deleteLink, { number: index + 1 })} onClick={() => update({ quickLinks: settings.quickLinks.filter((item) => item.id !== link.id) })}>{text.delete}</button>
                    </div>
                  </div>
                  <label className={styles.field}>{text.name}<input value={link.name} maxLength={60} required onChange={(event) => editLink(link.id, { name: event.target.value })} /></label>
                  <label className={styles.field}>{text.url}<input type="url" value={link.url} maxLength={2048} placeholder="https://example.com" required onChange={(event) => editLink(link.id, { url: event.target.value })} /></label>
                </div>
              ))}
              <button type="button" className={styles.secondaryButton} disabled={settings.quickLinks.length >= 50} onClick={() => update({ quickLinks: [...settings.quickLinks, { id: createQuickLinkId(), name: '', url: '' }] })}>{text.addLink}</button>
            </>}

            {section === 'search' && <>
              <label className={styles.field}>{text.searchEngine}
                <select aria-label={text.searchEngine} value={settings.searchEngine} onChange={(event) => update({ searchEngine: event.target.value as Settings['searchEngine'] })}>
                  {Object.entries(searchEngines).map(([key, engine]) => <option key={key} value={key}>{key === 'baidu' ? text.baidu : engine.name}</option>)}
                </select>
              </label>
              <label className={styles.toggle}><span>{text.searchNewTab}</span><input type="checkbox" checked={settings.searchNewTab} onChange={(event) => update({ searchNewTab: event.target.checked })} /></label>
            </>}

            {section === 'appearance' && <>
              <label className={styles.field}>{text.theme}
                <select aria-label={text.theme} value={settings.theme} onChange={(event) => update({ theme: event.target.value as Settings['theme'] })}>
                  <option value="dark">{text.dark}</option><option value="light">{text.light}</option><option value="system">{text.system}</option>
                </select>
              </label>
              <label className={styles.field}>{text.accentColor}
                <div className={styles.colorField}><input type="color" aria-label={text.accentColor} value={settings.accentColor} onChange={(event) => update({ accentColor: event.target.value })} /><span>{settings.accentColor}</span></div>
              </label>
              <label className={styles.field}>{text.backgroundUrl}
                <input type="url" value={settings.backgroundImage.startsWith('data:') ? '' : settings.backgroundImage} placeholder={settings.backgroundImage.startsWith('data:') ? text.localBackgroundPlaceholder : 'https://example.com/background.jpg'} onChange={(event) => update({ backgroundImage: event.target.value })} />
              </label>
              <FilePicker label={text.uploadBackground} buttonText={text.chooseFile} accept="image/png,image/jpeg,image/webp,image/gif" onChange={uploadBackground} />
              <p className={styles.help}>{text.imageHelp}</p>
              {settings.backgroundImage && <button type="button" className={styles.secondaryButton} onClick={() => update({ backgroundImage: '' })}>{text.removeBackground}</button>}
            </>}

            {section === 'time' && <>
              <label className={styles.toggle}><span>{text.showTime}</span><input type="checkbox" checked={settings.visible.time} onChange={(event) => update({ visible: { ...settings.visible, time: event.target.checked } })} /></label>
              <label className={styles.field}>{text.hourFormat}
                <select aria-label={text.hourFormat} value={settings.hourFormat} onChange={(event) => update({ hourFormat: event.target.value as Settings['hourFormat'] })}>
                  <option value="24">{text.hours24}</option><option value="12">{text.hours12}</option>
                </select>
              </label>
              <label className={styles.toggle}><span>{text.showDate}</span><input type="checkbox" checked={settings.showDate} onChange={(event) => update({ showDate: event.target.checked })} /></label>
              <label className={styles.toggle}><span>{text.showSeconds}</span><input type="checkbox" checked={settings.showSeconds} onChange={(event) => update({ showSeconds: event.target.checked })} /></label>
              <p className={styles.help}>{text.timeHelp}</p>
            </>}

            {section === 'layout' && <>
              <label className={styles.field}>{text.cardSize}
                <select aria-label={text.cardSize} value={settings.cardSize} onChange={(event) => update({ cardSize: event.target.value as Settings['cardSize'] })}>
                  <option value="small">{text.small}</option><option value="medium">{text.medium}</option><option value="large">{text.large}</option>
                </select>
              </label>
              <p className={styles.help}>{text.layoutHelp}</p>
              {settings.modules.map((moduleId, index) => (
                <div key={moduleId} className={styles.moduleRow}>
                  <label className={styles.toggle}><span>{text[moduleId]}</span><input type="checkbox" checked={settings.visible[moduleId]} onChange={(event) => update({ visible: { ...settings.visible, [moduleId]: event.target.checked } })} /></label>
                  <div className={styles.actions}>
                    <button type="button" className={styles.iconButton} disabled={index === 0} aria-label={formatMessage(text.moveModuleUp, { module: text[moduleId] })} onClick={() => update({ modules: moveItem(settings.modules, index, -1) })}>↑</button>
                    <button type="button" className={styles.iconButton} disabled={index === settings.modules.length - 1} aria-label={formatMessage(text.moveModuleDown, { module: text[moduleId] })} onClick={() => update({ modules: moveItem(settings.modules, index, 1) })}>↓</button>
                  </div>
                </div>
              ))}
            </>}

            {section === 'data' && <>
              <p className={styles.help}>{text.dataHelp}</p>
              <button type="button" className={styles.secondaryButton} onClick={exportConfig}>{text.exportConfig}</button>
              <FilePicker label={text.importConfig} buttonText={text.chooseFile} accept=".json,application/json" onChange={importConfig} />
              <div className={styles.resetBox}>
                <strong>{text.resetTitle}</strong>
                <p className={styles.help}>{text.resetHelp}</p>
                {!confirmReset ? <button type="button" className={styles.deleteButton} onClick={() => setConfirmReset(true)}>{text.reset}</button> : <>
                  <p>{text.resetQuestion}</p>
                  <div className={styles.actions}>
                    <button type="button" className={styles.deleteButton} onClick={() => { update(getDefaultSettings(settings.language)); setConfirmReset(false); setMessage('resetPreview'); }}>{text.confirmReset}</button>
                    <button type="button" className={styles.secondaryButton} onClick={() => setConfirmReset(false)}>{text.keepSettings}</button>
                  </div>
                </>}
              </div>
            </>}
          </fieldset>
        </form>
        {(message || notice || busy) && <p className={styles.message} role="status" aria-live="polite">{busy ? text.readingFile : message ? text[message] : notice}</p>}
        <footer className={styles.footer}>
          <span>{text.previewHint}</span>
          <div className={styles.actions}>
            <button type="button" className={styles.secondaryButton} onClick={close}>{text.cancel}</button>
            <button type="submit" form="settings-form" className={styles.primaryButton} disabled={busy || !editing}>{text.save}</button>
          </div>
        </footer>
      </dialog>
    </>
  );
}
