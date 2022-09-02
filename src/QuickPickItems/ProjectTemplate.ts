import { QuickPickItem } from 'vscode'

export class ProjectTemplate implements QuickPickItem
{
    public label: string = "Need to set label";
    public location:string = "";
    public templateZipFilename = "";
}