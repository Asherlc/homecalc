import MaterialTable from "material-table";
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
import { Hidden, Input, Slider, Grid } from "@material-ui/core";
import { insertRecord, updateAttribute } from "../firebaseUtils";
import { useCost } from "../hooks/useCost";
import { forwardRef, useEffect, useState } from "react";
import { formatMoney } from "accounting";
import { isEmpty } from "lodash";
import { Collections } from "../database";

export function requiredField<T>(fieldName: keyof T) {
  return (rowData: T) => {
    const isValid = !isEmpty(rowData[fieldName]);

    return isValid
      ? true
      : {
          isValid,
          helperText: `${fieldName} is required`,
        };
  };
}

export const database = firebase.firestore();

export function updateIssue(id: string, values: IssueData): Promise<void> {
  return updateAttribute(Collections.Issues, id, values);
}

export function removeIssue(id: string): Promise<void> {
  return database.collection(Collections.Issues).doc(id).delete();
}

function OurSlider({ issue }: { issue: Issue }) {
  const [sellerPercent, setSellerPercent] = useState(issue.sellerPercent);

  useEffect(() => {
    setSellerPercent(issue.sellerPercent);
  }, [issue.sellerPercent]);

  return (
    <div>
      <Grid container spacing={2} alignItems="center">
        <Hidden smDown>
          <Grid item xs>
            <Slider
              value={sellerPercent}
              onChangeCommitted={(e, val) => {
                updateIssue(issue.id, { sellerPercent: val as number });
              }}
              onChange={(e, val) => {
                setSellerPercent(val as number);
              }}
            />
          </Grid>
        </Hidden>
        <Grid item>
          <Input
            value={sellerPercent}
            margin="dense"
            onChange={(e) => {
              updateIssue(issue.id, {
                sellerPercent: e.target.value
                  ? parseInt(e.target.value)
                  : undefined,
              });
            }}
            inputProps={{
              step: 10,
              min: 0,
              max: 100,
              type: "number",
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
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
          return insertRecord<IssueData>(Collections.Issues, {
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
          updateIssue(rowData.id, { [columnDef.field as string]: newValue });
        },
      }}
      columns={[
        { title: "Name", field: "name", validate: requiredField("name") },
        {
          title: "Cost",
          type: "numeric",
          field: "cost",
          validate: requiredField("cost"),
          render: (rowData) => {
            return formatMoney(rowData.cost, undefined, 0);
          },
        },
        {
          title: "Required In",
          field: "requiredIn",
          validate: requiredField("requiredIn"),
        },
        {
          title: "% Seller Pays",
          field: "sellerPercent",
          editable: "never",
          // eslint-disable-next-line react/display-name
          render: (rowData) => {
            return <OurSlider issue={rowData} />;
          },
        },
      ]}
      data={cost.issues}
    />
  );
}
