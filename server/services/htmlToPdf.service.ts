import path from "path";
import puppeteer from "puppeteer";

export const HtmlToPdf = async (template: string) => {
  try {
    const fileName = new Date().getTime();
    const fileExtension = "pdf";

    const browser = await puppeteer.launch({
      // executablePath:
      //   ".cache/puppeteer/chrome/win64-122.0.6261.111/chrome-win64/chrome.exe",
      // args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });
    console.log({ browser });
    const page = await browser.newPage();
    await page.setContent(template);

    await page.emulateMediaType("screen");

    // Downlaod the PDF
    const pdf = await page.pdf({
      path: `server/public/invoice/${fileName}.${fileExtension}`,

      printBackground: true,
    });

    console.log({ pdf });

    await browser.close();
    return pdf;
  } catch (error) {
    console.log({ error });
    throw new Error("Could not generate pdf");
  }
};
