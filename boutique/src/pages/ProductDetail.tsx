import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Product, ProductVariant, Category, Farm } from "@plug-certifie/shared";
import { useCart } from "../contexts/CartContext";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${apiUrl}/products/${id}`);
        const data = await response.json();

        if (data.success && data.data) {
          const prod: Product = data.data;
          setProduct(prod);
          if (prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0]);
          }

          // Load category and farm
          if (prod.category) {
            const catRes = await fetch(`${apiUrl}/categories/${prod.category}`);
            const catData = await catRes.json();
            if (catData.success) setCategory(catData.data);
          }

          if (prod.farm) {
            const farmRes = await fetch(`${apiUrl}/farms/${prod.farm}`);
            const farmData = await farmRes.json();
            if (farmData.success) setFarm(farmData.data);
          }
        }
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    addItem({
      productId: product.id,
      variantName: selectedVariant.name,
      productName: product.name,
      variantLabel: `${selectedVariant.name} (${selectedVariant.grammage}${selectedVariant.unit})`,
      quantity: 1,
      unitPrice: selectedVariant.price,
      image: product.image || product.photo,
    });

    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: "var(--text-secondary)" }}>Produit non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "var(--background-color)" }}>
      {/* Media Gallery */}
      <div className="mb-6">
        {product.image || product.photo ? (
          <img
            src={product.image || product.photo}
            alt={product.name}
            className="w-full h-64 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Pas d'image</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--text-heading)" }}>
        {product.name}
      </h1>

      {category && (
        <p className="mb-2" style={{ color: "var(--text-secondary)" }}>
          Catégorie: {category.name}
        </p>
      )}

      {farm && (
        <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
          Ferme: {farm.name}
        </p>
      )}

      <p className="mb-6" style={{ color: "var(--text-primary)" }}>
        {product.description}
      </p>

      {/* Variants */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-heading)" }}>
          Variantes
        </h2>
        <div className="space-y-2">
          {product.variants.map((variant) => (
            <button
              key={variant.name}
              onClick={() => setSelectedVariant(variant)}
              className={`w-full p-4 rounded-lg border-2 text-left ${
                selectedVariant?.name === variant.name ? "border-black" : ""
              }`}
              style={{
                backgroundColor:
                  selectedVariant?.name === variant.name
                    ? "var(--accent-color)"
                    : "var(--card-background)",
                borderColor:
                  selectedVariant?.name === variant.name
                    ? "var(--accent-color)"
                    : "var(--border-color)",
                color:
                  selectedVariant?.name === variant.name
                    ? "var(--button-text)"
                    : "var(--text-primary)",
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">{variant.name}</span>
                  <span className="ml-2 text-sm">
                    ({variant.grammage}
                    {variant.unit})
                  </span>
                </div>
                <span className="font-bold">{variant.price.toFixed(2)}€</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Add to Cart */}
      <button
        onClick={handleAddToCart}
        disabled={!selectedVariant}
        className="w-full py-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: selectedVariant ? "var(--button-background)" : "#cccccc",
          color: "var(--button-text)",
        }}
      >
        Ajouter au panier
      </button>
    </div>
  );
}

