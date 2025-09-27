let order = { soup: null, main: null, drink: null };

function selectDish(dish) {
  order[dish.category] = dish;

  // снять подстветки со всех карточек этой категории
  document.querySelectorAll(`#${dish.category}s .dish`).forEach(el => {
    el.classList.remove('selected');
  });

  // выделить выбранную карточку
  document.querySelector(`[data-dish="${dish.keyword}"]`).classList.add('selected');

  updateOrder();
}

function updateOrder() {
  const orderDiv = document.getElementById('order');
  orderDiv.innerHTML = '';

  let total = 0;
  let hasDish = false;

  ['soup', 'main', 'drink'].forEach(cat => {
    const dish = order[cat];
    if (dish) {
      orderDiv.innerHTML += `<p><strong>${dish.name}</strong> ${dish.price} ₽</p>`;
      total += dish.price;
      hasDish = true;
    } else {
      orderDiv.innerHTML += `<p>${cat === 'soup' ? 'Суп' : cat === 'main' ? 'Главное блюдо' : 'Напиток'}: не выбрано</p>`;
    }
  });

  if (hasDish) {
    orderDiv.innerHTML += `<p><strong>Стоимость заказа:</strong> ${total} ₽</p>`;
  } else {
    orderDiv.innerHTML = '<p>Ничего не выбрано</p>';
  }

  updateHiddenInputs();
}

function updateHiddenInputs() {
  const form = document.querySelector('#order-form');
  form.querySelectorAll('input[type=hidden]').forEach(el => el.remove());

  ['soup', 'main', 'drink'].forEach(cat => {
    const dish = order[cat];
    if (dish) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = cat;
      input.value = dish.keyword;
      form.appendChild(input);
    }
  });
}
