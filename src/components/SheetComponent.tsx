import * as React from "react";
import {RowComponent} from "./RowComponent";
import {Row, RowUtils} from "../common/SheetDoc";
import {set, cloneDeep, map, debounce, isNil, findIndex, get, each, has} from "lodash";
import {DynON} from "../../../DynON";
import {Utils} from "../common/Utils";
import {FaEye, FaEyeSlash} from "react-icons/fa";

export interface SheetComponentProps {
}

export interface SheetComponentState {
    rows: Row[];
    hideCode?: boolean;
}

export class SheetComponent extends React.Component<SheetComponentProps, SheetComponentState> {

    lastDataDoc;
    customDataHandlerCache = {};
    delayedCustomDataHandlerActions = {};
    lockDelayedCustomData = false;

    constructor(props) {
        super(props);

        this.state = {
            rows: []
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (isNil(state.rows) || state.rows.length === 0) {
            return {
                rows: [{
                    id: "r1"
                }]
            };
        }

        return null;
    }

    componentDidMount(): void {
        this.lastDataDoc = null;
        this.customDataHandlerCache = {};
        this.delayedCustomDataHandlerActions = {};
        this.lockDelayedCustomData = false;

        try {
            let rows = JSON.parse(localStorage.getItem("last_sheet")) || [];

            this.setState({
                rows: rows
            });
        } catch (e) {
        }
    }

    delayedCustomDataHandler = debounce(async () => {

        if (this.lockDelayedCustomData) {
            return;
        }

        this.lockDelayedCustomData = true;

        let actions = [];
        each(this.delayedCustomDataHandlerActions, (customDataInfo: { key: string, name: string, options: any }) => {
            if (customDataInfo.name === "$http") {
                actions.push(Utils.fetch(customDataInfo.options)
                    .then((response) => {
                        this.customDataHandlerCache[customDataInfo.key] = {
                            ts: Date.now(),
                            value: response
                        };
                    }).catch(error => {
                        this.customDataHandlerCache[customDataInfo.key] = {
                            ts: Date.now(),
                            value: error
                        };
                    }));
            }
        });

        console.log("Processing Delayed Data...");
        await Promise.all(actions);
        console.log("Delayed Data Finished...");

        await this.doCalculation(cloneDeep(this.state.rows));

        this.delayedCustomDataHandlerActions = {};
        this.lockDelayedCustomData = false;
    }, 1000);

    handleDelayedCustomData(providerName: string, providerOptions?: any): any {
        let customHandlerKey = Utils.stableJSONStringify([providerName, providerOptions]);

        if (has(this.customDataHandlerCache, customHandlerKey)) {
            return this.customDataHandlerCache[customHandlerKey].value;
        }

        this.delayedCustomDataHandlerActions[customHandlerKey] = {
            key: customHandlerKey,
            name: providerName,
            options: providerOptions
        };

        this.delayedCustomDataHandler.cancel();
        this.delayedCustomDataHandler();
        return "Fetching...";
    }

    handleCustomData = async (providerName: string, providerOptions?: any): Promise<any> => {
        switch (providerName) {
            case "$js": {
                try {
                    return Utils.executeScript(providerOptions);
                } catch (e) {
                    return e;
                }
            }
            case "$http": {
                return this.handleDelayedCustomData(providerName, providerOptions);
            }
            case "$ask": {
                return get(providerOptions, "answer");
            }
            default: {
                let defaultValue = {};
                defaultValue[`${providerName}`] = providerOptions;
                return defaultValue;
            }
        }
    };

    static getDataDoc(rows: Row[]): any {
        let dataDoc = {};

        for (let row of rows) {
            dataDoc[row.id] = cloneDeep(RowUtils.getDataValue(row));
        }

        return dataDoc;
    }

    saveDoc() {
        localStorage.setItem("last_sheet", JSON.stringify(this.state.rows));
    }

    async doCalculation(newRows: Row[]) {

        this.delayedCustomDataHandler.cancel();
        this.delayedCustomDataHandlerActions = {};

        let dataDoc = SheetComponent.getDataDoc(newRows);

        let dirtyRowIDs = [];
        each(dataDoc, (rowData, rowID) => {
            if (isNil(this.lastDataDoc) || !Utils.isEqual(rowData, this.lastDataDoc[rowID])) {
                dirtyRowIDs.push(rowID);
            }
        });

        // Are there any rows that no longer exist?
        each(this.lastDataDoc, (rowData, rowID) => {
            if (!has(dataDoc, rowID)) {
                dirtyRowIDs.push(rowID);
            }
        });

        console.log({
            dirty: dirtyRowIDs,
            data: dataDoc
        });

        this.lastDataDoc = dataDoc;

        if (dirtyRowIDs.length > 0) {
            console.log("Calculating");

            Utils.displayLoadingIndicator(true);

            try {
                await DynON.fillReferences(dataDoc, dataDoc, null, this.handleCustomData);
            } catch (e) {
            }

            Utils.displayLoadingIndicator(false);
        }

        for (let row of newRows) {
            RowUtils.setCalculatedValue(row, dataDoc[row.id]);
        }

        return new Promise((resolve, reject) => {
            this.setState({
                rows: newRows
            }, () => {
                this.saveDoc();
                resolve();
            });
        });
    }

    handleRowMove(rowIndex: number, relativePosition: number) {
        let rows = cloneDeep(this.state.rows);
        let newRowIndex = rowIndex + relativePosition;

        if (newRowIndex >= 0 && newRowIndex < rows.length) {
            rows.splice(newRowIndex, 0, rows.splice(rowIndex, 1)[0]);
            this.setState({
                rows: rows
            });
        }
    }

    handleRowDeleted(rowIndex: number) {
        let newRows = cloneDeep(this.state.rows);
        newRows.splice(rowIndex, 1);
        this.doCalculation(newRows);
    }

    handleRowUpdated(rowIndex: number, row: Row) {
        let newRows = cloneDeep(this.state.rows);
        set(newRows, rowIndex, row);

        // There seems to be a bug in react where calling an async function (doCalculation) to update the props of an input causes the cursor to jump around.
        // So unfortunately we have to update the state twice.
        this.setState({
            rows: newRows
        }, () => {
            let newRows = cloneDeep(this.state.rows);
            this.doCalculation(newRows)
        });
    }

    handleRowInsertBelow(rowIndex: number) {
        let newRows = cloneDeep(this.state.rows);
        newRows.splice(rowIndex + 1, 0, {
            id: this.getNewRowID(rowIndex)
        });
        this.setState({
            rows: newRows
        }, () => this.saveDoc);
    }

    handleToggleHideCode = () => {
        this.setState({
            hideCode: !this.state.hideCode
        });
    };

    getNewRowID(startingIndex: number = this.state.rows.length): string {
        let newRowIndex = startingIndex;
        let newRowID;

        do {
            ++newRowIndex;
            newRowID = `r${newRowIndex}`;
        }
        while (findIndex(this.state.rows, {id: newRowID}) !== -1);

        return newRowID;
    }

    renderRows(): RowComponent[] {
        return map(this.state.rows, (row: Row, rowIndex) => {
            return <RowComponent key={rowIndex}
                                 hideCode={this.state.hideCode}
                                 row={row}
                                 onDelete={() => this.handleRowDeleted(rowIndex)}
                                 onMoveUp={() => this.handleRowMove(rowIndex, -1)}
                                 onMoveDown={() => this.handleRowMove(rowIndex, 1)}
                                 allowMoveUp={rowIndex > 0}
                                 allowMoveDown={rowIndex < this.state.rows.length - 1}
                                 onRowUpdated={(row) => this.handleRowUpdated(rowIndex, row)}
                                 onInsertBelow={() => this.handleRowInsertBelow(rowIndex)}/>
        });
    }

    render() {
        return <React.Fragment>
            <div className="toolbar">
                <a className="is-size-7" onClick={this.handleToggleHideCode}><span className="icon">{this.state.hideCode ? <FaEye/> :
                    <FaEyeSlash/>}</span> {this.state.hideCode ? "Show" : "Hide"} sheet code</a>
            </div>
            <div className="sheet">
                {this.renderRows()}
            </div>
        </React.Fragment>;
    }
}