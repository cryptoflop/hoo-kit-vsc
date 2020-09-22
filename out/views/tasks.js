"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksProvider = void 0;
const vscode = require("vscode");
const config_1 = require("../config");
class TasksProvider {
    constructor() {
        var _a;
        this.workspaces = new Map();
        (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a.map((ws) => {
            // TODO: read hookit.json from workspace
            // for now we get the task definitons from the config
            const config = vscode.workspace.getConfiguration(config_1.ConfigPaths.HooKit, ws.uri);
            const tasks = config.get(config_1.ConfigPaths.Tasks);
            this.workspaces.set(ws.name, tasks || []);
        });
    }
    getChildren(element) {
        if (element) {
            if ('task' in element) {
                // this is a task so we dont return children
                return Promise.resolve([]);
            }
            else {
                return Promise.resolve(element.tasks.map((task) => {
                    return new HookitTaskItem(task.name, vscode.TreeItemCollapsibleState.None, task);
                }));
            }
        }
        else {
            return Promise.resolve(Array.from(this.workspaces.entries()).map((entry) => {
                // create parents for workspaces
                return new HookitWorkspaceItem(entry[0], entry[1].length === 0 ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded, entry[1]);
            }));
        }
    }
    getTreeItem(element) {
        return element;
    }
}
exports.TasksProvider = TasksProvider;
class HookitWorkspaceItem extends vscode.TreeItem {
    constructor(label, callapsibleState, tasks) {
        super(label, callapsibleState);
        this.tasks = tasks;
    }
}
class HookitTaskItem extends vscode.TreeItem {
    constructor(label, callapsibleState, task) {
        super(label, callapsibleState);
        this.task = task;
    }
}
//# sourceMappingURL=tasks.js.map