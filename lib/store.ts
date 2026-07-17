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
  recipeInputToRow,
  upsertById,
  upsertByPair,
} from "./db";
import { uid } from "./utils";

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

  publicLoaded: boolean;
  myReportedRecipeIds: string[];
  myReportedCommentIds: string[];

  initAuth: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  toggleTheme: () => void;

  loadPublic: () => Promise<void>;
  loadRecipeDetail: (id: string) => Promise<void>;
  loadMine: () => Promise<void>;
  loadBookmarks: () => Promise<void>;
  loadAdmin: () => Promise<void>;

  uploadPhotoFromDataUrl: (dataUrl: string) => Promise<string | null>;

  addRecipe: (input: RecipeInput) => Promise<string | null>;
  updateRecipe: (id: string, input: RecipeInput) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  togglePrivacy: (id: string) => Promise<void>;
  forkRecipe: (id: string) => Promise<string | null>;

  toggleLike: (recipeId: string) => Promise<void>;
  toggleBookmark: (recipeId: string) => Promise<void>;
  submitRating: (recipeId: string, stars: number, photoDataUrl: string | null) => Promise<void>;
  addComment: (recipeId: string, text: string) => Promise<void>;
  reportRecipe: (recipeId: string, reason: string) => Promise<void>;
  reportComment: (commentId: string, reason: string) => Promise<void>;

  resolveRecipeReport: (reportId: string, action: "approve" | "warn" | "delete") => Promise<void>;
  resolveCommentReport: (reportId: string, action: "ignore" | "delete") => Promise<void>;
  suspendUser: (userId: string) => Promise<void>;
  banUser: (userId: string) => Promise<void>;
}

let authInitialized = false;

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

  publicLoaded: false,
  myReportedRecipeIds: [],
  myReportedCommentIds: [],

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

  signOut: async () => {
    await supabase.auth.signOut();
    set({ profile: null, bookmarks: [], recipeReports: [], commentReports: [] });
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

  addRecipe: async (input) => {
    const me = get().profile;
    if (!me) return null;
    let imageUrl: string | null = null;
    if (input.imageDataUrl) {
      imageUrl = input.imageDataUrl.startsWith("data:")
        ? await get().uploadPhotoFromDataUrl(input.imageDataUrl)
        : input.imageDataUrl;
    }
    const { data, error } = await supabase
      .from("recipes")
      .insert(recipeInputToRow(input, imageUrl, me.id))
      .select("*")
      .single();
    if (error || !data) return null;
    set((s) => ({ recipes: upsertById(s.recipes, [rowToRecipe(data)]) }));
    return data.id;
  },

  updateRecipe: async (id, input) => {
    const me = get().profile;
    if (!me) return;
    const existing = get().recipes.find((r) => r.id === id);
    let imageUrl: string | null = existing?.imageUrl ?? null;
    if (input.imageDataUrl) {
      imageUrl = input.imageDataUrl.startsWith("data:")
        ? (await get().uploadPhotoFromDataUrl(input.imageDataUrl)) ?? imageUrl
        : input.imageDataUrl;
    }
    const row = recipeInputToRow(input, imageUrl, me.id);
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
        steps: source.steps.map((st) => st.text),
        is_public: false,
        forked_from_id: source.id,
      })
      .select("*")
      .single();
    if (error || !data) return null;
    set((s) => ({ recipes: upsertById(s.recipes, [rowToRecipe(data)]) }));
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
    }
  },

  addComment: async (recipeId, text) => {
    const me = get().profile;
    if (!me || !text.trim()) return;
    const { data } = await supabase
      .from("comments")
      .insert({ recipe_id: recipeId, user_id: me.id, text: text.trim() })
      .select("*")
      .single();
    if (data) {
      set((s) => ({ comments: upsertById(s.comments, [rowToComment(data)]) }));
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
}));
