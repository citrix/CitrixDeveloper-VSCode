import * as vscode from 'vscode'
import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import { SDKDocument } from './SDKDocument';

export class SDKDocumentNode implements TreeItem
{
    label: string;    
    iconPath?: string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri; };
    command?: vscode.Command;
    collapsibleState?: TreeItemCollapsibleState;
    contextValue?: string;
    doc: SDKDocument;
    context: vscode.ExtensionContext;
}