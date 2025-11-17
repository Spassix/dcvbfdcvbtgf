import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Product, Category, Farm } from "@plug-certifie/shared";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        
        const [productsRes, categoriesRes, farmsRes] = await Promise.all([
          fetch(`${apiUrl}/products`),
          fetch(`${apiUrl}/categories`),
          fetch(`${apiUrl}/farms`),
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        const farmsData = await farmsRes.json();

        if (productsData.success) setProducts(productsData.data || []);
        if (categoriesData.success) setCategories(categoriesData.data || []);
        if (farmsData.success) setFarms(farmsData.data || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts = products.filter((product) => {
    if (selectedCategory && product.category !== selectedCategory) return false;
    if (selectedFarm && product.farm !== selectedFarm) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getBasePrice = (product: Product): number => {
    if (product.variants.length === 0) return 0;
    return Math.min(...product.variants.map((v) => v.price));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "var(--background-color)" }}>
      <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--text-heading)" }}>
        Produits
      </h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Rechercher..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 mb-4 rounded-lg border"
        style={{
          backgroundColor: "var(--card-background)",
          borderColor: "var(--border-color)",
          color: "var(--text-primary)",
        }}
      />

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block mb-2" style={{ color: "var(--text-secondary)" }}>
            Catégorie
          </label>
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="w-full px-4 py-2 rounded-lg border"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2" style={{ color: "var(--text-secondary)" }}>
            Ferme
          </label>
          <select
            value={selectedFarm || ""}
            onChange={(e) => setSelectedFarm(e.target.value || null)}
            className="w-full px-4 py-2 rounded-lg border"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            <option value="">Toutes les fermes</option>
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="rounded-lg overflow-hidden shadow-md"
            style={{ backgroundColor: "var(--card-background)" }}
          >
            {product.image || product.photo ? (
              <img
                src={product.image || product.photo}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Pas d'image</span>
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold mb-2" style={{ color: "var(--text-heading)" }}>
                {product.name}
              </h3>
              <p
                className="text-sm mb-2 line-clamp-2"
                style={{ color: "var(--text-secondary)" }}
              >
                {product.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                  {getBasePrice(product).toFixed(2)}€
                </span>
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {product.variants.length} option{product.variants.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p style={{ color: "var(--text-secondary)" }}>Aucun produit trouvé</p>
        </div>
      )}
    </div>
  );
}

