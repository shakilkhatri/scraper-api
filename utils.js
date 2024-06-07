import { PdfReader } from "pdfreader";
import axios from "axios";
import clientPromise from "./mongodb.js";
import { ObjectId } from "mongodb";

const databaseName = "db";
const collectionName = "iciciMomentum";

export const parseRecommendationStringsFromOutput = async (data) => {
  let pages = data;
  const newRecStart = pages[1].indexOf("New recommendations");
  const openRecStart = pages[1].indexOf("Open recommendations");
  const scripActionStringStart = pages[1].indexOf("Scrip,Action");
  const disclaimer1start = pages[1].indexOf("Intraday & Positional");
  const disclaimer2start = pages[1].indexOf("Intraday recommendations");
  const disclaimerStart =
    disclaimer1start !== -1 ? disclaimer1start : disclaimer2start;

  console.log("newRecStart:", newRecStart);
  console.log("openRecStart:", openRecStart);
  console.log("scripActionStringStart:", scripActionStringStart);
  console.log("disclaimer1start:", disclaimer1start);
  console.log("disclaimer2start:", disclaimer2start);
  console.log("disclaimerStart:", disclaimerStart);

  let newRecString;
  let openRecString;
  let gladiatorsString = "";

  if (newRecStart !== -1) {
    console.log("New recommendations found");
    if (openRecStart !== -1) {
      console.log("Open recommendations found");
      newRecString = pages[1].slice(newRecStart + 16, openRecStart - 70);
    } else if (disclaimerStart !== -1) {
      console.log("Intraday & Positional found");
      newRecString = pages[1].slice(newRecStart + 16, disclaimerStart - 1);
    }
  }
  if (openRecStart !== -1) {
    console.log("Open recommendations found");
    // if (disclaimerStart !== -1) {
    //   console.log("Intraday & Positional found");
    //   openRecString = pages[1].slice(openRecStart + 21, disclaimerStart - 1);
    // }
    if (scripActionStringStart !== -1) {
      console.log("scrip,Action String found");
      if (scripActionStringStart > openRecStart) {
        openRecString = pages[1].slice(
          openRecStart + 17,
          scripActionStringStart - 1
        );
      } else {
        openRecString = pages[1].slice(openRecStart + 17);
      }
    }
  }

  console.log("new___", newRecString);
  console.log("open___", openRecString);

  for (let index in pages) {
    if (pages[index].indexOf("Gladiators Stocks") !== -1) {
      const start = pages[index].indexOf("Date");
      const end = pages[index].indexOf(
        "All the recommedations are in Cash segment"
      );
      gladiatorsString = pages[index].slice(start, end - 1);
    }
  }

  console.log("gladiators___", gladiatorsString);

  return [newRecString, openRecString, gladiatorsString];
};

export const tableStringToObjects = async (recommendationStrings, type) => {
  const headers_Page1 = [
    "Date",
    "Scrip",
    "iDirectCode",
    "Action",
    "InitiationRange",
    "Target",
    "Stoploss",
    "Duration",
  ];

  const headers_Gladiators = [
    "Date",
    "ScripName",
    "CMP",
    "Strategy",
    "RecommendationsPrice",
    "Target",
    "Stoploss",
    "Timeframe",
  ];

  let headers;

  if (type === "Intraday/Positional") headers = headers_Page1;
  if (type === "Gladiators") headers = headers_Gladiators;

  // Calculate the number of columns
  const numColumns = headers.length;

  // Initialize an array to store the objects
  const recommendations = [];

  if (!recommendationStrings) {
    return [];
  }
  recommendationStrings = recommendationStrings.slice(78).split(",");

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
