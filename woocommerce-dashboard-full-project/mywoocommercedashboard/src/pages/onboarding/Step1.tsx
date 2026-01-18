import { TextField } from "@mui/material";
import { useFormContext } from "react-hook-form";

export default function Step1() {
  const { register } = useFormContext();
  return (
    <TextField
      label="Store URL"
      fullWidth
      {...register("storeUrl", { required: "Store URL is verplicht" })}
      placeholder="https://jouwwebshop.be"
    />
  );
}
