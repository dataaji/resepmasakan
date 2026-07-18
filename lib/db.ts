import {
  Profile,
  Recipe,
  Like,
  Bookmark,
  Rating,
  Comment,
  RecipeReport,
  CommentReport,
  Ingredient,
  Step,
  Category,
  Difficulty,
  UserRole,
  UserStatus,
  ReportStatus,
} from "./types";
import { uid } from "./utils";

function hashIndex(id: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % mod;
}

export function rowToProfile(row: any): Profile {
  return {
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url ?? null,
    role: row.role as UserRole,
    status: row.status as UserStatus,
  };
}

export function rowToRecipe(row: any): Recipe {
  const ingredients: Ingredient[] = (row.ingredients ?? []).map((i: any) => ({
    id: uid(),
    name: i.name ?? "",
    qty: i.qty ?? null,
    unit: i.unit ?? null,
    secukupnya: !!i.secukupnya,
  }));
  const steps: Step[] = (row.steps ?? []).map((text: any, idx: number) => ({
    id: uid(),
    n: idx + 1,
    text: String(text),
  }));
  const images: string[] = Array.isArray(row.images)
    ? row.images.filter((x: any) => typeof x === "string")
    : [];
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category as Category,
    imageUrl: row.image_url ?? images[0] ?? null,
    images,
    placeholderIndex: hashIndex(row.id, 6),
    cookTimeMinutes: row.cook_time_minutes ?? 0,
    servings: row.servings ?? 1,
    difficulty: row.difficulty as Difficulty,
    estimatedCost: row.estimated_cost ?? null,
    notes: row.notes ?? "",
    ingredients,
    steps,
    isPublic: !!row.is_public,
    forkedFromId: row.forked_from_id ?? null,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export function rowToLike(row: any): Like {
  return {
    userId: row.user_id,
    recipeId: row.recipe_id,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export function rowToBookmark(row: any): Bookmark {
  return {
    userId: row.user_id,
    recipeId: row.recipe_id,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export function rowToRating(row: any): Rating {
  return {
    id: row.id,
    userId: row.user_id,
    recipeId: row.recipe_id,
    stars: row.stars,
    photoUrl: row.photo_url ?? null,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export function rowToComment(row: any): Comment {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    userId: row.user_id,
    text: row.text,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export function rowToRecipeReport(row: any): RecipeReport {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    reporterId: row.reporter_id,
    reason: row.reason ?? "",
    status: row.status as ReportStatus,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export function rowToNotification(row: any): import("./types").AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    actorId: row.actor_id,
    type: row.type,
    recipeId: row.recipe_id ?? null,
    read: !!row.read,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export function rowToCommentReport(row: any): CommentReport {
  return {
    id: row.id,
    commentId: row.comment_id,
    reporterId: row.reporter_id,
    reason: row.reason ?? "",
    status: row.status as ReportStatus,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export function recipeInputToRow(
  input: {
    title: string;
    category: Category;
    cookTimeMinutes: number;
    servings: number;
    difficulty: Difficulty;
    estimatedCost: number | null;
    notes: string;
    ingredients: Omit<Ingredient, "id">[];
    steps: { text: string }[];
    isPublic: boolean;
  },
  imageUrls: string[],
  userId: string
) {
  return {
    user_id: userId,
    title: input.title,
    category: input.category,
    image_url: imageUrls[0] ?? null,
    images: imageUrls,
    cook_time_minutes: input.cookTimeMinutes,
    servings: input.servings,
    difficulty: input.difficulty,
    estimated_cost: input.estimatedCost,
    notes: input.notes,
    ingredients: input.ingredients.map((i) => ({
      name: i.name,
      qty: i.qty,
      unit: i.unit,
      secukupnya: i.secukupnya,
    })),
    steps: input.steps.map((s) => s.text),
    is_public: input.isPublic,
  };
}

export function upsertById<T extends { id: string }>(list: T[], items: T[]): T[] {
  const map = new Map(list.map((x) => [x.id, x]));
  for (const item of items) map.set(item.id, item);
  return Array.from(map.values());
}

export function upsertByPair<T extends { userId: string; recipeId: string }>(
  list: T[],
  items: T[]
): T[] {
  const key = (x: T) => `${x.userId}|${x.recipeId}`;
  const map = new Map(list.map((x) => [key(x), x]));
  for (const item of items) map.set(key(item), item);
  return Array.from(map.values());
}
