import { useRef, useEffect, RefObject, forwardRef, useImperativeHandle } from 'react';
import styles from "./Table.module.scss"
import classNames from 'classnames';
import { FocusedColumnInfo, SubTableProps, TableProps } from './Types';


const T2 = forwardRef(({
  headerRowStyle = {},
  headerRowClass = '',
  showColumnAndRowLabels = false,
  actualFrozenColumns,
  actualFrozenRows,
  frozenColumns,
  shift,
  data: rows = [],
  cols: columns = [],
  colWidths: colWidths,
  rowHeights,
  columnLabels,
  width,
  columnRefs,
  focusedColumnOrRow,
  setFocusedColumnOrRow = (_focus?: FocusedColumnInfo | undefined | null) => { },
  onRowHeightsChanged,
  onColumnWidthsChanged
}: TableProps & SubTableProps, ref?: any) => {

  // const [localColWidths, setColWidths] = useState(colWidths);
  // const [localColWidthsChanged, setColWidthsChanged] = useState(false);

  // refs
  const r = useRef(null);
  const t2ContainerRef: RefObject<HTMLElement> = useRef(null);
  const t2Ref: RefObject<HTMLElement> = useRef(null);
  if (!ref) {
    ref = r;
  }

  // handle column resize
  // useEffect(() => {
  //   if (localColWidths) {
  //     if (typeof onColumnWidthsChanged == "function") {
  //       const cWidths = [...colWidths];
  //       localColWidths.forEach((c, i) => {

  //         const width = c?.width;
  //         cWidths[i] = { width };
  //       });

  //       onColumnWidthsChanged(cWidths);
  //     }
  //   }

  //   setColWidthsChanged(false);
  // }, [localColWidths, localColWidthsChanged]);

  useImperativeHandle(ref, () => ({
    get container(): HTMLElement {
      return (t2ContainerRef as any).current;
    },
    get table(): HTMLElement {
      return (t2Ref as any).current;
    },
    get columnRefs(): HTMLElement[] {
      return [...(t2Ref as any).current.querySelector("tr[data-item-type='row']").querySelectorAll("td[data-item-type='column']")] as any[];
    }
  }), [t2ContainerRef, (t2Ref as any)?.current]);


  // monitore the width and height of the table.
  useEffect(() => {
    const observer = new ResizeObserver((_entries) => {
      if (typeof onRowHeightsChanged == "function") {
        let rHeights = {};
        t2Ref?.current?.querySelectorAll("tr[data-item-type='row']").forEach((row: any) => {
          const rowIndex = parseInt(row.getAttribute("data-row-id") || "");
          const height = row?.getBoundingClientRect()?.height;
          if (height != rowHeights[rowIndex])
            rHeights = { ...rHeights, [rowIndex]: { height } };
        });

        // onRowHeightsChanged(rHeights);
      }

      if (typeof onColumnWidthsChanged == "function") {
        const cWidths = [...colWidths];
        const row = t2Ref?.current?.querySelector("tr[data-item-type='row']");
        row?.querySelectorAll("td[data-item-type='column']").forEach((column: any) => {
          const columnIndex = parseInt(column.getAttribute("data-column-id"));
          const width = column?.getBoundingClientRect()?.width;
          cWidths[columnIndex] = { width };
        });

        // onColumnWidthsChanged(cWidths);
      }
    });

    if (t2Ref?.current) {
      observer.observe(t2Ref?.current);
    }

    return () => observer.disconnect();
  }, [t2Ref?.current]);

  return (
    <div ref={t2ContainerRef as any} className={classNames(styles.T2Container)} style={
      {
        overflow: "hidden",
        display: "flex",
        width
      }
    }>
      <table className={classNames('T2', styles.T2)} cellPadding={0} cellSpacing={0} ref={t2Ref as any}>
        <tbody>
          {
            [
              // add column header row before data rows
              ...(
                !showColumnAndRowLabels ? [] : [columnLabels.map((c) => ({ content: c }))]
              ),

              ...rows?.filter((_r: any[], rowIndex: number) => rowIndex < (actualFrozenRows))
            ]

              // render the rows
              ?.map((column: any, rowIndex: number) => {
                const height = rowHeights?.[rowIndex]?.height || "auto";

                return <tr
                  key={`row--${rowIndex + (shift || 0)}`}
                  {...{ "data-row-id": rowIndex, "data-item-type": "row" }}
                  style={{
                    height
                  }}
                >
                  {
                    column
                      ?.filter((_r: any[], columnIndex: number) => columnIndex >= (actualFrozenColumns))
                      ?.map((c: any, columnIndex: number) => {
                        const width = colWidths?.[columnIndex + frozenColumns]?.width || columns?.[columnIndex + frozenColumns]?.width || "auto"

                        return <td
                          key={columnIndex + frozenColumns}
                          {...{ "data-column-id": columnIndex + frozenColumns, "data-item-type": "column" }}
                          className={classNames(styles.Cell, styles.Head, headerRowClass, {
                            [styles.PreventSelect]: focusedColumnOrRow?.type == "column"
                          })}
                          style={{
                            ...headerRowStyle,
                            width,
                            maxWidth: width,
                            verticalAlign: "middle",
                            overflow: "hidden",
                          }}

                          onMouseMove={({ currentTarget, clientX }) => {
                            const rect = currentTarget.getBoundingClientRect();

                            if (!focusedColumnOrRow && rowIndex == 0) {
                              const isOverLeftBorder = clientX <= rect.left + 5; // Adjust tolerance as needed

                              if (isOverLeftBorder) {
                                currentTarget.style.cursor = 'col-resize'; // Change cursor to indicate resizing
                              } else {
                                currentTarget.style.cursor = 'default'; // Reset to default cursor
                              }
                            }

                            else if (focusedColumnOrRow?.index == columnIndex + frozenColumns - 1) {
                              const element = columnRefs?.[columnIndex + frozenColumns - 1] as any as HTMLElement;
                              if (element) {
                                const index = parseInt(element.getAttribute("data-column-id") || "");
                                const width = Math.abs(clientX - element.getBoundingClientRect().left);
                                const newColWidths = [...colWidths]
                                newColWidths[index] = { width };
                                onColumnWidthsChanged && onColumnWidthsChanged(newColWidths);
                              }
                            }

                            else if (focusedColumnOrRow?.index == columnIndex + frozenColumns) {
                              const element = columnRefs?.[columnIndex + frozenColumns] as any as HTMLElement;
                              if (element) {
                                const index = parseInt(element.getAttribute("data-column-id") || "");
                                const width = Math.abs(clientX - element.getBoundingClientRect().left);
                                const newColWidths = [...colWidths]
                                newColWidths[index] = { width };
                                onColumnWidthsChanged && onColumnWidthsChanged(newColWidths);
                              }
                            }
                          }}

                          onMouseDown={(_event) => {
                            setFocusedColumnOrRow({
                              type: "column",
                              index: columnIndex + frozenColumns - 1,
                            })
                          }}

                          onMouseUp={(_event) => {
                            setFocusedColumnOrRow(null);
                          }}
                        >{c.content}</td>
                      })
                  }
                </tr>
              })
          }
        </tbody>
      </table>
    </div>
  )
})

export default T2;
