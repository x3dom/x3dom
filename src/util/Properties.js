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


x3dom.Properties = function() {
    this.properties = {};
};

x3dom.Properties.prototype.setProperty = function(name, value) {
    x3dom.debug.logInfo("Properties: Setting property '"+ name + "' to value '" + value + "'");
    this.properties[name] = value;
};

x3dom.Properties.prototype.getProperty = function(name, def) {
    if (this.properties[name]) {
        return this.properties[name]
    } else {
        return def;
    }
};

x3dom.Properties.prototype.merge = function(other) {
    for (var attrname in other.properties) {
        this.properties[attrname] = other.properties[attrname];
    }
};

x3dom.Properties.prototype.toString = function() {
    var str = "";
    for (var name in this.properties) {
        str += "Name: " + name + " Value: " + this.properties[name] + "\n";
    }
    return str;
};
