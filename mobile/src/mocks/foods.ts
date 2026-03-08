export type MockFoodItem = {
  id: string;
  name: string;
  restaurant: string;
  price: number;
  imageUrl: string;
};

export const mockFoodItems: MockFoodItem[] = [
  {
    id: "food_001",
    name: "Truffle Smash Burger",
    restaurant: "Grill House",
    price: 14.5,
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "food_002",
    name: "Spicy Ramen Bowl",
    restaurant: "Nori Lab",
    price: 13.25,
    imageUrl:
      "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "food_003",
    name: "Pesto Burrata Pizza",
    restaurant: "Firestone Pizza",
    price: 16.0,
    imageUrl:
      "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "food_004",
    name: "Korean Fried Chicken",
    restaurant: "Seoul Bites",
    price: 12.75,
    imageUrl:
      "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "food_005",
    name: "Avocado Salmon Poke",
    restaurant: "Pacific Greens",
    price: 15.0,
    imageUrl:
      "https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "food_006",
    name: "Mango Sticky Rice",
    restaurant: "Bangkok Sweet",
    price: 8.5,
    imageUrl:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=80",
  },
];
