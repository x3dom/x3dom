/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

var updateArc = function(min, max)
{
    var centerX = canvas.width/2;
    var centerY = canvas.height/2;
    var radius = canvas.width/2-10;
    
    min = min - Math.PI/2;
    max = max - Math.PI/2;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.arc(centerX, centerY, radius, -0.5 * Math.PI, 0.5 * Math.PI, false);
    context.fillStyle = 'white';
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = '#999';
    context.stroke();
    context.beginPath();
    context.arc(centerX, centerY, radius, min, max, false);
    context.strokeStyle = '#003300';
    context.stroke();
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(centerX + (radius * Math.cos(min)), centerY + (radius * Math.sin(min)));
    context.strokeStyle = '#0000FF';
    context.stroke();
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(centerX + (radius * Math.cos(max)), centerY + (radius * Math.sin(max)));
    context.strokeStyle = '#FF0000';
    context.stroke();
}


function refreshTurntableParams()
{
	var nav = document.getElementById('navType');
	
    var upper = parseFloat($("#upperInput").val());
    var lower = parseFloat($("#lowerInput").val());
    
    if (upper < lower) {
        var str = '0.0 0.0 ' + upper.toFixed(1) + ' ' + lower.toFixed(1);
        nav.setAttribute('typeParams', str);
        updateArc(upper, lower);
    } else {
    	$("#upperInput").val((lower - 0.1).toFixed(1));
    }
    
}
