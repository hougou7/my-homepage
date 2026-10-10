'use client';

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { defaultSettings, MAX_IMAGE_BYTES, moduleNames, moveItem, parseSettings, searchEngines, type QuickLink, type Settings } from '@/lib/settings';
import { useSettings } from './SettingsProvider';
import styles from './SettingsPanel.module.css';

const sections = {
  general: '基本信息',
  links: '快捷链接',
  search: '搜索',
  appearance: '外观',
  time: '时间',
  layout: '布局',
  data: '配置管理',
};
type Section = keyof typeof sections;

export default function SettingsPanel() {
  const { settings, ready, editing, notice, update, begin, cancel, save } = useSettings();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const operationRef = useRef(0);
  const [section, setSection] = useState<Section>('general');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  function open() {
    operationRef.current += 1;
    setMessage('');
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
    setMessage('');
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
    setMessage('');
    setBusy(true);
    try {
      if (file.size > 3_000_000) throw new Error('配置文件不能超过 3 MB。');
      const imported = parseSettings(JSON.parse(await file.text()));
      if (operation !== operationRef.current) return;
      update(imported);
      setMessage('配置已导入预览。点击保存后生效，取消可撤销。');
    } catch (error) {
      if (operation === operationRef.current) setMessage(error instanceof SyntaxError ? '文件不是有效的 JSON 配置。' : error instanceof Error ? error.message : '导入失败。');
    } finally {
      if (operation === operationRef.current) setBusy(false);
    }
  }

  async function uploadBackground(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const operation = ++operationRef.current;
    setMessage('');
    setBusy(true);
    try {
      if (file.size > MAX_IMAGE_BYTES) throw new Error('图片不能超过 1.5 MB，请先压缩图片。');
      if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
        throw new Error('请选择 PNG、JPEG、WebP 或 GIF 图片。');
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('图片读取失败，请重新选择。'));
        reader.readAsDataURL(file);
      });
      const image = new Image();
      image.src = dataUrl;
      await image.decode();
      if (operation !== operationRef.current) return;
      update({ backgroundImage: dataUrl });
      setMessage('背景已加入预览，点击保存以保留。');
    } catch (error) {
      if (operation === operationRef.current) setMessage(error instanceof Error ? error.message : '无法读取此图片。');
    } finally {
      if (operation === operationRef.current) setBusy(false);
    }
  }

  function exportConfig() {
    setMessage('');
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
      setMessage('已导出当前预览的配置。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '导出失败。');
    }
  }

  return (
    <>
      <button type="button" className={styles.openButton} onClick={open} disabled={!ready} aria-haspopup="dialog">
        <span aria-hidden="true">⚙</span> 设置
      </button>
      <dialog ref={dialogRef} className={styles.panel} aria-labelledby="settings-title" aria-describedby="settings-description" onCancel={(event) => { event.preventDefault(); close(); }}>
        <header className={styles.header}>
          <div>
            <h2 id="settings-title">个性化设置</h2>
            <p id="settings-description">即时预览，保存后在此浏览器保留。</p>
          </div>
          <button type="button" className={styles.iconButton} onClick={close} aria-label="关闭设置并取消修改">×</button>
        </header>
        <nav className={styles.navigation} aria-label="设置分类">
          {(Object.keys(sections) as Section[]).map((key) => (
            <button type="button" key={key} aria-pressed={section === key} onClick={() => { setSection(key); setMessage(''); setConfirmReset(false); }}>{sections[key]}</button>
          ))}
        </nav>

        <form id="settings-form" className={styles.content} onSubmit={submit}>
          <fieldset disabled={busy} className={styles.fields}>
            <legend className={styles.sectionTitle}>{sections[section]}</legend>
            {section === 'general' && <>
              <label className={styles.field}>首页标题
                <input autoFocus type="text" value={settings.title} maxLength={80} required onChange={(event) => update({ title: event.target.value })} />
              </label>
              <label className={styles.field}>欢迎语
                <textarea value={settings.greeting} maxLength={200} rows={3} onChange={(event) => update({ greeting: event.target.value })} />
              </label>
              <p className={styles.help}>留空欢迎语即可隐藏。</p>
            </>}

            {section === 'links' && <>
              <label className={styles.toggle}><span>在新标签页打开链接</span><input type="checkbox" checked={settings.linksNewTab} onChange={(event) => update({ linksNewTab: event.target.checked })} /></label>
              <p className={styles.help}>使用完整的 http:// 或 https:// 地址，最多 50 个链接。</p>
              {settings.quickLinks.map((link, index) => (
                <div key={link.id} className={styles.linkEditor}>
                  <div className={styles.row}>
                    <strong>链接 {index + 1}</strong>
                    <div className={styles.actions}>
                      <button type="button" className={styles.iconButton} disabled={index === 0} aria-label={`上移链接 ${index + 1}`} onClick={() => update({ quickLinks: moveItem(settings.quickLinks, index, -1) })}>↑</button>
                      <button type="button" className={styles.iconButton} disabled={index === settings.quickLinks.length - 1} aria-label={`下移链接 ${index + 1}`} onClick={() => update({ quickLinks: moveItem(settings.quickLinks, index, 1) })}>↓</button>
                      <button type="button" className={styles.deleteButton} aria-label={`删除链接 ${index + 1}`} onClick={() => update({ quickLinks: settings.quickLinks.filter((item) => item.id !== link.id) })}>删除</button>
                    </div>
                  </div>
                  <label className={styles.field}>名称<input value={link.name} maxLength={60} required onChange={(event) => editLink(link.id, { name: event.target.value })} /></label>
                  <label className={styles.field}>网址<input type="url" value={link.url} maxLength={2048} placeholder="https://example.com" required onChange={(event) => editLink(link.id, { url: event.target.value })} /></label>
                </div>
              ))}
              <button type="button" className={styles.secondaryButton} disabled={settings.quickLinks.length >= 50} onClick={() => update({ quickLinks: [...settings.quickLinks, { id: crypto.randomUUID(), name: '', url: '' }] })}>＋ 添加链接</button>
            </>}

            {section === 'search' && <>
              <label className={styles.field}>默认搜索引擎
                <select aria-label="默认搜索引擎" value={settings.searchEngine} onChange={(event) => update({ searchEngine: event.target.value as Settings['searchEngine'] })}>
                  {Object.entries(searchEngines).map(([key, engine]) => <option key={key} value={key}>{engine.name}</option>)}
                </select>
              </label>
              <label className={styles.toggle}><span>在新标签页显示搜索结果</span><input type="checkbox" checked={settings.searchNewTab} onChange={(event) => update({ searchNewTab: event.target.checked })} /></label>
            </>}

            {section === 'appearance' && <>
              <label className={styles.field}>主题
                <select aria-label="主题" value={settings.theme} onChange={(event) => update({ theme: event.target.value as Settings['theme'] })}>
                  <option value="dark">深色</option><option value="light">浅色</option><option value="system">跟随系统</option>
                </select>
              </label>
              <label className={styles.field}>主题色
                <div className={styles.colorField}><input type="color" aria-label="主题色" value={settings.accentColor} onChange={(event) => update({ accentColor: event.target.value })} /><span>{settings.accentColor}</span></div>
              </label>
              <label className={styles.field}>背景图片地址
                <input type="url" value={settings.backgroundImage.startsWith('data:') ? '' : settings.backgroundImage} placeholder={settings.backgroundImage.startsWith('data:') ? '已使用本地图片，可输入地址替换' : 'https://example.com/background.jpg'} onChange={(event) => update({ backgroundImage: event.target.value })} />
              </label>
              <label className={styles.field}>或选择本地图片
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={uploadBackground} />
              </label>
              <p className={styles.help}>支持 PNG、JPEG、WebP、GIF，最大 1.5 MB。本地图片随配置保存在此浏览器。</p>
              {settings.backgroundImage && <button type="button" className={styles.secondaryButton} onClick={() => update({ backgroundImage: '' })}>移除背景图片</button>}
            </>}

            {section === 'time' && <>
              <label className={styles.toggle}><span>显示时间模块</span><input type="checkbox" checked={settings.visible.time} onChange={(event) => update({ visible: { ...settings.visible, time: event.target.checked } })} /></label>
              <label className={styles.field}>时间格式
                <select aria-label="时间格式" value={settings.hourFormat} onChange={(event) => update({ hourFormat: event.target.value as Settings['hourFormat'] })}>
                  <option value="24">24 小时制</option><option value="12">12 小时制</option>
                </select>
              </label>
              <label className={styles.toggle}><span>显示日期和星期</span><input type="checkbox" checked={settings.showDate} onChange={(event) => update({ showDate: event.target.checked })} /></label>
              <label className={styles.toggle}><span>显示秒数</span><input type="checkbox" checked={settings.showSeconds} onChange={(event) => update({ showSeconds: event.target.checked })} /></label>
              <p className={styles.help}>时间使用当前设备的时区。</p>
            </>}

            {section === 'layout' && <>
              <label className={styles.field}>快捷链接卡片大小
                <select aria-label="快捷链接卡片大小" value={settings.cardSize} onChange={(event) => update({ cardSize: event.target.value as Settings['cardSize'] })}>
                  <option value="small">小</option><option value="medium">中</option><option value="large">大</option>
                </select>
              </label>
              <p className={styles.help}>调整模块顺序，或关闭暂时不需要的模块。</p>
              {settings.modules.map((moduleId, index) => (
                <div key={moduleId} className={styles.moduleRow}>
                  <label className={styles.toggle}><span>{moduleNames[moduleId]}</span><input type="checkbox" checked={settings.visible[moduleId]} onChange={(event) => update({ visible: { ...settings.visible, [moduleId]: event.target.checked } })} /></label>
                  <div className={styles.actions}>
                    <button type="button" className={styles.iconButton} disabled={index === 0} aria-label={`上移${moduleNames[moduleId]}模块`} onClick={() => update({ modules: moveItem(settings.modules, index, -1) })}>↑</button>
                    <button type="button" className={styles.iconButton} disabled={index === settings.modules.length - 1} aria-label={`下移${moduleNames[moduleId]}模块`} onClick={() => update({ modules: moveItem(settings.modules, index, 1) })}>↓</button>
                  </div>
                </div>
              ))}
            </>}

            {section === 'data' && <>
              <p className={styles.help}>导出当前配置作为备份。导入与恢复默认只修改预览，点击保存后才会覆盖已保存的设置。</p>
              <button type="button" className={styles.secondaryButton} onClick={exportConfig}>导出配置 JSON</button>
              <label className={styles.field}>导入配置 JSON<input type="file" accept=".json,application/json" onChange={importConfig} /></label>
              <div className={styles.resetBox}>
                <strong>恢复默认设置</strong>
                <p className={styles.help}>还原标题、链接、主题和所有模块配置。</p>
                {!confirmReset ? <button type="button" className={styles.deleteButton} onClick={() => setConfirmReset(true)}>恢复默认…</button> : <>
                  <p>确定将当前预览恢复为默认设置？</p>
                  <div className={styles.actions}>
                    <button type="button" className={styles.deleteButton} onClick={() => { update(defaultSettings); setConfirmReset(false); setMessage('已恢复默认预览。点击保存以保留。'); }}>确定恢复</button>
                    <button type="button" className={styles.secondaryButton} onClick={() => setConfirmReset(false)}>暂不恢复</button>
                  </div>
                </>}
              </div>
            </>}
          </fieldset>
        </form>
        {(message || notice || busy) && <p className={styles.message} role="status" aria-live="polite">{busy ? '正在读取文件…' : message || notice}</p>}
        <footer className={styles.footer}>
          <span>修改会即时预览</span>
          <div className={styles.actions}>
            <button type="button" className={styles.secondaryButton} onClick={close}>取消</button>
            <button type="submit" form="settings-form" className={styles.primaryButton} disabled={busy || !editing}>保存设置</button>
          </div>
        </footer>
      </dialog>
    </>
  );
}
