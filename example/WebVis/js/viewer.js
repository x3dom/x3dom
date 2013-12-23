/**
 * Created by Timo on 11.10.13.
 */

var parts = {};
var numUnloadedParts = 0;
var progessActive = false;
var viewer_is_active=false;
var showAll = true;
var viewpoint = null;
var toolTipEnabled = true;
var measureEnabled = false;
var measure = new Measure();
var NAVMODES = {ROTATE: 1, MOVE: 4, ZOOM: 2};
var navMode = NAVMODES.ROTATE;
var DISPLAYMODES = {POINTS: 1, LINES: 2, FACES: 3};
var displayMode = DISPLAYMODES.FACES;
var viewarea = null;
var canvas = null;
var navigate = false;
var frustumCulling = true;
var smallFeatureCulling = false;
var smallFeatureThreshold = 1;
var lowPriorityCulling = false;
var lowPriorityThreshold = 0.5;
var adaptiveRenderControl = false;
var minFrameRate = 1.0;
var maxFameRate = 62.5;
var showStates = false;
var showDebug = false;
var x3dElem = null;

var config = {};
config.token="";
config.urlHead="";
config.urlTail="";
config.transcoder={};
config.transcoder.waitBeforeRetry=2000;
config.transcoder.retries=10;
config.transcoder.host="";
config.delivery={};
config.delivery.host="";
config.delivery.retries=20;
config.transcoding={};
config.transcoding.optimization = null;
config.transcoding.conversion = "toBinGeo";
config.transcoding.string = "collapse_restructure,toBinGeo";
config.transcoding.updateString=function(){
    if(this.optimization!=null)
        this.string=this.optimization+",";
    else
        this.string="";
    this.string+=this.conversion;
    console.log("Transcoder set to: "+this.string);
};
config.transcoding.optimizationTypes = [null,"collapse","restructure","collapse_restructure"];
config.transcoding.conversionTypes = ["toBinGeo","toPopGeo","toImageGeo"];


