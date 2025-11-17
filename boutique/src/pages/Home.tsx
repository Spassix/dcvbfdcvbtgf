import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShopSettings, HomeSection } from "@plug-certifie/shared";

export default function Home() {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${apiUrl}/settings`);
        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const backgroundStyle = settings?.backgroundImage
    ? {
        backgroundImage: `url(${settings.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }
    : {};

  return (
    <div className="min-h-screen" style={backgroundStyle}>
      <div className="relative">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="px-4 py-16 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--text-heading)" }}>
            {settings?.heroTitle || "PLUG CERTIFIÉ"}
          </h1>
          <p className="text-xl mb-8" style={{ color: "var(--text-secondary)" }}>
            {settings?.heroSubtitle || "Votre boutique CBD de confiance"}
          </p>
          <Link
            to="/products"
            className="inline-block px-8 py-3 rounded-lg font-semibold"
            style={{
              backgroundColor: "var(--button-background)",
              color: "var(--button-text)",
            }}
          >
            Voir les produits
          </Link>
        </motion.section>

        {/* Sections */}
        {settings?.sections && settings.sections.length > 0 && (
          <div className="px-4 py-8 space-y-8">
            {settings.sections.map((section: HomeSection, index: number) => (
              <motion.section
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-md"
                style={{ backgroundColor: "var(--card-background)" }}
              >
                <div className="text-4xl mb-4">{section.icon}</div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-heading)" }}>
                  {section.title}
                </h2>
                <p style={{ color: "var(--text-primary)" }}>{section.content}</p>
              </motion.section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

