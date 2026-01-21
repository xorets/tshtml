import { isArray, isString } from "lodash";
import { Parser, ParserOptions } from "htmlparser2";
import { TemplateAttributeValue, TemplateElement, TemplateItem } from "./element";
import { isTag } from "./tag";
import { isTemplateValue } from "./templateValue";
import { EmptyAttribute } from "./tagToString";


const placeholderName = ( i: number ) => `##PLACEHOLDER-${i}##`;
const placeholderRegex = /##PLACEHOLDER-(\d+)##/g;


/**
 * Stateful HTML parser that can convert raw HTML or template literals with placeholders
 * into TemplateElement trees. Handles placeholder substitution inside tag bodies and text.
 */
class HtmlParser {

    public elementsStack: TemplateElement[];
    private isParsingOpeningTag = false;
    private placeholdersLookup: _.Dictionary<any> = {};
    private parser: Parser;
    private tagStack: string[] = []; // Track open tags for validation

    
    constructor() {
        this.parser = new Parser(
            {
                onreset: () => {
                    //console.log( "reset" );
                    this.elementsStack = [new TemplateElement( "#root" )];
                    this.isParsingOpeningTag = false;
                    this.tagStack = [];
                },

                onend: () => {
                    //console.log( "end" );
                },

                onerror: ( error: Error ) => {
                    //console.log( "error", error );
                    throw error;
                },

                onopentagname: ( name: string ) => {
                    // console.log( "opentagname", name );

                    this.isParsingOpeningTag = true;
                    const element = new TemplateElement( name );
                    this.elementsStack[0].appendChild( element );
                    this.elementsStack.unshift( element );
                    this.tagStack.unshift( name );
                },

                onattribute: ( name, value, quote ) => {
                    // console.log( "attribute", { name, value, quote } );

                    if ( name.match( placeholderRegex ) != null ) {
                        throw new Error( "Probably wrong object was used in the template string substitution at starting tag." );
                    }

                    let attrValue: TemplateAttributeValue = value;
                    
                    if ( value != null ) {
                        if ( value === "" && quote === undefined ) {
                            attrValue = EmptyAttribute;
                            
                        } else {
                            const matches = value.match( placeholderRegex );
                            if ( matches != null ) {
                                if ( matches.length === 1 && value === matches[0] ) {
                                    // Single placeholder case
                                    attrValue = this.placeholdersLookup[value];

                                } else {
                                    // Multiple placeholder cases
                                    attrValue = value.replace( placeholderRegex, key => {
                                        const placeholder = this.placeholdersLookup[key];
                                        if ( isTemplateValue( placeholder ) ) {
                                            return placeholder.render( true );
                                        }
                                        return placeholder;
                                    } );
                                }
                            }
                        }
                    } 

                    this.elementsStack[0].attr( name, attrValue );
                },

                onopentag: ( name: string, attrs: { [type: string]: string } ) => {
                    this.isParsingOpeningTag = false;
                },

                onclosetag: ( name: string, isImplied: boolean ) => {
                    // console.log( "closetag", name, "current element:", this.elementsStack[0]?.tag );
                    // Check if the closing tag matches the currently open tag
                    if ( this.tagStack.length > 0 ) {
                        const currentTag = this.tagStack[0];
                        if ( currentTag !== name ) {
                            throw new Error( `Closing tag </${name}> doesn't match opening tag <${currentTag}>.` );
                        }
                        this.tagStack.shift();
                    }
                    this.elementsStack.shift();
                },

                ontext: ( text: string ) => {
                    //console.log( "text", text );
                    this.elementsStack[0].appendChild( text );
                },

                /*onprocessinginstruction: ( name: string, data: string ) => {
                    console.log( "processinginstruction", name, data );
                },*/

                /*oncomment: ( data: string ) => {
                    console.log( "comment", data );
                },*/

                /*oncommentend: () => {
                    console.log( "commentend", name );
                },*/

                /*oncdatastart: () => {
                    console.log( "cdatastart", name );
                },*/

                /*oncdataend: () => {
                    console.log( "cdataend", name );
                },*/
            },
            {
                lowerCaseTags: false,
                lowerCaseAttributeNames: false,
                recognizeSelfClosing: true,
                decodeEntities: false,
            } as ParserOptions
        );
        
        this.parser.reset();
    }
    
    
    /**
     * Parse a full HTML string into a list of TemplateElements.
     * @param html Raw HTML markup
     */
    parseComplete( html: string ): TemplateElement[] {
        this.validateAndParseHTML( html );
        
        if ( this.isParsingOpeningTag ) {
            throw Error( "Malformed document" );
        }
        
        return this.elementsStack[0].children as TemplateElement[]
    }

