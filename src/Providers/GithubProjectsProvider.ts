'use strict'

import * as vscode from 'vscode';
import { GithubProject } from '../Model/GithubProject';
import fs = require("fs");

export class GithubProjectsProvider implements vscode.TreeDataProvider<GithubProject>  {

    getTreeItem(element: GithubProject): vscode.TreeItem | Thenable<vscode.TreeItem> {
        throw new Error("Method not implemented.");
    }
    getChildren(element?: GithubProject): vscode.ProviderResult<Array<GithubProject>> {
        throw new Error("Method not implemented.");
    }

    
    
}
