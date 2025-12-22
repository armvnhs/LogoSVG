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


// ==========================================
// منطق مودال (ارسال لوگو)
// ==========================================
const modal = document.getElementById('uploadModal');

// مدیریت باز و بسته کردن مودال
function openModal() {
    document.getElementById('uploadModal').classList.add('active');
}

function closeModal() {
    document.getElementById('uploadModal').classList.remove('active');
    // پاک کردن فرم بعد از بستن (اختیاری)
    document.getElementById('uploadForm').reset();
    document.getElementById('fileNameText').innerText = "انتخاب فایل SVG";
    document.getElementById('dropZone').style.borderColor = "#ccc";
}

// بستن مودال با کلیک روی فضای بیرون
window.onclick = function(event) {
    const modal = document.getElementById('uploadModal');
    if (event.target == modal) {
        closeModal();
    }
}

// --------------------------------------------------
// بخش جدید: نمایش نام فایل و ارسال بدون رفرش (AJAX)
// --------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileNameText = document.getElementById('fileNameText');
    const dropZone = document.getElementById('dropZone');
    const uploadForm = document.getElementById('uploadForm');
    const submitBtn = document.getElementById('submitBtn');

    // 1. نمایش نام فایل انتخاب شده
    if(fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                fileNameText.innerText = this.files[0].name;
                dropZone.style.borderColor = "#4CAF50"; // سبز شدن کادر
                dropZone.style.backgroundColor = "#e8f5e9";
            } else {
                fileNameText.innerText = "انتخاب فایل SVG";
                dropZone.style.borderColor = "#ccc";
                dropZone.style.backgroundColor = "#fafafa";
            }
        });
    }

    // 2. مدیریت ارسال فرم (جلوگیری از صفحه 404)
    if(uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault(); // جلوگیری از رفرش صفحه

            // تغییر دکمه به حالت "در حال ارسال..."
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = "در حال ارسال...";
            submitBtn.disabled = true;

            const formData = new FormData(uploadForm);

            fetch(uploadForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    // موفقیت
                    alert("✅ لوگوی شما با موفقیت ارسال شد و پس از بررسی اضافه خواهد شد.");
                    closeModal();
                } else {
                    // خطا
                    alert("❌ مشکلی در ارسال پیش آمد. لطفاً دوباره تلاش کنید.");
                }
            })
            .catch(error => {
                alert("❌ خطای شبکه. لطفاً اتصال اینترنت خود را بررسی کنید.");
            })
            .finally(() => {
                // برگرداندن دکمه به حالت اول
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            });
        });
    }
});
