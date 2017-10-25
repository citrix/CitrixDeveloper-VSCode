'use strict';
import * as vscode from 'vscode';

export class GithubProject 
{
    constructor(public readonly title: string,
                public readonly description: string,
                public readonly projectURL: string,
                public readonly cloneURL: string
                ) {

    }
}
