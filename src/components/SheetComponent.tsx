import * as React from "react";
import * as ReactDOM from "react-dom";
import {RowComponent} from "./RowComponent";
import {Row, RowUtils} from "../common/SheetDoc";
import {set, cloneDeep, map, debounce, isNil, findIndex, get, each, has} from "lodash";
import {DynON} from "../../../DynON";
import {Utils} from "../common/Utils";
import {FaEye, FaEyeSlash} from "react-icons/fa";
import {
    SortableContainer,
    SortableElement,
    arrayMove,
} from "react-sortable-hoc";

const SAMPLE_DOC = [{"id":"r1","value":"// This is a comment, it doesn't do anything","_dataValue":{"$js":""}},{"id":"your_name","value":"// You can ask for user input by appending a sentence with ??\nWhat is your name??","_dataValue":{"$ask":{"question":"What is your name?","answer":""}},"_calculatedValue":""},{"id":"r3","value":"// You can reference other cells with {{cell_name}}\nHi {{your_name}}!","_dataValue":"Hi {{your_name}}!","_calculatedValue":"Hi !"},{"id":"some_json","value":"// You can supply JSON data\n{\n  \"special_number\": 42,\n  \"foo\": \"bar\"\n}","_dataValue":{"special_number":42,"foo":"bar"},"_calculatedValue":{"special_number":42,"foo":"bar"},"hidden":true},{"id":"r5","value":"// You can also reference JSON data in cells\nDid you know the meaning of life is {{some_json.special_number}}?","_dataValue":"Did you know the meaning of life is {{some_json.special_number}}?","_calculatedValue":"Did you know the meaning of life is 42?"},{"id":"r6","value":"And the meaning of life x 2 is...","_dataValue":"And the meaning of life x 2 is...","_calculatedValue":"And the meaning of life x 2 is..."},{"id":"r7","value":"// You can also supply small snippets of code\n{{some_json.special_number}} * 2","_dataValue":{"$js":"{{some_json.special_number}} * 2"},"_calculatedValue":84},{"id":"r11","value":"--- // This is a line break","_dataValue":"---","_calculatedValue":"---"},{"id":"markdown","_calculatedValue":"We even support [markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet). How `cool` is that?","value":"We even support [markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet). How `cool` is that?","_dataValue":"We even support [markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet). How `cool` is that?"},{"id":"r12","value":"Speaking of cool. Rockets are cool.","_dataValue":"Speaking of cool. Rockets are cool.","_calculatedValue":"Speaking of cool. Rockets are cool."},{"id":"launch_data","value":"// You can pull in data from web pages and APIs\nhttps://api.spacexdata.com/v3/launches/latest","_dataValue":{"$http":{"url":"https://api.spacexdata.com/v3/launches/latest"}},"_calculatedValue":{"url":"https://api.spacexdata.com/v3/launches/latest","headers":{"content-type":"application/json; charset=utf-8"},"statusCode":200,"body":{"flight_number":73,"mission_name":"GPS III SV01","mission_id":[],"launch_year":"2018","launch_date_unix":1545573060,"launch_date_utc":"2018-12-23T13:51:00.000Z","launch_date_local":"2018-12-23T08:51:00-05:00","is_tentative":false,"tentative_max_precision":"hour","tbd":false,"launch_window":1560,"rocket":{"rocket_id":"falcon9","rocket_name":"Falcon 9","rocket_type":"FT","first_stage":{"cores":[{"core_serial":"B1054","flight":1,"block":5,"gridfins":false,"legs":false,"reused":false,"land_success":null,"landing_intent":false,"landing_type":null,"landing_vehicle":null}]},"second_stage":{"block":5,"payloads":[{"payload_id":"GPS III SV01","norad_id":[43873],"reused":false,"customers":["USAF"],"nationality":"United States","manufacturer":"Lockheed Martin","payload_type":"Satellite","payload_mass_kg":4400,"payload_mass_lbs":9700.34,"orbit":"MEO","orbit_params":{"reference_system":"geocentric","regime":"semi-synchronous","longitude":null,"semi_major_axis_km":26558.745,"eccentricity":0.0003293,"periapsis_km":20171.865,"apoapsis_km":20189.356,"inclination_deg":54.9349,"period_min":717.911,"lifespan_years":15,"epoch":"2019-01-04T00:00:00.000Z","mean_motion":2.00581751,"raan":199.3793,"arg_of_pericenter":276.374,"mean_anomaly":203.623}}]},"fairings":{"reused":false,"recovery_attempt":false,"recovered":false,"ship":null}},"ships":[],"telemetry":{"flight_club":null},"launch_site":{"site_id":"ccafs_slc_40","site_name":"CCAFS SLC 40","site_name_long":"Cape Canaveral Air Force Station Space Launch Complex 40"},"launch_success":true,"links":{"mission_patch":"https://images2.imgbox.com/e1/cb/cvLgCm0d_o.png","mission_patch_small":"https://images2.imgbox.com/b3/24/vKUtLIu9_o.png","reddit_campaign":"https://www.reddit.com/r/spacex/comments/a4516o/gps_iii2_launch_campaign_thread/","reddit_launch":"https://www.reddit.com/r/spacex/comments/a71wyn/rspacex_gps_iii2_official_launch_discussion/","reddit_recovery":null,"reddit_media":"https://www.reddit.com/r/spacex/comments/a73kz5/rspacex_gps_iii2_media_thread_videos_images_gifs/","presskit":"https://www.spacex.com/sites/spacex/files/gps_iii_press_kit.pdf","article_link":"https://spaceflightnow.com/2018/12/23/spacex-closes-out-year-with-successful-gps-satellite-launch/","wikipedia":"https://en.wikipedia.org/wiki/GPS_Block_IIIA","video_link":"https://youtu.be/yRiLPoy_Mzc","flickr_images":["https://farm5.staticflickr.com/4864/45715171884_f1dd88c058_o.jpg","https://farm8.staticflickr.com/7926/45525648155_32fdab17a5_o.jpg","https://farm8.staticflickr.com/7876/45525649035_ba60162fe0_o.jpg","https://farm8.staticflickr.com/7853/45525649825_e6d35415e1_o.jpg","https://farm5.staticflickr.com/4893/45525650685_02b408c385_o.jpg"]},"details":"SpaceX's twenty-first flight of 2018 launched the first of the new GPS III satellites (Block IIIA) for the United States Air Force and was SpaceX's first EELV mission. The spacecraft was delivered to a MEO transfer orbit from SLC-40 at Cape Canaveral Air Force Station. This mission was the first to fly with the redesigned COPV on the first stage (B1054) as well as the second. The booster was expended.","upcoming":false,"static_fire_date_utc":"2018-12-13T21:24:00.000Z","static_fire_date_unix":1544736240}},"hidden":true},{"id":"r8","value":"// And reference data from that API\nThis is rocket flight number: {{launch_data.body.flight_number}}","_dataValue":"This is rocket flight number: {{launch_data.body.flight_number}}","_calculatedValue":"This is rocket flight number: 73"},{"id":"r9","value":"// You can even display images\n{{launch_data.body.links.flickr_images.0}}","_dataValue":"{{launch_data.body.links.flickr_images.0}}","_calculatedValue":"https://farm5.staticflickr.com/4864/45715171884_f1dd88c058_o.jpg"},{"id":"r10","value":"Pretty cool eh? 😎","_dataValue":"Pretty cool eh? 😎","_calculatedValue":"Pretty cool eh? 😎"}];

