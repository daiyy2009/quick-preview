'use strict'
import * as vscode from 'vscode';
import HTMLDocumentContentProvider from './HTMLDocumentContentProvider';
import Utilities from './Utilities';


// This class initializes the previewmanager based on extension type and manages all the subscriptions
class PreviewManager {

    htmlDocumentContentProvider: HTMLDocumentContentProvider;
    disposable: vscode.Disposable;

    constructor() {
        this.htmlDocumentContentProvider = new HTMLDocumentContentProvider();
        this.htmlDocumentContentProvider.generateHTML();
        // subscribe to selection change event
        let subscriptions: vscode.Disposable[] = [];
        vscode.workspace.onDidChangeTextDocument(this.onChangeTextContent, this, subscriptions);
        vscode.window.onDidChangeActiveTextEditor(this.onChangeActiveEditor, this, subscriptions);
        this.disposable = vscode.Disposable.from(...subscriptions);
    }

    dispose() {
        this.disposable.dispose();
    }

    private onChangeTextContent(e: vscode.TextDocumentChangeEvent) {
        if (Utilities.checkDocumentIs('javascript') || Utilities.checkDocumentIs('css')) {
            let editorData = {
                key: e.document.fileName,
                value: e.document.getText()
            };
            this.htmlDocumentContentProvider.setChangedLinks(editorData);
        }

        Utilities.refreshContent();
    }

    private onChangeActiveEditor(e: vscode.TextEditor) {
        if (Utilities.checkDocumentIs('html') && this.htmlDocumentContentProvider.getTextEditor() != e) {
            this.htmlDocumentContentProvider.setTextEditor(e);

            Utilities.refreshContent();
        }
    }
}

let _instance = new PreviewManager();
export { _instance as PreviewManager };