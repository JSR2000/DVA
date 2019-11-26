// initialize the variables
const svg = d3.select('svg');
const width = +svg.attr('width');
const height = +svg.attr('height');

const render = data => {
    const xValue = d => d.year;
    const yValue = d => d.running_total;
    const margin = { top:100, right: 100, bottom: 100, left:100};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    //* e. Add a linear scale (yScale) for y-axis
    const yScale = d3.scaleLinear()
        .domain([d3.max(data,yValue),0])
        .range([0,innerHeight]).nice();

    //* Setup ticks for y-Axis
    const yAxis = d3.axisLeft(yScale)
        .ticks(Math.round(d3.max(data,yValue)/1000+1))
        .tickSize(6)
        .tickPadding(9);

    //* f.Add a time-scale (xScale) for x-axis)
    const xScale = d3.scaleTime()
        .domain([d3.min(data,xValue),d3.max(data,xValue)])
        .range([0,innerWidth])
        .nice();

    //* f.Setup ticks for x-Axis
    const xAxis = d3.axisBottom(xScale)
        .tickSize(6)
        .tickPadding(9)
        .ticks(d3.timeYear.every(3));

    //* Create an SVG group element
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);


    yAxisG = g.append('g').call(yAxis);

    xAxisG = g.append('g').call(xAxis)
        .attr('transform', `translate(0,${innerHeight})`);

    //* b,c & d.Generate Bars
    g.selectAll('rect').data(data)
        .enter().append('rect')
        .attr('y',d => yScale(yValue(d)))
        .attr('x',d => xScale(xValue(d)) - (innerWidth/data.length)/3)
        .attr('width',innerWidth/data.length-3)
        .attr('height',d => innerHeight - yScale(yValue(d)))
        .style('fill', 'steelBlue');

    //* g.Add Title
    g.append('text')
        .attr('class','title')
        .attr('y',-30)
        .attr('x', innerWidth/3)
        .style('font-size', '25px')
        .style('fill', 'darkOrange')
        .text('Lego Sets by Year from Rebrickable');

    //* h.Add the GT id
    g.append('text')
        .attr('class','gtid')
        .attr('x',innerWidth/15*14)
        .attr('y',innerHeight+60)
        .text('jrathour3');

    //* Add the x-label
    g.append('text')
        .attr('class','xlab')
        .attr('x',innerWidth/2)
        .attr('y',innerHeight+60)
        .text('Year');

    //* Add the y-label
    g.append('text')
        .attr('class','ylab')
        .attr('x',-250)
        .attr('y',-70)
        .text('Running Total (Parts)')
        .attr('transform','rotate(270)');
};

//* a. Read input file and load data.
d3.csv('q3.csv').then(data => {
    data.forEach(d => {
        d.year = new Date(`01/01/${d.year}`);
        d.running_total = +d.running_total;
    });
    render(data);
});


