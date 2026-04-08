import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Utensils, 
  History, 
  User, 
  LogOut, 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  CheckCircle2,
  Search,
  Filter,
  Flame,
  Zap,
  ShieldCheck,
  Leaf,
  Settings,
  Star,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STATIC_MENU } from '../constants';
import { useCart } from '../hooks/useCart';
import { UserProfile, MenuItem, Order } from '../types';
import { cn } from '../lib/utils';
import { db } from '../hooks/useAuth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  setDoc, 
  doc, 
  updateDoc,
  orderBy
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';

interface DashboardProps {
  user: UserProfile;
  onSignOut: () => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
}

export function Dashboard({ user, onSignOut, isAdmin, onOpenAdmin }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'menu' | 'history' | 'profile'>('menu');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    // Fetch Products from Firestore
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as MenuItem[];
      
      // If no products in Firestore, use STATIC_MENU as fallback/seed
      if (productsData.length === 0) {
        setProducts(STATIC_MENU);
      } else {
        setProducts(productsData);
      }
    });

    const q = query(
      collection(db, 'orders'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Order[];
      setOrders(ordersData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => {
      unsubProducts();
      unsubscribe();
    };
  }, [user.uid]);

  // Recommendation Algorithm
  const getRecommendations = () => {
    return products.filter(item => {
      // Match diet type
      const dietMatch = user.dietType === 'None' || item.tags.includes(user.dietType);
      
      // Match health preferences
      const preferenceMatch = user.healthPreferences.some(pref => 
        item.healthBenefits.includes(pref) || item.tags.includes(pref)
      );

      return dietMatch || preferenceMatch;
    }).slice(0, 3);
  };

  const recommendedMenu = getRecommendations();

  // Enhanced Search Engine
  const filteredMenu = products.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      item.name.toLowerCase().includes(searchLower) || 
      item.description.toLowerCase().includes(searchLower) ||
      item.tags.some(t => t.toLowerCase().includes(searchLower)) ||
      item.healthBenefits.some(b => b.toLowerCase().includes(searchLower));
      
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    
    const orderId = Math.random().toString(36).substr(2, 9);
    const newOrder: Order = {
      id: orderId,
      userId: user.uid,
      items: [...cart],
      total,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      address: '123 Healthy St, Wellness City'
    };

    try {
      await setDoc(doc(db, 'orders', orderId), newOrder);
      clearCart();
      setIsCartOpen(false);
      setActiveTab('history');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${orderId}`);
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      await updateDoc(doc(db, 'users', user.uid), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-border flex flex-col fixed h-full z-20 shadow-sm">
        <div className="p-6 flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg shadow-md shadow-primary/20">
            <Leaf className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="text-lg font-black tracking-tighter text-primary uppercase">HealBites</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {[
            { id: 'menu', icon: Utensils, label: 'Menu' },
            { id: 'history', icon: History, label: 'Orders' },
            {id: 'profile', icon: User, label: 'Profile' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                  : "text-muted-foreground hover:bg-secondary hover:text-primary"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
          
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-primary hover:bg-primary/10"
            >
              <Settings className="w-4 h-4" />
              Admin Panel
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-2xl mb-3 border border-border/50">
            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
              <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} referrerPolicy="no-referrer" />
              <AvatarFallback className="font-black text-xs">{user.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate text-primary uppercase tracking-tight">{user.displayName}</p>
              <p className="text-[10px] text-muted-foreground truncate font-bold">{user.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="w-full flex items-center justify-start gap-3 px-4 py-4 rounded-xl text-xs font-black text-destructive hover:bg-destructive/10 hover:text-destructive transition-all uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-60 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-primary">
              {activeTab === 'menu' && "What's for lunch?"}
              {activeTab === 'history' && "Your Orders"}
              {activeTab === 'profile' && "Your Profile"}
            </h1>
            <p className="text-sm text-muted-foreground font-bold mt-1">
              {activeTab === 'menu' && `Based on your ${user.dietType} diet goals.`}
              {activeTab === 'history' && "Track your healthy journey."}
              {activeTab === 'profile' && "Keep your preferences up to date."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="relative w-12 h-12 rounded-2xl border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all shadow-sm"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-6 h-6 text-primary" />
              {cart.length > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-background shadow-lg">
                  {cart.reduce((acc, i) => acc + i.quantity, 0)}
                </Badge>
              )}
            </Button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Recommendations Section */}
              {recommendedMenu.length > 0 && searchQuery === '' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-primary">Recommended for You</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendedMenu.map(item => (
                      <Card key={`rec-${item.id}`} className="group relative overflow-hidden rounded-xl border-none shadow-md shadow-black/5 h-32 flex">
                        <div className="w-1/3 h-full">
                          <img src={item.image} className="w-full h-full object-cover" alt={item.name} referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 p-3 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-tight text-primary truncate">{item.name}</h4>
                            <p className="text-[10px] text-muted-foreground font-bold line-clamp-2 leading-tight">{item.description}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-primary">${item.price.toFixed(2)}</span>
                            <Button size="icon" variant="ghost" className="w-6 h-6 rounded-full bg-primary/10 text-primary" onClick={() => addToCart(item)}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    type="text" 
                    placeholder="Search healthy meals..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 h-11 bg-white border-border rounded-xl focus:ring-primary/20 font-bold text-sm shadow-sm"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {['All', 'Breakfast', 'Lunch', 'Dinner'].map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "secondary"}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "px-6 h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm",
                        selectedCategory === cat ? "shadow-md shadow-primary/20" : ""
                      )}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenu.map((item) => (
                  <Card key={item.id} className="group hover:scale-[1.02] transition-all duration-500 border-none shadow-lg shadow-black/5 overflow-hidden rounded-[1.5rem]">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                        {item.tags.map(tag => (
                          <Badge key={tag} className="bg-white/90 backdrop-blur-md text-[8px] font-black px-2 py-0.5 rounded-full text-primary uppercase tracking-widest border-none shadow-sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <CardHeader className="px-6 pt-6 pb-2">
                      <div className="flex justify-between items-start mb-1">
                        <CardTitle className="text-lg font-black uppercase tracking-tighter text-primary">{item.name}</CardTitle>
                        <span className="text-lg font-black text-primary">${item.price.toFixed(2)}</span>
                      </div>
                      <CardDescription className="text-xs text-muted-foreground font-bold line-clamp-2 leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-2">
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          {item.calories} kcal
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-yellow-500" />
                          {item.healthBenefits[0]}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="px-6 pb-6">
                      <Button 
                        size="sm"
                        className="w-full gap-2 rounded-xl h-11 text-xs font-black uppercase tracking-widest shadow-md shadow-primary/20" 
                        onClick={() => addToCart(item)}
                      >
                        <Plus className="w-4 h-4" /> Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {orders.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[2rem] shadow-sm border border-border/50">
                  <History className="w-16 h-16 text-muted/20 mx-auto mb-4" />
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-primary">No orders yet</h3>
                  <p className="text-muted-foreground font-bold mb-8 text-base">Start your healthy journey today!</p>
                  <Button size="default" className="rounded-full px-8 h-11 font-black uppercase tracking-widest" onClick={() => setActiveTab('menu')}>Browse Menu</Button>
                </div>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="p-6 rounded-[1.5rem] border-none shadow-lg shadow-black/5">
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-green-100 text-green-600 p-2 rounded-xl shadow-sm">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-base font-black uppercase tracking-tight text-primary">Order #{order.id}</p>
                            <p className="text-xs text-muted-foreground font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Badge variant="secondary" className="ml-auto md:ml-4 px-3 py-1 text-[8px] font-black rounded-full uppercase tracking-widest shadow-sm">
                            {order.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {order.items.map(item => (
                            <div key={item.id} className="flex justify-between text-xs font-bold text-muted-foreground">
                              <span>{item.quantity}x {item.name}</span>
                              <span className="font-black text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Separator orientation="vertical" className="hidden md:block h-auto" />
                      <div className="flex flex-col justify-between min-w-[150px]">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-black mb-1 uppercase tracking-widest">Total Amount</p>
                          <p className="text-2xl font-black text-primary tracking-tighter">${order.total.toFixed(2)}</p>
                        </div>
                        <Button variant="outline" size="sm" className="mt-6 rounded-xl h-10 font-black uppercase tracking-widest border-2">Track Order</Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <Card className="p-8 rounded-[2rem] border-none shadow-xl shadow-black/5">
                <div className="flex items-center gap-6 mb-8">
                  <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                    <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} referrerPolicy="no-referrer" />
                    <AvatarFallback className="text-2xl font-black">{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter text-primary">{user.displayName}</h3>
                    <p className="text-lg text-muted-foreground font-bold">{user.email}</p>
                    <Badge variant="secondary" className="mt-2 px-3 py-0.5 text-[8px] font-black uppercase tracking-widest">
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Diet Type</label>
                    <Select 
                      value={user.dietType}
                      onValueChange={(val) => handleUpdateProfile({ dietType: val as any })}
                    >
                      <SelectTrigger className="h-12 rounded-xl font-black text-primary border-2 border-border/50 bg-secondary/20 uppercase tracking-tight text-xs">
                        <SelectValue placeholder="Select diet" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-xl">
                        {["Vegan", "Vegetarian", "Keto", "Paleo", "Gluten-Free", "None"].map(diet => (
                          <SelectItem key={diet} value={diet} className="font-bold uppercase tracking-tight py-2 text-xs">{diet}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Weight Goal</label>
                    <Select 
                      value={user.weightGoal}
                      onValueChange={(val) => handleUpdateProfile({ weightGoal: val as any })}
                    >
                      <SelectTrigger className="h-12 rounded-xl font-black text-primary border-2 border-border/50 bg-secondary/20 uppercase tracking-tight text-xs">
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-xl">
                        {["Lose Weight", "Maintain", "Gain Muscle"].map(goal => (
                          <SelectItem key={goal} value={goal} className="font-bold uppercase tracking-tight py-2 text-xs">{goal}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Health Preferences</label>
                  <div className="flex flex-wrap gap-2">
                    {user.healthPreferences.map(pref => (
                      <Badge key={pref} variant="outline" className="px-4 py-1.5 rounded-xl text-xs font-bold text-muted-foreground border-2 uppercase tracking-tight">
                        {pref}
                      </Badge>
                    ))}
                    <Button variant="ghost" size="sm" className="px-4 h-9 border-2 border-dashed border-muted/30 rounded-xl text-[10px] font-black text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all uppercase tracking-tight">
                      + Add Preference
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Energy', value: '85%', color: 'bg-yellow-400' },
                  { label: 'Immunity', value: '92%', color: 'bg-green-400' },
                  { label: 'Focus', value: '78%', color: 'bg-blue-400' }
                ].map(stat => (
                  <Card key={stat.label} className="p-4 text-center rounded-[1.5rem] border-none shadow-lg shadow-black/5">
                    <p className="text-[10px] text-muted-foreground font-black mb-1 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-black text-primary tracking-tighter mb-3">{stat.value}</p>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full shadow-sm", stat.color)} style={{ width: stat.value }} />
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-primary/20 backdrop-blur-md z-30"
            />
            <motion.aside 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.05)] z-40 flex flex-col rounded-l-[2rem]"
            >
              <div className="p-8 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-primary">Your Cart</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full hover:bg-secondary">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <ScrollArea className="flex-1 px-8 py-6">
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingCart className="w-16 h-16 text-muted/10 mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground font-bold">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 group">
                        <div className="relative w-16 h-16 shrink-0 rounded-[1rem] overflow-hidden shadow-md">
                          <img 
                            src={item.image} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            referrerPolicy="no-referrer"
                            alt={item.name}
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h4 className="text-sm font-black uppercase tracking-tight text-primary truncate">{item.name}</h4>
                          <p className="text-base font-black text-primary mt-0.5">${item.price.toFixed(2)}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center bg-secondary rounded-lg p-0.5">
                              <Button 
                                variant="ghost"
                                size="icon"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 rounded-md hover:bg-white shadow-sm transition-all"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                              <Button 
                                variant="ghost"
                                size="icon"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 rounded-md hover:bg-white shadow-sm transition-all"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted/30 hover:text-destructive hover:bg-destructive/5 rounded-full self-center w-8 h-8"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {cart.length > 0 && (
                <div className="p-8 border-t border-border bg-secondary/10 rounded-tl-[2rem]">
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span className="font-black text-primary">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <span>Delivery</span>
                      <span className="font-black text-primary">$0.00</span>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between text-2xl font-black uppercase tracking-tighter text-primary">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button className="w-full h-12 rounded-xl text-base font-black uppercase tracking-widest shadow-lg shadow-primary/30" onClick={handlePlaceOrder}>
                    Place Order
                  </Button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
