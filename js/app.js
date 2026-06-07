(function () {
  const CART_KEY = "three-d-store-cart-v1";
  const ORDERS_KEY = "three-d-store-orders-v1";
  const PRODUCTS_KEY = "three-d-store-products-v1";
  const MESSAGES_KEY = "three-d-store-messages-v1";

  const currency = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  });

  function formatCurrency(value) {
    return currency.format(Number(value || 0));
  }

  async function loadJson(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`${path} yuklenemedi`);
    }
    return response.json();
  }

  async function loadProducts(path) {
    const storedProducts = localStorage.getItem(PRODUCTS_KEY);
    if (storedProducts) {
      try {
        const products = JSON.parse(storedProducts);
        if (Array.isArray(products) && products.length) {
          return products;
        }
      } catch (error) {
        console.warn("Yerel ürün verisi okunamadi", error);
      }
    }
    return loadJson(path);
  }

  function saveProducts(products) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
    window.dispatchEvent(new CustomEvent("store:cart-change", { detail: cart }));
  }

  function addToCart(product, quantity = 1) {
    const qty = Math.max(1, Number(quantity) || 1);
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        material: product.material,
        finish: product.finish,
        palette: product.palette,
        shape: product.shape,
        quantity: qty
      });
    }

    saveCart(cart);
    showToast(`${product.name} sepete eklendi.`);
  }

  function setQuantity(productId, quantity) {
    const qty = Number(quantity);
    const cart = getCart()
      .map((item) => (item.id === productId ? { ...item, quantity: qty } : item))
      .filter((item) => item.quantity > 0);

    saveCart(cart);
  }

  function removeFromCart(productId) {
    saveCart(getCart().filter((item) => item.id !== productId));
  }

  function clearCart() {
    saveCart([]);
  }

  function getCartTotals(cart = getCart()) {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= 1500 ? 0 : 99;
    const total = subtotal + shipping;

    return {
      subtotal,
      shipping,
      total,
      count: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  }

  function saveOrder(order) {
    const orders = getOrders();
    orders.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders.slice(0, 30)));
  }

  function getOrders() {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function getMessages() {
    try {
      return JSON.parse(localStorage.getItem(MESSAGES_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveMessage(message) {
    const messages = getMessages();
    messages.unshift({
      ...message,
      submittedAt: new Date().toISOString()
    });
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages.slice(0, 100)));
  }

  function updateCartCount() {
    const totals = getCartTotals();
    document.querySelectorAll("[data-cart-count]").forEach((node) => {
      node.textContent = totals.count;
      node.setAttribute("aria-label", `${totals.count} urun`);
    });
  }

  function productVisual(product) {
    if (product.image) {
      return `
        <div class="product-visual image" aria-hidden="true">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
      `;
    }

    const shape = product.shape || "stand";
    const inner = shape === "organizer" ? "<span></span><span></span><span></span>" : "";

    return `
      <div class="product-visual ${product.palette || "teal"}" aria-hidden="true">
        <div class="print-object shape-${shape}">${inner}</div>
      </div>
    `;
  }

  function showToast(message) {
    let toast = document.querySelector("[data-toast]");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.dataset.toast = "";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2500);
  }

  function wireNavigation() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-site-nav]");
    const current = window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll("[data-nav-link]").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === current || (current === "" && href === "index.html")) {
        link.classList.add("active");
      }
    });

    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function wireSmallForms() {
    document.querySelectorAll("[data-soft-submit]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = Object.fromEntries(new FormData(form).entries());

        if (form.querySelector("[name='message']")) {
          saveMessage({
            name: formData.name || "Ziyaretci",
            email: formData.email || "",
            phone: formData.phone || "",
            topic: formData.topic || "",
            message: formData.message || "",
            formData
          });
        }

        form.reset();
        showToast("Mesajin alindi. Bu statik demo formatinda yerelde kaydedildi.");
      });
    });
  }

  function wireFooterYear() {
    document.querySelectorAll("[data-year]").forEach((node) => {
      node.textContent = new Date().getFullYear();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    wireNavigation();
    wireSmallForms();
    wireFooterYear();
    updateCartCount();
  });

  window.Store = {
    addToCart,
    clearCart,
    formatCurrency,
    getCart,
    getCartTotals,
    getOrders,
    getMessages,
    loadJson,
    loadProducts,
    productVisual,
    removeFromCart,
    saveMessage,
    saveOrder,
    saveProducts,
    setQuantity,
    showToast,
    updateCartCount
  };
})();
