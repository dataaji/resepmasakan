export type Category = "Makanan" | "Camilan" | "Minuman" | "Kue & Dessert";
export type Difficulty = "Mudah" | "Sedang" | "Sulit";
export type UserRole = "user" | "admin";
export type UserStatus = "active" | "suspended" | "banned";
export type ReportStatus = "pending" | "resolved";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  verifyCode: string | null;
  createdAt: number;
}

export interface Ingredient {
  id: string;
  name: string;
  qty: number | null;
  unit: string | null;
  secukupnya: boolean;
}

export interface Step {
  id: string;
  n: number;
  text: string;
}

export interface Recipe {
  id: string;
  userId: string;
  title: string;
  category: Category;
  imageDataUrl: string | null;
  placeholderIndex: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: Difficulty;
  estimatedCost: number | null;
  notes: string;
  ingredients: Ingredient[];
  steps: Step[];
  isPublic: boolean;
  forkedFromId: string | null;
  createdAt: number;
}

export interface Like {
  userId: string;
  recipeId: string;
  createdAt: number;
}

export interface Bookmark {
  userId: string;
  recipeId: string;
  createdAt: number;
}

export interface Rating {
  id: string;
  userId: string;
  recipeId: string;
  stars: number;
  photoDataUrl: string | null;
  createdAt: number;
}

export interface Comment {
  id: string;
  recipeId: string;
  userId: string;
  text: string;
  createdAt: number;
  reported: boolean;
  reportReason: string;
}

export interface RecipeReport {
  id: string;
  recipeId: string;
  reporterId: string;
  reason: string;
  status: ReportStatus;
  createdAt: number;
}

export interface CommentReport {
  id: string;
  commentId: string;
  reporterId: string;
  reason: string;
  status: ReportStatus;
  createdAt: number;
}
