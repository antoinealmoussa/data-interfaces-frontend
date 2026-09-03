import { useNavigate, useParams } from "react-router-dom";
import RaceView from "../../components/race-preparation/RaceView";

const RaceDetail = () => {
  const { raceId } = useParams<{ raceId: string }>();
  const navigate = useNavigate();

  if (!raceId || Number.isNaN(Number(raceId))) {
    return null;
  }

  return (
    <RaceView
      raceId={Number(raceId)}
      onBack={() => navigate("/race-preparation")}
      onDeleted={() => navigate("/race-preparation", { replace: true })}
    />
  );
};

export default RaceDetail;
