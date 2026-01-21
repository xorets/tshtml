import { map, each, isBoolean, isNumber, isString, isArray } from "lodash";
import { TemplateValue } from "./templateValue";


/**
 * Represents a JSON-serializable type that can be used in JavaScript expressions.
 * Recursively converts complex types to JSON-compatible representations.
 * 
 * @typedef {*} JsonLike
 */
export type JsonLike<T> =
    T extends undefined ? T :
    T extends string | number | boolean | null ? T :
    T extends Array<infer V> ? Array<JsonLike<V>> :
    T extends JsExpression<infer V> ? JsExpression<V> :
    T extends Function ? never :
    {
        [P in keyof T]: JsonLike<T[P]>
    };


/**
 * Creates a JsExpression for embedding JavaScript values in HTML templates.
 * 
 * @template T - The type of the value being wrapped
 * @param {JsonLike<T>} value - A JSON-compatible value to wrap
 * @returns {JsExpression<T>} A JsExpression that can be rendered in templates
 * 
 * @example
 * ```typescript
 * import { expr } from 'tshtml';
 * 
 * // Simple value
 * const isActive = expr(true);
 * 
 * // Object
 * const config = expr({ threshold: 10, enabled: true });
 * 
 * // Array
 * const items = expr([1, 2, 3]);
 * 
 * // String expression
 * const js = expr('calculateValue()');
 * ```
 */
export function expr<T = any>( value: JsonLike<T> ): JsExpression<T> {
    return new JsExpression( value );
}


/**
 * Wraps a JavaScript value to be rendered as JavaScript code in HTML templates.
 * Handles proper serialization of objects, arrays, primitives, and raw JavaScript strings.
 * 
 * @class
 * @template T - The type of the wrapped value
 * 
 * @example
 * ```typescript
 * import { JsExpression } from 'tshtml';
 * 
 * // In template attributes
 * div({ 
 *     onclick: new JsExpression('handleClick(event)'),
 *     dataset: new JsExpression({ id: 123, name: 'test' })
 * })
 * ```
 */
export class JsExpression<T = any> implements TemplateValue {

    /**
     * The JSON-compatible value wrapped by this expression
     * @type {JsonLike<T>}
     */
    value: JsonLike<T>;


    /**
     * Creates a new JsExpression with the given value.
     * 
     * @param {JsonLike<T>} value - The value to wrap
     */
    constructor( value: JsonLike<T> ) {
        this.value = value;
    }


    /**
     * Renders the JavaScript expression as a string suitable for HTML attributes or script tags.
     * String values are treated as raw JavaScript expressions (without quotes).
     * Other values are JSON-serialized.
     * 
     * @param {boolean} isAttributeValue - Whether this is being rendered as an HTML attribute value
     * @returns {string} The JavaScript code representation of the value
     * 
     * @example
     * expr('getValue()').render(true);      // 'getValue()'
     * expr({ x: 1 }).render(true);          // '{x:1}'
     * expr([1, 2, 3]).render(true);         // '[1,2,3]'
     */
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

