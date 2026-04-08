import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../hooks/useAuth';
import { MenuItem, Order, UserProfile } from '../types';
import { STATIC_MENU } from '../constants';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  Search,
  Filter,
  ArrowLeft,
  Save,
  X,
  Upload,
  FileText,
  MoreVertical,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '../lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form State for Product
  const [productForm, setProductForm] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    calories: 0,
    image: '',
    tags: [],
    category: 'Lunch',
    healthBenefits: [],
    stock: 100
  });

  useEffect(() => {
    // Fetch Products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as MenuItem));
    });

    // Fetch Orders
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Order));
    });

    // Fetch Users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id }) as UserProfile));
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubUsers();
    };
  }, []);

  const handleSaveProduct = async () => {
    const id = editingProduct?.id || Math.random().toString(36).substr(2, 9);
    const productData = { ...productForm, id } as MenuItem;
    
    try {
      await setDoc(doc(db, 'products', id), productData);
      setIsAddingProduct(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: 0,
        calories: 0,
        image: '',
        tags: [],
        category: 'Lunch',
        healthBenefits: [],
        stock: 100
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${id}`);
    }
  };

  const handleSeedData = async () => {
    if (!confirm('This will populate the database with initial products. Continue?')) return;
    try {
      for (const item of STATIC_MENU) {
        await setDoc(doc(db, 'products', item.id), item);
      }
      alert('Database seeded successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Simulate processing for "Any Format"
    setTimeout(async () => {
      try {
        // Mock data based on file name or just generic "New Product"
        const id = Math.random().toString(36).substr(2, 9);
        const newProduct: MenuItem = {
          id,
          name: file.name.split('.')[0],
          description: `Imported from ${file.name}`,
          price: 15.99,
          calories: 450,
          image: `https://picsum.photos/seed/${id}/400/300`,
          tags: ['Imported', 'New'],
          category: 'Lunch',
          healthBenefits: ['Energy'],
          stock: 50
        };
        
        await setDoc(doc(db, 'products', id), newProduct);
        alert(`Successfully imported ${file.name} as a new product!`);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'products/bulk');
      } finally {
        setIsUploading(false);
      }
    }, 1500);
  };

  // Stats Calculations
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const popularItems = products.map(p => ({
    name: p.name,
    count: orders.reduce((acc, o) => acc + o.items.filter(i => i.id === p.id).reduce((sum, item) => sum + item.quantity, 0), 0)
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  const COLORS = ['#4f6d7a', '#c0d6df', '#ebe9e9', '#f5ebe0', '#d5bdaf'];

  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-primary">Admin Panel</h1>
              <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Manage HealBites Ecosystem</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSeedData} className="rounded-xl font-black uppercase tracking-widest gap-2">
              Seed Data
            </Button>
            <Button onClick={() => setIsAddingProduct(true)} className="rounded-xl font-black uppercase tracking-widest gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </div>
        </header>

        <Tabs defaultValue="stats" className="space-y-8">
          <TabsList className="bg-white p-1 rounded-2xl border border-border/50 shadow-sm">
            <TabsTrigger value="stats" className="rounded-xl font-black uppercase tracking-widest text-[10px] px-6">Statistics</TabsTrigger>
            <TabsTrigger value="inventory" className="rounded-xl font-black uppercase tracking-widest text-[10px] px-6">Inventory</TabsTrigger>
            <TabsTrigger value="products" className="rounded-xl font-black uppercase tracking-widest text-[10px] px-6">Grid View</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-xl font-black uppercase tracking-widest text-[10px] px-6">Orders</TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl font-black uppercase tracking-widest text-[10px] px-6">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 rounded-[1.5rem] border-none shadow-lg shadow-black/5">
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-primary/10 p-2 rounded-xl">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Revenue</p>
                </div>
                <p className="text-3xl font-black text-primary tracking-tighter">${totalRevenue.toFixed(2)}</p>
              </Card>
              <Card className="p-6 rounded-[1.5rem] border-none shadow-lg shadow-black/5">
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-primary/10 p-2 rounded-xl">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Orders</p>
                </div>
                <p className="text-3xl font-black text-primary tracking-tighter">{orders.length}</p>
              </Card>
              <Card className="p-6 rounded-[1.5rem] border-none shadow-lg shadow-black/5">
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-primary/10 p-2 rounded-xl">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Users</p>
                </div>
                <p className="text-3xl font-black text-primary tracking-tighter">{users.length}</p>
              </Card>
              <Card className="p-6 rounded-[1.5rem] border-none shadow-lg shadow-black/5">
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-primary/10 p-2 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Avg Order Value</p>
                </div>
                <p className="text-3xl font-black text-primary tracking-tighter">
                  ${orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'}
                </p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-8 rounded-[2rem] border-none shadow-xl shadow-black/5">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-black uppercase tracking-tighter text-primary">Popular Items</CardTitle>
                  <CardDescription className="text-xs font-bold">Most ordered meals this month</CardDescription>
                </CardHeader>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={popularItems}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#4f6d7a' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#4f6d7a' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontWeight: 900, fontSize: '12px' }}
                      />
                      <Bar dataKey="count" fill="#4f6d7a" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-8 rounded-[2rem] border-none shadow-xl shadow-black/5">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-black uppercase tracking-tighter text-primary">Order Status Distribution</CardTitle>
                  <CardDescription className="text-xs font-bold">Real-time delivery tracking</CardDescription>
                </CardHeader>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pending', value: orders.filter(o => o.status === 'Pending').length },
                          { name: 'Preparing', value: orders.filter(o => o.status === 'Preparing').length },
                          { name: 'Out for Delivery', value: orders.filter(o => o.status === 'Out for Delivery').length },
                          { name: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {orders.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontWeight: 900, fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card className="rounded-[2rem] border-none shadow-xl shadow-black/5 overflow-hidden bg-white">
              <div className="p-8 border-b border-border flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter text-primary">Inventory Management</h2>
                  <p className="text-xs font-bold text-muted-foreground">Detailed view of all products and stock levels</p>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Button variant="outline" className="rounded-xl font-black uppercase tracking-widest gap-2 relative overflow-hidden">
                      {isUploading ? (
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 animate-spin" /> Processing...
                        </span>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" /> Upload Inventory
                        </>
                      )}
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </Button>
                  </div>
                </div>
              </div>
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary py-4 pl-8">Product</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary py-4">Category</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary py-4">Stock</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary py-4">Price</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary py-4">Health Benefits</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary py-4 text-right pr-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="border-border hover:bg-secondary/10 transition-colors group">
                      <TableCell className="py-4 pl-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-border/50">
                            <img src={product.image} className="w-full h-full object-cover" alt={product.name} referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="text-sm font-black uppercase tracking-tight text-primary">{product.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground line-clamp-1">{product.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            (product.stock || 0) > 20 ? "bg-green-500" : (product.stock || 0) > 0 ? "bg-yellow-500" : "bg-red-500"
                          )} />
                          <span className="text-xs font-black text-primary">{product.stock || 0} units</span>
                          <span className="text-[10px] font-bold text-muted-foreground">100%</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-sm font-black text-primary">${product.price.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          {(product.healthBenefits || []).length > 0 ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{product.healthBenefits[0]}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-black uppercase tracking-widest">No benefits</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-right pr-8">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="w-8 h-8 rounded-full"
                            onClick={() => {
                              setEditingProduct(product);
                              setProductForm(product);
                              setIsAddingProduct(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="w-8 h-8 rounded-full text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <Card key={product.id} className="group overflow-hidden rounded-[1.5rem] border-none shadow-lg shadow-black/5">
                  <div className="relative h-40">
                    <img src={product.image} className="w-full h-full object-cover" alt={product.name} referrerPolicy="no-referrer" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="w-8 h-8 rounded-full shadow-lg"
                        onClick={() => {
                          setEditingProduct(product);
                          setProductForm(product);
                          setIsAddingProduct(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="w-8 h-8 rounded-full shadow-lg"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-black uppercase tracking-tighter text-primary">{product.name}</h3>
                      <span className="text-lg font-black text-primary">${product.price.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-bold line-clamp-2 mb-4">{product.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card className="rounded-[2rem] border-none shadow-xl shadow-black/5 overflow-hidden">
              <ScrollArea className="h-[600px]">
                <div className="p-8 space-y-6">
                  {orders.map(order => (
                    <div key={order.id} className="flex flex-col md:flex-row justify-between gap-6 p-6 bg-secondary/20 rounded-2xl border border-border/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <p className="text-lg font-black uppercase tracking-tight text-primary">Order #{order.id}</p>
                          <Badge className="px-3 py-1 text-[8px] font-black rounded-full uppercase tracking-widest">
                            {order.status}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {order.items.map(item => (
                            <p key={item.id} className="text-xs font-bold text-muted-foreground">
                              {item.quantity}x {item.name}
                            </p>
                          ))}
                        </div>
                        <p className="text-xs font-bold text-primary mt-4 uppercase tracking-widest">Customer: {users.find(u => u.uid === order.userId)?.displayName || 'Unknown'}</p>
                      </div>
                      <div className="flex flex-col justify-between items-end">
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Total</p>
                          <p className="text-2xl font-black text-primary tracking-tighter">${order.total.toFixed(2)}</p>
                        </div>
                        <Select 
                          value={order.status} 
                          onValueChange={(val) => handleUpdateOrderStatus(order.id, val as any)}
                        >
                          <SelectTrigger className="w-40 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest border-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Pending" className="text-[10px] font-black uppercase">Pending</SelectItem>
                            <SelectItem value="Preparing" className="text-[10px] font-black uppercase">Preparing</SelectItem>
                            <SelectItem value="Out for Delivery" className="text-[10px] font-black uppercase">Out for Delivery</SelectItem>
                            <SelectItem value="Delivered" className="text-[10px] font-black uppercase">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map(user => (
                <Card key={user.uid} className="p-6 rounded-[1.5rem] border-none shadow-lg shadow-black/5">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} className="w-12 h-12 rounded-full border-2 border-primary/20" alt={user.displayName} referrerPolicy="no-referrer" />
                    <div>
                      <h3 className="text-base font-black uppercase tracking-tight text-primary">{user.displayName}</h3>
                      <p className="text-[10px] text-muted-foreground font-bold">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-muted-foreground">Diet</span>
                      <span className="text-primary">{user.dietType}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-muted-foreground">Goal</span>
                      <span className="text-primary">{user.weightGoal}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddingProduct} onOpenChange={(open) => {
        setIsAddingProduct(open);
        if (!open) {
          setEditingProduct(null);
          setProductForm({
            name: '',
            description: '',
            price: 0,
            calories: 0,
            image: '',
            tags: [],
            category: 'Lunch',
            healthBenefits: []
          });
        }
      }}>
        <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-primary">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name</label>
              <Input 
                value={productForm.name} 
                onChange={e => setProductForm({...productForm, name: e.target.value})}
                className="rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price</label>
              <Input 
                type="number" 
                value={productForm.price} 
                onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})}
                className="rounded-xl font-bold"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</label>
              <Input 
                value={productForm.description} 
                onChange={e => setProductForm({...productForm, description: e.target.value})}
                className="rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Calories</label>
              <Input 
                type="number" 
                value={productForm.calories} 
                onChange={e => setProductForm({...productForm, calories: parseInt(e.target.value)})}
                className="rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stock</label>
              <Input 
                type="number" 
                value={productForm.stock} 
                onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value)})}
                className="rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</label>
              <Select 
                value={productForm.category} 
                onValueChange={val => setProductForm({...productForm, category: val as any})}
              >
                <SelectTrigger className="rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Image URL</label>
              <Input 
                value={productForm.image} 
                onChange={e => setProductForm({...productForm, image: e.target.value})}
                className="rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tags (comma separated)</label>
              <Input 
                value={productForm.tags?.join(', ')} 
                onChange={e => setProductForm({...productForm, tags: e.target.value.split(',').map(t => t.trim())})}
                className="rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Benefits (comma separated)</label>
              <Input 
                value={productForm.healthBenefits?.join(', ')} 
                onChange={e => setProductForm({...productForm, healthBenefits: e.target.value.split(',').map(t => t.trim())})}
                className="rounded-xl font-bold"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddingProduct(false)} className="rounded-xl font-black uppercase tracking-widest">Cancel</Button>
            <Button onClick={handleSaveProduct} className="rounded-xl font-black uppercase tracking-widest gap-2">
              <Save className="w-4 h-4" /> Save Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
