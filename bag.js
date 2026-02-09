// bag.js - Shopping Cart Logic for Bag of Barakah

// ===== LOAD BAG =====
let bag = JSON.parse(localStorage.getItem("bagOfBarakahShoppingBag")) || [];

// ===== RENDER BAG =====
function renderBag() {
    const list = document.getElementById("bagList");
    const totalEl = document.getElementById("totalPrice");
    const subtotalEl = document.getElementById("subtotal");
    const itemsCountEl = document.getElementById("itemsCount");

    if (!list) return; // Exit if element doesn't exist

    list.innerHTML = "";

    if (bag.length === 0) {
        list.innerHTML = `
            <div class="empty-bag">
                <i class="fas fa-shopping-bag"></i>
                <h3>Your bag is empty</h3>
                <p>Add some items from our store to get started!</p>
                <a href="index.html" class="back-to-shop-btn">Back to Shopping</a>
            </div>
        `;
        if (totalEl) totalEl.textContent = "0.00";
        if (subtotalEl) subtotalEl.textContent = "0.00";
        if (itemsCountEl) itemsCountEl.textContent = "0";
        return;
    }

    // Calculate totals
    let subtotal = 0;
    let itemsCount = 0;

    bag.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "bag-item";
        
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        itemsCount += item.quantity;

        li.innerHTML = `
            <div class="bag-item-img">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80/cccccc/969696?text=Product'">
            </div>
            <div class="bag-item-details">
                <h4>${item.name}</h4>
                <p class="bag-item-price">$${item.price.toFixed(2)} each</p>
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <div class="bag-item-total">
                <p>$${itemTotal.toFixed(2)}</p>
                <button class="remove-btn" onclick="removeItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        list.appendChild(li);
    });

    // Update totals
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    if (totalEl) totalEl.textContent = total.toFixed(2);
    if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
    if (itemsCountEl) itemsCountEl.textContent = itemsCount;
    
    // Update bag count in the counter
    updateBagCount();
}

// ===== REMOVE ITEM =====
function removeItem(index) {
    if (confirm("Remove this item from your bag?")) {
        bag.splice(index, 1);
        localStorage.setItem("bagOfBarakahShoppingBag", JSON.stringify(bag));
        renderBag();
        updateBagCount();
        
        // Update main page bag counter if on same domain
        if (typeof updateBagCounter === 'function') {
            updateBagCounter();
        }
    }
}

// ===== UPDATE QUANTITY =====
function updateQuantity(index, change) {
    bag[index].quantity += change;
    
    if (bag[index].quantity < 1) {
        removeItem(index);
    } else {
        localStorage.setItem("bagOfBarakahShoppingBag", JSON.stringify(bag));
        renderBag();
        updateBagCount();
        
        // Update main page bag counter if on same domain
        if (typeof updateBagCounter === 'function') {
            updateBagCounter();
        }
    }
}

// ===== ADD ITEM (USED IN index.html) =====
function addToBag(productId) {
    // This function needs access to the products array from main page
    // For standalone use, we'll handle it differently
    
    // Check if we're in the main page context
    if (typeof products !== 'undefined') {
        const product = products.find(p => p.id === productId);
        
        if (!product) return;
        
        if (!product.inStock) {
            alert(`Sorry, ${product.name} is currently out of stock.`);
            return;
        }
        
        // Check if product already in bag
        const existingItem = bag.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            bag.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        localStorage.setItem("bagOfBarakahShoppingBag", JSON.stringify(bag));
        updateBagCount();
        
        // Show confirmation
        alert(`${product.name} added to your bag!`);
    } else {
        // Fallback for when products array isn't available
        console.log("Product added to bag with ID:", productId);
    }
}

// ===== UPDATE BAG COUNT (FOR ICON) =====
function updateBagCount() {
    const totalItems = bag.reduce((total, item) => total + item.quantity, 0);
    
    // Update counter on current page
    const countEl = document.getElementById("bagCount");
    if (countEl) {
        countEl.textContent = totalItems;
    }
    
    // Also update the bag counter in localStorage for cross-page consistency
    localStorage.setItem("bagOfBarakahItemCount", totalItems);
    
    return totalItems;
}

// ===== CHECKOUT VIA WHATSAPP =====
function checkoutWhatsApp() {
    if (bag.length === 0) {
        alert("Your bag is empty. Add some items before checking out.");
        return;
    }

    // Calculate totals
    let subtotal = bag.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let itemsCount = bag.reduce((count, item) => count + item.quantity, 0);
    
    // Build the message
    let message = "Hello Bag of Barakah! I would like to place an order.%0A%0A";
    message += "Order Details:%0A";
    message += "=========================%0A";

    bag.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        message += `${index + 1}. ${item.name}%0A`;
        message += `   Quantity: ${item.quantity} × $${item.price.toFixed(2)} = $${itemTotal.toFixed(2)}%0A%0A`;
    });

    message += "=========================%0A";
    message += `Subtotal: $${subtotal.toFixed(2)}%0A`;
    message += `Tax (8%): $${(subtotal * 0.08).toFixed(2)}%0A`;
    message += `Total: $${(subtotal * 1.08).toFixed(2)}%0A`;
    message += `Total Items: ${itemsCount}%0A%0A`;
    message += "Please confirm availability, final price, and delivery details.%0A%0A";
    message += "Thank you!";

    // Your WhatsApp number - CHANGE THIS TO YOUR ACTUAL NUMBER
    const phoneNumber = "19414141423"; // Format: country code + number
    
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
    
    // Optional: Clear bag after successful order
    if (confirm("Ready to send your order via WhatsApp? Your bag will be cleared after sending.")) {
        window.open(whatsappURL, "_blank");
        
        // Clear the bag
        bag = [];
        localStorage.setItem("bagOfBarakahShoppingBag", JSON.stringify(bag));
        
        // Update display
        setTimeout(() => {
            renderBag();
            updateBagCount();
            alert("Order sent! We'll contact you on WhatsApp for confirmation and payment details.");
        }, 500);
    }
}

// ===== CLEAR BAG =====
function clearBag() {
    if (bag.length === 0) {
        alert("Your bag is already empty.");
        return;
    }
    
    if (confirm("Are you sure you want to clear your entire shopping bag?")) {
        bag = [];
        localStorage.setItem("bagOfBarakahShoppingBag", JSON.stringify(bag));
        renderBag();
        updateBagCount();
        alert("Your shopping bag has been cleared.");
    }
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the bag page
    if (document.getElementById("bagList")) {
        renderBag();
    }
    
    // Always update the bag count
    updateBagCount();
    
    // Set up event listeners for checkout and clear buttons
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", checkoutWhatsApp);
    }
    
    const clearBtn = document.getElementById("clearBagBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", clearBag);
    }
    
    // Update bag count in navigation if available
    const bagLink = document.querySelector('a[href="bag.html"]');
    if (bagLink) {
        const countSpan = bagLink.querySelector('.bag-count');
        if (countSpan) {
            countSpan.textContent = updateBagCount();
        }
    }
});

// Make functions available globally
window.addToBag = addToBag;
window.removeItem = removeItem;
window.updateQuantity = updateQuantity;
window.checkoutWhatsApp = checkoutWhatsApp;
window.clearBag = clearBag;
window.updateBagCount = updateBagCount;
window.renderBag = renderBag;