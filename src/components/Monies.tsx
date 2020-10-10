import numeral from "numeral";
import MaterialTable from "material-table";
import useMonies, { useMoniesCollection } from "../hooks/useMonies";
import {
  icons,
  requiredAndDeletableField,
  createOnRowAdd,
  onRowDelete,
  onCellEditApproved,
} from "./Issues";

export function Monies() {
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
          render: (rowData) => rowData.data().name,
          validate: requiredAndDeletableField("name"),
        },
        {
          title: "Amount",
          type: "numeric",
          field: "amount",
          validate: requiredAndDeletableField("amount"),
          render: function AmountCell(rowData) {
            return numeral(rowData.data().amount).format("$0,0");
          },
        },
        {
          title: "Available In",
          field: "availableIn",
          render: (rowData) => rowData.data().availableIn,
          validate: requiredAndDeletableField("availableIn"),
        },
      ]}
      data={monies.docs}
    />
  );
}
