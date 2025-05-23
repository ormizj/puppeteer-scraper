import puppeteer from "puppeteer";
import type { Browser } from "puppeteer";
import Navigator from "../../elements/Navigator.ts";
import { EnvConfig } from "../../services/EnvConfig.ts";
import LandingPage from "../../pages/LandingPage.ts";

export default class Scraper {
  public run = async () => {
    const browser = await this.initBrowser();
    try {
      const page = await this.initPage(browser);

      // navigate to website
      const navigator = new Navigator(page);
      await navigator.navigateToWebsite();

      // login
      const landingPage = new LandingPage(page);
      await landingPage.login(
        EnvConfig.get("USERNAME"),
        EnvConfig.get("PASSWORD"),
      );
    } finally {
      await browser.close();
    }
  };

  private async initBrowser() {
    const options = EnvConfig.get("DEBUG")
      ? // debug options
        {
          headless: false,
          args: [
            `--window-size=${EnvConfig.get("VIEWPORT_WIDTH")},${EnvConfig.get("VIEWPORT_HEIGHT")}`,
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
      width: EnvConfig.get("VIEWPORT_WIDTH"),
      height: EnvConfig.get("VIEWPORT_HEIGHT"),
    });
    return page;
  }
}
