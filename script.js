// Simple POS app connected to your Supabase
const SUPABASE_URL = "https://hfdkarlboycxyosmzdge.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZGthcmxib3ljeHlvc216ZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwODEzNjcsImV4cCI6MjA4MDY1NzM2N30.ndZ9hv_o1zUstIrtRXWvHsUFCPj3Pwn1r3-V3Gp7Hgo";

const PRODUCT_BUCKET = "product-images";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Toast helper
function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 2200);
}

// Tabs (bottom navigation)
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const tabId = "tab-" + btn.dataset.tab;
    document
      .querySelectorAll(".tab-page")
      .forEach((p) => p.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
  });
});

// Product modal
const productBackdrop = document.getElementById("product-backdrop");
const productForm = document.getElementById("product-form");
const productClose = document.getElementById("product-close");
const openProductBtn = document.getElementById("btn-open-product");
const productError = document.getElementById("product-error");
const productImageInput = document.getElementById("product-image");
const imagePreview = document.getElementById("image-preview");
const imageLabel = document.getElementById("image-label");

let selectedFile = null;

if (openProductBtn) {
  openProductBtn.addEventListener("click", () => {
    productBackdrop.classList.remove("hidden");
    productError.classList.add("hidden");
    productForm.reset();
    selectedFile = null;
    imagePreview.classList.add("hidden");
    imageLabel.textContent = "Choose photo";
  });
}

if (productClose) {
  productClose.addEventListener("click", () => {
    productBackdrop.classList.add("hidden");
  });
}

if (productBackdrop) {
  productBackdrop.addEventListener("click", (e) => {
    if (e.target === productBackdrop) {
      productBackdrop.classList.add("hidden");
    }
  });
}

const imageBox = document.querySelector(".image-box");
if (imageBox) {
  imageBox.addEventListener("click", () => {
    productImageInput.click();
  });
}

if (productImageInput) {
  productImageInput.addEventListener("change", () => {
    const file = productImageInput.files[0];
    if (!file) return;
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreview.classList.remove("hidden");
      imageLabel.textContent = "";
    };
    reader.readAsDataURL(file);
  });
}

async function uploadImageIfNeeded() {
  if (!selectedFile) return null;

  const ext = selectedFile.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `public/${fileName}`;

  const { error: uploadError } = await supabaseClient.storage
    .from(PRODUCT_BUCKET)
    .upload(path, selectedFile, { upsert: false });

  if (uploadError) {
    console.error("Upload error", uploadError);
    productError.textContent = uploadError.message || "Failed to upload image";
    productError.classList.remove("hidden");
    return null;
  }

  const { data } = supabaseClient.storage.from(PRODUCT_BUCKET).getPublicUrl(path);
  return data.publicUrl || null;
}

// Save product
if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    productError.classList.add("hidden");

    const name = document.getElementById("product-name").value.trim();
    const price = Number(document.getElementById("product-price").value || 0);
    const mrpVal = document.getElementById("product-mrp").value;
    const mrp = mrpVal ? Number(mrpVal) : null;
    const category =
      document.getElementById("product-category").value.trim() || null;
    const stock = Number(document.getElementById("product-stock").value || 0);
    const unit = document.getElementById("product-unit").value;
    const color =
      document.getElementById("product-color").value.trim() || null;
    const size = document.getElementById("product-size").value.trim() || null;

    if (!name || isNaN(price)) {
      productError.textContent = "Name and sale price are required.";
      productError.classList.remove("hidden");
      return;
    }

    const imageUrl = await uploadImageIfNeeded();
    if (selectedFile && !imageUrl) {
      // upload error already shown
      return;
    }

    const payload = {
      name,
      price, // numeric column in products
      mrp,
      category,
      stock,
      unit,
      color,
      size,
      image_url: imageUrl,
    };

    const { error } = await supabaseClient.from("products").insert(payload);
    if (error) {
      console.error("Insert product error", error);
      productError.textContent = error.message || "Failed to save product";
      productError.classList.remove("hidden");
      return;
    }

    showToast("Product saved");
    productBackdrop.classList.add("hidden");
    await loadProducts();
    await loadHome();
  });
}

