import { useHomes } from "../hooks/useHomes";
import {
  MenuItem,
  Select,
  FormControl,
  CircularProgress,
} from "@material-ui/core";
import { useRouter } from "next/router";
import { useCurrentHome } from "../hooks/useCurrentHome";

export function HomeSelector(): JSX.Element {
  const router = useRouter();
  const currentHome = useCurrentHome();
  const homes = useHomes();

  if (!homes) {
    return <CircularProgress />;
  }

  return (
    <FormControl>
      <Select
        autoWidth={true}
        value={currentHome?.id || ""}
        displayEmpty
        onChange={(event) => {
          const home = homes.docs.find(
            (home) => home.id === event.target.value
          );
          router.push(
            `/workspaces/${home?.ref?.parent?.parent?.id}/homes/${home?.id}`
          );
        }}
      >
        <MenuItem value="" disabled>
          Select A Home
        </MenuItem>
        {homes.docs.map((home) => {
          return (
            <MenuItem key={home.id} value={home.id}>
              {home.data().address} {home.data().city}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
