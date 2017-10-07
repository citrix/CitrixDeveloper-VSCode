'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SDKProvider } from './Providers/SDKProvider';
import {Uri} from 'vscode';

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

    context.subscriptions.push(openDeveloperSiteCmd);
    context.subscriptions.push(openDeveloperFeedbackSiteCmd);
    context.subscriptions.push(openSDKDocCmd);
}

// this method is called when your extension is deactivated
export function deactivate() {
}