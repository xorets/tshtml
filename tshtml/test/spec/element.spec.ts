import { CssClassValue, TemplateElement } from "../../src/index";

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
    
    it( "appendChild should accept string with HTML markup and parse it", () => {
        const el = new TemplateElement( "div" );
        el.appendChild( "<p>Hello</p>" );
        expect( el.children.length ).toBeGreaterThan( 0 );
        expect( el.children[0] instanceof TemplateElement ).toBeTruthy();
    } );

    it( "appendChild should accept plain string without HTML", () => {
        const el = new TemplateElement( "div" );
        el.appendChild( "Hello" );
        expect( el.children ).toContain( "Hello" );
    } );

    it( "appendChild should accept non-string elements", () => {
        const el = new TemplateElement( "div" );
        const child = new TemplateElement( "p" );
        el.appendChild( child );
        expect( el.children ).toContain( child );
    } );
    
} );
