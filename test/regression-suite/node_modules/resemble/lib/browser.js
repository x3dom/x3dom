/*globals Image, FileReader, document */

// Browser environment binding. Not currently utilized as a build step is required.

function createCanvas(width, height) {
  var canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  return canvas;
}
function loadImageData( fileData, callback ){
  var hiddenImage = new Image();
  var fileReader = new FileReader();

  fileReader.onload = function (event) {
    hiddenImage.src = event.target.result;
  };

  hiddenImage.onload = function() {

    var hiddenCanvas =  document.createElement('canvas');
    var imageData;
    var width = hiddenImage.width;
    var height = hiddenImage.height;

    hiddenCanvas.width = width;
    hiddenCanvas.height = height;
    hiddenCanvas.getContext('2d').drawImage(hiddenImage, 0, 0, width, height);
    imageData = hiddenCanvas.getContext('2d').getImageData(0, 0, width, height);

    callback(imageData, width, height);
  };

  fileReader.readAsDataURL(fileData);
}
