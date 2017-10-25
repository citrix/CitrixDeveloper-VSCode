'use strict';
import * as vscode from 'vscode';
import { INode } from '../../Interfaces/INode';
import { GithubProject } from './GithubProject';

export class GithubProjectNode implements INode {
    constructor(private Project: GithubProject, private context: vscode.ExtensionContext ) {
        
    }

    getTreeItem(): vscode.TreeItem {
        let lightIconPath =  this.context.asAbsolutePath("media/githubmark-light.png");
        let darkIconPath = this.context.asAbsolutePath("media/githubmark-dark.png");
        
        return {
            label: this.Project.title,
            iconPath: { 
                light:lightIconPath,
                dark:darkIconPath },
            contextValue: 'githubProject'
        }
    }
    getChildren(): INode[] | Promise<INode[]> {
        return [];
    }
    
}
