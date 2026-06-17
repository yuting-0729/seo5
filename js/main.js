// AuraStride (極光步履) 全站通用邏輯
document.addEventListener("DOMContentLoaded", () => {
  // 注入共用導航欄與頁尾
  injectHeader();
  injectFooter();
  
  // 初始化購物車數量標記
  updateCartBadge();
  
  // 行動裝置選單切換
  initMobileMenu();
  
  // 監聽返回頂部按鈕
  initScrollToTop();
});

// 購物車數據庫管理 (LocalStorage)
const Cart = {
  get: () => JSON.parse(localStorage.getItem("aurastride_cart")) || [],
  save: (cart) => localStorage.setItem("aurastride_cart", JSON.stringify(cart)),
  add: (productId, quantity = 1, size = "", color = "") => {
    const cart = Cart.get();
    const product = ProductDB.getById(productId);
    if (!product) return;

    const existingIndex = cart.findIndex(item => 
      item.id === productId && item.size === size && item.color === color
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: productId,
        name: product.name,
        price: product.price,
        image: product.image,
        size: size || product.sizes[0],
        color: color || product.colors[0].name,
        quantity: quantity
      });
    }

    Cart.save(cart);
    updateCartBadge();
    showToast(`已成功將「${product.name}」加入購物車！`);
  },
  remove: (productId, size, color) => {
    let cart = Cart.get();
    cart = cart.filter(item => !(item.id === productId && item.size === size && item.color === color));
    Cart.save(cart);
    updateCartBadge();
  },
  clear: () => {
    localStorage.removeItem("aurastride_cart");
    updateCartBadge();
  },
  getTotalPrice: () => {
    return Cart.get().reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
  getTotalCount: () => {
    return Cart.get().reduce((sum, item) => sum + item.quantity, 0);
  }
};

// 購物車 Badge 更新
function updateCartBadge() {
  const count = Cart.getTotalCount();
  const badges = document.querySelectorAll(".cart-badge");
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  });
}

// 吐司通知 (Toast) 顯示
function showToast(message) {
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.innerHTML = `
    <div class="toast-icon"><i class="fas fa-check-circle"></i></div>
    <div class="toast-content">${message}</div>
  `;
  
  toastContainer.appendChild(toast);
  
  // 動畫滑入
  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  // 3秒後滑出並移除
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3000);
}

