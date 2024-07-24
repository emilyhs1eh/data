// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
// import RiTa from "https://cdn.jsdelivr.net/npm/rita@2.8.31/+esm";
// import Sentiment from "https://cdn.jsdelivr.net/npm/sentiment@5.0.2/+esm";

// const sentiment = new Sentiment();

// const fetchData = async () => {
//   const text = await d3.text("/text/Frankenstein.txt");
//   return text;
// };

// const processText = (text) => {
//   const tokens = RiTa.tokenize(text);
//   console.log(tokens);

//   const groupedData = d3.rollup(
//     tokens,
//     (v) => {
//       const word = v[0];
//       const score = sentiment.analyze(word).score;
//       let sentimentLabel = 'neutral'; 

//       if (score > 0) {
//         sentimentLabel = 'positive';
//       } else if (score < 0) {
//         sentimentLabel = 'negative';
//       }

//       return {
//         word: word,
//         quantity: v.length,
//         sentiment: sentimentLabel, 
//       };
//     },
//     (d) => d.toUpperCase()
//   );

// console.log(groupedData);

// const textColor = d3.scaleOrdinal()
//   .domain(['negative', 'neutral', 'positive'])
//   .range(['red', 'gray', 'green']);

// const app = d3.select('#app'); // Assuming there is an element with id 'app' in your HTML

// const spans = app.selectAll('span')
//   .data(tokens)
//   .join('span')
//   .html((d) => d)
//   .style('padding', '3px')
//   .style('color', (d) => {
//     const index = d.toUpperCase();
//     const properties = groupedData.get(index);
//     const color = textColor(properties.sentiment);
//     return color;
//   });

// };

// const main = async () => {
//   const data = await fetchData();
//   processText(data);
// };

// main();




import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import RiTa from "https://cdn.jsdelivr.net/npm/rita@2.8.31/+esm";
import Sentiment from "https://cdn.jsdelivr.net/npm/sentiment@5.0.2/+esm";

const sentiment = new Sentiment();

const fetchData = async () => {
  const text = await d3.text("/text/Frankenstein.txt");
  return text;
};

const processText = async (text) => {
  const tokens = RiTa.tokenize(text);

  const countryRegex = /\b(?:Afghanistan|Albania|Algeria|Andorra|Angola|Antigua and Barbuda|Argentina|Armenia|Australia|Austria|Azerbaijan|Bahamas|Bahrain|Bangladesh|Barbados|Belarus|Belgium|Belize|Benin|Bhutan|Bolivia|Bosnia and Herzegovina|Botswana|Brazil|Brunei|Bulgaria|Burkina Faso|Burundi|Cabo Verde|Cambodia|Cameroon|Canada|Central African Republic|Chad|Chile|China|Colombia|Comoros|Congo|Costa Rica|Croatia|Cuba|Cyprus|Czech Republic|Democratic Republic of the Congo|Denmark|Djibouti|Dominica|Dominican Republic|East Timor|Ecuador|Egypt|El Salvador|Equatorial Guinea|Eritrea|Estonia|Eswatini|Ethiopia|Fiji|Finland|France|Gabon|Gambia|Georgia|Germany|Ghana|Greece|Grenada|Guatemala|Guinea|Guinea-Bissau|Guyana|Haiti|Honduras|Hungary|Iceland|India|Indonesia|Iran|Iraq|Ireland|Israel|Italy|Ivory Coast|Jamaica|Japan|Jordan|Kazakhstan|Kenya|Kiribati|Kosovo|Kuwait|Kyrgyzstan|Laos|Latvia|Lebanon|Lesotho|Liberia|Libya|Liechtenstein|Lithuania|Luxembourg|Madagascar|Malawi|Malaysia|Maldives|Mali|Malta|Marshall Islands|Mauritania|Mauritius|Mexico|Micronesia|Moldova|Monaco|Mongolia|Montenegro|Morocco|Mozambique|Myanmar|Namibia|Nauru|Nepal|Netherlands|New Zealand|Nicaragua|Niger|Nigeria|North Korea|North Macedonia|Norway|Oman|Pakistan|Palau|Palestine|Panama|Papua New Guinea|Paraguay|Peru|Philippines|Poland|Portugal|Qatar|Romania|Russia|Rwanda|Saint Kitts and Nevis|Saint Lucia|Saint Vincent and the Grenadines|Samoa|San Marino|Sao Tome and Principe|Saudi Arabia|Senegal|Serbia|Seychelles|Sierra Leone|Singapore|Slovakia|Slovenia|Solomon Islands|Somalia|South Africa|South Korea|South Sudan|Spain|Sri Lanka|Sudan|Suriname|Sweden|Switzerland|Syria|Taiwan|Tajikistan|Tanzania|Thailand|Togo|Tonga|Trinidad and Tobago|Tunisia|Turkey|Turkmenistan|Tuvalu|Uganda|Ukraine|United Arab Emirates|United Kingdom|United States|Uruguay|Uzbekistan|Vanuatu|Vatican City|Venezuela|Vietnam|Yemen|Zambia|Zimbabwe)\b/g;
  const countries = tokens.filter(token => countryRegex.test(token));

  let countryCounts = {}; // Object to store country counts

  tokens.forEach(token => {
    if (countries.includes(token)) {
      countryCounts[token] = (countryCounts[token] || 0) + 1;
    }
  });

  // Convert country counts object to array of objects for D3 pie chart
  const pieData = Object.entries(countryCounts).map(([country, count]) => ({ country, count }));

  // Create Pie chart using D3.js
  const width = 700;
  const height = 700;

  // Select the middle of the screen for the chart
  const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const radius = Math.min(width, height) / 2 - 40;



  // Define custom colors
  const customColors = ['#F3F3EB', '#C59288', '#CCBFA1', '#C26040','#A0B3AA','#E0CBD1'];

  const color = d3.scaleOrdinal()
    .domain(pieData.map(d => d.country))
    .range(customColors);

  const pie = d3.pie()
    .value(d => d.count);

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  const arcs = svg.selectAll("arc")
    .data(pie(pieData))
    .enter()
    .append("g")
    .attr("class", "arc");

  arcs.append("path")
    .attr("d", arc)
    .attr("fill", (d, i) => color(i))
    .attr("stroke", "#fff")
    .attr("stroke-width", "3px")
    .attr("opacity", 0.8) 



  // Add hover effect
  arcs.on("mouseover", function (d) {
      d3.select(this)
        .attr("opacity", 1)
        .attr("transform", `scale(1.1)`);
    })
    .on("mouseout", function (d) {
      d3.select(this)
        .attr("opacity", 0.7)
        .attr("transform", `scale(1)`);
    });


  // Add angled country names with number counts
  arcs.append("text")
    .attr("transform", d => `translate(${arc.centroid(d)}) rotate(${(d.startAngle + d.endAngle) * 90 / Math.PI - 90})`)
    .attr("dy", "0.35em")
    .attr("font-size", "12px")
    .attr("text-anchor", d => (d.endAngle + d.startAngle) / 2 > Math.PI ? "end" : "start")
    .text(d => `${d.data.country}: ${d.data.count}`);


  // Display country counts in console
  console.log("Country Counts:");
  console.table(countryCounts);
};

const main = async () => {
  const data = await fetchData();
  await processText(data);
};



main();