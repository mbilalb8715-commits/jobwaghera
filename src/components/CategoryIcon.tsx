import {
  Briefcase,
  Building2,
  Compass,
  Cpu,
  FlaskConical,
  GraduationCap,
  Hammer,
  Headset,
  Landmark,
  Laptop,
  Palette,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Stethoscope,
  TrendingUp,
  Truck,
  UtensilsCrossed,
  Wrench,
} from 'lucide-react';

const ICON_MAP = {
  Landmark,
  GraduationCap,
  Stethoscope,
  Cpu,
  Wrench,
  Briefcase,
  TrendingUp,
  Building2,
  Truck,
  UtensilsCrossed,
  ShoppingBag,
  Palette,
  Laptop,
  Sprout,
  Scale,
  FlaskConical,
  ShieldCheck,
  Headset,
  Hammer,
  Compass,
} as const;

export function CategoryIcon({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name as keyof typeof ICON_MAP] || Briefcase;
  return <Icon className={className} aria-hidden="true" />;
}
