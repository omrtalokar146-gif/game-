import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { playClickSound, playHoverSound, playSuccessSound } from "../utils/audio";
import { GameMetadata } from "../types";
import { saveCustomGame } from "../utils/gamesStorage";
import { 
  User, 
  Terminal, 
  Settings, 
  Plus, 
  Trash2, 
  Globe, 
  Gamepad2, 
  CheckCircle, 
  Sparkles, 
  Edit3, 
  Sliders, 
  Layers 
} from "lucide-react";

// Initial list of beautiful holographic avatar presets
interface GamerProfileProps {
  currentUser?: UserRecord | null;
  onUserChange?: (user: UserRecord | null) => void;
}

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=150&q=80"
];

type UserRecord = {
  id?: string;
  username: string;
  avatar: string;
  password?: string;
};

const CURRENT_USER_KEY = "vortex_current_user";

export function GamerProfile({ currentUser: currentUserProp, onUserChange }: GamerProfileProps) {
  // 1. Profile States
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem("vortex_profile_name") || "Gamer Om";
  });
  const [profilePic, setProfilePic] = useState(() => {
    return localStorage.getItem("vortex_profile_pic") || AVATAR_PRESETS[0];
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(profileName);
  const [customPicInput, setCustomPicInput] = useState("");

  const [currentUser, setCurrentUser] = useState<UserRecord | null>(() => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as UserRecord;
      } catch {
        return null;
      }
    }
    return currentUserProp || null;
  });
  const isAuthenticated = Boolean(currentUser);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [customLogo, setCustomLogo] = useState(() => {
    return localStorage.getItem("vortex_custom_logo") || "";
  });
  
  // 3. New Game Form States
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");
  const [themePreset, setThemePreset] = useState("purple"); // purple, cyan, emerald, orange
  const [featuresCsv, setFeaturesCsv] = useState("High-fps frame rates, Sandbox browser mechanics, Pure iframe rendering");
  const [imagePreview, setImagePreview] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [adminUsers, setAdminUsers] = useState<UserRecord[]>([]);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");

  const isAdmin = Boolean(
    currentUser?.isAdmin || currentUser?.username?.trim().toLowerCase() === "omy13456"
  );

  const triggerHover = () => playHoverSound();
  const triggerClick = () => playClickSound();

  useEffect(() => {
    if (currentUserProp) {
      setCurrentUser(currentUserProp);
    }
  }, [currentUserProp]);

  useEffect(() => {
    if (!currentUser) return;
    setProfileName(currentUser.username);
    setProfilePic(currentUser.avatar || AVATAR_PRESETS[0]);
  }, [currentUser]);

  useEffect(() => {
    if (!isAdmin || !isAdminPanelOpen) return;

    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) return;
        const data = await response.json();
        setAdminUsers(data.users || []);
      } catch (error) {
        console.warn("Failed to load user list for admin:", error);
      }
    };

    fetchUsers();
  }, [isAdmin, isAdminPanelOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        playSuccessSound();
      };
      reader.readAsDataURL(file);
    }
  };

  const LOCAL_USERS_KEY = "vortex_local_users";

  const getLocalUsers = (): Array<UserRecord & { password: string }> => {
    try {
      const stored = localStorage.getItem(LOCAL_USERS_KEY);
      if (stored) {
        return JSON.parse(stored) as Array<UserRecord & { password: string }>;
      }
    } catch {
      return [];
    }
    return [];
  };

  const saveLocalUser = (user: UserRecord & { password: string }) => {
    const users = getLocalUsers();
    const updated = users.filter((item) => item.username.toLowerCase() !== user.username.toLowerCase());
    updated.push(user);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(updated));
  };

  const uploadAvatar = async (avatarUrl: string) => {
    if (!avatarUrl || avatarUrl.includes("res.cloudinary.com")) {
      return avatarUrl;
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: avatarUrl }),
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${text}`);
      }

      const data = text ? JSON.parse(text) : {};
      return data.secureUrl || avatarUrl;
    } catch (error) {
      console.warn("Upload failed, using original avatar URL", error);
      return avatarUrl;
    }
  };

  const handleLocalAuth = async (username: string, password: string, avatar: string) => {
    const users = getLocalUsers();
    const existing = users.find((user) => user.username.toLowerCase() === username.toLowerCase());

    if (existing) {
      if (existing.password === password) {
        return {
          success: true,
          user: {
            id: existing.id,
            username: existing.username,
            avatar: existing.avatar,
            isAdmin: false,
            role: "user",
          },
        };
      }
      return { success: false, error: "Invalid username or password." };
    }

    const newUser = {
      id: `local-${Date.now()}`,
      username,
      avatar,
      password,
      role: "user",
    };
    saveLocalUser(newUser);

    return {
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        avatar: newUser.avatar,
        isAdmin: false,
        role: "user",
      },
    };
  };

  const syncCurrentUser = (user: UserRecord) => {
    setCurrentUser(user);
    onUserChange?.(user);
    setProfileName(user.username);
    setProfilePic(user.avatar || AVATAR_PRESETS[0]);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    localStorage.setItem("vortex_profile_name", user.username);
    localStorage.setItem("vortex_profile_pic", user.avatar || AVATAR_PRESETS[0]);
  };

  const handleAdminGameSubmit = () => {
    if (!iframeUrl.trim() || !title.trim() || !description.trim() || !coverImage.trim()) {
      setFormError("Please fill in the iframe link, title, description, and image URL.");
      setFormSuccess(false);
      return;
    }

    const newGame: GameMetadata = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      tagline: tagline.trim() || title.trim(),
      description: description.trim(),
      genre: genre.trim() || "Custom",
      themeColor: "rgb(168,85,247)",
      accentColor: "rgb(34,211,238)",
      borderColor: "rgb(168,85,247)",
      coverImage: coverImage.trim(),
      type: "custom",
      playerCount: 1,
      serverStatus: "ONLINE",
      features: featuresCsv.split(",").map((feature) => feature.trim()).filter(Boolean),
      releaseDate: new Date().toISOString().split("T")[0],
      platforms: ["Browser"],
      iframeUrl: iframeUrl.trim(),
    };

    saveCustomGame(newGame);
    setFormSuccess(true);
    setFormError("");
    setTitle("");
    setTagline("");
    setDescription("");
    setGenre("");
    setIframeUrl("");
    setCoverImage("");
    setFeaturesCsv("High-fps frame rates, Sandbox browser mechanics, Pure iframe rendering");

    window.dispatchEvent(new Event("vortex_games_updated"));
    setTimeout(() => setFormSuccess(false), 3500);
  };

  const handleLoginSubmit = async () => {
    const username = loginUsername.trim();
    const password = loginPassword.trim();
    if (!username || !password) {
      setLoginError("Username and password are required.");
      return;
    }

    setIsLoading(true);
    setLoginError("");
    let cloudinaryAvatar = customPicInput.trim() || selectedAvatar || AVATAR_PRESETS[0];

    try {
      const avatarSource = customPicInput.trim() || selectedAvatar || AVATAR_PRESETS[0];
      cloudinaryAvatar = await uploadAvatar(avatarSource);

      const response = await fetch("/api/auth/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          avatar: cloudinaryAvatar,
        }),
      });

      const text = await response.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: text };
      }
      if (!response.ok) {
        setLoginError(data.error || text || "Unable to sign in. Please try again.");
        setIsLoading(false);
        return;
      }

      const user = {
        id: data.id,
        username: data.username,
        avatar: data.avatar || cloudinaryAvatar,
        isAdmin: Boolean(data.isAdmin),
        role: data.role || (data.isAdmin ? "admin" : "user"),
      };

      syncCurrentUser(user);
      setLoginError("");
      setIsLoginOpen(false);
      setLoginUsername("");
      setLoginPassword("");
      setCustomPicInput("");
      setSelectedAvatar(AVATAR_PRESETS[0]);
    } catch (error) {
      console.warn("Login API failed, falling back to local auth:", error);
      const localAuth = await handleLocalAuth(username, password, cloudinaryAvatar);
      if (localAuth.success) {
        syncCurrentUser(localAuth.user);
        setLoginError("");
        setIsLoginOpen(false);
        setLoginUsername("");
        setLoginPassword("");
        setCustomPicInput("");
        setSelectedAvatar(AVATAR_PRESETS[0]);
      } else {
        setLoginError(localAuth.error || "Unexpected error during login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem("vortex_profile_name");
    localStorage.removeItem("vortex_profile_pic");
    setCurrentUser(null);
    onUserChange?.(null);
    setProfileName("Gamer Om");
    setProfilePic(AVATAR_PRESETS[0]);
    setLoginUsername("");
    setLoginPassword("");
    setSelectedAvatar(AVATAR_PRESETS[0]);
  };

  // Save profile edits
  const handleSaveProfile = () => {
    triggerClick();
    if (!nameInput.trim()) return;
    setProfileName(nameInput);
    localStorage.setItem("vortex_profile_name", nameInput);
    
    let finalPic = profilePic;
    if (customPicInput.trim() && (customPicInput.startsWith("http") || customPicInput.startsWith("/"))) {
      finalPic = customPicInput;
      setProfilePic(customPicInput);
      localStorage.setItem("vortex_profile_pic", customPicInput);
    }
    
    localStorage.setItem("vortex_profile_pic", finalPic);
    setIsEditingProfile(false);
    playSuccessSound();
  };

  const selectPresetPic = (url: string) => {
    triggerClick();
    setProfilePic(url);
    localStorage.setItem("vortex_profile_pic", url);
    setCustomPicInput("");
  };

  return (
    <section className="relative w-full py-20 px-4 md:px-8 max-w-4xl mx-auto" id="profile-section">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Hero Header */}
      <div className="text-center mb-12">
        <span className="font-mono text-xs text-purple-400 font-bold uppercase tracking-widest block mb-1">
          USER SECURE TERMINAL
        </span>
        <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight italic text-white uppercase">
          PILOT <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-rose-400">PROFILE</span>
        </h2>
      </div>

      {/* Section 1: Core User Card Profile (Name & DP) */}
      <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/[0.03] rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Glowing Display Picture Container */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-45 transition duration-500" />
            <div className="relative h-28 w-28 md:h-32 md:w-32 rounded-2xl border border-white/20 overflow-hidden bg-black flex items-center justify-center">
              {profilePic ? (
                <img 
                  src={profilePic} 
                  alt={profileName} 
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <User size={48} className="text-neutral-600 animate-pulse" />
              )}
              {/* Hologram scan lines effect */}
              <div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan-400/5 to-transparent bg-[size:100%_4px] pointer-events-none" />
            </div>
            {/* Online Status Dot */}
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-4 border-[#020205] shadow-[0_0_10px_rgba(16,185,129,0.5)] flex items-center justify-center" />
          </div>

          {/* Profile Name and Info Detail */}
          <div className="flex-grow text-center md:text-left">
            <AnimatePresence mode="wait">
            {!isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
                  <h3 className="text-2xl font-display font-black italic tracking-tight text-white uppercase">
                    PROFILE LOCKED
                  </h3>
                  <span className="md:mt-0 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-950/40 border border-purple-500/20 text-purple-300 uppercase tracking-widest w-max mx-auto md:mx-0">
                    SIGN IN FIRST
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono mt-1.5 uppercase tracking-wider">
                  No user profile is created until you sign in. Access the profile page only after authentication.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      triggerClick();
                      setIsLoginOpen(true);
                    }}
                    onMouseEnter={triggerHover}
                    className="inline-flex items-center gap-2 font-mono text-[10px] text-white bg-purple-600 hover:bg-purple-500 border border-transparent px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    USER LOGIN
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono text-center">
                  Once signed in, your profile card will appear here and you can customize it.
                </p>
              </motion.div>
            ) : !isEditingProfile ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
                  <h3 className="text-2xl font-display font-black italic tracking-tight text-white uppercase">
                    {profileName}
                  </h3>
                  <span className="md:mt-0 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-950/40 border border-purple-500/20 text-purple-300 uppercase tracking-widest w-max mx-auto md:mx-0">
                      VORTEX MASTER
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono mt-1.5 uppercase tracking-wider">
                  ROLE: CREATOR_DEVELOPER_NODE // ONLINE
                </p>
                
                <button
                  onClick={() => {
                    triggerClick();
                    setNameInput(profileName);
                    setIsEditingProfile(true);
                  }}
                  onMouseEnter={triggerHover}
                  className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] text-zinc-400 hover:text-white border border-white/10 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
                >
                  <Edit3 size={12} />
                  EDIT COGNITIVE PARAMETERS
                </button>

                <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      triggerClick();
                      setIsLoginOpen(true);
                    }}
                    onMouseEnter={triggerHover}
                    className="inline-flex items-center gap-2 font-mono text-[10px] text-white bg-purple-600 hover:bg-purple-500 border border-transparent px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    USER LOGIN
                  </button>
                  {currentUser && (
                    <button
                      type="button"
                      onClick={() => {
                        triggerClick();
                        handleSignOut();
                      }}
                      onMouseEnter={triggerHover}
                      className="inline-flex items-center gap-2 font-mono text-[10px] text-neutral-400 border border-white/10 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
                    >
                      SIGN OUT
                    </button>
                  )}
                </div>
                {currentUser && (
                  <>
                    <div className="mt-3 flex flex-wrap items-center gap-3 justify-center md:justify-start">
                      <p className="text-[10px] text-cyan-300 uppercase tracking-widest font-mono">
                        SIGNED_IN_AS: {currentUser.username}
                      </p>
                      {isAdmin && (
                        <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-[10px] uppercase tracking-[0.24em] font-semibold">
                          ADMIN ACCESS
                        </span>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="mt-4 flex flex-col items-center gap-3 md:items-start">
                        <button
                          type="button"
                          onClick={() => {
                            triggerClick();
                            setIsAdminPanelOpen((prev) => !prev);
                          }}
                          onMouseEnter={triggerHover}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-black font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-amber-400 transition"
                        >
                          {isAdminPanelOpen ? "HIDE ADMIN PANEL" : "OPEN ADMIN PANEL"}
                        </button>
                        <span className="text-[10px] uppercase tracking-widest text-amber-200 font-mono">
                          ADMIN PANEL BUTTON
                        </span>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4 max-w-md mx-auto md:mx-0"
              >
                  <div className="space-y-1.5 align-left text-left">
                    <label className="block font-mono text-[9px] text-neutral-500 uppercase tracking-widest">
                      CALIBRATE COGNITIVE_NAME:
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Enter explorer name..."
                      className="w-full bg-black/40 border border-white/10 focus:border-purple-400 rounded-xl p-2.5 text-xs text-white outline-none font-sans font-semibold"
                    />
                  </div>

                  {/* DP Selector Preset Grid */}
                  <div className="space-y-2 text-left">
                    <label className="block font-mono text-[9px] text-neutral-500 uppercase tracking-widest">
                      CHOOSE HOLOGRAM_PRESENTS:
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {AVATAR_PRESETS.map((preset, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectPresetPic(preset)}
                          className={`h-11 w-11 rounded-lg border overflow-hidden p-[1px] cursor-pointer transition-all ${
                            profilePic === preset ? "border-purple-400 scale-105" : "border-white/10 hover:border-white/25"
                          }`}
                        >
                          <img src={preset} alt="" className="h-full w-full object-cover rounded-md" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="block font-mono text-[9px] text-neutral-500 uppercase tracking-widest">
                      OR INPUT TARGET AVATAR_URL:
                    </label>
                    <input
                      type="text"
                      value={customPicInput}
                      onChange={(e) => setCustomPicInput(e.target.value)}
                      placeholder="https://images.unsplash.com/your-own-custom-pic"
                      className="w-full bg-black/40 border border-white/10 focus:border-purple-400 rounded-xl p-2.5 text-xs text-white placeholder-neutral-700 outline-none font-sans"
                    />
                  </div>

                  <div className="flex gap-2.5 pt-1 justify-center md:justify-start">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 text-[10px] font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition cursor-pointer"
                    >
                      COMMIT_CHANGES()
                    </button>
                    <button
                      onClick={() => {
                        triggerClick();
                        setIsEditingProfile(false);
                      }}
                      className="px-4 py-2 text-[10px] font-mono border border-white/10 hover:bg-white/5 text-neutral-400 rounded-xl transition cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {isAdmin && isAdminPanelOpen && (
        <div className="bg-black/70 border border-amber-500/20 p-6 rounded-3xl shadow-2xl backdrop-blur-xl mb-8">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-xl font-display font-black uppercase tracking-tight text-white">
                    ADMIN PANEL
                  </h3>
                  <p className="text-xs text-amber-200 uppercase tracking-widest font-mono mt-1">
                    Add new iframe games and review signed-in users.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdminPanelOpen(false)}
                  className="px-3 py-2 text-[10px] uppercase tracking-widest font-mono border border-white/10 rounded-xl text-white hover:bg-white/5 transition"
                >
                  CLOSE
                </button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-mono">IFRAME EMBED URL</label>
                  <input
                    type="text"
                    value={iframeUrl}
                    onChange={(e) => setIframeUrl(e.target.value)}
                    placeholder="https://example.com/embed/game"
                    className="w-full rounded-2xl border border-white/10 bg-[#0b0b13] px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-mono">TITLE</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Game title"
                    className="w-full rounded-2xl border border-white/10 bg-[#0b0b13] px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-mono">DESCRIPTION</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Short description"
                    className="w-full rounded-2xl border border-white/10 bg-[#0b0b13] px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-mono">IMAGE URL</label>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="Cover image link"
                    className="w-full rounded-2xl border border-white/10 bg-[#0b0b13] px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-mono">GENRE</label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="Game genre"
                    className="w-full rounded-2xl border border-white/10 bg-[#0b0b13] px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-mono">FEATURES (comma separated)</label>
                  <input
                    type="text"
                    value={featuresCsv}
                    onChange={(e) => setFeaturesCsv(e.target.value)}
                    placeholder="Enter features separated by commas"
                    className="w-full rounded-2xl border border-white/10 bg-[#0b0b13] px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                  />
                </div>
                {formError && (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-300 text-xs font-mono">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-200 text-xs font-mono">
                    Game uploaded successfully.
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleAdminGameSubmit}
                  className="w-full px-4 py-3 rounded-2xl bg-amber-500 text-black uppercase text-[10px] font-bold tracking-widest hover:bg-amber-400 transition"
                >
                  UPLOAD GAME
                </button>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-[#05050d] p-4">
                  <h4 className="text-sm uppercase tracking-[0.24em] text-neutral-400 font-mono mb-3">Recent Admin Users</h4>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {adminUsers.length > 0 ? (
                      adminUsers.map((user) => (
                        <div key={user.id || user.username} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{user.username}</p>
                            <p className="text-[10px] text-neutral-400 uppercase tracking-widest">{user.isAdmin ? "ADMIN" : "USER"}</p>
                          </div>
                          <div className="text-[10px] font-mono text-neutral-400 uppercase">{user.avatar ? "AVATAR" : "NO AVATAR"}</div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[12px] text-neutral-400">No users found yet.</p>
                    )}
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-[#05050d] p-4">
                  <h4 className="text-sm uppercase tracking-[0.24em] text-neutral-400 font-mono mb-3">Admin Quick Notes</h4>
                  <p className="text-[11px] text-neutral-300 leading-6">
                    Paste the iframe embed link, then add title, description and an image URL. Only the admin user can see this section.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isLoginOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#020205]/95 p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setIsLoginOpen(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white transition"
              >
                ✕
              </button>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-cyan-400">USER ACCESS GATE</p>
                  <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight mt-2">
                    SIGN IN / REGISTER
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-mono mt-2">
                    Enter a unique username, a secure password, and choose your pilot avatar. Existing usernames cannot be reused by another user.
                  </p>
                </div>

                {loginError && (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-300 text-xs font-mono">
                    {loginError}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-mono">
                      USERNAME
                    </label>
                    <input
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      placeholder="Enter unique pilot handle"
                      autoComplete="username"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-mono">
                      PASSWORD
                    </label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      placeholder="Enter secure passcode"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">
                      PICK YOUR AVATAR
                    </span>
                    <span className="text-[10px] text-cyan-300 uppercase tracking-wider font-semibold">
                      {selectedAvatar ? "Selected" : "Choose one"}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {AVATAR_PRESETS.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedAvatar(preset)}
                        className={`rounded-2xl overflow-hidden border p-0.5 transition ${
                          selectedAvatar === preset
                            ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.24)]"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <img src={preset} alt={`Avatar ${index + 1}`} className="h-16 w-16 object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsLoginOpen(false)}
                    className="px-4 py-2 text-[10px] uppercase tracking-widest font-mono text-neutral-400 border border-white/10 rounded-2xl hover:bg-white/5 transition"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={handleLoginSubmit}
                    disabled={isLoading}
                    className={`px-4 py-2 text-[10px] uppercase tracking-widest font-mono rounded-2xl transition ${isLoading ? "bg-slate-600 text-neutral-300 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-400 text-black"}`}
                  >
                    {isLoading ? "SIGNING IN..." : "SIGN IN"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
