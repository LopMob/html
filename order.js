let order = { soup: null, main: null, salad: null, drink: null, dessert: null, combo: null };
let selectedDishes = JSON.parse(localStorage.getItem('selectedDishes')) || [];

function toggleDishSelection(dishId) {
  if (selectedDishes.includes(dishId)) {
    selectedDishes = selectedDishes.filter(id => id !== dishId);
  } else {
    selectedDishes.push(dishId);
  }

  // сохраняем изменения
  localStorage.setItem('selectedDishes', JSON.stringify(selectedDishes));

  // обновляем интерфейс
  updateSelectionUI();
  updateTotalPrice();
}

// применяем подсветку выбранных блюд при загрузке
function updateSelectionUI() {
  document.querySelectorAll('.dish-card').forEach(card => {
    const id = parseInt(card.dataset.id);
    if (selectedDishes.includes(id)) {
      card.classList.add('selected');
      card.querySelector('button').textContent = 'Убрать';
    } else {
      card.classList.remove('selected');
      card.querySelector('button').textContent = 'Добавить';
    }
  });
}

// при загрузке страницы — восстанавливаем выбор
document.addEventListener('DOMContentLoaded', () => {
  updateSelectionUI();
  updateTotalPrice();
});

function selectDish(dish) {
  const card = document.querySelector(`[data-dish="${dish.keyword}"]`);
  const button = card.querySelector("button");

  // если уже выбрано это блюдо → снимаем выбор
  if (order[dish.category] && order[dish.category].keyword === dish.keyword) {
    order[dish.category] = null;
    card.classList.remove('selected');
    button.classList.remove('active-btn');
  } else {
    order[dish.category] = dish;

    // убираем выделение у всех в категории
    document.querySelectorAll(`#${dish.category}s .dish`).forEach(el => {
      el.classList.remove('selected');
      el.querySelector("button").classList.remove('active-btn');
    });

    // подсвечиваем выбранное
    card.classList.add('selected');
    button.classList.add('active-btn');
  }

  updateOrder();
}

// обновление содержимого заказа и общей суммы
function updateOrder() {
  const orderDiv = document.getElementById('order');
  if (orderDiv) orderDiv.innerHTML = '';

  let total = 0;
  let hasDish = false;

  // ---- обычные блюда ----
  ['soup', 'main', 'salad', 'drink', 'dessert'].forEach(cat => {
    const dish = order[cat];
    if (dish) {
      if (orderDiv) orderDiv.innerHTML += `<p><strong>${dish.name}</strong> — ${dish.price} ₽</p>`;
      total += dish.price;
      hasDish = true;
    } else if (orderDiv) {
      const names = {
        soup: 'Суп',
        main: 'Главное блюдо',
        salad: 'Салат/стартер',
        drink: 'Напиток',
        dessert: 'Десерт'
      };
      orderDiv.innerHTML += `<p>${names[cat]}: не выбрано</p>`;
    }
  });

  // ---- комбо ----
  if (order.combo) {
    if (orderDiv) {
      orderDiv.innerHTML += `
        <p><strong>${order.combo.name}</strong> — ${order.combo.price} ₽</p>
      `;
    }
    total += order.combo.price; // ✅ теперь добавляем цену комбо к общей
    hasDish = true;
  } else if (orderDiv) {
    orderDiv.innerHTML += `<p>Комбо: не выбрано</p>`;
  }

  // ---- итог ----
  const totalElem = document.getElementById('total-amount');
  if (totalElem) totalElem.textContent = total;

  if (orderDiv) {
    if (hasDish) {
      orderDiv.innerHTML += `<p><strong>Общая стоимость:</strong> ${total} ₽</p>`;
    } else {
      orderDiv.innerHTML = '<p>Ничего не выбрано</p>';
    }
  }

  saveOrderToLocalStorage();
  updateHiddenInputs();
}


// обновление скрытых полей формы
function updateHiddenInputs() {
  const form = document.querySelector('#order-form');
  if (!form) return;

  form.querySelectorAll('input[type=hidden]').forEach(el => el.remove());

  ['soup', 'main', 'salad', 'drink', 'dessert', 'combo'].forEach(cat => {
    const dish = order[cat];
    if (dish) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = cat;
      input.value = dish.keyword || dish.name;
      form.appendChild(input);
    }
  });
}

// ---- Валидация перед отправкой ----
const formEl = document.querySelector('#order-form');
if (formEl) {
  formEl.addEventListener('submit', function(e) {
    const { soup, main, salad, drink, dessert, combo } = order;

    if (combo) return; // комбо всегда валидно

    const validCombos = [
      { soup: true, main: true, salad: true, drink: true },
      { soup: true, main: true, drink: true },
      { soup: true, salad: true, drink: true },
      { main: true, salad: true, drink: true },
      { main: true, drink: true }
    ];

    const chosen = { soup: !!soup, main: !!main, salad: !!salad, drink: !!drink };

    const isValid = validCombos.some(combo =>
      Object.keys(combo).every(key => combo[key] === chosen[key])
    );

    if (!isValid) {
      e.preventDefault();
      showNotification(chosen);
    }
  });
}

function showNotification(chosen) {
  let text = "Ничего не выбрано. Выберите блюда для заказа";

  if (!chosen.drink && (chosen.soup || chosen.main || chosen.salad)) {
    text = "Выберите напиток";
  } else if (chosen.soup && !chosen.main && !chosen.salad) {
    text = "Выберите главное блюдо или салат";
  }

  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="modal">
      <p>${text}</p>
      <button id="ok-btn">Окей 👌</button>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('ok-btn').addEventListener('click', () => overlay.remove());
}

function selectCombo(comboName, comboPrice, comboItems) {
  // comboItems — объект с id блюд (суп, основное и т.д.)
  order.combo = {
    name: comboName,
    price: comboPrice,
    items: comboItems
  };

  document.querySelectorAll('.add-combo-btn').forEach(btn => btn.classList.remove('active-btn'));
  event.target.classList.add('active-btn');

  updateOrder();
  saveOrderToLocalStorage();
}

// ---- Сохранение выбора ----
function saveOrderToLocalStorage() {
  // сохраняем обычные блюда
  const ids = Object.values(order)
    .filter(Boolean)
    .filter(d => !d.items) // пропускаем комбо
    .map(d => d.id || d.name);

  localStorage.setItem('selectedDishes', JSON.stringify(ids));

  // сохраняем комбо, если выбрано
  if (order.combo && order.combo.items) {
    localStorage.setItem('selectedCombo', JSON.stringify(order.combo.items));
  } else {
    localStorage.removeItem('selectedCombo');
  }
}

