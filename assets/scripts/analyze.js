// This is a function
var sort = null;
var data = {};
var curKey = "";
var curOrder = "country";
var timestamp = "";
var isMobileOrTablet = mobileAndTabletcheck();
var prevNav = null;
if (isMobileOrTablet) {
  prevNav = $("#nav-mobile").children().first();
  $("#brand")[0].innerText = "Analysis";
} else {
  prevNav = $("#nav").children().first();
}

// Read data
d3.queue()
  .defer(d3.csv, "./awwwards-analysis/data/timestamp.csv")
  .defer(d3.csv, "./awwwards-analysis/data/result (nominees).csv")
  .defer(d3.csv, "./awwwards-analysis/data/result (honorable).csv")
  .defer(d3.csv, "./awwwards-analysis/data/result (developer).csv")
  .defer(d3.csv, "./awwwards-analysis/data/result (sites_of_the_day).csv")
  .defer(d3.csv, "./awwwards-analysis/data/result (sites_of_the_month).csv")
  .defer(d3.csv, "./awwwards-analysis/data/result (sites_of_the_year).csv")
  .await(analyze);

$(document).ready(function() {
  $(".button-collapse").sideNav();
});

function mobileAndTabletcheck() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function capitalizeFirstLetter(str) {
  return str.replace(/\w\S*/g, function(text) { return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase(); });
}
function sortBtnClickHandler() {
  if (!$.isEmptyObject(data)) {
    curOrder === "percentage" ? curOrder = "country" : curOrder = "percentage";
    sort(data[curKey], curOrder);
  }
}
function navClickHandler(e) {
  if (!$.isEmptyObject(data)) {
    if (prevNav) {
      prevNav.removeClass("active");
    }
    var nav = $(e).parent();
    nav.addClass("active");
    prevNav = nav;
    curKey = e.innerText.toLowerCase();
    curOrder = "country";
    sort(data[curKey], "country");
    $("#timestamp").text(timestamp + capitalizeFirstLetter(curKey));
  }
}
/* main */
function analyze(error, time, nominees, honorable, developer, sotd, sotm, soty) {
  if (error) {
    console.log(error);
  }
  $("#preloader").addClass("hidden");
  $("#tip").removeClass("hidden");
  $("#tipTriangle").removeClass("hidden");
  function parseData(d) {
    return {
      country: d.Country,
      percentage: +d.Percentage,
      submission: +d.Submission,
      population: +d.Population,
    };
  }
  // Remove " (Taipei Standard Time)" from "Mon Aug 14 2017 16:35:04 GMT+0800 (Taipei Standard Time)"
  timestamp = time[0].Timestamp.replace(/\s\(.+\)/, "") + ', ';
  // Construct data
  data["nominees"] = nominees.map(parseData);
  data["honorable mention"] = honorable.map(parseData);
  data["developer award"] = developer.map(parseData);
  data["site of the day"] = sotd.map(parseData);
  data["site of the month"] = sotm.map(parseData);
  data["site of the year"] = soty.map(parseData);
  curKey = "nominees";
  // Set up svg
  var svg = d3.select("svg");
  var width = null;
  var height = null;
  var margin = {
        top: 80,
        right: 80,
        bottom: 140,
        left: 100,
      };
  // Set up tip
  var tipMargin = {};
  var tipTriangleLeft = {};
  var tipTriangleRight = {};
  if (isMobileOrTablet) {
    tipMargin.top = -65;
    tipMargin.left = 11;
    tipTriangleLeft.bottom = "-33px";
    tipTriangleLeft.left = "-5px";
    tipTriangleRight.bottom = "-33px";
    tipTriangleRight.left = "176px";
  } else {
    tipMargin.top = -60;
    tipMargin.left = 10;
    tipTriangleLeft.bottom = "-35px";
    tipTriangleLeft.left = "-15px";
    tipTriangleRight.bottom = "-35px";
    tipTriangleRight.left = "173px";
  }
  var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // Set up gradient color
  var gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");
  gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgb(36,175,192)")
      .attr("stop-opacity", 1);
  gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgb(206,254,226)")
      .attr("stop-opacity", 1);
  $(window).on("resize", function(event) {
    update(data[curKey], false);
  });
  sort = function(data, order) {
    if (order === "country") {
      data = data.sort(function(a, b) {
        if (a.country > b.country) {
          return 1;
        } else if (a.country < b.country) {
          return -1;
        }
        return 0;
      });
    } else {
      data = data.sort(function(a, b) {
        return b.percentage - a.percentage;
      });
    }
    update(data, false);
  }
  function update(data, initialize) {
    width = parseInt(d3.select("#chart").style("width")) - margin.left - margin.right;
    height = parseInt(d3.select("#chart").style("height")) - margin.top - margin.bottom;
    var xScale = d3.scalePoint().domain(data.map(function(d) { return d.country; })).range([0, width]);
    var yScale = d3.scaleLinear().domain(d3.extent(data, function(d) { return d.percentage; })).range([height, 0]);
    // Used for mapping x coordinate to ordinal data
    var mapXCoordToCountry = d3.scaleQuantize().domain(xScale.range()).range(xScale.domain());
    // Used for mapping ordinal data to data index
    var mapCountryToIdx = d3.scaleBand().domain(data.map(function(d) { return d.country; })).range([0, data.length]);
    // Set up area, line, gridline
    var area = d3.area()
        .x(function(d) { return xScale(d.country); })
        .y0(height)
        .y1(function(d) { return yScale(d.percentage); })
        .curve(d3.curveMonotoneX);
    var line = d3.line()
        .x(function(d) { return xScale(d.country); })
        .y(function(d) { return yScale(d.percentage); })
        .curve(d3.curveMonotoneX);
    // Previous mousemove position
    var prevIdx = 0;
    if (initialize) {
      // Draw area
      g.append("path")
          .data([data])
          .attr("class", "area")
          .attr("d", area)
          .style("fill", "url(#gradient)");
      // Draw x-axis
      g.append("g")
          .attr("class", "axis x-axis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(xScale))
          .selectAll("text")
          .attr("class", "x-axis-text")
          .attr("dx", "-0.8em")
          .attr("dy", "0.15em")
          .style("transform", "rotate(-65deg)")
          .style("text-anchor", "end");
      // Remove x-axis domain
      // g.select(".x-axis")
      //     .selectAll(".domain")
      //     .remove();
      // Draw y-axis
      g.append("g")
          .attr("class", "axis y-axis")
          .call(d3.axisLeft(yScale))
          .selectAll("text")
          .attr("class", "y-axis-text")
      // Draw y-axis label
      g.select(".y-axis")
          .append("text")
          .attr("transform", "rotate(-90)")
          .style("text-anchor", "end")
          .attr("y", "-70")
          .text("Percentage (%)");
      g.select(".y-axis")
          .append("text")
          .attr("id", "timestamp")
          .style("text-anchor", "end")
          .attr("y", "-35")
          .attr("dx", "225")
          .text(timestamp + capitalizeFirstLetter(curKey));
      // Draw trendline
      g.append("path")
          .datum(data)
          .attr("class", "trendline")
          .attr("d", line);
      // Draw guideline
      g.append("line")
          .attr("class", "guideline")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", height);
      // Draw circle
      g.selectAll("circle")
          .data(data)
        .enter()
          .append("circle")
          .attr("class", "circle")
          .attr("cx", function(d) { return xScale(d.country); })
          .attr("cy", function(d) { return yScale(d.percentage); })
          .attr("r", 3.5)
          .filter(function(d, i) { return i === 0 })
          .style("fill", "#0f747f")
          .attr("r", 5);
      // Draw a transparent layer for detecting mouse event
      g.append("rect")
          .attr("class", "overlay")
          .attr("width", width)
          .attr("height", height)
          .attr("opacity", 0)
          .on("mousemove", mousemove);
    } else {
      g.select(".area")
          .data([data])
          .transition()
          .duration(500)
          .attr("d", area);
      g.select(".trendline")
          .datum(data)
          .transition()
          .duration(500)
          .attr("d", line);
      // Exit circles
      g.selectAll("circle")
          .data(data)
        .exit()
          .remove();
      // Enter circles
      g.selectAll("circle")
          .data(data)
        .enter()
          .append("circle")
          .attr("class", "circle")
          .attr("r", 3.5);
      // Update circles
      g.selectAll("circle")
          .data(data)
          .style("fill", "white")
          .attr("r", 3.5)
          .transition()
          .duration(500)
          .attr("cx", function(d) { return xScale(d.country); })
          .attr("cy", function(d) { return yScale(d.percentage); })
          .filter(function(d, i) { return i === 0 })
          .style("fill", "#0f747f")
          .attr("r", 5);
      g.selectAll(".x-axis")
          .transition()
          .duration(500)
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(xScale))
          .selectAll("text")
          .attr("class", "x-axis-text")
          .attr("dx", "-0.8em")
          .attr("dy", "0.15em")
          .style("transform", "rotate(-65deg)")
          .style("text-anchor", "end");
          // .selectAll(".domain")
          // .remove();
      // Update x-axis texts
      g.selectAll(".x-axis-text")
          .style("font-size", "10px")
          .filter(function(d, i) { return i === 0 })
          .style("font-size", "12px");
      g.selectAll(".y-axis")
          .transition()
          .duration(500)
          .call(d3.axisLeft(yScale));
      g.select(".overlay")
          .attr("width", width)
          .attr("height", height)
          .on("mousemove", mousemove);
      prevIdx = 0;
    }
    g.select(".guideline")
        .transition()
        .duration(500)
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y2", height);
    d3.select("#tip")
        .transition()
        .duration(500)
        .style("top", yScale(data[0].percentage) + margin.top + tipMargin.top + "px")
        .style("left", xScale(data[0].country) + margin.left + tipMargin.left + "px");
    d3.select("#tipTriangle")
        .style("transform", "rotate(45deg)")
        .transition()
        .duration(50)
        .style("bottom", tipTriangleLeft.bottom)
        .style("left", tipTriangleLeft.left);
    d3.select("#country")
        .text(data[0].country);
    d3.select("#percentage")
        .text(data[0].percentage.toFixed(11));
    d3.select("#submission")
        .text(data[0].submission);
    d3.select("#population")
        .text(numberWithCommas(data[0].population));

    function mousemove() {
      // Invert x coordinate
      var country = mapXCoordToCountry(d3.mouse(this)[0]);
      var x = xScale(country);
      var idx = mapCountryToIdx(country);
      var y = yScale(data[idx].percentage);
      // Calculating the boundary index to rotate the tip
      var xAxisInterval = width / data.length;
      let sum = 0, lastIdx = data.length - 1;
      while(sum < 190) {
        sum += xAxisInterval;
        lastIdx--;
      }
      g.select(".guideline")
          .transition()
          .duration(50)
          .attr("x1", x)
          .attr("x2", x);
      g.selectAll("circle")
          .filter(function(d, i) { return i === prevIdx })
          .transition()
          .duration(50)
          .style("fill", "white")
          .attr("r", 3.5);
      g.selectAll("circle")
          .filter(function(d, i) { return i === idx })
          .transition()
          .duration(50)
          .style("fill", "#0f747f")
          .attr("r", 5);
      g.selectAll(".x-axis-text")
          .filter(function(d, i) { return i === prevIdx })
          .transition()
          .duration(50)
          .style("font-size", "10px");
      g.selectAll(".x-axis-text")
          .filter(function(d, i) { return i === idx })
          .transition()
          .duration(50)
          .style("font-size", "12px");
      if (idx <= lastIdx) {
        d3.select("#tip")
            .transition()
            .duration(50)
            .style("top", y + margin.top + tipMargin.top + "px")
            .style("left", x + margin.left + tipMargin.left + "px");
        d3.select("#tipTriangle")
            .style("transform", "rotate(45deg)")
            .transition()
            .duration(50)
            .style("bottom", tipTriangleLeft.bottom)
            .style("left", tipTriangleLeft.left);
      } else {
        d3.select("#tip")
            .transition()
            .duration(50)
            .style("top", y + margin.top + tipMargin.top + "px")
            .style("left", x - margin.left + "px");
        d3.select("#tipTriangle")
            .style("transform", "rotate(-45deg)")
            .transition()
            .duration(50)
            .style("bottom", tipTriangleRight.bottom)
            .style("left", tipTriangleRight.left);
      }
      d3.select("#country")
          .text(data[idx].country);
      d3.select("#percentage")
          .text(data[idx].percentage.toFixed(11));
      d3.select("#submission")
          .text(data[idx].submission);
      d3.select("#population")
          .text(numberWithCommas(data[idx].population));
      prevIdx = idx;
    }
  }
  update(data[curKey], true);
}
