'use strict'
import * as vscode from 'vscode'
import HTMLDocumentContentProvider from './HTMLDocumentContentProvider'
import Utilities from './Utilities'
import StatusBarItem from './StatusBarItem'
import * as Constants from './Constants'


// This class initializes the previewmanager based on extension type and manages all the subscriptions
class PreviewManager {

    htmlDocumentContentProvider: HTMLDocumentContentProvider;
    disposable: vscode.Disposable;
    statusBarItem: StatusBarItem;

    constructor(utilities?: Utilities, htmlDocumentContentProvider?: HTMLDocumentContentProvider) {
        this.htmlDocumentContentProvider = new HTMLDocumentContentProvider();
        this.htmlDocumentContentProvider.generateHTML();
        // subscribe to selection change event
        let subscriptions: vscode.Disposable[] = [];
        vscode.window.onDidChangeTextEditorSelection(this.onChangeContent, this, subscriptions);
        vscode.window.onDidChangeActiveTextEditor(this.onChangeActiveEditor, this);
        this.disposable = vscode.Disposable.from(...subscriptions);
    }

    dispose() {
        this.disposable.dispose();
    }

    private onChangeContent(e: vscode.TextEditorSelectionChangeEvent) {
        if (Utilities.checkDocumentIs('javascript') || Utilities.checkDocumentIs('css')) {
            let editorData = {
                key: e.textEditor.document.fileName,
                value: e.textEditor.document.getText()
            };
            this.htmlDocumentContentProvider.setChangedLinks(editorData);
        }
        this.htmlDocumentContentProvider.refresh();
    }

    private onChangeActiveEditor(e: vscode.TextEditor) {
        if (Utilities.checkDocumentIs('html') && this.htmlDocumentContentProvider.getTextEditor() != e) {
            this.htmlDocumentContentProvider.setTextEditor(e);
            this.htmlDocumentContentProvider.refresh();
        }
    }
}

let _instance = new PreviewManager();
export { _instance as PreviewManager };