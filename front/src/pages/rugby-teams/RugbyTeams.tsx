import { Box, Typography } from "@mui/material";
import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { teamApi } from "../../api/teamApi";
import { RugbyTeamsSidebar } from "../../components/rugby-teams/RugbyTeamsSidebar";

export const RugbyTeams = () => {
  const [hasTeams, setHasTeams] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUserTeams = async () => {
      try {
        const result = await teamApi.hasTeams();
        setHasTeams(result);

        // Si pas d'équipes, rediriger vers la création
        if (!result && !location.pathname.includes("first-team-creation")) {
          navigate("/rugby-teams/first-team-creation");
        } else if (result) {
          // Charger les équipes
          const teamsRes = await teamApi.getAll();

          // Si on est sur la page principale, rediriger vers la première équipe et la saison la plus récente
          if (
            location.pathname === "/rugby-teams" ||
            location.pathname === "/rugby-teams/"
          ) {
            if (teamsRes.data.length > 0) {
              const firstTeam = teamsRes.data[0];
              const mostRecentSeason = firstTeam.seasons.sort((a, b) =>
                b.name.localeCompare(a.name),
              )[0];
              if (mostRecentSeason) {
                navigate(
                  `/rugby-teams/${firstTeam.id}/${mostRecentSeason.id}/team-management`,
                );
              }
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des équipes:", error);
        setHasTeams(false);
      }
    };
    checkUserTeams();
  }, [navigate, location.pathname]);

  if (hasTeams === null) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", height: "100%", width: "100%" }}>
      <RugbyTeamsSidebar />
      <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
        <Outlet />
      </Box>
    </Box>
  );
};