function initViewer()
{
    x3dElem = document.getElementById('x3dElement');

    viewarea = x3dElem.runtime.canvas.doc._viewarea;
    
    var navi = x3dElem.runtime.getActiveBindable("NavigationInfo");
    navi.setAttribute("explorationMode", "rotate");

    var vpchanged = function(event){
        if(event) {
            viewpoint={position:event.position,orientation:event.orientation};
        }
    };
    document.getElementById('vp0').addEventListener('viewpointChanged', vpchanged, false);

    $('#env').prop('frustumCulling', frustumCulling);
    $('#env').prop('smallFeatureCulling', smallFeatureCulling);
    $('#env').prop('smallFeatureThreshold', smallFeatureThreshold);
    $('#env').prop('lowPriorityCulling', lowPriorityCulling);
    $('#env').prop('lowPriorityThreshold', lowPriorityThreshold);
    $('#env').prop('enableARC', adaptiveRenderControl);
    $('#env').prop('minFrameRate', minFrameRate);
    $('#env').prop('maxFameRate', maxFameRate);

    if(frustumCulling)
    {
        $('#cm_frustum').removeClass('contextMenuItem').addClass('contextMenuItem_check');
    }
    else
    {
        $('#cm_frustum').removeClass('contextMenuItem_check').addClass('contextMenuItem');
    }

    if (lowPriorityCulling)
    {
        $('#cm_lowPriority').removeClass('contextMenuItem').addClass('contextMenuItem_check');
        smallFeatureCulling = true;
    }
    else
    {
        $('#cm_lowPriority').removeClass('contextMenuItem_check').addClass('contextMenuItem');
    }

    if (smallFeatureCulling)
    {
        $('#cm_smallFeature').removeClass('contextMenuItem').addClass('contextMenuItem_check');
    }
    else
    {
        $('#cm_smallFeature').removeClass('contextMenuItem_check').addClass('contextMenuItem');
    }

    if (adaptiveRenderControl)
    {
        $('#cm_ARC').removeClass('contextMenuItem').addClass('contextMenuItem_check');
    }
    else
    {
        $('#cm_ARC').removeClass('contextMenuItem_check').addClass('contextMenuItem');
    }

    $("#viewerVersion").html("v" + viewerVersion.toFixed(1));
    $("#aboutOverlay").click(function() {
        $(this).hide();
    });

    $("#contextMenuParts").bind("contextmenu",function(event){
        event.preventDefault();
        event.stopPropagation();
        event.returnValue = false;
        return false;
    });
    $("#contextMenuDefault").bind("contextmenu",function(event){
        event.preventDefault();
        event.stopPropagation();
        event.returnValue = false;
        return false;
    });
    $("#cm_hideSelected").click(function(){
        updatePartVisibility(this.parentElement.dataset.id, false);
        $("#contextMenuParts").hide();
    });

    $("#cm_hideUnselected").click(function(){
        for (var part in parts)
        {
            if (part != this.parentElement.dataset.id)
            {
                updatePartVisibility(part, false);
            }
        }
        $("#contextMenuParts").hide();
    });
    $("#cm_hideAll").click(function(){
        for (var part in parts)
        {
            updatePartVisibility(part, false);
        }
        $("#contextMenuDefault").hide();
    });

    $("#cm_unhideAll").click(function(){
        for (var part in parts)
        {
            updatePartVisibility(part, true);
        }
        $("#contextMenuDefault").hide();
    });

    $("#cm_delete").click(function(){
        deletePart(this.parentElement.dataset.id);
        $("#contextMenuParts").hide();
    });
    $("#cm_statistic").click(function(){
        window.open(this.parentElement.dataset.statistics);
        $("#contextMenuParts").hide();
    });
    $(".contextMenu").mouseleave(function(){
        $(this).hide();
    });

    $("#contextMenuTranscoder").css("right", "5px");
    $("#contextMenuTranscoder").css("top", "30px");

    $("#settings").click(function(){
        $("#settings").removeClass("toolbarTranscoder").addClass("toolbarTranscoder_active");
        $("#contextMenuTranscoder").show();
    });

    $("#cm_optNone").click(function(){
        $("#cm_optNone").removeClass("contextMenuItem").addClass("contextMenuItem_check");
        $("#cm_optCollapse").removeClass("contextMenuItem_check").addClass("contextMenuItem");
        $("#cm_optReconstruct").removeClass("contextMenuItem_check").addClass("contextMenuItem");
        $("#cm_optBoth").removeClass("contextMenuItem_check").addClass("contextMenuItem");
        $("#settings").removeClass("toolbarTranscoder_active").addClass("toolbarTranscoder");
        $("#contextMenuTranscoder").hide();
        config.transcoding.optimization = null;
        config.transcoding.updateString();
    });

    $("#cm_optCollapse").click(function(){
        $("#cm_optNone").removeClass("contextMenuItem_check").addClass("contextMenuItem");
        $("#cm_optCollapse").removeClass("contextMenuItem").addClass("contextMenuItem_check");
        $("#cm_optReconstruct").removeClass("contextMenuItem_check").addClass("contextMenuItem");
        $("#cm_optBoth").removeClass("contextMenuItem_check").addClass("contextMenuItem");
        $("#settings").removeClass("toolbarTranscoder_active").addClass("toolbarTranscoder");
        $("#contextMenuTranscoder").hide();
        config.transcoding.optimization = "collapse";
        config.transcoding.updateString();
    });

    $("#cm_optReconstruct").click(function(){
        $("#cm_optNone").removeClass("contextMenuItem_check").addClass("contextMenuItem");
        $("#cm_optCollapse").removeClass("contextMenuItem_check").addClass("contextMenuItem");
        $("#cm_optReconstruct").removeClass("contextMenuItem").addClass("contextMenuItem_check");
        $("#cm_optBoth").removeClass("contextMenuItem_check").addClass("contextMenuItem");
        $("#settings").removeClass("toolbarTranscoder_active").addClass("toolbarTranscoder");
        $("#contextMenuTranscoder").hide();
        config.transcoding.optimization = "reconstruct";
        config.transcoding.updateString();
    });

    $("#cm_optBoth").click(function(){
        $("#cm_optNone").removeClass("contextMenuItem_check").addClass("contextMenuItem");
        $("#cm_optCollapse").removeClass("contextMenuItem_check").addClass("contextMenuItem");
        $("#cm_optReconstruct").removeClass("contextMenuItem_check").addClass("contextMenuItem");
        $("#cm_optBoth").removeClass("contextMenuItem").addClass("contextMenuItem_check");
        $("#settings").removeClass("toolbarTranscoder_active").addClass("toolbarTranscoder");
        $("#contextMenuTranscoder").hide();
        config.transcoding.optimization = "collapse_restructure";
        config.transcoding.updateString();
    });

    $("#cm_interface").click(function(){
        window.open("http://" + config.transcoder.host);
        $("#settings").removeClass("toolbarTranscoder_active").addClass("toolbarTranscoder");
        $("#contextMenuTranscoder").hide();
    });

    $("#cm_about").click(function(){
        $("#contextMenuTranscoder").hide();
        $("#aboutOverlay").show();
    });

    $("#cm_frustum").click(function(){
        if (frustumCulling)
        {
            $("#cm_frustum").removeClass("contextMenuItem_check").addClass("contextMenuItem");
            frustumCulling = false;
            $("#env").prop("frustumCulling", frustumCulling);
        }
        else
        {
            $("#cm_frustum").removeClass("contextMenuItem").addClass("contextMenuItem_check");
            frustumCulling = true;
            $("#env").prop("frustumCulling", frustumCulling);
        }
        $("#contextMenuTranscoder").hide();
    });

    $("#cm_smallFeature").click(function(){
        if (smallFeatureCulling)
        {
            $("#cm_smallFeature").removeClass("contextMenuItem_check").addClass("contextMenuItem");
            smallFeatureCulling = false;
            $("#env").prop("smallFeatureCulling", smallFeatureCulling);
        }
        else
        {
            $("#cm_smallFeature").removeClass("contextMenuItem").addClass("contextMenuItem_check");
            smallFeatureCulling = true;
            $("#env").prop("smallFeatureCulling", smallFeatureCulling);
        }
        $("#contextMenuTranscoder").hide();
    });

    $("#cm_lowPriority").click(function(){
        if (lowPriorityCulling)
        {
            $("#cm_lowPriority").removeClass("contextMenuItem_check").addClass("contextMenuItem");
            lowPriority = false;
            $("#env").prop("lowPriorityCulling", lowPriorityCulling);
        }
        else
        {
            $("#cm_lowPriority").removeClass("contextMenuItem").addClass("contextMenuItem_check");
            lowPriority = true;
            $("#env").prop("lowPriorityCulling", lowPriorityCulling);

            //Also enable small feature culling
            $("#cm_smallFeature").removeClass("contextMenuItem").addClass("contextMenuItem_check");
            smallFeatureCulling = true;
            $("#env").prop("smallFeatureCulling", smallFeatureCulling);
        }
        $("#contextMenuTranscoder").hide();
    });

    $("#cm_ARC").click(function(){
        if (adaptiveRenderControl)
        {
            $("#cm_ARC").removeClass("contextMenuItem_check").addClass("contextMenuItem");
            adaptiveRenderControl = false;
            $("#env").prop("enableARC", adaptiveRenderControl);
        }
        else
        {
            $("#cm_ARC").removeClass("contextMenuItem").addClass("contextMenuItem_check");
            adaptiveRenderControl = true;
            $("#env").prop("enableARC", adaptiveRenderControl);
        }
        $("#contextMenuTranscoder").hide();
    });

    $("#cm_states").click(function(){
        if (showStates)
        {
            $("#cm_states").removeClass("contextMenuItem_check").addClass("contextMenuItem");
            showStates = false;
            document.getElementById("x3dElement").runtime.statistics(showStates);
        }
        else
        {
            $("#cm_states").removeClass("contextMenuItem").addClass("contextMenuItem_check");
            showStates = true;
            document.getElementById("x3dElement").runtime.statistics(showStates);
        }
        $("#contextMenuTranscoder").hide();
    });

    $("#cm_debug").click(function(){
        if (showDebug)
        {
            $("#cm_debug").removeClass("contextMenuItem_check").addClass("contextMenuItem");
            showDebug = false;
            document.getElementById("x3dElement").runtime.debug(showDebug);
        }
        else
        {
            $("#cm_debug").removeClass("contextMenuItem").addClass("contextMenuItem_check");
            showDebug = true;
            document.getElementById("x3dElement").runtime.debug(showDebug);
        }
        $("#contextMenuTranscoder").hide();
    });

    $("#contextMenuTranscoder").mouseleave(function(){
        $("#settings").removeClass("toolbarTranscoder_active").addClass("toolbarTranscoder");
        $("#contextMenuTranscoder").hide();
    });

    $("#contextMenuViews").css("left", "174px");
    $("#contextMenuViews").css("top", "30px");

    $("#viewpointMode").click(function(){
        $("#viewpointMode").removeClass("toolbarViewpoint").addClass("toolbarViewpoint_active");
        $("#contextMenuViews").show();
    });

    $("#cm_top").click(function(){
        document.getElementById("x3dElement").runtime.showAll("negY");
        $("#contextMenuViews").hide();
    });

    $("#cm_bottom").click(function(){
        document.getElementById("x3dElement").runtime.showAll("posY");
        $("#contextMenuViews").hide();
    });

    $("#cm_front").click(function(){
        document.getElementById("x3dElement").runtime.showAll("posX");
        $("#contextMenuViews").hide();
    });

    $("#cm_back").click(function(){
        document.getElementById("x3dElement").runtime.showAll("negX");
        $("#contextMenuViews").hide();
    });

    $("#cm_left").click(function(){
        document.getElementById("x3dElement").runtime.showAll("negZ");
        $("#contextMenuViews").hide();
    });

    $("#cm_right").click(function(){
        document.getElementById("x3dElement").runtime.showAll("posZ");
        $("#contextMenuViews").hide();
    });

    $("#smallFeatureThreshold").click(function(event){
        event.stopPropagation();
        this.value = this.value.match(/\d+/);
    });

    $("#smallFeatureThreshold").blur(function(event){
        $('#env').prop('smallFeatureThreshold', this.value);
        this.value = "(" + this.value + "px)";
    });

    $("#smallFeatureThreshold").keypress(checkInputThreshold);

    $("#lowPriorityThreshold").click(function(event){
        event.stopPropagation();
        this.value = this.value.match(/\d+/);
    });

    $("#lowPriorityThreshold").blur(function(event){
        this.value = (this.value > 100) ? 100 : this.value;
        $('#env').prop('lowPriorityThreshold', this.value);
        this.value = "(" + this.value + "%)";
    });

    $("#lowPriorityThreshold").keypress(checkInputThreshold);

    $("#minFrameRate").click(function(event){
        event.stopPropagation();
        this.value = this.value.match(/\d+/);
    });

    $("#minFrameRate").blur(function(event){
        this.value = (this.value > 100) ? 100 : this.value;
        $('#env').prop('minFrameRate', this.value);
        this.value = "(" + this.value + "fps)";
    });

    $("#minFrameRate").keypress(checkInputThreshold);

    $("#contextMenuViews").mouseleave(function(){
        $("#viewpointMode").removeClass("toolbarViewpoint_active").addClass("toolbarViewpoint");
        $("#contextMenuViews").hide();
    });

    //notify parent window
    window.parent.postMessage({type:"viewerLoaded"}, "*");
}

