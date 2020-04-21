"use strict";
// Don't change import order, it will occur circular reference
import * as vscode from "vscode";
import { QueryUnit } from "./database/QueryUnit";
import { ConnectionNode } from "./model/ConnectionNode";
import { DatabaseNode } from "./model/database/databaseNode";
import { TableNode } from "./model/table/tableNode";
import { MySQLTreeDataProvider } from "./provider/MysqlTreeDataProvider";
import { CompletionProvider } from "./provider/Complection/CompletionProvider";
import { DatabaseCache } from "./database/DatabaseCache";
import { ColumnNode } from "./model/table/columnNode";
import { SqlViewManager } from "./common/SqlViewManager";
import { ProcedureNode } from "./model/other/Procedure";
import { FunctionNode } from "./model/other/function";
import { TriggerNode } from "./model/other/Trigger";
import { UserNode, UserGroup } from "./model/database/userGroup";
import { FunctionGroup } from "./model/other/functionGroup";
import { TriggerGroup } from "./model/other/triggerGroup";
import { ProcedureGroup } from "./model/other/procedureGroup";
import { ViewGroup } from "./model/table/viewGroup";
import { ViewNode } from "./model/table/viewNode";
import { SqlFormatProvider } from "./provider/SqlFormatProvider";
import { HistoryManager } from "./extension/HistoryManager";
import { CommandKey } from "./common/Constants";
import { TableHoverProvider } from "./provider/TableHoverProvider";
import { TableGroup } from "./model/table/tableGroup";
import { MysqlSetting } from "./extension/MysqlSetting";
import { CopyAble } from "./model/interface/copyAble";
import { FileManager } from "./extension/FileManager";

