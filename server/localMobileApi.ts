/**
 * REST routes expected by planepool-mobile, active only in NODE_ENV=development.
 * In-memory users + JWT — for local dev only. Do not enable in production.
 */
import type { Express, NextFunction, Request, Response } from "express";
import { Router } from "express";
import { SignJWT, jwtVerify } from "jose";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { nanoid } from "nanoid";
import { ENV } from "./_core/env";

type KycStatus = "pending" | "verified" | "rejected";

type LocalUser = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phoneNumber?: string;
  profileImage?: string;
  kycStatus: KycStatus;
  trustScore: number;
};

const usersById = new Map<string, LocalUser>();
const userIdByEmail = new Map<string, string>();

const ALLOWED_ORIGIN =
  /^(https?:\/\/)(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$/i;

function devCors(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin as string | undefined;
  if (origin && (ALLOWED_ORIGIN.test(origin) || origin.includes("exp.direct"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  }
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  try {
    const h = scryptSync(password, salt, 64).toString("hex");
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(h, "hex"));
  } catch {
    return false;
  }
}

function jwtSecretKey() {
  const raw = ENV.cookieSecret || "local-dev-only-set-JWT_SECRET-32chars-min";
  return new TextEncoder().encode(raw.padEnd(32, "0").slice(0, 64));
}

function toPublicUser(u: LocalUser) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    phoneNumber: u.phoneNumber,
    profileImage: u.profileImage,
    kycStatus: u.kycStatus,
    trustScore: u.trustScore,
  };
}

