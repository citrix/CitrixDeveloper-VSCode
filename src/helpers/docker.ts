import {DockerImage} from '../Model/DockerImage';
import {Container} from '../Model/Container';

var Docker = require('dockerode');

export async function isDockerAvailable() : Promise<boolean>
{
    return new Promise<boolean>( (resolve, reject ) => {
        console.log("beginning of function");
        try
        {
            var dockerClient = new Docker();
            dockerClient.listImages({}, (err, images) => {
                if ( err )
                {
                    return resolve(false);
                }
                else
                {
                    return resolve(true);
                }
            });
        }
        catch ( dockerError )
        {
            return resolve(false);
        }
    console.log("End of function");
    });
}
export async function isImageAvailable(imageID : string ) : Promise<boolean>
{
    return new Promise<boolean>( (resolve, reject ) => {
        var dockerClient = new Docker();
        dockerClient.listImages({}, (err, images) => {
            if ( err )
            {
                return resolve(false);
            }
            else
            {
                return resolve(true);
            }
        });
    console.log("End of function");
    });
}

export async function listRunningCitrixContainers() : Promise<Array<Container>>
{
    return new Promise<Array<Container>>( (resolve, reject) => {
        let runningContainers = new Array<Container>();

        let dockerClient = new Docker();
        
        dockerClient.listContainers(function (err, containers) {
            containers.forEach( containerInfo => {
                //if ( containerInfo.State == "running")
                //{
                    let containerToAdd = new Container();
                    containerToAdd.id = containerInfo.Id;
                    containerToAdd.name = containerInfo.Names[0];
                    containerToAdd.label = containerInfo.Names[0];
                    runningContainers.push(containerToAdd);
//                    let container = dockerClient.getContainer(containerInfo.id);
//                    console.log(container);
                //}
            });
            return resolve(runningContainers);
        });
    });
}
    export async function listCitrixImages( ) : Promise<Array<DockerImage>>
    {
        return new Promise<Array<DockerImage>>( (resolve, reject ) => {
            let citrixImages = new Array<DockerImage>();

            let dockerClient = new Docker();
            dockerClient.listImages({}, (err, images) => {
                images.forEach( image => {
                    let allRepoTags = image.RepoTags;
                    let repoTags = allRepoTags[0].split(":");
                    let imageName = repoTags[0];
                    let imageTag = repoTags[1];
                    if ( imageName.toLowerCase().indexOf("citrix") > -1 )
                    {
                        let citrixImage = new DockerImage();
                        citrixImage.Id = image.Id;
                        citrixImage.Tag = imageTag;
                        citrixImage.Name = imageName;
                        citrixImage.label = imageName + ":" + imageTag;

                        citrixImages.push(citrixImage);
                    }
                });

                return resolve(citrixImages);
            });
        });
    }
    export async function stopContainer( containerID: string) : Promise<boolean>
    {
        var dockerClient = new Docker();
        
        return new Promise<boolean>( (resolve,reject) => {
            let container = dockerClient.getContainer(containerID);
            if ( container != null )
            {
                container.stop( (err,data) => {
                    if ( err != null )
                    {
                        return resolve(false);
                    }
                    else
                    {
                        return resolve(true);
                    }
                });
            }
            else
            {
                return resolve(false);
            }
            
        });
    }
    export async function removeContainer( containerID: string) : Promise<boolean>
    {
        var dockerClient = new Docker();
        
        return new Promise<boolean>( (resolve,reject) => {
            let container = dockerClient.getContainer(containerID);
            if ( container != null )
            {
                container.remove( (err,data) => {
                    if ( err != null )
                    {
                        return resolve(false);
                    }
                });
            }
            return resolve(true);
        });
    }
    export async function startContainer( image: string, ports: string[] ) : Promise<boolean>
    {
        var dockerClient = new Docker();

        return new Promise<boolean>( (resolve,reject) => {
            //create the port config
            //"80/tcp":[{HostIp:'0.0.0.0',HostPort:'8001'}]
            let portBindings = "{";

            ports.forEach(port => {
                let mapping = port.split(':');
                portBindings += `"${mapping[0]}/${mapping[1]}":[{"HostIp":"", "HostPort":"${mapping[2]}"}],`;
            });

            if ( portBindings.endsWith(","))
            {
                portBindings = portBindings.substr(0, portBindings.length -1);
                portBindings += "}";
            }

            let containerPortBindings = JSON.parse(portBindings);
            
            try
            {
                dockerClient.createContainer({Image: image, Name: "netscaler-dev", 
                                                HostConfig: { 
                                                    PortBindings:containerPortBindings,
                                                    PublishAllPorts: true }
                                            }, (err ,container) => {
                    if ( err == null )
                    {
                        console.log(`created container: ${container.id}`);
                        container.start({}, (err, data) => {
                            console.log('started container');
                            console.log(data);
                        });
                    }
                    else
                    {
                        console.log(err);
                    }
                });
            }
            catch ( startError )
            {
                console.log(startError);
                return resolve(false);
            }
           return resolve(true);
        });
    }
