class Constraint_Scope {

	public static _anonymousId: number = 0;

	public    parent: Constraint_Scope;
	protected root: Constraint_Scope;

	protected _name: string = null;

	protected type: string = null;
	protected properties: IProperty[] = [];

	protected children: Constraint_Scope[] = [];
	protected constants: IProperty[] = [];
	protected objectPath: string[] = [];

	public    global: any = null;

	protected arrayStack: string[] = [];
	protected strict: boolean = false;
	protected anonObjStack: any[] = [];
	protected anonObjProps: string[] = [];

	protected _awaits = {
		"resource": []
	};

	private   _isAnonymous: boolean;

	constructor( parentScope: Constraint_Scope = null, name: string = '', type: string = '', strict: boolean = false ) {
		
		this._isAnonymous = parentScope !== null && name == null
			? true
			: false;

		if ( strict && type != 'document' && !Constraint.classRegistered( type ) ) {
			throw new Error( 'STRICT: Unknown class type "' + type + '" is not declared' );
		}

		if ( this._isAnonymous && strict && type == 'UI_Form' ) {
			throw new Error( 'STRICT: Type "UI_Form" cannot be introduced as anonymous (without using a name)' );
		}

		if ( this._isAnonymous ) {
			// generate a temporary name for the scope
			name = String('__ANON__' + String( Constraint_Scope._anonymousId++ ) );
		}

		if ( parentScope !== null && this._isAnonymous == false && parentScope.isAnonymous ) {
			throw new Error( "A named scope cannot be placed inside a non-anonymous scope. You attempted to insert " + JSON.stringify( name ) + " inside an anonymous scope!" );
		}

		this.strict = strict;
		this.parent = parentScope;

		this.root = parentScope === null
			? this
			: parentScope.root;

		if ( !parentScope ) {
			this.global = {};
		} else {

			if ( strict && type == 'UI_Form') {

				// Don't allow @UI_Form > ... > @UI_Form scopes nesting
				if ( this.isNestedInsideScopeType( 'UI_Form', true ) ) {
					throw new Error( 'STRICT: Type UI_Form cannot be nested inside type UI_Form' );
				}
			}

			if ( strict && type == 'UI_Resource' ) {

				// Dont allow resources to be placed inside forms or other resources
				if ( this.isNestedInsideScopeType( 'UI_Form', true ) ) {
					throw new Error( 'STRICT: Type UI_Resource cannot be nested inside type UI_Form' );
				}

				if ( this.isNestedInsideScopeType( 'UI_Resource', true ) ) {
					throw new Error( 'STRICT: Type UI_Resource cannot be nested inside type UI_Resource' );
				}

				if ( this._isAnonymous ) {
					throw new Error( 'STRICT: Type UI_Resource cannot be declared as anonymous' );
				}
			}

		}

		this._name = name;
		this.type = type;
	}

	get isAnonymous(): boolean {
		return this._isAnonymous; 
	}

	get name(): string {
		return this.parent === null
			? this._name
			: ( this.parent.name ? ( this.parent._name + '.' + this._name ) : this._name );
	}

	get ownName(): string {
		return this._isAnonymous ? null : this._name;
	}

	get parentOwnName(): string {
		return this.parent === null
			? null
			: this.parent.ownName;
	}

	public awaits( awaitType: string, awaitValue: string ) {
		
		if ( this.strict && this.type != 'UI_Form' ) {
			throw new Error( 'STRICT: $awaits clause can be used only inside a UI_Form scope type.' );
		}

		switch ( awaitType ) {
			case 'resource':
				if ( this._awaits.resource.indexOf( awaitValue ) == -1 ) {
					this._awaits.resource.push( awaitValue );
				}
				break;
			default:
				throw new Error('Unknown await type: ' + JSON.stringify( awaitType ) );
				break;
		}
	}

	public pushObjectKey( key: string ) {
		this.objectPath.push( key );
	}

	public popObjectKey() {
		if ( this.objectPath.length == 0 ) {
			throw Error("Cannot pop object path" );
		} else {
			this.objectPath.pop();
		}
	}

	public assign( keyName: string, value: ITokenResult ) {

		var k: string = this.objectPath.length
			? this.objectPath.join( '.' ) + '.' + keyName
			: keyName;

		for ( var i=0, len = this.properties.length; i<len; i++ ) {
			if ( this.properties[i].name == k ) {
				throw Error( 'Duplicate identifier "' + k + '" in scope ' + this.name );
			}
		}

		this.properties.push({
			"name": k,
			"value": Constraint_Type.create( value, this, this.getPropertyType( k ), this.strict )
		});
	}

