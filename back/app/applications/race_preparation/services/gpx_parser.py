import gpxpy
import gpxpy.gpx


def parse_gpx(file_content: str) -> dict:
    """Parse un fichier GPX et retourne les track_points avec distance cumulative.

    Returns:
        dict avec 'metadata' (name, total_distance, total_elevation_gain,
        total_elevation_loss, num_points) et 'track_points' (list de dict
        avec lat, lon, elevation, distance).
    """
    gpx = gpxpy.parse(file_content)

    track_points: list[dict] = []
    total_distance = 0.0
    total_elevation_gain = 0.0
    total_elevation_loss = 0.0
    point_index = 0

    for track in gpx.tracks:
        for segment in track.segments:
            prev_point = None
            for point in segment.points:
                elevation = point.elevation if point.elevation is not None else 0.0

                if prev_point is not None:
                    dist = _haversine(
                        prev_point.latitude, prev_point.longitude,
                        point.latitude, point.longitude,
                    )
                    total_distance += dist

                    ele_diff = elevation - (prev_point.elevation or 0.0)
                    if ele_diff > 0:
                        total_elevation_gain += ele_diff
                    else:
                        total_elevation_loss += abs(ele_diff)

                track_points.append({
                    "lat": point.latitude,
                    "lon": point.longitude,
                    "elevation": elevation,
                    "distance": total_distance,
                })

                prev_point = point
                point_index += 1

    name = ""
    if gpx.name:
        name = gpx.name
    elif gpx.tracks:
        name = gpx.tracks[0].name or ""

    return {
        "metadata": {
            "name": name,
            "total_distance": total_distance,
            "total_elevation_gain": total_elevation_gain,
            "total_elevation_loss": total_elevation_loss,
            "num_points": point_index,
        },
        "track_points": track_points,
    }


def compute_sections(
    track_points: list[dict],
    boundaries: list[dict],
) -> list[dict]:
    """Calcule les caractéristiques de chaque section à partir des bornes.

    Args:
        track_points: liste de dict avec 'lat', 'lon', 'elevation', 'distance'.
        boundaries: liste de dict avec 'start_distance' et 'end_distance'.

    Returns:
        Liste de dict avec section_type, start_distance, end_distance,
        distance, elevation_gain, elevation_loss, average_gradient,
        start_elevation, end_elevation.
    """
    if not track_points:
        return []

    sections: list[dict] = []
    for boundary in boundaries:
        start_dist = boundary["start_distance"]
        end_dist = boundary["end_distance"]

        elev_start = _interpolate_elevation(track_points, start_dist)
        elev_end = _interpolate_elevation(track_points, end_dist)

        inner_points = _get_points_strictly_in_range(track_points, start_dist, end_dist)

        pts: list[dict] = []
        start_pt = _interpolate_point(track_points, start_dist)
        if start_pt is not None:
            pts.append(start_pt)
        pts.extend(inner_points)
        end_pt = _interpolate_point(track_points, end_dist)
        if end_pt is not None:
            pts.append(end_pt)

        distance = 0.0
        elevation_gain = 0.0
        elevation_loss = 0.0

        for i in range(1, len(pts)):
            p1 = pts[i - 1]
            p2 = pts[i]

            dist = _haversine(p1["lat"], p1["lon"], p2["lat"], p2["lon"])
            distance += dist

            ele_diff = p2["elevation"] - p1["elevation"]
            if ele_diff > 0:
                elevation_gain += ele_diff
            else:
                elevation_loss += abs(ele_diff)

        average_gradient = 0.0
        if distance > 0:
            average_gradient = (elev_end - elev_start) / distance * 100

        section_type = _classify_section(elev_start, elev_end)

        sections.append({
            "section_type": section_type,
            "start_distance": start_dist,
            "end_distance": end_dist,
            "distance": distance,
            "elevation_gain": elevation_gain,
            "elevation_loss": elevation_loss,
            "average_gradient": average_gradient,
            "start_elevation": elev_start,
            "end_elevation": elev_end,
        })

    return sections


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcule la distance en mètres entre deux points GPS."""
    import math

    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _get_points_strictly_in_range(
    track_points: list[dict],
    start_distance: float,
    end_distance: float,
) -> list[dict]:
    """Retourne les track points strictement dans (start_distance, end_distance)."""
    result: list[dict] = []
    for tp in track_points:
        if tp["distance"] > start_distance and tp["distance"] < end_distance:
            result.append(tp)
    return result


def _interpolate_point(track_points: list[dict], target_distance: float) -> dict | None:
    """Interpole un point complet (lat, lon, elevation) à une distance donnée."""
    if not track_points:
        return None

    if target_distance <= track_points[0]["distance"]:
        tp = track_points[0]
        return {
            "lat": tp["lat"],
            "lon": tp["lon"],
            "elevation": tp["elevation"],
            "distance": target_distance,
        }

    if target_distance >= track_points[-1]["distance"]:
        tp = track_points[-1]
        return {
            "lat": tp["lat"],
            "lon": tp["lon"],
            "elevation": tp["elevation"],
            "distance": target_distance,
        }

    for i in range(1, len(track_points)):
        p1 = track_points[i - 1]
        p2 = track_points[i]

        if p1["distance"] <= target_distance <= p2["distance"]:
            seg_dist = p2["distance"] - p1["distance"]
            if seg_dist == 0:
                return {
                    "lat": p1["lat"],
                    "lon": p1["lon"],
                    "elevation": p1["elevation"],
                    "distance": target_distance,
                }

            ratio = (target_distance - p1["distance"]) / seg_dist
            lat = p1["lat"] + ratio * (p2["lat"] - p1["lat"])
            lon = p1["lon"] + ratio * (p2["lon"] - p1["lon"])
            elevation = p1["elevation"] + ratio * (p2["elevation"] - p1["elevation"])
            return {"lat": lat, "lon": lon, "elevation": elevation, "distance": target_distance}

    tp = track_points[-1]
    return {
        "lat": tp["lat"],
        "lon": tp["lon"],
        "elevation": tp["elevation"],
        "distance": target_distance,
    }


def _interpolate_elevation(track_points: list[dict], target_distance: float) -> float:
    """Interpole l'altitude à une distance donnée."""
    if not track_points:
        return 0.0

    if target_distance <= track_points[0]["distance"]:
        return track_points[0]["elevation"]

    if target_distance >= track_points[-1]["distance"]:
        return track_points[-1]["elevation"]

    for i in range(1, len(track_points)):
        p1 = track_points[i - 1]
        p2 = track_points[i]

        if p1["distance"] <= target_distance <= p2["distance"]:
            if p2["distance"] - p1["distance"] == 0:
                return p1["elevation"]

            ratio = (target_distance - p1["distance"]) / (p2["distance"] - p1["distance"])
            return p1["elevation"] + ratio * (p2["elevation"] - p1["elevation"])

    return track_points[-1]["elevation"]


def _classify_section(elev_start: float, elev_end: float) -> str:
    """Détermine le type de section selon la variation d'élévation."""
    delta = elev_end - elev_start
    if delta > 20:
        return "climb"
    elif delta < -20:
        return "descent"
    return "flat"
