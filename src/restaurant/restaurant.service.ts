import { Injectable } from '@nestjs/common';
import { CreateFoodDto, UpdateFoodDto } from './dto/food.dto';

interface Food {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

@Injectable()
export class RestaurantService {
  private foods: Food[] = [];
  private idCounter = 1;

  create(createFoodDto: CreateFoodDto): Food {
    const food: Food = { ...createFoodDto, id: this.idCounter.toString() };
    this.foods.push(food);
    this.idCounter++;
    return food;
  }

  findAll(): Food[] {
    return this.foods;
  }

  findOne(id: string): Food | undefined {
    return this.foods.find(f => f.id === id);
  }

  update(id: string, updateFoodDto: UpdateFoodDto): Food | null {
    const index = this.foods.findIndex(f => f.id === id);
    if (index === -1) return null;
    this.foods[index] = { ...this.foods[index], ...updateFoodDto };
    return this.foods[index];
  }

  remove(id: string): boolean {
    const index = this.foods.findIndex(f => f.id === id);
    if (index === -1) return false;
    this.foods.splice(index, 1);
    return true;
  }
}