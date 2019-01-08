import * as React from "react";
import Editor from "react-simple-code-editor";
import {isNil} from "lodash";

export interface TextEditorProps {
    value?:string;
    onValueChange?:(newValue:string) => void;
}

export class TextEditor extends React.PureComponent<TextEditorProps> {

    constructor(props) {
        super(props);
    }

    render() {
        return <Editor
            className="text-editor"
            value={isNil(this.props.value) ? "" : this.props.value}
            onValueChange={this.props.onValueChange}
            highlight={code => code}
            padding={"0.35em"}
        />;
    }
}