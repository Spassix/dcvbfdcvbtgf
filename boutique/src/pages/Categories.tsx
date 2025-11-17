import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Category, Product } from "@plug-certifie/shared";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        
        const [categoriesRes, productsRes] = await Promise.all([
          fetch(`${apiUrl}/categories`),
          fetch(`${apiUrl}/products`),
        ]);

        const categoriesData = await categoriesRes.json();
        const productsData = await productsRes.json();

        if (categoriesData.success) setCategories(categoriesData.data || []);
        if (productsData.success) setProducts(productsData.data || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getProductCount = (categoryId: string): number => {
    return products.filter((p) => p.category === categoryId).length;
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
        Catégories
      </h1>

      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/products?category=${category.id}`}
            className="rounded-lg p-6 text-center shadow-md"
            style={{ backgroundColor: "var(--card-background)" }}
          >
            <div className="text-5xl mb-4">{category.icon}</div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-heading)" }}>
              {category.name}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {getProductCount(category.id)} produit{getProductCount(category.id) > 1 ? "s" : ""}
            </p>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p style={{ color: "var(--text-secondary)" }}>Aucune catégorie disponible</p>
        </div>
      )}
    </div>
  );
}

