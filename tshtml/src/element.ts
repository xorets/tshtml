import {
    each,
    isString
} from "lodash";
import { parseHtml } from "./parser";
import { TemplateValue } from "./templateValue";
import { cssClass, CssClassValue } from "./cssClass";


/**
 * Attributes of an HTML element representation.
 */
export interface TemplateAttributes {
    [name: string]: TemplateAttributeValue;
    tag?: never;
    children?: never;
}

export type TemplateAttributeValue = string | number | boolean | symbol | TemplateValue;


/**
 * TemplateItem is either a "tag" object or plain string that represents text node.
 */
export type TemplateItem = TemplateElement | TemplateValue | string;


/**
 * TemplateFragment cold be either a template item (element or string) or array of such items.
 */
export type TemplateFragment = TemplateItem | TemplateItem[];


/**
 * Helper class for working with HTML element representation. Allows for modifying attributes of the element
 * after creation.
 */
export class TemplateElement {

    // ----------------------------------------------------------------------------------
    // Fields
    class: CssClassValue;
    style: TemplateValue;


    // ----------------------------------------------------------------------------------
    //
    constructor( public tag: string,
                 public children?: TemplateItem[] ) {
        this.class = new CssClassValue();
    }


    /**
     * Fluent method that adds attribute to this element.
     * @param name Attribute name
     * @param value Attribute value
     */
    attr( name: string, value: TemplateAttributeValue ) {
        if ( name === "class" ) {
            this.class = cssClass( value as any );
            
        } else {
            this[name] = value;
        }

        return this as TemplateElement;
    }


    /**
     * Fluent method that adds all attributes from given collection to this element.
     * @param attrs Name-value collection of attributes.
     */
    attrs( attrs: TemplateAttributes ) {
        if ( attrs == null ) {
            return this;
        }

        each( attrs, ( value, name ) => {
            this.attr( name, value );
        } );

        return this as TemplateElement;
    }


    /**
     * Fluent method that appends given fragment to the parent element.
     * @param item The element to add.
     */
    appendChild( item: TemplateItem ) {
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


    /**
     * Gets the classes array.
     * If necessary, converts attrs.class into the array by splitting
     * string by spaces.
     */
/*
    getClasses() {
        const attrsCls = this.class;
        if ( isArray( attrsCls ) ) {
            return attrsCls;
        }

        this.class = filter(
            isString( attrsCls ) ? attrsCls.split( " " ) : [],
            x => x && !isEmpty( x.trim() ) );

        return this.class as string[];
    }
*/


    /**
     * Adds the class to the "class" array.
     * @param cls Class to add.
     */
    /*addClass( cls: string ) {
        const classes = this.getClasses();

        if ( !includes( classes, cls ) ) {
            classes.push( cls );
        }

        return this as TemplateElement;
    }*/
}
