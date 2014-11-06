/**
 * Created by tsturm on 30.10.2014.
 */
/**
 *  Parts Object is return
 */
x3dom.MultiMaterial = function( params )
{
    this._origAmbientIntensity      = params.ambientIntensity;
    this._origDiffuseColor          = params.diffuseColor;
    this._origEmissiveColor         = params.emissiveColor;
    this._origShininess             = params.shininess;
    this._origSpeclarColor          = params.specularColor;
    this._origTransparency          = params.transparency;

    this._origBackAmbientIntensity  = params.backAmbientIntensity;
    this._origBackDiffuseColor      = params.backDiffuseColor;
    this._origBackEmissiveColor     = params.backEmissiveColor;
    this._origBackShininess         = params.backShininess;
    this._origBackSpecularColor     = params.backSpecularColor;
    this._origBackTransparency      = params.backTransparency;

    this._ambientIntensity          = params.ambientIntensity;
    this._diffuseColor              = params.diffuseColor;
    this._emissiveColor             = params.emissiveColor;
    this._shininess                 = params.shininess;
    this._specularColor             = params.specularColor;
    this._transparency              = params.transparency;

    this._backAmbientIntensity      = params.backAmbientIntensity;
    this._backDiffuseColor          = params.backDiffuseColor;
    this._backEmissiveColor         = params.backEmissiveColor;
    this._backShininess             = params.backShininess;
    this._backSpecularColor         = params.backSpecularColor;
    this._backTransparency          = params.backTransparency;

    this._highlighted               = false;

    this.reset = function () {
        this._ambientIntensity      = this._origAmbientIntensity;
        this._diffuseColor          = this._origDiffuseColor;
        this._emissiveColor         = this._origEmissiveColor;
        this._shininess             = this._origShininess;
        this._specularColor         = this._origSpeclarColor;
        this._transparency          = this._origTransparency;
        this._backAmbientIntensity  = this._origBackAmbientIntensity;
        this._backDiffuseColor      = this._origBackDiffuseColor;
        this._backEmissiveColor     = this._origBackEmissiveColor;
        this._backShininess         = this._origBackShininess;
        this._backSpecularColor     = this._origBackSpecularColor;
        this._backTransparency      = this._origBackTransparency;
    };

};