import {
  Grid,
  MenuItem,
  Button,
  Select,
  FormControl,
  TextField,
  InputLabel,
  makeStyles,
} from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { useRouter } from "next/router";
import { useCurrentHome } from "../hooks/useCurrentHome";

import * as firebase from "firebase";
import { useHomes } from "../hooks/useHomes";
import { useState } from "react";

import { insertRecord } from "../firebaseUtils";
import { Home } from "../models/Home";

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 120,
  },
}));

function HomeCreator() {
  const [address, setAddress] = useState<string>();
  const router = useRouter();
  const classes = useStyles();

  return (
    <>
      <FormControl className={classes.formControl}>
        <TextField
          label="Create Home"
          placeholder="Address"
          value={address}
          onChange={(event) => {
            setAddress(event.target.value);
          }}
        />
      </FormControl>
      <Button
        onClick={async () => {
          const id = await insertRecord("homes", {
            address,
          });

          router.push(`/homes/${id}`);

          setAddress("");
        }}
      >
        <Add />
      </Button>
    </>
  );
}

function Selector({ homes }: { homes: Home[] }) {
  const router = useRouter();
  const classes = useStyles();
  const currentHome = useCurrentHome();

  return (
    <FormControl className={classes.formControl}>
      <InputLabel>Select a home</InputLabel>
      <Select
        autoWidth
        value={currentHome?.id}
        onChange={(event) => {
          router.push(`/homes/${event.target.value}`);
        }}
      >
        {homes.map((home) => {
          return (
            <MenuItem key={home.id} value={home.id}>
              {home.address}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

export function HomeSelector() {
  const homes = useHomes();

  if (!homes) {
    return null;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={5}>
        <Selector homes={homes} />
      </Grid>
      <Grid item justify="center">
        <HomeCreator />
      </Grid>
    </Grid>
  );
}

export const database = firebase.firestore();
