import { create } from "zustand";
import { supabase } from "./supabase";
import {
  Profile,
  Recipe,
  Like,
  Bookmark,
  Rating,
  Comment,
  RecipeReport,
  CommentReport,
  RecipeInput,
  AppNotification,
  NotificationType,
  UserRole,
  BannerItem,
  PopularSearch,
  CategoryItem,
} from "./types";
import {
  rowToProfile,
  rowToRecipe,
  rowToLike,
  rowToBookmark,
  rowToRating,
  rowToComment,
  rowToRecipeReport,
  rowToCommentReport,
  rowToNotification,
  rowToBanner,
  rowToPopularSearch,
  rowToCategoryItem,
  recipeInputToRow,
  upsertById,
  upsertByPair,
} from "./db";
import { uid } from "./utils";
import { BANNERS } from "./banners";
import { CATEGORIES, POPULAR_SEARCHES } from "./constants";

const DEFAULT_BANNERS: BannerItem[] = BANNERS.map((b, i) => ({
  id: `default-b${i}`,
  ...b,
  sortOrder: i,
  isActive: true,
}));

const DEFAULT_POPULAR: PopularSearch[] = POPULAR_SEARCHES.map((p, i) => ({
  id: `default-p${i}`,
  label: p.label,
  imageUrl: p.image,
  sortOrder: i,
}));

const DEFAULT_CATEGORIES: CategoryItem[] = CATEGORIES.map((c, i) => ({
  id: `default-c${i}`,
  name: c.value,
  dot: c.dot,
  sortOrder: i,
}));

export interface BannerInput {
  id?: string;
  label: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  gradient: string;
  href: string;
  sortOrder: number;
  isActive: boolean;
  image: string | null;
}

export interface PopularInput {
  id?: string;
  label: string;
  sortOrder: number;
  image: string | null;
}

export interface CategoryInput {
  id?: string;
  name: string;
  dot: string;
  sortOrder: number;
}

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  danger: boolean;
  onConfirm: () => void;
}

export interface ToastItem {
  id: string;
  message: string;
  kind: "success" | "error";
}

interface AppState {
  profile: Profile | null;
  authLoading: boolean;
  authError: string | null;
  theme: "light" | "dark";

  profiles: Profile[];
  recipes: Recipe[];
  likes: Like[];
  bookmarks: Bookmark[];
  ratings: Rating[];
  comments: Comment[];
  recipeReports: RecipeReport[];
  commentReports: CommentReport[];
  notifications: AppNotification[];

  publicLoaded: boolean;
  myReportedRecipeIds: string[];
  myReportedCommentIds: string[];

  confirmRequest: ConfirmRequest | null;
  toasts: ToastItem[];
  askConfirm: (req: Omit<ConfirmRequest, "danger" | "confirmLabel"> & Partial<Pick<ConfirmRequest, "danger" | "confirmLabel">>) => void;
  closeConfirm: () => void;
  showToast: (message: string, kind?: "success" | "error") => void;
  dismissToast: (id: string) => void;

  initAuth: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  toggleTheme: () => void;

  loadNotifications: () => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  updateProfile: (name: string, avatarDataUrl: string | null) => Promise<boolean>;
  setUserRole: (userId: string, role: UserRole) => Promise<void>;

  loadPublic: () => Promise<void>;
  loadRecipeDetail: (id: string) => Promise<void>;
  loadMine: () => Promise<void>;
  loadBookmarks: () => Promise<void>;
  loadAdmin: () => Promise<void>;

  uploadPhotoFromDataUrl: (dataUrl: string) => Promise<string | null>;
  uploadMany: (dataUrls: string[]) => Promise<string[]>;

  addRecipe: (input: RecipeInput) => Promise<string | null>;
  updateRecipe: (id: string, input: RecipeInput) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  togglePrivacy: (id: string) => Promise<void>;
  forkRecipe: (id: string) => Promise<string | null>;

