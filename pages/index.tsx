import AddressForm from "../src/components/AddressForm";
import { insertRecord } from "../src/firebaseUtils";
import { Card, CardContent } from "@material-ui/core";
import { HomeSelector } from "../src/components/HomeSelector";
import { useRouter } from "next/router";
import { Collections } from "../src/database";
import { Login, useAuth } from "../src/components/Login";

function HomeCreator() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <AddressForm
      autosave={false}
      onSubmit={async (address) => {
        const id = await insertRecord(Collections.Homes, {
          ...address,
          uid: user!.uid,
        });

        router.push(`/homes/${id}`);
      }}
    />
  );
}

export default function Index() {
  const { user } = useAuth();

  return (
    <>
      {user ? (
        <>
          <HomeSelector />
          <Card>
            <CardContent>
              <HomeCreator />
            </CardContent>
          </Card>
        </>
      ) : (
        <Login />
      )}
    </>
  );
}
