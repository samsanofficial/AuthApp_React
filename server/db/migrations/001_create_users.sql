CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    VARCHAR(80)  NOT NULL,
  last_name     VARCHAR(80)  NOT NULL,
  email         VARCHAR(255) NOT NULL,
  country_code  CHAR(2)      NOT NULL,
  phone_number  VARCHAR(20)  NOT NULL,
  password_hash TEXT         NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT users_first_name_not_blank CHECK (length(btrim(first_name)) > 0),
  CONSTRAINT users_last_name_not_blank  CHECK (length(btrim(last_name)) > 0),
  CONSTRAINT users_email_format         CHECK (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  CONSTRAINT users_country_code_format  CHECK (country_code ~ '^[A-Z]{2}$'),
  CONSTRAINT users_phone_format         CHECK (phone_number ~ '^\+?[0-9]{6,19}$')
);

-- Email uniqueness is case-insensitive: Sam@x.com and sam@x.com are the same account.
CREATE UNIQUE INDEX users_email_lower_key ON users (lower(email));

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