	public addResource( value: ITokenResult ) {
		if ( this.type != 'UI_Resource' ) {
			throw new Error( 'resource files can be used only inside "UI_Resource" type. Current scope type is ' + JSON.stringify( this.type ) );
		}

		var matches: string[] = Constraint.tokens.tok_resource.regex.exec( value.result );

		if ( !matches )
			throw new Error('Failed to parse resource type! This IS A BUG!' );

		var propName: string = matches[1];

		if ( !propName )
			throw new Error( 'Resource name could not be parsed!' );

		var propSrc: string = matches[5].replace( /''/g, "'" );

		if ( !propSrc )
			throw new Error( 'Resource file could not be parsed!' );

		var propVersions: string = String( matches[6] || '' ).replace(/(^[\s]+|[\s]+$)/g, '' ).replace( /[\s]+/g, ' ' );

		var isDisabled = matches[11] == 'disabled';

		// Add resource.
		for ( var i=0, len = this.properties.length; i < len; i ++ ) {
			if ( this.properties[i].name == propName ) {
				throw new Error( 'Duplicate resource file: "' + this.properties[i].name + '"' );
			}
		}

		this.properties.push({
			"name": propName,
			"value": Constraint_Type.createResourceDef({
				"file": propSrc,
				"versions": propVersions ? propVersions.split(' ') : [],
				"disabled": isDisabled
			})		
		});

	}

	public arrayStart( keyName: string ) {

		var k: string = this.objectPath.length
			? this.objectPath.join('.') + '.' + keyName
			: keyName;

		for ( var i=0, len = this.properties.length; i<len; i++ ) {
			if ( this.properties[i].name == k ) {
				throw Error( 'Duplicate identifier "' + k + '" in scope "' + this.name + '"' );
			}
		}

		this.properties.push({
			"name": k,
			"value": []
		});

		this.arrayStack.push( k );
	}

	public arrayPush( value: ITokenResult ) {
		if ( this.arrayStack.length == 0 ) {
			throw Error( 'Failed to push value in array stack: Stack is empty!' );
		}

		var keyName = this.arrayStack[ this.arrayStack.length - 1 ];

		for ( var i=0, len = this.properties.length; i<len; i++ ) {
			if ( this.properties[i].name == keyName ) {
				this.properties[i].value.push( Constraint_Type.create( value, this, this.getPropertyType( keyName ), this.strict ) );
			}
		}
	}

	public arrayPushLiteral( value: any ) {
		if ( this.arrayStack.length == 0 ) {
			throw Error( 'Failed to push value in array stack: Stack is empty!' );
		}

		var keyName = this.arrayStack[ this.arrayStack.length - 1 ];

		for ( var i=0, len = this.properties.length; i<len; i++ ) {
			if ( this.properties[i].name == keyName ) {
				this.properties[i].value.push( value );
			}
		}
	}

	public arrayEnd() {
		if ( this.arrayStack.length == 0 ) {
			throw Error('Failed to end current array: Array stack is empty!' );
		}
		this.arrayStack.pop();
	}

	public pushScope( type: string, name: string ) {

		name = name || null;

		if ( name !== null && this.UIElementExists( name ) ) {
			throw Error( 'UI Element "' + name + '" cannot be declared twice!' );
		}

		if ( this.strict && !Constraint.classAcceptsChild( this.type, type ) ) {
			throw new Error( 'STRICT: You cannot place a "' + type + '" inside a "' + this.type + '"!' );
		}

		var result = new Constraint_Scope( this, name, type, this.strict );
		this.children.push( result );

		this.root.global[ name ] = result;

		return result;
	}

	public popScope(): Constraint_Scope {
		if ( this.parent ) {
			return this.parent;
		} else {
			throw Error("Scope request outside bounds in scope \"" + this.name + "\"" );
		}
	}

	public pushAnonymousProp( propertyName: string ) {
		this.anonObjProps.push( propertyName );
	}

	protected popAnonymousProp() {
		if ( this.anonObjProps.length ) {
			
			var propName: string = this.anonObjProps[ this.anonObjProps.length - 1 ];
			this.anonObjProps.splice( this.anonObjProps.length - 1, 1 );
			this.anonObjStack[ this.anonObjStack.length - 2 ][ propName ] = this.anonObjStack[ this.anonObjStack.length - 1 ];

		}
	}

