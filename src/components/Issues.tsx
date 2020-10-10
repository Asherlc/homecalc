import numeral from "numeral";
import MaterialTable, { Icons } from "material-table";
import * as firebase from "firebase/app";
import { EmptyIssue, Issue, IssueData } from "../models/Issue";
import {
  Remove,
  Clear,
  AddBox,
  Check,
  DeleteOutline,
  Edit,
} from "@material-ui/icons";
import { useIssues } from "../hooks/useIssues";
import { forwardRef } from "react";
import { isEmpty, isNumber } from "lodash";
import { useCurrentHome } from "../hooks/useCurrentHome";
import { SliderWithNumberInput } from "./SliderWithNumberInput";
import { Unsaved } from "../types/RecordData";
import { WithoutHome } from "../types/UserScoped";

export function deletableField(validator: (rowData: any) => any) {
  return (rowData: unknown) => {
    if ((rowData as any)?.tableData?.editing === "delete") {
      return true;
    }

    return validator(rowData);
  };
}

export function requiredField<T>(fieldName: keyof T) {
  return (rowData: T) => {
    const val = rowData[fieldName];
    const isValid = !isEmpty(val) || isNumber(val);

    return isValid
      ? true
      : {
          isValid,
          helperText: `${fieldName} is required`,
        };
  };
}

export const requiredAndDeletableField = (fieldName: string) =>
  deletableField(requiredField(fieldName));

export const database = firebase.firestore();

export const icons: Icons = {
  // eslint-disable-next-line react/display-name
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  // eslint-disable-next-line react/display-name
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  // eslint-disable-next-line react/display-name
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  // eslint-disable-next-line react/display-name
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  // eslint-disable-next-line react/display-name
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  // eslint-disable-next-line react/display-name
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
};

export function Issues() {
  const { issues, collection } = useIssues();
  console.log(issues, collection);
  const home = useCurrentHome();

  if (!issues || !home || !collection) {
    return null;
  }

  return (
    <MaterialTable<Issue>
      title="Issues"
      options={{
        search: false,
        paging: false,
      }}
      icons={icons}
      editable={{
        onRowAdd: (newData: WithoutHome<Unsaved<IssueData>>) => {
          return collection.add({
            createdAt: Date.now(),
            ...EmptyIssue,
            homeId: home.id,
            ...(newData as any),
          });
        },
        onRowDelete: async ({ id }: Issue) => {
          if (!id) {
            return;
          }
          collection.doc(id).delete();
        },
      }}
      cellEditable={{
        onCellEditApproved: async (newValue, oldValue, rowData, columnDef) => {
          collection
            .doc(rowData.id)
            .set({ [columnDef.field as string]: newValue }, { merge: true });
        },
      }}
      columns={[
        {
          title: "Name",
          field: "name",
          validate: requiredAndDeletableField("name"),
        },
        {
          title: "Cost",
          type: "numeric",
          field: "cost",
          validate: requiredAndDeletableField("cost"),
          render: (rowData) => {
            return numeral(rowData.cost).format("$0,0");
          },
        },
        {
          title: "Required In",
          field: "requiredIn",
          validate: requiredAndDeletableField("requiredIn"),
        },
        {
          title: "% Seller Pays",
          field: "sellerPercent",
          editable: "never",
          // eslint-disable-next-line react/display-name
          render: (rowData) => {
            return (
              <SliderWithNumberInput
                value={Math.round(rowData.sellerPercent * 100)}
                onChangeCommitted={(val) => {
                  if (typeof val === "undefined") {
                    return;
                  }

                  collection
                    .doc(rowData.id)
                    .set({ sellerPercent: val / 100 }, { merge: true });
                }}
              />
            );
          },
        },
      ]}
      data={issues}
    />
  );
}
