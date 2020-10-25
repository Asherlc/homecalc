import Workspaces from "../src/components/Workspaces";
import { Login, useAuth } from "../src/components/Login";

export default function Index(): JSX.Element {
  const { user } = useAuth();

  return user ? <Workspaces /> : <Login />;
}
