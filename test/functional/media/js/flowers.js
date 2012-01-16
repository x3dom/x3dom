var e = 5;
var f = 5;
var g = 5;
var h = 5;
var resolution = 150;
var t = 0;
var p = 0;

function initialize() {
     var localci = new Array();
     generateCoordinates(resolution);
     var ci = 0;
     var buf = "";
     for (var i = 0; i < resolution-1; i++) {
     	for (var j = 0; j < resolution-1; j++) {
	     localci[ci] = i*resolution+j;
	     localci[ci+1] = i*resolution+j+1;
	     localci[ci+2] = (i+1)*resolution+j+1;
	     localci[ci+3] = (i+1)*resolution+j;
	     localci[ci+4] = -1;
	     buf += localci[ci]+" "+localci[ci+2]+" "+localci[ci+1]+" "+localci[ci+4]+" ";
	     buf += localci[ci+3]+" "+localci[ci+2]+" "+localci[ci]+" "+localci[ci+4]+" ";
	     ci += 5;
	}
    }
    var ifs = document.getElementById("ifs");
    ifs.setAttribute("coordIndex", buf);
}

function generateCoordinates(resolution) {
     theta = 0.0;
     phi = 0.0;
     delta = (2 * 3.141592653) / (resolution-1);
     var buf = "";
     for ( i = 0; i < resolution; i++) {
     	for ( j = 0; j < resolution; j++) {
		rho = e + f * Math.cos(g * theta + t) * Math.cos(h * phi + p);
		var x = rho * Math.cos(phi) * Math.cos(theta);
		var y = rho * Math.cos(phi) * Math.sin(theta);
		var z = rho * Math.sin(phi);
	     	buf += x+" "+y+" "+z+" ";
		theta += delta;
	}
	phi += delta;
     }
    var crd = document.getElementById("crd");
    crd.setAttribute("point", buf);
}

function animate() {
	choice = Math.floor(Math.random() * 4);
	if (choice == 0) {
		e += Math.floor(Math.random() * 2) * 2 - 1;
	} else if (choice == 1) {
		f += Math.floor(Math.random() * 2) * 2 - 1;
	} else if (choice == 2) {
		g += Math.floor(Math.random() * 2) * 2 - 1;
	} else if (choice == 3) {
		h += Math.floor(Math.random() * 2) * 2 - 1;
	}
	t += 0.5
	p += 0.5;
	if (f < 1) {
		f = 10;
	}
	if (g < 1) {
		g = 4;
	}
	if (h < 1) {
		h = 4;
	}
	generateCoordinates(resolution);
}

initialize();
setInterval(animate, 1000);
