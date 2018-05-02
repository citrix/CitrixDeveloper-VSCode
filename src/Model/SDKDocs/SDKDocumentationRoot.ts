'use strict';

import * as vscode from 'vscode';
import { INode } from '../../Interfaces/INode';
import { SDKDocumentNode } from './SDKDocumentNode';
import { SDKDocument } from './SDKDocument';
import fs = require("fs");
import { ISDKDoc } from '../../Interfaces/ISDKDoc';
import { SDKDocumentSubPage} from '../SDKDocs/SDKDocumentSubPage';
export class SDKDocumentationRoot implements INode {

    constructor(private context: vscode.ExtensionContext) {
  
    }
    getTreeItem(): vscode.TreeItem {
        return {
            label: "SDK Documentation",
            contextValue: "sdkdocs",
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed
        }
    }
    getChildren(): INode[] | Promise<INode[]> {
        //loop through the json data file
        let sdkDocumentList = new Array<SDKDocument>();
        // read the JSON data file that lists out the SDKs and links
        //get the path to the data file
        let dataFilePath = this.context.asAbsolutePath("Data/SDKDocList.json");
        //console.log(dataFilePath);
        let jsonString = fs.readFileSync(dataFilePath,'utf-8');
        //console.log(jsonString);
        // parsing the json string into an array of ISDK objects
        let docList: Array<ISDKDoc> = JSON.parse(jsonString);
        
        let sdkList = new Array<INode>();

        // loop through each json object and create a new SDK document from it.
        // then add it to the SDK Document List

        docList.forEach(element => {
            let subpages = new Array<SDKDocumentSubPage>();
     
            //load sub pages
            element.pages.forEach( page => {
                var subpage = new SDKDocumentSubPage(page.pagetitle,page.pagelink);
                subpages.push(subpage);
            });

            let doc = new SDKDocument(element.sdktitle,element.sdkmainurl,subpages)
            
            sdkList.push(new SDKDocumentNode(doc, this.context));
        });



        return sdkList;
    }
    
}