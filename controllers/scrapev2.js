import axios from "axios";
import cheerio from "cheerio";

export default async (req, res) => {
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
