import { Box, Button, TextField, Typography } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";
import { testConnection } from "../../auth/test-connection";
import { useState } from "react";

export default function Step3() {
  const { control, register } = useFormContext();
  const authMethod = useWatch({ control, name: "authMethod" });
  const storeUrl = useWatch({ control, name: "storeUrl" });
  const [status, setStatus] = useState<null | string>(null);

  const handleTest = async () => {
    setStatus("Bezig met testen...");
    try {
      await testConnection({ authMethod, storeUrl });
      setStatus("✅ Verbinding geslaagd!");
    } catch (err) {
      setStatus("❌ Verbinding mislukt");
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {authMethod === "woo-rest" && (
        <>
          <TextField
            label="Consumer Key"
            {...register("consumerKey", { required: true })}
          />
          <TextField
            label="Consumer Secret"
            {...register("consumerSecret", { required: true })}
          />
        </>
      )}
      {authMethod === "jwt" && (
        <>
          <TextField
            label="Gebruikersnaam"
            {...register("username", { required: true })}
          />
          <TextField
            label="Wachtwoord"
            type="password"
            {...register("password", { required: true })}
          />
        </>
      )}
      <Button variant="outlined" onClick={handleTest}>
        Test verbinding
      </Button>
      {status && <Typography>{status}</Typography>}
    </Box>
  );
}
