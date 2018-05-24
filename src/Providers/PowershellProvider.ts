import * as vscode from 'vscode'
import * as fs from 'fs';

export class PowershellProvider implements vscode.TreeDataProvider<string>
{
    onDidChangeTreeData?: vscode.Event<any>;
    getTreeItem(element: any): vscode.TreeItem | Thenable<vscode.TreeItem> {
        throw new Error("Method not implemented.");
    }
    getChildren(element?: any): vscode.ProviderResult<any[]> {
        throw new Error("Method not implemented.");
    }
    constructor(private context: vscode.ExtensionContext) {
        
    }
    
} 