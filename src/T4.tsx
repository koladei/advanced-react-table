import { forwardRef, useImperativeHandle, useRef, RefObject } from 'react';
import styles from "./Table.module.scss"
import classNames from 'classnames';
import { SubTableProps, TableProps } from './Types';

const T4 = forwardRef(({
  headerRowStyle,
  cellStyle,
  cellClass,
  data = [],
  cols = [],
  colWidths,
  rowHeights,
  frozenColumns,
  frozenRows,
  actualFrozenRows,
  actualFrozenColumns,
  width = "100%",
  height = "100%",
  onT4HorizontalScroll = () => { }
}: TableProps & SubTableProps & { onT4HorizontalScroll: (scrollPosition?: number) => void }, ref?: any) => {
  // refs
  const r = useRef(null);
  const t4ContainerRef: RefObject<HTMLElement> = useRef(null);
  const t4Ref: RefObject<HTMLElement> = useRef(null);
  if (!ref) {
    ref = r;
  }

  useImperativeHandle(ref, () => ({
    get container(): HTMLElement {
      return (t4Ref as any).current;
    },
    get table(): HTMLElement {
      return (t4Ref as any).current;
    },
    get rowRefs(): HTMLElement[] {
      return [...(t4Ref as any).current.querySelectorAll("tr[data-item-type='row']")?.map((row: any) => {
        return row?.querySelector("td[data-item-type='column']");
      })] as any[];
    },
    get columnRefs(): HTMLElement[] {
      return [...(t4Ref as any).current.querySelector("tr[data-item-type='row']").querySelectorAll("td[data-item-type='column']")] as any[];
    }
  }), [t4ContainerRef, t4Ref?.current]);

  const handleHorizontalScroll = () => {
    onT4HorizontalScroll && onT4HorizontalScroll((event?.target as any)?.scrollLeft || 0);
  };

  return (
    <div ref={t4ContainerRef as any} className={styles.T4Container} style={{
      width, height: "fit-content", minHeight: height
    }}
      onScroll={handleHorizontalScroll}>
      <table ref={t4Ref as any} className={classNames('T4', styles.T4)} cellPadding={0} cellSpacing={0} style={{
        height: "auto",
        minWidth: "100%"
      }}>
        <tbody>
          {
            data
              ?.filter((_r: any[], rowIndex: number) => rowIndex >= actualFrozenRows)
              ?.map((r: any, rowIndex: number) => {

                const height = rowHeights?.[rowIndex + frozenRows]?.height || "auto";
                return <tr
                  key={rowIndex + frozenRows}
                  {...{ "data-row-id": rowIndex + frozenRows, "data-item-type": "row" }}
                  style={{
                    height,
                    overflow: "hidden"
                  }}
                >
                  {
                    r
                      ?.filter((_r: any[], columnIndex: number) => columnIndex >= actualFrozenColumns)
                      ?.map((c: any, columnIndex: number) => {
                        const w = colWidths?.[columnIndex + frozenColumns]?.width || cols?.[columnIndex + frozenColumns]?.width;//|| (frozenRows == 0 ? cols?.[columnIndex + actualFrozenColumns].width : colWidths?.[columnIndex + actualFrozenColumns]?.width) || "auto";

                        const width = {
                          width: w,
                          minWidth: w,
                          maxWidth: w,
                          overflow: "hidden",
                        };

                        return (
                          <td
                            key={columnIndex + frozenColumns}
                            {...{ "data-column-id": columnIndex + frozenColumns, "data-item-type": "column" }}
                            className={classNames(styles.Cell, cellClass)}
                            style={{
                              ...((rowIndex == 0 && frozenRows == 0) ? headerRowStyle : cellStyle),
                              ...width,
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

  )
})

export default T4;
