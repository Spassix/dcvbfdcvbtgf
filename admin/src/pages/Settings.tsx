import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { ShopSettings, HomeSection } from "@plug-certifie/shared";
import { getAuthHeaders } from "../contexts/AuthContext";
import { useAuth } from "../contexts/AuthContext";

export default function Settings() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<ShopSettings>({
    shopName: "",
    heroTitle: "",
    heroSubtitle: "",
    sections: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/settings`);
      const data = await response.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/settings`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      if (data.success) {
        setMessage("Paramètres sauvegardés avec succès");
      } else {
        setMessage("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    setSettings({
      ...settings,
      sections: [
        ...(settings.sections || []),
        { icon: "📦", title: "", content: "" },
      ],
    });
  };

  const removeSection = (index: number) => {
    const newSections = [...(settings.sections || [])];
    newSections.splice(index, 1);
    setSettings({ ...settings, sections: newSections });
  };

  const updateSection = (index: number, field: keyof HomeSection, value: string) => {
    const newSections = [...(settings.sections || [])];
    newSections[index] = { ...newSections[index], [field]: value };
    setSettings({ ...settings, sections: newSections });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold mb-6">Paramètres de la boutique</h1>

        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.includes("succès") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la boutique
            </label>
            <input
              type="text"
              value={settings.shopName}
              onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre hero
            </label>
            <input
              type="text"
              value={settings.heroTitle}
              onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sous-titre hero
            </label>
            <input
              type="text"
              value={settings.heroSubtitle}
              onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image de fond (URL)
            </label>
            <input
              type="text"
              value={settings.backgroundImage || ""}
              onChange={(e) => setSettings({ ...settings, backgroundImage: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Sections de la page d'accueil
              </label>
              <button
                onClick={addSection}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Ajouter une section
              </button>
            </div>
            <div className="space-y-4">
              {(settings.sections || []).map((section, index) => (
                <div key={index} className="border border-gray-300 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Section {index + 1}</span>
                    <button
                      onClick={() => removeSection(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icône (emoji ou URL)
                      </label>
                      <input
                        type="text"
                        value={section.icon}
                        onChange={(e) => updateSection(index, "icon", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre
                      </label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(index, "title", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contenu
                      </label>
                      <textarea
                        value={section.content}
                        onChange={(e) => updateSection(index, "content", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>
    </Layout>
  );
}

