import mongoose from "mongoose"
import { connectDatabase } from "../src/config/database.js"
import { FoodItemModel, RestaurantModel } from "../src/models/index.js"

async function seed() {
  await connectDatabase()

  const restaurantName = "Discoverly Demo Kitchen"
  const imageBase = "https://images.unsplash.com"

  await FoodItemModel.deleteMany({})
  await RestaurantModel.deleteMany({ name: restaurantName })

  const restaurant = await RestaurantModel.create({
    owner_user_id: new mongoose.Types.ObjectId(),
    name: restaurantName,
    location: {
      type: "Point",
      coordinates: [-74.006, 40.7128],
    },
    stellar_wallet: "GBDEMORESTAURANTWALLET",
    is_active: true,
  })

  const foodItems = [
    {
      restaurant_id: restaurant._id,
      owner_user_id: restaurant.owner_user_id,
      name: "Spicy Smash Burger",
      description: "Double patty, chili aioli, pickles, toasted brioche.",
      price: 13.99,
      image_url: `${imageBase}/photo-1550547660-d9450f859349`,
    },
    {
      restaurant_id: restaurant._id,
      owner_user_id: restaurant.owner_user_id,
      name: "Truffle Fries",
      description: "Hand-cut fries, truffle oil, parmesan, parsley.",
      price: 7.5,
      image_url: `${imageBase}/photo-1573080496219-bb080dd4f877`,
    },
    {
      restaurant_id: restaurant._id,
      owner_user_id: restaurant.owner_user_id,
      name: "Firecracker Pizza",
      description: "Pepperoni, jalapeno, hot honey, mozzarella.",
      price: 15.25,
      image_url: `${imageBase}/photo-1513104890138-7c749659a591`,
    },
    {
      restaurant_id: restaurant._id,
      owner_user_id: restaurant.owner_user_id,
      name: "Mango Citrus Bowl",
      description: "Fresh mango, avocado, greens, citrus vinaigrette.",
      price: 11.0,
      image_url: `${imageBase}/photo-1546069901-ba9599a7e63c`,
    },
    {
      restaurant_id: restaurant._id,
      owner_user_id: restaurant.owner_user_id,
      name: "Midnight Tiramisu",
      description: "Espresso-soaked layers with mascarpone cream.",
      price: 8.75,
      image_url: `${imageBase}/photo-1571877227200-a0d98ea607e9`,
    },
  ]

  await FoodItemModel.insertMany(foodItems)

  console.log("Seed complete:")
  console.log(`- Restaurant: ${restaurant.name}`)
  console.log(`- Food items: ${foodItems.length}`)
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
