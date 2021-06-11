import {
    Dictionary,
    each,
    isString,
    mapValues,
    reduce
} from "lodash";

/**
 * Transform arguments object into another arguments object renaming arguments
 * along the way (optionally) and applying transformations (optionally).
 * If an arguments is not specified in the mapping object, then it is  copied as-is.
 * Example call:
 * ```typescript
 * this.transform(
 *     {
 *         "href": "/uhus.html",
 *         "ngIf": "ctl.isNew"
 *     },
 *     {
 *         ngIf: "ng-if",
 *         ngShow: { to: "ng-show", default: false }
 *     } ) );
 * ```
 * Here we have argument _href_ passed as-is, _ngIf_ gets converted to _ng-if_,
 * and _ng-show_ is added because it has default value specified.
 *
 * Optional _transform_ parameter allows for transform argument value during
 * mapping. Default values gets transformed too.
 *
 * @param args Original arguments object
 * @param mapping Mapping configuration
 */
export function transformAttrs( args: Dictionary<any>,
                                mapping?: Dictionary<string | TransformArgumentMapping> ) {

    if ( mapping == null ) return args;

    // Normalize mapping
    const defaults = {} as Dictionary<any>;
    const mappingNorm = mapValues( mapping,
        ( value, name ) => {
            let result: TransformArgumentMapping;
            if ( isString( value ) ) {
                result = { to: value };
            } else {
                result = {
                    to: value.to !== undefined ? value.to : name,
                    default: value.default,
                    transform: value.transform
                };

                // Gather all known default values
                if ( result.default !== undefined ) {
                    defaults[result.to] = result.transform == null
                        ? result.default
                        : result.transform( result.default );
                }
            }
            return result;
        } );

    // Copy incoming attributes, converting along the way
    const result = reduce( args,
        ( res, value, name ) => {
            const m = mappingNorm[name];
            if ( m != null ) {
                name = m.to;
                value = m.transform == null
                    ? value
                    : m.transform( value );
                res[m.to] = value;
            }

            res[name] = value;

            if ( value !== undefined ) delete defaults[name];

            return res;
        },
        {} );

    // Add all remaining defaults
    each( defaults, ( value, name ) => {
        if ( value !== undefined ) {
            result[name] = value;
        }
    } );

    return result;
}


export class TransformArgumentMapping {
    to?: string;
    default?: any;
    transform?: ( any ) => any;
}
