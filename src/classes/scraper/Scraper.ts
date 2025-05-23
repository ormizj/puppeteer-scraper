import puppeteer from "puppeteer";
import Navigator from "../../elements/Navigator";
import { EnvConfig } from "../../services/EnvConfig";
import LandingPage from "../../pages/LandingPage";

export default class Scraper {
  public static run = async () => {
    const browser = await puppeteer.launch();
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
