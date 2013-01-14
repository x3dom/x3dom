/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/**
 * States namespace
 */
x3dom.States = function()
{
	var that = this;
	
	/**Switch between the available States */
	this.disableContextMenu = function (e) 
	{
		e.preventDefault();
        e.stopPropagation();
        e.returnValue = false;
        return false;	
	};
	
	/**Switch between the available States */
	this.switchState = function () 
	{
		var first = null;
		var found = false;
		
		for ( var state in that.states ) {
			if (first == null) {
				first = state;
			}
			
			if (found == true) {
				that.actState = state;
				found = false;
				break;
			} else if (state == that.actState) {
				found = true;
			}
		}
		
		if (found) {
			that.actState = first;
		}
		
		that.update();
	};
	
	/**Switch between the available States */
	this.toFixed = function(value)
	{
		var fixed = (value < 1) ? 3 : (value < 10) ? 2 : 1;
		return value.toFixed(fixed);
	}
	
	/**Switch between the available States */
	this.thousandSeperator = function(value) 
	{
		return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	
	this.canvas = document.createElement("canvas");
	this.canvas.id = "x3dom-state-canvas";
	this.canvas.addEventListener("click", that.switchState);
	this.canvas.addEventListener("contextmenu", that.disableContextMenu);
	
	this.active			= false;
	this.states 		= [];
	this.infos			= [];
	this.numInfos		= 0;
	this.samplingRate	= 10;
	this.actState		= null;
	this.stateWidth 	= 140;
	this.stateHeigth	= 50;
	this.statePadding	= 2;
	this.color			= "rgb(200, 200, 200)";
	this.ctx 			= this.canvas.getContext("2d");
};

/**
 * 
 */
x3dom.States.prototype.display = function(value) 
{
	this.active = (value !== undefined) ? value : !this.active;
	this.canvas.style.display = (this.active) ? "block" : "none";
}

/**
 * 
 */
x3dom.States.prototype.update = function()
{
	if (this.active)
	{
		//Clear the canvas and update context
		this.canvas.width  = this.stateWidth  + (this.statePadding * 2);
		this.canvas.height = this.stateHeigth + (this.statePadding * 2) + (this.numInfos * 15);
		//this.ctx = this.canvas.getContext("2d");
		
		//Draw background rect
		this.ctx.fillStyle = "rgba(50, 50, 50, 0.85)";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		
		this.ctx.textAlign = "left";
		this.ctx.textBaseline = "top";
		
		
		var state = this.actState;
		
		var offsetX = this.statePadding;
		var offsetY = this.statePadding;

		this.ctx.globalAlpha = 0.4;
		this.ctx.fillStyle = this.color;
		this.ctx.fillRect(offsetX, offsetY, this.stateWidth, this.stateHeigth);

		this.ctx.globalAlpha = 1.0;
		this.ctx.font = "bold 10px Arial";
		this.ctx.fillText(state, offsetX+this.statePadding, offsetY);
		
		if ( !this.states[state].calc ) {
		
			this.ctx.globalAlpha = 0.4;
			for (var i=0; i<this.states[state].average.length; i++)
			{
				var percent = this.states[state].average[i] / this.states[state].clip;
				var height = -40 * percent;
				this.ctx.fillRect(offsetX + i, offsetY+this.stateHeigth, 1, height);
			}
			
			this.ctx.globalAlpha = 1.0;
			this.ctx.font = "bold 30px Arial";
			
			//Output Average
			var last	= this.states[state].average.length-1;
			var average = this.toFixed( this.states[state].average[last] );
			this.ctx.fillText(average, offsetX+this.statePadding, offsetY+19);
			
			//Font size for min/max
			this.ctx.font = "bold 10px Arial";
			
			//Output Max
			var max = this.states[state].max;
			var dim = this.ctx.measureText(max);
			this.ctx.fillText(max, this.stateWidth-dim.width, offsetY);
			
			//Output Min
			var min = this.states[state].min;
			var dim = this.ctx.measureText(min);
			this.ctx.fillText(min, this.stateWidth-dim.width, offsetY+37);
		
		} else {
			this.ctx.globalAlpha = 1.0;
			this.ctx.font = "bold 12px Arial";
			this.ctx.fillText("Calculating...", offsetX+38, offsetY+18);
			
			// workaround for broken Mac stats since forcing redraw kills Mac Browser
			this.states[state].calc = false;
		}
		
		//Draw infos
		var i = 0;
		for ( var info in this.infos )
		{
			this.ctx.font = "bold 9px Arial";
			this.ctx.fillStyle = "rgb(200, 200, 200)";
			this.ctx.fillText(info, offsetX+this.statePadding, offsetY+54+(i*14));
			var data = this.thousandSeperator(this.infos[info].data);
			var dim = this.ctx.measureText(data);
			this.ctx.fillText(data, this.stateWidth-dim.width, offsetY+54+(i*14));
			i++;
		}
	}
};

/**
 * 
 */
x3dom.States.prototype.addInfo = function(info, value)
{
	if (this.infos[info] === undefined)
	{
		this.numInfos++;	
		this.infos[info] = {};
	}
	
	this.infos[info].data = value;
};

/**
 * 
 */
x3dom.States.prototype.removeInfo = function(info)
{
	if (this.infos[info] !== undefined)
	{
		delete this.infos[info];
		this.numInfos--;
	}
};


/**
 * 
 */
x3dom.States.prototype.addState = function(state, value, fixed, color)
{
	if (this.states[state] === undefined)
	{
		this.states[state]			= {};
		this.states[state].data		= [];
		this.states[state].sum 		= 0;
		this.states[state].min 		= 99;
		this.states[state].max 		= 0;
		this.states[state].calc 	= true;
		this.states[state].average 	= [];
		
		if (this.actState == null) 
		{
			this.actState = state;
		}
	}
	
	this.states[state].sum += value;
	this.states[state].data.push(value);
	
	if (this.states[state].data.length  > this.samplingRate)
	{
		this.states[state].sum -= this.states[state].data[0];
		this.states[state].data.shift();
	}
	
	var average = this.states[state].sum / this.states[state].data.length;
	
	this.states[state].average.push( average );
	
	if (this.states[state].average.length > this.stateWidth) {
		this.states[state].average.shift();
    	this.states[state].calc = false;
	}
	
	if(!this.states[state].calc) {
		this.states[state].min = this.toFixed( Math.min(average, this.states[state].min) );
		this.states[state].max = this.toFixed( Math.max(average, this.states[state].max) );
		this.states[state].clip = this.states[state].max * 1.2;
	}
};

/**
 * 
 */
x3dom.States.prototype.removeState = function(state)
{
	if (this.states[state] !== undefined)
	{
		if (state === this.actState)
		{
			this.switchState();
		}
		delete this.states[state];
	}
};
