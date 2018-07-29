"use strict"
import * as vscode from 'vscode';
import { PreviewManager } from './PreviewManager'
import * as Constants from './Constants'

export default class Utilities {
    //returns true if an html document is open
    constructor() { };
    static checkDocumentIsHTML(showWarning: boolean): boolean {
        let result = vscode.window.activeTextEditor.document.languageId.toLowerCase() === "html"
        if (!result && showWarning) {
            vscode.window.showInformationMessage(Constants.ErrorMessages.NO_HTML);
        }
        return result;
    }

    static checkDocumentIs(languageId: string): boolean {
        return vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId.toLowerCase() === languageId;
    }

    static init(viewColumn: number, context: vscode.ExtensionContext, previewUri: vscode.Uri) {
        let proceed = this.checkDocumentIsHTML(true);
        if (proceed) {
            let registration = vscode.workspace.registerTextDocumentContentProvider('HTMLPreview', PreviewManager.htmlDocumentContentProvider);
            return vscode.commands.executeCommand('vscode.previewHtml', previewUri, viewColumn, 'Preview').then(() => {
                console.log('[quick preview] preview html success!')
            });
        }
    }
}