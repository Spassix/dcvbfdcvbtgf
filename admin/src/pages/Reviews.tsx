import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Review } from "@plug-certifie/shared";
import { getAuthHeaders } from "../contexts/AuthContext";
import { useAuth } from "../contexts/AuthContext";

export default function Reviews() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/reviews`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.data || []);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
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
        <h1 className="text-3xl font-bold mb-6">Avis clients</h1>
        <ReviewForm onSave={loadReviews} />
        <div className="mt-6 space-y-4">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} onUpdate={loadReviews} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

function ReviewForm({ onSave }: { onSave: () => void }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    customerName: "",
    rating: 5,
    comment: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/reviews`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setFormData({ customerName: "", rating: 5, comment: "" });
        onSave();
      }
    } catch (error) {
      console.error("Error saving review:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Ajouter un avis</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom du client</label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Note (1-5)</label>
          <input
            type="number"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
            required
            min="1"
            max="5"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={3}
          />
        </div>
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

function ReviewItem({ review, onUpdate }: { review: Review; onUpdate: () => void }) {
  const { token } = useAuth();

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/reviews/${review.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });

      const data = await response.json();
      if (data.success) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold">{review.customerName}</h3>
          <div className="text-yellow-500">{ "★".repeat(review.rating) + "☆".repeat(5 - review.rating)}</div>
        </div>
        <button onClick={handleDelete} className="text-red-600 hover:text-red-900">
          Supprimer
        </button>
      </div>
      <p className="text-gray-700">{review.comment}</p>
    </div>
  );
}

