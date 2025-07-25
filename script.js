let images = [];
let currentMode = null;
let currentPage = 0;
let zoom = 1;
let isDark = false;
let sidebarWasOpen = false;
let isPanelHidden = false;

const moonSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
const sunSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
const fullscreenSVG = '<svg width="16px" height="16px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" class="bi bi-fullscreen"> <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/> </svg>';
const exitFullscreenSVG = '<svg width="16px" height="16px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" class="bi bi-fullscreen-exit"> <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5V.5a.5.5 0 0 1 .5-.5zM10 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM10 10.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 1 0v4A1.5 1.5 0 0 1 14.5 13h-4a.5.5 0 0 1-.5-.5z"/> </svg>';
const fitToPageSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M3 3l18 18"></path><path d="M3 21L21 3"></path></svg>';

const viewer = document.getElementById('viewer');
const fileInput = document.getElementById('file-input');
const imageInput = document.getElementById('image-input');
const folderInput = document.getElementById('folder-input');
const controlsNav = document.getElementById('controls-nav');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const themeToggle = document.getElementById('theme-toggle');
const fullscreenToggle = document.getElementById('fullscreen-toggle');
const fitToPage = document.getElementById('fit-to-page');
const header = document.querySelector('header');

themeToggle.innerHTML = moonSVG;
fullscreenToggle.innerHTML = fullscreenSVG;
fitToPage.innerHTML = fitToPageSVG;

document.getElementById('upload').addEventListener('click', () => {
    fileInput.click();
});

document.getElementById('upload-image').addEventListener('click', () => {
    imageInput.click();
});

document.getElementById('select-folder').addEventListener('click', () => {
    folderInput.click();
});

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const zip = new JSZip();
    const content = await zip.loadAsync(file);
    const newImages = [];

    for (const filename in content.files) {
        const zipFile = content.files[filename];
        if (!zipFile.dir && /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)) {
            const blob = await zipFile.async('blob');
            const url = URL.createObjectURL(blob);
            newImages.push({ url, filename });
        }
    }

    newImages.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));

    images.push(...newImages.map(i => i.url));

    fileInput.value = '';

    // Refresh view if in a mode
    if (currentMode === 'scroll') {
        setMode('scroll');
    } else if (currentMode === 'page') {
        showPage(currentPage);
    }

    if (sidebar.style.display === 'block') {
        buildThumbnails();
    }
});

imageInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const newImages = [];

    for (const file of files) {
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)) {
            const url = URL.createObjectURL(file);
            newImages.push({ url, filename: file.name });
        }
    }

    newImages.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));

    images.push(...newImages.map(i => i.url));

    imageInput.value = '';

    // Refresh view if in a mode
    if (currentMode === 'scroll') {
        setMode('scroll');
    } else if (currentMode === 'page') {
        showPage(currentPage);
    }

    if (sidebar.style.display === 'block') {
        buildThumbnails();
    }
});

folderInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const newImages = [];

    for (const file of files) {
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)) {
            const url = URL.createObjectURL(file);
            newImages.push({ url, filename: file.name });
        }
    }

    newImages.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));

    images.push(...newImages.map(i => i.url));

    folderInput.value = '';

    // Refresh view if in a mode
    if (currentMode === 'scroll') {
        setMode('scroll');
    } else if (currentMode === 'page') {
        showPage(currentPage);
    }

    if (sidebar.style.display === 'block') {
        buildThumbnails();
    }
});

document.getElementById('scroll').addEventListener('click', () => {
    setMode('scroll');
});

document.getElementById('page-turn').addEventListener('click', () => {
    setMode('page');
});

sidebarToggle.addEventListener('click', () => {
    if (sidebar.style.display === 'block') {
        sidebar.style.display = 'none';
    } else {
        sidebar.style.display = 'block';
        buildThumbnails();
    }
});

themeToggle.addEventListener('click', () => {
    isDark = !isDark;
    document.body.classList.toggle('dark', isDark);
    themeToggle.innerHTML = isDark ? sunSVG : moonSVG;
});

