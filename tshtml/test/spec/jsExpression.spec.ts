import { expr } from "../../src";


describe( "jsExpression", () => {

    describe( "primitives", () => {

        it( "null", () => {
            const a = expr( null );
            expect( a.render( true ) ).toEqual( "null" );
        } );


        it( "undefined", () => {
            const a = expr( undefined );
            expect( a.render( true ) ).toEqual( "undefined" );
        } );


        it( "string expression", () => {
            const a = expr( `fieldA` );
            expect( a.render( true ) ).toEqual( `fieldA` );
        } );

        
        it( "number", () => {
            const a = expr( 42 );
            expect( a.render( true ) ).toEqual( `42` );
        } );

        
        it( "boolean", () => {
            const a = expr( true );
            expect( a.render( true ) ).toEqual( `true` );
        } );

        
    } );

    it( "should emit simple JSON as-is", () => {
        const a = expr( { a: 7, b: "test" } );
        expect( a.render( true ) ).toEqual( "{ 'a': 7, 'b': 'test' }" );
    } );


    it( "should emit expression field value without quotes", () => {
        const a = expr( { a: 7, b: expr( "test" ) } );
        expect( a.render( true ) ).toEqual( "{ 'a': 7, 'b': test }" );
    } );


    it( "should support arrays", () => {
        const a = expr( [1, "test", expr( "fieldA")] );
        expect( a.render( true ) ).toEqual( "[1, 'test', fieldA]" );
    } );


    it( "nested structures", () => {
        const a = expr( { 
            tags: [1, "test", expr( "fieldA")], 
            data: { value: expr( "fieldB" ), public: true } } );
        expect( a.render( true ) ).toEqual( "{ 'tags': [1, 'test', fieldA], 'data': { 'value': fieldB, 'public': true } }" );
    } );


    it( "method should accept typed object", () => {
        interface A { a: B[]; }
        interface B { c: string; }

        const val: A = { a: [{ c: "a" }, { c: "b" }] };
        const a = expr( val );

        expect( a.render( true ) ).toEqual( "{ 'a': [{ 'c': 'a' }, { 'c': 'b' }] }" );

        const gridDefinition = {
            size: 12,
            rows: [
                { size: 8, id: "main" },
                {
                    size: 4, columns: [
                        { size: 6, id: "left" },
                        { size: 6, id: "right" }
                    ]
                }
            ]
        };
        expr( gridDefinition );
    } );


} );