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

svg.attr("viewBox", `0 0 ${size.w} ${size.h}`);

tree_svg.attr('width', tr_size.w)
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


