'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {Uri} from 'vscode';
import { CPXItem } from './QuickPickItems/CPXItem';
import * as Helpers from './helpers/docker';
import { SDKDocsProvider } from './Providers/SDKDocsProvider';
import { GithubProjectProvider } from './Providers/GithubProjectProvider';
import * as path from 'path';
const cfs = require ('fs-copy-file-sync');
const jsonfile = require('jsonfile');
import * as fse from 'fs-extra';
import * as fs from 'fs';
import { URL } from 'url';
import { ScriptPackage } from './QuickPickItems/ScriptPackage';
let Parser = require('rss-parser');
let parser = new Parser();
// const fs = require('fs');
var os = require('os');
const admzip = require('adm-zip');
import * as rp from 'request-promise';
import { ScriptProvider } from './Providers/ScriptProvider';
import { ScriptNode } from './Model/Script/ScriptNode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const sdkDocProvider = new SDKDocsProvider(context);
    vscode.window.registerTreeDataProvider('citrix.view.citrix-sdk-documentation',sdkDocProvider);
    
    const githubProvider = new GithubProjectProvider(context);
    vscode.window.registerTreeDataProvider('citrix.view.citrix-github-explorer',githubProvider);

    //testing
    const scriptProvider = new ScriptProvider(context);
    vscode.window.registerTreeDataProvider('citrix.view.citrix-scripts',scriptProvider);
    //end of testing

    var oldPackageDir = `${context.extensionPath}/packages`;
    
    if ( fs.existsSync(oldPackageDir))
    {
        var oldTemplateDirs = fs.readdirSync(oldPackageDir);

        if ( oldTemplateDirs.length > 0)
        {
            vscode.window.showInformationMessage('We have moved the templates to a different location from version 1.5.1 and above. We can help you migrate your script packages, would you like to us to migrate your packages for you?',
            ...['Yes', 'No'])
            .then(answer => {
                if ( answer.toLowerCase() === 'yes')
                {
                    try
                    {
                        //copy the whole packages directory over.
                        fse.copySync(oldPackageDir,templateDir);

                        //delete the old packages folder.
                        fse.removeSync(oldPackageDir);

                        //refresh list.
                        scriptProvider.refreshPackages();
                    }
                    catch ( copyError )
                    {
                        //inform the user
                        vscode.window.showErrorMessage(`Unable to migrate script packages. Error message: ${copyError}`)
                    }
                }
            });
        }
    }

    //create the base template directory in the home citrix
    //call .citrix
    var homedir = require('os').homedir();
    var templateDir = path.normalize(`${homedir}/.citrix/packages`);

    if ( !fs.existsSync(templateDir) )
    {
        fs.mkdirSync(templateDir);
    }

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
        //prompt the user for a local install or to query the list
        //vsix repos listed in the user settings (vsixrepositories)
        let installTypes = ['Select local package','Select package from configured sources'];
        vscode.window.showQuickPick(installTypes).then( async (selectOption) => {
            console.log(selectOption);
            switch (selectOption.toLowerCase()) {
                case 'select local package':
                    vscode.window.showOpenDialog({
                        openLabel:"Select VSIX",
                        canSelectMany: false,
                        canSelectFolders: false,
                        filters: {
                            'Citrix Script Packages': ['vsix']
                        }
                    })
                    .then( (file) => {
                        var fileName = path.basename(file[0].fsPath);
                        var ext = path.extname(fileName);
                        var baseName = path.basename(file[0].fsPath,'.vsix');
                        
                        var homedir = require('os').homedir();
                        var citrixHomeDir = path.normalize(`${homedir}/.citrix`);
                        
                        //copy file first
                        
                        cfs(file[0].fsPath,`${citrixHomeDir}/packages/${baseName}.zip`);
                        var zip = new admzip(`${citrixHomeDir}/packages/${baseName}.zip`);
                        
                        zip.extractAllTo(`${citrixHomeDir}/`,true);
                        fs.unlinkSync(`${citrixHomeDir}/packages/${baseName}.zip`);
                        
                        //load the manifest file to get the name and description
                        //read the manifest file
                        const manifestFile = `${citrixHomeDir}/packages/${baseName}/manifest.json`;
                        const manifest = jsonfile.readFileSync(manifestFile);
                        console.log(manifest.packageName);
            
                        vscode.window.showInformationMessage(`Installed Citrix script package ${manifest.packageName}.`)

                        scriptProvider.refreshPackages();
                    });
                    break;
                case 'select package from configured sources':
                    const config = vscode.workspace.getConfiguration('citrixdeveloper');
                    var vsixRepositories: Array<string> = config.get<Array<string>>('vsixrepositories',[]);
                    let availablePackages: Array<ScriptPackage> = new Array<ScriptPackage>();

                    if ( vsixRepositories.length == 0 )
                    {
                        vscode.window.showErrorMessage('You don\'t seem to have any VSIX repositories configured. Please configure a repository in the user setting > Citrix Developer section');
                        return;
                    }
                    for (const repo of vsixRepositories) 
                    {
                        let rssContents = null;
                        if ( repo.toLowerCase().indexOf('file:') != -1 )
                        {
                            //file url
                            let fileUrl = new URL(repo);
                            rssContents = fs.readFileSync(fileUrl,'utf8');
                        }
                        else
                        {
                            try 
                            {
                                rssContents = await rp(repo);    
                            } 
                            catch (error) 
                            {
                                console.log(error);
                                
                            }
                            
                        }
                        if ( rssContents == null )
                        {
                            vscode.window.showErrorMessage(`Unable to retrieve a listing of Citrix script packages from the configured source ${repo}.`);
                        }
                        else
                        {
                            var items = await parser.parseString(rssContents);
                            items.items.forEach(item => {
                                let scriptPackage = new ScriptPackage();
                                scriptPackage.label = (item.author == null) ? item.title : `(${item.author.toLowerCase()}) ${item.title}`;
                                scriptPackage.description = (item.content == null) ? '' : item.content;
                                scriptPackage.link = item.link;
                                scriptPackage.author = (item.author == null) ? 'unknown' : item.author.toLowerCase();
                                availablePackages.push(scriptPackage);
                            });
                        }
                    }
                    if ( availablePackages.length > 0)
                    {
                        vscode.window.showQuickPick(availablePackages).then(async citrixPackage => {
                            var homedir = require('os').homedir();
                            var citrixHomeDir = path.normalize(`${homedir}/.citrix`);
                    
                            let tempFilePath = path.normalize(`${citrixHomeDir}/${path.basename(citrixPackage.link)}`);

                            var vsixFile = null;

                            if ( citrixPackage.link.toLowerCase().indexOf('file://') != -1 )
                            {
                                var fileUrl = new URL(citrixPackage.link);
                                vsixFile = fs.readFileSync(fileUrl);                                
                            }
                            else
                            {
                                var requestOptions = {
                                    url: citrixPackage.link,
                                    encoding: null,
                                    method: "GET",
                                    headers: {
                                        "Content-Type": "application/zip"
                                    }
                                };

                                vsixFile = await rp(requestOptions);
                            }
                            
                            if ( vsixFile === null )
                            {
                                //inform user of error
                                vscode.window.showErrorMessage('Unable to download selected script package. Please verify the feed url is up to date.')
                                return;
                            }
                            else
                            {
                                //save file to disk
                                fs.writeFileSync(tempFilePath,vsixFile);
                            }
                        

                            let zip = new admzip(tempFilePath);
                                
                            zip.extractAllTo(`${citrixHomeDir}/`,true);
                            fs.unlinkSync(tempFilePath);
                            
                            //load the manifest file to get the name and description
                            //read the manifest file
                            var baseName = path.basename(tempFilePath,'.vsix');
                            const manifestFile = `${citrixHomeDir}/packages/${baseName}/manifest.json`;
                            const manifest = jsonfile.readFileSync(manifestFile);
                
                            vscode.window.showInformationMessage(`Installed Citrix script package ${manifest.packageName}.`)

                            scriptProvider.refreshPackages();
                        });
                    }
                    else
                    {
                        vscode.window.showInformationMessage(`We are sorry, we could not find any Citrix script packages in the RSS feed sources you have configured. Please review your Citrix script packages feeds and try again.`);
                    }
                    break;
                default:
                    break;
            }
        });

    })
    
    let scriptClickCmd = vscode.commands.registerCommand('citrix.commands.loadscript', (scriptObj: ScriptNode) => {
        //ask the user if they would like to add the script to the current working
        //folder. If yes then copy the template file into the working folder.
        //if no then just open the text document        
        vscode.window.showInformationMessage('Would you like to add this file to your open workspace?',...['Yes','No'])
        .then((answer) => {
            if ( answer.toLowerCase() === 'yes')
            {
                var workspaceFolders = vscode.workspace.workspaceFolders;
                if ( workspaceFolders != undefined )
                {
                    var workspaceFolder = workspaceFolders[0];
                    var newFilePath = `${workspaceFolder.uri.fsPath}/${scriptObj.label}`
                    
                    fse.copySync(`${scriptObj.path}`, newFilePath);
                }
                else
                {
                    vscode.window.showWarningMessage('You need to have a folder open before you can copy the file to your working workspace. Please open a folder then try again.');
                }
            }
            else
            {
                vscode.workspace.openTextDocument(scriptObj.path)
                .then((doc) => {
                    vscode.window.showTextDocument(doc);
                });  
            }
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

    let deletePackageCmd = vscode.commands.registerCommand('citrix.commands.context.deletepackage', (viewItem: ScriptNode) => {
        fse.removeSync(path.normalize(viewItem.path));
        //need to inform the user that the package was deleted
        scriptProvider.refreshPackages();
        vscode.window.showInformationMessage(`Citrix package ${viewItem.label} deleted`);
    });

    let addScriptFileToProjectCmd = vscode.commands.registerCommand('citrix.commands.context.addpstoproject', (viewItem) => {
        console.log(viewItem);
    });

    context.subscriptions.push(openDeveloperSiteCmd);
    context.subscriptions.push(openDeveloperFeedbackSiteCmd);
    context.subscriptions.push(openSDKDocCmd);
}

// this method is called when your extension is deactivated
export function deactivate() {

}