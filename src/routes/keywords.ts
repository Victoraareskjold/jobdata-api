import { Router } from "express";
import getKeywords from "../controllers/keywordController";

const router = Router();

router.get("/", getKeywords);

export default router;
