import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cron from "node-cron";
import dotenv from "dotenv";

import scrapev1 from "./controllers/scrapev1.js";
import scrapev2 from "./controllers/scrapev2.js";
import google from "./controllers/google.js";
import anyUrl from "./controllers/anyUrl.js";
// import pdfExtract from "./controllers/pdfToText.js";
import {
  iciciMomentumScrapeAndStoreToDB,
  iciciMongoDBRead,
} from "./controllers/iciciResearch.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

const corsOptions = {
  origin: ["https://stock-assistant.vercel.app", "http://localhost:3000"],
  allowedHeaders: ["Content-Type"], // Add the headers you need to allow
  // You can also include other CORS configuration options as needed
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(express.static("public"));

app.get("/", async (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/scrape", scrapev1); // uses params
app.post("/scrapev2", scrapev2); // uses body
app.get("/google", google);
app.post("/url", anyUrl);
// app.post("/pdfToText", pdfExtract);
app.get("/iciciResearch", iciciMomentumScrapeAndStoreToDB);
app.get("/getIciciResearchFromDB", iciciMongoDBRead);

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});

// cron.schedule("30 16 * * *", async () => {
//   console.log("Cron job is running!");
//   await iciciMomentumScrapeAndStoreToDB();
// });
