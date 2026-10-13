import { messages, type Language, type MessageKey } from './i18n';

export const STORAGE_KEY = 'my-homepage:settings:v1';
export const MAX_IMAGE_BYTES = 1_500_000;

export const searchEngines = {
  bing: { name: 'Bing', action: 'https://www.bing.com/search', query: 'q' },
  google: { name: 'Google', action: 'https://www.google.com/search', query: 'q' },
  baidu: { name: '百度', action: 'https://www.baidu.com/s', query: 'wd' },
};

export const moduleIds = ['time', 'search', 'links'] as const;
export type ModuleId = typeof moduleIds[number];
export type QuickLink = { id: string; name: string; url: string };

export type Settings = {
  version: 1;
  language: Language;
  title: string;
  greeting: string;
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  backgroundImage: string;
  cardSize: 'small' | 'medium' | 'large';
  searchEngine: keyof typeof searchEngines;
  searchNewTab: boolean;
  linksNewTab: boolean;
  hourFormat: '12' | '24';
  showDate: boolean;
  showSeconds: boolean;
  modules: ModuleId[];
  visible: Record<ModuleId, boolean>;
  quickLinks: QuickLink[];
};

export const defaultSettings: Settings = {
  version: 1,
  language: 'zh-CN',
  title: messages['zh-CN'].defaultTitle,
  greeting: messages['zh-CN'].defaultGreeting,
  theme: 'dark',
  accentColor: '#8495ff',
  backgroundImage: '',
  cardSize: 'medium',
  searchEngine: 'bing',
  searchNewTab: false,
  linksNewTab: true,
  hourFormat: '24',
  showDate: true,
  showSeconds: false,
  modules: ['time', 'search', 'links'],
  visible: { time: true, search: true, links: true },
  quickLinks: [
    { id: 'chatgpt', name: 'ChatGPT', url: 'https://chat.openai.com/' },
    { id: 'deepseek', name: 'Deepseek', url: 'https://www.deepseek.com/' },
    { id: 'github', name: 'GitHub', url: 'https://github.com/' },
    { id: 'bilibili', name: 'BiliBili', url: 'https://www.bilibili.com/' },
  ],
};

export function isWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function isBackgroundImage(value: string): boolean {
  if (value === '' || isWebUrl(value)) return true;

  const prefix = /^data:image\/(?:png|jpeg|webp|gif);base64,/.exec(value)?.[0];
  if (!prefix) return false;

  const encoded = value.slice(prefix.length);
  if (!encoded || encoded.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
    return false;
  }
  const padding = encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0;
  const payloadLength = encoded.length - padding;
  if (payloadLength % 4 === 1 || (padding > 0 && encoded.length % 4 !== 0)) {
    return false;
  }
  const decodedBytes = Math.floor(payloadLength * 3 / 4);
  return decodedBytes <= MAX_IMAGE_BYTES;
}

export class SettingsValidationError extends Error {
  constructor(public readonly key: MessageKey, language: Language = 'zh-CN') {
    super(messages[language][key]);
  }
}

export function getDefaultSettings(language: Language): Settings {
  return { ...defaultSettings, language, title: messages[language].defaultTitle, greeting: messages[language].defaultGreeting };
}

export function changeLanguage(settings: Settings, language: Language): Partial<Settings> {
  const current = messages[settings.language];
  const next = messages[language];
  return {
    language,
    title: settings.title === current.defaultTitle ? next.defaultTitle : settings.title,
    greeting: settings.greeting === current.defaultGreeting ? next.defaultGreeting : settings.greeting,
  };
}

