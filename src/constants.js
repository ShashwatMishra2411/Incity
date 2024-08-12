import { Map as MapIcon } from "lucide-react";
import { HeartPulse as HealthIcon } from "lucide-react";
import { Utensils as RecipeIcon } from "lucide-react";
import { Newspaper as NewsIcon } from "lucide-react";
import { Cloud as WeatherIcon } from "lucide-react";
import { DollarSign as FinanceIcon } from "lucide-react";
import { Phone as ContactIcon } from "lucide-react";

export const routes = [
  {
    label: "Maps",
    icon: MapIcon, // Replace with the actual icon component for Maps
    href: "/maps",
    color: "#3498DB", // blue
  },
  {
    label: "Health Support",
    icon: HealthIcon, // Replace with the actual icon component for Health Support
    href: "/health",
    color: "#E74C3C", // red
  },
  {
    label: "Recipes",
    icon: RecipeIcon, // Replace with the actual icon component for Recipes
    href: "/recipes",
    color: "#F39C12", // orange
  },
  {
    label: "News",
    icon: NewsIcon, // Replace with the actual icon component for News
    href: "/news",
    color: "#8E44AD", // purple
  },
  {
    label: "Weather",
    icon: WeatherIcon, // Replace with the actual icon component for Weather
    href: "/weather",
    color: "#2ECC71", // green
  },
  {
    label: "Finance",
    icon: FinanceIcon, // Replace with the actual icon component for Finance
    href: "/finance",
    color: "#1ABC9C", // teal
  },
  {
    label: "Contact",
    icon: ContactIcon, // Replace with the actual icon component for Contact
    href: "/contact",
    color: "#34495E", // dark blue/gray
  },
];
