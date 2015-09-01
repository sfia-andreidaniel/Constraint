# Constraint

Constraint is a project that aims to implement an UI Framework for the browser. The advantage of using the Constraint Framework, is that the layout of the application is decoupled form the code of the application, and it's written on a type language - Typescript.

## Features
* Typescript strict library
* 100% OOP, no "hacks" and no other obfuscations
* Auto-documentation
* GNU make compliant
* Separates UI from the code, by using a text file format called "ui". UI is UI, code is code. This greately improves code reusability and modularity.
* works on Winows and Linux, because it's using open source projects

## Available widgets set


#### UI_Tree
See UI_Tree_Grid

#### UI_Tree_Grid
![tree1](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Tree_Grid.png "UI_TreeGrid")
![tree2](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Tree_Grid-disabled.png "UI_TreeGrid disabled")

#### UI_PropertyGrid
![prop1](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_PropertyGrid.png "UI_PropertyGrid")


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

