if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('sw.js')
      .then(reg => console.log('Service Worker: Registered (Pages)'))
      .catch(err => console.log(`Service Worker: Error: ${err}`));
  });
}

import './styles/index.scss';
import * as tf from '@tensorflow/tfjs';
import yolo from 'tfjs-yolo';

const loader = document.getElementById('loader');
const spinner = document.getElementById('spinner');
const webcam = document.getElementById('webcam');
const wrapper = document.getElementById('webcam-wrapper');
const rects = document.getElementById('rects');
const v3 = document.getElementById('v3');
const v1tiny = document.getElementById('v1tiny');
const v2tiny = document.getElementById('v2tiny');
const v3tiny = document.getElementById('v3tiny');

let myYolo;
let selected;

(async function main() {
  try {
    await setupWebCam();

    v3.addEventListener('click', () => load(v3));
    v1tiny.addEventListener('click', () => load(v1tiny));
    v2tiny.addEventListener('click', () => load(v2tiny));
    v3tiny.addEventListener('click', () => load(v3tiny));

    run();
  } catch (e) {
    console.error(e);
  }
})();

async function setupWebCam() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const stream = await navigator.mediaDevices.getUserMedia({
      'audio': false,
      'video': { facingMode: 'environment' }
    });
    window.stream = stream;
    webcam.srcObject = stream;
  }
}

async function load(button) {
  if (button == v3) {
    var r = confirm("Full YOLO inference is slow in browser and may take 30+ seconds to predict one picture. Do you want to continue?");
    if (!r) {
      return;
    }
  }

  if (myYolo) {
    myYolo.dispose();
    myYolo = null;
  }

  rects.innerHTML = '';
  loader.style.display = 'block';
  spinner.style.display = 'block';
  setButtons(button);

  setTimeout(async () => {
    switch (button) {
      case v3:
        progress(60);
        myYolo = await yolo.v3();
        break;
      case v1tiny:
        progress(16);
        myYolo = await yolo.v1tiny();
        break;
      case v2tiny:
        progress(11);
        myYolo = await yolo.v2tiny();
        break;
      default:
        progress(9);
        myYolo = await yolo.v3tiny();
    }
  }, 200);
}

function setButtons(button) {
  v3.className = '';
  v1tiny.className = '';
  v2tiny.className = '';
  v3tiny.className = '';
  button.className = 'selected';
  selected = button;
}

function progress(totalModel) {
  let cnt = 0;
  Promise.all = (all => {
    return function then(reqs) {
      if (reqs.length === totalModel && cnt < totalModel * 2)
        reqs.map(req => {
          return req.then(r => {
            loader.setAttribute('percent', (++cnt / totalModel * 50).toFixed(1));
            if (cnt === totalModel * 2) {
              loader.style.display = 'none';
              spinner.style.display = 'none';
              loader.setAttribute('percent', '0.0');
            }
          });
        });
      return all.apply(this, arguments);
    }
  })(Promise.all);
}

async function run() {
  let interval = 1;
  if (myYolo) {
    let threshold = .3;
    if (selected == v3tiny)
      threshold = .2;
    else if (selected == v3)
      interval = 10;
    await predict(threshold);
  }
  setTimeout(run, interval * 100);
}

async function predict(threshold) {
  console.log(`Start with ${tf.memory().numTensors} tensors`);

  const start = performance.now();
  const boxes = await myYolo.predict(webcam, { scoreThreshold: threshold });
  const end = performance.now();

  console.log(`Inference took ${end - start} ms`);
  console.log(`End with ${tf.memory().numTensors} tensors`);

  drawBoxes(boxes);
}

let colors = {};

function drawBoxes(boxes) {
  console.log(boxes);
  rects.innerHTML = '';

  const cw = webcam.clientWidth;
  const ch = webcam.clientHeight;
  const vw = webcam.videoWidth;
  const vh = webcam.videoHeight;

  const scaleW = cw / vw;
  const scaleH = ch / vh;

  wrapper.style.width = `${cw}px`;
  wrapper.style.height = `${ch}px`;

  boxes.map((box) => {
    if (!(box['class'] in colors)) {
      colors[box['class']] = '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    const rect = document.createElement('div');
    rect.className = 'rect';
    rect.style.top = `${box['top'] * scaleH}px`;
    rect.style.left = `${box['left'] * scaleW}px`;
    rect.style.width = `${box['width'] * scaleW - 4}px`;
    rect.style.height = `${box['height'] * scaleH - 4}px`;
    rect.style.borderColor = colors[box['class']];

    const text = document.createElement('div');
    text.className = 'text';
    text.innerText = `${box['class']} ${box['score'].toFixed(2)}`;
    text.style.color = colors[box['class']];

    rect.appendChild(text);
    rects.appendChild(rect);
  });
}