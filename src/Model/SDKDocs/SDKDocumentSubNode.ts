'use strict';

import * as vscode from 'vscode';
import { INode } from '../../Interfaces/INode';
import { SDKDocumentSubPage } from './SDKDocumentSubPage';

export class SDKDocumentSubNode implements INode {

    constructor(private SDKSubDoc: SDKDocumentSubPage, private context: vscode.ExtensionContext) {
        
    }

    getTreeItem(): vscode.TreeItem {
        let lightIconPath =  this.context.asAbsolutePath("media/SDKLine-dark.svg");
        let darkIconPath = this.context.asAbsolutePath("media/SDKLine-dark.svg");

        return {
            label: this.SDKSubDoc.label,
            iconPath: {
                light: lightIconPath,
                dark: darkIconPath
            },
            contextValue: 'sdkSubDocument',
            command: {
                command: 'citrix.opensdkdocument',
                arguments: [this.SDKSubDoc.link],
                title:''
            }
        }
    }
    getChildren(): INode[] | Promise<INode[]> {
        return [];
    }
   

}