  toggleLike: (recipeId: string) => Promise<void>;
  toggleBookmark: (recipeId: string) => Promise<void>;
  submitRating: (recipeId: string, stars: number, photoDataUrl: string | null) => Promise<void>;
  addComment: (recipeId: string, text: string, imageDataUrl?: string | null) => Promise<void>;
  reportRecipe: (recipeId: string, reason: string) => Promise<void>;
  reportComment: (commentId: string, reason: string) => Promise<void>;

  resolveRecipeReport: (reportId: string, action: "approve" | "warn" | "delete") => Promise<void>;
  resolveCommentReport: (reportId: string, action: "ignore" | "delete") => Promise<void>;
  suspendUser: (userId: string) => Promise<void>;
  banUser: (userId: string) => Promise<void>;

  banners: BannerItem[];
  popularSearches: PopularSearch[];
  categories: CategoryItem[];
  siteContentLoaded: boolean;

  loadSiteContent: () => Promise<void>;
  saveBanner: (input: BannerInput) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  savePopularSearch: (input: PopularInput) => Promise<void>;
  deletePopularSearch: (id: string) => Promise<void>;
  saveCategory: (input: CategoryInput) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  visitStats: { today: number; week: number; month: number; total: number } | null;
  logVisit: () => Promise<void>;
  loadStats: () => Promise<void>;
}

let authInitialized = false;

async function createNotification(
  actorId: string,
  ownerId: string,
  type: NotificationType,
  recipeId: string
) {
  if (actorId === ownerId) return;
  await supabase.from("notifications").insert({
    user_id: ownerId,
    actor_id: actorId,
    type,
    recipe_id: recipeId,
  });
}

