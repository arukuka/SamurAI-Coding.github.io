var gameLog;
function readAndGo() {
    var reader = new FileReader();
    reader.onload = function(evt) {
        if (evt.target.readyState == FileReader.DONE) {
            gameLog = JSON.parse(evt.target.result);
	    window.location.href = "http:../gameview.html";
	}
    }
    startGame();
}
