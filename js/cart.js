"use strict";

const CART_STORAGE_KEY = "pizzity-cart-v1";
let cartItems = loadCart();
let currentOrderType = "local";

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn("No se pudo recuperar el carrito:", error);
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

function createCartItemId(item) {
  const extras = (item.extras || []).map((extra) => extra.id).sort().join("-");
  return `${item.type}-${item.productId}-${item.secondFlavor || "single"}-${item.firstProtein || "none"}-${item.secondProtein || "none"}-${item.size || "unit"}-${extras}-${item.notes || ""}`;
}

function addPizzaToCart(configuredPizza) {
  const item = {
    ...configuredPizza,
    cartId: createCartItemId(configuredPizza),
  };

  const existing = cartItems.find((entry) => entry.cartId === item.cartId);

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cartItems.push(item);
  }

  saveCart();
  renderCart();
  openCart();
}

function addDrinkToCart(drink) {
  const item = {
    cartId: `drink-${drink.id}-${drink.selectedFlavor || "regular"}`,
    productId: drink.id,
    type: "drink",
    name: drink.name,
    image: drink.image,
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    size: null,
    extras: [],
    notes: "",
    selectedFlavor: drink.selectedFlavor || null,
    selectedOptionLabel:
      drink.selectedOptionLabel ||
      drink.optionLabel ||
      "Opción",
    quantity: 1,
    unitTotal: Number(drink.price),
  };

  const existing = cartItems.find((entry) => entry.cartId === item.cartId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.push(item);
  }

  saveCart();
  renderCart();
  openCart();
}

function updateCartQuantity(cartId, change) {
  const item = cartItems.find((entry) => entry.cartId === cartId);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cartItems = cartItems.filter((entry) => entry.cartId !== cartId);
  }

  saveCart();
  renderCart();
}

function removeCartItem(cartId) {
  cartItems = cartItems.filter((item) => item.cartId !== cartId);
  saveCart();
  renderCart();
}

function getProductsSubtotal() {
  return cartItems.reduce(
    (total, item) => total + Number(item.unitTotal) * item.quantity,
    0
  );
}

function getPackagingTotal() {
  if (currentOrderType !== "pickup") return 0;

  return cartItems.reduce((total, item) => {
    if (item.type !== "pizza" || !item.size) return total;
    return total + getPackagingPrice(item.size) * item.quantity;
  }, 0);
}

function getOrderTotal() {
  return getProductsSubtotal() + getPackagingTotal();
}

function getCartCount() {
  return cartItems.reduce((total, item) => total + item.quantity, 0);
}

function sizeDisplay(sizeId) {
  if (!sizeId) return "Unidad";
  const size = getSizeInformation(sizeId);
  return size ? `${size.name} (${size.diameter})` : sizeId;
}

function emptyCartMarkup() {
  return `
    <div class="empty-cart">
      <i class="fa-solid fa-bag-shopping"></i>
      <h3>Tu pedido está vacío</h3>
      <p>Agrega una pizza o bebida desde el menú.</p>
      <button type="button" class="button button--secondary" id="explore-menu-button">
        Explorar el menú
      </button>
    </div>
  `;
}