export const useAppStore = create<AppState>()((set, get) => ({
  profile: null,
  authLoading: true,
  authError: null,
  theme: "light",

  profiles: [],
  recipes: [],
  likes: [],
  bookmarks: [],
  ratings: [],
  comments: [],
  recipeReports: [],
  commentReports: [],
  notifications: [],

  publicLoaded: false,
  myReportedRecipeIds: [],
  myReportedCommentIds: [],

  banners: DEFAULT_BANNERS,
  popularSearches: DEFAULT_POPULAR,
  categories: DEFAULT_CATEGORIES,
  siteContentLoaded: false,
  visitStats: null,

  confirmRequest: null,
  toasts: [],
  askConfirm: (req) =>
    set({
      confirmRequest: {
        title: req.title,
        message: req.message,
        confirmLabel: req.confirmLabel ?? "Hapus",
        danger: req.danger ?? true,
        onConfirm: req.onConfirm,
      },
    }),
  closeConfirm: () => set({ confirmRequest: null }),
  showToast: (message, kind = "success") => {
    const id = uid();
    set((s) => ({ toasts: [...s.toasts, { id, message, kind }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  initAuth: () => {
    if (authInitialized) return;
    authInitialized = true;

    const stored =
      typeof window !== "undefined" ? window.localStorage.getItem("kulinara-theme") : null;
    if (stored === "dark" || stored === "light") {
      set({ theme: stored });
      document.documentElement.setAttribute("data-theme", stored);
    }

    async function applySession(userId: string | null) {
      if (!userId) {
        set({ profile: null, authLoading: false });
        return;
      }
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (!data) {
        set({ profile: null, authLoading: false });
        return;
      }
      const profile = rowToProfile(data);
      if (profile.status !== "active") {
        await supabase.auth.signOut();
        set({
          profile: null,
          authLoading: false,
          authError:
            profile.status === "banned"
              ? "Akun ini telah diblokir oleh moderator."
              : "Akun ini sedang ditangguhkan oleh moderator.",
        });
        return;
      }
      set((s) => ({
        profile,
        authLoading: false,
        authError: null,
        profiles: upsertById(s.profiles, [profile]),
      }));
    }

    supabase.auth.getSession().then(({ data }) => {
      applySession(data.session?.user?.id ?? null);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session?.user?.id ?? null);
    });
  },

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
  },

  signInWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return "Email atau kata sandi salah.";
    return null;
  },

  loadNotifications: async () => {
    const me = get().profile;
    if (!me) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", me.id)
      .order("created_at", { ascending: false })
      .limit(50);
    const notifications = (data ?? []).map(rowToNotification);
    const actorIds = Array.from(new Set(notifications.map((n) => n.actorId)));
    const recipeIds = Array.from(
      new Set(notifications.map((n) => n.recipeId).filter(Boolean))
    ) as string[];
    const [actorsRes, recipesRes] = await Promise.all([
      actorIds.length
        ? supabase.from("profiles").select("*").in("id", actorIds)
        : Promise.resolve({ data: [] } as any),
      recipeIds.length
        ? supabase.from("recipes").select("*").in("id", recipeIds)
        : Promise.resolve({ data: [] } as any),
    ]);
    set((s) => ({
      notifications,
      profiles: upsertById(s.profiles, (actorsRes.data ?? []).map(rowToProfile)),
      recipes: upsertById(s.recipes, (recipesRes.data ?? []).map(rowToRecipe)),
    }));
  },

  markNotificationsRead: async () => {
    const me = get().profile;
    if (!me) return;
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", me.id)
      .eq("read", false);
  },

  updateProfile: async (name, avatarDataUrl) => {
    const me = get().profile;
    if (!me) return false;
    let avatarUrl = me.avatarUrl;
    if (avatarDataUrl && avatarDataUrl.startsWith("data:")) {
      const uploaded = await get().uploadPhotoFromDataUrl(avatarDataUrl);
      if (uploaded) avatarUrl = uploaded;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), avatar_url: avatarUrl })
      .eq("id", me.id);
    if (error) return false;
    const updated = { ...me, name: name.trim(), avatarUrl };
    set((s) => ({
      profile: updated,
      profiles: upsertById(s.profiles, [updated]),
    }));
    return true;
  },

  setUserRole: async (userId, role) => {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
    if (error) {
      get().showToast("Gagal mengubah role (hanya super admin yang bisa)", "error");
      return;
    }
    set((s) => ({
      profiles: s.profiles.map((p) => (p.id === userId ? { ...p, role } : p)),
    }));
    get().showToast(role === "admin" ? "Pengguna dijadikan admin" : "Akses admin dicabut");
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      profile: null,
      bookmarks: [],
      recipeReports: [],
      commentReports: [],
      notifications: [],
    });
  },

  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    set({ theme: next });
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", next);
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("kulinara-theme", next);
    }
  },

  loadPublic: async () => {
    const [recipesRes, ratingsRes, likesRes] = await Promise.all([
      supabase
        .from("recipes")
        .select("*, profiles!user_id(id, name, avatar_url, role, status)")
        .eq("is_public", true),
      supabase.from("ratings").select("*"),
      supabase.from("likes").select("*"),
    ]);
    set((s) => ({
      recipes: upsertById(s.recipes, (recipesRes.data ?? []).map(rowToRecipe)),
      ratings: upsertById(s.ratings, (ratingsRes.data ?? []).map(rowToRating)),
      likes: upsertByPair(s.likes, (likesRes.data ?? []).map(rowToLike)),
      profiles: upsertById(
        s.profiles,
        (recipesRes.data ?? [])
          .map((r: any) => r.profiles)
          .filter(Boolean)
          .map(rowToProfile)
      ),
      publicLoaded: true,
    }));
    const me = get().profile;
    if (me) {
      const { data } = await supabase.from("bookmarks").select("*").eq("user_id", me.id);
      set((s) => ({ bookmarks: upsertByPair(s.bookmarks, (data ?? []).map(rowToBookmark)) }));
    }
  },

  loadRecipeDetail: async (id: string) => {
    const recipeRes = await supabase
      .from("recipes")
      .select("*, profiles!user_id(id, name, avatar_url, role, status)")
      .eq("id", id)
      .maybeSingle();
    if (!recipeRes.data) return;

    const recipe = rowToRecipe(recipeRes.data);
    const [ratingsRes, likesRes, commentsRes, forkedRes] = await Promise.all([
      supabase
        .from("ratings")
        .select("*, profiles!user_id(id, name, avatar_url, role, status)")
        .eq("recipe_id", id),
      supabase.from("likes").select("*").eq("recipe_id", id),
      supabase
        .from("comments")
        .select("*, profiles!user_id(id, name, avatar_url, role, status)")
        .eq("recipe_id", id)
        .order("created_at"),
      recipe.forkedFromId
        ? supabase
            .from("recipes")
            .select("*, profiles!user_id(id, name, avatar_url, role, status)")
            .eq("id", recipe.forkedFromId)
            .maybeSingle()
        : Promise.resolve({ data: null } as any),
    ]);

    const joinedProfiles = [
      recipeRes.data.profiles,
      forkedRes.data?.profiles,
      ...(ratingsRes.data ?? []).map((r: any) => r.profiles),
      ...(commentsRes.data ?? []).map((c: any) => c.profiles),
    ]
      .filter(Boolean)
      .map(rowToProfile);

    set((s) => ({
      recipes: upsertById(
        s.recipes,
        [recipe, ...(forkedRes.data ? [rowToRecipe(forkedRes.data)] : [])]
      ),
      ratings: upsertById(s.ratings, (ratingsRes.data ?? []).map(rowToRating)),
      likes: upsertByPair(
        s.likes.filter((l) => l.recipeId !== id),
        (likesRes.data ?? []).map(rowToLike)
      ),
      comments: upsertById(s.comments, (commentsRes.data ?? []).map(rowToComment)),
      profiles: upsertById(s.profiles, joinedProfiles),
    }));

    const me = get().profile;
    if (me) {
      const { data } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", me.id)
        .eq("recipe_id", id);
      set((s) => ({ bookmarks: upsertByPair(s.bookmarks, (data ?? []).map(rowToBookmark)) }));
    }
  },

  loadMine: async () => {
    const me = get().profile;
    if (!me) return;
    const [recipesRes, ratingsRes, likesRes] = await Promise.all([
      supabase.from("recipes").select("*").eq("user_id", me.id),
      supabase.from("ratings").select("*"),
      supabase.from("likes").select("*"),
    ]);
    set((s) => ({
      recipes: upsertById(s.recipes, (recipesRes.data ?? []).map(rowToRecipe)),
      ratings: upsertById(s.ratings, (ratingsRes.data ?? []).map(rowToRating)),
      likes: upsertByPair(s.likes, (likesRes.data ?? []).map(rowToLike)),
    }));
  },

  loadBookmarks: async () => {
    const me = get().profile;
    if (!me) return;
    const bookmarksRes = await supabase.from("bookmarks").select("*").eq("user_id", me.id);
    const bookmarks = (bookmarksRes.data ?? []).map(rowToBookmark);
    const ids = bookmarks.map((b) => b.recipeId);
    if (ids.length > 0) {
      const recipesRes = await supabase
        .from("recipes")
        .select("*, profiles!user_id(id, name, avatar_url, role, status)")
        .in("id", ids);
      set((s) => ({
        recipes: upsertById(s.recipes, (recipesRes.data ?? []).map(rowToRecipe)),
        profiles: upsertById(
          s.profiles,
          (recipesRes.data ?? [])
            .map((r: any) => r.profiles)
            .filter(Boolean)
            .map(rowToProfile)
        ),
      }));
    }
    set((s) => ({
      bookmarks: upsertByPair(
        s.bookmarks.filter((b) => b.userId !== me.id),
        bookmarks
      ),
    }));
  },

  loadAdmin: async () => {
    const [recipeReportsRes, commentReportsRes, profilesRes, recipesRes, commentsRes] =
      await Promise.all([
        supabase.from("recipe_reports").select("*"),
        supabase.from("comment_reports").select("*"),
        supabase.from("profiles").select("*"),
        supabase.from("recipes").select("*"),
        supabase.from("comments").select("*"),
      ]);
    set((s) => ({
      recipeReports: (recipeReportsRes.data ?? []).map(rowToRecipeReport),
      commentReports: (commentReportsRes.data ?? []).map(rowToCommentReport),
      profiles: upsertById(s.profiles, (profilesRes.data ?? []).map(rowToProfile)),
      recipes: upsertById(s.recipes, (recipesRes.data ?? []).map(rowToRecipe)),
      comments: upsertById(s.comments, (commentsRes.data ?? []).map(rowToComment)),
    }));
  },

  uploadPhotoFromDataUrl: async (dataUrl: string) => {
    const me = get().profile;
    if (!me) return null;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const path = `${me.id}/${Date.now()}-${uid()}.jpg`;
      const { error } = await supabase.storage
        .from("recipe-photos")
        .upload(path, blob, { contentType: blob.type || "image/jpeg" });
      if (error) return null;
      const { data } = supabase.storage.from("recipe-photos").getPublicUrl(path);
      return data.publicUrl;
    } catch {
      return null;
    }
  },

  uploadMany: async (dataUrls) => {
    const out: string[] = [];
    for (const src of dataUrls) {
      const url = src.startsWith("data:") ? await get().uploadPhotoFromDataUrl(src) : src;
      if (url) out.push(url);
    }
    return out;
  },

  addRecipe: async (input) => {
    const me = get().profile;
    if (!me) return null;
    const imageUrls = await get().uploadMany(input.imageDataUrls);
    const steps = [];
    for (const s of input.steps) {
      steps.push({ text: s.text, photos: await get().uploadMany(s.photos) });
    }
    const { data, error } = await supabase
      .from("recipes")
      .insert(recipeInputToRow({ ...input, steps }, imageUrls, me.id))
      .select("*")
      .single();
    if (error || !data) return null;
    set((s) => ({ recipes: upsertById(s.recipes, [rowToRecipe(data)]) }));
    return data.id;
  },

  updateRecipe: async (id, input) => {
    const me = get().profile;
    if (!me) return;
    const imageUrls = await get().uploadMany(input.imageDataUrls);
    const steps = [];
    for (const s of input.steps) {
      steps.push({ text: s.text, photos: await get().uploadMany(s.photos) });
    }
    const row = recipeInputToRow({ ...input, steps }, imageUrls, me.id);
    const { data } = await supabase.from("recipes").update(row).eq("id", id).select("*").single();
    if (data) set((s) => ({ recipes: upsertById(s.recipes, [rowToRecipe(data)]) }));
  },

  deleteRecipe: async (id) => {
    await supabase.from("recipes").delete().eq("id", id);
    set((s) => ({
      recipes: s.recipes.filter((r) => r.id !== id),
      likes: s.likes.filter((l) => l.recipeId !== id),
      bookmarks: s.bookmarks.filter((b) => b.recipeId !== id),
      ratings: s.ratings.filter((r) => r.recipeId !== id),
      comments: s.comments.filter((c) => c.recipeId !== id),
    }));
  },

  togglePrivacy: async (id) => {
    const recipe = get().recipes.find((r) => r.id === id);
    if (!recipe) return;
    const next = !recipe.isPublic;
    set((s) => ({
      recipes: s.recipes.map((r) => (r.id === id ? { ...r, isPublic: next } : r)),
    }));
    await supabase.from("recipes").update({ is_public: next }).eq("id", id);
  },

  forkRecipe: async (id) => {
    const me = get().profile;
    const source = get().recipes.find((r) => r.id === id);
    if (!me || !source) return null;
    const { data, error } = await supabase
      .from("recipes")
      .insert({
        user_id: me.id,
        title: source.title,
        category: source.category,
        image_url: source.imageUrl,
        images: source.images,
        cook_time_minutes: source.cookTimeMinutes,
        servings: source.servings,
        difficulty: source.difficulty,
        estimated_cost: source.estimatedCost,
        notes: source.notes,
        ingredients: source.ingredients.map((i) => ({
          name: i.name,
          qty: i.qty,
          unit: i.unit,
          secukupnya: i.secukupnya,
        })),
        steps: source.steps.map((st) => ({ text: st.text, photos: st.photos })),
        is_public: false,
        forked_from_id: source.id,
      })
      .select("*")
      .single();
    if (error || !data) return null;
    set((s) => ({ recipes: upsertById(s.recipes, [rowToRecipe(data)]) }));
    createNotification(me.id, source.userId, "fork", source.id);
    return data.id;
  },

  toggleLike: async (recipeId) => {
    const me = get().profile;
    if (!me) return;
    const exists = get().likes.some((l) => l.userId === me.id && l.recipeId === recipeId);
    if (exists) {
      set((s) => ({
        likes: s.likes.filter((l) => !(l.userId === me.id && l.recipeId === recipeId)),
      }));
      await supabase.from("likes").delete().eq("user_id", me.id).eq("recipe_id", recipeId);
    } else {
      set((s) => ({
        likes: [...s.likes, { userId: me.id, recipeId, createdAt: Date.now() }],
      }));
      await supabase.from("likes").insert({ user_id: me.id, recipe_id: recipeId });
      const recipe = get().recipes.find((r) => r.id === recipeId);
      if (recipe) createNotification(me.id, recipe.userId, "like", recipeId);
    }
  },

  toggleBookmark: async (recipeId) => {
    const me = get().profile;
    if (!me) return;
    const exists = get().bookmarks.some((b) => b.userId === me.id && b.recipeId === recipeId);
    if (exists) {
      set((s) => ({
        bookmarks: s.bookmarks.filter((b) => !(b.userId === me.id && b.recipeId === recipeId)),
      }));
      await supabase.from("bookmarks").delete().eq("user_id", me.id).eq("recipe_id", recipeId);
    } else {
      set((s) => ({
        bookmarks: [...s.bookmarks, { userId: me.id, recipeId, createdAt: Date.now() }],
      }));
      await supabase.from("bookmarks").insert({ user_id: me.id, recipe_id: recipeId });
    }
  },

  submitRating: async (recipeId, stars, photoDataUrl) => {
    const me = get().profile;
    if (!me) return;
    let photoUrl: string | null = null;
    if (photoDataUrl) {
      photoUrl = photoDataUrl.startsWith("data:")
        ? await get().uploadPhotoFromDataUrl(photoDataUrl)
        : photoDataUrl;
    }
    const existing = get().ratings.find(
      (r) => r.userId === me.id && r.recipeId === recipeId
    );
    const { data } = await supabase
      .from("ratings")
      .upsert(
        {
          ...(existing ? { id: existing.id } : {}),
          user_id: me.id,
          recipe_id: recipeId,
          stars,
          photo_url: photoUrl ?? existing?.photoUrl ?? null,
        },
        { onConflict: "user_id,recipe_id" }
      )
      .select("*")
      .single();
    if (data) {
      set((s) => ({
        ratings: upsertById(
          s.ratings.filter((r) => !(r.userId === me.id && r.recipeId === recipeId)),
          [rowToRating(data)]
        ),
      }));
      if (!existing) {
        const recipe = get().recipes.find((r) => r.id === recipeId);
        if (recipe) createNotification(me.id, recipe.userId, "rating", recipeId);
      }
    }
  },

  addComment: async (recipeId, text, imageDataUrl) => {
    const me = get().profile;
    if (!me || (!text.trim() && !imageDataUrl)) return;
    let imageUrl: string | null = null;
    if (imageDataUrl) {
      imageUrl = imageDataUrl.startsWith("data:")
        ? await get().uploadPhotoFromDataUrl(imageDataUrl)
        : imageDataUrl;
    }
    const { data } = await supabase
      .from("comments")
      .insert({ recipe_id: recipeId, user_id: me.id, text: text.trim(), image_url: imageUrl })
      .select("*")
      .single();
    if (data) {
      set((s) => ({ comments: upsertById(s.comments, [rowToComment(data)]) }));
      const recipe = get().recipes.find((r) => r.id === recipeId);
      if (recipe) createNotification(me.id, recipe.userId, "comment", recipeId);
    }
  },

  reportRecipe: async (recipeId, reason) => {
    const me = get().profile;
    if (!me) return;
    await supabase
      .from("recipe_reports")
      .insert({ recipe_id: recipeId, reporter_id: me.id, reason: reason.trim() });
    set((s) => ({ myReportedRecipeIds: [...s.myReportedRecipeIds, recipeId] }));
  },

  reportComment: async (commentId, reason) => {
    const me = get().profile;
    if (!me) return;
    await supabase
      .from("comment_reports")
      .insert({ comment_id: commentId, reporter_id: me.id, reason: reason.trim() });
    set((s) => ({ myReportedCommentIds: [...s.myReportedCommentIds, commentId] }));
  },

  resolveRecipeReport: async (reportId, action) => {
    const report = get().recipeReports.find((r) => r.id === reportId);
    if (!report) return;
    if (action === "delete") {
      await get().deleteRecipe(report.recipeId);
    }
    await supabase.from("recipe_reports").update({ status: "resolved" }).eq("id", reportId);
    set((s) => ({
      recipeReports: s.recipeReports.map((r) =>
        r.id === reportId ? { ...r, status: "resolved" } : r
      ),
    }));
  },

  resolveCommentReport: async (reportId, action) => {
    const report = get().commentReports.find((r) => r.id === reportId);
    if (!report) return;
    if (action === "delete") {
      await supabase.from("comments").delete().eq("id", report.commentId);
      set((s) => ({ comments: s.comments.filter((c) => c.id !== report.commentId) }));
    }
    await supabase.from("comment_reports").update({ status: "resolved" }).eq("id", reportId);
    set((s) => ({
      commentReports: s.commentReports.map((r) =>
        r.id === reportId ? { ...r, status: "resolved" } : r
      ),
    }));
  },

  suspendUser: async (userId) => {
    await supabase.from("profiles").update({ status: "suspended" }).eq("id", userId);
    set((s) => ({
      profiles: s.profiles.map((p) =>
        p.id === userId ? { ...p, status: "suspended" as const } : p
      ),
    }));
  },

  banUser: async (userId) => {
    await supabase.from("profiles").update({ status: "banned" }).eq("id", userId);
    set((s) => ({
      profiles: s.profiles.map((p) =>
        p.id === userId ? { ...p, status: "banned" as const } : p
      ),
    }));
  },

  // ---------- Konten situs (banner, pencarian populer, kategori) ----------

  loadSiteContent: async () => {
    const [bRes, pRes, cRes] = await Promise.all([
      supabase.from("banners").select("*").order("sort_order", { ascending: true }),
      supabase.from("popular_searches").select("*").order("sort_order", { ascending: true }),
      supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    ]);
    set((s) => ({
      banners: bRes.data && bRes.data.length ? bRes.data.map(rowToBanner) : s.banners,
      popularSearches:
        pRes.data && pRes.data.length ? pRes.data.map(rowToPopularSearch) : s.popularSearches,
      categories: cRes.data && cRes.data.length ? cRes.data.map(rowToCategoryItem) : s.categories,
      siteContentLoaded: true,
    }));
  },

  saveBanner: async (input) => {
    const imageUrl =
      input.image && input.image.startsWith("data:")
        ? await get().uploadPhotoFromDataUrl(input.image)
        : input.image ?? null;
    const row = {
      label: input.label,
      title: input.title,
      subtitle: input.subtitle,
      cta_label: input.ctaLabel,
      gradient: input.gradient,
      image_url: imageUrl,
      href: input.href,
      sort_order: input.sortOrder,
      is_active: input.isActive,
    };
    const isExisting = input.id && !input.id.startsWith("default-");
    const { error } = isExisting
      ? await supabase.from("banners").update(row).eq("id", input.id!)
      : await supabase.from("banners").insert(row);
    if (error) {
      get().showToast("Gagal menyimpan. Sudah jalankan upgrade3.sql?", "error");
      return;
    }
    await get().loadSiteContent();
    get().showToast("Banner disimpan");
  },

  deleteBanner: async (id) => {
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) {
      get().showToast("Gagal menghapus banner", "error");
      return;
    }
    await get().loadSiteContent();
    get().showToast("Banner dihapus");
  },

  savePopularSearch: async (input) => {
    const imageUrl =
      input.image && input.image.startsWith("data:")
        ? await get().uploadPhotoFromDataUrl(input.image)
        : input.image ?? null;
    const row = { label: input.label, image_url: imageUrl, sort_order: input.sortOrder };
    const isExisting = input.id && !input.id.startsWith("default-");
    const { error } = isExisting
      ? await supabase.from("popular_searches").update(row).eq("id", input.id!)
      : await supabase.from("popular_searches").insert(row);
    if (error) {
      get().showToast("Gagal menyimpan. Sudah jalankan upgrade3.sql?", "error");
      return;
    }
    await get().loadSiteContent();
    get().showToast("Pencarian populer disimpan");
  },

  deletePopularSearch: async (id) => {
    const { error } = await supabase.from("popular_searches").delete().eq("id", id);
    if (error) {
      get().showToast("Gagal menghapus", "error");
      return;
    }
    await get().loadSiteContent();
    get().showToast("Item dihapus");
  },

  saveCategory: async (input) => {
    const row = { name: input.name.trim(), dot: input.dot, sort_order: input.sortOrder };
    const isExisting = input.id && !input.id.startsWith("default-");
    const { error } = isExisting
      ? await supabase.from("categories").update(row).eq("id", input.id!)
      : await supabase.from("categories").insert(row);
    if (error) {
      get().showToast(
        error.code === "23505"
          ? "Nama kategori sudah ada"
          : "Gagal menyimpan. Sudah jalankan upgrade3.sql?",
        "error"
      );
      return;
    }
    await get().loadSiteContent();
    get().showToast("Kategori disimpan");
  },

  deleteCategory: async (id) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      get().showToast("Gagal menghapus kategori", "error");
      return;
    }
    await get().loadSiteContent();
    get().showToast("Kategori dihapus");
  },

  // ---------- Statistik ----------

  logVisit: async () => {
    if (typeof window === "undefined") return;
    try {
      if (window.sessionStorage.getItem("kulinara-visit-logged")) return;
      window.sessionStorage.setItem("kulinara-visit-logged", "1");
      await supabase.from("visits").insert({});
    } catch {
      // tabel visits belum ada (upgrade4.sql belum dijalankan) — abaikan.
    }
  },

  loadStats: async () => {
    const dayMs = 86400000;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const now = Date.now();
    const windows = [
      todayStart.toISOString(),
      new Date(now - 7 * dayMs).toISOString(),
      new Date(now - 30 * dayMs).toISOString(),
      null,
    ];
    const countSince = async (iso: string | null): Promise<number | null> => {
      let q = supabase.from("visits").select("*", { count: "exact", head: true });
      if (iso) q = q.gte("created_at", iso);
      const { count, error } = await q;
      return error ? null : count ?? 0;
    };
    const [today, week, month, total] = await Promise.all(windows.map(countSince));
    if (today === null) {
      set({ visitStats: null });
      return;
    }
    set({ visitStats: { today, week: week ?? 0, month: month ?? 0, total: total ?? 0 } });
  },
}));
