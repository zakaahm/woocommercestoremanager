// src/pages/Products/AddProduct.tsx

import React, { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    MenuItem,
    Checkbox,
    FormControlLabel,
    IconButton,
    Paper,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    styled,
    Container,
    Stack,
    Divider,
    ImageList,
    ImageListItem,
    CircularProgress,
    ToggleButtonGroup,
    ToggleButton,
    Alert,
    LinearProgress
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
    ExpandMore as ExpandMoreIcon,
    AttachMoney as PriceIcon,
    Warehouse as StockIcon,
    ContentCopy as TemplateIcon,
    Create as CreateIcon,
    Visibility as VisibilityIcon,
    CloudUpload as UploadIcon
} from "@mui/icons-material";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
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
    fetchAttributes,
    fetchAttributeTerms,
    fetchCategories,
    fetchBrands,
    Attribute,
    AttributeTerm,
    Category,
    Brand
} from "../../../api/products";

/* ===================== */
/* Schema */
/* ===================== */
const schema = z.object({
    name: z.string().min(1, "Naam is verplicht"),
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
/* Template Definition */
/* ===================== */
const ATTRIBUTE_TEMPLATE = [
    { name: "Brand", id: 1 },
    { name: "Advertentiecode", id: 2 },
    { name: "Model", id: 3 },
    { name: "Referentienummer", id: 4 },
    { name: "Handelaarscode", id: 5 },
    { name: "Opwinden", id: 6 },
    { name: "Materiaal horlogeband", id: 7 },
    { name: "Materiaal horlogekast", id: 8 },
    { name: "Bouwjaar", id: 9 },
    { name: "Staat", id: 10 },
    { name: "Inbegrepen bij de levering", id: 11 },
    { name: "Locatie", id: 12 },
    { name: "Kaliber/uurwerk", id: 13 },
    { name: "Aantal jewels", id: 14 },
    { name: "Diameter", id: 15 },
    { name: "Waterdicht", id: 16 },
    { name: "Kleur horlogeband", id: 17 },
    { name: "Sluiting", id: 18 },
    { name: "Kleur van de wijzerplaat", id: 19 }
];

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

/* ===================== */
/* Component */
/* ===================== */
export default function AddProduct() {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState<string[]>([
        "basic",
        "description",
        "images"
    ]);
    const [attributeMode, setAttributeMode] = useState<"template" | "custom">("template");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitProgress, setSubmitProgress] = useState(0);
    
    // Local file state - niet uploaden tot submit
    const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
    const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("");
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
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

    const { fields: attrFields, replace: replaceAttrs, append: addAttr, remove: removeAttr } =
        useFieldArray({ control, name: "attributes" });

    const { mutateAsync: createProduct } = useCreateProduct();

    const { data: categories = [] } = useQuery(["categories"], fetchCategories);
    const { data: brands = [] } = useQuery(["brands"], fetchBrands);
    const { data: attributes = [] } = useQuery(["attributes"], fetchAttributes);

    const manageStock = watch("manage_stock");

    /* ===================== */
    /* Upload alle afbeeldingen naar WordPress */
    /* ===================== */
const uploadImageToWordPress = async (file: File): Promise<string> => {
    const store = JSON.parse(localStorage.getItem("woo_dashboard_auth") || "{}");
    const storeUrl = store.storeUrl;
    const token = localStorage.getItem("wordpress_token");

    if (!storeUrl || !token) {
        throw new Error("Store credentials ontbreken");
    }

    const filename = file.name || `upload-${Date.now()}.jpg`;

    const formData = new FormData();
    formData.append("file", file, filename);

    const response = await fetch(
        `${storeUrl.replace(/\/$/, "")}/wp-json/wp/v2/media`,
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${token}`,
                "Content-Disposition": `attachment; filename=\"${filename}\"`
            },
            body: formData
        }
    );

    const text = await response.text();

    if (!response.ok) {
        console.error("WordPress media upload error:", text);
        throw new Error(`Media upload mislukt (${response.status})`);
    }

    const data = JSON.parse(text);
    return data.source_url;
};

    /* ===================== */
    /* Lokale file preview handlers */
    /* ===================== */
    const handleFeaturedImageSelect = (file: File) => {
        if (!file.type.startsWith("image/")) {
            alert("Upload alleen afbeeldingen");
            return;
        }

        setFeaturedImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setFeaturedImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleGalleryImagesSelect = (files: File[]) => {
        const imageFiles = files.filter(f => f.type.startsWith("image/"));
        
        if (imageFiles.length === 0) {
            alert("Geen geldige afbeeldingen gevonden");
            return;
        }

        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setGalleryFiles(prev => [...prev, file]);
                setGalleryPreviews(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    /* ===================== */
    /* Handle File Drop/Select */
    /* ===================== */
    const handleFileDrop = (files: FileList, isFeatured: boolean = false) => {
        if (isFeatured) {
            const file = files[0];
            if (file) {
                handleFeaturedImageSelect(file);
            }
        } else {
            handleGalleryImagesSelect(Array.from(files));
        }
    };

    /* ===================== */
    /* Remove featured image */
    /* ===================== */
    const removeFeaturedImage = () => {
        setFeaturedImageFile(null);
        setFeaturedImagePreview("");
    };

    /* ===================== */
    /* Remove gallery image */
    /* ===================== */
    const removeGalleryImage = (index: number) => {
        setGalleryFiles(prev => prev.filter((_, i) => i !== index));
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    };

    /* ===================== */
    /* Move gallery image */
    /* ===================== */
    const moveGalleryImage = (fromIndex: number, toIndex: number) => {
        const newFiles = [...galleryFiles];
        const newPreviews = [...galleryPreviews];
        
        [newFiles[fromIndex], newFiles[toIndex]] = [newFiles[toIndex], newFiles[fromIndex]];
        [newPreviews[fromIndex], newPreviews[toIndex]] = [newPreviews[toIndex], newPreviews[fromIndex]];
        
        setGalleryFiles(newFiles);
        setGalleryPreviews(newPreviews);
    };

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
    /* Load Template */
    /* ===================== */
    const handleLoadTemplate = () => {
        const templateAttrs = ATTRIBUTE_TEMPLATE.map((attr) => ({
            id: attr.id,
            option: "",
            visible: true,
            variation: false
        }));
        replaceAttrs(templateAttrs);
    };

    /* ===================== */
    /* Mode Change */
    /* ===================== */
    const handleModeChange = (
        event: React.MouseEvent<HTMLElement>,
        newMode: "template" | "custom" | null
    ) => {
        if (newMode === null) return;

        if (newMode === "template") {
            const confirmSwitch = attrFields.length === 0 ||
                confirm("Wil je overschakelen naar template modus? Huidige attributen blijven behouden.");

            if (confirmSwitch) {
                setAttributeMode(newMode);
                if (attrFields.length === 0) {
                    handleLoadTemplate();
                }
            }
        } else {
            setAttributeMode(newMode);
        }
    };

    /* ===================== */
    /* Submit - Upload afbeeldingen en maak product */
    /* ===================== */
    const onSubmit = async (data: FormValues) => {
        try {
            setIsSubmitting(true);
            setSubmitProgress(0);

            const images: { src: string }[] = [];

            // Upload featured image
            if (featuredImageFile) {
                setSubmitProgress(10);
                const featuredUrl = await uploadImageToWordPress(featuredImageFile);
                images.push({ src: featuredUrl });
                setSubmitProgress(30);
            }

            // Upload gallery images
            if (galleryFiles.length > 0) {
                const totalGallery = galleryFiles.length;
                for (let i = 0; i < galleryFiles.length; i++) {
                    const galleryUrl = await uploadImageToWordPress(galleryFiles[i]);
                    images.push({ src: galleryUrl });
                    setSubmitProgress(30 + ((i + 1) / totalGallery) * 50);
                }
            }

            setSubmitProgress(85);

            // Maak product
            const payload = {
                name: data.name,
                sku: data.sku || undefined,
                short_description: data.short_description,
                description: data.description,
                regular_price: data.regular_price,
                sale_price: data.sale_price,
                stock_status: data.stock_status,
                manage_stock: data.manage_stock,
                stock_quantity: data.manage_stock ? data.stock_quantity : undefined,
                status: data.status,
                catalog_visibility: data.catalog_visibility,
                categories: data.category_id ? [{ id: data.category_id }] : [],
                images: images,
                attributes: data.attributes.map((a) => ({
                    id: a.id,
                    options: [a.option],
                    visible: a.visible,
                    variation: a.variation
                }))
            };

            await createProduct(payload);
            setSubmitProgress(100);

            // Wacht even zodat user 100% ziet
            setTimeout(() => {
                navigate("/products");
            }, 500);
        } catch (err) {
            console.error("Product creation failed:", err);
            alert("Fout bij aanmaken van product: " + (err as Error).message);
            setSubmitProgress(0);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                size="small"
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
                <Typography variant="h4">Nieuw product</Typography>
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
                                    <TextField
                                        label="Naam"
                                        {...register("name")}
                                        fullWidth
                                        error={!!errors.name}
                                        helperText={errors.name?.message}
                                    />
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

                                        <Box
                                            component="label"
                                            sx={{
                                                border: "2px dashed",
                                                borderColor: "grey.300",
                                                borderRadius: 2,
                                                p: 2,
                                                bgcolor: "grey.50",
                                                minHeight: 200,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer"
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.style.borderColor = "#1976d2";
                                                e.currentTarget.style.backgroundColor = "#e3f2fd";
                                            }}
                                            onDragLeave={(e) => {
                                                e.currentTarget.style.borderColor = "#d0d0d0";
                                                e.currentTarget.style.backgroundColor = "#fafafa";
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.style.borderColor = "#d0d0d0";
                                                e.currentTarget.style.backgroundColor = "#fafafa";

                                                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                                    handleFileDrop(e.dataTransfer.files, true);
                                                }
                                            }}
                                        >
                                            <input
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        handleFeaturedImageSelect(e.target.files[0]);
                                                    }
                                                }}
                                            />
                                            {featuredImagePreview ? (
                                                <Box position="relative" width="100%" maxWidth={300}>
                                                    <Box
                                                        sx={{
                                                            position: "relative",
                                                            width: "100%",
                                                            paddingTop: "100%",
                                                            borderRadius: 1,
                                                            overflow: "hidden"
                                                        }}
                                                    >
                                                        <img
                                                            src={featuredImagePreview}
                                                            alt="Featured"
                                                            style={{
                                                                position: "absolute",
                                                                top: 0,
                                                                left: 0,
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit: "cover"
                                                            }}
                                                        />
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            position: "absolute",
                                                            top: 8,
                                                            right: 8,
                                                            display: "flex",
                                                            gap: 1
                                                        }}
                                                    >
                                                        <IconButton
                                                            size="small"
                                                            sx={{ bgcolor: "background.paper" }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(featuredImagePreview, "_blank");
                                                            }}
                                                        >
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            sx={{ bgcolor: "background.paper" }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeFeaturedImage();
                                                            }}
                                                        >
                                                            <DeleteIcon color="error" fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Box textAlign="center">
                                                    <ImageIcon sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        Sleep afbeelding hierheen of voeg URL toe
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>

                                        {!featuredImagePreview && (
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
                                                💡 Sleep een afbeelding hier naartoe of klik om te selecteren
                                            </Typography>
                                        )}
                                    </Box>

                                    <Divider />

                                    {/* Galerij */}
                                    <Box>
                                        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                                            Productgalerij
                                        </Typography>

                                        <Box
                                            component="label"
                                            sx={{
                                                border: "2px dashed",
                                                borderColor: "grey.300",
                                                borderRadius: 2,
                                                p: 3,
                                                bgcolor: "grey.50",
                                                minHeight: 200,
                                                cursor: "pointer"
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.style.borderColor = "#1976d2";
                                                e.currentTarget.style.backgroundColor = "#e3f2fd";
                                            }}
                                            onDragLeave={(e) => {
                                                e.currentTarget.style.borderColor = "#d0d0d0";
                                                e.currentTarget.style.backgroundColor = "#fafafa";
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.style.borderColor = "#d0d0d0";
                                                e.currentTarget.style.backgroundColor = "#fafafa";

                                                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                                    handleGalleryImagesSelect(Array.from(e.dataTransfer.files));
                                                }
                                            }}
                                        >
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                hidden
                                                onChange={(e) => {
                                                    if (e.target.files) {
                                                        handleGalleryImagesSelect(Array.from(e.target.files));
                                                    }
                                                }}
                                            />
                                            {galleryFiles.length > 0 ? (
                                                <DndContext
                                                    collisionDetection={closestCenter}
                                                    onDragEnd={(e) => {
                                                        if (!e.over) return;
                                                        const oldIndex = galleryPreviews.findIndex((_, i) => String(i) === e.active.id);
                                                        const newIndex = galleryPreviews.findIndex((_, i) => String(i) === e.over?.id);
                                                        moveGalleryImage(oldIndex, newIndex);
                                                    }}
                                                >
                                                    <SortableContext
                                                        items={galleryPreviews.map((_, i) => String(i))}
                                                        strategy={verticalListSortingStrategy}
                                                    >
                                                        <ImageList cols={3} gap={12}>
                                                            {galleryPreviews.map((preview, i) => (
                                                                <ImageListItem key={i}>
                                                                    <Box
                                                                        sx={{
                                                                            position: "relative",
                                                                            width: "100%",
                                                                            paddingTop: "100%",
                                                                            borderRadius: 1,
                                                                            overflow: "hidden",
                                                                            border: "1px solid",
                                                                            borderColor: "grey.300",
                                                                            bgcolor: "background.paper",
                                                                            cursor: "grab",
                                                                            "&:active": {
                                                                                cursor: "grabbing"
                                                                            }
                                                                        }}
                                                                    >
                                                                        <img
                                                                            src={preview}
                                                                            alt={`Gallery ${i + 1}`}
                                                                            style={{
                                                                                position: "absolute",
                                                                                top: 0,
                                                                                left: 0,
                                                                                width: "100%",
                                                                                height: "100%",
                                                                                objectFit: "cover"
                                                                            }}
                                                                        />
                                                                        <Box
                                                                            sx={{
                                                                                position: "absolute",
                                                                                top: 4,
                                                                                right: 4,
                                                                                display: "flex",
                                                                                gap: 0.5
                                                                            }}
                                                                        >
                                                                            <IconButton
                                                                                size="small"
                                                                                sx={{ bgcolor: "background.paper", opacity: 0.9 }}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    window.open(preview, "_blank");
                                                                                }}
                                                                            >
                                                                                <VisibilityIcon fontSize="small" />
                                                                            </IconButton>
                                                                            <IconButton
                                                                                size="small"
                                                                                sx={{ bgcolor: "background.paper", opacity: 0.9 }}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    removeGalleryImage(i);
                                                                                }}
                                                                            >
                                                                                <DeleteIcon color="error" fontSize="small" />
                                                                            </IconButton>
                                                                        </Box>
                                                                    </Box>
                                                                    <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                                                                        Afb. {i + 1}
                                                                    </Typography>
                                                                </ImageListItem>
                                                            ))}
                                                        </ImageList>
                                                    </SortableContext>
                                                </DndContext>
                                            ) : (
                                                <Box textAlign="center" py={4}>
                                                    <ImageIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
                                                    <Typography variant="body1" color="text.secondary" gutterBottom>
                                                        Nog geen galerij afbeeldingen
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Sleep afbeeldingen hierheen of klik om te selecteren
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
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
                                <Stack spacing={3}>
                                    {/* Mode Selector */}
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Attributen modus
                                        </Typography>
                                        <ToggleButtonGroup
                                            value={attributeMode}
                                            exclusive
                                            onChange={handleModeChange}
                                            fullWidth
                                            size="small"
                                        >
                                            <ToggleButton value="template">
                                                <TemplateIcon sx={{ mr: 1 }} />
                                                Template attributen
                                            </ToggleButton>
                                            <ToggleButton value="custom">
                                                <CreateIcon sx={{ mr: 1 }} />
                                                Vanaf nieuw
                                            </ToggleButton>
                                        </ToggleButtonGroup>

                                        {attributeMode === "template" && (
                                            <Alert severity="info" sx={{ mt: 2 }}>
                                                Template modus geladen met 19 standaard attributen. Je kunt deze nog aanpassen of extra attributen toevoegen.
                                            </Alert>
                                        )}
                                    </Box>

                                    {/* Load Template Button (alleen tonen als template mode en geen attrs) */}
                                    {attributeMode === "template" && attrFields.length === 0 && (
                                        <Button
                                            onClick={handleLoadTemplate}
                                            variant="contained"
                                            startIcon={<TemplateIcon />}
                                        >
                                            Laad template attributen
                                        </Button>
                                    )}

                                    {/* Attributes List */}
                                    {attrFields.length > 0 && (
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
                                    )}

                                    {/* Add Attribute Button */}
                                    <Button
                                        onClick={() =>
                                            addAttr({ id: 0, option: "", visible: true, variation: false })
                                        }
                                        startIcon={<AddIcon />}
                                        variant="outlined"
                                    >
                                        Attribuut toevoegen
                                    </Button>
                                </Stack>
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

                                {isSubmitting && (
                                    <Box>
                                        <Typography variant="body2" gutterBottom>
                                            Afbeeldingen uploaden en product aanmaken...
                                        </Typography>
                                        <LinearProgress variant="determinate" value={submitProgress} sx={{ mt: 1 }} />
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                                            {Math.round(submitProgress)}%
                                        </Typography>
                                    </Box>
                                )}

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                                    fullWidth
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Bezig..." : "Product aanmaken"}
                                </Button>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}