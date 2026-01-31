let allData = [];
let displayData = [];
let pIndex = 1;
let pSize = 10;
let sortAsc = true;
let lastSort = '';

// HÀM QUAN TRỌNG NHẤT: Bóc tách mọi loại rác trong URL ảnh
function cleanImages(images) {
    if (!images) return ['https://via.placeholder.com/70'];

    let arr = [];
    if (Array.isArray(images)) {
        arr = images.slice();
    } else if (typeof images === 'string') {
        const str = images.trim();
        try {
            const parsed = JSON.parse(str);
            if (Array.isArray(parsed)) arr = parsed;
            else arr = [parsed];
        } catch (e) {
            // fallback: CSV hoặc đơn 1 URL
            if (str.includes(',')) arr = str.split(',').map(s => s.trim());
            else arr = [str];
        }
    } else {
        arr = [String(images)];
    }

    return arr
        .map(url => (typeof url === 'string' ? url.replace(/[\[\]\"]/g, "").trim() : String(url)))
        .filter(url => url !== "");
}

async function fetchAll() {
    try {
        const response = await fetch("https://api.escuelajs.co/api/v1/products");
        const json = await response.json();
        
        // Dọn dẹp dữ liệu ngay khi tải về
        allData = json.map(item => ({
            ...item,
            images: cleanImages(item.images)
        }));
        
        displayData = [...allData];
        render();
    } catch (err) {
        console.error("API Error:", err);
    }
}

function render() {
    const start = (pIndex - 1) * pSize;
    const end = start + parseInt(pSize);
    const pageItems = displayData.slice(start, end);

    document.getElementById('contentBody').innerHTML = pageItems.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>
                <div class="gallery">
                    ${item.images.map(url => `
                        <img src="${url}" alt="${(item.title||'image').replace(/"/g,'')}" loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/70?text=Error'">
                    `).join('')}
                </div>
            </td>
            <td><strong>${item.title}</strong></td>
            <td>${item.price.toLocaleString()}</td>
            <td class="desc-cell">
                XEM CHI TIẾT
                <div class="desc-popup">${item.description}</div>
            </td>
        </tr>
    `).join('');
    
    renderPagination();
}

function onSearch() {
    const key = document.getElementById('inpSearch').value.toLowerCase();
    displayData = allData.filter(i => i.title.toLowerCase().includes(key));
    pIndex = 1;
    render();
}

function onSort(key) {
    if (lastSort === key) sortAsc = !sortAsc;
    else { lastSort = key; sortAsc = true; }
    
    displayData.sort((a, b) => {
        let vA = a[key], vB = b[key];
        if (typeof vA === 'string') return sortAsc ? vA.localeCompare(vB) : vB.localeCompare(vA);
        return sortAsc ? vA - vB : vB - vA;
    });
    render();
}

function renderPagination() {
    const total = Math.ceil(displayData.length / pSize);
    const box = document.getElementById('pagBox');
    box.innerHTML = '';
    
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= pIndex - 2 && i <= pIndex + 2)) {
            const btn = document.createElement('button');
            btn.innerText = i;
            if (i === pIndex) btn.className = 'active';
            btn.onclick = () => { pIndex = i; render(); };
            box.appendChild(btn);
        }
    }
}

function onChangeSize() {
    pSize = parseInt(document.getElementById('selSize').value) || 10;
    pIndex = 1;
    render();
}

window.onload = fetchAll;