import React from "react";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";

const apiKey = (process.env.NEXT_PUBLIC_BUGSNAG_API_KEY ||
  process.env.BUGSNAG_API_KEY) as string;

Bugsnag.start({
  apiKey: apiKey,
  plugins: [new BugsnagPluginReact(React)],
});

export default Bugsnag;
