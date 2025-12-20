// --- دیتای متون سایت ---
const translations = {
    fa: {
        brand: "اس‌وی‌جی گالری",
        title: "بهترین لوگوهای SVG جهان را کشف کنید",
        subtitle: "گرافیک‌های برداری با کیفیت بالا و مقیاس‌پذیر برای پروژه بعدی شما",
        searchPlaceholder: "جستجوی لوگو...",
        footer: "© 1403 تمامی حقوق محفوظ است.",
        langBtnText: "English"
    },
    en: {
        brand: "SVG Gallery",
        title: "Discover the World’s Best SVG Logos",
        subtitle: "High-quality, scalable vector graphics for your next project",
        searchPlaceholder: "Search logos...",
        footer: "© 2025 All rights reserved.",
        langBtnText: "فارسی"
    }
};

// --- لیست لوگوها ---
const logos = [
    { name: { fa: "افق استودیو", en: "Ofoq Studio" }, fileName: "Logo Ofoq Studio.svg" },
    { name: { fa: "گوگل", en: "Google" }, fileName: "google.svg" },
    { name: { fa: "مایکروسافت", en: "Microsoft" }, fileName: "microsoft.svg" },
    { name: { fa: "اسپاتیفای", en: "Spotify" }, fileName: "spotify.svg" },
    { name: { fa: "نایک", en: "Nike" }, fileName: "nike.svg" },
    { name: { fa: "توییتر", en: "Twitter" }, fileName: "twitter.svg" },
    { name: { fa: "آمازون", en: "Amazon" }, fileName: "amazon.svg" },
    { name: { fa: "گیت‌هاب", en: "GitHub" }, fileName: "github.svg" },
];

let currentLang = 'fa';

// عناصر DOM
const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('searchInput');
const langBtn = document.getElementById('langBtn');
const htmlTag = document.documentElement;

// --- تابع تغییر زبان ---
function toggleLanguage() {
    currentLang = currentLang === 'fa' ? 'en' : 'fa';
    updateContent();
    
    // تغییر جهت و فونت
    if(currentLang === 'en') {
        htmlTag.setAttribute('dir', 'ltr');
        document.body.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    } else {
        htmlTag.setAttribute('dir', 'rtl');
        document.body.style.fontFamily = "'Vazirmatn', sans-serif";
    }
}

// --- آپدیت متون ---
function updateContent() {
    const t = translations[currentLang];
    
    // آپدیت متن‌های ساده
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (t[key]) el.textContent = t[key];
    });

    searchInput.placeholder = t.searchPlaceholder;
    langBtn.textContent = t.langBtnText;
    
    // رندر مجدد لوگوها (برای تغییر احتمالی اسم اگر بخواهید اسم نمایش دهید)
    renderLogos(logos);
}

// --- ساخت کارت‌ها ---
function renderLogos(items) {
    gallery.innerHTML = '';
    
    items.forEach(logo => {
        const card = document.createElement('div');
        card.className = 'card';
        const filePath = `logos/${logo.fileName}`;
        const name = logo.name[currentLang];

        // ساختار کارت: تصویر وسط، دکمه دانلود گوشه پایین
        card.innerHTML = `
            <img src="${filePath}" alt="${name}" title="${name}" onerror="this.src='https://via.placeholder.com/100?text=SVG'">
            
            <a href="${filePath}" download="${logo.fileName}" class="card-download" title="Download">
                <i class="fas fa-arrow-down"></i>
            </a>
        `;
        gallery.appendChild(card);
    });
}

// --- رویدادها ---
langBtn.addEventListener('click', toggleLanguage);

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = logos.filter(logo => 
        logo.name.fa.includes(term) || logo.name.en.toLowerCase().includes(term)
    );
    renderLogos(filtered);
});

// اجرای اولیه
renderLogos(logos);
