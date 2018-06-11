import * as vscode from 'vscode'
import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import { PowershellDocument } from './PowershellDocument';
// import { SDKDocument } from './SDKDocument';

export class PowershellNode implements TreeItem
{
    label: string;    
    iconPath?: string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri; };
    command?: vscode.Command;
    collapsibleState?: TreeItemCollapsibleState;
    contextValue?: string;
    PSDoc: PowershellDocument;
    context: vscode.ExtensionContext;
    
}