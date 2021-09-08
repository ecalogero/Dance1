/*
 * @name Video Canvas
 * @description Load a video with multiple formats and draw it to the canvas.
 * To run this example locally, you will need a running
 * <a href="https://github.com/processing/p5.js/wiki/Local-server">local server</a>.
 */
let mySound;
let tree;
let polySynth;
let isLooping = false;
let isPlaying = false;
let inputVideo, rocksVideo, shortyGeorgeVideo, rustyDustysVideo, appleJacksVideo;
let frameWidth = innerWidth/2;//320;

let frameHeight = innerHeight/2;//240;
const XDIM = 216;
const YDIM = 384;
let handpose, bodypose;
let predictions = [];
let oldprediction;
let okeypoint = {};
let poses = [];
//let skeletons = [];

const URL = 'https://teachablemachine.withgoogle.com/models/gzCmxF6vb/';
let model, webcam, ctx, labelContainer, maxPredictions, pose, posenetOutput;

// window.preload = () => {
//   soundFormats('mp3', 'ogg', 'wav', 'm4a');
//   mySound = loadSound("/1", () => {console.log("loaded audio");});
// }

function setup() {
  ctx = createCanvas(1366, 768);
  //console.log("setup ctx: ", ctx)
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
  inputVideo.size(376,376);
  inputVideo.hide();
  rocksVideo = createVideo(["./R_web_nosound.mp4", "assets/fingers.webm"]);
  rocksVideo.hide();
  appleJacksVideo = createVideo(["./AJ_web_nosound.mp4", "assets/fingers.webm"]);
  appleJacksVideo.hide();
  rustyDustysVideo = createVideo(["./RD_web_nosound.mp4", "assets/fingers.webm"]);
  rustyDustysVideo.hide();
  shortyGeorgeVideo = createVideo(["./SG_web_nosound.mp4", "assets/fingers.webm"]);
  shortyGeorgeVideo.hide();

  //This creates the hand model using the ml5 library
  //handpose = ml5.handpose(inputVideo, modelReady);
  
  //Here is the one to track a body instead of a hand.
  ///bodypose = ml5.poseNet(inputVideo, modelReady);
  // This sets up an event that fills the global variable "predictions"
    // with an array every time new hand poses are detected
  // handpose.on("pose", results => {
  //   predictions = results;
  // });
 

        const modelURL = URL + 'model.json';
        const metadataURL = URL + 'metadata.json';

        // load the model and metadata
        // Refer to tmPose.loadFromFiles() in the API to support files from a file picker
        model = tmPose.load(modelURL, metadataURL);
        maxPredictions = function(){model.getTotalClasses()};

        // Convenience function to setup a webcam
        // const flip = true; // whether to flip the webcam
        // webcam = new tmPose.Webcam(200, 200, flip); // width, height, flip
        // webcam.setup(); // request access to the webcam
        // webcam.play();
        // window.requestAnimationFrame(loop);

        // append/get elements to the DOM
        //const canvas = document.getElementById('canvas');
        //canvas.width = 200; canvas.height = 200;
        //ctx = canvas.getContext('2d');
        labelContainer = document.getElementById('label-container');
        for (let i = 0; i < maxPredictions; i++) { // and class labels
            labelContainer.appendChild(document.createElement('div'));
        }

  background(150);
  //polySynth = new p5.PolySynth();
}

function draw() {
  push();
  image(rocksVideo, 0, 0); // SCREEN 1
  image(rustyDustysVideo, XDIM, 0); // SCREEN 2
  image(shortyGeorgeVideo, XDIM*2, 0);  // SCREEN 3
  image(appleJacksVideo, XDIM*3, 0);  // SCREEN 4
  image(inputVideo, XDIM*4, 0);  // SCREEN 5
  filter(GRAY);
  pop();
  image(rocksVideo, 0, YDIM); // SCREEN 6
  image(rustyDustysVideo, XDIM, YDIM); // SCREEN 7
  image(shortyGeorgeVideo, XDIM*2, YDIM);  // SCREEN 8
  image(appleJacksVideo, XDIM*3, YDIM);  // SCREEN 9
  //filter(POSTERIZE, 2);
  //drawHandpoints();
  //drawKeypoints();
  //drawSkeleton();
  predict();
}

