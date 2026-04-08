export type DietType = 'Vegan' | 'Vegetarian' | 'Keto' | 'Paleo' | 'Gluten-Free' | 'None';
export type WeightGoal = 'Lose Weight' | 'Maintain' | 'Gain Muscle';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  dietType: DietType;
  weightGoal: WeightGoal;
  healthPreferences: string[];
  createdAt: string;
  role?: 'admin' | 'user';
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  calories: number;
  image: string;
  tags: string[]; // e.g., "Diabetes-friendly", "High-protein"
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  healthBenefits: string[]; // e.g., "Energy", "Immunity"
  stock?: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Preparing' | 'Out for Delivery' | 'Delivered';
  createdAt: string;
  address: string;
}
