import { EmptyAttribute, html, tag, tagToString } from "../../src";

describe( "HTML generator", () => {

    it( "should support simple round-trip", () => {
        expect( tagToString( html`<p>Test</p>` ) )
            .toEqual( `<p>Test</p>` );
    } );


    it( "should support simple round-trip", () => {
        expect( tagToString(
            html`<div>
                <h1>Hello world!</h1>
                <p>Hello world, <b>world</b>,<br /> <i>world</i>...</p>
            </div>
            <div align="center">Footer</div>` ) )
            .toEqual( `<div>
                <h1>Hello world!</h1>
                <p>Hello world, <b>world</b>,<br /> <i>world</i>...</p>
            </div>
            <div align="center">Footer</div>` );
    } );


    it( "should preserve tag and attribute case", () => {
        expect( tagToString( html`<p anAttr="1">Test<SubTag>2</SubTag></p>` ) )
            .toEqual( `<p anAttr="1">Test<SubTag>2</SubTag></p>` );
    } );
    
    
    it( "should emit null properties as empty attributes", () => {
        expect( tagToString( tag( "custom", { first: "first", second: EmptyAttribute } ) ) )
            .toEqual( `<custom first="first" second></custom>` );
    } );
    

    it( "should emit false properties as attributes with value", () => {
        expect( tagToString( tag( "custom", { first: true, second: false } ) ) )
            .toEqual( `<custom first="true" second="false"></custom>` );
    } );
    

    it( "should support array of elements", () => {
        expect( tagToString( [
                tag( "custom", { first: true, second: false } ),
                tag( "custom", { first: true, second: false } )
            ] ) )
            .toEqual( `<custom first="true" second="false"></custom><custom first="true" second="false"></custom>` );
    } );
    

} );
