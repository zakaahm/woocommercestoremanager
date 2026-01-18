import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper as MuiStepper,
  Paper,
  Container,
  Typography,
  styled
} from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import { useState } from "react";
import { z } from "zod";
import { useAuth } from "../../auth/auth-provider";
import { loginWithJWT, loginWithWooRest } from "../../auth/auth-provider";

const schema = z.object({
  storeUrl: z.string().url(),
  authMethod: z.enum(["woo-rest", "jwt"]),
  consumerKey: z.string().optional(),
  consumerSecret: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  appUsername: z.string().optional(),
  appPassword: z.string().optional()
});

const steps = [
  "Store URL",
  "Authenticatie",
  "Gegevens invoeren",
  "Application gebruiker"
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  background: "linear-gradient(to bottom, #ffffff, #f8f9fa)"
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1.5, 4),
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem"
}));

const StepContent = styled(Box)(({ theme }) => ({
  minHeight: "300px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: theme.spacing(3, 0)
}));

export default function OnboardingStepper() {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      storeUrl: "",
      authMethod: "woo-rest"
    }
  });

  const [activeStep, setActiveStep] = useState(0);
  const { setAuth } = useAuth();

  const onNext = async (data: any) => {
    if (activeStep === steps.length - 1) {
      let auth;
      if (data.authMethod === "woo-rest") {
        auth = await loginWithWooRest(
          data.storeUrl,
          data.consumerKey,
          data.consumerSecret
        );
      } else {
        auth = await loginWithJWT(data.storeUrl, data.username, data.password);
      }
      setAuth(auth);

      if (data.appUsername && data.appPassword) {
        const token = btoa(`${data.appUsername}:${data.appPassword}`);
        localStorage.setItem("wordpress_token", token);
      }

      window.location.href = "/dashboard";
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 6 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700, mb: 1, color: "primary.main" }}
        >
          Welkom bij onze app
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Laten we je account in een paar stappen instellen
        </Typography>

        <StyledPaper elevation={0}>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onNext)}>
              <MuiStepper
                activeStep={activeStep}
                sx={{
                  mb: 4,
                  "& .MuiStepLabel-root .Mui-completed": {
                    color: "success.main"
                  },
                  "& .MuiStepLabel-root .Mui-active": {
                    color: "primary.main",
                    fontWeight: 600
                  }
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </MuiStepper>

              <StepContent>
                {activeStep === 0 && <Step1 />}
                {activeStep === 1 && <Step2 />}
                {activeStep === 2 && <Step3 />}
                {activeStep === 3 && <Step4 />}
              </StepContent>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  pt: 3,
                  borderTop: "1px solid",
                  borderColor: "divider"
                }}
              >
                <StyledButton
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((prev) => prev - 1)}
                  variant="outlined"
                  color="primary"
                >
                  Terug
                </StyledButton>
                <StyledButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  disableElevation
                >
                  {activeStep === steps.length - 1 ? "Voltooien" : "Volgende"}
                </StyledButton>
              </Box>
            </form>
          </FormProvider>
        </StyledPaper>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Stap {activeStep + 1} van {steps.length}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}