fullscreenToggle.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        sidebarWasOpen = sidebar.style.display === 'block';
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
});

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        header.style.display = 'none';
        controlsNav.style.display = 'none';
        sidebar.style.display = 'none';
        fullscreenToggle.innerHTML = exitFullscreenSVG;
    } else {
        header.style.display = isPanelHidden ? 'none' : 'flex';
        controlsNav.style.display = isPanelHidden ? 'none' : (currentMode ? 'block' : 'none');
        if (sidebarWasOpen) {
            sidebar.style.display = 'block';
        }
        fullscreenToggle.innerHTML = fullscreenSVG;
    }
});

fitToPage.addEventListener('click', () => {
    if (currentMode === 'page') {
        const img = viewer.querySelector('img');
        if (img) {
            const viewerW = viewer.clientWidth;
            const viewerH = viewer.clientHeight;
            const zoomW = viewerW / img.naturalWidth;
            const zoomH = viewerH / img.naturalHeight;
            zoom = Math.min(zoomW, zoomH);
            document.documentElement.style.setProperty('--zoom', zoom);
        }
    } else if (currentMode === 'scroll') {
        let maxWidth = 0;
        const imgs = viewer.querySelectorAll('img');
        imgs.forEach(img => {
            if (img.naturalWidth > maxWidth) maxWidth = img.naturalWidth;
        });
        if (maxWidth > 0) {
            zoom = viewer.clientWidth / maxWidth;
            document.documentElement.style.setProperty('--zoom', zoom);
        }
    }
});

document.getElementById('save-pdf').addEventListener('click', async () => {
    if (images.length === 0) return;

    const { jsPDF } = window.jspdf;
    const maxPagesPerFile = 200; // Adjust this value based on testing
    const numParts = Math.ceil(images.length / maxPagesPerFile);

    for (let part = 0; part < numParts; part++) {
        const start = part * maxPagesPerFile;
        const end = Math.min(start + maxPagesPerFile, images.length);
        const partImages = images.slice(start, end);

        let doc = null;
        const pdfWidth = 595; // Standard A4 width in pt

        for (let i = 0; i < partImages.length; i++) {
            const img = new Image();
            img.src = partImages[i];
            await new Promise((resolve) => {
                img.onload = resolve;
            });

            const imgWidth = img.width;
            const imgHeight = img.height;
            const pdfHeight = (imgHeight / imgWidth) * pdfWidth;
            const orientation = pdfHeight > pdfWidth ? 'portrait' : 'landscape';

            if (i === 0) {
                doc = new jsPDF({
                    orientation: orientation,
                    unit: 'pt',
                    format: [pdfWidth, pdfHeight]
                });
            } else {
                doc.addPage([pdfWidth, pdfHeight], orientation);
            }

            doc.addImage(img, 'JPEG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
        }

        const partName = numParts > 1 ? `_part${part + 1}` : '';
        doc.save(`manga${partName}.pdf`);
    }
});

document.getElementById('clear').addEventListener('click', () => {
    images.forEach(url => URL.revokeObjectURL(url));
    images = [];
    zoom = 1;
    document.documentElement.style.setProperty('--zoom', zoom);
    setMode(null);
    sidebar.innerHTML = '';
    sidebar.style.display = 'none';
});

viewer.addEventListener('wheel', (e) => {
    if (e.ctrlKey && currentMode) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        zoom = Math.max(0.1, Math.min(3, zoom + delta));
        document.documentElement.style.setProperty('--zoom', zoom);
    }
}, { passive: false });

viewer.addEventListener('click', handleClick);

document.getElementById('prev').addEventListener('click', () => {
    if (currentMode === 'page') {
        showPage(currentPage - 1);
    }
});

document.getElementById('next').addEventListener('click', () => {
    if (currentMode === 'page') {
        showPage(currentPage + 1);
    }
});

document.getElementById('zoom-in').addEventListener('click', () => {
    zoom = Math.min(3, zoom + 0.1);
    document.documentElement.style.setProperty('--zoom', zoom);
});

