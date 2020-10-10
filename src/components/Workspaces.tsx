import * as firebase from "firebase/app";
import {
  MenuList,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Button,
  MenuItem,
} from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { useMemo, useState } from "react";
import { Collections, database } from "../database";
import { useFirestoreSnapshot } from "../hooks/firebase";
import useWorkspaces from "../hooks/useWorkspaces";
import WorkspaceModel from "../models/Workspace";
import { useAuth } from "./Login";
import { Home } from "../models/Home";
import AddressForm from "./AddressForm";
import { useRouter } from "next/router";
import NextLink from "next/link";

function FormDialog({ workspace }: { workspace: WorkspaceModel }) {
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
              const record = await database
                .collection(
                  `/${Collections.Workspaces}/${workspace.id}/${Collections.Homes}`
                )
                .add({
                  ...values,
                  createdAt: Date.now(),
                });

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

function Workspace({ workspace }: { workspace: WorkspaceModel }) {
  const ref = useMemo(
    () =>
      database.collection(
        `/${Collections.Workspaces}/${workspace.id}/${Collections.Homes}`
      ),
    [workspace.id]
  );
  const homes = useFirestoreSnapshot<firebase.firestore.QuerySnapshot<Home>>(
    ref
  );

  if (!homes) {
    return <CircularProgress />;
  }

  return (
    <>
      <Typography variant="h6" align="center">
        {workspace.name}
      </Typography>
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
      <FormDialog workspace={workspace} />
    </>
  );
}

function WorkspaceForm() {
  const { user } = useAuth();
  const { collection } = useWorkspaces();
  const [name, setName] = useState<string>();

  if (!collection || !user) {
    return <CircularProgress />;
  }

  return (
    <TextField
      required
      label="New Workspace Name"
      onChange={(event) => {
        setName(event.target.value);
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => {
                collection.add({
                  createdAt: Date.now(),
                  name,
                  uid: user.uid,
                });
              }}
            >
              <Add />
            </IconButton>
          </InputAdornment>
        ),
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
      <Grid container>
        {workspaces.map((workspace) => {
          return (
            <Grid item xs={12} md={4} key={workspace.name}>
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
