import { useTable } from "react-table";
import { useMemo } from "react";

enum ColumnAcccessors {
  Issue = "issue",
  Cost = "cost",
}

export default function Home() {
  const data = useMemo(
    () => [
      {
        [ColumnAcccessors.Issue]: "Foundation repair",
        [ColumnAcccessors.Cost]: 12,
      },
    ],
    []
  );

  const columns = useMemo(
    () => [
      {
        Header: "Issue",
        accessor: ColumnAcccessors.Issue, // accessor is the "key" in the data
      },
      {
        Header: "Cost",
        accessor: ColumnAcccessors.Cost,
      },
    ],
    []
  );

  const tableInstance = useTable({ columns, data });

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  return (
    // apply the table props
    <table {...getTableProps()}>
      <thead>
        {
          // Loop over the header rows
          headerGroups.map((headerGroup) => (
            // Apply the header row props
            <tr
              {...headerGroup.getHeaderGroupProps()}
              key={headerGroup.getHeaderGroupProps()}
            >
              {
                // Loop over the headers in each row
                headerGroup.headers.map((column) => (
                  // Apply the header cell props
                  <th
                    {...column.getHeaderProps()}
                    key={column.getHeaderProps()}
                  >
                    {
                      // Render the header
                      column.render("Header")
                    }
                  </th>
                ))
              }
            </tr>
          ))
        }
      </thead>
      {/* Apply the table body props */}
      <tbody {...getTableBodyProps()}>
        {
          // Loop over the table rows
          rows.map((row) => {
            // Prepare the row for display
            prepareRow(row);
            return (
              // Apply the row props
              <tr {...row.getRowProps()} key={row.getRowProps()}>
                {
                  // Loop over the rows cells
                  row.cells.map((cell) => {
                    // Apply the cell props
                    return (
                      <td {...cell.getCellProps()} key={cell.getCellProps(0)}>
                        {
                          // Render the cell contents
                          cell.render("Cell")
                        }
                      </td>
                    );
                  })
                }
              </tr>
            );
          })
        }
      </tbody>
    </table>
  );
}
