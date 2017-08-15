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
      if (el.children[0].data.toLowerCase() === 'country') {
        let dropDownMenu = $(el).next();
        // Raw html: <a href="/websites/Argentina/" data-count="46">Argentina</a>
        dropDownMenu.find('a').each((i, el) => {
          let key = $(el).text();
          if (result[path].filter(x => x.country === key).length === 0) {
            let data = {};
            key = cnvCtryName(key);
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
        if (data.country === 'Korea (Republic of)') {
          data.country = 'South Korea';
        } else if (data.country === 'Korea (Democratic People\'s Republic of)') {
          data.country = 'North Korea';
        }
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
   * Convert the original country name to fit REST Countries API
   *
   * @param {string} name: The original country name
   * @return {string} The converted name
   */
  function cnvCtryName(name) {
    if (name.indexOf('South Korea') !== -1) {
      name = 'Korea (Republic of)';
    } else if (name.indexOf('U.S.A') !== -1) {
      name = 'USA';
      // 'Macedonia F.Y.R.O' to 'Macedonia'
    } else if (name.indexOf('Macedonia') !== -1) {
      name = 'Macedonia';
    } else if (name.indexOf('Mauritius Island') !== -1) {
      name = 'Mauritius';
    }
    return name;
  }
  /* Create missing parent folder while writing file */
  async function writeFile(path, contents) {
    let err = await mkdirp(getDirName(path));
    if (err) throw err;
    fs.writeFile(path, contents);
  }
})()
