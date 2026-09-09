import type { Request, Response } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { loginSchema, refreshSchema, registerSchema } from './auth.schema';
import * as authService from './auth.service';

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);
  res.status(200).json(result);
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = refreshSchema.parse(req.body);
  const tokens = await authService.refresh(refreshToken);
  res.status(200).json({ tokens });
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = refreshSchema.parse(req.body);
  await authService.logout(refreshToken);
  res.status(204).send();
}

export async function createBiometricToken(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized('Authentication required');
  const refreshToken = await authService.createBiometricToken(req.user.id);
  res.status(201).json({ refreshToken });
}

export async function revokeBiometricToken(req: Request, res: Response) {
  const { refreshToken } = refreshSchema.parse(req.body);
  await authService.revokeBiometricToken(refreshToken);
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized('Authentication required');
  const user = await authService.getProfile(req.user.id);
  res.status(200).json({ user });
}
