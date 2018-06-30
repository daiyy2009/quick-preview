"use strict"
import * as vscode from 'vscode'
import * as path from "path";
import * as Constants from './Constants'

const cheerio = require('cheerio')
const PREFIX_LINK = 'qp';
const ATTRS = ['src', 'href'];

/**
 * HTMLDocumentContentProvider 
 */
export default class HTMLDocumentContentProvider implements vscode.TextDocumentContentProvider {

    private _onDidChange: vscode.EventEmitter<vscode.Uri>;
    private _textEditor: vscode.TextEditor;
    private _changedLinks = new Map<string, string>();

    constructor() {
        this._onDidChange = new vscode.EventEmitter<vscode.Uri>();
        this._textEditor = vscode.window.activeTextEditor;
    }

    provideTextDocumentContent(uri: vscode.Uri): string {
        return this.generateHTML();
    };

    public generateHTML(): string {
        let plainText: string = this._textEditor.document.getText();
        let html = this.fixLinks(plainText);
        let changedHtmlContent = this.addChangedLinkContent(html);
        let htmlWithStyle = this.addStyles(changedHtmlContent);
        return htmlWithStyle;
    }

    // Thanks to Thomas Haakon Townsend for coming up with this regex
    private fixLinks(html: string): string {
        let documentFileName = this._textEditor.document.fileName;
        return html.replace(
            new RegExp(`((?:${ATTRS.join('|')})=[\'\"])((?!http|\\/).*?)([\'\"])`, "gmi"),
            (subString: string, p1: string, p2: string, p3: string): string => {
                let fsPath = vscode.Uri.file(path.join(
                    path.dirname(documentFileName),
                    p2
                )).fsPath;

                let changedLinkPath = this._changedLinks.get(fsPath);
                if (changedLinkPath) {
                    return [
                        `${PREFIX_LINK}-${p1}`,
                        fsPath,
                        p3
                    ].join("");
                } else {
                    return [
                        p1,
                        vscode.Uri.file(path.join(
                            path.dirname(documentFileName),
                            p2
                        )),
                        p3
                    ].join("");
                }
            }
        );
    }

    private addChangedLinkContent(content: string): string {
        const $ = cheerio.load(content);
        const supportAttrs = ['src', 'href']
        ATTRS.forEach((value) => {
            let linkAttr = `${PREFIX_LINK}-${value}`;
            let $changedLink = $(`[${linkAttr}]`);
            if ($changedLink.length != 0) {
                let fsPath = $changedLink.attr(linkAttr);
                if ($changedLink[0].name === 'link') {
                    $changedLink.after(`
                        <style type="text/css">
                        ${this._changedLinks.get(fsPath)}
                        </style>`);
                } else {
                    $changedLink.html(this._changedLinks.get(fsPath));
                }
            }
        });

        return $.html();
    }

    public refresh() {
        this._onDidChange.fire(vscode.Uri.parse(Constants.ExtensionConstants.PREVIEW_URI));
    }

    setChangedLinks({ key, value }) {
        this._changedLinks.set(key, value);
    }

    clearChangedLinks() {
        this._changedLinks.clear();
    }

    getTextEditor(): vscode.TextEditor {
        return this._textEditor;
    }

    setTextEditor(te: vscode.TextEditor) {
        this._textEditor = te;
    }

    // Add styles to the current HTML so that it is displayed corectly in VS Code
    private addStyles(html: string): string {
        let extensionPath = vscode.extensions.getExtension(Constants.ExtensionConstants.EXTENSION_ID).extensionPath;
        let style_path = vscode.Uri.file(`${extensionPath}/${Constants.ExtensionConstants.CUSTOM_CSS_PATH}`);
        let styles: string = `<link href="${style_path}" rel="stylesheet" />`;
        return html + styles;
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }
}
