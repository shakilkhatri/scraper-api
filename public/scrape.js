const url = document.getElementById("url");
const selector = document.getElementById("selector");
const output = document.getElementById("output");
const btn = document.getElementById("button");

url.value =
  "https://trendlyne.com/stock-screeners/price-based/top-gainers/week/";
selector.value = "a.stockrow";

const scrapeByParams = (e) => {
  output.innerHTML = "Loading....";

  let endPoint = location.origin + "/scrape";
  let newUrl = endPoint + "?url=" + url.value + "&selector=" + selector.value;
  fetch(newUrl)
    .then((r) => r.text())
    .then((r) => {
      let arr = JSON.parse(r);
      output.innerHTML = arr.map((i) => `<li>${i}</li>`).join("");
    });
};
