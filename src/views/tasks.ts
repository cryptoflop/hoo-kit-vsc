import path = require('path');
import * as vscode from 'vscode';
import { ConfigPaths } from '../config';
import { listenForPublicContext } from '../extension';
import { HookitTask } from '@wow-kit/hoo-kit/dist/types';
import { TaskInstance } from '@wow-kit/hoo-kit/dist/event-system/task-manager';

export class TasksProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
	readonly onDidChangeTreeData: vscode.Event<undefined> = this._onDidChangeTreeData.event;

	private tasks: { [taskName: string]: HookitTask } = {};
	private taskInstances: { [taskName: string]: TaskInstance } = {};

	constructor() {
		listenForPublicContext('running', this.refresh.bind(this));
	}

	tasksChanged(tasks: HookitTask[]) {
		tasks.forEach((task) => (this.tasks[task.name] = task));
		this.refresh();
	}

	taskInstancesChanged(taskInstances: TaskInstance[]) {
		taskInstances.forEach((taskInstance) => {
			this.taskInstances[taskInstance.task.name] = taskInstance;
		});
		this.refresh();
	}

	refresh() {
		this._onDidChangeTreeData.fire(undefined);
	}

	getChildren(element?: HookitTaskItem | HookitTaskSessionItem): Thenable<vscode.TreeItem[]> {
		if (element && 'task' in element) {
			// return sessions
			return Promise.resolve(
				this.taskInstances[element.task.name]?.sessions.map((_, index) => new HookitTaskSessionItem('Session #' + index)) || []
			);
		} else {
			// return tasks
			return Promise.resolve(
				Object.keys(this.tasks).map((taskName) => {
					const task = this.tasks[taskName];
					const hasChildren = !!this.taskInstances[taskName]?.sessions.length;
					return new HookitTaskItem(task.name, task, hasChildren);
				})
			);
		}
	}

	getTreeItem(element: HookitTaskItem) {
		return element;
	}
}

export class HookitTaskItem extends vscode.TreeItem {
	constructor(label: string, public task: HookitTask, hasChildren: boolean) {
		super(label, hasChildren ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None);
		this.contextValue = task.active ? 'active' : 'inactive';
		this.iconPath = path.join(__filename, '..', '..', '..', 'resources', 'icons', task.active ? 'active.svg' : 'inactive.svg');
	}
}

export class HookitTaskSessionItem extends vscode.TreeItem {
	constructor(label: string) {
		super(label);
		this.contextValue = 'session';
	}
}
