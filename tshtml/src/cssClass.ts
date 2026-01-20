import { each, flattenDeep, includes, pull, reduce } from "lodash";
import { TemplateValue } from "./templateValue";

/**
 * Creates a CSS class value object that can dynamically manage CSS classes.
 * Accepts an existing CssClassValue, strings, or string arrays.
 *
 * @example
 * ```ts
 * import { cssClass } from "tshtml";
 *
 * // Create from space-separated string
 * const cls = cssClass("btn btn-primary");
 *
 * // Dynamically mutate
 * cls.addClass("active");
 * cls.removeClass("btn");
 *
 * // Render to attribute value
 * cls.render(true); // "btn-primary active"
 * ```
 */
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
/**
 * Represents a dynamic collection of CSS classes that can be modified at runtime.
 * Implements the TemplateValue interface to be used in HTML templates.
 */
export class CssClassValue implements TemplateValue {

    /**
     * The underlying array of CSS class strings.
     * @type {string[]}
     */
    value: string[];


    /**
     * Creates a new CssClassValue with the given CSS classes.
     * 
     * @param {...(string | string[])[]} classes - Space-separated strings, individual class strings,
     *                                              or arrays of class strings to initialize with
     * 
     * @example
     * new CssClassValue('btn primary');
     * new CssClassValue('btn', 'primary');
     * new CssClassValue(['btn', 'primary']);
     */
    constructor( ...classes: ( string | string[] )[] ) {
        this.value = [];
        this.addClass( ...classes );
    }


    /**
     * Adds one or more CSS classes to this object. Duplicate classes are not added.
     * 
     * @param {...(string | string[])[]} classes - Classes to add (strings, space-separated strings, or arrays)
     * @returns {void}
     * 
     * @example
     * classes.addClass('active');
     * classes.addClass('active hidden');
     * classes.addClass(['active', 'hidden']);
     */
    addClass( ...classes: ( string | string[] )[] ): void {
        each( splitCssClasses( ...classes ), x => {
            if ( !includes( this.value, x ) ) {
                this.value.push( x );
            }
        } );
    }


    /**
     * Removes one or more CSS classes from this object.
     * 
     * @param {...(string | string[])[]} classes - Classes to remove (strings, space-separated strings, or arrays)
     * @returns {void}
     * 
     * @example
     * classes.removeClass('active');
     * classes.removeClass('active hidden');
     * classes.removeClass(['active', 'hidden']);
     */
    removeClass( ...classes: ( string | string[] )[] ): void {
        pull( this.value, ...splitCssClasses( ...classes ) );
    }


    /**
     * Renders the CSS classes as a space-separated string suitable for HTML attribute values.
     * 
     * @param {boolean} isAttributeValue - Whether this is being rendered as an HTML attribute value
     * @returns {string} A space-separated string of all classes, or undefined if no classes are present
     * 
     * @example
     * classes.render(true); // 'btn btn-primary active'
     */
    render( isAttributeValue: boolean ): string {
        if ( this.value == null || this.value.length == 0 ) return undefined;
        return this.value.join( " " );
    }

}


/**
 * Utility function to split CSS classes from various input formats into a flat array of class strings.
 * Handles space-separated strings, arrays, and nested arrays.
 * 
 * @private
 * @param {...(string | string[])[]} classes - Input in various formats
 * @returns {string[]} Flat array of individual class strings
 */
function splitCssClasses( ...classes: ( string | string[] )[] ): string[] {
    return reduce(
        flattenDeep( classes ),
        ( a, x: string ) => {
            if ( x != null ) {
                a.push( ...x.split( /\s+/ ).filter( s => s.length > 0 ) );
            }
            return a;
        }, [] )
}
