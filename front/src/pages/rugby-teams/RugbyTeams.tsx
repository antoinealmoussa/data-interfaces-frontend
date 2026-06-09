import { Box } from "@mui/material";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTeamAndSeason } from "../../hooks/useTeamAndSeason";
import { RugbyTeamsSidebar } from "../../components/rugby-teams/RugbyTeamsSidebar";

export const RugbyTeams = () => {
  const { teams, loading, refetch } = useTeamAndSeason();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.teamCreated) {
      window.history.replaceState({}, "");
      refetch();
      return;
    }

    if (loading) return;

    if (teams.length === 0 && !location.pathname.includes("team-creation")) {
      navigate("/rugby-teams/team-creation");
    } else if (teams.length > 0) {
      if (
        location.pathname === "/rugby-teams" ||
        location.pathname === "/rugby-teams/"
      ) {
        const firstTeam = teams[0];
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
  }, [teams, loading, navigate, location.pathname, location.state, refetch]);

  if (loading) {
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
