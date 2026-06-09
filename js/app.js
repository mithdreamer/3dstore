(function () {
  const applySettingsText = () => {
    const settings = Store.getSettings();
    document.querySelectorAll("[data-setting]").forEach((element) => {
      const key = element.dataset.setting;
      if (settings[key]) element.textContent = settings[key];
    });
  };

  const bindContactForm = () => {
    const form = document.querySelector("#contactForm");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.reset();
      Utils.showToast("Mesaj alındı. Demo sürümde form gönderimi yerel akış olarak çalışır.");
    });
  };

  const renderAboutPage = () => {
    const image = document.querySelector("#aboutImage");
    const frame = document.querySelector("#aboutImageFrame");
    if (!image || !frame) return;
    const aboutImage = Store.getSettings().aboutImage;
    if (!aboutImage) return;
    image.src = aboutImage;
    frame.classList.remove("is-hidden");
  };

  const initPublicPage = () => {
    const page = document.body.dataset.page;
    applySettingsText();
    if (page === "home") Products.renderHome();
    if (page === "products") Products.renderProductsPage();
    if (page === "product-detail") Products.renderDetailPage();
    if (page === "cart") Cart.renderCartPage();
    if (page === "checkout") Cart.renderCheckoutPage();
    if (page === "order-success") Orders.renderOrderSuccess();
    if (page === "about") renderAboutPage();
    bindContactForm();
  };

  document.addEventListener("DOMContentLoaded", initPublicPage);
})();
