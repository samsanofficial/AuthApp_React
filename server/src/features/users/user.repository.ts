import { query } from '../../shared/db/pool';
import type { UserRow } from './user.types';

const USER_COLUMNS = `
  id, first_name, last_name, email, country_code, phone_number,
  password_hash, created_at, updated_at
`;

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  passwordHash: string;
}

export async function findByEmail(email: string): Promise<UserRow | null> {
  const { rows } = await query<UserRow>(
    `SELECT ${USER_COLUMNS} FROM users WHERE lower(email) = lower($1) LIMIT 1`,
    [email],
  );
  return rows[0] ?? null;
}

export async function findById(id: string): Promise<UserRow | null> {
  const { rows } = await query<UserRow>(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function emailExists(email: string): Promise<boolean> {
  const { rowCount } = await query(`SELECT 1 FROM users WHERE lower(email) = lower($1) LIMIT 1`, [
    email,
  ]);
  return (rowCount ?? 0) > 0;
}

export async function createUser(input: CreateUserInput): Promise<UserRow> {
  const { rows } = await query<UserRow>(
    `INSERT INTO users (first_name, last_name, email, country_code, phone_number, password_hash)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${USER_COLUMNS}`,
    [
      input.firstName,
      input.lastName,
      input.email,
      input.countryCode,
      input.phoneNumber,
      input.passwordHash,
    ],
  );

  const user = rows[0];
  if (!user) throw new Error('User insert returned no row');
  return user;
}
