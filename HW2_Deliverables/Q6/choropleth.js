const svg = d3.select('svg');
const projection = d3.geoAlbersUsa();
const pathGenerator = d3.geoPath().projection(projection);
const width = +svg.attr('width');
const height = +svg.attr('height');
const g = svg.append('g');

Promise.all([
    d3.csv('state-earthquakes.csv'),
    d3.json('states-10m.json')
]).then(([csvData, topoJASONdata]) => {
    const region = {};
    const count = {};
    const countLog = {};
    const colorSample = {};

    csvData.forEach(d => {

        region[d.States] = d.Region;
        count[d.States] = d["Total Earthquakes"];
        d["Total Earthquakes"] = Math.log((+d["Total Earthquakes"])+1);
        countLog[d.States] = d["Total Earthquakes"];
    });
   // console.log(countLog)

    const states = topojson.feature(topoJASONdata, topoJASONdata.objects.states);

    const colorValue = d => countLog[d.properties.name];
    const colorValue1 = d => region[d.properties.name];

     const colorScale = d3.scaleQuantize()
         .domain(d3.extent(csvData, d=> d["Total Earthquakes"]))
         .range(d3.schemeOrRd[9]);
    //console.log(colorScale.domain())
    g.selectAll('path')
        .data(states.features)
        .enter()
        .append('path')
        .attr('class', 'state')
        .attr('d', pathGenerator)
        .attr('fill', d => colorScale(colorValue(d)))
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut);

    const legendSize = 20;
    svg.selectAll("legend")
        .data(d3.schemeOrRd[9])
        .enter()
        .append("rect")
        .attr("x",925)
        .attr("y",function(d,i){
            return 165 + i*(legendSize + 5)})
        .attr("width", 35)
        .attr("height", 20)
        .style("fill", d => d)
    ;


    svg.selectAll("labels")
        .data(d3.schemeOrRd[9])
        .enter()
        .append("text")
        .attr("x", width - 50 + legendSize * 1.2)
        .attr("y", function(d,i){
            return 173 + i*(legendSize+5) + (legendSize/2.75)})
        .text(d => Math.round(Math.exp(colorScale.invertExtent(d)[0]))-1)
        .attr("text-anchor", "right")
        .style("alignment-baseline", "right")
        .style("font-size", ".70em")
        .style("font-weight", "bold");

    g.append('text')
        .attr('class', 'title')
        .attr('x', 870)
        .attr('y', 150)
        .text("Earthquake Frequency")
        .style("font-size", ".8em")
        .style("font-weight", "bold")
        //.style("stroke", "blue");

    function handleMouseOver(d) {
        const item = Math.round(Math.exp(countLog[d.properties.name]))-1;
        const st = d.properties.name
        const reg = region[d.properties.name]
        const hoverText = `State: ${st}, 
        Region: ${reg}, 
        Earthquakes: ${item}`
        d3.select('#tooltip')
            .style('top', `${d3.event.pageY + 10}px`)
            .style('left', `${d3.event.pageX + 10}px`)
          //.text(`State: ${st}, <br/> Region: ${reg}, Earthquakes: ${item}`)
            .html("<span> State: " + st + "</span> </br>" +
                    "<span> Region: " + reg + "</span> </br>" +
                        "<span> Earthquakes: " + item + "</span>")
            .style('opacity', 0.7)
            .style('visibility', 'visible');
    }

    function handleMouseOut() {
        d3.select('#tooltip')
            .style('opacity', 0) // just to pass ffc tests
            .style('visibility', 'hidden');
    }

});

