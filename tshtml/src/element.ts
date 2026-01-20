import {
    each,
    isString
} from "lodash";
import { parseHtml } from "./parser";
import { TemplateValue } from "./templateValue";
import { cssClass, CssClassValue } from "./cssClass";


/**
 * Attributes of an HTML element representation.
 * A key-value collection where keys are attribute names and values are attribute values.
 * Special reserved keys 'tag' and 'children' cannot be used as attributes.
 * 
 * @typedef {Object} TemplateAttributes
 * @example
 * {
 *     id: 'main',
 *     class: 'container',
 *     'data-value': 123,
 *     disabled: true
 * }
 */
export interface TemplateAttributes {
    [name: string]: TemplateAttributeValue;
    tag?: never;
    children?: never;
}

/**
 * Value type for HTML attributes. Can be a primitive, TemplateValue (for dynamic rendering),
 * a style object, or other objects with toString() method.
 * 
 * @typedef {string | number | boolean | symbol | TemplateValue | Record<string, string | number>} TemplateAttributeValue
 */
export type TemplateAttributeValue = string | number | boolean | symbol | TemplateValue | Record<string, string | number>;


/**
 * TemplateItem is either a TemplateElement (tag object) or plain string (text node).
 * Represents a single item in the template tree.
 * 
 * @typedef {TemplateElement | TemplateValue | string} TemplateItem
 */
export type TemplateItem = TemplateElement | TemplateValue | string;


/**
 * TemplateFragment can be either a single template item or an array of items.
 * Used as a flexible way to pass children to tags.
 * 
 * @typedef {TemplateItem | TemplateItem[]} TemplateFragment
 */
export type TemplateFragment = TemplateItem | TemplateItem[];


/**
 * Represents an HTML element in the template tree.
 * Allows for dynamic attribute and class management, child element manipulation,
 * and rendering to HTML strings.
 * 
 * @class TemplateElement
 * @example
 * ```typescript
 * import { tag } from 'tshtml';
 * 
 * const el = tag('div', { id: 'main' });
 * el.attr('class', 'container');
 * el.appendChild('Hello World');
 * el.toString(); // '<div id="main" class="container">Hello World</div>'
 * ```
 */
export class TemplateElement {

    // ----------------------------------------------------------------------------------
    // Fields
    
    /**
     * CSS classes for this element. Dynamically managed through the CssClassValue interface.
     * @type {CssClassValue}
     */
    class: CssClassValue;
    
    /**
     * Style attribute value. Can be a string or TemplateValue.
     * @type {TemplateValue}
     */
    style: TemplateValue;


    // ----------------------------------------------------------------------------------
    // Constructor
    
    /**
     * Creates a new HTML element.
     * 
     * @param {string} tag - The HTML tag name (e.g., 'div', 'span', 'h1')
     * @param {TemplateItem[]} [children] - Optional initial child elements
     */
    constructor( public tag: string,
                 public children?: TemplateItem[] ) {
        this.class = new CssClassValue();
    }


    // ----------------------------------------------------------------------------------
    // Methods
    
    /**
     * Fluent method that sets a single attribute on this element.
     * Special handling: the 'class' attribute updates the class object directly.
     * 
     * @param {string} name - Attribute name
     * @param {TemplateAttributeValue} value - Attribute value
     * @returns {TemplateElement} This element for method chaining
     * 
     * @example
     * el.attr('id', 'main')
     *   .attr('data-value', 123)
     *   .attr('class', 'active selected');
     */
    attr( name: string, value: TemplateAttributeValue ): TemplateElement {
        if ( name === "class" ) {
            this.class = cssClass( value as any );
            
        } else {
            this[name] = value;
        }

        return this as TemplateElement;
    }


    /**
     * Fluent method that sets all attributes from the given collection.
     * 
     * @param {TemplateAttributes} attrs - Key-value collection of attributes to set
     * @returns {TemplateElement} This element for method chaining
     * 
     * @example
     * el.attrs({
     *     id: 'main',
     *     class: 'container active',
     *     'data-value': 42
     * });
     */
    attrs( attrs: TemplateAttributes ): TemplateElement {
        if ( attrs == null ) {
            return this;
        }

        each( attrs, ( value, name ) => {
            this.attr( name, value );
        } );

        return this as TemplateElement;
    }


    /**
     * Fluent method that appends a child element or text to this element.
     * If a string containing HTML is passed, it will be parsed into elements.
     * 
     * @param {TemplateItem} item - The child element or text to append
     * @returns {TemplateElement} This element for method chaining
     * 
     * @example
     * const el = tag('div');
     * el.appendChild('Hello')
     *   .appendChild(tag('br'))
     *   .appendChild('World');
     *   
     * // Parse HTML string
     * el.appendChild('<p>Parsed HTML</p>');
     */
    appendChild( item: TemplateItem ): TemplateElement {
        if ( this.children == null ) {
            this.children = [];
        }

        if ( isString( item ) ) {
            if ( item.indexOf( "<" ) >= 0 ) {
                const newChildren = parseHtml( item );
                this.children.push( ...newChildren );
            } else {
                this.children.push( item );
            }
        } else {
            this.children.push( item );
        }

        return this as TemplateElement;
    }
}
