import { cssClass } from "../../src/index";

describe( "cssClass", () => {

    it( "should accept a single class", () => {
        const c = cssClass( "red" );
        expect( c.value ).toEqual( ["red"] );
    } );


    it( "should accept value separated by spaces", () => {
        const c = cssClass( "red green   blue" );
        expect( c.value ).toEqual( ["red", "green", "blue"] );
    } );


    it( "should accept several arguments with mixed spacing", () => {
        const c = cssClass( "red", "green   blue" );
        expect( c.value ).toEqual( ["red", "green", "blue"] );
    } );


    it( "should accept several arguments as separate strings", () => {
        const c = cssClass( "red", "green", "blue" );
        expect( c.value ).toEqual( ["red", "green", "blue"] );
    } );


    it( "should accept an array", () => {
        const c = cssClass( ["red", "green", "blue"] );
        expect( c.value ).toEqual( ["red", "green", "blue"] );
    } );


    it( "should accept an mix of methods", () => {
        const c = cssClass( "red", ["green", "blue magenta"] );
        expect( c.value ).toEqual( ["red", "green", "blue", "magenta"] );
    } );


    it( "should transparently reuse the passed CssClassValue", () => {
        const c = cssClass( "red", ["green", "blue magenta"] );
        const c2 = cssClass( c );
        expect( c2 ).toBe( c );
    } );


    it( "should allow to add value after creation", () => {
        const c = cssClass( "red green blue" );
        c.addClass( "magenta" );
        expect( c.value ).toEqual( ["red", "green", "blue", "magenta"] );
    } );


    it( "should not add duplicate class", () => {
        const c = cssClass( "red green blue" );
        c.addClass( "blue" );
        expect( c.value ).toEqual( ["red", "green", "blue"] );
    } );


    it( "should allow to remove value after creation", () => {
        const c = cssClass( "red green blue" );
        c.removeClass( "blue magenta" );
        expect( c.value ).toEqual( ["red", "green"] );
    } );

    it( "should remove multiple classes in a single call", () => {
        const c = cssClass( "red green blue yellow" );
        c.removeClass( "red blue" );
        expect( c.value ).toEqual( ["green", "yellow"] );
    } );


    it( "should be renderable", () => {
        const c = cssClass( "red", "green", "blue" );
        expect( c.render( true ) ).toEqual( "red green blue" );
    } );

    it( "should return undefined when classes are empty", () => {
        const c = cssClass( "red" );
        c.removeClass( "red" );
        expect( c.render( true ) ).toBeUndefined();
    } );

    it( "should return undefined when no classes are set", () => {
        const c = cssClass( [] );
        expect( c.render( true ) ).toBeUndefined();
    } );

    it( "should handle null value in render", () => {
        const c = cssClass( [] );
        c.value = null;
        expect( c.render( true ) ).toBeUndefined();
    } );

    it( "should accept empty array without error", () => {
        const c = cssClass( [] );
        expect( c.value ).toEqual( [] );
    } );

    it( "should not add empty strings as classes", () => {
        const c = cssClass( "red", "", "blue" );
        expect( c.value ).toEqual( ["red", "blue"] );
    } );

} );
