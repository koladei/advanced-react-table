import { useRef, useEffect, RefObject, forwardRef, useImperativeHandle } from 'react';
import styles from "./Table.module.scss"
import classNames from 'classnames';
import { CellDimensionCollection, FocusedColumnInfo, SubTableProps, TableProps } from './Types';
import { publishResize } from './Utils';


const T2 = forwardRef(({
  hideColumnHeaders,
  headerRowStyle = {},
  headerRowClass = '',
  cellClass = '',
  addressCellClass = '',
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
  onRowHeightsChanged = (_cdc: CellDimensionCollection) => { },
  onColumnWidthsChanged = (_cdc: CellDimensionCollection) => { }
}: TableProps & SubTableProps, ref?: any) => {

  // refs
  const r = useRef(null);
  const t2ContainerRef: RefObject<HTMLElement> = useRef(null);
  const t2Ref: RefObject<HTMLElement> = useRef(null);
  if (!ref) {
    ref = r;
  }

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
      publishResize(t2Ref, frozenColumns < 1 ? onRowHeightsChanged : undefined, onColumnWidthsChanged);
    });

    if (t2Ref?.current) {
      observer.observe(t2Ref?.current);
    }

    return () => observer.disconnect();
  }, [t2Ref?.current]);

  return (
    <div ref={t2ContainerRef as any} className={classNames(styles.T2Container)} style={
      {
        // display: "flex",
        width,
        height: t2Ref?.current?.getBoundingClientRect().height
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
                    ...(height != "auto" && {
                      height,
                      minHeight: height,
                      maxHeight: height
                    })
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
                          className={classNames(styles.Cell, styles.Head, {
                            [cellClass]: (showColumnAndRowLabels && rowIndex > 0),
                            [headerRowClass]: ((rowIndex == 0 && !showColumnAndRowLabels) || (rowIndex == 1 && showColumnAndRowLabels) && !hideColumnHeaders),
                            [addressCellClass]: (rowIndex == 0 && showColumnAndRowLabels),
                            [styles.PreventSelect]: focusedColumnOrRow?.type == "column"
                          })}
                          style={{
                            ...headerRowStyle,
                            width,
                            maxWidth: width,
                            minWidth: width,
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
                              const element = columnRefs?.[focusedColumnOrRow?.index] as any as HTMLElement;
                              if (element) {
                                const index = parseInt(element.getAttribute("data-column-id") || "");
                                const width = Math.abs(clientX - element.getBoundingClientRect().left);
                                const newColWidths = { [index]: { width } }
                                onColumnWidthsChanged(newColWidths);
                              }
                            }

                            else if (focusedColumnOrRow?.index == columnIndex + frozenColumns) {
                              const element = columnRefs?.[focusedColumnOrRow?.index] as any as HTMLElement;
                              if (element) {
                                const index = parseInt(element.getAttribute("data-column-id") || "");
                                const width = Math.abs(clientX - element.getBoundingClientRect().left);
                                const newColWidths = { [index]: { width } }
                                onColumnWidthsChanged(newColWidths);
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
