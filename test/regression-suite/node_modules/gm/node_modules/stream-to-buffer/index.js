module.exports = function streamToBuffer(stream, callback) {
  var done = false
  var buffers = []

  stream.on('data', function (data) {
    buffers.push(data)
  })

  stream.on('end', function () {
    if (done)
      return

    done = true
    callback(null, Buffer.concat(buffers))
    buffers = null
  })

  stream.on('error', function (err) {
    done = true
    buffers = null
    callback(err)
  })
}