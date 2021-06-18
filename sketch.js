/*
 * @name Video Canvas
 * @description Load a video with multiple formats and draw it to the canvas.
 * To run this example locally, you will need a running
 * <a href="https://github.com/processing/p5.js/wiki/Local-server">local server</a>.
 */
let mySound;
let isLooping=false;
let inputVideo, outputVideo, inputAnalysis, outputAnalysis;
let frameWidth = 320;
let frameHeight = 240;
let handpose;
let predictions = [];
let oldprediction;
let okeypoint = {};

function preload() {
  soundFormats('mp3', 'ogg', 'wav', 'm4a');
  mySound = loadSound("/assets/1")
}

function setup() {
  createCanvas(frameWidth*2, frameHeight*2);
  colorMode(HSB, 255);
  inputVideo = createCapture(VIDEO);
  // inputVideo = createCapture({
  //   audio: false,
  //   video: {
  //       width: frameWidth,
  //       height: frameHeight
  //   }
  // }, function() {
  //   console.log('capture ready.')
  // });
  inputVideo.elt.setAttribute('playsinline', '');
  inputVideo.size(320,240);
  inputVideo.hide();
  outputVideo = createVideo(["assets/fingers.mov", "assets/fingers.webm"]);
  outputVideo.hide();
  inputAnalysis = createVideo(["assets/fingers.mov", "assets/fingers.webm"]);
  inputAnalysis.hide();
  outputAnalysis = createVideo(["assets/fingers.mov", "assets/fingers.webm"]);
  outputAnalysis.hide();

  handpose = ml5.handpose(inputVideo, modelReady);
  // This sets up an event that fills the global variable "predictions"
    // with an array every time new hand poses are detected
  handpose.on("predict", results => {
    predictions = results;
  });
  background(150);
}

function draw() {
  
  push();
  image(inputAnalysis, 0, 0); // SCREEN 1
  image(outputVideo, 0, 240); //  SCREEN 3
  filter(GRAY);
  pop();
  image(inputVideo, 320, 0); // SCREEN 2
  image(outputAnalysis, 320, 240); // SCREEN 4
  //filter(POSTERIZE, 2);
  drawHandpoints();
}

function modelReady() {
  console.log("Model ready!");
}

function mousePressed() {
  mySound.play()
  if(isLooping){
    inputVideo.noLoop(); // set the video to loop and start playing
  outputVideo.noLoop(); // set the video to loop and start playing
  inputAnalysis.noLoop(); // set the video to loop and start playing
  outputAnalysis.noLoop(); // set the video to loop and start playing
    isLooping = false;
    
  } else {
  inputVideo.loop(); // set the video to loop and start playing
  outputVideo.loop(); // set the video to loop and start playing
  inputAnalysis.loop(); // set the video to loop and start playing
  outputAnalysis.loop(); // set the video to loop and start playing
  isLooping = true;
  }
}

function keyTyped() {
  if (key === 'a') {
    mySound.play();
  } else if (key === 's') {
    mySound.pause();
  }
  // uncomment to prevent any default behavior
  // return false;
}


// A function to draw ellipses and labels over the detected keypoints
function drawHandpoints() {
  //console.log("predictions length: ", predictions.length);

  for (let i = 0; i < predictions.length; i += 1) {
      const prediction = predictions[i];
        for (let j = 0; j < prediction.landmarks.length; j += 1) {
          if(oldprediction) okeypoint = oldprediction.landmarks[j];
          const keypoint = prediction.landmarks[j];
          push();
            fill(j/prediction.landmarks.length*255, 200, 255);
            //text(j, keypoint[0] * 0.5 + 320 + 5, keypoint[1] * 0.5);
            //0: wrist, 4: thumb tip, 8: pointing fingertip, 12: rude fingertip, 16: ring fingertip & 20: pinky tip
            //ellipse(keypoint[0] * 0.5 + 320, keypoint[1] * 0.5, 10, 10);
            line(keypoint[0] * 0.5 + 320, keypoint[1] * 0.5, okeypoint[0] * 0.5 + 320, okeypoint[1] * 0.5)
          pop();
        }
      oldprediction = prediction;
  }
}

