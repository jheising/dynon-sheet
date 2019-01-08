import * as React from "react";
import {isNil} from "lodash";

export interface ObjectReferenceProps {
    displayName?:string;
    objectPath?:string;
}

export class ObjectReference extends React.PureComponent<ObjectReferenceProps> {

    handleOnDragStart = (event) => {
        event.dataTransfer.setData("text", `{{${this.props.objectPath}}}`);
    };

    render() {
        return <span className="signal-reference"
                     style={{cursor:"grab"}}
                     onDragStart={this.handleOnDragStart}
                     draggable={true}>
            <span style={{opacity:0}}>{"{{"}</span>{isNil(this.props.displayName) ? this.props.objectPath : this.props.displayName}<span style={{opacity:0}}>{"}}"}</span>
        </span>;
    }
}