const SortableRow = SortableElement(({row, rowIndex, index, hideCode, onRowDelete, onRowUpdate, onInsertBelow}) => {
    return <RowComponent hideCode={hideCode}
                         row={row}
                         onInsertBelow={() => onInsertBelow(rowIndex)}
                         onRowDelete={() => onRowDelete(rowIndex)}
                         onRowUpdated={(row) => onRowUpdate(rowIndex, row)}/>
});

const SortableRows = SortableContainer(({rows, hideCode, onRowDelete, onRowUpdate, onInsertBelow}) => {
    return <div>
        {map(rows, (value, index) => (
            // @ts-ignore
            <SortableRow key={`item-${index}`}
                         index={index}
                         rowIndex={index}
                         row={value}
                         hideCode={hideCode}
                         onInsertBelow={onInsertBelow}
                         onRowDelete={onRowDelete}
                         onRowUpdate={onRowUpdate}/>
        ))}
    </div>;
});

export interface SheetComponentProps {
}

export interface SheetComponentState {
    rows: Row[];
    hideCode?: boolean;
}

export class SheetComponent extends React.Component<SheetComponentProps, SheetComponentState> {

    lastDataDoc;
    customDataHandlerCache = {};
    delayedCustomDataHandlerActions = {};
    lockDelayedCustomData = false;
    sheetRef;

