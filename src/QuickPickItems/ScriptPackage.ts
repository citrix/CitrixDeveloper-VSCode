import { QuickPickItem } from 'vscode';

export class ScriptPackage implements QuickPickItem
{
    label: string;    
    description?: string;
    link: string;
    detail?: string;
    picked?: boolean;
    author: string;
    version: string;

}