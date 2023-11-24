import axios from "axios";
import cheerio from "cheerio";

export default async (req, res) => {
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
          //   console.log(info);
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
};
