import { TextField, Typography, Stack } from "@mui/material";
import { useFormContext } from "react-hook-form";

export default function Step4() {
  const { register } = useFormContext();

  return (
    <Stack spacing={2} maxWidth={400}>
      <Typography variant="body1">
        Log hier in met een <strong>WordPress Application User</strong>. Deze moet rechten hebben om media te uploaden, maar het is niet je admin-gebruiker.
      </Typography>
      <TextField
        label="Gebruikersnaam"
        {...register("appUsername")}
        fullWidth
      />
      <TextField
        label="Application wachtwoord"
        type="password"
        {...register("appPassword")}
        fullWidth
      />
    </Stack>
  );
}