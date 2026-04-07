import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

// Auto-increment screenshot filename
const screenshotDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

const existing = fs.readdirSync(screenshotDir)
  .filter(f => f.startsWith('screenshot-') && f.endsWith('.png'))
  .map(f => {
    const match = f.match(/^screenshot-(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  });

const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
const filename = label
  ? `screenshot-${next}-${label}.png`
  : `screenshot-${next}.png`;
const outputPath = path.join(screenshotDir, filename);

const PUPPETEER_CACHE = 'C:/Users/nateh/.cache/puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: (() => {
      // Try to find Chrome from the puppeteer cache
      try {
        const dirs = fs.readdirSync(path.join(PUPPETEER_CACHE, 'chrome'));
        for (const d of dirs) {
          const candidates = [
            path.join(PUPPETEER_CACHE, 'chrome', d, 'chrome-win64', 'chrome.exe'),
            path.join(PUPPETEER_CACHE, 'chrome', d, 'chrome-linux', 'chrome'),
            path.join(PUPPETEER_CACHE, 'chrome', d, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'),
          ];
          for (const c of candidates) {
            if (fs.existsSync(c)) return c;
          }
        }
      } catch {}
      return undefined; // fall back to puppeteer bundled
    })(),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait a moment for fonts and animations
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: outputPath, fullPage: true });
  await browser.close();

  console.log(`Screenshot saved: ${outputPath}`);
})();
