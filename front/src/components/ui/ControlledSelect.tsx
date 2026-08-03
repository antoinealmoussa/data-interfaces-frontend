import { Controller } from "react-hook-form";
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

export interface SelectOption {
  value: string | number;
  label: string;
}

interface ControlledSelectProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  options: SelectOption[];
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  onChange?: (value: string) => void;
}

export const ControlledSelect = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
  options,
  rules,
  onChange,
}: ControlledSelectProps<TFieldValues>) => (
  <FormControl fullWidth>
    <InputLabel>{label}</InputLabel>
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <Select
          label={label}
          {...field}
          error={!!fieldState.error}
          onChange={(e) => {
            field.onChange(e);
            onChange?.(String(e.target.value));
          }}
        >
          {options.map((option) => (
            <MenuItem key={String(option.value)} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      )}
    />
  </FormControl>
);
