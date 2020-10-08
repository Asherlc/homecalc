import numeral from "numeral";
import MaterialTable from "material-table";
import { insertRecord, removeRecord, updateAttribute } from "../firebaseUtils";
import useMonies from "../hooks/useMonies";
import IncomeModel, { MoneyData } from "../models/Money";
import { icons, requiredAndDeletableField } from "./Issues";
import { Collections } from "../database";

export function Monies() {
  const monies = useMonies();

  if (!monies) {
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
        onRowAdd: (newData: Omit<MoneyData, "createdAt">) => {
          return insertRecord<MoneyData>(Collections.Monies, {
            createdAt: new Date().toISOString(),
            ...newData,
          });
        },
        onRowDelete: async (oldData: IncomeModel) => {
          removeRecord(Collections.Monies, oldData.id);
        },
      }}
      cellEditable={{
        onCellEditApproved: async (newValue, oldValue, rowData, columnDef) => {
          updateAttribute(Collections.Monies, rowData.id, {
            [columnDef.field as string]: newValue,
          });
        },
      }}
      columns={[
        {
          title: "Name",
          field: "name",
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
          validate: requiredAndDeletableField("availableIn"),
        },
      ]}
      data={monies}
    />
  );
}
