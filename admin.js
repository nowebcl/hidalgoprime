// PocketBase API URL Configuration
const POCKETBASE_URL = "http://pocketbase-wniryajalo0ws95dy8t8j3pj.2.25.98.151.sslip.io";
const pb = new PocketBase(POCKETBASE_URL);

let currentAdminProperties = [];
let editingPropId = null;

// Check Auth State on Page Load
document.addEventListener("DOMContentLoaded", async () => {
  if (pb.authStore.isValid) {
    showAdminDashboard();
  } else {
    showLoginView();
  }
});

function showLoginView() {
  document.getElementById("loginOverlay").style.display = "flex";
  document.getElementById("adminNavbar").style.display = "none";
  document.getElementById("adminMainContent").style.display = "none";
}

function showAdminDashboard() {
  document.getElementById("loginOverlay").style.display = "none";
  document.getElementById("adminNavbar").style.display = "flex";
  document.getElementById("adminMainContent").style.display = "block";
  loadAdminProperties();
}

// Handle Admin Login
async function handleAdminLogin(event) {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPass").value.trim();
  const submitBtn = document.getElementById("btnLoginSubmit");

  submitBtn.disabled = true;
  submitBtn.textContent = "Verificando...";

  try {
    // Try Superusers login first
    try {
      await pb.collection('_superusers').authWithPassword(email, password);
    } catch (err) {
      // Fallback to regular users
      await pb.collection('users').authWithPassword(email, password);
    }

    showToast("¡Inicio de sesión exitoso!");
    showAdminDashboard();
  } catch (error) {
    console.error("Login error:", error);
    alert("Error de autenticación: Verifica tu correo y contraseña.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Ingresar al Panel";
  }
}

// Handle Admin Logout
function handleAdminLogout() {
  pb.authStore.clear();
  showLoginView();
  showToast("Sesión cerrada.");
}

// Fetch & Load Properties from PocketBase
async function loadAdminProperties() {
  try {
    const records = await pb.collection("propiedades").getFullList();
    currentAdminProperties = records;
    updateMetrics(records);
    renderAdminTable(records);
  } catch (error) {
    console.error("Error loading properties from PocketBase:", error);
    showToast("Error al cargar propiedades de PocketBase.");
  }
}

// Update Metric Cards
function updateMetrics(records) {
  document.getElementById("metricTotal").textContent = records.length;
  document.getElementById("metricVenta").textContent = records.filter(r => r.operacion === "venta").length;
  document.getElementById("metricArriendo").textContent = records.filter(r => r.operacion === "arriendo").length;
  document.getElementById("metricParcelas").textContent = records.filter(r => r.operacion === "venta-parcela" || r.tipo === "terreno-parcela").length;
  document.getElementById("metricDestacadas").textContent = records.filter(r => r.destacada === true).length;
}

// Render Admin Data Table & Mobile App Cards Feed
function renderAdminTable(records) {
  const tbody = document.getElementById("adminTableBody");
  const mobileCardsContainer = document.getElementById("adminMobileCards");

  if (!tbody && !mobileCardsContainer) return;

  if (records.length === 0) {
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 3rem; color: #94A3B8;">
            No hay propiedades registradas aún. Haz clic en <strong>+ Nueva Propiedad</strong> para agregar la primera.
          </td>
        </tr>
      `;
    }
    if (mobileCardsContainer) {
      mobileCardsContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: #94A3B8;">
          No hay propiedades registradas aún. Presiona el botón <strong>+</strong> para agregar.
        </div>
      `;
    }
    return;
  }

  // Render Desktop Table
  if (tbody) {
    tbody.innerHTML = records.map(prop => {
      let imgUrl = "assets/images/hero_bg.jpg";
      if (prop.imagenes && prop.imagenes.length > 0) {
        imgUrl = pb.files.getUrl(prop, prop.imagenes[0]);
      } else if (prop.image) {
        imgUrl = prop.image;
      }

      const precioDisplay = prop.precio_texto || (prop.moneda === "UF" ? `UF ${prop.precio.toLocaleString('es-CL')}` : `$${prop.precio.toLocaleString('es-CL')}`);

      return `
        <tr>
          <td>
            <img src="${imgUrl}" alt="${prop.titulo}" class="table-thumb">
          </td>
          <td>
            <div style="font-weight: 800; color: #FFFFFF; font-size: 0.92rem;">${prop.titulo}</div>
            <div style="font-size: 0.78rem; color: #94A3B8;">ID: ${prop.id} • ${prop.direccion || 'Sin dirección'}</div>
          </td>
          <td>
            <span style="background: rgba(197, 155, 63, 0.2); color: var(--gold-primary); font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 50px; text-transform: uppercase;">
              ${prop.operacion}
            </span>
            <div style="font-size: 0.75rem; color: #94A3B8; margin-top: 0.2rem;">${prop.tipo}</div>
          </td>
          <td>
            <div style="font-weight: 800; color: #FFF; font-size: 0.92rem;">${precioDisplay}</div>
          </td>
          <td>
            <div style="color: #E2E8F0;">${prop.comuna}</div>
            <div style="font-size: 0.75rem; color: #94A3B8;">${prop.region || 'RM'}</div>
          </td>
          <td style="text-align: center;">
            <span class="star-toggle ${prop.destacada ? 'active' : ''}" onclick="toggleDestacada('${prop.id}', ${!prop.destacada})">
              ★
            </span>
          </td>
          <td>
            <select class="status-badge-select" onchange="updatePropState('${prop.id}', this.value)">
              <option value="disponible" ${prop.estado === 'disponible' ? 'selected' : ''}>Disponible</option>
              <option value="reservada" ${prop.estado === 'reservada' ? 'selected' : ''}>Reservada</option>
              <option value="vendida" ${prop.estado === 'vendida' ? 'selected' : ''}>Vendida</option>
              <option value="arrendada" ${prop.estado === 'arrendada' ? 'selected' : ''}>Arrendada</option>
            </select>
          </td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.4rem; justify-content: flex-end;">
              <button class="btn-action-icon" onclick="openPropertyFormModal('${prop.id}')" title="Editar">
                <i data-lucide="edit-3" style="width: 15px; height: 15px;"></i>
              </button>
              <button class="btn-action-icon btn-action-delete" onclick="deleteProperty('${prop.id}')" title="Eliminar">
                <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Render Mobile App Cards Feed
  if (mobileCardsContainer) {
    mobileCardsContainer.innerHTML = records.map(prop => {
      let imgUrl = "assets/images/hero_bg.jpg";
      if (prop.imagenes && prop.imagenes.length > 0) {
        imgUrl = pb.files.getUrl(prop, prop.imagenes[0]);
      } else if (prop.image) {
        imgUrl = prop.image;
      }

      const precioDisplay = prop.precio_texto || (prop.moneda === "UF" ? `UF ${prop.precio.toLocaleString('es-CL')}` : `$${prop.precio.toLocaleString('es-CL')}`);

      return `
        <div class="admin-mobile-card">
          <div class="am-card-top">
            <img src="${imgUrl}" class="am-card-thumb" alt="${prop.titulo}">
            <div class="am-card-info">
              <div class="am-card-title">${prop.titulo}</div>
              <div class="am-card-sub">ID: ${prop.id.substring(0,8)}... • ${prop.comuna}</div>
              <div class="am-card-price">${precioDisplay}</div>
            </div>
            <span class="star-toggle ${prop.destacada ? 'active' : ''}" onclick="toggleDestacada('${prop.id}', ${!prop.destacada})" style="padding: 0.3rem;">
              ★
            </span>
          </div>

          <div class="am-card-bottom">
            <span style="background: rgba(197, 155, 63, 0.2); color: var(--gold-primary); font-size: 0.72rem; font-weight: 800; padding: 0.25rem 0.6rem; border-radius: 50px; text-transform: uppercase;">
              ${prop.operacion}
            </span>

            <select class="status-badge-select" onchange="updatePropState('${prop.id}', this.value)" style="font-size: 0.72rem; padding: 0.2rem 0.4rem;">
              <option value="disponible" ${prop.estado === 'disponible' ? 'selected' : ''}>Disponible</option>
              <option value="reservada" ${prop.estado === 'reservada' ? 'selected' : ''}>Reservada</option>
              <option value="vendida" ${prop.estado === 'vendida' ? 'selected' : ''}>Vendida</option>
              <option value="arrendada" ${prop.estado === 'arrendada' ? 'selected' : ''}>Arrendada</option>
            </select>

            <div style="flex-grow: 1;"></div>

            <button class="btn-action-icon" onclick="openPropertyFormModal('${prop.id}')" title="Editar">
              <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
            </button>
            <button class="btn-action-icon btn-action-delete" onclick="deleteProperty('${prop.id}')" title="Eliminar">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  lucide.createIcons();
}

// Filter Table Locally
function filterAdminTable() {
  const keyword = document.getElementById("adminSearchInput").value.toLowerCase().trim();
  const op = document.getElementById("adminFilterOperacion").value;

  const filtered = currentAdminProperties.filter(prop => {
    const matchOp = (op === "todos" || prop.operacion === op);
    const matchKw = !keyword || (
      prop.titulo.toLowerCase().includes(keyword) ||
      prop.comuna.toLowerCase().includes(keyword) ||
      prop.id.toLowerCase().includes(keyword)
    );
    return matchOp && matchKw;
  });

  renderAdminTable(filtered);
}

// Toggle Destacada Status
async function toggleDestacada(id, newState) {
  try {
    await pb.collection("propiedades").update(id, { destacada: newState });
    showToast(`Estado Destacada actualizado.`);
    loadAdminProperties();
  } catch (error) {
    console.error("Error toggling destacada:", error);
    alert("Error al actualizar propiedad.");
  }
}

// Update Property State (Disponible, Reservada, Vendida, Arrendada)
async function updatePropState(id, newState) {
  try {
    await pb.collection("propiedades").update(id, { estado: newState });
    showToast(`Estado cambiado a: ${newState.toUpperCase()}`);
    loadAdminProperties();
  } catch (error) {
    console.error("Error updating state:", error);
    alert("Error al actualizar estado.");
  }
}

// Open Form Modal (New or Edit)
function openPropertyFormModal(id = null) {
  editingPropId = id;
  const modal = document.getElementById("propertyFormModal");
  const modalTitle = document.getElementById("formModalTitle");
  const form = document.getElementById("propertyEditForm");
  const previewGrid = document.getElementById("imagePreviewGrid");
  
  form.reset();
  previewGrid.innerHTML = "";

  if (id) {
    modalTitle.textContent = "Editar Propiedad";
    const prop = currentAdminProperties.find(p => p.id === id);
    if (prop) {
      document.getElementById("propEditId").value = prop.id;
      document.getElementById("pTitulo").value = prop.titulo || "";
      document.getElementById("pOperacion").value = prop.operacion || "venta";
      document.getElementById("pTipo").value = prop.tipo || "casa";
      document.getElementById("pMoneda").value = prop.moneda || "UF";
      document.getElementById("pPrecio").value = prop.precio || 0;
      document.getElementById("pPrecioTexto").value = prop.precio_texto || "";
      document.getElementById("pRegion").value = prop.region || "Región Metropolitana";
      document.getElementById("pComuna").value = prop.comuna || "";
      document.getElementById("pDireccion").value = prop.direccion || "";
      document.getElementById("pSupUtil").value = prop.superficie_util || "";
      document.getElementById("pSupTotal").value = prop.superficie_total || "";
      document.getElementById("pDormitorios").value = prop.dormitorios || "";
      document.getElementById("pBanos").value = prop.banos || "";
      document.getElementById("pEstacionamientos").value = prop.estacionamientos || "";
      document.getElementById("pBodegas").value = prop.bodegas || "";
      document.getElementById("pGastosComunes").value = prop.gastos_comunes || "";
      document.getElementById("pContribuciones").value = prop.contribuciones || "";
      document.getElementById("pDescripcion").value = prop.descripcion || "";
      document.getElementById("pDestacada").checked = prop.destacada || false;
      document.getElementById("pEstado").value = prop.estado || "disponible";

      // Populate feature checkboxes
      const feats = prop.caracteristicas || [];
      document.querySelectorAll('input[name="featCheck"]').forEach(cb => {
        cb.checked = feats.includes(cb.value);
      });

      // Populate image previews
      if (prop.imagenes && prop.imagenes.length > 0) {
        previewGrid.innerHTML = prop.imagenes.map(imgName => {
          const url = pb.files.getUrl(prop, imgName);
          return `<div class="preview-thumb-item"><img src="${url}"></div>`;
        }).join('');
      }
    }
  } else {
    modalTitle.textContent = "Agregar Nueva Propiedad";
    document.getElementById("propEditId").value = "";
  }

  modal.classList.add("active");
}

function closePropertyFormModal() {
  const modal = document.getElementById("propertyFormModal");
  modal.classList.remove("active");
}

// Handle Image File Previews
function handleImagePreview(input) {
  const previewGrid = document.getElementById("imagePreviewGrid");
  previewGrid.innerHTML = "";
  if (input.files) {
    const files = Array.from(input.files).slice(0, 5); // Max 5
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const item = document.createElement("div");
        item.className = "preview-thumb-item";
        item.innerHTML = `<img src="${e.target.result}">`;
        previewGrid.appendChild(item);
      };
      reader.readAsDataURL(file);
    });
  }
}