    constructor(props) {
        super(props);

        this.sheetRef = React.createRef();

        this.state = {
            rows: []
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (isNil(state.rows) || state.rows.length === 0) {
            return {
                rows: [{
                    id: "r1"
                }]
            };
        }

        return null;
    }

    componentDidMount(): void {
        this.lastDataDoc = null;
        this.customDataHandlerCache = {};
        this.delayedCustomDataHandlerActions = {};
        this.lockDelayedCustomData = false;

        let rows;

        try {
            rows = JSON.parse(localStorage.getItem("last_sheet"));
        } catch (e) {
        }

        if (isNil(rows)) {
            rows = SAMPLE_DOC;
        }

        this.doCalculation(rows);
    }

    delayedCustomDataHandler = debounce(async () => {

        if (this.lockDelayedCustomData) {
            return;
        }

        this.lockDelayedCustomData = true;

        let actions = [];
        each(this.delayedCustomDataHandlerActions, (customDataInfo: { key: string, name: string, options: any }) => {
            if (customDataInfo.name === "$http") {
                actions.push(Utils.fetch(customDataInfo.options)
                    .then((response) => {
                        this.customDataHandlerCache[customDataInfo.key] = {
                            ts: Date.now(),
                            value: response
                        };
                    }).catch(error => {
                        this.customDataHandlerCache[customDataInfo.key] = {
                            ts: Date.now(),
                            value: error
                        };
                    }));
            }
        });

        console.log("Processing Delayed Data...");
        await Promise.all(actions);
        console.log("Delayed Data Finished...");

        await this.doCalculation(cloneDeep(this.state.rows));

        this.delayedCustomDataHandlerActions = {};
        this.lockDelayedCustomData = false;
    }, 1000);

    handleDelayedCustomData(providerName: string, providerOptions?: any): any {
        let customHandlerKey = Utils.stableJSONStringify([providerName, providerOptions]);

        if (has(this.customDataHandlerCache, customHandlerKey)) {
            return this.customDataHandlerCache[customHandlerKey].value;
        }

        this.delayedCustomDataHandlerActions[customHandlerKey] = {
            key: customHandlerKey,
            name: providerName,
            options: providerOptions
        };

        this.delayedCustomDataHandler.cancel();
        this.delayedCustomDataHandler();
        return "Fetching...";
    }

    handleCustomData = async (providerName: string, providerOptions?: any): Promise<any> => {
        switch (providerName) {
            case "$js": {
                try {
                    return Utils.executeScript(providerOptions);
                } catch (e) {
                    return e;
                }
            }
            case "$http": {
                return this.handleDelayedCustomData(providerName, providerOptions);
            }
            case "$ask": {
                return get(providerOptions, "answer");
            }
            default: {
                let defaultValue = {};
                defaultValue[`${providerName}`] = providerOptions;
                return defaultValue;
            }
        }
    };

    static getDataDoc(rows: Row[]): any {
        let dataDoc = {};

        for (let row of rows) {
            dataDoc[row.id] = cloneDeep(RowUtils.getDataValue(row));
        }

        return dataDoc;
    }

    saveDoc() {
        localStorage.setItem("last_sheet", JSON.stringify(this.state.rows));
    }

    doRecalculation = () => {
        let newRows = cloneDeep(this.state.rows);
        this.doCalculation(newRows);
    };

    async doCalculation(newRows: Row[]) {

        this.delayedCustomDataHandler.cancel();
        this.delayedCustomDataHandlerActions = {};

        let dataDoc = SheetComponent.getDataDoc(newRows);

        let dirtyRowIDs = [];
        each(dataDoc, (rowData, rowID) => {
            if (isNil(this.lastDataDoc) || !Utils.isEqual(rowData, this.lastDataDoc[rowID])) {
                dirtyRowIDs.push(rowID);
            }
        });

        // Are there any rows that no longer exist?
        each(this.lastDataDoc, (rowData, rowID) => {
            if (!has(dataDoc, rowID)) {
                dirtyRowIDs.push(rowID);
            }
        });

        console.log({
            dirty: dirtyRowIDs,
            data: dataDoc
        });

        this.lastDataDoc = dataDoc;

        if (dirtyRowIDs.length > 0) {
            console.log("Calculating");

            Utils.displayLoadingIndicator(true);

            try {
                await DynON.fillReferences(dataDoc, dataDoc, null, this.handleCustomData);
            } catch (e) {
            }

            Utils.displayLoadingIndicator(false);
        }

        for (let row of newRows) {
            RowUtils.setCalculatedValue(row, dataDoc[row.id]);
        }

        return new Promise((resolve, reject) => {
            this.setState({
                rows: newRows
            }, () => {
                this.saveDoc();
                resolve();
            });
        });
    }

    /*handleRowMove(rowIndex: number, relativePosition: number) {
        let rows = cloneDeep(this.state.rows);
        let newRowIndex = rowIndex + relativePosition;

        if (newRowIndex >= 0 && newRowIndex < rows.length) {
            rows.splice(newRowIndex, 0, rows.splice(rowIndex, 1)[0]);
            this.setState({
                rows: rows
            });
        }
    }*/

    handleRowDeleted(rowIndex: number) {
        let newRows = cloneDeep(this.state.rows);
        newRows.splice(rowIndex, 1);
        this.doCalculation(newRows);
    }

    handleRowUpdated(rowIndex: number, row: Row) {
        let newRows = cloneDeep(this.state.rows);
        set(newRows, rowIndex, row);

        // There seems to be a bug in react where calling an async function (doCalculation) to update the props of an input causes the cursor to jump around.
        // So unfortunately we have to update the state twice.
        this.setState({
            rows: newRows
        }, () => {
            let newRows = cloneDeep(this.state.rows);
            this.doCalculation(newRows)
        });
    }

    handleRowInsertBelow(rowIndex: number) {
        let newRows = cloneDeep(this.state.rows);
        newRows.splice(rowIndex + 1, 0, {
            id: this.getNewRowID(rowIndex)
        });
        this.setState({
            rows: newRows
        }, () => this.saveDoc);
    }

    handleToggleHideCode = () => {
        this.setState({
            hideCode: !this.state.hideCode
        });
    };

    handleSortEnd = ({oldIndex, newIndex}) => {
        this.setState({
            rows: arrayMove(this.state.rows, oldIndex, newIndex),
        }, () => this.saveDoc());
    };

    handleGetScrollableContainer = (wrappedInstance) => {
        return this.sheetRef.current || ReactDOM.findDOMNode(this);
    };

    getNewRowID(startingIndex: number = this.state.rows.length): string {
        let newRowIndex = startingIndex;
        let newRowID;

        do {
            ++newRowIndex;
            newRowID = `r${newRowIndex}`;
        }
        while (findIndex(this.state.rows, {id: newRowID}) !== -1);

        return newRowID;
    }

    renderRows(): RowComponent[] {

        if (this.state.hideCode) {
            return map(this.state.rows, (row: Row, rowIndex) => {
                return <RowComponent key={rowIndex}
                                     hideCode={this.state.hideCode}
                                     row={row}
                                     onRowDelete={() => this.handleRowDeleted(rowIndex)}
                                     onRowUpdated={(row) => this.handleRowUpdated(rowIndex, row)}
                                     onInsertBelow={() => this.handleRowInsertBelow(rowIndex)}/>
            });
        }

        // @ts-ignore
        return <SortableRows rows={this.state.rows}
                             hideCode={this.state.hideCode}
                             useDragHandle={true}
                             lockAxis="y"
                             onInsertBelow={(rowIndex) => this.handleRowInsertBelow(rowIndex)}
                             onRowDelete={(rowIndex) => this.handleRowDeleted(rowIndex)}
                             onRowUpdate={(rowIndex, row) => this.handleRowUpdated(rowIndex, row)}
                             onSortEnd={this.handleSortEnd}/>
    }

    render() {
        return <React.Fragment>
            <div className="toolbar">
                <a className="is-size-7" onClick={this.handleToggleHideCode}><span className="icon">{this.state.hideCode ? <FaEye/> :
                    <FaEyeSlash/>}</span> {this.state.hideCode ? "Show" : "Hide"} sheet code</a>
            </div>
            <div className="sheet" ref={this.sheetRef}>
                {this.renderRows()}
            </div>
        </React.Fragment>;
    }
}