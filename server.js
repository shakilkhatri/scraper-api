import express from "express";
import axios from "axios";
import cheerio from "cheerio";

const app = express();
const port = 8080;

app.get("/", async (req, res) => {
  const { url, selector } = req.query;

  try {
    axios
      .get(url)
      .then((response) => {
        const $ = cheerio.load(response.data);
        const info = [];

        $(selector).each((index, element) => {
          info.push($(element).text());
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
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