async function signPair(user: LocalUser) {
  const secret = jwtSecretKey();
  const accessToken = await new SignJWT({ email: user.email, typ: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);

  const refreshToken = await new SignJWT({ email: user.email, typ: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  return { accessToken, refreshToken };
}

async function verifyBearer(req: Request): Promise<LocalUser | null> {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return null;
  const token = h.slice(7);
  try {
    const { payload } = await jwtVerify(token, jwtSecretKey(), { algorithms: ["HS256"] });
    if (payload.typ !== "access" || typeof payload.sub !== "string") return null;
    return usersById.get(payload.sub) ?? null;
  } catch {
    return null;
  }
}

export function registerLocalMobileApi(app: Express) {
  if (process.env.NODE_ENV !== "development") return;

  app.use(devCors);

  const router = Router();

  router.post("/auth/signup", async (req, res) => {
    const { email, password, name } = req.body ?? {};
    if (!email || !password || !name) {
      res.status(400).json({ error: "email, password, and name are required" });
      return;
    }
    const key = String(email).toLowerCase();
    if (userIdByEmail.has(key)) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    const id = nanoid();
    const user: LocalUser = {
      id,
      email: String(email),
      passwordHash: hashPassword(String(password)),
      name: String(name),
      kycStatus: "pending",
      trustScore: 100,
    };
    usersById.set(id, user);
    userIdByEmail.set(key, id);
    const tokens = await signPair(user);
    res.json(tokens);
  });

  router.post("/auth/login", async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }
    const id = userIdByEmail.get(String(email).toLowerCase());
    const user = id ? usersById.get(id) : undefined;
    if (!user || !verifyPassword(String(password), user.passwordHash)) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    res.json(await signPair(user));
  });

  router.post("/auth/refresh", async (req, res) => {
    const { refreshToken } = req.body ?? {};
    if (!refreshToken) {
      res.status(400).json({ error: "refreshToken is required" });
      return;
    }
    try {
      const { payload } = await jwtVerify(String(refreshToken), jwtSecretKey(), {
        algorithms: ["HS256"],
      });
      if (payload.typ !== "refresh" || typeof payload.sub !== "string") {
        res.status(401).json({ error: "Invalid refresh token" });
        return;
      }
      const user = usersById.get(payload.sub);
      if (!user) {
        res.status(401).json({ error: "Invalid refresh token" });
        return;
      }
      res.json(await signPair(user));
    } catch {
      res.status(401).json({ error: "Invalid refresh token" });
    }
  });

  router.post("/auth/logout", (_req, res) => {
    res.status(204).end();
  });

  router.post("/auth/verify-phone", (_req, res) => {
    res.json({ message: "Local dev: OTP not sent; use any 6 digits in confirm-otp" });
  });

  router.post("/auth/confirm-otp", async (req, res) => {
    const { phoneNumber, otp } = req.body ?? {};
    if (!phoneNumber || !otp) {
      res.status(400).json({ error: "phoneNumber and otp are required" });
      return;
    }
    const key = `phone:${String(phoneNumber)}`;
    let id = userIdByEmail.get(key);
    let user = id ? usersById.get(id) : undefined;
    if (!user) {
      id = nanoid();
      user = {
        id,
        email: `${String(phoneNumber).replace(/\W/g, "")}@local.dev`,
        passwordHash: hashPassword(nanoid()),
        name: "Phone user",
        phoneNumber: String(phoneNumber),
        kycStatus: "pending",
        trustScore: 100,
      };
      usersById.set(id, user);
      userIdByEmail.set(key, id);
    }
    res.json(await signPair(user!));
  });

  router.get("/users/profile", async (req, res) => {
    const user = await verifyBearer(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.json(toPublicUser(user));
  });

  router.put("/users/profile", async (req, res) => {
    const user = await verifyBearer(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const { name, email, phoneNumber, profileImage } = req.body ?? {};
    if (name !== undefined) user.name = String(name);
    if (email !== undefined) {
      const newKey = String(email).toLowerCase();
      const existing = userIdByEmail.get(newKey);
      if (existing && existing !== user.id) {
        res.status(409).json({ error: "Email already in use" });
        return;
      }
      const oldKey = user.email.toLowerCase();
      userIdByEmail.delete(oldKey);
      user.email = String(email);
      userIdByEmail.set(newKey, user.id);
    }
    if (phoneNumber !== undefined) user.phoneNumber = String(phoneNumber);
    if (profileImage !== undefined) user.profileImage = String(profileImage);
    usersById.set(user.id, user);
    res.json(toPublicUser(user));
  });

  // --- Stubs so other screens do not hard-fail in local dev ---
  router.get("/kyc/status", async (req, res) => {
    const user = await verifyBearer(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    res.json({ status: user.kycStatus, documents: [] });
  });

  router.post("/kyc/upload", (req, res) => {
    if (typeof (req as NodeJS.ReadableStream).resume === "function") {
      (req as NodeJS.ReadableStream).resume();
    }
    res.json({ success: true, status: "pending" });
  });

  router.get("/rides/destinations", async (req, res) => {
    if (!(await verifyBearer(req))) return res.status(401).json({ error: "Unauthorized" });
    res.json([
      { id: "d1", name: "City center / downtown", category: "popular", distance: "~20 km", icon: "🏙️" },
      { id: "d2", name: "Airport hotels", category: "popular", distance: "~8 km", icon: "🏨" },
      { id: "d3", name: "Train station", category: "transit", distance: "~15 km", icon: "🚆" },
      { id: "d4", name: "Conference center", category: "events", distance: "~12 km", icon: "🏢" },
      { id: "d5", name: "Shopping district", category: "leisure", distance: "~10 km", icon: "🛍️" },
      { id: "d6", name: "Business district", category: "work", distance: "~18 km", icon: "💼" },
    ]);
  });

  router.post("/rides/select-destination", async (req, res) => {
    if (!(await verifyBearer(req))) return res.status(401).json({ error: "Unauthorized" });
    res.json({ success: true });
  });

  router.get("/rides/groups/:flightId", async (req, res) => {
    if (!(await verifyBearer(req))) return res.status(401).json({ error: "Unauthorized" });
    res.json([]);
  });

  router.post("/rides/groups/:groupId/join", async (req, res) => {
    if (!(await verifyBearer(req))) return res.status(401).json({ error: "Unauthorized" });
    res.json({ success: true });
  });

  router.post("/rides/groups/:groupId/leave", async (req, res) => {
    if (!(await verifyBearer(req))) return res.status(401).json({ error: "Unauthorized" });
    res.json({ success: true });
  });

  router.post("/chat/groups/:groupId/messages", async (req, res) => {
    if (!(await verifyBearer(req))) return res.status(401).json({ error: "Unauthorized" });
    res.json({ success: true });
  });

  router.get("/chat/groups/:groupId/messages", async (req, res) => {
    if (!(await verifyBearer(req))) return res.status(401).json({ error: "Unauthorized" });
    res.json([]);
  });

  router.get("/notifications", async (req, res) => {
    if (!(await verifyBearer(req))) return res.status(401).json({ error: "Unauthorized" });
    res.json([]);
  });

  router.put("/notifications/:_id/read", async (req, res) => {
    if (!(await verifyBearer(req))) return res.status(401).json({ error: "Unauthorized" });
    res.json({ success: true });
  });

  router.post("/analytics/events", (_req, res) => {
    res.status(204).end();
  });

  app.use(router);

  console.log(
    "[LocalMobileApi] Dev REST API mounted (in-memory auth). Mobile should use http://localhost:<port> in __DEV__."
  );
}
