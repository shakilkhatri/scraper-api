import { PdfReader } from "pdfreader";
import axios from "axios";
import clientPromise from "./mongodb.js";
import { ObjectId } from "mongodb";

const databaseName = "db";
const collectionName = "iciciMomentum";

export const parseRecommendationStringsFromOutput = async (data) => {
  let pages = data;
  const newRecStart = pages[1].indexOf("New recommendations");
  const newRecEnd = pages[1].indexOf("Open recommendations");
  const openRecEnd = pages[1].indexOf("Intraday & Positional");

  if (newRecStart === -1) {
    console.log("New recommendations" + " String not found");
    return;
  }
  if (newRecEnd === -1) {
    console.log("Open recommendations " + " String not found");
    return;
  }
  if (openRecEnd === -1) {
    console.log("Intraday & Positional" + " String not found");
    return;
  }

  const newRecString = pages[1].slice(newRecStart + 20, newRecEnd - 1);
  const openRecString = pages[1].slice(newRecEnd + 21, openRecEnd - 1);
  let gladiatorsString = "";

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

  recommendationStrings = recommendationStrings.slice(74).split(",");

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

export const readPDFtextFromURL = async (pdfUrl) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(pdfUrl, { responseType: "arraybuffer" });
      const pdfBuffer = Buffer.from(response.data);

      // Create a PDFReader instance
      const reader = new PdfReader();

      // Variables to store extracted text and current page number
      let textContent = "";
      let currentPageNumber = 0;
      let allData = {};

      // Parse the PDF buffer
      reader.parseBuffer(pdfBuffer, (err, item) => {
        if (err) {
          console.log(err);
          reject(err); // Reject the promise on error
          return;
        }

        if (!item) {
          // Reached the end of the PDF
          resolve(allData); // Resolve the promise with allData when reading is done
        } else if (item.page) {
          // Update the current page number
          currentPageNumber = item.page;
          allData[currentPageNumber] = ""; // Initialize the page text
        } else if (item.text) {
          // Accumulate text only if it is on the target page
          textContent += "," + item.text;
          allData[currentPageNumber] += "," + item.text;
        }
      });
    } catch (error) {
      console.error("Error fetching or parsing PDF:", error);
      reject(error); // Reject the promise on error
    }
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
