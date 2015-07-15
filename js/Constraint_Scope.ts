class Constraint_Scope {

	protected parent: Constraint_Scope;
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

	constructor( parentScope: Constraint_Scope = null, name: string = '', type: string = '', strict: boolean = false ) {
		
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
					throw Error( 'STRICT: Type UI_Form cannot be nested inside type UI_Form' );
				}
			}

		}

		this._name = name;
		this.type = type;
	}

	get name(): string {
		return this.parent === null
			? this._name
			: ( this.parent.name ? ( this.parent._name + '.' + this._name ) : this._name );
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

	public arrayEnd() {
		if ( this.arrayStack.length == 0 ) {
			throw Error('Failed to end current array: Array stack is empty!' );
		}
		this.arrayStack.pop();
	}

	public pushScope( type: string, name: string ) {

		if ( this.UIElementExists( name ) ) {
			throw Error( 'UI Element "' + name + '" cannot be declared twice!' );
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

	get $parentName(): string {
		if ( this.parent ) {
			return this.parent.$name;
		} else {
			return '';
		}
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