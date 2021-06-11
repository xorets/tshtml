require( "ts-node" ).register( {
    compilerOptions: {
        module: "CommonJS",
    }
} );

const Jasmine = require( "jasmine" );
const jasmine = new Jasmine();

jasmine.loadConfig(
    {
        "spec_dir": "./test/spec",
        "spec_files": [
            "**/*[sS]pec.[tj]s"
        ],
        /*'helpers': [
            'helpers/!**!/!*.js'
        ],*/
        "stopSpecOnExpectationFailure": false,
        "random": true,

    } );

const args = process.argv.slice(2);

jasmine.execute( [], args[0] );
