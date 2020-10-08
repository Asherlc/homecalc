import numeral from "numeral";
import MaterialTable, { Icons } from "material-table";
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
import { insertRecord, updateAttribute } from "../firebaseUtils";
import { useIssues } from "../hooks/useIssues";
import { forwardRef } from "react";
import { isEmpty, isNumber } from "lodash";
import { Collections } from "../database";
import { useCurrentHome } from "../hooks/useCurrentHome";
import { SliderWithNumberInput } from "./SliderWithNumberInput";

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

export function updateIssue(id: string, values: IssueData): Promise<void> {
  return updateAttribute(Collections.Issues, id, values);
}

export function removeIssue(id: string): Promise<void> {
  return database.collection(Collections.Issues).doc(id).delete();
}

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
  const issues = useIssues();
  const home = useCurrentHome();

  if (!issues || !home) {
    return null;
  }

  return (
    <MaterialTable
      title="Issues"
      options={{
        search: false,
        paging: false,
      }}
      icons={icons}
      editable={{
        onRowAdd: (newData: Record<string, any>) => {
          return insertRecord<IssueData>(Collections.Issues, {
            ...EmptyIssue,
            homeId: home.id,
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
          updateIssue(rowData.id, { [columnDef.field as string]: newValue });
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

                  updateIssue(rowData.id, {
                    sellerPercent: val / 100,
                  });
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
