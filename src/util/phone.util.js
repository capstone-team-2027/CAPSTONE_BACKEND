module.exports.normalizeVnPhone = (phone) => {
    if (!phone) return null;
    phone = phone.replace(/\D/g, "");
    if (phone.startsWith("84")) {
        phone = "0" + phone.slice(2);
    }
    const regex = /^(03|05|07|08|09)\d{8}$/;
    if (!regex.test(phone)) {
        return null;
    }
    return "84" + phone.slice(1);
};
