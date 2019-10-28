'use strict';

import * as vscode from 'vscode';
import Uglifier from './Uglifier'
import keywords from './keywords.json'
import dictionary from './dictionary.json'
import { IContextDefinition } from 'mocha';

// const data = dictionary.map(m => {
// 	return (m.category);
//     });

var variables: string[] = [];

export function activate(context: vscode.ExtensionContext) {

    // Register Keywords
    let RegisterKeywords = vscode.languages.registerCompletionItemProvider('pml', {

        provideCompletionItems() {
            return keywords.map(keyword => {
                return new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
            });
        }
    });


    // Register General Methods
    let RegisterGeneralMethods = vscode.languages.registerCompletionItemProvider('pml', {

        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

            const filteredGeneralMethods = dictionary.filter(methods => methods.library === "General");
            let Methods = (filteredGeneralMethods[0].methods).map(method => {

                let item = new vscode.CompletionItem(method.label, vscode.CompletionItemKind.Method);

                if (method.snippet) {
                    item.insertText = new vscode.SnippetString(method.snippet);
                }

                if (method.md) {
                    item.documentation = new vscode.MarkdownString(method.md);
                }

                return item;

            });

            return Methods;
        }

    });

    context.subscriptions.push(RegisterKeywords, RegisterGeneralMethods, Uglifier);
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(
        { language: "pml" }, new PmlDocumentSymbolProvider()
    ));

    var variables = parseKeys()
    vscode.workspace.onDidChangeTextDocument(parseKeys);


    console.log(variables);

}

export class PmlDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): Thenable<vscode.SymbolInformation[]> {
        return new Promise((resolve, reject) => {
            var symbols: any[] = [];

            // This line is here purely to satisfy linter
            token = token;

            for (var i = 0; i < document.lineCount; i++) {
                var line = document.lineAt(i);

                let lineTrimmed: string = line.text.trim();

                if (lineTrimmed.toLowerCase().startsWith("define method .")) {
                    symbols.push({
                        name: line.text.substr(15),
                        kind: vscode.SymbolKind.Method,
                        location: new vscode.Location(document.uri, line.range)
                    })
                }

                if (lineTrimmed.toLowerCase().startsWith("define function ")) {
                    symbols.push({
                        name: line.text.substr(16),
                        kind: vscode.SymbolKind.Function,
                        location: new vscode.Location(document.uri, line.range)
                    })
                }
            }

            resolve(symbols);
        });
    }
}

