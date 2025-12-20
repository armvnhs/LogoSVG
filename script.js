const GITHUB_USERNAME = "armvnhs"; // نام کاربری گیت‌هاب شما
const REPO_NAME = "LogoBox";      // نام مخزن (مثلاً my-website)
// ==========================================

const translations = {
    fa: {
        brand: "اس‌وی‌جی گالری",
        title: "بهترین لوگوهای SVG جهان را کشف کنید",
        subtitle: "گرافیک‌های برداری با کیفیت بالا و مقیاس‌پذیر برای پروژه بعدی شما",
        searchPlaceholder: "جستجوی لوگو...",
        footer: "© 1403 تمامی حقوق محفوظ است.",
        langBtnText: "English",
        loading: "در حال دریافت لوگوها..."
    },
    en: {
        brand: "SVG Gallery",
        title: "Discover the World’s Best SVG Logos",
        subtitle: "High-quality, scalable vector graphics for your next project",
        searchPlaceholder: "Search logos...",
        footer: "© 2025 All rights reserved.",
        langBtnText: "فارسی",
        loading: "Loading logos..."
    }
};

let currentLang = 'fa';
let allLogos = []; // لیست لوگوها اینجا ذخیره می‌شود

// عناصر DOM
const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('searchInput');
const langBtn = document.getElementById('langBtn');
const htmlTag = document.documentElement;

// --- تابع اصلی: دریافت اتوماتیک فایل‌ها از گیت‌هاب ---
async function fetchLogosFromGitHub() {
    gallery.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888;">${translations[currentLang].loading}</p>`;
    
    try {
        // درخواست به API گیت‌هاب برای گرفتن لیست فایل‌های پوشه logos
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/logos`);
        
        if (!response.ok) throw new Error("Connection Error");
        
        const data = await response.json();

        // تبدیل داده‌های خام گیت‌هاب به فرمت مورد نیاز ما
        allLogos = data
            .filter(file => file.name.endsWith('.svg')) // فقط فایل‌های svg
            .map(file => {
                // پاک کردن پسوند .svg و زیبا کردن متن (مثلاً google-cloud -> Google Cloud)
                const rawName = file.name.replace('.svg', '').replace(/-/g, ' ');
                const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

                return {
                    name: formattedName, // اسم لوگو از روی اسم فایل برداشته می‌شود
                    fileName: file.name,
                    downloadUrl: file.download_url // لینک دانلود مستقیم از گیت‌هاب
                };
            });

        renderLogos(allLogos);

    } catch (error) {
        console.error(error);
        gallery.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: red;">Error loading logos. Check username/repo name.</p>`;
    }
}

// --- تابع تغییر زبان ---
function toggleLanguage() {
    currentLang = currentLang === 'fa' ? 'en' : 'fa';
    updateContent();
    
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
    
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (t[key]) el.textContent = t[key];
    });

    searchInput.placeholder = t.searchPlaceholder;
    langBtn.textContent = t.langBtnText;
    
    // اگر لوگوها لود شده‌اند دوباره رندر کن (شاید بخواهیم بعدا منطق زبان را روی اسم‌ها هم اعمال کنیم)
    if(allLogos.length > 0) renderLogos(allLogos);
}

// --- ساخت کارت‌ها ---
function renderLogos(items) {
    gallery.innerHTML = '';
    
    items.forEach(logo => {
        const card = document.createElement('div');
        card.className = 'card';
        // مسیر مستقیم فایل از گیت‌هاب
        const filePath = `logos/${logo.fileName}`; 

        card.innerHTML = `
            <img src="${filePath}" alt="${logo.name}" title="${logo.name}" loading="lazy">
            <div class="card-title" style="position: absolute; bottom: -30px; opacity: 0;">${logo.name}</div>
            
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
    const filtered = allLogos.filter(logo => 
        logo.name.toLowerCase().includes(term)
    );
    renderLogos(filtered);
});

// شروع برنامه
fetchLogosFromGitHub();
