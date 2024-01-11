import { useRef, forwardRef, useEffect } from 'react';
import styles from "./Table.module.scss"
import classNames from 'classnames';
import { SubTableProps, TableProps } from './Types';


const T3 = forwardRef(({
  cellStyle = {},
  cellClass = '',
  headerRowClass = '',
  showColumnAndRowLabels = false,
  actualFrozenColumns,
  actualFrozenRows,
  frozenRows,
  data = [],
  rowHeights,
  colWidths,
  shift = 0,
  width,
  onRowHeightsChanged,
}: TableProps & SubTableProps, ref: any) => {
  const r = useRef(null);
  if (!ref) {
    ref = r;
  }

  useEffect(() => {
    const observer = new ResizeObserver((_entries) => {
      if (typeof onRowHeightsChanged == "function") {
        const rHeights = [...rowHeights];
        ref?.current?.querySelectorAll("tr[data-item-type='row']").forEach((row: any) => {
          const rowIndex = parseInt(row.getAttribute("data-row-id"));
          const height = row?.getBoundingClientRect()?.height;
          rHeights[rowIndex] = { height };
        });

        onRowHeightsChanged(rHeights);
      }
    });

    if (ref?.current) {
      observer.observe(ref?.current);
    }

    return () => observer.disconnect();
  }, [ref, ref?.current]);

  return (<div>
    <table ref={ref as any} className={classNames('T3', styles.T3)} cellPadding={0} cellSpacing={0} style={{ minWidth: width, maxWidth: width, width, height: "auto" }}>
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
                  r.filter((_r: any[], i: number) => i < actualFrozenColumns).map((c: any, columnIndex: number) => {

                    const width = colWidths?.[columnIndex + shift]?.width || "auto";
                    return (
                      <td
                        key={columnIndex + shift}
                        {...{ "data-column-id": columnIndex + shift, "data-item-type": "column" }}
                        className={classNames(styles.Cell, cellClass)}
                        style={{
                          overflow: "hidden",
                          ...cellStyle,
                          minWidth: width,
                          ...(width ? { width: width, } : {})
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
