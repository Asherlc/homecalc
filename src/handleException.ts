import { NotifiableError } from "@bugsnag/js";
import Bugsnag from "./bugsnag";

export default function handleException(error: NotifiableError): void {
  Bugsnag.notify(error);
  console.log(error);
}
