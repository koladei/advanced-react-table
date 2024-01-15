import { useRef, useState, useEffect, useLayoutEffect, Fragment } from 'react';
import styles from "./Table.module.scss"
import classNames from 'classnames';
import T1 from './T1';
import T2 from './T2';
import T3 from './T3';
import T4 from './T4';
import { CellDimension, CellDimensionCollection, Column, FocusedColumnInfo, TableProps } from './Types';

export function letterSequence() {
  let currentLetter = 'A'.charCodeAt(0); // Start with ASCII code for 'A'

  return {
    next() {
      const letter = String.fromCharCode(currentLetter); // Convert ASCII code to letter
      currentLetter++; // Increment for the next letter
      return letter;
    }
  };
}

const Table = ({
  freezeRows = 0,
  freezeColumns = 0,
  rows = [],
  columns = [],
  hideColumnHeaders = false,
  freezeColumnHeaders = false,
  freezeFirstColumn = false,
  headerRowStyle = {},
  headerColumnStyle = {},
  cellStyle = {},
  cellClass = '',
  headerRowClass = '',
  addressCellClass = '',
  blankCellValue = '-',
  showColumnAndRowLabels = false,
  prefferedColumnLabelHeight = 40,
  prefferedRowLabelWidth = 40,
  allowResize = true
}: TableProps) => {

  const shift: number = showColumnAndRowLabels ? 1 : 0;

  // refs
  const topRef = useRef(null);
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);

  const t1Ref = useRef(null);
  const t2Ref = useRef(null);
  const t3Ref = useRef(null);

  const [topRowHeights, setTopRowHeights] = useState<Partial<CellDimension>[]>(showColumnAndRowLabels ? [{ height: prefferedColumnLabelHeight }] : []);
  const [rowHeights, setRowHeights] = useState<Partial<CellDimension>[]>(showColumnAndRowLabels ? [{ height: prefferedColumnLabelHeight }] : []);
  const [leftColWidths, setLeftColWidths] = useState<Partial<CellDimension>[]>(showColumnAndRowLabels ? [{ width: prefferedRowLabelWidth }] : []);
  const [colWidths, setColWidths] = useState<CellDimension[]>(showColumnAndRowLabels ? [{ width: prefferedColumnLabelHeight }] : []);
  const [frozenColumns, setFrozenColumns] = useState<number>(freezeColumns);
  const [frozenRows, setFrozenRows] = useState<number>(freezeRows);
  const [cols, setCols] = useState<Column[]>([]);
  const [columnLabels, setColumnLabels] = useState<string[]>([]);
  const [focusedColumnOrRow, setFocusedColumnOrRow] = useState<FocusedColumnInfo | undefined>(undefined);

  if (!addressCellClass) {
    addressCellClass = styles.AddressCell
  }


  useEffect(() => {
    const letterGenerator = letterSequence();
    const colLabels: string[] = [];

    setCols((columns.length > 0 ? columns : Object.values(rows.reduce((al: any, cu: any) => {
      al = { ...al, ...Object.keys(cu) }
      return al;
    }, {}))).map((col: Column | any, i) => {
      colLabels.push(letterGenerator.next());

      if (typeof col == "string") {
        return {
          order: i,
          title: col,
          id: col,
          visible: true,
          width: "auto"
        }
      }

      return {
        order: i,
        title: col?.title || col?.id,
        id: col?.id || col?.title,
        visible: col?.visible != undefined ? col?.visible : true,
        width: col?.width || "auto"
      }
    }));

    setColumnLabels(colLabels);
  }, [columns, columns?.length, rows, rows?.length]);

  //set default colWidths
  useLayoutEffect(() => {
    const newColWidths = [...colWidths];
    if (newColWidths.length == 0 && showColumnAndRowLabels) newColWidths[0] = { width: prefferedRowLabelWidth }

    cols.forEach((col, columnIndex) => {
      newColWidths[columnIndex + shift] = { ...colWidths[columnIndex + shift], width: (col.width == "auto" || !col.width) ? 0 : col.width as number }
    });

    setColWidths(newColWidths);
  }, [cols, cols?.length]);

  //set default rowHeights
  useLayoutEffect(() => {
    const newRowHeights = [...rowHeights];
    if (newRowHeights.length == 0 && showColumnAndRowLabels) newRowHeights[0] = { height: prefferedColumnLabelHeight }

    setRowHeights(newRowHeights);
  }, []);


  const data = [
    // add header columns row
    ...(hideColumnHeaders ? [] : [cols.sort((a, b) => (a?.order || 0) - (b?.order || 0)).reduce((al: any[], cu) => {
      al = [...al, { content: cu.title }];
      return al;
    }, [])]),


    // add data rows
    ...rows?.map((row: any) => {
      let cells: any[] = []
      cols.forEach((col: Column) => {
        cells = [...cells, { content: row[col.id] || <>{blankCellValue}</>, columnId: col.id }];
      });

      return cells;
    })
  ];

  // useEffect(() => {
  //   console.log(rowHeights)
  // }, [data, data.length]);

  //set the frozen rows
  useEffect(() => {
    const _one = (freezeColumnHeaders ? 1 : 0) + shift;
    setFrozenRows(freezeRows + _one)

  }, [freezeColumnHeaders, freezeRows, showColumnAndRowLabels, shift])

  //set the frozen columns
  useEffect(() => {
    const _one = (freezeFirstColumn ? 1 : 0) + shift;

    setFrozenColumns(freezeColumns + _one);
  }, [freezeFirstColumn, freezeColumns, showColumnAndRowLabels, shift]);

  // useEffect(() => {
  //   const width = prefferedRowLabelWidth;
  //   const height = prefferedColumnLabelHeight;
  //   if (showColumnAndRowLabels) {
  //     const newRowHeights = [...rowHeights];
  //     newRowHeights[0] = { height };
  //     setRowHeights(newRowHeights);

  //     const newColWidths = [...colWidths];
  //     newColWidths[0] = { width };
  //     setColWidths(newColWidths);
  //   } else {
  //     if (rowHeights?.length >= 1) {
  //       const newRowHeights = [...rowHeights];
  //       newRowHeights[0] = { height };
  //       setRowHeights(newRowHeights);
  //     }

  //     if (colWidths?.length >= 1) {
  //       const newColWidths = [...colWidths];
  //       newColWidths[0] = { width };
  //       setColWidths(newColWidths);
  //     }
  //   }

  // }, [showColumnAndRowLabels]);

  const actualFrozenRows = frozenRows - shift;
  const actualFrozenColumns = frozenColumns - shift;

  function onRowHeightsChanged(_rHeights: CellDimensionCollection) {
    const keys = Object.keys(_rHeights) as any as number[];
    if (keys.length > 0) {
      if (keys[0] < frozenRows) {
        let heights = [...topRowHeights];
        keys.forEach((k: any) => {
          heights[k] = _rHeights[k]
        });

        setTopRowHeights(heights);
      } else {
        let heights = [...rowHeights];
        keys.forEach((k: any) => {
          heights[k] = _rHeights[k]
        });

        setRowHeights(heights);
      }
    }
  }

  function onColumnWidthsChanged(_cWidths: CellDimensionCollection) {
    const keys = Object.keys(_cWidths) as any as number[];

    if (keys.length > 0) {
      if (keys[0] < frozenColumns) {
        let widths = [...leftColWidths];
        keys.forEach((k: any) => {
          widths[k] = _cWidths[k]
        });

        setLeftColWidths(widths);
      } else {
        let widths = [...colWidths];
        keys.forEach((k: any) => {
          widths[k] = _cWidths[k]
        });

        setColWidths(widths);
      }
    }
  }

  return (
    <div ref={topRef} className={classNames(styles.Table)} style={{
      // display: "flex",
      // flexDirection: "column",
      // overflow: "hidden",
      // overflowY: "scroll"
    }}>
      {
        (frozenRows > 0 || showColumnAndRowLabels) &&
        <div ref={row1Ref} className={classNames(styles.TableRow, styles.Row1)} style={{
          display: 'flex',
          height: "auto",
          minHeight: "fit-content"
        }}>
          {
            (frozenColumns > 0 || showColumnAndRowLabels) &&
            <Fragment>
              <T1
                ref={t1Ref}
                {...{
                  frozenColumns,
                  frozenRows,
                  hideColumnHeaders,
                  headerRowStyle,
                  headerColumnStyle,
                  cellStyle,
                  cellClass,
                  addressCellClass,
                  headerRowClass,
                  blankCellValue,
                  showColumnAndRowLabels,
                  prefferedColumnLabelHeight,
                  prefferedRowLabelWidth,
                  allowResize,
                  data,
                  cols,
                  colWidths: leftColWidths,
                  rowHeights: topRowHeights,
                  actualFrozenColumns,
                  actualFrozenRows,
                  columnLabels,
                  shift,
                  columnRefs: [...((t1Ref as any)?.current?.columnRefs || []), ...((t2Ref as any)?.current?.columnRefs || [])],
                  rowRefs: [...((t1Ref as any)?.current?.rowRefs || []), ...((t3Ref as any)?.current?.rowRefs || [])],
                  onRowHeightsChanged,
                  onColumnWidthsChanged,
                  focusedColumnOrRow,
                  setFocusedColumnOrRow: (focusedColumnOrRow: any) => setFocusedColumnOrRow(focusedColumnOrRow)
                }}
              />

              <T2
                ref={t2Ref}
                {...{
                  frozenColumns,
                  frozenRows,
                  hideColumnHeaders,
                  headerRowStyle,
                  headerColumnStyle,
                  cellStyle,
                  cellClass,
                  addressCellClass,
                  headerRowClass,
                  blankCellValue,
                  showColumnAndRowLabels,
                  prefferedColumnLabelHeight,
                  prefferedRowLabelWidth,
                  allowResize,
                  data,
                  cols,
                  colWidths,
                  rowHeights: topRowHeights,
                  actualFrozenColumns,
                  actualFrozenRows,
                  columnLabels,
                  shift,
                  columnRefs: [...((t1Ref as any)?.current?.columnRefs || []), ...((t2Ref as any)?.current?.columnRefs || [])],
                  onRowHeightsChanged,
                  onColumnWidthsChanged,
                  ...((t1Ref?.current as any)?.table && { width: `calc(100% - ${(t1Ref?.current as any)?.table?.getBoundingClientRect().width}px)` }),
                  focusedColumnOrRow,
                  setFocusedColumnOrRow: (focusedColumnOrRow: any) => setFocusedColumnOrRow(focusedColumnOrRow),
                }}
              />
            </Fragment>
          }
        </div>
      }
      <div ref={row2Ref} className={classNames(styles.TableRow, styles.Row2)} style={{
        minHeight: `calc(100% - ${(row1Ref?.current as any)?.getBoundingClientRect().height || 0}px)`,
        display: "flex",
        maxWidth: "100%",
        width: (row1Ref?.current as any)?.getBoundingClientRect()?.width,
        minWidth: (row1Ref?.current as any)?.getBoundingClientRect()?.width,
        overflow: "hidden",
        overflowY: "scroll"
      }}>
        <T3
          ref={t3Ref}
          {...{
            hideColumnHeaders,
            headerRowStyle,
            headerColumnStyle,
            cellStyle,
            cellClass,
            addressCellClass,
            headerRowClass,
            blankCellValue,
            showColumnAndRowLabels,
            prefferedColumnLabelHeight,
            prefferedRowLabelWidth,
            allowResize,
            data,
            cols,
            colWidths: leftColWidths,
            rowHeights,
            frozenColumns,
            frozenRows,
            actualFrozenColumns,
            actualFrozenRows,
            columnLabels,
            shift,
            ...((t1Ref?.current as any)?.table ? { width: (t1Ref?.current as any)?.table?.getBoundingClientRect().width } : {}),
            rowRefs: [...((t1Ref as any)?.current?.rowRefs || []), ...((t3Ref as any)?.current?.rowRefs || [])],
            // columnRefs: [...((t3Ref as any)?.current?.rowRefs || []), ...((t3Ref as any)?.current?.rowRefs || [])],
            onRowHeightsChanged,
            onColumnWidthsChanged,
            focusedColumnOrRow,
            setFocusedColumnOrRow: (focusedColumnOrRow?: FocusedColumnInfo) => setFocusedColumnOrRow(focusedColumnOrRow),
          }}
        />
        {
          data?.length >= frozenRows &&
          <T4
            {...{
              frozenColumns,
              frozenRows,
              hideColumnHeaders,
              headerRowStyle,
              headerColumnStyle,
              cellStyle,
              cellClass,
              addressCellClass,
              headerRowClass,
              blankCellValue,
              showColumnAndRowLabels,
              prefferedColumnLabelHeight,
              prefferedRowLabelWidth,
              allowResize,
              data,
              cols,
              colWidths,
              rowHeights,
              actualFrozenColumns,
              actualFrozenRows,
              columnLabels,
              width: `calc(100% - ${(t1Ref?.current as any)?.table?.getBoundingClientRect()?.width}px)`,
              shift,
              onT4HorizontalScroll: (position) => {
                (t2Ref?.current as any)?.container?.scrollTo(position, 0);
              },
              onRowHeightsChanged,
              onColumnWidthsChanged,
              focusedColumnOrRow,
              setFocusedColumnOrRow: (focusedColumnOrRow: any) => setFocusedColumnOrRow(focusedColumnOrRow)
            }}
          />
        }
      </div>
    </div>
  )
}

export default Table;
