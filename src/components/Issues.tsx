import * as firebase from "firebase/app";
import numeral from "numeral";
import MaterialTable, { Column, Icons } from "material-table";
import {
  Remove,
  Clear,
  AddBox,
  Check,
  DeleteOutline,
  Edit,
} from "@material-ui/icons";
import { useIssues, useIssuesCollection } from "../hooks/useIssues";
import { forwardRef } from "react";
import { isEmpty, isNumber } from "lodash";
import { useCurrentHome } from "../hooks/useCurrentHome";
import { SliderWithNumberInput } from "./SliderWithNumberInput";
import handleException from "../handleException";
import { parseDate } from "chrono-node";
import FirebaseProxy from "../models/FirebaseProxy";

export function deletableField(validator: (rowData: any) => any) {
  return (rowData: unknown) => {
    if ((rowData as any)?.tableData?.editing === "delete") {
      return true;
    }

    return validator(rowData);
  };
}

type Validity =
  | boolean
  | {
      isValid: boolean;
      helperText: string;
    };

export function requiredField<T>(fieldName: keyof T) {
  return (rowData: T): Validity => {
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

export function dateParseable<T>(fieldName: keyof T) {
  return (rowData: T): Validity => {
    const val = rowData[fieldName];
    const isValid = parseDate((val as unknown) as string);

    return isValid
      ? true
      : {
          isValid,
          helperText: `${fieldName} is not a parseable date`,
        };
  };
}

export const dateParseableAndDeletableField = (fieldName: string) =>
  deletableField(dateParseable(fieldName));

export function createOnRowAdd(
  collection: firebase.firestore.CollectionReference<
    firebase.firestore.DocumentData
  >
) {
  return async function onRowAdd<RowData extends FirebaseProxy>(
    newData: RowData
  ): Promise<void> {
    try {
      await collection.add({
        createdAt: Date.now(),
        ...newData,
      });
    } catch (e) {
      handleException(e);
    }
  };
}

export async function onRowDelete<RowData extends FirebaseProxy>(
  oldData: RowData
): Promise<void> {
  try {
    await oldData.delete();
  } catch (e) {
    handleException(e);
  }
}

export async function onCellEditApproved<RowData extends FirebaseProxy>(
  newValue: unknown,
  oldValue: unknown,
  rowData: RowData,
  columnDef: Column<RowData>
): Promise<void> {
  try {
    await rowData.update({
      [columnDef.field as string]: newValue,
    });
  } catch (e) {
    handleException(e);
  }
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

export function Issues(): JSX.Element | null {
  const issues = useIssues();
  const collection = useIssuesCollection();
  const home = useCurrentHome();

  if (!issues || !home || !collection) {
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
          render: (rowData) => rowData.requiredIn,
          validate: dateParseableAndDeletableField("requiredIn"),
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
                onChangeCommitted={async (val) => {
                  if (typeof val === "undefined") {
                    return;
                  }

                  try {
                    await rowData.update({ sellerPercent: val / 100 });
                  } catch (e) {
                    handleException(e);
                  }
                }}
              />
            );
          },
        },
      ]}
      data={issues.docs.map((doc) => doc.data())}
    />
  );
}
