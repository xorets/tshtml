import { EmptyAttribute, transformAttrs } from "../../src";


describe( "transformAttrs", () => {

    it( "can pass attributes w/o transformation", () => {
        const res = transformAttrs( { fieldA: 42, fieldB: "test" } );
        expect( res ).toEqual( { fieldA: 42, fieldB: "test" } );
    } );


    it( "can transform attribute name (short syntax)", () => {
        const res = transformAttrs( { fieldA: 42 }, { fieldA: "field-a" } );
        expect( res ).toEqual( { "field-a": 42 } );
    } );


    it( "can transform attribute name", () => {
        const res = transformAttrs( { fieldA: 42 }, { fieldA: { to: "field-a" } } );
        expect( res ).toEqual( { "field-a": 42 } );
    } );


    it( "has priority of value over default when renaming", () => {
        const res = transformAttrs( { fieldA: 42 }, { fieldA: { to: "field-a", default: "default value" } } );
        expect( res ).toEqual( { "field-a": 42, } );
    } );


    it( "renames only if there is no such attribute", () => {
        const res = transformAttrs( { fieldA: 42, "field-a": "initial" }, {
            fieldA: { to: "field-a", default: "default value" }
        } );
        expect( res ).toEqual( { "field-a": "initial", } );
    } );

    
    // Defaults

    it( "has priority of value over default", () => {
        const res = transformAttrs( { fieldA: 42 }, { fieldA: { default: "default value" } } );
        expect( res ).toEqual( { "fieldA": 42, } );
    } );


    it( "has priority of null value over default", () => {
        const res = transformAttrs( { fieldA: null }, { fieldA: { default: "default value" } } );
        expect( res ).toEqual( { "fieldA": null, } );
    } );


    it( "applies default value if there is no attribute", () => {
        const res = transformAttrs( {}, { fieldA: { default: "default value" } } );
        expect( res ).toEqual( { "fieldA": "default value", } );
    } );


    it( "applies default value if attribute has value of undefined", () => {
        const res = transformAttrs( { fieldA: undefined }, { fieldA: { default: "default value" } } );
        expect( res ).toEqual( { "fieldA": "default value", } );
    } );


    it( "can add attribute with default value if missing", () => {
        const res = transformAttrs( {}, { fieldA: { default: "default value" } } );
        expect( res ).toEqual( { "fieldA": "default value", } );
    } );


    it( "do not override existing attribute with default value", () => {
        const res = transformAttrs( { "field-a": "initial" }, {
            fieldA: { to: "field-a", default: "default value" }
        } );
        expect( res ).toEqual( { "field-a": "initial", } );
    } );


    it( "overrides existing attribute with default value if it is undefined", () => {
        const res = transformAttrs( { "field-a": undefined }, {
            fieldA: { to: "field-a", default: "default value" }
        } );
        expect( res ).toEqual( { "field-a": "default value", } );
    } );


    it( "do not apply default value over EmptyAttribute", () => {
        const res = transformAttrs( { "field-a": EmptyAttribute }, {
            fieldA: { to: "field-a", default: "default value" }
        } );
        expect( res ).toEqual( { "field-a": EmptyAttribute, } );
    } );

    
    // Custom value transformer

    it( "can also apply custom value transformation", () => {
        const res = transformAttrs( { fieldA: 42 }, { fieldA: { to: "field-a", transform: x => x * 2 } } );
        expect( res ).toEqual( { "field-a": 84, } );
    } );


} );