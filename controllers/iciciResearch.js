import {
  parseRecommendationStringsFromOutput,
  tableStringToObjects,
} from "../utils.js";

export const iciciController = async (req, res) => {
  try {
    const [newRecString, openRecString, gladiatorsString] =
      await parseRecommendationStringsFromOutput("/Momentum_Picks.json");

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
      Page1_newRecommendations,
      Page1_openRecommendations,
      gladiators_openRecommendations,
    };
    res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
};
