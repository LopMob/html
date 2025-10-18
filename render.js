let filtersWired = false; // чтобы не вешать обработчики повторно

function renderDishes() {
  // соответствие категорий из API вашим секциям
  const containers = {
    "soup":        document.querySelector('#soups .dishes'),
    "main-course": document.querySelector('#mains .dishes'),
    "salad":       document.querySelector('#salads .dishes'),
    "drink":       document.querySelector('#drinks .dishes'),
    "dessert":     document.querySelector('#desserts .dishes')
  };

  // очистим перед отрисовкой (на случай повторного рендера)
  Object.values(containers).forEach(c => c && (c.innerHTML = ""));

  // сортировка по названию — как было
  dishes.sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  // рисуем карточки
  dishes.forEach(dish => {
    const place = containers[dish.category];
    if (!place) return; // на всякий случай, если категория неизвестна

    const card = document.createElement('div');
    card.className = 'dish';
    card.dataset.dish = dish.keyword; // нужно для order.js
    card.dataset.kind = dish.kind;    // нужно для фильтров

    card.innerHTML = `
      <img src="${dish.image}" alt="${dish.name}">
      <p class="name">${dish.name}</p>
      <p class="weight">${dish.count}</p>
      <p class="price">${dish.price} ₽</p>
      <button class="add-btn">Добавить</button>
    `;

    // клик по кнопке — используем твою функцию из order.js
    card.querySelector('button').addEventListener('click', () => {
      selectDish(dish);
    });

    place.appendChild(card);
    
  });

  // подключаем фильтры один раз (делегирование)
  if (!filtersWired) {
    document.querySelectorAll('section').forEach(section => {
      const filters = section.querySelector('.filters');
      const list    = section.querySelector('.dishes');
      if (!filters || !list) return;

      filters.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-kind]');
        if (!btn) return;

        // переключаем active в пределах секции
        const active = filters.querySelector('button.active');
        if (active === btn) {
          active.classList.remove('active');
          list.querySelectorAll('.dish').forEach(d => d.style.display = '');
          return;
        }
        filters.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const kind = btn.dataset.kind;
        list.querySelectorAll('.dish').forEach(card => {
          card.style.display = (card.dataset.kind === kind) ? '' : 'none';
        });
      });
    });

    filtersWired = true;
  }
}
function restoreSelection() {
  const selected = JSON.parse(localStorage.getItem('selectedDishes')) || [];
  document.querySelectorAll('.dish-card').forEach(card => {
    const id = parseInt(card.dataset.id);
    if (selected.includes(id)) {
      card.classList.add('selected');
      const btn = card.querySelector('.add-btn');
      if (btn) btn.textContent = 'Удалить';
    }
  });
}
