// eslint-disable-next-line @typescript-eslint/no-var-requires
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom';
const matchers = require("@testing-library/jest-dom");
expect.extend(matchers);


import Table from "../Table";

test("should all the columns", () => {
  const { getAllByTestId } = render(<Table columns={[
    {
      width: 30,
      id: "Column1",
      title: " ",
    },
    {
      width: 100,
      id: "Column2",
      title: "A",
    },
    {
      width: 100,
      id: "Column3",
      title: "B",
    }
  ]} showColumnAndRowLabels />);
  const headers = getAllByTestId("header");
  expect(headers.length).toBe(3);
  fireEvent.click(headers[0]);
});
