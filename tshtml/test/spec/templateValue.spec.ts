import { html, isTemplateValue, tagToString, TemplateElement, TemplateValue } from "../../src";

describe( "TemplateValue", () => {

    const value: TemplateValue = {
        render( isAttributeValue: boolean ): string {
            return isAttributeValue 
                ? "attribute value"
                : "inner text";
        }
    };

    
    it( "html() should not convert TemplateValue to string", () => {
        let elements = html`<p a="${value}">Test</p>`;
        expect( isTemplateValue( ( elements[0] as TemplateElement )["a"] ) ).toBeTruthy();
    } );


    it( "TemplateValue can occur as part of an attribute value", () => {
        let elements = html`<p a="the ${value}">Test</p>`;
        expect( ( elements[0] as TemplateElement )["a"] ).toEqual( "the attribute value" );
    } );


    it( "should correctly output TemplateValue in an attribute", () => {
        expect( tagToString( html`<p a="${value}">Test</p>` ) )
            .toEqual( `<p a="attribute value">Test</p>` );
    } );


    it( "should correctly output TemplateValue as element child", () => {
        expect( tagToString( html`<p>${value}</p>` ) )
            .toEqual( `<p>inner text</p>` );
    } );

} );
