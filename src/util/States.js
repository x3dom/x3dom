/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/**
 * States namespace
 */
x3dom.States = function (x3dElem) {
    var that = this;
    this.active = false;

    this.viewer = document.createElement('div');
    this.viewer.id = 'x3dom-state-viewer';

    var title = document.createElement('div');
    title.className = 'x3dom-states-head';
    title.appendChild(document.createTextNode('x3dom'));

    var subTitle = document.createElement('span');
    subTitle.className = 'x3dom-states-head2';
    subTitle.appendChild(document.createTextNode('stats'));
    title.appendChild(subTitle);

    this.renderMode = document.createElement('div');
    this.renderMode.className = 'x3dom-states-rendermode-hardware';

    this.measureList = document.createElement('ul');
    this.measureList.className = 'x3dom-states-list';

    this.infoList = document.createElement('ul');
    this.infoList.className = 'x3dom-states-list';

    this.requestList = document.createElement('ul');
    this.requestList.className = 'x3dom-states-list';

    //this.viewer.appendChild(title);
    this.viewer.appendChild(this.renderMode);
    this.viewer.appendChild(this.measureList);
    this.viewer.appendChild(this.infoList);
    this.viewer.appendChild(this.requestList);

    /**
     * Disable the context menu
     */
    this.disableContextMenu = function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.returnValue = false;
        return false;
    };

    /**
     * Add a seperator for thousands to the string
     */
    this.thousandSeperator = function (value) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    /**
     * Return numerical value to fixed length
     */
    this.toFixed = function (value) {
        var fixed = (value < 1) ? 2 : (value < 10) ? 2 : 2;
        return value.toFixed(fixed);
    };

    /**
     *
     */
    this.addItem = function ( list, key, value ) {
        var item = document.createElement('li');
        item.className = 'x3dom-states-item';

        var keyDiv = document.createElement('div');
        keyDiv.className = 'x3dom-states-item-title';
        keyDiv.appendChild(document.createTextNode(key));

        var valueDiv = document.createElement('div');
        valueDiv.className = 'x3dom-states-item-value';
        valueDiv.appendChild(document.createTextNode(value));

        item.appendChild(keyDiv);
        item.appendChild(valueDiv);

        list.appendChild(item);
    };

    /**
     * Update the states.
     */
    this.update = function () {
        if (!x3dElem.runtime && this.updateMethodID !== undefined) {
            clearInterval(this.updateMethodID);
            return;
        }

        var infos = x3dElem.runtime.states.infos;
        var measurements = x3dElem.runtime.states.measurements;

        var renderMode = x3dom.caps.RENDERMODE;

        if ( renderMode == "HARDWARE" ) {
            this.renderMode.innerHTML = "Hardware-Rendering";
            this.renderMode.className = 'x3dom-states-rendermode-hardware';
        } else if ( renderMode == "SOFTWARE" ) {
            this.renderMode.innerHTML = "Software-Rendering";
            this.renderMode.className = 'x3dom-states-rendermode-software';
        }


        //Clear measure list
        this.measureList.innerHTML = "";

        //Create list items
        for (var m in measurements)
        {
			if( measurements.hasOwnProperty( m ) )
			{
			    this.addItem(this.measureList, m, this.toFixed(measurements[m]) );
			}
        }

        //Clear info list
        this.infoList.innerHTML = "";

        //Create list items
        for (var i in infos)
        {
			if( infos.hasOwnProperty( i ) )
			{
                this.addItem(this.infoList, i, this.thousandSeperator(infos[i]) );
			}
        }

        //Clear request list
        this.requestList.innerHTML = "";

        this.addItem(this.requestList, "#ACTIVE", x3dom.RequestManager.activeRequests.length );
        this.addItem(this.requestList, "#TOTAL",  x3dom.RequestManager.totalRequests  );
        this.addItem(this.requestList, "#LOADED", x3dom.RequestManager.loadedRequests );
        this.addItem(this.requestList, "#FAILED", x3dom.RequestManager.failedRequests );
    };

    this.updateMethodID = window.setInterval(function () {
        that.update();
    }, 1000);

    this.viewer.addEventListener("contextmenu", that.disableContextMenu);
};

/**
 * Display the states
 */
x3dom.States.prototype.display = function (value) {
    this.active = (value !== undefined) ? value : !this.active;
    this.viewer.style.display = (this.active) ? "block" : "none";
};
