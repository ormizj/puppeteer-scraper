import puppeteer from "puppeteer";

const main = async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL.
  await page.goto("https://pixai.art/");

  // Set screen size.
  await page.setViewport({ width: 1920, height: 1080 });

  // Locate the full title with a unique string.
  const textSelector = await page.locator(".calculatorTitle").waitHandle();
  const fullTitle = await textSelector?.evaluate((el) => el.textContent);

  // Print the full title.
  console.log('The title of this blog post is "%s".', fullTitle);
  await browser.close();
};
main().then();
