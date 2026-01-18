// src/theme/palette.ts

import { PaletteOptions } from "@mui/material";

export const palette: PaletteOptions = {
  mode: "light",
  primary: {
    main: "#1976d2",       // Blauw
    contrastText: "#ffffff"
  },
  secondary: {
    main: "#9c27b0",       // Paars
    contrastText: "#ffffff"
  },
  error: {
    main: "#d32f2f"         // Rood
  },
  warning: {
    main: "#fbc02d"         // Geel
  },
  info: {
    main: "#0288d1"         // Lichtblauw
  },
  success: {
    main: "#2e7d32"         // Groen
  },
  background: {
    default: "#f4f6f8",     // Lichtgrijs
    paper: "#ffffff"
  },
  text: {
    primary: "#212121",
    secondary: "#666666"
  }
};
