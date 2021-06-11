import {
    chain,
    includes,
    isArray,
    isEmpty,
    isObject,
    isString,
    map
} from "lodash";
import { TemplateFragment, TemplateItem } from "./element";
import { isTemplateValue } from "./templateValue";


// ----------------------------------------------------------------------------------
//

/**
 * If an attribute has this value, then it will be emitted as attribute w/o value in the resulting HTML.
 */
export const EmptyAttribute = Symbol();


// ----------------------------------------------------------------------------------
//
const EMPTY_HTML_ELEMENTS = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"];

/***
 * Converts ITemplateFragment subtree (or array of subtrees) to HTML string.
 * @param elements
 */
export function tagToString( ...elements: (TemplateFragment | TemplateFragment[])[] ) {

    return map( elements, x => renderElement( x ) ).join( "" );
    
    // ---
    function renderElement( element: TemplateFragment  | TemplateFragment[] ) {
        if ( element == null ) {
            return "";
        }

        if ( isArray( element ) ) {
            return map( element, x => tagToString( x ) ).join( "" );

        } else if ( isString( element ) ) {
            return element;

        } else if ( isTemplateValue( element ) ) {
            return element.render( false );

        } else {
            const attrs = chain( element )
                .toPairs()
                .filter( ( [name, val] ) => name !== "tag" && name !== "children" && val != undefined )
                .map( ( [name, val]: [string, any] ) => {
                    if ( val === EmptyAttribute ) {
                        return ` ${name}`;
                    }

                    if ( !isString( val ) ) {
                        // Support for array values for "class" attribute
                        /*if ( name === "class" && isArray( val ) ) {
                            val = val.join( " " );
                        }*/

                        // Support for hashes for "style" attribute
                        /*else */if ( name === "style" && isObject( val ) ) {
                            val = map( val, ( v, n ) => `${n}:${v}` )
                                .join( ";" );
                        }
                        
                        // Support for "renderable" values
                        else if( isTemplateValue( val ) ) {
                            val = val.render( true );
                        }

                        // Copy values for all other attributes
                        else {
                            val = val.toString();
                        }
                    }

                    // Support for value renderers returning empty values
                    if ( val == undefined ) return "";

                    return ` ${name}="${val.replace( /"/g, "&#34;" )}"`;
                } )
                .join( "" );

            if ( isEmpty( element.children ) && includes( EMPTY_HTML_ELEMENTS, element.tag ) ) {
                return `<${element.tag}${attrs} />`;
            } else {
                return `<${element.tag}${attrs}>${element.children ? tagToString( element.children ) : ""}</${element.tag}>`;
            }
        }
    }
}

