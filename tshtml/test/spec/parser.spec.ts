import { EmptyAttribute, parseHtml, tag } from "../../src/index";

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

        it( "should handle multiple placeholders in template", function() {
            const { html } = require( "../../src/index" );
            const part1 = "Hello";
            const part2 = "World";
            const result = html`<p>${part1} ${part2}</p>`;
            expect( result ).toBeDefined();
            expect( result.length ).toBeGreaterThan( 0 );
        } );

        describe( "entity handling:", () => {

            it( "should preserve HTML entities in text", function() {
                expect( parseHtml( "<p>&lt;&gt;&amp;</p>" ) as any )
                    .toEqual( [tag( "p", "&lt;&gt;&amp;" )] );
            } );

            it( "should preserve numeric entities in text", function() {
                expect( parseHtml( "<p>&#60;&#62;&#38;</p>" ) as any )
                    .toEqual( [tag( "p", "&#60;&#62;&#38;" )] );
            } );

            it( "should preserve hex entities in text", function() {
                expect( parseHtml( "<p>&#x3C;&#x3E;&#x26;</p>" ) as any )
                    .toEqual( [tag( "p", "&#x3C;&#x3E;&#x26;" )] );
            } );

            it( "should preserve entities in attributes", function() {
                expect( parseHtml( "<p title='&lt;test&gt;'>Content</p>" ) as any )
                    .toEqual( [tag( "p", { "title": "&lt;test&gt;" }, "Content" )] );
            } );

            it( "should preserve named entities like &nbsp;", function() {
                expect( parseHtml( "<p>word&nbsp;space</p>" ) as any )
                    .toEqual( [tag( "p", "word&nbsp;space" )] );
            } );

            it( "should handle mixed entities and text", function() {
                expect( parseHtml( "<p>Text &lt;with&gt; entities &amp; more</p>" ) as any )
                    .toEqual( [tag( "p", "Text &lt;with&gt; entities &amp; more" )] );
            } );

            it( "should preserve entities in nested elements", function() {
                expect( parseHtml( "<div><span>&lt;nested&gt;</span></div>" ) as any )
                    .toEqual( [tag( "div", tag( "span", "&lt;nested&gt;" ) )] );
            } );

        } );

    })

} );
