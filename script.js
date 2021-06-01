const margins = {t: 50, r: 50, b: 50, l: 50};

const size = {w: window.innerWidth, h: window.innerHeight*0.6};
size.w = document.querySelector('.chart-1').clientWidth;


const tr_size = {w: 1300, h: 700};

const svg = d3.select('svg#bar-chart');
const tree_svg = d3.select('svg#tree-map');

const containerG = svg.append('g');
const tree_containerG = tree_svg.append('g');

const dispatch = d3.dispatch('changeState', "brushed");
let filters = {years: null};


// svg.attr('width', size.w)
//     .attr('height', size.h);

svg.attr("viewBox", `0 0 ${size.w} ${size.h}`)
    .call(responsivefy);


if (size.w < 1300) {
    tr_size.w = size.w*0.90;
    tr_size.h = size.h*1.5;
}

if (size.w < 546) {
    tr_size.w = size.w*0.90
    tr_size.h = size.h*1.8;
}

tree_svg
    // .attr("viewBox", `0 0 ${tr_size.w} ${tr_size.h}`);
    .attr('width', tr_size.w)
    .attr('height', tr_size.h);

// tree_svg.attr("viewBox", `0 0 ${tr_size.w} ${tr_size.h}`);


Promise.all([
    d3.csv('data/psych_congress_testimony.csv'),
    d3.csv('data/markers.csv'),
    d3.json('data/witcomm_dendrogram_top5.json')

])
    .then(function(datasets) {

        data = datasets[0].map((d,i) => {
            d.year = +d.year;
            d.id = i;

            return d;
        });

        markers = datasets[1];
        treeDat = datasets[2];

        let decades = new Set(data.map(d => d.decade));
        decades = Array.from(decades);
        decades = decades.sort();
        
        // BAR CHART
        let barChart = new BarChart();

        console.log(size);

        barChart
            .margin(margins)
            .size(size)
            .selection(containerG)
            .data(data)
            .markers(markers)
            .filterState(decades)
            .dispatch(dispatch)
            .draw();

        // SCROLL + TEXT BOXES
        let scrollActions = new ScrollActions();
        scrollActions
            .dispatch(dispatch)
            .addScrollTriggers();

        // TABLE
        populateTable(data);


        dispatch.on('brushed', function(limits) {
            
            filters.years = limits;

            let brushFilteredData = data;

            if (filters.years) {
                brushFilteredData = brushFilteredData.filter(d => {

                    return filters.years[0] <= d.year && filters.years[1] >= d.year;

                });
            }
        
            populateTable(brushFilteredData);
        })

        
        // TREE MAP
        drawTreemap(treeDat);

});



function populateTable(data) {
    let testTable = new TestTable();
    testTable.selection(d3.select('div#testimony-table-content'))
        .data(data.sort((a, b) => a.year - b.year))
        .populate();
}




function responsivefy(svg) {

    // console.log("response");

    // get container + svg aspect ratio
    var container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height")),
        aspect = width / height;

    // console.log(continer)
     // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("perserveAspectRatio", "xMinYMid")
        .call(resize);

    // to register multiple listeners for same event type, 
    // you need to add namespace, i.e., 'click.foo'
    // necessary if you call invoke this function for multiple svgs
    // api docs: https://github.com/mbostock/d3/wiki/Selections#on
    d3.select(window).on("resize." + container.attr("id"), resize);


     // get width of container and resize svg to fit it
    function resize() {
        // svg.selectAll("text")
        // .style('font-size', "8pt");

        var targetWidth = parseInt(container.style("width"));
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspect));
    
        // const newFontSize = 10 * (900 / parseInt(targetWidth));
        // d3.selectAll(".tick").select("text")
        // .style("font-size", newFontSize)


    }

}



///////// ~ ~ ~ CODE BIB ~ ~ ~ //////////

// 1. Responsive charts
////////// a) https://brendansudol.com/writing/responsive-d3
////////// b) https://stackoverflow.com/questions/55480933/how-to-maintain-text-size-in-a-responsive-svg
// 2. Tree-map sources
////////// a) https://github.com/lizcory/Week-7/blob/master/scripts-complete/treemap.js
////////// b) https://www.d3-graph-gallery.com/graph/treemap_custom.html 
////////// c) https://stackoverflow.com/questions/24784302/wrapping-text-in-d3/24785497 