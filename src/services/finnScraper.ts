import puppeteer from "puppeteer";

interface ScrapeQuery {
  job?: string;
  keywords?: string[];
  maxPages?: number;
}

const finnScrape = async ({ job, keywords, maxPages = 10 }: ScrapeQuery) => {
  if (!job) throw new Error("Job is undefined.");
  if (!keywords || keywords.length === 0) {
    throw new Error("Missing keywords");
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const baseUrl = `https://www.finn.no/job/fulltime/search.html?q=${encodeURIComponent(
    job
  )}`;

  let currentPage = 1;
  let totalJobLinks: string[] = [];

  while (currentPage <= maxPages) {
    const url = `${baseUrl}&page=${currentPage}`;
    await page.goto(url);
    await page.waitForSelector(".sf-search-ad-link", { timeout: 60000 });

    const jobLinks: string[] = await page.evaluate(() => {
      const links: string[] = [];
      document
        .querySelectorAll(".sf-search-ad-link")
        .forEach((element) => links.push((element as HTMLAnchorElement).href));
      return links;
    });

    console.log(
      `Finn.no: Funnet ${jobLinks.length} jobbannonser på side ${currentPage} for kategori "${job}"`
    );

    if (jobLinks.length === 0) {
      break;
    }

    totalJobLinks = [...totalJobLinks, ...jobLinks];
    currentPage++;
  }

  console.log(`Totalt funnet ${totalJobLinks.length} annonser!`);

  const totalCounts: Record<string, number> = {};
  keywords.forEach((keyword) => {
    totalCounts[keyword] = 0;
  });

  console.log(`Sjekker etter nøkkelord: ${keywords.join(", ")}`);

  for (let link of totalJobLinks) {
    const jobPage = await browser.newPage();
    await jobPage.goto(link);

    await jobPage.waitForSelector("h1");

    const pageText = await jobPage.evaluate(() => document.body.innerText);
    const lowerText = pageText.toLowerCase();

    for (let keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        totalCounts[keyword] += 1;
      }
    }
    console.log(`For annonse ${link}:`, totalCounts);

    await jobPage.close();
  }

  await browser.close();
  return {
    source: "finn.no",
    job,
    totalAds: totalJobLinks.length,
    counts: totalCounts,
  };
};

export default finnScrape;
