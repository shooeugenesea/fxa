ALTER TABLE refreshTokens DROP COLUMN email;
ALTER TABLE tokens DROP COLUMN email;
ALTER TABLE codes DROP COLUMN email;

UPDATE dbMetadata SET value = '29' WHERE name = 'schema-patch-level';
