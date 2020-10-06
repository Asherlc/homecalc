import MaterialTable from "material-table";
import {
  Remove,
  Clear,
  AddBox,
  Check,
  DeleteOutline,
  Edit,
} from "@material-ui/icons";
import { insertRecord, removeRecord, updateAttribute } from "../firebaseUtils";
import useIncomes from "../hooks/useIncomes";
import { forwardRef } from "react";
import IncomeModel, { IncomeData } from "../models/Income";
import { requiredField } from "./Issues";
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
      icons={{
        // eslint-disable-next-line react/display-name
        Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
        // eslint-disable-next-line react/display-name
        Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
        // eslint-disable-next-line react/display-name
        Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
        // eslint-disable-next-line react/display-name
        Delete: forwardRef((props, ref) => (
          <DeleteOutline {...props} ref={ref} />
        )),
        // eslint-disable-next-line react/display-name
        Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
        // eslint-disable-next-line react/display-name
        ThirdStateCheck: forwardRef((props, ref) => (
          <Remove {...props} ref={ref} />
        )),
      }}
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
        { title: "Name", field: "name", validate: requiredField("name") },
        {
          title: "Amount",
          type: "numeric",
          field: "amount",
          validate: requiredField("amount"),
          render: function AmountCell(rowData) {
            return formatMoney(rowData.amount, undefined, 0);
          },
        },
        {
          title: "Available In",
          field: "availableIn",
          validate: requiredField("availableIn"),
        },
      ]}
      data={incomes}
    />
  );
}
