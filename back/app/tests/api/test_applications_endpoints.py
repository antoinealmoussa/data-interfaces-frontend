from fastapi import status

from app.models.application import Application


def test_list_applications_requires_auth(client):
    response = client.get("/api/v1/applications")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_list_applications(authenticated_client):
    response = authenticated_client.get("/api/v1/applications")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    names = {app["name"] for app in data}
    assert "rugby-teams" in names
    for app in data:
        assert set(app.keys()) == {"id", "name", "pretty_name"}


def test_list_my_applications_requires_auth(client):
    response = client.get("/api/v1/applications/user")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_list_my_applications(authenticated_client):
    response = authenticated_client.get("/api/v1/applications/user")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert any(app["name"] == "rugby-teams" for app in data)


def test_assign_application(authenticated_client, db_session, test_user):
    new_app = Application(name="bike-exploration", pretty_name="Bike Exploration")
    db_session.add(new_app)
    db_session.commit()
    db_session.refresh(new_app)

    response = authenticated_client.post(
        f"/api/v1/applications/users/{test_user.id}/applications/{new_app.id}"
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert any(app.id == new_app.id for app in test_user.applications)


def test_assign_application_already_assigned(
    authenticated_client, db_session, test_user
):
    app = (
        db_session.query(Application)
        .filter(Application.name == "rugby-teams")
        .first()
    )

    response = authenticated_client.post(
        f"/api/v1/applications/users/{test_user.id}/applications/{app.id}"
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert sum(1 for a in test_user.applications if a.id == app.id) == 1


def test_assign_application_user_not_found(authenticated_client, db_session):
    app = (
        db_session.query(Application)
        .filter(Application.name == "rugby-teams")
        .first()
    )

    response = authenticated_client.post(
        f"/api/v1/applications/users/99999/applications/{app.id}"
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_assign_application_app_not_found(authenticated_client, test_user):
    response = authenticated_client.post(
        f"/api/v1/applications/users/{test_user.id}/applications/99999"
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "application" in response.json()["detail"].lower()


def test_remove_application(authenticated_client, db_session, test_user):
    app = (
        db_session.query(Application)
        .filter(Application.name == "rugby-teams")
        .first()
    )

    response = authenticated_client.delete(
        f"/api/v1/applications/users/{test_user.id}/applications/{app.id}"
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert all(a.id != app.id for a in test_user.applications)


def test_remove_application_not_assigned(
    authenticated_client, db_session, test_user
):
    new_app = Application(name="bike-exploration", pretty_name="Bike Exploration")
    db_session.add(new_app)
    db_session.commit()
    db_session.refresh(new_app)

    response = authenticated_client.delete(
        f"/api/v1/applications/users/{test_user.id}/applications/{new_app.id}"
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert all(a.id != new_app.id for a in test_user.applications)


def test_remove_application_user_not_found(authenticated_client, db_session):
    app = (
        db_session.query(Application)
        .filter(Application.name == "rugby-teams")
        .first()
    )

    response = authenticated_client.delete(
        f"/api/v1/applications/users/99999/applications/{app.id}"
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_remove_application_app_not_found(authenticated_client, test_user):
    response = authenticated_client.delete(
        f"/api/v1/applications/users/{test_user.id}/applications/99999"
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "application" in response.json()["detail"].lower()


def test_remove_application_requires_auth(client):
    response = client.delete("/api/v1/applications/users/1/applications/1")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
