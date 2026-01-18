import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup
} from "@mui/material";
import { useFormContext } from "react-hook-form";

export default function Step2() {
  const { register } = useFormContext();
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">Authenticatiemethode</FormLabel>
      <RadioGroup {...register("authMethod")}>
        <FormControlLabel
          value="woo-rest"
          control={<Radio />}
          label="WooCommerce REST API Keys"
        />
        <FormControlLabel
          value="jwt"
          control={<Radio />}
          label="WordPress JWT Login"
        />
      </RadioGroup>
    </FormControl>
  );
}