/**
 * Changes geometry display mode (points, lines, faces)
 * @param mode
 */
function changeDisplayMode(mode)
{
    displayMode = mode;

    $("#displayModePoints").removeClass("toolbarPoints_active").addClass("toolbarPoints");
    $("#displayModeLines").removeClass("toolbarLines_active").addClass("toolbarLines");
    $("#displayModeFaces").removeClass("toolbarFaces_active").addClass("toolbarFaces");

    switch (displayMode)
    {
        case DISPLAYMODES.POINTS:
            $("#displayModePoints").removeClass("toolbarPoints").addClass("toolbarPoints_active");
            viewarea._points = 1;
            break;
        case DISPLAYMODES.LINES:
            $("#displayModeLines").removeClass("toolbarLines").addClass("toolbarLines_active");
            viewarea._points = 2;
            break;
        case DISPLAYMODES.FACES:
            $("#displayModeFaces").removeClass("toolbarFaces").addClass("toolbarFaces_active");
            viewarea._points = 0;
            break;
    }

    x3dElem.runtime.triggerRedraw();
}

/**
 * Change navigation mode
 * @param mode
 */
function changeNavMode(mode)
{
    var navi = x3dElem.runtime.getActiveBindable("NavigationInfo");
    navMode = mode;

    $("#navModeRotate").removeClass("toolbarRotate_active").addClass("toolbarRotate");
    $("#navModeMove").removeClass("toolbarMove_active").addClass("toolbarMove");
    $("#navModeZoom").removeClass("toolbarZoom_active").addClass("toolbarZoom");
    
    switch (navMode)
    {
        case NAVMODES.ROTATE:
            $("#navModeRotate").removeClass("toolbarRotate").addClass("toolbarRotate_active");
            navi.setAttribute("explorationMode", "rotate");
            break;
        case NAVMODES.MOVE:
            $("#navModeMove").removeClass("toolbarMove").addClass("toolbarMove_active");
            navi.setAttribute("explorationMode", "pan");
            break;
        case NAVMODES.ZOOM:
            $("#navModeZoom").removeClass("toolbarZoom").addClass("toolbarZoom_active");
            navi.setAttribute("explorationMode", "zoom");
            break;
    }
}

