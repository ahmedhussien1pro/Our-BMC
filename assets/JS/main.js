import { SECTIONS, canvasData as initialData } from './data.js';

let canvasData = { ...initialData };
let state = {
  editMode: false,
  darkMode: false,
  sidebarOpen: false,
  currentSection: null,
  currentIndex: -1,
  action: null, // 'edit' or 'reset'
};

const API_URL = 'http://localhost:3000';
let currentColorSection = null;

async function init() {
  loadTheme();
  renderCanvas();
  setTimeout(() => {
    ensureDataFromDB();
  }, 1000);
}
init();

// ---------- RENDER ----------
function renderCanvas() {
  const grid = document.getElementById('canvasGrid');
  grid.innerHTML = SECTIONS.map((section) => {
    return `
      <div class="section-card ${section.col} ${section.row}
        bg-${section.bg || 'white'} dark:bg-dark-800
        rounded-xl shadow-md p-6 border-t-4 border-${
          section.color
        }-600" data-section="${section.id}"
          
           data-section="${section.id}">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <i class="fas fa-${section.icon} text-${section.color}-600"></i>
            ${section.title}
          </h3>
          <div class="flex gap-2">
            ${
              state.editMode
                ? `<button onclick="addItem('${section.id}')"  class="text-${section.color}-600 hover:text-${section.color}-600"><i class="fas fa-plus-circle"></i></button>`
                : ''
            }
            ${
              state.editMode
                ? `<button onclick="openColorPicker('${section.id}')"
                   class="text-${section.color}-500 hover:text-${section.color}-700"
                  ><i class="fas fa-palette"></i></button>`
                : ''
            }
          </div>
        </div>
        <ul id="${section.id}-list"
            class="space-y-1 text-sm text-${
              section.color || 'gray-700'
            } dark:text-gray-300"
            ></ul>
      </div>
    `;
  }).join('');

  SECTIONS.forEach((section) => renderSection(section.id));
  updateEditModeUI();
}

function renderSection(sectionId) {
  const list = document.getElementById(`${sectionId}-list`);
  list.innerHTML = (canvasData[sectionId] || [])
    .map(
      (item, idx) => `
      <li class="flex items-start gap-2 p-1 rounded hover:bg-gray-50 dark:hover:bg-dark-900 transition group">
        <i class="fas fa-circle text-xs mt-1 text-${
          SECTIONS.find((s) => s.id === sectionId).color
        }-500" ></i>
        <span class="flex-1">${item}</span>
        ${
          state.editMode
            ? `
              <div class="opacity-0 group-hover:opacity-100 transition flex gap-1">
                <button onclick="editItem('${sectionId}', ${idx})" class="text-blue-500 hover:text-blue-700"><i class="fas fa-edit"></i></button>
                <button onclick="deleteItem('${sectionId}', ${idx})" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
              </div>
            `
            : ''
        }
      </li>`
    )
    .join('');
}

function updateEditModeUI() {
  document.getElementById('editModeText').textContent = state.editMode
    ? 'Disable Edit Mode'
    : 'Enable Edit Mode';
  document
    .getElementById('canvasGrid')
    .classList.toggle('edit-mode', state.editMode);
}

// ---------- SIDEBAR ----------
window.toggleSidebar = function () {
  state.sidebarOpen = !state.sidebarOpen;
  const sidebar = document.getElementById('sidebar');

  if (state.sidebarOpen) {
    sidebar.classList.remove('sidebar-closed');
    setTimeout(() => {
      document.addEventListener('click', outsideClickListener);
      window.addEventListener('scroll', scrollListener);
    }, 50);
  } else {
    sidebar.classList.add('sidebar-closed');
    document.removeEventListener('click', outsideClickListener);
    window.removeEventListener('scroll', scrollListener);
  }
};

function outsideClickListener(event) {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  if (
    sidebar &&
    !sidebar.contains(event.target) &&
    (!toggleBtn || !toggleBtn.contains(event.target))
  ) {
    closeSidebar();
  }
}

function scrollListener() {
  closeSidebar();
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  state.sidebarOpen = false;
  sidebar.classList.add('sidebar-closed');
  document.removeEventListener('click', outsideClickListener);
  window.removeEventListener('scroll', scrollListener);
}

// ---------- THEME ----------
window.toggleTheme = function () {
  state.darkMode = !state.darkMode;
  document.documentElement.classList.toggle('dark', state.darkMode);
  localStorage.setItem('theme', state.darkMode ? 'dark' : 'light');
  document.getElementById('themeIcon').className = state.darkMode
    ? 'fas fa-sun'
    : 'fas fa-moon';
};

function loadTheme() {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    state.darkMode = true;
    document.documentElement.classList.add('dark');
    document.getElementById('themeIcon').className = 'fas fa-sun';
  }
}

// ---------- EDIT MODE  ----------
window.toggleEditMode = function () {
  if (!state.editMode) {
    state.action = 'edit';
    document.getElementById('passwordModal').classList.remove('hidden');
    document.getElementById('passwordModal').classList.add('flex');
  } else {
    state.editMode = false;
    renderCanvas();
    showNotification('Edit mode disabled', 'info');
  }
};

// ---------- RESET CANVAS ----------
window.resetCanvas = function () {
  state.action = 'reset';
  document.getElementById('passwordModal').classList.remove('hidden');
  document.getElementById('passwordModal').classList.add('flex');
};

