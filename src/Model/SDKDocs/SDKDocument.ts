'use strict';
import * as vscode from 'vscode';
import { SDKDocumentSubPage } from './SDKDocumentSubPage';

export class SDKDocument
{
    constructor( public readonly label: string,
                 public readonly link: string,
                public readonly subpages: Array<SDKDocumentSubPage>) {
    }

}