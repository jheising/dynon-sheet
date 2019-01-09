import {SortableHandle} from "react-sortable-hoc";
import {FaBars} from "react-icons/fa";
import * as React from "react";

export const DragHandle = SortableHandle(() => <span className="drag-handle"><FaBars/></span>);