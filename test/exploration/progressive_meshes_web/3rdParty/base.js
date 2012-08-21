'use strict';

// TODO: namespace.

function never() {
  return false;
}

function clamp(val, minVal, maxVal) {
  return (val < minVal) ? minVal : ((val > maxVal) ? maxVal : val);
}

// DOM.

function id(id) {
  return document.getElementById(id);
}

function preventDefaultAction(evt) {
  evt.preventDefault();
}

function preventSelection(dom) {
  // TODO: Use PreventDefaultAction?
  dom.onselectstart = never;
  dom.onmousedown = never;
}

function addListeners(dom, listeners) {
  // TODO: handle event capture, object binding.
  for (var key in listeners) {
    dom.addEventListener(key, listeners[key]);
  }
}

function removeListeners(dom, listeners) {
  // TODO: handle event capture, object binding.
  for (var key in listeners) {
    dom.removeEventListener(key, listeners[key]);
  }
}

// drag(dx, dy, evt)
function addDragHandler(dom, drag) {
  var prevX_, prevY_;

  var LISTENERS = {
    mousemove: function(evt) {
      drag(evt.screenX - prevX_, evt.screenY - prevY_, evt);
      prevX_ = evt.screenX;
      prevY_ = evt.screenY;
    },
    mouseup: function() {
      removeListeners(document, LISTENERS);
    }
  };

  dom.addEventListener('mousedown', function(evt) {
    prevX_ = evt.screenX;
    prevY_ = evt.screenY;
    addListeners(document, LISTENERS);
  });
}

// wheel(dx, dy, evt)
function addWheelHandler(dom, wheel) {
  if (typeof dom.onmousewheel !== 'undefined') {
    dom.addEventListener('mousewheel', function(evt) {
      if (typeof evt.wheelDeltaX !== 'undefined') {
        wheel(evt.wheelDeltaX, evt.wheelDeltaY, evt);
      } else {
        wheel(0, evt.wheelDelta, evt);
      }
    });
  } else {  // Gecko
    dom.addEventListener('MozMousePixelScroll', function(evt) {
      var detail = evt.detail;
      if (evt.axis === evt.HORIZONTAL_AXIS) {
        wheel(detail, 0, evt);
      } else {
        wheel(0, -detail, evt);
      }
    });
  }
};

// Shim layer with setTimeout fallback, adapted from:
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame || 
  window.msRequestAnimationFrame || 
  function(callback, dom_unused) {
    window.setTimeout(callback, 16);  // 16ms ~ 60Hz
  };

// XMLHttpRequest stuff.
function getHttpRequest(url, onload) {
  var req = new XMLHttpRequest();
  req.onload = function() { onload(req); };
  req.open('GET', url, true);
  req.send(null);
};
