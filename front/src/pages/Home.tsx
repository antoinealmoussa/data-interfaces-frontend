import { useState } from "react";
import { Box, Typography } from "@mui/material";
import axios from "axios";
import { SearchInput } from "../components/ui/SearchInput";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import API_URLS from "../api/config";
import type { HomeState } from "../types/uiTypes";
import MarkdownRenderer from "../components/layout/MarkdownRenderer";

export const Home = () => {
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [state, setState] = useState<HomeState>("idle");
  const [responseText, setResponseText] = useState("");

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    setState("loading");

    try {
      const response = await axios.get<{ text: string }>(
        `${API_URLS.backend}/search/topic`,
        {
          params: { query: searchValue },
        },
      );
      setResponseText(response.data.text);
      setState("success");
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data
          ? error.response.data.detail || "Une erreur est survenue"
          : "Une erreur est survenue";
      setResponseText(message);
      setState("error");
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        flex: 1,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        height: "100%",
        width: "100%",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          maxWidth: "80%",
          color: "primary.main",
          fontFamily: '"Lato", "Roboto", sans-serif',
          fontWeight: 700,
          lineHeight: 1.6,
        }}
      >
        Bonjour {user?.first_name}, naviguez librement vers les applications
        disponibles, ou tapez ci-dessous un sujet qui vous intéresse pour que
        nous l'explorions ensemble.
      </Typography>

      {state === "idle" || state === "loading" ? (
        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          onSearch={handleSearch}
          isLoading={state === "loading"}
          placeholder="Quel sujet souhaitez-vous explorer ?"
        />
      ) : (
        <Box
          sx={{
            width: "75%",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <SearchInput
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
            placeholder="Explorer un autre sujet..."
          />
          <MarkdownRenderer>{responseText}</MarkdownRenderer>
        </Box>
      )}

      {state === "loading" && <LoadingSpinner />}
    </Box>
  );
};
