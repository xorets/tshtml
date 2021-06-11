import { map, each, isBoolean, isNumber, isString, isArray } from "lodash";
import { TemplateValue } from "./templateValue";


export type JsonLike<T> =
    T extends undefined ? T :
    T extends string | number | boolean | null ? T :
    T extends Array<infer V> ? Array<JsonLike<V>> :
    T extends JsExpression<infer V> ? JsExpression<V> :
    T extends Function ? never :
    {
        [P in keyof T]: JsonLike<T[P]>
    };


export function expr<T = any>( value: JsonLike<T> ) {
    return new JsExpression( value );
}


export class JsExpression<T = any> implements TemplateValue {

    value: JsonLike<T>;


    constructor( value: JsonLike<T> ) {
        this.value = value;
    }


    render( isAttributeValue: boolean ): string {
        // If root value is string, then this is a JS expression -> emit w/o quotes 
        if ( isString( this.value ) ) {
            return this.value;
        }
        
        return stringifyValue( this.value );
    }

}


function stringifyValue( value: any ) {

    // Primitive types
    if ( value === null )      return "null";
    if ( value === undefined ) return "undefined";
    if ( isBoolean( value ) )  return value.toString();
    if ( isNumber( value ) )   return value.toString();
    if ( isString( value ) )   return `'${value.replace( /'/g, "\\'" )}'`;

    // Array
    if ( isArray( value ) ) {
        const parts = map( value, x => stringifyValue( x ) );
        return `[${parts.join( ", " )}]`;
    }

    // Another JsExpression
    if ( value instanceof JsExpression ) {
        return value.render( true );
    }

    // Fallback - serialize as object with fields
    const fields = map( value, ( val, key ) => {
        return `'${key}': ${stringifyValue( val )}`
    } );
    return `{ ${fields.join( ", " )} }`;

}

