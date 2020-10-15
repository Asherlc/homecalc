import * as firebase from "firebase/app";
import "firebase/functions";
import {
  makeStyles,
  MenuList,
  CircularProgress,
  Grid,
  Card,
  Paper,
  createStyles,
  CardContent,
  Typography,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Button,
  MenuItem,
  Theme,
} from "@material-ui/core";
import { useMemo, useState } from "react";
import { Collections } from "../database";
import { useFirestoreSnapshot } from "../hooks/firebase";
import useWorkspaces from "../hooks/useWorkspaces";
import WorkspaceModel from "../models/Workspace";
import { useAuth } from "./Login";
import { Home } from "../models/Home";
import AddressForm from "./AddressForm";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { TextFieldWithAddButton } from "./inputs";

function FormDialog({
  workspace,
}: {
  workspace: firebase.firestore.QueryDocumentSnapshot<WorkspaceModel>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        New Home
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Add New Home</DialogTitle>
        <DialogContent>
          <AddressForm
            autosave={false}
            onSubmit={async (values) => {
              const record = await workspace.ref
                .collection(Collections.Homes)
                .add({ ...values, createdAt: new Date() });

              router.push(`/workspaces/${workspace.id}/homes/${record.id}`);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

const useOwnersStyle = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexWrap: "wrap",
      listStyle: "none",
      padding: theme.spacing(0.5),
      margin: 0,
    },
    chip: {
      margin: theme.spacing(0.5),
    },
  })
);

function Owners({
  owners,
  workspace,
}: {
  owners: string[];
  workspace: firebase.firestore.QueryDocumentSnapshot<WorkspaceModel>;
}) {
  const classes = useOwnersStyle();

  return (
    <ul className={classes.root}>
      {owners.map((owner) => {
        return (
          <li key={owner}>
            <Chip
              label={owner}
              onDelete={(): void => {
                workspace.ref.update({
                  owners: firebase.firestore.FieldValue.arrayRemove(owner),
                });
              }}
              className={classes.chip}
            />
          </li>
        );
      })}
    </ul>
  );
}

function Workspace({
  workspace,
}: {
  workspace: firebase.firestore.QueryDocumentSnapshot<WorkspaceModel>;
}) {
  const ref = useMemo(() => workspace.ref.collection(Collections.Homes), [
    workspace,
  ]);
  const homes = useFirestoreSnapshot<firebase.firestore.QuerySnapshot<Home>>(
    ref
  );

  if (!homes) {
    return <CircularProgress />;
  }

  return (
    <>
      <Typography variant="h6" align="center">
        {workspace.data().name}
      </Typography>
      <Typography variant="subtitle1">Homes</Typography>
      <MenuList>
        {homes.docs.map((home) => {
          return (
            <NextLink
              key={home.id}
              href={`/workspaces/${workspace.id}/homes/${home.id}`}
              passHref
            >
              <MenuItem>
                <Link>{home.data()?.address}</Link>
              </MenuItem>
            </NextLink>
          );
        })}
      </MenuList>
      <Typography variant="subtitle1">Shared with</Typography>
      <Owners owners={workspace.data().owners} workspace={workspace} />
      <TextFieldWithAddButton
        label="Share with email"
        type="email"
        required
        onSubmit={(val) => {
          workspace.ref.update({
            owners: firebase.firestore.FieldValue.arrayUnion(val),
          });
        }}
      />
      <FormDialog workspace={workspace} />
    </>
  );
}

function WorkspaceForm() {
  const { user } = useAuth();
  const { collection } = useWorkspaces();

  if (!collection || !user) {
    return <CircularProgress />;
  }

  return (
    <TextFieldWithAddButton
      required
      label="New Workspace Name"
      onSubmit={(val) => {
        collection.add({
          createdAt: Date.now(),
          name: val,
          owners: [user.email],
        });
      }}
    />
  );
}

export default function Workspaces() {
  const { workspaces } = useWorkspaces();

  if (!workspaces) {
    return <CircularProgress />;
  }

  return (
    <>
      <WorkspaceForm />
      <Grid container spacing={3}>
        {workspaces.docs.map((workspace) => {
          return (
            <Grid item xs={12} md={4} key={workspace.data().name}>
              <Card>
                <CardContent>
                  <Workspace workspace={workspace} />
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
