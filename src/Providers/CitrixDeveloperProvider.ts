'use strict'

import * as vscode from 'vscode';
import { INode } from '../Interfaces/INode';
import { SDKDocumentationRoot } from '../Model/SDKDocs/SDKDocumentationRoot';
import { GithubProjectRoot } from '../Model/GitHub/GithubProjectRoot';

export class CitrixDeveloperProvider implements vscode.TreeDataProvider<INode >  {
    onDidChangeTreeData?: vscode.Event<INode>;
    
    getTreeItem(element: INode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element.getTreeItem();
    }
    getChildren(element?: INode): vscode.ProviderResult<INode[]> {
        console.log(element);
        if ( !element )
        {
            console.log("!element");
            return this.getRootNodes();
        }
        console.log("element");
        console.log(element);
        
        return element.getChildren();
    }

    getRootNodes (): INode[]
    {
        try
        {
            return [ new SDKDocumentationRoot(this.context), new GithubProjectRoot(this.context)];
        }
        catch ( inodeError)
        {
            console.log(inodeError);
        }

    }
    constructor(private context: vscode.ExtensionContext) {
        console.log(this.context.extensionPath);
    }

    
    
    
}
