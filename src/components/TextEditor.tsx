import * as React from "react";
import Editor from "react-simple-code-editor";
import {isNil} from "lodash";
import {highlight, languages} from "prismjs/components/prism-core";
//import "prismjs/components/prism-json";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";
import {Utils} from "../common/Utils";

export interface TextEditorProps {
    value?:string;
    onValueChange?:(newValue:string) => void;
}

languages.default = {
    'comment': [
        {
            pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
            lookbehind: true
        },
        {
            pattern: /(^|[^\\:])\/\/.*/,
            lookbehind: true,
            greedy: true
        }
    ]
};

export class TextEditor extends React.PureComponent<TextEditorProps> {

    constructor(props) {
        super(props);
    }

    static highlightText(code) {

        if (isNil(code)) {
            return "";
        }

        if(Utils.isScript(code))
        {
            code = highlight(code, languages.javascript);
        }
        else
        {
            code = highlight(code, languages.default);
        }

        return code;
    }

    render() {
        return <Editor
            className="text-editor"
            value={isNil(this.props.value) ? "" : this.props.value}
            onValueChange={this.props.onValueChange}
            highlight={TextEditor.highlightText}
            padding={"0.35em"}
        />;
    }
}