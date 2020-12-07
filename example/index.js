import { CircularSlider } from '../lib/circular_slider.js';

export function init() {
  var options = {
    container: document.getElementById('main'),
    color: '#32a852',
    min: 100,
    max: 200,
    step: 25,
    radius: 50
  };

  var slider1 = new CircularSlider(options);

  slider1.init();

  slider1.setValue(125);
  slider1.onChange(onChangeValue1);
  document.getElementById('color1').style.backgroundColor = '#32a852';

  var options2 = {
    container: document.getElementById('main'),
    color: '#5cf054',
    min: 0,
    max: 100,
    step: 10,
    radius: 100
  };

  var slider2 = new CircularSlider(options2);

  slider2.init();
  slider2.setValue(40);
  slider2.onChange(onChangeValue2);
  document.getElementById('color2').style.backgroundColor = '#5cf054';

  var options3 = {
    container: document.getElementById('main'),
    color: '#138aab',
    min: 20,
    max: 1000,
    step: 10,
    radius: 150
  };

  var slider3 = new CircularSlider(options3);

  slider3.init();
  slider3.setValue(500);
  slider3.onChange(onChangeValue3);
  document.getElementById('color3').style.backgroundColor = '#138aab';

  function onChangeValue1(value) {
    document.getElementById('value1').innerHTML = value;
  }

  function onChangeValue2(value) {
    document.getElementById('value2').innerHTML = value;
  }

  function onChangeValue3(value) {
    document.getElementById('value3').innerHTML = value;
  }
}

window.onload = function () {
  init();
}