	public pushAnonymousPrimitive( value: ITokenResult ) {
		if ( !this.anonObjProps.length )
			throw new Error( 'Anonymous object props length EQ 0!' );

		if ( !this.anonObjStack.length )
			throw new Error( 'Anonymous object stack length EQ 0!' );

		var propertyName: string = this.anonObjProps.pop(),
		    propertyValue: any = Constraint_Type.create( value, this );

		this.anonObjStack[ this.anonObjStack.length - 1 ][ propertyName ] = propertyValue;

		//throw new Error( 'Push Primitive: ' + JSON.stringify( value, undefined, 4 ) + "\nPROPS: " + JSON.stringify( this.anonObjProps, undefined, 4 ) + "\nSTACK" + JSON.stringify( this.anonObjStack, undefined, 4 ) );
		
	}

	public pushAnonymousObject( propertyName: string = null ) {
		this.anonObjStack.push({});
	}

	public popAnonymousObject(): any {
		if ( this.anonObjStack.length == 0 ) {
			throw new Error( 'Nothing in stack' );
		} else {

			if ( this.anonObjProps.length > 1 ) {
				this.popAnonymousProp();
			}

			var result: any = this.anonObjStack[ this.anonObjStack.length - 1 ];
			this.anonObjStack.splice( this.anonObjStack.length - 1, 1);
			return this.anonObjStack.length ? null : result;
		}
	}

	public declare( constant: string, substitute: ITokenResult ) {
		for ( var i=0, len = this.constants.length; i<len; i++ ) {
			if ( this.constants[i].name == constant ) {
				throw Error( 'Duplicate declaration of constant: ' + constant );
			}
		}
		
		this.constants.push( {
			"name": constant,
			"value": ( function( v, scope ) {
				if ( substitute.type == 'type_subst' ) {
					// alias declaration of another constant?
					if ( scope.isset( substitute.result ) ) {
						return scope.getConstantValue( substitute.result );
					} else {
						throw Error( 'Failed to declare alias const "' + constant + ": The constant is not declared at this point." );
					}
				} else {
					return Constraint_Type.create( v, scope, 'constant', this.strict );
				}
			} )( substitute, this )
		} );
	}

	/* Check if a property or constant is defined in scope.
	   if @type is "constant", checking is done also recursive inside the parent scopes.
	 */
	public isset( propertyName: string, type = 'property' ): boolean {

		if ( type == 'property' ) {

			for ( var i=0, len = this.properties.length; i<len; i++ ) {
				if ( this.properties[i].name == propertyName ) {
					return true;
				}
			}

		} else
		if ( type == 'constant' ) {

			for ( var i=0, len = this.constants.length; i<len; i++ ) {
				if ( this.constants[i].name == propertyName ) {
					return true;
				}
			}

		} else {
			throw Error( 'The second argument of isset should be "property" or "constant".' );
		}

		if ( this.parent === null ) {
			return false;
		} else {

			// only pa
			if ( type == 'constant' ) {
				
				return this.parent.isset( propertyName, 'constant' );
			
			} else {

				return false;
			
			}
		}
	}

	/* Returns the name of the constant with name @constName.
	   Searches recursive in the parents.
	   If a constant is not defined, returns null.
	 */
	public getConstantValue( constName: string ): any {
		for ( var i=0, len = this.constants.length; i<len; i++ ) {
			if ( this.constants[i].name == constName ) {
				return this.constants[i].value;
			}
		}

		if ( this.parent !== null ) {
			return this.parent.getConstantValue( constName );
		} else {
			return null;
		}
	}

	// represents this scope together with it's child scopes to a
	// more friendly JSON representation
	public toJSON(): any {
		var result = {
			"name": this._name,
			"type": this.type
		};
		
		if ( this.properties.length ) {

			result['properties'] = {};

			for ( var i=0, len = this.properties.length; i<len; i++ ) {
				result['properties'][ this.properties[i].name ] = this.properties[i].value;
			}

		}

		if ( this.children.length ) {
			
			result[ 'children' ] = [];
			
			for ( var i=0, len = this.children.length; i<len; i++ ) {
				result['children'].push( this.children[i].toJSON() );
			}
		}

		if ( !this.parent ) {
			return result[ 'children' ] || [];
		}

		return result;
	}

	// check if a scope exists or not.
	public UIElementExists( scopeName: string ): boolean {
		
		if ( scopeName === '$parent' || scopeName === null ) {
			return this.parent !== null;
		} else {
			return typeof this.root.global[ scopeName ] != 'undefined'
				? true
				: false;
		}

	}

