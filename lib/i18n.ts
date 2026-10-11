export type Language = 'zh-CN' | 'en';

const zh = {
  settings: '设置', settingsTitle: '个性化设置', settingsDescription: '即时预览，保存后在此浏览器保留。',
  closeSettings: '关闭设置并取消修改', settingsCategories: '设置分类',
  general: '基本信息', links: '快捷链接', search: '搜索', appearance: '外观', time: '时间', layout: '布局', data: '配置管理',
  language: '界面语言', title: '首页标题', greeting: '欢迎语', defaultTitle: '我的主页', defaultGreeting: '欢迎来到 hougou', greetingHelp: '留空欢迎语即可隐藏。',
  linksNewTab: '在新标签页打开链接', linksHelp: '使用完整的 http:// 或 https:// 地址，最多 50 个链接。',
  linkNumber: '链接 {number}', moveLinkUp: '上移链接 {number}', moveLinkDown: '下移链接 {number}', deleteLink: '删除链接 {number}',
  delete: '删除', name: '名称', url: '网址', addLink: '＋ 添加链接',
  searchEngine: '默认搜索引擎', baidu: '百度', searchNewTab: '在新标签页显示搜索结果', webSearch: '网页搜索',
  searchWith: '使用 {engine} 搜索', searchPlaceholder: '使用 {engine} 搜索…', searchRequired: '请输入搜索关键词。',
  unnamedLink: '未命名链接', enterUrl: '请输入网址', noLinks: '还没有快捷链接，可以在设置中添加。', noModules: '所有模块已隐藏，可以在设置中重新开启。',
  theme: '主题', dark: '深色', light: '浅色', system: '跟随系统', accentColor: '主题色',
  backgroundUrl: '背景图片地址', localBackgroundPlaceholder: '已使用本地图片，可输入地址替换', uploadBackground: '或选择本地图片', chooseFile: '选择文件',
  imageHelp: '支持 PNG、JPEG、WebP、GIF，最大 1.5 MB。本地图片随配置保存在此浏览器。', removeBackground: '移除背景图片',
  showTime: '显示时间模块', currentTime: '当前时间', hourFormat: '时间格式', hours24: '24 小时制', hours12: '12 小时制',
  showDate: '显示日期和星期', showSeconds: '显示秒数', timeHelp: '时间使用当前设备的时区。',
  cardSize: '快捷链接卡片大小', small: '小', medium: '中', large: '大', layoutHelp: '调整模块顺序，或关闭暂时不需要的模块。',
  moveModuleUp: '上移{module}模块', moveModuleDown: '下移{module}模块',
  dataHelp: '导出当前配置作为备份。导入与恢复默认只修改预览，点击保存后才会覆盖已保存的设置。',
  exportConfig: '导出配置 JSON', importConfig: '导入配置 JSON', resetTitle: '恢复默认设置',
  resetHelp: '还原标题、链接、主题和所有模块配置，保留当前界面语言。', reset: '恢复默认…', resetQuestion: '确定将当前预览恢复为默认设置？',
  confirmReset: '确定恢复', keepSettings: '暂不恢复', previewHint: '修改会即时预览', cancel: '取消', save: '保存设置', readingFile: '正在读取文件…',
  loadFailed: '无法读取已保存的设置，已使用默认配置。你仍可尝试保存。',
  saveFailed: '保存失败：浏览器存储不可用或空间不足，请缩小背景图片后重试。', saved: '设置已保存在此浏览器。',
  imported: '配置已导入预览。点击保存后生效，取消可撤销。', invalidJson: '文件不是有效的 JSON 配置。', importFailed: '导入失败。', configTooLarge: '配置文件不能超过 3 MB。',
  imageTooLarge: '图片不能超过 1.5 MB，请先压缩图片。', imageType: '请选择 PNG、JPEG、WebP 或 GIF 图片。', imageReadFailed: '无法读取此图片，请重新选择。',
  imageUploaded: '背景已加入预览，点击保存以保留。', exported: '已导出当前预览的配置。', exportFailed: '导出失败。', resetPreview: '已恢复默认预览。点击保存以保留。',
  invalidSettings: '设置格式无效。', invalidObject: '配置需要是一个 JSON 对象。', invalidVersion: '不支持此配置版本。', invalidLanguage: '界面语言只能是中文或英文。',
  invalidTitle: '标题不能为空，且最多 80 个字符。', invalidGreeting: '欢迎语最多 200 个字符。', invalidOptions: '主题、卡片大小、搜索引擎或时间格式无效。',
  invalidAccent: '主题色需要使用六位十六进制颜色。', invalidBackground: '背景需使用 HTTP(S) 图片地址，或不超过 1.5 MB 的 PNG、JPEG、WebP、GIF 图片。',
  invalidToggle: '开关配置无效。', invalidModules: '模块顺序需要包含时间、搜索和快捷链接，且不能重复。', invalidVisible: '模块显示配置无效。', invalidVisibleToggle: '模块显示开关无效。',
  tooManyLinks: '快捷链接最多 50 个。', invalidLink: '快捷链接格式无效。', invalidLinkFields: '每个快捷链接需要名称（最多 60 字）和有效的 HTTP(S) 地址。', invalidLinkId: '快捷链接标识不能为空或重复。',
};

export type MessageKey = keyof typeof zh;

