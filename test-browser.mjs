import { chromium } from 'playwright';

(async () => {
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
        page.on('pageerror', err => console.error('BROWSER_ERROR:', err.message));
        page.on('request', req => console.log('REQ:', req.url()));
        page.on('response', res => console.log('RES:', res.url(), res.status()));

        await page.goto('http://localhost:3000');
        // Also log the HTML content to see if it even has the root div
        const html = await page.content();
        console.log('HTML_BODY:', html.substring(0, 500));

        await page.waitForTimeout(2000);
        await browser.close();
    } catch (e) {
        console.error('SCRIPT_ERROR:', e);
    }
})();
