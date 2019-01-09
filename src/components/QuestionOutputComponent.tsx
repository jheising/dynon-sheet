import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import {get, set, cloneDeep, isString} from "lodash";
import {Row, RowUtils} from "../common/SheetDoc";

export interface QuestionOutputComponentProps {
    row:Row;
    onRowUpdated?:(newRow:Row) => void;
}

export class QuestionOutputComponent extends React.PureComponent<QuestionOutputComponentProps> {

    constructor(props) {
        super(props);
    }

    handleValueUpdated = (newValue:any) => {
        let newRow = cloneDeep(this.props.row);
        set(newRow, "dataValue.$ask.answer", newValue);

        if (this.props.onRowUpdated) {
            this.props.onRowUpdated(newRow);
        }
    };

    renderInput(dataValue)
    {
        let options = get(dataValue, "$ask.options", []);

        return <input className="input" type="text"
               value={get(dataValue, "$ask.answer", "")}
               onChange={(event) => {
                   this.handleValueUpdated(event.target.value);
               }}/>
    }

    render() {
        let dataValue = RowUtils.getDataValue(this.props.row);

        return <div className="question-output">
            <ReactMarkdown linkTarget="_blank" className="question-label content" source={get(dataValue, "$ask.question", "")}/>
            {this.renderInput(dataValue)}
        </div>;
    }
}