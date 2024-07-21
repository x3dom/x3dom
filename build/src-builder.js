//--------------------------------------------------------------------------------------------------

const fs              = require('fs-extra');
const terser          = require("terser");
const concat          = require('concat');
const process         = require("child_process");
const zip             = require("zip-lib");
const package         = require("../package.json");
const packages        = require("./core/packages.json");
const additionalFiles = require("./core/additionalFiles.json");
//const terser_options  = { mangle: { reserved: ['workerProcess'] } };
const terser_options  = {};

//--------------------------------------------------------------------------------------------------

const ROOT_FOLDER = "./";
const DIST_FOLDER = "./dist/";
const GIT_FOLDER  = "./.git/";
const VERSION     = package.version;
const IS_GIT      = fs.existsSync( GIT_FOLDER );
const BUILD       = IS_GIT ? process.execSync('git rev-list --count HEAD').toString().trim() : "Not available";
const REVISION    = IS_GIT ? process.execSync('git rev-parse HEAD').toString().trim()        : "Not available";
const DATE        = IS_GIT ? process.execSync('git log -1 --format=%cd').toString().trim()   : new Date();

//--------------------------------------------------------------------------------------------------

const HEADER = `/** 
 * X3DOM ${VERSION}
 * Build : ${BUILD}
 * Revision: ${REVISION}
 * Date: ${DATE}
 */
`;

//--------------------------------------------------------------------------------------------------

const VERSION_FILE = `X3DOM ${VERSION}
Build : ${BUILD}
Revision: ${REVISION}
Date: ${DATE}
`;

//--------------------------------------------------------------------------------------------------

async function concatVersions()
{
    const version = {};

    let lastPackageName;

    for ( const packageName in packages )
    {
        const scripts = [],
              package = packages[ packageName ];

        for ( const basePath in package )
        {
            const files = package[ basePath ];

            for( let i = 0, n = files.length; i < n; i++ )
            {
                scripts.push( ROOT_FOLDER + basePath + files[ i ] );
            }
        }

        if ( lastPackageName )
        {
            version[ packageName ] = version[ lastPackageName ] + await concat( scripts );
        }
        else
        {
            version[ packageName ] = await concat( scripts );

            version[ packageName ] = version[ packageName ].replace( "__X3DOM_VERSION__", VERSION );
            version[ packageName ] = version[ packageName ].replace( "__X3DOM_BUILD__", BUILD );
            version[ packageName ] = version[ packageName ].replace( "__X3DOM_REVISION__", REVISION );
            version[ packageName ] = version[ packageName ].replace( "__X3DOM_DATE__", DATE );
        }
        version[ packageName + "_MODULE"] = `${version[packageName]}
export default x3dom;
export { x3dom };`;
        lastPackageName = packageName;
    }

    return version;
}

//--------------------------------------------------------------------------------------------------

async function build()
{
    console.log( "> Recreate dist folder ..." );

    fs.removeSync( DIST_FOLDER );
    fs.mkdirSync( DIST_FOLDER );

    console.log( "> Concat files ..." );

    const versions = await concatVersions();

    console.log( "> Minify x3dom.js ..." );

    versions[ "BASIC_MIN" ] = terser.minify( versions[ "BASIC" ], terser_options ).code;

    console.log( "> Minify x3dom-module.js ..." );

    versions[ "BASIC_MODULE_MIN" ] = terser.minify( versions[ "BASIC_MODULE" ], terser_options ).code;

    console.log( "> Minify x3dom-full.js ..." );

    versions[ "FULL_MIN" ] = terser.minify( versions[ "FULL" ], terser_options ).code;

    console.log( "> Minify x3dom-full-module.js ..." );

    versions[ "FULL_MODULE_MIN" ] = terser.minify( versions[ "FULL_MODULE" ], terser_options ).code;

    console.log( "> Minify x3dom-physics.js ..." );

    versions[ "PHYSICS_MIN" ] = terser.minify( versions[ "PHYSICS" ], terser_options ).code;

    console.log( "> Minify x3dom-physics-module.js ..." );

    versions[ "PHYSICS_MODULE_MIN" ] = terser.minify( versions[ "PHYSICS_MODULE" ], terser_options ).code;

    console.log( "> Write x3dom.debug.js ..." );

    fs.writeFileSync( DIST_FOLDER + "x3dom.debug.js", HEADER + versions[ "BASIC" ] );

    console.log( "> Write x3dom-module.debug.js ..." );

    fs.writeFileSync( DIST_FOLDER + "x3dom-module.debug.js", HEADER + versions[ "BASIC_MODULE" ] );

    console.log( "> Write x3dom.js ..." );

    fs.writeFileSync( DIST_FOLDER + "x3dom.js", HEADER + versions[ "BASIC_MIN" ] );

    console.log( "> Write x3dom-module.js ..." );

    fs.writeFileSync( DIST_FOLDER + "x3dom-module.js", HEADER + versions[ "BASIC_MODULE_MIN" ] );

    console.log( "> Write x3dom-full.debug.js ..." );

    fs.writeFileSync( DIST_FOLDER + "x3dom-full.debug.js", HEADER + versions[ "FULL" ] );

    console.log( "> Write x3dom-full-module.debug.js ..." );

    fs.writeFileSync( DIST_FOLDER + "x3dom-full-module.debug.js", HEADER + versions[ "FULL_MODULE" ] );

    console.log( "> Write x3dom-full.js ..." );

    fs.writeFileSync( DIST_FOLDER + "x3dom-full.js", HEADER + versions[ "FULL_MIN" ] );

    console.log( "> Write x3dom-full-module.js ..." );

    fs.writeFileSync( DIST_FOLDER + "x3dom-full-module.js", HEADER + versions[ "FULL_MODULE_MIN" ] );

    console.log( "> Write x3dom-physics.debug.js ..." );

    fs.writeFileSync( DIST_FOLDER + "x3dom-physics.debug.js", HEADER + versions[ "PHYSICS" ] );

    console.log( "> Write x3dom-physics-module.debug.js ..." );

    fs.writeFileSync( DIST_FOLDER + "x3dom-physics-module.debug.js", HEADER + versions[ "PHYSICS_MODULE" ] );

    console.log( "> Write x3dom-physics.js ..." );

    fs.writeFileSync( DIST_FOLDER + "x3dom-physics.js", HEADER + versions[ "PHYSICS_MIN" ] );

    console.log( "> Write x3dom-physics-module.js ..." );

    fs.writeFileSync( DIST_FOLDER + "x3dom-physics-module.js", HEADER + versions[ "PHYSICS_MODULE_MIN" ] );

    console.log( "> Write VERSION ..." );

    fs.writeFileSync( DIST_FOLDER + "VERSION", VERSION_FILE );

    console.log( "> Copy additional files ..." );

    for ( const name in additionalFiles )
    {
        fs.copyFileSync( additionalFiles[ name ], DIST_FOLDER + name );
    }

    console.log( "> Build documentation ..." );

    process.execSync("node ./node_modules/jsdoc/jsdoc.js -c ./build/jsdoc/jsdoc.config.json");

    console.log( "> Build archive ..." );

    await zip.archiveFolder(DIST_FOLDER, DIST_FOLDER + "x3dom-" + VERSION + ".zip");
}

//--------------------------------------------------------------------------------------------------

build();
