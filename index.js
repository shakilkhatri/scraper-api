import express from "express";
import axios from "axios";
import cheerio from "cheerio";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.json());

app.use(express.static("public"));

app.get("/", async (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/test", async (req, res) => {
  res.send("Test url");
});

app.get("/scrape", async (req, res) => {
  const { url, selector } = req.query;
  if (!url || !selector) res.send("Something wrong with params!");
  else {
    try {
      axios
        .get(url)
        .then((response) => {
          const $ = cheerio.load(response.data);
          const info = [];

          $(selector).each((index, element) => {
            info.push(
              $(element)
                .text()
                .replace(/\n|\s{2,}/g, "")
                .trim()
            );
          });
          console.log(info);
          res.send(info);
        })
        .catch((error) => {
          console.error(`Error occurred: ${error}`);
        });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred");
    }
  }
});

app.post("/scrapev2", async (req, res) => {
  console.log(req.body);
  const { url, selector } = req.body;
  if (!url || !selector) res.send("Something wrong with body!");
  else {
    try {
      axios
        .get(url)
        .then((response) => {
          const $ = cheerio.load(response.data);
          const info = [];

          $(selector).each((index, element) => {
            info.push(
              $(element)
                .text()
                .replace(/\n|\s{2,}/g, "")
                .trim()
            );
          });
          console.log(info);
          res.send(info);
        })
        .catch((error) => {
          console.error(`Error occurred: ${error}`);
        });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred");
    }
  }
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
