import { Controller } from "react-hook-form";
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Typography,
} from "@mui/material";
import { toggleArrayItem } from "../../utils/array";

interface CheckboxGroupFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  options: string[];
  required?: boolean;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
}

export const CheckboxGroupField = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
  options,
  required = false,
  rules,
}: CheckboxGroupFieldProps<TFieldValues>) => (
  <Controller
    control={control}
    name={name}
    rules={rules}
    render={({ field, fieldState }) => (
      <FormControl error={!!fieldState.error} required={required}>
        <FormLabel>{label}</FormLabel>
        <FormGroup>
          {options.map((option) => (
            <FormControlLabel
              key={option}
              control={
                <Checkbox
                  checked={(field.value as string[]).includes(option)}
                  onChange={() =>
                    field.onChange(
                      toggleArrayItem(field.value as string[], option),
                    )
                  }
                />
              }
              label={option}
            />
          ))}
        </FormGroup>
        {fieldState.error && (
          <Typography variant="caption" color="error">
            {fieldState.error.message}
          </Typography>
        )}
      </FormControl>
    )}
  />
);
