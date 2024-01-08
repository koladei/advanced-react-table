import { useRef, CSSProperties, useState, useEffect, RefObject, useLayoutEffect } from 'react';
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
  blankCellValue?: string;
  showColumnAndRowLabels?: boolean;
  prefferedRowLabelWidth?: number;
  prefferedColumnLabelHeight: number;
  allowResize?: boolean;
  onColumnChanged?: (column: Column, columns?: Column[]) => void
}

function letterSequence() {
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
  cellStyle = {},
  cellClass = '',
  headerRowClass = '',
  blankCellValue = '-',
  showColumnAndRowLabels = false,
  prefferedColumnLabelHeight = 40,
  prefferedRowLabelWidth = 40
}: TableProps) => {

  const shift: number = showColumnAndRowLabels ? 1 : 0;
  // refs
  const topRef = useRef(null);

  const t1Ref = useRef(null);

  const t2Ref = useRef(null);
  const t2ContainerRef = useRef(null);

  const t3Ref = useRef(null);

  const [rowHeights, setRowHeights] = useState<{ height: number, ref?: RefObject<HTMLTableRowElement> }[]>([]);
  const [colWidths, setColWidths] = useState<{ width: number, ref?: RefObject<any> }[]>(showColumnAndRowLabels ? [{ width: prefferedColumnLabelHeight, ref: undefined }] : []);
  const [colRefs, setColRefs] = useState<HTMLElement[]>([]);
  const [t3Width, setT3Width] = useState<string | number>("auto");
  const [frozenColumns, setFrozenColumns] = useState<number>(freezeColumns);
  const [frozenRows, setFrozenRows] = useState<number>(freezeRows);
  const [cols, setCols] = useState<Column[]>([]);
  const [columnLabels, setColumnLabels] = useState<string[]>([]);
  const [focusedColumnOrRow, setFocusedColumnOrRow] = useState<{
    type: "column" | "row",
    index: number,
    element?: any,
    dimension?: {
      width: number,
      height: number
    }
  } | null>(null);


  useEffect(() => {

    const letterGenerator = letterSequence();
    const colLabels: string[] = [];



    setCols((columns.length > 0 ? columns : Object.values(rows.reduce((al: any, cu: any) => {
      al = { ...al, ...Object.keys(cu) }
      return al;
    }, {}))).map((col: Column | any, i) => {

      // if (showColumnAndRowLabels) colLabels.push("")
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
    if (newColWidths.length == 0) newColWidths[0] = { width: prefferedRowLabelWidth }
    cols.forEach((col, columnIndex) => {
      newColWidths[columnIndex + shift] = { ...colWidths[columnIndex + shift], width: col.width == "auto" ? 0 : col.width as number }
    });

    setColWidths(newColWidths);
  }, [cols, cols?.length]);


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

  // ensure tde width of t1 and t3 are synced
  useEffect(() => {
    if (t1Ref?.current) setT3Width((t1Ref?.current as any)?.getBoundingClientRect()?.width)
  }, [t1Ref?.current?.["clientWidth"]])


  //set the frozen rows
  useEffect(() => {
    const _one = (freezeColumnHeaders ? 1 : 0) + shift;
    setFrozenRows(freezeRows + _one)

  }, [freezeColumnHeaders, freezeRows, showColumnAndRowLabels, shift])

  //set the frozen columns
  useEffect(() => {
    const _one = (freezeFirstColumn ? 1 : 0) + shift;

    setFrozenColumns(freezeColumns + _one)

  }, [freezeFirstColumn, freezeColumns, showColumnAndRowLabels, shift]);

  function processRow(ref: any, rowIndex: number) {
    const height = ref?.getBoundingClientRect().height;
    let newRowHeight = [...rowHeights];

    if (!newRowHeight?.[rowIndex] && height) {
      newRowHeight[rowIndex] = { height, ref }
      setRowHeights(newRowHeight)
    }

    if (height > newRowHeight[rowIndex]?.height) {
      newRowHeight[rowIndex] = { height, ref };
      setRowHeights(newRowHeight)
    }
  }

  function setHeaderRef(ref: any, columnIndex: number) {
    const newColRefs = [...colRefs];
    newColRefs[columnIndex] = ref;
    setColRefs(newColRefs);
  }

  function processColumn(ref: any, columnIndex: number) {
    const width = ref.getBoundingClientRect().width;
    let newColWidths = [...colWidths];

    if (!colRefs[columnIndex]) {
      setHeaderRef(ref, columnIndex)
    }


    if (!newColWidths?.[columnIndex]) {
      newColWidths[columnIndex] = { ...newColWidths[columnIndex], width }
      setColWidths(newColWidths);
    }

    if (width != newColWidths[columnIndex].width || !isNaN(width) && isNaN(newColWidths[columnIndex].width)) {
      newColWidths[columnIndex] = { ...newColWidths[columnIndex], width };
      setColWidths(newColWidths);
    }
  }

  const handleHorizontalScroll = () => {
    const left = (event?.target as any)?.scrollLeft;
    if (t2ContainerRef.current) {
      const current: any = t2ContainerRef.current;
      current.scrollLeft = left
    }
  };

  const resizeColumn = (element: HTMLElement, columnIndex: number, clientX: number) => {
    const rect = element.getBoundingClientRect();

    if (!focusedColumnOrRow) {
      const isOverLeftBorder = ((event || {}) as { clientX: number })?.clientX || 0 <= rect.left + 5; // Adjust tolerance as needed

      if (isOverLeftBorder) {
        element.style.cursor = 'col-resize'; // Change cursor to indicate resizing
      } else {
        element.style.cursor = 'default'; // Reset to default cursor
      }
    } else if (focusedColumnOrRow?.index == columnIndex) {
      const width = Math.abs(clientX - element.getBoundingClientRect().left);
      const newColWidths = [...colWidths];
      newColWidths[columnIndex] = { ...newColWidths[columnIndex], width };

      setColWidths(newColWidths);
    } else if (focusedColumnOrRow?.index == columnIndex - 1 && colRefs?.[columnIndex - 1]) {
      const previousSibling: HTMLElement = colRefs[columnIndex - 1];
      if (previousSibling) {
        const width = Math.abs(clientX - previousSibling.getBoundingClientRect().left);
        const newColWidths = [...colWidths];

        newColWidths[focusedColumnOrRow.index] = { ...newColWidths[focusedColumnOrRow.index], width };
        setColWidths(newColWidths);
      }
    } else if (focusedColumnOrRow?.index == 0 && colRefs?.[columnIndex]) {
      const previousSibling: HTMLElement = colRefs[columnIndex - 1];
      if (previousSibling) {
        const width = Math.abs(clientX - previousSibling.getBoundingClientRect().left);
        const newColWidths = [...colWidths];

        newColWidths[focusedColumnOrRow.index] = { ...newColWidths[focusedColumnOrRow.index], width };
        setColWidths(newColWidths);
      }
    }
  }

  const actualFrozenRows = frozenRows - shift;
  const actualFrozenColumns = frozenColumns - shift;

  return (
    <div className={classNames(styles.Table)} ref={topRef}>
      {
        (frozenRows > 0 || showColumnAndRowLabels) &&
        <div className={classNames(styles.TableRow, styles.Row1)}>
          {
            (frozenColumns > 0 || showColumnAndRowLabels) &&
            <table className={classNames('T1', styles.T1)} cellPadding={0} cellSpacing={0} ref={t1Ref} style={{ margin: 0 }}>
              <tbody>
                {
                  showColumnAndRowLabels &&
                  <tr key={`row--${- 1}`}
                    ref={(ref) => {
                      if (ref?.style)
                        processRow(ref, 0);
                    }}>
                    <td
                      className={classNames(styles.Cell, styles.Head, headerRowClass)}
                      style={{
                        ...headerRowStyle,
                        width: prefferedRowLabelWidth,
                        minWidth: prefferedRowLabelWidth,
                        height: prefferedColumnLabelHeight
                      }}


                      ref={(ref) => {
                        if (ref?.style) {
                          processColumn(ref, 0);
                        }
                      }}

                    ></td>
                    {
                      columnLabels
                        ?.filter((_r, columnIndex: number) => columnIndex < (actualFrozenColumns))
                        ?.map((_c, columnIndex: number) => {
                          const width = colWidths?.[columnIndex + 1]?.width || cols?.[columnIndex + 1]?.width || "auto"

                          return <td
                            key={columnIndex}
                            className={classNames(styles.Cell, styles.Head, headerRowClass)}
                            style={{
                              ...headerRowStyle,
                              width,
                              minWidth: width
                            }}

                            ref={(ref) => {
                              if (ref?.style) {
                                processColumn(ref, columnIndex + 1);
                              }
                            }}
                            onMouseMove={({ currentTarget, clientX }) => {
                              resizeColumn(currentTarget, columnIndex + 1, clientX);
                            }}

                            onMouseDown={() => {
                              setFocusedColumnOrRow({
                                type: "column",
                                index: columnIndex,
                              })
                            }}

                            onMouseUp={() => {
                              setFocusedColumnOrRow(null)
                            }}
                          >{_c}</td>
                        })
                    }
                  </tr>
                }
                {
                  data
                    ?.filter((_r: any[], rowIndex: number) => rowIndex < (actualFrozenRows))
                    ?.map((r: any, rowIndex: number) => {
                      return (
                        <tr
                          key={`row--${rowIndex}`}
                          ref={(ref) => {
                            processRow(ref, rowIndex);
                          }}
                          style={{
                            height: rowHeights?.[rowIndex]?.height || "auto",
                          }}
                        >

                          {/* print the row label */}
                          {
                            showColumnAndRowLabels && <td
                              className={classNames(styles.Cell, styles.Head, headerRowClass, {
                                [styles.PreventSelect]: focusedColumnOrRow?.type == "column"
                              })}
                              style={{
                                ...headerRowStyle,
                                textAlign: "center",
                                verticalAlign: "middle",
                              }}>{rowIndex + 1}</td>
                          }


                          {
                            r
                              ?.filter((_r: any[], columnIndex: number) => columnIndex < frozenColumns)
                              ?.map((c: any, columnIndex: number) => {
                                const width = colWidths?.[columnIndex]?.width || cols?.[columnIndex].width || "auto"
                                return <td
                                  key={columnIndex}
                                  className={classNames(styles.Cell, styles.Head, headerRowClass)}
                                  style={{
                                    ...headerRowStyle,
                                    width,
                                    ...(topRef?.current ? { maxWidth: `${(topRef.current as any).getBoundingClientRect()?.width * 0.75}px` } : {}),
                                  }}
                                  ref={(ref) => {
                                    if (!showColumnAndRowLabels && ref?.style && rowIndex == 0) {
                                      processColumn(ref, columnIndex);
                                    }
                                  }}
                                >{c.content}</td>
                              })
                          }
                        </tr>
                      )
                    })
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
                  {
                    width: "100%"
                  }
              )
            }
          } ref={t2ContainerRef}>
            <table className={classNames('T2', styles.T2)} cellPadding={0} cellSpacing={0} >
              <tbody>
                {
                  showColumnAndRowLabels &&
                  <tr key={`row--${- 1}`}
                    {...{ ["data-row-id"]: - 1 }}
                  >
                    {
                      columnLabels
                        ?.filter((_r, columnIndex: number) => columnIndex >= actualFrozenColumns)
                        ?.map((_c, columnIndex: number) => {
                          const width = colWidths?.[columnIndex + frozenColumns]?.width || cols?.[columnIndex + frozenColumns + shift]?.width || "auto"

                          return <td
                            key={columnIndex}
                            {...{ "data-column-id": columnIndex + actualFrozenColumns }}
                            className={classNames(styles.Cell, styles.Head, headerRowClass, {
                              [styles.PreventSelect]: focusedColumnOrRow?.type == "column"
                            })}
                            style={{
                              ...headerRowStyle,
                              width,
                              minWidth: width,
                              height: prefferedColumnLabelHeight,
                              ...{ "--column-id": `[${columnIndex + actualFrozenColumns}]` }
                            }}
                            ref={(ref) => {
                              if (ref?.style) {
                                processColumn(ref, columnIndex + frozenColumns);
                              }
                            }}

                            onMouseMove={({ currentTarget, clientX }) => {
                              resizeColumn(currentTarget, columnIndex + frozenColumns, clientX);
                            }}

                            onMouseDown={() => {
                              setFocusedColumnOrRow({
                                type: "column",
                                index: columnIndex + frozenColumns - 1,
                              })
                            }}

                            onMouseUp={() => {
                              setFocusedColumnOrRow(null)
                            }}
                          >{_c}</td>
                        })
                    }
                  </tr>
                }
                {
                  data
                    ?.filter((_r: any[], rowIndex: number) => rowIndex < (actualFrozenRows))
                    ?.map((r: any, rowIndex: number) =>
                      <tr
                        key={`row--${rowIndex}`}
                        ref={(ref) => {
                          processRow(ref, rowIndex);
                        }}
                      >
                        {
                          r
                            ?.filter((_r: any[], columnIndex: number) => columnIndex >= (actualFrozenColumns))
                            ?.map((c: any, columnIndex: number) => {

                              const width = colWidths?.[columnIndex + frozenColumns]?.width || cols?.[columnIndex + frozenColumns]?.width || "auto"

                              return <td
                                key={columnIndex}
                                className={classNames(styles.Cell, styles.Head, headerRowClass)}
                                style={{
                                  ...headerRowStyle,
                                  width,
                                  minWidth: width
                                }}
                                ref={(ref) => {
                                  if (!showColumnAndRowLabels && ref?.style && rowIndex == 0) {
                                    processColumn(ref, columnIndex + frozenColumns);
                                  }
                                }}

                                onMouseMove={({ currentTarget, clientX }) => {
                                  if (!showColumnAndRowLabels)
                                    resizeColumn(currentTarget, columnIndex, clientX);
                                }}

                                onMouseDown={(_event) => {
                                  if (!showColumnAndRowLabels)
                                    setFocusedColumnOrRow({
                                      type: "column",
                                      index: columnIndex - 1,
                                    })
                                }}
                                onMouseUp={(_event) => {
                                  if (!showColumnAndRowLabels)
                                    setFocusedColumnOrRow(null)
                                }}
                              >{c.content}</td>
                            })
                        }
                      </tr>
                    )
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
                ?.filter((_r: any[], rowIndex: number) => rowIndex >= (actualFrozenRows))
                ?.map((r: any, rowIndex: number) => {


                  const height = rowHeights?.[rowIndex + frozenRows]?.height || "auto";
                  return <tr
                    key={rowIndex + frozenRows}
                    {...{ "data-row-id": rowIndex + frozenRows }}
                    style={{
                      height: height
                    }}
                    ref={(ref) => {
                      processRow(ref, rowIndex + frozenRows);
                    }}
                  >
                    {
                      showColumnAndRowLabels &&
                      <td
                        className={classNames(styles.Cell, styles.Head, headerRowClass)}
                        style={{
                          overflow: "hidden",
                          textAlign: "center",
                          verticalAlign: "middle",
                          ...cellStyle,
                          ...{
                            width: prefferedRowLabelWidth,
                            minWidth: prefferedRowLabelWidth,
                            ["--column-index"]: -1,
                            ["--column-id"]: "auto"
                          }
                        }}
                      >{rowIndex + actualFrozenRows + 1}</td>
                    }
                    {
                      r.filter((_r: any[], i: number) => i < actualFrozenColumns).map((c: any, columnIndex: number) => {

                        const width = colWidths?.[columnIndex + 1]?.width || "auto";
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
                })
            }
          </tbody>
        </table>
        {
          data?.length > frozenRows &&
          <div className={styles.T4Container} style={{
            ...(
              t1Ref?.current && frozenColumns > 0 ?
                {
                  width: `calc(100% - ${(t1Ref.current as any).getBoundingClientRect()?.width || 0}px)`,
                  maxWidth: `calc(100% - ${(t1Ref.current as any).getBoundingClientRect()?.width || 0}px)`,
                  minWidth: `calc(100% - ${(t1Ref.current as any).getBoundingClientRect()?.width || 0}px)`,
                } :
                (
                  t3Ref?.current && frozenColumns > 0 ?
                    {
                      width: `calc(100% - ${(t3Ref.current as any).getBoundingClientRect()?.width || 0}px)`,
                      maxWidth: `calc(100% - ${(t3Ref.current as any).getBoundingClientRect()?.width || 0}px)`,
                      minWidth: `calc(100% - ${(t3Ref.current as any).getBoundingClientRect()?.width || 0}px)`,
                    } :
                    t2ContainerRef?.current ?
                      {
                        width: (t2ContainerRef.current as any).getBoundingClientRect()?.width,
                        maxWidth: (t2ContainerRef.current as any).getBoundingClientRect()?.width,
                        minWidth: (t2ContainerRef.current as any).getBoundingClientRect()?.width,
                      } :
                      { width: "auto" }
                )
            )
          }}
            onScroll={handleHorizontalScroll}>
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
                    ?.filter((_r: any[], rowIndex: number) => rowIndex >= actualFrozenRows)
                    ?.map((r: any, rowIndex: number) => {

                      const height = rowHeights?.[rowIndex + frozenRows]?.height || "auto";
                      return <tr
                        key={rowIndex + frozenRows}
                        {...{ "data-row-id": rowIndex + frozenRows }}
                        style={{
                          height: height,
                          overflow: "hidden"
                        }}
                        ref={(ref) => {
                          if (!t3Ref.current || ref?.getBoundingClientRect()?.height || 0 > ((height == "auto" ? 0 : height) as number))
                            processRow(ref, rowIndex + frozenRows);
                        }}
                      >
                        {
                          r
                            ?.filter((_r: any[], columnIndex: number) => columnIndex >= actualFrozenColumns)
                            ?.map((c: any, columnIndex: number) => {
                              const w = colWidths?.[columnIndex + frozenColumns]?.width || (frozenRows == 0 ? cols?.[columnIndex + frozenColumns].width : colWidths?.[columnIndex + frozenColumns]?.width) || "auto";

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
                                  ref={(ref) => {
                                    if (frozenRows == 0 || ref?.getBoundingClientRect()?.width || 0 > ((w == "auto" ? 0 : w) as number)) {
                                      processColumn(ref, columnIndex + frozenColumns);
                                    }
                                  }}
                                >{c.content}</td>
                              )
                            })
                        }
                      </tr>
                    })
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  )
}

export default Table;
