// src/pages/Settings.tsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Divider,
  TextField,
  Stack,
  Alert
} from "@mui/material";
import { useAuth } from "../auth/auth-provider";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tokenSaved, setTokenSaved] = useState(false);
  const [error, setError] = useState("");
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("wordpress_token");
    setHasToken(!!token);
  }, []);

  const handleDisconnect = () => {
    if (confirm("Weet je zeker dat je de verbinding met de store wilt verbreken?")) {
      setAuth(null);
      localStorage.removeItem("wordpress_token");
      setHasToken(false);
      navigate("/");
    }
  };

  const handleUnlinkUser = () => {
    if (confirm("Wil je de gekoppelde WordPress gebruiker ontkoppelen?")) {
      localStorage.removeItem("wordpress_token");
      setHasToken(false);
    }
  };

  const handleLinkUser = async () => {
    if (!username || !password) {
      setError("Gebruikersnaam en wachtwoord zijn verplicht.");
      return;
    }

    try {
      const token = btoa(`${username}:${password}`);
      localStorage.setItem("wordpress_token", token);
      setTokenSaved(true);
      setError("");
      setHasToken(true);
    } catch (err) {
      setError("Koppelen mislukt. Probeer opnieuw.");
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Instellingen
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="body1" gutterBottom>
        Je bent momenteel verbonden met:
      </Typography>

      {auth?.storeUrl && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {auth.storeUrl}
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        👤 WordPress gebruiker
      </Typography>

      {!hasToken ? (
        <>
          <Typography variant="body2" gutterBottom>
            Deze gebruiker moet media kunnen uploaden. Gebruik een admin of editor account.
          </Typography>

          <Stack spacing={2} sx={{ maxWidth: 400, mt: 2 }}>
            <TextField
              label="Gebruikersnaam"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
            />
            <TextField
              label="Wachtwoord"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={handleLinkUser}>
              Koppel gebruiker
            </Button>

            {tokenSaved && <Alert severity="success">Gebruiker succesvol gekoppeld!</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </>
      ) : (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>
            WordPress gebruiker is gekoppeld. ✅
          </Alert>
          <Button variant="outlined" color="warning" onClick={handleUnlinkUser}>
            Ontkoppel gebruiker
          </Button>
        </>
      )}

      <Divider sx={{ my: 4 }} />

      <Button variant="outlined" color="error" onClick={handleDisconnect}>
        🔌 Ontkoppel store
      </Button>
    </Box>
  );
}