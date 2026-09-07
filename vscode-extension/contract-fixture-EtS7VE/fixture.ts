
		declare const vscode: any;
		vscode.postMessage({ command: 'showDetails' });
		function onClick() { vscode.postMessage({ command: 'refresh', period: 'day' }); }
	