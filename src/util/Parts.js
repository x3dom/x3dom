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
 *  Parts Object is return
 */
x3dom.Parts = function(multiPart, ids, colorMap, visibilityMap)
{
    var parts = this;
    this.multiPart = multiPart;
    this.ids = ids;
    this.colorMap = colorMap;
    this.visibilityMap = visibilityMap;

    /**
     *
     * @param color
     */
    this.setColor = function(color) {

        var i, x, y;

        if (color.split(" ").length == 3) {
            color += " 1";
        }

        var colorRGBA = x3dom.fields.SFColorRGBA.parse(color);

        if (ids.length && ids.length > 1) //Multi select
        {
            var pixels = parts.colorMap.getPixels();

            for(i=0; i<parts.ids.length; i++) {
                if (this.multiPart._highlightedParts[parts.ids[i]]){
                    this.multiPart._highlightedParts[parts.ids[i]] = colorRGBA;
                } else {
                    pixels[parts.ids[i]] = colorRGBA;
                }
            }

            parts.colorMap.setPixels(pixels);
        }
        else //Single select
        {
            if (this.multiPart._highlightedParts[parts.ids[0]]){
                this.multiPart._highlightedParts[parts.ids[0]] = colorRGBA;
            } else {
                x = parts.ids[0] % parts.colorMap.getWidth();
                y = Math.floor(parts.ids[0] / parts.colorMap.getHeight());
                parts.colorMap.setPixel(x, y, colorRGBA);
            }
        }
    };


    /**
     * Returns the RGB string representation of a color
     * @returns {String}
     */
    this.getColorRGB = function() {
        var str = this.getColorRGBA();

        var values = str.split(" ");

        return values[0] + " " + values[1] + " " + values[2];
    };

    /**
     * Returns the RGBA string representation of a color
     * @returns {String}
     */
    this.getColorRGBA = function() {
        var x, y;

        //in case of multi select, this function returns the color of the first object
        var colorRGBA = this.multiPart._originalColor[parts.ids[0]];

        if (this.multiPart._highlightedParts[parts.ids[0]]){
            colorRGBA = this.multiPart._highlightedParts[parts.ids[0]];
        } else {
            x = parts.ids[0] % parts.colorMap.getWidth();
            y = Math.floor(parts.ids[0] / parts.colorMap.getHeight());
            colorRGBA = parts.colorMap.getPixel(x, y);
        }

        return colorRGBA.toString();
    };

	/**
     *
     */
    this.resetColor = function() {

        var i, x, y, colorRGBA;
		
        if (ids.length && ids.length > 1) //Multi select
        {
            var pixels = parts.colorMap.getPixels();

            for(i=0; i<parts.ids.length; i++) {
				colorRGBA = this.multiPart._originalColor[parts.ids[i]];
			
                if (this.multiPart._highlightedParts[parts.ids[i]]){
                    this.multiPart._highlightedParts[parts.ids[i]] = colorRGBA;
                } else {
                    pixels[parts.ids[i]] = colorRGBA;
                }
            }

            parts.colorMap.setPixels(pixels);
        }
        else //Single select
        {
			colorRGBA = this.multiPart._originalColor[parts.ids[0]];
            if (this.multiPart._highlightedParts[parts.ids[0]]){
                this.multiPart._highlightedParts[parts.ids[0]] = colorRGBA;
            } else {
                x = parts.ids[0] % parts.colorMap.getWidth();
                y = Math.floor(parts.ids[0] / parts.colorMap.getHeight());
                parts.colorMap.setPixel(x, y, colorRGBA);
            }
        }
    };

    /**
     *
     * @param transparency
     */
    this.setTransparency = function(transparency) {

        var i, x, y;

        if (ids.length && ids.length > 1) //Multi select
        {
            var pixels = parts.colorMap.getPixels();

            for(i=0; i<parts.ids.length; i++) {
                if (this.multiPart._highlightedParts[parts.ids[i]]){
                    this.multiPart._highlightedParts[parts.ids[i]].a = 1.0 - transparency;
                } else {
                    pixels[parts.ids[i]].a = 1.0 - transparency;
                }
            }

            parts.colorMap.setPixels(pixels);
        }
        else //Single select
        {
            if (this.multiPart._highlightedParts[parts.ids[0]]){
                this.multiPart._highlightedParts[parts.ids[0]].a = 1.0 - transparency;
            } else {
                x = parts.ids[0] % parts.colorMap.getWidth();
                y = Math.floor(parts.ids[0] / parts.colorMap.getHeight());

                var pixel = parts.colorMap.getPixel(x, y);

                pixel.a = 1.0 - transparency;

                parts.colorMap.setPixel(x, y, pixel);
            }
        }
    };

    /**
     *
     * @param visibility
     */
    this.setVisibility = function(visibility) {

        var i, j, x, y, usage, visibleCount, visibilityAsInt;

        if (!(ids.length && ids.length > 1)) {
            x = parts.ids[0] % parts.colorMap.getWidth();
            y = Math.floor(parts.ids[0] / parts.colorMap.getHeight());

            var pixel = parts.visibilityMap.getPixel(x, y);

            visibilityAsInt = (visibility) ? 1 : 0;

            if (pixel.r != visibilityAsInt) {
                pixel.r = visibilityAsInt;

                this.multiPart._partVisibility[parts.ids[0]] = visibility;
                
                //get used shapes
                usage = this.multiPart._idMap.mapping[parts.ids[0]].usage;

                //Change the shapes render flag
                for (j = 0; j < usage.length; j++) {
                    visibleCount = this.multiPart._visiblePartsPerShape[usage[j]];
                    if (visibility && visibleCount.val < visibleCount.max) {
                        visibleCount.val++;
                    } else if (!visibility && visibleCount.val > 0) {
                        visibleCount.val--;
                    }

                    if (visibleCount.val) {
                        this.multiPart._inlineNamespace.defMap[usage[j]]._vf.render = true;
                    } else {
                        this.multiPart._inlineNamespace.defMap[usage[j]]._vf.render = false;
                    }
                }
            }

            parts.visibilityMap.setPixel(x, y, pixel);
            this.multiPart.invalidateVolume();
        }
        else
        {
            var pixels = parts.visibilityMap.getPixels();

            for (i = 0; i < parts.ids.length; i++) {

                visibilityAsInt = (visibility) ? 1 : 0;

                if (pixels[parts.ids[i]].r != visibilityAsInt) {
                    pixels[parts.ids[i]].r = visibilityAsInt;

                    this.multiPart._partVisibility[parts.ids[i]] = visibility;

                    //get used shapes
                    usage = this.multiPart._idMap.mapping[parts.ids[i]].usage;

                    //Change the shapes render flag
                    for (j = 0; j < usage.length; j++) {
                        visibleCount = this.multiPart._visiblePartsPerShape[usage[j]];
                        if (visibility && visibleCount.val < visibleCount.max) {
                            visibleCount.val++;
                        } else if (!visibility && visibleCount.val > 0) {
                            visibleCount.val--;
                        }

                        if (visibleCount.val) {
                            this.multiPart._inlineNamespace.defMap[usage[j]]._vf.render = true;
                        } else {
                            this.multiPart._inlineNamespace.defMap[usage[j]]._vf.render = false;
                        }
                    }
                }
            }

            parts.visibilityMap.setPixels(pixels);
            this.multiPart.invalidateVolume();
        }
    };

    /**
     *
     * @param color
     */
    this.highlight = function(color) {

        var i, x, y;

        if (color.split(" ").length == 3) {
            color += " 1";
        }

        var colorRGBA = x3dom.fields.SFColorRGBA.parse(color);

        if (ids.length && ids.length > 1) //Multi select
        {
            var pixels = parts.colorMap.getPixels();

            for(i=0; i<parts.ids.length; i++) {
                if (this.multiPart._highlightedParts[parts.ids[i]] == undefined) {
                    this.multiPart._highlightedParts[parts.ids[i]] = pixels[parts.ids[i]]
                    pixels[parts.ids[i]] = colorRGBA;
                }
            }

            parts.colorMap.setPixels(pixels);
        }
        else //Single select
        {
            if (this.multiPart._highlightedParts[parts.ids[0]] == undefined){

                x = parts.ids[0] % parts.colorMap.getWidth();
                y = Math.floor(parts.ids[0] / parts.colorMap.getHeight());
                this.multiPart._highlightedParts[parts.ids[0]] = parts.colorMap.getPixel(x, y);
                parts.colorMap.setPixel(x, y, colorRGBA);
            }
        }
    };

    /**
     *
     * @param color
     */
    this.unhighlight = function() {

        var i, x, y;

        if (ids.length && ids.length > 1) //Multi select
        {
            var pixels = parts.colorMap.getPixels();
            for(i=0; i<parts.ids.length; i++) {
                if (this.multiPart._highlightedParts[parts.ids[i]]) {
                    pixels[parts.ids[i]] = this.multiPart._highlightedParts[parts.ids[i]];
                    this.multiPart._highlightedParts[parts.ids[i]] = undefined;
                }
            }
            parts.colorMap.setPixels(pixels);
        }
        else
        {
            if (this.multiPart._highlightedParts[parts.ids[0]]) {

                x = parts.ids[0] % parts.colorMap.getWidth();
                y = Math.floor(parts.ids[0] / parts.colorMap.getHeight());
                var pixel = this.multiPart._highlightedParts[parts.ids[0]];
                this.multiPart._highlightedParts[parts.ids[0]] = undefined;
                parts.colorMap.setPixel(x, y, pixel);
            }
        }
    };

    /**
     * get bounding volume
     *
     */
    this.getVolume = function() {

        var i, x, y;
        var transmat = this.multiPart.getCurrentTransform();
        if (ids.length && ids.length > 1) //Multi select
        {
            var volume = new x3dom.fields.BoxVolume();
            for(i=0; i<parts.ids.length; i++) {
                volume.extendBounds(this.multiPart._partVolume[i].min, this.multiPart._partVolume[i].max);
            }
            volume.transform(transmat);
            return volume;
        }
        else
        {
            var volume = x3dom.fields.BoxVolume.copy(this.multiPart._partVolume[parts.ids[0]]);
            volume.transform(transmat);
            return volume;
        }
    };
};