/*function dump(obj) {
    var s = '';
    for (var i in obj) s += i + ' ';
    log(s);
}*/

// Add some JS1.6 Array functions:
// (This only includes the non-prototype versions, because otherwise it messes up 'for in' loops)

if (! Array.forEach) {
    Array.forEach = function (array, fun, thisp) {
        var len = array.length;
        for (var i = 0; i < len; i++)
            if (i in array)
                fun.call(thisp, array[i], i, array);
    }
}

if (! Array.map) {
    Array.map = function(array, fun, thisp) {
        var len = array.length;
        var res = [];
        for (var i = 0; i < len; i++)
            if (i in array)
                res[i] = fun.call(thisp, array[i], i, array);
        return res;
    };
}

if (! Array.filter) {
    Array.filter = function(array, fun, thisp) {
        var len = array.length;
        var res = [];
        for (var i = 0; i < len; i++) {
            if (i in array) {
                var val = array[i];
                if (fun.call(thisp, val, i, array))
                    res.push(val);
            }
        }
        return res;
    };
}

function setupX3D(x3d_node) {
    var canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');

    // TODO: should keep the X3D node rather than replacing it, so <style>X3D { border: ... }</style> etc works

    // TODO: width/height should maybe depend on rendered size, not explicit attributes
    canvas.width = x3d_node.getAttribute('width');
    canvas.height = x3d_node.getAttribute('height');
    canvas.setAttribute('style', x3d_node.getAttribute('style'));

    var log_element = document.createElementNS('http://www.w3.org/1999/xhtml', 'p');
    log_element.setAttribute('class', 'log');
    var log_frame_element = document.createElementNS('http://www.w3.org/1999/xhtml', 'p');
    log_frame_element.setAttribute('class', 'log');
    var fps_element = document.createElementNS('http://www.w3.org/1999/xhtml', 'p');

    function log(msg) {
        log_element.appendChild(document.createTextNode(msg+"\n"));
    }

    function log_frame(msg) {
        log_frame_element.appendChild(document.createTextNode(msg+"\n"));
    }

    function log_frame_clear() {
        log_frame_element.innerHTML = '';
    }

    function assert(c, msg) {
        if (! c) {
            log("Assertion failed in " + assert.caller.name + ': ' + msg);
        }
    }

    var container = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
    container.appendChild(canvas);
    container.appendChild(log_element);
    container.appendChild(log_frame_element);
    container.appendChild(fps_element);

    x3d_node.parentNode.replaceChild(container, x3d_node);
    var ctx = gfx_glweb20(canvas) || gfx_opera3d(canvas);
    if (! ctx) {
        log('No suitable rendering engine is available');
        return;
    }
    log('Selected rendering engine: ' + ctx.getName());

    var fps_target = 2000;
    var fps_t0 = new Date(), fps_n = 0;
    var t = 0;
    function tick() {
        log_frame_clear();
        if (++fps_n == 10) {
            fps_element.textContent = fps_n*1000 / (new Date() - fps_t0) + ' fps';
            fps_t0 = new Date();
            fps_n = 0;
        }
        try {
            doc.advanceTime(t);
            doc.render(ctx);
        } catch (e) {
            log(e);
            throw e;
        }
        t += 1/fps_target;
    };

    var doc = new X3DDocument(canvas, ctx, { assert: assert, log: log, log_frame: log_frame, log_frame_clear: log_frame_clear });
    doc.onload = function () {
        setInterval(tick, 1000/fps_target);
    };
    doc.onerror = function () { alert('Failed to load X3D document') };
    doc.load(x3d_node);

    var mouse_dragging = false;
    var mouse_drag_x, mouse_drag_y;
    canvas.addEventListener('mousedown', function (evt) {
        if (evt.button == 0) {
            mouse_drag_x = evt.screenX; // screenX seems the least problematic way of getting coordinates
            mouse_drag_y = evt.screenY;
            mouse_dragging = true;
        }
    }, false);
    canvas.addEventListener('mouseup', function (evt) {
        if (evt.button == 0)
            mouse_dragging = false;
    }, false);
    canvas.addEventListener('mouseout', function (evt) {
        mouse_dragging = false;
    }, false);
    canvas.addEventListener('mousemove', function (evt) {
        if (! mouse_dragging) return;
        var dx = evt.screenX - mouse_drag_x;
        var dy = evt.screenY - mouse_drag_y;
        mouse_drag_x = evt.screenX;
        mouse_drag_y = evt.screenY;
        doc.ondrag(dx, dy);
    }, false);

}
