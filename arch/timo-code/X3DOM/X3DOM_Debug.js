x3dom.debug = {
	
	isMinimized: true,
	
	isFirebugEnabled: false, 
	
	enable: function()
	{
		try{
			if (console) {
				x3dom.debug.isFirebugEnabled = true;
			}
		} catch (err){
			x3dom.debug.isFirebugEnabled = false;
		}
		
		var debugView = document.createElement("div");
		debugView.id = "DebugView";
		debugView.style.position = "absolute";
		debugView.style.left = "0px";
		debugView.style.top = "0px";
		debugView.style.width = "100%";
		debugView.style.borderBottom = "2px solid #666666";
		debugView.style.fontFamily = "Arial, Helvetica, sans-serif";
		debugView.style.backgroundColor = "#FFF";	
		document.body.appendChild(debugView);
		//Head
		var head = document.createElement("div");
		head.style.height = "32px";
		head.style.background = "url(../images/headback02.png) repeat-x";
		debugView.appendChild(head);
		//Caption
		var caption = document.createElement("div");
		caption.style.cssFloat = "left";
		caption.style.marginTop = "6px";
		caption.style.marginLeft = "10px";
		caption.style.fontSize = "16px";
		caption.style.fontWeight = "bold";
		caption.style.color = "#666666";
		caption.innerHTML = "X3DOM DebugView";
		head.appendChild(caption);
		//Button Container
		var buttons = document.createElement("div");
		buttons.style.marginTop = "9px";
		buttons.style.marginRight = "10px";
		buttons.style.cssFloat = "right";
		head.appendChild(buttons);
		//Button IMG
		var buttonIMG = document.createElement("img");
		buttonIMG.id = "DebugView_Buttons";
		buttonIMG.src = "../images/minimize.png";
		buttonIMG.title = "Minimize DebugView";
		buttonIMG.alt = "Minimize DebugView";
		buttonIMG.setAttribute("onClick", "x3dom.debug.minimize_maximize();");
		buttons.appendChild(buttonIMG);
		//ScrollView
		var scrollView = document.createElement("div");
		if(x3dom.debug.isMinimized){
			scrollView.style.display = "none";
		}
		scrollView.id = "DebugView_ScrollView";
		scrollView.style.height = "200px";
		scrollView.style.overflow = "scroll";
		debugView.appendChild(scrollView);
		//Table
		var table = document.createElement("table");
		table.id = "DebugView_Table";
		table.style.fontSize = "12px";
		table.style.borderCollapse = "collapse";
		scrollView.appendChild(table);	
	},
	
	info: function(info)
	{
		var tr = document.createElement("tr");
		document.getElementById("DebugView_Table").appendChild(tr);
		var icon = document.createElement("td");
		icon.style.width = "20px";
		icon.style.textAlign = "center";
		tr.appendChild(icon);
		var iconIMG = document.createElement("img");
		iconIMG.src = "../images/info02.png";
		icon.appendChild(iconIMG);
		var text = document.createElement("td");
		text.style.width = "100%";
		text.style.color = "#66CCCC";
		text.style.borderBottom = "1px solid #CCCCCC";
		text.style.borderCollapse = "collapse";
		text.innerHTML = info;
		tr.appendChild(text);
		
		if(x3dom.debug.isFirebugEnabled)
			console.info(info);
	},
	
	warning: function(warning)
	{
		var tr = document.createElement("tr");
		document.getElementById("DebugView_Table").appendChild(tr);
		var icon = document.createElement("td");
		icon.style.width = "20px";
		icon.style.textAlign = "center";
		tr.appendChild(icon);
		var iconIMG = document.createElement("img");
		iconIMG.src = "../images/warning02.png";
		icon.appendChild(iconIMG);
		var text = document.createElement("td");
		text.style.width = "100%";
		text.style.color = "#FF9900";
		text.style.borderBottom = "1px solid #CCCCCC";
		text.style.borderCollapse = "collapse";
		text.innerHTML = warning;
		tr.appendChild(text);
		
		if(x3dom.debug.isFirebugEnabled)
			console.warn(warning);
	},
	
	error: function(error)
	{
		var tr = document.createElement("tr");
		document.getElementById("DebugView_Table").appendChild(tr);
		var icon = document.createElement("td");
		icon.style.width = "20px";
		icon.style.textAlign = "center";
		tr.appendChild(icon);
		var iconIMG = document.createElement("img");
		iconIMG.src = "../images/block02.png";
		icon.appendChild(iconIMG);
		var text = document.createElement("td");
		text.style.width = "100%";
		text.style.color = "#FF0000";
		text.style.borderBottom = "1px solid #CCCCCC";
		text.style.borderCollapse = "collapse";
		text.innerHTML = error;
		tr.appendChild(text);
		
		if(x3dom.debug.isFirebugEnabled)
			console.error(error);
	},
	
	minimize_maximize: function()
	{
		if(x3dom.debug.isMinimized){
			document.getElementById("DebugView_ScrollView").style.display = "block";
			document.getElementById("DebugView_Buttons").src = "../images/minimize.png";
			document.getElementById("DebugView_Buttons").alt = "Minimize DebugView";
			document.getElementById("DebugView_Buttons").title = "Minimize DebugView";
			x3dom.debug.isMinimized = false;
		}else{
			document.getElementById("DebugView_ScrollView").style.display = "none";
			document.getElementById("DebugView_Buttons").src = "../images/maximize.png";
			document.getElementById("DebugView_Buttons").alt = "Maximize DebugView";
			document.getElementById("DebugView_Buttons").title = "Maximize DebugView";
			x3dom.debug.isMinimized = true;
		}
	}
	
};