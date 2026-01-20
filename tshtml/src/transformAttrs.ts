import {
    Dictionary,
    each,
    isString,
    mapValues,
    reduce
} from "lodash";

/**
 * Mapping configuration for transforming an attribute.
 * Allows renaming, providing default values, and applying custom transformation functions.
 * 
 * @class TransformArgumentMapping
 * @property {string} [to] - The new attribute name (if different from original)
 * @property {*} [default] - Default value if attribute is not provided
 * @property {Function} [transform] - Function to transform attribute value
 * 
 * @example
 * {
 *     to: 'ng-if',
 *     default: false,
 *     transform: (val) => !!val
 * }
 */
export class TransformArgumentMapping {
    /**
     * The output attribute name. If not specified, the original name is used.
     * @type {string}
     */
    to?: string;
    
    /**
     * Default value to use if the attribute is not provided.
     * @type {*}
     */
    default?: any;
    
    /**
     * Optional transformation function to apply to the attribute value.
     * Applied to both input values and default values.
     * @type {Function}
     */
    transform?: ( arg: any ) => any;
}


/**
 * Transforms an attributes object by renaming attributes, providing defaults, and applying transformations.
 * 
 * This is useful for normalizing attributes across different template syntaxes or frameworks
 * (e.g., converting Angular `ngIf` to `ng-if`, providing default values, etc.).
 * 
 * @param {Dictionary<any>} args - Original attributes object
 * @param {Dictionary<string | TransformArgumentMapping>} [mapping] - Mapping configuration
 * @returns {Dictionary<any>} Transformed attributes object
 * 
 * @example
 * ```typescript
 * import { transformAttrs } from 'tshtml';
 * 
 * const input = {
 *     href: '/page',
 *     ngIf: 'isVisible'
 * };
 * 
 * const output = transformAttrs(input, {
 *     ngIf: 'ng-if',  // Rename
 *     ngShow: { 
 *         to: 'ng-show', 
 *         default: false  // Provide default
 *     }
 * });
 * 
 * // Result:
 * // {
 * //     href: '/page',
 * //     'ng-if': 'isVisible',
 * //     'ng-show': false
 * // }
 * ```
 */
export function transformAttrs( args: Dictionary<any>,
                                mapping?: Dictionary<string | TransformArgumentMapping> ): Dictionary<any> {

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
