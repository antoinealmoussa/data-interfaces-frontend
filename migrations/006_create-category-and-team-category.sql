-- 1. Créer la table category
CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Créer la table team_category (jointure) avec CASCADE
CREATE TABLE team_category (
    team_id INTEGER NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES category(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, category_id)
);

-- 3. Ensemencer les 5 catégories fixes
INSERT INTO category (name) VALUES
    ('Mixte'),
    ('+35'),
    ('Open masculin'),
    ('Open féminin'),
    ('+50');

-- 4. Lier chaque équipe à ses catégories dans team_category
INSERT INTO team_category (team_id, category_id)
SELECT t.id, c.id
FROM team t
CROSS JOIN LATERAL json_array_elements_text(to_json(t.categories)) AS cat_name
JOIN category c ON c.name = cat_name;

-- 5. Supprimer l'ancienne colonne categories
ALTER TABLE team DROP COLUMN categories;