function parseKeys() {
    if (!vscode.window.activeTextEditor) {
        return; // no editor
    }

    let {
        document
    } = vscode.window.activeTextEditor;

    var lines = document.lineCount;

    var varString: { name: string, type: string, from: Number, to: Number | null, global: Boolean };
    var variables: any[] = [];

    for (let l = 0; l < lines; l++) {
        var lineContent = document.lineAt(l).text

        //replace consecutive spaces with one space
        lineContent = lineContent.replace(/[ ]{2,}/g, '')

        if (!lineContent.startsWith('--')) {
            var regex = /(?:^|[^!])!+(\w+)/g;
            var match;
            var type = "";
            var from = 0;
            var global;

            if (lineContent.toLowerCase().startsWith('define ') || lineContent.toLowerCase().startsWith('endmethod')) {

                variables.forEach(function (variable) {

                    //set "unclosed" variables valid until here
                    if (variable.to === null) {
                        variable.to = l;
                    }

                });

            }

            while (match = regex.exec(lineContent)) {
                if (match && match[1] != "this") {

                    var to = null;
                    from = l;

                    //set the global variable valid up to the end of the file
                    if (lineContent.includes('!!' + match[1])) {
                        global = true;
                        to = lines;
                    } else {
                        global = false;
                    }


                    if (lineContent.toLowerCase().startsWith('setup form')) {
                        type = "Form";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object marui(')) {
                        type = "MarUi";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object marutil(')) {
                        type = "MarUtil";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object mardrafting(')) {
                        type = "MarDrafting";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object marcaptureregionplanar(')) {
                        type = "MarCaptureRegionPlanar";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object marcontourplanar(')) {
                        type = "MarContourPlanar";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object marrectangleplanar(')) {
                        type = "MarRectanglePlanar";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object marelementhandle(')) {
                        type = "MarElementHandle";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object marmodel(')) {
                        type = "MarModel";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object mardex(')) {
                        type = "MarDex";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object marpanelschema(')) {
                        type = "MarPanelSchema";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object marpoint(')) {
                        type = "MarPoint";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object marpointplanar(')) {
                        type = "MarPointPlanar";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object marsymbolicview(')) {
                        type = "MarSymbolicView";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object marhullpan(')) {
                        type = "MarHullPan";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object marhullpan(')) {
                        type = "MarHullPan";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object marprintoptions(')) {
                        type = "MarPrintOptions";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object netdatasource(')) {
                        type = "NetDataSource";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object marpythonengine(')) {
                        type = "MarPythonEngine";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object pmlfilebrowser(')) {
                        type = "PMLFileBrowser";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object file(')) {
                        type = "file";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object format(')) {
                        type = "format";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object datetime(')) {
                        type = "DateTime";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object martext(')) {
                        type = "MarText";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object marsymbol(')) {
                        type = "MarSymbol";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object marcolour(')) {
                        type = "MarColour";
                    }

                    // add here something like var !x COLL
                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object collection(')
                        || lineContent.toLowerCase().includes('var !' + match[1].toLowerCase() + ' coll')
                    ) {
                        type = "Collection";
                    }

                    var ArrayRegex = new RegExp("!" + match[1] + "\\[\\d+\\]", 'g');

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' is array') 
                        || lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = array(') 
                        || lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object array(')
                        || ArrayRegex.exec(lineContent)
                    ) {
                        type = "array";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' is boolean') 
                        || lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object boolean(') 
                        || lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = true') 
                        || lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = false')
                    ) {
                        type = "boolean";
                    }

                    //add here something like var !x USER|HOST|CLOCK ...
                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' is string') 
                    || lineContent.includes(match[1] + " = '") 
                    || lineContent.includes(match[1] + " = |")
                    ) {
                        type = "string";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' is gadget')) {
                        type = "gadget";
                    }

                    var RealRegex = new RegExp("!" + match[1] + "\\s+=\\s+\\d+", 'g');

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' is real')
                        || RealRegex.exec(lineContent)
                    ) {
                        type = "real";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' is any')) {
                        type = "any";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = current project')) {
                        type = "project";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object dbref(')) {
                        type = "DBRef";
                    }


                    varString = {
                        name: match[1].toLowerCase(),
                        type: type,
                        from: from,
                        to: to,
                        global: global
                    };

                    var filterTo = variables.filter(variable => (variable.name === varString.name && variable.to === varString.to));

                    if (filterTo.length === 0) {
                        variables.push(varString);
                    }


                    if (type !== null) {
                        variables.forEach(function (variable) {

                            if (variable.name === varString.name && variable.type === null) {
                                variable.type = type;
                            }
        
                        });
                    }

                }

            }

        }

    }

    var Recognized = variables.filter(variable => (variable.type !== null));
    // var RecognizedKeyNames = Recognized.map(m => {
    //     return (m.name);
    //     });

	// const SecondLevel = vscode.languages.registerCompletionItemProvider('pml', {
	// 		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
		
	// 			//console.log (topmethods)
	// 			let linePrefix = document.lineAt(position).text.substr(0, position.character);
	// 			if (!endsWithAny((RecognizedKeyNames),linePrefix,".")) {
	// 				return undefined;
    //             }
                
    //             var newprefix = linePrefix.slice(0,-1);
    //             var filtereddata = Recognized.filter(meth => meth.name === newprefix);
                      
	// 			return (filtereddata[0].name).map((submethod: { type: string; }) => {

    //                 const filteredMethods = dictionary.filter(methods => methods.library === submethod.type);

    //                 let Methods = (filteredMethods[0].methods).map(method => {

    //                     let item = new vscode.CompletionItem(method.label, vscode.CompletionItemKind.Method);
        
    //                     if (method.snippet) {
    //                         item.insertText = new vscode.SnippetString(method.snippet);
    //                     }
        
    //                     if (method.md) {
    //                         item.documentation = new vscode.MarkdownString(method.md);
    //                     }
        
    //                     return item;
        
    //                 });

                    
    //                 return Methods;
    //             });
    //         }
    //     } , '.' // triggered whenever a '.' is being typed
    // );


    return Recognized;
}



function endsWithAny(suffixes: string[], string: string, delim: string) {
    for (let suffix of suffixes) {
        if(string.endsWith(suffix + delim))
            return true;
    }
    return false;
}