function modelReady() {
  console.log("Model ready!");
}

function mousePressed() {
  //mySound.play()
  if(isLooping){
    inputVideo.noLoop(); // set the video to loop and start playing
    shortyGeorgeVideo.noLoop(); // set the video to loop and start playing
    rocksVideo.noLoop(); // set the video to loop and start playing
    rustyDustysVideo.noLoop(); // set the video to loop and start playing
    appleJacksVideo.noLoop(); // set the video to loop and start playing
    isLooping = false;
    
  } else {
    inputVideo.loop(); // set the video to loop and start playing
    shortyGeorgeVideo.loop(); // set the video to loop and start playing
    rocksVideo.loop(); // set the video to loop and start playing
    rustyDustysVideo.loop(); // set the video to loop and start playing
    appleJacksVideo.loop();
    isLooping = true;
  }
}

function keyTyped() {
  if (key === 'a') {
    mySound.play();
    isPlaying = true;
  } else if (key === 's') {
    mySound.pause();
    isPlaying = false;
  } else if (key === "l") {
    saveFrames('out', 'png', 1, 16, data => {
      print(data);
    });
  } else if (key === 'c') {
    outputVideo.time(0);
  }
  // uncomment to prevent any default behavior
  // return false;
}

function setMaxPredictions(){
  
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
        playSynth(okeypoint[0], okeypoint[1])
      oldprediction = prediction;
  }
  if (predictions.length > 0) {
    if (isPlaying == false) {
      mySound.play();
      isPlaying = true;
    }
  } else {
    if (isPlaying == true) {
      mySound.pause();
      isPlaying = false;
    }
  }
}

function playSynth(note, vel) {
  userStartAudio();
  // note duration (in seconds)
  let dur = 1.5;
  // time from now (in seconds)
  //let time = 0;
  // velocity (volume, from 0 to 1)
  let root = note * 0.5 + 50;
  // notes can overlap with each other
  polySynth.play(root, vel/240, 0, dur);
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
    // For the pose, loop through all the keypoints
  if(!!poses.length){
    console.log("number of poses: ", poses.length)
    for (let j = 0; j < poses[0].pose.keypoints.length; j += 1) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      const keypoint = poses[0].pose.keypoints[j];
      //console.log("drawKeypoints: x position:", keypoint.position.x);
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x + XDIM*4, keypoint.position.y, 10, 10);
      }
    }
  } else {
    //console.log("No poses detected")
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  if(!!poses.length){
    const skeleton = poses.skeleton;
    // For the skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j += 1) {
      const partA = skeleton[j][0];
      const partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  } else {
    //console.log("Not able to draw skeleton")
  }
}

async function predict() {
  // Prediction #1: run input through posenet
  // estimatePose can take in an image, video or canvas html element
  const result = await model.estimatePose.call(ctx);
  console.log("result after:", result)
  pose = result.pose;
  posenetOutput = result.posenetOutput;
  // Prediction 2: run input through teachable machine classification model
  const prediction = function(){ model.predict(posenetOutput)};

  for (let i = 0; i < maxPredictions; i++) {
      const classPrediction =
          prediction[i].className + ': ' + prediction[i].probability.toFixed(2);
      labelContainer.childNodes[i].innerHTML = classPrediction;
  }
  console.log("predict(): pose: ", pose);
  // finally draw the poses
  drawPose(pose);
}

function drawPose(pose) {
  const myImage = function(){ctx.drawImage(ctx, XDIM*4, 0)};
  console.log("drawpose(pose): ", pose);
  // draw the keypoints and skeleton
  if (pose) {
    
      const minPartConfidence = 0.5;
      tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
  }
}

