gsap.registerPlugin(ScrollTrigger);

function ScrollActions () {

    this.dispatch = function(dispatch) {
        if (arguments.length > 0) {
            this._dispatch = dispatch;
            return this;
        }
        return this._dispatch;
    }

    this.addScrollTriggers = function () {

        // TO PIN THE BAR CHART
        // so that annotations can start scrolling over the chart
        gsap.to('#annotation-container', {
            scrollTrigger: {
                trigger: '#annotation-container',
                start: 'top bottom',
                end: `bottom bottom`,
                pin: '#bar-chart',
                pinSpacing: false,
                id: 'pinning',
                markers: false
            }
        });

        // selecting all annotations
        // refer: index.html to see what elements have the class 'annotation'
        let elements = document.getElementsByClassName('annotation');
        elements = Array.from(elements);

        elements.forEach((ele, i) => {
            // getting id for each annotation
            let eleId = ele.getAttribute('id');

            // adding triggers to each annotation;
            // so we can update the bar-chart
            // as per a certain annotation
            // whether we scroll up (onEnter) or down (onLeave)
            gsap.to(`#${eleId}`, {
                scrollTrigger: {
                    trigger: `#${eleId}`,
                    start: 'top 50%',
                    end: `bottom center`,
                    id: ele.getAttribute('id'),
                    onEnter: () => {
                  
                        this._dispatch.call('changeState', this, ele.dataset.decade, eleId);

                    },
                    onEnterBack: () => {

                        this._dispatch.call('changeState', this, ele.dataset.decade, eleId);

                    },
                    markers: false
                },
                duration: 1
            });
        });



    }

}