import {
  Grid,
  MenuItem,
  Button,
  Select,
  FormControl,
  TextField,
  InputLabel,
  makeStyles,
  InputAdornment,
  IconButton,
} from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { useRouter } from "next/router";
import { useCurrentHome } from "../hooks/useCurrentHome";

import * as firebase from "firebase";
import { useHomes } from "../hooks/useHomes";
import { useState } from "react";

import { insertRecord } from "../firebaseUtils";
import { Home } from "../models/Home";
import GoogleMapsAutoComplete from "./GoogleMapsAutoComplete";

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 200,
  },
}));

function HomeCreator() {
  const [address, setAddress] = useState<string>();
  const router = useRouter();
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl}>
      <GoogleMapsAutoComplete
        onChange={async (place) => {
          const id = await insertRecord("homes", {
            place,
          });

          router.push(`/homes/${id}`);

          setAddress("");
        }}
      />
    </FormControl>
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
        autoWidth={true}
        value={currentHome?.id || ""}
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
      <Grid item xs={6}>
        <Selector homes={homes} />
      </Grid>
      <Grid item xs={6}>
        <HomeCreator />
      </Grid>
    </Grid>
  );
}

export const database = firebase.firestore();
