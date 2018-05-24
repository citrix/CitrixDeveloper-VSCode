import * as vscode from 'vscode'
import * as fs from 'fs';
import { SDKDocumentNode } from '../Model/SDKDocs/SDKDocumentNode';
import { SDKDocument } from '../Model/SDKDocs/SDKDocument';
import { ISDKDocument } from '../Interfaces/ISDKDocument';

export class SDKDocsProvider implements vscode.TreeDataProvider<SDKDocumentNode>
{
    constructor(private context: vscode.ExtensionContext) {
        
    }
    //onDidChangeTreeData?: vscode.Event<docnode>;    
    getTreeItem(element: SDKDocumentNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: SDKDocumentNode): vscode.ProviderResult<SDKDocumentNode[]> {
        let sdkElements = Array<SDKDocumentNode>();
        if ( element == null)
        {
            sdkElements = this.getRootDocumentationNodes();
        }
        else
        {
            sdkElements = this.getChildDocumentationNodes(element.doc);
        }
        return sdkElements;
    }

    private loadDataFile()
    {
        //load the data file from the json file and return the 
        //object
    }
    private getRootDocumentationNodes()
    {
        // read the JSON data file that lists out the SDKs and links
        //get the path to the data file
        let dataFilePath = this.context.asAbsolutePath("Data/SDKDocList.json");
        //console.log(dataFilePath);
        let jsonString = fs.readFileSync(dataFilePath,'utf-8');

        // parsing the json string into an array of ISDK objects
        let docList: Array<ISDKDocument> = JSON.parse(jsonString);
        //TODO: need to update the parsing utility to adjust for the new 
        //json layout we are defining. See github page

        let sdkList = new Array<SDKDocumentNode>();

        // loop through each json object and create a new SDK document from it.
        // then add it to the SDK Document List
        docList.forEach(element => {
            let children = new Array<SDKDocument>();
            element.children.forEach(childPage => {
                let childSDKPage = new SDKDocument(childPage.title, childPage.url,[]);
                children.push(childSDKPage);
            });
            let sdkdoc = new SDKDocument(element.title,element.url,children);

            let sdkdocnode = new SDKDocumentNode();
            if ( sdkdoc.children.length > 0 )
            {
                sdkdocnode.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            }
            else
            {
                sdkdocnode.collapsibleState = vscode.TreeItemCollapsibleState.None;
            }
            
            sdkdocnode.label = element.title;
            sdkdocnode.doc = sdkdoc;
            sdkdocnode.iconPath = {
            light: this.context.asAbsolutePath("media/SDKDoc-light.svg"),
            dark: this.context.asAbsolutePath("media/SDKDoc-dark.svg")
            };
            sdkdocnode.command = { command:'citrix.opensdkdocument',arguments:[sdkdoc.url],title:''};
            
            sdkList.push(sdkdocnode);            
        });

        return sdkList;
    } //getRootDocumentationNodes

    private getChildDocumentationNodes(sdkdoc: SDKDocument)
    {
        let childNodes = Array<SDKDocumentNode>();

        sdkdoc.children.forEach(element => {
            let sdkChildDoc = new SDKDocument(element.title,element.url,[]);
            let sdkChildNode = new SDKDocumentNode();
            sdkChildNode.collapsibleState = vscode.TreeItemCollapsibleState.None;
            sdkChildNode.context = this.context;
            sdkChildNode.doc = sdkChildDoc;
            sdkChildNode.label = element.title;
            sdkChildNode.iconPath = {
                light: this.context.asAbsolutePath("media/SDKLine-light.svg"),
                dark: this.context.asAbsolutePath("media/SDKLine-dark.svg")
                };
            
            sdkChildNode.command = { command:'citrix.opensdkdocument',arguments:[element.url],title:''};
            
            childNodes.push(sdkChildNode);
        });

        return childNodes;
    }
} 