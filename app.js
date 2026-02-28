let currentData = PRODUCTS;
let selectedProducts = [];

// ================= RENDER =================
function render(data = currentData) {
    const container = document.getElementById("productList");
    container.innerHTML = "";

    data.forEach(p => {

        if (p.rating.score < 2 || p.rating.score > 5) return;

        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
<b>${p.product}</b><br>
Loại: ${p.category}<br>
Giới tính: ${p.gender}<br>
Mùa: ${p.season}<br>
Size: ${p.sizes.join(", ")}<br>
Giá: ${p.price.toLocaleString()} VND<br>
⭐ ${p.rating.score}/5 (${p.rating.totalReviews} đánh giá)<br><br>
<button onclick="selectProduct(${p.id})">Chọn</button>
        `;
        container.appendChild(div);
    });
}

// ================= BỘ LỌC =================
function filterData() {
    const c = document.getElementById("filterCategory").value;
    const g = document.getElementById("filterGender").value;
    const s = document.getElementById("filterSeason").value;

    currentData = PRODUCTS.filter(p =>
        (!c || p.category === c) &&
        (!g || p.gender === g) &&
        (!s || p.season === s)
    );

    render();
}

function sortByRating() {
    currentData = [...currentData].sort((a,b)=>
        parseFloat(b.rating.score) - parseFloat(a.rating.score)
    );
    render();
}

function selectProduct(id) {
    const p = PRODUCTS.find(x=>x.id===id);
    if (!selectedProducts.includes(p))
        selectedProducts.push(p);
}


// ================= CHAT AI SELLER =================

function sendMessage() {

    const input = document.getElementById("chatInput");
    const message = input.value.trim();
    if (!message) return;

    addChat("Bạn", message);
    input.value = "";

    const response = aiSellerEngine(message.toLowerCase());
    addChat("AI tư vấn", response);
}

function addChat(sender, text) {
    const box = document.getElementById("chatBox");
    box.innerHTML += `<p><b>${sender}:</b> ${text}</p>`;
    box.scrollTop = box.scrollHeight;
}

const chatBox = document.getElementById("chatBox");

function addMessage(text,type){
    const div = document.createElement("div");
    div.className = `message ${type}`;
    div.innerHTML = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function typingEffect(text,callback){
    const div = document.createElement("div");
    div.className = "message ai";
    chatBox.appendChild(div);

    let i=0;
    const interval=setInterval(()=>{
        div.innerHTML += text.charAt(i);
        i++;
        if(i>=text.length){
            clearInterval(interval);
            if(callback) callback();
        }
    },20);
}

function recommend(size){

    const filtered = PRODUCTS
        .filter(p=>p.size.includes(size))
        .sort((a,b)=>b.rating.score-a.rating.score)
        .slice(0,5);

    typingEffect(`Dạ em đã chọn size phù hợp là ${size} cho Anh/Chị 👕\n\nDưới đây là một số mẫu nổi bật:\n`,()=>{

        const carousel=document.createElement("div");
        carousel.className="carousel";

        filtered.forEach(p=>{
            const card=document.createElement("div");
            card.className="card";
            card.innerHTML=`
                <img src="${p.image}">
                <b>${p.product}</b><br>
                ${p.price.toLocaleString('vi-VN')} VND<br>
                ⭐ ${p.rating.score}
            `;
            carousel.appendChild(card);
        });

        chatBox.appendChild(carousel);

        typingEffect("\nAnh/Chị có muốn xem thêm mẫu khác không ạ?");
    });
}

function handleEnter(e){
    if(e.key==="Enter"){
        const value=e.target.value.trim();
        if(!value) return;
        addMessage(value,"user");
        e.target.value="";
        setTimeout(()=>recommend(value),500);
    }
}

// ================= AI ENGINE NÂNG CẤP =================


let suggestedProductIds = [];

function aiSellerEngine(message) {

    message = message.toLowerCase();

    let loai = message.includes("quần") ? "Quần" :
               message.includes("áo") ? "Áo" : lastContext.loai || null;

    let gender = message.includes("nam") ? "Nam" :
                 message.includes("nữ") ? "Nữ" : lastContext.gender || null;

    let season = null;

    if (message.includes("thu đông") || message.includes("đông") || message.includes("lạnh"))
        season = "Thu Đông";

    if (message.includes("xuân hè") || message.includes("hè") || message.includes("nóng"))
        season = "Xuân Hè";

    season = season || lastContext.season || null;

    lastContext = { loai, gender, season };

    // =====================================================
    // ===== XEM THÊM (KHÔNG LẶP) =====
    // =====================================================
    if (
        message.includes("thêm") ||
        message.includes("khác") ||
        message.includes("xem thêm")
    ) {

        let similar = PRODUCTS.filter(p =>
            (!loai || p.category === loai) &&
            (!gender || p.gender === gender) &&
            (!season || p.season === season) &&
            !suggestedProductIds.includes(p.id) // loại trùng
        );

        if (similar.length === 0) {
            suggestedProductIds = []; // reset nếu hết
            return "Dạ em đã gửi hết các mẫu phù hợp rồi ạ 😊 Anh/chị muốn em lọc theo tiêu chí khác không ạ?";
        }

        let suggestions = similar
            .sort((a,b)=>b.rating.score - a.rating.score)
            .slice(0,3);

        suggestions.forEach(p => suggestedProductIds.push(p.id));

        let text = suggestions.map(p =>
            `• ${p.product} - ${p.price.toLocaleString()} VND`
        ).join("<br>");

        return `
Dạ em gửi thêm các mẫu khác cùng loại cho mình ạ 👩‍💼  

${text}

Anh/chị muốn ưu tiên giá tốt hơn hay mẫu cao cấp hơn ạ?
`;
    }

    // =====================================================
    // ===== TƯ VẤN SIZE =====
    // =====================================================

    let height = null;
    let cmMatch = message.match(/(\d{3})\s?cm\b/);
    if (cmMatch) height = parseInt(cmMatch[1]);

    let mMatch = message.match(/(\d)m(\d{1,2})/);
    if (!height && mMatch)
        height = parseInt(mMatch[1]) * 100 + parseInt(mMatch[2]);

    let weight = null;
    let kgMatch = message.match(/(\d{2,3})\s?kg\b/);
    if (kgMatch) weight = parseInt(kgMatch[1]);

    if (!height || !weight) {
        return `
Dạ anh/chị cho em xin chiều cao và cân nặng để em tư vấn size chuẩn nhất ạ 👩‍💼
`;
    }

    let size = null;

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

    let filtered = PRODUCTS.filter(p =>
        (!loai || p.category === loai) &&
        (!gender || p.gender === gender) &&
        (!season || p.season === season) &&
        p.sizes.includes(size)
    );

    if (filtered.length === 0)
        return "Dạ hiện chưa có mẫu đúng size này ạ.";

    let suggestions = filtered
        .sort((a,b)=>b.rating.score - a.rating.score)
        .slice(0,3);

    suggestedProductIds = suggestions.map(p => p.id); // reset danh sách

    let productCards = suggestions.map(p => `
    <div class="ai-product-card">
        <img src="${p.image}">
        <div class="ai-product-info">
            <b>${p.product}</b><br>
            ${p.price.toLocaleString()} VND<br>
            ⭐ ${p.rating.score}
        </div>
    </div>
`).join("");

return `
Dạ em đã tính size phù hợp là <b>${size}</b> cho mình ạ 👩‍💼  

<div class="ai-product-list">
    ${productCards}
</div>

Anh/chị muốn xem thêm mẫu khác cùng size không ạ?
`;

    return `
Dạ em đã tính size phù hợp là <b>${size}</b> cho mình ạ 👩‍💼  

${text}

Anh/chị muốn xem thêm mẫu khác cùng size không ạ?
`;
}
