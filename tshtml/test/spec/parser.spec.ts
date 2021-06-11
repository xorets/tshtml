import { EmptyAttribute, parseHtml, tag } from "../../src";

describe( "parser", () => {

    it( "should parse simple HTML", function() {
        expect( parseHtml( "<p>Test</p>" ) as any )
            .toEqual( [tag( "p", "Test" )] );
    } );
    

    it( "should parse simple HTML with attributes", function() {
        expect( parseHtml( `<p class="red">Test</p>` ) as any )
            .toEqual( [tag( "p", { "class": "red" }, "Test" )] );
    } );
    

    it( "should parse multi-line element declaration", function() {
        expect( parseHtml(
            `<p class="red"
                   width="7">Test</p>` ) as any )
            .toEqual( [tag( "p", { "class": "red", "width": "7" }, "Test" )] );
    } );
    
    
    it( "should support auto-closed elements", function() {
        expect( parseHtml( "<p>Test<br/>test<test/>rest</p>" ) as any )
            .toEqual( [tag( "p", "Test", tag( "br" ), "test", tag( "test" ), "rest" )] );
    } );
    

    it( "should support text with entities", function() {
        expect( parseHtml( "<p>Test &lt;br/></p>" ) as any )
            .toEqual( [tag( "p", "Test &lt;br/>" )] );
    } );
    

    it( "should accept text", function() {
        expect( parseHtml( "Plain text" ) as any )
            .toEqual( ["Plain text"] );
    } );
    

    it( "should parse class attribute to CssClassValue instance", function() {
        const el = parseHtml( "<div class='red green'>Test</div>" );
        expect( el[0].class.value ).toEqual( ["red", "green"] );
    } );
    

    describe( "errors:", () => {

        it( "unclosed tag", function() {
            expect( parseHtml( "<p>Test" ) as any )
                .toEqual( [tag( "p", "Test" )] );
        } );

        it( "two unclosed tag", function() {
            expect( parseHtml( "<p>Test 1<p>Test 2" ) as any )
                .toEqual( [tag( "p", "Test 1" ), tag( "p", "Test 2" )] );
        } );

        it( "malformed HTML", function() {
            expect( () => parseHtml( "<p Test 1" ) as any )
                .toThrow();
        } );

        it( "closing a wrong tag", function() {
            expect( () => parseHtml( `
                    <outer>
                        <span>Before</span>
                        <inner>
                            Inner
                        </inner-wrong>
                        <span>After</span>
                    </outer>` ) )
                .toThrow();
        } );

    })

} );
