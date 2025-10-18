let dishes = [];
async function loadDishes() {
  try {
    const response = await fetch("https://edu.std-900.ist.mospolytech.ru/labs/api/dishes");
    if (!response.ok) 
      {
      throw new Error(`Ошибка при загрузке данных: ${response.status}`);
    }

    dishes = await response.json();
    console.log("✅ Блюда успешно загружены:", dishes);

    if (typeof renderDishes === "function") {
      renderDishes(dishes);
    }
  } catch (error) {
    console.error("❌ Не удалось загрузить блюда:", error);
    alert("Ошибка загрузки данных. Попробуйте позже.");
  }
}
