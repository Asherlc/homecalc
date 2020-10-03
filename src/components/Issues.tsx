import * as firebase from "firebase/app";
import { EmptyIssue, Issue, IssueData } from "../models/Issue";
import { TextInput, PriceInput } from "./inputs";
import {
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Slider,
} from "@material-ui/core";
import { Delete, Add } from "@material-ui/icons";
import { insertRecord } from "../firebaseUtils";
import { useCost, updateAttribute } from "./Home";
import { useEffect, useState } from "react";

export const database = firebase.firestore();

export function updateIssue(id: string, attr: string, value: any) {
  updateAttribute(`issues`, id, attr, value);
}

export function removeIssue(id: string) {
  database.collection(`issues`).doc(id).delete();
}

function IssueRow({ issue }: { issue: Issue }) {
  const [sellerPercent, setSellerPercent] = useState(issue.sellerPercent);

  useEffect(() => {
    setSellerPercent(issue.sellerPercent);
  }, [issue.sellerPercent]);

  return (
    <TableRow>
      <TableCell>
        <TextInput
          value={issue.name}
          onChange={(val) => {
            updateIssue(issue.id, "name", val);
          }}
        />
      </TableCell>
      <TableCell>
        <PriceInput
          value={issue.cost}
          onChange={(val) => {
            updateIssue(issue.id, "cost", val);
          }}
        />
      </TableCell>
      <TableCell>
        <TextInput
          value={issue.rawRequiredIn}
          onChange={(val) => {
            updateIssue(issue.id, "requiredIn", val);
          }}
        />
      </TableCell>
      <TableCell>
        <Slider
          value={sellerPercent}
          onChangeCommitted={(e, val) => {
            updateIssue(issue.id, "sellerPercent", val);
          }}
          onChange={(e, val) => {
            setSellerPercent(val as number);
          }}
          defaultValue={0}
          valueLabelDisplay="on"
        />
      </TableCell>
      <TableCell>
        <IconButton
          onClick={() => {
            removeIssue(issue.id);
          }}
        >
          <Delete />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

export function Issues() {
  const cost = useCost();

  if (!cost) {
    return null;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Issue</TableCell>
            <TableCell>Cost</TableCell>
            <TableCell>Required In</TableCell>
            <TableCell>% Seller Pays</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cost.issues.map((issue) => {
            return <IssueRow key={issue.id} issue={issue} />;
          })}
        </TableBody>
      </Table>
      <Button
        onClick={() => {
          insertRecord<IssueData>("issues", {
            ...EmptyIssue,
            homeId: cost.home.id,
          });
        }}
      >
        <Add /> Add Issue
      </Button>
    </TableContainer>
  );
}
