import pytest
from pydantic import ValidationError

from app.schemas.player import ApiCreatePlayer


class TestPlayerNameValidator:
    def test_name_valid(self):
        player = ApiCreatePlayer(
            name="Jean Dupont",
            level=2,
            sex="H",
            position="Ailier",
            category_names=["Mixte"],
        )
        assert player.name == "Jean Dupont"

    def test_name_too_long(self):
        with pytest.raises(ValidationError) as exc:
            ApiCreatePlayer(
                name="A" * 101,
                level=2,
                sex="H",
                position="Ailier",
                category_names=["Mixte"],
            )
        assert "100 caractères" in str(exc.value)

    def test_name_empty(self):
        with pytest.raises(ValidationError) as exc:
            ApiCreatePlayer(
                name="",
                level=2,
                sex="H",
                position="Ailier",
                category_names=["Mixte"],
            )
        assert "obligatoire" in str(exc.value) or "nom" in str(exc.value).lower()

    def test_name_whitespace_only(self):
        with pytest.raises(ValidationError):
            ApiCreatePlayer(
                name="   ",
                level=2,
                sex="H",
                position="Ailier",
                category_names=["Mixte"],
            )


class TestPlayerLevelValidator:
    def test_level_valid(self):
        for lvl in [1, 2, 3, 4]:
            player = ApiCreatePlayer(
                name="Joueur",
                level=lvl,
                sex="H",
                position="Ailier",
                category_names=["Mixte"],
            )
            assert player.level == lvl

    def test_level_too_low(self):
        with pytest.raises(ValidationError):
            ApiCreatePlayer(
                name="Joueur",
                level=0,
                sex="H",
                position="Ailier",
                category_names=["Mixte"],
            )

    def test_level_too_high(self):
        with pytest.raises(ValidationError):
            ApiCreatePlayer(
                name="Joueur",
                level=5,
                sex="H",
                position="Ailier",
                category_names=["Mixte"],
            )


class TestPlayerSexValidator:
    def test_sex_valid_h(self):
        player = ApiCreatePlayer(
            name="Joueur",
            level=2,
            sex="H",
            position="Ailier",
            category_names=["Mixte"],
        )
        assert player.sex == "H"

    def test_sex_valid_f(self):
        player = ApiCreatePlayer(
            name="Joueuse",
            level=2,
            sex="F",
            position="Meneur",
            category_names=["+35"],
        )
        assert player.sex == "F"

    def test_sex_invalid(self):
        with pytest.raises(ValidationError):
            ApiCreatePlayer(
                name="Joueur",
                level=2,
                sex="X",
                position="Ailier",
                category_names=["Mixte"],
            )


class TestPlayerPositionValidator:
    def test_position_ailier(self):
        player = ApiCreatePlayer(
            name="Joueur",
            level=2,
            sex="H",
            position="Ailier",
            category_names=["Mixte"],
        )
        assert player.position == "Ailier"

    def test_position_meneur(self):
        player = ApiCreatePlayer(
            name="Joueur",
            level=2,
            sex="H",
            position="Meneur",
            category_names=["Mixte"],
        )
        assert player.position == "Meneur"

    def test_position_invalid(self):
        with pytest.raises(ValidationError):
            ApiCreatePlayer(
                name="Joueur",
                level=2,
                sex="H",
                position="Arrière",
                category_names=["Mixte"],
            )


class TestPlayerCategoryNamesValidator:
    def test_category_names_valid(self):
        player = ApiCreatePlayer(
            name="Joueur",
            level=2,
            sex="H",
            position="Ailier",
            category_names=["Mixte", "+35"],
        )
        assert player.category_names == ["Mixte", "+35"]

    def test_category_names_single(self):
        player = ApiCreatePlayer(
            name="Joueur",
            level=2,
            sex="H",
            position="Ailier",
            category_names=["Open masculin"],
        )
        assert player.category_names == ["Open masculin"]

    def test_category_names_empty(self):
        with pytest.raises(ValidationError) as exc:
            ApiCreatePlayer(
                name="Joueur",
                level=2,
                sex="H",
                position="Ailier",
                category_names=[],
            )
        assert "au moins une catégorie" in str(exc.value).lower()

    def test_category_names_none(self):
        with pytest.raises(ValidationError):
            ApiCreatePlayer(
                name="Joueur",
                level=2,
                sex="H",
                position="Ailier",
                category_names=None,
            )

    def test_category_names_invalid_value(self):
        with pytest.raises(ValidationError) as exc:
            ApiCreatePlayer(
                name="Joueur",
                level=2,
                sex="H",
                position="Ailier",
                category_names=["InvalidCategory"],
            )
        assert "invalide" in str(exc.value).lower()

    def test_category_names_partial_invalid(self):
        with pytest.raises(ValidationError) as exc:
            ApiCreatePlayer(
                name="Joueur",
                level=2,
                sex="H",
                position="Ailier",
                category_names=["Mixte", "Fausse catégorie"],
            )
        assert "invalide" in str(exc.value).lower()

    def test_category_names_all_valid(self):
        player = ApiCreatePlayer(
            name="Joueur",
            level=2,
            sex="H",
            position="Ailier",
            category_names=["Mixte", "+35", "+50", "Open masculin", "Open féminin"],
        )
        assert len(player.category_names) == 5