function enableTooltips(value)
{
    toolTipEnabled = value;

    if (toolTipEnabled)
    {
        $("#tooltipMode").removeClass("toolbarTip").addClass("toolbarTip_active");
    }
    else
    {
        $("#tooltipMode").removeClass("toolbarTip_active").addClass("toolbarTip");
    }
}

function enableMeasure(value)
{
    measureEnabled = value;
    toolTipEnabled = !value;

    if (measureEnabled)
    {
        $("#measurement").removeClass("toolbarMeasure").addClass("toolbarMeasure_active");
        $("#x3dom-x3dElement-canvas").css("cursor", "crosshair");
    }
    else
    {
        $("#measurement").removeClass("toolbarMeasure_active").addClass("toolbarMeasure");
        $("#x3dom-x3dElement-canvas").css("cursor", "default");
        $("#lineTrafo").prop("render", "false");
    }
}

function handleBackgroundClick(event)
{
    if (event.button == 1)
    {
        $(".contextMenu").hide();
    }
    if (event.button == 2)
    {
        $("#contextMenuDefault").css("top", event.layerY + 30 + "px");
        $("#contextMenuDefault").css("left", event.layerX + "px");
        $("#contextMenuDefault").show();
    }
}

function fitAll()
{
    document.getElementById("x3dElement").runtime.fitAll();
}

