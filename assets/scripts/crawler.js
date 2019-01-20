let retry = require('async-retry');
let axios = require('axios');
let cheerio = require('cheerio');
let mkdirp = require('mkdirp-promise');
let fs = require('fs');
let getDirName = require('path').dirname;

const AWWWARDS_PAGE = 'https://www.awwwards.com/websites/';
const WORLD_POP_API = 'https://restcountries.eu/rest/v2/name/';
const PATHS = ['nominees', 'honorable', 'sites_of_the_day', 'sites_of_the_month', 'sites_of_the_year', 'developer'];

(async () => {
  PATHS.forEach(async path => {
    // Fetch AWWWARDS website
    let res = null;
    await retry(async () => {  res = await axios.get(`${AWWWARDS_PAGE}${path}`) } );
    let result = {};
    let $ = cheerio.load(res.data);
    result[path] = [];
    $('.name-filter').each((i, el) => {
      if (el.children[0].data.toLowerCase() === 'countries') {
        let dropDownMenu = $(el).next();
        // Raw html: <a href="/websites/Argentina/" data-count="46">Argentina</a>
        dropDownMenu.find('a').each((i, el) => {
          let key = $(el).text();
          if (result[path].filter(x => x.country === key).length === 0) {
            let data = {};
            key = cnvNameForAPI(key);
            // Exclude country which is not in the list of REST Countries API
            if (key !== 'Cape Verde') {
              data.country = key;
              data.submission = $(el).data('count');
              result[path].push(data);
            }
          }
        });
      }
    });
    // Handle exception: calculate the combined result for 'Hong Kong' and 'Macau'
    await retry(async () => {
      let data = result[path].filter(x => x.country === 'Hong Kong - Macau')[0];
      if (data !== undefined) {
        let res = await Promise.all([axios.get(`${WORLD_POP_API}Hong Kong`), axios.get(`${WORLD_POP_API}Macau`)]);
        data.population = res[0].data[0].population + res[1].data[0].population;
        data.percentage = ((data.submission / data.population) * 100);
      }
    });
    // Fetch population for each country from REST Countries API
    await Promise.all(result[path].map(async (item) => {
      let url = `${WORLD_POP_API}${item.country}`;
      // In order to get the correct data for 'India' (not 'British Indian Ocean Territory'),
      // we need to set an additional parameter 'fullText' to be true
      if (item.country === 'India') {
        url = `${WORLD_POP_API}${item.country}?fullText=true`
      }
      if (item.country !== 'Hong Kong - Macau') {
        let res = null;
        await retry(async () => { res = await axios.get(url) });
        data = result[path].filter(x => x.country === item.country)[0];
        data.country = cnvNameForAwwwards(data.country);
        data.population = res.data[0].population;
        data.percentage = ((data.submission / data.population) * 100);
      }
    }));
    // Write result to csv files
    let timestamp = `Timestamp\n${new Date()}\n`;
    writeFile('./temp/data/timestamp.csv', timestamp);
    let csv = 'Country,Percentage,Submission,Population\n';
    let sortedResult = result[path].sort((a, b) => a.country > b.country ? 1 : -1);
    sortedResult.forEach((item, i) => {
      csv += `${item.country},${item.percentage},${item.submission},${item.population}\n`;
    });
    writeFile(`./temp/data/result (${path}).csv`, csv);
  });
  /*
   * Convert the awwwards country name to fit REST Countries API
   *
   * @param {string} name: The awwwards country name
   * @return {string} The converted name
   */
  function cnvNameForAPI(name) {
    switch (name) {
      case 'South Korea': return 'Korea (Republic of)';
      case 'North Korea': return 'Korea (Democratic People\'s Republic of)';
      case 'United States': return 'United States of America';
      case 'Macedonia F.Y.R.O': return 'Macedonia';
      case 'Mauritius Island': return 'Mauritius';
      case 'Réunion': return 'Reunion';
      default: return name;
    }
  }
  /*
   * Convert the country name from REST Countries API back to the awwwards'
   *
   * @param {string} name: The country name from REST Countries API
   * @return {string} The converted name
   */
  function cnvNameForAwwwards(name) {
    switch (name) {
      case 'Korea (Republic of)': return 'South Korea';
      case 'Korea (Democratic People\'s Republic of)': return 'North Korea';
      case 'United States of America': return 'United States';
      case 'Macedonia': return 'Macedonia F.Y.R.O';
      case 'Mauritius': return 'Mauritius Island';
      case 'Reunion': return 'Réunion';
      default: return name;
    }
  }
  /* Create missing parent folder while writing file */
  async function writeFile(path, contents) {
    let err = await mkdirp(getDirName(path));
    if (err) throw err;
    fs.writeFile(path, contents);
  }
})()
