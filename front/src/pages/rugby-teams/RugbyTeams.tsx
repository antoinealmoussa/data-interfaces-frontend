import { Box } from "@mui/material";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
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
    if (location.state?.teamCreated) {
      window.history.replaceState({}, "");
      setHasTeams(true);
      return;
    }

    const checkUserTeams = async () => {
      try {
        const result = await teamApi.hasTeams();
        setHasTeams(result);

        if (!result && !location.pathname.includes("team-creation")) {
          navigate("/rugby-teams/team-creation");
        } else if (result) {
          const teamsRes = await teamApi.getAll();

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
                  `/rugby-teams/${encodeURIComponent(firstTeam.name)}/${encodeURIComponent(mostRecentSeason.name)}/team-management`,
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
  }, [navigate, location.pathname, location.state]);

  if (hasTeams === null) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <LoadingSpinner />
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
