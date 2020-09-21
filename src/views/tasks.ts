import * as vscode from 'vscode';

export class TasksProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
		if (element) {
			return Promise.resolve([]);
		} else {
			return Promise.resolve([
				new vscode.TreeItem('TestTaskV1', vscode.TreeItemCollapsibleState.None),
				new vscode.TreeItem('TestTaskV2', vscode.TreeItemCollapsibleState.None),
				new vscode.TreeItem('TestTaskV3', vscode.TreeItemCollapsibleState.None)
			]);
		}
	}

	getTreeItem(element: vscode.TreeItem) {
		return element;
	}
}
