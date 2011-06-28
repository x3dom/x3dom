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

// BindableStack constructor
x3dom.BindableStack = function (doc, type, defaultType, getter) {
    this._doc = doc;
    this._type = type;
    this._defaultType = defaultType;
    this._defaultRoot = 0;
    this._getter = getter;
    this._bindBag = [];
    this._bindStack = [];

    // x3dom.debug.logInfo ('Create BindableStack ' + this._type._typeName + ', ' + this._getter);
};

x3dom.BindableStack.prototype.top = function () {
    return ( (this._bindStack.length >= 0) ? this._bindStack[this._bindStack.length - 1] : null );
};

x3dom.BindableStack.prototype.push = function (bindable) {
    var top = this.top();

    if (top === bindable) {
        return;
    }

    if (top) {
        top.deactivate();
    }

    this._bindStack.push (bindable);
    bindable.activate(top);
};

x3dom.BindableStack.prototype.replaceTop = function (bindable) {
    var top = this.top();

    if (top === bindable) {
        return;
    }

    if (top) {
        top.deactivate();

        this._bindStack[this._bindStack.length - 1] = bindable;
        bindable.activate(top);
    }
};

x3dom.BindableStack.prototype.pop = function (bindable) {
    var top;

    if (bindable) {
        top = this.top();
        if (bindable !== top) {
            return null;
        }
    }

    top = this._bindStack.pop();

    if (top) {
        top.deactivate();
    }

    return top;
};

x3dom.BindableStack.prototype.switchTo = function (target) {
    var last = this.getActive();
    var n = this._bindBag.length;
    var toBind = 0;
    var i = 0, lastIndex = -1;

    if (n <= 1) {
        return;
    }

    switch (target)
    {
        case 'first':
            //x3dom.debug.logInfo ('first');
            toBind = this._bindBag[0];
            break;
        case 'last':
            //x3dom.debug.logInfo ('last');
            toBind = this._bindBag[n-1];
            break;
        default:
            for (i = 0; i < n; i++) {
                if (this._bindBag[i] == last) {
                    lastIndex = i;
                    break;
                }
            }
            if (lastIndex >= 0) {
                i = lastIndex;
                while (!toBind) {
                    if (target == 'next') {// next
                        i = (i < (n-1)) ? (i+1) : 0;
                    } else {// prev
                        i = (i>0) ? (i-1) : (n-1);
                    }
                    if (i == lastIndex) {
                        break;
                    }
                    if (this._bindBag[i]._vf.description.length >= 0) {
                      toBind = this._bindBag[i];
                    }
                }
            }
            break;
    }

    if (toBind) {
        this.replaceTop(toBind);
    } else {
        x3dom.debug.logWarning ('Cannot switch bindable; no other bindable with description found.');
    }
};

x3dom.BindableStack.prototype.getActive = function () {
    if (this._bindStack.length === 0) {
        if (this._bindBag.length === 0) {
            x3dom.debug.logInfo ('create new ' + this._defaultType._typeName +
                                 ' for ' + this._type._typeName + '-stack');
            var obj = new this._defaultType( { doc: this._doc, autoGen: true } );
            if (obj) {
                if (this._defaultRoot) {
                    this._defaultRoot.addChild(obj);
                    obj._nameSpace = this._defaultRoot._nameSpace;
                }
                else {
                    x3dom.debug.logError ('stack without defaultRoot');
                }
                obj.initDefault();
                this._bindBag.push(obj);
            }
        }
        else {
            x3dom.debug.logInfo ('activate first ' + this._type._typeName +
                                 ' for ' + this._type._typeName + '-stack');
        }

        this._bindStack.push(this._bindBag[0]);
        this._bindBag[0].activate();
    }

    return this._bindStack[this._bindStack.length - 1];
};

x3dom.BindableBag = function (doc) {
    this._stacks = [];

    this.addType ("X3DViewpointNode", "Viewpoint", "getViewpoint", doc);
    this.addType ("X3DNavigationInfoNode", "NavigationInfo", "getNavigationInfo", doc);
    this.addType ("X3DBackgroundNode", "Background", "getBackground", doc);
    this.addType ("X3DFogNode", "Fog", "getFog", doc);
};

x3dom.BindableBag.prototype.addType = function(typeName,defaultTypeName,getter,doc) {
    var type = x3dom.nodeTypes[typeName];
    var defaultType = x3dom.nodeTypes[defaultTypeName];
    var stack;

    if (type && defaultType) {
        //x3dom.debug.logInfo ('Create new BindableStack for ' + typeName);
        stack = new x3dom.BindableStack (doc, type, defaultType, getter);
        this._stacks.push(stack);
    }
    else {
        x3dom.debug.logWarning('Invalid Bindable type/defaultType:' + typeName + '/' + defaultType);
    }
};

x3dom.BindableBag.prototype.setRefNode = function (node) {
    Array.forEach ( this._stacks, function (stack) {
        stack._defaultRoot = node;
        node[stack._getter] = function () { return stack.getActive(); };
    } );
};

x3dom.BindableBag.prototype.addBindable = function(node) {
    for (var i = 0, n = this._stacks.length; i < n; i++) {
        if ( x3dom.isa (node, this._stacks[i]._type) ) {
            x3dom.debug.logInfo ('register bindable ' + node.typeName());
            this._stacks[i]._bindBag.push(node);
            return this._stacks[i];
        }
    }
    x3dom.debug.logError (node.typeName() + ' is not a valid bindable');
    return null;
};
