x3dom.PROTOS = function() {
	this.protos = {};
	this.names = {};
	this.protoField = {};
	this.scriptField = {};
	this.interfaceField = {};
	this.envField = {};
	this.scopecount = 0;
	this.privatescope = [];
	this.defs = {};
	this.founddef = null;
	this.SFNodes = {
		"-appearance" : 1,
		"-body" : 1,
		"-child" : 1,
		"-collidable" : 1,
		"-collider" : 1,
		"-color" : 1,
		"-composableRenderStyle" : 1,
		"-coord" : 1,
		"-emitter" : 1,
		"-fillProperties" : 1,
		"-fogCoord" : 1,
		"-fontStyle" : 1,
		"-geometry" : 1,
		"-geoOrigin" : 1,
		"-layout" : 1,
		"-lineProperties" : 1,
		"-massDensityModel" : 1,
		"-material" : 1,
		"-metadata" : 1,
		"-normal" : 1,
		"-nurbsCurve" : 1,
		"-nurbsCurve2D" : 1,
		"-pickingGeometry" : 1,
		"-renderStyle" : 1,
		"-shape" : 1,
		"-source" : 1,
		"-texCoord" : 1,
		"-texCoordNurbs" : 1,
		"-texCoordRamp" : 1,
		"-texture" : 1,
		"-texture2D" : 1,
		"-texture2DMulti" : 1,
		"-texture3D" : 1,
		"-textureProperties" : 1,
		"-textureTransform" : 1,
		"-transferFunction" : 1,
		"-viewport" : 1
	};
}

