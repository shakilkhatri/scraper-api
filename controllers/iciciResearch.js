import clientPromise from "../mongodb.js";
import {
  parseRecommendationStringsFromOutput,
  readPDFtextFromURL,
  tableStringToObjects,
  updateICICIMomentumMongoDBData,
} from "../utils.js";

const databaseName = "db";
const collectionName = "iciciMomentum";

const iciciMomentumPicksUrl =
  "https://www.icicidirect.com/mailimages/Momentum_Picks.pdf";

export const iciciMomentumScrapeAndStoreToDB = async () => {
  try {
    const data = await readPDFtextFromURL(iciciMomentumPicksUrl);

    const [newRecString, openRecString, gladiatorsString] =
      await parseRecommendationStringsFromOutput(data);

    const Page1_newRecommendations = await tableStringToObjects(
      newRecString,
      "Intraday/Positional"
    );
    const Page1_openRecommendations = await tableStringToObjects(
      openRecString,
      "Intraday/Positional"
    );
    const gladiators_openRecommendations = await tableStringToObjects(
      gladiatorsString,
      "Gladiators"
    );

    const response = {
      date: new Date().toLocaleString("en-Gb"),
      Page1_newRecommendations,
      Page1_openRecommendations,
      gladiators_openRecommendations,
    };

    const res = await updateICICIMomentumMongoDBData(response);
    console.log(res);
  } catch (error) {
    console.error(error);
  }
};

export const iciciMongoDBRead = async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);
    const data = await db.collection(collectionName).find({}).toArray();
    res.status(200).send(data[0]);
  } catch (e) {
    res.status(500).send({ error: e.message });
    console.log(e);
  }
};
