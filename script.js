// ==========================================
// تنظیمات اتصال به گیت‌هاب
// ==========================================
const GITHUB_USERNAME = "armvnhs";   // نام کاربری شما
const REPO_NAME = "LogoBox";        // نام مخزنی که می‌سازید (دقیق وارد کنید)
const FOLDER_NAME = "logos";         // نام پوشه لوگوها
// ==========================================

const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('searchInput');
let allLogos = [];

async function fetchLogos() {
    const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FOLDER_NAME}`;

    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            if(response.status === 404) throw new Error("پوشه یا مخزن پیدا نشد. نام‌ها را چک کنید.");
            if(response.status === 403) throw new Error("محدودیت درخواست گیت‌هاب. کمی صبر کنید.");
            throw new Error("خطا در ارتباط با سرور");
        }

        const data = await response.json();

        // فیلتر کردن و آماده‌سازی داده‌ها
        allLogos = data
            .filter(file => file.name.endsWith('.svg')) // فقط فایل‌های SVG
            .map(file => {
                // تبدیل نام فایل "brand-name.svg" به "Brand Name"
                let cleanName = file.name.replace('.svg', '').replace(/[-_]/g, ' ');
                // بزرگ کردن حرف اول کلمات (اختیاری برای زیبایی)
                cleanName = cleanName.replace(/\b\w/g, l => l.toUpperCase());

                return {
                    name: cleanName,
                    downloadUrl: file.download_url
                };
            });

        renderGallery(allLogos);

    } catch (error) {
        gallery.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: red; padding: 20px;">
                <p>⚠️ خطا: ${error.message}</p>
                <small>لطفاً مطمئن شوید نام مخزن <b>${REPO_NAME}</b> و نام پوشه <b>${FOLDER_NAME}</b> در گیت‌هاب درست است.</small>
            </div>
        `;
        console.error(error);
    }
}

function renderGallery(logos) {
    gallery.innerHTML = '';

    if (logos.length === 0) {
        gallery.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">هیچ لوگویی پیدا نشد.</p>';
        return;
    }

    logos.forEach(logo => {
        // ایجاد کارت لینک‌دار (کل کارت لینک دانلود است)
        const card = document.createElement('a');
        card.href = logo.downloadUrl;
        card.className = 'card';
        card.setAttribute('download', ''); // پیشنهاد دانلود به مرورگر
        card.target = "_blank"; // باز شدن در تب جدید (گاهی برای دانلود لازم است)

        card.innerHTML = `
            <img src="${logo.downloadUrl}" alt="${logo.name}" loading="lazy">
            <div class="card-title">${logo.name}</div>
            <div class="download-hint">دانلود <i class="fas fa-arrow-down"></i></div>
        `;

        gallery.appendChild(card);
    });
}

// قابلیت جستجو
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredLogos = allLogos.filter(logo => 
        logo.name.toLowerCase().includes(searchTerm)
    );
    renderGallery(filteredLogos);
});

// شروع برنامه
fetchLogos();
