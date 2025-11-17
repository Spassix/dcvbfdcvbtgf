import { useEffect, useState } from "react";
import { Review } from "@plug-certifie/shared";

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    loadReviews();
  }, []);

  const renderStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
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
        Avis clients
      </h1>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-4 rounded-lg"
            style={{ backgroundColor: "var(--card-background)" }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold" style={{ color: "var(--text-heading)" }}>
                {review.customerName}
              </h3>
              <div className="text-yellow-500">{renderStars(review.rating)}</div>
            </div>
            <p style={{ color: "var(--text-primary)" }}>{review.comment}</p>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-12">
          <p style={{ color: "var(--text-secondary)" }}>Aucun avis disponible</p>
        </div>
      )}
    </div>
  );
}

