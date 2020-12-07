const SLIDER_WIDTH = 20;

export class CircularSlider {

    constructor(options) {
        if (typeof options.container != "object") {
            throw Error('Error: options container must be a DOM object');
        }

        if (typeof options.radius != "number") {
            throw Error('Error: options radius must be a number');
        }

        if (typeof options.min != "number" || typeof options.max != "number") {
            throw Error('Error: options min/max must be a number');
        }

        if (options.min >= options.max) {
            throw Error('Error: options max must be a number greater than min');
        }

        this.container = options.container;
        this.color = options.color ? options.color : "black";
        this.min = options.min;
        this.max = options.max;
        this.step = options.step;
        this.radius = options.radius;
        this.value = this.min;

        this.callback = null;
        this.range = this.max - this.min;
        this.circumference = (2 * Math.PI * this.radius);
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.cx = this.width / 2;
        this.cy = this.height / 2;
    }

    onChange(callback) {
        return this.callback = callback;
    }

    setValue(inputValue) {
        // validate value
        if (typeof inputValue != "number") {
            throw Error('Error: input value must be a number!');
        }
        if (inputValue < this.min || inputValue > this.max) {
            throw Error('Error: input value must be between min and max value!');
        }

        this.driftSliderToStep(inputValue - this.min);
    }

    init() {
        var flagSvgCreated = false;

        // check if svg element already exist in container 
        if (this.container.children.length > 0) {
            Array.from(this.container.children).forEach(element => {
                if (element.tagName == "svg")
                    this.svgContainer = element;
            });
        } else { // create the svg element 
            this.svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            // set width and height
            this.svgContainer.setAttribute("width", this.width);
            this.svgContainer.setAttribute("height", this.height);
            this.svgContainer.setAttribute("class", "circular-slider");

            flagSvgCreated = true;
        }

        // create background circle 
        this.bgCircle = this.createCircle(this.cx, this.cy, this.radius, "silver");
        this.bgCircle.setAttribute("stroke-dasharray", "2 5");
        this.bgCircle.setAttribute("class", "background-circle");
        this.bgCircle.style.transformOrigin = (this.cx) + "px " + (this.cy) + "px";
        this.bgCircle.style.transform = "rotate(-90deg)";

        // create progress circle
        // add offset for progression
        this.sliderBarCircle = this.createCircle(this.cx, this.cy, this.radius, this.color);
        this.sliderBarCircle.setAttribute("stroke-dasharray", this.circumference)
        this.sliderBarCircle.setAttribute("stroke-dashoffset", this.circumference)
        this.sliderBarCircle.style.transition = 'stroke-dashoffset 850ms; ease-in-out;';
        this.sliderBarCircle.style.transformOrigin = (this.cx) + "px " + (this.cy) + "px";
        this.sliderBarCircle.style.transform = "rotate(-90deg)";
        this.sliderBarCircle.setAttribute("class", "slider-circle");

        // create touch circle for handling clicks
        this.touchCircle = this.createCircle(this.cx, this.cy, this.radius, this.color)
        this.touchCircle.setAttribute("stroke-opacity", "0");

        // slider button for dragging
        this.sliderButton = this.createCircle(this.cx, this.cy - this.radius, 12, "#303030", 2, "white")
        this.sliderButton.style.transformOrigin = (this.cx) + "px " + (this.cy) + "px";
        this.sliderButton.setAttribute("class", "slider-button");

        this.registerEventListeners();

        // attach svg elements to the container
        this.svgContainer.appendChild(this.bgCircle);
        this.svgContainer.appendChild(this.sliderBarCircle);
        this.svgContainer.appendChild(this.touchCircle);
        this.svgContainer.appendChild(this.sliderButton);

        // attach svg container to document
        if (flagSvgCreated)
            this.container.appendChild(this.svgContainer);

    }

    createCircle(cx, cy, radius, color, strokeWidth = SLIDER_WIDTH, fillColor = false) {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", cx);
        c.setAttribute("cy", cy);
        c.setAttribute("r", radius);
        c.setAttribute("stroke-width", strokeWidth);
        c.setAttribute("stroke", color != null ? color : "gray");
        c.setAttribute("fill", fillColor ? fillColor : "none");

        return c;
    }

    // drifts slider button to right step place
    driftSliderToStep(newValue) {

        this.sliderButton.style.transition = "all 850ms ease-in-out"
        this.sliderBarCircle.style.transition = "stroke-dashoffset 850ms ease-in-out";

        var offset = newValue % this.step;
        var stepNum = offset > (this.step / 2) ? Math.floor(newValue / this.step) + 1 : Math.floor(newValue / this.step);

        this.value = stepNum * this.step;

        var angle = (360 * this.value) / this.range;

        requestAnimationFrame(() => {
            this.animateCircleSlider(this.value, angle);

            if (this.callback)
                this.callback(this.value + this.min);
        });
    }

