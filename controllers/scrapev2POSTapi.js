import axios from "axios";

export default async (req, res) => {
  console.log(req.body);
  const { url, payload } = req.body;
  if (!url || !payload) res.send("Something wrong with body!");
  else {
    try {
      const response = await axios.post(url, payload);
      console.log(response.data.data);
      res.status(200).send(response.data.data);
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
        res
          .status(200)
          .send({ status: error.response.status, error: error.response.data });
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        res.status(500).send("No response received from server.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", error.message);
        res.status(500).send("Error setting up request: " + error.message);
      }
    }
  }
};
