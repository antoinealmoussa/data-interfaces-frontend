-- 1. Creer la table de jointure player_category
CREATE TABLE player_category (
    player_id INTEGER NOT NULL REFERENCES player(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES category(id) ON DELETE RESTRICT,
    PRIMARY KEY (player_id, category_id)
);

-- 2. Copier les donnees existantes (un seul category_id par joueur)
INSERT INTO player_category (player_id, category_id)
SELECT id, category_id FROM player;

-- 3. Supprimer l'ancienne colonne et la FK
ALTER TABLE player DROP COLUMN category_id;