function set_viewerActive(val){
    viewer_is_active=val;
}

function callbackFunc(id,state,more)
{
    console.log(id + " is now: " + state);
}

function updateProgress()
{
    if(numUnloadedParts > 0 && !progessActive)
    {
        progessActive = true;
        $('#progressBar').removeClass("progressBar_Out").addClass("progressBar_In");
    }
    else if (numUnloadedParts <=0 && progessActive)
    {
        progessActive = false;
        $('#progressBar').removeClass("progressBar_In").addClass("progressBar_Out");
    }
}

function createNativePart(url,id,transformmatrix,options)
{
    var part = {id:id,url:url,transformmatrix:JSON.parse(transformmatrix)};
    if(options!==undefined && options.toolTipText!==undefined)
        part.toolTipText=options.toolTipText
    else
        part.toolTipText=id+"<br/>"+url;

    numUnloadedParts++;
    updateProgress();

    addToScene(part);
}

function setURLHeadTail(urlHead,  urlTail)
{
    config.urlHead=urlHead;
    config.urlTail=urlTail;
    console.info("URL head is: \""+config.urlHead+"\" and tail is \""+config.urlTail+"\"");
}

function createPart (url, id, transformmatrix, options )
{
    var partobj = {};
    partobj.transformmatrix=transformmatrix;

    url = config.urlHead + url + config.urlTail;

    partobj.uri = encodeURIComponent(url);

    if(options !== undefined && options.mimeType !== undefined)
        partobj.mimeType = options.mimeType;

    partobj.id = id;

    if(options !== undefined && options.toolTipText !== undefined)
        partobj.toolTipText = options.toolTipText
    else
        partobj.toolTipText = id + "<br/>" + url;

    if(id in parts)
    {
        console.log("already loaded. will trigger updatePartVisibility("+id+",true)");
        updatePartVisibility(id,true);
        return;
    }

    numUnloadedParts++;
    updateProgress();

    callbackFunc(partobj.id,"transcoding");
    //requestTranscode(partobj);
    requestTranscodeJSON(partobj);
}

function getViewerStatus()
{
    var partlist=[];
    for(var i in parts){
        var mt = parts[i].children[0];
        var inline = mt.children[0];
        var part={
            render:parts[i].getAttribute("render"),
            transformmatrix:mt.getAttribute("matrix"),
            id:i,
            url:inline.getAttribute("url"),
            toolTipText:inline.dataset.tooltiptext
        }
        partlist.push(part);
    }
    return JSON.stringify({
        camera:getCameraString(),
        scene:partlist
    });
}

function restoreViewerStatus(jsonString)
{
    var sceneDesc=JSON.parse(jsonString);
    //clear viewer
    $("#sceneMaster").empty();
    //restore parts
    viewer_is_active=true;
    for(var i in sceneDesc.scene)
    {
        var part=sceneDesc.scene[i];
        addToScene(part);
    }
    //restore camera
    setCameraByString(sceneDesc.camera);
}

function getCameraString()
{
    return JSON.stringify({position:viewpoint.position.toString(),orientation:viewpoint.orientation.toString()});
}