function updatePrecioPlaceholder() {
  const mon = document.getElementById("pMoneda").value;
  const precioInput = document.getElementById("pPrecio");
  if (mon === "UF") {
    precioInput.placeholder = "18500";
  } else {
    precioInput.placeholder = "250000000";
  }
}

// Save / Create / Update Property
async function handlePropertySave(event) {
  event.preventDefault();
  const submitBtn = document.getElementById("btnSaveSubmit");
  submitBtn.disabled = true;
  submitBtn.innerHTML = `Guardando...`;

  const id = document.getElementById("propEditId").value;
  const formData = new FormData();

  formData.append("titulo", document.getElementById("pTitulo").value.trim());
  formData.append("operacion", document.getElementById("pOperacion").value);
  formData.append("tipo", document.getElementById("pTipo").value);
  formData.append("moneda", document.getElementById("pMoneda").value);
  formData.append("precio", document.getElementById("pPrecio").value);
  formData.append("precio_texto", document.getElementById("pPrecioTexto").value.trim());
  formData.append("region", document.getElementById("pRegion").value);
  formData.append("comuna", document.getElementById("pComuna").value.trim());
  formData.append("direccion", document.getElementById("pDireccion").value.trim());
  formData.append("superficie_util", document.getElementById("pSupUtil").value || 0);
  formData.append("superficie_total", document.getElementById("pSupTotal").value || 0);
  formData.append("dormitorios", document.getElementById("pDormitorios").value || 0);
  formData.append("banos", document.getElementById("pBanos").value || 0);
  formData.append("estacionamientos", document.getElementById("pEstacionamientos").value || 0);
  formData.append("bodegas", document.getElementById("pBodegas").value || 0);
  formData.append("gastos_comunes", document.getElementById("pGastosComunes").value || 0);
  formData.append("contribuciones", document.getElementById("pContribuciones").value || 0);
  formData.append("descripcion", document.getElementById("pDescripcion").value.trim());
  formData.append("destacada", document.getElementById("pDestacada").checked);
  formData.append("estado", document.getElementById("pEstado").value);

  // Features JSON
  const selectedFeats = [];
  document.querySelectorAll('input[name="featCheck"]:checked').forEach(cb => {
    selectedFeats.push(cb.value);
  });
  formData.append("caracteristicas", JSON.stringify(selectedFeats));

  // File uploads (Max 5)
  const fileInput = document.getElementById("pImagenes");
  if (fileInput.files && fileInput.files.length > 0) {
    const files = Array.from(fileInput.files).slice(0, 5);
    files.forEach(file => {
      formData.append("imagenes", file);
    });
  }

  try {
    if (id) {
      await pb.collection("propiedades").update(id, formData);
      showToast("Propiedad actualizada exitosamente.");
    } else {
      await pb.collection("propiedades").create(formData);
      showToast("Nueva propiedad agregada exitosamente.");
    }

    closePropertyFormModal();
    loadAdminProperties();
  } catch (error) {
    console.error("Error saving property:", error);
    alert("Error al guardar la propiedad en PocketBase. Revisa los campos obligatorios.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i data-lucide="check-circle"></i> Guardar Propiedad`;
    lucide.createIcons();
  }
}

// Delete Property
async function deleteProperty(id) {
  if (confirm("¿Estás seguro de que deseas eliminar esta propiedad? Esta acción no se puede deshacer.")) {
    try {
      await pb.collection("propiedades").delete(id);
      showToast("Propiedad eliminada.");
      loadAdminProperties();
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Error al eliminar la propiedad.");
    }
  }
}

// Toast Helper
function showToast(message) {
  const toast = document.getElementById("toastNotification");
  const toastMsg = document.getElementById("toastMessage");
  if (toast && toastMsg) {
    toastMsg.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3500);
  }
}
