

var render = (data) => {

    var width = 630; var height = 330; var margin = 70;
    var duration = 250;
    var otherLinesOpacityHover = "0.1";
    var lineStroke = "1.5px";
    var circleOpacity = '0.85';
    var circleOpacityOnLineHover = "0.25"
    var circleRadius = 4;
    var circleRadiusHover = 8;


    var parseDate = d3.timeParse("%Y");
    data.forEach(function(d) {
        d.Region = d.Region
        d.Values.forEach(d => {
            d.Year = parseDate(d.Year)
            d.Total = d.Total
            d.REGION = d.REGION
            d.sValues.forEach(d => {
                d.State = d.State
                d.sCount = d.sCount
            })

        })
    });

    /* Scale */
    var xScale = d3.scaleTime()
        .domain(d3.extent(data[0].Values, d => d.Year))
        .range([0, width-margin]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data[3].Values, d => d.Total)])
        .range([height-margin, 0]);
    var seriesColors = ['#32CD32', 'ff00ff', '#0000ff', '#FF0000'  ]

    var color = d3.scaleOrdinal(seriesColors);
    color.domain(["Midwest", "Northeast", "South", "West"]);

    /* Add SVG */
    var svg = d3.select("#chart1").append("svg")
        .attr("width", (width+margin)+"px")
        .attr("height", (height+margin)+"px")
        .append('g')
        .attr("transform", `translate(${margin}, ${margin})`);

    /* Add line into SVG */
    var line = d3.line()
        .x(d => xScale(d.Year))
        .y(d => yScale(d.Total));

    let lines = svg.append('g')
        .attr('class', 'lines');

    lines.selectAll('.line-group')
        .data(data).enter()
        .append('g')
        .attr('class', 'line-group')
        .append('path')
        .attr('class', 'line')
        .attr('d', d => line(d.Values))
        .style('stroke', (d, i) => color(i))
    ;

    /* Add circles in the line */
    lines.selectAll("circle-group")
        .data(data).enter()
        .append("g")
        .style("fill", (d, i) => color(i))
        .selectAll("circle")
        .data(d => d.Values).enter()
        .append("g")
        .attr("class", "circle")
        .on("mouseover", function(d) {
            d3.select(this)
                .style("cursor", "pointer")
                .append("text")
                .attr("class", "text")
                .text(`${d.Total}`)
                .attr("x", d => xScale(d.Year) + 5)
                .attr("y", d => yScale(d.Total) - 10);
            renderBar(data, d.REGION, d.Year, false);
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .style("cursor", "none")
                .transition()
                .duration(duration)
                .selectAll(".text").remove()

            renderBar(data, d.REGION, d.Year, true);
        })
        .append("circle")
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.Total))
        .attr("r", circleRadius)
        .style('opacity', circleOpacity)
        .style("stroke", "white")
        .style("stroke-width", 2)
        .on("mouseover", function(d) {
            d3.select(this)
                .transition()
                .duration(duration)
                .attr("r", circleRadiusHover);
            // renderBar(data, d.Region, "2012");
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .transition()
                .duration(duration)
                .attr("r", circleRadius)
                .selectAll(".text").remove()
        });


    /* Add Axis into SVG */
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height-margin})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append('text')
        .attr("y", -55)
        .attr("transform", "rotate(-90)")
        .attr("fill", "#000")
        .text("Earthquakes");

    // Title
    svg.append("g")
        .attr("class", "title")
        .append('text')
        .attr("x", width/5)
        .attr("y", -35)
        .text("US Earthquakes by Region 2010-2015")
        .style("font-size", "1em")
        .style("font-weight", "bold");;

    // Legends
    const legendSize = 15;
    svg.selectAll("legend")
        .data(seriesColors)
        .enter()
        .append("circle")
        .attr("cx", 400)
        .attr("cy", function(d,i){
            return i*(legendSize)+1})
        .attr("r", 5)
        .style("fill", d => d)
    ;
    // Legend Labels
    svg.selectAll("labels")
        .data(data)
        .enter()
        .append("text")
        .attr("x", 410)
        .attr("y", function(d,i){
            return i*(legendSize) + (legendSize/2.75)})
        .text(d => d.Region)
        .attr("text-anchor", "right")
        .style("alignment-baseline", "right")
        .style("font-size", ".6em")
        .style("font-weight", "bold");
};

