import { html, div, a, span, tag } from "../../src";

describe( "tag helpers", () => {

    it( "should accept list of children", () => {
        expect( [tag( "custom", "first", tag( "second" ), "third" )] )
            .toEqual( html`<custom>first<second></second>third</custom>` as any );
    } );


    it( "should accept array of children", () => {
        expect( [tag( "custom", ["first", tag( "second" ), "third"] )] )
            .toEqual( html`<custom>first<second></second>third</custom>` as any );
    } );


    it( "should accept array of children with children", () => {
        expect( [tag( "custom", [
            "first",
            tag( "second", { "second": "true" }, "second-1", tag( "span", "second-2" ) ),
            "third"] )] )
            .toEqual( html`<custom>first<second second="true">second-1<span>second-2</span></second>third</custom>` as any );
    } );


    it( "should accept mixed list/array of children started with array", () => {
        expect( [tag( "custom", ["first", tag( "second" )], "third" )] )
            .toEqual( html`<custom>first<second></second>third</custom>` as any );
    } );


    it( "should accept mixed list/array of children started with tag", () => {
        expect( [tag( "custom", tag( "first" ), [tag( "second" ), "third"] )] )
            .toEqual( html`<custom><first></first><second></second>third</custom>` as any );
    } );


    // Standard tags
    describe( 'standard tags', () => {

        it( "div", () => {
            expect( [div( { "width": "7", "height": "8" }, "Test" )] )
                .toEqual( html`<div width="7" height="8">Test</div>` as any );
        } );


        it( "span", () => {
            expect( [span( { "title": "The span" } )] )
                .toEqual( html`<span title="The span"></span>` as any );
        } );


        it( "a", () => {
            expect( [a( { "href": "about:blank" }, "Click me" )] )
                .toEqual( html`<a href="about:blank">Click me</a>` as any );
        } );
        
    } );

} );