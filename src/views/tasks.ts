import * as vscode from 'vscode';
import { ConfigPaths } from '../config';
import { getConfig } from '../extension';
import { HookitTask } from '../types';

export class TasksProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	private workspaces: Map<string, HookitTask[]>;

	constructor() {
		this.workspaces = new Map();
		vscode.workspace.workspaceFolders?.map((ws) => {
			// TODO: read hookit.json from workspace
			// for now we get the task definitons from the config
			const config = vscode.workspace.getConfiguration(ConfigPaths.HooKit, ws.uri);
			const tasks = config.get(ConfigPaths.Tasks) as HookitTask[];
			this.workspaces.set(ws.name, tasks || []);
		});
	}

	getChildren(element?: HookitWorkspaceItem | HookitTaskItem): Thenable<vscode.TreeItem[]> {
		if (element) {
			if ('task' in element) {
				// this is a task so we dont return children
				return Promise.resolve([]);
			} else {
				return Promise.resolve(
					element.tasks.map((task) => {
						return new HookitTaskItem(task.name, vscode.TreeItemCollapsibleState.None, task);
					})
				);
			}
		} else {
			return Promise.resolve(
				Array.from(this.workspaces.entries()).map((entry) => {
					// create parents for workspaces
					return new HookitWorkspaceItem(
						entry[0],
						entry[1].length === 0 ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded,
						entry[1]
					);
				})
			);
		}
	}

	getTreeItem(element: HookitTaskItem) {
		return element;
	}
}

class HookitWorkspaceItem extends vscode.TreeItem {
	constructor(label: string, callapsibleState: vscode.TreeItemCollapsibleState, public tasks: HookitTask[]) {
		super(label, callapsibleState);
		this.contextValue = 'tasks';
	}
}

class HookitTaskItem extends vscode.TreeItem {
	constructor(label: string, callapsibleState: vscode.TreeItemCollapsibleState, public task: HookitTask) {
		super(label, callapsibleState);
		this.contextValue = task.active ? 'taskActive' : 'taskInactive';
	}
}
