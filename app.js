
document.addEventListener("DOMContentLoaded", () => {
  // bottom nav active state based on current file
  const path = window.location.pathname;
  const file = path.split("/").pop() || "index.html";

  const map = {
    "index.html": "nav-home",
    "invoice.html": "nav-invoice",
    "orders.html": "nav-orders",
    "catalogue.html": "nav-catalogue",
    "manage.html": "nav-manage",
    "store-details.html": "nav-manage",
    "payment-methods.html": "nav-manage",
    "delivery-settings.html": "nav-manage",
    "kyc-basic.html": "nav-manage"
  };

  const activeId = map[file];
  if (activeId) {
    const el = document.getElementById(activeId);
    if (el) el.classList.add("active");
  }

  // manage screen navigation
  const go = (id, target) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => {
        window.location.href = target;
      });
    }
  };

  go("btn-store-details", "store-details.html");
  go("btn-payment-methods", "payment-methods.html");
  go("btn-delivery-settings", "delivery-settings.html");
  go("btn-kyc", "kyc-basic.html");
});
