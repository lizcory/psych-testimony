const margins = {t: 50, r: 50, b: 50, l: 50};
const size = {w: window.innerWidth, h: window.innerHeight*0.6};
const svg = d3.select('svg#bar-chart');
const containerG = svg.append('g');
const dispatch = d3.dispatch('changeState');
const dispatchBrushUpdate = d3.dispatch('brushed');
let filters = {years: null};


svg.attr('width', size.w)
    .attr('height', size.h);


// d3.csv('data/psych_count.csv')
d3.csv('data/psych_congress_testimony.csv')
    .then(function(data) {

        data = data.map((d,i) => {
            d.year = +d.year;
            d.id = i;

            return d;
        });

        console.log(data);


        let decades = new Set(data.map(d => d.decade));
        decades = Array.from(decades);
        decades = decades.sort();

        // console.log(decades)
        // console.log(decades.slice(0,2));
        
        // BAR CHART
        let barChart = new BarChart();

        barChart
            .margin(margins)
            .size(size)
            .selection(containerG)
            .data(data)
            .filterState(decades)
            .dispatch(dispatch)
            .dispatchBrushUpdate(dispatchBrushUpdate)
            .draw();


        // ANNOTATIONS
        let scrollActions = new ScrollActions();
        scrollActions
            .dispatch(dispatch)
            .addScrollTriggers();


        // TABLE
        populateTable(data);


        dispatchBrushUpdate.on('brushed', function(limits) {
            
            filters.years = limits;
            
    
            let brushFilteredData = data;
            // if (filters.dates) {
                brushFilteredData = brushFilteredData.filter(d => {
                    let year = d.year;
                    return filters.years[0] <= year && filters.years[1] <= year;
                });
            // }
           
            populateTable(brushFilteredData);
        })

});



function populateTable(data) {
    let testTable = new TestTable();
    testTable.selection(d3.select('div#testimony-table-content'))
        .data(data.sort((a, b) => a.year - b.year))
        .populate();
}
