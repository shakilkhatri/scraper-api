import { readPDFtextFromURL } from "../utils.js";

const pdfUrlToText = async (req, res) => {
  const { url } = req.query;
  try {
    const text = await readPDFtextFromURL(url);
    res.status(200).send(text);
  } catch (error) {
    res.status(500).send(error);
  }
};

export default pdfUrlToText;
