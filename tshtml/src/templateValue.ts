/**
 * Interface for objects that can render themselves as HTML strings.
 * Used for dynamic values like CSS classes, JavaScript expressions, and custom template values.
 * 
 * @interface TemplateValue
 */
export interface TemplateValue {
    /**
     * Renders this value as an HTML string.
     * 
     * @param {boolean} isAttributeValue - Whether this value is being rendered as an HTML attribute value.
     *                                     This affects how the value should be escaped and formatted.
     * @returns {string} The rendered HTML string representation of this value
     */
    render( isAttributeValue: boolean ): string;
}


/**
 * Type guard to check if an object implements the TemplateValue interface.
 * 
 * @param {any} obj - The object to check
 * @returns {boolean} True if the object has a render method that is a function
 * 
 * @example
 * ```typescript
 * if (isTemplateValue(obj)) {
 *     const html = obj.render(true);
 * }
 * ```
 */
export function isTemplateValue( obj: any ): obj is TemplateValue {
    return obj != null && obj.render != null && typeof ( obj.render ) === "function";
}
