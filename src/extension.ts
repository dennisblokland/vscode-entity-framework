import type * as vscode from 'vscode';

import { TreeDataProvider } from './treeView/TreeDataProvider';
import { CommandProvider } from './commands/CommandProvider';
import { MigrationTreeItemDecorationProvider } from './treeView/MigrationTreeItemDecorationProvider';
import { SolutionFinder } from './solution/SolutionProvider';
import { Terminal } from './terminal/Terminal';
import { TerminalProvider } from './terminal/TerminalProvider';

const subscriptions: vscode.Disposable[] = [];

export async function activate(_context: vscode.ExtensionContext) {
  const solutionFiles = await SolutionFinder.getSolutionFiles();
  const migrationTreeItemDecorationProvider =
    new MigrationTreeItemDecorationProvider();
  const treeDataProvider = new TreeDataProvider(solutionFiles);
  const terminalProvider = new TerminalProvider(new Terminal());
  const commandProvider = new CommandProvider(
    treeDataProvider,
    terminalProvider,
  );
  subscriptions.push(
    migrationTreeItemDecorationProvider,
    treeDataProvider,
    commandProvider,
    terminalProvider,
  );
}

export function deactivate() {
  subscriptions.forEach(subscription => subscription.dispose());
}