// Load products
async function loadProducts() {
  const list = document.getElementById("products-list");
  const empty = document.getElementById("products-empty");
  if (!list || !empty) return;

  list.innerHTML = "";
  empty.style.display = "block";

  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Load products error", error);
    list.innerHTML = "<p class='muted small'>Error loading products.</p>";
    return;
  }

  if (!data || data.length === 0) return;

  empty.style.display = "none";

  data.forEach((p) => {
    const item = document.createElement("div");
    item.className = "product-item";

    const img = document.createElement("img");
    img.className = "product-img";
    img.src =
      p.image_url ||
      "https://dummyimage.com/80x80/e5e7eb/9ca3af.png&text=No+Img";
    img.alt = p.name || "Product";

    const main = document.createElement("div");
    main.className = "product-main";

    const nameEl = document.createElement("div");
    nameEl.className = "product-name";
    nameEl.textContent = p.name;

    const metaEl = document.createElement("div");
    metaEl.className = "product-meta";
    const pricePart = `₹${p.price}${p.mrp ? " · MRP ₹" + p.mrp : ""}`;
    const stockPart = `Stock: ${p.stock} ${p.unit || "pcs"}`;
    metaEl.textContent = `${pricePart} · ${stockPart}`;

    main.appendChild(nameEl);
    main.appendChild(metaEl);

    const actions = document.createElement("div");
    actions.className = "product-actions";

    const low = (p.stock || 0) <= 5;
    if (low) {
      const lowBadge = document.createElement("span");
      lowBadge.className = "badge low";
      lowBadge.textContent = "Low";
      actions.appendChild(lowBadge);
    }

    const delBtn = document.createElement("button");
    delBtn.className = "btn";
    delBtn.textContent = "Delete";
    delBtn.style.background = "#fee2e2";
    delBtn.style.color = "#b91c1c";
    delBtn.addEventListener("click", () => deleteProduct(p.id));

    actions.appendChild(delBtn);

    item.appendChild(img);
    item.appendChild(main);
    item.appendChild(actions);

    list.appendChild(item);
  });
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  const { error } = await supabaseClient.from("products").delete().eq("id", id);
  if (error) {
    console.error("Delete error", error);
    showToast("Failed to delete");
    return;
  }
  showToast("Product deleted");
  await loadProducts();
  await loadHome();
}

// Orders
async function loadOrders() {
  const list = document.getElementById("orders-list");
  const empty = document.getElementById("orders-empty");
  if (!list || !empty) return;

  list.innerHTML = "";
  empty.style.display = "block";

  const { data, error } = await supabaseClient
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Load orders error", error);
    list.innerHTML = "<p class='muted small'>Error loading orders.</p>";
    return;
  }

  if (!data || data.length === 0) return;

  empty.style.display = "none";

  data.forEach((o) => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("div");
    title.style.fontWeight = "600";
    title.textContent = `Order #${o.id}`;

    const meta = document.createElement("div");
    meta.className = "product-meta";
    const dt = o.created_at ? new Date(o.created_at).toLocaleString() : "";
    meta.textContent = `${o.customer_name || "Walk-in"} · ₹${
      o.total_amount || 0
    } · ${o.payment_method || "COD"} · ${dt}`;

    card.appendChild(title);
    card.appendChild(meta);
    list.appendChild(card);
  });
}

// Home stats
async function loadHome() {
  const saleEl = document.getElementById("total-sale");
  const ordersEl = document.getElementById("total-orders");
  const lowEl = document.getElementById("low-stock");
  if (!saleEl || !ordersEl || !lowEl) return;

  let totalSale = 0;
  let totalOrders = 0;
  let lowStockCount = 0;

  const { data: orders, error: errOrders } = await supabaseClient
    .from("orders")
    .select("total_amount");

  if (!errOrders && orders) {
    totalOrders = orders.length;
    totalSale = orders.reduce(
      (sum, o) => sum + Number(o.total_amount || 0),
      0
    );
  }

  const { data: products, error: errProducts } = await supabaseClient
    .from("products")
    .select("stock");

  if (!errProducts && products) {
    lowStockCount = products.filter((p) => (p.stock || 0) <= 5).length;
  }

  saleEl.textContent = "₹" + totalSale;
  ordersEl.textContent = String(totalOrders);
  lowEl.textContent = String(lowStockCount);
}

// Delivery-style order form (customer address + payment)
const deliveryForm = document.getElementById("delivery-form");
if (deliveryForm) {
  deliveryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("delivery-name").value.trim();
    const phone = document.getElementById("delivery-phone").value.trim();
    const address = document.getElementById("delivery-address").value.trim();
    const payment = document.getElementById("delivery-payment").value;
    const amountRaw = document.getElementById("delivery-amount").value;
    const total_amount = amountRaw ? Number(amountRaw) : 0;

    if (!address) {
      showToast("Please enter delivery address");
      document.getElementById("delivery-address").focus();
      return;
    }

    const customer_name = name || "Delivery customer";

    const { error } = await supabaseClient.from("orders").insert({
      customer_name,
      customer_phone: phone || null,
      customer_address: address,
      payment_method: payment || "cash",
      total_amount,
    });

    if (error) {
      console.error("Insert delivery order error", error);
      showToast("Failed to create delivery order");
      return;
    }

    showToast("Delivery order created");

    // Clear form
    document.getElementById("delivery-name").value = "";
    document.getElementById("delivery-phone").value = "";
    document.getElementById("delivery-address").value = "";
    document.getElementById("delivery-amount").value = "";
    document.getElementById("delivery-payment").value = "cash";

    await Promise.all([loadOrders(), loadHome()]);
  });
}

// Quick test order button
const quickBtn = document.getElementById("btn-quick-order");
if (quickBtn) {
  quickBtn.addEventListener("click", async () => {
    const { error } = await supabaseClient
      .from("orders")
      .insert({ customer_name: "Test", total_amount: 0, payment_method: "COD" });
    if (error) {
      console.error("Insert order error", error);
      showToast("Failed to create order");
      return;
    }
    showToast("Order created");
    await loadOrders();
    await loadHome();
  });
}

// Initial load
(async function init() {
  await Promise.all([loadProducts(), loadOrders(), loadHome()]);
})();
