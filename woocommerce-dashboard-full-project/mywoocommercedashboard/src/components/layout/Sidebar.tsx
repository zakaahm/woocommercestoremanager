import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  styled,
  Divider
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  Upload as ImportIcon,
  Settings as SettingsIcon,
  Store as StoreIcon
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: DashboardIcon },
  { label: "Producten", path: "/products", icon: ProductsIcon },
  { label: "Import CSV", path: "/import", icon: ImportIcon },
  { label: "Instellingen", path: "/settings", icon: SettingsIcon }
];

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: 260,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: 260,
    boxSizing: "border-box",
    background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
    color: "#ffffff",
    borderRight: "none",
    boxShadow: "4px 0 24px rgba(0, 0, 0, 0.12)"
  }
}));

const StyledListItem = styled(ListItem)<{ selected?: boolean }>(
  ({ theme, selected }) => ({
    margin: theme.spacing(0.5, 1.5),
    borderRadius: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    color: selected ? "#ffffff" : "rgba(255, 255, 255, 0.7)",
    backgroundColor: selected
      ? "rgba(99, 102, 241, 0.2)"
      : "transparent",
    border: selected ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid transparent",
    "&:hover": {
      backgroundColor: selected
        ? "rgba(99, 102, 241, 0.25)"
        : "rgba(255, 255, 255, 0.05)",
      color: "#ffffff",
      transform: "translateX(4px)",
      "& .MuiListItemIcon-root": {
        color: "#6366f1"
      }
    },
    "& .MuiListItemIcon-root": {
      color: selected ? "#6366f1" : "rgba(255, 255, 255, 0.6)",
      minWidth: 40,
      transition: "color 0.3s ease"
    },
    "& .MuiListItemText-primary": {
      fontWeight: selected ? 600 : 400,
      fontSize: "0.95rem"
    }
  })
);

const LogoBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 2.5),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5)
}));

const LogoIcon = styled(StoreIcon)(({ theme }) => ({
  fontSize: 32,
  color: "#6366f1",
  filter: "drop-shadow(0 2px 8px rgba(99, 102, 241, 0.4))"
}));

export default function Sidebar() {
  const location = useLocation();

  return (
    <StyledDrawer variant="permanent" anchor="left">
      <LogoBox>
        <LogoIcon />
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.5px",
              lineHeight: 1.2,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            WooCommerce
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: "0.7rem",
              letterSpacing: "0.5px"
            }}
          >
            Management Tool
          </Typography>
        </Box>
      </LogoBox>

      <Divider
        sx={{
          borderColor: "rgba(255, 255, 255, 0.08)",
          mx: 2,
          mb: 2
        }}
      />

      <List sx={{ px: 0 }}>
        {navItems.map(({ label, path, icon: Icon }) => (
          <StyledListItem
            button
            key={path}
            component={Link}
            to={path}
            selected={location.pathname === path}
          >
            <ListItemIcon>
              <Icon />
            </ListItemIcon>
            <ListItemText primary={label} />
          </StyledListItem>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Box
        sx={{
          p: 2.5,
          m: 2,
          borderRadius: 2,
          background: "rgba(99, 102, 241, 0.1)",
          border: "1px solid rgba(99, 102, 241, 0.2)"
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255, 255, 255, 0.6)",
            display: "block",
            mb: 0.5,
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}
        >
          Versie
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#ffffff",
            fontWeight: 600
          }}
        >
          v1.0.0
        </Typography>
      </Box>
    </StyledDrawer>
  );
}