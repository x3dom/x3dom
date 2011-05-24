// toto: remove x3dom logger dependency
x3dom.Properties = {
    // element
    properties: {},

    setProperty: function(name, value) {
        x3dom.debug.logInfo("Properties: Setting property '"+ name + "' to value '" + value + "'");
        this.properties[name] = value;
    },

    getProperty: function(name, def) {
        if (this.properties[name]) {
            return this.properties[name]
        } else {
            return def;
        }
    },

    toString: function() {
        var str = "";
        var len = this.properties.length;
        for (name in this.properties) {
            str += "Name: " + name + " Value: " + this.properties[name] + "\n";
        }
        return str;
    }
    
};