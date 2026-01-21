import { EmptyAttribute, html, tag, tagToString } from "../../src/index";

describe( "HTML generator", () => {

    it( "should support simple round-trip with single element", () => {
        expect( tagToString( html`<p>Test</p>` ) )
            .toEqual( `<p>Test</p>` );
    } );


    it( "should support simple round-trip with multiple elements", () => {
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
    
    it( "should render style objects as style attribute", () => {
        expect( tagToString( tag( "div", { style: { color: "red", fontSize: "14px" } } ) ) )
            .toContain( "style=" );
        expect( tagToString( tag( "div", { style: { color: "red", fontSize: "14px" } } ) ) )
            .toContain( "color:red" );
    } );

    it( "should handle null elements in array", () => {
        expect( tagToString( [
            tag( "div", "content" ),
            null as any,
            tag( "span", "more" )
        ] ) ).toEqual( `<div>content</div><span>more</span>` );
    } );

    it( "should handle TemplateValue properties", () => {
        const { cssClass } = require( "../../src/index" );
        expect( tagToString( tag( "div", { class: cssClass( "red blue" ) } ) ) )
            .toContain( "class=" );
    } );

} );