function setCameraByString(camstring)
{
    var camPara=JSON.parse(camstring);
    var vp0 = document.getElementById('vp0');
    var vp1 = document.getElementById('vp1');
    var active = document.getElementById("x3dElement").runtime.getActiveBindable('viewpoint');

    if (active == vp0) {
        vp0.setAttribute("position",camPara.position);
        vp0.setAttribute("orientation",camPara.orientation);
        vp0.setAttribute('bind', true);
    }
}

function requestTranscodeJSON(partobj)
{
    //check if we already have a partobj in our context
    if(this.partobj)
        partobj=this.partobj;
    //check if max n of retries is reached
    if(partobj.retry!==undefined)
        partobj.retry++;
    else
        partobj.retry=1;
    if(partobj.retry>config.transcoder.retries)
    {
        console.error("request to transcoder failed after 10 attempts. " + partobj.uri);
        callbackFunc(partobj.id,"error");
        return;
    }

    //generate request
    var request={
        "resource": partobj.uri,
        "ops" : config.transcoding.string,
        "format" : "x3d",
        //"redirect" : true,
        "html-header-fields" : [
            {"Cookie" : config.token}
        ]
    };
    if(partobj.mimeType !== undefined)
        request["mimetype"] = partobj.mimeType;

    //send request
    $.ajax({
        url:"http://"+config.transcoder.host+"/job/add",
        context:partobj,
        processData:false,
        data:JSON.stringify(request),
        type:"POST",
        success:function(resp){
            inlineurl=config.delivery.host+"/"+resp+"/index.x3d";
            waitForTranscode({
                url:inlineurl,
                id:this.id,
                transformmatrix:this.transformmatrix,
                toolTipText:this.toolTipText
            });
        },
        error:function(xhr){
            if(xhr.readyState==0&&xhr.status==0)
            {   //retry
                setTimeout($.proxy(requestTranscodeJSON,{partobj:partobj}),config.transcoder.waitBeforeRetry);
            }
            else
            {
                numUnloadedParts--;
                updateProgress();
                callbackFunc(this.id,"error");
                console.log("error in ajax request for " + this.id);
            }
        }
    });
}

function requestTranscode(partobj)
{
    //check if we already have a partobj in our context
    if(this.partobj)
        partobj=this.partobj;
    //check if max n of retries is reached
    if(partobj.retry!==undefined)
        partobj.retry++;
    else
        partobj.retry=1;
    if(partobj.retry>config.transcoder.retries)
    {
        console.error("request to transcoder failed after 10 attempts. " + partobj.uri);
        callbackFunc(partobj.id,"error");
        return;
    }
    //send request
    $.ajax({
        url:encodeURI(partobj.uri),
        context:partobj,
        success:function(resp){
            inlineurl=config.delivery.host+"/"+resp+"/index.x3d";

            waitForTranscode({
                url:inlineurl,
                id:this.id,
                transformmatrix:this.transformmatrix,
                toolTipText:this.toolTipText
            });
        },
        error:function(xhr){
            if(xhr.readyState==0&&xhr.status==0)
            {   //retry
                setTimeout($.proxy(requestTranscode,{partobj:partobj}),config.transcoder.waitBeforeRetry);
            }
            else
            {
                numUnloadedParts--;
                updateProgress();
                callbackFunc(this.id,"error");
                console.log("error in ajax request for " + this.id);
            }
        }
    });
}

function waitForTranscode(part)
{
    //check if we already have a part in our context
    if(this.part)
        part=this.part;
    //check if max n of retries is reached
    if(part.retry!==undefined)
        part.retry++;
    else
        part.retry=1;
    if(part.retry>config.delivery.retries)
    {
        console.error("wait for transcoder result failed after "+config.delivery.retries+" attempts. " + part.url);
        numUnloadedParts--;
        updateProgress();
        callbackFunc(part.id,"error");
        return;
    }
    //send request
    $.ajax({
        context:{part:part},
        url:part.url,
        complete:function(xhr){
            var response = JSON.parse(xhr.responseText);

            switch(response.status)
            {
                case "unfinished":
                    // setTimeout(this.tip.destroy, this.tip), 1000);
                    setTimeout($.proxy(waitForTranscode,{part:part}),response.refresh*1000);
                    console.warn("["+part.id+"]still waiting for transcode ("+part.retry+")");
                    break;
                case "finished":
                    part.url=response.url;
                    //console.info("["+part.id+"] transcoded. adding to scene");
                    addToScene(part);
                    break;
                case "error":
                    callbackFunc(part.id,"error");
                    console.error("["+part.id+"] ERROR.");
                    numUnloadedParts--;
                    updateProgress();
                    break;
                default:
                    console.error(response);
            }
        }
    });
}

