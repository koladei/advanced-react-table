import * as React from "react"
import styles from './App.module.scss'
import Table from "../src/Table"
import rows from "./sample.json"

function App() {
  const columns = [
    {
      width: 400,
      id: "Column1",
      title: "Column A"
    },
    {
      width: 100,
      id: "Column2",
      title: "Column B"
    },
    {
      width: 100,
      id: "Column3",
      title: "Column C"
    },
    {
      width: 100,
      id: "Column4",
      title: "Column D"
    },
    {
      width: 200,
      id: "Column5",
      title: "Column E"
    },
    {
      width: 200,
      id: "Column6",
      title: "Column F"
    },
    {
      width: 200,
      id: "Column7",
      title: "Column G"
    },
    {
      width: 200,
      id: "Column8",
      title: "Column H"
    },
    {
      width: 300,
      id: "Column9",
      title: "Column I"
    },
    {
      width: 200,
      id: "Column10",
      title: "Column J"
    },
    {
      width: 200,
      id: "Column11",
      title: "Column K"
    },
    {
      width: 300,
      id: "Column12",
      title: "Column L"
    },
    {
      width: 200,
      id: "Column13",
      title: "Column M"
    },
    {
      width: 300,
      id: "Column14",
      title: "Column N"
    }
  ];

  return (
    <div className={styles.App}>
      <Table
        hideColumnHeaders
        showColumnAndRowLabels
        freezeColumnHeaders
        freezeFirstColumn
        freezeRows={0}
        freezeColumns={1}
        headerRowStyle={{ padding: 5 }}
        cellStyle={{ padding: 5 }}
        cellClass={styles.Cell}
        headerRowClass={styles.Header}
        columns={columns}
        rows={rows} />
    </div>
  )
}

export default App
