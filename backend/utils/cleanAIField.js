// Перетворює відповідь AI (рядок, масив або об'єкт) у звичайний текст, щоб його можна було зберегти в MySQL і показати на сайті
export function cleanAIField(data) {
    // Якщо поле порожнє
    if (!data) return "Не визначено";

    // Якщо масив -> рядок через кому
    if (Array.isArray(data)) return data.join(', ');

    // Якщо об'єкт -> кожен пункт з нового рядка у форматі "Ключ: Значення"
    if (typeof data === 'object') {
        try {
            return Object.entries(data)
                .map(([key, val]) => {
                    // "market_size" -> "Market size"
                    const niceKey = key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
                    // Якщо значення теж об'єкт (вкладеність), перетворюємо в JSON-рядок
                    const niceVal = typeof val === 'object' ? JSON.stringify(val) : val;
                    return `${niceKey}: ${niceVal}`;
                })
                .join('\n');
        } catch (e) {
            // Якщо щось пішло не так, просто перетворюємо в JSON-рядок
            return JSON.stringify(data);
        }
    }

    // Якщо це вже рядок (або число) -> просто повертаємо як текст
    return String(data);
}