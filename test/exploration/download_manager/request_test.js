//html element for message text output
var messageElement = document.getElementById('messageElement');

//variables
const numberOfChunks = 60;
var requestUrls   	 = [];
var finishedElements = 0;
var i;

//send requests - all requests have a priority based on their index % 3
//(i.e. highest priority for requests 0, 3, 6 and so on)
for (i = 0; i < numberOfChunks; ++i)
{	
	var numberString = (i <= 9 ? '00' : (i <= 99 ? '0' : '')) + i.toFixed();
		
	var p = i % 5;
	
	var callback = function(i, p) {
		return function() {
			++finishedElements;
			var newElement = document.createElement('strong');
			newElement.textContent = finishedElements + '. [' + i + ' (' + p + ')]'; 
			messageElement.appendChild(newElement);
			messageElement.appendChild(document.createElement('br'));
		};
	}(i, p);
	
	x3dom.DownloadManager.get('data/D_' + numberString + '.bin',
							  callback,
							  p);
}
