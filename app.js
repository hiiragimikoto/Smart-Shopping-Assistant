let currentData = PRODUCTS;
let selectedProducts = [];
let suggestedProductIds = [];

// ✅ FIX: thêm lastContext
let lastContext = {
    loai: null,
    gender: null,
    season: null
};

// ================= CHAT =================

function sendMessage() {
    const input = document.getElementById("chatInput");
    const message = input.value.trim();
    if (!message) return;

    addChat("Bạn", message);
    input.value = "";

    const response = aiSellerEngine(message);
    addChat("AI tư vấn", response);
}

function addChat(sender, text) {
    const box = document.getElementById("chatBox");
    box.innerHTML += `<p><b>${sender}:</b> ${text}</p>`;
    box.scrollTop = box.scrollHeight;
}

// ================= AI ENGINE =================

function aiSellerEngine(message) {

    message = message.toLowerCase();

    let loai = message.includes("quần") ? "Quần" :
        message.includes("áo") ? "Áo" :
        lastContext.loai;

    let gender = message.includes("nam") ? "Nam" :
        message.includes("nữ") ? "Nữ" :
        lastContext.gender;

    let season = null;

    if (message.includes("đông") || message.includes("lạnh"))
        season = "Thu Đông";

    if (message.includes("hè") || message.includes("nóng"))
        season = "Xuân Hè";

    season = season || lastContext.season;

    lastContext = {
        loai,
        gender,
        season
    };

    // ================= XEM THÊM =================

    if (message.includes("thêm") || message.includes("khác")) {

        let similar = PRODUCTS.filter(p =>
            (!loai || p.category === loai) &&
            (!gender || p.gender === gender) &&
            (!season || p.season === season) &&
            !suggestedProductIds.includes(p.id)
        );

        if (similar.length === 0) {
            suggestedProductIds = [];
            return "Dạ em đã gửi hết mẫu phù hợp rồi ạ 😊 Anh/chị muốn lọc tiêu chí khác không ạ?";
        }

        let suggestions = similar
            .sort((a, b) => b.rating.score - a.rating.score)
            .slice(0, 3);

        suggestions.forEach(p => suggestedProductIds.push(p.id));

        let text = suggestions.map(p =>
            `• ${p.product} - ${p.price.toLocaleString()} VND`
        ).join("<br>");

        return `Em gửi thêm mẫu cho mình ạ 👩‍💼<br><br>${text}`;
    }

    // ================= TƯ VẤN SIZE =================

    let height = null;
    let weight = null;

    let cmMatch = message.match(/(\d{3})\s?cm/);
    if (cmMatch) height = parseInt(cmMatch[1]);

    let mMatch = message.match(/(\d)m(\d{1,2})/);
    if (!height && mMatch)
        height = parseInt(mMatch[1]) * 100 + parseInt(mMatch[2]);

    let kgMatch = message.match(/(\d{2,3})\s?kg/);
    if (kgMatch) weight = parseInt(kgMatch[1]);

    if (!height || !weight) {
        return "Anh/chị cho em xin chiều cao (cm) và cân nặng (kg) để em tư vấn size chuẩn ạ 👩‍💼";
    }

    let size;

    if (gender === "Nam") {
        if (height < 165 && weight < 55) size = "S";
        else if (height <= 170 && weight <= 65) size = "M";
        else if (height <= 175 && weight <= 75) size = "L";
        else if (height <= 180 && weight <= 85) size = "XL";
        else size = "2XL";
    } else {
        if (height < 155 && weight < 45) size = "S";
        else if (height <= 160 && weight <= 52) size = "M";
        else if (height <= 165 && weight <= 60) size = "L";
        else if (height <= 170 && weight <= 70) size = "XL";
        else size = "2XL";
    }

    // ✅ FIX: sizes
    let filtered = PRODUCTS.filter(p =>
        (!loai || p.category === loai) &&
        (!gender || p.gender === gender) &&
        (!season || p.season === season) &&
        p.sizes.includes(size)
    );

    if (filtered.length === 0)
        return "Hiện chưa có mẫu đúng size này ạ.";

    let suggestions = filtered
        .sort((a, b) => b.rating.score - a.rating.score)
        .slice(0, 3);

    suggestedProductIds = suggestions.map(p => p.id);

    let productCards = suggestions.map(p => `
        <div style="display:flex;gap:10px;background:#fff;padding:8px;border-radius:8px;margin-top:8px;">
            <img src="${p.image}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;">
            <div>
                <b>${p.product}</b><br>
                ${p.price.toLocaleString()} VND<br>
                ⭐ ${p.rating.score}
            </div>
        </div>
    `).join("");

    return `
Dạ size phù hợp là <b>${size}</b> ạ 👩‍💼
${productCards}
<br>Anh/chị muốn xem thêm mẫu khác không ạ?
`;
}