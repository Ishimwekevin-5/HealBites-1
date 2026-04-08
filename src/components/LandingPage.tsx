import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Truck, Heart, ShieldCheck, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => void;
  isSigningIn?: boolean;
}

export function LandingPage({ onSignIn, isSigningIn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Leaf className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">HealBites</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#menu" className="hover:text-primary transition-colors">Menu</a>
          <a href="#about" className="hover:text-primary transition-colors">About</a>
        </div>
        <Button variant="outline" size="sm" onClick={onSignIn} disabled={isSigningIn} className="rounded-full px-5">
          {isSigningIn ? 'Signing in...' : 'Sign In'}
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-8 pb-16 max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-black leading-[1] mb-4 text-primary uppercase tracking-tighter">
            Eat for the <br />
            <span className="text-foreground italic font-light">Life You Want.</span>
          </h1>
          <p className="text-base text-muted-foreground mb-6 max-w-sm font-medium">
            Personalized healthy meals delivered to your door, tailored to your specific health goals and dietary needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="default" onClick={onSignIn} disabled={isSigningIn} className="gap-2 rounded-full px-6 h-11 text-sm font-bold">
              {isSigningIn ? 'Connecting...' : 'Get Started with Google'} <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="default" className="rounded-full px-6 h-11 text-sm font-bold">View Menu</Button>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <img 
                  key={i}
                  src={`https://picsum.photos/seed/user${i}/100/100`}
                  className="w-8 h-8 rounded-full border-2 border-background object-cover"
                  referrerPolicy="no-referrer"
                  alt="User"
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground font-semibold">
              <span className="font-black text-foreground">500+</span> healthy eaters joined this week
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="rounded-[2rem] overflow-hidden shadow-xl rotate-1 hover:rotate-0 transition-transform duration-500 border-4 border-white">
            <img 
              src="https://picsum.photos/seed/healthy-food/1200/1600" 
              alt="Healthy Meal" 
              className="w-full h-[450px] object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Floating Badge */}
          <Card className="absolute -bottom-4 -left-4 p-4 rounded-2xl shadow-xl max-w-[180px] border-none bg-white/90 backdrop-blur-md">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-green-100 p-1.5 rounded-full">
                  <ShieldCheck className="text-green-600 w-4 h-4" />
                </div>
                <span className="font-black text-[10px] uppercase tracking-tight">Nutritionist Approved</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold leading-tight">Every meal is balanced by certified experts.</p>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-16 px-6 rounded-[2.5rem] mx-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3 uppercase tracking-tighter text-primary">Why HealBites?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto font-bold text-base">We don't just deliver food; we deliver a healthier version of you.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: "Health-First", desc: "Meals tagged for diabetes, heart health, weight loss, and more." },
              { icon: Truck, title: "Fresh Delivery", desc: "Always fresh, never frozen. Straight from our kitchen to your table." },
              { icon: ShieldCheck, title: "Expert Crafted", desc: "Designed by nutritionists to ensure you get exactly what you need." }
            ].map((feature, i) => (
              <div key={i} className="text-center group">
                <div className="bg-background w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black mb-1 uppercase tracking-tight">{feature.title}</h3>
                <p className="text-xs text-muted-foreground font-bold leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-10 px-6 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6" />
            <span className="text-lg font-black uppercase tracking-tighter">HealBites</span>
          </div>
          <p className="text-xs font-bold opacity-70">© 2026 HealBites. All rights reserved.</p>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest opacity-70">
            <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
