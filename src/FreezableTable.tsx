import { useRef, CSSProperties, useState, useEffect, Fragment } from 'react';
import styles from "./FreezableTable.module.scss"
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
}

const FreezableTable = ({
  freezeRows = 0,
  freezeColumns = 0,
  rows = [],
  columns = [],
  hideColumnHeaders = false,
  freezeColumnHeaders = false,
  freezeFirstColumn = false,
  headerRowStyle = { textWrap: "nowrap" },
  cellStyle = { textWrap: "inherit" }
}: TableProps) => {

  const refs = useRef([])

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
        cells = [...cells, { content: row[col.id] }];
      });

      return cells;
    })];

  const [rowHeights, setRowHeights] = useState<{ height: number }[]>([]);
  const [colWidths, setColWidths] = useState<{ width: number }[]>([]);
  const [t3Width, setT3Width] = useState<string | number>("auto");
  const [t4Width, setT4Width] = useState<string | number>("100%");
  const [frozenColumns, setFrozenColumns] = useState<number>(freezeColumns);
  const [frozenRows, setFrozenRows] = useState<number>(freezeRows);

  // ensure tde width of t1 and t3 are synced
  useEffect(() => {
    if (t1Ref?.current) setT3Width((t1Ref?.current as any)?.getBoundingClientRect()?.width)
  }, [t1Ref?.current?.["clientWidth"]])

  // ensure tde width of t2 and t4 are synced
  useEffect(() => {
    if (t2Ref?.current) setT4Width(t2Ref?.current?.["clientWidth"])
  }, [t2Ref?.current?.["clientWidth"]])

  useEffect(() => {
    if (freezeColumnHeaders)
      setFrozenRows(freezeRows + 1)
  }, [freezeColumnHeaders])

  useEffect(() => {
    if (freezeFirstColumn)
      setFrozenColumns(freezeColumns + 1)
  }, [freezeFirstColumn])

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
      <div className={classNames(styles.FreezableTableColumn)} ref={topRef}>
        {
          frozenRows > 0 &&
          <div className={classNames(styles.FreezableTable)}>
            {
              frozenColumns > 0 &&
              <table className='T1' cellPadding={0} cellSpacing={0} ref={t1Ref} style={{ margin: 0 }}>
                <tbody>
                  {
                    data
                      ?.filter((_r: any[], rowIndex: number) => rowIndex < frozenRows)
                      ?.map((r: any, rowIndex: number) => (
                        <tr
                          key={rowIndex}
                          style={{
                            // height: rowHeights?.[rowIndex]?.height || "auto",
                            // minHeight: rowHeights?.[rowIndex]?.height || "auto"
                          }}
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
                                  className={classNames(styles.Cell, styles.Head)}
                                  style={{
                                    ...headerRowStyle,
                                    width,
                                    minWidth: width,
                                    maxWidth: `${topRef?.current?.getBoundingClientRect()?.width * 0.75}px`,
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
            <div style={{ overflow: "hidden", maxWidth: `calc(100% - ${t3Width}px)` }} ref={t2ContainerRef}>
              <table className='T2' cellPadding={0} cellSpacing={0} >
                <tbody>
                  {
                    data
                      ?.filter((_r: any[], rowIndex: number) => rowIndex < frozenRows)
                      ?.map((r: any, rowIndex: number) =>
                        <tr
                          key={rowIndex}
                          style={{
                            // height: rowHeights?.[rowIndex]?.height || "auto",
                            // minHeight: rowHeights?.[rowIndex]?.height || "auto"
                          }}
                          ref={(ref) => {
                            processRow(ref, rowIndex);
                          }}
                        >
                          {
                            r?.filter((_r: any[], columnIndex: number) => columnIndex >= frozenColumns)?.map((c: any, columnIndex: number) => {

                              // const width = cols?.[columnIndex + frozenColumns]?.width || "auto"

                              return <td
                                key={columnIndex}
                                className={classNames(styles.Cell, styles.Head)}
                                style={{
                                  ...headerRowStyle,
                                  // width,
                                  // minWidth: width
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
        <div className={classNames(styles.FreezableTable)} style={{ overflowY: "scroll", padding: 0, margin: 0, maxHeight: `calc(100% - ${(topRef?.current as any)?.clientdeight || 0}px)` }}>
          <table className='T3' cellPadding={0} cellSpacing={0} ref={t3Ref} style={{ minWidth: (t3Width || "auto"), maxWidth: (t3Width || "auto"), margin: 0 }}>
            <tbody>
              {
                data
                  ?.filter((_r: any[], rowIndex: number) => rowIndex >= frozenRows)
                  ?.map((r: any, rowIndex: number) =>
                    <tr
                      key={rowIndex}
                      style={{
                        height: rowHeights?.[rowIndex + frozenRows]?.height || "auto",
                        // minHeight: rowHeights?.[rowIndex + frozenRows]?.height || "auto"
                      }}
                      ref={(ref) => {
                        processRow(ref, rowIndex + frozenRows);
                      }}
                    >
                      {
                        r.filter((_r: any[], i: number) => i < frozenColumns).map((c: any, columnIndex: number) => {

                          const width = colWidths?.[columnIndex]?.width;
                          return (
                            <td
                              key={columnIndex}
                              className={styles.Cell}
                              style={{
                                overflow: "hidden",
                                ...cellStyle,
                                minWidth: width,
                                maxWidth: `${topRef?.current?.getBoundingClientRect()?.width * 0.5}px`,
                                width: width
                              }}
                              ref={(_ref) => {
                                // processColumnRef(ref, columnIndex);
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
            <div style={{ overflow: "hidden", overflowX: "scroll", height: `100%`, width: `calc(100% - ${t3Width}px)` }} onScroll={handleHorizontalScroll}>
              <table className='T4' cellPadding={0} cellSpacing={0} style={{ minWidth: (t4Width || "100%"), width: (t4Width || "100%") }}>
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
                                const width = rowIndex == 0 ? {
                                  width: colWidths?.[columnIndex + frozenColumns]?.width || "auto",
                                  minWidth: colWidths?.[columnIndex + freezeColumns]?.width || "auto",
                                  ["--column-index"]: columnIndex + frozenColumns,
                                  ["--width"]: colWidths?.[columnIndex + frozenColumns]?.width || "auto"
                                } : {};

                                return (
                                  <td
                                    key={columnIndex}
                                    className={styles.Cell}
                                    style={{
                                      ...width,
                                      ...((rowIndex == 0 && freezeRows == 0) ? headerRowStyle : cellStyle),
                                    }}
                                  >{frozenColumns} - {rowIndex} - {c.content}</td>
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

export default FreezableTable;
