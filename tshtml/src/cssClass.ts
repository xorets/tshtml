import { each, flattenDeep, includes, pull, reduce } from "lodash";
import { TemplateValue } from "./templateValue";


export function cssClass( cls: CssClassValue ): CssClassValue;
export function cssClass( ...classes: ( string | string[] )[] ): CssClassValue;
export function cssClass( ...classes: ( string | string[] | CssClassValue )[] ): CssClassValue {
    if ( classes[0] instanceof CssClassValue ) {
        return classes[0] as CssClassValue;
    }
    return new CssClassValue( ...classes as ( string | string[] )[] );
}


// ----------------------------------------------------------------------------------
//
export class CssClassValue implements TemplateValue {

    value: string[];


    constructor( ...classes: ( string | string[] )[] ) {
        this.value = [];
        this.addClass( ...classes );
    }


    addClass( ...classes: ( string | string[] )[] ) {
        each( splitCssClasses( ...classes ), x => {
            if ( !includes( this.value, x ) ) {
                this.value.push( x );
            }
        } );
    }


    removeClass( ...classes: ( string | string[] )[] ) {
        pull( this.value, ...splitCssClasses( ...classes ) );
    }


    render( isAttributeValue: boolean ): string {
        if ( this.value == null || this.value.length == 0 ) return undefined;
        return this.value.join( " " );
    }

}


function splitCssClasses( ...classes: ( string | string[] )[] ) {
    return reduce(
        flattenDeep( classes ),
        ( a, x: string ) => {
            if ( x != null ) {
                a.push( ...x.split( /\s+/ ) );
            }
            return a;
        }, [] )
}
