import * as React from "react";
import {arrayMove, SortableContainer, SortableElement} from "react-sortable-hoc";
import {map, cloneDeep, isObjectLike, set} from "lodash";
import {TextEditor} from "./TextEditor";
import {FaBan} from "react-icons/fa";
import {DragHandle} from "./DragHandle";

const SortableRow = SortableElement(({row, rowIndex, rowRenderer}) => {
    return rowRenderer(row, rowIndex);
});

const SortableRows = SortableContainer(({rows, rowRenderer, disableLastRow}) => {
    return <div>
        {map(rows, (value, index) => (
            // @ts-ignore
            <SortableRow key={index}
                         index={index}
                         rowIndex={index}
                         rowRenderer={rowRenderer}
                         row={value}
                         disabled={disableLastRow && index === rows.length - 1}/>
        ))}
    </div>;
});

export interface CollectionEditorBaseProps {
    rows: any[];
    onRowsChanged?: (newRows: any[]) => void;
    onRowMoved?: (oldRowIndex: number, newRowIndex: number) => void;
    rowRenderer: (row: any, rowIndex: number) => React.ReactNode;
    disableSortOnLastRow?: boolean;
}

export class CollectionEditorBase extends React.PureComponent<CollectionEditorBaseProps> {

    constructor(props) {
        super(props);
    }

    handleSortEnd = ({oldIndex, newIndex}) => {
        if (this.props.onRowsChanged) {
            let newRows = cloneDeep(this.props.rows);
            newRows = arrayMove(newRows, oldIndex, newIndex);
            this.props.onRowsChanged(newRows);
        }

        if (this.props.onRowMoved) {
            this.props.onRowMoved(oldIndex, newIndex);
        }
    };

    render() {
        // @ts-ignore
        return <SortableRows lockAxis="y"
                             disableLastRow={this.props.disableSortOnLastRow}
                             useDragHandle={true}
                             rows={this.props.rows}
                             rowRenderer={this.props.rowRenderer}
                             onSortEnd={this.handleSortEnd}/>;
    }
}

export interface ValueCollectionEditorProps {
    value: any[];
    onValueChange: (newValue: any[]) => void;
    valuePlaceholder?: string;
}

export class ValueCollectionEditor extends React.Component<ValueCollectionEditorProps> {

    constructor(props) {
        super(props);
    }

    handleRowsChanged = (newRows: any[]) => {
        if (this.props.onValueChange) {
            this.props.onValueChange(newRows);
        }
    };

    handleRowMove = (oldIndex, newIndex) => {
        let newRows = cloneDeep(this.props.value);
        newRows = arrayMove(newRows, oldIndex, newIndex);
        this.handleRowsChanged(newRows);
    };

    handleRowDelete(rowIndex: number) {
        let newRows = cloneDeep(this.props.value);
        newRows.splice(rowIndex, 1);
        this.handleRowsChanged(newRows);
    }

    handleRowValueChange(rowIndex: number, newValue: string) {
        let newRows = cloneDeep(this.props.value);
        set(newRows, `[${rowIndex}]`, newValue);
        this.handleRowsChanged(newRows);
    }

    renderRow = (row: any, rowIndex: number) => {
        return <div className="columns">
            {this.props.value.length === 0 ? null : <div className="column collection-editor-row-toolbox">
                {rowIndex >= this.props.value.length ? null : <React.Fragment>
                    <DragHandle key={"move"}/>
                    <a title="Delete" key="delete" className={"has-text-danger"} onClick={() => this.handleRowDelete(rowIndex)}><FaBan/></a>
                </React.Fragment>}
            </div>}
            <div className="column">
                <TextEditor ignoreTabKey={true} value={row.value} placeholder={this.props.valuePlaceholder} onValueChange={(newValue) => this.handleRowValueChange(rowIndex, newValue)}/>
            </div>
        </div>
    };

    render() {
        // Append a new row at the end
        let rows = this.props.value.concat([""]);

        return <React.Fragment>
            <CollectionEditorBase rows={rows}
                                  rowRenderer={this.renderRow}
                                  disableSortOnLastRow={true}
                                  onRowMoved={this.handleRowMove}/>
        </React.Fragment>;
    }
}

export interface KeyValueCollectionEditorProps {
    value: { [name: string]: any };
    onValueChange: (newValue: { [name: string]: any }) => void;

    keyPlaceholder?: string;
    valuePlaceholder?: string;
}

export interface KeyValueCollectionEditorState {
    rows: { key: string, value: any }[];
}

export class KeyValueCollectionEditor extends React.Component<KeyValueCollectionEditorProps, KeyValueCollectionEditorState> {

    constructor(props) {
        super(props);
        this.state = {
            rows: KeyValueCollectionEditor.kvToRows(props.value)
        };
    }

    static kvToRows(kv: { [name: string]: any }) {
        return map(kv, (value, key) => {
            return {
                key: key,
                value: value
            }
        });
    }

    handleRowsChanged = (newRows: any[]) => {
        let newValue = {};

        for (let row of newRows) {
            newValue[row.key] = row.value;
        }

        this.setState({
            rows: newRows
        }, () => {
            if (this.props.onValueChange) {
                this.props.onValueChange(newValue);
            }
        });
    };

    handleRowMove = (oldIndex, newIndex) => {
        let newRows = cloneDeep(this.state.rows);
        newRows = arrayMove(newRows, oldIndex, newIndex);
        this.handleRowsChanged(newRows);
    };

    handleRowDelete(rowIndex: number) {
        let newRows = cloneDeep(this.state.rows);
        newRows.splice(rowIndex, 1);
        this.handleRowsChanged(newRows);
    }

    handleRowKeyChange(rowIndex: number, newKey: string) {
        let newRows = cloneDeep(this.state.rows);
        set(newRows, `[${rowIndex}].key`, newKey);
        this.handleRowsChanged(newRows);
    }

    handleRowValueChange(rowIndex: number, newValue: string) {
        let newRows = cloneDeep(this.state.rows);
        set(newRows, `[${rowIndex}].value`, newValue);
        this.handleRowsChanged(newRows);
    }

    renderRow = (row: any, rowIndex: number) => {
        return <div className="columns">
            {this.state.rows.length === 0 ? null : <div className="column collection-editor-row-toolbox">
                {rowIndex >= this.state.rows.length ? null : <React.Fragment>
                    <DragHandle key={"move"}/>
                    <a title="Delete" key="delete" className={"has-text-danger"} onClick={() => this.handleRowDelete(rowIndex)}><FaBan/></a>
                </React.Fragment>}
            </div>}
            <div className="column columns">
                <div className="column is-half">
                    <TextEditor ignoreTabKey={true} value={row.key} placeholder={this.props.keyPlaceholder} onValueChange={(newKey) => this.handleRowKeyChange(rowIndex, newKey)}/>
                </div>
                <div className="column is-half">
                    <TextEditor ignoreTabKey={true} value={row.value} placeholder={this.props.valuePlaceholder} onValueChange={(newValue) => this.handleRowValueChange(rowIndex, newValue)}/>
                </div>
            </div>
        </div>
    };

    render() {
        // Append a new row at the end
        let rows = this.state.rows.concat([{} as any]);

        return <React.Fragment>
            <CollectionEditorBase rows={rows}
                                  rowRenderer={this.renderRow}
                                  disableSortOnLastRow={true}
                                  onRowMoved={this.handleRowMove}/>
        </React.Fragment>;
    }
}