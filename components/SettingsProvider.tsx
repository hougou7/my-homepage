'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { defaultSettings, parseSettings, STORAGE_KEY, type Settings } from '@/lib/settings';

type SettingsContextValue = {
  settings: Settings;
  ready: boolean;
  editing: boolean;
  notice: string;
  update: (changes: Partial<Settings>) => void;
  begin: () => void;
  cancel: () => void;
  save: () => boolean;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState(defaultSettings);
  const [draft, setDraft] = useState(defaultSettings);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        const settings = stored ? parseSettings(JSON.parse(stored)) : defaultSettings;
        setSaved(settings);
        setDraft(settings);
      } catch {
        setNotice('无法读取已保存的设置，已使用默认配置。你仍可尝试保存。');
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function begin() {
    setDraft(saved);
    setNotice('');
    setEditing(true);
  }

  function cancel() {
    setDraft(saved);
    setNotice('');
    setEditing(false);
  }

  function save() {
    let validated: Settings;
    try {
      validated = parseSettings(draft);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '设置格式无效。');
      return false;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    } catch {
      setNotice('保存失败：浏览器存储不可用或空间不足，请缩小背景图片后重试。');
      return false;
    }
    setSaved(validated);
    setDraft(validated);
    setEditing(false);
    setNotice('设置已保存在此浏览器。');
    return true;
  }

  return (
    <SettingsContext.Provider value={{
      settings: editing ? draft : saved,
      ready,
      editing,
      notice,
      update: (changes) => setDraft((current) => ({ ...current, ...changes })),
      begin,
      cancel,
      save,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings 必须在 SettingsProvider 内使用。');
  return context;
}
