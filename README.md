# Constraint

Constraint is a project that aims to implement an UI Framework for the browser. The advantage of using the Constraint Framework, is that the layout of the application is decoupled form the code of the application, and it's written on a type language - Typescript.


## Installation and usage.

Constraint compiles with the standard *make* command. Just type "make" inside of the root of the project. A "main.js" will be generated if the library is compiled.

## Dependencies

* you need **typescript**, **nodejs** and **gnu make** installed on your system.
* the make file is configured to work under Windows and Linux ( probably other platforms ), assuming that you have in your environment the tools: "make", "node", and "tsc".

## Terminology

1. **Constraint file**. A file format that is used to express UI layouts. Within a constraint file, we can easily decouple the UI layout from the UI logic of an application.


2. **Constraint**. The main class providing the mechanism for parsing *constraint files*.


3. **Scope**. Constraint files are divided into nested scopes. A scope can have properties, constants, and child scopes. It can be viewed by the programmer as a parsed object, based on the definitions found in the constraint files.
Each scope have it's own name and type:

	
	// A scope called myForm, of type Form:
	@Form myForm {
		width: 100;
		height: 200;
		
		// A button inside the Form, named "button1" of type "Button"
		@Button button1 {
			left: 100;
			bottom: $parent center;
		}
	};

If a scope is nested inside of another scope, this becomes a "child" of a scope. So in the above example, we can state that myForm.children = [ button1 ].


4. **Scope Property**. Scope properties are declared inside of scopes. A scope property can be of multiple types: **number**, **string**, **array**, **boolean**, **null**, **object**, **ui anchor**, **constant value**.


4.1. **Numbers**
    

    foo: 3;

4.2. **Strings**


    caption: 'Awesome caption';


4.3. **Arrays**


    labels: [
		'Bar',
        2,
        yes
	];


4.4. **Booleans**


	visible: yes;
    readOnly: no;


4.5. ** Nulls **
	

	parent: null;


4.6. **Objects**


	property: {
		age: 23;
        name: 'Michael';
	};


4.7. **Constants** ( see also 4.10 ). You can easily express the value of a property with the help of a constant which has been declared before:
	

	color: $buttonColor;


4.8. **UI Anchor**


	left: MyLeftButton top 50;

4.9. **Colors**

	fontColor: red;
	winColor: #fff;
	backgroundColor: rgba( 123, 122, 13, 2 );

4.10. **How to declare a constant**. Inside of a scope, you can use the $declare instruction:


    $declare $buttonColor: red;
    $declare $windowColor: $buttonColor;

The constants are scope aware. So a constant can be used only in the scope it was declared, and in all the child scopes of the current scope.