    /**
     * Validate and parse HTML, checking for mismatched closing tags.
     * @param html Raw HTML markup
     */
    private validateAndParseHTML( html: string ): void {
        // Extract all tags from the HTML and validate tag nesting
        // Handles opening, closing, and self-closing tags
        const tagRegex = /(<\/?)([\w\-]+)([^>]*?)(\/?)>/g;
        let tagMatch: string[];
        const tagStack: string[] = [];
        
        while ( (tagMatch = tagRegex.exec( html )) !== null ) {
            const isClosing = tagMatch[1] === '</';
            const tagName = tagMatch[2];
            const isSelfClosing = tagMatch[4] === '/' || tagMatch[3].includes('/');
            
            if ( isClosing ) {
                // This is a closing tag
                if ( tagStack.length === 0 ) {
                    throw new Error( `Closing tag </${tagName}> without matching opening tag.` );
                }
                const lastOpenTag = tagStack[tagStack.length - 1];
                if ( lastOpenTag !== tagName ) {
                    throw new Error( `Closing tag </${tagName}> doesn't match opening tag <${lastOpenTag}>.` );
                }
                tagStack.pop();
            } else if ( isSelfClosing ) {
                // This is a self-closing tag, don't push to stack
                // Do nothing - it closes itself
            } else {
                // This is an opening tag
                tagStack.push( tagName );
            }
        }
        
        // Now parse normally
        this.parser.parseComplete( html );
    }


    /**
     * Parse a tagged template literal `html`...`` capturing placeholders as nodes/values.
     * @param literals Template literal chunks
     * @param placeholders Values interpolated between literal chunks
     */
    parseStringLiteral( literals: TemplateStringsArray, ...placeholders: any[] ): TemplateItem[] {
        for ( let i = 0; i < literals.length - 1; i++ ) {
            this.parser.write( literals[i] );

            const placeholder = placeholders[i];
            if ( this.isParsingOpeningTag ) {
                // If we are currently in-between < and > of an opening tag
                if ( isString( placeholder ) ) {
                    this.parser.write( placeholder );
                } else {
                    const ref = placeholderName( i );
                    this.placeholdersLookup[ref] = placeholder;
                    this.parser.write( ref );
                }

            } else {
                // We are not between < and > in one tag, so placeholders could be actually tags.
                this.appendPlaceholder( placeholder );
            }
        }
        this.parser.write( literals[literals.length - 1] );
        this.parser.end();

        let res = this.elementsStack[0].children;

        // Trim leading and trailing spaces
        if ( res.length > 1 ) {
            let trimLeft = false, trimRight = false;

            const first = res[0];
            if ( isString( first ) && first.match( /^\s+$/ ) ) {
                trimLeft = true;
            }

            const last = res[res.length - 1];
            if ( isString( last ) && last.match( /^\s+$/ ) ) {
                trimRight = true;
            }

            if ( trimLeft || trimRight ) {
                res = res.slice( trimLeft ? 1 : 0, trimRight ? -1 : undefined );
            }
        }

        return res;
    }


    /**
     * Append a placeholder value appropriately as text, element, TemplateValue, or nested array.
     */
    private appendPlaceholder( placeholder: any ) {
        // Skip empty placeholders
        if ( placeholder == null )
            return;

        if ( typeof ( placeholder ) == "string" ) {
            this.parser.write( placeholder );

        } else if ( isTag( placeholder ) ) {
            this.elementsStack[0].appendChild( placeholder );

        } else if ( isTemplateValue( placeholder ) ) {
            this.elementsStack[0].appendChild( placeholder );

        } else if ( isArray( placeholder ) ) {
            for ( let i = 0; i < placeholder.length; i++ ) {
                this.appendPlaceholder( placeholder[i] );
            }
        } else {
            this.parser.write( placeholder.toString() );
        }
    }
    
}


/**
 * Parse raw HTML string into TemplateElement array.
 * @param html Raw HTML markup to parse
 * @returns Parsed elements
 */
export function parseHtml( html: string ): TemplateElement[] {
    return new HtmlParser().parseComplete( html );
}


/**
 * Tagged template helper to parse HTML with embedded placeholders.
 * @param literals Template literal chunks
 * @param placeholders Values inserted between chunks
 * @returns Parsed template items (elements/text)
 */
export function html( literals: TemplateStringsArray, ...placeholders: any[] ): TemplateItem[] {
    return new HtmlParser().parseStringLiteral( literals, ...placeholders );
}


/**
 * Parse a tagged template literal and ensure exactly one HTML element is produced.
 * Throws if multiple elements or non-element nodes are produced.
 * @param literals Template literal chunks
 * @param placeholders Values inserted between chunks
 * @returns Single TemplateElement
 */
export function htmlEl( literals: TemplateStringsArray, ...placeholders: any[] ): TemplateElement {
    const parsed = new HtmlParser().parseStringLiteral( literals, ...placeholders );
    
    if ( parsed.length !== 1 ) {
        throw Error( `htmlEl function can only parse exactly one element` );
    }
    
    const element = parsed[0];
    
    if ( isString( element ) || isTemplateValue( element ) ) {
        throw Error( `htmlEl function can only parse HTML elements` );
    }
    
    return element;
}



