# Advanced React Table

A react table with support for freezing columns and rows.

INSTALLATION
On node command line type: `npm i @cradlesoft/advanced-react-table` to install

USAGE

```jsx
<FreezableTable
  freezeColumnHeaders
  freezeRows={1}
  freezeColumns={1}
  headerRowStyle={{ textWrap: "nowrap", padding: 5, height: 50 }}
  cellStyle={{ padding: 5 }}
  columns={[
    {
      // width: 200,
      id: "Column1",
      title: "Column 1",
    },
    {
      // width: 400,
      id: "Column2",
      title: "Column 2",
    },
    {
      // width: 200,
      id: "Column3",
      title: "Column 3",
    },
    {
      // width: 200,
      id: "Column4",
      title: "Column 4",
    },
    {
      // width: 200,
      id: "Column4",
      title: "Column 4",
    },
    {
      // width: 200,
      id: "Column4",
      title: "Column 4",
    },
  ]}
  rows={[
    {
      Column1: "R1C1 I jjkh hkh hjhkh hkhkjhlkhj khhjhkh khk lh ",
      Column2: "R1C2",
      Column3: "R1C3",
      Column5: "R1C5",
    },
    {
      Column1: "R2C1",
      Column2: "R2C2 ",
      Column3: "R2C3",
      Column4: "R2C4",
      Column5: "R2C5",
    },
    {
      Column1: "R3C1",
      Column2: "R3C2",
      Column3: "R3C3",
      Column4: "R3C4",
      Column5: "R3C5",
    },
    {
      Column1: "R4C1",
      Column2: "R4C2",
      Column3: "R4C3",
      Column4: "R4C4",
      Column5: "R4C5",
    },
    {
      Column1: "R5C1",
      Column2: "R5C2",
      Column3: "R5C3",
      Column4: "R5C4",
      Column5: "R5C5",
    },
    {
      Column1: "R6C1",
      Column2: "R6C2",
      Column3: "R6C3",
      Column4: "R6C4",
      Column5: "R6C5",
    },
    {
      // Column1: "R7C1",
      Column2: "R7C2",
      Column3: "R7C3",
      Column4: "R7C4",
      Column5: "R7C5",
      Column6: "R7C6",
      Column7: "R7C7",
      Column8: "R7C8",
      Column9: "R7C9",
    },
  ]}
/>
```

OPTIONS
