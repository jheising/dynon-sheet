import * as React from "react";
import {Row, RowUtils} from "../common/SheetDoc";
import {TextEditor} from "./TextEditor";
import {set, get, cloneDeep} from "lodash";
import {KeyValueCollectionEditor} from "./CollectionEditor";

export interface HTTPRequestComponentProps {
    row:Row;
    onRowUpdated: (row: Row) => void;
}

export class HTTPRequestComponent extends React.PureComponent<HTTPRequestComponentProps> {

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
                <div className="column is-2 has-text-right setting-header">Method</div>
                <div className="column"><TextEditor value={this.getSetting("$http.method")} onValueChange={(newValue) => this.setSetting("$http.method", newValue)}/></div>
            </div>
            <div className="columns">
                <div className="column is-2 has-text-right setting-header">Headers</div>
                <div className="column"><KeyValueCollectionEditor value={this.getSetting("$http.headers")}
                                                                  keyPlaceholder={"Header Name"}
                                                                  valuePlaceholder={"Header Value"}
                                                                  onValueChange={(newValue) => this.setSetting("$http.headers", newValue)}/></div>
            </div>
            <div className="columns">
                <div className="column is-2 has-text-right setting-header">Body</div>
                <div className="column"><TextEditor value={this.getSetting("$http.body")} onValueChange={(newValue) => this.setSetting("$http.body", newValue)}/></div>
            </div>
        </div>;
    }
}