import { useRef, useEffect, RefObject, forwardRef, useImperativeHandle } from 'react';
import styles from "./Table.module.scss"
import classNames from 'classnames';
import { FocusedColumnInfo, SubTableProps, TableProps } from './Types';

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
  focusedColumnOrRow,
  setFocusedColumnOrRow = (_focus?: FocusedColumnInfo | undefined | null) => { },
  onRowHeightsChanged,
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
    get columnRefs(): HTMLElement[] {
      return [...(t1Ref as any).current.querySelector("tr[data-item-type='row']").querySelectorAll("td[data-item-type='column']")] as any[];
    }
  }), [t1Ref?.current]);

  // const [focusedColumnOrRow, setFocusedColumnOrRow] = useState<{
  //   type: "column" | "row",
  //   index: number,
  //   element?: any,
  //   dimension?: {
  //     width: number,
  //     height: number
  //   }
  // } | null>(null);

  // when the component renders
  useEffect(() => {

    // monitor the width and height of the table.
    const observer = new ResizeObserver((_entries) => {
      if (typeof onRowHeightsChanged == "function") {
        const rHeights = [...rowHeights];
        t1Ref?.current?.querySelectorAll("tr[data-item-type='row']").forEach((row: any) => {
          const rowIndex = parseInt(row.getAttribute("data-row-id"));
          const height = row?.getBoundingClientRect()?.height;
          rHeights[rowIndex] = { height };
        });

        onRowHeightsChanged(rHeights);
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

                {/* print the row label */}
                {/* {
                  showColumnAndRowLabels && <td
                    {...{ "data-column-id": 0, "data-item-type": "column" }}
                    className={classNames(styles.Cell, styles.Head, headerRowClass, {
                      [styles.PreventSelect]: focusedColumnOrRow?.type == "column"
                    })}
                    style={{
                      ...headerRowStyle,
                      textAlign: "center",
                      verticalAlign: "middle",
                      ...(rowIndex == 0 ? {
                        width: colWidths?.[0]?.width || cols?.[0].width || "auto",
                        maxWidth: colWidths?.[0]?.width || cols?.[0].width || "auto",
                        height: prefferedColumnLabelHeight
                      } : {})
                    }}>{rowIndex > 0 ? rowIndex : ""}</td>
                } */}
                {
                  [
                    ...(!showColumnAndRowLabels ? [] : [{ content: rowIndex > 0 ? rowIndex : "" }]),
                    ...r?.filter((_r: any[], columnIndex: number) => columnIndex < actualFrozenColumns)
                  ]?.map((c: any, columnIndex: number) => {
                    const width = colWidths?.[columnIndex]?.width || cols?.[columnIndex].width || "auto"
                    return <td
                      key={columnIndex}
                      {...{ "data-column-id": columnIndex, "data-item-type": "column" }}
                      className={classNames(styles.Cell, styles.Head, headerRowClass, {
                        [styles.PreventSelect]: focusedColumnOrRow?.type == "column"
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

                        else if (focusedColumnOrRow?.index == columnIndex - 1) {
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
                      }}

                      onMouseDown={(_event) => {
                        setFocusedColumnOrRow({
                          type: "column",
                          index: columnIndex - 1,
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
