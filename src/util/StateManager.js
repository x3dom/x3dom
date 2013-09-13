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

/**
 * Manage all the GL-States and try to reduce the state changes
 */
x3dom.StateManager = function (ctx3d)
{
    //Our GL-Context
    this.gl = ctx3d;

    //Hold all the active states
    this.states = [];

    //Initialize States
    this.initStates();
};

/*
 * Initialize States
 */
x3dom.StateManager.prototype.initStates = function ()
{
    //Initialize Shader states
    this.states['shaderID'] = null;

    //Initialize Framebuffer-Operation states
    this.states['colorMask'] = {red: null, green: null, blue: null, alpha: null};
    this.states['depthMask'] = null;
    this.states['stencilMask'] = null;

    //Initialize Rasterization states
    this.states['cullFace'] = null;
    this.states['frontFace'] = null;

    //Initialize Per-Fragment-Operation states
    this.states['blendColor'] = {red: null, green: null, blue: null, alpha: null};
    this.states['blendEquation'] = null;
    this.states['blendEquationSeparate'] = {modeRGB: null, modeAlpha: null};
    this.states['blendFunc'] = {sfactor: null, dfactor: null};
    this.states['blendFuncSeparate'] = {srcRGB: null, dstRGB: null, srcAlpha: null, dstAlpha: null};
    this.states['depthFunc'] = null;

    //Initialize View and Clip states
    this.states['viewport'] = {x: null, y: null, width: null, height: null};
    this.states['depthRange'] = {zNear: null, zFar: null};

    //TODO more states (e.g. stencil, texture, ...)
};

/*
 * Enable GL capabilities
 */
x3dom.StateManager.prototype.useProgram = function (shader)
{
    if (this.states['shaderID'] != shader.shaderID)
    {
        this.gl.useProgram(shader.program);
        this.states['shaderID'] = shader.shaderID;
    }
};

/*
 * Enable GL capabilities
 */
x3dom.StateManager.prototype.enable = function (cap)
{
    if (this.states[cap] !== true)
    {
        this.gl.enable(cap);
        this.states[cap] = true;
    }
};

/*
 * Disable GL capabilities
 */
x3dom.StateManager.prototype.disable = function (cap)
{
    if (this.states[cap] !== false)
    {
        this.gl.disable(cap);
        this.states[cap] = false;
    }
};

/*
 * Enable and disable writing of frame buffer color components
 */
x3dom.StateManager.prototype.colorMask = function (red, green, blue, alpha)
{
    if (this.states['colorMask'].red != red ||
        this.states['colorMask'].green != green ||
        this.states['colorMask'].blue != blue ||
        this.states['colorMask'].alpha != alphal)
    {
        this.gl.colorMask(red, green, blue, alpha);
        this.states['colorMask'].red = red;
        this.states['colorMask'].green = green;
        this.states['colorMask'].blue = blue;
        this.states['colorMask'].alpha = alpha;
    }
};

/*
 * Sets whether or not you can write to the depth buffer.
 */
x3dom.StateManager.prototype.depthMask = function (flag)
{
    if (this.states['depthMask'] != flag)
    {
        this.gl.depthMask(flag);
        this.states['depthMask'] = flag;
    }
};

/*
 * Control the front and back writing of individual bits in the stencil planes
 */
x3dom.StateManager.prototype.stencilMask = function (mask)
{
    if (this.states['stencilMask'] != mask)
    {
        this.gl.stencilMask(mask);
        this.states['stencilMask'] = mask;
    }
};

/*
 * Specify whether front- or back-facing facets can be culled
 */
x3dom.StateManager.prototype.cullFace = function (mode)
{
    if (this.states['cullFace'] != mode)
    {
        this.gl.cullFace(mode);
        this.states['cullFace'] = mode;
    }
};

/*
 * Define front- and back-facing polygons
 */
x3dom.StateManager.prototype.frontFace = function (mode)
{
    if (this.states['frontFace'] != mode)
    {
        this.gl.frontFace(mode);
        this.states['frontFace'] = mode;
    }
};

/*
 * Set the blend color
 */
