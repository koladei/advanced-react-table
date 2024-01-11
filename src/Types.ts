import { CSSProperties, RefObject } from "react";

export type Column = {
  order: number;
  title: string;
  id: string;
  visible: boolean;
  width: string | number;
};

export type TableProps = {
  freezeRows?: number;
  freezeColumns?: number;
  columns?: (Partial<Column> | string)[];
  rows?: { [name: string]: any };
  hideColumnHeaders?: boolean;
  freezeColumnHeaders?: boolean;
  freezeFirstColumn?: boolean;
  headerRowStyle?: CSSProperties;
  cellStyle?: CSSProperties;
  cellClass?: string;
  headerRowClass?: string;
  blankCellValue?: string;
  showColumnAndRowLabels?: boolean;
  prefferedRowLabelWidth?: number;
  prefferedColumnLabelHeight?: number;
  allowResize?: boolean;
  onColumnChanged?: (column: Column, columns?: Column[]) => void;
};

export type FocusedColumnInfo = {
  type: "column" | "row";
  index: number;
  element?: any;
  dimension?: {
    width: number;
    height: number;
  };
};

export type SubTableProps = {
  shift?: number;
  data: any[];
  frozenRows: number;
  actualFrozenRows: number;
  frozenColumns: number;
  actualFrozenColumns: number;
  colWidths: { width: number }[];
  cols: Column[];
  rowHeights: { height: number }[];
  columnLabels: string[];
  width?: string | number;
  height?: string | number;
  columnRefs?: RefObject<HTMLElement>[];
  focusedColumnOrRow?: FocusedColumnInfo;
  onWidthChanged?: (width: number) => void;
  onRowHeightsChanged?: (rowHeights: { height: number }[]) => void;
  onColumnWidthsChanged?: (colWidths: { width: number }[]) => void;
  setFocusedColumnOrRow?: (focus?: FocusedColumnInfo | undefined | null) => void;
};
