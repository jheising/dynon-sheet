import * as React from "react";

export interface HTTPRequestComponentProps {
}

export interface HTTPRequestComponentState {
}

export class HTTPRequestComponent extends React.Component<HTTPRequestComponentProps, HTTPRequestComponentState> {

    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return <div className="columns">
        </div>;
    }
}