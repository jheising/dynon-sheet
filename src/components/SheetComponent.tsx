import * as React from "react";
import {RowComponent} from "./RowComponent";
import {Row, RowUtils} from "../common/SheetDoc";
import {set, cloneDeep, map, debounce, isNil, findIndex, get} from "lodash";
import {DynON} from "../../../DynON";
import {Utils} from "../common/Utils";

export interface SheetComponentProps {
}

export interface SheetComponentState {
    rows: Row[];
}

export class SheetComponent extends React.Component<SheetComponentProps, SheetComponentState> {

    constructor(props) {
        super(props);

        this.state = {
            rows: []
        };
    }

    componentDidMount(): void {
        try {
            let rows = JSON.parse(localStorage.getItem("last_sheet")) || [];

            this.setState({
                rows: rows
            });
        } catch (e) {
        }
    }

    private _customDataCache = {};
    handleCustomData = async (providerName: string, providerOptions?: any, useCache: boolean = false): Promise<any> => {
        switch (providerName) {
            case "$js": {
                try {
                    return Utils.executeScript(providerOptions);
                } catch (e) {
                    return e;
                }
            }
            case "$http": {
                try {

                    let cacheKey = providerName + JSON.stringify(providerOptions);

                    if (useCache) {
                        return this._customDataCache[cacheKey];
                    }

                    let result = await Utils.fetch(providerOptions);
                    this._customDataCache[cacheKey] = result;
                    return result;

                } catch (e) {
                    return e;
                }
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

    delayedHandleCustomData = async (providerName: string, providerOptions?: any): Promise<any> => {
        this.delayedDoCalculation();
        return this.handleCustomData(providerName, providerOptions, true);
    };

    delayedDoCalculation = debounce(() => {
        this._customDataCache = {};
        this.doCalculation(false);
    }, 1000);

    getDataDoc(): any {
        let dataDoc = {};

        for (let row of this.state.rows) {
            dataDoc[row.id] = cloneDeep(RowUtils.getDataValue(row));
        }

        return dataDoc;
    }

    async doCalculation(delayed: boolean = true) {
        let dataDoc = this.getDataDoc();

        console.log(dataDoc);

        Utils.displayLoadingIndicator(true);

        try {
            await DynON.fillReferences(dataDoc, dataDoc, null, delayed ? this.delayedHandleCustomData : this.handleCustomData);
        } catch (e) {
        }

        Utils.displayLoadingIndicator(false);

        let rows = cloneDeep(this.state.rows);
        for (let row of rows) {
            RowUtils.setCalculatedValue(row, dataDoc[row.id]);
        }

        this.setState({
            rows: rows
        }, () => {
            localStorage.setItem("last_sheet", JSON.stringify(this.state.rows));
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

    handleRowsChanged(changedRowIDs: string[]) {
        if (isNil(changedRowIDs)) {
            return;
        }

        this.doCalculation();
    }

    handleRowDeleted(rowIndex: number) {
        let changedRow = this.state.rows[rowIndex];
        let rows = cloneDeep(this.state.rows);
        rows.splice(rowIndex, 1);
        this.setState({
            rows: rows
        }, () => this.handleRowsChanged([changedRow.id]));
    }

    handleRowUpdated(rowIndex: number, row: Row) {
        let oldRow = this.state.rows[rowIndex];
        let changedRowIDs = [row.id];

        if (oldRow && oldRow.id !== row.id) {
            changedRowIDs.push(oldRow.id);
        }

        let rows = cloneDeep(this.state.rows);
        set(rows, rowIndex, row);
        this.setState({
            rows: rows
        }, () => this.handleRowsChanged(changedRowIDs));
    }

    renderRows(): RowComponent[] {

        let rows = map(this.state.rows, (row: Row, rowIndex) => {
            return <RowComponent key={rowIndex}
                                 row={row}
                                 onDelete={() => this.handleRowDeleted(rowIndex)}
                                 onMoveUp={() => this.handleRowMove(rowIndex, -1)}
                                 onMoveDown={() => this.handleRowMove(rowIndex, 1)}
                                 allowMoveUp={rowIndex > 0}
                                 allowMoveDown={rowIndex < this.state.rows.length - 1}
                                 onRowUpdated={(row) => this.handleRowUpdated(rowIndex, row)}/>
        });

        let newRowIndex = this.state.rows.length;
        let newRowID;

        do {
            ++newRowIndex;
            newRowID = `r${newRowIndex}`;
        }
        while (findIndex(this.state.rows, {id: newRowID}) !== -1);

        rows.push(<RowComponent key={this.state.rows.length}
                                row={{
                                    id: newRowID
                                }}
                                hideToolbox={true}
                                onDelete={() => this.handleRowDeleted(this.state.rows.length)}
                                onRowUpdated={(row) => this.handleRowUpdated(this.state.rows.length, row)}/>);
        return rows;
    }

    render() {
        return <React.Fragment>
            <div className="toolbar">
                <div>Edit Mode</div>
            </div>
            <div className="sheet">
                {this.renderRows()}
            </div>
        </React.Fragment>;
    }
}