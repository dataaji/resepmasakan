import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  User,
  Recipe,
  Like,
  Bookmark,
  Rating,
  Comment,
  RecipeReport,
  CommentReport,
  Ingredient,
  Step,
} from "./types";
import { uid, genVerifyCode } from "./utils";
import { seedUsers, seedRecipes, seedLikes, seedRatings, seedComments } from "./seed";

type Result = { ok: true } | { ok: false; error: string };

export interface RecipeInput {
  title: string;
  category: Recipe["category"];
  imageDataUrl: string | null;
  placeholderIndex: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: Recipe["difficulty"];
  estimatedCost: number | null;
  notes: string;
  ingredients: Omit<Ingredient, "id">[];
  steps: Omit<Step, "id">[];
  isPublic: boolean;
}

interface AppState {
  users: User[];
  currentUserId: string | null;
  recipes: Recipe[];
  likes: Like[];
  bookmarks: Bookmark[];
  ratings: Rating[];
  comments: Comment[];
  recipeReports: RecipeReport[];
  commentReports: CommentReport[];
  theme: "light" | "dark";
  hasHydrated: boolean;

  setHasHydrated: (v: boolean) => void;
  toggleTheme: () => void;

  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Result & { code?: string };
  login: (email: string, password: string) => Result;
  loginAdmin: (email: string, password: string) => Result;
  verifyEmail: (code: string) => Result;
  resendCode: () => string | null;
  logout: () => void;

  addRecipe: (input: RecipeInput) => string;
  updateRecipe: (id: string, input: RecipeInput) => void;
  deleteRecipe: (id: string) => void;
  togglePrivacy: (id: string) => void;
  forkRecipe: (id: string) => string | null;

  toggleLike: (recipeId: string) => void;
  toggleBookmark: (recipeId: string) => void;
  submitRating: (
    recipeId: string,
    starsValue: number,
    photoDataUrl: string | null
  ) => void;
  addComment: (recipeId: string, text: string) => void;
  reportRecipe: (recipeId: string, reason: string) => void;
  reportComment: (commentId: string, reason: string) => void;

