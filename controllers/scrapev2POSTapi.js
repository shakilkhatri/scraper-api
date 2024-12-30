import axios from "axios";

export default async (req, res) => {
  console.log(req.body);
  const { url, payload, headers = {} } = req.body; // Default headers to an empty object if not provided

  if (!url || !payload) {
    res.status(400).send("Something wrong with body!");
    return;
  }

  try {
    const response = await axios.post(url, payload, {
      headers,
    });
    // console.log(response.data);
    res.status(200).send(response.data.data);
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error response status:", error.response.status);
      console.error("Error response data:", error.response.data);
      res
        .status(error.response.status)
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
};
