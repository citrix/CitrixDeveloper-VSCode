'use strict';

import * as vscode from 'vscode';
import { INode } from '../../Interfaces/INode';
import { SDKDocument } from './SDKDocument';

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
            }
        }
    }
    getChildren(): INode[] | Promise<INode[]> {
        return [];
    }
   

}