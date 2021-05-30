

function drawTreemap(data) {

// stratify the data: reformatting for d3.js
//  var root = d3.stratify()
//     .id(function(d) { return d.name; })   // Name of the entity (column name is name in csv)
//     .parentId(function(d) { return d.parent; })   // Name of the parent (column name is parent in csv)
//     (data);

// root.sum(function(d) { return +d.value })   // Compute the numeric value for each entity

var smallFont = "9pt";
var largeFont = "13pt";
var titleFont = "13pt";

var yLowerBuffer = 50;
var yTextBuffer = 5;
var yTitleBuffer = 21;

var root = d3.hierarchy(data).sum(function(d){ return d.value}) // Here the size of each leave is given in the 'value' field in input data



// Then d3.treemap computes the position of each element of the hierarchy
// The coordinates are added to the root object above
d3.treemap()
    .size([tr_size.w, tr_size.h])
    .paddingTop(28)
    .paddingRight(7)
    .paddingInner(3) 
 (root)

// console.log(root.leaves())



if (size.w < 1300) {

    d3.treemap()
    .size([tr_size.w, tr_size.h])
    .paddingTop(15)
    .paddingRight(4)
    .paddingInner(3) 
 (root)

    var smallFont = "0.55rem";
    var largeFont = "0.65rem";
    var titleFont = "0.75rem";
    var yLowerBuffer = 35;
    var yTextBuffer = 5;
    var yTitleBuffer = 10;


}

if (size.w < 546) {

    d3.treemap()
    .size([tr_size.w, tr_size.h])
    .paddingTop(15)
    .paddingRight(4)
    .paddingInner(3) 

    var smallFont = "0.45rem";
    var largeFont = "0.45rem";
    var titleFont = "0.55rem";
    var yLowerBuffer = 28;
    var yTextBuffer = 2;

    

}


let domain = ["appropriations", "education and labor", "labor and human resources",
"the judiciary", "veterans' affairs"]

let colorScale = d3.scaleOrdinal(
    ["#628b92",
    "#978a72",
    "#455541",
    "#614247",
    "#9b8499"])
            .domain(domain);


let opacity = d3.scaleLinear()
    .domain([0, 12])
    .range([.5,1])

// use this information to add rectangles:
tree_svg
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style("stroke", "black")
        // .style("fill", "#96AD88");
        // .attr('fill', (d, i) => {
        //     let x = d;
        //     while(x.depth > 1) {
        //         x = x.parent;
        //     }
        //     return colorScale(x.data.name);
        // });
        .style("fill", function(d){ return colorScale(d.parent.data.name)} )
        .style("opacity", function(d){ return opacity(d.data.value)});
        
        console.log(root.leaves()[0].parent);
        console.log(root.leaves()[1].parent);
        console.log(root.leaves()[2].parent);




// and to add the text labels
tree_svg
    .selectAll("tree-text")
    .data(root.leaves())
    .enter()
    .append("text")
        .classed('tree-text', true)
        .attr("x", function(d){ return d.x0+5})    // + to adjust position (more right)
        .attr("y", function(d){ return d.y0+yTextBuffer})    // + to adjust position (lower)
        .text(function(d){ return d.data.name})
        .attr("font-size", smallFont)
        .attr("fill", "white")
        .call(wrap, 10);

// add numeric values
tree_svg
    .selectAll("tree-num")
    .data(root.leaves())
    .enter()
    .append("text")
        .classed('tree-num', true)
        .attr("x", function(d){ return d.x0+5})    // + to adjust position (more right)
        .attr("y", function(d){ return d.y0+yLowerBuffer})    // + to adjust position (lower)
        .text(function(d){ return d.data.value})
        .attr("font-size", "13pt")
        .attr("font-size", largeFont)
        .attr("fill", "white");
    
// add titles
tree_svg
    .selectAll("tree-titles")
    .data(root.descendants().filter(function(d){return d.depth==1}))
    .enter()
    .append("text")
        .classed('tree-titles', true)
        .attr("x", function(d){ return d.x0})
        .attr("y", function(d){ return d.y0+yTitleBuffer})
        .text(function(d){ return d.data.name })
        .attr("font-size", titleFont)
        .attr("fill",  function(d){ return colorScale(d.data.name)} );


}

function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
}









// function drawTreemap(data) {

//     // Creating a data hierarchy with summed up values
//     // so we can size the rectangles according to the calculated values
//     let hierarchy = d3.hierarchy(data)
//       .sum(d => d.value)
//       .sort((a, b) => b.value - a.value);

//     // Creating a treemap layout
//     // so we can translate our data into a layout
//     let treemap = d3.treemap()
//         .tile(d3.treemapSquarify)
//         // possible tiling values are
//         // d3.treemapSlice, d3.treemapDice, d3.treemapSliceDice
//         // d3.treemapSquarify, d3.treemapBinary
//         .size([size.w, size.h])
//         .padding(1)
//         .round(true)
//         (hierarchy);

//     let domain = treemap.leaves().map(d => {
//         let x = d;
//         while (x.depth > 1) { x = x.parent; }
//         return d.data.name;
//     });
//     domain = new Set(domain);
//     domain = Array.from(domain);

//     let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
//         .domain(domain);

//     const leaf = svg.selectAll('g')
//         .data(treemap.leaves())
//         .join('g')
//         .classed('leaf-node', true)
//         .attr('transform', d => `translate(${d.x0},${d.y0})`)
//         .attr('fill-opacity', 0.7)
//         .style('cursor', d => d.depth > 1 ? 'pointer' : 'auto')
//         .on('mouseenter', hover)
//         .on('mouseout', hoverEnd)
//         .on('click', (event, d) => {
//             if (d.depth <= 1) return;
//             let x = d;
//             while(x.depth > 1) {
//                 x = x.parent;
//             }

//             dispatch.call('updateData', this, x.data.name, data);
//         });

//     leaf.selectAll('rect')
//         .data(d => [d])
//         .join('rect') 
//         .attr('fill', (d, i) => {
//             let x = d;
//             while(x.depth > 1) {
//                 x = x.parent;
//             }
//             return colorScale(x.data.name);
//         })
//         .attr('width', d => d.x1 - d.x0)
//         .attr('height', d => d.y1 - d.y0);

//     leaf.selectAll('text')
//         .data(d => [d])
//         .join('text')
//         .selectAll('tspan')
//         .data(d => {
//             // returning array with 2 objects
//             // one with the name
//             // second with the value
//             // both of these will be used as labels
//             return [
//                 d.data.readableName,
//                 d3.format(',d')(d.value)
//             ];
//         })
//         .join('tspan') // 2 tspans are added, one for each data element
//         .attr('x', 3)
//         .attr('y', (d, i, nodes) => `${1.1 + i * 1.1}em`) // placing both labels one below the other
//         .attr('fill-opacity', (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
//         .text(d => d);
// }

// function hover(event) {
//     let dataEle = d3.select(event.currentTarget).datum();
//     let y = dataEle;
//     while(y.depth > 1) {
//         y = y.parent;
//     }

//     d3.selectAll('g.leaf-node')
//         .attr('fill-opacity', d => {
//             let x = d;
//             while(x.depth > 1) {
//                 x = x.parent;
//             }
//             if (x.data.name === y.data.name) {
//                 return 1;
//             } else {
//                 return 0.7;
//             }
//         })
// }

// function hoverEnd(event) {
//     d3.selectAll('g.leaf-node')
//         .attr('fill-opacity', 0.7);
// }