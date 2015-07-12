class Constraint_Scope {

	protected parent: Constraint_Scope;
	protected root: Constraint_Scope;

	protected _name: string = null;
	protected type: string = null;
	protected properties: IProperty[] = [];

	protected children: Constraint_Scope[] = [];
	protected constants: IProperty[] = [];
	protected objectPath: string[] = [];

	protected global: any = null;

	protected arrayStack: string[] = [];

	constructor( parentScope: Constraint_Scope = null, name: string = '', type: string = '' ) {
		this.parent = parentScope;

		this.root = parentScope === null
			? this
			: parentScope.root;

		if ( !parentScope ) {
			this.global = {};
		}

		this._name = name;
		this.type = type;
	}

	get name(): string {
		return this.parent === null
			? this._name
			: this.parent._name + '.' + this._name;
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
			"value": Constraint_Type.create( value, this )
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
				this.properties[i].value.push( Constraint_Type.create( value, this ) );
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

		var result = new Constraint_Scope( this, name, type );
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
					return Constraint_Type.create( v, scope );
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

	public UIElementExists( scopeName: string ): boolean {
		
		if ( scopeName === '$parent' || scopeName === null ) {
			return this.parent !== null;
		} else {
			return typeof this.root.global[ scopeName ] != 'undefined'
				? true
				: false;
		}

	}

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

}