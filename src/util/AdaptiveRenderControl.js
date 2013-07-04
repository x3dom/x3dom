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

//---------------------------------------------------------------------------------------------------------------------

x3dom.arc = {};
x3dom.arc.instance = null;

x3dom.arc.Limits = defineClass(
    null,
    function(min, max, initial)
    {
        this._min = min;
        this._max = max;
    },
    {
        //input between 0 and 1
        getValue: function(value)
        {
            value = this._min + (this._max - this._min) * value;
            return this._max >= value ? (this._min <= value ? value : this._min ) : this._max;
        }
    }
);

//---------------------------------------------------------------------------------------------------------------------

x3dom.arc.ARF = defineClass(
    null,
    function(name, min, max, dirFac, factorGetterFunc, factorSetterFunc, getterFunc, setterFunc)
    {
        this._name = name;
        //start with average
        this._stateValue = [];
        this._stateValue[0] = 0.5;
        this._stateValue[1] = 0.5;

        this._limits = new x3dom.arc.Limits(min, max);
        this._factorGetterFunc = factorGetterFunc;
        this._factorSetterFunc = factorSetterFunc;
        this._setterFunc = setterFunc;
        this._getterFunc = getterFunc;
        this._dirFac = dirFac;
    },
    {
        getFactor: function()
        {
            return this._factorGetterFunc();
        },
        update: function(state, step)
        {
            var stateVal = this._stateValue[state] + step * this._dirFac;
            this._stateValue[state] =  0 <= stateVal ? ( 1 >= stateVal ? stateVal : 1 ) : 0;
            this._setterFunc(this._limits.getValue(this._stateValue[state]));

            //console.log(this.name +" "+this._factorGetterFunc() +" *  " + step +" "+ this._stateValue[state] +" "+ state);
        }
    }
);

//---------------------------------------------------------------------------------------------------------------------

x3dom.arc.AdaptiveRenderControl = defineClass(
    null,
    function(scene)
    {
        x3dom.arc.instance = this;

        this._scene = scene;
        this._targetFrameRate = [];
        this._targetFrameRate[0] = this._scene._vf.minFrameRate;
        this._targetFrameRate[1] = this._scene._vf.maxFrameRate;

        this._currentState = 0;

        var that = this;

        this._arfs = [];

        this._arfs.push(
            new x3dom.arc.ARF("screenSpace",
                0, this._scene._vf.smallFeatureThreshold, -1,
                function()
                {
                    return that._scene._vf.screenSpaceFactor;
                },
                function(value)
                {
                    that._scene._vf.screenSpaceFactor = value;
                }
                ,
                function()
                {
                    return that._scene._vf.smallFeatureThreshold;
                },
                function(value)
                {
                    that._scene._vf.smallFeatureThreshold = value;
                }
            )
        );


        this._arfs.push(
            new x3dom.arc.ARF("renderedPercentage",
                0,100,1,
                function()
                {
                    return that._scene._vf.drawCountFactor;
                },
                function(value)
                {
                    that._scene._vf.drawCountFactor = value;
                },
                function()
                {
                    return that._scene._vf.scaleRenderedIdsOnMove *100;
                },
                function(value)
                {
                    that._scene._vf.scaleRenderedIdsOnMove = value/100;
                }
            )
        );

        this._arfs.push(
            new x3dom.arc.ARF("tesselationErrorBound",
                1,12,1,
                function()
                {
                    return that._scene._vf.tesselationErrorBound;
                },
                function(value)
                {
                    that._scene._vf.tesselationErrorBound = value;
                },
                //@todo: this factor is a static member of PopGeo... should it belong to scene instead?
                function()
                {
                    return x3dom.nodeTypes.PopGeometry.ErrorToleranceFactor;
                },
                function(value)
                {
                    x3dom.nodeTypes.PopGeometry.ErrorToleranceFactor = value;
                }
            )
        );

        this._stepWidth = 0.1;
    },
    {
        update : function(state, fps) // state: 0 = static, 1 : moving
        {
            this._currentState = state;
            var delta =  fps - this._targetFrameRate[state];

            //to prevent flickering
            this._stepWidth = Math.abs(delta) > 10 ? 0.1 : 0.01;

            /*if( (delta > 0 && state == 1) || (delta < 0 && state == 0))
                return;
            */

            var factorSum = 0;
            var normFactors = [];

            //normalize factors
            for( var i = 0, n = this._arfs.length; i < n; ++i)
            {
                normFactors[i] = this._arfs[i].getFactor();
                if(normFactors[i] > 0)
                    factorSum += normFactors[i];
            }

            var dirFac = delta < 0 ? -1 : 1;
            for( var i = 0, n = this._arfs.length; i < n; ++i)
            {
                if(normFactors[i] > 0)
                {
                    normFactors[i] /= factorSum;
                    this._arfs[i].update(state, this._stepWidth * normFactors[i] * dirFac);
                }
            }
        }
    }
);

//---------------------------------------------------------------------------------------------------------------------

