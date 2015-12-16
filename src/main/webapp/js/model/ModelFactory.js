/*******************************************************************************
 * The MIT License (MIT)
 *
 * Copyright (c) 2011, 2013 OpenWorm.
 * http://openworm.org
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the MIT License
 * which accompanies this distribution, and is available at
 * http://opensource.org/licenses/MIT
 *
 * Contributors:
 *      OpenWorm - http://openworm.org/people.html
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 *******************************************************************************/

/**
 * Factory class with node creation methods. Used by RuntimeTreeFactory class
 * while population of run time tree using json object.
 * 
 * @author Giovanni Idili
 */
define(function(require)
{
	return function(GEPPETTO)
	{
		var GeppettoModel = require('model/GeppettoModel');
		var Library = require('model/Library');
		var Type = require('model/Type');
		var Variable = require('model/Variable');
		var CompositeType = require('model/CompositeType');
		var ArrayType = require('model/ArrayType');
		
		/**
		 * @class GEPPETTO.ModelFactory
		 */
		GEPPETTO.ModelFactory =
		{
			/*
			 * Variables to keep track of tree building state go here if needed
			 */

			/**
			 * Creates and populates Geppetto model
			 */
			createGeppettoModel : function(jsonModel)
			{
				var geppettoModel = null;
				
				if(jsonModel.eClass == 'GeppettoModel'){
					geppettoModel = this.createModel(jsonModel);
					geppettoModel.set({ "variables": this.createVariables(jsonModel.variables) });
					
					for(var i=0; i < jsonModel.libraries.length; i++){
						var library = this.createLibrary(jsonModel.libraries[i]);
						library.set({ "types" : this.createTypes(jsonModel.libraries[i].types) });
						geppettoModel.getLibraries().push(library);
					}
					
					// traverse everything and build shortcuts to children if composite --> containment == true
					this.populateChildrenShortcuts(geppettoModel);
					
					// traverse everything and populate type references in variables
					this.populateTypeReferences(geppettoModel, geppettoModel);
				}
				
				return geppettoModel;
			},
			
			/** 
			 * Creates variables starting from an array of variables in the json model format
			 */
			populateChildrenShortcuts : function(node) {
				// check if getChildren exists, if so add shortcuts based on ids and recurse on each
				if(typeof node.getChildren === "function"){
					var children = node.getChildren();
					
					if(children != undefined){
						for (var i=0; i < children.length; i++){
							node[children[i].getId()] = children[i];
							this.populateChildrenShortcuts(children[i]);
						}
					}
				}
			},
			
			/** 
			 * Populate type references
			 */
			populateTypeReferences : function(node, geppettoModel) {
				
				// check if variable, if so populate type references
				if(node.getMetaType() == GEPPETTO.Resources.VARIABLE_NODE){
					var types = node.getTypes();
					var referencedTypes = [];
					
					if(types != undefined){
						for (var i=0; i < types.length; i++){
							// get reference string - looks like this --> '//@libraries.1/@types.5';
							var refStr = types[i].$ref;
							
							// parse data
							var typePointer = this.parseTypePointerString(refStr);
							
							// go grab correct type from Geppetto Model
							var typeObj = geppettoModel.getLibraries()[typePointer.libraries].getTypes()[typePointer.types];
							
							// add to list
							referencedTypes.push(typeObj);
							
							// set types to actual object references using backbone setter
							node.set({ "types" : referencedTypes });
						}
					}
				} else if(node.getMetaType() == GEPPETTO.Resources.TYPE_NODE || node.getMetaType() == GEPPETTO.Resources.COMPOSITE_TYPE_NODE){
					// take visual type string - looks like this --> '//@libraries.1/@types.5'
					var vizType = node.getVisualType();
					
					if(vizType != undefined){
						var vizTypeRefStr = vizType.$ref;
						
						// parse data into typePointer
						var typePointer =  this.parseTypePointerString(vizTypeRefStr);
						
						// replace with reference to actual type
						var typeObj = geppettoModel.getLibraries()[typePointer.libraries].getTypes()[typePointer.types];
						node.set({ "visualType" : typeObj})
					}
				} else if(node.getMetaType() == GEPPETTO.Resources.ARRAY_TYPE_NODE){
					// take array type string - looks like this --> '//@libraries.1/@types.5'
					var arrayType = node.getType();
					
					if(arrayType != undefined){
						var refStr = arrayType.$ref;
						
						// parse data into typePointer
						var typePointer =  this.parseTypePointerString(refStr);
						
						// replace with reference to actual type
						var typeObj = geppettoModel.getLibraries()[typePointer.libraries].getTypes()[typePointer.types];
						node.set({ "type" : typeObj})
					}
				}
				
				// check if getChildren exists, if so recurse over children
				if(typeof node.getChildren === "function"){
					var children = node.getChildren();
					
					if(children != undefined){
						for(var i = 0; i < children.length; i++){ 
							this.populateTypeReferences(children[i], geppettoModel);
						}
					}
				}
			},
			
			/**
			 * Helper function to parse type pointers to objects
			 */
			parseTypePointerString : function(refStr){
				var typePointer = { libraries : undefined, types: undefined};
				
				var raw = refStr.replace(/\//g, '').split('@');
				for(var i=0; i<raw.length; i++){
				  if(raw[i].indexOf('libraries') > -1){
				  	typePointer.libraries = parseInt(raw[i].split('.')[1]);
				  } else if(raw[i].indexOf('types') > -1){
				  	typePointer.types = parseInt(raw[i].split('.')[1]);
				  }
				}
				
				return typePointer;
			},
			
			/** 
			 * Creates variables starting from an array of variables in the json model format
			 */
			createVariables : function(jsonVariables){
				var variables = [];
				
				if(jsonVariables != undefined){
					for(var i=0; i < jsonVariables.length; i++){
						var variable = this.createVariable(jsonVariables[i]);
						
						// check if it has an anonymous type
						if(jsonVariables[i].anonymousTypes != undefined){
							variable.set( { "anonymousTypes" : this.createTypes(jsonVariables[i].anonymousTypes) });
						}
						
						variables.push(variable);
					}
				}
				
				return variables;
			},
			
			/** 
			 * Creates type objects starting from an array of types in the json model format
			 */
			createTypes : function(jsonTypes){
				var types = [];
				
				if(jsonTypes != undefined){
					for(var i=0; i < jsonTypes.length; i++){
						var type = null;
						
						// check if it's composite type, array type or simple type
						if(jsonTypes[i].eClass == 'CompositeType'){
							type = this.createCompositeType(jsonTypes[i]);
						}
						else if(jsonTypes[i].eClass == 'ArrayType'){
							type = this.createArrayType(jsonTypes[i]);
						} else {
							type = this.createType(jsonTypes[i]);
						}
						
						// TODO: find out if we treat composite visual type the same way
						
						types.push(type);
					}
				}
				
				return types;
			},
			
			/** 
			 * Creates and populates instance tree skeleton 
			 */
			createInstanceTree : function(geppettoModel)
			{
				var instanceTree = null;
				
				// TODO: build instance tree exploded to any leaves that haev a visual type 
				
				return instanceTree;
			},
			
			/** Creates a simple composite node */
			createModel : function(node, options)
			{
				if (options == null || options == undefined){
					options = {_metaType : GEPPETTO.Resources.GEPPETTO_MODEL_NODE, wrappedObj: node};
				}
				
				var n = new GeppettoModel(options);

				return n;
			},
			
			/** Creates a simple composite node */
			createLibrary : function(node, options)
			{
				if (options == null || options == undefined){
					options = {_metaType : GEPPETTO.Resources.LIBRARY_NODE, wrappedObj: node};
				}
				
				var n = new Library(options);

				return n;
			},
			
			/** Creates a variable node */
			createVariable : function(node, options)
			{
				if (options == null || options == undefined){
					options = {_metaType : GEPPETTO.Resources.VARIABLE_NODE, wrappedObj: node};
				}
				
				var v = new Variable(options);
				v.set({ "types" : node.types });

				return v;
			},
			
			/** Creates a type node */
			createType : function(node, options)
			{
				if (options == null || options == undefined){
					options = {_metaType : GEPPETTO.Resources.TYPE_NODE, wrappedObj: node};
				}
				
				var t = new Type(options);
				t.set({ "visualType" : node.visualType });

				return t;
			},
			
			/** Creates a composite type node */
			createCompositeType : function(node, options)
			{
				if (options == null || options == undefined){
					options = {_metaType : GEPPETTO.Resources.COMPOSITE_TYPE_NODE, wrappedObj: node};
				}
				
				var t = new CompositeType(options);
				t.set({ "visualType" : node.visualType });
				t.set({ "variables" : this.createVariables(node.variables) });

				return t;
			},
			
			/** Creates a composite type node */
			createArrayType : function(node, options)
			{
				if (options == null || options == undefined){
					options = {_metaType : GEPPETTO.Resources.ARRAY_TYPE_NODE, wrappedObj: node};
				}
				
				var t = new ArrayType(options);
				t.set({ "size" :  node.size });
				t.set({ "type" :  node.arrayType });

				return t;
			},

		};
	};
});