const en: Record<MessageKey, string> = {
  settings: 'Settings', settingsTitle: 'Personalize your homepage', settingsDescription: 'Preview changes, then save them in this browser.',
  closeSettings: 'Close settings and discard changes', settingsCategories: 'Settings categories',
  general: 'General', links: 'Quick links', search: 'Search', appearance: 'Appearance', time: 'Time', layout: 'Layout', data: 'Configuration',
  language: 'Interface language', title: 'Homepage title', greeting: 'Welcome message', defaultTitle: 'My Homepage', defaultGreeting: 'Welcome to hougou', greetingHelp: 'Leave the welcome message empty to hide it.',
  linksNewTab: 'Open links in a new tab', linksHelp: 'Use complete http:// or https:// URLs. Up to 50 links.',
  linkNumber: 'Link {number}', moveLinkUp: 'Move link {number} up', moveLinkDown: 'Move link {number} down', deleteLink: 'Delete link {number}',
  delete: 'Delete', name: 'Name', url: 'URL', addLink: '＋ Add link',
  searchEngine: 'Default search engine', baidu: 'Baidu', searchNewTab: 'Open search results in a new tab', webSearch: 'Web search',
  searchWith: 'Search with {engine}', searchPlaceholder: 'Search with {engine}…', searchRequired: 'Enter a search term.',
  unnamedLink: 'Untitled link', enterUrl: 'Enter a URL', noLinks: 'No quick links yet. Add some in Settings.', noModules: 'All modules are hidden. Turn them on in Settings.',
  theme: 'Theme', dark: 'Dark', light: 'Light', system: 'System', accentColor: 'Accent color',
  backgroundUrl: 'Background image URL', localBackgroundPlaceholder: 'Using a local image. Enter a URL to replace it.', uploadBackground: 'Or choose a local image', chooseFile: 'Choose file',
  imageHelp: 'PNG, JPEG, WebP or GIF, up to 1.5 MB. Local images are saved with settings in this browser.', removeBackground: 'Remove background image',
  showTime: 'Show clock module', currentTime: 'Current time', hourFormat: 'Time format', hours24: '24-hour clock', hours12: '12-hour clock',
  showDate: 'Show date and weekday', showSeconds: 'Show seconds', timeHelp: "Uses your device's time zone.",
  cardSize: 'Quick link card size', small: 'Small', medium: 'Medium', large: 'Large', layoutHelp: 'Reorder modules or hide those you do not need.',
  moveModuleUp: 'Move {module} module up', moveModuleDown: 'Move {module} module down',
  dataHelp: 'Export a backup of the current configuration. Imports and resets only change the preview until you save.',
  exportConfig: 'Export configuration JSON', importConfig: 'Import configuration JSON', resetTitle: 'Restore defaults',
  resetHelp: 'Restore the title, links, theme and all modules. Keep the current interface language.', reset: 'Restore defaults…', resetQuestion: 'Restore the current preview to default settings?',
  confirmReset: 'Confirm reset', keepSettings: 'Keep settings', previewHint: 'Changes preview instantly', cancel: 'Cancel', save: 'Save settings', readingFile: 'Reading file…',
  loadFailed: 'Could not read saved settings. Defaults are in use. You can still try saving.',
  saveFailed: 'Could not save: browser storage is unavailable or full. Try a smaller background image.', saved: 'Settings saved in this browser.',
  imported: 'Configuration imported into the preview. Save to keep it, or cancel to undo.', invalidJson: 'The file is not valid configuration JSON.', importFailed: 'Could not import the configuration.', configTooLarge: 'The configuration file must not exceed 3 MB.',
  imageTooLarge: 'The image must not exceed 1.5 MB. Compress it first.', imageType: 'Choose a PNG, JPEG, WebP or GIF image.', imageReadFailed: 'Could not read the image. Choose another file.',
  imageUploaded: 'Background added to the preview. Save to keep it.', exported: 'The current preview configuration has been exported.', exportFailed: 'Could not export the configuration.', resetPreview: 'Defaults restored in the preview. Save to keep them.',
  invalidSettings: 'Invalid settings format.', invalidObject: 'The configuration must be a JSON object.', invalidVersion: 'This configuration version is not supported.', invalidLanguage: 'The interface language must be Chinese or English.',
  invalidTitle: 'The title is required and must not exceed 80 characters.', invalidGreeting: 'The welcome message must not exceed 200 characters.', invalidOptions: 'Invalid theme, card size, search engine or time format.',
  invalidAccent: 'Use a six-digit hexadecimal accent color.', invalidBackground: 'Use an HTTP(S) image URL or a PNG, JPEG, WebP or GIF up to 1.5 MB.',
  invalidToggle: 'Invalid toggle setting.', invalidModules: 'Module order must contain Time, Search and Quick links exactly once.', invalidVisible: 'Invalid module visibility configuration.', invalidVisibleToggle: 'Invalid module visibility toggle.',
  tooManyLinks: 'You can add up to 50 quick links.', invalidLink: 'Invalid quick link format.', invalidLinkFields: 'Each link needs a name (up to 60 characters) and a valid HTTP(S) URL.', invalidLinkId: 'Quick link IDs must be nonempty and unique.',
};

export const messages: Record<Language, Record<MessageKey, string>> = { 'zh-CN': zh, en };

export function formatMessage(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, key: string) => String(values[key] ?? placeholder));
}
