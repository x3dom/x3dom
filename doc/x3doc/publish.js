/*global env: true */
var template = require('jsdoc/template'),
    fs = require('jsdoc/fs'),
    path = require('jsdoc/path'),
    taffy = require('taffydb').taffy,
    handle = require('jsdoc/util/error').handle,
    helper = require('jsdoc/util/templateHelper'),
    util = require('util'),
    htmlsafe = helper.htmlsafe,
    linkto = helper.linkto,
    resolveAuthorLinks = helper.resolveAuthorLinks,
    scopeToPunc = helper.scopeToPunc,
    hasOwnProp = Object.prototype.hasOwnProperty,
    data,
    view,
    xndf = env.opts.query.xndf,
    outdir = env.opts.destination;


/**
    @param {TAFFY} taffyData See <http://taffydb.com/>.
    @param {object} opts
    @param {Tutorial} tutorials
 */
exports.publish = function(taffyData, opts, tutorials) {
    data = taffyData;

    var conf = env.conf.templates || {};
    conf['default'] = conf['default'] || {};

    var templatePath = opts.template;
    view = new template.Template(templatePath + '/tmpl');

    // claim some special filenames in advance, so the All-Powerful Overseer of Filename Uniqueness
    // doesn't try to hand them out later
    var indexUrl = helper.getUniqueFilename('index');
    // don't call registerLink() on this one! 'index' is also a valid longname

    //var globalUrl = "";//helper.getUniqueFilename('global');
    helper.registerLink('global', "");

    // set up templating
    view.layout = 'layout.tmpl';

    //cleanup data
    data = helper.prune(data);
    data.sort('longname, version, since');

    var sourceFiles = {};
    var sourceFilePaths = [];

    //create lists of source files and paths
    readSourceFilesAndPaths(sourceFiles,sourceFilePaths);


    //find namespaces
    var namespaces = [];
    var hasNameSpace = ( find({kind: 'namespace'}) || [] );
    for( var ns in hasNameSpace)
    {
        var longdirname = hasNameSpace[ns].longname.replace(".","/");
        namespaces.push(longdirname);
    }

    //find components
    var components = [];
    var hasComponents = ( find({component:{isUndefined: false}}) || [] );

    for(var hc in hasComponents)
    {
        components.push(hasComponents[hc].component);
    }

    //create folder structure
    createFolderStructure(outdir,namespaces, components );

    //copy static files
    copyStaticFiles(templatePath);

    //shorten pathes
    shortenSourceFilePaths(sourceFilePaths, sourceFiles);

    //add signatures
    data().each(function(doclet) {
        var url = helper.longnameToUrl[doclet.longname];

        if (url.indexOf('#') > -1) {
            doclet.id = url.split(/#/).pop();
        }
        else {
            doclet.id = doclet.name;
        }

        if ( needsSignature(doclet) ) {
            addSignatureParams(doclet);
            addSignatureReturns(doclet, doclet.kind != 'function');
            addAttribs(doclet);
        }
    });

    // do this after the urls have all been generated
    data().each(function(doclet) {
        doclet.ancestors = getAncestorLinks(doclet);

        if (doclet.kind === 'member') {
            addSignatureTypes(doclet);
            addAttribs(doclet);
        }

        if (doclet.kind === 'constant') {
            addSignatureTypes(doclet);
            addAttribs(doclet);
            doclet.kind = 'member';
        }
    });

    //get data of member
    var typeLists = getLists();

    // add template helpers
    view.find = find;
    view.linkto = linkto;
    view.linkFromTo = linkFromTo;
    view.linkFromContextTo = linkFromContextTo;
    view.resolveAuthorLinks = resolveAuthorLinks;
    view.htmlsafe = htmlsafe;
    view.context = null;
    view.typeLists = typeLists;
    view.disassemble = disassemble;

    var componentMap = {};

    //inheritance hierarchy
    //generate X3D Nodes
    var x3dNodes = helper.find(taffy(typeLists.x3dNodes));
    for(var n in x3dNodes)
    {
        var node = x3dNodes[n];

        if(node.augments)
        {
            var parent = helper.find(taffy(typeLists.x3dNodes) , {longname:node.augments} )[0];
            if( parent)
            {
                if(!parent.childNodes)
                    parent.childNodes = [];

                parent.childNodes.push(node);
                node.parentNode = parent;
            }
        }
    }

    for (var longname in helper.longnameToUrl) {
        if ( hasOwnProp.call(helper.longnameToUrl, longname) ) {

            //generate classes
            var myClasses = helper.find(taffy(typeLists.classes), {longname: longname});
            if (myClasses.length)
            {
                view.api = "developer";
                generateClass('Class: ' + myClasses[0].name, myClasses, createDeveloperlApiPathWithFolders("developer."+helper.longnameToUrl[longname], false, true));
            }

            //generate X3D Nodes
            var x3dNodes = helper.find(taffy(typeLists.x3dNodes), {longname: longname});
            if (x3dNodes.length)
            {
                if(typeof componentMap[x3dNodes[0].component] === 'undefined')
                {
                    componentMap[x3dNodes[0].component]= [];
                }
                componentMap[x3dNodes[0].component].push(x3dNodes[0]);

                //console.log(x3dNodes[0].name+ " " +x3dNodes[0].x3d + " " + x3dNodes[0].component);
                view.api = "author";
                generateX3DNode('Node: ' + x3dNodes[0].name, x3dNodes, createSceneAuthorApiPathWithFolders( x3dNodes[0],helper.longnameToUrl[longname]));

                if(xndf)
                {
                    generateXNDF(x3dNodes[0].name, x3dNodes[0]);
                }
            }

            //generate namespace overviews
            var namespaces = helper.find(taffy(typeLists.namespaces), {longname: longname});
            if (namespaces.length)
            {
                var classes = helper.find(taffy(typeLists.classes), { memberof: longname});

                view.api = "developer";

                //if(helper.longnameToUrl[longname].indexOf("global") != 0 )
                generateNameSpace('Namespace: ' + namespaces[0].name, namespaces, classes, createDeveloperlApiPathWithFolders("developer."+helper.longnameToUrl[longname],true,true));
            }
        }
    }

    view.api = "developer";
    generateIndex("Classes", typeLists.classes, false, "developer/classes.html",true);
    generateIndex("Namespaces", typeLists.namespaces, true, "developer/namespaces.html",true);

    view.api = "author";
    generateComponents(componentMap);
    generateIndex("Nodes",typeLists.x3dNodes,false,"author/nodes.html",true);
};

//----------------------------------------------------------------------------------------------------------------------

function createSceneAuthorApiPathWithFolders(doc,url, addNodeFolder)
{
    addNodeFolder = addNodeFolder === false ? false : true;
    var desc = disassemble(url,true,/\./g, false);

    return (addNodeFolder ? "author/" : "")+doc.component+"/"+desc.name+ "." + desc.ending;
}


//----------------------------------------------------------------------------------------------------------------------

function createDeveloperlApiPathWithFolders(url, isNamespace, hasEnding)
{
    //secure against "global" links
    if(isNamespace)
    {
        if(url.indexOf("global.html#") != -1)
        {
            url = url.replace("global.html#","x3dom.");
        }
    }

    hasEnding = (typeof hasEnding != 'undefined') ? hasEnding : true;
    isNamespace = (typeof isNamespace != 'undefined') ? isNamespace : false;
    var desc = disassemble(url, hasEnding, /\./g, isNamespace);

    var path = desc.path.toString().replace(/,/g,"/");
    path = path + ((path.length  > 0 && path[path.length-1] != "/") ? "/" : "" );

    var val = isNamespace ?
         path + desc.name + "/index.html":
         path + desc.name+ "." + ( hasEnding ? desc.ending: "html");

    return val.replace('//','/');
}

//----------------------------------------------------------------------------------------------------------------------

function getPathFromDoclet(doclet) {
    if (!doclet.meta) {
        return;
    }

    var filepath = doclet.meta.path && doclet.meta.path !== 'null' ?
        doclet.meta.path + '/' + doclet.meta.filename :
        doclet.meta.filename;

    return filepath;
}

//----------------------------------------------------------------------------------------------------------------------

function shortenPaths(files, commonPrefix) {
    // always use forward slashes
    var regexp = new RegExp('\\\\', 'g');

    Object.keys(files).forEach(function(file)
    {
        files[file].shortened = files[file].resolved.replace(commonPrefix, '')
            .replace(regexp, '/');
        //console.log(files[file].shortened +" <-" + files[file].resolved );
    });

    return files;
}

//----------------------------------------------------------------------------------------------------------------------

function find(spec)
{
    return helper.find(data, spec);
}

//----------------------------------------------------------------------------------------------------------------------

function resolveSourcePath(filepath)
{
    return path.resolve(process.cwd(), filepath);
}

//----------------------------------------------------------------------------------------------------------------------

/**
 * read sourcefiles and paths from data
 * @param sourceFiles - source file list target object
 * @param sourceFilePaths - source file paths target object
 */
function readSourceFilesAndPaths(sourceFiles, sourceFilePaths)
{
    data().each(function(doclet)
    {
        doclet.attribs = '';

        // build a list of source files
        var sourcePath;
        var resolvedSourcePath;
        if (doclet.meta) {
            sourcePath = getPathFromDoclet(doclet);
            resolvedSourcePath = resolveSourcePath(sourcePath);
            sourceFiles[sourcePath] = {
                resolved: resolvedSourcePath,
                shortened: null
            };
            sourceFilePaths.push(resolvedSourcePath);
        }
    });
}

//----------------------------------------------------------------------------------------------------------------------

/**
 * Create the full folder structure for the documentation
 * @param outdir - output directory
 */
function createFolderStructure(outdir, namespaces, components)
{
    //Create outdir
    if(fs.existsSync(outdir))
    {
        console.log("outdir:' "+outdir +" 'not deletet - should be deleted first !");
    }
    else
        fs.mkPath(outdir);


    //Create base folders
    var baseFolders =
    [
        "/developer/", "/author/"
    ];

    for(var path in baseFolders)
    {
        fs.mkPath(outdir+baseFolders[path]);
    }

    //create namespace folders
    for(var ldr in namespaces)
    {
        fs.mkPath(outdir+"/developer/"+namespaces[ldr]);
    }

    //create component folders
    for(var cmp in components)
    {
        fs.mkPath(outdir+"/author/"+components[cmp]);
    }
}

//----------------------------------------------------------------------------------------------------------------------

function copyStaticFiles (templatePath)
{
    // copy static files to outdir
    var fromDir = path.join(templatePath, 'base'),
        baseFiles = fs.ls(fromDir, 50);

    baseFiles.forEach(function(fileName) {
        var toDir = fs.toDir( fileName.replace(fromDir, outdir+"") );
        fs.mkPath(toDir);
        fs.copyFileSync(fileName, toDir);
    });

}

//----------------------------------------------------------------------------------------------------------------------

function shortenSourceFilePaths(sourceFilePaths, sourceFiles)
{
    if (sourceFilePaths.length)
    {
        sourceFiles = shortenPaths( sourceFiles, path.commonPrefix(sourceFilePaths) );
    }
    data().each(function(doclet)
    {
        var url = helper.createLink(doclet);

        //register links
        helper.registerLink(doclet.longname, url);

        // replace the filename with a shortened version of the full path
        var docletPath;
        if (doclet.meta) {
            docletPath = getPathFromDoclet(doclet);
            docletPath = sourceFiles[docletPath].shortened;
            if (docletPath)
            {
                doclet.meta.filename = docletPath;
            }
        }
    });
}

//----------------------------------------------------------------------------------------------------------------------

function needsSignature(doclet)
{
    var needsSig = false;

    // function and class definitions always get a signature
    if (doclet.kind === 'function' || doclet.kind === 'class') {
        needsSig = true;
    }
    // typedefs that contain functions get a signature, too
    else if (doclet.kind === 'typedef' && doclet.type && doclet.type.names &&
        doclet.type.names.length) {
        for (var i = 0, l = doclet.type.names.length; i < l; i++) {
            if (doclet.type.names[i].toLowerCase() === 'function') {
                needsSig = true;
                break;
            }
        }
    }

    return needsSig;
}

//----------------------------------------------------------------------------------------------------------------------

function addSignatureParams(f)
{
    var params = helper.getSignatureParams(f, 'optional');

    f.signature = (f.signature || '') + '('+params.join(', ')+')';
}

//----------------------------------------------------------------------------------------------------------------------

function addSignatureReturns(f, format)
{
    format = format !== undefined ? format : true;

    var returnTypes = [];

    if (f.returns)
    {
        f.returns.forEach(function(r)
        {
            if (r.type && r.type.names)
            {
                if (!returnTypes.length)
                {
                    returnTypes = r.type.names;
                }
            }
        });
    }

    if (format && returnTypes && returnTypes.length)
    {
        returnTypes = returnTypes.map(function(r) {
            return linkto(r, htmlsafe(r));
        });
    }

    f.sigRet =
    {
        "pre" :  '<span class="signature">'+(f.signature || '') + '</span>' + '<span class="type-signature">',
        "longname" : returnTypes.length ? returnTypes[0] : undefined,
        "post" : '</span>'
    };

    f.signature = '<span class="signature">'+(f.signature || '') + '</span>' + '<span class="type-signature">'+(returnTypes.length? ' &rarr; {'+returnTypes.join('|')+'}' : '')+'</span>';
}

//----------------------------------------------------------------------------------------------------------------------

function addSignatureTypes(f)
{
    var types = helper.getSignatureTypes(f);

    f.signature = (f.signature || '') + '<span class="type-signature">'+(types.length? ' :'+types.join('|') : '')+'</span>';
}

//----------------------------------------------------------------------------------------------------------------------

function addAttribs(f)
{
    var attribs = helper.getAttribs(f);

    f.attribs = '<span class="type-signature">'+htmlsafe(attribs.length? '<'+attribs.join(', ')+'> ' : '')+'</span>';
}

//----------------------------------------------------------------------------------------------------------------------

function getAncestorLinks(doclet)
{
    var from = doclet;
    var ancestors = [],
        doc = doclet.memberof;

    while (doc)
    {
        doc = helper.find( data, {longname: doc}, false );
        if (doc) { doc = doc[0]; }
        if (!doc) { break; }
        ancestors.unshift( linkFromTo( from.longname, from.kind == "namespace", doc.longname, doc.kind == "namespace" ,(helper.scopeToPunc[doc.scope] || '') + doc.name) );
        doc = doc.memberof;
    }
    if (ancestors.length)
    {
        ancestors[ancestors.length - 1] += (helper.scopeToPunc[doclet.scope] || '');
    }
    return ancestors;
}

//----------------------------------------------------------------------------------------------------------------------

function getLists()
{
    return {
        classes: find( {kind: 'class'} ),
        x3dNodes: find( { kind: 'class', x3d:{isUndefined: false}, component:{ isUndefined: false}}),
        externals: find( {kind: 'external'} ),
        events: find( {kind: 'event'}),
        globals: find( { kind: ['member', 'function', 'constant', 'typedef'], memberof: { isUndefined: true }}),
        //mixins: find( {kind: 'mixin'} ),
        //modules: find({kind: 'module'} ),
        namespaces: find( {kind: 'namespace'} )
    };
}

//----------------------------------------------------------------------------------------------------------------------

function generateClass(title, docs, filename)
{
    var  docData = {
        title: title,
        docs: docs,
        filename: filename
    };

    var outpath = path.join(outdir , filename),
    html = view.render('classContainer.tmpl', docData);
    fs.writeFileSync(outpath, html, 'utf8');
}

//----------------------------------------------------------------------------------------------------------------------

function generateX3DNode(title, docs, filename)
{
    var  docData = {
        title: title,
        docs: docs,
        filename: filename
    };

    var outpath = path.join(outdir , filename),
        html = view.render('classContainer.tmpl', docData);
    fs.writeFileSync(outpath, html, 'utf8');
}

//----------------------------------------------------------------------------------------------------------------------

function generateNameSpace(title, docs, classes, filename)
{
    var docData = {
        title: title,
        docs: docs,
        filename: filename,
        classes : []
    };

    for(var c in classes)
    {
        docData.classes.push({
            name: classes[c].name,
            url: classes[c].longname
        });
    }

    var outpath = path.join(outdir , filename),
        html = view.render('namespaceContainer.tmpl', docData);
    fs.writeFileSync(outpath, html, 'utf8');
}

//----------------------------------------------------------------------------------------------------------------------

function generateComponents(componentMap)
{
    //generate
    var components = [];

    for(var c in componentMap)
    {
        components.push({
            name: c,
            url: c+"/index.html"
        });

        for(var m in componentMap[c])
        {
            componentMap[c][m].url = componentMap[c][m].name + ".html";
        }

        generateIndex("Component: " + c, componentMap[c], false, "author/"+c+"/index.html", false);
    }

    generateIndex("Components",components, false, "author/components.html");
}


//----------------------------------------------------------------------------------------------------------------------

function generateIndex(title, objects, isNameSpace, filename, generateUrls)
{
    generateUrls = generateUrls === true ? true: false;

    var docData =
    {
        title: title,
        filename: filename,
        letterHeadline : !isNameSpace,
        indexed: []
    }

    var names =  [];

    for(var o in objects)
    {
        var name = isNameSpace ? objects[o].longname : objects[o].name;

        if(!isNameSpace || names.indexOf(name) < 0)
        {
            names.push(name);

            docData.indexed.push({
                name: name,
                url: generateUrls ?
                    (view.api == "developer" ?
                        createDeveloperlApiPathWithFolders(objects[o].longname,isNameSpace,false) :
                        createSceneAuthorApiPathWithFolders(objects[o], helper.longnameToUrl[objects[o].longname],false)) :
                    objects[o].url
            });
        }
    }

    docData.indexed.sort(function(a,b)
    {
        return (a.name == b.name ? 0 : ((a.name < b.name) ? -1 : 1));
    });

    var outpath = path.join(outdir , filename),
        html =  view.render('indexedContent.tmpl', docData);

    fs.writeFileSync(outpath, html, 'utf8');

}

//----------------------------------------------------------------------------------------------------------------------

function disassemble(longname, hasEnding, del, isNamespace)
{
    var isNamespace = isNamespace !== undefined ? isNamespace : false;
    var del = del !== undefined ? del : /\./g;


    var parts = longname.split(del);
    var ending = hasEnding ? parts.pop() : "";
    var name = isNamespace ? "" : parts.pop();

    return {
        path : parts,
        ending : ending,
        name: name
    };
}
//----------------------------------------------------------------------------------------------------------------------

function linkFromTo(longnameFrom, fromNamespace, longnameTo, toNameSpace, linktext, cssClass)
{
    var from = disassemble(longnameFrom, false, /\./g, fromNamespace );
    var to = disassemble(longnameTo, false, /\./g, toNameSpace );

    //find depth of equality
    var equal = true, depth = -1;
    while(equal && (depth < from.path.length))
    {
        depth++;

        if(from.path[depth] != to.path[depth])
            equal = false;
    }


    var classString = cssClass ? util.format(' class="%s"', cssClass) : '';
    var text = linktext || longnameTo;

    var url = helper.longnameToUrl[longnameTo];

    if (!url) {
        return text;
    }
    else
    {
        url = disassemble(url,true,/\./g);
        url.path = url.path.slice(depth,url.path.length);

        var link = "";
        for(var i = depth; i < from.path.length; ++i)
        {
            link +="../";
        }
        link += (url.path.length > 0 ? url.path.toString().replace(/,/g,"/")+"/" : "");

        if(toNameSpace)
        {
            link += "index.html";
        }
        else
        {
            link += url.name +"."+ url.ending;
        }

        //console.log(longnameFrom + " " +fromNamespace+ "("+from.path.length+") -> "+longnameTo+" "+ toNameSpace+"("+to.path.length+") equal: "+depth);
        //console.log("----> "+link);
        return util.format('<a href="%s"%s>%s</a>', link, classString, text);
    }
};

//----------------------------------------------------------------------------------------------------------------------

function linkFromContextTo( longnameTo, toNameSpace, linktext, cssClass)
{
    var link = "";
    if(view.api == "developer")
    {
        link = linkFromTo(view.context.longname, view.context.kind == 'namespace', longnameTo, toNameSpace, linktext, cssClass);
    }
    else
    {
        for(var i = 0, n = view.typeLists.x3dNodes.length; i < n; ++i )
        {
            var node = view.typeLists.x3dNodes[i];
            if(node.longname == longnameTo)
            {
                var url = helper.longnameToUrl[longnameTo];
                url = disassemble(url,true,/\./g);

                var path = (node.component == view.context.component) ? "" : ("../"+node.component+"/");
                return util.format('<a href="%s">%s</a>', path+url.name+"."+url.ending, path == "" ? node.name : node.component+"/"+node.name );
            }
        }
    }
    return (!link)?linktext:link;
};

//----------------------------------------------------------------------------------------------------------------------

function generateXNDF(name, node)
{
    var folder = path.join(outdir , "xndf/");
    fs.mkPath(folder);

    var outpath = folder+name+".xndf";
    var delim = "    ";


    var html = '<?xml version="1.0" encoding="UTF-8"?>\n';

    html += '<node \n';
    html += delim + 'name="'+name+'"\n';
    html += delim + 'parent="'+(node.parentNode ? node.parentNode.name : "null")+'"\n';
    html += delim + 'component="'+node.component+'"\n';
    html += delim + 'status="'+node.status+'"\n';
    html += delim + 'standard="X3D'+node.x3d+'"\n';
    html += '>\n';

    html += delim + node.description + '>\n';


    var members = find({kind: 'member',  memberof: node.longname});
    if (members && members.length && members.forEach)
    {
        members.forEach(function(m)
        {
            if(m.field && !m.inherits)
            {

                html += delim + '<field \n';
                html += delim + delim + 'name="'+ m.name +'"\n';
                html += delim + delim + 'data="'+ m.type.names[0] +'"\n';
                html += delim + delim + 'visibility="public"\n';
                html += delim + delim + 'conformance="'+(node.field == "x3d"? "standard" : "x3dom" )+'"\n';
                html += delim + delim + 'defaultValue=""\n';
                html += delim + '>\n';

                html += delim + delim + (m.description ? m.description : "" ) + '\n';

                html += delim + '</field>\n';
            }
        });
    }


    html += '</node>';

    fs.writeFileSync(outpath, html, 'utf8');

}