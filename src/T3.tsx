import { useRef, forwardRef, useEffect, useImperativeHandle } from 'react';
import styles from "./Table.module.scss"
import classNames from 'classnames';
import { SubTableProps, TableProps } from './Types';
import { publishResize } from './Utils';


const T3 = forwardRef(({
  headerRowStyle = {},
  cellStyle = {},
  cellClass = '',
  headerRowClass = '',
  showColumnAndRowLabels = false,
  actualFrozenColumns,
  actualFrozenRows,
  frozenColumns,
  frozenRows,
  data = [],
  rowHeights,
  colWidths,
  shift = 0,
  width,
  columnRefs,
  rowRefs,
  focusedColumnOrRow,
  onRowHeightsChanged,
  setFocusedColumnOrRow = () => { },
  onColumnWidthsChanged
}: TableProps & SubTableProps, ref: any) => {
  const t3Ref = useRef<HTMLElement>(null);
  const r = useRef(null);
  if (!ref) {
    ref = r;
  }

  useEffect(() => {
    const observer = new ResizeObserver((_entries) => {
      publishResize(t3Ref, onRowHeightsChanged);
    });

    if (t3Ref?.current) {
      observer.observe(t3Ref?.current);
    }

    return () => observer.disconnect();
  }, [t3Ref, t3Ref?.current]);



  useImperativeHandle(ref, () => ({
    get table(): HTMLElement {
      return (t3Ref as any).current;
    },
    get rowRefs(): HTMLElement[] {
      return [...[...(t3Ref as any).current.querySelectorAll("tr[data-item-type='row']")]?.map((row: any) => {
        return row?.querySelector("td[data-item-type='column']");
      })] as any[];
    },
    get columnRefs(): HTMLElement[] {
      return [...(t3Ref as any).current.querySelector("tr[data-item-type='row']").querySelectorAll("td[data-item-type='column']")] as any[];
    }
  }), [t3Ref?.current]);

  return (<div style={{ width, maxWidth: width, overflowX: "hidden", minHeight: t3Ref?.current?.clientHeight }}>
    <table ref={t3Ref as any} className={classNames('T3', styles.T3)} cellPadding={0} cellSpacing={0} style={{ minWidth: width, maxWidth: width, width, height: "auto" }}>
      <tbody>
        {
          data
            ?.filter((_r: any[], rowIndex: number) => rowIndex >= (actualFrozenRows))
            ?.map((r: any, rowIndex: number) => {

              const height = rowHeights?.[rowIndex + frozenRows]?.height || "auto";
              return <tr
                key={rowIndex + frozenRows}
                {...{ "data-row-id": rowIndex + frozenRows, "data-item-type": "row" }}
                style={{
                  height
                }}
              >
                {
                  showColumnAndRowLabels &&
                  <td
                    {...{ "data-column-id": 0, "data-item-type": "column" }}
                    className={classNames(styles.Cell, styles.Head, headerRowClass)}
                    style={{
                      overflow: "hidden",
                      textAlign: "center",
                      verticalAlign: "middle",
                      ...cellStyle,
                      ...{
                        width: colWidths?.[0]?.width || "auto",
                        maxWidth: colWidths?.[0]?.width || "auto"
                      }
                    }}
                  >{rowIndex + actualFrozenRows + 1}</td>
                }
                {
                  r.filter((_r: any[], i: number) => i < actualFrozenColumns)

                    .map((c: any, columnIndex: number) => {
                      const width = colWidths?.[columnIndex + shift]?.width || "auto";

                      return (
                        <td
                          key={columnIndex + shift}
                          {...{ "data-column-id": columnIndex + shift, "data-item-type": "column" }}
                          className={classNames(styles.Cell, cellClass, {
                            [styles.Head]: columnIndex < frozenColumns,
                            headerRowClass: columnIndex < frozenColumns
                          })}
                          style={{
                            overflow: "hidden",
                            minWidth: width,
                            ...(width ? { width: width, } : {}),
                            ...(columnIndex < frozenColumns ? headerRowStyle : cellStyle)
                          }}

                          onMouseMove={({ currentTarget, clientX, clientY }) => {
                            const rect = currentTarget.getBoundingClientRect();
                            if (!focusedColumnOrRow) {
                              if (rowIndex == 0) {
                                const isOverLeftBorder = clientX <= rect.left + 5; // Adjust tolerance as needed

                                if (isOverLeftBorder) {
                                  currentTarget.style.cursor = 'col-resize'; // Change cursor to indicate resizing
                                } else {
                                  currentTarget.style.cursor = 'default'; // Reset to default cursor
                                }
                              } else if (columnIndex == 0) {
                                const isOverLeftBorder = clientY <= rect.top + 5; // Adjust tolerance as needed

                                if (isOverLeftBorder) {
                                  currentTarget.style.cursor = 'row-resize'; // Change cursor to indicate resizing
                                } else {
                                  currentTarget.style.cursor = 'default'; // Reset to default cursor
                                }
                              }
                            }

                            else if (focusedColumnOrRow?.type == "column" && frozenRows == 0) {
                              if (focusedColumnOrRow?.index == columnIndex - 1) {
                                const element = columnRefs?.[columnIndex - 1] as any as HTMLElement;
                                if (element) {
                                  const width = Math.abs(clientX - element.getBoundingClientRect().left);
                                  const newColWidths = { [columnIndex - 1]: { width } };
                                  onColumnWidthsChanged && onColumnWidthsChanged(newColWidths);
                                }
                              }

                              else if (focusedColumnOrRow?.index == columnIndex) {
                                const element = columnRefs?.[columnIndex] as any as HTMLElement;
                                if (element) {
                                  const width = Math.abs(clientX - element.getBoundingClientRect().left);
                                  const newColWidths = { [columnIndex]: { width } };
                                  onColumnWidthsChanged && onColumnWidthsChanged(newColWidths);
                                }
                              }
                            }

                            else if (focusedColumnOrRow?.type == "row") {
                              if (focusedColumnOrRow?.index == rowIndex + frozenRows - 1) {
                                const element = rowRefs?.[rowIndex + frozenRows - 1] as any as HTMLElement;
                                if (element) {
                                  const height = Math.abs(clientY - element.getBoundingClientRect().top);
                                  onRowHeightsChanged && onRowHeightsChanged({ [rowIndex + frozenRows - 1]: { height } });
                                }
                              }

                              else if (focusedColumnOrRow?.index == rowIndex + frozenRows) {
                                const element = rowRefs?.[rowIndex + frozenRows] as any as HTMLElement;
                                if (element) {
                                  const height = Math.abs(clientY - element.getBoundingClientRect().top);
                                  onRowHeightsChanged && onRowHeightsChanged({ [rowIndex + frozenRows]: { height } });
                                }
                              }
                            }
                          }}

                          onMouseDown={({ currentTarget, clientX, clientY }) => {
                            const rect = currentTarget.getBoundingClientRect();

                            if (clientX <= rect.left + 5)
                              setFocusedColumnOrRow({
                                type: "column",
                                index: columnIndex - 1,
                              })
                            else if (clientY <= rect.top + 5)
                              setFocusedColumnOrRow({
                                type: "row",
                                index: rowIndex + frozenRows - 1,
                              })
                          }}

                          onMouseUp={(_event) => {
                            setFocusedColumnOrRow && setFocusedColumnOrRow(null)
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
  </div>)
})

export default T3;
