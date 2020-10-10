import Workspaces from "../src/components/Workspaces";
import { Login, useAuth } from "../src/components/Login";

export default function Index() {
  const { user } = useAuth();

  return <>{user ? <Workspaces /> : <Login />}</>;
}
