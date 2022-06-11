let forwardTimes = []
    let withBoxes = true

    function onChangeHideBoundingBoxes(e) {
      withBoxes = !$(e.target).prop('checked')
    }

    function updateTimeStats(timeInMs) {
      forwardTimes = [timeInMs].concat(forwardTimes).slice(0, 30)
      const avgTimeInMs = forwardTimes.reduce((total, t) => total + t) / forwardTimes.length
      $('#time').val(`${Math.round(avgTimeInMs)} ms`)
      $('#fps').val(`${faceapi.utils.round(1000 / avgTimeInMs)}`)
    }

    async function onPlay() {
      const videoEl = $('#inputVideo').get(0)

      if(videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded())
        return setTimeout(() => onPlay())


      const options = getFaceDetectorOptions()

      const ts = Date.now()

      const result = await faceapi.detectSingleFace(videoEl, options).withFaceExpressions()

      updateTimeStats(Date.now() - ts)

      if (result) {
        const canvas = $('#overlay').get(0)
        const dims = faceapi.matchDimensions(canvas, videoEl, true)

        const resizedResult = faceapi.resizeResults(result, dims)
        const minConfidence = 0.05

        // console.log("resizedResult-- ", resizedResult.expressions.happy  )
        if (withBoxes) {
          // faceapi.draw.drawDetections(canvas, resizedResult)

          //Valido si esta feliz
          if (resizedResult.expressions.happy > "0.95") {

            console.log("isHappy")

            redirectAfterSmile()

            // faceapi.draw.drawDetections(canvas, resizedResult)
          }
        }
        // faceapi.draw.drawFaceExpressions(canvas, resizedResult, minConfidence)

      }

      setTimeout(() => onPlay())
    }

    async function run() {
      // load face detection and face expression recognition models
      await changeFaceDetector(TINY_FACE_DETECTOR)
      await faceapi.loadFaceExpressionModel('/')
      changeInputSize(224)

      // try to access users webcam and stream the images
      // to the video element
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
      const videoEl = $('#inputVideo').get(0)
      videoEl.srcObject = stream
    }

    function redirectAfterSmile() {
      modal.style.display = "block";
      // location.replace("https://media.istockphoto.com/vectors/big-smile-emoticon-with-thumbs-up-vector-id1124532572?k=20&m=1124532572&s=612x612&w=0&h=IXpPDP4EXROUqjakNqxhq-pxrUURTO1jwy7SQKmP6Rw=")
    }

    function updateResults() {}

    $(document).ready(function() {
      initFaceDetectionControls()
      run()
    })