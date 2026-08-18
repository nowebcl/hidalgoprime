// PocketBase API URL Configuration
const POCKETBASE_URL = "https://pb.noweb.tech";
const pb = new PocketBase(POCKETBASE_URL);

// Security: HTML escaping helper to prevent XSS
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

let currentAdminProperties = [];
let currentAdminMessages = [];
let editingPropId = null;
let activeAdminTab = "properties";

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
  loadAdminMessages();
}

// Handle Tab Switching (Properties vs Messages)
function switchAdminTab(tabName) {
  activeAdminTab = tabName;
  const propsSec = document.getElementById("propertiesSection");
  const msgsSec = document.getElementById("messagesSection");
  const tabPropsBtn = document.getElementById("tabPropsBtn");
  const tabMsgsBtn = document.getElementById("tabMessagesBtn");

  if (tabName === "properties") {
    if (propsSec) propsSec.style.display = "block";
    if (msgsSec) msgsSec.style.display = "none";
    if (tabPropsBtn) tabPropsBtn.classList.add("active");
    if (tabMsgsBtn) tabMsgsBtn.classList.remove("active");
  } else if (tabName === "messages") {
    if (propsSec) propsSec.style.display = "none";
    if (msgsSec) msgsSec.style.display = "block";
    if (tabPropsBtn) tabPropsBtn.classList.remove("active");
    if (tabMsgsBtn) tabMsgsBtn.classList.add("active");
    loadAdminMessages();
  }
  lucide.createIcons();
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

// ==========================================
// 1. PROPIEDADES MANAGEMENT
// ==========================================

// Safe PocketBase Image URL generator
function getAdminImgUrl(p, thumb = "") {
  if (p.imagenes && Array.isArray(p.imagenes) && p.imagenes.length > 0) {
    const col = p.collectionId || p.collectionName || "propiedades";
    return `${POCKETBASE_URL}/api/files/${col}/${p.id}/${p.imagenes[0]}${thumb ? '?thumb=' + thumb : ''}`;
  } else if (p.image) {
    return p.image;
  }
  return "assets/images/portada.png";
}

// Fetch & Load Properties from PocketBase
async function loadAdminProperties() {
  try {
    const records = await pb.collection("propiedades").getFullList();
    currentAdminProperties = records;
    updatePropertyMetrics(records);
    renderAdminTable(records);
  } catch (error) {
    console.error("Error loading properties from PocketBase:", error);
    showToast("Error al cargar propiedades de PocketBase.");
  }
}

// Update Property Metric Cards
function updatePropertyMetrics(records) {
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

  // Desktop Table Render
  if (tbody) {
    tbody.innerHTML = records.map(p => {
      const imgUrl = getAdminImgUrl(p, '100x75');

      const precioDisplay = p.moneda === 'UF' 
        ? `UF ${Number(p.precio).toLocaleString('es-CL')}` 
        : `$ ${Number(p.precio).toLocaleString('es-CL')} CLP`;

      const isStarActive = p.destacada ? 'active' : '';

      return `
        <tr>
          <td>
            <img src="${escapeHTML(imgUrl)}" alt="${escapeHTML(p.titulo)}" class="table-thumb" onerror="this.src='assets/images/portada.png'">
          </td>
          <td>
            <div style="font-weight: 700; color: #FFFFFF; font-size: 0.95rem;">${escapeHTML(p.titulo)}</div>
            <div style="font-size: 0.78rem; color: #94A3B8;">${escapeHTML(p.direccion || 'Sin dirección')}</div>
          </td>
          <td>
            <span style="text-transform: capitalize; font-weight: 700; color: var(--gold-primary);">${escapeHTML(p.operacion)}</span>
            <div style="font-size: 0.78rem; color: #94A3B8; text-transform: capitalize;">${escapeHTML(p.tipo)}</div>
          </td>
          <td style="font-weight: 800; color: #FFFFFF;">
            ${escapeHTML(precioDisplay)}
          </td>
          <td>
            <div>${escapeHTML(p.comuna)}</div>
            <div style="font-size: 0.75rem; color: #94A3B8;">${escapeHTML(p.region)}</div>
          </td>
          <td style="text-align: center;">
            <i data-lucide="star" class="star-toggle ${isStarActive}" onclick="togglePropertyFeatured('${p.id}', ${!p.destacada})" title="Alternar Destacada"></i>
          </td>
          <td>
            <select class="status-badge-select" onchange="updatePropertyStatus('${p.id}', this.value)">
              <option value="disponible" ${p.estado === 'disponible' ? 'selected' : ''}>Disponible</option>
              <option value="reservada" ${p.estado === 'reservada' ? 'selected' : ''}>Reservada</option>
              <option value="vendida" ${p.estado === 'vendida' ? 'selected' : ''}>Vendida</option>
              <option value="arrendada" ${p.estado === 'arrendada' ? 'selected' : ''}>Arrendada</option>
            </select>
          </td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 0.4rem;">
              <button class="btn-action-icon" onclick="openPropertyFormModal('${p.id}')" title="Editar Propiedad">
                <i data-lucide="edit-2"></i>
              </button>
              <button class="btn-action-icon btn-action-delete" onclick="deleteProperty('${p.id}')" title="Eliminar Propiedad">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  // Mobile App Cards Render (Luxury Mobile UI)
  if (mobileCardsContainer) {
    mobileCardsContainer.innerHTML = records.map(p => {
      const imgUrl = getAdminImgUrl(p, '600x400');

      const precioDisplay = p.moneda === 'UF' 
        ? `UF ${Number(p.precio).toLocaleString('es-CL')}` 
        : `$ ${Number(p.precio).toLocaleString('es-CL')} CLP`;

      return `
        <div class="admin-mobile-card">
          <div class="mobile-card-media">
            <img src="${escapeHTML(imgUrl)}" alt="${escapeHTML(p.titulo)}" class="mobile-card-img" onerror="this.src='assets/images/portada.png'">
            <div class="mobile-media-overlay"></div>
            <div class="mobile-card-top-badges">
              <span class="mobile-badge-op">${escapeHTML(p.operacion)}</span>
              <button class="mobile-star-btn ${p.destacada ? 'active' : ''}" onclick="togglePropertyFeatured('${p.id}', ${!p.destacada})" title="Destacada en Portada">
                <i data-lucide="star" style="width: 15px; height: 15px;"></i>
              </button>
            </div>
          </div>
          <div class="mobile-card-content">
            <div class="mobile-card-type-id">
              <span>${escapeHTML(p.tipo || 'Propiedad')}</span>
              <span>ID: HP-${escapeHTML(p.id.slice(0, 6))}</span>
            </div>
            <h4 class="mobile-card-title">${escapeHTML(p.titulo)}</h4>
            <div class="mobile-card-loc">
              <i data-lucide="map-pin"></i>
              <span>${escapeHTML(p.comuna || 'Santiago')}, ${escapeHTML(p.region || 'RM')}</span>
            </div>
            <div class="mobile-card-price">${escapeHTML(precioDisplay)}</div>
            
            <div class="mobile-card-specs">
              <div class="m-spec-item"><i data-lucide="bed"></i> <span>${p.dormitorios || 0} Dorm.</span></div>
              <div class="m-spec-item"><i data-lucide="bath"></i> <span>${p.banos || 0} Baños</span></div>
              <div class="m-spec-item"><i data-lucide="maximize-2"></i> <span>${p.superficie_util || p.superficie_total || 0} m²</span></div>
            </div>

            <div class="mobile-card-footer">
              <select class="status-badge-select" style="flex: 1;" onchange="updatePropertyStatus('${p.id}', this.value)">
                <option value="disponible" ${p.estado === 'disponible' ? 'selected' : ''}>🟢 Disponible</option>
                <option value="reservada" ${p.estado === 'reservada' ? 'selected' : ''}>🟡 Reservada</option>
                <option value="vendida" ${p.estado === 'vendida' ? 'selected' : ''}>🔴 Vendida</option>
                <option value="arrendada" ${p.estado === 'arrendada' ? 'selected' : ''}>🔵 Arrendada</option>
              </select>
              <button class="btn-action-icon" onclick="openPropertyFormModal('${p.id}')" title="Editar Propiedad">
                <i data-lucide="edit-2"></i>
              </button>
              <button class="btn-action-icon btn-action-delete" onclick="deleteProperty('${p.id}')" title="Eliminar Propiedad">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  lucide.createIcons();
}

// Filter Properties Table & Mobile Cards
function filterAdminTable() {
  const query = document.getElementById("adminSearchInput").value.toLowerCase();
  const operacion = document.getElementById("adminFilterOperacion").value;

  const filtered = currentAdminProperties.filter(p => {
    const matchQuery = p.titulo.toLowerCase().includes(query) ||
                       p.comuna.toLowerCase().includes(query) ||
                       (p.direccion && p.direccion.toLowerCase().includes(query)) ||
                       p.id.toLowerCase().includes(query);
    const matchOp = operacion === "todos" || p.operacion === operacion;
    return matchQuery && matchOp;
  });

  renderAdminTable(filtered);
}

// Toggle Featured (Destacada)
async function togglePropertyFeatured(id, isFeatured) {
  try {
    await pb.collection("propiedades").update(id, { destacada: isFeatured });
    showToast(isFeatured ? "Propiedad destacada en portada." : "Propiedad retirada de portada.");
    loadAdminProperties();
  } catch (error) {
    console.error("Error updating featured status:", error);
    showToast("Error al actualizar estado de destacada.");
  }
}

// Update Property Status (disponible, reservada, vendida, arrendada)
async function updatePropertyStatus(id, newStatus) {
  try {
    await pb.collection("propiedades").update(id, { estado: newStatus });
    showToast(`Estado actualizado a: ${newStatus}`);
    loadAdminProperties();
  } catch (error) {
    console.error("Error updating status:", error);
    showToast("Error al actualizar el estado.");
  }
}

// Open Property Create / Edit Modal
function openPropertyFormModal(id = null) {
  editingPropId = id;
  const modal = document.getElementById("propertyFormModal");
  const modalTitle = document.getElementById("formModalTitle");
  const form = document.getElementById("propertyEditForm");
  const previewGrid = document.getElementById("imagePreviewGrid");
  
  form.reset();
  previewGrid.innerHTML = "";
  document.getElementById("propEditId").value = "";

  if (id) {
    modalTitle.textContent = "Editar Propiedad";
    const prop = currentAdminProperties.find(p => p.id === id);
    if (prop) {
      document.getElementById("propEditId").value = prop.id;
      document.getElementById("pTitulo").value = prop.titulo || "";
      document.getElementById("pOperacion").value = prop.operacion || "venta";
      document.getElementById("pTipo").value = prop.tipo || "departamento";
      document.getElementById("pMoneda").value = prop.moneda || "UF";
      document.getElementById("pPrecio").value = prop.precio || "";
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
      document.getElementById("pDestacada").checked = prop.destacada === true;
      document.getElementById("pEstado").value = prop.estado || "disponible";

      // Populate features checkboxes
      if (prop.caracteristicas) {
        let feats = [];
        try {
          feats = typeof prop.caracteristicas === "string" ? JSON.parse(prop.caracteristicas) : prop.caracteristicas;
        } catch (e) {
          feats = [];
        }
        document.querySelectorAll('input[name="featCheck"]').forEach(cb => {
          cb.checked = feats.includes(cb.value);
        });
      }

      // Existing image thumbnails preview
      if (prop.imagenes && prop.imagenes.length > 0) {
        prop.imagenes.forEach((imgName, index) => {
          const imgUrl = getAdminImgUrl(prop, '200x150');
          const thumb = document.createElement("div");
          thumb.className = "preview-thumb-item";
          thumb.innerHTML = `
            <img src="${escapeHTML(imgUrl)}" alt="Foto ${index + 1}">
            <span class="preview-thumb-badge">Foto ${index + 1}</span>
          `;
          previewGrid.appendChild(thumb);
        });
      }
    }
  } else {
    modalTitle.textContent = "Agregar Nueva Propiedad";
  }

  pendingOptimizedWebpImages = [];
  modal.classList.add("active");
  lucide.createIcons();
}

function closePropertyFormModal() {
  document.getElementById("propertyFormModal").classList.remove("active");
  pendingOptimizedWebpImages = [];
}

// Global cache for client-side optimized WebP files
let pendingOptimizedWebpImages = [];

/**
 * Client-side WebP Image Optimizer & Resizer (HTML5 Canvas)
 * Converts any image format (JPG, PNG, HEIC, WEBP) to highly optimized WebP.
 * Resizes max dimension to 1920px while preserving aspect ratio.
 */
async function optimizeImageToWebP(file, maxDimension = 1920, quality = 0.85) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onerror = () => resolve(file);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(file);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaled dimensions
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP
        canvas.toBlob((blob) => {
          if (!blob) {
            return resolve(file); // Fallback to original
          }
          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const cleanName = baseName.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
          const webpName = `${cleanName}.webp`;

          const optimizedFile = new File([blob], webpName, {
            type: 'image/webp',
            lastModified: Date.now()
          });

          const origKb = (file.size / 1024).toFixed(0);
          const newKb = (optimizedFile.size / 1024).toFixed(0);
          console.log(`[WebP Optimizer] ${file.name} (${origKb} KB) -> ${webpName} (${newKb} KB WebP)`);

          resolve({
            file: optimizedFile,
            previewUrl: canvas.toDataURL('image/webp', 0.85),
            originalSizeKb: origKb,
            optimizedSizeKb: newKb
          });
        }, 'image/webp', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Handle Multi-image Preview with Realtime WebP Optimization (Up to 7 images)
async function handleImagePreview(input) {
  const previewGrid = document.getElementById("imagePreviewGrid");
  previewGrid.innerHTML = "";
  pendingOptimizedWebpImages = [];

  if (!input.files || input.files.length === 0) return;

  const rawFiles = Array.from(input.files).slice(0, 7); // Up to 7 images

  previewGrid.innerHTML = `<div style="grid-column: 1/-1; font-size: 0.8rem; color: var(--gold-light); display: flex; align-items: center; gap: 0.4rem;">
    <i data-lucide="loader-2" class="spin" style="width: 16px; height: 16px;"></i> Optimizando ${rawFiles.length} imágenes a WebP...
  </div>`;
  lucide.createIcons();

  const optimizedResults = [];
  for (let i = 0; i < rawFiles.length; i++) {
    const res = await optimizeImageToWebP(rawFiles[i], 1920, 0.85);
    optimizedResults.push(res);
  }

  previewGrid.innerHTML = "";
  optimizedResults.forEach((item, index) => {
    if (item.file) {
      pendingOptimizedWebpImages.push(item.file);
      const thumb = document.createElement("div");
      thumb.className = "preview-thumb-item";
      thumb.innerHTML = `
        <img src="${item.previewUrl}" alt="Foto ${index + 1}">
        <span class="preview-thumb-badge">WEBP • ${item.optimizedSizeKb} KB</span>
      `;
      previewGrid.appendChild(thumb);
    } else {
      pendingOptimizedWebpImages.push(item);
    }
  });

  lucide.createIcons();
}

// Save Property (Create / Update)
async function handlePropertySave(event) {
  event.preventDefault();
  const submitBtn = document.getElementById("btnSaveSubmit");
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Guardando y optimizando...`;
  lucide.createIcons();

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

  // File uploads (Up to 7 WebP optimized images)
  const fileInput = document.getElementById("pImagenes");
  if (pendingOptimizedWebpImages && pendingOptimizedWebpImages.length > 0) {
    const filesToUpload = pendingOptimizedWebpImages.slice(0, 7);
    filesToUpload.forEach(file => {
      formData.append("imagenes", file);
    });
  } else if (fileInput.files && fileInput.files.length > 0) {
    const rawFiles = Array.from(fileInput.files).slice(0, 7);
    for (const raw of rawFiles) {
      const opt = await optimizeImageToWebP(raw, 1920, 0.85);
      formData.append("imagenes", opt.file || opt);
    }
  }

  try {
    if (id) {
      await pb.collection("propiedades").update(id, formData);
      showToast("Propiedad actualizada exitosamente con imágenes WebP.");
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


// ==========================================
// 2. MENSAJES RECIBIDOS (INBOX)
// ==========================================

// Fetch & Load Contact Messages from PocketBase & Local Storage
async function loadAdminMessages() {
  let pbMessages = [];
  try {
    pbMessages = await pb.collection("mensajes").getFullList();
  } catch (err) {
    console.warn("PocketBase collection 'mensajes' not yet accessible, checking local backup:", err);
  }

  // Merge with local backup
  let localMessages = [];
  try {
    localMessages = JSON.parse(localStorage.getItem("hp_local_messages") || "[]");
  } catch (e) {
    localMessages = [];
  }

  // Combine unique by ID or email+fecha
  const combined = [...pbMessages];
  localMessages.forEach(loc => {
    if (!combined.some(c => c.id === loc.id || (c.email === loc.email && c.mensaje === loc.mensaje))) {
      combined.push(loc);
    }
  });

  // Sort descending by date
  combined.sort((a, b) => new Date(b.created || b.fecha || 0) - new Date(a.created || a.fecha || 0));

  currentAdminMessages = combined;
  updateMessageMetrics(combined);
  renderAdminMessages(combined);
}

// Update Message Metrics & Badges
function updateMessageMetrics(messages) {
  const unreadCount = messages.filter(m => !m.leido && !m.respondido).length;
  const totalCount = messages.length;

  const metricVal = document.getElementById("metricMensajes");
  const metricSub = document.getElementById("metricMensajesSub");
  const badge = document.getElementById("unreadMsgBadge");

  if (metricVal) metricVal.textContent = totalCount;
  if (metricSub) metricSub.textContent = `${unreadCount} sin leer`;

  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }
}

// Render Messages Table & Mobile Feed
function renderAdminMessages(messages) {
  const tbody = document.getElementById("adminMessagesTableBody");
  const mobileContainer = document.getElementById("adminMobileMessagesCards");

  if (!tbody && !mobileContainer) return;

  if (messages.length === 0) {
    const emptyHtml = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 3.5rem 1rem; color: #94A3B8;">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📬</div>
          <div style="font-size: 1.05rem; font-weight: 700; color: #FFFFFF; margin-bottom: 0.3rem;">Bandeja de Mensajes Vacía</div>
          <p style="font-size: 0.85rem; max-width: 450px; margin: 0 auto 1.2rem auto;">
            Los mensajes que los clientes envíen a través del sitio web aparecerán automáticamente aquí.
          </p>
          <button class="btn-secondary" onclick="createTestMessage()" style="font-size: 0.8rem; padding: 0.5rem 1rem;">
            <i data-lucide="send" style="width: 14px; height: 14px;"></i> Generar Mensaje de Prueba
          </button>
        </td>
      </tr>
    `;
    if (tbody) tbody.innerHTML = emptyHtml;
    if (mobileContainer) {
      mobileContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: #94A3B8; background: rgba(15,32,55,0.7); border-radius: 16px;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📬</div>
          <div style="font-size: 1rem; font-weight: 700; color: #FFF;">Bandeja Vacía</div>
          <p style="font-size: 0.82rem; margin: 0.5rem 0 1rem 0;">No hay mensajes registrados aún.</p>
          <button class="btn-secondary" onclick="createTestMessage()" style="font-size: 0.8rem; padding: 0.5rem 1rem;">
            Generar Mensaje de Prueba
          </button>
        </div>
      `;
    }
    lucide.createIcons();
    return;
  }

  // Desktop Table Render
  if (tbody) {
    tbody.innerHTML = messages.map(m => {
      const isUnread = !m.leido && !m.respondido;
      const isReplied = m.respondido;

      let statusBadge = '';
      if (isReplied) {
        statusBadge = `<span class="msg-status-pill msg-status-replied"><i data-lucide="check-check" style="width:12px;height:12px;"></i> Respondido</span>`;
      } else if (!isUnread) {
        statusBadge = `<span class="msg-status-pill msg-status-read"><i data-lucide="eye" style="width:12px;height:12px;"></i> Leído</span>`;
      } else {
        statusBadge = `<span class="msg-status-pill msg-status-unread"><i data-lucide="alert-circle" style="width:12px;height:12px;"></i> No Leído</span>`;
      }

      const dateStr = formatMessageDate(m.created || m.fecha);
      const cleanPhone = (m.telefono || "").replace(/[^0-9+]/g, "");
      const waLink = cleanPhone ? `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(`Hola ${m.nombre}, te contactamos de Hidalgo Prime Inmobiliaria respecto a tu consulta.`)}` : '#';

      return `
        <tr class="${isUnread ? 'msg-row-unread' : ''}">
          <td>${statusBadge}</td>
          <td style="font-size: 0.82rem; color: #94A3B8; white-space: nowrap;">
            <i data-lucide="clock" style="width: 13px; height: 13px; display: inline; vertical-align: middle; margin-right: 3px;"></i>
            ${escapeHTML(dateStr)}
          </td>
          <td>
            <div style="font-weight: 700; color: #FFFFFF; font-size: 0.92rem;">${escapeHTML(m.nombre || 'Sin nombre')}</div>
            <div style="font-size: 0.75rem; color: #64748B;">Origen: ${escapeHTML(m.origen || 'Web')}</div>
          </td>
          <td>
            <div><a href="mailto:${escapeHTML(m.email)}" style="color: #60A5FA; text-decoration: none; font-size: 0.82rem;">${escapeHTML(m.email)}</a></div>
            <div style="font-size: 0.8rem; color: #94A3B8;">${escapeHTML(m.telefono || 'Sin teléfono')}</div>
          </td>
          <td>
            <span style="background: rgba(197, 155, 63, 0.15); color: var(--gold-primary); padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.78rem; font-weight: 700;">
              ${escapeHTML(m.servicio || m.asunto || 'Consulta')}
            </span>
            ${m.propiedad_ref ? `<div style="font-size: 0.75rem; color: #94A3B8; margin-top: 3px;">Ref: ${escapeHTML(m.propiedad_ref)}</div>` : ''}
          </td>
          <td style="max-width: 250px;">
            <div style="font-size: 0.84rem; color: #CBD5E1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${escapeHTML(m.mensaje || '')}
            </div>
          </td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 0.35rem;">
              ${cleanPhone ? `
                <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-action-icon btn-wa-action" title="Abrir WhatsApp con ${escapeHTML(m.nombre)}">
                  <i data-lucide="message-circle" style="width: 15px; height: 15px;"></i>
                </a>
              ` : ''}
              <button class="btn-action-icon" onclick="openMessageDetailModal('${m.id}')" title="Ver Consulta Completa">
                <i data-lucide="eye" style="width: 15px; height: 15px;"></i>
              </button>
              <button class="btn-action-icon btn-action-delete" onclick="deleteAdminMessage('${m.id}')" title="Eliminar Consulta">
                <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  // Mobile Cards Render
  if (mobileContainer) {
    mobileContainer.innerHTML = messages.map(m => {
      const isUnread = !m.leido && !m.respondido;
      const cleanPhone = (m.telefono || "").replace(/[^0-9+]/g, "");
      const waLink = cleanPhone ? `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(`Hola ${m.nombre}, te contactamos de Hidalgo Prime respecto a tu consulta.`)}` : '#';

      return `
        <div class="admin-mobile-card" style="padding: 1.1rem; ${isUnread ? 'border-left: 4px solid var(--gold-primary);' : ''}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem;">
            <span style="font-size: 0.76rem; color: #94A3B8; display: inline-flex; align-items: center; gap: 0.3rem;">
              <i data-lucide="clock" style="width: 13px; height: 13px;"></i>
              ${escapeHTML(formatMessageDate(m.created || m.fecha))}
            </span>
            ${m.respondido 
              ? '<span class="msg-status-pill msg-status-replied">Respondido</span>'
              : (isUnread ? '<span class="msg-status-pill msg-status-unread">No Leído</span>' : '<span class="msg-status-pill msg-status-read">Leído</span>')}
          </div>

          <h4 style="font-size: 1.05rem; font-weight: 800; color: #FFF; margin: 0 0 0.25rem 0;">${escapeHTML(m.nombre || 'Cliente Web')}</h4>
          <div style="font-size: 0.8rem; color: #60A5FA; margin-bottom: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.4rem;">
            <span>${escapeHTML(m.email)}</span>
            ${m.telefono ? `<span>• ${escapeHTML(m.telefono)}</span>` : ''}
          </div>

          <div style="display: inline-block; background: rgba(197, 155, 63, 0.15); color: var(--gold-light); padding: 0.25rem 0.65rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.75rem;">
            ${escapeHTML(m.servicio || m.asunto || 'Consulta General')}
            ${m.propiedad_ref ? ` • Ref: ${escapeHTML(m.propiedad_ref)}` : ''}
          </div>

          <div style="background: rgba(10, 24, 40, 0.6); padding: 0.85rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); font-size: 0.84rem; color: #CBD5E1; line-height: 1.45; margin-bottom: 0.9rem;">
            ${escapeHTML(m.mensaje || 'Sin mensaje escrito.')}
          </div>

          <div style="display: flex; gap: 0.5rem; justify-content: flex-end; align-items: center; padding-top: 0.65rem; border-top: 1px solid rgba(255,255,255,0.08);">
            ${cleanPhone ? `
              <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-action-icon btn-wa-action" title="Abrir WhatsApp">
                <i data-lucide="message-circle" style="width: 17px; height: 17px;"></i>
              </a>
            ` : ''}
            <button class="btn-action-icon" onclick="openMessageDetailModal('${m.id}')" title="Ver Detalle">
              <i data-lucide="eye" style="width: 17px; height: 17px;"></i>
            </button>
            <button class="btn-action-icon btn-action-delete" onclick="deleteAdminMessage('${m.id}')" title="Eliminar">
              <i data-lucide="trash-2" style="width: 17px; height: 17px;"></i>
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  lucide.createIcons();
}

// Filter Messages by Query, Status and Service
function filterAdminMessages() {
  const query = (document.getElementById("msgSearchInput")?.value || "").toLowerCase();
  const status = document.getElementById("msgFilterStatus")?.value || "todos";
  const service = document.getElementById("msgFilterService")?.value || "todos";

  const filtered = currentAdminMessages.filter(m => {
    const matchQuery = (m.nombre || "").toLowerCase().includes(query) ||
                       (m.email || "").toLowerCase().includes(query) ||
                       (m.telefono || "").toLowerCase().includes(query) ||
                       (m.mensaje || "").toLowerCase().includes(query) ||
                       (m.propiedad_ref || "").toLowerCase().includes(query);

    let matchStatus = true;
    if (status === "unread") matchStatus = !m.leido && !m.respondido;
    if (status === "read") matchStatus = m.leido && !m.respondido;
    if (status === "replied") matchStatus = m.respondido;

    let matchService = true;
    if (service !== "todos") {
      matchService = (m.servicio || "").toLowerCase().includes(service.toLowerCase());
    }

    return matchQuery && matchStatus && matchService;
  });

  renderAdminMessages(filtered);
}

// Format Date Utility
function formatMessageDate(dateStr) {
  if (!dateStr) return 'Reciente';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
}

// Open Message Detail Modal
function openMessageDetailModal(id) {
  const msg = currentAdminMessages.find(m => m.id === id);
  if (!msg) return;

  // Mark as read automatically when opening detail
  if (!msg.leido) {
    markMessageStatus(id, { leido: true });
  }

  const modal = document.getElementById("messageDetailModal");
  const content = document.getElementById("msgDetailContent");
  const actions = document.getElementById("msgDetailActions");

  const cleanPhone = (msg.telefono || "").replace(/[^0-9+]/g, "");
  const waLink = cleanPhone ? `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(`Hola ${msg.nombre}, te contactamos de Hidalgo Prime respecto a tu consulta.`)}` : null;

  content.innerHTML = `
    <div class="message-detail-item">
      <div class="message-detail-label">Fecha y Hora:</div>
      <div class="message-detail-val">${escapeHTML(formatMessageDate(msg.created || msg.fecha))}</div>
    </div>
    <div class="message-detail-item">
      <div class="message-detail-label">Nombre Cliente:</div>
      <div class="message-detail-val" style="font-weight: 700; color: #FFF;">${escapeHTML(msg.nombre)}</div>
    </div>
    <div class="message-detail-item">
      <div class="message-detail-label">Correo Electrónico:</div>
      <div class="message-detail-val">
        <a href="mailto:${escapeHTML(msg.email)}" style="color: #60A5FA; text-decoration: underline;">${escapeHTML(msg.email)}</a>
      </div>
    </div>
    <div class="message-detail-item">
      <div class="message-detail-label">Teléfono:</div>
      <div class="message-detail-val">
        <a href="tel:${escapeHTML(msg.telefono)}" style="color: #FFF; text-decoration: underline;">${escapeHTML(msg.telefono || 'No informado')}</a>
      </div>
    </div>
    <div class="message-detail-item">
      <div class="message-detail-label">Asunto / Servicio:</div>
      <div class="message-detail-val" style="color: var(--gold-primary); font-weight: 700;">${escapeHTML(msg.servicio || msg.asunto || 'Consulta General')}</div>
    </div>
    ${msg.propiedad_ref ? `
      <div class="message-detail-item">
        <div class="message-detail-label">Propiedad Ref:</div>
        <div class="message-detail-val">${escapeHTML(msg.propiedad_ref)}</div>
      </div>
    ` : ''}
    <div class="message-detail-item">
      <div class="message-detail-label">Origen / Sección:</div>
      <div class="message-detail-val" style="text-transform: capitalize;">${escapeHTML(msg.origen || 'Sitio Web')}</div>
    </div>
    <div style="margin-top: 1.2rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
      <div class="message-detail-label" style="margin-bottom: 0.5rem; width: 100%;">Mensaje del Cliente:</div>
      <div style="background: rgba(15,32,55,0.9); padding: 1.2rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); font-size: 0.95rem; line-height: 1.6; color: #FFFFFF; white-space: pre-wrap;">
        ${escapeHTML(msg.mensaje)}
      </div>
    </div>
  `;

  actions.innerHTML = `
    ${waLink ? `
      <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="background: #25D366; border-color: #25D366; color: #FFF; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.65rem 1.2rem; font-size: 0.88rem;">
        <i data-lucide="message-circle" style="width: 16px; height: 16px;"></i> Responder por WhatsApp
      </a>
    ` : ''}
    <a href="mailto:${escapeHTML(msg.email)}?subject=${encodeURIComponent(`Respuesta a tu consulta - Hidalgo Prime`)}" class="btn-secondary" style="font-size: 0.88rem; padding: 0.65rem 1.2rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
      <i data-lucide="mail" style="width: 16px; height: 16px;"></i> Responder por Email
    </a>
    <button class="btn-secondary" onclick="markMessageStatus('${msg.id}', { respondido: ${!msg.respondido} })" style="font-size: 0.88rem; padding: 0.65rem 1.2rem;">
      <i data-lucide="check-check" style="width: 16px; height: 16px;"></i> ${msg.respondido ? 'Marcar Pendiente' : 'Marcar Respondido'}
    </button>
  `;

  modal.classList.add("active");
  lucide.createIcons();
}

function closeMessageDetailModal() {
  document.getElementById("messageDetailModal").classList.remove("active");
}

// Mark Message Status (leido, respondido) in PocketBase & Local Storage
async function markMessageStatus(id, updateData) {
  try {
    await pb.collection("mensajes").update(id, updateData);
  } catch (e) {
    console.warn("Could not update PocketBase message directly, updating local state:", e);
  }

  // Update in local array & localStorage
  const msg = currentAdminMessages.find(m => m.id === id);
  if (msg) {
    Object.assign(msg, updateData);
  }

  try {
    const localMessages = JSON.parse(localStorage.getItem("hp_local_messages") || "[]");
    const locMsg = localMessages.find(m => m.id === id);
    if (locMsg) {
      Object.assign(locMsg, updateData);
      localStorage.setItem("hp_local_messages", JSON.stringify(localMessages));
    }
  } catch (err) {}

  updateMessageMetrics(currentAdminMessages);
  renderAdminMessages(currentAdminMessages);
}

// Delete Contact Message
async function deleteAdminMessage(id) {
  if (!confirm("¿Deseas eliminar este mensaje de la bandeja?")) return;

  try {
    await pb.collection("mensajes").delete(id);
  } catch (e) {
    console.warn("PocketBase delete failed or local-only message:", e);
  }

  currentAdminMessages = currentAdminMessages.filter(m => m.id !== id);

  try {
    let localMessages = JSON.parse(localStorage.getItem("hp_local_messages") || "[]");
    localMessages = localMessages.filter(m => m.id !== id);
    localStorage.setItem("hp_local_messages", JSON.stringify(localMessages));
  } catch (err) {}

  showToast("Mensaje eliminado de la bandeja.");
  updateMessageMetrics(currentAdminMessages);
  renderAdminMessages(currentAdminMessages);
  closeMessageDetailModal();
}

// Helper: Create a Test Message to verify functionality immediately
async function createTestMessage() {
  const dummy = {
    nombre: "Carolina Valenzuela",
    email: "carolina.v@ejemplo.cl",
    telefono: "+56962070997",
    servicio: "Compra y Venta",
    mensaje: "Hola, estoy interesada en comprar un departamento en el sector de Vitacura o Las Condes. Quisiera coordinar una reunión para conocer opciones disponibles y asesoría de financiamiento.",
    propiedad_ref: "Depto Exclusivo Vitacura",
    leido: false,
    respondido: false,
    origen: "Formulario Web",
    fecha: new Date().toISOString()
  };

  try {
    const record = await pb.collection("mensajes").create(dummy);
    showToast("Mensaje de prueba creado en PocketBase con éxito.");
  } catch (err) {
    console.warn("Saving test message to local storage fallback:", err);
    dummy.id = "local_" + Date.now();
    const local = JSON.parse(localStorage.getItem("hp_local_messages") || "[]");
    local.unshift(dummy);
    localStorage.setItem("hp_local_messages", JSON.stringify(local));
    showToast("Mensaje de prueba generado correctamente.");
  }

  loadAdminMessages();
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
