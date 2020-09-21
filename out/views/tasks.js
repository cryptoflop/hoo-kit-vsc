"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksProvider = void 0;
const vscode = require("vscode");
class TasksProvider {
    getChildren(element) {
        if (element) {
            return Promise.resolve([]);
        }
        else {
            return Promise.resolve([
                new vscode.TreeItem('TestTaskV1', vscode.TreeItemCollapsibleState.None),
                new vscode.TreeItem('TestTaskV2', vscode.TreeItemCollapsibleState.None),
                new vscode.TreeItem('TestTaskV3', vscode.TreeItemCollapsibleState.None)
            ]);
        }
    }
    getTreeItem(element) {
        return element;
    }
}
exports.TasksProvider = TasksProvider;
//# sourceMappingURL=tasks.js.map