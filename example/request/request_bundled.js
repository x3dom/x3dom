//html element for message text output
var strongTextElements = document.getElementsByTagName("strong");
var messageElement = strongTextElements[0];

//variables
const totalChunks = 300;
const chunksizeInByte = 1024*1024*1.0;
var loadedChunks = 0;
var i;
var startTimer;

//counter increase callback function
var increaseCounter = function()
{
	loadedChunks += 3;
	messageElement.textContent = "Loaded (" + loadedChunks + " / " + totalChunks + ")";
	if (loadedChunks === totalChunks)
		messageElement.textContent += ' in ' + (new Date() - startTimer) + ' ms';
};

//create a request array, setup requests
var requests = [];
for (i = 0; i < (totalChunks / 3); i += 1)
{
	(function()
	{
		var fileIndex = Math.floor(i/3);
		var numberString = (fileIndex <= 9 ? '00' : (fileIndex <= 99 ? '0' : '')) + fileIndex.toFixed();
		
		requests[i] = new XMLHttpRequest();
		requests[i].onload = increaseCounter;
		
		requests[i].open('GET', encodeURI('data/D_' + numberString + '.bin'), true);
		requests[i].responseType = 'arraybuffer';
	})();
}

//send requests
startTimer = new Date();
for (i = 0; i < (totalChunks / 3); i += 1)
{
	requests[i].send();
}
