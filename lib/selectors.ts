import { Recipe, Category, Difficulty } from "./types";
import { useAppStore } from "./store";
import { average } from "./utils";

type Store = ReturnType<typeof useAppStore.getState>;

export function ratingsFor(s: Store, recipeId: string) {
  return s.ratings.filter((r) => r.recipeId === recipeId);
}

export function recipeRatingAvg(s: Store, recipeId: string): number {
  return average(ratingsFor(s, recipeId).map((r) => r.stars));
}

export function recipeRatingCount(s: Store, recipeId: string): number {
  return ratingsFor(s, recipeId).length;
}

export function recipeLikeCount(s: Store, recipeId: string): number {
  return s.likes.filter((l) => l.recipeId === recipeId).length;
}

export function commentsFor(s: Store, recipeId: string) {
  return s.comments
    .filter((c) => c.recipeId === recipeId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function isLikedBy(s: Store, userId: string | null, recipeId: string): boolean {
  if (!userId) return false;
  return s.likes.some((l) => l.userId === userId && l.recipeId === recipeId);
}

export function isBookmarkedBy(s: Store, userId: string | null, recipeId: string): boolean {
  if (!userId) return false;
  return s.bookmarks.some((b) => b.userId === userId && b.recipeId === recipeId);
}

export function ratingByUser(s: Store, userId: string | null, recipeId: string) {
  if (!userId) return undefined;
  return s.ratings.find((r) => r.userId === userId && r.recipeId === recipeId);
}

export function isVerifiedCommenter(s: Store, userId: string, recipeId: string): boolean {
  return s.ratings.some(
    (r) => r.userId === userId && r.recipeId === recipeId && !!r.photoDataUrl
  );
}

export function authorName(s: Store, userId: string): string {
  return s.users.find((u) => u.id === userId)?.name ?? "Pengguna";
}

export function userById(s: Store, userId: string) {
  return s.users.find((u) => u.id === userId);
}

export function cookPhotosFor(s: Store, recipeId: string) {
  return ratingsFor(s, recipeId)
    .filter((r) => r.photoDataUrl)
    .map((r) => ({
      photoDataUrl: r.photoDataUrl as string,
      author: authorName(s, r.userId),
    }));
}

export interface HomeFilters {
  search: string;
  category: Category | "Semua";
  ingredient: string;
  time: "Semua" | "15" | "30" | "60" | "60+";
  difficulty: Difficulty | "Semua";
  sort: "rating" | "like" | "terbaru" | "termurah";
}

export function publicRecipes(s: Store): Recipe[] {
  return s.recipes.filter((r) => r.isPublic);
}

export function filterAndSortHome(s: Store, f: HomeFilters): Recipe[] {
  let list = publicRecipes(s);

  const search = f.search.trim().toLowerCase();
  if (search) {
    list = list.filter((r) => r.title.toLowerCase().includes(search));
  }
  if (f.category !== "Semua") {
    list = list.filter((r) => r.category === f.category);
  }
  const ingredient = f.ingredient.trim().toLowerCase();
  if (ingredient) {
    list = list.filter((r) =>
      r.ingredients.some((i) => i.name.toLowerCase().includes(ingredient))
    );
  }
  if (f.time !== "Semua") {
    if (f.time === "60+") {
      list = list.filter((r) => r.cookTimeMinutes > 60);
    } else {
      const max = parseInt(f.time, 10);
      list = list.filter((r) => r.cookTimeMinutes <= max);
    }
  }
  if (f.difficulty !== "Semua") {
    list = list.filter((r) => r.difficulty === f.difficulty);
  }

  const withMetric = list.map((r) => ({
    recipe: r,
    rating: recipeRatingAvg(s, r.id),
    likes: recipeLikeCount(s, r.id),
  }));

  withMetric.sort((a, b) => {
    switch (f.sort) {
      case "like":
        return b.likes - a.likes;
      case "terbaru":
        return b.recipe.createdAt - a.recipe.createdAt;
      case "termurah":
        return (a.recipe.estimatedCost ?? Infinity) - (b.recipe.estimatedCost ?? Infinity);
      case "rating":
      default:
        return b.rating - a.rating;
    }
  });

  return withMetric.map((x) => x.recipe);
}

const SEVEN_DAYS = 7 * 86400000;

export function rankingList(
  s: Store,
  period: "all" | "trending",
  category: Category | "Semua"
): Recipe[] {
  let list = publicRecipes(s);
  if (category !== "Semua") list = list.filter((r) => r.category === category);

  if (period === "all") {
    const withMetric = list.map((r) => ({
      recipe: r,
      score: recipeRatingAvg(s, r.id),
      count: recipeRatingCount(s, r.id),
      likes: recipeLikeCount(s, r.id),
    }));
    withMetric.sort(
      (a, b) => b.score - a.score || b.count - a.count || b.likes - a.likes
    );
    return withMetric.map((x) => x.recipe);
  }

  const cutoff = Date.now() - SEVEN_DAYS;
  const withMetric = list.map((r) => {
    const recentRatings = s.ratings.filter(
      (rt) => rt.recipeId === r.id && rt.createdAt >= cutoff
    ).length;
    const recentLikes = s.likes.filter(
      (l) => l.recipeId === r.id && l.createdAt >= cutoff
    ).length;
    return { recipe: r, score: recentRatings * 2 + recentLikes };
  });
  withMetric.sort((a, b) => b.score - a.score);
  return withMetric.filter((x) => x.score > 0).map((x) => x.recipe);
}
