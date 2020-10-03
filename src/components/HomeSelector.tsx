import {
  Grid,
  MenuItem,
  Select,
  FormControl,
  TextField,
  InputLabel,
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

function HomeCreator() {
  const [address, setAddress] = useState<string>();
  const router = useRouter();

  return (
    <FormControl>
      <TextField
        label="Create Home"
        placeholder="Address"
        value={address}
        onChange={(event) => {
          setAddress(event.target.value);
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={async () => {
                  const id = await insertRecord("homes", {
                    address,
                  });

                  router.push(`/homes/${id}`);

                  setAddress("");
                }}
              >
                <Add />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </FormControl>
  );
}

function Selector({ homes }: { homes: Home[] }) {
  const router = useRouter();
  const currentHome = useCurrentHome();

  return (
    <FormControl>
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
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <Selector homes={homes} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <HomeCreator />
      </Grid>
    </Grid>
  );
}

export const database = firebase.firestore();
