import AddressForm from "../src/components/AddressForm";
import { insertRecord } from "../src/firebaseUtils";
import { Card, CardContent } from "@material-ui/core";
import { HomeSelector } from "../src/components/HomeSelector";
import { useRouter } from "next/router";
import { Collections } from "../src/database";

function HomeCreator() {
  const router = useRouter();

  return (
    <AddressForm
      autosave={false}
      onSubmit={async (address) => {
        const id = await insertRecord(Collections.Homes, address);

        router.push(`/homes/${id}`);
      }}
    />
  );
}

export default function Index() {
  return (
    <>
      <HomeSelector />
      <Card>
        <CardContent>
          <HomeCreator />
        </CardContent>
      </Card>
    </>
  );
}
