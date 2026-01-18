import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  IconButton,
  Paper,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  styled,
  Container,
  Stack,
  Divider,
  ImageList,
  ImageListItem,
  ImageListItemBar
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Image as ImageIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  Description as DescriptionIcon,
  PhotoLibrary as GalleryIcon,
  ExpandMore as ExpandMoreIcon,
  AttachMoney as PriceIcon,
  Warehouse as StockIcon
} from "@mui/icons-material";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
  DndContext,
  closestCenter
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import {
  useCreateProduct,
  useUpdateProduct,
  useGetProduct,
  fetchAttributes,
  fetchAttributeTerms,
  fetchCategories,
  fetchBrands,
  Attribute,
  AttributeTerm
} from "../../api/products";
import { Category, Brand } from "../../api/categories";

/* ===================== */
/* Schema */
/* ===================== */
const schema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),

  short_description: z.string().optional(),
  description: z.string().optional(),

  regular_price: z.string().optional(),
  sale_price: z.string().optional(),

  stock_status: z.enum(["instock", "outofstock", "onbackorder"]),
  manage_stock: z.boolean(),
  stock_quantity: z.number().optional(),

  status: z.enum(["publish", "draft"]),
  catalog_visibility: z.enum(["visible", "catalog", "search", "hidden"]),

  category_id: z.number().optional(),
  brand_id: z.number().optional(),

  featured_image: z.object({ src: z.string() }).optional(),
  gallery_images: z.array(z.object({ src: z.string() })),

  attributes: z.array(
    z.object({
      id: z.number(),
      option: z.string(),
      visible: z.boolean(),
      variation: z.boolean()
    })
  )
});

type FormValues = z.infer<typeof schema>;

/* ===================== */
/* Styling */
/* ===================== */
const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: `${theme.spacing(1)} !important`,
  "&:before": {
    display: "none"
  },
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
}));