	// checks if a scopeName is this one, or if scopeName is a direct
	// child of this one.
	public UINestingOk( scopeName: string ): boolean {
		if ( scopeName == '$parent' || scopeName === null ) {
			return this.parent !== null;
		} else {
			if ( this.parent ) {
				for ( var i=0, len = this.parent.children.length; i<len; i++ ) {
					if ( this.parent.children[i]._name == scopeName ) {
						return true;
					}
				}
				return false;
			} else {
				return false;
			}
		}
	}

	public getPropertyType( propertyName: string ): string {
		return Constraint.getClassPropertyType( this.type, propertyName );
	}

	public isNestedInsideScopeType( typeName: string, recursive: boolean = false ) {
		if ( !this.parent ) {
			return false;
		} else {
			if ( recursive ) {
				return this.parent.type == typeName || this.parent.isNestedInsideScopeType( typeName, true );
			} else {
				return this.parent.type == typeName;
			}
		}
	}

	// returns the value of a property from this scope.
	public $property( propertyName: string ): any {
		for ( var i=0, len = this.properties.length; i<len; i++ ) {
			if ( this.properties[i].name == propertyName ) {
				return this.properties[i].value;
			}
		}
		return null;
	}

	// returns the name of the scope without it's dotted notation.
	get $name(): string {
		return this._name;
	}

	// returns the type name of the scope
	get $type(): string {
		return this.type;
	}

	get $anonymous(): boolean {
		return this._isAnonymous;
	}

	get $parentName(): string {
		if ( this.parent ) {
			return this.parent.$name;
		} else {
			return '';
		}
	}

	get $awaits(): any {
		var out: any = {},
		    anything: boolean = false;

		if ( this._awaits.resource.length ) {
			out['resource'] = this._awaits.resource;
			anything = true;
		}

		return anything ? out : null;
	}

	/* THIS IS USED BY THE CONSTRAINT COMPILER, AND SHOULD NOT BE USED ELSEWHERE */
	public $anonymousStub( rootName: string, indentation: number ): string {


		var includeStart: string = '';
		var includeEnd  : string = '';
		var indent: string = '';
		var i: number = 0, len: number;

		for ( i=0; i<indentation; i++ ) {
			indent += ' ';
		}

		if ( !this.properties.length && !this.children.length ) {
			return indent + 'new ' + this.type + '(' + rootName + ');';
		}

		includeStart = indent + '(function( _root_ ) { ';
		includeEnd   = indent + '} )( ' + rootName + ' );';

		var out: string[] = [
			indent + '// ' + this._name,
			includeStart
		];

		out.push( indent + '    var self = new ' + this.$type + '( _root_ );' );

		for ( i=0, len = this.properties.length; i<len; i++ ) {
			out.push( indent + '    self.' + this.properties[i].name + ' = '
				+ ( this.properties[i].value && this.properties[i].value.toLiteral
					? this.properties[i].value.toLiteral()
					: JSON.stringify( this.properties[i].value )
				  )
				+ ';' 
			);
		}

		for ( i=0, len = this.children.length; i<len; i++ ) {
			out.push( '' );
			out.push( this.children[i].$anonymousStub( 'self', indentation + 4 ) );
		}

		out.push( includeEnd );
		out.push( indent );

		return out.join( '\n' );
	}

	// returns all the sub-scopes from this scope.
	get $scopes(): Constraint_Scope[] {
		var out: Constraint_Scope[] = [],
		    sub: Constraint_Scope[] = [];
		for ( var i=0, len = this.children.length; i<len; i++ ) {
			out.push( this.children[i] );
			sub = this.children[i].$scopes;
			for ( var j=0, n = sub.length; j<n; j++ ) {
				out.push( sub[j] );
			}
		}

		return out;
	}

	get $childScopes(): Constraint_Scope[] {
		var out: Constraint_Scope[] = [];
		for ( var i=0, len = this.children.length; i<len; i++ ) {
			out.push( this.children[i] );
		}
		return out;
	}

	get $properties(): IProperty[] {
		var out = [];
		for ( var i=0, len = this.properties.length; i<len; i++ ) {
			if ( this.properties[i].value && this.properties[i].value.toLiteral ) {
				out.push( {
					"name": this.properties[i].name,
					"value": this.properties[i].value.toLiteral(),
					"literal": true
				});
			} else {
				out.push( {
					"name": this.properties[i].name,
					"value": this.properties[i].value,
					"valueJSON": JSON.stringify( this.properties[i].value )
				} );
			}
		}
		return out;
	}

}