function renderCart() {
  const productsContainer = document.getElementById("cart-products");
  const counter = document.getElementById("cart-counter");
  const subtotalElement = document.getElementById("cart-products-subtotal");
  const packagingElement = document.getElementById("cart-packaging-total");
  const totalElement = document.getElementById("cart-total");
  const checkoutTotal = document.getElementById("checkout-total");
  const continueButton = document.getElementById("continue-order-button");

  if (counter) counter.textContent = getCartCount();
  if (subtotalElement) subtotalElement.textContent = formatCurrency(getProductsSubtotal());
  if (packagingElement) packagingElement.textContent = formatCurrency(getPackagingTotal());
  if (totalElement) totalElement.textContent = formatCurrency(getOrderTotal());
  if (checkoutTotal) checkoutTotal.textContent = formatCurrency(getOrderTotal());
  if (continueButton) continueButton.disabled = cartItems.length === 0;

  if (!productsContainer) return;

  if (cartItems.length === 0) {
    productsContainer.innerHTML = emptyCartMarkup();
    document.getElementById("explore-menu-button")?.addEventListener("click", () => {
      closeCart();
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
    });
    return;
  }

  productsContainer.innerHTML = cartItems
    .map((item) => {
      const extrasText = item.extras?.length
        ? item.extras.map((extra) => extra.name).join(", ")
        : "Sin adicionales";

      return `
        <article class="cart-item" data-cart-id="${item.cartId}">
          <img class="cart-item__image" src="${item.image}" alt="${item.name}"
               onerror="this.onerror=null;this.src='${item.fallbackImage}'">
          <div class="cart-item__content">
            <div class="cart-item__top">
              <div>
                <h3>${item.name}</h3>
                <p>${item.type === "pizza" ? sizeDisplay(item.size) : "Bebida"}</p>
                ${item.selectedFlavor ? `<p class="cart-item__flavor">${item.selectedOptionLabel || "Opción"}: ${item.selectedFlavor}</p>` : ""}
                ${item.firstProtein ? `<p class="cart-item__protein">Proteína${item.halfAndHalf ? ` de ${item.firstFlavor}` : ""}: ${item.firstProtein}</p>` : ""}
                ${item.secondProtein ? `<p class="cart-item__protein">Proteína de ${item.secondFlavor}: ${item.secondProtein}</p>` : ""}
              </div>
              <button type="button" class="cart-item__remove" data-action="remove" aria-label="Eliminar ${item.name}">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
            ${item.type === "pizza" ? `<p class="cart-item__extras">${extrasText}</p>` : ""}
            ${item.notes ? `<p class="cart-item__notes">Nota: ${item.notes}</p>` : ""}
            <div class="cart-item__bottom">
              <div class="cart-item__quantity">
                <button type="button" data-action="decrease" aria-label="Reducir cantidad">−</button>
                <span>${item.quantity}</span>
                <button type="button" data-action="increase" aria-label="Aumentar cantidad">+</button>
              </div>
              <strong>${formatCurrency(item.unitTotal * item.quantity)}</strong>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  productsContainer.querySelectorAll(".cart-item").forEach((element) => {
    const cartId = element.dataset.cartId;
    element.querySelector('[data-action="decrease"]')?.addEventListener("click", () => updateCartQuantity(cartId, -1));
    element.querySelector('[data-action="increase"]')?.addEventListener("click", () => updateCartQuantity(cartId, 1));
    element.querySelector('[data-action="remove"]')?.addEventListener("click", () => removeCartItem(cartId));
  });
}

function openOverlay() {
  const overlay = document.getElementById("modal-overlay");
  if (overlay) overlay.style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeOverlayIfUnused() {
  const productModal = document.getElementById("product-modal");
  const checkoutModal = document.getElementById("checkout-modal");
  const cartPanel = document.getElementById("cart-panel");
  const somethingOpen =
    (productModal && !productModal.hidden) ||
    (checkoutModal && !checkoutModal.hidden) ||
    cartPanel?.classList.contains("open");

  if (!somethingOpen) {
    const overlay = document.getElementById("modal-overlay");
    if (overlay) overlay.style.display = "none";
    document.body.style.overflow = "";
  }
}

function openCart() {
  const panel = document.getElementById("cart-panel");
  if (!panel) return;
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
  openOverlay();
}

function closeCart() {
  const panel = document.getElementById("cart-panel");
  if (!panel) return;
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
  closeOverlayIfUnused();
}

function openCheckout() {
  if (cartItems.length === 0) return;
  closeCart();
  const modal = document.getElementById("checkout-modal");
  if (!modal) return;
  modal.hidden = false;
  openOverlay();
  renderCart();
}

function closeCheckout() {
  const modal = document.getElementById("checkout-modal");
  if (modal) modal.hidden = true;
  closeOverlayIfUnused();
}

function buildWhatsAppMessage(formData) {
  const orderTypeLabel = currentOrderType === "pickup" ? "Pedido para llevar" : "Comer en el local";
  const lines = [
    "*NUEVO PEDIDO WEB | PIZZITY EXPRESS*",
    "",
    `*Cliente:* ${sanitizeCustomerText(formData.get("customerName"))}`,
    `*Modalidad:* ${orderTypeLabel}`,
    `*Hora aproximada:* ${formData.get("pickupTime")}`,
    "*Método de pago:* Transferencia bancaria",
    "",
    "*PRODUCTOS*",
  ];

  cartItems.forEach((item, index) => {
    lines.push("");
    lines.push(`${index + 1}. *${item.quantity}x ${item.name}*`);
    if (item.type === "pizza") {
      lines.push(`   Tamaño: ${sizeDisplay(item.size)}`);
      if (item.halfAndHalf && item.secondFlavor) {
        lines.push(`   Sabores: 1/2 ${item.firstFlavor} + 1/2 ${item.secondFlavor}`);
      }
      if (item.firstProtein) {
        lines.push(`   Proteína${item.halfAndHalf ? ` de ${item.firstFlavor}` : ""}: ${item.firstProtein}`);
      }
      if (item.secondProtein) {
        lines.push(`   Proteína de ${item.secondFlavor}: ${item.secondProtein}`);
      }
      if (item.extras?.length) lines.push(`   Extras: ${item.extras.map((extra) => extra.name).join(", ")}`);
      if (item.notes) lines.push(`   Nota: ${item.notes}`);
    }
    if (item.type === "drink" && item.selectedFlavor) {
      lines.push(
        `   ${item.selectedOptionLabel || "Opción"}: ${item.selectedFlavor}`
      );
    }
    lines.push(`   Subtotal: ${formatCurrency(item.unitTotal * item.quantity)}`);
  });

  lines.push("");
  lines.push(`*Productos:* ${formatCurrency(getProductsSubtotal())}`);
  if (currentOrderType === "pickup") lines.push(`*Empaque:* ${formatCurrency(getPackagingTotal())}`);
  lines.push(`*TOTAL:* ${formatCurrency(getOrderTotal())}`);

  const generalNotes = sanitizeCustomerText(formData.get("orderNotes") || "");
  if (generalNotes) {
    lines.push("");
    lines.push(`*Observaciones:* ${generalNotes}`);
  }

  lines.push("");
  lines.push("*IMPORTANTE:* Envíen los datos bancarios para realizar la transferencia.");
  lines.push("El pedido será preparado después de confirmar el pago.");
  lines.push("");
  lines.push("¿Me confirman la disponibilidad y la hora, por favor?");
  return lines.join("\n");
}

function initializeCart() {
  document.getElementById("open-cart-button")?.addEventListener("click", openCart);
  document.getElementById("close-cart-button")?.addEventListener("click", closeCart);
  document.getElementById("continue-order-button")?.addEventListener("click", openCheckout);
  document.getElementById("close-checkout-modal")?.addEventListener("click", closeCheckout);

  document.querySelectorAll('input[name="orderType"]').forEach((radio) => {
    radio.addEventListener("change", (event) => {
      currentOrderType = event.target.value;
      renderCart();
    });
  });

  document.getElementById("checkout-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const paymentPolicyAccepted = document.getElementById(
        "payment-policy-accepted"
    );

    if (
        !paymentPolicyAccepted ||
        !paymentPolicyAccepted.checked
    ) {
    alert(
        "Debes aceptar la política de pago por transferencia para continuar."
    );

    return;
    }

    if (cartItems.length === 0) return;

    const formData = new FormData(event.currentTarget);
    const customerName = sanitizeCustomerText(formData.get("customerName") || "");
    if (customerName.length < 2) {
      alert("Escribe un nombre válido.");
      return;
    }

    const message = buildWhatsAppMessage(formData);
    window.open(`https://wa.me/${PIZZITY_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  });

  document.getElementById("modal-overlay")?.addEventListener("click", () => {
    closeCart();
    closeCheckout();
  });

  renderCart();
  console.log("Carrito de Pizzity Express iniciado.");
}

document.addEventListener("DOMContentLoaded", initializeCart);
