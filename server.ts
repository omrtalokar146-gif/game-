import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { config as loadEnv } from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

loadEnv();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "omy13456";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "om13456";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 4000);
import fs from "fs";

const DB_FOLDER = path.join(__dirname, "data");
const DB_PATH = path.join(DB_FOLDER, "db.json");

if (!fs.existsSync(DB_FOLDER)) {
  fs.mkdirSync(DB_FOLDER, { recursive: true });
}

const adapter = new JSONFile<{ users: Array<{ id: string; username: string; password: string; avatar: string; isAdmin?: boolean; role?: string }>; games: Array<any> }>(DB_PATH);
const db = new Low(adapter, { users: [], games: [] });
await db.read();
if (!db.data) {
  db.data = { users: [], games: [] };
  await db.write();
}
if (!db.data.games) {
  db.data.games = [];
  await db.write();
}

const cloudinaryConfig = process.env.CLOUDINARY_URL
  ? (() => {
      try {
        const parsedUrl = new URL(process.env.CLOUDINARY_URL);
        return {
          cloud_name: parsedUrl.hostname,
          api_key: parsedUrl.username,
          api_secret: parsedUrl.password,
        };
      } catch {
        return {
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
          api_key: process.env.CLOUDINARY_API_KEY || "",
          api_secret: process.env.CLOUDINARY_API_SECRET || "",
        };
      }
    })()
  : {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
      api_key: process.env.CLOUDINARY_API_KEY || "",
      api_secret: process.env.CLOUDINARY_API_SECRET || "",
    };

cloudinary.config(cloudinaryConfig);

console.log("Cloudinary config:", {
  cloudName: cloudinaryConfig.cloud_name || "(not set)",
  usingUrl: Boolean(process.env.CLOUDINARY_URL),
  hasApiKey: Boolean(cloudinaryConfig.api_key),
});

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const isCloudinaryUrl = (url: string) => url.includes("res.cloudinary.com") || url.includes("cloudinary.com");

const normalizeRemoteImageUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    if (
      parsedUrl.hostname === "upload.wikimedia.org" &&
      parsedUrl.pathname.startsWith("/wikipedia/commons/thumb/")
    ) {
      const segments = parsedUrl.pathname.split("/");
      if (segments.length >= 8) {
        // Convert Wikimedia thumbnail URLs into the direct original image URL.
        // Example: /wikipedia/commons/thumb/4/47/foo.png/200px-foo.png
        const normalizedSegments = [...segments];
        normalizedSegments.splice(3, 1); // remove "thumb"
        normalizedSegments.pop();
        return `${parsedUrl.protocol}//${parsedUrl.hostname}${normalizedSegments.join("/")}`;
      }
    }
  } catch {
    // Return the original URL if normalization fails.
  }

  return url;
};

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", environment: process.env.NODE_ENV || "development" });
});

const toDataUri = async (imageUrl: string) => {
  const response = await fetch(imageUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      Accept: "image/*,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Image fetch failed with ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "application/octet-stream";
  const buffer = Buffer.from(await response.arrayBuffer());
  const base64Data = buffer.toString("base64");
  return `data:${contentType};base64,${base64Data}`;
};

app.post("/api/upload", async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl || typeof imageUrl !== "string") {
    return res.status(400).json({ error: "imageUrl is required" });
  }

  const isCloudinaryConfigured = Boolean(
    cloudinaryConfig.cloud_name && cloudinaryConfig.api_key && cloudinaryConfig.api_secret
  );
  if (!isCloudinaryConfigured) {
    return res.status(500).json({ error: "Cloudinary credentials are not configured" });
  }

  const uploadOptions = {
    folder: process.env.CLOUDINARY_FOLDER || "vortex_profiles",
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  };

  const normalizedImageUrl = normalizeRemoteImageUrl(imageUrl);

  try {
    const uploadResult = await cloudinary.uploader.upload(normalizedImageUrl, uploadOptions);
    return res.json({ secureUrl: uploadResult.secure_url });
  } catch (primaryError) {
    console.warn(
      "Primary Cloudinary upload failed, retrying via server-side fetch:",
      primaryError,
      { originalUrl: imageUrl, normalizedUrl: normalizedImageUrl }
    );

    if (normalizedImageUrl.startsWith("http://") || normalizedImageUrl.startsWith("https://")) {
      try {
        const dataUri = await toDataUri(normalizedImageUrl);
        const uploadResult = await cloudinary.uploader.upload(dataUri, uploadOptions);
        return res.json({ secureUrl: uploadResult.secure_url });
      } catch (secondaryError) {
        console.error("Secondary Cloudinary upload via data URI failed:", secondaryError);
      }
    }

    console.error("Cloudinary upload error:", primaryError);
    return res.status(500).json({ error: "Failed to upload avatar to Cloudinary." });
  }
});

