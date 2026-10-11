'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { defaultSettings, parseSettings, SettingsValidationError, STORAGE_KEY, type Settings } from '@/lib/settings';
import { messages, type MessageKey } from '@/lib/i18n';

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
  const [notice, setNotice] = useState<MessageKey | null>(null);
  const settings = editing ? draft : saved;

  useEffect(() => {
    document.documentElement.lang = settings.language;
    document.title = settings.title || messages[settings.language].defaultTitle;
  }, [settings.language, settings.title]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        const settings = stored ? parseSettings(JSON.parse(stored)) : defaultSettings;
        setSaved(settings);
        setDraft(settings);
      } catch {
        setNotice('loadFailed');
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function begin() {
    setDraft(saved);
    setNotice(null);
    setEditing(true);
  }

  function cancel() {
    setDraft(saved);
    setNotice(null);
    setEditing(false);
  }

  function save() {
    let validated: Settings;
    try {
      validated = parseSettings(draft);
    } catch (error) {
      setNotice(error instanceof SettingsValidationError ? error.key : 'invalidSettings');
      return false;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    } catch {
      setNotice('saveFailed');
      return false;
    }
    setSaved(validated);
    setDraft(validated);
    setEditing(false);
    setNotice('saved');
    return true;
  }

  return (
    <SettingsContext.Provider value={{
      settings,
      ready,
      editing,
      notice: notice ? messages[settings.language][notice] : '',
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
