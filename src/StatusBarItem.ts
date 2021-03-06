"use strict"
import * as vscode from 'vscode'
import Utilities from "./Utilities"
import * as Constants from './Constants'

export default class StatusBarItem {

    statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.statusBarItem.command = "extension.sidePreview";
        this.statusBarItem.tooltip = Constants.ExtensionConstants.STATUS_BAR_TOOLTIP;
    }

    updateStatusbar() {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.statusBarItem.hide();
            return;
        }
        // Only update status if an HTML file
        if (Utilities.checkDocumentIsHTML(false)) {
            this.statusBarItem.text = Constants.ExtensionConstants.STATUS_BAR_TEXT;
            this.statusBarItem.show();
        }
        else {
            this.statusBarItem.hide();
        }
    }
}