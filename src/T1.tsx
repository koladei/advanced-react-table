import { useRef, useEffect, RefObject, forwardRef, useImperativeHandle } from 'react';
import styles from "./Table.module.scss"
import classNames from 'classnames';
import { CellDimensionCollection, FocusedColumnInfo, SubTableProps, TableProps } from './Types';

const T1 = forwardRef(({
  data = [],
  headerRowStyle = {},
  headerRowClass = '',
  showColumnAndRowLabels = false,
  prefferedColumnLabelHeight = 40,
  colWidths,
  rowHeights,
  columnLabels,
  actualFrozenColumns,
  actualFrozenRows,
  cols = [],
  columnRefs,
  rowRefs,
  focusedColumnOrRow,
  setFocusedColumnOrRow = (_?: FocusedColumnInfo | undefined | null) => { },
  onRowHeightsChanged = (_: CellDimensionCollection) => { },
  onColumnWidthsChanged,
}: TableProps & SubTableProps, ref?: any) => {
  const headerRefs = useRef([]);
  const t1Ref: RefObject<HTMLElement> = useRef(null);
  const r = useRef(null);
  if (!ref) {
    ref = r;
  }

  useImperativeHandle(ref, () => ({
    get table(): HTMLElement {
      return (t1Ref as any).current;
    },
    get rowRefs(): HTMLElement[] {
      return [...[...(t1Ref as any).current.querySelectorAll("tr[data-item-type='row']")]?.map((row: any) => {
        return row?.querySelector("td[data-item-type='column']");
      })] as any[];
    },
    get columnRefs(): HTMLElement[] {
      return [...(t1Ref as any).current.querySelector("tr[data-item-type='row']").querySelectorAll("td[data-item-type='column']")] as any[];
    }
  }), [t1Ref?.current]);

  // when the component renders
  useEffect(() => {

    // monitor the width and height of the table.
    const observer = new ResizeObserver((_entries) => {
      if (typeof onRowHeightsChanged == "function") {
        let rHeights = {};
        t1Ref?.current?.querySelectorAll("tr[data-item-type='row']").forEach((row: any) => {
          const rowIndex = parseInt(row.getAttribute("data-row-id"));
          const height = row?.getBoundingClientRect()?.height;
          rHeights = { ...rHeights, [rowIndex]: { height } };
        });

        // onRowHeightsChanged(rHeights);
      }

      if (typeof onColumnWidthsChanged == "function") {
        const cWidths = [...colWidths];
        const firstRow = t1Ref?.current?.querySelector("tr[data-item-type='row']");
        firstRow?.querySelectorAll("td[data-item-type='column']").forEach((column: any) => {
          const columnIndex = parseInt(column.getAttribute("data-column-id"));
          const width = column?.getBoundingClientRect()?.width;
          cWidths[columnIndex] = { width };
        });

        // onColumnWidthsChanged(cWidths);
      }
    });

    if (t1Ref?.current) {
      observer.observe(t1Ref?.current);

      // all get the refs of the header cells
      const firstRow = t1Ref?.current?.querySelector("tr[data-item-type='row']");
      firstRow?.querySelectorAll("td[data-item-type='column']").forEach((column: any) => {
        const columnIndex = parseInt(column.getAttribute("data-column-id") || "");

        headerRefs.current[columnIndex] = column as never;
      });
    }

    return () => observer.disconnect();
  }, [t1Ref?.current]);

  return (<div>
    <table className={classNames('T1', styles.T1)} cellPadding={0} cellSpacing={0} ref={t1Ref as any} style={{ margin: 0 }}>
      <tbody>
        {
          [
            ...(
              !showColumnAndRowLabels ? [] : [columnLabels.map((c) => ({ content: c }))]
            ),
            ...data?.filter((_r: any[], rowIndex: number) => rowIndex < (actualFrozenRows))
          ]?.map((r: any, rowIndex: number) => {
            return (
              <tr
                key={`row--${rowIndex}`}
                {...{ "data-row-id": rowIndex, "data-item-type": "row" }}

                style={{
                  height: rowHeights?.[rowIndex]?.height || "auto",
                }}
              >
                {
                  [
                    //add the row index column
                    ...(!showColumnAndRowLabels ? [] : [{ content: rowIndex > 0 ? rowIndex : "" }]),

                    // add the data columns
                    ...r?.filter((_r: any[], columnIndex: number) => columnIndex < actualFrozenColumns)
                  ]?.map((c: any, columnIndex: number) => {
                    const width = colWidths?.[columnIndex]?.width || cols?.[columnIndex].width || "auto"
                    return <td
                      key={columnIndex}
                      {...{ "data-column-id": columnIndex, "data-item-type": "column" }}
                      className={classNames(styles.Cell, styles.Head, headerRowClass, {
                        [styles.PreventSelect]: ["row", "column"].includes(focusedColumnOrRow?.type || "")
                      })}
                      style={{
                        ...headerRowStyle,
                        width,
                        verticalAlign: "middle",
                        ...
                        (
                          columnIndex == 0 ? {
                            textAlign: "center",
                            height: prefferedColumnLabelHeight
                          } : {}
                        )
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

                        else if (focusedColumnOrRow?.type == "column") {
                          if (focusedColumnOrRow?.index == columnIndex - 1) {
                            const element = columnRefs?.[columnIndex - 1] as any as HTMLElement;
                            if (element) {
                              const width = Math.abs(clientX - element.getBoundingClientRect().left);
                              const newColWidths = [...colWidths]
                              newColWidths[columnIndex - 1] = { width };
                              onColumnWidthsChanged && onColumnWidthsChanged(newColWidths);
                            }
                          }

                          else if (focusedColumnOrRow?.index == columnIndex) {
                            const element = columnRefs?.[columnIndex] as any as HTMLElement;
                            if (element) {
                              const width = Math.abs(clientX - element.getBoundingClientRect().left);
                              const newColWidths = [...colWidths]
                              newColWidths[columnIndex] = { width };
                              onColumnWidthsChanged && onColumnWidthsChanged(newColWidths);
                            }
                          }
                        }

                        else if (focusedColumnOrRow?.type == "row") {
                          if (focusedColumnOrRow?.index == rowIndex - 1) {
                            const element = rowRefs?.[rowIndex - 1] as any as HTMLElement;
                            if (element) {
                              const height = Math.abs(clientY - element.getBoundingClientRect().top);
                              onRowHeightsChanged({ [rowIndex - 1]: { height } });
                            }
                          }

                          else if (focusedColumnOrRow?.index == rowIndex) {
                            const element = rowRefs?.[rowIndex] as any as HTMLElement;
                            if (element) {
                              const height = Math.abs(clientY - element.getBoundingClientRect().top);
                              onRowHeightsChanged({ [rowIndex]: { height } });
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
                            index: rowIndex - 1,
                          })
                      }}

                      onMouseUp={(_event) => {
                        setFocusedColumnOrRow(null)
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
  </div>)
})

export default T1;
