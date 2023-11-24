import axios from "axios";
import cheerio from "cheerio";

export default async (req, res) => {
  const { query } = req.query;
  if (!query) res.send("Something wrong with params!");
  else {
    try {
      axios
        .get("https://www.google.com/search?q=" + query.replace(" ", "+"))
        .then((response) => {
          const $ = cheerio.load(response.data);
          const info = [];

          $("a").each((index, element) => {
            info.push($(element).attr("href"));
          });
          //   console.log(info);
          res.send(
            info
              .filter((str) => str.slice(0, 7) === "/url?q=")
              .map((str) => str.slice(7).split("&sa=")[0].split("%3F")[0])
          );
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
