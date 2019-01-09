import * as React from "react";
import {Row, RowUtils} from "../common/SheetDoc";
import {TextEditor} from "./TextEditor";
import {set, get, cloneDeep} from "lodash";

export interface AskRequestComponentProps {
    row:Row;
    onRowUpdated: (row: Row) => void;
}

export class AskRequestComponent extends React.PureComponent<AskRequestComponentProps> {

    constructor(props) {
        super(props);
    }

    getSetting(name:string):any
    {
        return get(RowUtils.getDataValue(this.props.row), name);
    }

    setSetting(name:string, value:any)
    {
        let newRow = cloneDeep(this.props.row);
        RowUtils.setDataValue(newRow, set(RowUtils.getDataValue(newRow), name, value));

        if(this.props.onRowUpdated)
        {
            this.props.onRowUpdated(newRow);
        }
    }

    render() {
        return <div>
            <div className="columns">
                <div className="column is-2 has-text-right setting-header">Options</div>
                <div className="column"><TextEditor value={this.getSetting("$ask.options")} onValueChange={(newValue) => this.setSetting("$ask.options", newValue)}/></div>
            </div>
        </div>;
    }
}