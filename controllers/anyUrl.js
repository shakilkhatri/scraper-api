import axios from "axios";

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
