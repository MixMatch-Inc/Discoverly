'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

const API_BASE = 'http://localhost:3000';

export default function Dashboard() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', imageUrl: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [editing, setEditing] = useState<FoodItem | null>(null);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/restaurant/foods`);
      setFoods(res.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return form.imageUrl;
    const formData = new FormData();
    formData.append('file', imageFile);
    try {
      const res = await axios.post(`${API_BASE}/api/upload`, formData);
      return res.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const imageUrl = await uploadImage();
    const data = { ...form, price: parseFloat(form.price), imageUrl };
    try {
      if (editing) {
        await axios.put(`${API_BASE}/api/restaurant/foods/${editing.id}`, data);
      } else {
        await axios.post(`${API_BASE}/api/restaurant/foods`, data);
      }
      setForm({ name: '', description: '', price: '', imageUrl: '' });
      setImageFile(null);
      setPreview('');
      setEditing(null);
      fetchFoods();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEdit = (food: FoodItem) => {
    setEditing(food);
    setForm({ name: food.name, description: food.description, price: food.price.toString(), imageUrl: food.imageUrl });
    setPreview(food.imageUrl);
    setImageFile(null); // Reset file since we're editing
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE}/api/restaurant/foods/${id}`);
      fetchFoods();
    } catch (error) {
      console.error('Error deleting food:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Restaurant Dashboard</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-8 max-w-md mx-auto">
        <h2 className="text-xl mb-4">{editing ? 'Edit Food Item' : 'Add New Food Item'}</h2>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-4"
        />
        {preview && <img src={preview} alt="Preview" className="w-32 h-32 object-cover mb-4 mx-auto" />}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">{editing ? 'Update' : 'Add'} Food</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', description: '', price: '', imageUrl: '' }); setPreview(''); setImageFile(null); }} className="ml-4 bg-gray-500 text-white p-2 rounded w-full mt-2">Cancel</button>}
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {foods.map((food) => (
          <div key={food.id} className="bg-white p-4 rounded shadow">
            <img src={food.imageUrl} alt={food.name} className="w-full h-48 object-cover mb-4 rounded" />
            <h3 className="text-lg font-bold">{food.name}</h3>
            <p className="text-gray-600 mb-2">{food.description}</p>
            <p className="text-green-600 font-bold">${food.price.toFixed(2)}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => handleEdit(food)} className="bg-yellow-500 text-white p-2 rounded flex-1">Edit</button>
              <button onClick={() => handleDelete(food.id)} className="bg-red-500 text-white p-2 rounded flex-1">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
