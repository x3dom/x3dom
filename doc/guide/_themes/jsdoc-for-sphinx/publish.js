/** Called automatically by JsDoc Toolkit. */

// some utility filters

function hasNoParent($) {return ($.memberOf == "")}
function isaFile($) {return ($.is("FILE"))}
function isaClass($) {return ($.is("CONSTRUCTOR") || $.isNamespace)}

var partials = {};

function get_type (symbol) {
    var classType = "";

    if (symbol.isBuiltin()) {
        classType += "Built-In ";
    }
    
    if (symbol.isNamespace) {
        if (symbol.is('FUNCTION')) {
            classType += "Function ";
        }
        classType += "Namespace ";
    }
    else {
        classType += "Class ";
    }
    return classType;
}

function trim (obj) {
    return obj.toString().replace(/^\s+|\s+$/g,"");
}

/** Make a symbol sorter by some attribute. */
function makeSortby(attribute) {
    return function(a, b) {
        if (a[attribute] != undefined && b[attribute] != undefined) {
            a = a[attribute].toLowerCase();
            b = b[attribute].toLowerCase();
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        }
    }
}

/** Build output for displaying function parameters. */
function makeSignature(params) {
    if (!params) return "()";
    var signature = "("
    +
    params.filter(
        function(param) {
            return param.name.indexOf(".") == -1; // don't show config params in signature
        }
    ).map(function(param) {
        if (param.isOptional) {
            return "[" + param.name + "]";
        } else {
            return param.name;
        }
    }).join(", ")
    +
    ")";
    return signature;
}

function resolveLinks(str, from) {
    // deprecated
    return str;
}

function publish(symbolSet) {
    var base = JSDOC.opt._[0];   
    publish.conf = {  // trailing slash expected for dirs
        ext:         ".html", // ===> .rst
        outDir:      JSDOC.opt.d || SYS.pwd+"../out/jsdoc/",
        templatesDir: JSDOC.opt.t || SYS.pwd+"../templates/jsdoc/",
        symbolsDir:  "symbols/"
    };
        
    // used to allow Link to check the details of things being linked to
    Link.symbolSet = symbolSet;

    // create the required templates
    try {
        var templates = {
            'class': new JSDOC.JsPlate(publish.conf.templatesDir + "class.tmpl")
        }
    }
    catch(e) {
        print("Couldn't create the required templates: "+e);
        quit();
    }
    
    // get an array version of the symbolset, useful for filtering
    var symbols = symbolSet.toArray();
    
    // get a list of all the classes in the symbolset
    var classes = symbols.filter(isaClass).sort(makeSortby("alias"));
    
    // create a filemap in which outfiles must be to be named uniquely, ignoring case
    if (JSDOC.opt.u) {
        var filemapCounts = {};
        Link.filemap = {};
        for (var i = 0, l = classes.length; i < l; i++) {
            var lcAlias = classes[i].alias.toLowerCase();
            
            if (!filemapCounts[lcAlias]) filemapCounts[lcAlias] = 1;
            else filemapCounts[lcAlias]++;
            
            Link.filemap[classes[i].alias] = 
                (filemapCounts[lcAlias] > 1)?
                lcAlias+"_"+filemapCounts[lcAlias] : lcAlias;
        }
    }
    
    // create each of the class pages
    for (var i = 0, l = classes.length; i < l; i++) {
        var symbol = classes[i];
        
        symbol.events = symbol.getEvents();   // 1 order matters
        symbol.methods = symbol.getMethods(); // 2
        
        template = templates['class'].process(symbol);
            
        var dir = publish.conf.outDir.slice(0, -1);
        var source = symbol.srcFile.replace(base, '').split('/').slice(0, -1).join('/');
        var docdir = new File(dir + source);
        docdir.mkdirs();
        var filename = ((JSDOC.opt.u) ? Link.filemap[symbol.alias] : symbol.alias) + '.rst';
        
        IO.saveFile(docdir, filename, template);
    }

    var base = JSDOC.opt._[0];   
    // get an array version of the symbolset, useful for filtering
    var symbols = symbolSet.toArray();
}