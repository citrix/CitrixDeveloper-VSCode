import * as vscode from 'vscode'
import { ScriptNode } from '../Model/Script/ScriptNode';
import * as path from 'path'
import * as fs from 'fs'

export class ScriptProvider implements vscode.TreeDataProvider<ScriptNode>
{
    onDidChangeTreeData?: vscode.Event<ScriptNode>;    
    private _onDidChangeTreeData: vscode.EventEmitter<any | null | undefined> = new vscode.EventEmitter<any | null | undefined>();

    getTreeItem(element: ScriptNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    constructor(private context: vscode.ExtensionContext) {
        
    }
    getChildren(element?: ScriptNode): vscode.ProviderResult<ScriptNode[]> {
        

        if ( element == null )
        {
            return this.getRootPackageFolders();
        }
        else
        {
            return this.getChildFolders(element);
        }

        
    }
    getParent?(element: ScriptNode): vscode.ProviderResult<ScriptNode> {
        throw new Error("Method not implemented.");
    }
    public getRootPackageFolders()
    {
        var homedir = require('os').homedir();
        var citrixHomeDir = path.normalize(`${homedir}/.citrix`);
        var citrixPackagesDir = `${citrixHomeDir}/packages`;
        let scriptPackageNodes = Array<ScriptNode>();

        var templateDirs = null;
        try 
        {
            templateDirs = fs.readdirSync(citrixPackagesDir);
        } 
        catch (error) 
        {
           //error 
        }
        
        if ( templateDirs != null )
        {
            templateDirs.forEach(templateDir => {
                
                var stat = fs.statSync(`${citrixHomeDir}/packages/${templateDir}`);
                if ( stat.isDirectory() )
                {
                    let scriptNode = new ScriptNode();
                    let dirLocation = `${citrixHomeDir}/packages/${templateDir}`;

                    scriptNode.label = templateDir;
                    scriptNode.path = dirLocation;
                    scriptNode.contextValue = "scriptpackage";
                    scriptNode.iconPath = 
                    {
                        light: this.context.asAbsolutePath("media/folder-scripts.svg"),
                        dark: this.context.asAbsolutePath("media/folder-scripts.svg")
                    }
                    
                    //scriptNode.context = this.context;
                    scriptNode.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;

                    scriptPackageNodes.push(scriptNode);                        
                }
            });
        }

        return scriptPackageNodes;
    }
    public getChildFolders(node: ScriptNode)
    {
        let children = new Array<ScriptNode>();
        var childFiles = fs.readdirSync(node.path);                    // let children = Array<PowershellDocument>();

        childFiles.forEach(childFile => {
            var stat = fs.statSync(`${node.path}/${childFile}`);

            let scriptNode = new ScriptNode();
            let dirLocation = `${node.path}/${childFile}`;

            scriptNode.label = childFile;
            scriptNode.path = dirLocation;

            if ( stat.isDirectory() )
            {
                scriptNode.contextValue = "scriptfolder";
                scriptNode.iconPath = 
                {
                    light: this.context.asAbsolutePath("media/folder-src.svg"),
                    dark: this.context.asAbsolutePath("media/folder-src.svg")
                }
                
                scriptNode.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            }
            else
            {
                scriptNode.contextValue = "scriptitem";
                scriptNode.collapsibleState = vscode.TreeItemCollapsibleState.None;
                scriptNode.iconPath = vscode.ThemeIcon.File;

                //set the command
                scriptNode.command = { command:'citrix.commands.loadscript',arguments:[scriptNode],title:''};
            }

            children.push(scriptNode);
            // var baseName = path.basename(`${citrixHomeDir}/packages/${templateDir}/${childFile}`);
            // console.log(baseName);  
        });

        return children;
    }

    public refreshPackages()
    {
        this._onDidChangeTreeData.fire();
    }
    
}