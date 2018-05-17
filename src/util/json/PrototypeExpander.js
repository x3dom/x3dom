/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2018 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * John Carlson https://coderextreme.net/X3DJSONLD
 */

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
	flattenerArray : function(object, parentArray) {
		var newobject = [];
		var offset = 0;
		for (var p in object) {
			var possibleArray = this.flattener(object[p], newobject, object.length);
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
			var possibleArray = this.flattener(object[p], parentArray, arrayLen);
			if (Array.isArray(possibleArray)) {
				if (this.SFNodes[p]) {
					// this.SFNodes should only have one child
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
				if (this.SFNodes[p]) {
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
				var newobject = this.flattenerArray(object, parentArray);
			} else {
				var newobject = this.flattenerObject(object, parentArray, arrayLen);
			}
			return newobject;
		} else {
			return object;
		}
	},

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
		var decl = scope.lastIndexOf("DECL");
		if (decl > 0) {
			scope = scope.substring(decl);
		}
		return scope;
	},

	scopeLength: function () {
		return this.privatescope.length;
	},

	upScope: function (i) {
		return this.privatescope.slice(0, this.privatescope.length - i).join("_");
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

	extractConnectedDef: function (scope, field) {
		var defobj;
		// console.error("extracting def from script, proto, or otherwise:", scope, field, this.getField(scope, field), this.getField(scope, "__DEF_FIELD__"), this.scriptField[this.getField(scope, field)], this.protoField[this.getField(scope, field)], this.protoField[this.getField(scope, "__DEF_FIELD__")]);
		for (var sf in this.scriptField[this.getField(scope, field)]) {
			// just grab first one, the others may be bad
			if (typeof defobj === 'undefined') {
				var obj = this.scriptField[this.getField(scope, field)][sf];
				if (typeof obj !== 'undefined') {
					if (typeof obj[3] !== 'undefined') {
						var f = this.getField(scope, obj[3]);
						if (f.indexOf("DECL", 1) == -1) {
							defobj = [f,  obj[0]["@name"]];
							// console.error("def5 is", defobj);
						}
					}
				}
			}
		}
		if (typeof defobj === 'undefined') {
			for (var pf in this.protoField[this.getField(scope, field)]) {
				var obj2 = this.protoField[this.getField(scope, field)][pf];
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
					defobj = [obj3[3], field];
					// console.error("def3 is", defobj);
				}
			}
		}
		if (typeof defobj === 'undefined') {
			defobj = [scope, field];
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

	prototypeExpander: function (file, object) {
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
		object = this.externalPrototypeExpander(file, object);
		object = this.realPrototypeExpander(file, object, false);
		this.zapIs(object);
		object = this.flattener(object);
		// console.error("SCRIPTS", JSON.stringify(this.scriptField));
		// console.error("PROTOS", JSON.stringify(this.protoField, null, 2));
		return object;
	},

	readCode : function (data, fileExt, protoexp, done, p, newobject) {
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
		this.loadURLs(file, url, this.readCode, null, function(){}, p, newobject);
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
		var def = object[p]["@DEF"];
		var use = object[p]["@USE"];
		this.names[def] = name;
		if (typeof name === 'undefined' && typeof use !== 'undefined') {
			name = this.names[use];
		}
		this.pushScope("DECL" + name);

		var instance = {};
		if (typeof def === 'undefined' && typeof use === 'undefined') {
			def = "INSTANCE";
		}
		if (this.getDef(def) && typeof use === 'undefined') {
			this.scopecount += 1000;
			def += "" + this.scopecount;
		} else {
			// first appearance of def is left alone
		}
		if (typeof def !== 'undefined') {
			var newdef = this.saveDef(def);
			this.pushScope(def);
		}
		var bodydef;
		if (typeof this.protos[name] === 'undefined' || typeof this.protos[name]['ProtoBody'] === 'undefined') {
			console.error("ProtoBody undefined for", name);
		} else {
			// console.error("Copying ProtoBody", name);
			var children = this.protos[name]['ProtoBody']['-children'];
			//  bodydef = this.protos[name]['ProtoBody']["@DEF"];
			for (var child in children) {
				var ch = children[child];
				for (var objkey in ch) {
					if (typeof bodydef === 'undefined') {
						bodydef = ch[objkey]["@DEF"];
						if (typeof use !== 'undefined') {
							var iuse = this.saveDef(use);
							this.pushScope(use);
						}
					}
				}
			}
			instance = JSON.parse(JSON.stringify(children));
		}

		// instance is an array.  Get the first object, no matter how
		// deep it is.
		// TODO comments

		var firstobj = instance;

		while (Array.isArray(firstobj)) {
			if (firstobj[0] === null || typeof firstobj[0] === 'undefined') {
				break;
			}
			firstobj = firstobj[0];
		}
		if (typeof use !== 'undefined' && typeof firstobj === 'object') {
			/*
			if (typeof bodydef !== 'undefined') {
				var bdef = this.saveDef(bodydef);
				this.pushScope(bodydef);
			}
			*/
			var newobject = {}
			newobject[objkey] = {};
			// replace ProtoInstance with the first item from the ProtoBody
			newobject[objkey]["@USE"] = this.getScope();
			if (typeof bodydef !== 'undefined') {
				this.popScope();
			}

		} else {
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
		if (typeof firstobj === 'object' && typeof firstobj[objkey] !== 'undefined') {
			firstobj[objkey]["@DEF"] = this.getScope();
		}
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
		}

		if (typeof use !== 'undefined') {
			this.popScope();
		}
		if (typeof def !== 'undefined') {
			this.popScope();
		}
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
		if (typeof alert === 'function') {
			// alert("searching for "+ name+" in "+JSON.stringify(object));
		}
		if (typeof object === "object") {
			for (p in object) {
				if (p === 'ProtoDeclare') {
					// console.error("looked at", object[p]["@name"], "for", name);
					if (object[p]["@name"] === name) {
						// console.error("Found equal names");
						found = object;
					}
					// find the first one if none match
					if (typeof found === 'undefined' && this.founddef === null) {
						if (typeof alert === 'function') {
							// alert("First default found");
						}
						// console.error("First default found");
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
		if (typeof alert === 'function') {
			// alert("finished converting"+ filename);
		}
		// console.error("finished converting"+ filename);
		var newobj = this.searchForProtoDeclare(json, protoname);
		if (typeof newobj === 'undefined') {
			newobj = founddef;
		}
		if (newobj === null || typeof newobj.ProtoDeclare === 'undefined') {
			if (typeof alert === 'function') {
				// alert("ProtoDeclare is still null or undefined ",filename + " " + protoname + " " + JSON.stringify(json));
			}
			console.error("ProtoDeclare is still null or undefined",filename, protoname, JSON.stringify(json));
		} else {
			var name = obj["@name"];
			var appinfo = obj["@appinfo"];
			var description = obj["@description"];
			newobj["ProtoDeclare"]["@name"] = name;
			newobj["ProtoDeclare"]["@appinfo"] = appinfo;
			newobj["ProtoDeclare"]["@description"] = description;
		}
		if (typeof alert === 'function') {
			// alert("returning "+ JSON.stringify(newobj));
			// console.log("returning ", JSON.stringify(newobj));
		}
		objret(newobj);
	},


	loadedProto: function (data, protoname, obj, filename, protoexp, objret) {
		if (typeof data !== 'undefined') {
			// console.error("searching for", protoname);
			try {
				// can only search for one Proto at a time
				this.founddef = null;
				var json = {};
				try {
					// console.error("parsing ", data);
					// alert("parsed JSON from " + filename);
					// alert("data is " + JSON.stringify(data));
					// console.error("parsed JSON from " + filename);
					json = JSON.parse(data);
					protoexp.searchAndReplaceProto(filename, json, protoname, protoexp.founddef, obj, objret);
				} catch (e) {
					/*
					console.error("Failed to parse JSON from " + filename);
					if (filename.endsWith(".x3d") && (typeof runAndSend === "function")) {
						console.error("calling run and send");
						console.error("loadedProto converting " + filename);
						runAndSend(['---silent', filename], function(json) {
							console.error("got", json, "from run and send, searching for", protoname);
							protoexp.searchAndReplaceProto(filename, json, protoname, protoexp.founddef, obj, objret);
						});
						console.error("async skip of run and send " + filename);
					} else
					*/
					if (typeof DOM2JSONSerializer === 'function') {
						if (typeof alert === 'function') {
							// alert("calling local converter");
						}
						// console.error("calling local converter");
						try {
							var serializer = new DOM2JSONSerializer();
							var str = serializer.serializeToString(null, data.firstElementChild, filename, mapToMethod, fieldTypes);
							protoexp.searchAndReplaceProto(filename, JSON.parse(str), protoname, protoexp.founddef, obj, objret);
						} catch (e) {
							if (typeof alert === 'function') {
								alert(e);
							}
							console.error("Convert failed", e);
						}
					} else {
						if (typeof alert === 'function') {
							// alert("Did not convert XML to JSON.  Oops!");
						}
						console.error("Did not convert XML to JSON.  Oops!")
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
		// console.error("doLoad External Prototype", u);
		if (nameIndex >= 0) {
			protoname = u.substring(nameIndex + 1);
		}

		// console.error("protoname is", protoname, protoexp);
		try {
			protoexp.loadedProto(data, protoname, obj, u, protoexp, function (nuobject) {
				if (typeof alert === 'function') {
					// alert("Done searching, found "+JSON.stringify(nuobject));
				}
				// console.error("Done searching, found", nuobject);
				done(p, nuobject, protoexp);
			});
		} catch (e) {
			console.error("Error searching for proto", e);
		}
	},

	/**
	 * processURLs and make them more kosher for the X3DJSONLD user inteferface to
	 * deal with.  Pass an array of URLs and a path for the main JSON file you are
	 * loading.
	 */
	processURLs: function(localArray, path) {
		// console.error("Process URLs", path, localArray);
		var url;
		// No longer need to split
		for (url in localArray) {
			if (localArray[url].indexOf("http://") === 0
			 || localArray[url].indexOf("https://") === 0) {
			} else if (localArray[url].indexOf("urn:web3d:media:textures/panoramas/") === 0) {
				var ls = localArray[url].lastIndexOf("/");
				if (ls > 0) {
					localArray[url] = 'examples/Basic/UniversalMediaPanoramas/'+localArray[url].substring(ls+1);
				}

			} else {
				/*
				var s = localArray[url].indexOf('/');
				*/
				var p = localArray[url].indexOf('#');
				var pe = path.lastIndexOf('/');
				var pc = path;
				if (pe >= 0) {
					pc = path.substring(0, pe);
				}
				/*
				if (s != 0 && p != 0) {
					if (localArray[url].indexOf(pc) != 0) {
						 localArray[url] = pc+'/'+localArray[url];
					}
					if (localArray[url].indexOf('/') === 0) {
						// no webroot absolute paths.  No /'s for X_ITE shaders
						localArray[url] = localArray[url].substring(1);
					}
				}
				*/
				while (localArray[url].startsWith("../")) {
					localArray[url] = localArray[url].substr(3);
					var pe = pc.lastIndexOf('/');
					if (pe >= 0) {
						pc = pc.substring(0, pe);
					} else {
						pc = "";
					}
				}
				if (p == 0) {
					localArray[url] = path+localArray[url];
				} else {
					localArray[url] = pc+"/"+localArray[url];
				}
			}
			// for server side
			var h = localArray[url].lastIndexOf("#") ;
			var hash = "";
			if (h >= 0) {
				hash = localArray[url].substring(h);
				localArray[url] = localArray[url].substring(0, h);
			}
			/*
			var x3d = localArray[url].lastIndexOf(".x3d") ;
			if (x3d === localArray[url].length - 4) {
				localArray[url] = localArray[url].substring(0, x3d)+".json" + hash;
			}
			*/
			var wrl = localArray[url].lastIndexOf(".wrl") ;
			if (wrl === localArray[url].length - 4) {
				localArray[url] = localArray[url].substring(0, wrl)+".json" + hash;
			}
			var wrz = localArray[url].lastIndexOf(".wrz") ;
			if (wrz === localArray[url].length - 4) {
				localArray[url] = localArray[url].substring(0, wrz)+".json" + hash;
			}
				
		}
		// console.error("Processed URLs", localArray.join(" "));
		return localArray;
	},

	/**
	 * Use almost any method possible to load a set of URLs.  The loadpath is the
	 * original URL the main JSON got laoded from, Urls is the se of urls, and
	 * the loadedCallback returns the data and the URL it was loaded from.
	 *
	 * The fs, http and https objects are used by server side, and not used
	 * on the client side unless defined.
	 */
	loadURLs : function(loadpath, urls, loadedCallback, protoexp, done, externProtoDeclare, obj) {
		if (typeof urls !== 'undefined') {
			// console.error("Preprocessed", urls)
			urls = this.processURLs(urls, loadpath);
			// console.error("Postprocessed", urls)
			for (var u in urls) {
				try {
					var url = urls[u];
					(function(url) {
						var p = url.indexOf("://");
						var protocol = "file";
						var host = "localhost";
						var path = "/"+loadpath;
						if (p > 0) {
							protocol = url.substring(0, p);
							var pa = url.indexOf("/", p+3);
							host = url.substring(p+3, pa);
							path = url.substring(pa);
						}

						if (protocol === "http") {
							// console.error("Loading HTTP URL", url);
							if (typeof http !== 'undefined') {
								http.get({ host: host, path: path}, function(res) {
									var data = '';
									res.on('data', function (d) {
										data += d;
									});
									res.on('end', function() {
										loadedCallback(data, url, protoexp, done, externProtoDeclare, obj);
									});
								});
						
							} else {
								var request = new XMLHttpRequest();
								request.open('GET', url, false);  // `false` makes the request synchronous
								request.send(null);
								if (request.status === 200) {
									var data = request.responseText;
									loadedCallback(data, url, protoexp, done, externProtoDeclare, obj);
								}
							}
						} else if (protocol === "https") {
							// console.error("Loading HTTPS URL", url);
							if (typeof https !== 'undefined') {
								https.get({ host: host, path: path}, function(res) {
									var data = '';
									res.on('data', function (d) {
										data += d;
									});
									res.on('end', function() {
										loadedCallback(data, url, protoexp, done, externProtoDeclare, obj);
									});
								});
							} else {
								var request = new XMLHttpRequest();
								request.open('GET', url, false);  // `false` makes the request synchronous
								request.send(null);
								if (request.status === 200) {
									var data = request.responseText;
									loadedCallback(data, url, protoexp, done, externProtoDeclare, obj);
								}
						
							}
						} else if (typeof fs !== 'undefined' && !protocol.startsWith("http")) {
							// should be async, but out of memory
							// console.error("Loading FILE URL", url);
							var hash = url.indexOf("#");
							if (hash > 0) {
								url = url.substring(0, hash);
							}
							try {
								var data = fs.readFileSync(url);
								loadedCallback(data.toString(), url, protoexp, done, externProtoDeclare, obj);
							} catch (e) {
								var filename = url;
								if (filename.endsWith(".json")) {
									filename = filename.substring(0, filename.lastIndexOf("."))+".x3d";
									// console.error("converting possible X3D to JSON", filename);
									if (typeof runAndSend === 'function') {
										runAndSend(['---silent', filename], function(jsobj) {
											data = JSON.stringify(jsobj);
											loadedCallback(data, filename, protoexp, done, externProtoDeclare, obj);
										});
									}
								}
							}
						} else {
							var request = new XMLHttpRequest();
							request.open('GET', url, false);  // `false` makes the request synchronous
							request.send(null);
							if (request.status === 200) {
								var data = request.responseText;
								loadedCallback(data, url, protoexp, done, externProtoDeclare, obj);
							} else {
								console.error("Didn't load", url, ".  No file system or http request.");
							}
						}
					})(url);
				} catch (e) {
					console.error(e);
				}
			}
		}
	},
	load : function (p, file, object, protoexp, done) {
		var obj = object[p];
		var url = obj["@url"];
		// this is a single task
		// console.error("loading External Prototype", file, url);
		this.loadURLs(file, url, protoexp.doLoad, protoexp, done, p, obj);
	},
	externalPrototypeExpander: function (file, object) {
		if (typeof object === "object") {
			var newobject = null;
			if (Array.isArray(object)) {
				newobject = [];
			} else {
				newobject = {};
			}
			for (var p in object) {
				if (p === "ExternProtoDeclare") {
					this.load(p, file, object, this, function(p, newobj, protoexp) {
						if (newobj != null && typeof newobj != 'undefined') {
							// process new proto declare for additional extern proto declares
							// console.log("*******", typeof protoexp);
							newobject["ProtoDeclare"] = protoexp.externalPrototypeExpander(file, newobj)["ProtoDeclare"];
						}
					});
				} else {
					// console.log("*******", typeof this);
					newobject[p] = this.externalPrototypeExpander(file, object[p]);
				}
			}
			var expectedreturn = Object.keys(object).length;
			// Wait for expectedreturn tasks to finish
			while (expectedreturn > Object.keys(newobject).length + 1); {  // when they are equal, we exit
			       // console.error(expectedreturn, '=', Object.keys(newobject).length);
			       setTimeout(function () { }, 50);
			}
			return newobject;
		} else {
			return object;
		}
	}
};

x3dom.protoExpander = new x3dom.PROTOS();
