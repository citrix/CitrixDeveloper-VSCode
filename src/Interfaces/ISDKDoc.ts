import {ISDKSubPage} from './ISDKSubPage'

export interface ISDKDoc
{
    sdktitle: string;
    sdkmainurl:string;
    pages: Array<ISDKSubPage>;
}