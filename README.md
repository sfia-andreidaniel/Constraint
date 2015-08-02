# Constraint

Constraint is a project that aims to implement an UI Framework for the browser. The advantage of using the Constraint Framework, is that the layout of the application is decoupled form the code of the application, and it's written on a type language - Typescript.

![demo form](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/demo_form.png "Demo Form")

## Features
* Typescript strict library
* 100% OOP, no "hacks" and no other obfuscations
* Auto-documentation
* GNU make compliant
* Separates UI from the code, by using a text file format called "ui". UI is UI, code is code. This greately improves code reusability and modularity.
* works on Winows and Linux, because it's using open source projects

## Installation and usage.

### Prerequisites:
* Typescript - http://www.typescriptlang.org/
* NodeJS - https://nodejs.org/
* gnu make program (can be installed on Windows too)

### Building framework:
    
    make

### Building demo
    
    make demo

### Building framework resources:
    
    make resources

In order to be able to build resources, you will need the Image Magik package installed ( works on windows too ), with the "mogrify" tool available in your command line path.

### Generating documentation

You will need a tool called "typedoc", which can be installed first by typing:
    
    make doc_install

After you have the "typedoc" installed, you can build the documentation by typing:
    
    make doc

### Generating the Typescript .d.ts library file

You will need a tool called "dts-generator", which can be installed first by typing:
    
    make dts_install

After you have the "dts-generator" installed, you can build the documentation by typing:
    
    make dts