/**
 * Add a single Part to the scene and add all needed EventListeners to it
 * @param part
 */
function addToScene(part)
{
    var e = document.getElementById('x3dElement');

    var newInline = document.createElement("Inline");
    var runtime = document.getElementById('x3dElement').runtime;
    newInline.onload=function(){
        numUnloadedParts--;
        updateProgress();
        if(showAll) {
            var e = document.getElementById('x3dElement');
            e.runtime.fitAll();
        }
        callbackFunc(this.dataset.id,"loaded");
    };

    newInline.onerror=function(){
        numUnloadedParts--;
        updateProgress();
        callbackFunc(this.dataset.id,"error");
        delete parts[this.dataset.id];
    };

    newInline.onmousemove=function(event){
        if(!navigate)
        {
            if (toolTipEnabled)
            {
                $('#toolTip').css('left', event.layerX + 15 + 'px');
                $('#toolTip').css('top', event.layerY + 50 +'px');
                //callbackFunc(this.dataset.id,"onmousemove");
            }
            else if (measureEnabled)
            {
                measure.updatePoint(event.worldX, event.worldY, event.worldZ);
                $("#toolTip").html(measure.toString());
                $('#toolTip').css('left', event.layerX + 15 + 'px');
                $('#toolTip').css('top', event.layerY + 50 +'px');
            }
        }
    };

    newInline.onmouseover=function(event){
        if(!navigate)
        {
            if (toolTipEnabled)
            {
                $("#toolTip").html(this.dataset.tooltiptext);
                $('#toolTip').css('left', event.layerX + 15 + 'px');
                $('#toolTip').css('top', event.layerY + 50 +'px');
                $("#toolTip").show();

                $('#toolTip').data("activeID",this.dataset.id);
            }
            else if(measureEnabled)
            {
                measure.updatePoint(event.worldX, event.worldY, event.worldZ);
                $("#toolTip").html(measure.toString());
                $('#toolTip').css('left', event.layerX + 15 + 'px');
                $('#toolTip').css('top', event.layerY + 50 +'px');
                $("#toolTip").show();
            }

            updatePartHighlight(this.dataset.id, true);
            callbackFunc(this.dataset.id,"onmouseover");
        }
    };

    newInline.onmouseout=function(event){
        $('#toolTip').hide();
        updatePartHighlight(this.dataset.id, false);;
        callbackFunc(this.dataset.id,"onmouseout");
    };

    newInline.onmousedown=function(event){

    };

    newInline.onclick=function(event){

        callbackFunc(this.dataset.id,"onclick",{button:event.button});
        if (event.button == 1)
        {
            if(measureEnabled)
            {
                measure.tooglePoint();
            }
            else
            {
                $('#toolTip').hide();
            }
        }
        else if (event.button == 2)
        {
            $('#toolTip').hide();
            url = this.getAttribute('url');
            url = url.substr(0, url.lastIndexOf("/")+1) + "statistics.html";
            $("#contextMenuParts").attr("data-id", this.dataset.id);
            $("#contextMenuParts").attr("data-statistics", url);
            $("#cm_id").html(this.dataset.id);
            $('#contextMenuParts').css('left', event.layerX + 'px');
            $('#contextMenuParts').css('top', event.layerY + 30 + 'px');

            $('#contextMenuParts').show();

            //callbackFunc(this.dataset.id,"contextMenuParts",{button:event.button,pos:{x:event.layerX,y:event.layerY}});
        }
    };

    callbackFunc(part.id,"loading");
    newInline.setAttribute("DEF","part_"+part.id);
    newInline.setAttribute("data-id",part.id);
    newInline.setAttribute("data-highlight",false);
    if(part.toolTipText!==undefined)
        newInline.setAttribute("data-tooltiptext",part.toolTipText)
    newInline.setAttribute("url",part.url);
    if(!part.transformmatrix)
    {
        var trans =  document.createElement("MatrixTransform");
        trans.appendChild(newInline);
        parts[part.id]=trans;
        document.getElementById("sceneMaster").appendChild(trans);
    }
    else
    {
        var group =  document.createElement("Group");
        if(typeof(part.transformmatrix)=="string")
            part.transformmatrix=[part.transformmatrix];
        for(matrixId in part.transformmatrix)
        {
            var trans =  document.createElement("MatrixTransform");
            trans.setAttribute("matrix",part.transformmatrix[matrixId]);
            if(matrixId==0)
                trans.appendChild(newInline);
            else
            {
                var useInline = document.createElement("Inline");
                useInline.setAttribute("USE","part_"+part.id);
                trans.appendChild(useInline);
            }
            group.appendChild(trans);
        }
        parts[part.id]=group;
        document.getElementById("sceneMaster").appendChild(group);
    }
}

