'use strict';

import * as vscode from 'vscode';
import { INode } from '../../Interfaces/INode';
import { SDKDocument } from './SDKDocument';
import { SDKDocumentSubNode } from './SDKDocumentSubNode';
import { SDKDocumentSubPage } from './SDKDocumentSubPage';

export class SDKDocumentNode implements INode {

    constructor(private SDKDoc: SDKDocument, private context: vscode.ExtensionContext) {
        
    }

    getTreeItem(): vscode.TreeItem {
        let lightIconPath =  this.context.asAbsolutePath("media/SDKDoc-light.svg");
        let darkIconPath = this.context.asAbsolutePath("media/SDKDoc-dark.svg");

        return {
            label: this.SDKDoc.label,
            iconPath: {
                light: lightIconPath,
                dark: darkIconPath
            },
            contextValue: 'sdkDocument',
            command: {
                command: 'citrix.opensdkdocument',
                arguments: [this.SDKDoc.link],
                title:''
            },
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed
        }
    }
    getChildren(): INode[] | Promise<INode[]> {
        return this.getSubPages();
    }
    public async getSubPages() : Promise<SDKDocumentSubNode[]>
    {
        const pages = [];

        this.SDKDoc.subpages.forEach( page => 
        {
            var subPage = new SDKDocumentSubPage(page.label,page.link);
            var subPageNode = new SDKDocumentSubNode(subPage,this.context);
            pages.push(subPageNode)
        });

        return pages;
    }
   

}