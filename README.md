# vscode-entity-framework

[![Build & Publish](https://github.com/badsyntax/vscode-entity-framework/actions/workflows/main.yml/badge.svg)](https://github.com/badsyntax/vscode-entity-framework/actions/workflows/main.yml)

A VS Code extension to manage Entity Framework migrations.

## Features

![treeview](images/treeview-screenshot.png)

- List dbContexts for all projects within a solution
- Add/remove/run/undo migrations

## Requirements

- [dotnet sdk](https://dotnet.microsoft.com/download)
- [efcore tools](https://learn.microsoft.com/en-us/ef/core/cli/dotnet)
- A solution (`.sln`) file with projects
- [Microsoft.EntityFrameworkCore.Design](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.Design) must be installed in one of the projects

## Extension Settings

This extension contributes the following settings:

- `entityframework.env`: Custom environment vars, for example:
  ```json
  {
    "entityframework.env": {
      "ASPNETCORE_ENVIRONMENT": "LocalDev",
      "TenantId": "12345"
    }
  }
  ```
- `entityframework.commands`: Custom commands, for example:

  ```json
  {
    "entityframework.commands": {
      "addMigration": [
        "dotnet",
        "ef",
        "migrations",
        "add",
        "\"$migrationName\"",
        "--project",
        "\"$project\"",
        "--startup-project",
        "\"$project\"",
        "--context",
        "\"$dbContext\""
      ],
      "removeMigration": [
        "dotnet",
        "ef",
        "migrations",
        "remove",
        "--project",
        "\"$project\"",
        "--startup-project",
        "\"$project\"",
        "--context",
        "\"$dbContext\""
      ],
      "runMigration": [
        "dotnet",
        "ef",
        "database",
        "update",
        "--project",
        "\"$project\"",
        "--startup-project",
        "\"$project\"",
        "--context",
        "\"$dbContext\"",
        "\"$migrationId\""
      ],
      "generateScript": [
        "dotnet",
        "ef",
        "dbcontext",
        "script",
        "--project",
        "\"$project\"",
        "--context",
        "\"$dbContext\""
      ]
    }
  }
  ```

## Performance

The EF tools execute application code at design time to get information about the project, thus performance can be slow on large projects.

## License

See [LICENSE.md](./LICENSE.md).
