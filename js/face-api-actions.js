let messages = new Array(
    "Que bueno es volver a verte",
    "Dios te hablará hoy",
    "Bienvenido a tu casa",
    "Hoy es tu temporada",
    "Todo es posible si lo crees",
    "Con Dios todo es posible",
    );
    
    var msgCount = 0;
    
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
                if (resizedResult.expressions.happy > "0.98") {
                    
                    console.log(msgCount)
                    if(msgCount === 0 || msgCount > 1) {
                        let message = randomMessage()
                        msgCount++
                        redirectAfterSmile(message)
                    }                
                    // faceapi.draw.drawDetections(canvas, resizedResult)
                }
            }
            faceapi.draw.drawFaceExpressions(canvas, resizedResult, minConfidence)
            
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
    
    function redirectAfterSmile(message) {
        modal.style.display = "block";
        document.getElementById("randomMessage").innerHTML = message
        // location.replace("https://media.istockphoto.com/vectors/big-smile-emoticon-with-thumbs-up-vector-id1124532572?k=20&m=1124532572&s=612x612&w=0&h=IXpPDP4EXROUqjakNqxhq-pxrUURTO1jwy7SQKmP6Rw=")
    }
    
    function updateResults() {}
    
    function randomMessage() {
        var randomNum = Math.floor(Math.random() * messages.length);
        return messages[randomNum];
    }
    
    $(document).ready(function() {
        initFaceDetectionControls()
        run()
    })
    
    
    
    //Modal
    var modal = document.getElementById("myModal");
    
    var closeModal = document.getElementsByClassName("close")[0];
    
    closeModal.onclick = function() {
        modal.style.display = "none";
        msgCount = 0;
        console.log("count ", msgCount)
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
    
    // End Modal