// todo check how to do offsets on circle

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

    }

    setValue(value, callback) {
        this.callback = callback;

        this.makeDraggable(this.svgContainer, this.sliderButtonCircle, this.width / 2, this.height / 2, this.radius, this.sliderBarCircle, this.callback);

        this.onValueChange(value);
    }

    init() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

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
        const bgCircle = this.createCircle(this.width / 2, this.height / 2, this.radius);
        bgCircle.setAttribute("stroke-dasharray", 1)

        // create progress circle
        const sliderBarCircle = this.createCircle(this.width / 2, this.height / 2, this.radius, this.color);

        this.circumference = (2 * Math.PI * this.radius);
        // add offset for progression
        sliderBarCircle.setAttribute("stroke-dasharray", this.circumference)
        sliderBarCircle.setAttribute("stroke-dashoffset", this.circumference)
        //sliderBarCircle.setAttribute("stroke-dashoffset", ((100 - this.value) / 100) * this.circumference)
        sliderBarCircle.style = 'transition: stroke-dashoffset 850ms;';
        this.sliderBarCircle = sliderBarCircle;

        // rotate progression bar circle, so the 0 value is on top
        const transformGraphic = document.createElementNS("http://www.w3.org/2000/svg", "g");
        transformGraphic.setAttribute("transform", "rotate(-90 " + (this.width / 2) + " " + (this.height / 2) + " )");
        transformGraphic.appendChild(sliderBarCircle);

        //var sliderButtornCoord = this.getPositionFromProgress(this.value);
        this.sliderButtonCircle = this.createCircle(this.width / 2, this.height / 2 - this.radius, 12, "black", 1, true)

        this.animateButton = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
        this.animateButton.setAttribute("dur", "600ms");
        this.animateButton.setAttribute("restart", "always");
        this.sliderButtonCircle.appendChild(this.animateButton);

        this.makeDraggable(this.svgContainer, this.sliderButtonCircle, this.width / 2, this.height / 2, this.radius, this.sliderBarCircle, this.callback);

        // attach svg elements to the container
        this.svgContainer.appendChild(bgCircle);
        this.svgContainer.appendChild(transformGraphic);
        this.svgContainer.appendChild(this.sliderButtonCircle);

        // todo remove
        // for testing input to input progress
        var input = document.createElement("input");
        document.getElementById("main").appendChild(input);
        input.onchange = () => this.onValueChange(input.value);

        // attach svg container to document
        if (flagSvgCreated)
            this.container.appendChild(this.svgContainer);

    }

    onValueChange(newValue) {
        var oldValue = this.value;
        this.value = newValue;
        this.sliderBarCircle.style = 'transition: stroke-dashoffset 850ms;';
        this.sliderBarCircle.setAttribute("stroke-dashoffset", ((100 - this.value) / 100) * this.circumference)

        var sliderButtornCoord = this.getPositionFromProgress(this.value);

        var oldX = this.sliderButtonCircle.cx.baseVal.value;
        var oldY = this.sliderButtonCircle.cy.baseVal.value;
        
        this.sliderButtonCircle.setAttribute("cx", sliderButtornCoord.x);
        this.sliderButtonCircle.setAttribute("cy", sliderButtornCoord.y);

        var posX, posY;
        posX = - (sliderButtornCoord.x - oldX);
        posY = - (sliderButtornCoord.y - oldY);

        console.log(sliderButtornCoord)
        console.log(oldX, oldY)

        var largeArcFlag = Math.abs(oldValue - this.value) <= 50 ? "0" : "1";
        var sweepFlag = this.value < oldValue ? "0" : "1";
        console.log(largeArcFlag)
        //const animateButton = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
        //animateButton.setAttribute("dur", "850ms");
        //animateButton.setAttribute("fill", "freeze");
        this.animateButton.setAttribute("path", "M" + posX + "," + posY + " A" + this.radius + "," + this.radius + ", 0, " +
            largeArcFlag + ", " + sweepFlag + ", " + 0 + ", " + 0);

        this.animateButton.beginElement()

        //this.sliderButtonCircle.appendChild(animateButton);

        if (this.callback)
            this.callback(this.value);
    }

    createCircle(cx, cy, radius, color, strokeWidth = 10, fill = false) {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", cx);
        c.setAttribute("cy", cy);
        c.setAttribute("r", radius);
        c.setAttribute("stroke-width", strokeWidth);
        c.setAttribute("stroke", color != null ? color : "gray");
        c.setAttribute("fill", fill ? color ? color : "black" : "none");

        return c;
    }

    // test make draggable function
    makeDraggable(parent, svg, cx, cy, radius, sliderBar, callback) {
        var selectedElement = false;

        svg.addEventListener('mousedown', startDrag);
        parent.addEventListener('mousemove', drag);
        parent.addEventListener('mouseup', endDrag);
        parent.addEventListener('mouseleave', endDrag);

        // mobile events TODO
        svg.addEventListener('touchstart', startDrag);
        svg.addEventListener('touchmove', drag);
        svg.addEventListener('touchend', endDrag);
        svg.addEventListener('touchleave', endDrag);
        svg.addEventListener('touchcancel', endDrag);

        function startDrag(evt) {
            selectedElement = svg;
        }

        function drag(evt) {
            if (selectedElement) {
                evt.preventDefault();
                var coord = getMousePosition(evt);

                var r2 = radius;
                var distance = Math.sqrt(Math.pow(coord.x - cx, 2) + Math.pow(coord.y - cy, 2));

                var fiAngle = Math.atan((coord.y - cy) / (coord.x - cx))

                if (Math.abs(r2 - distance) < 50) {
                    //console.log(evt.target.cx.baseVal.value)
                    moveSlider(coord, 0.5 * Math.PI + fiAngle);
                    // TODO constrain movememnt between 0 - 100
                }

            }
        }
        function endDrag(evt) {
            //console.log("end drag");
            selectedElement = null;
        }

        // move slider function
        function moveSlider(coord, endAngle) {
            var endX, endY;
            if (coord.x < cx) {
                endX = cx - radius * Math.sin(endAngle);
                endY = cy + radius * Math.cos(endAngle);
            } else {
                endX = cx + radius * Math.sin(endAngle);
                endY = cy - radius * Math.cos(endAngle);
            }

            selectedElement.setAttributeNS(null, "cx", endX);
            selectedElement.setAttributeNS(null, "cy", endY);

            var progress = getProgress(coord, endAngle);

            if (callback)
                callback(progress);

            sliderBar.style = 'transition: none;';
            sliderBar.setAttribute("stroke-dashoffset", ((100 - progress) / 100) * (2 * Math.PI * radius))
        }

        function getProgress(coord, endAngle) {
            var fi = coord.x < cx ? endAngle + Math.PI : endAngle;
            return (fi * 100) / (2 * Math.PI);
        }

        // get mouse position in SVG space
        function getMousePosition(evt) {
            var CTM = svg.getScreenCTM();
            if (evt.touches) { evt = evt.touches[0]; }
            return {
                x: (evt.clientX - CTM.e) / CTM.a,
                y: (evt.clientY - CTM.f) / CTM.d
            };
        }
    }

    getPositionFromProgress(progress) {
        var cx = this.container.offsetWidth / 2;
        var cy = this.container.offsetHeight / 2;
        var angle = progress * 18 / 5;

        return {
            x: cx + this.radius * Math.sin(this.to_radian(angle)),
            y: cy - this.radius * Math.cos(this.to_radian(angle))
        }
    }

    // deprecated
    // draw circle arc from fixed start position to specified angle
    draw_arc(endAngle) {

        var cx = this.container.offsetWidth / 2;
        var cy = this.container.offsetHeight / 2;

        const p = document.createElementNS("http://www.w3.org/2000/svg", "path");

        var endX = cx + this.radius * Math.sin(this.to_radian(endAngle));
        var endY = cy - this.radius * Math.cos(this.to_radian(endAngle));

        var largeArcFlag = endAngle <= 180 ? "0" : "1";

        p.setAttribute("d", "M " + cx + " " + (cy - this.radius) + " A " + this.radius + " " + this.radius + ", 0, " +
            largeArcFlag + ", 1, " + endX + ", " + endY)
        p.setAttribute("stroke-width", 10)
        p.setAttribute("stroke", this.color)
        p.setAttribute("fill", "none");

        return p;
    }

    to_radian(angle) {
        return angle * Math.PI / 180;
    }

    // deprecated
    draw_on_canvas() {
        var canvas = this.container;
        if (canvas.getContext) {
            var ctx = canvas.getContext('2d');
            var X = canvas.width / 2;
            var Y = canvas.height / 2;
            var R = this.radius;
            ctx.beginPath();

            var eangle = this.calc_end_angle(this.value) * Math.PI;
            ctx.arc(X, Y, R, 1.5 * Math.PI, this.calc_end_angle(this.value) * Math.PI, false);
            ctx.lineWidth = 10;
            ctx.strokeStyle = this.color;
            ctx.stroke();

            var ctx2 = canvas.getContext('2d');

            ctx2.beginPath();

            ctx2.arc(X + R * Math.cos(eangle), Y + R * Math.sin(eangle), 12, 0, 2 * Math.PI, false);
            ctx2.lineWidth = 1;
            ctx2.strokeStyle = 'grey';
            ctx2.fillStyle = 'grey';
            ctx2.fill();
            ctx2.stroke();
        }
    }

    // deprecated
    calc_end_angle(value) {
        var x = ((2 * value) / 100) % 2;
        return x - 0.5;
    }
}