// 共用 Header 注入
function injectHeader() {
  const container = document.getElementById("header-container");
  if (!container) return;

  const currentPath = window.location.pathname;
  const getActiveClass = (pageName) => {
    return currentPath.includes(pageName) ? "active" : "";
  };

  container.innerHTML = `
    <header class="main-header">
      <div class="header-inner container">
        <!-- Logo -->
        <a href="index.html" class="logo-area">
          <img src="assets/logo.png" alt="AuraStride Logo" class="brand-logo-img">
          <span class="brand-name">AuraStride <span class="brand-chinese">極光步履</span></span>
        </a>

        <!-- 桌上型導航 -->
        <nav class="main-nav">
          <ul class="nav-links">
            <li><a href="index.html" class="${getActiveClass("index.html") || (currentPath.endsWith("/") || currentPath.endsWith("期末") || currentPath.endsWith("期末/") ? "active" : "")}">首頁</a></li>
            <li><a href="about.html" class="${getActiveClass("about.html")}">公司簡介</a></li>
            <li><a href="hot.html" class="${getActiveClass("hot.html")}">熱銷商品</a></li>
            <li><a href="men.html" class="${getActiveClass("men.html")}">男鞋專區</a></li>
            <li><a href="women.html" class="${getActiveClass("women.html")}">女鞋專區</a></li>
            <li><a href="sports.html" class="${getActiveClass("sports.html")}">運動鞋專區</a></li>
            <li><a href="contact.html" class="${getActiveClass("contact.html")}">聯絡我們</a></li>
          </ul>
        </nav>

        <!-- 工具區 (購物車與搜尋) -->
        <div class="header-tools">
          <div class="search-trigger-wrapper">
            <button class="tool-btn search-trigger" aria-label="搜尋" onclick="toggleSearchModal()">
              <i class="fas fa-search"></i>
            </button>
          </div>
          
          <!-- 購物車按鈕 -->
          <div class="cart-trigger-wrapper">
            <button class="tool-btn cart-trigger" aria-label="購物車" onclick="toggleCartDrawer()">
              <i class="fas fa-shopping-bag"></i>
              <span class="cart-badge">0</span>
            </button>
          </div>

          <!-- 行動版選單觸發按鈕 -->
          <button class="mobile-menu-trigger" aria-label="開啟選單">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>

    <!-- 行動版側邊導航 -->
    <div class="mobile-nav-drawer">
      <div class="drawer-header">
        <span class="drawer-title">AuraStride</span>
        <button class="close-drawer-btn" onclick="toggleMobileNav()">&times;</button>
      </div>
      <ul class="mobile-nav-links">
        <li><a href="index.html" onclick="toggleMobileNav()">首頁</a></li>
        <li><a href="about.html" onclick="toggleMobileNav()">公司簡介</a></li>
        <li><a href="hot.html" onclick="toggleMobileNav()">熱銷商品</a></li>
        <li><a href="men.html" onclick="toggleMobileNav()">男鞋專區</a></li>
        <li><a href="women.html" onclick="toggleMobileNav()">女鞋專區</a></li>
        <li><a href="sports.html" onclick="toggleMobileNav()">運動鞋專區</a></li>
        <li><a href="contact.html" onclick="toggleMobileNav()">聯絡我們</a></li>
      </ul>
    </div>
    <div class="mobile-nav-overlay" onclick="toggleMobileNav()"></div>

    <!-- 購物車側邊欄 Drawer -->
    <div class="cart-drawer">
      <div class="drawer-header">
        <span class="drawer-title"><i class="fas fa-shopping-bag"></i> 我的購物車</span>
        <button class="close-drawer-btn" onclick="toggleCartDrawer()">&times;</button>
      </div>
      <div class="cart-items-container">
        <!-- 購物車項目將動態插入 -->
      </div>
      <div class="cart-drawer-footer">
        <div class="cart-summary-row">
          <span>總計金額</span>
          <span class="cart-total-price">NT$ 0</span>
        </div>
        <button class="checkout-btn" onclick="triggerCheckout()">前往結帳</button>
        <button class="clear-cart-btn" onclick="clearCart()">清空購物車</button>
      </div>
    </div>
    <div class="cart-overlay" onclick="toggleCartDrawer()"></div>

    <!-- 全域搜尋彈窗 -->
    <div class="search-modal">
      <div class="search-modal-content">
        <button class="close-search-btn" onclick="toggleSearchModal()">&times;</button>
        <h3>搜尋產品</h3>
        <div class="search-input-group">
          <input type="text" id="global-search-input" placeholder="請輸入鞋款名稱，例如：小白鞋、跑鞋..." oninput="performGlobalSearch()">
          <i class="fas fa-search search-input-icon"></i>
        </div>
        <div id="search-results-list" class="search-results"></div>
      </div>
    </div>
    <div class="search-overlay" onclick="toggleSearchModal()"></div>
  `;
}

// 共用 Footer 注入
function injectFooter() {
  const container = document.getElementById("footer-container");
  if (!container) return;

  container.innerHTML = `
    <footer class="main-footer">
      <div class="footer-inner container grid-4">
        <!-- 品牌區 -->
        <div class="footer-col brand-col">
          <div class="footer-logo">
            <img src="assets/logo.png" alt="AuraStride Logo" class="footer-logo-img">
            <span>AuraStride</span>
          </div>
          <p class="brand-pitch">極光步履，踏尋極致美學。融合頂級手工藝與現代科技，為您打造極具包覆感與設計張力的每一雙鞋。</p>
          <div class="social-links">
            <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="#" aria-label="Line"><i class="fab fa-line"></i></a>
            <a href="#" aria-label="Youtube"><i class="fab fa-youtube"></i></a>
          </div>
        </div>

        <!-- 快速連結 -->
        <div class="footer-col">
          <h4>熱門分類</h4>
          <ul class="footer-links">
            <li><a href="hot.html">熱銷爆款</a></li>
            <li><a href="men.html">紳士男鞋</a></li>
            <li><a href="women.html">名媛女鞋</a></li>
            <li><a href="sports.html">科技運動鞋</a></li>
          </ul>
        </div>

        <!-- 購物指南 -->
        <div class="footer-col">
          <h4>售後服務</h4>
          <ul class="footer-links">
            <li><a href="about.html">關於品牌</a></li>
            <li><a href="contact.html">退換貨政策</a></li>
            <li><a href="contact.html">常見問題 (FAQ)</a></li>
            <li><a href="contact.html">門市資訊</a></li>
          </ul>
        </div>

        <!-- 聯絡與電子報 -->
        <div class="footer-col">
          <h4>訂閱新品電子報</h4>
          <p class="newsletter-desc">訂閱即享首購 9 折優惠券，第一時間掌握限時限量折扣！</p>
          <form class="newsletter-form" onsubmit="handleNewsletterSubmit(event)">
            <input type="email" placeholder="您的電子信箱" required>
            <button type="submit" aria-label="訂閱"><i class="fas fa-paper-plane"></i></button>
          </form>
          <ul class="footer-contact-info">
            <li><i class="fas fa-phone"></i> (02) 2345-6789</li>
            <li><i class="fas fa-envelope"></i> service@aurastride.com</li>
          </ul>
        </div>
      </div>
      
      <!-- 版權列 -->
      <div class="footer-bottom">
        <div class="container footer-bottom-inner">
          <p>&copy; 2026 AuraStride 極光步履. 版權所有. 網際網路行銷期末專案成果展示</p>
          <div class="payment-methods">
            <i class="fab fa-cc-visa" title="Visa"></i>
            <i class="fab fa-cc-mastercard" title="Mastercard"></i>
            <i class="fab fa-cc-jcb" title="JCB"></i>
            <i class="fab fa-apple-pay" title="Apple Pay"></i>
            <i class="fab fa-google-pay" title="Google Pay"></i>
          </div>
        </div>
      </div>
    </footer>
    <button id="scroll-to-top" class="scroll-to-top" aria-label="返回頂部"><i class="fas fa-arrow-up"></i></button>
  `;
}

