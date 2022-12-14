const video = document.getElementById('video')
var text = '';

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(''),
  faceapi.nets.faceLandmark68Net.loadFromUri(''),
  faceapi.nets.faceRecognitionNet.loadFromUri(''),
  faceapi.nets.faceExpressionNet.loadFromUri('')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

    if(detections && detections[0] && detections[0].expressions)
    {
        if(!text)
          text = JSON.stringify(detections[0].expressions);
        else
        text += `,${JSON.stringify(detections[0].expressions)}`;
    }
  }, 100)
})


setInterval(async () => {

  if(text)
  {
    var blob = new Blob([`{"Emotions":[${text}]}`],
              { type: "text/plain;charset=utf-8" });

    saveAs(blob, "emotions.txt");      
  }

  text = '';
}, 60000)