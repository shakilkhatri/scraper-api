import axios from "axios";
import cheerio from "cheerio";
import { stringify } from "flatted";

export default async (req, res) => {
  const { url } = req.body;
  if (!url) res.send("Something wrong with body!");
  else {
    try {
      axios
        .get(url)
        .then((response) => {
          console.log(response.data);
          res.send(response.data);
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
