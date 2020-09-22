"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = exports.dispose = exports.deactivate = exports.activate = exports.setExtensionContext = exports.registerDisposable = exports.getExtensionContext = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const config_1 = require("./config");
const tasks_1 = require("./views/tasks");
let extensionContext;
function getExtensionContext() {
    return extensionContext;
}
exports.getExtensionContext = getExtensionContext;
function registerDisposable(disposable) {
    getExtensionContext().subscriptions.push(disposable);
}
exports.registerDisposable = registerDisposable;
function setExtensionContext(name, context) {
    vscode.commands.executeCommand('setContext', name, context);
}
exports.setExtensionContext = setExtensionContext;
const publicContext = new Proxy({}, {
    set(target, prop, value) {
        target[prop] = value;
        setExtensionContext('hoo-kit.' + prop, value);
        return true;
    }
});
// init defaults
Object.entries({
    active: false,
    running: false
}).forEach((entry) => {
    publicContext[entry[0]] = entry[1];
});
function activate(context) {
    extensionContext = context;
    setTimeout(() => {
        if (shouldActivate()) {
            initialize();
        }
    }, 0);
    vscode.workspace.onDidChangeConfiguration((cce) => {
        if (cce.affectsConfiguration(config_1.ConfigPaths.HooKit)) {
            if (shouldActivate()) {
                if (!publicContext.active) {
                    initialize();
                }
            }
            else {
                if (publicContext.active) {
                    dispose();
                    publicContext.active = false;
                }
            }
        }
    });
}
exports.activate = activate;
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        if (publicContext.running) {
            yield stopHookit();
        }
    });
}
exports.deactivate = deactivate;
function dispose() {
    extensionContext.subscriptions.forEach((d) => d.dispose());
    extensionContext.subscriptions.length = 0;
}
exports.dispose = dispose;
function getConfig(configPath) {
    var _a;
    return (((_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a.map((ws) => {
        const config = vscode.workspace.getConfiguration(config_1.ConfigPaths.HooKit, ws.uri);
        return config.get(configPath);
    })) || []);
}
exports.getConfig = getConfig;
function shouldActivate() {
    // only activate if any of the open workspaces has an hoo-kit active flag
    return getConfig(config_1.ConfigPaths.Active).some((a) => a === true);
}
function initialize() {
    declareCommands();
    declareViews();
    const shouldStart = getConfig(config_1.ConfigPaths.RunOnStart).some((a) => a === true);
    if (shouldStart) {
        startHookit();
    }
    publicContext.active = true;
}
const commands = [
    { command: 'start', action: () => startHookit() },
    { command: 'stop', action: () => stopHookit() },
    { command: 'event.start', action: () => { } },
    { command: 'event.stop', action: () => { } }
];
function declareCommands() {
    commands.forEach((commandDef) => {
        registerDisposable(vscode.commands.registerCommand('hoo-kit.' + commandDef.command, commandDef.action));
    });
}
function declareViews() {
    registerDisposable(vscode.window.createTreeView('hoo-kit.tasks', {
        treeDataProvider: new tasks_1.TasksProvider()
    }));
}
let hookitInstance;
function startHookit() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!publicContext.running) {
            publicContext.running = true;
        }
    });
}
function stopHookit() {
    return __awaiter(this, void 0, void 0, function* () {
        if (publicContext.running) {
            publicContext.running = false;
        }
    });
}
//# sourceMappingURL=extension.js.map