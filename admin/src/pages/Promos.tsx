import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Promo } from "@plug-certifie/shared";
import { getAuthHeaders } from "../contexts/AuthContext";
import { useAuth } from "../contexts/AuthContext";

export default function Promos() {
  const { token } = useAuth();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/promos`);
      const data = await response.json();
      if (data.success) {
        setPromos(data.data || []);
      }
    } catch (error) {
      console.error("Error loading promos:", error);
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
        <h1 className="text-3xl font-bold mb-6">Codes promo</h1>
        <PromoForm onSave={loadPromos} />
        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Valeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Min. montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promos.map((promo) => (
                <PromoRow key={promo.id} promo={promo} onUpdate={loadPromos} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

function PromoForm({ onSave }: { onSave: () => void }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    code: "",
    type: "percent" as "percent" | "fixed",
    value: 0,
    minAmount: 0,
    enabled: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/promos`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setFormData({ code: "", type: "percent", value: 0, minAmount: 0, enabled: true });
        onSave();
      }
    } catch (error) {
      console.error("Error saving promo:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Ajouter un code promo</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as "percent" | "fixed" })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="percent">Pourcentage</option>
            <option value="fixed">Montant fixe</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Valeur</label>
          <input
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Montant minimum (€)
          </label>
          <input
            type="number"
            value={formData.minAmount}
            onChange={(e) => setFormData({ ...formData, minAmount: parseFloat(e.target.value) })}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.enabled}
            onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
            className="mr-2"
          />
          Activé
        </label>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="mt-4 px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
      >
        {saving ? "Ajout..." : "Ajouter"}
      </button>
    </form>
  );
}

function PromoRow({ promo, onUpdate }: { promo: Promo; onUpdate: () => void }) {
  const { token } = useAuth();

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce code promo ?")) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/promos/${promo.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });

      const data = await response.json();
      if (data.success) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error deleting promo:", error);
    }
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{promo.code}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {promo.type === "percent" ? "Pourcentage" : "Montant fixe"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {promo.type === "percent" ? `${promo.value}%` : `${promo.value}€`}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{promo.minAmount}€</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span className={`px-2 py-1 rounded ${promo.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {promo.enabled ? "Activé" : "Désactivé"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button onClick={handleDelete} className="text-red-600 hover:text-red-900">
          Supprimer
        </button>
      </td>
    </tr>
  );
}

