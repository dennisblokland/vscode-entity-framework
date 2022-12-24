import * as vscode from 'vscode';
import type { Migration } from '../types/Migration';
import { getIconPath } from './iconProvider';
import { MigrationTreeItem } from './MigrationTreeItem';
import { TreeItem } from './TreeItem';
import { CLI } from '../cli/CLI';
import { TreeItemCache } from './TreeItemCache';
import { ContextValues } from './ContextValues';
import type { ProjectFile } from '../types/ProjectFile';
import { getCommandsConfig } from '../config/config';

export const dbContextsCache = new TreeItemCache<MigrationTreeItem[]>();

export class DbContextTreeItem extends TreeItem {
  private readonly cacheId: string;

  constructor(
    public readonly label: string,
    private readonly projectFile: ProjectFile,
    public readonly project: string,
    private readonly cli: CLI,
    collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.Collapsed,
  ) {
    super(label, projectFile.workspaceRoot, collapsibleState);
    this.iconPath = getIconPath('database_light.svg', 'database_dark.svg');
    this.contextValue = ContextValues.dbContext;
    this.cacheId = DbContextTreeItem.getCacheId(
      projectFile.workspaceRoot,
      this.project,
      this.label,
    );
  }

  public static getCacheId(
    workspaceRoot: string,
    project: string,
    label: string,
  ) {
    return [workspaceRoot, project, label].join('-');
  }

  async getChildren(): Promise<MigrationTreeItem[]> {
    const cachedChildren = dbContextsCache.get(this.cacheId);

    if (cachedChildren) {
      return cachedChildren;
    }

    try {
      const { output } = this.cli.exec(
        CLI.getInterpolatedArgs(getCommandsConfig().listMigrations, {
          context: this.label,
          project: this.project,
        }),
        this.projectFile.workspaceRoot,
      );
      const migrations = JSON.parse(
        CLI.getDataFromStdOut(await output),
      ) as Migration[];
      const children = migrations.map(
        (migration, index) =>
          new MigrationTreeItem(
            migration.name,
            this.projectFile.workspaceRoot,
            this.label,
            this.project,
            migration,
            index === migrations.length - 1,
          ),
      );
      dbContextsCache.set(this.cacheId, children);
      return children;
    } catch (e) {
      await vscode.window.showErrorMessage(
        `Unable to get migrations: ${(e as Error).message}`,
      );
      return [];
    }
  }
}
