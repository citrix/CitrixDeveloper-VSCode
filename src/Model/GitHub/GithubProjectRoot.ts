'use strict';

import * as vscode from 'vscode';
import { INode } from '../../Interfaces/INode';
import { GithubProject } from './GithubProject';
import fs = require("fs");
import { IGithubProject } from '../../Interfaces/IGithubProject';
import { GithubProjectNode } from './GithubProjectNode';

export class GithubProjectRoot implements INode {
    constructor(private context: vscode.ExtensionContext) {
        
    }
    getTreeItem(): vscode.TreeItem {
        return {
            label: "GitHub Projects",
            contextValue: "github",
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed
        };
    }
    getChildren(): INode[] | Promise<INode[]> {
        //loop through the json data file
        let githubProjectList = new Array<GithubProject>();
        // read the JSON data file that lists out the SDKs and links
        //get the path to the data file
        let dataFilePath = this.context.asAbsolutePath("Data/GithubProjects.json");
        //console.log(dataFilePath);
        let jsonString = fs.readFileSync(dataFilePath,'utf-8');
        //console.log(jsonString);
        // parsing the json string into an array of ISDK objects
        let projectList: Array<IGithubProject> = JSON.parse(jsonString);
        
        let projects = new Array<INode>();

        // loop through each json object and create a new SDK document from it.
        // then add it to the SDK Document List

        projectList.forEach(element => {
            let project = new GithubProject(
                element.title,element.description, element.projectURL,element.cloneURL
            );
            projects.push(new GithubProjectNode(project,this.context));
        });



        return projects;
        
    }

}