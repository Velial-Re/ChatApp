-- Создаем пользователя, если не существует
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres') THEN
    CREATE ROLE postgres WITH LOGIN PASSWORD 'postgres' SUPERUSER;
  ELSE
    ALTER ROLE postgres WITH PASSWORD 'postgres';
  END IF;
END $$;

-- Создаем БД, если не существует
SELECT 'CREATE DATABASE chat OWNER postgres'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'chat')\gexec

-- Даем права
GRANT ALL PRIVILEGES ON DATABASE chat TO postgres;