import * as vscode from 'vscode'
import { Uri, ThemeIcon } from 'vscode';

export class ScriptNode implements vscode.TreeItem
{
    label: string;
    path: string;
    iconPath?: string | Uri | { light: string | Uri; dark: string | Uri } | ThemeIcon
    resourceUri?: Uri;
    command?: vscode.Command;
    collapsibleState?: vscode.TreeItemCollapsibleState;
    contextValue?: string;
    children: ScriptNode[];
    
}