// 行動選單開關
function initMobileMenu() {
  const trigger = document.querySelector(".mobile-menu-trigger");
  if (!trigger) return;
  
  trigger.addEventListener("click", toggleMobileNav);
}

function toggleMobileNav() {
  const drawer = document.querySelector(".mobile-nav-drawer");
  const overlay = document.querySelector(".mobile-nav-overlay");
  const trigger = document.querySelector(".mobile-menu-trigger");
  
  if (drawer && overlay) {
    drawer.classList.toggle("open");
    overlay.classList.toggle("open");
    if (trigger) trigger.classList.toggle("active");
  }
}

// 購物車側邊欄開關
function toggleCartDrawer() {
  const drawer = document.querySelector(".cart-drawer");
  const overlay = document.querySelector(".cart-overlay");
  
  if (drawer && overlay) {
    const isOpen = drawer.classList.contains("open");
    if (!isOpen) {
      renderCartItems(); // 開啟時重新渲染購物車項目
    }
    drawer.classList.toggle("open");
    overlay.classList.toggle("open");
  }
}

// 渲染購物車項目
function renderCartItems() {
  const container = document.querySelector(".cart-items-container");
  const totalPriceEl = document.querySelector(".cart-total-price");
  if (!container) return;

  const cart = Cart.get();
  
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-view">
        <i class="fas fa-shopping-bag"></i>
        <p>您的購物車空空如也</p>
        <a href="hot.html" class="shop-now-btn" onclick="toggleCartDrawer()">立即選購</a>
      </div>
    `;
    if (totalPriceEl) totalPriceEl.textContent = "NT$ 0";
    return;
  }

  let html = "";
  cart.forEach(item => {
    html += `
      <div class="cart-item">
        <div class="cart-item-img-wrapper">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <a href="product.html?id=${item.id}" class="cart-item-name" onclick="toggleCartDrawer()">${item.name}</a>
          <div class="cart-item-meta">規格: 尺寸 ${item.size} / ${item.color}</div>
          <div class="cart-item-price-qty">
            <span class="price">NT$ ${item.price.toLocaleString()}</span>
            <div class="qty-control">
              <button onclick="updateCartQty('${item.id}', ${item.size}, '${item.color}', -1)">-</button>
              <span class="qty-num">${item.quantity}</span>
              <button onclick="updateCartQty('${item.id}', ${item.size}, '${item.color}', 1)">+</button>
            </div>
          </div>
        </div>
        <button class="remove-item-btn" onclick="removeFromCart('${item.id}', ${item.size}, '${item.color}')" aria-label="刪除">
          &times;
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
  if (totalPriceEl) {
    totalPriceEl.textContent = `NT$ ${Cart.getTotalPrice().toLocaleString()}`;
  }
}

// 更新購物車商品數量
window.updateCartQty = function(id, size, color, change) {
  const cart = Cart.get();
  const index = cart.findIndex(item => item.id === id && item.size === parseInt(size) && item.color === color);
  if (index > -1) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    Cart.save(cart);
    updateCartBadge();
    renderCartItems();
  }
};

// 從購物車移除
window.removeFromCart = function(id, size, color) {
  Cart.remove(id, parseInt(size), color);
  renderCartItems();
};

// 清空購物車
window.clearCart = function() {
  if (confirm("確定要清空購物車內所有商品嗎？")) {
    Cart.clear();
    renderCartItems();
  }
};

