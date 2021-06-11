import { htmlEl, tag } from "../../src";

describe( "htmlEl function", () => {

    it( "should parse an element", () => {
        expect( htmlEl`<p>Test</p>` )
            .toEqual( tag( "p", "Test" ) );
    } );


    
    it( "should NOT parse an empty text", () => {
        expect( () => htmlEl`` )
            .toThrow();
    } );


    it( "should NOT parse a text", () => {
        expect( () => htmlEl`Test` )
            .toThrow();
    } );


    it( "should NOT parse several elements", () => {
        expect( () => htmlEl`<a>a</a><b>b</b>` )
            .toThrow();
    } );


} );
