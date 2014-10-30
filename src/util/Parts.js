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
x3dom.Parts = function(multiPart, ids, colorMap, emissiveMap, specularMap, visibilityMap)
{
    var parts = this;
    this.multiPart = multiPart;
    this.ids = ids;
    this.colorMap = colorMap;
    this.emissiveMap = emissiveMap;
    this.specularMap = specularMap;
    this.visibilityMap = visibilityMap;
    this.width = parts.colorMap.getWidth();
    this.widthTwo =  this.width * this.width;

    /**
     *
     * @param color
     * @param frontSide
     */
    this.setDiffuseColor = function(color, frontSide)
    {
        var i, partID, pixelID;

        frontSide = ( frontSide == undefined ) ? true : frontSide;

        color = x3dom.fields.SFColor.parse( color );

        if (ids.length && ids.length > 1) //Multi select
        {
            //Get original pixels
            var pixels = parts.colorMap.getPixels();

            for ( i=0; i < parts.ids.length; i++ )
            {
                partID = parts.ids[i];
                pixelID = (frontSide) ? partID : partID + this.widthTwo;

                //Check for front/back
                if (frontSide) {
                    this.multiPart._materials[partID]._diffuseColor = color;
                } else {
                    this.multiPart._materials[partID]._backDiffuseColor = color;
                }

                //If part is not highlighted update the pixel
                if ( !this.multiPart._materials[partID]._highlighted )
                {
                    pixels[pixelID].r = color.r;
                    pixels[pixelID].g = color.g;
                    pixels[pixelID].b = color.b;
                }
            }

            parts.colorMap.setPixels(pixels);
        }
        else
        {
            partID = parts.ids[0];
            pixelID = (frontSide) ? partID : partID + this.widthTwo;

            var x = pixelID % this.width;
            var y = Math.floor(pixelID / this.width);

            //Get original pixel
            var pixel = parts.colorMap.getPixel(x, y);

            //Check for front/back
            if (frontSide) {
                this.multiPart._materials[partID]._diffuseColor = color;
            } else {
                this.multiPart._materials[partID]._backDiffuseColor = color;
            }

            //If part is not highlighted update the pixel
            if ( !this.multiPart._materials[partID]._highlighted )
            {
                pixel.r = color.r;
                pixel.g = color.g;
                pixel.b = color.b;
            }

            parts.colorMap.setPixel(x, y, pixel);
        }
    };

    /**
     *
     * @param frontSide
     * @returns {*}
     */
    this.getDiffuseColor = function(frontSide)
    {
        var i, partID;

        frontSide = ( frontSide == undefined ) ? true : frontSide;

        if (ids.length && ids.length > 1) //Multi select
        {
            var diffuseColors = [];

            for ( i=0; i < parts.ids.length; i++ )
            {
                partID = parts.ids[i];

                if(frontSide)
                {
                    diffuseColors.push(this.multiPart._materials[partID]._diffuseColor);
                }
                else
                {
                    diffuseColors.push(this.multiPart._materials[partID]._backDiffuseColor);
                }
            }
            return diffuseColors;
        }
        else
        {
            partID = parts.ids[0];

            if(frontSide)
            {
                return this.multiPart._materials[partID]._diffuseColor;
            }
            else
            {
                return this.multiPart._materials[partID]._backDiffuseColor;
            }
        }
    };

    /**
     *
     * @param color
     * @param frontSide
     */
    this.setEmissiveColor = function(color, frontSide)
    {
        var i, partID, pixelID;

        frontSide = ( frontSide == undefined ) ? true : frontSide;

        color = x3dom.fields.SFColor.parse( color );

        if (ids.length && ids.length > 1) //Multi select
        {
            //Get original pixels
            var pixels = parts.emissiveMap.getPixels();

            for ( i=0; i < parts.ids.length; i++ )
            {
                partID = parts.ids[i];
                pixelID = (frontSide) ? partID : partID + this.widthTwo;

                //Check for front/back
                if (frontSide) {
                    this.multiPart._materials[partID]._emissiveColor = color;
                } else {
                    this.multiPart._materials[partID]._backEmissiveColor = color;
                }

                //If part is not highlighted update the pixel
                if ( !this.multiPart._materials[partID]._highlighted )
                {
                    pixels[pixelID].r = color.r;
                    pixels[pixelID].g = color.g;
                    pixels[pixelID].b = color.b;
                }
            }

            parts.emissiveMap.setPixels(pixels);
        }
        else
        {
            partID = parts.ids[0];
            pixelID = (frontSide) ? partID : partID + this.widthTwo;

            var x = pixelID % this.width;
            var y = Math.floor(pixelID / this.width);

            //Get original pixel
            var pixel = parts.emissiveMap.getPixel(x, y);

            //Check for front/back
            if (frontSide) {
                this.multiPart._materials[partID]._emissiveColor = color;
            } else {
                this.multiPart._materials[partID]._backEmissiveColor = color;
            }

            //If part is not highlighted update the pixel
            if ( !this.multiPart._materials[partID]._highlighted )
            {
                pixel.r = color.r;
                pixel.g = color.g;
                pixel.b = color.b;
            }

            parts.emissiveMap.setPixel(x, y, pixel);
        }
    };

    /**
     *
     * @param frontSide
     * @returns {*}
     */
    this.getEmissiveColor = function(frontSide)
    {
        var i, partID;

        frontSide = ( frontSide == undefined ) ? true : frontSide;

        if (ids.length && ids.length > 1) //Multi select
        {
            var emissiveColors = [];

            for ( i=0; i < parts.ids.length; i++ )
            {
                partID = parts.ids[i];

                if(frontSide)
                {
                    emissiveColors.push(this.multiPart._materials[partID]._emissiveColor);
                }
                else
                {
                    emissiveColors.push(this.multiPart._materials[partID]._backEmissiveColor);
                }
            }
            return emissiveColors;
        }
        else
        {
            partID = parts.ids[0];

            if(frontSide)
            {
                return this.multiPart._materials[partID]._emissiveColor;
            }
            else
            {
                return this.multiPart._materials[partID]._backEmissiveColor;
            }
        }
    };

    /**
     *
     * @param color
     * @param frontSide
     */
    this.setSpecularColor = function(color, frontSide)
    {
        var i, partID, pixelID;

        frontSide = ( frontSide == undefined ) ? true : frontSide;

        color = x3dom.fields.SFColor.parse( color );

        if (ids.length && ids.length > 1) //Multi select
        {
            //Get original pixels
            var pixels = parts.specularMap.getPixels();

            for ( i=0; i < parts.ids.length; i++ )
            {
                partID = parts.ids[i];
                pixelID = (frontSide) ? partID : partID + this.widthTwo;

                //Check for front/back
                if (frontSide) {
                    this.multiPart._materials[partID]._specularColor = color;
                } else {
                    this.multiPart._materials[partID]._backSpecularColor = color;
                }

                //If part is not highlighted update the pixel
                if ( !this.multiPart._materials[partID]._highlighted )
                {
                    pixels[pixelID].r = color.r;
                    pixels[pixelID].g = color.g;
                    pixels[pixelID].b = color.b;
                }
            }

            parts.specularMap.setPixels(pixels);
        }
        else
        {
            partID = parts.ids[0];
            pixelID = (frontSide) ? partID : partID + this.widthTwo;

            var x = pixelID % this.width;
            var y = Math.floor(pixelID / this.width);

            //Get original pixel
            var pixel = parts.specularMap.getPixel(x, y);

            //Check for front/back
            if (frontSide) {
                this.multiPart._materials[partID]._specularColor = color;
            } else {
                this.multiPart._materials[partID]._backSpecularColor = color;
            }

            //If part is not highlighted update the pixel
            if ( !this.multiPart._materials[partID]._highlighted )
            {
                pixel.r = color.r;
                pixel.g = color.g;
                pixel.b = color.b;
            }

            parts.specularMap.setPixel(x, y, pixel);
        }
    };

    /**
     *
     * @param frontSide
     * @returns {*}
     */
    this.getSpecularColor = function(frontSide)
    {
        var i, partID;

        frontSide = ( frontSide == undefined ) ? true : frontSide;

        if (ids.length && ids.length > 1) //Multi select
        {
            var specularColors = [];

            for ( i=0; i < parts.ids.length; i++ )
            {
                partID = parts.ids[i];

                if(frontSide)
                {
                    specularColors.push(this.multiPart._materials[partID]._specularColor);
                }
                else
                {
                    specularColors.push(this.multiPart._materials[partID]._backSpecularColor);
                }
            }
            return specularColors;
        }
        else
        {
            partID = parts.ids[0];

            if(frontSide)
            {
                return this.multiPart._materials[partID]._specularColor;
            }
            else
            {
                return this.multiPart._materials[partID]._backSpecularColor;
            }
        }
    };

    /**
     *
     * @param transparency
     * @param frontSide
     */
    this.setTransparency = function(transparency, frontSide)
    {
        var i, partID, pixelID;

        frontSide = ( frontSide == undefined ) ? true : frontSide;

        if (ids.length && ids.length > 1) //Multi select
        {
            //Get original pixels
            var pixels = parts.colorMap.getPixels();

            for ( i=0; i < parts.ids.length; i++ )
            {
                partID = parts.ids[i];
                pixelID = (frontSide) ? partID : partID + this.widthTwo;

                //Check for front/back
                if (frontSide) {
                    this.multiPart._materials[partID]._transparency = transparency;
                } else {
                    this.multiPart._materials[partID]._backTransparency = transparency;
                }

                //If part is not highlighted update the pixel
                if ( !this.multiPart._materials[partID]._highlighted )
                {
                    pixels[pixelID].a = 1.0 - transparency;
                }
            }

            parts.colorMap.setPixels(pixels, true);
        }
        else
        {
            partID = parts.ids[0];
            pixelID = (frontSide) ? partID : partID + this.widthTwo;

            var x = pixelID % this.width;
            var y = Math.floor(pixelID / this.width);

            //Get original pixel
            var pixel = parts.colorMap.getPixel(x, y);

            //Check for front/back
            if (frontSide) {
                this.multiPart._materials[partID]._transparency = transparency;
            } else {
                this.multiPart._materials[partID]._backTransparency = transparency;
            }

            //If part is not highlighted update the pixel
            if ( !this.multiPart._materials[partID]._highlighted )
            {
                pixel.a = 1.0 - transparency;
            }

            parts.colorMap.setPixel(x, y, pixel, true);
        }
    };

    /**
     *
     * @param frontSide
     * @returns {*}
     */
    this.getTransparency = function(frontSide)
    {
        var i, partID;

        frontSide = ( frontSide == undefined ) ? true : frontSide;

        if (ids.length && ids.length > 1) //Multi select
        {
            var transparencies = [];

            for ( i=0; i < parts.ids.length; i++ )
            {
                partID = parts.ids[i];

                if(frontSide)
                {
                    transparencies.push(this.multiPart._materials[partID]._transparency);
                }
                else
                {
                    transparencies.push(this.multiPart._materials[partID]._backTransparency);
                }
            }
            return transparencies;
        }
        else
        {
            partID = parts.ids[0];

            if(frontSide)
            {
                return this.multiPart._materials[partID]._transparency;
            }
            else
            {
                return this.multiPart._materials[partID]._backTransparency;
            }
        }
    };

    /**
     *
     * @param shininess
     * @param frontSide
     */
    this.setShininess = function(shininess, frontSide)
    {
        var i, partID, pixelID;

        frontSide = ( frontSide == undefined ) ? true : frontSide;

        if (ids.length && ids.length > 1) //Multi select
        {
            //Get original pixels
            var pixels = parts.specularMap.getPixels();

            for ( i=0; i < parts.ids.length; i++ )
            {
                partID = parts.ids[i];
                pixelID = (frontSide) ? partID : partID + this.widthTwo;

                //Check for front/back
                if (frontSide) {
                    this.multiPart._materials[partID]._shininess = shininess;
                } else {
                    this.multiPart._materials[partID]._backShininess = shininess;
                }

                //If part is not highlighted update the pixel
                if ( !this.multiPart._materials[partID]._highlighted )
                {
                    pixels[pixelID].a = shininess;
                }
            }

            parts.specularMap.setPixels(pixels, true);
        }
        else
        {
            partID = parts.ids[0];
            pixelID = (frontSide) ? partID : partID + this.widthTwo;

            var x = pixelID % this.width;
            var y = Math.floor(pixelID / this.width);

            //Get original pixel
            var pixel = parts.specularMap.getPixel(x, y);

            //Check for front/back
            if (frontSide) {
                this.multiPart._materials[partID]._shininess = shininess;
            } else {
                this.multiPart._materials[partID]._backShininess = shininess;
            }

            //If part is not highlighted update the pixel
            if ( !this.multiPart._materials[partID]._highlighted )
            {
                pixel.a = shininess;
            }

            parts.specularMap.setPixel(x, y, pixel, true);
        }
    };

    /**
     *
     * @param frontSide
     * @returns {*}
     */
    this.getShininess = function(frontSide)
    {
        var i, partID;

        frontSide = ( frontSide == undefined ) ? true : frontSide;

        if (ids.length && ids.length > 1) //Multi select
        {
            var shininesses = [];

            for ( i=0; i < parts.ids.length; i++ )
            {
                partID = parts.ids[i];

                if(frontSide)
                {
                    shininesses.push(this.multiPart._materials[partID]._shininess);
                }
                else
                {
                    shininesses.push(this.multiPart._materials[partID]._backShininess);
                }
            }
            return shininesses;
        }
        else
        {
            partID = parts.ids[0];

            if(frontSide)
            {
                return this.multiPart._materials[partID]._shininess;
            }
            else
            {
                return this.multiPart._materials[partID]._backShininess;
            }
        }
    };

    /**
     *
     * @param ambientIntensity
     * @param frontSide
     */
    this.setAmbientIntensity = function(ambientIntensity, frontSide)
    {
        var i, partID, pixelID;

        frontSide = ( frontSide == undefined ) ? true : frontSide;

        if (ids.length && ids.length > 1) //Multi select
        {
            //Get original pixels
            var pixels = parts.emissiveMap.getPixels();

            for ( i=0; i < parts.ids.length; i++ )
            {
                partID = parts.ids[i];
                pixelID = (frontSide) ? partID : partID + this.widthTwo;

                //Check for front/back
                if (frontSide) {
                    this.multiPart._materials[partID]._ambientIntensity = ambientIntensity;
                } else {
                    this.multiPart._materials[partID]._backAmbientIntensity = ambientIntensity;
                }

                //If part is not highlighted update the pixel
                if ( !this.multiPart._materials[partID]._highlighted )
                {
                    pixels[pixelID].a = ambientIntensity;
                }
            }

            parts.emissiveMap.setPixels(pixels, true);
        }
        else
        {
            partID = parts.ids[0];
            pixelID = (frontSide) ? partID : partID + this.widthTwo;

            var x = pixelID % this.width;
            var y = Math.floor(pixelID / this.width);

            //Get original pixel
            var pixel = parts.emissiveMap.getPixel(x, y);

            //Check for front/back
            if (frontSide) {
                this.multiPart._materials[partID]._ambientIntensity = ambientIntensity;
            } else {
                this.multiPart._materials[partID]._backAmbientIntensity = ambientIntensity;
            }

            //If part is not highlighted update the pixel
            if ( !this.multiPart._materials[partID]._highlighted )
            {
                pixel.a = ambientIntensity;
            }

            parts.emissiveMap.setPixel(x, y, pixel, true);
        }
    };

    /**
     *
     * @param frontSide
     * @returns {*}
     */
    this.getAmbientIntensity = function(frontSide)
    {
        var i, partID;

        frontSide = ( frontSide == undefined ) ? true : frontSide;

        if (ids.length && ids.length > 1) //Multi select
        {
            var ambientIntensities = [];

            for ( i=0; i < parts.ids.length; i++ )
            {
                partID = parts.ids[i];

                if(frontSide)
                {
                    ambientIntensities.push(this.multiPart._materials[partID]._ambientIntensity);
                }
                else
                {
                    ambientIntensities.push(this.multiPart._materials[partID]._backAmbientIntensity);
                }
            }
            return ambientIntensities;
        }
        else
        {
            partID = parts.ids[0];

            if(frontSide)
            {
                return this.multiPart._materials[partID]._ambientIntensity;
            }
            else
            {
                return this.multiPart._materials[partID]._backAmbientIntensity;
            }
        }
    };

    /**
     *
     * @param color
     */
    this.highlight = function (color)
    {
        var i, partID, pixelIDFront, pixelIDBack, dtColor, eaColor, ssColor;

        color = x3dom.fields.SFColor.parse( color );

        if (ids.length && ids.length > 1) //Multi select
        {
            //Get original pixels
            var dtPixels = parts.colorMap.getPixels();
            var eaPixels = parts.emissiveMap.getPixels();
            var ssPixels = parts.specularMap.getPixels();

            dtColor = new x3dom.fields.SFColorRGBA(0, 0, 0, 1.0);
            eaColor = new x3dom.fields.SFColorRGBA(color.r, color.g, color.b, 0);
            ssColor = new x3dom.fields.SFColorRGBA(0, 0, 0, 0);

            for ( i=0; i < parts.ids.length; i++ ) {
                partID = parts.ids[i];
                pixelIDFront = partID;
                pixelIDBack  = partID + this.widthTwo;

                if( !this.multiPart._materials[partID]._highlighted )
                {
                    this.multiPart._materials[partID]._highlighted = true;

                    dtPixels[pixelIDFront] = dtColor;
                    eaPixels[pixelIDFront] = eaColor;
                    ssPixels[pixelIDFront] = ssColor;

                    dtPixels[pixelIDBack] = dtColor;
                    eaPixels[pixelIDBack] = eaColor;
                    ssPixels[pixelIDBack] = ssColor;
                }
            }

            this.colorMap.setPixels(dtPixels, false);
            this.emissiveMap.setPixels(eaPixels, false);
            this.specularMap.setPixels(ssPixels, true);
        }
        else
        {
            partID = parts.ids[0];
            pixelIDFront = partID;
            pixelIDBack  = partID + this.widthTwo;

            var xFront = pixelIDFront % this.width;
            var yFront = Math.floor(pixelIDFront / this.width);

            var xBack = pixelIDBack % this.width;
            var yBack = Math.floor(pixelIDBack / this.width);

            //If part is not highlighted update the pixel
            if ( !this.multiPart._materials[partID]._highlighted )
            {
                this.multiPart._materials[partID]._highlighted = true;

                dtColor = new x3dom.fields.SFColorRGBA(0, 0, 0, 1);
                eaColor = new x3dom.fields.SFColorRGBA(color.r, color.g, color.b, 0);
                ssColor = new x3dom.fields.SFColorRGBA(0, 0, 0, 0);

                this.colorMap.setPixel(xFront, yFront, dtColor, false);
                this.emissiveMap.setPixel(xFront, yFront, eaColor, false);
                this.specularMap.setPixel(xFront, yFront, ssColor, false);

                this.colorMap.setPixel(xBack, yBack, dtColor, false);
                this.emissiveMap.setPixel(xBack, yBack, eaColor, false);
                this.specularMap.setPixel(xBack, yBack, ssColor, true);
            }
        }
    };

    this.unhighlight = function() {
        var i, partID, pixelIDFront, pixelIDBack, material;
        var dtColorFront, eaColorFront, ssColorFront;
        var dtColorBack, eaColorBack, ssColorBack;

        if (ids.length && ids.length > 1) //Multi select
        {
            //Get original pixels
            var dtPixels = parts.colorMap.getPixels();
            var eaPixels = parts.emissiveMap.getPixels();
            var ssPixels = parts.specularMap.getPixels();

            for ( i=0; i < parts.ids.length; i++ ) {
                partID = parts.ids[i];
                pixelIDFront = partID;
                pixelIDBack  = partID + this.widthTwo;

                material = this.multiPart._materials[partID];

                if( material._highlighted )
                {
                    material._highlighted = false;

                    dtPixels[pixelIDFront] = new x3dom.fields.SFColorRGBA(material._diffuseColor.r, material._diffuseColor.g,
                                                                          material._diffuseColor.b, 1.0 - material._transparency);
                    eaPixels[pixelIDFront] = new x3dom.fields.SFColorRGBA(material._emissiveColor.r, material._emissiveColor.g,
                                                                          material._emissiveColor.b, material._ambientIntensity);
                    ssPixels[pixelIDFront] = new x3dom.fields.SFColorRGBA(material._specularColor.r, material._specularColor.g,
                                                                          material._specularColor.b, material._shininess);

                    dtPixels[pixelIDBack] = new x3dom.fields.SFColorRGBA(material._backDiffuseColor.r, material._backDiffuseColor.g,
                                                                         material._backDiffuseColor.b, 1.0 - material._backTransparency);
                    eaPixels[pixelIDBack] = new x3dom.fields.SFColorRGBA(material._backEmissiveColor.r, material._backEmissiveColor.g,
                                                                         material._backEmissiveColor.b, material._backAmbientIntensity);
                    ssPixels[pixelIDBack] = new x3dom.fields.SFColorRGBA(material._backSpecularColor.r, material._backSpecularColor.g,
                                                                         material._backSpecularColor.b, material._backShininess);
                }
            }

            this.colorMap.setPixels(dtPixels, false);
            this.emissiveMap.setPixels(eaPixels, false);
            this.specularMap.setPixels(ssPixels, true);
        }
        else
        {
            partID = parts.ids[0];
            pixelIDFront = partID;
            pixelIDBack  = partID + this.widthTwo;

            var xFront = pixelIDFront % this.width;
            var yFront = Math.floor(pixelIDFront / this.width);

            var xBack = pixelIDBack % this.width;
            var yBack = Math.floor(pixelIDBack / this.width);

            material = this.multiPart._materials[partID];

            //If part is not highlighted update the pixel
            if ( material._highlighted )
            {
                material._highlighted = false;

                dtColorFront = new x3dom.fields.SFColorRGBA(material._diffuseColor.r, material._diffuseColor.g,
                                                            material._diffuseColor.b, 1.0 - material._transparency);
                eaColorFront = new x3dom.fields.SFColorRGBA(material._emissiveColor.r, material._emissiveColor.g,
                                                            material._emissiveColor.b, material._ambientIntensity);
                ssColorFront = new x3dom.fields.SFColorRGBA(material._specularColor.r, material._specularColor.g,
                                                            material._specularColor.b, material._shininess);

                dtColorBack = new x3dom.fields.SFColorRGBA(material._backDiffuseColor.r, material._backDiffuseColor.g,
                                                           material._backDiffuseColor.b, 1.0 - material._backTransparency);
                eaColorBack = new x3dom.fields.SFColorRGBA(material._backEmissiveColor.r, material._backEmissiveColor.g,
                                                           material._backEmissiveColor.b, material._backAmbientIntensity);
                ssColorBack = new x3dom.fields.SFColorRGBA(material._backSpecularColor.r, material._backSpecularColor.g,
                                                           material._backSpecularColor.b, material._backShininess);

                this.colorMap.setPixel(xFront, yFront, dtColorFront, false);
                this.emissiveMap.setPixel(xFront, yFront, eaColorFront, false);
                this.specularMap.setPixel(xFront, yFront, ssColorFront, false);

                this.colorMap.setPixel(xBack, yBack, dtColorBack, false);
                this.emissiveMap.setPixel(xBack, yBack, eaColorBack, false);
                this.specularMap.setPixel(xBack, yBack, ssColorBack, true);
            }
        }
    };

    /**
     *
     * @param color
     * @param back
     */
    this.setColor = function(color, back) {
        this.setDiffuseColor(color, back);
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
            y = Math.floor(parts.ids[0] / parts.colorMap.getWidth());
            colorRGBA = parts.colorMap.getPixel(x, y);
        }

        return colorRGBA.toString();
    };

	/**
     *
     */
    this.resetColor = function() {

        var i, partID, pixelIDFront, pixelIDBack, material;
        var dtColorFront, eaColorFront, ssColorFront;
        var dtColorBack, eaColorBack, ssColorBack;
		
        if (ids.length && ids.length > 1) //Multi select
        {
            //Get original pixels
            var dtPixels = parts.colorMap.getPixels();
            var eaPixels = parts.emissiveMap.getPixels();
            var ssPixels = parts.specularMap.getPixels();

            for ( i=0; i < parts.ids.length; i++ ) {
                partID = parts.ids[i];
                pixelIDFront = partID;
                pixelIDBack  = partID + this.widthTwo;

                material = this.multiPart._materials[partID];

                material.reset();

                if( !material._highlighted )
                {
                    dtPixels[pixelIDFront] = new x3dom.fields.SFColorRGBA(material._diffuseColor.r, material._diffuseColor.g,
                                                                          material._diffuseColor.b, 1.0 - material._transparency);
                    eaPixels[pixelIDFront] = new x3dom.fields.SFColorRGBA(material._emissiveColor.r, material._emissiveColor.g,
                                                                          material._emissiveColor.b, material._ambientIntensity);
                    ssPixels[pixelIDFront] = new x3dom.fields.SFColorRGBA(material._specularColor.r, material._specularColor.g,
                                                                          material._specularColor.b, material._shininess);

                    dtPixels[pixelIDBack] = new x3dom.fields.SFColorRGBA(material._backDiffuseColor.r, material._backDiffuseColor.g,
                                                                         material._backDiffuseColor.b, 1.0 - material._backTransparency);
                    eaPixels[pixelIDBack] = new x3dom.fields.SFColorRGBA(material._backEmissiveColor.r, material._backEmissiveColor.g,
                                                                         material._backEmissiveColor.b, material._backAmbientIntensity);
                    ssPixels[pixelIDBack] = new x3dom.fields.SFColorRGBA(material._backSpecularColor.r, material._backSpecularColor.g,
                                                                         material._backSpecularColor.b, material._backShininess);
                }
            }

            this.colorMap.setPixels(dtPixels, false);
            this.emissiveMap.setPixels(eaPixels, false);
            this.specularMap.setPixels(ssPixels, true);
        }
        else //Single select
        {
            partID = parts.ids[0];
            pixelIDFront = partID;
            pixelIDBack  = partID + this.widthTwo;

            var xFront = pixelIDFront % this.width;
            var yFront = Math.floor(pixelIDFront / this.width);

            var xBack = pixelIDBack % this.width;
            var yBack = Math.floor(pixelIDBack / this.width);

            material = this.multiPart._materials[partID];

            material.reset();

            //If part is not highlighted update the pixel
            if ( !material._highlighted )
            {
                dtColorFront = new x3dom.fields.SFColorRGBA(material._diffuseColor.r, material._diffuseColor.g,
                                                            material._diffuseColor.b, 1.0 - material._transparency);
                eaColorFront = new x3dom.fields.SFColorRGBA(material._emissiveColor.r, material._emissiveColor.g,
                                                            material._emissiveColor.b, material._ambientIntensity);
                ssColorFront = new x3dom.fields.SFColorRGBA(material._specularColor.r, material._specularColor.g,
                                                            material._specularColor.b, material._shininess);

                dtColorBack = new x3dom.fields.SFColorRGBA(material._backDiffuseColor.r, material._backDiffuseColor.g,
                                                           material._backDiffuseColor.b, 1.0 - material._backTransparency);
                eaColorBack = new x3dom.fields.SFColorRGBA(material._backEmissiveColor.r, material._backEmissiveColor.g,
                                                           material._backEmissiveColor.b, material._backAmbientIntensity);
                ssColorBack = new x3dom.fields.SFColorRGBA(material._backSpecularColor.r, material._backSpecularColor.g,
                                                           material._backSpecularColor.b, material._backShininess);

                this.colorMap.setPixel(xFront, yFront, dtColorFront, false);
                this.emissiveMap.setPixel(xFront, yFront, eaColorFront, false);
                this.specularMap.setPixel(xFront, yFront, ssColorFront, false);

                this.colorMap.setPixel(xBack, yBack, dtColorBack, false);
                this.emissiveMap.setPixel(xBack, yBack, eaColorBack, false);
                this.specularMap.setPixel(xBack, yBack, ssColorBack, true);
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
            y = Math.floor(parts.ids[0] / parts.colorMap.getWidth());

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
     * get bounding volume
     *
     */
    this.getVolume = function() {

        var volume;
        var transmat = this.multiPart.getCurrentTransform();

        if (ids.length && ids.length > 1) //Multi select
        {
            volume = new x3dom.fields.BoxVolume();

            for(var i=0; i<parts.ids.length; i++) {
                volume.extendBounds(this.multiPart._partVolume[parts.ids[i]].min, this.multiPart._partVolume[parts.ids[i]].max);
            }

            volume.transform(transmat);

            return volume;
        }
        else
        {
            volume = x3dom.fields.BoxVolume.copy(this.multiPart._partVolume[parts.ids[0]]);
            volume.transform(transmat);
            return volume;
        }
    };

    /**
     * Fit the selected Parts to the screen
     * @param updateCenterOfRotation
     */
    this.fit = function (updateCenterOfRotation) {

        var volume = this.getVolume();

        this.multiPart._nameSpace.doc._viewarea.fit(volume.min, volume.max, updateCenterOfRotation);
    };
};