// 結帳模擬
window.triggerCheckout = function() {
  const cart = Cart.get();
  if (cart.length === 0) {
    alert("您的購物車內無商品！");
    return;
  }
  alert(`模擬結帳成功！\n您已訂購 ${Cart.getTotalCount()} 件商品，總金額共 NT$ ${Cart.getTotalPrice().toLocaleString()}。\n感謝您光臨 AuraStride 極光步履！`);
  Cart.clear();
  toggleCartDrawer();
};

// 搜尋彈窗開關
window.toggleSearchModal = function() {
  const modal = document.querySelector(".search-modal");
  const overlay = document.querySelector(".search-overlay");
  if (modal && overlay) {
    const isOpen = modal.classList.contains("open");
    modal.classList.toggle("open");
    overlay.classList.toggle("open");
    if (!isOpen) {
      const input = document.getElementById("global-search-input");
      if (input) {
        input.value = "";
        input.focus();
      }
      document.getElementById("search-results-list").innerHTML = "";
    }
  }
};

// 全域搜尋執行
window.performGlobalSearch = function() {
  const query = document.getElementById("global-search-input").value.trim().toLowerCase();
  const resultsContainer = document.getElementById("search-results-list");
  if (!resultsContainer) return;

  if (query.length < 1) {
    resultsContainer.innerHTML = "";
    return;
  }

  const matches = PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.description.toLowerCase().includes(query) ||
    p.tag.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    resultsContainer.innerHTML = `<p class="no-search-results">找不到與「${query}」相關的鞋款</p>`;
    return;
  }

  let html = "";
  matches.forEach(p => {
    html += `
      <a href="product.html?id=${p.id}" class="search-result-item" onclick="toggleSearchModal()">
        <img src="${p.image}" alt="${p.name}">
        <div class="result-info">
          <span class="result-name">${p.name}</span>
          <span class="result-price">NT$ ${p.price.toLocaleString()}</span>
        </div>
        <span class="result-tag">${p.tag}</span>
      </a>
    `;
  });
  resultsContainer.innerHTML = html;
};

// 訂閱表單處理
window.handleNewsletterSubmit = function(e) {
  e.preventDefault();
  const emailInput = e.target.querySelector("input[type='email']");
  if (emailInput) {
    alert(`感謝您的訂閱！我們已將 9 折優惠券發送至您的信箱：${emailInput.value}`);
    emailInput.value = "";
  }
};

// 返回頂部
function initScrollToTop() {
  const btn = document.getElementById("scroll-to-top");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  });

  btn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

// 動態渲染商品列表網格
window.renderProductGrid = function(containerId, category, sortBy = "default") {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  let list = ProductDB.getByCategory(category);
  
  // 複製陣列避免污染原始數據
  list = [...list];
  
  // 排序邏輯
  if (sortBy === "price-asc") {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    list.sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating") {
    list.sort((a, b) => b.rating - a.rating);
  }

  if (list.length === 0) {
    container.innerHTML = "<p class='no-products'>暫無此分類商品</p>";
    return;
  }

  let html = "";
  list.forEach(p => {
    // 渲染星星
    let starsHtml = "";
    const floorRating = Math.floor(p.rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floorRating) {
        starsHtml += '<i class="fas fa-star"></i>';
      } else if (i - 0.5 <= p.rating) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
      } else {
        starsHtml += '<i class="far fa-star"></i>';
      }
    }

    html += `
      <div class="product-card">
        <div class="product-img-wrapper">
          <img src="${p.image}" alt="${p.name}">
          <span class="product-badge ${p.category === 'hot' ? 'hot-badge' : ''}">${p.tag}</span>
          <div class="product-action-overlay">
            <a href="product.html?id=${p.id}" class="action-icon-btn" title="查看詳情"><i class="fas fa-eye"></i></a>
            <button class="action-icon-btn" title="加入購物車" onclick="Cart.add('${p.id}')"><i class="fas fa-shopping-bag"></i></button>
          </div>
        </div>
        <div class="product-info">
          <span class="product-category-text">${p.category === 'hot' ? '熱銷系列' : p.category === 'men' ? '男鞋系列' : p.category === 'women' ? '女鞋系列' : '運動系列'}</span>
          <a href="product.html?id=${p.id}" class="product-title">${p.name}</a>
          <div class="product-rating">
            ${starsHtml}
            <span class="product-rating-count">(${p.reviewsCount} 評價)</span>
          </div>
          <div class="product-price-row">
            <span class="product-price">NT$ ${p.price.toLocaleString()}</span>
            <button class="add-to-cart-simple-btn" onclick="Cart.add('${p.id}')">加入購物車</button>
          </div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
};

