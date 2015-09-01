# Constraint

Constraint is a project that aims to implement a professional [UI](https://en.wikipedia.org/wiki/User_interface) 
[Web Application Framework](https://en.wikipedia.org/wiki/Web_application_framework) for the browser.
The advantage of using the Constraint Framework, is that the layout of the application is 
decoupled form the code of the application, and it's written on a typed language - Typescript.

## Features
* Typescript strict library
* 100% OOP, no "hacks" and no other obfuscations
* Auto-documentation
* GNU make compliant
* Separates UI from the code, by using a text file format called "ui". UI is UI, code is code. This greately improves code reusability and modularity.
* works on Winows and Linux, because it's using open source projects

## Documentation

An automatically generated documentation of Constraint framework can be found [at this address](http://www.browserfs.com/constraint/ "Constraint Documentation").


## Installation and usage.

### Prerequisites:
* Typescript - http://www.typescriptlang.org/
* NodeJS - https://nodejs.org/
* gnu make program (can be installed on Windows too)

### Quick start

* Make the framework reachable under a webserver, then from the command line:


    make resources  
    make demo


* Load in your browser the repository address

### Building framework:
    
    make

### Building framework resources:
    
    make resources

In order to be able to build resources, you will need the Image Magik package installed ( works on windows too ), with the "mogrify" tool available in your command line path.

### Generating documentation

**You will need a tool called "typedoc"**, which can be installed first by typing:
    
    make doc_install

**After** you have the "typedoc" installed, you can build the documentation by typing:
    
    make doc

### Generating the Constraint.d.ts declarations file

**You will need a tool called "dts-generator"**, which can be installed first by typing:
    
    make dts_install

**After** you have the "dts-generator" installed, you can build the documentation by typing:
    
    make dts

