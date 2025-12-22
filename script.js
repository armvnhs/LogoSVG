// ==========================================
// تنظیمات اتصال به گیت‌هاب
// ==========================================
const GITHUB_USERNAME = "armvnhs";   // نام کاربری شما
const REPO_NAME = "LogoBox";         // نام مخزن (Repo)
const FOLDER_NAME = "logos";         // نام پوشه لوگوها
// ==========================================

const gridContainer = document.getElementById('logosGrid');
const searchInput = document.getElementById('searchInput');

// متغیری برای ذخیره لیست لوگوها بعد از دریافت از گیت‌هاب
let allLogoFiles = [];

// 1. دریافت لیست فایل‌ها از API گیت‌هاب
async function fetchLogos() {
    const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FOLDER_NAME}`;
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('مشکل در ارتباط با گیت‌هاب');
        
        const data = await response.json();
        
        // فیلتر کردن فقط فایل‌های SVG
        allLogoFiles = data
            .filter(file => file.name.endsWith('.svg'))
            .map(file => file.name);

        // نمایش اولیه لوگوها
        renderLogos('');
        
    } catch (error) {
        console.error('Error fetching logos:', error);
        gridContainer.innerHTML = `<p style="text-align:center; width:100%;">خطا در بارگذاری لوگوها. لطفا مطمئن شوید نام ریپازیتوری و پوشه درست است.</p>`;
    }
}

// 2. تابع ساخت کارت‌ها در صفحه
function renderLogos(filterText = '') {
    gridContainer.innerHTML = ''; // پاک کردن گرید قبل از رندر جدید

    const filteredLogos = allLogoFiles.filter(fileName => {
        const brandName = fileName.replace('.svg', '').replace(/-/g, ' ');
        return brandName.toLowerCase().includes(filterText.toLowerCase());
    });

    if (filteredLogos.length === 0 && allLogoFiles.length > 0) {
        gridContainer.innerHTML = '<p style="text-align:center; width:100%;">لوگویی پیدا نشد.</p>';
        return;
    }

    filteredLogos.forEach(fileName => {
        // حذف اکستنشن .svg برای نمایش نام تمیز
        const brandName = fileName.replace('.svg', '').replace(/-/g, ' ');
        createCard(fileName, brandName);
    });
}

// 3. ساخت المان HTML هر کارت
function createCard(fileName, brandName) {
    const card = document.createElement('div');
    card.className = 'card';

    // مسیر فایل (چون روی گیت‌هاب پیج هستید، مسیر نسبی کار می‌کند)
    const filePath = `${FOLDER_NAME}/${fileName}`;

    card.innerHTML = `
        <img src="${filePath}" alt="${brandName}" class="logo-img" loading="lazy">
        <div class="brand-name">${brandName}</div>
        
        <!-- لایه هاور (برای دانلود) -->
        <div class="card-overlay">
            <a href="${filePath}" download="${fileName}" class="download-btn">
                <span class="material-symbols-outlined" style="font-size:16px;">download</span> SVG
            </a>
            <button class="download-btn" onclick="downloadAsPng('${filePath}', '${fileName}')">
                <span class="material-symbols-outlined" style="font-size:16px;">image</span> PNG
            </button>
        </div>
    `;

    gridContainer.appendChild(card);
}

// 4. تبدیل SVG به PNG و دانلود (بدون نیاز به سرور)
function downloadAsPng(svgUrl, fileName) {
    fetch(svgUrl)
        .then(response => response.text())
        .then(svgText => {
            const img = new Image();
            // ساخت Blob برای امنیت و سرعت
            const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            img.onload = function () {
                const canvas = document.createElement('canvas');
                // سایز خروجی PNG (کیفیت بالا)
                const size = 1000; 
                canvas.width = size;
                canvas.height = (img.height / img.width) * size;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // دانلود فایل
                const pngUrl = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = fileName.replace('.svg', '.png');
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);

                URL.revokeObjectURL(url);
            };

            img.src = url;
        })
        .catch(err => console.error('Error converting SVG to PNG:', err));
}

// 5. گوش دادن به ورودی جستجو
searchInput.addEventListener('input', (e) => {
    renderLogos(e.target.value);
});

// شروع برنامه
fetchLogos();

/* =========================================
   مدیریت مودال و ارسال فرم (نسخه نهایی)
   ========================================= */

// 1. باز و بسته کردن مودال
function toggleModal(show) {
    const modal = document.getElementById('uploadModal');
    if (show) {
        modal.classList.add('active');
    } else {
        modal.classList.remove('active');
        // پاکسازی فرم موقع بستن
        document.getElementById('logoForm').reset();
        resetUploadBox();
    }
}

// بستن با کلیک بیرون
window.onclick = function(event) {
    const modal = document.getElementById('uploadModal');
    if (event.target == modal) {
        toggleModal(false);
    }
}

// اتصال دکمه هدر به تابع باز کردن (جهت اطمینان)
document.addEventListener('DOMContentLoaded', () => {
    const headerBtn = document.querySelector('.header-btn'); // کلاس دکمه هدر
    if(headerBtn) {
        headerBtn.onclick = function() { toggleModal(true); };
    }
});

// 2. تغییر ظاهر وقتی فایل انتخاب شد
const realFileInput = document.getElementById('realFileInput');
const uploadText = document.getElementById('uploadText');
const uploadBox = document.getElementById('uploadBox');

if (realFileInput) {
    realFileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            // نام فایل را نشان بده
            uploadText.innerText = "✅ فایل انتخاب شد: " + this.files[0].name;
            uploadBox.style.borderColor = "green";
            uploadBox.style.background = "#e6fffa";
        } else {
            resetUploadBox();
        }
    });
}

function resetUploadBox() {
    if(uploadText) uploadText.innerText = "برای انتخاب فایل کلیک کنید";
    if(uploadBox) {
        uploadBox.style.borderColor = "#ccc";
        uploadBox.style.background = "#fafafa";
    }
}

// 3. ارسال فرم بدون رفرش (AJAX)
const form = document.getElementById('logoForm');
const btn = document.getElementById('finalSubmitBtn');

if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // جلوگیری از رفرش صفحه

        // تغییر دکمه به حالت لودینگ
        const originalText = btn.innerText;
        btn.innerText = "⏳ در حال آپلود...";
        btn.disabled = true;
        btn.style.opacity = "0.7";

        const formData = new FormData(form);

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                alert("🎉 عالی! لوگوی شما با موفقیت ارسال شد.");
                toggleModal(false); // بستن مودال
            } else {
                alert("❌ خطا در ارسال. لطفاً دوباره تلاش کنید.");
            }
        })
        .catch(error => {
            alert("❌ خطای شبکه. اینترنت خود را چک کنید.");
            console.error('Error:', error);
        })
        .finally(() => {
            // برگرداندن دکمه به حالت اول
            btn.innerText = originalText;
            btn.disabled = false;
            btn.style.opacity = "1";
        });
    });
}

