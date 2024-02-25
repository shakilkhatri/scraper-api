import axios from "axios";
import fs from "fs";

export default async (req, res) => {
  const { url } = req.body;
  console.log(url);
  if (!url) res.send("Something wrong with body!");
  else {
    try {
      axios
        .get(url)
        .then((response) => {
          console.log(response.data);
          //   fs.writeFile(
          //     "response.json",
          //     JSON.stringify(response.data, null, 2),
          //     "utf8",
          //     (err) => {
          //       if (err) {
          //         console.error("An error occurred:", err);
          //       } else {
          //         console.log("Response saved");
          //       }
          //     }
          //   );
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
