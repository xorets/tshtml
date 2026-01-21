import {
    assign,
    each,
    isArray,
    isString,
    flattenDeep
} from "lodash";
import { TemplateAttributes, TemplateFragment, TemplateElement, TemplateItem } from "./element";


/**
 * Analyzes and processes tag arguments, separating attributes from child elements.
 * The first argument can optionally be an attributes object (if it's not a template fragment).
 * 
 * @param {TemplateAttributes | TemplateFragment | TemplateFragment[]} [first] - Optional first argument
 * @param {...(TemplateFragment | TemplateFragment[])[]} rest - Remaining arguments (children)
 * @returns {{attrs: TemplateAttributes; children: (TemplateFragment | TemplateFragment[])[]} }
 *          Object with separated attrs and children arrays
 * 
 * @private
 * @example
 * tagProcessArguments({id: 'el'}, 'text')
 * // => { attrs: {id: 'el'}, children: ['text'] }
 * 
 * tagProcessArguments('text', 'more text')
 * // => { attrs: null, children: ['text', 'more text'] }
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


/**
 * Creates an HTML element with the given tag name, optional attributes, and children.
 * 
 * @param {string} tag - The HTML tag name (e.g., 'div', 'span', 'p')
 * @param {TemplateAttributes | TemplateFragment | TemplateFragment[]} [first] - Either attributes object or first child element
 * @param {...(TemplateFragment | TemplateFragment[])[]} rest - Additional child elements
 * @returns {TemplateElement} A TemplateElement representing the HTML tag
 * 
 * @example
 * ```typescript
 * import { tag } from 'tshtml';
 * 
 * // Simple tag with text
 * tag('p', 'Hello World');
 * 
 * // Tag with attributes
 * tag('div', { id: 'main', class: 'container' }, 'Content');
 * 
 * // Nested tags
 * tag('div',
 *     tag('h1', 'Title'),
 *     tag('p', 'Content')
 * );
 * 
 * // Mixed children
 * tag('ul',
 *     tag('li', 'Item 1'),
 *     tag('li', 'Item 2')
 * );
 * ```
 */
export function tag( tag: string, first?: TemplateAttributes | TemplateFragment | TemplateFragment[], ...rest: ( TemplateFragment | TemplateFragment[] )[] ): TemplateElement {
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


/**
 * Type guard to check if an object is a TemplateElement (HTML tag).
 * 
 * @param {any} obj - The object to check
 * @returns {boolean} True if obj has a 'tag' property, indicating it's a TemplateElement
 * 
 * @example
 * ```typescript
 * if (isTag(element)) {
 *     console.log('Tag name:', element.tag);
 * }
 * ```
 */
export function isTag( obj: any ): obj is TemplateElement {
    return obj != null && obj["tag"] != null;
}


/**
 * Convenience function to create a div element.
 * 
 * @param {TemplateAttributes | TemplateFragment | TemplateFragment[]} [first] - Attributes or first child
 * @param {...(TemplateFragment | TemplateFragment[])[]} rest - Additional children
 * @returns {TemplateElement} A TemplateElement for a div tag
 * 
 * @example
 * div({ class: 'container' }, 'Content here')
 */
export function div( first?: TemplateAttributes | TemplateFragment | TemplateFragment[], ...rest: ( TemplateFragment | TemplateFragment[] )[] ): TemplateElement {
    return tag( "div", first, ...rest );
}


/**
 * Convenience function to create a span element.
 * 
 * @param {TemplateAttributes | TemplateFragment | TemplateFragment[]} [first] - Attributes or first child
 * @param {...(TemplateFragment | TemplateFragment[])[]} rest - Additional children
 * @returns {TemplateElement} A TemplateElement for a span tag
 * 
 * @example
 * span({ class: 'highlight' }, 'Important text')
 */
export function span( first?: TemplateAttributes | TemplateFragment | TemplateFragment[], ...rest: ( TemplateFragment | TemplateFragment[] )[] ): TemplateElement {
    return tag( "span", first, ...rest );
}


/**
 * Convenience function to create an anchor (a) element.
 * 
 * @param {TemplateAttributes | TemplateFragment | TemplateFragment[]} [first] - Attributes or first child
 * @param {...(TemplateFragment | TemplateFragment[])[]} rest - Additional children
 * @returns {TemplateElement} A TemplateElement for an a tag
 * 
 * @example
 * a({ href: '/page', title: 'Link' }, 'Click here')
 */
export function a( first?: TemplateAttributes | TemplateFragment | TemplateFragment[], ...rest: ( TemplateFragment | TemplateFragment[] )[] ): TemplateElement {
    return tag( "a", first, ...rest );
}
