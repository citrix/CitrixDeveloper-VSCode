import * as vscode from 'vscode'
import * as fs from 'fs';
import { GithubProjectNode } from '../Model/GitHub/GithubProjectNode';
import { IGithubProject } from '../Interfaces/IGithubProject';
import { GithubProject } from '../Model/GitHub/GithubProject';

export class GithubProjectProvider implements vscode.TreeDataProvider<GithubProjectNode>
{
    constructor(private context: vscode.ExtensionContext) {
        
    }
    //onDidChangeTreeData?: vscode.Event<docnode>;    
    getTreeItem(element: GithubProjectNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: GithubProjectNode): vscode.ProviderResult<GithubProjectNode[]> {
        let sdkElements = Array<GithubProjectNode>();
        if ( element == null)
        {
            sdkElements = this.getRootGithubProjectNodes();
        }
        else
        {
            //sdkElements = this.getGithubChildNodes(element.doc);
        }
        return sdkElements;
    }

    private loadDataFile()
    {
        //load the data file from the json file and return the 
        //object
    }
    private getRootGithubProjectNodes()
    {
        // read the JSON data file that lists out the SDKs and links
        //get the path to the data file
        let dataFilePath = this.context.asAbsolutePath("Data/GithubProjects.json");
        //console.log(dataFilePath);
        let jsonString = fs.readFileSync(dataFilePath,'utf-8');

        // parsing the json string into an array of ISDK objects
        let githubProjectList: Array<IGithubProject> = JSON.parse(jsonString);
        //TODO: need to update the parsing utility to adjust for the new 
        //json layout we are defining. See github page

        let githubProjects = new Array<GithubProjectNode>();

        // loop through each json object and create a new SDK document from it.
        // then add it to the SDK Document List
        githubProjectList.forEach(element => {
            
            let githubProject = new GithubProject();
            githubProject.title = element.title;
            githubProject.cloneURL = element.cloneURL;
            githubProject.description = element.description;
            githubProject.projectURL = element.projectURL;
            githubProject.prettySite = element.prettySite;

            let githubProjectNode = new GithubProjectNode();
            // if ( sdkdoc.children.length > 0 )
            // {
            //     sdkdocnode.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            // }
            // else
            // {
            //     sdkdocnode.collapsibleState = vscode.TreeItemCollapsibleState.None;
            // }
            
            githubProjectNode.label = element.title;
            //sdkdocnode.doc = sdkdoc;
            githubProjectNode.iconPath = {
            light: this.context.asAbsolutePath("media/githubmark-light.png"),
            dark: this.context.asAbsolutePath("media/githubmark-dark.png")
            };
            //sdkdocnode.command = { command:'citrix.opensdkdocument',arguments:[sdkdoc.url],title:''};
            
            githubProjects.push(githubProjectNode);            
        });

        return githubProjects;
    } //getRootDocumentationNodes

    private getChildDocumentationNodes(githubproject: GithubProject)
    {
        // let childNodes = Array<SDKDocumentNode>();

        // sdkdoc.children.forEach(element => {
        //     let sdkChildDoc = new SDKDocument(element.title,element.url,[]);
        //     let sdkChildNode = new SDKDocumentNode();
        //     sdkChildNode.collapsibleState = vscode.TreeItemCollapsibleState.None;
        //     sdkChildNode.context = this.context;
        //     sdkChildNode.doc = sdkChildDoc;
        //     sdkChildNode.label = element.title;
        //     sdkChildNode.iconPath = {
        //         light: this.context.asAbsolutePath("media/SDKLine-light.svg"),
        //         dark: this.context.asAbsolutePath("media/SDKLine-dark.svg")
        //         };
            
        //     sdkChildNode.command = { command:'citrix.opensdkdocument',arguments:[element.url],title:''};
            
        //     childNodes.push(sdkChildNode);
        // });

        return []; //childNodes;
    }
} 