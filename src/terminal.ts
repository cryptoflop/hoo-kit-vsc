import { Resource } from '@wow-kit/hoo-kit/dist/resources';
import { RemoteSessionMessage } from '@wow-kit/hoo-kit/dist/session/remoteSession';
import { HookitTask, TaskRetriggerStrategy } from '@wow-kit/hoo-kit/dist/types';
import * as vscode from 'vscode';
import { hookitApi, resources } from './extension';

export async function handleSessionRequest(request: RemoteSessionMessage) {
	console.log(request);
	if (request.type === 'start') {
		const taskName = request.data.title;
		const task = (resources[Resource.Tasks] as HookitTask[]).find((t) => t.name === taskName);
		if (task) {
			const taskTerminal = getTaskTerminal(task);
			taskTerminal.startSession(request.id);
		} else {
			console.warn('Cannot find task: ' + taskName);
		}
	}
}

function getTaskTerminal(task: HookitTask) {
	if (!activeTaskTerminals.has(task.name)) {
		activeTaskTerminals.set(task.name, new TaskTerminal(task));
	}
	return activeTaskTerminals.get(task.name) as TaskTerminal;
}

const activeTaskTerminals = new Map<string, TaskTerminal>();

class TaskTerminal {
	private sessions: vscode.Terminal[] = [];

	constructor(public task: HookitTask) {}

	public async startSession(sessionId: string) {
		let nextSessionIndex: number;
		switch (this.task.retriggerStrategy) {
			case TaskRetriggerStrategy.Add:
				nextSessionIndex = this.sessions.length;
				break;
			case TaskRetriggerStrategy.Restart:
			default:
				// reuse terminal
				nextSessionIndex = 0;
		}
		await this.ensureSessionTerminal(nextSessionIndex, sessionId);
		const sessionTerminal = this.getSessionTerminal(nextSessionIndex);
		sessionTerminal.sendText(this.task.command, true);
	}

	public getSessionTerminal(index: number) {
		return this.sessions[index];
	}

	private async ensureSessionTerminal(index: number, sessionId: string) {
		if (!this.sessions[index]) {
			// create session terminal if there is no one
			await this.createSession(sessionId);
		}
	}

	private async createSession(sessionId: string) {
		this.sessions.push(this.createTerminal(this.task.name + ' #' + this.sessions.length, sessionId));
	}

	private createTerminal(name: string, sessionId: string) {
		const terminal = vscode.window.createTerminal({ name });
		terminal.show();
		return terminal;
	}

	public terminateSession(index: number) {
		if (this.sessions[index]) {
			this.sessions[index].dispose();
			this.sessions.splice(index, 1);
		}
	}

	private sessionTerminated(sessionId: string) {
		hookitApi.remoteSessionResponse({ id: sessionId, type: 'terminated' } as RemoteSessionMessage);
	}
}

// Promblem definition:
// Since we can split a terminal with the split command
// it is actually possible to create session in a split terminal
// but when the user hits ctrl+c in the terminal there is
// no way to get notified unless we create out own pty terminal
// and since that is only possible when creating a new
// terminal we wait for vscode to implement split support
// for extensions
async function split(fromTerminal: vscode.Terminal) {
	const onOpenTerminal = new Promise<vscode.Terminal>((res) => {
		const dispose = vscode.window.onDidOpenTerminal((terminal) => {
			dispose();
			res(terminal);
		}).dispose;
	});
	await focusTerminal(fromTerminal);
	vscode.commands.executeCommand('workbench.action.terminal.split');
	return onOpenTerminal;
}

function focusTerminal(terminal: vscode.Terminal) {
	const onBecameActive = new Promise((res) => {
		const dispose = vscode.window.onDidChangeActiveTerminal((activeTerminal) => {
			if (activeTerminal && activeTerminal === terminal) {
				dispose();
				res();
			}
		}).dispose;
	});
	terminal.show();
	return onBecameActive;
}
