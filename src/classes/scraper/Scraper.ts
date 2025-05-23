import puppeteer from "puppeteer";
import Navigator from "../../elements/Navigator.ts";
import { EnvConfig } from "../../services/EnvConfig.ts";
import LandingPage from "../../pages/LandingPage.ts";

export default class Scraper {
  public static run = async () => {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--fast-start", "--disable-extensions", "--no-sandbox"],
    });
    try {
      // init page
      const page = await browser.newPage();
      await page.setViewport({
        width: EnvConfig.get("VIEWPORT_WIDTH"),
        height: EnvConfig.get("VIEWPORT_HEIGHT"),
      });

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
}
