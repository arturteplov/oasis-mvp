import {
  Laptop2,
  ChefHat,
  Car,
  BriefcaseBusiness,
  Stethoscope,
  Gavel,
  Palette,
  Building2,
  Sparkles
} from 'lucide-react';

const ICON_MAP = {
  technology: Laptop2,
  culinary: ChefHat,
  driver: Car,
  business: BriefcaseBusiness,
  healthcare: Stethoscope,
  legal: Gavel,
  creative: Palette,
  operations: Building2
};

export const getJobIcon = (iconKey = 'technology') => {
  const Icon = ICON_MAP[iconKey] ?? Sparkles;
  return <Icon className="h-8 w-8 text-oasis-primary" />;
};
