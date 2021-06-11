import { readFile } from "fs";
import { executeTemplate, templateToString } from "./index";

if ( process.argv.length !== 3 ) {
    console.error( "Please specify one .tshtml file" );
    process.exit();
}

const fileName = process.argv[2];

readFile( fileName, { encoding: 'utf-8' }, function ( err, data ) {
    if ( !err ) {
        const result = executeTemplate( data, "test.html" );
        const htmlResult = templateToString( result.exports.default );
        process.stdout.write( htmlResult );

    } else {
        console.log( err );
    }
} );
