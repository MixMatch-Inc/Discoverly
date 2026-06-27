export interface CreateFoodItemInput {
  name: string;
  description?: string;
  price: number;
  category: string;
  dietaryTags?: string[];
  imageUrls?: string[];
}

export interface UpdateFoodItemInput {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  dietaryTags?: string[];
  imageUrls?: string[];
}
