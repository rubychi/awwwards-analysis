var capitalizeFirstLetter = null;
var sort = null;
var data = {};
var curKey = "";
var curOrder = "country";
var timestamp = null;
var prevNav = $("#nav-mobile").children().first();
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
    $("#timestamp").text(timestamp + ", " + capitalizeFirstLetter(curKey));
  }
}
$.ajax({
  url: "/awwwards-analysis/data/result (nominees).csv",
}).then(function(d, stat, xhr) {
  timestamp = xhr.getResponseHeader("Last-Modified");
  /* main */
  function analyze(error, nominees, honorable, developer, sotd, sotm, soty) {
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
    data["nominees"] = nominees.map(parseData);
    data["honorable mention"] = honorable.map(parseData);
    data["developer award"] = developer.map(parseData);
    data["site of the day"] = sotd.map(parseData);
    data["site of the month"] = sotm.map(parseData);
    data["site of the year"] = soty.map(parseData);
    curKey = "nominees";
    function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    capitalizeFirstLetter = function(str) {
      return str.replace(/\w\S*/g, function(text) { return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();});
    }
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
    // Add responsive support
    window.addEventListener("resize", function(event) {
      update(data[curKey], false);
    });
    var prevIdx = 0;
    function mousemove(el, data, xScale, yScale, mapXCoordToCountry, mapCountryToIdx) {
      // Invert x coordinate
      var country = mapXCoordToCountry(d3.mouse(el)[0]);
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
            .style("bottom", "-35px")
            .style("left", "-15px");
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
            .style("bottom", "-35px")
            .style("left", "173px");
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
    function update(data, initialize) {
      var width = parseInt(d3.select("#chart").style("width")) - margin.left - margin.right;
      var height = parseInt(d3.select("#chart").style("height")) - margin.top - margin.bottom;
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
            .attr("dx", "170")
            .text(timestamp + ", " + capitalizeFirstLetter(curKey));
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
            .on("mousemove", function () {
              mousemove(this, data, xScale, yScale, mapXCoordToCountry, mapCountryToIdx);
            });
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
            .on("mousemove", function () {
              mousemove(this, data, xScale, yScale, mapXCoordToCountry, mapCountryToIdx);
            });
        prevIdx = 0;
      }
      g.select(".guideline")
          .transition()
          .duration(500)
          .attr("x1", 0)
          .attr("x2", 0);
      d3.select("#tip")
          .transition()
          .duration(500)
          .style("top", yScale(data[0].percentage) + margin.top + tipMargin.top + "px")
          .style("left", xScale(data[0].country) + margin.left + tipMargin.left + "px");
      d3.select("#tipTriangle")
          .style("transform", "rotate(45deg)")
          .transition()
          .duration(50)
          .style("bottom", "-35px")
          .style("left", "-15px");
      d3.select("#country")
          .text(data[0].country);
      d3.select("#percentage")
          .text(data[0].percentage.toFixed(11));
      d3.select("#submission")
          .text(data[0].submission);
      d3.select("#population")
          .text(numberWithCommas(data[0].population));
    }
    // Set up svg
    var svg = d3.select("svg"),
        margin = {
          top: 80,
          right: 80,
          bottom: 135,
          left: 100,
        };
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
    var tipMargin = {
      top: -60,
      left: 10,
    };
    update(data[curKey], true);
  }
  // Read data
  d3.queue()
    .defer(d3.csv, "./data/result (nominees).csv")
    .defer(d3.csv, "./data/result (honorable).csv")
    .defer(d3.csv, "./data/result (developer).csv")
    .defer(d3.csv, "./data/result (sites_of_the_day).csv")
    .defer(d3.csv, "./data/result (sites_of_the_month).csv")
    .defer(d3.csv, "./data/result (sites_of_the_year).csv")
    .await(analyze);
});
