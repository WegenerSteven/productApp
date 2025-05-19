import './style.css'
import { productDatabase } from './productDatabase'

type CartItem = {
  name: string
  category: string
  price: number
  quantity: number
}

const startApp = async () => {
  const database = new productDatabase()
  await database.initDB()

  // Fetch data.json at runtime
  const response = await fetch('/data/data.json')
  const products = await response.json()
  renderProducts(products)
  setupConfirmOrder(database)
}


let cart: Record<string, CartItem> = {}


//render products
function renderCart() {
  const orderList = document.querySelector('.order-list') as HTMLElement;
  const cartCount = document.querySelector('.cart-count') as HTMLElement;
  const cartItems = Object.values(cart);

  let totalCount = 0
  let totalPrice = 0

  orderList.innerHTML = cartItems.length === 0 ? `
  <div style= <div style="color:#aaa;font-size:1rem;">Cart is empty.</div>`:
    cartItems.map(item => {
      const itemTotal = item.price * item.quantity
      totalCount += item.quantity
      totalPrice += itemTotal
      return `
      <div class= "cart-item">
      <div>
              <div style="font-weight:600;">${item.name}</div>
              <div style="font-size:0.95em;color:#d35400;">
                ${item.quantity}x <span style="color:#888;">$${item.price.toFixed(2)}</span> <b>$${itemTotal.toFixed(2)}</b>
              </div>
            </div>
            <button class="cart-item-btn remove-item" data-name="${item.name}" title="Remove"> &times;</button>
          </div>
      `
    }).join('')
  cartCount.innerHTML = `(${totalCount})`

  //add order total
  orderList.insertAdjacentHTML(
    'afterend', `
    <div class="cart-total-row">
      <span>Order Total</span>
      <span class="cart-total">$${totalPrice.toFixed(0)}</span>
    </div>
  `)

  //remove item
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const name = (e.currentTarget as HTMLElement).getAttribute('data-name')!
      delete cart[name]
      renderCart()
    })
  })
}

const renderProducts = (products: any[]) => {
  const productList = document.getElementById('product-list')
  if (!productList) return

  productList.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${product.image.thumbnail}" alt="${product.name}" class="product-img"/>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="product-category">${product.category}</p>
        <span class="product-price">$${product.price.toFixed(2)}</span>
        <button class="add-to-cart-btn" data-name="${product.name}" data-category="${product.category}" data-price="${product.price}">
          <span>🛒</span> Add to Cart
        </button>
      </div>
    </div>
  `).join('')

  // Add event listeners for Add to Cart
  productList.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name')
      const category = btn.getAttribute('data-category')
      const price = parseFloat(btn.getAttribute('data-price')!)
      if (name) {
        if (cart[name]) {
          cart[name].quantity += 1
        } else {
          cart[name!] = { name: name!, category: category!, price, quantity: 1 }
        }
        renderCart()
      }
    })
  })

  // Call renderCart to ensure it is used and cart is rendered
  renderCart()
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
 <h1>Desserts</h1> 
  <div class="container">     
    <div id="product-list" class="product-list"></div>
    <div id="cart-container" class="cart-container">
      <h2>Your Cart <span class="cart-count">(0)</span></h2>
      <div class="cart-items">        
            <div class="order-list"></div>
      </div> 
      <button id="confirm-order" class="cart-confirm-btn">Confirm Order</button>
      <div id="confirmation-message" class="confirmation-message hidden">Order Confirmed!</div>
    </div>
  </div>
`

const setupConfirmOrder = (database: productDatabase) => {
  const confirmBtn = document.getElementById('confirm-order')
  const confirmationMsg = document.getElementById('confirmation-message')
  confirmBtn?.addEventListener('click', async () => {
    // Save each cart item as a product in IndexedDB
    for (const item of Object.values(cart)) {
      await database.addProduct(item.name, item.category, item.price)
    }
    cart = {}
    renderCart()
    confirmationMsg?.classList.remove('hidden')
    setTimeout(() => confirmationMsg?.classList.add('hidden'), 2000)
  })
}

startApp().catch(console.error)