  resolveRecipeReport: (
    reportId: string,
    action: "approve" | "warn" | "delete"
  ) => void;
  resolveCommentReport: (reportId: string, action: "ignore" | "delete") => void;
  suspendUser: (userId: string) => void;
  banUser: (userId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: seedUsers,
      currentUserId: null,
      recipes: seedRecipes,
      likes: seedLikes,
      bookmarks: [],
      ratings: seedRatings,
      comments: seedComments,
      recipeReports: [],
      commentReports: [],
      theme: "light",
      hasHydrated: false,

      setHasHydrated: (v) => set({ hasHydrated: v }),
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

      register: (name, email, password, confirmPassword) => {
        const trimmedEmail = email.trim().toLowerCase();
        if (!name.trim() || !trimmedEmail || !password) {
          return { ok: false, error: "Semua kolom wajib diisi." };
        }
        if (password !== confirmPassword) {
          return { ok: false, error: "Konfirmasi kata sandi tidak cocok." };
        }
        if (get().users.some((u) => u.email === trimmedEmail)) {
          return { ok: false, error: "Email ini sudah terdaftar." };
        }
        const code = genVerifyCode();
        const user: User = {
          id: uid(),
          name: name.trim(),
          email: trimmedEmail,
          password,
          role: "user",
          status: "active",
          emailVerified: false,
          verifyCode: code,
          createdAt: Date.now(),
        };
        set((s) => ({ users: [...s.users, user], currentUserId: user.id }));
        return { ok: true, code };
      },

      login: (email, password) => {
        const trimmedEmail = email.trim().toLowerCase();
        const user = get().users.find(
          (u) => u.email === trimmedEmail && u.password === password
        );
        if (!user) return { ok: false, error: "Email atau kata sandi salah." };
        if (user.status !== "active") {
          return {
            ok: false,
            error:
              user.status === "banned"
                ? "Akun ini telah diblokir."
                : "Akun ini sedang ditangguhkan.",
          };
        }
        set({ currentUserId: user.id });
        return { ok: true };
      },

      loginAdmin: (email, password) => {
        const trimmedEmail = email.trim().toLowerCase();
        const user = get().users.find(
          (u) => u.email === trimmedEmail && u.password === password
        );
        if (!user) return { ok: false, error: "Email atau kata sandi salah." };
        if (user.role !== "admin") {
          return { ok: false, error: "Akun ini bukan akun admin." };
        }
        set({ currentUserId: user.id });
        return { ok: true };
      },

      verifyEmail: (code) => {
        const current = get().users.find((u) => u.id === get().currentUserId);
        if (!current) return { ok: false, error: "Kamu belum masuk." };
        if (!code.trim() || code !== current.verifyCode) {
          return { ok: false, error: "Kode verifikasi salah." };
        }
        set((s) => ({
          users: s.users.map((u) =>
            u.id === current.id
              ? { ...u, emailVerified: true, verifyCode: null }
              : u
          ),
        }));
        return { ok: true };
      },

      resendCode: () => {
        const current = get().users.find((u) => u.id === get().currentUserId);
        if (!current) return null;
        const code = genVerifyCode();
        set((s) => ({
          users: s.users.map((u) =>
            u.id === current.id ? { ...u, verifyCode: code } : u
          ),
        }));
        return code;
      },

      logout: () => set({ currentUserId: null }),

      addRecipe: (input) => {
        const userId = get().currentUserId;
        if (!userId) return "";
        const id = uid();
        const recipe: Recipe = {
          id,
          userId,
          title: input.title,
          category: input.category,
          imageDataUrl: input.imageDataUrl,
          placeholderIndex: input.placeholderIndex,
          cookTimeMinutes: input.cookTimeMinutes,
          servings: input.servings,
          difficulty: input.difficulty,
          estimatedCost: input.estimatedCost,
          notes: input.notes,
          ingredients: input.ingredients.map((i) => ({ ...i, id: uid() })),
          steps: input.steps.map((s, idx) => ({ ...s, id: uid(), n: idx + 1 })),
          isPublic: input.isPublic,
          forkedFromId: null,
          createdAt: Date.now(),
        };
        set((s) => ({ recipes: [...s.recipes, recipe] }));
        return id;
      },

      updateRecipe: (id, input) => {
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === id
              ? {
                  ...r,
                  title: input.title,
                  category: input.category,
                  imageDataUrl: input.imageDataUrl ?? r.imageDataUrl,
                  placeholderIndex: input.placeholderIndex,
                  cookTimeMinutes: input.cookTimeMinutes,
                  servings: input.servings,
                  difficulty: input.difficulty,
                  estimatedCost: input.estimatedCost,
                  notes: input.notes,
                  ingredients: input.ingredients.map((i) => ({
                    ...i,
                    id: uid(),
                  })),
                  steps: input.steps.map((st, idx) => ({
                    ...st,
                    id: uid(),
                    n: idx + 1,
                  })),
                  isPublic: input.isPublic,
                }
              : r
          ),
        }));
      },

      deleteRecipe: (id) => {
        set((s) => ({
          recipes: s.recipes.filter((r) => r.id !== id),
          likes: s.likes.filter((l) => l.recipeId !== id),
          bookmarks: s.bookmarks.filter((b) => b.recipeId !== id),
          ratings: s.ratings.filter((r) => r.recipeId !== id),
          comments: s.comments.filter((c) => c.recipeId !== id),
          recipeReports: s.recipeReports.filter((r) => r.recipeId !== id),
        }));
      },

      togglePrivacy: (id) => {
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === id ? { ...r, isPublic: !r.isPublic } : r
          ),
        }));
      },

      forkRecipe: (id) => {
        const userId = get().currentUserId;
        const source = get().recipes.find((r) => r.id === id);
        if (!userId || !source) return null;
        const newId = uid();
        const recipe: Recipe = {
          ...source,
          id: newId,
          userId,
          isPublic: false,
          forkedFromId: source.id,
          ingredients: source.ingredients.map((i) => ({ ...i, id: uid() })),
          steps: source.steps.map((st) => ({ ...st, id: uid() })),
          createdAt: Date.now(),
        };
        set((s) => ({ recipes: [...s.recipes, recipe] }));
        return newId;
      },

      toggleLike: (recipeId) => {
        const userId = get().currentUserId;
        if (!userId) return;
        const exists = get().likes.some(
          (l) => l.userId === userId && l.recipeId === recipeId
        );
        set((s) => ({
          likes: exists
            ? s.likes.filter(
                (l) => !(l.userId === userId && l.recipeId === recipeId)
              )
            : [...s.likes, { userId, recipeId, createdAt: Date.now() }],
        }));
      },

      toggleBookmark: (recipeId) => {
        const userId = get().currentUserId;
        if (!userId) return;
        const exists = get().bookmarks.some(
          (b) => b.userId === userId && b.recipeId === recipeId
        );
        set((s) => ({
          bookmarks: exists
            ? s.bookmarks.filter(
                (b) => !(b.userId === userId && b.recipeId === recipeId)
              )
            : [...s.bookmarks, { userId, recipeId, createdAt: Date.now() }],
        }));
      },

      submitRating: (recipeId, starsValue, photoDataUrl) => {
        const userId = get().currentUserId;
        if (!userId) return;
        set((s) => {
          const withoutExisting = s.ratings.filter(
            (r) => !(r.userId === userId && r.recipeId === recipeId)
          );
          return {
            ratings: [
              ...withoutExisting,
              {
                id: uid(),
                userId,
                recipeId,
                stars: starsValue,
                photoDataUrl,
                createdAt: Date.now(),
              },
            ],
          };
        });
      },

      addComment: (recipeId, text) => {
        const userId = get().currentUserId;
        if (!userId || !text.trim()) return;
        set((s) => ({
          comments: [
            ...s.comments,
            {
              id: uid(),
              recipeId,
              userId,
              text: text.trim(),
              createdAt: Date.now(),
              reported: false,
              reportReason: "",
            },
          ],
        }));
      },

      reportRecipe: (recipeId, reason) => {
        const reporterId = get().currentUserId;
        if (!reporterId) return;
        set((s) => ({
          recipeReports: [
            ...s.recipeReports,
            {
              id: uid(),
              recipeId,
              reporterId,
              reason: reason.trim(),
              status: "pending",
              createdAt: Date.now(),
            },
          ],
        }));
      },

      reportComment: (commentId, reason) => {
        const reporterId = get().currentUserId;
        if (!reporterId) return;
        set((s) => ({
          comments: s.comments.map((c) =>
            c.id === commentId
              ? { ...c, reported: true, reportReason: reason.trim() }
              : c
          ),
          commentReports: [
            ...s.commentReports,
            {
              id: uid(),
              commentId,
              reporterId,
              reason: reason.trim(),
              status: "pending",
              createdAt: Date.now(),
            },
          ],
        }));
      },

      resolveRecipeReport: (reportId, action) => {
        const report = get().recipeReports.find((r) => r.id === reportId);
        if (!report) return;
        if (action === "delete") {
          get().deleteRecipe(report.recipeId);
        }
        set((s) => ({
          recipeReports: s.recipeReports.map((r) =>
            r.id === reportId ? { ...r, status: "resolved" } : r
          ),
        }));
      },

      resolveCommentReport: (reportId, action) => {
        const report = get().commentReports.find((r) => r.id === reportId);
        if (!report) return;
        if (action === "delete") {
          set((s) => ({
            comments: s.comments.filter((c) => c.id !== report.commentId),
          }));
        }
        set((s) => ({
          commentReports: s.commentReports.map((r) =>
            r.id === reportId ? { ...r, status: "resolved" } : r
          ),
        }));
      },

      suspendUser: (userId) => {
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId ? { ...u, status: "suspended" } : u
          ),
        }));
      },

      banUser: (userId) => {
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId ? { ...u, status: "banned" } : u
          ),
        }));
      },
    }),
    {
      name: "kulinara-store",
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
