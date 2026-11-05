# Deepak C K — Portfolio 2026

Static site (HTML/CSS/JS). No build step.

- `index.html` — all content
- `css/styles.css` — design tokens (dark + light themes at the top), layout, components, responsive rules
- `js/main.js` — interactions: theme toggle, smooth scroll, GSAP scroll effects, JARVIS loader, cursor, contact form
- `js/vendor/` — GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.13 (bundled locally)
- `images/` — optimized WebP assets (`p-*.webp` = project logos)

Device support
- Desktop / laptop / tablet / phone: full experience.
- Screens under 300px wide (smartwatches, KaiOS keypad phones), browsers without IntersectionObserver or CSS Grid,
  and data-saver mode run in "lite" mode: no loader, smooth scroll or heavy animation, and the animation libraries are not downloaded.

SEO
- `robots.txt`, `sitemap.xml`, `site.webmanifest`, canonical URL and JSON-LD (Person, ProfilePage, WebSite, projects) live at https://deepak-ck.in/.
- `images/og-image.png` is the 1200×630 share preview.
- Crawlers and speed tests (user agents containing bot/crawl/spider/lighthouse/headless) skip the loader.

Run locally: open `index.html`, or `npx serve .`
Deploy: push to GitHub and import in Vercel (framework preset: Other).

Contact form posts to `https://portfolio-backend-yq1y.onrender.com/api/contact/mail` with `{ name, email, message }`.
