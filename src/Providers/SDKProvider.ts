'use strict';

import * as vscode from 'vscode';
import { SDKDocument } from '../Model/SDKDocument';
import { ISDKDoc } from '../Interfaces/ISDKDoc';
import fs = require("fs");

export class SDKProvider implements vscode.TreeDataProvider<SDKDocument>  {
    constructor(private context: vscode.ExtensionContext) {
        console.log(this.context.extensionPath);
    }

    //overide getChildren - returns an array of SDKDocuments
    public getChildren(element? : SDKDocument): Thenable<Array<SDKDocument>> {
        return new Promise(resolve => {
            //create the new object
            let sdkDocumentList = new Array<SDKDocument>();
            // read the JSON data file that lists out the SDKs and links
            //get the path to the data file
            let dataFilePath = this.context.asAbsolutePath("Data/SDKDocList.json");
            //console.log(dataFilePath);
            let jsonString = fs.readFileSync(dataFilePath,'utf-8');
            //console.log(jsonString);
            // parsing the json string into an array of ISDK objects
            let docList: Array<ISDKDoc> = JSON.parse(jsonString);
            // loop through each json object and create a new SDK document from it.
            // then add it to the SDK Document List
            docList.forEach(element => {
                //console.log(element.title); 
                // push the new object to the array list
                sdkDocumentList.push(new SDKDocument(element.title,element.link));
            });
            // return the document list
            resolve(sdkDocumentList);
        });
    }

    getTreeItem(element: SDKDocument): vscode.TreeItem {
        let sdkDocTreeItem: vscode.TreeItem = new vscode.TreeItem(element.label);
        let lightIconPath = this.context.asAbsolutePath("media/SDKDoc-light.svg");
        let darkIconPath = this.context.asAbsolutePath("media/SDKDoc-dark.svg");
        
        sdkDocTreeItem.iconPath = {
            light:lightIconPath,
            dark:darkIconPath
        };
        sdkDocTreeItem.command = {
            command:'citrix.opensdkdocument',
            title: '',
            arguments: [element.link]
        };
        return sdkDocTreeItem;
	}
}