/**
 *
 * @param transcoder_address
 * @param datastore_address
 * @param authentication_token
 */
function setup(transcoder_address, datastore_address, authentication_token)
{
    config.transcoder.host=transcoder_address;
    config.delivery.host=datastore_address;
    config.token=authentication_token;
    getTranscoderVersion();
}

function checkInputThreshold(event)
{
    var theEvent = event || window.event;
    var key = theEvent.keyCode || theEvent.which;

    if (event.which == 13) {
        this.blur();
    }

    key = String.fromCharCode( key );
    var regex = /[0-9]|\./;
    if( !regex.test(key) ) {
        theEvent.returnValue = false;
        if(theEvent.preventDefault) theEvent.preventDefault();
    }
};

/**
 * Search version string on the transcoder page
 */
function getTranscoderVersion()
{
    var xhr = new XMLHttpRequest();

    xhr.open('GET', 'http://' + config.transcoder.host + '/version', true);

    xhr.onload = function() {
        var version = xhr.responseText;
        if (version)
        {
            $('#cm_statistic').css('display', 'block');
            $('#transcoderSettings').css('display', 'block');
            $('#transcoderVersion').css('color', '#FFF');
            $('#transcoderVersion').html('v' + version);
        }
        else
        {
            $('#cm_statistic').css('display', 'none');
            $('#transcoderSettings').css('display', 'none');
            $('#transcoderVersion').css('color', '#F66');
            $('#transcoderVersion').html('is offline');
        }
    };
    xhr.onerror = function() {
        $('#cm_statistic').css('display', 'none');
        $('#transcoderSettings').css('display', 'none');
        $('#transcoderVersion').css('color', '#F66');
        $('#transcoderVersion').html('is offline');
    };
    xhr.send(null);
}

/**
 * Set visibility of a part with the given id
 * @param id
 * @param val
 */
function updatePartVisibility ( id, val ) {
    if(parts[id] != undefined)
    {
        parts[id].render=val;
        console.log("part visibility for "+ id + " changed to:  "+ val);
        callbackFunc(id,val?"visible":"invisible");
    }
}

/**
 * Show the complete viewer
 */
function showViewer()
{
    $("#main").show();
}

/**
 * Hide the complete viewer
 */
function hideViewer()
{
    $("#main").hide();
}

function updatePartHighlight ( id, val){
    if(id in parts)
    {
        callbackFunc(id,val?"highlighted":"not_highlighted");
        //TODO:  parts[id].dataset.highlight=val;
        if(val)
            if(parts[id].dataset.color===undefined)
                parts[id].highlight(true,"#D9D900");
            else
            {
                var components = parts[id].dataset.color.split(",");
                for(i in components)
                    components[i]=1.0-components[i];
                parts[id].highlight(true,components.join(","));
            }
        else
        //if(typeof(parts[id].dataset.color)=="undefined")
        if(parts[id].dataset.color===undefined)
            parts[id].highlight(false,"#D9D900");
        else
        {
            //parts[id].highlight(false,parts[id].dataset.color);
            //parts[id].highlight(false);
            parts[id].highlight(true,parts[id].dataset.color);
        }
    }
}

function updatePartColor ( id, color){
    if(id in parts)
    {
        if(typeof(color)!="undefined" && color!=null)
        {
            parts[id].dataset.color=color;
            parts[id].highlight(true,color);
        }
        else
        {
            delete parts[id].dataset.color;
            //parts[id].highlight(false,"#ffffff");
            parts[id].highlight(false,"yellow");
        }
    }
}

function deletePart ( id )
{
    if(typeof(id)=="undefined"||id==null)
    {   //DELETE ALL
        for(var i in parts)
            deletePart(i);
    }
    console.log("deleting part "+ id);
    try{
        document.getElementById("sceneMaster").removeChild(parts[id]);
    }
    catch(e)
    {
        ;
    }
    callbackFunc(id,"deleted");
    delete parts[id];
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            //return pair[1];
            return decodeURI(pair[1]);
        }
    }
    alert('Query Variable ' + variable + ' not found');
}
