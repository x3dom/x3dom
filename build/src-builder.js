//--------------------------------------------------------------------------------------------------

const fs              = require('fs-extra');
const uglify          = require("uglify-js");
const concat          = require('concat');
const process         = require("child_process");
const zip             = require("zip-lib");
const package         = require("../package.json");
const packages        = require("./core/packages.json");
const additionalFiles = require("./core/additionalFiles.json");

//--------------------------------------------------------------------------------------------------

const ROOT_FOLDER = "./";
const DIST_FOLDER = "./dist-new/";
const VERSION     = package.version;
const BUILD       = process.execSync('git rev-list --count HEAD').toString().trim();
const REVISION    = process.execSync('git rev-parse HEAD').toString().trim();

//--------------------------------------------------------------------------------------------------

const HEADER = `/** 
 * X3DOM ${VERSION}
 * Build : ${BUILD}
 * Revision: ${REVISION}
 * Date: ${new Date()}
 */
`;

//--------------------------------------------------------------------------------------------------

const VERSION_FILE = `X3DOM ${VERSION}
Build : ${BUILD}
Revision: ${REVISION}
Date: ${new Date()}
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
        }

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
    fs.mkdirSync( "./dist-new/libs" );

    console.log( "> Concat files ..." );

    const versions = await concatVersions();

    console.log( "> Uglify x3dom.js ..." );

    versions[ "BASIC_MIN" ] = uglify.minify( versions[ "BASIC" ] ).code;

    console.log( "> Uglify x3dom-full.js ..." );

    versions[ "FULL_MIN" ] = uglify.minify( versions[ "FULL" ] ).code

    console.log( "> Write x3dom.js ..." );

    fs.writeFileSync( DIST_FOLDER + "x3dom.js", HEADER + versions[ "BASIC" ] );

    console.log( "> Write x3dom.min.js ..." );

    fs.writeFileSync( DIST_FOLDER + "x3dom.min.js", HEADER + versions[ "BASIC_MIN" ] );

    console.log( "> Write x3dom-full.js ..." );

    fs.writeFileSync( DIST_FOLDER + "x3dom-full.js", HEADER + versions[ "FULL" ] );

    console.log( "> Write x3dom-full.min.js ..." );

    fs.writeFileSync( DIST_FOLDER + "x3dom-full.min.js", HEADER + versions[ "FULL_MIN" ] );

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