x3dom.StateManager.prototype.blendColor = function (red, green, blue, alpha)
{
    if (this.states['blendColor'].red != red ||
        this.states['blendColor'].green != green ||
        this.states['blendColor'].blue != blue ||
        this.states['blendColor'].alpha != alpha)
    {
        this.gl.blendColor(red, green, blue, alpha);
        this.states['blendColor'].red = red;
        this.states['blendColor'].green = green;
        this.states['blendColor'].blue = blue;
        this.states['blendColor'].alpha = alpha;
    }
};

/*
 * Specify the equation used for both the RGB blend equation and the Alpha blend equation
 */
x3dom.StateManager.prototype.blendEquation = function (mode)
{
    if (this.states['blendEquation'] != mode)
    {
        this.gl.blendEquation(mode);
        this.states['blendEquation'] = mode;
    }
};

/*
 * set the RGB blend equation and the alpha blend equation separately
 */
x3dom.StateManager.prototype.blendEquationSeparate = function (modeRGB, modeAlpha)
{
    if (this.states['blendEquationSeparate'].modeRGB != modeRGB ||
        this.states['blendEquationSeparate'].modeAlpha != modeAlpha)
    {
        this.gl.blendEquationSeparate(modeRGB, modeAlpha);
        this.states['blendEquationSeparate'].modeRGB = modeRGB;
        this.states['blendEquationSeparate'].modeAlpha = modeAlpha;
    }
};

/*
 * Specify pixel arithmetic
 */
x3dom.StateManager.prototype.blendFunc = function (sfactor, dfactor)
{
    if (this.states['blendFunc'].sfactor != sfactor ||
        this.states['blendFunc'].dfactor != dfactor)
    {
        this.gl.blendFunc(sfactor, dfactor);
        this.states['blendFunc'].sfactor = sfactor;
        this.states['blendFunc'].dfactor = dfactor;
    }
};

/*
 * Specify pixel arithmetic for RGB and alpha components separately
 */
x3dom.StateManager.prototype.blendFuncSeparate = function (srcRGB, dstRGB, srcAlpha, dstAlpha)
{
    if (this.states['blendFuncSeparate'].srcRGB != srcRGB ||
        this.states['blendFuncSeparate'].dstRGB != dstRGB ||
        this.states['blendFuncSeparate'].srcAlpha != srcAlpha ||
        this.states['blendFuncSeparate'].dstAlpha != dstAlpha)
    {
        this.gl.blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
        this.states['blendFuncSeparate'].srcRGB = srcRGB;
        this.states['blendFuncSeparate'].dstRGB = dstRGB;
        this.states['blendFuncSeparate'].srcAlpha = srcAlpha;
        this.states['blendFuncSeparate'].dstAlpha = dstAlpha;
    }
};

/*
 * Specify the value used for depth buffer comparisons
 */
x3dom.StateManager.prototype.depthFunc = function (func)
{
    if (this.states['depthFunc'] != func || func != 'none')
    {
        this.gl.depthFunc(func);
        this.states['depthFunc'] = func;
    }
};

/*
 * Specify the value used for depth buffer comparisons
 */
x3dom.StateManager.prototype.depthRange = function (zNear, zFar)
{
    zNear = (zNear < 0) ? 0 : (zNear > 1) ? 1 : zNear;
    zFar = (zFar < 0) ? 0 : (zFar > 1) ? 1 : zFar;
    
    if (zNear <= zFar)
    {
        if (this.states['depthRange'].zNear != zNear || this.states['depthRange'].zFar != zFar)
        {
            this.gl.depthRange(zNear, zFar);
            this.states['depthRange'].zNear = zNear;
            this.states['depthRange'].zFar = zFar;
        }
    }
};

/*
 * Set the viewport
 */
x3dom.StateManager.prototype.viewport = function (x, y, width, height)
{
    if (this.states['viewport'].x != x ||
        this.states['viewport'].y != y ||
        this.states['viewport'].width != width ||
        this.states['viewport'].height != height)
    {
        this.gl.viewport(x, y, width, height);
        this.states['viewport'].x = x;
        this.states['viewport'].y = y;
        this.states['viewport'].width = width;
        this.states['viewport'].height = height;
    }
};

/*
 * Bind a framebuffer to a framebuffer target
 */
x3dom.StateManager.prototype.bindFramebuffer = function (target, framebuffer)
{
    this.gl.bindFramebuffer(target, framebuffer);
    this.initStates();
};
