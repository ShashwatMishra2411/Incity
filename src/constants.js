import { Map as MapIcon, PackageCheck as PackageCheckIcon } from "lucide-react";
import { HeartPulse as HealthIcon } from "lucide-react";
import { Utensils as RecipeIcon } from "lucide-react";
import { Newspaper as NewsIcon } from "lucide-react";
import { Cloud as WeatherIcon } from "lucide-react";
import { DollarSign as FinanceIcon } from "lucide-react";
import { Phone as ContactIcon } from "lucide-react";

export const routes = [
  {
    label: "Places",
    icon: MapIcon,
    href: "/places",
    color: "#3498DB", // blue
  },
  {
    label: "Health Support",
    icon: HealthIcon,
    href: "/health",
    color: "#E74C3C", // red
  },
  {
    label: "Recipes",
    icon: RecipeIcon,
    href: "/recipes",
    color: "#F39C12", // orange
  },
  {
    label: "News",
    icon: NewsIcon,
    href: "/news",
    color: "#8E44AD", // purple
  },
  {
    label: "Weather",
    icon: WeatherIcon,
    href: "/weather",
    color: "#2ECC71", // green
  },
  {
    label: "Finance",
    icon: FinanceIcon,
    href: "/finance",
    color: "#1ABC9C", // teal
  },
  {
    label: "Contact",
    icon: ContactIcon,
    href: "/contact",
    color: "#34495E", // dark blue/gray
  },
  {
    label: "Products",
    icon: PackageCheckIcon,
    href: "/products",
    color: "#FF9900", // Amazon yellow
  },
];
