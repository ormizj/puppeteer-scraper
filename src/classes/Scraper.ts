import puppeteer from "puppeteer";
import type { Browser } from "puppeteer";
import Navigator from "./Navigator.ts";
import { EnvConfig } from "../services/EnvConfig.ts";
import LandingPage from "../pages/LandingPage.ts";
import { sleep } from "../utils/ScraperUtil.ts";
import Dashboard from "../pages/Dashboard.ts";

export default class Scraper {
  run = async () => {
    const browser = await this.initBrowser();
    try {
      // navigator
      const page = await this.initPage(browser);
      const navigator = new Navigator(page);

      // landing page
      await navigator.navigateToLandingPage();
      const landingPage = new LandingPage(page);
      await landingPage.login(
        EnvConfig.APP_WEBSITE_USERNAME(),
        EnvConfig.APP_WEBSITE_PASSWORD(),
      );

      // dashboard
      await navigator.navigateToDashboard();
      const dashboard = new Dashboard(page);
      await dashboard.downloadAll();
    } finally {
      await this.closeBrowser(browser);
    }
  };

  private async initBrowser() {
    const options = EnvConfig.APP_DEBUG()
      ? // debug options
        {
          headless: false,
          args: [
            `--window-size=${EnvConfig.APP_VIEWPORT_WIDTH()},${EnvConfig.APP_VIEWPORT_HEIGHT()}`,
          ],
        }
      : // normal options
        {
          headless: true,
        };

    return await puppeteer.launch(options);
  }

  private async initPage(browser: Browser) {
    const page = await browser.pages().then((e) => e[0]);
    await page.setViewport({
      width: EnvConfig.APP_VIEWPORT_WIDTH(),
      height: EnvConfig.APP_VIEWPORT_HEIGHT(),
    });
    return page;
  }

  private async closeBrowser(browser: Browser) {
    if (EnvConfig.APP_DEBUG()) await sleep(EnvConfig.APP_DEBUG_SLEEP());
    await browser.close();
  }
}
