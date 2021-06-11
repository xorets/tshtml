import { filter, isString, Dictionary, keys, isArray } from "lodash";
import { Service, register } from "ts-node";
import { statSync } from "fs";
import { dirname } from "path";
import { Script } from "vm";
import LoaderContext = webpack.loader.LoaderContext;
import * as webpack from "webpack";
import { isTag, tagToString } from "tshtml";

require( "tsconfig-paths/register" ); // Necessary to support @folders resolution by Nodejs
const Module = require( "module" );

// ----------------------------------------------------------------------------------
//
export default function( this: LoaderContext, source: string ) {

    let result: { exports: any; dependencies: string[] };
    let htmlResult: string;
    let builder: any;
    try {
        result = executeTemplate( source, this.resourcePath );
        builder = result.exports.default;
    } catch ( error ) {
        throw new Error( `Error executing template: ${error.message}\n ${error.stack}` );
    }

    if ( builder == null ) {
        throw new Error( `Template must be exported as "default".` );
    }

    htmlResult = templateToString( builder );

    // Dependencies
    const reTestNodeFolder = /[\/\\]node_modules[\/\\]/g;
    const filteredDependencies = filter( result.dependencies, x => x.startsWith( this.rootContext ) && !reTestNodeFolder.test( x ) );
    for ( let file of filteredDependencies ) {
        this.addDependency( file );
    }

    if ( this.loaderIndex > 0 ) {
        return htmlResult;
    } else {
        const json = JSON.stringify( htmlResult )
            .replace( /\u2028/g, '\\u2028' )
            .replace( /\u2029/g, '\\u2029' );
        return `module.exports = ${json}`;
    }    
};

// ----------------------------------------------------------------------------------
//

export function executeTemplate( code: string, fileName: string ) {
    const dirName = dirname( fileName );

    const output = compileCode( code, fileName );

    const script = new Script( output, { filename: fileName } );

    const module = new Module( fileName );
    module.filename = fileName;
    module.loaded = true;
    module.paths = ( Module as any )._nodeModulePaths( dirName );

    const req = createRequireService( fileName );

    const sandbox = {
        __filename: fileName,
        __dirname: dirName,
        module: module,
        exports: module.exports,
        require: req,
    };

    script.runInNewContext( sandbox, {
        filename: fileName,
    } );

    return {
        exports: sandbox.exports,
        dependencies: req.dependencies,
    };
}


export function templateToString( builder: any ): string {
    if ( isString( builder ) ) {
        return builder;
        
    } else if ( typeof ( builder ) == "function" ) {
        return ( new builder() ).toString();
        
    } else if ( isArray( builder ) || isTag( builder ) ) {
        return tagToString( builder );
        
    } else {
        return builder.toString();
    }
}


let compilerService: Service;

/***
 * Compiles given TypeScript code
 * @param code 
 * @param fileName
 */
function compileCode( code: string, fileName: string ) {
    const tsFileName = `${fileName}.ts`;

    if( compilerService == null ) {
        compilerService = register( {
            compilerOptions: {
                module: "CommonJS",
            },
        } );
    }

    return compilerService.compile( code, tsFileName );
}


/***
 * Extended type used for dependencies tracking
 */
interface NodeRequireWithLogging extends NodeRequire {
    dependencies: string[];
    resolve: RequireResolve;
}


interface ModuleInfo extends NodeJS.Module {
    fileLastModified?: number;
}



/***
 * Create a logging wrapper for "require" function.
 * @param fileName
 */
function createRequireService( fileName: string ) {
    const req = Module.createRequire( fileName );

    const cache = req.cache;
    const dependencies = [];

    const resolveFn = ( id: string, options?: { paths?: string[]; } ) => {
        return req.resolve( id, options );
    };
    resolveFn.paths = req.resolve.paths;

    const requireFn: NodeRequireWithLogging = ( request ) => {
        let filePath: string;
        try {
            filePath = resolveFn( request );
        } catch ( error ) {
            // Likely file doesn't exist, so short circuit to the default implementation
            return req( request );
        }

        // Try to get the module from cache and check it's modification time
        let module: ModuleInfo = cache[filePath];
        if ( module != null ) {
            cleanOutdatedModules( module, {} );
        }

        const result = req( request );

        // Store last modification date
        const allFiles = {};
        storeModuleTimes( cache[filePath], allFiles );

        // Store request to the dependency resolution log
        dependencies.push( ...keys( allFiles ) );

        return result;
    };

    requireFn.resolve = resolveFn;
    requireFn.cache = cache;
    requireFn.extensions = req.extensions;
    requireFn.main = req.main;
    requireFn.dependencies = dependencies;

    return requireFn;
    
    // ---
    function cleanOutdatedModules( module: ModuleInfo, allFiles: Dictionary<boolean> ): boolean {
        allFiles[module.filename] = true;

        let doClean = false;

        // If the module file was modified since last access -> remove it from the cache
        if ( module.fileLastModified != null ) {
            const moduleTime = statSync( module.filename ).mtimeMs;
            if ( module.fileLastModified != moduleTime ) {
                doClean = true;
            }
        }

        // Check if any child module is outdated
        for ( let childModule of module.children ) {
            if ( allFiles[childModule.filename] || !checkFilename( childModule.filename )) continue;
            doClean = cleanOutdatedModules( childModule, allFiles ) || doClean;
        }
        
        if( doClean ) {
            delete cache[module.filename];
        }

        return doClean;
    }

    function storeModuleTimes( module: ModuleInfo, allFiles: Dictionary<boolean> ) {
        allFiles[module.filename] = true;
        
        if( module.fileLastModified == null) {
            module.fileLastModified = statSync( module.filename ).mtimeMs;
        }

        let childModule: ModuleInfo;
        for ( childModule of module.children ) {
            if ( allFiles[childModule.filename] || !checkFilename( childModule.filename )) continue;
            storeModuleTimes( childModule, allFiles );
        }
    }
    
    function checkFilename( filename: string ) {
        return filename.indexOf( "\\node_modules\\" ) === -1;
    }
    
}