export function activate(context: vscode.ExtensionContext) {


    DatabaseCache.initCache(context);
    SqlViewManager.initExtesnsionPath(context.extensionPath);

    FileManager.init(context)
    const mysqlTreeDataProvider = new MySQLTreeDataProvider(context);
    const treeview = vscode.window.createTreeView("github.cweijan.mysql", {
        treeDataProvider: mysqlTreeDataProvider,
    });
    treeview.onDidCollapseElement((event) => {
        DatabaseCache.storeElementState(event.element, vscode.TreeItemCollapsibleState.Collapsed);
    });
    treeview.onDidExpandElement((event) => {
        DatabaseCache.storeElementState(event.element, vscode.TreeItemCollapsibleState.Expanded);
    });

    context.subscriptions.push(
        vscode.languages.registerDocumentRangeFormattingEditProvider('sql', new SqlFormatProvider()),
        vscode.languages.registerHoverProvider('sql', new TableHoverProvider()),
        vscode.languages.registerCompletionItemProvider('sql', new CompletionProvider(), ' ', '.', ">", "<", "=", "("),
        vscode.commands.registerCommand(CommandKey.Refresh, () => {
            mysqlTreeDataProvider.init();
        }),
        vscode.commands.registerCommand("mysql.history.open", () => {
            HistoryManager.showHistory();
        }),
        vscode.commands.registerCommand(CommandKey.RecordHistory, (sql: string, costTime: number) => {
            HistoryManager.recordHistory(sql, costTime);
        }),
        vscode.commands.registerCommand("mysql.addDatabase", (connectionNode: ConnectionNode) => {
            connectionNode.createDatabase();
        }),
        vscode.commands.registerCommand("mysql.deleteDatabase", (databaseNode: DatabaseNode) => {
            databaseNode.dropDatatabase();
        }),
        vscode.commands.registerCommand("mysql.addConnection", () => {
            SqlViewManager.showConnectPage();
        }),
        vscode.commands.registerCommand("mysql.changeTableName", (tableNode: TableNode) => {
            tableNode.changeTableName();
        }),
        vscode.commands.registerCommand("mysql.index.template", (tableNode: TableNode) => {
            tableNode.indexTemplate();
        }),
        vscode.commands.registerCommand("mysql.db.active", () => {
            mysqlTreeDataProvider.activeDb();
        }),
        vscode.commands.registerCommand("mysql.table.truncate", (tableNode: TableNode) => {
            tableNode.truncateTable();
        }),
        vscode.commands.registerCommand("mysql.table.drop", (tableNode: TableNode) => {
            tableNode.dropTable();
        }),
        vscode.commands.registerCommand("mysql.table.source", (tableNode: TableNode) => {
            if (tableNode) { tableNode.showSource(); }
        }),
        vscode.commands.registerCommand("mysql.changeColumnName", (columnNode: ColumnNode) => {
            columnNode.changeColumnName();
        }),
        vscode.commands.registerCommand("mysql.column.add", (tableNode: TableNode) => {
            tableNode.addColumnTemplate();
        }),
        vscode.commands.registerCommand("mysql.column.update", (columnNode: ColumnNode) => {
            columnNode.updateColumnTemplate();
        }),
        vscode.commands.registerCommand("mysql.column.drop", (columnNode: ColumnNode) => {
            columnNode.dropColumnTemplate();
        }),
        vscode.commands.registerCommand("mysql.deleteConnection", (connectionNode: ConnectionNode) => {
            connectionNode.deleteConnection(context);
        }),
        vscode.commands.registerCommand("mysql.runQuery", (sql) => {
            if (typeof sql != 'string') { sql = null; }
            QueryUnit.runQuery(sql);
        }),
        vscode.commands.registerCommand("mysql.newQuery", (databaseOrConnectionNode: DatabaseNode | ConnectionNode) => {
            if (databaseOrConnectionNode) {
                databaseOrConnectionNode.newQuery();
            } else {
                ConnectionNode.tryOpenQuery();
            }
        }),
        vscode.commands.registerCommand("mysql.template.sql", (tableNode: TableNode, run: boolean) => {
            tableNode.selectSqlTemplate(run);
        }),
        vscode.commands.registerCommand("mysql.name.copy", (copyAble: CopyAble) => {
            copyAble.copyName();
        }),
        vscode.commands.registerCommand("mysql.data.import", (iNode: DatabaseNode | ConnectionNode) => {
            vscode.window.showOpenDialog({ filters: { Sql: ['sql'] }, canSelectMany: false, openLabel: "Select sql file to import", canSelectFiles: true, canSelectFolders: false }).then((filePath) => {
                iNode.importData(filePath[0].fsPath);
            });
        }),
        vscode.commands.registerCommand("mysql.data.export", (iNode: TableNode | DatabaseNode) => {
            vscode.window.showOpenDialog({ canSelectMany: false, openLabel: "Select export file path", canSelectFiles: false, canSelectFolders: true }).then((folderPath) => {
                iNode.backupData(folderPath[0].fsPath);
            });
        }),
        vscode.commands.registerCommand("mysql.template.delete", (tableNode: TableNode) => {
            tableNode.deleteSqlTemplate();
        }),
        vscode.commands.registerCommand("mysql.copy.insert", (tableNode: TableNode) => {
            tableNode.insertSqlTemplate();
        }),
        vscode.commands.registerCommand("mysql.copy.update", (tableNode: TableNode) => {
            tableNode.updateSqlTemplate();
        }),
        vscode.commands.registerCommand("mysql.show.procedure", (procedureNode: ProcedureNode) => {
            procedureNode.showSource();
        }),
        vscode.commands.registerCommand("mysql.show.function", (functionNode: FunctionNode) => {
            functionNode.showSource();
        }),
        vscode.commands.registerCommand("mysql.show.trigger", (triggerNode: TriggerNode) => {
            triggerNode.showSource();
        }),
        vscode.commands.registerCommand("mysql.user.sql", (userNode: UserNode) => {
            userNode.selectSqlTemplate();
        }),
        vscode.commands.registerCommand("mysql.template.table", (tableGroup: TableGroup) => {
            tableGroup.createTemplate();
        }),
        vscode.commands.registerCommand("mysql.template.procedure", (procedureGroup: ProcedureGroup) => {
            procedureGroup.createTemplate();
        }),
        vscode.commands.registerCommand("mysql.setting.open", (procedureGroup: ProcedureGroup) => {
            MysqlSetting.open();
        }),
        vscode.commands.registerCommand("mysql.template.view", (viewGroup: ViewGroup) => {
            viewGroup.createTemplate();
        }),
        vscode.commands.registerCommand("mysql.template.trigger", (triggerGroup: TriggerGroup) => {
            triggerGroup.createTemplate();
        }),
        vscode.commands.registerCommand("mysql.template.function", (functionGroup: FunctionGroup) => {
            functionGroup.createTemplate();
        }),
        vscode.commands.registerCommand("mysql.template.user", (userGroup: UserGroup) => {
            userGroup.createTemplate();
        }),
        vscode.commands.registerCommand("mysql.delete.user", (userNode: UserNode) => {
            userNode.drop();
        }),
        vscode.commands.registerCommand("mysql.delete.view", (viewNode: ViewNode) => {
            viewNode.drop();
        }),
        vscode.commands.registerCommand("mysql.delete.procedure", (procedureNode: ProcedureNode) => {
            procedureNode.drop();
        }),
        vscode.commands.registerCommand("mysql.delete.function", (functionNode: FunctionNode) => {
            functionNode.drop();
        }),
        vscode.commands.registerCommand("mysql.delete.trigger", (triggerNode: TriggerNode) => {
            triggerNode.drop();
        }),
        vscode.commands.registerCommand("mysql.change.user", (userNode: UserNode) => {
            userNode.changePasswordTemplate();
        }),
    );

}

export function deactivate() {
}
