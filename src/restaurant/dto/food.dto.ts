export class CreateFoodDto {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export class UpdateFoodDto {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}