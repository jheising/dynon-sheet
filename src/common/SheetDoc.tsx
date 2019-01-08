import * as React from "react";
import {isNil, isString, has, get, set, isObjectLike, isFunction, cloneDeep, defaultsDeep} from "lodash";
import {HTTPRequestComponent} from "../components/HTTPRequestComponent";
import {Utils} from "./Utils";
import {JSONViewer} from "../components/JSONViewer";
import * as ReactMarkdown from "react-markdown";

export interface Row {
    id: string;
    value?: string;
    hidden?: boolean;
    _dataValue?: any;
    _calculatedValue?: any;
}

export class RowUtils {

    static getValue(row: Row): string {
        return row.value;
    }

    static setValue(row: Row, value: string) {
        row.value = value;

        // Remove any comments
        value = Utils.removeComments(value);

        if (Utils.isURL(value)) {
            row._dataValue = defaultsDeep({}, {$http: {url: value}}, has(row._dataValue, "$http") ? row._dataValue : null);
            return;
        }

        if (isString(value)) {

            // Can we convert this string to an Object?
            try {
                row._dataValue = JSON.parse(value);
                return;
            } catch (e) {

                // Is this a script?
                if (Utils.isScript(value)) {
                    row._dataValue = {
                        $js: value
                    };
                    return;
                }

                // Is this a question?
                if (/.*\?\?\s*$/.test(value)) {
                    row._dataValue = defaultsDeep({}, {$ask: {question: value.replace(/\?$/, "")}}, has(row._dataValue, "$ask") ? row._dataValue : null);
                    return;
                }
            }
        }

        row._dataValue = value;
    }

    static getDataValue(row: Row): any {
        return row._dataValue;
    }

    static setCalculatedValue(row: Row, calculatedValue: any) {
        row._calculatedValue = calculatedValue;

        if (isString(calculatedValue)) {
            // Can we convert this string to an Object?
            try {
                row._calculatedValue = JSON.parse(calculatedValue);
            } catch (e) {
            }
        }
    }

    static getCalculatedValue(row: Row): any {
        let returnValue = isNil(row._calculatedValue) ? row.value : row._calculatedValue;

        if (isString(returnValue)) {
            returnValue = Utils.removeComments(returnValue);
        }

        return returnValue;
    }

    static async getOutputComponent(row: Row, onRowUpdated?: (newRow: Row) => void): Promise<React.ReactNode> {

        // Is this a question?
        let dataValue = RowUtils.getDataValue(row);

        if (has(dataValue, "$ask")) {
            return <div className="question-output">
                <ReactMarkdown linkTarget="_blank" className="question-label content" source={get(dataValue, "$ask.question", "")}/>
                <input className="input" type="text"
                       value={get(dataValue, "$ask.answer", "")}
                       onChange={(event) => {
                           let newRow = cloneDeep(row);
                           set(newRow, "_dataValue.$ask.answer", event.target.value);

                           if (onRowUpdated) {
                               onRowUpdated(newRow);
                           }
                       }}/>
            </div>
        }

        let calculatedValue = RowUtils.getCalculatedValue(row);
        let outputComponent = calculatedValue;

        if (isNil(calculatedValue) || isFunction(calculatedValue)) {
            outputComponent = "";
        } else if (calculatedValue instanceof Error) {
            outputComponent = <span className="tag is-danger">Error</span>;
        } else if (isObjectLike(calculatedValue)) {
            // Is this an image?
            if (get(calculatedValue, "headers.content-type", "").indexOf("image") === 0) {
                outputComponent = <img src={get(calculatedValue, "url", "")} style={{maxHeight: 500}}/>;
            } else {
                outputComponent = <JSONViewer content={calculatedValue} pathPrefix={`${row.id}.`}/>
            }
        } else if (Utils.isURL(calculatedValue)) {
            if (await Utils.isImage(calculatedValue)) {
                outputComponent = <img src={calculatedValue} style={{maxHeight: 500}}/>;
            } else {
                outputComponent = <a href={calculatedValue} target="_blank">{calculatedValue}</a>
            }
        } else if (/^-+$/.test(calculatedValue)) {
            outputComponent = <hr/>;
        } else {
            outputComponent = <ReactMarkdown linkTarget="_blank" className="content" source={calculatedValue.toString()}/>
        }

        return outputComponent;
    }

    static getAdvancedEditor(row: Row): any {

        let dataValue = RowUtils.getDataValue(row);

        if (isNil(dataValue)) {
            return null;
        }

        if (has(dataValue, "$http")) {
            return <HTTPRequestComponent/>
        }

        return null;
    }
}