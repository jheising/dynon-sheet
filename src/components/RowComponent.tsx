import * as React from "react";
import {cloneDeep, isNil, isObjectLike, get} from "lodash";
import {Row, RowUtils} from "../common/SheetDoc";
import {TextEditor} from "./TextEditor";
import {Utils} from "../common/Utils";
import {FaBan, FaChevronCircleUp, FaChevronCircleDown, FaEye, FaEyeSlash, FaPlus} from "react-icons/fa";
import {SortableContainer, SortableElement} from "react-sortable-hoc";

export interface RowComponentProps {
    row: Row;
    onRowUpdated: (row: Row) => void;
    onDelete?: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    onInsertBelow?: () => void;
    hideToolbox?: boolean;
    allowMoveUp?: boolean;
    allowMoveDown?: boolean;

    hideCode?: boolean;
}

export interface RowComponentState {
    displayAdvanced?: boolean;
    outputComponent?: any;
}

export class RowComponent extends React.Component<RowComponentProps, RowComponentState> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.setOutputComponent();
    }

    componentDidUpdate(prevProps: Readonly<RowComponentProps>, prevState: Readonly<RowComponentState>, snapshot?: any): void {
        if (!Utils.isEqual(prevProps.row, this.props.row)) {
            this.setOutputComponent();
        }
    }

    async setOutputComponent() {
        this.setState({
            outputComponent: await RowUtils.getOutputComponent(this.props.row, this.props.onRowUpdated)
        });
    }

    handleRowIDUpdated = (event) => {
        let row = cloneDeep(this.props.row);

        row.id = Utils.slugify(event.target.value);

        if (this.props.onRowUpdated) {
            this.props.onRowUpdated(row);
        }
    };

    handleRowValueUpdated = (value) => {
        let row = cloneDeep(this.props.row);

        RowUtils.setValue(row, value);

        if (this.props.onRowUpdated) {
            this.props.onRowUpdated(row);
        }
    };

    handleRowHiddenToggled = () => {
        let row: Row = cloneDeep(this.props.row);

        row.hidden = !row.hidden;

        if (this.props.onRowUpdated) {
            this.props.onRowUpdated(row);
        }
    };

    handleMoveUp = () => {
        if (this.props.onMoveUp) {
            this.props.onMoveUp();
        }
    };

    handleMoveDown = () => {
        if (this.props.onMoveDown) {
            this.props.onMoveDown();
        }
    };

    handleDelete = () => {
        if (this.props.onDelete) {
            this.props.onDelete();
        }
    };

    handleToggleDisplayAdvanced = () => {
        this.setState({
            displayAdvanced: !this.state.displayAdvanced
        });
    };

    handleInsertBelow = () => {
        if (this.props.onInsertBelow) {
            this.props.onInsertBelow();
        }
    };

    renderAdvancedSettings() {
        let advancedEditor = RowUtils.getAdvancedEditor(this.props.row);
        if (isNil(advancedEditor)) {
            return null;
        }

        return <div>
            <a className="is-size-7" onClick={this.handleToggleDisplayAdvanced}>{this.state.displayAdvanced ? "Hide" : "Display"} Advanced...</a>
            {this.state.displayAdvanced ? advancedEditor : null}
        </div>
    }

    renderToolbox() {
        let tools = [];

        if (!this.props.hideToolbox) {
            //tools.push(<a className="button is-small is-danger is-rounded is-outlined" onClick={this.handleDelete}>Delete</a>);


            /*if (this.props.allowMoveUp) {
                tools.push(<a title="Move Up" key="up" className="" onClick={this.handleMoveUp}><FaChevronCircleUp/></a>);
            }

            if (this.props.allowMoveDown) {
                tools.push(<a title="Move Down" key="down" className="" onClick={this.handleMoveDown}><FaChevronCircleDown/></a>);
            }*/

            tools.push(<a title={this.props.row.hidden ? "Set to Visible" : "Set to Hidden"} key="hidden" onClick={this.handleRowHiddenToggled}>{this.props.row.hidden ? <FaEyeSlash/> : <FaEye/>}</a>);

            tools.push(<a title="Delete" key="delete" className={"has-text-danger"} onClick={this.handleDelete}><FaBan/></a>);
        }

        return tools;
    }

    render() {

        if (this.props.hideCode && this.props.row.hidden) {
            return null;
        }

        return <React.Fragment>
            <div className="columns row">
                {this.props.hideCode ? null : <div className="column is-half">
                    <div className="columns">
                        <div className="column is-narrow row-toolbox">
                            {this.renderToolbox()}
                        </div>
                        <div className="column row-id">
                            <input className="input has-text-right" type="text" value={isNil(this.props.row.id) ? "" : this.props.row.id} onChange={this.handleRowIDUpdated}/>
                        </div>
                        <div className="column is-narrow row-equals">
                            =
                        </div>
                        <div className="column">
                            <TextEditor value={RowUtils.getValue(this.props.row)} onValueChange={this.handleRowValueUpdated}/>
                            {this.renderAdvancedSettings()}
                        </div>
                    </div>
                </div>}
                <div className="column row-value">
                    {this.state.outputComponent}
                </div>
            </div>
            {this.props.hideCode ? null : <div className="columns" onClick={this.handleInsertBelow}>
                <div className="column row-insert is-size-7"><FaPlus/>&nbsp;&nbsp;Insert</div>
            </div>}
        </React.Fragment>;
    }
}

