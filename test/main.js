import { CircularSlider } from '../circular_slider.js';

export function init() {
  var options = {
    container: document.getElementById('main'),
    color: '#32a852',
    min: 0,
    max: 100,
    step: 10,
    radius: 40
  };

  var slider1 = new CircularSlider(options);

  slider1.init();

  slider1.setValue(0, onChange);
  var millisecondsToWait = 1000;
  setTimeout(function () {
   // slider1.setValue(50, onChange);
  }, millisecondsToWait);

  
  /*

  var options2 = {
    container: document.getElementById('main'),
    color: '#00FF00',
    min: 0,
    max: 100,
    step: 10,
    radius: 110
  };

  var slider2 = new CircularSlider(options2);

  slider2.init();

  var options3 = {
    container: document.getElementById('main'),
    color: '#0000FF',
    min: 0,
    max: 100,
    step: 10,
    radius: 75
  };

  var slider3 = new CircularSlider(options3);

  slider3.init();
  */
}

function onChange(value) {
  document.getElementById('value').innerHTML = "value = " + value;
}

export function svg() {
  // create the svg element
  var container = document.getElementById("main");
  const svg1 = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  // set width and height
  svg1.setAttribute("width", container.offsetWidth);
  svg1.setAttribute("height", container.offsetHeight);

  // create a circle
  const cir1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  cir1.setAttribute("cx", "75");
  cir1.setAttribute("cy", "75");
  cir1.setAttribute("r", "50");
  cir1.setAttribute("stroke-width", "10");
  cir1.setAttribute("stroke", "gray");
  cir1.setAttribute("fill", "none");

  const p1 = document.createElementNS("http://www.w3.org/2000/svg", "path");

  p1.setAttribute("d", "M 75 25 A 50 50, 0, 0, 1, 125 75")
  p1.setAttribute("stroke-width", 10)
  p1.setAttribute("stroke", "green")
  p1.setAttribute("fill", "none");

  // attach it to the container
  svg1.appendChild(cir1);
  svg1.appendChild(p1);


  // attach container to document
  document.getElementById("main").appendChild(svg1);
}

window.onload = function () {
  init();
}