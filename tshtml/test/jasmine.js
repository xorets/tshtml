// ts-node is already registered via --require in package.json test script
// No need to register again here

const Jasmine = require("jasmine");
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
