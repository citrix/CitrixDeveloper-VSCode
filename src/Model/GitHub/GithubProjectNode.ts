import * as vscode from 'vscode'
import { TreeItem, TreeItemCollapsibleState } from 'vscode';

export class GithubProjectNode implements TreeItem
{
    label: string;    
    iconPath?: string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri; };
    command?: vscode.Command;
    collapsibleState?: TreeItemCollapsibleState;
    contextValue?: string;
    context: vscode.ExtensionContext;
}