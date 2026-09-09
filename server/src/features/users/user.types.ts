export interface UserRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  country_code: string;
  phone_number: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  createdAt: string;
}

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    countryCode: row.country_code,
    phoneNumber: row.phone_number,
    createdAt: row.created_at.toISOString(),
  };
}
