// src/components/common/Input.tsx

import { TextField, TextFieldProps } from "@mui/material";
import { useFormContext } from "react-hook-form";

/**
 * Herbruikbare input die automatisch koppelt aan react-hook-form.
 */
export default function Input({ name, ...rest }: TextFieldProps & { name: string }) {
  const {
    register,
    formState: { errors }
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <TextField
      {...register(name)}
      {...rest}
      fullWidth
      margin="normal"
      error={!!error}
      helperText={error}
    />
  );
}
