import path = require('path');
import * as vscode from 'vscode';
import { ConfigPaths } from '../config';
import { listenForPublicContext } from '../extension';
import { HookitTask } from '@wow-kit/hoo-kit/dist/types';

export class TasksProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	private workspaces: Map<string, HookitTask[]>;

	private _onDidChangeTreeData: vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
	readonly onDidChangeTreeData: vscode.Event<undefined> = this._onDidChangeTreeData.event;

	constructor() {
		this.workspaces = new Map();
		vscode.workspace.workspaceFolders?.map((ws) => {
			// TODO: read hookit.json from workspace
			// for now we get the task definitons from the config
			const config = vscode.workspace.getConfiguration(ConfigPaths.HooKit, ws.uri);
			const tasks = config.get(ConfigPaths.Tasks) as HookitTask[];
			this.workspaces.set(ws.name, tasks || []);
		});

		// TODO: hook onto hoo-kit task & instance changes
		// this._onDidChangeTreeData.fire(undefined)
		listenForPublicContext('running', this.refresh.bind(this));
	}

	refresh() {
		this._onDidChangeTreeData.fire(undefined);
	}

	getChildren(element?: HookitWorkspaceItem | HookitTaskItem): Thenable<vscode.TreeItem[]> {
		if (element) {
			if ('task' in element) {
				// this is a task so we dont return children
				return Promise.resolve([]);
			} else {
				return Promise.resolve(
					element.tasks.map((task) => {
						return new HookitTaskItem(task.name, task);
					})
				);
			}
		} else {
			return Promise.resolve(
				Array.from(this.workspaces.entries()).map((entry) => {
					// create parents for workspaces
					return new HookitWorkspaceItem(entry[0], entry[1]);
				})
			);
		}
	}

	getTreeItem(element: HookitTaskItem) {
		return element;
	}
}

class HookitWorkspaceItem extends vscode.TreeItem {
	constructor(label: string, public tasks: HookitTask[]) {
		super(label, tasks.length === 0 ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded);
		this.contextValue = 'tasks';
	}
}

export class HookitTaskItem extends vscode.TreeItem {
	constructor(label: string, public task: HookitTask) {
		super(label);
		this.contextValue = task.active ? 'active' : 'inactive';
		this.iconPath = path.join(__filename, '..', '..', '..', 'resources', 'icons', task.active ? 'active.svg' : 'inactive.svg');
	}
}