app.post("/api/auth/access", async (req, res) => {
  const { username, password, avatar } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }

  await db.read();
  const userList = db.data!.users;
  const normalizedUsername = username.trim().toLowerCase();
  const existing = userList.find((item) => item.username.toLowerCase() === normalizedUsername);
  const isAdminLogin = username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD;

  if (existing) {
    const passwordMatches = await bcrypt.compare(password, existing.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (isAdminLogin && !existing.isAdmin) {
      existing.isAdmin = true;
      existing.role = "admin";
      await db.write();
    }

    return res.json({
      id: existing.id,
      username: existing.username,
      avatar: existing.avatar,
      isAdmin: Boolean(existing.isAdmin),
      role: existing.role || (existing.username === ADMIN_USERNAME ? "admin" : "user"),
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  let avatarUrl = avatar && typeof avatar === "string" ? avatar : "";
  if (avatarUrl && !isCloudinaryUrl(avatarUrl)) {
    try {
      const result = await cloudinary.uploader.upload(avatarUrl, {
        folder: process.env.CLOUDINARY_FOLDER || "vortex_profiles",
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      });
      avatarUrl = result.secure_url;
    } catch (error) {
      console.warn("Avatar upload failed, saving raw URL instead:", error);
    }
  }

  const newUser = {
    id: `${Date.now()}`,
    username: username.trim(),
    password: passwordHash,
    avatar: avatarUrl || "",
    isAdmin: isAdminLogin,
    role: isAdminLogin ? "admin" : "user",
  };

  userList.push(newUser);
  await db.write();

  return res.json({
    id: newUser.id,
    username: newUser.username,
    avatar: newUser.avatar,
    isAdmin: newUser.isAdmin,
    role: newUser.role,
  });
});

app.get("/api/users", async (_req, res) => {
  await db.read();
  return res.json({ users: db.data!.users.map((user) => ({ id: user.id, username: user.username, avatar: user.avatar })) });
});

// Get all custom games
app.get("/api/games", async (_req, res) => {
  await db.read();
  const games = db.data!.games || [];
  return res.json({ games });
});

// Save/add a custom game
app.post("/api/games", async (req, res) => {
  const { game } = req.body;
  if (!game || !game.id) {
    return res.status(400).json({ error: "Game object with id is required" });
  }

  await db.read();
  if (!db.data!.games) {
    db.data!.games = [];
  }

  const games = db.data!.games;
  const index = games.findIndex((g: any) => g.id === game.id);
  if (index >= 0) {
    games[index] = game;
  } else {
    games.push(game);
  }

  await db.write();
  return res.json({ success: true, game });
});

// Delete a custom game
app.delete("/api/games/:gameId", async (req, res) => {
  const { gameId } = req.params;

  await db.read();
  if (!db.data!.games) {
    db.data!.games = [];
  }

  db.data!.games = db.data!.games.filter((g: any) => g.id !== gameId);
  await db.write();

  return res.json({ success: true });
});

app.get("/favicon.ico", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "favicon.ico"));
});

app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
