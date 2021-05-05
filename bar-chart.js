function BarChart() {

    // data
    this.data = function (data) {
        if (arguments.length > 0) {
            this._data = data;
            return this;
        }
        return this._data;
    }

    // markers
     this.markers = function (markers) {
        if (arguments.length > 0) {
            this._markers = markers;
            return this;
        
        }
        
        return this._markers;

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

            decArr = decStr.split(" ");

            this._filterState = decArr; 
            
            overview = 1;

            return this;
            
        }
    
        // else if (arguments[0].length > 0 & arguments[0].length < 6) {
        else {
            this._filterState = decade;

            overview = 0;

            return this;
        }

        return this._filterState;

    }

    // draw the bar chart
    this.draw = function () {

        // if (this._filterState != 0){
        if (this._filterState.length < 2){
            var filteredData = this._data.filter(d => d.decade === this._filterState);
            var filteredMarkers = this._markers.filter(d => d.decade === this._filterState);

        } else {
            // var filteredData = this._data;
            var filteredData = this._data.filter(d => this._filterState.includes(d.decade));
            var filteredMarkers = this._markers.filter(d => this._filterState.includes(d.decade));
            // var filteredMarkers = 0;
        }

        console.log(overview);

        // get x domain of years based on current selected decade
        let years = filteredData.map(d => d.year); 
        years_unique = [...new Set(years)].sort(function compareNumbers(a, b) {
            return a - b;
          });
    
        filteredData = d3.group(filteredData, d => d.year);
        filteredData = Array.from(filteredData).sort(function compareNumbers(a, b) {
            return a[0] - b[0];
          });
        
        this._scaleX = d3.scaleBand()
                .domain(years_unique)
                .range([0, this._chartSize.w])
                .padding(0.3);
                
        this._scaleY = d3.scaleLinear()
                .domain([0, d3.max(filteredData, d => d[1].length)])
                .range([this._chartSize.h, 0]);
                

        this._sel.attr('transform', `translate(${this._margin.l},${this._margin.t})`);

        /// tooltip
        // selecting tooltip
        let tooltip = d3.select('div#tooltip-bars');

        // console.log(overview);    


        /// BARS
        let rectSelection = this._sel
            .selectAll("g.bars")
            .data([1]) // magic number!
            .join("g")
            .classed("bars", true)
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

        rectSelection.on('mouseover', (event, d) => {
                // changing display none to block
                tooltip.style('display', 'block');
    
                // setting up the tooltip with info
                tooltip.select('div.test-num')
                    .text(`${d[1].length} ${pluralTest("test",d[1].length)}`);
                tooltip.select('div.people')
                    .text(`${countUnique(d[1].map(d => d.witness_name))} ${pluralTest("ppl",d[1].length)}`);
                tooltip.select('div.committees')
                    .text(`${countUnique(d[1].map(d => d.full_committee1))} unique ${pluralTest("comm",d[1].length)}`);            
                
                    // setting the position of the tooltip
                // to the location of event as per the page
                tooltip.style('top', (event.pageY+1)+'px')
                    .style('left', (event.pageX+1)+'px')
            })
            .on('mouseout', () => {
                // hide the tooltip
                // when mouse moves out of the circle
                tooltip.style('display', 'none');
            });


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

        
            rectSelection.on('mouseover', (event, d) => {
                // changing display none to block
                tooltip.style('display', 'block');
    
                // setting up the tooltip with info
                tooltip.select('div.test-num')
                    .text(`${d[1].length} ${pluralTest("test",d[1].length)}`);
                tooltip.select('div.people')
                    .text(`${countUnique(d[1].map(d => d.witness_name))} ${pluralTest("ppl",d[1].length)}`);
                tooltip.select('div.committees')
                    .text(`${countUnique(d[1].map(d => d.full_committee1))} unique ${pluralTest("comm",d[1].length)}`);            
                
                    // setting the position of the tooltip
                // to the location of event as per the page
                tooltip.style('top', (event.pageY+1)+'px')
                    .style('left', (event.pageX+1)+'px')
            })
            .on('mouseout', () => {
                // hide the tooltip
                // when mouse moves out of the circle
                tooltip.style('display', 'none');
            });

        this._drawAxes(this._scaleX, this._scaleY);


        function countUnique(iterable) {
            return new Set(iterable).size;
        }

        function pluralTest(dat, item_num) {

            if (dat === "test") {
                if (item_num > 1) {
                    return "testimonies"
                } else{
                    return "testimony"
                }
            }  else if (dat == "comm") {
                if (item_num > 1) {
                    return "committees"
                } else{
                    return "committee"
                }
            } else {
                if (item_num > 1) {
                    return "different people"
                } else{
                    return "person"
                }
                
            }

        }


        

    }

    // draw axes
    this._drawAxes = function(scaleX, scaleY) {
        this._drawAxisX(this._scaleX);
        this._drawAxisY(this._scaleY);
    }

    // define draw x axis function
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

    // define draw y axis function
    this._drawAxisY = function(scaleY) {
        let axis = d3.axisLeft(this._scaleY);

        let axisG = this._sel.selectAll('g.axis-y')
            .data([1])
            .join('g')
            .classed('axis', true)
            .classed('axis-y', true);
        
        axisG.call(axis);
    }

    // define dispatch
    this.dispatch = function (dispatch) {
        if (arguments.length > 0) {
            this._dispatch = dispatch;

            this._dispatch.on('changeState', (decade, eleId, reverse) => {

                if (eleId === "id-9") {

                    this._addBrush();

                } else {

                    this._sel.select("g.brush").remove();

                    // this._addMarkers();
                }
                
                
                this.filterState(decade)
                    .draw();
            })

            return this;
        }
        return this._dispatch;
    }

    // call dispatch on brushed event 
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
            // .selectAll("g.bars")
            .selectAll('rect.bar')
            .attr('fill', d => {
                let x = this._scaleX(d);

                console.log(x);

                if (x >= lowerVal && x <= upperVal) {

                    // console.log("blue");

                    // return 'steelblue';
                }
                return 'grey';
            });

        this._dispatch.call('brushed', this, [lowerVal, upperVal]);
    }    
    /// BRUSH function 
    this._addBrush = (event) => {
            
        let brush = d3.brushX()
            .extent([ [0,0], [this._size.w, this._size.h] ])
            .on('end', this._brushed);

        // console.log("function called");
        this._sel
            .selectAll("g.brush")
            .data([1]) // magic number!
            .join("g")
            .classed("brush", true)
            .call(brush);

    }    
    ///

    //################# CODE GRAVEYARD, R.I.P. #################
    // this._addMarkers = function(filteredData, filteredMarkers) {
    //     /// MARKERS
    //     let markerSel = this._sel.selectAll(".marker")
    //         .data(filteredMarkers)
    //     markerSel.enter()
    //         .append("text")
    //         .attr("class", "marker")
    //         .attr("x", d => this._scaleX(d.year))
    //         .attr("y", this._scaleY(d3.max(filteredData, d => d[1].length)) )
    //         // .attr("y", d3.max(filteredData, d => d[1].length))
    //         .text(function(d) { return d.marker; })
    //         .transition()
    //         .duration(300)

    //     markerSel.exit()
    //         .transition()
    //         .duration(300)
    //         .style('fill', "#eee")
    //         .remove();

    //     markerSel
    //         .transition()
    //         .duration(300)
    //         .attr("x", d => this._scaleX(d.year))
    //         .attr("y", this._scaleY(d3.max(filteredData, d => d[1].length)) )
    //         .text(function(d) { return d.marker; });
    
    // }



    // window.onresize = function() {
    //     size.w = document.querySelector('.chart-1').clientWidth;
    //     size.h = window.innerHeight * 0.8;
    
    //     svg.attr('width', size.w)
    //         .attr('height', size.h)
    //         .attr('viewBox', [-size.w / 2, -size.h / 2, size.w, size.h]);
    
    //     // if (size.w > 1200) {
    //     //     fontSize.nodes = 10;
    //     // } else if (size.w > 720) {
    //     //     fontSize.nodes = 8;
    //     // } else if (size.w > 540) {
    //     //     fontSize.nodes = 6;
    //     // } else {
    //     //     fontSize.nodes = 5;
    //     // }
    
    //     // this.draw();
    // }




    return this;

}







 ///////////////////////////////////////////////
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