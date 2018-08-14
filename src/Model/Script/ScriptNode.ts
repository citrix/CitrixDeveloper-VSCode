import * as vscode from 'vscode'

export class ScriptNode implements vscode.TreeItem
{
    label: string;
    path: string;
    iconPath?: string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri; } | vscode.ThemeIcon;
    command?: vscode.Command;
    collapsibleState?: vscode.TreeItemCollapsibleState;
    contextValue?: string;
    children: ScriptNode[];
    
}