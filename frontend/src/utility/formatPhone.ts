
export const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';

    let cleaned = digits;
    // Если пользователь начал с 8, меняем на 7
    if (cleaned.startsWith('8')) cleaned = '7' + cleaned.slice(1);
    // Если не начинается с 7 (например, сразу ввел 999), добавляем 7
    if (!cleaned.startsWith('7')) cleaned = '7' + cleaned;

    let result = '+7';
    if (cleaned.length > 1) result += ' (' + cleaned.slice(1, 4);
    if (cleaned.length > 4) result += ') ' + cleaned.slice(4, 7);
    if (cleaned.length > 7) result += '-' + cleaned.slice(7, 9);
    if (cleaned.length > 9) result += '-' + cleaned.slice(9, 11);

    return result;
};