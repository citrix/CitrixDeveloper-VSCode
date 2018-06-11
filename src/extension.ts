'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {Uri} from 'vscode';
const fs = require('fs');
import { CPXItem } from './QuickPickItems/CPXItem';
import * as Helpers from './helpers/docker';
import { SDKDocsProvider } from './Providers/SDKDocsProvider';
import { GithubProjectProvider } from './Providers/GithubProjectProvider';
import * as path from 'path';
import { PowershellProvider } from './Providers/PowershellProvider';
const cfs = require ('fs-copy-file-sync');
const jsonfile = require('jsonfile');
import * as fse from 'fs-extra';
import { mkdirSync } from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const sdkDocProvider = new SDKDocsProvider(context);
    vscode.window.registerTreeDataProvider('citrix.view.citrix-sdk-documentation',sdkDocProvider);
    
    const githubProvider = new GithubProjectProvider(context);
    vscode.window.registerTreeDataProvider('citrix.view.citrix-github-explorer',githubProvider);

    //test dynamic tree provider
    const powershellProvider = new PowershellProvider(context);
    vscode.window.registerTreeDataProvider('citrix.view.citrix-scripts',powershellProvider);
    //endtest
    vscode.commands.registerCommand('citrix.commands.downloaddockersfsample', () => {
        const terminal: vscode.Terminal = vscode.window.createTerminal('Docker');
        terminal.show();
        terminal.sendText(`docker run -d -p 5000:5000 citrixdeveloper/citrix-storefront-apidemo`);
    });

    vscode.commands.registerCommand('citrix.commands.downloadnetcoresfsample', () => {
        const config = vscode.workspace.getConfiguration('citrixdeveloper');
        //grab the clone directory that might be saved in the workspace settings.
        var baseCloneDir: string = config.get<string>('gitclonebasedirectory',"");
        //if nothing has been saved from previous clones, then set the base clone
        //dir to the users home directory.
        if ( baseCloneDir == "")
        {
            baseCloneDir = process.env.HOME;
        }
        //prompt the user for the location to clone the repo. This defaults to
       //the users home directory if they have not entered a setting before.
       vscode.window.showInputBox({prompt:"Enter location to clone repo:", value: baseCloneDir}).then( (location) => {
            if ( location != "" && location != null )
            {
                //validate our path ends with the right slashes
                if ( !location.endsWith("/"))
                {
                    location += "/";
                }
                //if the user has entered a ~ in the path, replace this with
                //their home directory
                if ( location.indexOf('~') > -1 )
                {
                    location = location.replace('~', process.env.HOME);
                }     
                //save the config
                try
                {
                    config.update('gitclonebasedirectory',location);
                }
                catch ( configSaveError )
                {
                    //print out the error message
                    console.log(configSaveError);
                }
                //get the project url from the object passed into the command event
                let projectUrl:string = "https://github.com/citrix/StorefrontSample-netcore";

                if ( projectUrl.endsWith("/"))
                {
                    //remove trailing slash
                    projectUrl = projectUrl.substring(0,projectUrl.length -1 );
                }

                let slashLoc = projectUrl.lastIndexOf("/");
                let dirName = projectUrl.substring(slashLoc + 1);

                let cloneLocation = location + dirName;

                var clone = require('git-clone');
                clone("https://github.com/citrix/StorefrontSample-netcore.git", cloneLocation,'', () => {
                    //once repo is cloned, open the folder in a new instance of vcode.
                    let uri = Uri.parse(`file://${cloneLocation}`);
                    let success = vscode.commands.executeCommand('vscode.openFolder', uri);
                });
            }
        }); 
    });

    let openDeveloperSiteCmd = vscode.commands.registerCommand('citrix.commands.openCitrixDeveloperSite', () => {
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
        //get the config options for citrixdeveloper
        const config = vscode.workspace.getConfiguration('citrixdeveloper');
        //grab the clone directory that might be saved in the workspace settings.
        var baseCloneDir: string = config.get<string>('gitclonebasedirectory',"");
        //if nothing has been saved from previous clones, then set the base clone
        //dir to the users home directory.
        if ( baseCloneDir == "")
        {
            baseCloneDir = process.env.HOME;
        }

        //prompt the user for the location to clone the repo. This defaults to
        //the users home directory if they have not entered a setting before.
        vscode.window.showInputBox({prompt:"Enter location to clone repo:", value: baseCloneDir}).then( (location) => {
            if ( location != "" && location != null )
            {
                //validate our path ends with the right slashes
                if ( !location.endsWith("/"))
                {
                    location += "/";
                }
                //if the user has entered a ~ in the path, replace this with
                //their home directory
                if ( location.indexOf('~') > -1 )
                {
                    location = location.replace('~', process.env.HOME);
                }     
                //save the config
                try
                {
                    config.update('gitclonebasedirectory',location);
                }
                catch ( configSaveError )
                {
                    //print out the error message
                    console.log(configSaveError);
                }
                //get the project url from the object passed into the command event
                let projectUrl:string = RepoInfo.Project.projectURL;

                if ( projectUrl.endsWith("/"))
                {
                    //remove trailing slash
                    projectUrl = projectUrl.substring(0,projectUrl.length -1 );
                }

                let slashLoc = projectUrl.lastIndexOf("/");
                let dirName = projectUrl.substring(slashLoc + 1);

                let cloneLocation = location + dirName;

                var clone = require('git-clone');
                clone(RepoInfo.Project.cloneURL, cloneLocation,'', () => {
                    //once repo is cloned, open the folder in a new instance of vcode.
                    let uri = Uri.parse(`file://${cloneLocation}`);
                    let success = vscode.commands.executeCommand('vscode.openFolder', uri);
                });
            }
        });
    });

    vscode.commands.registerCommand('citrix.commands.installpackage', () => {
        vscode.window.showOpenDialog({
            openLabel:"Select VSIX",
            canSelectMany: false,
            canSelectFolders: false,
            filters: {
                'Citrix Script Packages': ['vsix']
            }
        })
        .then( (file) => {
            const admzip = require('adm-zip');
            var fileName = path.basename(file[0].fsPath);
            var ext = path.extname(fileName);
            var baseName = path.basename(file[0].fsPath,'.vsix');
            //copy file first
            
            cfs(file[0].fsPath,`${context.extensionPath}/packages/${baseName}.zip`);
            var zip = new admzip(`${context.extensionPath}/packages/${baseName}.zip`);
            
            zip.extractAllTo(`${context.extensionPath}/`,true);
            fs.unlinkSync(`${context.extensionPath}/packages/${baseName}.zip`);
            
            //load the manifest file to get the name and description
            //read the manifest file
            const manifestFile = `${context.extensionPath}/packages/${baseName}/manifest.json`;
            const manifest = jsonfile.readFileSync(manifestFile);
            console.log(manifest.packageName);

            vscode.window.showInformationMessage(`Installed Citrix script package ${manifest.packageName}.`)

            
            powershellProvider.refreshPackages();
        });
    })
    
    let scriptClickCmd = vscode.commands.registerCommand('citrix.commands.loadscript', (scriptObj) => {
        console.log(scriptObj.location);
        // vscode.commands.executeCommand()
        
        vscode.workspace.openTextDocument(scriptObj.location)
        .then((doc) => {
            vscode.window.showTextDocument(doc);
        });        
    });
    let openGithubRepo = vscode.commands.registerCommand('citrix.commands.context.openghsite', RepoInfo => {
        const uri = vscode.Uri.parse(RepoInfo.Project.projectURL);
        vscode.commands.executeCommand('vscode.open', uri);
    });

    let openGithubProjectSite = vscode.commands.registerCommand('citrix.commands.context.openprojectsite', RepoInfo => {
        const uri = vscode.Uri.parse(RepoInfo.Project.prettySite);
        vscode.commands.executeCommand('vscode.open', uri);
    });

    let openGithubProjectIssues = vscode.commands.registerCommand('citrix.commands.context.openprojectissues', RepoInfo => {
        const uri = vscode.Uri.parse(RepoInfo.Project.projectURL + "/issues");
        vscode.commands.executeCommand('vscode.open', uri);
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

    let deletePackageCmd = vscode.commands.registerCommand('citrix.commands.context.deletepackage', (viewItem) => {
        console.log(viewItem.PSDoc.location);
        fse.removeSync(viewItem.PSDoc.location);
        //need to inform the user that the package was deleted
        powershellProvider.refreshPackages();
        vscode.window.showInformationMessage(`Citrix package ${viewItem.PSDoc.name} deleted`);
    });

    context.subscriptions.push(openDeveloperSiteCmd);
    context.subscriptions.push(openDeveloperFeedbackSiteCmd);
    context.subscriptions.push(openSDKDocCmd);
}

// this method is called when your extension is deactivated
export function deactivate() {
}