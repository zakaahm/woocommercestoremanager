import { AppBar, Toolbar, Typography, Box } from "@mui/material";

export default function Topbar() {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6">Woo Dashboard</Typography>
        <Box ml="auto">🔗 Verbonden</Box>
      </Toolbar>
    </AppBar>
  );
}
