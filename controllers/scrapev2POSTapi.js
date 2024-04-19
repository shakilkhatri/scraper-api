import axios from "axios";

export default async (req, res) => {
  console.log(req.body);
  const { url, payload } = req.body;
  if (!url || !payload) res.send("Something wrong with body!");
  else {
    try {
      axios
        .post(url, payload)
        .then((response) => {
          console.log(response.data.data);
          res.send(response.data.data);
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
