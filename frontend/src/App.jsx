import { useState, useRef, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const combustibles = ["Gasolina", "Diésel", "Híbrido", "Eléctrico", "GLP"];
const emptyForm = { marca: "", modelo: "", año: new Date().getFullYear(), precio: "", km: "", combustible: "Gasolina", descripcion: "", imagenes: [] };

// ── API helpers ──────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.status === 204 ? null : res.json();
}

// ── Subcomponents ────────────────────────────────────────────────────────────
function ImageGallery({ images }) {
  const [current, setCurrent] = useState(0);
  if (!images || images.length === 0)
    return <div style={{ height: 200, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8 }}><span style={{ color: "#555", fontSize: 13 }}>Sin imágenes</span></div>;
  return (
    <div style={{ position: "relative", borderRadius: 8, overflow: "hidden" }}>
      <img src={images[current]} alt="" style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
      {images.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); setCurrent(c => (c - 1 + images.length) % images.length); }} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>‹</button>
          <button onClick={e => { e.stopPropagation(); setCurrent(c => (c + 1) % images.length); }} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>›</button>
          <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
            {images.map((_, i) => <div key={i} onClick={e => { e.stopPropagation(); setCurrent(i); }} style={{ width: i === current ? 20 : 8, height: 8, borderRadius: 4, background: i === current ? "#D4AF37" : "rgba(255,255,255,0.5)", cursor: "pointer", transition: "all 0.3s" }} />)}
          </div>
        </>
      )}
    </div>
  );
}

function VehicleCard({ vehicle, isAdmin, onEdit, onDelete, onView }) {
  return (
    <div onClick={() => onView(vehicle)} style={{ background: "linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)", border: "1px solid #2a2a4a", borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "all 0.3s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "#D4AF37"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.4)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#2a2a4a"; e.currentTarget.style.boxShadow = "none"; }}>
      <ImageGallery images={vehicle.imagenes} />
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: "#D4AF37", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 }}>{vehicle.marca}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "'Bebas Neue', sans-serif" }}>{vehicle.modelo} · {vehicle.año}</div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#D4AF37", fontFamily: "'Bebas Neue', sans-serif" }}>{Number(vehicle.precio).toLocaleString("es-ES")} €</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 11, background: "rgba(212,175,55,0.1)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 4, padding: "2px 8px" }}>{vehicle.combustible}</span>
          <span style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", color: "#aaa", border: "1px solid #333", borderRadius: 4, padding: "2px 8px" }}>{Number(vehicle.km).toLocaleString("es-ES")} km</span>
        </div>
        <p style={{ fontSize: 12, color: "#888", lineHeight: 1.5, margin: "0 0 16px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{vehicle.descripcion}</p>
        {isAdmin && (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={e => { e.stopPropagation(); onEdit(vehicle); }} style={{ flex: 1, padding: 8, background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.4)", color: "#D4AF37", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(212,175,55,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(212,175,55,0.1)"}>✏️ Editar</button>
            <button onClick={e => { e.stopPropagation(); onDelete(vehicle.id); }} style={{ flex: 1, padding: 8, background: "rgba(220,53,69,0.1)", border: "1px solid rgba(220,53,69,0.4)", color: "#dc3545", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(220,53,69,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(220,53,69,0.1)"}>🗑️ Eliminar</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0d0d1a", border: "1px solid #2a2a4a", borderRadius: 20, width: "100%", maxWidth: 640, maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #1a1a2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, color: "#fff", fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 24 }}>×</button>
        </div>
        <div style={{ padding: 28 }}>{children}</div>
      </div>
    </div>
  );
}

function LoginModal({ onLogin, onClose }) {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify(creds) });
      onLogin(data);
    } catch {
      setError("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: "100%", padding: "10px 14px", background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" };

  return (
    <Modal title="Acceso Administrador" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6, display: "block" }}>Usuario</label>
          <input style={inputStyle} value={creds.username} onChange={e => setCreds(c => ({ ...c, username: e.target.value }))} required autoFocus />
        </div>
        <div>
          <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6, display: "block" }}>Contraseña</label>
          <input style={inputStyle} type="password" value={creds.password} onChange={e => setCreds(c => ({ ...c, password: e.target.value }))} required />
        </div>
        {error && <div style={{ fontSize: 12, color: "#dc3545", background: "rgba(220,53,69,0.1)", border: "1px solid rgba(220,53,69,0.3)", borderRadius: 6, padding: "8px 12px" }}>⚠️ {error}</div>}
        <button type="submit" disabled={loading} style={{ padding: "12px", background: "linear-gradient(135deg, #D4AF37, #f0c940)", border: "none", color: "#000", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 15, marginTop: 4 }}>
          {loading ? "Verificando..." : "Entrar"}
        </button>
      </form>
    </Modal>
  );
}

function VehicleForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial ? { ...initial, imagenes: initial.imagenes || [] } : emptyForm);
  const [imgUrl, setImgUrl] = useState("");
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addImageUrl = () => { if (imgUrl.trim()) { set("imagenes", [...form.imagenes, imgUrl.trim()]); setImgUrl(""); } };
  const handleFile = (e) => Array.from(e.target.files).forEach(file => { const r = new FileReader(); r.onload = ev => set("imagenes", [...form.imagenes, ev.target.result]); r.readAsDataURL(file); });
  const removeImage = (i) => set("imagenes", form.imagenes.filter((_, idx) => idx !== i));

  const inputStyle = { width: "100%", padding: "10px 14px", background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  const labelStyle = { fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6, display: "block" };

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div><label style={labelStyle}>Marca</label><input style={inputStyle} value={form.marca} onChange={e => set("marca", e.target.value)} required /></div>
        <div><label style={labelStyle}>Modelo</label><input style={inputStyle} value={form.modelo} onChange={e => set("modelo", e.target.value)} required /></div>
        <div><label style={labelStyle}>Año</label><input style={inputStyle} type="number" value={form.año} onChange={e => set("año", e.target.value)} min={1900} max={2030} required /></div>
        <div><label style={labelStyle}>Precio (€)</label><input style={inputStyle} type="number" value={form.precio} onChange={e => set("precio", e.target.value)} min={0} required /></div>
        <div><label style={labelStyle}>Kilómetros</label><input style={inputStyle} type="number" value={form.km} onChange={e => set("km", e.target.value)} min={0} required /></div>
        <div><label style={labelStyle}>Combustible</label><select style={inputStyle} value={form.combustible} onChange={e => set("combustible", e.target.value)}>{combustibles.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
      </div>
      <div><label style={labelStyle}>Descripción</label><textarea style={{ ...inputStyle, height: 100, resize: "vertical" }} value={form.descripcion} onChange={e => set("descripcion", e.target.value)} required /></div>
      <div>
        <label style={labelStyle}>Imágenes</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input style={{ ...inputStyle, flex: 1 }} value={imgUrl} onChange={e => setImgUrl(e.target.value)} placeholder="https://... pega una URL" />
          <button type="button" onClick={addImageUrl} style={{ padding: "10px 16px", background: "rgba(212,175,55,0.15)", border: "1px solid #D4AF37", color: "#D4AF37", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>+ URL</button>
        </div>
        <button type="button" onClick={() => fileRef.current.click()} style={{ width: "100%", padding: 10, background: "#1a1a2e", border: "1px dashed #444", color: "#888", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>📁 Subir desde archivo</button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFile} />
        {form.imagenes.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {form.imagenes.map((img, i) => (
              <div key={i} style={{ position: "relative", width: 80, height: 60 }}>
                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
                <button type="button" onClick={() => removeImage(i)} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#dc3545", border: "none", color: "#fff", cursor: "pointer", fontSize: 12 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
        <button type="button" onClick={onCancel} style={{ flex: 1, padding: 12, background: "transparent", border: "1px solid #333", color: "#888", borderRadius: 10, cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
        <button type="submit" disabled={loading} style={{ flex: 2, padding: 12, background: "linear-gradient(135deg, #D4AF37, #f0c940)", border: "none", color: "#000", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 15 }}>
          {loading ? "Guardando..." : initial ? "Guardar cambios" : "Publicar vehículo"}
        </button>
      </div>
    </form>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [vehicles, setVehicles] = useState([]);
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem("auth")); } catch { return null; }
  });
  const [showLogin, setShowLogin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const isAdmin = auth?.rol === "ADMIN";
  const token = auth?.token;

  const loadVehicles = useCallback(async () => {
    try {
      const data = await apiFetch("/vehiculos");
      setVehicles(data);
      setApiError("");
    } catch {
      setApiError("No se pudo conectar con el servidor. ¿Está el backend ejecutándose?");
    }
  }, []);

  useEffect(() => { loadVehicles(); }, [loadVehicles]);

  const handleLogin = (data) => {
    localStorage.setItem("auth", JSON.stringify(data));
    setAuth(data);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setAuth(null);
  };

  const handleSave = async (form) => {
    setFormLoading(true);
    try {
      const body = { ...form, año: Number(form.año), precio: Number(form.precio), km: Number(form.km) };
      if (editing) {
        await apiFetch(`/vehiculos/${editing.id}`, { method: "PUT", body: JSON.stringify(body) }, token);
      } else {
        await apiFetch("/vehiculos", { method: "POST", body: JSON.stringify(body) }, token);
      }
      await loadVehicles();
      setEditing(null);
      setShowForm(false);
    } catch {
      alert("Error al guardar. Verifica que la sesión no ha expirado.");
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await apiFetch(`/vehiculos/${deleteId}`, { method: "DELETE" }, token);
      await loadVehicles();
    } catch {
      alert("Error al eliminar.");
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = vehicles.filter(v =>
    `${v.marca} ${v.modelo} ${v.año} ${v.combustible}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ minHeight: "100vh", background: "#080812", fontFamily: "'DM Sans', sans-serif", color: "#fff" }}>

        {/* HEADER */}
        <header style={{ position: "sticky", top: 0, zIndex: 100 }}>
          {/* Franja roja superior */}
          <div style={{ background: "#cc0000", padding: "10px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 28 }}>
              {["🚗 Vehículos por encargo", "✅ Kilómetros certificados", "💳 Financiamos su coche"].map(t => (
                <span key={t} style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{t}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>📞 666 328 561</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>ruzmotor@gmail.com</span>
            </div>
          </div>
          {/* Header principal */}
          <div style={{ background: "rgba(8,8,18,0.97)", borderBottom: "3px solid #cc0000", padding: "22px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(16px)" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1 }}>
              <svg width="68" height="24" viewBox="0 0 52 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 6 }}>
                <path d="M6 13H46M4 13L8 7H44L48 13" stroke="#cc0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 7L15.5 3H36.5L39 7" stroke="#cc0000" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="13" cy="14.5" r="2.5" fill="#cc0000" />
                <circle cx="39" cy="14.5" r="2.5" fill="#cc0000" />
              </svg>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: 6, color: "#cc0000", lineHeight: 1 }}>RUZ</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: 6, color: "#ffffff", lineHeight: 1 }}>MOTOR</span>
              </div>
              <div style={{ fontSize: 11, letterSpacing: 4, color: "#888", textTransform: "uppercase", marginTop: 4 }}>Vehículos de Ocasión · Córdoba</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {isAdmin && (
                <>
                  <span style={{ fontSize: 12, color: "#cc0000", background: "rgba(204,0,0,0.1)", border: "1px solid rgba(204,0,0,0.3)", borderRadius: 6, padding: "4px 10px" }}>
                    👑 {auth.username}
                  </span>
                  <button onClick={() => { setEditing(null); setShowForm(true); }}
                    style={{ padding: "10px 20px", background: "linear-gradient(135deg, #cc0000, #ff2222)", border: "none", color: "#fff", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
                    + Añadir vehículo
                  </button>
                  <button onClick={handleLogout}
                    style={{ padding: "10px 16px", background: "transparent", border: "1px solid #333", color: "#888", borderRadius: 10, cursor: "pointer", fontSize: 13 }}>
                    Salir
                  </button>
                </>
              )}
              {!auth && (
                <button onClick={() => setShowLogin(true)}
                  style={{ padding: "10px 20px", background: "transparent", border: "1px solid #333", color: "#666", borderRadius: 10, cursor: "pointer", fontSize: 12, transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#cc0000"; e.currentTarget.style.color = "#cc0000"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#666"; }}>
                  Administración
                </button>
              )}
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
          {/* Error de conexión */}
          {apiError && (
            <div style={{ background: "rgba(220,53,69,0.1)", border: "1px solid rgba(220,53,69,0.3)", borderRadius: 10, padding: "16px 20px", marginBottom: 24, color: "#dc3545", fontSize: 14 }}>
              ⚠️ {apiError}
            </div>
          )}

          {/* SEARCH */}
          <div style={{ marginBottom: 28, position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#555", fontSize: 16 }}>🔍</span>
            <input style={{ width: "100%", padding: "12px 14px 12px 42px", background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              placeholder="Buscar por marca, modelo, año, combustible..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* GRID */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "#555" }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🚗</div>
              <div style={{ fontSize: 20, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 }}>
                {vehicles.length === 0 ? "No hay vehículos en stock" : "No se encontraron resultados"}
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
              {filtered.map(v => (
                <VehicleCard key={v.id} vehicle={v} isAdmin={isAdmin}
                  onEdit={v => { setEditing(v); setShowForm(true); }}
                  onDelete={setDeleteId}
                  onView={setViewing} />
              ))}
            </div>
          )}
        </main>

        {/* MODALS */}
        {showLogin && <LoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} />}

        {(showForm || editing) && isAdmin && (
          <Modal title={editing ? "Editar vehículo" : "Nuevo vehículo"} onClose={() => { setShowForm(false); setEditing(null); }}>
            <VehicleForm initial={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} loading={formLoading} />
          </Modal>
        )}

        {viewing && (
          <Modal title="" onClose={() => setViewing(null)}>
            {viewing.imagenes?.length > 0 && <div style={{ margin: "-28px -28px 24px" }}><img src={viewing.imagenes[0]} alt="" style={{ width: "100%", height: 320, objectFit: "cover", display: "block" }} /></div>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, color: "#D4AF37", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3 }}>{viewing.marca}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", fontFamily: "'Bebas Neue', sans-serif" }}>{viewing.modelo} · {viewing.año}</div>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#D4AF37", fontFamily: "'Bebas Neue', sans-serif" }}>{Number(viewing.precio).toLocaleString("es-ES")} €</div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 12, background: "rgba(212,175,55,0.1)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 6, padding: "4px 12px" }}>⛽ {viewing.combustible}</span>
              <span style={{ fontSize: 12, background: "rgba(255,255,255,0.05)", color: "#aaa", border: "1px solid #333", borderRadius: 6, padding: "4px 12px" }}>🛣️ {Number(viewing.km).toLocaleString("es-ES")} km</span>
            </div>
            <p style={{ fontSize: 14, color: "#bbb", lineHeight: 1.7, margin: 0 }}>{viewing.descripcion}</p>
          </Modal>
        )}

        {deleteId && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            <div style={{ background: "#0d0d1a", border: "1px solid #2a2a4a", borderRadius: 16, padding: 32, maxWidth: 360, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>¿Eliminar vehículo?</div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>Esta acción no se puede deshacer.</div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: 12, background: "transparent", border: "1px solid #333", color: "#aaa", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
                <button onClick={confirmDelete} style={{ flex: 1, padding: 12, background: "#dc3545", border: "none", color: "#fff", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Eliminar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}