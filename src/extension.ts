'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {Uri} from 'vscode';
import fs = require("fs");
import { CPXItem } from './QuickPickItems/CPXItem';
import * as Helpers from './helpers/docker';
import { CitrixDeveloperProvider } from './Providers/CitrixDeveloperProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    //const sdkProvider = new SDKProvider(context);

    const devProvider = new CitrixDeveloperProvider(context);

    //vscode.window.registerTreeDataProvider('citrix.view.sdkdocs',sdkProvider);
    vscode.window.registerTreeDataProvider('citrix.view.citrixdeveloper',devProvider);

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

    let cloneAndOpenRepo = vscode.commands.registerCommand('citrix.commands.context.clone', RepoInfo => {
        vscode.window.showInputBox({prompt:"Enter location to clone repo:"}).then( (location) => {
            console.log(location);
            console.log(RepoInfo);
            console.log(RepoInfo.Project.cloneURL);

            if ( location != null )
            {
                //clone url
                const cdTerminal: vscode.Terminal = vscode.window.createTerminal('Citrix-Developer');
                cdTerminal.sendText(`cd ${location}`);
                cdTerminal.sendText(`git clone ${RepoInfo.Project.cloneURL}`);
                cdTerminal.show();

            }
        });
        console.log("Clone REPO");
    });

    let openGithubRepo = vscode.commands.registerCommand('citrix.commands.context.openghsite', RepoInfo => {
        console.log("open REPO site");
    });

    let openGithubProjectSite = vscode.commands.registerCommand('citrix.commands.context.openprojectsite', RepoInfo => {
        console.log("open REPO project Site");
    });

    let downloadCPXImageCmd = vscode.commands.registerCommand('citrix.commands.downloadcpxcontainer', async () => {
        //check to see if the user has docker installed. We try and execute docker
        //and parse the result.
        
        let dockerAvailable = await Helpers.isDockerAvailable();
        if ( dockerAvailable == false )
        {
            vscode.window.showErrorMessage("Unable to connect to the Docker daemon. Please make sure docker is installed and running.");
        }
        else
        {
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
                    vscode.window.showInformationMessage("Downloading Netscaler image");
                    const terminal: vscode.Terminal = vscode.window.createTerminal('Docker');
                    terminal.sendText(`docker pull ${output.location}`);
                    terminal.show();
                });
            }
        }
    });

    let startCPXContainerCmd = vscode.commands.registerCommand('citrix.commands.startcpxcontainer',  async () => {
        //start cpx container
        //ask for user input (http port, https port, ssh)
        if ( await Helpers.isDockerAvailable() == true )
        {
            let installedImages = await Helpers.listCitrixImages();
            if (installedImages.length == 0 )
            {
                vscode.window.showErrorMessage("The Netscaler CPX image is not installed in this instance of Docker. Pleae use the 'Citrix:Download Netscaler CPX image (Docker)' command to download the image, then try again");
            }
            else
            {
                let ports = new Array<string>();
                vscode.window.showQuickPick(installedImages).then( (selectedImage) => {
                    console.log(selectedImage);
                    vscode.window.showInputBox({prompt:"Enter local HTTP port", value: "32777"}).then( (httpValue) => {
                        console.log(httpValue);
                        ports.push(`80:tcp:${httpValue}`);
                        vscode.window.showInputBox({prompt:"Enter local HTTPS port", value: "32778"}).then( (httpsValue) => {
                            console.log(httpsValue);
                            ports.push(`443:tcp:${httpsValue}`);
                            vscode.window.showInputBox({prompt:"Enter local SSH port", value: "32779"}).then( (sshValue) => {
                                console.log(sshValue);
                                ports.push(`22:tcp:${sshValue}`);
                                vscode.window.showInputBox({prompt:"Enter local SNMP port", value: "32780"}).then( async (snmpValue) => {
                                    console.log(snmpValue);
                                    ports.push(`161:upd:${snmpValue}`);
                                    if ( sshValue != "" && httpsValue != "" && httpValue != "" && snmpValue)
                                    {
                                        if ( await Helpers.isDockerAvailable() )
                                        {
                                            let isStarted = await Helpers.startContainer(selectedImage.label,ports)
                                            if ( isStarted )
                                            {
                                                vscode.window.showInformationMessage("Netscaler CPX container started.");
                                            }
                                            else
                                            {
                                                vscode.window.showErrorMessage("Unable to start the netscaler CPX container.");
                                            }
                                        }
                                        else
                                        {
                                            vscode.window.showErrorMessage("Unable to connect to the Docker daemon. Please make sure docker is installed and running.");
                                        }
                                    }
                                })    
                            });
                        });
                    });
                });
            }
        }
    });

    let stopCPXContainerCmd = vscode.commands.registerCommand('citrix.commands.stopcpxcontainer', async () => {
        if ( await Helpers.isDockerAvailable() )
        {
            //stop cpx container.
            let pickableContainers = await Helpers.listRunningCitrixContainers();
            console.log(pickableContainers);
            if ( pickableContainers.length > 0)
            {
                vscode.window.showQuickPick(pickableContainers).then( async (output ) => {
                    vscode.window.showInformationMessage(`Stopping container ${output.id}`);
                    let isStopped = await Helpers.stopContainer(output.id);
                    if ( isStopped)
                    {
                        vscode.window.showInformationMessage(`Removing container ${output.name}`);
                        let isRemoved = await Helpers.removeContainer(output.id);
                        if ( isRemoved)
                        {
                            vscode.window.showInformationMessage(`Removed container ${output.name}`);
                        }
                    }
                    else
                    {
                        vscode.window.showErrorMessage(`Error stopping container ${output.name}`);
                    }
                });
            }
        }
        else
        {
            vscode.window.showErrorMessage("Unable to connect to the Docker daemon. Please make sure docker is installed and running.");
        }
    });

    context.subscriptions.push(openDeveloperSiteCmd);
    context.subscriptions.push(openDeveloperFeedbackSiteCmd);
    context.subscriptions.push(openSDKDocCmd);
}

// this method is called when your extension is deactivated
export function deactivate() {
}