export function parseSettings(value: unknown, errorLanguage?: Language): Settings {
  const language = value && typeof value === 'object' && 'language' in value && value.language === 'en' ? 'en' : 'zh-CN';
  function fail(key: MessageKey): never {
    throw new SettingsValidationError(key, errorLanguage ?? language);
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail('invalidObject');
  }
  const input = value as Record<string, unknown>;
  if (input.version !== undefined && input.version !== 1) {
    fail('invalidVersion');
  }
  const merged = { ...getDefaultSettings(language), ...input };
  if (merged.language !== 'zh-CN' && merged.language !== 'en') fail('invalidLanguage');
  if (input.language === undefined) {
    if (merged.title === 'My Homepage') merged.title = messages['zh-CN'].defaultTitle;
    if (merged.greeting === 'welcome to hougou') merged.greeting = messages['zh-CN'].defaultGreeting;
  }
  if (typeof merged.title !== 'string' || !merged.title.trim() || merged.title.length > 80) {
    fail('invalidTitle');
  }
  if (typeof merged.greeting !== 'string' || merged.greeting.length > 200) {
    fail('invalidGreeting');
  }
  if (typeof merged.theme !== 'string' || !['dark', 'light', 'system'].includes(merged.theme) ||
    typeof merged.cardSize !== 'string' || !['small', 'medium', 'large'].includes(merged.cardSize) ||
    typeof merged.searchEngine !== 'string' || !Object.hasOwn(searchEngines, merged.searchEngine) ||
    typeof merged.hourFormat !== 'string' || !['12', '24'].includes(merged.hourFormat)) {
    fail('invalidOptions');
  }
  if (typeof merged.accentColor !== 'string' || !/^#[0-9a-f]{6}$/i.test(merged.accentColor)) {
    fail('invalidAccent');
  }
  if (typeof merged.backgroundImage !== 'string' || !isBackgroundImage(merged.backgroundImage)) {
    fail('invalidBackground');
  }
  for (const key of ['searchNewTab', 'linksNewTab', 'showDate', 'showSeconds'] as const) {
    if (typeof merged[key] !== 'boolean') fail('invalidToggle');
  }
  if (!Array.isArray(merged.modules) || merged.modules.length !== moduleIds.length ||
    new Set(merged.modules).size !== moduleIds.length ||
    !merged.modules.every((moduleId) => moduleIds.includes(moduleId))) {
    fail('invalidModules');
  }
  if (input.visible !== undefined && (!input.visible || typeof input.visible !== 'object' || Array.isArray(input.visible))) {
    fail('invalidVisible');
  }
  const visible = { ...defaultSettings.visible, ...input.visible as Partial<Settings['visible']> };
  if (!moduleIds.every((moduleId) => typeof visible[moduleId] === 'boolean')) {
    fail('invalidVisibleToggle');
  }
  if (!Array.isArray(merged.quickLinks) || merged.quickLinks.length > 50) {
    fail('tooManyLinks');
  }
  const usedIds = new Set<string>();
  const quickLinks = merged.quickLinks.map((item: unknown) => {
    if (!item || typeof item !== 'object') fail('invalidLink');
    const link = item as Record<string, unknown>;
    if (typeof link.name !== 'string' || !link.name.trim() || link.name.length > 60 ||
      typeof link.url !== 'string' || link.url.length > 2048 || !isWebUrl(link.url)) {
      fail('invalidLinkFields');
    }
    if (typeof link.id !== 'string' || !link.id || link.id.length > 100 || usedIds.has(link.id)) {
      fail('invalidLinkId');
    }
    usedIds.add(link.id);
    return { id: link.id, name: link.name.trim(), url: link.url.trim() };
  });
  return {
    version: 1,
    language: merged.language,
    title: merged.title.trim(),
    greeting: merged.greeting,
    theme: merged.theme,
    accentColor: merged.accentColor,
    backgroundImage: merged.backgroundImage,
    cardSize: merged.cardSize,
    searchEngine: merged.searchEngine,
    searchNewTab: merged.searchNewTab,
    linksNewTab: merged.linksNewTab,
    hourFormat: merged.hourFormat,
    showDate: merged.showDate,
    showSeconds: merged.showSeconds,
    modules: [...merged.modules],
    visible: { time: visible.time, search: visible.search, links: visible.links },
    quickLinks,
  };
}

export function moveItem<Item>(items: Item[], index: number, direction: -1 | 1): Item[] {
  const target = index + direction;
  if (index < 0 || index >= items.length || target < 0 || target >= items.length) return items;
  const reordered = [...items];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  return reordered;
}
