// src/pages/Products/ProductList.tsx

import { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Tooltip,
  Button,
  TextField,
  Chip,
  Avatar,
  Container,
  InputAdornment,
  Divider,
  Alert
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  VisibilityOff as VisibilityOffIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useProducts, useDeleteProduct } from "../../api/products";

const PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 500; // 500ms debounce

export default function ProductList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const navigate = useNavigate();

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset naar pagina 1 bij zoeken
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError } = useProducts(page, PER_PAGE, debouncedSearch);
  const { mutate: deleteProduct } = useDeleteProduct();

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Weet je zeker dat je "${name}" wilt verwijderen?`)) {
      deleteProduct(id);
    }
  };
  const store = JSON.parse(localStorage.getItem("woo_dashboard_auth") || "{}");
  const getStatusColor = (status: string) => {
    switch (status) {
      case "publish":
        return "success";
      case "draft":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "publish":
        return "Gepubliceerd";
      case "draft":
        return "Concept";
      default:
        return status;
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "instock":
        return "success";
      case "outofstock":
        return "error";
      case "onbackorder":
        return "warning";
      default:
        return "default";
    }
  };

  const getStockStatusLabel = (status: string) => {
    switch (status) {
      case "instock":
        return "Op voorraad";
      case "outofstock":
        return "Uitverkocht";
      case "onbackorder":
        return "Nabestelling";
      default:
        return status;
    }
  };

  if (isError) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography color="error" variant="h6">
          Fout bij laden van producten
        </Typography>
      </Container>
    );
  }

  return (
    <>
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <InventoryIcon sx={{ fontSize: 32, color: "primary.main" }} />
            <Box>
              <Typography variant="h4">Producten</Typography>
              <Typography variant="body2" color="text.secondary">
                {data?.total ?? 0} {data?.total === 1 ? "product" : "producten"} gevonden
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate("/products/new")}
          >
            Nieuw product
          </Button>
        </Box>
      <Divider sx={{ my: 2 }} />

      <Typography variant="body1" gutterBottom>
        Bekijk alle producten in je winkel
      </Typography>

      {store?.storeUrl && (
        <Alert severity="info" sx={{ mb: 2 }}>
            <a href={`${store.storeUrl}/winkel`} target="_blank" rel="noopener noreferrer">
             {store.storeUrl}/winkel
            </a>
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />
        {/* Search */}
        <Paper sx={{ p: 2 }}>
          <TextField
            placeholder="Zoek op naam of SKU..."
            variant="outlined"
            size="medium"
            fullWidth
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }
            }}
          />
        </Paper>

        {/* Table */}
        <TableContainer component={Paper} elevation={2} sx={{ position: "relative", minHeight: 400 }}>
          {isLoading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "rgba(255, 255, 255, 0.7)",
                zIndex: 1
              }}
            >
              <CircularProgress size={48} />
            </Box>
          )}
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell width={80}>Afbeelding</TableCell>
                <TableCell>Naam</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Categorie</TableCell>
                <TableCell>Prijs</TableCell>
                <TableCell align="center">Voorraad</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right" width={150}>Acties</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      Geen producten gevonden
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((product: any) => (
                  <TableRow 
                    key={product.id} 
                    hover
                    sx={{ 
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" }
                    }}
                  >
                    <TableCell>
                      {product.images?.[0]?.src ? (
                        <Avatar
                          src={product.images[0].src}
                          alt={product.name}
                          variant="rounded"
                          sx={{ width: 56, height: 56 }}
                        />
                      ) : (
                        <Avatar
                          variant="rounded"
                          sx={{ width: 56, height: 56, bgcolor: "grey.200" }}
                        >
                          <InventoryIcon sx={{ color: "grey.500" }} />
                        </Avatar>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {product.name}
                      </Typography>
                      {product.short_description && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}
                        >
                          {product.short_description}
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {product.sku || "-"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {product.categories?.[0] ? (
                        <Chip 
                          label={product.categories[0].name}
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        {product.sale_price ? (
                          <>
                            <Typography 
                              variant="body2" 
                              sx={{ textDecoration: "line-through" }}
                              color="text.secondary"
                            >
                              €{product.regular_price}
                            </Typography>
                            <Typography variant="body1" fontWeight={600} color="error.main">
                              €{product.sale_price}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body1" fontWeight={600}>
                            €{product.regular_price || "-"}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Stack spacing={0.5} alignItems="center">
                        {product.manage_stock ? (
                          <>
                            <Typography variant="body1" fontWeight={600}>
                              {product.stock_quantity ?? 0}
                            </Typography>
                            <Chip
                              label={getStockStatusLabel(product.stock_status)}
                              size="small"
                              color={getStockStatusColor(product.stock_status)}
                            />
                          </>
                        ) : (
                          <Chip
                            label={getStockStatusLabel(product.stock_status)}
                            size="small"
                            color={getStockStatusColor(product.stock_status)}
                          />
                        )}
                      </Stack>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Chip
                        label={getStatusLabel(product.status)}
                        size="small"
                        color={getStatusColor(product.status)}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <Box display="flex" justifyContent="flex-end" gap={0.5}>
                        <Tooltip title="Bewerken">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/products/${product.id}/edit`);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Verbergen">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Implementeer verberg functionaliteit
                            }}
                          >
                            <VisibilityOffIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Verwijderen">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(product.id, product.name);
                            }}
                          >
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <Box display="flex" justifyContent="center">
            <Pagination
              count={data.totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Stack>
    </Container>
    </>
  );
}