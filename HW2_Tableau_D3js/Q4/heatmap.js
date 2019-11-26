(function () {
    var svg = d3.select('svg');
    var init_call = "true";
    const legendColors = d3.schemeReds[9];
    const title = "Visualizing Earthquake Counts State 2010-2015 (M3+)";

    d3.csv("earthquakes.csv")
        .then(function(data) {
            const min_year = 2010;  const max_year = 2015;
            const years = d3.range(min_year, max_year+1)
            const heatData = [];
            data.forEach(d => {
                years.forEach(year => {
                    const States   = d.States;    const Count = +d[year];
                    const Category = d.Category;  const Year= year;
                    const row = {
                        Year, States, Count, Category
                    };
                    heatData.push(row);
                });
            });

            const yValues = d3.set(heatData.map(d => d.Year)).values();
            const selectValues = d3.set(heatData.map(d => d.Category)).values();

            const dropDown = d3.select("#menus")
                .selectAll('magnitude')
                .data(selectValues.sort())
                .enter()
                .append('option')
                .text(d => d)
                .attr("value", d => d)
                .style("left", "10px")
                .style("top", "5px")
            ;

            d3.select("#menus")
                .on("change", function(d){
                    updateMap(this.value);
                })
                ;

            const tooltip = d3.selectAll("#tooltip")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "white")
                .attr("x", "40")
                .attr("y", "120")
                .style("padding", "5px");

            const mouseover = function(d) {
                tooltip
                    .style("opacity", 1);
                d3.select(this)
                    .style("stroke", "black")
                    .style("opacity", 1)
                    ;
            };

            const mousemove = function(d) {
                tooltip
                    .html(d["States"] + " " + d["Year"] + ": "+ d["Count"])
                    .style("left", "10px")
                    .style("top", (d3.mouse(this)[1]) + "px")
                    .style("margin-top", "-2.1em")
                    .style("margin-left", "24em")
                    //.style("font-weight", "bold")
                    .style("font-size", "1em")

            };

            const mouseleave = function(d) {
                tooltip
                    .style("opacity", 0);
                d3.select(this)
                    .style("stroke", "none")
                    .style("opacity", 0.8);
            };

            if (init_call == "true"){
                updateMap("0 to 9");
                init_call = "false";
            }

            function updateMap(selection){
                const updateCategory = heatData.filter(d =>
                    d.Category == selection);
                d3.selectAll("g > *").remove()
                //console.log(updateCategory);
                d3.selectAll("rect").remove();
                d3.selectAll("text").remove();
                var svg = d3.select('svg');
                const legendSize = 20;

                const width = +svg.attr('width');
                const height = +svg.attr('height');
                const margin = {top: 100, right: 100, bottom: 100, left: 100};
                const innerWidth = width - margin.left - margin.right;
                const innerHeight = height - margin.top - margin.bottom;
                const selectValues = d3.set(heatData.map(d => d.Category)).values();
                const g = svg.append('g')
                    .attr('transform', `translate(${margin.left}, ${margin.top})`);

                const yScale = d3.scaleBand()
                    .domain(yValues)
                    .range([0, innerHeight]);

                const yAxis = d3.axisLeft(yScale);

                const yAxisG = g.append('g')
                    .call(yAxis)
                    .style("text-anchor", "end");

                yAxisG.selectAll("text")
                    .style("text-anchor", "end")
                    .attr("x", "-10")
                    .attr("y", "0");

                yAxisG.append('text')
                    .attr('class','title')
                    .attr('x', 45)
                    .attr('y', innerHeight+59)
                    .attr('text-anchor', 'middle')
                    .text("Count")
                    .style('font-size', '1.2em')
                    .style('fill', 'black')
                    .style("font-weight", "bold");

                const color = d3.scaleQuantize()
                    .domain([0, d3.max(updateCategory, d => d.Count)])
                    .range(legendColors);

                var cRange = [];
                color.range().forEach(d => {
                    cRange.push(color.invertExtent(d))
                });

                const xValues = d3.set(updateCategory.map(d => d.States)).values();
                var xScale = d3.scaleBand()
                    .domain(xValues)
                    .range([0, innerWidth]);

                var xAxis = d3.axisBottom(xScale);

                const xAxisG = g.append('g')
                    .call(xAxis)
                    .style('line', 'white');

                xAxisG.selectAll("text")
                    .style("text-anchor", "end")
                    .attr("x", "4")
                    .attr("y", "120")
                    .attr("dx", "-33em")
                    .attr("dy", "3.5em")
                    .attr("transform", "rotate(-65)")
                    .select(".domain").remove();

                svg.selectAll("category")
                    .data(updateCategory)
                    .enter()
                    .append("rect")
                    .attr("x", d => xScale(d.States) + margin.left)
                    .attr("y", d => yScale(d.Year) + margin.top-1)
                    .attr("rx", 4)
                    .attr("ry", 4)
                    .attr("width", xScale.bandwidth()-3)
                    .attr("height", yScale.bandwidth()-3)
                    .style("fill", d => color(d.Count))
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave);

                svg.selectAll("legend")
                    .data(legendColors)
                    .enter()
                    .append("rect")
                    .attr("x",function(d,i){
                        return 120 + i*(legendSize + 20)})
                    .attr("y", innerHeight+165)
                    .attr("width", 40)
                    .attr("height", 20)
                    .style("fill", d => d)
                ;
                svg.selectAll("labels")
                    .data(legendColors)
                    .enter()
                    .append("text")
                    .attr("x",function(d,i){
                        return 120 + i*(legendSize + 20)})
                    .attr("y", innerHeight+200)
                    .text(d => Math.round(color.invertExtent(d)[0]))
                    .attr("text-anchor", "right")
                    .style("alignment-baseline", "right")
                    .style("font-size", ".75em")
                    .style("font-weight", "bold");
            }
        });
}());

