"use strict";

const appState = {
  activeCategory: "todos",
  searchTerm: "",
  selectedProduct: null,
  selectedSize: "personal",
  selectedExtras: [],
  selectedQuantity: 1,
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
    addDrinkToCart(drink);
    showToast(`${drink.name} agregada al pedido`);
  });
  card.append(imageBox, content);
  return card;
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
      renderSizes();
      renderExtras();
      updateProductTotal();
    });
    box.appendChild(label);
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
  const base = appState.selectedProduct.prices[appState.selectedSize];
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
    addPizzaToCart({
      productId: pizza.id,
      type: "pizza",
      name: pizza.name,
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
