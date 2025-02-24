import { Request, RequestHandler, Response } from "express";
import finnScrape from "../services/finnScraper.ts";

interface KeywordQuery {
  source?: string;
  job?: string;
  keywords?: string;
  maxPages?: number;
}

const getKeywords: RequestHandler = async (
  req: Request<{}, {}, {}, KeywordQuery>,
  res: Response
): Promise<void> => {
  try {
    const { source, job, keywords, maxPages = 10 } = req.query;

    if (!source) {
      res.status(400).json({ error: "Missing source parameters" });
    }

    if (!job) {
      res.status(400).json({ error: "Missing job parameter." });
    }

    if (!keywords) {
      res.status(400).json({ error: "Missing keywords parameter." });
      return;
    }

    const maxPagesNumber = maxPages;

    const keywordsArray = keywords.split(",").map((keyword) => keyword.trim());
    let results;

    if (source === "finn.no") {
      results = await finnScrape({
        job: job,
        keywords: keywordsArray,
        maxPages: maxPagesNumber,
      });
    } else if (source === "linkedin") {
      results = { error: "LinkedIn is not implemented yet." };
    } else if (source === "indeed") {
      results = { error: "Indeed is not implemented yet." };
    } else {
      results = { error: "Unknown source." };
    }

    res.json(results);
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

export default getKeywords;
