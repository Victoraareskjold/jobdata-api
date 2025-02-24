import express from "express";
import keywordsRoutes from "./routes/keywords.ts";

const app = express();

app.use(express.json());

// /api/keywords?source=finn.no&job=frontend+utvikler&keywords=html,css,javascript,python,typescript&maxPages=1
app.use("/api/keywords", keywordsRoutes);

export default app;
