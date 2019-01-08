import * as React from "react";
import {isString, isObjectLike, isNil, map, cloneDeep, has} from "lodash";
import {ObjectReference} from "./ObjectReference";

export interface JSONViewerState {
    rowState: { [path: string]: boolean };
    expandAll?: boolean;
}

export interface JSONViewerProps {
    content?: string | object;
    pathPrefix?: string;
}

export class JSONViewer extends React.PureComponent<JSONViewerProps, JSONViewerState> {

    constructor(props) {
        super(props);
        this.state = {
            rowState: {}
        };
    }

    onRowClicked(rowPathString: string) {
        let rowState = cloneDeep(this.state.rowState);

        if(this.state.expandAll && !has(this.state.rowState, rowPathString))
        {
            rowState[rowPathString] = false;
        }
        else
        {
            rowState[rowPathString] = !rowState[rowPathString];
        }

        this.setState({
            rowState: rowState
        });
    }

    static joinPath(path: string[] = []): string {
        let pathString = "";

        for (let index = 0; index < path.length; index++) {
            let pathItem = path[index];

            if (/[^\w_$]/.test(pathItem)) {
                pathString += `["${pathItem}"]`;
            } else {
                pathString += `${index === 0 ? "" : "."}${pathItem}`;
            }
        }

        return pathString;
    }

    renderContent(value, currentPath, expanded, hasChildren) {
        if (hasChildren) {
            if (!expanded) {
                return "...";
            }

            return this.renderRow(value, currentPath);
        }

        return <span className="json-viewer-value" draggable={true}>{value}</span>
    }

    renderRow(contentObject: object, path: string[] = []) {
        return <ul className="json-viewer-level">{map(contentObject, (value, key) => {

            let currentPath = path.concat([key]);
            let currentPathString = JSONViewer.joinPath(currentPath);
            let expanded = !!this.state.rowState[currentPathString];

            if(this.state.expandAll && !has(this.state.rowState, currentPathString))
            {
                expanded = true;
            }

            let hasChildren = !isNil(value) && isObjectLike(value);

            return <li className={`json-viewer-row ${expanded ? "expanded" : "collapsed"} ${hasChildren ? "has-children" : "no-children"}`}
                       onClick={(event) => {
                           event.stopPropagation();

                           if (hasChildren) {
                               this.onRowClicked(currentPathString);
                           }
                       }}
                       key={currentPathString}>
                <span className="json-viewer-key" draggable={true}><ObjectReference displayName={key} objectPath={(this.props.pathPrefix || "") + currentPathString}/></span>
                <span>&nbsp;:&nbsp;</span>
                {this.renderContent(value, currentPath, expanded, hasChildren)}</li>;

        })}</ul>
    }

    expandAll = () => {
        this.setState({
            expandAll: true,
            rowState: {}
        });
    };

    collapseAll = () => {
        this.setState({
            expandAll: false,
            rowState: {}
        });
    };

    render() {

        let contentObject = this.props.content;

        if (isString(contentObject)) {
            contentObject = JSON.parse(contentObject as string);
        }

        return <div className="json-viewer">
            <div className="json-viewer-tools">
                <a className="is-size-7" onClick={this.expandAll}>Expand All</a> | <a className="is-size-7" onClick={this.collapseAll}>Collapse All</a>
            </div>
            <div className="json-viewer-body">
                {this.renderRow(contentObject as object)}
            </div>
        </div>;
    }
}