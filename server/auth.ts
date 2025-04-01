import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, InsertUser, UpdateUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  if (!stored) return false;
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Configure session
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'fraud-detection-app-secret',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password!))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Google Strategy (if configured)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
          scope: ["profile", "email"]
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists
            let user = await storage.getUserByProviderId("google", profile.id);
            
            if (!user) {
              // Create new user
              const email = profile.emails && profile.emails[0]?.value;
              
              // Check if user with this email already exists
              if (email) {
                const existingUser = await storage.getUserByEmail(email);
                if (existingUser) {
                  // Update existing user with Google info
                  user = await storage.updateUser(existingUser.id, {
                    authProvider: "google",
                    authProviderId: profile.id,
                    profilePicture: profile.photos?.[0]?.value
                  });
                  if (user) return done(null, user);
                }
              }

              // Create new user account
              user = await storage.createUser({
                username: profile.displayName || `user-${profile.id.substring(0, 8)}`,
                email: email,
                firstName: profile.name?.givenName,
                lastName: profile.name?.familyName,
                authProvider: "google",
                authProviderId: profile.id,
                profilePicture: profile.photos?.[0]?.value,
                role: "user"
              });
            }
            
            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  }

  // Serialize/deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      if (req.body.email) {
        const existingEmail = await storage.getUserByEmail(req.body.email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      // Create the user with hashed password
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        role: req.body.role || "user",
        authProvider: "local"
      });

      // Log in the user
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: SelectUser, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Authentication failed" });

      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(req.user);
  });

  // Google authentication routes
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get("/api/auth/google", passport.authenticate("google"));
    
    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", {
        failureRedirect: "/auth",
        successRedirect: "/"
      })
    );
  }

  // User settings and profile routes
  app.get("/api/user/settings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const settings = await storage.getUserSettings(req.user!.id);
    res.json(settings);
  });

  app.put("/api/user/settings", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const updatedSettings = await storage.updateUserSettings(req.user!.id, req.body);
      res.json(updatedSettings);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/user/profile", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const updates: UpdateUser = { ...req.body };
      
      // Hash password if it's being updated
      if (updates.password) {
        updates.password = await hashPassword(updates.password);
      }
      
      const updatedUser = await storage.updateUser(req.user!.id, updates);
      if (updatedUser) {
        req.login(updatedUser, (err) => {
          if (err) return next(err);
          res.json(updatedUser);
        });
      } else {
        res.status(500).json({ message: "Failed to update profile" });
      }
    } catch (error) {
      next(error);
    }
  });
}