import * as vscode from "vscode";

export interface INode {

    getTreeItem(): vscode.TreeItem;

    getChildren(): Promise<INode[]> | INode[];
}