import { useRef, CSSProperties, useState, useEffect, Fragment } from 'react';
import styles from "./Table.module.scss"
import classNames from 'classnames';

type Column = {
  order: number;
  title: string;
  id: string;
  visible: boolean,
  width: string | number
}

type TableProps = {
  freezeRows?: number;
  freezeColumns?: number,
  columns?: (Partial<Column> | string)[],
  rows?: { [name: string]: any },
  hideColumnHeaders?: boolean
  freezeColumnHeaders?: boolean,
  freezeFirstColumn?: boolean,
  headerRowStyle?: CSSProperties;
  cellStyle?: CSSProperties;
  cellClass?: string;
  headerRowClass?: string;
  blankCellValue?: string
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
  cellStyle = {},
  cellClass = '',
  headerRowClass = '',
  blankCellValue = '-'
}: TableProps) => {

  // refs
  const topRef = useRef(null);

  const t1Ref = useRef(null);

  const t2Ref = useRef(null);
  const t2ContainerRef = useRef(null);

  const t3Ref = useRef(null);


  const cols: Column[] = (columns.length > 0 ? columns : Object.values(rows.reduce((al: any, cu: any) => {
    al = { ...al, ...Object.keys(cu) }
    return al;
  }, {}))).map((col: Column | any, i) => {

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
  });


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
    })];

  const [rowHeights, setRowHeights] = useState<{ height: number }[]>([]);
  const [colWidths, setColWidths] = useState<{ width: number }[]>([]);
  const [t3Width, setT3Width] = useState<string | number>("auto");
  const [frozenColumns, setFrozenColumns] = useState<number>(freezeColumns);
  const [frozenRows, setFrozenRows] = useState<number>(freezeRows);

  // ensure tde width of t1 and t3 are synced
  useEffect(() => {
    if (t1Ref?.current) setT3Width((t1Ref?.current as any)?.getBoundingClientRect()?.width)
  }, [t1Ref?.current?.["clientWidth"]])

  useEffect(() => {
    if (freezeColumnHeaders) {
      setFrozenRows(freezeRows + 1)
    } else {
      setFrozenRows(freezeRows)
    }
  }, [freezeColumnHeaders, freezeRows])

  useEffect(() => {
    if (freezeFirstColumn) {
      setFrozenColumns(freezeColumns + 1)
    } else {
      setFrozenColumns(freezeColumns)
    }
  }, [freezeFirstColumn, freezeColumns])

  function processRow(ref: any, rowIndex: number) {
    const height = ref?.offsetHeight;
    let newCells = [...rowHeights];
    if (!newCells?.[rowIndex]) {
      newCells[rowIndex] = { height: height }
      setRowHeights(newCells)
    }

    if (height > newCells[rowIndex].height) {
      newCells[rowIndex].height = height;
      setRowHeights(newCells)
    }
  }

  function processColumn(ref: any, columnIndex: number) {
    const width = ref.getBoundingClientRect().width;
    let newCells = [...colWidths];
    if (!newCells?.[columnIndex]) {
      newCells[columnIndex] = { width }
      setColWidths(newCells)
    }

    if (width != newCells[columnIndex].width || !isNaN(width) && isNaN(newCells[columnIndex].width)) {
      newCells[columnIndex].width = width;
      setColWidths(newCells)
    }
  }

  const handleHorizontalScroll = () => {
    const left = (event?.target as any)?.scrollLeft;
    if (t2ContainerRef.current) {
      const current: any = t2ContainerRef.current;
      current.scrollLeft = left
    }
  };

  return (
    <Fragment>
      <div className={classNames(styles.Table)} ref={topRef}>
        {
          frozenRows > 0 &&
          <div className={classNames(styles.TableRow, styles.Row1)}>
            {
              frozenColumns > 0 &&
              <table className={classNames('T1', styles.T1)} cellPadding={0} cellSpacing={0} ref={t1Ref} style={{ margin: 0 }}>
                <tbody>
                  {
                    data
                      ?.filter((_r: any[], rowIndex: number) => rowIndex < frozenRows)
                      ?.map((r: any, rowIndex: number) => (
                        <tr
                          key={rowIndex}
                          ref={(ref) => {
                            processRow(ref, rowIndex);
                          }}
                        >
                          {
                            r
                              ?.filter((_r: any[], columnIndex: number) => columnIndex < frozenColumns)
                              ?.map((c: any, columnIndex: number) => {
                                const width = cols?.[columnIndex].width || "auto"
                                return <td
                                  key={columnIndex}
                                  className={classNames(styles.Cell, styles.Head, headerRowClass)}
                                  style={{
                                    ...headerRowStyle,
                                    width,
                                    minWidth: width,
                                    ...(topRef?.current ? { maxWidth: `${(topRef.current as any).getBoundingClientRect()?.width * 0.75}px` } : {}),
                                  }}
                                  ref={(ref) => {
                                    if (ref && rowIndex == 0)
                                      processColumn(ref, columnIndex);
                                  }}
                                >{c.content}</td>
                              })
                          }
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            }
            <div className={classNames(styles.T2Container)} style={
              {
                overflow: "hidden", display: "flex",
                ...(
                  t1Ref?.current ?
                    {
                      width: `calc(100% - ${(t1Ref.current as any).getBoundingClientRect()?.width || 0}px)`,
                      maxWidth: `calc(100% - ${(t1Ref.current as any).getBoundingClientRect()?.width || 0}px)`,
                      minWidth: `calc(100% - ${(t1Ref.current as any).getBoundingClientRect()?.width || 0}px)`,
                    } :
                    { width: "auto" }
                )
              }
            } ref={t2ContainerRef}>
              <table className={classNames('T2', styles.T2)} cellPadding={0} cellSpacing={0} >
                <tbody>
                  {
                    data
                      ?.filter((_r: any[], rowIndex: number) => rowIndex < frozenRows)
                      ?.map((r: any, rowIndex: number) =>
                        <tr
                          key={rowIndex}
                          ref={(ref) => {
                            processRow(ref, rowIndex);
                          }}
                        >
                          {
                            r?.filter((_r: any[], columnIndex: number) => columnIndex >= frozenColumns)?.map((c: any, columnIndex: number) => {

                              const width = cols?.[columnIndex + frozenColumns]?.width || "auto"

                              return <td
                                key={columnIndex}
                                className={classNames(styles.Cell, styles.Head, headerRowClass)}
                                style={{
                                  ...headerRowStyle,
                                  width,
                                  minWidth: width
                                }}
                                ref={(ref) => {
                                  if (ref?.style && rowIndex == 0) {
                                    processColumn(ref, columnIndex + frozenColumns);
                                  }
                                }}>{c.content}</td>
                            }
                            )
                          }
                        </tr>)
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
        <div className={classNames(styles.TableRow, styles.Row2)} style={{ maxHeight: `calc(100% - ${(topRef?.current as any)?.getBoundingClientRect().height || 0}px)` }}>
          <table className={classNames('T3', styles.T3)} cellPadding={0} cellSpacing={0} ref={t3Ref} style={{ minWidth: (t3Width || "auto"), maxWidth: (t3Width || "auto") }}>
            <tbody>
              {
                data
                  ?.filter((_r: any[], rowIndex: number) => rowIndex >= frozenRows)
                  ?.map((r: any, rowIndex: number) =>
                    <tr
                      key={rowIndex}
                      style={{
                        height: rowHeights?.[rowIndex + frozenRows]?.height || "auto"
                      }}
                      ref={(ref) => {
                        processRow(ref, rowIndex + frozenRows);
                      }}
                    >
                      {
                        r.filter((_r: any[], i: number) => i < frozenColumns).map((c: any, columnIndex: number) => {

                          const width = (frozenRows == 0 ? cols?.[columnIndex].width : colWidths?.[columnIndex]?.width) || "auto";
                          return (
                            <td
                              key={columnIndex}
                              className={classNames(styles.Cell, cellClass)}
                              style={{
                                overflow: "hidden",
                                ...cellStyle,
                                minWidth: width,
                                ...(topRef?.current ? { maxWidth: `${(topRef.current as any).getBoundingClientRect()?.width * 0.5}px` } : {}),
                                ...(width ? { width: width, } : {}),
                                ...{
                                  ["--column-index"]: columnIndex,
                                  ["--column-id"]: c.columnId || "auto"
                                }
                              }}
                            >{c.content}</td>
                          )
                        })
                      }
                    </tr>
                  )
              }
            </tbody>
          </table>
          {
            data?.length > frozenRows &&
            <div className={styles.T4Container} style={{
              ...(
                t1Ref?.current ?
                  {
                    width: `calc(100% - ${(t1Ref.current as any).getBoundingClientRect()?.width || 0}px)`,
                    maxWidth: `calc(100% - ${(t1Ref.current as any).getBoundingClientRect()?.width || 0}px)`,
                    minWidth: `calc(100% - ${(t1Ref.current as any).getBoundingClientRect()?.width || 0}px)`,
                  } :
                  (
                    t3Ref?.current ?
                      {
                        width: `calc(100% - ${(t3Ref.current as any).getBoundingClientRect()?.width || 0}px)`,
                        maxWidth: `calc(100% - ${(t3Ref.current as any).getBoundingClientRect()?.width || 0}px)`,
                        minWidth: `calc(100% - ${(t3Ref.current as any).getBoundingClientRect()?.width || 0}px)`,
                      } :
                      { width: "auto" }
                  )
              )
            }} onScroll={handleHorizontalScroll}>
              <table className={classNames('T4', styles.T4)} cellPadding={0} cellSpacing={0} style={{
                ...(t2Ref?.current ? {
                  width: (t2Ref.current as any).getBoundingClientRect().width,
                  maxWidth: (t2Ref.current as any).getBoundingClientRect().width,
                  minWidth: (t2Ref.current as any).getBoundingClientRect().width,
                } : {})
              }}>
                <tbody>
                  {
                    data
                      ?.filter((_r: any[], rowIndex: number) => rowIndex >= frozenRows)
                      ?.map((r: any, rowIndex: number) =>
                        <tr
                          key={rowIndex}
                          style={{
                            height: rowHeights?.[rowIndex + frozenRows]?.height || "auto",
                          }}
                          ref={(ref) => {
                            processRow(ref, rowIndex + frozenRows);
                          }}
                        >
                          {
                            r
                              ?.filter((_r: any[], columnIndex: number) => columnIndex >= frozenColumns)
                              ?.map((c: any, columnIndex: number) => {
                                const w = (frozenRows == 0 ? cols?.[columnIndex + frozenColumns].width : colWidths?.[columnIndex + frozenColumns]?.width) || "auto";

                                const width = rowIndex == 0 ? {
                                  width: w,
                                  minWidth: w
                                } : {};

                                return (
                                  <td
                                    key={columnIndex}
                                    className={classNames(styles.Cell, cellClass)}
                                    style={{
                                      ...width,
                                      ...((rowIndex == 0 && frozenRows == 0) ? headerRowStyle : cellStyle),
                                      ...{
                                        ["--column-index"]: columnIndex + frozenColumns,
                                        ["--column-id"]: c.columnId || "auto"
                                      }
                                    }}
                                  >{c.content}</td>
                                )
                              })
                          }
                        </tr>
                      )
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </Fragment >
  )
}

export default Table;
