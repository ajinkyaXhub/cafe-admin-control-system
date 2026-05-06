// Formatting utility
const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

/* ===== TOAST NOTIFICATION SYSTEM ===== */
function showToast(message, type = 'success', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || '✅'}</span>
        <span class="toast-msg">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        <div class="toast-progress"></div>
    `;
    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => toast.classList.add('toast-show'));

    // Progress bar
    const bar = toast.querySelector('.toast-progress');
    bar.style.transition = `width ${duration}ms linear`;
    requestAnimationFrame(() => requestAnimationFrame(() => bar.style.width = '0%'));

    // Auto-remove
    const timer = setTimeout(() => {
        toast.classList.remove('toast-show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);

    toast.addEventListener('click', () => {
        clearTimeout(timer);
        toast.classList.remove('toast-show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    });
}

// Local State (Sync with server if possible)
let cart = [];
let adminStats = { bookings: 0, orders: 0, revenue: 0 };
let menuItems = initialMenu;
let adminActivity = [];
let fullOrdersList = [];

// API Syncing
async function loadServerData() {
    try {
        const res = await fetch('/api/data');
        const data = await res.json();
        if (data) {
            adminStats = data.stats || adminStats;
            adminActivity = data.activity || adminActivity;
            fullOrdersList = data.orders || fullOrdersList;
            if (data.menu && data.menu.length > 0) {
                menuItems = data.menu;
            }
            renderMenu();
        }
    } catch (e) {
        console.log("Using local state fallback", e);
        // Fallback to localStorage if server fails
        const localStats = localStorage.getItem('adminStats');
        if (localStats) adminStats = JSON.parse(localStats);
        renderMenu();
    }
}

async function saveServerData() {
    // Save to localStorage as backup
    localStorage.setItem('adminStats', JSON.stringify(adminStats));
    localStorage.setItem('adminActivity', JSON.stringify(adminActivity));
    localStorage.setItem('fullOrdersList', JSON.stringify(fullOrdersList));
    localStorage.setItem('menuItems', JSON.stringify(menuItems));

    // Push to backend
    try {
        const res = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                stats: adminStats,
                activity: adminActivity,
                orders: fullOrdersList,
                menu: menuItems
            })
        });
        const result = await res.json();
        if (result.status === 'error') {
            console.warn("Persistence Note:", result.message);
            // Don't show error to customer, but maybe log for admin
        }
    } catch (e) {
        console.error("Server sync failed", e);
    }
}

// Initial Load
loadServerData();

// Toggle Cart Sidebar
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (!sidebar || !overlay) return;
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Add to Cart
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.qty++;
        showToast(`Added another <strong>${name}</strong> to your order`, 'success', 2500);
    } else {
        cart.push({ name, price: parseInt(price), qty: 1 });
        showToast(`<strong>${name}</strong> added to your order 🛍️`, 'success', 2500);
    }
    updateCartUI();
    
    // Show float button if hidden
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) cartBtn.classList.add('visible');
    
    // Button feedback
    if (event && event.currentTarget) {
        const btn = event.currentTarget;
        const ogText = btn.innerText;
        btn.innerText = '✓';
        btn.style.background = 'var(--sage)';
        btn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            btn.innerText = ogText;
            btn.style.background = '';
            btn.style.transform = '';
        }, 900);
    }
}

// Change Quantity
function updateQty(index, delta) {
    if (cart[index]) {
        cart[index].qty += delta;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
        updateCartUI();
    }
}

// Render Cart UI
function updateCartUI() {
    const itemsContainer = document.getElementById('cart-items');
    const badge = document.getElementById('cart-badge');
    if (!itemsContainer || !badge) return;
    
    if (cart.length === 0) {
        itemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty</div>';
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) cartBtn.classList.remove('visible');
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) checkoutBtn.disabled = true;
        document.getElementById('cart-subtotal').innerText = '₹0';
        document.getElementById('cart-tax').innerText = '₹0';
        document.getElementById('cart-total').innerText = '₹0';
        badge.innerText = '0';
        return;
    }
    
    // Update Badge
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.innerText = totalItems;
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.disabled = false;
    
    // Render Items
    let html = '';
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        subtotal += (item.price * item.qty);
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatCurrency(item.price)}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                    <span class="qty-display">${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                </div>
            </div>
        `;
    });
    
    itemsContainer.innerHTML = html;
    
    // Totals
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;
    
    document.getElementById('cart-subtotal').innerText = formatCurrency(subtotal);
    document.getElementById('cart-tax').innerText = formatCurrency(tax);
    document.getElementById('cart-total').innerText = formatCurrency(total);
}

