// ===== LOAD BAG =====
let bag = JSON.parse(localStorage.getItem("bag")) || [];
const ITEM_PRICE = 10;

// ===== RENDER BAG =====
function renderBag() {
    const list = document.getElementById("bagList");
    const totalEl = document.getElementById("totalPrice");

    list.innerHTML = "";

    if (bag.length === 0) {
        list.innerHTML = "<li class='empty'>Your bag is empty.</li>";
        totalEl.textContent = "0";
        return;
    }

    bag.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "bag-item";

        li.innerHTML = `
            <span>${item}</span>
            <button onclick="removeItem(${index})">❌</button>
        `;

        list.appendChild(li);
    });

    totalEl.textContent = bag.length * ITEM_PRICE;
}

// ===== REMOVE ITEM =====
function removeItem(index) {
    bag.splice(index, 1);
    localStorage.setItem("bag", JSON.stringify(bag));
    renderBag();
    updateBagCount();
}

// ===== ADD ITEM (USED IN index.html) =====
function addToBag(itemName) {
    bag.push(itemName);
    localStorage.setItem("bag", JSON.stringify(bag));
    updateBagCount();
    alert(itemName + " added to bag");
}

// ===== UPDATE ICON COUNT =====
function updateBagCount() {
    const countEl = document.getElementById("bagCount");
    if (countEl) {
        countEl.textContent = bag.length;
    }
}
function checkoutWhatsApp() {
    if (bag.length === 0) {
        alert("Your bag is empty.");
        return;
    }

    let message = "Hello, I want to place an order.%0A%0A";
    message += "Items:%0A";

    bag.forEach((item, index) => {
        message += `${index + 1}. ${item}%0A`;
    });

    message += `%0ATotal Items: ${bag.length}%0A`;
    message += `Estimated Total: $${bag.length * ITEM_PRICE}%0A%0A`;
    message += "Please let me know the price, delivery date, and location details.";

    const phoneNumber = "19414141423";

    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;

    window.open(whatsappURL, "_blank");
    localStorage.removeItem("bag");

}


// Initial render
renderBag();
updateBagCount();

