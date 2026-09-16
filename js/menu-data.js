"use strict";

/* =====================================================
   CONFIGURACIÓN GENERAL DE PIZZITY EXPRESS
===================================================== */

const PIZZITY_CONFIG = {
  businessName: "Pizzity Express",

  whatsappNumber: "593987775595",

  phoneDisplay: "+593 98 777 5595",

  address: "Plácido Caamaño N25-62 y San Ignacio, Quito, Ecuador",

  mapsUrl: "https://maps.app.goo.gl/hwd1XVbwqZfLxo4U8?g_st=ac",

  instagramUrl: "https://www.instagram.com/pizzityquito",

  facebookUrl:
    "https://www.facebook.com/people/Pizzity/61557080229458/",

  tiktokUrl: "https://www.tiktok.com/@pizzityexpress",

  currency: "USD",

  locale: "es-EC",

  openingTime: "12:30",

  closingTime: "20:00",

  preparationTime: "20 a 30 minutos",
};

/* =====================================================
   INFORMACIÓN DE LOS TAMAÑOS
===================================================== */

const PIZZA_SIZES = {
  personal: {
    id: "personal",
    name: "Personal",
    diameter: "22 cm",
    portions: "Porción personal",
  },

  medium: {
    id: "medium",
    name: "Mediana",
    diameter: "35 cm",
    portions: "8 porciones",
  },

  family: {
    id: "family",
    name: "Familiar",
    diameter: "45 cm",
    portions: "12 porciones",
  },
};

/* =====================================================
   PRECIOS DE EMPAQUE PARA PEDIDOS PARA LLEVAR
===================================================== */

const PACKAGING_PRICES = {
  personal: 0.25,
  medium: 0.5,
  family: 0.75,
};

/* =====================================================
   INGREDIENTES ADICIONALES
===================================================== */

const VEGETABLE_EXTRAS = [
  {
    id: "champiñones",
    name: "Champiñones",
    group: "vegetable",
  },
  {
    id: "tomate-cherry",
    name: "Tomate cherry",
    group: "vegetable",
  },
  {
    id: "albahaca",
    name: "Albahaca",
    group: "vegetable",
  },
  {
    id: "cebolla",
    name: "Cebolla",
    group: "vegetable",
  },
  {
    id: "pimiento",
    name: "Pimiento",
    group: "vegetable",
  },
];

const SPECIAL_EXTRAS = [
  {
    id: "queso",
    name: "Queso mozzarella",
    group: "special",
  },
  {
    id: "embutidos",
    name: "Embutidos",
    group: "special",
  },
  {
    id: "aceitunas",
    name: "Aceitunas",
    group: "special",
  },
  {
    id: "piña",
    name: "Piña",
    group: "special",
  },
  {
    id: "pollo",
    name: "Pollo",
    group: "special",
  },
  {
    id: "carne",
    name: "Carne",
    group: "special",
  },
  {
    id: "parmesano",
    name: "Queso parmesano",
    group: "special",
  },
  {
    id: "pesto",
    name: "Pesto",
    group: "special",
  },
  {
    id: "bbq",
    name: "Salsa BBQ",
    group: "special",
  },
];

/* =====================================================
   PRECIOS DE LOS INGREDIENTES ADICIONALES
===================================================== */

const EXTRA_PRICES = {
  vegetable: {
    personal: 0.5,
    medium: 2,
    family: 2.5,
  },

  special: {
    personal: 0.75,
    medium: 2.5,
    family: 3,
  },
};

/* Unimos todos los extras en una sola lista. */

const ALL_EXTRAS = [...VEGETABLE_EXTRAS, ...SPECIAL_EXTRAS];

/* =====================================================
   MENÚ DE PIZZAS
===================================================== */

