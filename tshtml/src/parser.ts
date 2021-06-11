import { isArray, isString } from "lodash";
import { Parser, ParserOptions, Tokenizer } from "htmlparser2";
import { TemplateAttributeValue, TemplateElement, TemplateItem } from "./element";
import { isTag } from "./tag";
import { isTemplateValue } from "./templateValue";
import { EmptyAttribute } from "./tagToString";


const placeholderName = ( i ) => `##PLACEHOLDER-${i}##`;
const placeholderRegex = /##PLACEHOLDER-(\d+)##/g;


class TokenizerExt extends Tokenizer {

    constructor(
        options: {
            xmlMode?: boolean;
            decodeEntities?: boolean;
            checkClosingTag: ( name: string ) => void; 
        },
        cbs: /*Callbacks*/ any
    ) {
        super( options, {
            onattribdata: cbs.onattribdata.bind( cbs ),
            onattribend: cbs.onattribend.bind( cbs ),
            onattribname: cbs.onattribname.bind( cbs ),
            oncdata: cbs.oncdata.bind( cbs ),
            // onclosetag: cbs.onclosetag.bind( cbs ),
            oncomment: cbs.oncomment.bind( cbs ),
            ondeclaration: cbs.ondeclaration.bind( cbs ),
            onend: cbs.onend.bind( cbs ),
            onerror: cbs.onerror.bind( cbs ),
            onopentagend: cbs.onopentagend.bind( cbs ),
            onopentagname: cbs.onopentagname.bind( cbs ),
            onprocessinginstruction: cbs.onprocessinginstruction.bind( cbs ),
            onselfclosingtag: cbs.onselfclosingtag.bind( cbs ),
            ontext: cbs.ontext.bind( cbs ),

            onclosetag: ( name: string ) => {
                options.checkClosingTag( name );
                cbs.onclosetag( name );
            }
        } );
    }
}


class HtmlParser {

    public elementsStack: TemplateElement[];
    private isParsingOpeningTag = false;
    private placeholdersLookup: _.Dictionary<any> = {};
    private parser: Parser;

    
    constructor() {
        this.parser = new Parser(
            {
                onreset: () => {
                    //console.log( "reset" );
                    this.elementsStack = [new TemplateElement( "#root" )];
                    this.isParsingOpeningTag = false;
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

                onclosetag: ( text: string ) => {
                    // console.log( "closetag", text );
                    const element = this.elementsStack.shift();
                    // if ( element.tag !== text ) {
                    //     throw new Error( `Closing tag </${text}> doesn't match opening tag <${element.tag}>.` );
                    // }
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
                Tokenizer: TokenizerExt,
                checkClosingTag: this.checkClosingTag.bind( this ),
            } as ParserOptions
        );
        
        this.parser.reset();
    }
    
    
    parseComplete( html: string ): TemplateElement[] {
        this.parser.parseComplete( html );
        
        if ( this.isParsingOpeningTag ) {
            throw Error( "Malformed document" );
        }
        
        return this.elementsStack[0].children as TemplateElement[]
    }


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


    private checkClosingTag( name: string ) {
        const element = this.elementsStack[0];
        if ( element.tag !== name ) {
            throw new Error( `Closing tag </${name}> doesn't match opening tag <${element.tag}>.` );
        }
    }
    
}


/**
 *
 * @param html
 */
export function parseHtml( html: string ): TemplateElement[] {
    return new HtmlParser().parseComplete( html );
}


/**
 *
 * @param literals
 * @param placeholders
 */
export function html( literals: TemplateStringsArray, ...placeholders: any[] ): TemplateItem[] {
    return new HtmlParser().parseStringLiteral( literals, ...placeholders );
}


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



