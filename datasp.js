const SIZES = ["S", "M", "L", "XL", "2XL"];
const GENDERS = ["Nam", "Nữ"];
const SEASONS = ["Xuân Hè", "Thu Đông"];

function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getImage(id, category, gender, season) {

    const c = category === "Quần" ? "quan" : "ao";
    const g = gender === "Nam" ? "nam" : "nu";
    const s = season === "Thu Đông" ? "thudong" : "xuanhe";

    const totalImages = 5; // số ảnh trong mỗi folder
    const number = (id % totalImages) + 1;

    return `images/${c}/${g}/${s}/${number}.jpg`;
}
function taoSanPham(id, loai) {

    const gender = GENDERS[random(0, GENDERS.length)];
    const season = SEASONS[random(0, SEASONS.length)];

    return {
        id: id,
        category: loai,
        product: `${loai} ${gender} mẫu ${id}`,
        gender: gender,
        season: season,
        sizes: [...SIZES],
        price: random(150000, 900000),
        currency: "VND",
        discount: random(5, 40),
        image: getImage(id, loai, gender, season),

        rating: {
            score: (Math.random() * 5).toFixed(1),
            totalReviews: random(50, 2000)
        }
    };
}

const PRODUCTS = [
    ...Array.from({ length: 8 }, (_, i) => taoSanPham(i + 1, "Quần")),
    ...Array.from({ length: 8 }, (_, i) => taoSanPham(i + 9, "Áo"))
];