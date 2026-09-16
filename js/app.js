"use strict";

const appState = {
  activeCategory: "todos",
  searchTerm: "",
  selectedProduct: null,
  selectedSize: "personal",
  selectedExtras: [],
  selectedQuantity: 1,
  halfAndHalf: false,
  secondFlavor: null,
};

const byId = (id) => document.getElementById(id);

function normalizeText(text) {
  return String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function showToast(message) {
  const toast = byId("toast");
  const text = byId("toast-message");
  if (!toast || !text) return;
  text.textContent = message;
  toast.style.display = "flex";
  toast.setAttribute("aria-hidden", "false");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.style.display = "none";
    toast.setAttribute("aria-hidden", "true");
  }, 2000);
}

function categoryName(category) {
  return {
    clasicas: "Pizza clásica",
    especiales: "Pizza especial",
    pollo: "Pizza con pollo",
    vegetarianas: "Pizza vegetariana",
    bebidas: "Bebida",
  }[category] || "Producto";
}

function imageWithFallback(src, alt, fallback) {
  const image = document.createElement("img");
  image.src = src;
  image.alt = alt;
  image.loading = "lazy";
  image.addEventListener("error", () => {
    image.onerror = null;
    image.src = fallback;
  });
  return image;
}

function createPizzaCard(pizza) {
  const card = document.createElement("article");
  card.className = "product-card";

  const imageBox = document.createElement("div");
  imageBox.className = "product-card__image";
  imageBox.appendChild(imageWithFallback(pizza.image, `Pizza ${pizza.name}`, pizza.fallbackImage));

  const badges = document.createElement("div");
  badges.className = "product-card__badges";
  if (pizza.featured) badges.innerHTML += '<span class="product-badge product-badge--featured"><i class="fa-solid fa-star"></i> Recomendada</span>';
  if (pizza.spicy) badges.innerHTML += '<span class="product-badge product-badge--spicy"><i class="fa-solid fa-fire-flame-curved"></i> Picante</span>';
  imageBox.appendChild(badges);

  const lowest = Math.min(pizza.prices.personal, pizza.prices.medium, pizza.prices.family);
  const content = document.createElement("div");
  content.className = "product-card__content";
  content.innerHTML = `
    <p class="product-card__category">${categoryName(pizza.category)}</p>
    <h3>${pizza.name}</h3>
    <p class="product-card__description">${pizza.description}</p>
    <div class="product-card__prices">
      <div><span>Personal</span><strong>${formatCurrency(pizza.prices.personal)}</strong></div>
      <div><span>Mediana</span><strong>${formatCurrency(pizza.prices.medium)}</strong></div>
      <div><span>Familiar</span><strong>${formatCurrency(pizza.prices.family)}</strong></div>
    </div>
    <div class="product-card__footer">
      <div class="product-card__starting-price"><span>Desde</span><strong>${formatCurrency(lowest)}</strong></div>
      <button type="button" class="button button--primary customize-product-button">Personalizar <i class="fa-solid fa-sliders"></i></button>
    </div>`;
  content.querySelector("button").addEventListener("click", () => openPizzaModal(pizza.id));
  card.append(imageBox, content);
  return card;
}

function createDrinkCard(drink) {
  const card = document.createElement("article");
  card.className = "product-card product-card--drink";
  const imageBox = document.createElement("div");
  imageBox.className = "product-card__image product-card__image--drink";
  imageBox.appendChild(
  imageWithFallback(
    drink.image,
    drink.name,
    drink.fallbackImage
  )
);
  imageBox.insertAdjacentHTML("beforeend", '<span class="product-badge product-badge--drink"><i class="fa-solid fa-glass-water"></i> Bebida</span>');
  const content = document.createElement("div");
  content.className = "product-card__content";
  content.innerHTML = `
    <p class="product-card__category">Bebidas</p><h3>${drink.name}</h3>
    <p class="product-card__description">${drink.description}</p>
    <div class="product-card__footer">
      <div class="product-card__starting-price"><span>Precio</span><strong>${formatCurrency(drink.price)}</strong></div>
      <button type="button" class="button button--primary">Agregar <i class="fa-solid fa-plus"></i></button>
    </div>`;
  content.querySelector("button").addEventListener("click", () => {
    if (drink.requiresFlavor) {
      openDrinkFlavorModal(drink);
      return;
    }
    addDrinkToCart(drink);
    showToast(`${drink.name} agregada al pedido`);
  });
  card.append(imageBox, content);
  return card;
}