    animateCircleSlider(value, angle) {
        this.sliderBarCircle.setAttribute("stroke-dashoffset", (1 - value / this.range) * this.circumference);
        this.sliderButton.style.transform = "rotate(" + angle + "deg)";
        
        // color slider button on change
        this.sliderButton.style.stroke=this.color;
        setTimeout(() => this.sliderButton.style.stroke="#303030", 850);
    }

    registerEventListeners() {
        this.touchCircle.addEventListener("click", evt => this.moveTo(evt));
        this.touchCircle.addEventListener('touchstart', evt => this.moveTo(evt));

        this.isSelected = false;
        this.sliderButton.addEventListener('mousedown', (evt) => this.startDrag(evt));
        this.svgContainer.addEventListener('mousemove', (evt) => this.drag(evt));
        this.svgContainer.addEventListener('mouseup', (evt) => this.endDrag(evt));
        this.svgContainer.addEventListener('mouseleave', (evt) => this.endDrag(evt));

        this.sliderButton.addEventListener('touchstart', (evt) => this.startDrag(evt));
        this.svgContainer.addEventListener('touchmove', (evt) => this.drag(evt));
        this.sliderButton.addEventListener('touchend', (evt) => this.endDrag(evt));
        this.sliderButton.addEventListener('touchleave', (evt) => this.endDrag(evt));
        this.sliderButton.addEventListener('touchcancel', (evt) => this.endDrag(evt));
    }

    moveTo(evt) {
        evt.preventDefault();
        var clickCoord = this.getMousePosition(evt);

        var newValue = this.getValueFromAngle(clickCoord, this.getAngle(clickCoord));

        this.sliderButton.style.transition = "all 850ms ease-in-out"
        this.sliderBarCircle.style.transition = "stroke-dashoffset 850ms ease-in-out";

        var angle = (360 * newValue) / this.range;

        requestAnimationFrame(() => {
            this.animateCircleSlider(this.value, angle);

            this.driftSliderToStep(newValue);
        });

    }

    getAngle(coord) {
        return 0.5 * Math.PI + Math.atan((coord.y - this.cy) / (coord.x - this.cx));
    }

    getValueFromAngle(coord, endAngle) {
        var fi = coord.x < this.cx ? endAngle + Math.PI : endAngle;
        return (fi * this.range) / (2 * Math.PI);
    }

    radToDeg(rad) {
        return rad * (180 / Math.PI);
    }

    getMousePosition(evt) {
        var CTM = this.svgContainer.getScreenCTM();
        if (evt.touches) { evt = evt.touches[0]; }
        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d
        };
    }

    startDrag(evt) {
        evt.preventDefault();
        this.isSelected = true;
    }

    endDrag(evt) {
        evt.preventDefault();
        if (this.isSelected && this.currValue) {
            this.driftSliderToStep(this.currValue);
            this.currValue = null;
        }

        this.isSelected = false;
    }

    // function for contraining movemenent, returns true if allowed movement
    constrainSliderButtonMovement(coord, angle) {
        return !(this.currValue >= 0 && this.currValue <= this.range / 4 && coord.y < this.cy && angle > 0) &&
            !(this.currValue >= this.range * 3 / 4 && this.currValue <= this.range && coord.y < this.cy && angle < 0);
    }

    drag(evt) {
        if (this.isSelected) {
            evt.preventDefault();
            var coord = this.getMousePosition(evt);

            var distance = Math.sqrt(Math.pow(coord.x - this.cx, 2) + Math.pow(coord.y - this.cy, 2));

            var fiAngle = Math.atan((coord.y - this.cy) / (coord.x - this.cx))

            if (this.currValue == null)
                this.currValue = this.value;

            if (this.constrainSliderButtonMovement(coord, fiAngle)) {
                if (Math.abs(this.radius - distance) < 50) {
                    fiAngle = coord.x < this.cx ? fiAngle + (1.5 * Math.PI) : fiAngle + (0.5 * Math.PI);

                    this.sliderButton.style.transition = ""
                    this.sliderBarCircle.style.transition = "";

                    var angle = this.radToDeg(fiAngle);

                    // calc value from angle
                    this.currValue = (angle * this.range) / 360;
                    requestAnimationFrame(() => {
                        this.animateCircleSlider(this.currValue, angle);
                    });
                } else {
                    this.endDrag(evt);
                    if (this.currValue)
                        this.driftSliderToStep(this.currValue);
                }
            }

        }
    }
}