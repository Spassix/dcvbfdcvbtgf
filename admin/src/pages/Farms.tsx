import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Farm } from "@plug-certifie/shared";
import { getAuthHeaders } from "../contexts/AuthContext";
import { useAuth } from "../contexts/AuthContext";

export default function Farms() {
  const { token } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/farms`);
      const data = await response.json();
      if (data.success) {
        setFarms(data.data || []);
      }
    } catch (error) {
      console.error("Error loading farms:", error);
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-3xl font-bold mb-6">Fermes</h1>
        <FarmForm onSave={loadFarms} />
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="divide-y divide-gray-200">
            {farms.map((farm) => (
              <FarmItem key={farm.id} farm={farm} onUpdate={loadFarms} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function FarmForm({ onSave }: { onSave: () => void }) {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/farms`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ name, enabled }),
      });

      const data = await response.json();
      if (data.success) {
        setName("");
        onSave();
      }
    } catch (error) {
      console.error("Error saving farm:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Ajouter une ferme</h2>
      <div className="flex gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de la ferme"
          required
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="mr-2"
          />
          Activée
        </label>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
        >
          {saving ? "Ajout..." : "Ajouter"}
        </button>
      </div>
    </form>
  );
}

function FarmItem({ farm, onUpdate }: { farm: Farm; onUpdate: () => void }) {
  const { token } = useAuth();
  const [enabled, setEnabled] = useState(farm.enabled);

  const handleToggle = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/farms/${farm.id}`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ ...farm, enabled: !enabled }),
      });

      const data = await response.json();
      if (data.success) {
        setEnabled(!enabled);
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating farm:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette ferme ?")) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/farms/${farm.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });

      const data = await response.json();
      if (data.success) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error deleting farm:", error);
    }
  };

  return (
    <div className="p-4 flex justify-between items-center">
      <div>
        <h3 className="font-semibold">{farm.name}</h3>
        <span className={`text-sm ${enabled ? "text-green-600" : "text-red-600"}`}>
          {enabled ? "Activée" : "Désactivée"}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleToggle}
          className={`px-3 py-1 rounded ${enabled ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
        >
          {enabled ? "Désactiver" : "Activer"}
        </button>
        <button onClick={handleDelete} className="px-3 py-1 bg-red-500 text-white rounded">
          Supprimer
        </button>
      </div>
    </div>
  );
}

