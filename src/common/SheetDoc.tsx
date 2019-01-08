import * as React from "react";
import {isNil, isString, has, get, set, isObjectLike, isFunction, cloneDeep, defaultsDeep} from "lodash";
import {HTTPRequestComponent} from "../components/HTTPRequestComponent";
import {Utils} from "./Utils";
import {JSONViewer} from "../components/JSONViewer";

export interface Row {
    id: string;
    value?: string;
    _dataValue?:any;
    _calculatedValue?: any;
}

export class RowUtils {

    static getValue(row: Row): string {
        return row.value;
    }

    static setValue(row: Row, value: string) {
        row.value = value;
        row._dataValue = value;

        if (Utils.isURL(row.value)) {
            row._dataValue = defaultsDeep({}, {$http: {url:row.value}}, row._dataValue);
        }
        else if (isString(row.value)) {
            // Can we convert this string to an Object?
            try {
                row._dataValue = JSON.parse(row.value);
            } catch (e) {

                // Is this a script?
                if (Utils.isScript(row.value)) {
                    row._dataValue = {
                        $js: row.value
                    };
                }
                // Is this a question?
                else if (/.*\?\s*$/.test(row.value)) {
                    row._dataValue = defaultsDeep({}, {$ask: {question:row.value}}, row._dataValue);
                }
            }
        }

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
        return isNil(row._calculatedValue) ? row.value : row._calculatedValue;
    }

    static async getOutputComponent(row: Row, onRowUpdated?: (newRow: Row) => void): Promise<React.ReactNode> {

        // Is this a question?
        let dataValue = RowUtils.getDataValue(row);

        if (has(dataValue, "$ask")) {
            return <div className="question-output">
                <span className="question-label">{get(dataValue, "$ask.question", "")}</span>
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
        } else {
            outputComponent = calculatedValue.toString();
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