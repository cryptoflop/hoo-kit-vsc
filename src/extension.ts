// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TasksProvider } from './views/tasks';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
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
		treeDataProvider: new TasksProvider()
	});

	vscode.commands.executeCommand('setContext', 'hoo-kit-active', false);
}

// this method is called when your extension is deactivated
export function deactivate() {
	// TODO
}
