const SLIDER_WIDTH = 15;

export class CircularSlider {

    constructor(options) {
        // TODO assert requires options fields
        if (typeof options.container != "object") {
            throw Error('Error: options container must be a DOM object');
        }

        if (typeof options.radius != "number") {
            throw Error('Error: options radius must be a number');
        }

        this.container = options.container;
        this.color = options.color ? options.color : "black";
        this.min = options.min;
        this.max = options.max;
        this.step = options.step;
        this.radius = options.radius;
        this.value = 0;

        this.callback = this.onValueChange;
    }

    setValue(value, callback) {
        this.callback = callback;

        this.registerEventListeners();

        this.onValueChange(value);
    }

    init() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.cx = this.width / 2;
        this.cy = this.height / 2;

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

            flagSvgCreated = true;
        }

        // create background circle 
        this.bgCircle = this.createCircle(this.cx, this.cy, this.radius);
        this.bgCircle.setAttribute("stroke-dasharray", 1)


        // create progress circle
        this.sliderBarCircle = this.createCircle(this.cx, this.cy, this.radius, this.color);

        this.circumference = (2 * Math.PI * this.radius);
        // add offset for progression
        this.sliderBarCircle.setAttribute("stroke-dasharray", this.circumference)
        this.sliderBarCircle.setAttribute("stroke-dashoffset", this.circumference)
        this.sliderBarCircle.style.transition = 'stroke-dashoffset 850ms; ease-in-out;';
        this.sliderBarCircle.style.transformOrigin = (this.cx) + "px " + (this.cy) + "px";
        this.sliderBarCircle.style.transform = "rotate(-90deg)";

        this.touchCircle = this.createCircle(this.cx, this.cy, this.radius, this.color)
        this.touchCircle.setAttribute("stroke-opacity", "0");

        this.sliderButton = this.createCircle(this.cx, this.cy - this.radius, 12, "black", 1, true)
        this.sliderButton.style.transformOrigin = (this.cx) + "px " + (this.cy) + "px";


        //this.registerEventListeners();

        // attach svg elements to the container
        this.svgContainer.appendChild(this.bgCircle);
        this.svgContainer.appendChild(this.sliderBarCircle);
        this.svgContainer.appendChild(this.touchCircle);
        this.svgContainer.appendChild(this.sliderButton);

        // todo remove
        // for testing input to input progress
        var input = document.createElement("input");
        document.getElementById("main").appendChild(input);
        input.onchange = () => this.onValueChange(input.value);

        // attach svg container to document
        if (flagSvgCreated)
            this.container.appendChild(this.svgContainer);

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

    onValueChange(newValue) {
        this.value = newValue;

        this.sliderButton.style.transition = "all 850ms ease-in-out"
        this.sliderBarCircle.style.transition = "stroke-dashoffset 850ms ease-in-out";

        var angle = (360 * this.value) / 100;


        requestAnimationFrame(() => {
            this.sliderBarCircle.setAttribute("stroke-dashoffset", ((100 - this.value) / 100) * this.circumference);
            this.sliderButton.style.transform = "rotate(" + angle + "deg)";
        });

        if (this.callback)
            this.callback(this.value);

    }

    updateSliderButtonPosition(coord) {
        this.sliderButton.setAttribute("cx", coord.x);
        this.sliderButton.setAttribute("cy", coord.y);
    }

    createCircle(cx, cy, radius, color, strokeWidth = SLIDER_WIDTH, fill = false) {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", cx);
        c.setAttribute("cy", cy);
        c.setAttribute("r", radius);
        c.setAttribute("stroke-width", strokeWidth);
        c.setAttribute("stroke", color != null ? color : "gray");
        c.setAttribute("fill", fill ? color ? color : "black" : "none");

        return c;
    }

    moveTo(evt) {
        evt.preventDefault();
        var clickCoord = this.getMousePosition(evt);

        var newValue = this.getValueFromAngle(clickCoord, this.getAngle(clickCoord));

        this.onValueChange(newValue);
    }

    getAngle(coord) {
        return 0.5 * Math.PI + Math.atan((coord.y - this.cy) / (coord.x - this.cx));
    }

    getValueFromAngle(coord, endAngle) {
        var fi = coord.x < this.cx ? endAngle + Math.PI : endAngle;
        return (fi * 100) / (2 * Math.PI);
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
        this.isSelected = false;
    }

    drag(evt) {
        if (this.isSelected) {
            evt.preventDefault();
            var coord = this.getMousePosition(evt);

            var distance = Math.sqrt(Math.pow(coord.x - this.cx, 2) + Math.pow(coord.y - this.cy, 2));

            var fiAngle = Math.atan((coord.y - this.cy) / (coord.x - this.cx))

            if (Math.abs(this.radius - distance) < 50) {
                // TODO constrain movememnt between 0 - 100
                if (this.value == 0 && coord.x < this.cx && coord.y < this.cy && fiAngle > 0) {
                    //console.log("not allowed")
                } else if (this.value == 100 && coord.x >= this.cx && coord.y < this.cy && fiAngle < 0) {
                    //console.log("not allowed")
                } else {
                    fiAngle = coord.x < this.cx ? fiAngle + (1.5 * Math.PI) : fiAngle + (0.5 * Math.PI);

                    this.sliderButton.style.transition = ""
                    this.sliderBarCircle.style.transition = "";

                    var angle = this.radToDeg(fiAngle);

                    // calc value from angle
                    var val = (angle * 100) / 360;
                    requestAnimationFrame(() => {
                        this.sliderBarCircle.setAttribute("stroke-dashoffset", ((100 - val) / 100) * this.circumference);
                        this.sliderButton.style.transform = "rotate(" + angle + "deg)";
                        this.value = val;

                        if (this.callback)
                            this.callback(this.value);
                    });

                }
            } else {
                this.endDrag(evt);
            }

        }
    }

    // deprecated
    getPositionFromProgress(progress) {
        var cx = this.container.offsetWidth / 2;
        var cy = this.container.offsetHeight / 2;
        var angle = progress * 18 / 5;

        return {
            x: cx + this.radius * Math.sin(this.to_radian(angle)),
            y: cy - this.radius * Math.cos(this.to_radian(angle))
        }
    }

}