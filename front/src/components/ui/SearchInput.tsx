import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { SearchInputProps } from "../../types/uiTypes";

export const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    onSearch,
    isLoading = false,
    placeholder = "Rechercher...",
}) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && !isLoading && value.trim()) {
            onSearch();
        }
    };

    return (
        <TextField
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="action" />
                        </InputAdornment>
                    ),
                },
            }}
            sx={{ width: "75%" }}
        />
    );
};
