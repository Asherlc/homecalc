import MaterialTable from "material-table";
import { insertRecord, removeRecord, updateAttribute } from "../firebaseUtils";
import useIncomes from "../hooks/useIncomes";
import IncomeModel, { IncomeData } from "../models/Income";
import { icons, requiredAndDeletableField } from "./Issues";
import { Collections } from "../database";
import { formatMoney } from "accounting";

export function Income() {
  const incomes = useIncomes();

  if (!incomes) {
    return null;
  }

  return (
    <MaterialTable
      title="Incomes"
      options={{
        search: false,
        paging: false,
      }}
      icons={icons}
      editable={{
        onRowAdd: (newData: Omit<IncomeData, "createdAt">) => {
          return insertRecord<IncomeData>(Collections.Incomes, {
            createdAt: new Date().toISOString(),
            ...newData,
          });
        },
        onRowDelete: async (oldData: IncomeModel) => {
          removeRecord(Collections.Incomes, oldData.id);
        },
      }}
      cellEditable={{
        onCellEditApproved: async (newValue, oldValue, rowData, columnDef) => {
          updateAttribute(Collections.Incomes, rowData.id, {
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
            return formatMoney(rowData.amount, undefined, 0);
          },
        },
        {
          title: "Available In",
          field: "availableIn",
          validate: requiredAndDeletableField("availableIn"),
        },
      ]}
      data={incomes}
    />
  );
}
