import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'genericmed-cdsco-jwt-key-2026';

export interface TokenPayload {
  userId: string;
  phone: string;
  role: 'PATIENT' | 'PHARMACIST' | 'DELIVERY_AGENT' | 'ADMIN';
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// In-memory OTP storage for demonstration (mobile verification)
const activeOtps = new Map<string, { otp: string; expiresAt: number }>();

/**
 * Generate and dispatch a 6-digit OTP to mobile phone
 */
export function generateOtp(phone: string): string {
  // Deterministic OTP for demo phones or random 6-digit
  const otp = phone.endsWith('0') || phone.endsWith('1') || phone.endsWith('2') || phone.endsWith('3')
    ? '489201'
    : Math.floor(100000 + Math.random() * 900000).toString();

  activeOtps.set(phone, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minute expiry
  });

  return otp;
}

/**
 * Verify submitted OTP and issue JWT
 */
export async function verifyOtpAndLogin(phone: string, submittedOtp: string, preferredRole?: string) {
  const stored = activeOtps.get(phone);
  
  // Accept valid stored OTP or universal master test OTP '489201' for testing
  const isValid = (stored && stored.otp === submittedOtp && stored.expiresAt > Date.now()) || submittedOtp === '489201';
  if (!isValid) {
    throw new Error('Invalid or expired OTP code.');
  }

  // Find or create User record in database
  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
        name: preferredRole === 'PHARMACIST' ? 'Registered Pharmacist' : 'Verified Patient',
        role: preferredRole || 'PATIENT',
        address: '#402 Palm Grove, 12th Main Indiranagar, Bengaluru 560038',
      },
    });
  }

  const payload: TokenPayload = {
    userId: user.id,
    phone: user.phone,
    role: user.role as TokenPayload['role'],
    name: user.name,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  activeOtps.delete(phone);

  return { token, user };
}

/**
 * Express Middleware: Authenticate Bearer JWT
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // For seamless demo usability, assign default Patient guest context if no token provided
    req.user = {
      userId: 'usr-patient-demo',
      phone: '+919876543210',
      role: 'PATIENT',
      name: 'Rahul Sharma (Patient)',
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
}

/**
 * Express Middleware: Role-Based Access Control (RBAC)
 */
export function requireRole(allowedRoles: Array<TokenPayload['role']>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access Denied: Insufficient clinical or administrative privileges.',
        requiredRoles: allowedRoles,
        currentRole: req.user?.role || 'NONE',
      });
    }
    next();
  };
}

/**
 * Audit Logger: Mandatory CDSCO Schedule H1 and prescription access trail
 */
export async function logCdscoAudit(
  action: string,
  details: string,
  userId?: string,
  ipAddress?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        details,
        userId: userId || null,
        ipAddress: ipAddress || '127.0.0.1',
      },
    });
  } catch (err) {
    console.error('[CDSCO Audit] Failed to record audit log:', err);
  }
}
