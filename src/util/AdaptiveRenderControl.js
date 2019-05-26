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

x3dom.arc.Limits = function(min, max, initial)
{
    this._min = min;
    this._max = max;

    this.getValue = function(value)
    {
        value = this._min + (this._max - this._min) * value;
        return this._max >= value ? (this._min <= value ? value : this._min ) : this._max;
    };
};

//---------------------------------------------------------------------------------------------------------------------

x3dom.arc.ARF = function(name, min, max, dirFac, factorGetterFunc, factorSetterFunc, getterFunc, setterFunc)
{
    this._name = name;
    //start with average
    this._stateValue = [ 0.5, 0.5 ];

    this._limits = new x3dom.arc.Limits(min, max);
    this._factorGetterFunc = factorGetterFunc;
    this._factorSetterFunc = factorSetterFunc;
    this._setterFunc = setterFunc;
    this._getterFunc = getterFunc;
    this._dirFac = dirFac;

    this.getFactor = function()
    {
        return this._factorGetterFunc();
    };

    this.update = function(state, step)
    {
        var stateVal = this._stateValue[state] + step * this._dirFac;
        this._stateValue[state] =  0 <= stateVal ? ( 1 >= stateVal ? stateVal : 1 ) : 0;
        this._setterFunc(this._limits.getValue(this._stateValue[state]));
    };

    this.reset = function()
    {
        this._stateValue[0] = 0.5;
        this._stateValue[1] = 0.5;
    };
};

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
        var environment = that._scene.getEnvironment();

        this._arfs = [];

        this._arfs.push(
            new x3dom.arc.ARF("smallFeatureCulling",
                0, 10, -1,
                function()
                {
                    return environment._vf.smallFeatureFactor;
                },
                function(value)
                {
                    environment._vf.smallFeatureFactor = value;
                },
                function()
                {
                    return  environment._vf.smallFeatureThreshold;
                },
                function(value)
                {
                    environment._vf.smallFeatureThreshold = value;
                }
            )
        );

        this._arfs.push(
            new x3dom.arc.ARF("lowPriorityCulling",
                0,100,1,
                function()
                {
                    return environment._vf.lowPriorityFactor;
                },
                function(value)
                {
                    environment._vf.lowPriorityFactor = value;
                },
                function()
                {
                    return environment._vf.lowPriorityThreshold * 100;
                },
                function(value)
                {
                    environment._vf.lowPriorityThreshold = value / 100;
                }
            )
        );

        this._arfs.push(
            new x3dom.arc.ARF("tessellationDetailCulling",
                1,12,-1,
                function()
                {
                    return environment._vf.tessellationErrorFactor;
                },
                function(value)
                {
                    environment._vf.tessellationErrorFactor = value;
                },
                //@todo: this factor is a static member of PopGeo... should it belong to scene instead?
                function()
                {
                    return environment.tessellationErrorThreshold;
                },
                function(value)
                {
                    environment.tessellationErrorThreshold = value;
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
            var i, n = this._arfs.length;

            for(i = 0; i < n; ++i)
            {
                normFactors[i] = this._arfs[i].getFactor();
                if(normFactors[i] > 0)
                    factorSum += normFactors[i];
            }

            var dirFac = delta < 0 ? -1 : 1;
            for(i = 0; i < n; ++i)
            {
                if(normFactors[i] > 0)
                {
                    normFactors[i] /= factorSum;
                    this._arfs[i].update(state, this._stepWidth * normFactors[i] * dirFac);
                }
            }
        },

        reset: function()
        {
            for( var i = 0, n = this._arfs.length; i < n; ++i)
            {
                this._arfs[i].reset();
            }
        }
    }
);

//---------------------------------------------------------------------------------------------------------------------

