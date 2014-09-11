var Canvas = require('canvas'),
      Image = Canvas.Image,
    fs = require('graceful-fs');

module.exports = {
  createCanvas: function(width, height) {
    return new Canvas(width, height);
  },
  loadImageData: function(path, callback){
    if (Buffer.isBuffer(path)) {
      load(undefined, path);
    } else {
      fs.readFile(path, load);
    }

    function load(err, data) {
      if (err) {
        throw err;
      }

      // node-canvas will segfault if passed an empty input. Protect from this case.
      // Tracked under https://github.com/LearnBoost/node-canvas/issues/285
      if (!data.length) {
        var hiddenCanvas = new Canvas(0, 0);
        var imageData = context.getImageData(0, 0, 0, 0);

        return callback(imageData, 0, 0);
      }

      var hiddenImage = new Image();
      hiddenImage.src = data;

      var width = hiddenImage.width;
      var height = hiddenImage.height;
      var hiddenCanvas =  new Canvas(width, height);

      var context = hiddenCanvas.getContext('2d');
      context.drawImage(hiddenImage, 0, 0, width, height);

      var imageData = context.getImageData(0, 0, width, height);

      callback(imageData, width, height);
    }
  }
};
