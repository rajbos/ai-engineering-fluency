declare const vscode: any; declare const name: string;
		vscode.postMessage({ command: name });