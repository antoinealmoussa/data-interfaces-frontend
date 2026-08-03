from fastapi import status

from app.models.application_access_request import ApplicationAccessRequest
from app.schemas.user import ApiCreateUser
from app.services import user_service


def _create_user_with_request(db, email: str, app_names: list[str]):
    user_in = ApiCreateUser(
        email=email,
        password="password123",
        first_name="Request",
        surname="User",
    )
    user = user_service.create_user(db, user_in=user_in, applications=app_names)
    return user


def test_list_requests_requires_auth(client):
    response = client.get("/api/v1/application-access-requests")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_list_requests_forbidden_for_normal_user(authenticated_client):
    response = authenticated_client.get("/api/v1/application-access-requests")

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_list_requests_admin(admin_client, db_session):
    _create_user_with_request(db_session, "request@test.com", ["rugby-teams"])

    response = admin_client.get("/api/v1/application-access-requests")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    request = data[0]
    assert request["status"] == "pending"
    assert request["user"]["email"] == "request@test.com"
    assert {app["name"] for app in request["applications"]} == {"rugby-teams"}


def test_approve_grants_access(admin_client, db_session):
    user = _create_user_with_request(db_session, "approve@test.com", ["rugby-teams"])
    assert user.applications == []

    request = (
        db_session.query(ApplicationAccessRequest)
        .filter(ApplicationAccessRequest.user_id == user.id)
        .first()
    )

    response = admin_client.put(
        f"/api/v1/application-access-requests/{request.id}",
        json={"applications": ["rugby-teams"]},
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "approved"
    assert {app["name"] for app in response.json()["applications"]} == {"rugby-teams"}

    db_session.refresh(user)
    assert {app.name for app in user.applications} == {"rugby-teams"}


def test_approve_modified_selection(admin_client, db_session):
    user = _create_user_with_request(
        db_session, "modified@test.com", ["rugby-teams", "bike-exploration"]
    )
    request = (
        db_session.query(ApplicationAccessRequest)
        .filter(ApplicationAccessRequest.user_id == user.id)
        .first()
    )

    response = admin_client.put(
        f"/api/v1/application-access-requests/{request.id}",
        json={"applications": ["bike-exploration"]},
    )

    assert response.status_code == status.HTTP_200_OK
    assert {app["name"] for app in response.json()["applications"]} == {
        "bike-exploration"
    }

    db_session.refresh(user)
    assert {app.name for app in user.applications} == {"bike-exploration"}


def test_approve_empty_selection(admin_client, db_session):
    user = _create_user_with_request(db_session, "empty@test.com", ["rugby-teams"])
    request = (
        db_session.query(ApplicationAccessRequest)
        .filter(ApplicationAccessRequest.user_id == user.id)
        .first()
    )

    response = admin_client.put(
        f"/api/v1/application-access-requests/{request.id}",
        json={"applications": []},
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "approved"
    assert response.json()["applications"] == []

    db_session.refresh(user)
    assert user.applications == []


def test_approve_unknown_application(admin_client, db_session):
    user = _create_user_with_request(db_session, "unknown@test.com", ["rugby-teams"])
    request = (
        db_session.query(ApplicationAccessRequest)
        .filter(ApplicationAccessRequest.user_id == user.id)
        .first()
    )

    response = admin_client.put(
        f"/api/v1/application-access-requests/{request.id}",
        json={"applications": ["does-not-exist"]},
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_approve_request_not_found(admin_client):
    response = admin_client.put(
        "/api/v1/application-access-requests/99999",
        json={"applications": ["rugby-teams"]},
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_approve_already_approved(admin_client, db_session):
    user = _create_user_with_request(db_session, "twice@test.com", ["rugby-teams"])
    request = (
        db_session.query(ApplicationAccessRequest)
        .filter(ApplicationAccessRequest.user_id == user.id)
        .first()
    )
    url = f"/api/v1/application-access-requests/{request.id}"
    payload = {"applications": ["rugby-teams"]}

    first = admin_client.put(url, json=payload)
    assert first.status_code == status.HTTP_200_OK

    second = admin_client.put(url, json=payload)
    assert second.status_code == status.HTTP_400_BAD_REQUEST


def test_approve_forbidden_for_normal_user(authenticated_client, db_session):
    user = _create_user_with_request(db_session, "normal@test.com", ["rugby-teams"])
    request = (
        db_session.query(ApplicationAccessRequest)
        .filter(ApplicationAccessRequest.user_id == user.id)
        .first()
    )

    response = authenticated_client.put(
        f"/api/v1/application-access-requests/{request.id}",
        json={"applications": ["rugby-teams"]},
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
