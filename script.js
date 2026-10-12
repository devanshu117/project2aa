(() => {
  const cartKey = "digital-download-store-cart";
  const products = readCart();
  const productDataFile = "data/products.json";

  async function readProductData() {
    try {
      const response = await fetch(productDataFile);
      if (!response.ok) throw new Error("Failed to load JSON");
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function readCart() {
    try {
      const savedCart = JSON.parse(localStorage.getItem(cartKey));
      return Array.isArray(savedCart) ? savedCart : [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(cartKey, JSON.stringify(products));
  }

  function productFromCard(card) {
    const name = card.querySelector(".product-info h3")?.textContent.trim();
    const priceText = card.querySelector(".product-price")?.textContent ?? "";
    const price = Number.parseFloat(priceText.replace(/[^0-9.]/g, ""));
    const image = card.querySelector("img")?.getAttribute("src") ?? "";
    return name && Number.isFinite(price) ? { name, price, image } : null;
  }

  function updateCartDisplay() {
    const itemCount = products.reduce((total, product) => total + product.quantity, 0);
    const total = products.reduce((sum, product) => sum + product.price * product.quantity, 0);

    document.querySelectorAll(".cart").forEach((cart) => {
      const amount = cart.querySelector("span");
      const count = cart.querySelector("small");
      if (amount) amount.textContent = `$${total.toFixed(2)}`;
      if (count) count.textContent = itemCount;
      cart.setAttribute("aria-label", `${itemCount} items in cart, total $${total.toFixed(2)}`);
    });
  }

  function addToCart(product, button) {
    const existingProduct = products.find((item) => item.name === product.name);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      products.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartDisplay();
    const defaultLabel = button.dataset.defaultLabel || "Add to Cart";
    button.textContent = "Added";
    button.classList.add("is-added");
    window.setTimeout(() => {
      button.textContent = defaultLabel;
      button.classList.remove("is-added");
    }, 1200);
  }

  const catalog = Array.from(document.querySelectorAll(".product-card"))
    .map((card) => ({ card, product: productFromCard(card) }))
    .filter((entry) => entry.product);

  async function enrichCatalogFromJson() {
    const productData = await readProductData();
    if (!productData.length) return;

    catalog.forEach(({ product }) => {
      const match = productData.find((item) => item.name === product.name);
      if (!match) return;
      product.type = match.type || product.type;
      product.image = match.image || product.image;
      product.price = Number.parseFloat(match.price) || product.price;
    });
  }

  enrichCatalogFromJson();

  function productUrl(product, previous, next) {
    const query = new URLSearchParams({
      name: product.name,
      price: product.price.toFixed(2),
      image: product.image,
      type: product.image.includes("plugin") ? "plugin" : "theme",
    });
    if (previous) query.set("previous", JSON.stringify(previous));
    if (next) query.set("next", JSON.stringify(next));
    return `product.html?${query.toString()}`;
  }

  function neighboringProducts(product) {
    if (product.name.toLowerCase() === "coffee shop") {
      return {
        previous: catalog.find((entry) => entry.product.name === "Steak House")?.product || {
          name: "Steak House",
          price: 29,
          image: "imagess/digital-download-store-theme-product-featured-image-4-380x265.jpg",
        },
        next: catalog.find((entry) => entry.product.name === "Lotus Spa")?.product || {
          name: "Lotus Spa",
          price: 19,
          image: "imagess/digital-download-store-themes-product-featured-image-06-380x265.jpg",
        },
      };
    }
    return null;
  }

  catalog.forEach(({ card, product }, index) => {
    if (card.querySelector(".add-to-cart")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "add-to-cart btn btn-primary";
    button.textContent = "Add to Cart";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      addToCart(product, button);
    });
    card.querySelector(".product-info")?.append(button);

    card.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      event.preventDefault();
      const coffeeNeighbors = neighboringProducts(product);
      window.location.href = productUrl(
        product,
        coffeeNeighbors?.previous || catalog[index - 1]?.product,
        coffeeNeighbors?.next || catalog[index + 1]?.product,
      );
    });
  });

  document.querySelectorAll(".cart").forEach((cart) => {
    cart.addEventListener("click", (event) => {
      event.preventDefault();
      if (document.body.classList.contains("checkout-page")) return;
      window.location.href = "checkout.html";
    });
  });

  const productName = document.querySelector("#product-name");
  const productImage = document.querySelector("#product-image");
  const productAddButton = document.querySelector("#product-add");
  if (productName && productImage && productAddButton) {
    const query = new URLSearchParams(window.location.search);
    const product = {
      name: query.get("name") || "Digital Product",
      price: Number.parseFloat(query.get("price") || "0"),
      image: query.get("image") || "",
    };
    const previousLink = document.querySelector("#product-previous");
    const nextLink = document.querySelector("#product-next");
    const typeLabel = document.querySelector("#product-type");
    const descriptionOne = document.querySelector("#product-description-one");
    const descriptionTwo = document.querySelector("#product-description-two");
    const featureList = document.querySelector("#product-features");
    const coffeeDetails = {
      descriptions: [
        "Habitant faucibus sollicitudin fames quam scelerisque amet urna non risus diam netus pellentesque ac sit malesuada risus nisi, aliquet rutrum scelerisque cras habitant lorem tortor sit mauris eu ac id enim urna, adipiscing convallis viverra egestas.",
        "Sapien sagittis interdum quisque urna luctus eget morbi vivamus eget cras scelerisque lectus proin aliquam erat pellentesque pellentesque sed lectus volutpat semper pellentesque aliquam in metus.",
      ],
      features: [
        "Custom logo & favicon support",
        "Google Maps support",
        "100% SEO support",
        "Grid based layout",
        "Social media icons",
        "Built-in breadcrumbs",
        "HTML5 / CSS3",
        "Cross browser compatible",
      ],
    };
    let previous;
    let next;
    try {
      previous = JSON.parse(query.get("previous") || "null");
      next = JSON.parse(query.get("next") || "null");
    } catch {
      previous = null;
      next = null;
    }
    if (product.name.toLowerCase() === "coffee shop") {
      product.image = "imagess/digital-download-store-theme-product-featured-image-5.jpg";
      if (descriptionOne) descriptionOne.textContent = coffeeDetails.descriptions[0];
      if (descriptionTwo) descriptionTwo.textContent = coffeeDetails.descriptions[1];
      if (featureList) {
        featureList.replaceChildren(...coffeeDetails.features.map((feature) => {
          const item = document.createElement("li");
          item.textContent = feature;
          return item;
        }));
      }
      const coffeeNeighbors = neighboringProducts(product);
      previous ||= coffeeNeighbors?.previous;
      next ||= coffeeNeighbors?.next;
    }
    if (product.name.toLowerCase() === "pet lover") {
      product.image = "imagess/digital-download-store-theme-product-featured-image-8.jpg";
    }
    if (product.name.toLowerCase() === "lotus spa") {
      document.body.classList.add("lotus-product");
      product.image = "imagess/digital-download-store-themes-product-featured-image-06.jpg";
    }
    productName.textContent = product.name;
    productImage.src = product.image || "imagess/digital-download-store-hero-image (1).png";
    productImage.alt = product.name;
    typeLabel.textContent = query.get("type") === "plugin" ? "WordPress plugin" : "WordPress theme";
    productAddButton.dataset.defaultLabel = `$${product.price.toFixed(2)}\u00a0–\u00a0Purchase`;
    productAddButton.textContent = productAddButton.dataset.defaultLabel;
    productAddButton.addEventListener("click", () => addToCart(product, productAddButton));

    if (previousLink && previous) {
      previousLink.href = productUrl(previous);
      previousLink.textContent = `← ${previous.name}`;
    }
    if (nextLink && next) {
      nextLink.href = productUrl(next);
      nextLink.textContent = `${next.name} →`;
    }
  }

  const checkoutEmpty = document.querySelector("#checkout-empty");
  const checkoutDetails = document.querySelector("#checkout-details");
  const checkoutItems = document.querySelector("#checkout-items");
  const checkoutTotal = document.querySelector("#checkout-total");
  const purchaseTotal = document.querySelector("#purchase-total");
  if (checkoutEmpty && checkoutDetails && products.length) {
    checkoutEmpty.hidden = true;
    checkoutDetails.hidden = false;
    const total = products.reduce((sum, product) => sum + product.price * product.quantity, 0);
    checkoutItems.innerHTML = products.map((product, index) => `
      <tr>
        <td><img src="${product.image || "imagess/digital-download-store-hero-image (1).png"}" alt="" /> ${product.name}</td>
        <td>$${(product.price * product.quantity).toFixed(2)}</td>
        <td><button class="remove-item" type="button" data-index="${index}">Remove</button></td>
      </tr>
    `).join("");
    checkoutTotal.textContent = `$${total.toFixed(2)}`;
    purchaseTotal.textContent = `$${total.toFixed(2)}`;
    checkoutItems.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-index]");
      if (!removeButton) return;
      products.splice(Number(removeButton.dataset.index), 1);
      saveCart();
      window.location.reload();
    });
  }

  updateCartDisplay();
})();
