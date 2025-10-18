// orders.js — ВЕРСИЯ С ИСПОЛЬЗОВАНИЕМ ГОТОВОЙ МОДАЛКИ ИЗ orders.html

const API = "https://edu.std-900.ist.mospolytech.ru/labs/api";
const API_KEY = "cccba07b-7e11-461c-b898-d8fc1720b9c7";

let dishesMap = {}; // id → объект блюда

// -------------------- утилиты --------------------
async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Ошибка запроса");
  return data;
}

function roubles(n) {
  return `${n} ₽`;
}

// -------------------- загрузка и список --------------------
async function loadOrders() {
  try {
    // 1) блюда
    const dishes = await fetchJSON(`${API}/dishes?api_key=${API_KEY}`);
    dishesMap = {};
    dishes.forEach(d => (dishesMap[d.id] = d));

    // 2) заказы
    const orders = await fetchJSON(`${API}/orders?api_key=${API_KEY}`);
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    renderOrders(orders);
  } catch (err) {
    const empty = document.getElementById("orders-empty");
    empty.textContent = err.message;
    empty.classList.remove("hidden");
  }
}

function renderOrders(orders) {
  const tbody = document.getElementById("orders-tbody");
  tbody.innerHTML = "";

  if (!orders.length) {
    document.getElementById("orders-empty").classList.remove("hidden");
    return;
  }
  document.getElementById("orders-empty").classList.add("hidden");

  orders.forEach((o, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${new Date(o.created_at).toLocaleString()}</td>
      <td>${compose(o)}</td>
      <td>${roubles(calcTotal(o))}</td>
      <td>${o.delivery_type === "by_time" ? o.delivery_time : "Как можно скорее (с 07:00 до 23:00)"}</td>
      <td class="actions">
        <button data-id="${o.id}" data-act="details">Подробнее</button>
        <button data-id="${o.id}" data-act="edit">Редактировать</button>
        <button data-id="${o.id}" data-act="delete">Удалить</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // делегирование на кнопки
  tbody.onclick = (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const id = +btn.dataset.id;
    const act = btn.dataset.act;
    if (act === "details") showDetails(id);
    if (act === "edit") editOrder(id);
    if (act === "delete") deleteOrder(id);
  };
}

// названия блюд через запятую
function compose(o) {
  const ids = [o.soup_id, o.main_course_id, o.salad_id, o.drink_id, o.dessert_id];
  return ids
    .filter(Boolean)
    .map(id => (dishesMap[id] ? dishesMap[id].name : `#${id}`))
    .join(", ");
}

// сумма заказа
function calcTotal(o) {
  const ids = [o.soup_id, o.main_course_id, o.salad_id, o.drink_id, o.dessert_id];
  return ids
    .filter(Boolean)
    .reduce((s, id) => s + (dishesMap[id]?.price || 0), 0);
}

// -------------------- модалка (используем шаблон из orders.html) --------------------
const overlay = document.getElementById("modal-overlay");
const mTitle  = document.getElementById("modal-title");
const mBody   = document.getElementById("modal-body");
const mFooter = document.getElementById("modal-footer");
const mClose  = document.getElementById("modal-close");

function closeModal() {
  overlay.classList.add("hidden");
  mTitle.textContent = "";
  mBody.innerHTML = "";
  mFooter.innerHTML = "";
}
mClose.addEventListener("click", closeModal);

function openModal({ title, bodyHTML, footerButtons = [] }) {
  mTitle.textContent = title;
  mBody.innerHTML = bodyHTML;
  mFooter.innerHTML = "";
  footerButtons.forEach(({ text, className = "", onClick }) => {
    const b = document.createElement("button");
    b.textContent = text;
    if (className) b.className = className;
    b.addEventListener("click", onClick);
    mFooter.appendChild(b);
  });
  overlay.classList.remove("hidden");
}

// -------------------- Подробнее --------------------
async function showDetails(orderId) {
  try {
    const o = await fetchJSON(`${API}/orders/${orderId}?api_key=${API_KEY}`);

    const body = `
      <p><strong>Дата оформления:</strong> ${new Date(o.created_at).toLocaleString()}</p>

      <h3>Доставка</h3>
      <p><strong>Имя получателя:</strong> ${o.full_name}</p>
      <p><strong>Адрес доставки:</strong> ${o.delivery_address}</p>
      <p><strong>Время доставки:</strong> ${o.delivery_type === "by_time" ? o.delivery_time : "Как можно скорее (с 07:00 до 23:00)"}</p>
      <p><strong>Телефон:</strong> ${o.phone}</p>
      <p><strong>Email:</strong> ${o.email}</p>

      <h3>Комментарий</h3>
      <p>${o.comment || "—"}</p>

      <h3>Состав заказа</h3>
      <ul>
        ${o.soup_id ? `<li>Суп: ${dishesMap[o.soup_id].name} (${roubles(dishesMap[o.soup_id].price)})</li>` : ""}
        ${o.main_course_id ? `<li>Основное блюдо: ${dishesMap[o.main_course_id].name} (${roubles(dishesMap[o.main_course_id].price)})</li>` : ""}
        ${o.salad_id ? `<li>Салат/стартер: ${dishesMap[o.salad_id].name} (${roubles(dishesMap[o.salad_id].price)})</li>` : ""}
        ${o.drink_id ? `<li>Напиток: ${dishesMap[o.drink_id].name} (${roubles(dishesMap[o.drink_id].price)})</li>` : ""}
        ${o.dessert_id ? `<li>Десерт: ${dishesMap[o.dessert_id].name} (${roubles(dishesMap[o.dessert_id].price)})</li>` : ""}
      </ul>

      <p><strong>Стоимость:</strong> ${roubles(calcTotal(o))}</p>
    `;

    openModal({
      title: "Просмотр заказа",
      bodyHTML: body,
      footerButtons: [{ text: "ОК", onClick: closeModal }]
    });
  } catch (err) {
    alert("Ошибка: " + err.message);
  }
}

// -------------------- Редактирование --------------------
async function editOrder(orderId) {
  try {
    const o = await fetchJSON(`${API}/orders/${orderId}?api_key=${API_KEY}`);

    const body = `
      <form id="edit-form">
        <p><strong>Дата оформления:</strong> ${new Date(o.created_at).toLocaleString()}</p>

        <h3>Доставка</h3>

        <label>Имя получателя
          <input type="text" name="full_name" value="${o.full_name || ""}" required>
        </label>

        <label>Телефон
          <input type="text" name="phone" value="${o.phone || ""}" required>
        </label>

        <label>Адрес доставки
          <input type="text" name="delivery_address" value="${o.delivery_address || ""}" required>
        </label>

        <label>Email
          <input type="email" name="email" value="${o.email || ""}" required>
        </label>

        <div class="radio-group">
          <span>Тип доставки:</span>
          <label><input type="radio" name="delivery_type" value="now" ${o.delivery_type === "now" ? "checked" : ""}> Как можно скорее</label>
          <label><input type="radio" name="delivery_type" value="by_time" ${o.delivery_type === "by_time" ? "checked" : ""}> Ко времени</label>
        </div>

        <label>Время доставки
          <input type="time" name="delivery_time" value="${o.delivery_time || ""}">
        </label>

        <label style="grid-column: span 2;">Комментарий
          <textarea name="comment">${o.comment || ""}</textarea>
        </label>
      </form>
    `;

    openModal({
      title: "Редактирование заказа",
      bodyHTML: body,
      footerButtons: [
        { text: "Отмена", onClick: closeModal },
        { text: "Сохранить", onClick: saveOrder }
      ]
    });

    // логика формы
    const form = document.getElementById("edit-form");
    const timeInput = form.elements["delivery_time"];
    const toggleTime = () => {
      timeInput.disabled = form.elements["delivery_type"].value !== "by_time";
      if (timeInput.disabled) timeInput.value = "";
    };
    form.addEventListener("change", e => {
      if (e.target.name === "delivery_type") toggleTime();
    });
    toggleTime();

    async function saveOrder() {
      const data = Object.fromEntries(new FormData(form).entries());

      if (data.delivery_type === "by_time" && !data.delivery_time) {
        alert("Укажите время доставки!");
        return;
      }

      try {
        await fetchJSON(`${API}/orders/${orderId}?api_key=${API_KEY}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        alert("Заказ успешно обновлён");
        closeModal();
        loadOrders();
      } catch (err) {
        alert("Ошибка: " + err.message);
      }
    }
  } catch (err) {
    alert("Ошибка: " + err.message);
  }
}

// -------------------- Удаление --------------------
// -------------------- Удаление --------------------
async function deleteOrder(orderId) {
  const body = `
    <p>Вы уверены, что хотите удалить заказ?</p>
  `;

  openModal({
    title: "Удаление заказа",
    bodyHTML: body,
    footerButtons: [
      { text: "Отмена", className: "btn-cancel", onClick: closeModal },
      { text: "Да", className: "btn-danger", onClick: async () => {
          try {
            await fetchJSON(`${API}/orders/${orderId}?api_key=${API_KEY}`, {
              method: "DELETE"
            });
            alert("Заказ удалён");
            closeModal();
            loadOrders();
          } catch (err) {
            alert("Ошибка: " + err.message);
          }
        } 
      }
    ]
  });
}


// -------------------- init --------------------
window.addEventListener("DOMContentLoaded", loadOrders);
