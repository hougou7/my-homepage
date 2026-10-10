import styles from './page.module.css'

const quickLinks = [
  { name: 'ChatGPT', url: 'https://chat.openai.com/' },
  { name: 'Deepseek', url: 'https://www.deepseek.com/' },
  { name: 'GitHub', url: 'https://github.com/' },
  { name: 'BiliBili', url: 'https://www.bilibili.com/' }
];

export default function HomePage() {
  return (
    <main className={styles.homepage}>

      <header className={styles.header}>
        <h1>My Homepage</h1>
        <p>welcome to hougou</p>
      </header>

      <section className={styles.searchSection}>
        <h2>Search</h2>
        <form action='https://www.bing.com' method='GET'>
          <input type='search'
            name='q'
            placeholder='Search the web...'
            required
            className={styles.searchInput}
          />
        </form>
      </section>

      <section className={styles.quickLinksSection}>
        <h2>Quick Links</h2>
        <div className={styles.quickLinksSectionGrid}>
          {quickLinks.map((link, index) => (
            <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className={styles.quicklink}>
              <span className={styles.quickLinksMark}>
              {link.name}
              </span>
            </a>
          ))}
            
        </div>
      </section>
    </main>

  )
}