//**********************************************
// Read input data and call render() function:
//**********************************************

d3.csv("state-year-earthquakes.csv")
    .then(function(data) {
        const regions = ["Midwest", "Northeast", "South", "West"];
        const years = ["2010", "2011", "2012", "2013", "2014", "2015"]
        const final = [];

        regions.forEach(REGION =>
        {
            const temp = []
            years.forEach(YEAR =>
            {
                var yearTotal = 0
                var stateData = []
                data.forEach(d =>
                {
                    if (REGION == d.region && YEAR == +d.year)
                    {
                        yearTotal = yearTotal + (+d.count);
                        stateData.push({State: d.state, sCount: +d.count})

                    }
                });
                // Sort states by count
                stateData.sort(function(a,b) {
                    return a.sCount - b.sCount;
                });
                stateData.reverse();
                temp.push({Year:YEAR, Total: yearTotal, sValues: stateData
                    , REGION: REGION})
            })
            final.push({Region:REGION, Values: temp});
        })
        // Call render function to generate the first chart
        render(final);
    });

// renderBar function to Generate the subChart (BarChart)
var renderBar = (data, region, yEar, CLS) => {

    // Delete Chart on MoveOut event and exit
    if (CLS == true)
    {
        d3.select("#chart2").selectAll("*").remove();
        return;
    }

    var parseDate = d3.timeParse("%Y");
    var temp4 = []
    data.forEach(function(d) {
        if (region == d.Region) {
            d.Values.forEach(d => {
                if ((yEar).getTime() == d.Year.getTime()) {
                    d.Year = d.Year
                    d.sValues.forEach(d => {
                        d.State = d.State
                        d.sCount = d.sCount
                        temp4.push({State: d.State, sCount: d.sCount})
                    })
                }
            });
        }
    });

    const xValue = d => d.sCount;
    const yValue = d => d.State;

    // initialize the canvas size
    const width = 760;
    const height = 400;
    const margin = { top:70, right: 90, bottom: 90, left:70};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    //* Add a linear scale (yScale) for y-axis
    const yScale = d3.scaleBand()
        .domain(temp4.map(yValue))
        .range([0,innerHeight]);

    //* Setup ticks for y-Axis
    const yAxis = d3.axisLeft(yScale)
        .tickSize(4)
        .tickPadding(6)
    ;
    //* Add a time-scale (xScale) for x-axis)
    const xScale = d3.scaleLinear()
        .domain(d3.extent(temp4, xValue))
        .range([0,innerWidth])
        .nice()
    ;

    //* Setup ticks for x-Axis
    const xAxis = d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickPadding(6)
        .tickFormat(d3.format("d"))
        .ticks(Math.min(xScale.domain()[1]+1, 8))
    ;

    /* Add SVG */
    var svg2 = d3.select("#chart2").append("svg")
        .attr("width", innerWidth)
        .attr("height", innerWidth)
        .append('g')
        .attr("transform", `translate(${margin.right}, ${margin.left})`);

    const g = svg2.append('g')

    /* Add Axis into SVG */
    yAxisG = g.append('g').call(yAxis)

    xAxisG = g.append('g').call(xAxis)
        .attr('transform', `translate(0,${innerHeight})`);

    // Add bars to chart
    svg2.selectAll('rect').data(temp4)
        .enter().append('rect')
        .attr('y',d => yScale(yValue(d)))
        .attr('width', d => xScale(xValue(d)))
        .attr('height',yScale.bandwidth()-2)
        .style('fill', 'steelBlue');

    var format = d3.timeFormat("%Y")
    // Set the title based on selected region and year
    switch (region) {
        case "Midwest":
            title = "Midwestern Region Earthquakes " + format(yEar);
            break;
        case "Northeast":
            title = "Northeastern Region Earthquakes " + format(yEar)
            break;
        case "South":
            title = "Southern Region Earthquakes " + format(yEar)
            break;
        case "West": {
            title = "Western Region Earthquakes " + format(yEar);
        }
    }
    // Add title
    g.append('text')
        .attr('class','title')
        .attr('y',-30)
        .attr('x', innerWidth/7)
        .style('font-size', '15px')
        .style('fill', 'black')
        .text(title)
        .style("font-weight", "bold");

};


//svg.selectAll("*").remove();
