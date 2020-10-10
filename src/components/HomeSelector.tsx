import { useHomes } from "../hooks/useHomes";
import {
  MenuItem,
  Select,
  FormControl,
  CircularProgress,
} from "@material-ui/core";
import { useRouter } from "next/router";
import { useCurrentHome } from "../hooks/useCurrentHome";

export function HomeSelector() {
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
          router.push(
            `workspaces/${router.query.workspaceId}/homes/${event.target.value}`
          );
        }}
      >
        <MenuItem value="" disabled>
          Select A Home
        </MenuItem>
        {homes.map((home) => {
          return (
            <MenuItem key={home.id} value={home.id}>
              {home.address} {home.city}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