// Checkout Process
function checkout() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const total = subtotal + Math.round(subtotal * 0.05);
    
    // Store pending order info
    window.pendingOrder = {
        total: total,
        cart: [...cart]
    };
    
    openPaymentModal(total);
}

function finalizeOrder(paymentMethod) {
    if (!window.pendingOrder) return;
    
    const { total, cart: orderCart } = window.pendingOrder;
    const now = new Date();
    
    // Update Admin Stats
    adminStats.orders += 1;
    adminStats.revenue += total;
    
    // Add to Full Orders List
    fullOrdersList.unshift({
        id: 'ORD' + Math.floor(Math.random() * 10000),
        time: now.toLocaleString(),
        items: orderCart,
        total: total,
        paymentMethod: paymentMethod
    });
    
    // Add to Admin Activity
    adminActivity.unshift(`New Order (${paymentMethod}): ${formatCurrency(total)} (${orderCart.length} items)`);
    
    saveServerData();
    
    // Reset Cart & State
    cart = [];
    window.pendingOrder = null;
    
    updateCartUI();
    closePaymentModal();
    
    // Close cart if open
    const sidebar = document.getElementById('cart-sidebar');
    if (sidebar.classList.contains('active')) {
        toggleCart();
    }
    
    showToast(`Order confirmed with <strong>${paymentMethod}</strong>! 🎉 Total: <strong>${formatCurrency(total)}</strong>`, 'success', 5000);
}

// Booking System
function confirmBooking() {
    const dateEl = document.querySelector('input[type="date"]');
    const timeEl = document.querySelector('input[type="time"]');
    const guestsInput = document.querySelector('select.form-input').value;
    const msg = document.getElementById('confirmMsg');
    
    // Inline validation
    let hasError = false;
    [dateEl, timeEl].forEach(el => {
        el.classList.remove('input-error');
    });
    
    if (!dateEl.value) {
        dateEl.classList.add('input-error');
        dateEl.animate([{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(-4px)'},{transform:'translateX(0)'}], {duration:300});
        hasError = true;
    }
    if (!timeEl.value) {
        timeEl.classList.add('input-error');
        timeEl.animate([{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(-4px)'},{transform:'translateX(0)'}], {duration:300});
        hasError = true;
    }
    
    if (hasError) {
        showToast('Please fill in the date and time to reserve your table.', 'warning', 3500);
        return;
    }
    
    const dateFormatted = new Date(dateEl.value).toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long'});
    msg.innerHTML = `<span>🎉</span> Reservation confirmed for <strong>${dateFormatted}</strong> at <strong>${timeEl.value}</strong> — ${guestsInput}. See you soon!`;
    msg.style.display = 'flex';
    msg.classList.add('confirm-msg-visible');

    showToast(`Table reserved for <strong>${dateFormatted}</strong> at ${timeEl.value} ✨`, 'success', 5000);
    
    // Update Admin Stats
    adminStats.bookings += 1;
    adminActivity.unshift(`Table Booking for ${dateEl.value} at ${timeEl.value} (${guestsInput})`);
    saveServerData();
}

// Dynamic Menu Rendering
function renderMenu() {
    const categories = ['coffee', 'smoothies', 'cold', 'wellness'];
    
    categories.forEach(cat => {
        const grid = document.getElementById(`grid-${cat}`);
        if (!grid) return;
        
        // Use menuItems which is now synced with server
        const filteredItems = menuItems.filter(item => item.cat === cat);
        grid.innerHTML = filteredItems.map(item => `
            <div class="menu-card">
                <div class="card-img-wrap">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="card-tags-overlay">
                        ${item.tags.map(tag => `<span class="tag ${tag}">${tag.replace('-', ' ')}</span>`).join('')}
                    </div>
                </div>
                <div class="card-body">
                    <h4 class="card-name">${item.name}</h4>
                    <div class="card-footer">
                        <span class="card-price"><span>₹</span>${item.price}</span>
                        <button class="card-add-btn" onclick="addToCart('${item.name.replace(/'/g, "\\'")}', ${item.price})">+</button>
                    </div>
                </div>
            </div>
        `).join('');
    });
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initial Render
    renderMenu();

    // Category filter tabs
    const tabs = document.querySelectorAll('.cat-tab');
    const blocks = document.querySelectorAll('.category-block');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.cat;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            blocks.forEach(block => {
                if (target === 'all' || block.dataset.cat === target) {
                    block.classList.remove('hidden');
                } else {
                    block.classList.add('hidden');
                }
            });
        });
    });
});
