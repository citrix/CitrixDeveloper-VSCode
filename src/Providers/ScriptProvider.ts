import * as vscode from 'vscode'
import { ScriptNode } from '../Model/Script/ScriptNode';
import * as path from 'path'
import * as fs from 'fs'

export class ScriptProvider implements vscode.TreeDataProvider<ScriptNode>
{

    private _onDidChangeTreeData: vscode.EventEmitter<any | null | undefined> = new vscode.EventEmitter<any | null | undefined>();
    onDidChangeTreeData?: vscode.Event<ScriptNode> = this._onDidChangeTreeData.event; 

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
                    scriptNode.iconPath = this.context.asAbsolutePath("media/folder-scripts.png");
                    
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
                scriptNode.iconPath = this.context.asAbsolutePath("media/folder-src.png");
                
                scriptNode.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            }
            else
            {
                scriptNode.contextValue = "scriptitem";
                scriptNode.collapsibleState = vscode.TreeItemCollapsibleState.None;
                scriptNode.iconPath = 
                {
                    light: this.getIcon(path.extname(scriptNode.path)),
                    dark: this.getIcon(path.extname(scriptNode.path))
                }

                //set the command
                scriptNode.command = { command:'citrix.commands.loadscript',arguments:[scriptNode],title:''};
            }
            if ( childFile.toLowerCase() != 'manifest.json')
            {
                children.push(scriptNode);
            }
        });

        return children;
    }
    public getIcon(ext: string):string
    {
        switch ( ext.toLowerCase())
        {
            case '.md':
            case '.markdown':
                return this.context.asAbsolutePath('media/markdown.png');
            case '.js':
                return this.context.asAbsolutePath('media/javascript.png');
            case '.ps1':
            case '.psm1':
                return this.context.asAbsolutePath('media/powershell.png');
            case '.go':
                return this.context.asAbsolutePath('media/go.png');
            case '.json':
                return this.context.asAbsolutePath('media/json.png');
            default:
                return this.context.asAbsolutePath('media/document.png');            
        }
    }
    public refreshPackages()
    {
        this._onDidChangeTreeData.fire();
    }
    
}