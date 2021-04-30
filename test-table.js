
function TestTable() {

    this.selection = function () {
        if (arguments.length > 0) {
            this._sel = arguments[0];
            return this;
        }
        return this._sel;
    }

    this.data = function () {
        if (arguments.length > 0) {
            this._data = arguments[0];
            return this;
        }
        return this._data;
    }

    this.populate = function () {
        this._sel.selectAll('div.testimony-row')
            .data(this._data)
            .join('div')
            .classed('testimony-row', true)
            .html(d => {
                return `
                <div class="year">${d.year}</div>
                <div class="hearing-id">${d.hearing_id}</div>
                <div class="witness-name">${d.witness_name}</div>
                <div class="committee">${d.full_committee1}</div>
                <div class="title">${d.title_description}</div>
                `
            })

    }

    // this._formatDate = function (dateObj) {
    //     let month = dateObj.getMonth();
    //     let date = dateObj.getDate();
    //     let months = ['Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    //     return months[+month] + ' ' + date;
    // }
    // 
    return this;

}