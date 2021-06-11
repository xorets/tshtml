import { EmptyAttribute, html, parseHtml, tag } from "../../src";

describe( "html function", () => {

    it( "should parse text", () => {
        expect( html`Test` as any )
            .toEqual( ["Test"] );
    } );


    it( "should parse whitespace text", () => {
        expect( html`   ` as any )
            .toEqual( ["   "] );
    } );


    it( "should parse HTML", () => {
        expect( html`<p>Test</p>` as any )
            .toEqual( [tag( "p", "Test" )] );
    } );


    it( "should parse XHTML", () => {
        expect( html`<elem/>` as any )
            .toEqual( [tag( "elem" )] );
    } );


    it( "should parse Angular attributes", () => {
        expect( html`<a (click)="onClick">Click me</a>` as any )
            .toEqual( [tag( "a", { "(click)": "onClick" }, "Click me" )] );
    } );


    it( "should trim leading spaces", () => {
        expect( html` 
                <p>Test</p>` as any )
            .toEqual( [tag( "p", "Test" )] );
    } );


    it( "should trim trailing spaces", () => {
        expect( html`<p>Test</p> 
                            ` as any )
            .toEqual( [tag( "p", "Test" )] );
    } );


    it( "should trim leading and trailing spaces", () => {
        expect( html` <p>Test</p> ` as any )
            .toEqual( [tag( "p", "Test" )] );
    } );


    it( "should parse HTML with string substitution", () => {
        const test = "Test";
        expect( html`<p>${test}</p>` as any )
            .toEqual( [tag( "p", "Test" )] );
    } );


    it( "should parse HTML with several string substitution", () => {
        const test = "Test";
        expect( html`<p>${test}${" 1, 2, 3"}</p>` as any )
            .toEqual( [tag( "p", "Test", " 1, 2, 3" )] );
    } );


    it( "should parse HTML with attribute value substitution", () => {
        const test = "center";
        expect( html`<p align="${test}"></p>` as any )
            .toEqual( [tag( "p", { "align": "center" } )] );
    } );


    it( "should parse HTML with whole attribute substitution", () => {
        const test = `align="center"`;
        expect( html`<p ${test}></p>` as any )
            .toEqual( [tag( "p", { "align": "center" } )] );
    } );


    it( "should parse HTML with tag substitution", () => {
        const test = tag( "img", { "src": "flower.jpg" } );
        expect( html`<p>${test}</p>` as any )
            .toEqual( [
                tag( "p",
                    tag( "img", { "src": "flower.jpg" } ) )] );
    } );


    it( "should parse HTML with array of tags substitution", () => {
        const test = [
            tag( "b", "The flower" ),
            tag( "img", { "src": "flower.jpg" } ),
        ];
        expect( html`<p>${test}</p>` as any )
            .toEqual( [
                tag( "p",
                    tag( "b", "The flower" ),
                    tag( "img", { "src": "flower.jpg" } ) )] );
    } );


    it( "should parse HTML with array of mixed tags and strings substitution", () => {
        const test = [
            "The flower",
            tag( "img", { "src": "flower.jpg" } ),
        ];
        expect( html`<p>${test}</p>` as any )
            .toEqual( [
                tag( "p",
                    "The flower",
                    tag( "img", { "src": "flower.jpg" } ) )] );
    } );


    it( "should parse string with only substitution", () => {
        const test = [
            "The flower",
            tag( "img", { "src": "flower.jpg" } ),
        ];
        expect( html`${test}` as any )
            .toEqual( [
                "The flower",
                tag( "img", { "src": "flower.jpg" } )] );
    } );


    it( "should parse HTML string in substitution", () => {
        const test = "<img src='flower.jpg' />";
        expect( html`<p>${test}<span>test</span></p>` as any )
            .toEqual( [
                tag( "p",
                    tag( "img", { "src": "flower.jpg" } ),
                    tag( "span", "test" ))] );
    } );


    it( "should skip empty substitutions", () => {
        const test = null;
        expect( html`<p>${test}</p>` as any )
            .toEqual( [tag( "p" )] );
    } );

    
    it( "should parse empty attributes", function() {
        expect( html`<p disabled="${EmptyAttribute}">Test</p>` as any )
            .toEqual( [tag( "p", { "disabled": EmptyAttribute }, "Test" )] );
    } );


    it( "should parse empty attributes w/o explicit assignment", function() {
        expect( html`<p disabled>Test</p>` as any )
            .toEqual( [tag( "p", { "disabled": EmptyAttribute }, "Test" )] );
    } );


    it( "should fail if tag is put inside of a node", () => {
        expect( () => html`<p ${tag( "img", { "src": "flower.jpg" } )} />` as any )
            .toThrow();
    } );


    it( "placeholder can be in the middle of the attribute value", () => {
        const level = 2;
        const el = html`<lg-pivot-table-filterable [config]="{ set: filter, filter: levelFilters[${level - 1}] }" />`;
        expect( el )
            .toEqual( [tag( "lg-pivot-table-filterable", {
                "[config]": "{ set: filter, filter: levelFilters[1] }",
            } )] );
    } );

    
    it( "placeholder can be used in attribute name", function() {
        const attrName = "test";
        expect( html`<p #${attrName}="${EmptyAttribute}">Test</p>` as any )
            .toEqual( [tag( "p", { "#test": EmptyAttribute }, "Test" )] );
    } );


    it( "placeholder can be used in attribute name #2", function() {
        const attrName = "test";
        expect( html`<p color="red" #${attrName}="${EmptyAttribute}">Test</p>` as any )
            .toEqual( [tag( "p", { "color": "red", "#test": EmptyAttribute }, "Test" )] );
    } );


} );
