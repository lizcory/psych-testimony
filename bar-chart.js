function BarChart() {

    // data
    this.data = function (data) {
        if (arguments.length > 0) {
            this._data = data;
            return this;
        }
        return this._data;
    }

    // selection
    this.selection = function (sel) {
        if (arguments.length > 0) {
            this._sel = sel;
            return this;
        }
        return this._sel;
    }

    // size
    this.size = function (size) {
        if (arguments.length > 0) {
            this._size = size;

            if (!this._margin) {
                console.error('Set the margins before setting the size');
            }

            this._chartSize = {
                w: this._size.w - this._margin.l - this._margin.r,
                h: this._size.h - this._margin.t - this._margin.b
            };

            return this;
        }
        return this._size;
    }

    // margin
    this.margin = function (margin) {
        if (arguments.length > 0) {
            this._margin = margin;
            return this;
        }
        return this._margin;
    }

    // filter state — which decade(s) will be drawn on the bar chart
    this.filterState = function (decade) {

        // console.log(arguments);

        // console.log(Array.isArray(arguments[0]));

        if (arguments[0].length > 5 && !Array.isArray(arguments[0])) {
            // this._filterState = 0;
            let decStr = decade + '';
            // console.log(dec);

            decArr = decStr.split(" ");
            // console.log(decArr);

            this._filterState = decArr; 
      
            // console.log(this);
            return this;
            
        }
    
        // else if (arguments[0].length > 0 & arguments[0].length < 6) {
        else {
            this._filterState = decade;

            // console.log(this);
            return this;
        }

        return this._filterState;

    }

    // draw the bar chart
    this.draw = function () {

        // if (this._filterState != 0){
        if (this._filterState.length < 2){
            var filteredData = this._data.filter(d => d.decade === this._filterState);

        } else {
            // var filteredData = this._data;
            var filteredData = this._data.filter(d => this._filterState.includes(d.decade));
        }
        // console.log(filteredData);


        let years = filteredData.map(d => d.year); 
        years_unique = [...new Set(years)].sort(function compareNumbers(a, b) {
            return a - b;
          });

        // console.log(years_unique);
    
        filteredData = d3.group(filteredData, d => d.year);
        filteredData = Array.from(filteredData).sort(function compareNumbers(a, b) {
            return a[0] - b[0];
          });

        // console.log(filteredData);
        
        // let scaleX = d3.scaleBand()
        this._scaleX = d3.scaleBand()
                // .domain(filteredData.map(d => d.year))
                .domain(years_unique)
                .range([0, this._chartSize.w])
                .padding(0.3);
                
       
        // let scaleY = d3.scaleLinear()
        this._scaleY = d3.scaleLinear()
                // .domain([0, d3.max(filteredData, d => d.count)])
                .domain([0, d3.max(filteredData, d => d[1].length)])
                .range([this._chartSize.h, 0]);
                

        this._sel.attr('transform', `translate(${this._margin.l},${this._margin.t})`);

        
        let rectSelection = this._sel
            .selectAll('rect')
            .data(filteredData, (d, i) => i);
        rectSelection.enter()
            .append('rect')
            .classed('bar', true)
            .attr('x', d => this._scaleX(d[0]))
            .attr('y', this._chartSize.h)
            .attr('width', this._scaleX.bandwidth())
            .attr('height', 0)
            .transition()
            .duration(1000)
            .attr('y', d => this._scaleY(d[1].length))
            .attr('height', d => this._chartSize.h - this._scaleY(d[1].length));


        rectSelection.exit()
            .transition()
            .duration(1000)
            .attr('height', 0)
            .remove();
        
        rectSelection
            .transition()
            .duration(1000)
            .attr('x', d => this._scaleX(d[0]))
            .attr('y', d => this._scaleY(d[1].length))
            .attr('width', this._scaleX.bandwidth())
            .attr('height', d => this._chartSize.h - this._scaleY(d[1].length));



        ////////////  BRUSH  ////////////

        let brush = d3.brushX()
            .extent([ [0,0], [this._size.w, this._size.h] ])
            .on('brush', this._brushed);
          
        //   rectSelection.call(brush);
        //   this._sel.call(brush);
        ///////////////////////////


        this._drawAxes(this._scaleX, this._scaleY);

    }


    this._drawAxes = function(scaleX, scaleY) {
        this._drawAxisX(this._scaleX);
        this._drawAxisY(this._scaleY);
    }

    this._drawAxisX = function(scaleX) {
        let axis = d3.axisBottom(this._scaleX);

        let axisG = this._sel.selectAll('g.axis-x')
            .data([1])
            .join('g')
            .classed('axis', true)
            .classed('axis-x', true)
            .attr('transform', `translate(0, ${this._chartSize.h})`);
        
        axisG.call(axis);
        
    }

    this._drawAxisY = function(scaleY) {
        let axis = d3.axisLeft(this._scaleY);

        let axisG = this._sel.selectAll('g.axis-y')
            .data([1])
            .join('g')
            .classed('axis', true)
            .classed('axis-y', true);
        
        axisG.call(axis);
    }

    this.dispatch = function (dispatch) {
        if (arguments.length > 0) {
            this._dispatch = dispatch;

            this._dispatch.on('changeState', (decade) => {
                // console.log(decade);
                this.filterState(decade)
                    .draw();
            })

            return this;
        }
        return this._dispatch;
    }


    this.dispatchBrushUpdate = function () {
        if (arguments.length > 0) {
            this._dispatchBrushUpdate = arguments[0];
            
            // if (arguments[1]) {
            //     this._dispatchType = arguments[1];
            // }

            return this;
        }
        return this._dispatchBrushUpdate;
    }


    this._brushed = (event) => {
        if (!event.selection) return;

        let step = this._scaleX.step();
        let lowerIndex = Math.floor(event.selection[0]/step);
        let lowerVal = this._scaleX.domain()[lowerIndex];
    
        let upperIndex = Math.floor(event.selection[1]/step);
        let upperVal;
        if (upperIndex > this._scaleX.domain().length-1) {
            upperVal = this._scaleX.domain()[this._scaleX.domain().length-1];
        } else {
            upperVal = this._scaleX.domain()[upperIndex];
        }
        this._sel
            .selectAll('rect.bar')
            .attr('fill', d => {
                let x = d => d[0](d);

                if (x >= lowerVal && x <= upperVal) {
                    return 'steelblue';
                }
                return 'grey';
            });

        this._dispatch.call('brushed', this, [lowerVal, upperVal]);
    }    


    return this;

}






 /////////////////////////////////////////////////
    // this.axisXTickValues = function () {
    //     if (arguments.length > 0) {
    //         this._axisXTickValues = arguments[0];
    //         return this;
    //     }
    //     return this._axisXTickValues;
    // }

    // this.axisXTickFormat = function () {
    //     if (arguments.length > 0) {
    //         this._axisXTickFormat = arguments[0];
    //         return this;
    //     }
    //     return this._axisXTickFormat;
    // }
    ///////////////////////////////////////////////