export interface TemplateValue {
    render( isAttributeValue: boolean ): string;
}


export function isTemplateValue( obj ): obj is TemplateValue {
    return obj != null && obj.render != null && typeof ( obj.render ) === "function";
}
