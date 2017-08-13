let axios = require('axios');
let cheerio = require('cheerio');
let fs = require('fs');

const AWWWARDS_PAGE = 'https://www.awwwards.com/websites/';
const WORLD_POP_API = 'https://restcountries.eu/rest/v2/name/';
const PATHS = ['nominees', 'honorable', 'sites_of_the_day', 'sites_of_the_month', 'sites_of_the_year', 'developer'];

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

/* Main */
(async function() {
  for (let path of PATHS) {
    // Fetch raw AWWWARDS website
    let res = await axios.get(`${AWWWARDS_PAGE}${path}`);
    if (res.status === 200) {
      let $ = cheerio.load(res.data);
      let result = [];
      $('.name-filter').each((i, el) => {
        if (el.children[0].data.toLowerCase() === 'country') {
          let dropDownMenu = $(el).next();
          // Raw html: <a href="/websites/Argentina/" data-count="46">Argentina</a>
          dropDownMenu.find('a').each((i, el) => {
            let key = $(el).text();
            if (result.filter(x => x.country === key).length === 0) {
              let data = {};
              key = cnvCtryName(key);
              // Exclude country which is not in the list of REST Countries API
              if (key !== 'Cape Verde') {
                data.country = key;
                data.submission = $(el).data('count');
                result.push(data);
              }
            }
          });
        }
      });
      // Handle exception: calculate the combined result for 'Hong Kong' and 'Macau'
      let data = result.filter(x => x.country === 'Hong Kong - Macau')[0];
      if (data !== undefined) {
        let resHK = await axios.get(`${WORLD_POP_API}Hong Kong`);
        let resMC = await axios.get(`${WORLD_POP_API}Macau`);
        data.population = resHK.data[0].population + resMC.data[0].population;
        data.percentage = ((data.submission / data.population) * 100);
      }
      // Fetch population for each country from REST Countries API
      await Promise.all(result.map(async (item) => {
        let url = `${WORLD_POP_API}${item.country}`;
        // In order to get the correct data for 'India' (not 'British Indian Ocean Territory'),
        // we need to set an additional parameter 'fullText' to be true
        if (item.country === 'India') {
          url = `${WORLD_POP_API}${item.country}?fullText=true`
        }
        if (item.country !== 'Hong Kong - Macau') {
          let res = await axios.get(url);
          data = result.filter(x => x.country === item.country)[0];
          data.population = res.data[0].population;
          data.percentage = ((data.submission / data.population) * 100);
        }
      }));

      // Write result to csv files
      let csv = `${new Date()}\n`;
      csv += 'Country,Percentage,Submission,Population\n';
      let sortedResult = result.sort((a, b) => b.percentage - a.percentage);
      sortedResult.forEach((item, i) => {
        csv += `${item.country},${item.percentage},${item.submission},${item.population}\n`;
      });
      fs.writeFile(`result (${path}).csv`, csv);
    }
  }
})()
