import { MenuItem } from './types';

export const STATIC_MENU: MenuItem[] = [
  {
    id: '1',
    name: 'Quinoa Power Bowl',
    description: 'A nutrient-dense bowl with roasted sweet potatoes, kale, chickpeas, and a lemon-tahini dressing.',
    price: 14.50,
    calories: 450,
    image: 'https://picsum.photos/seed/quinoa/800/600',
    tags: ['Vegan', 'Gluten-Free', 'High-Fiber'],
    category: 'Lunch',
    healthBenefits: ['Energy', 'Digestion']
  },
  {
    id: '2',
    name: 'Grilled Salmon with Asparagus',
    description: 'Fresh Atlantic salmon grilled to perfection, served with steamed asparagus and a side of brown rice.',
    price: 18.99,
    calories: 520,
    image: 'https://picsum.photos/seed/salmon/800/600',
    tags: ['Keto-friendly', 'High-Protein', 'Omega-3'],
    category: 'Dinner',
    healthBenefits: ['Heart Health', 'Immunity']
  },
  {
    id: '3',
    name: 'Avocado & Egg Sourdough Toast',
    description: 'Smashed avocado on whole-grain sourdough topped with a poached egg and red pepper flakes.',
    price: 11.00,
    calories: 380,
    image: 'https://picsum.photos/seed/avocado/800/600',
    tags: ['Vegetarian', 'Heart-Healthy'],
    category: 'Breakfast',
    healthBenefits: ['Brain Health', 'Energy']
  },
  {
    id: '4',
    name: 'Lentil & Spinach Soup',
    description: 'Hearty lentil soup with fresh spinach, carrots, and a touch of cumin.',
    price: 9.50,
    calories: 320,
    image: 'https://picsum.photos/seed/lentil/800/600',
    tags: ['Vegan', 'Diabetes-friendly', 'Low-Fat'],
    category: 'Lunch',
    healthBenefits: ['Immunity', 'Weight Loss']
  },
  {
    id: '5',
    name: 'Berry Blast Smoothie Bowl',
    description: 'Mixed berries, banana, and almond milk topped with granola, chia seeds, and fresh fruit.',
    price: 12.00,
    calories: 410,
    image: 'https://picsum.photos/seed/smoothie/800/600',
    tags: ['Vegetarian', 'Antioxidant-Rich'],
    category: 'Breakfast',
    healthBenefits: ['Immunity', 'Skin Health']
  },
  {
    id: '6',
    name: 'Turkey & Hummus Wrap',
    description: 'Lean turkey breast, roasted red pepper hummus, and fresh greens in a whole-wheat wrap.',
    price: 13.00,
    calories: 440,
    image: 'https://picsum.photos/seed/wrap/800/600',
    tags: ['High-Protein', 'Low-Calorie'],
    category: 'Lunch',
    healthBenefits: ['Muscle Recovery', 'Energy']
  }
];
