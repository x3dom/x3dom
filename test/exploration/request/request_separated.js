//html element for message text output
var strongTextElements = document.getElementsByTagName("strong");
var messageElement = strongTextElements[0];

//variables
const totalChunks = 300;
var loadedChunks = 0;
var i;
var startTimer;

//counter increase callback function
var increaseCounter = function()
{
	loadedChunks += 1;
	messageElement.textContent = "Loaded (" + loadedChunks + " / " + totalChunks + ")";
	if (loadedChunks === totalChunks)
		messageElement.textContent += ' in ' + (new Date() - startTimer) + ' ms';
};

//create a request array, setup requests
var requests = [];
for (i = 0; i < totalChunks; i += 1)
{
	(function()
	{
		var fileIndex = i % (totalChunks / 3);		
		var numberString = (fileIndex <= 9 ? '00' : (fileIndex <= 99 ? '0' : '')) + fileIndex.toFixed();
		
		var letter = (i < (totalChunks / 3) ? 'A' : (i < (2 * totalChunks / 3) ? 'B' : 'C'));
		
		requests[i] = new XMLHttpRequest();
		requests[i].onload = increaseCounter;
				
		requests[i].open("GET", encodeURI("data/" + letter + "_" + numberString + ".bin"), true);
		requests[i].responseType = "arraybuffer";
	})();
}

//send requests
startTimer = new Date();
for (i = 0; i < totalChunks; i += 1)
{
	requests[i].send();
}
