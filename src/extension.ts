// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ConfigPaths } from './config';
import { HookitTaskItem, TasksProvider } from './views/tasks';

let extensionContext: vscode.ExtensionContext;
export function getExtensionContext() {
	return extensionContext;
}

export function registerDisposable(disposable: vscode.Disposable) {
	getExtensionContext().subscriptions.push(disposable);
}

export function setExtensionContext(name: string, context: unknown) {
	vscode.commands.executeCommand('setContext', name, context);
}

const publicContextListener = new Map<string, ((newValue: unknown) => void)[]>();
export function listenForPublicContext(prop: string, callback: (newValue: unknown) => void) {
	if (!publicContextListener.has(prop)) {
		publicContextListener.set(prop, []);
	}
	publicContextListener.get(prop)?.push(callback);
}
const publicContext = new Proxy(
	{},
	{
		set(target: { [key: string]: unknown }, prop: string, value: unknown) {
			target[prop] = value;
			setExtensionContext('hoo-kit.' + prop, value);
			const listeners = publicContextListener.get(prop);
			if (listeners && listeners.length > 0) {
				listeners.forEach((cb) => cb(value));
			}
			return true;
		}
	}
) as {
	[key: string]: unknown;
	active: boolean;
	running: boolean;
};
// init defaults
Object.entries({
	active: false,
	running: false
}).forEach((entry) => {
	publicContext[entry[0]] = entry[1];
});

export function activate(context: vscode.ExtensionContext) {
	extensionContext = context;

	setTimeout(() => {
		if (shouldActivate()) {
			initialize();
		}
	}, 0);

	vscode.workspace.onDidChangeConfiguration((cce) => {
		if (cce.affectsConfiguration(ConfigPaths.HooKit)) {
			if (shouldActivate()) {
				if (!publicContext.active) {
					initialize();
				}
			} else {
				if (publicContext.active) {
					dispose();
					publicContext.active = false;
				}
			}
		}
	});
}

export async function deactivate() {
	if (publicContext.running) {
		await stopHookit();
	}
}

export function dispose() {
	extensionContext.subscriptions.forEach((d) => d.dispose());
	extensionContext.subscriptions.length = 0;
}

export function getConfig<T>(configPath: ConfigPaths): T[] {
	return (
		vscode.workspace.workspaceFolders?.map((ws) => {
			const config = vscode.workspace.getConfiguration(ConfigPaths.HooKit, ws.uri);
			return config.get(configPath) as T;
		}) || []
	);
}

function shouldActivate() {
	// only activate if any of the open workspaces has an hoo-kit active flag
	return getConfig<boolean>(ConfigPaths.Active).some((a) => a === true);
}

function initialize() {
	declareCommands();
	declareViews();

	const shouldStart = getConfig<boolean>(ConfigPaths.RunOnStart).some((a) => a === true);
	if (shouldStart) {
		startHookit();
	}

	publicContext.active = true;
}

const commands = [
	{ command: 'start', action: () => startHookit() },
	{ command: 'stop', action: () => stopHookit() },
	{
		command: 'event.activate',
		action: (taskNode: HookitTaskItem) => {
			console.log(taskNode);
		}
	},
	{
		command: 'event.deactivate',
		action: (taskNode: HookitTaskItem) => {
			console.log(taskNode);
		}
	}
];
function declareCommands() {
	commands.forEach((commandDef) => {
		registerDisposable(vscode.commands.registerCommand('hoo-kit.' + commandDef.command, commandDef.action));
	});
}

function declareViews() {
	registerDisposable(
		vscode.window.createTreeView('hoo-kit.tasks', {
			treeDataProvider: new TasksProvider()
		})
	);
}

async function startHookit() {
	if (!publicContext.running) {
		// setConfig({ tasks: getConfig<HookitTask>(ConfigPaths.Tasks) }, () => {
		// 	// todo save config
		// });
		// startEventManager();
		// startTaskManager();
		publicContext.running = true;
	}
}

async function stopHookit() {
	if (publicContext.running) {
		publicContext.running = false;
	}
}
