import { CssClassValue, TemplateElement } from "../../src";

describe( "TemplateElement", () => {
    
    it( "attr() should add attributes", () => {
        const el = new TemplateElement( "test" );
        el.attr( "a", 42 );
        expect( el["a"] ).toBe( 42 );
    } );
    
    
    it( "attrs() should add several attributes at once", () => {
        const el = new TemplateElement( "test" );
        el.attrs( {
            "a": 42,
            "b": "value"
        } );
        expect( el["a"] ).toBe( 42 );
        expect( el["b"] ).toBe( "value" );
    } );
    
    
    it( "element should parse css classes to CssClassValue", () => {
        const el = new TemplateElement( "test" );
        el.attrs( { "class": "red green blue" } );
        expect( el.class instanceof CssClassValue ).toBeTruthy();
        expect( el.class.value ).toEqual( ["red", "green", "blue"] );
    } );
    
    
    it( "element should always have class not null", () => {
        const el = new TemplateElement( "test" );
        expect( el.class instanceof CssClassValue ).toBeTruthy();
        expect( el.class.value ).toEqual( [] );
    } );
    
} );
