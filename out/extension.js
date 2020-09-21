"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const tasks_1 = require("./views/tasks");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "hoo-kit-vsc" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('hoo-kit.start', () => {
        vscode.window.showInformationMessage('start');
    });
    context.subscriptions.push(disposable);
    vscode.window.createTreeView('hoo-kit.tasks', {
        treeDataProvider: new tasks_1.TasksProvider()
    });
    vscode.commands.executeCommand('setContext', 'hoo-kit-active', false);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    // TODO
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map