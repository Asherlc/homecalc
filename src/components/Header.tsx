import { AppBar, Toolbar, Typography } from "@material-ui/core";

export function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="h1">
          Home Cost Calculator
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
