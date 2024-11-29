import { PdfReader } from "pdfreader";
import axios from "axios";
import clientPromise from "./mongodb.js";
import { ObjectId } from "mongodb";

const databaseName = "db";
const collectionName = "iciciMomentum";

export const parseRecommendationStringsFromOutput = async (data) => {
  let pages = data;

  const newRecTarget = "New recommendations";
  const openRecTarget = "Open recommendations";
  const scripActionTarget = "Scrip Name,Action";
  const newRecDisclaimerTarget = "Intraday Index recommendations are";
  const freshRecDisclaimerTarget = "Report on the fresh recommendation";

  let freshRecStart = -1;
  let newRecStart = -1;
  const firstIndexOfNewRec = pages[1].indexOf(newRecTarget);
  const secondIndexOfNewRec = pages[1].indexOf(
    newRecTarget,
    firstIndexOfNewRec + 1
  );
  if (secondIndexOfNewRec !== -1) {
    freshRecStart = firstIndexOfNewRec; // First occurrence
    newRecStart = secondIndexOfNewRec; // Second occurrence
  } else {
    newRecStart = firstIndexOfNewRec; //only occurance
  }
  const openRecStart = pages[1].indexOf(openRecTarget);
  const scripActionStringStart = pages[1].indexOf(scripActionTarget);
  const newRecDisclaimerStart = pages[1].indexOf(newRecDisclaimerTarget);
  const freshRecDisclaimerStart = pages[1].indexOf(freshRecDisclaimerTarget);

  console.log("freshRecStart:", freshRecStart);
  console.log("newRecStart:", newRecStart);
  console.log("openRecStart:", openRecStart);
  console.log("scripActionStringStart:", scripActionStringStart);
  console.log("newRecDisclaimerStart:", newRecDisclaimerStart);
  console.log("freshRecDisclaimerStart:", freshRecDisclaimerStart);

  let freshRecString;
  let newRecString;
  let openRecString;
  let gladiatorsString = "";

  if (freshRecStart !== -1 && freshRecDisclaimerStart !== -1) {
    freshRecString = pages[1].slice(
      freshRecStart + newRecTarget.length + 1, // 1 for comma
      freshRecDisclaimerStart - 1
    );
  }

  if (newRecStart !== -1 && newRecDisclaimerStart !== -1) {
    newRecString = pages[1].slice(
      newRecStart + newRecTarget.length + 1, // 1 for comma
      newRecDisclaimerStart - 1
    );
  }

  if (openRecStart !== -1) {
    if (scripActionStringStart !== -1) {
      if (scripActionStringStart > openRecStart) {
        openRecString = pages[1].slice(
          openRecStart + openRecTarget.length + 1,
          scripActionStringStart - 1
        );
      } else {
        openRecString = pages[1].slice(
          openRecStart + openRecTarget.length + 1,
          -1
        );
      }
    }
  }

  for (let index in pages) {
    if (pages[index].indexOf("Gladiators Stocks") !== -1) {
      const start = pages[index].indexOf("Date");
      const end = pages[index].indexOf(
        "All the recommedations are in Cash segment"
      );
      gladiatorsString = pages[index].slice(start, end - 1);
    }
  }

  console.log("fresh___", freshRecString);
  console.log("new___", newRecString);
  console.log("open___", openRecString);
  console.log("gladiators___", gladiatorsString);

  return [newRecString, openRecString, gladiatorsString];
};

export const tableStringToObjects = async (recommendationStrings) => {
  const indexOfDuration = recommendationStrings.indexOf("Duration");
  const indexOfTimeFrame = recommendationStrings.indexOf("Time Frame");

  let headersEndIndex;

  if (indexOfDuration !== -1) {
    headersEndIndex = indexOfDuration + 8;
  } else if (indexOfTimeFrame !== -1) {
    headersEndIndex = indexOfTimeFrame + 10;
  } else {
    console.log("headersEndIndex not found");
  }

  const headers = recommendationStrings.slice(0, headersEndIndex).split(",");

  // Calculate the number of columns
  const numColumns = headers.length;

  // Initialize an array to store the objects
  const recommendations = [];

  if (!recommendationStrings) {
    return [];
  }
  recommendationStrings = recommendationStrings
    .slice(headersEndIndex + 1)
    .split(",");

  // Iterate through the recommendation strings and convert them into objects
  for (let i = 0; i < recommendationStrings.length; i += numColumns) {
    const recommendationObj = {};
    for (let j = 0; j < numColumns; j++) {
      recommendationObj[headers[j]] = recommendationStrings[i + j];
    }
    recommendations.push(recommendationObj);
  }

  // Print the array of objects
  //   console.log(recommendations);
  return recommendations;
};

export const readPDFtextFromURL = (pdfUrl) => {
  return new Promise((resolve, reject) => {
    axios
      .get(pdfUrl, { responseType: "arraybuffer" })
      .then((response) => {
        if (response.headers["content-type"] !== "application/pdf") {
          resolve({});
          return;
        }
        const pdfBuffer = Buffer.from(response.data);
        const reader = new PdfReader();
        let allData = {};
        let currentPageNumber = 0;
        reader.parseBuffer(pdfBuffer, (err, item) => {
          if (err) {
            reject(err);
            return;
          }
          if (!item) {
            resolve(allData);
          } else if (item.page) {
            currentPageNumber = item.page;
            allData[currentPageNumber] = "";
          } else if (item.text) {
            allData[currentPageNumber] += item.text + ",";
          }
        });
      })
      .catch((error) => {
        console.error("Error fetching or parsing PDF:", error);
        reject(error);
      });
  });
};

export async function updateICICIMomentumMongoDBData(body) {
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);

    const result = await db
      .collection(collectionName)
      .updateOne(
        { _id: new ObjectId("65db630818b229023c335b9e") },
        { $set: body }
      );
    return {
      message: "Item updated successfully",
      body,
    };
  } catch (e) {
    return { error: e.message };
  }
}

export function findNewRecommendations_today(inputString) {
  if (!inputString) {
    return "";
  }
  const start = inputString.indexOf("New recommendations");
  const end = inputString.lastIndexOf("New recommendations");

  if (start !== -1 && end !== -1 && start !== end) {
    return inputString
      .substring(start + "New recommendations".length - 3, end - 1)
      .trim();
  } else {
    return ""; // Return empty string if there are not exactly two occurrences
  }
}

export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}
