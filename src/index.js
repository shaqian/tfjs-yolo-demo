import yolo from 'tfjs-yolo';
import * as tf from '@tensorflow/tfjs';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let myYolo;

(async function main() {
  try {
    myYolo = await yolo.v2tiny();
    var img = new Image();
    img.onload = async function () {
      canvas.height = img.height;
      canvas.width = img.width;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      await run();
    }
    img.src = "./dist/person.jpg";
  } catch(e) {
    console.error(e);
  }
})();

async function run() {
  console.log("Start with tensors: " + tf.memory().numTensors);
  const boxes = await myYolo(canvas);
  console.log(boxes);
  boxes.map((box) => {
    ctx.lineWidth = 2;
    ctx.fillStyle = "red";
    ctx.strokeStyle = "red";
    ctx.rect(box["left"], box["top"], box["width"], box["height"]);
    ctx.fillText(box["class"], box["left"] + 5, box["top"] + 10);
    ctx.stroke();
  });
  console.log("End with tensors: " + tf.memory().numTensors);
}
