import React from 'react';
import {
  Briefcase,
  Laptop,
  Store,
  TrendingUp,
  Award,
  Building,
  Building2,
  GraduationCap,
  Users,
  CircleDollarSign,
  HelpCircle
} from 'lucide-react';

const iconMap = {
  Briefcase,
  Laptop,
  Store,
  TrendingUp,
  Award,
  Building,
  Building2,
  GraduationCap,
  Users,
  CircleDollarSign,
};

export default function CategoryIcon({ name, className = 'w-4 h-4' }) {
  const IconComponent = iconMap[name] || HelpCircle;
  return <IconComponent className={className} />;
}