const DragBox = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${theme.palette.grey[300]}`,
  alignItems: "center",
  backgroundColor: theme.palette.background.paper
}));

const ImageUploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.grey[300]}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(3),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover
  }
}));

const ThumbnailBox = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  paddingTop: "100%",
  borderRadius: theme.spacing(1),
  overflow: "hidden",
  border: `1px solid ${theme.palette.grey[300]}`,
  "& img": {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover"
  }
}));

/* ===================== */
/* Component */
/* ===================== */
export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState<string[]>([
    "basic",
    "description",
    "images"
  ]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      manage_stock: false,
      stock_status: "instock",
      status: "publish",
      catalog_visibility: "visible",
      gallery_images: [],
      attributes: []
    }
  });

  const { fields: galleryFields, append: addGallery, remove: removeGallery } =
    useFieldArray({ control, name: "gallery_images" });

  const { fields: attrFields, replace: replaceAttrs, append: addAttr, remove: removeAttr } =
    useFieldArray({ control, name: "attributes" });

  const { data: product, isLoading } = useGetProduct(id, { enabled: isEdit });
  const { mutateAsync: create } = useCreateProduct();
  const { mutateAsync: update } = useUpdateProduct();

  const { data: categories = [] } = useQuery(["categories"], fetchCategories);
  const { data: brands = [] } = useQuery(["brands"], fetchBrands);
  const { data: attributes = [] } = useQuery(["attributes"], fetchAttributes);

  const manageStock = watch("manage_stock");
  const featuredImageSrc = watch("featured_image.src");

  /* ===================== */
  /* Accordion toggle */
  /* ===================== */
  const handleAccordionChange = (panel: string) => {
    setExpanded((prev) =>
      prev.includes(panel)
        ? prev.filter((p) => p !== panel)
        : [...prev, panel]
    );
  };

  /* ===================== */
  /* Load product */
  /* ===================== */
  useEffect(() => {
    if (!product) return;

    reset({
      name: product.name,
      sku: product.sku ?? "",
      short_description: product.short_description ?? "",
      description: product.description ?? "",
      regular_price: product.regular_price,
      sale_price: product.sale_price,
      stock_status: product.stock_status,
      manage_stock: Boolean(product.manage_stock),
      stock_quantity: product.stock_quantity ?? undefined,
      status: product.status,
      catalog_visibility: product.catalog_visibility,
      category_id: product.categories?.[0]?.id,
      brand_id: product.brands?.[0]?.id,
      featured_image: product.images?.[0]
        ? { src: product.images[0].src }
        : undefined,
      gallery_images:
        product.images?.slice(1).map((i: any) => ({ src: i.src })) ?? [],
      attributes:
        product.attributes?.map((a: any) => ({
          id: a.id,
          option: a.options?.[0] ?? "",
          visible: a.visible,
          variation: a.variation
        })) ?? []
    });
  }, [product, reset]);

  /* ===================== */
  /* Submit */
  /* ===================== */
  const onSubmit = async (v: FormValues) => {
  const payload: any = {
    name: v.name,
    sku: v.sku || undefined,

    short_description: v.short_description,
    description: v.description,

    regular_price: v.regular_price,
    sale_price: v.sale_price,

    stock_status: v.stock_status,
    manage_stock: v.manage_stock,
    stock_quantity: v.manage_stock ? v.stock_quantity : undefined,

    status: v.status,
    catalog_visibility: v.catalog_visibility,

    // ✅ CORRECT
    categories: v.category_id
      ? [{ id: v.category_id }]
      : [],

    images: [
      ...(v.featured_image ? [{ src: v.featured_image.src }] : []),
      ...v.gallery_images.map(i => ({ src: i.src }))
    ],

    // ✅ CORRECT – attributen (inclusief merk)
    attributes: v.attributes.map(a => ({
      id: a.id,
      options: [a.option],
      visible: a.visible,
      variation: a.variation
    }))
  };

    if (isEdit && id) {
      await update({ id: Number(id), ...payload });
    } else {
      await create(payload);
    }

    navigate("/products");
  };

  if (isEdit && isLoading) return <CircularProgress />;

  /* ===================== */
  /* Attribute value select */
  /* ===================== */
  const AttributeValueSelect = ({ index }: { index: number }) => {
    const attrId = watch(`attributes.${index}.id`);

    const { data: terms = [] } = useQuery(
      ["attr-terms", attrId],
      () => fetchAttributeTerms(attrId),
      { enabled: !!attrId }
    );

    return (
      <TextField
        select
        label="Waarde"
        {...register(`attributes.${index}.option`)}
        value={watch(`attributes.${index}.option`) || ""}
        fullWidth
        disabled={!attrId}
      >
        {terms.map((t: AttributeTerm) => (
          <MenuItem key={t.id} value={t.name}>
            {t.name}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  /* ===================== */
  /* UI */
  /* ===================== */
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={3} display="flex" alignItems="center" gap={2}>
        <IconButton onClick={() => navigate("/products")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          {isEdit ? "Product bewerken" : "Nieuw product"}
        </Typography>
        {isEdit && <Chip label={`ID ${id}`} />}
      </Box>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>

            {/* BASIS */}
            <StyledAccordion
              expanded={expanded.includes("basic")}
              onChange={() => handleAccordionChange("basic")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <InventoryIcon color="primary" />
                  <Typography variant="h6">Basisinformatie</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <TextField label="Naam" {...register("name")} fullWidth />
                  <TextField label="SKU" {...register("sku")} fullWidth />

                  <TextField
                    select
                    label="Categorie"
                    {...register("category_id", { valueAsNumber: true })}
                    defaultValue={0}
                  >
                    <MenuItem value={0}>Geen</MenuItem>
                    {categories.map((c: Category) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Merk"
                    {...register("brand_id", { valueAsNumber: true })}
                    defaultValue={0}
                  >
                    <MenuItem value={0}>Geen</MenuItem>
                    {brands.map((b: Brand) => (
                      <MenuItem key={b.id} value={b.id}>
                        {b.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </AccordionDetails>
            </StyledAccordion>

            {/* PRIJZEN */}
            <StyledAccordion
              expanded={expanded.includes("pricing")}
              onChange={() => handleAccordionChange("pricing")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PriceIcon color="primary" />
                  <Typography variant="h6">Prijzen</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <TextField
                    label="Normale prijs"
                    {...register("regular_price")}
                    fullWidth
                    type="number"
                    InputProps={{ startAdornment: "€" }}
                  />
                  <TextField
                    label="Kortingsprijs"
                    {...register("sale_price")}
                    fullWidth
                    type="number"
                    InputProps={{ startAdornment: "€" }}
                  />
                </Stack>
              </AccordionDetails>
            </StyledAccordion>

            {/* VOORRAAD */}
            <StyledAccordion
              expanded={expanded.includes("stock")}
              onChange={() => handleAccordionChange("stock")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <StockIcon color="primary" />
                  <Typography variant="h6">Voorraad</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <TextField
                    select
                    label="Voorraadstatus"
                    {...register("stock_status")}
                  >
                    <MenuItem value="instock">Op voorraad</MenuItem>
                    <MenuItem value="outofstock">Uitverkocht</MenuItem>
                    <MenuItem value="onbackorder">Nabestelling</MenuItem>
                  </TextField>

                  <FormControlLabel
                    control={<Checkbox {...register("manage_stock")} />}
                    label="Voorraad beheren"
                  />

                  {manageStock && (
                    <TextField
                      label="Aantal op voorraad"
                      type="number"
                      {...register("stock_quantity", { valueAsNumber: true })}
                      fullWidth
                    />
                  )}
                </Stack>
              </AccordionDetails>
            </StyledAccordion>

            {/* BESCHRIJVING */}
            <StyledAccordion
              expanded={expanded.includes("description")}
              onChange={() => handleAccordionChange("description")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <DescriptionIcon color="primary" />
                  <Typography variant="h6">Beschrijving</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={3}>
                  <TextField
                    label="Korte beschrijving"
                    {...register("short_description")}
                    multiline
                    rows={3}
                    fullWidth
                  />

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Lange beschrijving
                    </Typography>
                    <ReactQuill
                      theme="snow"
                      value={watch("description") || ""}
                      onChange={(val) => setValue("description", val)}
                    />
                  </Box>
                </Stack>
              </AccordionDetails>
            </StyledAccordion>

            {/* AFBEELDINGEN */}
            <StyledAccordion
              expanded={expanded.includes("images")}
              onChange={() => handleAccordionChange("images")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <ImageIcon color="primary" />
                  <Typography variant="h6">Afbeeldingen</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={3}>
                  {/* Uitgelichte afbeelding */}
                  <Box>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                      Uitgelichte afbeelding
                    </Typography>
                    
                    {featuredImageSrc ? (
                      <Box position="relative" maxWidth={300}>
                        <ThumbnailBox>
                          <img src={featuredImageSrc} alt="Featured" />
                        </ThumbnailBox>
                        <IconButton
                          onClick={() => setValue("featured_image.src", "")}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            bgcolor: "background.paper"
                          }}
                          size="small"
                        >
                          <DeleteIcon color="error" fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <ImageUploadBox>
                        <ImageIcon sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Klik om een afbeelding toe te voegen
                        </Typography>
                      </ImageUploadBox>
                    )}

                    <TextField
                      label="Afbeelding URL"
                      {...register("featured_image.src")}
                      fullWidth
                      size="small"
                      sx={{ mt: 2 }}
                    />
                  </Box>

                  <Divider />

                  {/* Galerij */}
                  <Box>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                      Productgalerij
                    </Typography>

                    {galleryFields.length > 0 && (
                      <ImageList cols={3} gap={12} sx={{ mb: 2 }}>
                        {galleryFields.map((f, i) => (
                          <ImageListItem key={f.id}>
                            <ThumbnailBox>
                              {watch(`gallery_images.${i}.src`) ? (
                                <img
                                  src={watch(`gallery_images.${i}.src`)}
                                  alt={`Gallery ${i + 1}`}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "grey.100"
                                  }}
                                >
                                  <ImageIcon sx={{ fontSize: 32, color: "grey.400" }} />
                                </Box>
                              )}
                            </ThumbnailBox>
                            <ImageListItemBar
                              position="top"
                              actionIcon={
                                <IconButton
                                  onClick={() => removeGallery(i)}
                                  size="small"
                                  sx={{ bgcolor: "background.paper", m: 0.5 }}
                                >
                                  <DeleteIcon color="error" fontSize="small" />
                                </IconButton>
                              }
                              sx={{ background: "transparent" }}
                            />
                          </ImageListItem>
                        ))}
                      </ImageList>
                    )}

                    <Stack spacing={1.5}>
                      {galleryFields.map((f, i) => (
                        <TextField
                          key={f.id}
                          label={`Galerij afbeelding ${i + 1}`}
                          {...register(`gallery_images.${i}.src`)}
                          size="small"
                          fullWidth
                        />
                      ))}

                      <Button
                        onClick={() => addGallery({ src: "" })}
                        startIcon={<AddIcon />}
                        variant="outlined"
                      >
                        Afbeelding toevoegen
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </AccordionDetails>
            </StyledAccordion>

            {/* ATTRIBUTEN */}
            <StyledAccordion
              expanded={expanded.includes("attributes")}
              onChange={() => handleAccordionChange("attributes")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CategoryIcon color="primary" />
                  <Typography variant="h6">Attributen</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => {
                    if (!e.over) return;
                    const oldIndex = attrFields.findIndex((f) => f.id === e.active.id);
                    const newIndex = attrFields.findIndex((f) => f.id === e.over.id);
                    replaceAttrs(arrayMove(attrFields, oldIndex, newIndex));
                  }}
                >
                  <SortableContext
                    items={attrFields.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Stack spacing={2}>
                      {attrFields.map((f, i) => (
                        <DragBox key={f.id}>
                          <Box sx={{ cursor: "grab" }}>☰</Box>

                          <TextField
                            select
                            label="Attribuut"
                            {...register(`attributes.${i}.id`, {
                              valueAsNumber: true
                            })}
                            value={watch(`attributes.${i}.id`) || ""}
                            sx={{ width: "30%" }}
                            size="small"
                          >
                            {attributes.map((a: Attribute) => (
                              <MenuItem key={a.id} value={a.id}>
                                {a.name}
                              </MenuItem>
                            ))}
                          </TextField>

                          <Box sx={{ flex: 1 }}>
                            <AttributeValueSelect index={i} />
                          </Box>

                          <FormControlLabel
                            control={
                              <Checkbox
                                {...register(`attributes.${i}.visible`)}
                                size="small"
                              />
                            }
                            label="Zichtbaar"
                          />

                          <FormControlLabel
                            control={
                              <Checkbox
                                {...register(`attributes.${i}.variation`)}
                                size="small"
                              />
                            }
                            label="Variatie"
                          />

                          <IconButton onClick={() => removeAttr(i)} size="small">
                            <DeleteIcon color="error" />
                          </IconButton>
                        </DragBox>
                      ))}
                    </Stack>
                  </SortableContext>
                </DndContext>

                <Button
                  onClick={() =>
                    addAttr({ id: 0, option: "", visible: true, variation: false })
                  }
                  startIcon={<AddIcon />}
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  Attribuut toevoegen
                </Button>
              </AccordionDetails>
            </StyledAccordion>
          </Grid>

          {/* RECHTS - Publish panel */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: "sticky", top: 20 }}>
              <Stack spacing={2.5}>
                <Typography variant="h6" gutterBottom>
                  Publiceren
                </Typography>

                <TextField
                  select
                  label="Status"
                  {...register("status")}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="publish">Gepubliceerd</MenuItem>
                  <MenuItem value="draft">Concept</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Catalogus zichtbaarheid"
                  {...register("catalog_visibility")}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="visible">Zichtbaar</MenuItem>
                  <MenuItem value="catalog">Alleen catalogus</MenuItem>
                  <MenuItem value="search">Alleen zoeken</MenuItem>
                  <MenuItem value="hidden">Verborgen</MenuItem>
                </TextField>

                <Divider />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                  fullWidth
                >
                  Opslaan
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}