// ---------- Verify PASSWORD ----------
window.verifyPassword = async function () {
  const input = document.getElementById('passwordInput').value;
  try {
    const res = await fetch(`${API_URL}/verify-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: input }),
    });
    const data = await res.json();
    if (data.success) {
      if (state.action === 'edit') {
        state.editMode = true;
        renderCanvas();
        showNotification('Edit mode enabled', 'success');
      } else if (state.action === 'reset') {
        performReset();
      }
      closePasswordModal();
    } else {
      showNotification('Wrong password! Only owners can edit/reset', 'error');
    }
  } catch (err) {
    console.error('Password check failed', err);
    showNotification('Server error!', 'error');
  }
};

// ---------- Close PASSWORD MODAL ----------
window.closePasswordModal = function () {
  document.getElementById('passwordModal').classList.add('hidden');
  document.getElementById('passwordInput').value = '';
};

// ---------- Perform Reset ----------
function performReset() {
  canvasData = { ...initialData };
  renderCanvas();
  showNotification('Canvas reset to initial state', 'success');
  setTimeout(() => {
    saveToDB();
  }, 4000);
}

// ---------- ITEMS ----------
window.addItem = function (sectionId) {
  state.currentSection = sectionId;
  state.currentIndex = -1;
  document.getElementById('editModalTitle').textContent = `Add to ${
    SECTIONS.find((s) => s.id === sectionId).title
  }`;
  document.getElementById('editModalInput').value = '';
  document.getElementById('editModal').classList.remove('hidden');
  document.getElementById('editModal').classList.add('flex');
};

window.editItem = function (sectionId, idx) {
  state.currentSection = sectionId;
  state.currentIndex = idx;
  document.getElementById('editModalTitle').textContent = `Edit ${
    SECTIONS.find((s) => s.id === sectionId).title
  }`;
  document.getElementById('editModalInput').value = canvasData[sectionId][idx];
  document.getElementById('editModal').classList.remove('hidden');
  document.getElementById('editModal').classList.add('flex');
};

window.deleteItem = function (sectionId, idx) {
  if (confirm('Are you sure you want to delete this item?')) {
    canvasData[sectionId].splice(idx, 1);
    renderSection(sectionId);
    saveToDB();
    showNotification('Item deleted', 'success');
  }
};

window.saveItem = function () {
  const value = document.getElementById('editModalInput').value.trim();
  if (!value) return showNotification('Please enter a value', 'error');

  if (state.currentIndex === -1) {
    canvasData[state.currentSection].push(value);
  } else {
    canvasData[state.currentSection][state.currentIndex] = value;
  }

  renderCanvas();
  closeEditModal();
  saveToDB();
  showNotification('Changes saved', 'success');
};

window.closeEditModal = function () {
  document.getElementById('editModal').classList.add('hidden');
};

// ---------- COLOR PICKER ----------
window.openColorPicker = function (sectionId) {
  currentColorSection = SECTIONS.find((s) => s.id === sectionId);
  document.getElementById('bgColorInput').value =
    currentColorSection.bg || '#ffffff';
  document.getElementById('itemColorInput').value =
    currentColorSection.color || '#000000';
  document.getElementById('colorModal').classList.remove('hidden');
  document.getElementById('colorModal').classList.add('flex');
};

window.saveColors = function () {
  if (!currentColorSection) return;
  currentColorSection.bg = document.getElementById('bgColorInput').value;
  currentColorSection.color = document.getElementById('itemColorInput').value;
  renderCanvas();
  saveToDB();
  closeColorModal();
  showNotification('Colors updated', 'success');
};

window.closeColorModal = function () {
  document.getElementById('colorModal').classList.add('hidden');
};

// ---------- DATABASE ----------
async function ensureDataFromDB() {
  try {
    const res = await fetch(`${API_URL}/load`);
    if (!res.ok) throw new Error('No response');
    const data = await res.json();

    if (data && data.canvasData) {
      canvasData = data.canvasData;
      renderCanvas();
      showNotification('Loaded from DB', 'success');
      return;
    }
  } catch {
    console.warn('DB not ready, saving initial data instead:', err.message);
    await saveToDB(true);
  }
}

window.saveToDB = async function (isInitial = false) {
  try {
    const res = await fetch(`${API_URL}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectName: 'BMC Project',
        canvasData,
        sections: SECTIONS,
      }),
    });
    const data = await res.json();
    if (data.success && !isInitial) {
      showNotification('Saved to DB', 'success');
    }
  } catch (err) {
    console.error('Save failed', err);
  }
};

// ---------- EXPORT ----------
window.exportAsImage = async function () {
  showNotification('Exporting Image...', 'info');
  try {
    const canvas = await html2canvas(document.getElementById('canvasGrid'), {
      scale: 2,
      useCORS: true,
    });
    const link = document.createElement('a');
    link.download = 'bmc-canvas.png';
    link.href = canvas.toDataURL();
    link.click();
    showNotification('Image exported', 'success');
  } catch (e) {
    showNotification('Export failed', 'error');
  }
};

window.exportAsPDF = async function () {
  showNotification('Exporting PDF...', 'info');
  try {
    const { jsPDF } = window.jspdf;
    const canvas = await html2canvas(document.getElementById('canvasGrid'), {
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const imgWidth = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('bmc-canvas.pdf');
    showNotification('PDF exported', 'success');
  } catch {
    showNotification('PDF export failed', 'error');
  }
};

// ---------- NOTIFICATION ----------
function showNotification(text, type = 'success') {
  const notif = document.getElementById('notification');
  const icon = document.getElementById('notifIcon');
  const textEl = document.getElementById('notifText');

  const icons = {
    success: 'fa-check-circle text-green-500',
    error: 'fa-exclamation-circle text-red-500',
    info: 'fa-info-circle text-blue-500',
  };
  icon.className = `fas ${icons[type]} text-2xl`;
  textEl.textContent = text;

  notif.classList.remove('hidden');
  notif.classList.add('flex');
  setTimeout(() => notif.classList.add('hidden'), 3000);
}
