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

/* ================================================
   مدیریت کامل مودال و فرم (نسخه نهایی و سالم)
   ================================================ */

// 1. تابع باز و بسته کردن مودال
function toggleModal(shouldShow) {
    const modal = document.getElementById('customModal');
    if (!modal) return;

    if (shouldShow) {
        modal.classList.add('show');
    } else {
        modal.classList.remove('show');
        // پاکسازی فرم موقع بستن (اختیاری)
        setTimeout(() => {
            resetForm();
        }, 300);
    }
}

// بستن مودال اگر کاربر بیرون باکس کلیک کرد
window.addEventListener('click', function(e) {
    const modal = document.getElementById('customModal');
    if (e.target === modal) {
        toggleModal(false);
    }
});

// 2. تنظیم دکمه هدر برای باز کردن مودال
// وقتی صفحه لود شد، دکمه هدر را پیدا کن و به تابع وصل کن
document.addEventListener('DOMContentLoaded', () => {
    // کلاس دکمه هدر شما طبق عکس‌هایی که فرستادید
    const headerBtn = document.querySelector('.header-btn'); 
    
    // یا اگر دکمه شما آیدی دارد، اینجا وارد کنید
    // const headerBtn = document.getElementById('MY_BUTTON_ID');

    if (headerBtn) {
        headerBtn.onclick = function(e) {
            e.preventDefault(); // جلوگیری از لینک شدن
            toggleModal(true);
        };
    }
});

// 3. نمایش نام فایل پس از انتخاب
const realFileBtn = document.getElementById('realFileBtn');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const uploadDropZone = document.getElementById('uploadDropZone');
const uploadIcon = document.getElementById('uploadIcon');

if (realFileBtn) {
    realFileBtn.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            // فایل انتخاب شده
            fileNameDisplay.innerText = this.files[0].name;
            uploadDropZone.classList.add('has-file');
            uploadIcon.innerText = "✅"; // تغییر آیکون به تیک
        } else {
            resetForm();
        }
    });
}

function resetForm() {
    const form = document.getElementById('submissionForm');
    if (form) form.reset();
    
    if (fileNameDisplay) fileNameDisplay.innerText = "برای انتخاب فایل کلیک کنید";
    if (uploadDropZone) uploadDropZone.classList.remove('has-file');
    if (uploadIcon) uploadIcon.innerText = "📂";
}

// 4. ارسال فرم به صورت AJAX (بدون رفرش صفحه)
const form = document.getElementById('submissionForm');
const finalBtn = document.getElementById('finalBtn');

if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // مهم: جلوگیری از رفرش و رفتن به صفحه دیگر

        // تغییر ظاهر دکمه
        const originalText = finalBtn.innerText;
        finalBtn.innerText = "⏳ در حال ارسال...";
        finalBtn.disabled = true;

        // آماده‌سازی داده‌ها
        const formData = new FormData(form);

        // ارسال به سرور
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                alert("🎉 لوگوی شما با موفقیت ارسال شد!");
                toggleModal(false); // بستن مودال
            } else {
                alert("❌ خطا در ارسال. لطفاً دوباره تلاش کنید.");
            }
        })
        .catch(error => {
            console.error(error);
            alert("❌ خطای اینترنت. لطفاً اتصال خود را بررسی کنید.");
        })
        .finally(() => {
            // برگرداندن دکمه به حالت اول
            finalBtn.innerText = originalText;
            finalBtn.disabled = false;
        });
    });
}
