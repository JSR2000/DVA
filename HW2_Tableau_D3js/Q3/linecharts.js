
// Initialize the variables

var xAxisLabel = "Time";
var yAxisLabel = "Num of Earthquakes";

var seriesColors = ['#900C3F', '#C70039', '#FF5733', '#FFC300'  ]
var color = d3.scaleOrdinal().range(seriesColors);

// render data
var render = (data, g, chart_num, title) => {
    var xValue = d => d.year;
    var max_deaths = d3.max(data, d => d["Estimated Deaths"]);
    color.domain(d3.keys(data[0]).filter(function(key){
        return key!== "year" && key!=="Estimated Deaths";
    }));

    var qRanges = color.domain().map(function(name){
        return {
            name:name,
            values:data.map(function(d){
                return {
                    year: d.year,
                    numOfQuakes:+d[name],
                    estimated_deaths: +d["Estimated Deaths"]
                };
            })
        };
    });

    var xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.year))
        .range([0, innerWidth])
        .nice();
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(qRanges, c => d3.max(c.values, v => v.numOfQuakes))])
        .range([innerHeight, 0])
        .nice();
    if (chart_num == 3){
        yScale = d3.scaleSqrt()
            .domain([0, d3.max(qRanges, c => d3.max(c.values, v => v.numOfQuakes))])
            .range([innerHeight, 0])
            .nice();
    };

    if (chart_num == 4){
        yScale = d3.scaleLog()
            .base(Math.E)
            .clamp(true)
            .domain([Math.exp(0), d3.max(qRanges, c => d3.max(c.values, v => v.numOfQuakes))])
            .range([innerHeight, 0])
            .nice();
    };

    var clipPath = g.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", innerWidth)
        .attr("height", innerHeight);

    var lineGenerator = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.numOfQuakes))
        .curve(d3.curveNatural);

    var xAxis = d3.axisBottom(xScale)
        .tickSize(6)
        .tickPadding(6);

    var yAxis = d3.axisLeft(yScale)
        .tickSize(6)
        .tickPadding(6);

    if (chart_num == 4){
        var yAxis = d3.axisLeft(yScale)
            .tickSize(6)
            .tickPadding(6)
            .tickFormat(d3.format(".2"))

    };

    var legend = g.selectAll("g")
        .data(qRanges)
        .enter()
        .append("g")
        .attr("class","legend");

    legend.append("rect")
        .attr("x", innerWidth-15)
        .attr("y", function(d,i){ return i * 20})
        .attr("width",25)
        .attr("height",15)
        .style("fill", d => color(d.name));

    legend.append("text")
        .attr("x", innerWidth + 20)
        .attr("y", (d,i) => i*20 + 9)
        .text(d => d.name)
        .attr('font-size', "13px")
        .attr("stroke", "black")
        .attr('stroke-size', 3 );

    var qRange = g.selectAll(".qRange")
        .data(qRanges)
        .enter().append("g")
        .attr("class", "qRange");

    qRange.append("path")
        .attr("class", "line-path")
        .attr("d", d => lineGenerator(d.values))
        .style("stroke", d => color(d.name))
        .attr("clip-path", "url(#clip)");

    qRange.append("text")
        .datum(d => {
            return {
                name: d.name,
                value: d.values[d.values.length-1]
            }
        })

    if (chart_num !== 1) {
        qRange.selectAll("circle-group")
            .data(qRanges).enter()
            .append('g')
            .style('fill', d => color(d.name))
            .selectAll("circle")
            .data(d => d.values).enter()
            .append('g')
            .attr("class", "circle")
            .append("circle")
            .attr('cx', d => xScale(d.year))
            .attr('cy', d => yScale(d.numOfQuakes))
            .attr('r', d => (9 * d.estimated_deaths / max_deaths + 3));
    }


    var xAxisG = g.append('g').call(xAxis)
        .attr('transform', `translate(0, ${innerHeight})`);

    xAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('x', innerWidth/2)
        .attr('y', 80)
        .text(xAxisLabel);

    var yAxisG = g.append('g').call(yAxis);

    yAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('x', -innerHeight/2)
        .attr('y', -60)
        .attr('transform', `rotate(-90)`)
        .attr('text-anchor', 'middle')
        .text(yAxisLabel);

    g.append('text')
        .attr('class', 'title')
        .attr('x', innerWidth/7)
        .attr('y', -40)
        .text(title);
};

