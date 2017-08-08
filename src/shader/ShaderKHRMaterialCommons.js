/**
 * Created by Sven Kluge on 27.06.2016.
 */

x3dom.shader.KHRMaterialCommonsShader = function(gl, properties)
{
    this.program = gl.createProgram();

    var vertexShader 	= this.generateVertexShader(gl);
    var fragmentShader 	= this.generateFragmentShader(gl, properties);

    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);

    // optional, but position should be at location 0 for performance reasons
    gl.bindAttribLocation(this.program, 0, "position");

    gl.linkProgram(this.program);

    return this.program;
};

x3dom.shader.KHRMaterialCommonsShader.prototype.generateVertexShader = function(gl)
{
    var shader = "precision highp float;\n"+
                "attribute vec3 position;"+
                "attribute vec3 normal;"+
                "attribute vec3 texcoord;"+
                "varying vec3 v_eye;"+
                "varying vec3 v_normal;"+
                "varying vec3 v_texcoord;"+
                "uniform mat4 modelViewProjectionMatrix;"+
                "uniform mat4 modelViewMatrix;"+
                "uniform mat4 normalMatrix;"+
                "void main (void)"+
                "{"+
                "    vec4 pos = modelViewProjectionMatrix * vec4(position, 1.0);"+
                "    v_eye = (modelViewMatrix * vec4(position, 1.0)).xyz;"+
                "    v_normal = normalize((normalMatrix * vec4(normal,1.0)).xyz);"+
                "    v_texcoord = texcoord;"+
                "    gl_Position = pos;"+
                "}";

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, shader);
    gl.compileShader(vertexShader);

    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        x3dom.debug.logError("[KHRMaterialCommonsShader] VertexShader " + gl.getShaderInfoLog(vertexShader));
    }

    return vertexShader;
};

x3dom.shader.KHRMaterialCommonsShader.prototype.generateFragmentShader = function(gl, properties)
{
    var shader = "precision highp float;\n"+
    "varying vec3 v_eye;\n"+
    "varying vec3 v_normal;\n"+
    "varying vec3 v_texcoord;\n"+
    "uniform vec4 lightVector;\n"+
    "uniform vec4 ambient;\n";

    if(properties.LIGHTS || properties.CLIPPLANES)
    {
        shader += "varying vec4 fragPosition;\n";
        shader += "uniform float isOrthoView;\n";
    }

    //Lights
    if(properties.LIGHTS) {

        if(properties.NORMALMAP && properties.NORMALSPACE == "OBJECT") {
            //do nothing
        } else {
            shader += "varying vec3 fragNormal;\n";
        }

        shader += x3dom.shader.light(properties.LIGHTS);
    }

    if(properties.USE_DIFFUSE_TEX == 0)
        shader += "uniform vec4 diffuse;\n";
    else
        shader += "uniform sampler2D diffuseTex;\n";

    if(properties.USE_EMISSION_TEX == 0)
        shader += "uniform vec4 emission;\n";
    else
        shader += "uniform sampler2D emissionTex;\n";

    if(properties.USE_SPECULAR_TEX == 0)
    shader += "uniform vec4 specular;\n";
    else
        shader += "uniform sampler2D specularTex;\n";


    shader +=
    "uniform float shininess;\n"+
    "uniform float transparency;\n"+
    "uniform float ambientIntensity;\n"+
    "uniform vec4 ambientLight;\n"+
    "uniform int technique;\n"+
    "void main(void)\n"+
    "{\n"+
        "vec4 I = -vec4(normalize(v_eye),1.0);\n"+
        "vec4 N = vec4(v_normal,1.0);\n"+
        "vec4 al = ambientLight;\n"+
        "vec4 L = normalize(lightVector-vec4(v_eye,1.0));\n";

        if(properties.USE_DIFFUSE_TEX == 0)
            shader += "vec4 _diffuse = diffuse;\n";
        else
            shader += "vec4 _diffuse = texture2D(diffuseTex, v_texcoord.xy);\n";

        if(properties.USE_SPECULAR_TEX == 0)
            shader += "vec4 _specularColor = specular;\n";
        else
            shader += "vec4 _specularColor = texture2D(specularTex, v_texcoord.xy);\n";

        if(properties.USE_EMISSION_TEX == 0)
            shader += "vec4 _emission = emission;\n";
        else
            shader += "vec4 _emission = texture2D(emissionTex, v_texcoord.xy);\n";

        shader +=
            "vec4 color;\n"+
            "if(technique == 0) // BLINN\n"+
            "{\n"+
                "vec4 H = normalize(I+L);\n"+
                "color = _emission + ambient * al + _diffuse * max(dot(N,L),0.0) + _specularColor * pow(max(dot(H,N),0.0),shininess);\n"+
            "}\n"+
            "else if(technique==1) // PHONG\n"+
            "{\n"+
                "vec4 R = -reflect(L,N);\n"+
                "color = _emission + ambient * al + _diffuse * max(dot(N,L),0.0) + _specularColor * pow(max(dot(R,I),0.0),shininess);\n"+
            "}\n"+
            "else if(technique==2) // LAMBERT\n"+
            "{\n"+
                "color = _emission + ambient * al + _diffuse * max(dot(N,L), 0.0);\n"+
            "}\n"+
            "else if(technique==3) // CONSTANT\n"+
            "{\n"+
                "color = _emission + ambient * al;\n"+
            "}\n";

        //Calculate lights
        if (properties.LIGHTS) {
            shader += "vec3 ambient   = vec3(0.0, 0.0, 0.0);\n";
            shader += "vec3 diffuse   = vec3(0.0, 0.0, 0.0);\n";
            shader += "vec3 specular  = vec3(0.0, 0.0, 0.0);\n";
            shader += "vec3 eye;\n";
            shader += "if ( isOrthoView > 0.0 ) {\n";
            shader += "    eye = vec3(0.0, 0.0, 1.0);\n";
            shader += "} else {\n";
            shader += "    eye = -v_eye.xyz;\n";
            shader += "}\n";

            //divide glTF shininess by 128 since it is provided premultiplied
            shader += "float _shininess = shininess * 0.0078125;\n";
            shader += "vec3 ads;\n";

            for(var l=0; l<properties.LIGHTS; l++) {
                var lightCol = "light"+l+"_Color";
                shader += "ads = lighting(light"+l+"_Type, " +
                    "light"+l+"_Location, " +
                    "light"+l+"_Direction, " +
                    lightCol + ", " +
                    "light"+l+"_Attenuation, " +
                    "light"+l+"_Radius, " +
                    "light"+l+"_Intensity, " +
                    "light"+l+"_AmbientIntensity, " +
                    "light"+l+"_BeamWidth, " +
                    "light"+l+"_CutOffAngle, " +
                    "v_normal, eye, _shininess, ambientIntensity);\n";
                shader += "ambient  += " + lightCol + " * ads.r;\n" +
                    "diffuse  += " + lightCol + " * ads.g;\n" +
                    "specular += " + lightCol + " * ads.b;\n";
            }

            shader += "ambient = max(ambient, 0.0);\n";
            shader += "diffuse = max(diffuse, 0.0);\n";
            shader += "specular = max(specular, 0.0);\n";

            shader += "color.rgb = (_emission.rgb + max(ambient + diffuse, 0.0) * color.rgb + specular*_specularColor.rgb);\n";
        }

        shader += "gl_FragColor = vec4(color.rgb, transparency);\n"+
    "}";

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);

    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        x3dom.debug.logError("[KHRMaterialCommonsShader] FragmentShader " + gl.getShaderInfoLog(fragmentShader));
    }

    return fragmentShader;
};
