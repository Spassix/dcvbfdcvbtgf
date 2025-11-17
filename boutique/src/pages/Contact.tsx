import { useEffect, useState } from "react";
import { SocialLink } from "@plug-certifie/shared";

export default function Contact() {
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSocials = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${apiUrl}/socials`);
        const data = await response.json();
        if (data.success) {
          setSocials(data.data || []);
        }
      } catch (error) {
        console.error("Error loading socials:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSocials();
  }, []);

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
        Contact
      </h1>

      <div className="space-y-4">
        {socials.map((social) => (
          <a
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-lg"
            style={{
              backgroundColor: "var(--card-background)",
              color: "var(--link-color)",
            }}
          >
            <span className="text-3xl">{social.icon}</span>
            <span className="font-semibold">{social.name}</span>
          </a>
        ))}
      </div>

      {socials.length === 0 && (
        <div className="text-center py-12">
          <p style={{ color: "var(--text-secondary)" }}>Aucun lien de contact disponible</p>
        </div>
      )}
    </div>
  );
}

