#!/usr/bin/env node

import { readFile, writeFile } from "fs";
import * as path from "node:path";
import { executeTemplate, templateToString } from "./index";

// ----------------------------------------------------------------------------------
if ( process.argv.length !== 3 ) {
    console.error( "Please specify one .tshtml file" );
    process.exit();
}

const fileName = process.argv[2];

const extension = path.extname( fileName ).toLowerCase();

if ( extension !== ".tshtml" ) {
    console.error( "Input file must have .tshtml extension" );
    process.exit();
}

const fileNameNoExtension = fileName.substr( 0, fileName.length - extension.length );
const outputFileName = fileNameNoExtension + ".html";

readFile( fileName, { encoding: 'utf-8' }, function ( err, data ) {
    if ( !err ) {
        // Transform the source
        const result = executeTemplate( data, path.join( process.cwd(), "/test.html" ) );
        const htmlResult = templateToString( result.exports.default );

        // Write to destination
        // process.stdout.write( htmlResult );
        writeFile( outputFileName, htmlResult, {
            encoding: "utf8",
            flag: "w",
        }, writeErr => {
            if ( !writeErr ) {
                console.log( `File is written: ${outputFileName}` );
                
            } else {
                console.log( `Error writing to the output file ${outputFileName}`, writeErr );
            }   
        } );

    } else {
        console.log( `Error reading the input file ${fileName}`, err );
    }
} );