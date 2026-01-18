// src/pages/Dashboard.tsx

import { Box, Typography } from "@mui/material";

export default function Dashboard() {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Welkom bij je WooCommerce Dashboard
      </Typography>
      <Typography variant="body1">
        Gebruik het menu aan de linkerkant om producten te beheren, CSV's te importeren of je instellingen te wijzigen.
      </Typography>
    </Box>
  );
}
