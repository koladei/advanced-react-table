import { RefObject } from "react";

export const publishResize = (tableRef: RefObject<HTMLElement>, onRowHeightsChanged?: Function | null, onColumnWidthsChanged?: Function | null) => {
  if (typeof onRowHeightsChanged == "function") {
    let rHeights = {};
    tableRef?.current?.querySelectorAll("tr[data-item-type='row']").forEach((row: any) => {
      const rowIndex = parseInt(row.getAttribute("data-row-id"));
      const height = row?.getBoundingClientRect()?.height;
      rHeights = { ...rHeights, [rowIndex]: { height } };
    });

    onRowHeightsChanged && onRowHeightsChanged(rHeights);
  }

  if (typeof onColumnWidthsChanged == "function") {
    let cWidths = {};
    const firstRow = tableRef?.current?.querySelector("tr[data-item-type='row']");
    firstRow?.querySelectorAll("td[data-item-type='column']").forEach((column: any) => {
      const columnIndex = parseInt(column.getAttribute("data-column-id"));
      const width = column?.getBoundingClientRect()?.width;
      cWidths = { ...cWidths, [columnIndex]: { width } };
    });

    onColumnWidthsChanged && onColumnWidthsChanged(cWidths);
  }
};
