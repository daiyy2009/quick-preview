'use strict'
import * as vscode from 'vscode';
import HTMLDocumentContentProvider from './HTMLDocumentContentProvider';
import Utilities from './Utilities';


// This class initializes the previewmanager based on extension type and manages all the subscriptions
class PreviewManager {

    htmlDocumentContentProvider: HTMLDocumentContentProvider;
    disposable: vscode.Disposable;
    delayTime: Number = 100

    constructor() {
        this.htmlDocumentContentProvider = new HTMLDocumentContentProvider();

        vscode.workspace.onDidChangeTextDocument(this.onChangeTextContent, this);
        vscode.window.onDidChangeActiveTextEditor(this.onChangeActiveEditor, this);
    }

    private onChangeTextContent(e: vscode.TextDocumentChangeEvent) {
        if (Utilities.checkDocumentIs('javascript')) {
            this.debounce(this.refreshJavascriptContent, this.delayTime)(e)
        } else if (Utilities.checkDocumentIs('css')) {
            this.debounce(this.refreshCssContent, this.delayTime)(e)
        } else if (Utilities.checkDocumentIs('html') || Utilities.checkDocumentIs('xhtml')) {
            this.debounce(this.refreshHMTLContent, this.delayTime)(e)
        }
    }

    private debounce(fun, delay) {
        return (args) => {
            clearTimeout(fun.id)
            fun.id = setTimeout(() => {
                fun.call(this, args)
            }, delay)
        }
    }

    private refreshJavascriptContent(e: vscode.TextDocumentChangeEvent) {
        this.updateLinkData(e);
        Utilities.refreshContent();
    }

    private refreshCssContent(e: vscode.TextDocumentChangeEvent) {
        this.updateLinkData(e);
        Utilities.refreshContent();
    }

    private refreshHMTLContent() {
        Utilities.refreshContent();
    }

    private updateLinkData(e: vscode.TextDocumentChangeEvent) {
        let editorData = {
            key: e.document.fileName,
            value: e.document.getText()
        };
        this.htmlDocumentContentProvider.setChangedLinks(editorData);
    }

    private onChangeActiveEditor(e: vscode.TextEditor) {
        if ((Utilities.checkDocumentIs('html') || Utilities.checkDocumentIs('xhtml')) && this.htmlDocumentContentProvider.getTextEditor() != e) {
            this.htmlDocumentContentProvider.setTextEditor(e);

            Utilities.refreshContent();
        }
    }
}

let _instance = new PreviewManager();
export { _instance as PreviewManager };
