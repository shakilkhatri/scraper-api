import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import scrapev1 from "./scrapev1.js";
import scrapev2 from "./scrapev2.js";
import google from "./google.js";
import anyUrl from "./anyUrl.js";

const app = express();
const port = process.env.PORT || 8000;

const corsOptions = {
  origin: ["https://stock-assistant-6f34.vercel.app", "http://localhost:3000"],
  allowedHeaders: ["Content-Type"], // Add the headers you need to allow
  // You can also include other CORS configuration options as needed
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(express.static("public"));

app.get("/", async (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/scrape", scrapev1);
app.post("/scrapev2", scrapev2);
app.get("/google", google);
app.post("/url", anyUrl);

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