document.getElementById('zoom-out').addEventListener('click', () => {
    zoom = Math.max(0.1, zoom - 0.1);
    document.documentElement.style.setProperty('--zoom', zoom);
});

function handleClick(e) {
    const rect = viewer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const centerStart = width * 0.4;
    const centerEnd = width * 0.6;

    if (x > centerStart && x < centerEnd) {
        togglePanel();
    } else if (currentMode === 'page') {
        if (x <= centerStart) {
            showPage(currentPage - 1);
        } else {
            showPage(currentPage + 1);
        }
    }
}

function togglePanel() {
    isPanelHidden = !isPanelHidden;
    header.style.display = isPanelHidden ? 'none' : 'flex';
    controlsNav.style.display = isPanelHidden ? 'none' : (currentMode ? 'block' : 'none');
}

function setMode(mode) {
    viewer.innerHTML = '';
    currentMode = mode;
    zoom = 1;
    document.documentElement.style.setProperty('--zoom', zoom);
    viewer.classList.remove('scroll-mode', 'page-mode');
    controlsNav.style.display = 'none';

    if (mode === 'scroll') {
        document.getElementById('prev').style.display = 'none';
        document.getElementById('next').style.display = 'none';
        document.getElementById('zoom-out').style.display = 'inline-block';
        document.getElementById('zoom-in').style.display = 'inline-block';
        document.getElementById('fit-to-page').style.display = 'inline-block';
        controlsNav.style.display = 'block';
        viewer.classList.add('scroll-mode');
        images.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            viewer.appendChild(img);
        });
    } else if (mode === 'page') {
        document.getElementById('prev').style.display = 'inline-block';
        document.getElementById('next').style.display = 'inline-block';
        document.getElementById('zoom-out').style.display = 'inline-block';
        document.getElementById('zoom-in').style.display = 'inline-block';
        document.getElementById('fit-to-page').style.display = 'inline-block';
        controlsNav.style.display = 'block';
        showPage(0);
    } else {
        document.getElementById('prev').style.display = 'none';
        document.getElementById('next').style.display = 'none';
        document.getElementById('zoom-out').style.display = 'none';
        document.getElementById('zoom-in').style.display = 'none';
        document.getElementById('fit-to-page').style.display = 'none';
    }
}

function showPage(page) {
    if (page < 0 || page >= images.length) return;
    currentPage = page;
    viewer.innerHTML = '';
    const img = new Image();
    img.src = images[page];

    const calculateZoom = () => {
        const viewerW = viewer.clientWidth;
        zoom = Math.min(1, viewerW / img.naturalWidth);
        document.documentElement.style.setProperty('--zoom', zoom);
    };

    if (img.complete) {
        calculateZoom();
    } else {
        img.onload = calculateZoom;
    }

    viewer.appendChild(img);

    // Highlight selected thumbnail
    const thumbs = sidebar.querySelectorAll('.thumb');
    thumbs.forEach(t => t.classList.remove('selected'));
    const selectedThumb = sidebar.querySelector(`.thumb[data-page="${page}"]`);
    if (selectedThumb) {
        selectedThumb.classList.add('selected');
    }
}

function buildThumbnails() {
    sidebar.innerHTML = '';
    images.forEach((url, i) => {
        const div = document.createElement('div');
        div.className = 'thumb';
        div.dataset.page = i;
        const img = document.createElement('img');
        img.src = url;
        div.appendChild(img);
        const span = document.createElement('span');
        span.textContent = i + 1;
        div.appendChild(span);
        div.addEventListener('click', () => {
            setMode('page');
            showPage(i);
        });
        sidebar.appendChild(div);
    });

    // Highlight current page if in page mode
    if (currentMode === 'page') {
        const selectedThumb = sidebar.querySelector(`.thumb[data-page="${currentPage}"]`);
        if (selectedThumb) {
            selectedThumb.classList.add('selected');
        }
    }
}