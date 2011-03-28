// Tests loader
// adds menu as well as stylesheet to tests
// the only file to include in the HTML for tests is this one

var _init = function() {
	var head = document.getElementsByTagName('head')[0];
	var css = document.createElement('link');
	css.type = 'text/css';
	css.rel = 'stylesheet';
	css.href = 'media/css/tests.css';
	css.media = 'screen';
	head.appendChild(css);

	var nav = document.createElement("nav");
	nav.innerHTML = '<a href="index.html">back to test index</a>';
	document.body.insertBefore(nav, document.body.firstChild);

//	<nav><a href="index.html">back to test index</a></nav>
};



// dom loaded shorthand http://www.kryogenix.org/days/2007/09/26/shortloaded
(function(i) {var u =navigator.userAgent;var e=/*@cc_on!@*/false; var st = 
setTimeout;if(/webkit/i.test(u)){st(function(){var dr=document.readyState;
if(dr=="loaded"||dr=="complete"){i()}else{st(arguments.callee,10);}},10);}
else if((/mozilla/i.test(u)&&!/(compati)/.test(u)) || (/opera/i.test(u))){
document.addEventListener("DOMContentLoaded",i,false); } else if(e){     (
function(){var t=document.createElement('doc:rdy');try{t.doScroll('left');
i();t=null;}catch(e){st(arguments.callee,0);}})();}else{window.onload=i;}})(_init);