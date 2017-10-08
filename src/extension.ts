'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SDKProvider } from './Providers/SDKProvider';
import {Uri} from 'vscode';
import fs = require("fs");
import { CPXItem } from './Interfaces/CPXItem';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const sdkProvider = new SDKProvider(context);
    vscode.window.registerTreeDataProvider('citrix.view.sdkdocs',sdkProvider);

    let openDeveloperSiteCmd = vscode.commands.registerCommand("citrix.commands.openCitrixDeveloperSite", () => {
        const uri = vscode.Uri.parse("http://developer.citrix.com");
        vscode.commands.executeCommand('vscode.open', uri);
    });

    let openDeveloperFeedbackSiteCmd = vscode.commands.registerCommand("citrix.commands.openCitrixDeveloperFeedbackSite", () => {
        const uri = vscode.Uri.parse("http://tinyurl.com/citrixuservoice");
        vscode.commands.executeCommand('vscode.open', uri); 
    });
        
    let openSDKDocCmd = vscode.commands.registerCommand('citrix.opensdkdocument', SDKLink => {
        
        const uri = vscode.Uri.parse(SDKLink);
        vscode.commands.executeCommand('vscode.open', uri);
    });
    
    let downloadCPXImageCmd = vscode.commands.registerCommand('citrix.commands.downloadcpxcontainer', () => {
        //check to see if the user has docker installed. We try and execute docker
        //and parse the result.

        //load up the cpx versions and locations from the data file.
        let cpxDataFilePath = context.asAbsolutePath("Data/CPXVersions.json");
        console.log(cpxDataFilePath);
        let cpxJSON = fs.readFileSync(cpxDataFilePath,'utf-8');

        // parsing the json string into an array of ICPX objects
        let imageList: Array<CPXItem> = JSON.parse(cpxJSON);
        console.log(imageList);

        //prompt the user for the version they would like to download?
        if ( imageList.length > 1 )
        {
            vscode.window.showQuickPick(imageList).then( (output ) => {
                console.log('selected ' + output.version);
                console.log('selected ' + output.location);

                const terminal: vscode.Terminal = vscode.window.createTerminal('Docker');
                terminal.sendText(`docker pull ${output.location}`);
                terminal.show();
            });
        }

    });

    let startCPXContainerCmd = vscode.commands.registerCommand('citrix.commands.startcpxcontainer', () => {
        //start cpx container
    });

    let stopCPXContainerCmd = vscode.commands.registerCommand('citrix.commands.stopcpxcontainer', () => {
        //stop cpx container.
    });

    context.subscriptions.push(openDeveloperSiteCmd);
    context.subscriptions.push(openDeveloperFeedbackSiteCmd);
    context.subscriptions.push(openSDKDocCmd);
}

// this method is called when your extension is deactivated
export function deactivate() {
}