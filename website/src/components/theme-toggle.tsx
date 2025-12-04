import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          data-testid="button-theme-toggle"
          aria-label="Changer le thème"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Changer le thème</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          data-testid="menu-theme-light"
          className={theme === "light" ? "bg-accent" : ""}
        >
          <Sun className="mr-2 h-4 w-4" />
          Clair
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          data-testid="menu-theme-dark"
          className={theme === "dark" ? "bg-accent" : ""}
        >
          <Moon className="mr-2 h-4 w-4" />
          Sombre
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          data-testid="menu-theme-system"
          className={theme === "system" ? "bg-accent" : ""}
        >
          <span className="mr-2 h-4 w-4 flex items-center justify-center text-xs">💻</span>
          Système
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
