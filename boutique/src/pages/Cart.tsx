import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { CartService, PaymentMethod, CartSettings } from "@plug-certifie/shared";

type CheckoutStep = 1 | 2 | 3 | 4;

export default function Cart() {
  const navigate = useNavigate();
  const {
    items,
    promoCode,
    appliedPromo,
    updateQuantity,
    removeItem,
    clearCart,
    applyPromo,
    removePromo,
    getTotals,
  } = useCart();

  const [step, setStep] = useState<CheckoutStep>(1);
  const [cartSettings, setCartSettings] = useState<CartSettings | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    addressComplement: "",
  });
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    const loadCartSettings = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${apiUrl}/cart_services`);
        const data = await response.json();
        if (data.success) {
          // Load full cart settings for admin config
          const settingsRes = await fetch(`${apiUrl}/cart-settings`);
          const settingsData = await settingsRes.json();
          if (settingsData.success) {
            setCartSettings(settingsData.data);
          }
        }
      } catch (error) {
        console.error("Error loading cart settings:", error);
      }
    };

    loadCartSettings();
  }, []);

  const handleApplyPromo = async () => {
    setPromoError("");
    const success = await applyPromo(promoInput);
    if (!success) {
      setPromoError("Code promo invalide ou montant minimum non atteint");
    } else {
      setPromoInput("");
    }
  };

  const handleNext = () => {
    if (step === 1 && items.length === 0) return;
    if (step === 2 && (!selectedService || !selectedTimeSlot)) return;
    if (step === 3) {
      if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.phone) return;
      if (selectedService !== "meetup" && !customerInfo.address) return;
    }
    if (step < 4) {
      setStep((s) => (s + 1) as CheckoutStep);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => (s - 1) as CheckoutStep);
    }
  };

  const generateOrderText = (): string => {
    const totals = getTotals();
    const service = cartSettings?.services?.find((s) => s.id === selectedService);
    const payment = cartSettings?.paymentMethods?.find((p) => p.id === selectedPayment);

    let text = "🛒 NOUVELLE COMMANDE\n\n";
    text += "👤 CLIENT:\n";
    text += `Nom: ${customerInfo.firstName} ${customerInfo.lastName}\n`;
    text += `Téléphone: ${customerInfo.phone}\n`;
    if (customerInfo.address) {
      text += `Adresse: ${customerInfo.address}`;
      if (customerInfo.addressComplement) {
        text += `, ${customerInfo.addressComplement}`;
      }
      text += "\n";
    }
    text += "\n📦 PRODUITS:\n";
    items.forEach((item) => {
      text += `* ${item.productName} (${item.variantLabel}) x ${item.quantity} = ${(item.unitPrice * item.quantity).toFixed(2)}€\n`;
    });
    text += "\n💰 TOTAL:\n";
    text += `Sous-total: ${totals.subtotal.toFixed(2)}€\n`;
    if (totals.discount > 0) {
      text += `Code promo: -${totals.discount.toFixed(2)}€\n`;
    }
    if (service) {
      text += `Frais: ${service.fee.toFixed(2)}€\n`;
    }
    text += `TOTAL: ${totals.total.toFixed(2)}€\n\n`;
    if (service) {
      text += `🚚 SERVICE: ${service.label}\n`;
    }
    if (selectedTimeSlot) {
      text += `⏰ Horaire: ${selectedTimeSlot}\n`;
    }
    if (payment) {
      text += `💳 PAIEMENT: ${payment.label}\n`;
    }

    return text;
  };

  const handleCopyOrder = async () => {
    const text = generateOrderText();
    try {
      await navigator.clipboard.writeText(text);
      alert("Commande copiée dans le presse-papiers !");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  const handleOpenTelegram = () => {
    const text = encodeURIComponent(generateOrderText());
    const telegramLink = cartSettings?.contactLinks?.find((link) =>
      link.url.includes("telegram")
    )?.url;
    if (telegramLink) {
      window.open(`${telegramLink}?text=${text}`, "_blank");
    }
  };

  const totals = getTotals();
  const service = cartSettings?.services?.find((s) => s.id === selectedService);
  const finalTotal = totals.total + (service?.fee || 0);

  if (items.length === 0 && step === 1) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
            Votre panier est vide
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-3 rounded-lg font-semibold"
            style={{
              backgroundColor: "var(--button-background)",
              color: "var(--button-text)",
            }}
          >
            Voir les produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "var(--background-color)" }}>
      <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--text-heading)" }}>
        Panier
      </h1>

      {/* Step 1: Cart */}
      {step === 1 && (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg"
              style={{ backgroundColor: "var(--card-background)" }}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold" style={{ color: "var(--text-heading)" }}>
                    {item.productName}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {item.variantLabel}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500"
                  aria-label="Supprimer"
                >
                  ✕
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded border flex items-center justify-center"
                  >
                    -
                  </button>
                  <span style={{ color: "var(--text-primary)" }}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded border flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                  {(item.unitPrice * item.quantity).toFixed(2)}€
                </span>
              </div>
            </div>
          ))}

          {/* Promo Code */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--card-background)" }}>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Code promo"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: "var(--background-color)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                onClick={handleApplyPromo}
                className="px-4 py-2 rounded-lg font-semibold"
                style={{
                  backgroundColor: cartSettings?.buttonColors.promo || "var(--button-background)",
                  color: "var(--button-text)",
                }}
              >
                Appliquer
              </button>
            </div>
            {promoError && <p className="text-red-500 text-sm">{promoError}</p>}
            {appliedPromo && (
              <div className="flex justify-between items-center">
                <span style={{ color: "var(--text-secondary)" }}>
                  Code: {promoCode} (-{totals.discount.toFixed(2)}€)
                </span>
                <button onClick={removePromo} className="text-red-500 text-sm">
                  Retirer
                </button>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--card-background)" }}>
            <div className="flex justify-between mb-2">
              <span style={{ color: "var(--text-secondary)" }}>Sous-total:</span>
              <span style={{ color: "var(--text-primary)" }}>{totals.subtotal.toFixed(2)}€</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between mb-2">
                <span style={{ color: "var(--text-secondary)" }}>Réduction:</span>
                <span style={{ color: "var(--text-primary)" }}>
                  -{totals.discount.toFixed(2)}€
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span style={{ color: "var(--text-heading)" }}>Total:</span>
              <span style={{ color: "var(--text-heading)" }}>{totals.total.toFixed(2)}€</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={clearCart}
              className="flex-1 px-4 py-3 rounded-lg font-semibold"
              style={{
                backgroundColor: cartSettings?.buttonColors.clearCart || "#ff0000",
                color: "white",
              }}
            >
              Vider le panier
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-3 rounded-lg font-semibold"
              style={{
                backgroundColor: cartSettings?.buttonColors.continue || "var(--button-background)",
                color: "var(--button-text)",
              }}
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Service Selection */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-heading)" }}>
            Choisir un service
          </h2>
          {cartSettings?.services
            ?.filter((s) => s.enabled)
            .map((service) => (
              <div key={service.id} className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedService(service.id);
                    setSelectedTimeSlot(null);
                  }}
                  className={`w-full p-4 rounded-lg border-2 text-left ${
                    selectedService === service.id ? "border-black" : ""
                  }`}
                  style={{
                    backgroundColor:
                      selectedService === service.id
                        ? cartSettings.buttonColors.selectedSlot
                        : cartSettings.buttonColors.unselectedSlot,
                    borderColor:
                      selectedService === service.id
                        ? cartSettings.buttonColors.selectedSlot
                        : "var(--border-color)",
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{service.label}</h3>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {service.description}
                      </p>
                      <p className="text-sm font-bold mt-1">{service.fee.toFixed(2)}€</p>
                    </div>
                  </div>
                </button>

                {selectedService === service.id && (
                  <div className="ml-4 space-y-2">
                    {service.timeSlots.map((slot) => (
                      <button
                        key={slot.value}
                        onClick={() => setSelectedTimeSlot(slot.value)}
                        className={`w-full p-2 rounded border text-left ${
                          selectedTimeSlot === slot.value ? "border-black" : ""
                        }`}
                        style={{
                          backgroundColor:
                            selectedTimeSlot === slot.value
                              ? cartSettings.buttonColors.selectedSlot
                              : cartSettings.buttonColors.unselectedSlot,
                        }}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

          <div className="flex gap-2">
            <button
              onClick={handleBack}
              className="flex-1 px-4 py-3 rounded-lg font-semibold"
              style={{
                backgroundColor: cartSettings?.buttonColors.back || "#666666",
                color: "white",
              }}
            >
              Retour
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedService || !selectedTimeSlot}
              className="flex-1 px-4 py-3 rounded-lg font-semibold disabled:opacity-50"
              style={{
                backgroundColor: "var(--button-background)",
                color: "var(--button-text)",
              }}
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Customer Info */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-heading)" }}>
            Informations client
          </h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Prénom *"
              value={customerInfo.firstName}
              onChange={(e) =>
                setCustomerInfo({ ...customerInfo, firstName: e.target.value })
              }
              required
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                backgroundColor: "var(--card-background)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            />
            <input
              type="text"
              placeholder="Nom *"
              value={customerInfo.lastName}
              onChange={(e) =>
                setCustomerInfo({ ...customerInfo, lastName: e.target.value })
              }
              required
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                backgroundColor: "var(--card-background)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            />
            <input
              type="tel"
              placeholder="Téléphone *"
              value={customerInfo.phone}
              onChange={(e) =>
                setCustomerInfo({ ...customerInfo, phone: e.target.value })
              }
              required
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                backgroundColor: "var(--card-background)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            />
            {selectedService !== "meetup" && (
              <>
                <input
                  type="text"
                  placeholder="Adresse *"
                  value={customerInfo.address}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, address: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--card-background)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
                <input
                  type="text"
                  placeholder="Complément d'adresse (optionnel)"
                  value={customerInfo.addressComplement}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, addressComplement: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--card-background)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </>
            )}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-4" style={{ color: "var(--text-heading)" }}>
              Mode de paiement
            </h3>
            <div className="space-y-2">
              {cartSettings?.paymentMethods
                ?.filter((p) => p.enabled)
                .map((payment) => (
                  <button
                    key={payment.id}
                    onClick={() => setSelectedPayment(payment.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left ${
                      selectedPayment === payment.id ? "border-black" : ""
                    }`}
                    style={{
                      backgroundColor:
                        selectedPayment === payment.id
                          ? cartSettings.buttonColors.selectedPayment
                          : cartSettings.buttonColors.unselectedPayment,
                    }}
                  >
                    {payment.label}
                  </button>
                ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleBack}
              className="flex-1 px-4 py-3 rounded-lg font-semibold"
              style={{
                backgroundColor: cartSettings?.buttonColors.back || "#666666",
                color: "white",
              }}
            >
              Retour
            </button>
            <button
              onClick={handleNext}
              disabled={
                !customerInfo.firstName ||
                !customerInfo.lastName ||
                !customerInfo.phone ||
                (selectedService !== "meetup" && !customerInfo.address) ||
                !selectedPayment
              }
              className="flex-1 px-4 py-3 rounded-lg font-semibold disabled:opacity-50"
              style={{
                backgroundColor: "var(--button-background)",
                color: "var(--button-text)",
              }}
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Summary */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-heading)" }}>
            Récapitulatif
          </h2>

          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--card-background)" }}>
            <h3 className="font-semibold mb-2" style={{ color: "var(--text-heading)" }}>
              Client
            </h3>
            <p style={{ color: "var(--text-primary)" }}>
              {customerInfo.firstName} {customerInfo.lastName}
            </p>
            <p style={{ color: "var(--text-primary)" }}>{customerInfo.phone}</p>
            {customerInfo.address && (
              <p style={{ color: "var(--text-primary)" }}>
                {customerInfo.address}
                {customerInfo.addressComplement && `, ${customerInfo.addressComplement}`}
              </p>
            )}
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--card-background)" }}>
            <h3 className="font-semibold mb-2" style={{ color: "var(--text-heading)" }}>
              Service
            </h3>
            <p style={{ color: "var(--text-primary)" }}>
              {service?.label} - {selectedTimeSlot}
            </p>
            <p style={{ color: "var(--text-primary)" }}>
              Frais: {service?.fee.toFixed(2)}€
            </p>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--card-background)" }}>
            <h3 className="font-semibold mb-2" style={{ color: "var(--text-heading)" }}>
              Paiement
            </h3>
            <p style={{ color: "var(--text-primary)" }}>
              {cartSettings?.paymentMethods?.find((p) => p.id === selectedPayment)?.label}
            </p>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--card-background)" }}>
            <h3 className="font-semibold mb-4" style={{ color: "var(--text-heading)" }}>
              Produits
            </h3>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between mb-2">
                <span style={{ color: "var(--text-primary)" }}>
                  {item.productName} ({item.variantLabel}) x {item.quantity}
                </span>
                <span style={{ color: "var(--text-primary)" }}>
                  {(item.unitPrice * item.quantity).toFixed(2)}€
                </span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 space-y-1">
              <div className="flex justify-between">
                <span style={{ color: "var(--text-secondary)" }}>Sous-total:</span>
                <span style={{ color: "var(--text-primary)" }}>{totals.subtotal.toFixed(2)}€</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Réduction:</span>
                  <span style={{ color: "var(--text-primary)" }}>
                    -{totals.discount.toFixed(2)}€
                  </span>
                </div>
              )}
              {service && (
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Frais:</span>
                  <span style={{ color: "var(--text-primary)" }}>{service.fee.toFixed(2)}€</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span style={{ color: "var(--text-heading)" }}>TOTAL:</span>
                <span style={{ color: "var(--text-heading)" }}>{finalTotal.toFixed(2)}€</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleBack}
              className="flex-1 px-4 py-3 rounded-lg font-semibold"
              style={{
                backgroundColor: cartSettings?.buttonColors.back || "#666666",
                color: "white",
              }}
            >
              Retour
            </button>
            <button
              onClick={handleCopyOrder}
              className="flex-1 px-4 py-3 rounded-lg font-semibold"
              style={{
                backgroundColor: cartSettings?.buttonColors.copy || "var(--button-background)",
                color: "var(--button-text)",
              }}
            >
              Copier
            </button>
            <button
              onClick={handleOpenTelegram}
              className="flex-1 px-4 py-3 rounded-lg font-semibold"
              style={{
                backgroundColor: "var(--button-background)",
                color: "var(--button-text)",
              }}
            >
              Telegram
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

