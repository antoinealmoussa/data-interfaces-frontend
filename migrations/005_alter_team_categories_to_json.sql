ALTER TABLE team ALTER COLUMN categories TYPE JSON USING to_json(categories);