function openDrinkFlavorModal(drink) {
  let modal = byId("drink-flavor-modal");

  if (!modal) {
    modal = document.createElement("section");
    modal.id = "drink-flavor-modal";
    modal.className = "drink-flavor-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="drink-flavor-modal__header">
      <div><p>Personaliza tu bebida</p><h2>${drink.selectorTitle || "Elije una opción"}</h2></div>
      <button type="button" class="drink-flavor-modal__close" aria-label="Cerrar selector"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="drink-flavor-modal__product">
      <img src="${drink.image}" alt="${drink.name}" onerror="this.onerror=null;this.src='${drink.fallbackImage}'">
      <div><h3>${drink.name}</h3><p>${drink.description}</p><strong>${formatCurrency(drink.price)}</strong></div>
    </div>
    <div class="drink-flavor-modal__options">
      ${drink.flavors.map((flavor, index) => `
        <label class="drink-flavor-option ${index === 0 ? "selected" : ""}">
          <input type="radio" name="granizadoFlavor" value="${flavor}" ${index === 0 ? "checked" : ""}>
          <span class="drink-flavor-option__dot drink-flavor-option__dot--${normalizeText(flavor)}"></span>
          <span>${flavor}</span><i class="fa-solid fa-check"></i>
        </label>`).join("")}
    </div>
    <button type="button" class="button button--primary button--full" id="confirm-drink-flavor">Agregar al pedido <i class="fa-solid fa-plus"></i></button>`;

  const overlay = byId("modal-overlay");
  if (overlay) overlay.style.display = "block";
  modal.classList.add("open");
  document.body.style.overflow = "hidden";

  const closeModal = () => {
    modal.classList.remove("open");
    if (overlay) overlay.style.display = "none";
    document.body.style.overflow = "";
  };

  modal.querySelector(".drink-flavor-modal__close")?.addEventListener("click", closeModal);
  modal.querySelectorAll('input[name="granizadoFlavor"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      modal.querySelectorAll(".drink-flavor-option").forEach((option) => option.classList.remove("selected"));
      radio.closest(".drink-flavor-option")?.classList.add("selected");
    });
  });
  byId("confirm-drink-flavor")?.addEventListener("click", () => {
    const selected = modal.querySelector('input[name="granizadoFlavor"]:checked');
    if (!selected) return;
    addDrinkToCart({
      ...drink, 
      selectedFlavor: selected.value,
      selectedOptionLabel: drink.optionLabel || "Opción",
    });
    showToast(`${drink.name} de ${selected.value} agregado al pedido`);
    closeModal();
  });
}

function renderMenu() {
  const grid = byId("menu-grid");
  if (!grid) return;
  grid.innerHTML = "";
  const search = normalizeText(appState.searchTerm);
  const pizzas = PIZZAS.filter((p) =>
    (appState.activeCategory === "todos" || p.category === appState.activeCategory) &&
    normalizeText(`${p.name} ${p.description} ${p.category}`).includes(search)
  );
  const drinks = DRINKS.filter((d) =>
    (appState.activeCategory === "todos" || appState.activeCategory === "bebidas") &&
    normalizeText(`${d.name} ${d.description}`).includes(search)
  );
  pizzas.forEach((pizza) => grid.appendChild(createPizzaCard(pizza)));
  drinks.forEach((drink) => grid.appendChild(createDrinkCard(drink)));
  if (byId("empty-results")) byId("empty-results").hidden = pizzas.length + drinks.length > 0;
}

function openPizzaModal(pizzaId) {
  const pizza = findPizzaById(pizzaId);
  if (!pizza) return;
  appState.selectedProduct = pizza;
  appState.selectedSize = "personal";
  appState.selectedExtras = [];
  appState.selectedQuantity = 1;
  appState.halfAndHalf = false;
  appState.secondFlavor = null;
  byId("modal-product-name").textContent = pizza.name;
  byId("modal-product-description").textContent = pizza.description;
  byId("modal-product-image").src = pizza.image;
  byId("modal-product-image").onerror = () => {
    byId("modal-product-image").onerror = null;
    byId("modal-product-image").src = pizza.fallbackImage;
  };
  byId("product-quantity").textContent = "1";
  byId("product-notes").value = "";
  renderSizes();
  renderHalfAndHalfOptions();
  renderExtras();
  updateProductTotal();
  byId("product-modal").hidden = false;
  byId("modal-overlay").style.display = "block";
  document.body.style.overflow = "hidden";
}

function closePizzaModal() {
  byId("product-modal").hidden = true;
  byId("modal-overlay").style.display = "none";
  document.body.style.overflow = "";
}

function renderSizes() {
  const box = byId("modal-size-options");
  box.innerHTML = "";
  Object.values(PIZZA_SIZES).forEach((size) => {
    const label = document.createElement("label");
    label.className = `size-option${size.id === appState.selectedSize ? " selected" : ""}`;
    label.innerHTML = `<input type="radio" name="pizzaSize" value="${size.id}" ${size.id === appState.selectedSize ? "checked" : ""}>
      <span class="size-option__information"><strong>${size.name}</strong><small>${size.diameter} · ${size.portions}</small></span>
      <strong class="size-option__price">${formatCurrency(appState.selectedProduct.prices[size.id])}</strong>`;
    label.querySelector("input").addEventListener("change", () => {
      appState.selectedSize = size.id;
      if (size.id === "personal") {
        appState.halfAndHalf = false;
        appState.secondFlavor = null;
      }
      renderSizes();
      renderHalfAndHalfOptions();
      renderExtras();
      updateProductTotal();
    });
    box.appendChild(label);
  });
}

function renderHalfAndHalfOptions() {
  const sizeBox = byId("modal-size-options");
  if (!sizeBox) return;

  let container = byId("half-and-half-options");
  if (!container) {
    container = document.createElement("div");
    container.id = "half-and-half-options";
    container.className = "half-and-half-options";
    sizeBox.insertAdjacentElement("afterend", container);
  }

  if (appState.selectedSize === "personal") {
    container.innerHTML = '<p class="half-note">El tamaño personal se prepara con un solo sabor.</p>';
    return;
  }

  const options = PIZZAS
    .filter((pizza) => pizza.id !== appState.selectedProduct.id)
    .map((pizza) => `<option value="${pizza.id}" ${appState.secondFlavor?.id === pizza.id ? "selected" : ""}>${pizza.name}</option>`)
    .join("");

  container.innerHTML = `
    <label class="half-toggle">
      <input type="checkbox" id="half-and-half-checkbox" ${appState.halfAndHalf ? "checked" : ""}>
      <span><strong>Preparar mitad y mitad</strong><small>Disponible en mediana y familiar</small></span>
    </label>
    <div class="second-flavor-field" ${appState.halfAndHalf ? "" : "hidden"}>
      <label for="second-flavor-select">Segundo sabor</label>
      <select id="second-flavor-select">
        <option value="">Selecciona el segundo sabor</option>
        ${options}
      </select>
      <p>Se cobrará el 50% de cada sabor.</p>
    </div>`;

  byId("half-and-half-checkbox")?.addEventListener("change", (event) => {
    appState.halfAndHalf = event.target.checked;
    if (!appState.halfAndHalf) appState.secondFlavor = null;
    renderHalfAndHalfOptions();
    updateProductTotal();
  });

  byId("second-flavor-select")?.addEventListener("change", (event) => {
    appState.secondFlavor = event.target.value ? findPizzaById(event.target.value) : null;
    updateProductTotal();
  });
}

function renderExtras() {
  const box = byId("modal-extra-options");
  box.innerHTML = "";
  ALL_EXTRAS.forEach((extra) => {
    const selected = appState.selectedExtras.some((item) => item.id === extra.id);
    const label = document.createElement("label");
    label.className = `extra-option${selected ? " selected" : ""}`;
    label.innerHTML = `<input type="checkbox" ${selected ? "checked" : ""}>
      <span><strong>${extra.name}</strong><small>${extra.group === "vegetable" ? "Extra vegetal" : "Extra especial"}</small></span>
      <strong class="extra-option__price">+${formatCurrency(getExtraPrice(extra.group, appState.selectedSize))}</strong>`;
    label.querySelector("input").addEventListener("change", (event) => {
      if (event.target.checked) appState.selectedExtras.push(extra);
      else appState.selectedExtras = appState.selectedExtras.filter((item) => item.id !== extra.id);
      renderExtras();
      updateProductTotal();
    });
    box.appendChild(label);
  });
}

function unitTotal() {
  if (!appState.selectedProduct) return 0;
  let base = appState.selectedProduct.prices[appState.selectedSize];
  if (appState.halfAndHalf && appState.secondFlavor && appState.selectedSize !== "personal") {
    base =
      appState.selectedProduct.prices[appState.selectedSize] / 2 +
      appState.secondFlavor.prices[appState.selectedSize] / 2;
  }
  const extras = appState.selectedExtras.reduce((sum, extra) => sum + getExtraPrice(extra.group, appState.selectedSize), 0);
  return base + extras;
}

function updateProductTotal() {
  byId("modal-product-total").textContent = formatCurrency(unitTotal() * appState.selectedQuantity);
}

function initializeApp() {
  renderMenu();
  byId("menu-search")?.addEventListener("input", (event) => {
    appState.searchTerm = event.target.value;
    renderMenu();
  });
  byId("category-filters")?.addEventListener("click", (event) => {
    const button = event.target.closest(".filter-button");
    if (!button) return;
    appState.activeCategory = button.dataset.category;
    document.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderMenu();
  });
  byId("decrease-product-quantity")?.addEventListener("click", () => {
    if (appState.selectedQuantity > 1) appState.selectedQuantity--;
    byId("product-quantity").textContent = appState.selectedQuantity;
    updateProductTotal();
  });
  byId("increase-product-quantity")?.addEventListener("click", () => {
    if (appState.selectedQuantity < 20) appState.selectedQuantity++;
    byId("product-quantity").textContent = appState.selectedQuantity;
    updateProductTotal();
  });
  byId("add-product-to-cart")?.addEventListener("click", () => {
    const pizza = appState.selectedProduct;
    if (!pizza) return;
    if (appState.halfAndHalf && !appState.secondFlavor) {
      alert("Selecciona el segundo sabor de la pizza mitad y mitad.");
      return;
    }
    addPizzaToCart({
      productId: pizza.id,
      type: "pizza",
      name: appState.halfAndHalf && appState.secondFlavor
        ? `Mitad ${pizza.name} / Mitad ${appState.secondFlavor.name}`
        : pizza.name,
      firstFlavor: pizza.name,
      secondFlavor: appState.secondFlavor?.name || null,
      halfAndHalf: appState.halfAndHalf,
      image: pizza.image,
      fallbackImage: pizza.fallbackImage,
      size: appState.selectedSize,
      extras: [...appState.selectedExtras],
      quantity: appState.selectedQuantity,
      notes: sanitizeCustomerText(byId("product-notes")?.value || ""),
      unitTotal: unitTotal(),
    });
    showToast(`${pizza.name} agregada al pedido`);
    closePizzaModal();
  });
  byId("close-product-modal")?.addEventListener("click", closePizzaModal);
  byId("mobile-menu-button")?.addEventListener("click", () => byId("mobile-navigation")?.classList.toggle("open"));
  if (byId("current-year")) byId("current-year").textContent = new Date().getFullYear();
  console.log(`Menú iniciado: ${PIZZAS.length} pizzas y ${DRINKS.length} bebidas.`);
}

document.addEventListener("DOMContentLoaded", initializeApp);
