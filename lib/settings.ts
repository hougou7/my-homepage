export const STORAGE_KEY = 'my-homepage:settings:v1';
export const MAX_IMAGE_BYTES = 1_500_000;

export const searchEngines = {
  bing: { name: 'Bing', action: 'https://www.bing.com/search', query: 'q' },
  google: { name: 'Google', action: 'https://www.google.com/search', query: 'q' },
  baidu: { name: '百度', action: 'https://www.baidu.com/s', query: 'wd' },
};

export const moduleNames = { time: '时间', search: '搜索', links: '快捷链接' };
export type ModuleId = keyof typeof moduleNames;
export type QuickLink = { id: string; name: string; url: string };

export type Settings = {
  version: 1;
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
  title: 'My Homepage',
  greeting: 'welcome to hougou',
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
  return value === '' || isWebUrl(value) ||
    (value.length <= MAX_IMAGE_BYTES * 1.4 && /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(value));
}

export function parseSettings(value: unknown): Settings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('配置需要是一个 JSON 对象。');
  }
  const input = value as Record<string, unknown>;
  if (input.version !== undefined && input.version !== 1) {
    throw new Error('不支持此配置版本。');
  }
  const merged = { ...defaultSettings, ...input };
  if (typeof merged.title !== 'string' || !merged.title.trim() || merged.title.length > 80) {
    throw new Error('标题不能为空，且最多 80 个字符。');
  }
  if (typeof merged.greeting !== 'string' || merged.greeting.length > 200) {
    throw new Error('欢迎语最多 200 个字符。');
  }
  if (typeof merged.theme !== 'string' || !['dark', 'light', 'system'].includes(merged.theme) ||
    typeof merged.cardSize !== 'string' || !['small', 'medium', 'large'].includes(merged.cardSize) ||
    typeof merged.searchEngine !== 'string' || !Object.hasOwn(searchEngines, merged.searchEngine) ||
    typeof merged.hourFormat !== 'string' || !['12', '24'].includes(merged.hourFormat)) {
    throw new Error('主题、卡片大小、搜索引擎或时间格式无效。');
  }
  if (typeof merged.accentColor !== 'string' || !/^#[0-9a-f]{6}$/i.test(merged.accentColor)) {
    throw new Error('主题色需要使用六位十六进制颜色。');
  }
  if (typeof merged.backgroundImage !== 'string' || !isBackgroundImage(merged.backgroundImage)) {
    throw new Error('背景需使用 HTTP(S) 图片地址，或不超过 1.5 MB 的 PNG、JPEG、WebP、GIF 图片。');
  }
  for (const key of ['searchNewTab', 'linksNewTab', 'showDate', 'showSeconds'] as const) {
    if (typeof merged[key] !== 'boolean') throw new Error('开关配置无效。');
  }
  const moduleIds = Object.keys(moduleNames) as ModuleId[];
  if (!Array.isArray(merged.modules) || merged.modules.length !== moduleIds.length ||
    new Set(merged.modules).size !== moduleIds.length ||
    !merged.modules.every((moduleId) => moduleIds.includes(moduleId))) {
    throw new Error('模块顺序需要包含时间、搜索和快捷链接，且不能重复。');
  }
  if (input.visible !== undefined && (!input.visible || typeof input.visible !== 'object' || Array.isArray(input.visible))) {
    throw new Error('模块显示配置无效。');
  }
  const visible = { ...defaultSettings.visible, ...input.visible as Partial<Settings['visible']> };
  if (!moduleIds.every((moduleId) => typeof visible[moduleId] === 'boolean')) {
    throw new Error('模块显示开关无效。');
  }
  if (!Array.isArray(merged.quickLinks) || merged.quickLinks.length > 50) {
    throw new Error('快捷链接最多 50 个。');
  }
  const usedIds = new Set<string>();
  const quickLinks = merged.quickLinks.map((item: unknown) => {
    if (!item || typeof item !== 'object') throw new Error('快捷链接格式无效。');
    const link = item as Record<string, unknown>;
    if (typeof link.name !== 'string' || !link.name.trim() || link.name.length > 60 ||
      typeof link.url !== 'string' || link.url.length > 2048 || !isWebUrl(link.url)) {
      throw new Error('每个快捷链接需要名称（最多 60 字）和有效的 HTTP(S) 地址。');
    }
    if (typeof link.id !== 'string' || !link.id || link.id.length > 100 || usedIds.has(link.id)) {
      throw new Error('快捷链接标识不能为空或重复。');
    }
    usedIds.add(link.id);
    return { id: link.id, name: link.name.trim(), url: link.url.trim() };
  });
  return {
    version: 1,
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
