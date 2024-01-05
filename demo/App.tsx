import * as React from "react"
import styles from './App.module.scss'
import Table from "../src/Table"
import rows from "./sample.json"

function App() {
  const columns = [
    {
      width: 30,
      id: "Column1",
      title: " "
    },
    {
      width: 100,
      id: "Column2",
      title: "A"
    },
    {
      width: 100,
      id: "Column3",
      title: "B"
    },
    {
      width: 100,
      id: "Column4",
      title: "C"
    },
    {
      width: 100,
      id: "Column5",
      title: "D"
    },
    {
      width: 200,
      id: "Column6",
      title: "E"
    },
    {
      width: 200,
      id: "Column7",
      title: "F"
    },
    {
      width: 200,
      id: "Column8",
      title: "G"
    },
    {
      width: 200,
      id: "Column9",
      title: "H"
    },
    {
      width: 300,
      id: "Column10",
      title: "I"
    },
    {
      width: 200,
      id: "Column4",
      title: "J"
    },
    {
      width: 200,
      id: "Column4",
      title: "K"
    },
    {
      width: 300,
      id: "Column4",
      title: "L"
    },
    {
      width: 200,
      id: "Column4",
      title: "M"
    },
    {
      width: 300,
      id: "Column4",
      title: "N"
    }
  ];

  return (
    <div className={styles.App}>
      <Table
        // hideColumnHeaders
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
