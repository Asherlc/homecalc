import * as firebase from "firebase/app";
import { Delete as DeleteIcon, Home as HomeIcon } from "@material-ui/icons";
import "firebase/functions";
import {
  Divider,
  Box,
  IconButton,
  CardActions,
  makeStyles,
  CircularProgress,
  ListItemSecondaryAction,
  ListItemText,
  ListItem,
  ListItemIcon,
  List,
  Grid,
  Card,
  createStyles,
  CardContent,
  Typography,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Theme,
} from "@material-ui/core";
import { ReactNode, useMemo, useState } from "react";
import { Collections } from "../database";
import { useFirestoreSnapshot } from "../hooks/firebase";
import useWorkspaces from "../hooks/useWorkspaces";
import WorkspaceModel from "../models/Workspace";
import { useAuth } from "./Login";
import { Home } from "../models/Home";
import AddressForm from "./AddressForm";
import { useRouter } from "next/router";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { TextFieldWithAddButton } from "./inputs";
import { without } from "lodash";
import handleException from "../handleException";

interface DeleteAlertDialogRenderProps {
  handleClickOpen: () => void;
}

function DeleteAlertDialog({
  button,
  onConfirm,
}: {
  button: (renderProps: DeleteAlertDialogRenderProps) => ReactNode;
  onConfirm: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {button({ handleClickOpen })}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete this?</DialogTitle>
        <DialogActions>
          <Button
            onClick={async () => {
              await onConfirm();
              handleClose();
            }}
            color="primary"
          >
            Confirm
          </Button>
          <Button onClick={handleClose} color="primary" autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

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
              try {
                const record = await workspace.ref
                  .collection(Collections.Homes)
                  .add({ ...values, createdAt: new Date() });

                router.push(`/workspaces/${workspace.id}/homes/${record.id}`);
              } catch (e) {
                handleException(e);
              }
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
  const { user } = useAuth();

  return (
    <ul className={classes.root}>
      {without(owners, user?.email).map((owner) => {
        return (
          <li key={owner}>
            <Chip
              label={owner}
              onDelete={async (): Promise<void> => {
                try {
                  await workspace.ref.update({
                    owners: firebase.firestore.FieldValue.arrayRemove(owner),
                  });
                } catch (e) {
                  handleException(e);
                }
              }}
              className={classes.chip}
            />
          </li>
        );
      })}
    </ul>
  );
}

function WrappableLink({
  className,
  children,
  ...props
}: NextLinkProps & {
  className?: string;
  children: ReactNode;
}) {
  return (
    <NextLink {...props}>
      <a className={className}>{children}</a>
    </NextLink>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    section: {
      margin: theme.spacing(3, 2),
    },
  })
);

function Workspace({
  workspace,
}: {
  workspace: firebase.firestore.QueryDocumentSnapshot<WorkspaceModel>;
}) {
  const classes = useStyles();
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
      <div className={classes.section}>
        <Typography gutterBottom variant="body1">
          Homes
        </Typography>
        <List component="nav" aria-label="main mailbox folders">
          {homes.docs.map((home) => {
            return (
              <ListItem
                button
                component={WrappableLink}
                key={home.id}
                href={`/workspaces/${workspace.id}/homes/${home.id}`}
              >
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText>{home.data()?.address}</ListItemText>
                <ListItemSecondaryAction>
                  <DeleteAlertDialog
                    onConfirm={() => {
                      return home.ref.delete();
                    }}
                    button={({ handleClickOpen }) => {
                      return (
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={handleClickOpen}
                        >
                          <DeleteIcon />
                        </IconButton>
                      );
                    }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
        <FormDialog workspace={workspace} />
      </div>
      <div className={classes.section}>
        <Typography gutterBottom variant="body1">
          Shared with
        </Typography>
        <Owners owners={workspace.data().owners} workspace={workspace} />
        <TextFieldWithAddButton
          label="Share with email"
          type="email"
          clearOnSubmit={true}
          required
          onSubmit={async (val) => {
            try {
              await workspace.ref.update({
                owners: firebase.firestore.FieldValue.arrayUnion(
                  val?.toLowerCase()
                ),
              });
            } catch (e) {
              handleException(e);
            }
          }}
        />
      </div>
      <Divider variant="middle" />
      <CardActions>
        <DeleteAlertDialog
          onConfirm={() => {
            return workspace.ref.delete();
          }}
          button={({ handleClickOpen }) => {
            return (
              <IconButton onClick={handleClickOpen}>
                <DeleteIcon />
              </IconButton>
            );
          }}
        />
      </CardActions>
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
      clearOnSubmit={true}
      required
      label="New Workspace Name"
      onSubmit={(val) => {
        return collection.add({
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
      <Box p={3}>
        <WorkspaceForm />
      </Box>
      <Grid container spacing={3}>
        {workspaces.docs.map((workspace) => {
          return (
            <Grid item xs={12} md={4} key={workspace.id}>
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
