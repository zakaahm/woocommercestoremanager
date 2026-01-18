// src/components/common/Select.tsx

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select as MUISelect,
  SelectProps,
  FormHelperText
} from "@mui/material";
import { useFormContext } from "react-hook-form";

/**
 * Select component gekoppeld aan react-hook-form.
 */
export default function Select({
  name,
  label,
  children,
  ...rest
}: SelectProps & { name: string; label: string }) {
  const {
    register,
    formState: { errors },
    getValues,
    setValue
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;
  const value = getValues(name);

  return (
    <FormControl fullWidth margin="normal" error={!!error}>
      <InputLabel>{label}</InputLabel>
      <MUISelect
        {...rest}
        label={label}
        value={value || ""}
        onChange={(e) => setValue(name, e.target.value, { shouldValidate: true })}
      >
        {children}
      </MUISelect>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}
