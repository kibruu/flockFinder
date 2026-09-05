import { cookies } from "next/headers";
import { db } from "./db";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "flockfinder_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const DEMO_USERS = {
  elena: "elena@flockfinder.app",
  marcus: "marcus@flockfinder.app",
  maya: "maya@flockfinder.app",
} as const;

export type UserSession = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  vehicleModel: string | null;
  vehicleSeats: number | null;
  badges: string[];
  createdAt: string;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await db.session.create({
    data: {
      id: sessionToken,
      userId,
      expiresAt,
    },
  });

  return sessionToken;
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionToken) return null;

  const session = await db.session.findUnique({
    where: { id: sessionToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await db.session.delete({ where: { id: sessionToken } });
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    avatarUrl: session.user.avatarUrl,
    bio: session.user.bio,
    city: session.user.city,
    vehicleModel: session.user.vehicleModel,
    vehicleSeats: session.user.vehicleSeats,
    badges: parseStringArray(session.user.badges),
    createdAt: session.user.createdAt.toISOString(),
  };
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionToken) {
    await db.session.delete({ where: { id: sessionToken } }).catch(() => {});
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export async function switchDemoUser(demoName: keyof typeof DEMO_USERS): Promise<UserSession | null> {
  const email = DEMO_USERS[demoName];
  if (!email) return null;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) return null;

  const token = await createSession(user.id);
  await setSessionCookie(token);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    city: user.city,
    vehicleModel: user.vehicleModel,
    vehicleSeats: user.vehicleSeats,
    badges: parseStringArray(user.badges),
    createdAt: user.createdAt.toISOString(),
  };
}

export function getDemoUsers(): readonly string[] {
  return Object.keys(DEMO_USERS) as readonly (keyof typeof DEMO_USERS)[];
}

export function parseStringArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export async function getLifeListCount(userId: string): Promise<number> {
  const count = await db.sighting.groupBy({
    by: ["speciesId"],
    where: { userId },
    _count: true,
  });
  return count.length;
}