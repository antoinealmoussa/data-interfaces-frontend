from app.core.security import hash_password, verify_password


def test_hash_password_returns_string():
    """Test que hash_password retourne une chaîne de caractères."""
    password = "test_password"
    hashed = hash_password(password)

    assert isinstance(hashed, str)
    assert len(hashed) > 0


def test_hash_password_different_salts():
    """Test que deux hashages du même mot de passe donnent des hashs différents."""
    password = "test_password"
    hashed1 = hash_password(password)
    hashed2 = hash_password(password)

    # Les hash doivent être différents car le salt est aléatoire
    assert hashed1 != hashed2


def test_verify_password_correct():
    """Test que verify_password retourne True pour un mot de passe correct."""
    password = "test_password"
    hashed = hash_password(password)

    assert verify_password(password, hashed) is True


def test_verify_password_incorrect():
    """Test que verify_password retourne False pour un mot de passe incorrect."""
    password = "test_password"
    wrong_password = "wrong_password"
    hashed = hash_password(password)

    assert verify_password(wrong_password, hashed) is False


def test_verify_password_empty_password():
    """Test la vérification avec un mot de passe vide."""
    password = ""
    hashed = hash_password(password)

    assert verify_password(password, hashed) is True
    assert verify_password("wrong", hashed) is False


def test_hash_password_unicode():
    """Test que hash_password fonctionne avec des caractères Unicode."""
    password = "mot_de_passe_émojis_🎉"
    hashed = hash_password(password)

    assert isinstance(hashed, str)
    assert verify_password(password, hashed) is True


def test_verify_password_case_sensitive():
    """Test que la vérification est sensible à la casse."""
    password = "TestPassword123"
    hashed = hash_password(password)

    assert verify_password("TestPassword123", hashed) is True
    assert verify_password("testpassword123", hashed) is False
    assert verify_password("TESTPASSWORD123", hashed) is False