const PIZZAS = [
  {
    id: "solo-queso",
    name: "Solo Queso",
    description: "Salsa de tomate y queso mozzarella.",
    category: "clasicas",
    image: "./assets/pizzas/solo-queso.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    featured: false,
    spicy: false,

    prices: {
      personal: 1.75,
      medium: 6.5,
      family: 10,
    },
  },

  {
    id: "salami",
    name: "Salami",
    description: "Salsa de tomate, queso mozzarella y salami.",
    category: "clasicas",
    image: "./assets/pizzas/salami.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    featured: false,
    spicy: false,

    prices: {
      personal: 2.25,
      medium: 8.5,
      family: 11.5,
    },
  },

  {
    id: "margarita",
    name: "Margarita",
    description:
      "Salsa de tomate, queso mozzarella, albahaca y tomate cherry.",
    category: "vegetarianas",
    image: "./assets/pizzas/margarita.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    featured: true,
    spicy: false,

    prices: {
      personal: 2.5,
      medium: 9.5,
      family: 12.5,
    },
  },

  {
    id: "margarita-especial",
    name: "Margarita Especial",
    description:
      "Mozzarella, cebolla, pesto, tomate cherry y aceitunas.",
    category: "vegetarianas",
    image: "./assets/pizzas/margarita-especial.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    featured: true,
    spicy: false,

    prices: {
      personal: 3.5,
      medium: 13.5,
      family: 16.5,
    },
  },

  {
    id: "vegetariana",
    name: "Vegetariana",
    description:
      "Mozzarella, cebolla, champiñones, pimiento, tomate cherry y aceitunas.",
    category: "vegetarianas",
    image: "./assets/pizzas/vegetariana.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    featured: false,
    spicy: false,

    prices: {
      personal: 3.5,
      medium: 13.5,
      family: 16.5,
    },
  },

  {
    id: "pollo-champi",
    name: "Pollo Champi",
    description:
      "Salsa de tomate, queso mozzarella, pollo y champiñones.",
    category: "pollo",
    image: "./assets/pizzas/pollo-champi.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    featured: true,
    spicy: false,

    prices: {
      personal: 3,
      medium: 11.5,
      family: 14.5,
    },
  },

  {
    id: "hawaiana",
    name: "Hawaiana",
    description:
      "Salsa de tomate, queso mozzarella, jamón y piña.",
    category: "clasicas",
    image: "./assets/pizzas/hawaiana.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    featured: true,
    spicy: false,

    prices: {
      personal: 3,
      medium: 11.5,
      family: 14.5,
    },
  },

  {
    id: "miel-picante",
    name: "Miel Picante",
    description:
      "Salsa de tomate, mozzarella, doble pepperoni y miel picante.",
    category: "especiales",
    image: "./assets/pizzas/miel-picante.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    featured: true,
    spicy: true,

    prices: {
      personal: 3.5,
      medium: 13.5,
      family: 16.5,
    },
  },

  {
    id: "bbq",
    name: "BBQ",
    description:
      "Salsa de tomate, mozzarella, tocino, pollo y salsa BBQ.",
    category: "pollo",
    image: "./assets/pizzas/bbq.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    featured: true,
    spicy: false,

    prices: {
      personal: 3.5,
      medium: 13.5,
      family: 16.5,
    },
  },

  {
    id: "champi",
    name: "Champi",
    description:
      "Salsa de tomate, queso mozzarella, jamón y champiñones.",
    category: "clasicas",
    image: "./assets/pizzas/champi.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    featured: false,
    spicy: false,

    prices: {
      personal: 2.75,
      medium: 10.5,
      family: 13.5,
    },
  },

  {
    id: "caprichosa",
    name: "Caprichosa",
    description:
      "Mozzarella, jamón, cebolla, albahaca y champiñones.",
    category: "especiales",
    image: "./assets/pizzas/caprichosa.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    featured: false,
    spicy: false,

    prices: {
      personal: 3.25,
      medium: 12.5,
      family: 15.5,
    },
  },

  {
    id: "jamon-pepperoni",
    name: "Jamón Pepperoni",
    description:
      "Salsa de tomate, mozzarella, jamón y pepperoni.",
    category: "clasicas",
    image: "./assets/pizzas/jamon-pepperoni.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    featured: false,
    spicy: false,

    prices: {
      personal: 2.75,
      medium: 10.5,
      family: 13.5,
    },
  },

  {
    id: "especial",
    name: "Especial",
    description:
      "Mozzarella, tocino, champiñones y elección de carne o pollo.",
    category: "especiales",
    image: "./assets/pizzas/especial.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    featured: true,
    spicy: false,

    prices: {
      personal: 3.5,
      medium: 13.5,
      family: 16.5,
    },
  },

  {
    id: "mix-embutidos",
    name: "Mix Embutidos",
    description:
      "Mozzarella, jamón, salami, pepperoni y tocino.",
    category: "especiales",
    image: "./assets/pizzas/mix-embutidos.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    featured: true,
    spicy: false,

    prices: {
      personal: 3.5,
      medium: 13.5,
      family: 16.5,
    },
  },
];

