This is a customizable homepage built with Next.js and React.

## Homepage settings

Open **设置** in the upper-right corner to customize the homepage. Desktop uses a side panel; mobile uses a full-screen panel. Changes preview immediately. **保存设置** validates and saves them; **取消**, the close button, or Escape restores the last saved configuration.

- **基本信息 / General**: Chinese or English interface language, homepage title and welcome message. Language changes preview instantly, apply to all labels, status messages and date/time formatting, and are saved in this browser. Custom titles, welcome messages and link names are preserved. Default titles and welcome messages follow the selected language. Older configurations without a language remain compatible and default to Chinese.
- **快捷链接**: add, edit, delete and reorder up to 50 links; choose whether they open in a new tab.
- **搜索**: Bing, Google or Baidu, with optional results in a new tab.
- **外观**: dark, light or system theme; accent color; background URL or a local PNG, JPEG, WebP or GIF up to 1.5 MB.
- **时间**: show or hide the clock, 12/24-hour format, date and seconds. Uses the device's time zone.
- **布局**: link card size, module visibility and module order.
- **配置管理**: export the current preview as JSON, import a configuration (up to 3 MB), or restore defaults with confirmation. Import and reset require saving to persist.

Settings and uploaded images are stored in this browser's `localStorage` under `my-homepage:settings:v1` for the current site origin. No account, server storage or cross-device sync is used. Clearing site data removes settings; export JSON to keep a backup. Image URLs must point to accessible images. If storage is unavailable or full, saving displays an error and keeps the panel open.

Default settings, validation and search providers live in `lib/settings.ts`. Translations live in `lib/i18n.ts`. `SettingsProvider` manages the saved configuration and preview; `SettingsPanel` provides the editor. Restore defaults keeps the current interface language.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