x3dom.PROTOS.prototype = {
	pushScope: function (s) {
		// console.error("PUSH", s);
		this.privatescope.push(s);
	},

	popScope: function () {
		// console.error("POP", this.privatescope[this.privatescope.length-1]);
		this.privatescope.pop();
	},

	saveDef: function (def) {
		this.defs[def] = this.getScope();
		var d = this.getScope(def);
		// console.error("DEF SAVED", d, this.defs[def]);
		return d;
	},

	getDef: function (def) {
		// console.error("SCOPE OF DEF", def, this.defs[def]);
		return this.defs[def];
	},

	getField: function (scope, field) {
		return scope + "_" + field;
	},

	getScope: function (def) {
		var scope;
		if (def) {
			if (this.defs[def]) {
				scope = this.defs[def] + "_" + def;
			} else {
				scope = def;
			}
		} else {
			scope = this.privatescope.join("_");
		}
		// console.error("GET", [def], scope);
		return scope;
	},

	scopeLength: function () {
		return this.privatescope.length;
	},

	upScope: function (i) {
		return this.privatescope.slice(0, this.privatescope.length - i).join("_");
	},

	setLoadURLs: function (func) {
		this.loadURLs = func;
	},

	setValueFromInterface: function (field, object, objectfield) {
		// copy the default interface value;
		var fieldname_field_scope = this.getInterface(field);
		// default to "@".  - might need to be specified for children, see setter.
		var prefix = "@";
		if (typeof fieldname_field_scope != 'undefined' && typeof fieldname_field_scope[0] != 'undefined') {
			prefix = fieldname_field_scope[0].substr(0, 1);
		}
		if (prefix === '@' && objectfield === 'children') {
			prefix = '-';
		}
		if (prefix === '-' && objectfield === 'value') {
			prefix = "@";
		}
		objectfield = prefix + objectfield;
		if (typeof fieldname_field_scope != 'undefined' && typeof fieldname_field_scope[1] != 'undefined' && typeof fieldname_field_scope[0] != 'undefined' && typeof fieldname_field_scope[1][fieldname_field_scope[0]] != 'undefined') {
			// just grab the one value out of the interface.  We may want more later for typechecking
			var value = fieldname_field_scope[1][fieldname_field_scope[0]];
			if (Array.isArray(value) && fieldname_field_scope[1]["@type"] === "SFNode" && objectfield !== '-children') {
				// and some SF fields are arrays, so we have to explicitly test for SFNode
				// can't shove an array into an SFNode, so take the first element, per Roy Walmsley
				console.error("SFNode is array, reducing", value);
				value = value[0];
				// console.error("SFNode array[0]=", value);
			}
			if (!Array.isArray(value) && objectfield === '-children') {
				objectfield = "@value";
			}
			object[objectfield] = value;
			return [fieldname_field_scope[1]["@type"], fieldname_field_scope[2]];
		}
		return undefined;
	},

	getObjectField: function (f, type) {
		var objectfield = "value";
		if (type.indexOf("FNode") === 1) {
			objectfield = "children";
		}
		for (var a in f) {
			if (a === '@value' || a === '-children') {
				// console.error("===========attribute", a);
				objectfield = a.substr(1);
			}
		}
		return objectfield;
	},

	findFieldByName: function (fields, objectfield) {
		for (var field in fields) {
			var f = fields[field];
			var fieldname = f["@name"];
			if (fieldname === objectfield) {
				// console.error("Found", fieldname);
				return f;
			}
		}
		throw "Can't find " + objectfield;
	},

	getScriptFieldFieldTypeFieldByNameAttribute: function (fields, objectfield) {
		// console.error("Searching", fields);
		var f = this.findFieldByName(fields, objectfield);
		var fieldname = f["@name"];
		var type = f["@type"];
		objectfield = this.getObjectField(f, type);
		return [f, fieldname, type, objectfield];
	},

	getScriptFieldFieldTypeField: function (fields, field) {
		var f = fields[field];
		var fieldname = f["@name"];
		var type = f["@type"];
		var objectfield = this.getObjectField(f, type);
		return [f, fieldname, type, objectfield];
	},

	setScriptFields: function (fields, def) {
		var scope = this.getScope();
		for (var field in fields) {
			var field_name_field_type_objectfield_name = this.getScriptFieldFieldTypeField(fields, field);
			var f = field_name_field_type_objectfield_name[0];
			var fieldname = field_name_field_type_objectfield_name[1];
			var type = field_name_field_type_objectfield_name[2];
			var objectfield = field_name_field_type_objectfield_name[3];
			var type_scope = this.setValueFromInterface(fieldname, f, objectfield);
			// console.error("SSF1", scope, fieldname, f, objectfield, type, def);
			this.setScriptField(scope, fieldname, f, objectfield, type, def);
			if (typeof type_scope !== 'undefined') {
				// console.error("SSF2", type_scope[1], fieldname, f, objectfield, type, def);
				this.setScriptField(type_scope[1], fieldname, f, objectfield, type, def);
			}

		}

	},

	setScriptField: function (scope, field, f, objectfield, type, def) {
		if (typeof this.scriptField[this.getField(scope, field)] === 'undefined') {
			this.scriptField[this.getField(scope, field)] = [];
		}
		// set another reference
		this.scriptField[this.getField(scope, field)][this.scriptField[this.getField(scope, field)].length] = [f, objectfield, type, def];
	},

	setEnv: function (scope, protoField, newobject, nodeField, type, newdef) {
		var fieldname_field_scope = this.getInterface(protoField);
		if (typeof fieldname_field_scope !== 'undefined') {
			scope = fieldname_field_scope[2];
		}
		if (typeof this.envField[this.getField(scope, protoField)] === 'undefined') {
			this.envField[this.getField(scope, protoField)] = [];
		}
		// set another reference
		this.envField[this.getField(scope, protoField)][this.envField[this.getField(scope, protoField)].length] = [newobject, nodeField, type, newdef];
		// console.error("setconnenv", this.envField[this.getField(scope,protoField)].length, scope, protoField, JSON.stringify(newobject), nodeField, type, newdef);
	},

	getEnv: function (scope, protoField) {
		// console.error(">>>>>>", scope, protoField, JSON.stringify(this.envField[this.getField(scope,protoField)]));
		return this.envField[this.getField(scope, protoField)];
	},

	setConnectField: function (scope, field, newobject, objectfield, type, newdef) {
		// console.error("setconn", scope, field, JSON.stringify(newobject), type, newdef);
		if (typeof this.protoField[this.getField(scope, field)] === 'undefined') {
			this.protoField[this.getField(scope, field)] = [];
		}
		this.protoField[this.getField(scope, field)][this.protoField[this.getField(scope, field)].length] = [newobject, objectfield, type, newdef];
	},

	// In the ProtoBody (for the instance)
	// p === "IS"
	setConnectFields: function (object, p, newobject) {
		var def = object["@DEF"]; // at same level as IS
		var newdef = this.saveDef(def);
		var connect = object[p]["connect"];
		var scope = this.getScope();
		for (var cfield in connect) {
			var f = connect[cfield];
			// console.error("Connect field", field, f);
			if (f) {
				var field = this.getScope(f["@protoField"]);
				var objectfield = f["@nodeField"];
				// console.error("Node field is", objectfield);
				var type_scope = this.setValueFromInterface(field, newobject, objectfield);
				var type = undefined;
				if (typeof type_scope !== 'undefined') {
					type = type_scope[0];
					this.setEnv(scope, field, newobject, objectfield, type, newdef);
					this.setConnectField(scope, field, newobject, objectfield, type, newdef);
					this.setConnectField(type_scope[1], field, newobject, objectfield, type, newdef);
				} else {
					this.setEnv(scope, field, newobject, objectfield, type, newdef);
					this.setConnectField(scope, field, newobject, objectfield, type, newdef);
				}
			}
		}
	},

	setScriptConnectFields: function (file, object, p, newobject) {
		var connect = object[p]["connect"];
		var scope = this.getScope();
		var def = object["@DEF"];
		newobject["field"] = this.realPrototypeExpander(file, object["field"], true);
		var newdef = newobject["@DEF"]; // at same level as IS
		for (var cfield in connect) {
			var f = connect[cfield];
			if (f) {
				var field = this.getScope(f["@protoField"]);
				var objectfield = f["@nodeField"];
				// console.error("Connect field", field, objectfield);
				var field_name_field_type_objectfield_name = this.getScriptFieldFieldTypeFieldByNameAttribute(newobject["field"], objectfield);
				f = field_name_field_type_objectfield_name[0];
				var fieldname = field_name_field_type_objectfield_name[1];
				var type = field_name_field_type_objectfield_name[2];
				objectfield = field_name_field_type_objectfield_name[3];
				// console.error("Node field is", objectfield);
				var type_scope = this.setValueFromInterface(field, f, objectfield);
				if (typeof type_scope !== 'undefined') {
					type = type_scope[0];
					// this.setEnv(scope, field, newobject, objectfield, type, newdef);
					// console.error("SSF3", scope, field, f, objectfield, type, def);
					this.setScriptField(scope, field, f, objectfield, type, def);
					// console.error("SSF4", type_scope[1], field, f, objectfield, type, def);
					this.setScriptField(type_scope[1], field, f, objectfield, type, def);
				} else {
					// this.setEnv(scope, field, newobject, objectfield, type, newdef);
					// console.error("SSF5", scope, field, f, objectfield, type, def);
					this.setScriptField(scope, field, f, objectfield, type, def);
				}
			}
		}
	},

	getInterface: function (field) {
		for (var i = 0; i < this.scopeLength(); i++) {
			var scope = this.upScope(i);
			if (!scope) {
				break;
			}
			var fieldname_field_scope = this.interfaceField[this.getField(scope, field)];
			//console.error("getinter", scope, field, fieldnamefield);
			if (fieldname_field_scope) {
				return fieldname_field_scope;
			}
			//console.error("looping", i);
		}
	},

	setInterface: function (field, fieldname) {
		var scope = this.getScope();
		this.interfaceField[this.getField(scope, field["@name"])] = [fieldname, field, scope];
		// console.error("setinter", scope, field["@name"], fieldname, field[fieldname]);
	},

	clearScope: function (field, object) {
		var scope = this.getScope();
		delete this.scriptField[this.getField(scope, field)];
		delete this.protoField[this.getField(scope, field)];
		this.zap(field, object);
	},

	extractConnectedDef: function (scope, node) {
		var defobj;
		for (var sf in this.scriptField[this.getField(scope, node)]) {
			var obj = this.scriptField[this.getField(scope, node)][sf];
			if (typeof obj !== 'undefined') {
				if (typeof obj[3] !== 'undefined') {
					defobj = [this.getField(scope, obj[3]), obj[0]["@name"]];
					// console.error("def5 is", defobj);
				}
			}
		}
		if (typeof defobj === 'undefined') {
			for (var pf in this.protoField[this.getField(scope, node)]) {
				var obj2 = this.protoField[this.getField(scope, node)][pf];
				if (typeof obj2 !== 'undefined') {
					defobj = [obj2[3], obj2[1]];
					// console.error("def2 is", defobj);
				}
			}
		}
		if (typeof defobj === 'undefined') {
			for (var pf2 in this.protoField[this.getField(scope, "__DEF_FIELD__")]) {
				var obj3 = this.protoField[this.getField(scope, "__DEF_FIELD__")][pf2];
				if (typeof obj3 !== 'undefined') {
					defobj = [obj3[3], node];
					// console.error("def3 is", defobj);
				}
			}
		}
		if (typeof defobj === 'undefined') {
			defobj = [scope, node];
			// console.error("def4 is", defobj);
		}
		return defobj;
	},

	setObjectValues: function (scope, field, fieldOrNode, value) {
		// console.error("resolve", scope, field, fieldOrNode, JSON.stringify(value));
		var foundOther = false;
		// branch out across children of a proto declare
		for (var pf in this.protoField[this.getField(scope, field)]) {
			var obj = this.protoField[this.getField(scope, field)][pf];
			if (typeof obj !== 'undefined') {
				// console.error("\t\tfoundprotovalue", scope, field, JSON.stringify(obj), fieldOrNode, JSON.stringify(value));
				this.setObjectValue(scope, field, obj, fieldOrNode, value);
				foundOther = true;
				// console.error("\t\tresultprotovalue", JSON.stringify(obj));
			} else {
				// console.error("protoundef", scope, field);
			}
		}

		// look for script fields
		for (var sf in this.scriptField[this.getField(scope, field)]) {
			var obj2 = this.scriptField[this.getField(scope, field)][sf];
			if (typeof obj2 !== 'undefined') {
				// console.error("\t\tfoundscriptvalue", scope, field, JSON.stringify(obj2), fieldOrNode, JSON.stringify(value));
				this.setObjectValue(scope, field, obj2, fieldOrNode, value);
				foundOther = true;
				// console.error("\t\tresultscriptvalue", JSON.stringify(obj2));
			} else {
				// console.error("scriptundef", scope, field);
			}
		}

		if (foundOther) {
			return;
		}

		// find prototype up the scope stream
		for (var i = 0; i < this.scopeLength(); i++) {
			var parentScope = this.upScope(i);
			if (!parentScope) {
				break;
			}
			var envs = this.getEnv(parentScope, field);
			// console.error(i, parentScope, field, JSON.stringify(envs), JSON.stringify(value));
			for (var e in envs) {
				var obj3 = envs[e];
				// console.error("newobject", JSON.stringify(obj3[0]));
				// console.error("nodeField", JSON.stringify(obj3[1]));
				// console.error("type", JSON.stringify(obj3[2]));
				// console.error("newdef", JSON.stringify(obj3[3]));
				// console.error("parentscope", JSON.stringify(parentScope));
				if (typeof obj3 !== 'undefined' && obj3[3].indexOf(parentScope) === obj3[3].lastIndexOf(parentScope)) {
					// console.error("\t\tfoundenvvalue", parentScope, obj3[1], JSON.stringify(obj3), fieldOrNode, JSON.stringify(value));
					this.setObjectValue(parentScope, obj3[1], obj3, fieldOrNode, value);
					// console.error("\t\tresultenvvalue", JSON.stringify(obj3));
				}
			}
		}
	},

	setObjectValue: function (scope, field, obj, fieldOrNode, value) {
		// console.error("SOV", scope, field, obj, fieldOrNode, value);
		if (Array.isArray(value) && typeof obj[2] !== 'undefined') {
			// and some SF fields are arrays, so we have to explicitly test for SFNode
			if (obj[2] === "SFNode") {
				// can't shove an array into an SF, so take the first element, per Roy Walmsley
				// console.error("SFNode is array=", value);
				value = value[0];
				// console.error("SFNode array[0]=", value);
			} else if (obj[2] === "MFNode") {
				// value = { "Group" : { "-children" : value }};
				// console.error("MFNode", value);
			}
		}
		// if the recursion didn't set it, set it now
		var prefix = obj[1].substr(0, 1);
		if (prefix !== '-' && prefix !== '@') {
			prefix = fieldOrNode.substr(0, 1);
		} else {
			prefix = "";
		}
		if (prefix === '@' && obj[1] === 'children') {
			prefix = '-';
		}
		if (prefix === '-' && obj[1] === 'value') {
			prefix = "@";
		}
		if (!Array.isArray(value) && obj[1] === 'children') {
			value = [value];
		}
		// console.error("SOVobjI", JSON.stringify(obj));
		// console.error("SOVobj0I", JSON.stringify(obj[0]));
		// console.error("SOVobj1I", JSON.stringify(obj[1]));
		// console.error("SOVobj2I", JSON.stringify(obj[2]));
		// console.error("SOVobj3I", JSON.stringify(obj[3]));
		// console.error("SOVlsI", JSON.stringify(obj[0][prefix+obj[1]]));
		// console.error("SOVrsI", JSON.stringify(value));
		obj[0][prefix + obj[1]] = value;// JSON.parse(JSON.stringify(value));
		// console.error("SOVvalueO", JSON.stringify(value));
		// console.error("SOVobj3O", JSON.stringify(obj[3]));
		// console.error("SOVobj2O", JSON.stringify(obj[2]));
		// console.error("SOVobj1O", JSON.stringify(obj[1]));
		// console.error("SOVobj0O", JSON.stringify(obj[0]));
		// console.error("SOVobjO", JSON.stringify(obj));
		// console.error("setresult", obj[0], "[", prefix, obj[1], "]", '=', value, 'alt', fieldOrNode);
	},

	zap: function (field, object) {
		var p;
		if (typeof object === "object") {
			for (p in object) {
				if (p.toLowerCase() === 'is') {
					var connect = object[p]["connect"];
					for (var fld in connect) {
						var f = connect[fld];
						if (f && f["@protoField"] === field) {
							// console.error("zapping", field);
							delete connect[fld];
						}
					}
				} else {
					this.zap(field, object[p]);
				}
			}
		}
		return object;
	},
	zapIs: function (object) {
		var p;
		if (typeof object === "object") {
			for (p in object) {
				if (p.toLowerCase() === 'is') {
					delete object[p];
				} else {
					this.zapIs(object[p]);
				}
			}
		}
		return object;
	},


	flattenerArray : function(object, parentArray) {
		var newobject = [];
		var offset = 0;
		for (var p in object) {
			var possibleArray = flattener(object[p], newobject, object.length);
			if (Array.isArray(possibleArray)) {
				for (var q in possibleArray) {
					newobject[parseInt(p)+offset+parseInt(q)] = possibleArray[q];
				}
				offset += possibleArray.length-1;
			} else {
				newobject[parseInt(p)+offset] = possibleArray;
			}
		}
		return newobject;
	},

	flattenerObject : function(object, parentArray, arrayLen) {
		var newobject = {};
		for (var p in object) {
			var possibleArray = flattener(object[p], parentArray, arrayLen);
			if (Array.isArray(possibleArray)) {
				if (this.SFNodes[p]) {
					// SFNodes should only have one child
					newobject[p] = possibleArray[0];
					// handle extra nodes brought in from proto
					if (possibleArray.length > 1) {
						parentArray[arrayLen] = { "Switch" : {
									"@whichChoice": -1,
									"-children" : [
										{"Group" : {
										"-children" : [
										]
										}
										}
									]
									}
									};
						for (var i = 1; i < possibleArray.length; i++) {
							parentArray[arrayLen]["Switch"]["-children"][0]["Group"]["-children"][i-1] = possibleArray[i];
						}
					}
				} else {
					newobject[p] = possibleArray;
				}
			} else {
				if (SFNodes[p]) {
					if (typeof possibleArray === 'object' && possibleArray["#comment"]) {
						if (newobject["-children"]) {
							newobject[p] = {};
							newobject["-children"].push(possibleArray);
						} else {
							newobject[p] = {};
							newobject["-children"] = [ possibleArray ];
						}
					} else {
						newobject[p] = possibleArray;
					}
				} else {
					newobject[p] = possibleArray;
				}
			}
		}
		return newobject;
	},

	flattener : function(object, parentArray, arrayLen) {
		if (typeof object === "object") {
			if (Array.isArray(object)) {
				var newobject = flattenerArray(object, parentArray);
			} else {
				var newobject = flattenerObject(object, parentArray, arrayLen);
			}
			return newobject;
		} else {
			return object;
		}
	},

	prototypeExpander: function (file, object) {
		object = this.realPrototypeExpander(file, object, false);
		this.zapIs(object);
		// console.error("SCRIPTS", JSON.stringify(this.scriptField));
		// console.error("PROTOS", JSON.stringify(this.protoField, null, 2));
		return object;
	},

	readCode : function (data, fileExt) {
		if (typeof data !== 'undefined') {
			newobject[p]["#sourceText"] = data.split(/\r?\n/);
			delete newobject[p]["@url"];
		}
	},

	handleScript: function (file, object, p, newobject) {
		newobject[p] = this.realPrototypeExpander(file, object[p], true);
		// console.error("DEF is", newobject[p]["@DEF"]);
		this.setScriptFields(newobject[p]["field"], newobject[p]["@DEF"]);
		var url = newobject[p]["@url"];
		console.error("Not loading Script--missing loadURLs", file, url);
		// this.loadURLs(file, url, this.readCode, null, p, newobject);
	},

	handleProtoDeclare: function (file, object, p) {
		var name = object[p]["@name"];
		var def = object[p]["@DEF"];
		this.protos[name] = object[p];
		this.saveDef(def);
		// don't need to save def
		if (typeof object[p]["@appinfo"] !== 'undefined') {
			this.protos[name]["@appinfo"] = object[p]["@appinfo"];
		}
		if (typeof object[p]["@documentation"] !== 'undefined') {
			this.protos[name]["@documentation"] = object[p]["@documentation"];
		}
		this.pushScope("DECL" + name);
		this.names[def] = name;
		this.realPrototypeExpander(file, object[p], false);
		this.popScope();
		return object;
	},

	handleProtoInterface: function (file, object, p) {
		var fields = object[p]["field"];
		for (var field in fields) {
			var f = fields[field];
			if (typeof f["@value"] !== 'undefined') {
				this.setInterface(f, "@value");
			} else if (typeof f["-children"] !== 'undefined') {
				this.setInterface(f, "-children");
			} else {
				this.setInterface(f);
			}
		}
		return object;
	},

	handleProtoInstance: function (file, object, p) {
		var name = object[p]["@name"];
		this.pushScope("DECL" + name);
		var def = object[p]["@DEF"];
		var use = object[p]["@USE"];
		this.names[def] = name;
		if (typeof name === 'undefined' && typeof use !== 'undefined') {
			name = this.names[use];
		}
		var instance = {};
		if (typeof def === 'undefined') {
			def = "INSTANCE";
		}
		if (this.getDef(def)) {
			this.scopecount += 1000;
			def += this.scopecount;
		} else {
			// first appearance of def is left alone
		}
		var newdef = this.saveDef(def);
		this.pushScope(def);
		if (typeof this.protos[name] === 'undefined' || typeof this.protos[name]['ProtoBody'] === 'undefined') {
			console.error("ProtoBody undefined for", name);
		} else {
			// console.error("Copying ProtoBody", name);
			var obj = this.protos[name]['ProtoBody']['-children'];
			// var bodydef = this.protos[name]['ProtoBody']["@DEF"];
			instance = JSON.parse(JSON.stringify(obj));
		}

		// instance is an array
		while (Array.isArray(instance) && Object.keys(instance).length === 1) {
			instance = instance[0];
		}

		var firstobj = instance;
		while (Array.isArray(firstobj)) {
			// we only the DEF of the first node 
			firstobj = firstobj[0];
		}
		if (!Array.isArray(firstobj)) {
			if (typeof use !== 'undefined') {
				for (var q in firstobj) {
					if (q === "Group" || q == "Transform") {
						if (typeof firstobj[q] === 'object' && !Array.isArray(firstobj[q])) {
							firstobj[q]["@USE"] = this.getScope(use);  // there will be at least DEF with this USE
						} else {
							console.error("USE is Failed");
						}
					}
				}
			}

		}
		/*
		if (typeof bodydef !== 'undefined') {
			this.saveDef(bodydef);
			this.pushScope(bodydef);
		}
		*/
		var newobject = this.realPrototypeExpander(file, instance, false);

		var fieldValue = object[p]["fieldValue"];
		for (var field in fieldValue) {
			var fv = fieldValue[field];
			var protoField = fv["@name"];
			var fieldOrNode = "@value";
			var value = fv[fieldOrNode];
			for (var nv in fv) {
				if (nv === '@name') {
					continue;
				}
				fieldOrNode = nv;
				value = fv[fieldOrNode];
				this.pushScope("FIELD" + protoField);
				value = this.realPrototypeExpander(file, value, false);
				this.popScope();
				this.getInterface(protoField);
				this.setObjectValues(this.getScope(),
					protoField,
					fieldOrNode,
					value);
			}
			// this.clearScope(fieldname, newobject);
		}

		/*
		if (typeof bodydef !== 'undefined') {
			this.popScope();
		}
		*/
		this.popScope();
		this.popScope();
		return newobject;
	},

	realPrototypeExpander: function (file, object, inScript) {
		if (typeof object === "object") {
			var newobject = null;
			if (Array.isArray(object)) {
				newobject = [];
			} else {
				newobject = {};
			}
			for (var p in object) {
				var plc = p.toLowerCase();
				if (plc === 'script') {
					this.handleScript(file, object, p, newobject);
				} else if (plc === 'protodeclare') {
					this.handleProtoDeclare(file, object, p);
				} else if (plc === 'protointerface') {
					this.handleProtoInterface(file, object, p);
				} else if (plc === 'protobody') {
					this.realPrototypeExpander(file, object[p], inScript);
				} else if (plc === 'protoinstance') {
					newobject = this.handleProtoInstance(file, object, p);
				} else if (plc === 'connect') {
					this.realPrototypeExpander(file, object[p], inScript);
				} else if (plc === 'fieldvalue') {
					this.realPrototypeExpander(file, object[p], inScript);
				} else if (plc === 'field') {
					newobject[p] = this.realPrototypeExpander(file, object[p], inScript);
				} else if (plc === '@value') {
					newobject[p] = this.realPrototypeExpander(file, object[p], inScript);
					// console.error("@value is ", newobject[p]);
				} else if (plc === '-children') {
					newobject[p] = this.realPrototypeExpander(file, object[p], inScript);
					// console.error("-children is ", newobject[p]);
				} else if (plc === 'is') {
					if (inScript) {
						this.setScriptConnectFields(file, object, p, newobject);
					} else {
						this.setConnectFields(object, p, newobject);
					}
					this.realPrototypeExpander(file, object[p], inScript);
				} else if (plc === 'route') {
					newobject[p] = {};
					var envFrom = this.extractConnectedDef(this.getScope(object[p]["@fromNode"]), object[p]["@fromField"]);
					newobject[p]["@fromNode"] = envFrom[0];
					newobject[p]["@fromField"] = envFrom[1];
					var envTo = this.extractConnectedDef(this.getScope(object[p]["@toNode"]), object[p]["@toField"]);
					newobject[p]["@toNode"] = envTo[0];
					newobject[p]["@toField"] = envTo[1];
				} else if (plc === '@name') {
					newobject[p] = object[p];
				} else if (plc === '@def') {
					newobject[p] = this.saveDef(object[p]);
					/*
					if (typeof process != 'undefined') {
						process.stderr.write("d3 ");
					}
					*/
					this.setConnectField(this.getScope(), "__DEF_FIELD__", newobject, object[p], "SFString", newobject[p]);
				} else if (plc === '@use') {
					newobject[p] = this.getScope(object[p]);
					// console.error("USE for", object[p], "is", newobject[p]);
				} else {
					newobject[p] = this.realPrototypeExpander(file, object[p], inScript);
				}
			}
			return newobject;
		} else {
			return object;
		}
	},

	searchForProtoDeclare: function (object, name) {
		var p;
		var found;
		if (typeof object === "object") {
			for (p in object) {
				if (p === 'ProtoDeclare') {
					console.error("looked at", object[p]["@name"], "for", name);
					if (object[p]["@name"] === name) {
						console.error("Found equal names");
						found = object;
					}
					// find the first one if none match
					if (typeof found === 'undefined' && this.founddef === null) {
						console.error("First default found");
						this.founddef = object;
					}
				}
				if (typeof found === 'undefined') {
					found = this.searchForProtoDeclare(object[p], name);
				}
			}
		}
		if (typeof found !== 'undefined') {
			// console.error("defaulted to", found["ProtoDeclare"]["@name"]);
		}
		return found;
	},


	searchAndReplaceProto: function (filename, json, protoname, founddef, obj, objret) {
		console.error("finished converting", filename);
		var newobj = this.searchForProtoDeclare(json, protoname);
		if (typeof newobj === 'undefined') {
			newobj = founddef;
		}
		if (newobj === null || typeof newobj.ProtoDeclare === 'undefined') {
			console.error("ProtoDeclare is still null or undefined in ", JSON.stringify(json));
		} else {
			var name = obj["@name"];
			var appinfo = obj["@appinfo"];
			var description = obj["@description"];
			newobj["ProtoDeclare"]["@name"] = name;
			newobj["ProtoDeclare"]["@appinfo"] = appinfo;
			newobj["ProtoDeclare"]["@description"] = description;
		}
		objret(newobj);
	},


	loadedProto: function (data, protoname, obj, filename, protoexp, objret) {
		if (typeof data !== 'undefined') {
			console.error("searching for", protoname);
			try {
				// can only search for one Proto at a time
				this.founddef = null;
				var json = {};
				try {
					json = JSON.parse(data);
					console.error("parsed JSON from " + filename);
				} catch (e) {
					console.error("Failed to parse JSON from " + filename);
					if (filename.endsWith(".x3d") && (typeof runAndSend === "function")) {
						console.error("calling run and send");
						console.error("loadedProto converting " + filename);
						var protoexp = this;
						runAndSend(['---silent', filename], function(json) {
							console.error("got", json, "from run and send, searching for", protoname);
							protoexp.searchAndReplaceProto(filename, json, protoname, protoexp.founddef, obj, objret);
						});
						console.error("async skip of run and send " + filename);
					} else {
						console.error("calling converter on server");
						try {
							var str = serializeDOM(undefined, data.firstElementChild, true);
							$.post("/convert", str, function(json) {
								console.error("JSON converted on server is", json);
								protoexp.searchAndReplaceProto(filename, json, protoname, protoexp.founddef, obj, objret);
							}, "json")
						} catch (e) {
							alert(e);
							console.error("Server convert failed", e);
						}
					}
				}
			} catch (e) {
				console.error("Failed to parse JSON in ", filename, e);
			}
		} else {
			console.error("data is undefined for file", filename);
		}
	},

	doLoad : function (data, u, protoexp, done, p, obj) {
		var name = obj["@name"];
		var nameIndex = u.indexOf("#");
		var protoname = name;
		console.error("doLoad External Prototype", u);
		if (nameIndex >= 0) {
			protoname = u.substring(nameIndex + 1);
		}

		console.error("protoname is", protoname, protoexp);
		try {
			protoexp.loadedProto(data, protoname, obj, u, protoexp, function (nuobject) {
				console.error("Done searching, found", nuobject);
				done(p, nuobject);
			});
		} catch (e) {
			console.error("Error searching for proto", e);
		}
	},

	load : function (p, file, object, done) {
		var obj = object[p];
		var url = obj["@url"];
		// this is a single task
		console.error("Not loading External Prototype--missing loadURLs", file, url);
		// this.loadURLs(file, url, this.doLoad, this, done, p, obj);
	},

	expand : function (file, object, done) {
		for (var p in object) {
			if (p === 'ExternProtoDeclare') {
				console.error("Found External Prototype reference", file, object);
				this.load(p, file, object, done);
			} else {
				// this is a single task:
				done(p, this.externalPrototypeExpander(file, object[p]));
			}
		}
	},

	externalPrototypeExpander: function (file, object) {
		if (typeof object === "object") {
			var newobject = null;
			if (Array.isArray(object)) {
				newobject = [];
			} else {
				newobject = {};
			}
			// Wait for expectedreturn tasks to finish
			var expectedreturn = Object.keys(object).length;
			this.expand(file, object, function (p, newobj) {
				if (p === "ExternProtoDeclare") {
					console.error("Putting in", newobj);
					console.error("OLD ", object);
					newobject = newobj;
					console.error("EPD", newobject);
				} else {
					newobject[p] = newobj;
				}
			});
			while (expectedreturn > Object.keys(newobject).length + 1); {  // when they are equal, we exit
				console.error(expectedreturn, '=', Object.keys(newobject).length);
				setTimeout(function () { }, 50);
			}
			// console.error("Exited loop");

			return newobject;
		} else {
			return object;
		}
	}
};

x3dom.protoExpander = new x3dom.PROTOS();
