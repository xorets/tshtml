import {
    assign,
    each,
    isArray,
    isString,
    flattenDeep
} from "lodash";
import { TemplateAttributes, TemplateFragment, TemplateElement, TemplateItem } from "./element";


/***
 * Analyses arguments and split them in correctly typed attribute hash and children array 
 * @param first
 * @param rest
 */
export function tagProcessArguments( first?: TemplateAttributes | TemplateFragment | TemplateFragment[], ...rest: ( TemplateFragment | TemplateFragment[] )[] ): 
        { attrs: TemplateAttributes; children: ( TemplateFragment | TemplateFragment[] )[]; } {

    if ( first != null && ( isTag( first ) || isArray( first ) || isString( first ) ) ) {
        // attrs is first or second child element
        rest = [first as TemplateElement, ...rest];
        first = null;
    }
    
    return {
        attrs: first as TemplateAttributes,
        children: rest,
    };
}


/***
 * Creates TemplateElement object with given parameters
 * @param tag
 * @param first
 * @param rest
 */
export function tag( tag: string, first?: TemplateAttributes | TemplateFragment | TemplateFragment[], ...rest: ( TemplateFragment | TemplateFragment[] )[] ) {
    const args = tagProcessArguments( first, ...rest );

    const res: TemplateElement = new TemplateElement( tag );
    res.attrs( args.attrs );

    for ( let child of args.children ) {
        if ( isArray( child ) ) {
            each( flattenDeep( child ), ( x: TemplateItem ) => {
                res.appendChild( x );
            } );
        } else {
            res.appendChild( child );
        }
    }

    return res;
}


/***
 * Checks if give object is a ITemplate element
 * @param obj
 */
export function isTag( obj: any ): obj is TemplateElement {
    return obj != null && obj["tag"] != null;
}


export function div( first?: TemplateAttributes | TemplateFragment | TemplateFragment[], ...rest: ( TemplateFragment | TemplateFragment[] )[] ) {
    return tag( "div", first, ...rest );
}


export function span( first?: TemplateAttributes | TemplateFragment | TemplateFragment[], ...rest: ( TemplateFragment | TemplateFragment[] )[] ) {
    return tag( "span", first, ...rest );
}


export function a( first?: TemplateAttributes | TemplateFragment | TemplateFragment[], ...rest: ( TemplateFragment | TemplateFragment[] )[] ) {
    return tag( "a", first, ...rest );
}
