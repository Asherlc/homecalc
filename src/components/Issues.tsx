import MaterialTable from "material-table";
import * as firebase from "firebase/app";
import { EmptyIssue, IssueData } from "../models/Issue";
import {
  Remove,
  Clear,
  AddBox,
  Check,
  DeleteOutline,
  Edit,
} from "@material-ui/icons";
import { insertRecord } from "../firebaseUtils";
import { useCost, updateAttribute } from "./Home";
import { forwardRef } from "react";

export const database = firebase.firestore();

export function updateIssue(id: string, attr: string, value: any) {
  updateAttribute(`issues`, id, attr, value);
}

export function removeIssue(id: string) {
  database.collection(`issues`).doc(id).delete();
}

export function Issues() {
  const cost = useCost();

  if (!cost) {
    return null;
  }

  return (
    <MaterialTable
      title="Issues"
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
        onRowAdd: (newData: Record<string, any>) => {
          return insertRecord<IssueData>("issues", {
            ...EmptyIssue,
            homeId: cost.home.id,
            createdAt: new Date().toISOString(),
            ...(newData as IssueData),
          });
        },
        onRowDelete: async (oldData) => {
          removeIssue(oldData.id);
        },
      }}
      cellEditable={{
        onCellEditApproved: async (newValue, oldValue, rowData, columnDef) => {
          updateIssue(rowData.id, columnDef.field as string, newValue);
        },
      }}
      columns={[
        { title: "Name", field: "name" },
        { title: "Cost", field: "cost" },
        { title: "Required In", field: "rawRequiredIn" },
        { title: "% Seller Pays", field: "sellerPercent" },
      ]}
      data={cost.issues}
    />
  );
}
