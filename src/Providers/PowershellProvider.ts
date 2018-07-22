import * as vscode from 'vscode'
import * as fs from 'fs';
import { PowershellNode } from '../Model/Powershell/PowershellNode';
import * as path from 'path';
import { PowershellDocument } from '../Model/Powershell/PowershellDocument';

export class PowershellProvider implements vscode.TreeDataProvider<PowershellNode>
{
    // onDidChangeTreeData?: vscode.Event<any>;
    private _onDidChangeTreeData: vscode.EventEmitter<any | null | undefined> = new vscode.EventEmitter<any | null | undefined>();
    readonly onDidChangeTreeData: vscode.Event<null | any | undefined> = this._onDidChangeTreeData.event;
  
    // onDidChangeTreeDataEvent = new vscode.EventEmitter<Item | undefined> ();
	// onDidChangeTreeData = this.onDidChangeTreeDataEvent.event;

    getTreeItem(element: any): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
        
    }
    getChildren(element?: PowershellNode): vscode.ProviderResult<PowershellNode[]> {
        let psObjects = Array<PowershellNode>();
        if ( element == null )
        {
            psObjects = this.getRootPSTemplates();
        }
        else
        {
            psObjects = this.getChildFiles(element.PSDoc);
        }
        return psObjects;
    }
    constructor(private context: vscode.ExtensionContext) {
        //this.onDidChangeTreeData = new on
    }

    private getChildFiles(psDoc: PowershellDocument)
    {
        let children = Array<PowershellNode>();

        psDoc.children.forEach(child => {
            let psNode = new PowershellNode();
            psNode.collapsibleState = vscode.TreeItemCollapsibleState.None;
            psNode.label = child.name;
            psNode.contextValue = "scriptfile";
            // psNode.label.fontcolor = new vscode.workspace.Color
            psNode.context = this.context;
            if ( child.name.toLowerCase().indexOf('.ps') > -1 )
            {
                psNode.iconPath = 
                {
                    light: this.context.asAbsolutePath("media/ps.svg"),
                    dark: this.context.asAbsolutePath("media/ps.svg")
                };
            }
            else if (child.name.toLowerCase().indexOf('.js') > -1)
            {
                psNode.iconPath = 
                {
                    light: this.context.asAbsolutePath("media/js.svg"),
                    dark: this.context.asAbsolutePath("media/js.svg")
                }
            }
            else if (child.name.toLowerCase().indexOf('.json') > -1)
            {
                psNode.iconPath = 
                {
                    light: this.context.asAbsolutePath("media/json.svg"),
                    dark: this.context.asAbsolutePath("media/json.svg")
                }
            }
            else if (child.name.toLowerCase().indexOf('.md') > -1)
            {
                psNode.iconPath = 
                {
                    light: this.context.asAbsolutePath("media/md.svg"),
                    dark: this.context.asAbsolutePath("media/md.svg")
                }
            }
            //set the command
            psNode.command = { command:'citrix.commands.loadscript',arguments:[child],title:''};

            children.push(psNode);
        });

        return children;
    }
    private getRootPSTemplates()
    {
        //console.log(`${this.context.extensionPath}/packages/`);
        var homedir = require('os').homedir();
        var citrixHomeDir = path.normalize(`${homedir}/.citrix`);
        var citrixPackagesDir = `${citrixHomeDir}/packages`;
        let psTemplates = new Array<PowershellNode>();

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
                    var dirLocation = `${citrixHomeDir}/packages/${templateDir}`;
                    let psNode = new PowershellNode();
                    psNode.contextValue = "scriptpackage";
                    let psObject = new PowershellDocument(templateDir,dirLocation,[]);
                    psNode.iconPath = 
                    {
                        light: this.context.asAbsolutePath("media/package.svg"),
                        dark: this.context.asAbsolutePath("media/package.svg")
                    }
                    
                    psNode.context = this.context;
                    psNode.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
                    psNode.label = templateDir;
                    //get children files
                    var childFiles = fs.readdirSync(dirLocation);
                    let children = Array<PowershellDocument>();

                    childFiles.forEach(childFile => {
                        var baseName = path.basename(`${citrixHomeDir}/packages/${templateDir}/${childFile}`);
                        if ( baseName != 'manifest.json')
                        {
                            console.log(baseName);
                            var fileLocation = `${citrixHomeDir}/packages/${templateDir}/${baseName}`;
                            let childPsDoc = new PowershellDocument(baseName,fileLocation,[]);
                            children.push(childPsDoc);
                        } 
                    });
                    psObject.children = children;
                    psNode.PSDoc = psObject;
                    psTemplates.push(psNode);
                }
            });
        }
        return psTemplates;
    }

    public refreshPackages()
    {
        this._onDidChangeTreeData.fire();
    }
    
}