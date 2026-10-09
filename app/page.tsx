import styles from './page.module.css'

export default function HomePage() {
  return (
    <main className={styles.homepage}>

      <header className={styles.header}>
        <h1>My Homepage</h1>
        <p>welcome to hougou</p>
      </header>

      <section>
        <h2>search</h2>
        <input type="text" placeholder="click here to search" />
      </section>

      <section className={styles.quicklinkSection}>
        <h2>quick links</h2>
        <div className={styles.quicklinkSectionGrid}>
          <ul>
            <li>
              <a href="chatgpt.com">ChatGPT</a>
            </li>
            <li>
              <a href="https://www.deepseek.com">Deepseek</a>
            </li>
            <li>
              <a href="https://github.com">GitHub</a>
            </li>
            <li>
              <a href="https://www.bilibili.com">BiliBili</a>
            </li>
          </ul>
        </div>
      </section>
    </main>

  )
}