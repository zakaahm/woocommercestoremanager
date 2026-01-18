// src/components/common/Button.tsx

import { Button as MUIButton, ButtonProps } from "@mui/material";

/**
 * Een herbruikbare button die MUI gebruikt maar standaard een contained variant toont.
 */
export default function Button(props: ButtonProps) {
  return <MUIButton variant="contained" color="primary" {...props} />;
}