/* =====================================================
   MENÚ DE BEBIDAS
===================================================== */

const DRINKS = [
  {
    id: "gaseosa",
    name: "Gaseosa",
    description: "Consulta los sabores disponibles.",
    category: "bebidas",
    image: "./assets/bebidas/gaseosa.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    price: 1,
    featured: false,
  },

  {
    id: "te",
    name: "Té",
    description: "Consulta las opciones disponibles.",
    category: "bebidas",
    image: "./assets/bebidas/te.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    price: 1,
    featured: false,
  },

  {
    id: "agua",
    name: "Agua",
    description: "Botella de agua sin gas.",
    category: "bebidas",
    image: "./assets/bebidas/agua.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    price: 1,
    featured: false,
  },

  {
    id: "agua-con-gas",
    name: "Agua con gas",
    description: "Botella de agua con gas.",
    category: "bebidas",
    image: "./assets/bebidas/agua-con-gas.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    price: 1.25,
    featured: false,
  },

  {
    id: "cerveza",
    name: "Cerveza",
    description: "Consulta las opciones disponibles en el local.",
    category: "bebidas",
    image: "./assets/bebidas/cerveza.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    price: 2,
    featured: false,
  },

  {
    id: "cafe",
    name: "Café",
    description: "Café preparado al momento.",
    category: "bebidas",
    image: "./assets/bebidas/cafe.jpg",
    fallbackImage: "./assets/logo/pizzity-logo.jpg",
    price: 1,
    featured: false,
  },
];
/* =====================================================
   FUNCIONES DE APOYO
===================================================== */

/**
 * Convierte un valor numérico al formato monetario de Ecuador.
 *
 * Ejemplo:
 * 3.5 se convierte en "$3,50"
 */

function formatCurrency(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "$0,00";
  }

  return new Intl.NumberFormat(PIZZITY_CONFIG.locale, {
    style: "currency",
    currency: PIZZITY_CONFIG.currency,
    minimumFractionDigits: 2,
  }).format(numericValue);
}

/**
 * Busca una pizza utilizando el identificador único.
 */

function findPizzaById(pizzaId) {
  return PIZZAS.find((pizza) => pizza.id === pizzaId);
}

/**
 * Busca una bebida utilizando el identificador único.
 */

function findDrinkById(drinkId) {
  return DRINKS.find((drink) => drink.id === drinkId);
}

/**
 * Busca un ingrediente adicional por su identificador.
 */

function findExtraById(extraId) {
  return ALL_EXTRAS.find((extra) => extra.id === extraId);
}

/**
 * Devuelve el precio de un ingrediente adicional.
 */

function getExtraPrice(extraGroup, pizzaSize) {
  const groupPrices = EXTRA_PRICES[extraGroup];

  if (!groupPrices) {
    return 0;
  }

  return groupPrices[pizzaSize] || 0;
}

/**
 * Devuelve el costo del empaque de acuerdo con el tamaño.
 */

function getPackagingPrice(pizzaSize) {
  return PACKAGING_PRICES[pizzaSize] || 0;
}

/**
 * Devuelve la información de un tamaño.
 */

function getSizeInformation(pizzaSize) {
  return PIZZA_SIZES[pizzaSize] || null;
}

/**
 * Limpia texto ingresado por el cliente.
 *
 * Esta función reduce espacios innecesarios y evita que se
 * introduzcan símbolos HTML directamente en el pedido.
 */

function sanitizeCustomerText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* =====================================================
   CONGELAMOS LOS DATOS IMPORTANTES
===================================================== */

/*
  Object.freeze evita que otra parte del programa cambie
  accidentalmente estos datos mientras la página funciona.
*/

Object.freeze(PIZZITY_CONFIG);
Object.freeze(PIZZA_SIZES);
Object.freeze(PACKAGING_PRICES);
Object.freeze(EXTRA_PRICES);