import numeral from "numeral";
import MaterialTable from "material-table";
import useMonies, { useMoniesCollection } from "../hooks/useMonies";
import {
  icons,
  requiredAndDeletableField,
  createOnRowAdd,
  onRowDelete,
  onCellEditApproved,
  dateParseableAndDeletableField,
} from "./Issues";

export function Monies(): JSX.Element | null {
  const monies = useMonies();
  const collection = useMoniesCollection();

  if (!monies || !collection) {
    return null;
  }

  return (
    <MaterialTable
      title="Monies"
      options={{
        search: false,
        paging: false,
      }}
      icons={icons}
      editable={{
        onRowAdd: createOnRowAdd(collection),
        onRowDelete,
      }}
      cellEditable={{
        onCellEditApproved,
      }}
      columns={[
        {
          title: "Name",
          field: "name",
          render: (rowData) => rowData.name,
          validate: requiredAndDeletableField("name"),
        },
        {
          title: "Amount",
          type: "numeric",
          field: "amount",
          validate: requiredAndDeletableField("amount"),
          render: function AmountCell(rowData) {
            return numeral(rowData.amount).format("$0,0");
          },
        },
        {
          title: "Available In",
          field: "availableIn",
          render: (rowData) => rowData.availableIn,
          validate: dateParseableAndDeletableField("availableIn"),
        },
      ]}
      data={monies.docs.map((doc) => doc.data())}
    />
  );
}
