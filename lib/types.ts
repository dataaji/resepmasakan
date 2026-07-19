export type Category = string;
export type Difficulty = "Mudah" | "Sedang" | "Sulit";

export interface BannerItem {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  gradient: string;
  imageUrl: string | null;
  href: string;
  sortOrder: number;
  isActive: boolean;
}

export interface PopularSearch {
  id: string;
  label: string;
  imageUrl: string | null;
  sortOrder: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  dot: string;
  sortOrder: number;
}
export type UserRole = "user" | "admin" | "super_admin";
export type UserStatus = "active" | "suspended" | "banned";
export type ReportStatus = "pending" | "resolved";

export interface Profile {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
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
  photos: string[];
}

export interface Recipe {
  id: string;
  userId: string;
  title: string;
  category: Category;
  imageUrl: string | null;
  images: string[];
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

export interface RecipeInput {
  title: string;
  category: Category;
  imageDataUrls: string[];
  cookTimeMinutes: number;
  servings: number;
  difficulty: Difficulty;
  estimatedCost: number | null;
  notes: string;
  ingredients: Omit<Ingredient, "id">[];
  steps: { text: string; photos: string[] }[];
  isPublic: boolean;
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
  photoUrl: string | null;
  createdAt: number;
}

export interface Comment {
  id: string;
  recipeId: string;
  userId: string;
  text: string;
  imageUrl: string | null;
  createdAt: number;
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

export type NotificationType = "like" | "comment" | "rating" | "fork";

export interface AppNotification {
  id: string;
  userId: string;
  actorId: string;
  type: NotificationType;
  recipeId: string | null;
  read: boolean;
  createdAt: number;
}
