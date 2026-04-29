import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modalData, setModalData] = useState({
    name: '', docType: 'CC', doc: '', phone: '', eps: '',
    tipo: 'Primera vez', prof: 'Opt. Andrea Salcedo', motivo: '', historial: ''
  });

  const [activeTab, setActiveTab] = useState('datos');
  const [toastMsg, setToastMsg] = useState('');
  const [waType, setWaType] = useState('receta');
  const [waPhone, setWaPhone] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = () => {
    const list = JSON.parse(localStorage.getItem('patients_list')) || [];
    setPatients(list);
  };

  const savePatients = (list) => {
    localStorage.setItem('patients_list', JSON.stringify(list));
    setPatients(list);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleOpenNewModal = () => {
    setModalData({
      name: '', docType: 'CC', doc: '', phone: '', eps: '',
      tipo: 'Primera vez', prof: 'Opt. Andrea Salcedo', motivo: '', historial: ''
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (!selectedId) return;
    const p = patients.find(x => x.id === selectedId);
    if (!p) return;
    
    let hist = '';
    const rdaStr = localStorage.getItem('rda_data_' + selectedId);
    if (rdaStr) {
      const rdaData = JSON.parse(rdaStr);
      hist = rdaData.historial || '';
    }

    setModalData({
      name: p.name, docType: p.docType || 'CC', doc: p.doc,
      phone: p.phone, eps: p.eps, tipo: p.tipo || 'Primera vez',
      prof: p.prof || 'Opt. Andrea Salcedo', motivo: p.motivo || '',
      historial: hist
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!modalData.name || !modalData.doc) {
      alert("Nombre y documento son obligatorios.");
      return;
    }

    if (isEditing) {
      const newList = [...patients];
      const pIndex = newList.findIndex(x => x.id === selectedId);
      if (pIndex !== -1) {
        newList[pIndex] = { ...newList[pIndex], ...modalData };
        savePatients(newList);
        
        const rdaStr = localStorage.getItem('rda_data_' + selectedId);
        let rdaData = rdaStr ? JSON.parse(rdaStr) : {};
        rdaData.historial = modalData.historial;
        localStorage.setItem('rda_data_' + selectedId, JSON.stringify(rdaData));
        
        showToast("Paciente actualizado con éxito");
      }
    } else {
      const newId = Date.now().toString();
      const newPatient = {
        id: newId,
        ...modalData,
        status: 'proceso',
        tls: ['done', 'prog', 'pend'] // Timeline status
      };
      savePatients([newPatient, ...patients]);
      setSelectedId(newId);
      
      // Navigate to RDA immediately
      navigate(`/rda/${newId}`);
    }
    setIsModalOpen(false);
  };

  const filteredPatients = patients.filter(p => {
    const nameStr = p.name || '';
    const docStr = p.doc || '';
    const matchesSearch = nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          docStr.includes(searchTerm);
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const selectedPatient = patients.find(p => p.id === selectedId);

  // Stats
  const countToday = patients.length;
  const countWait = patients.filter(p => p.status === 'espera' || p.status === 'proceso').length;
  const countDone = patients.filter(p => p.status === 'completado').length;

  const getWaPreview = () => {
    if (!selectedPatient) return "Seleccione un paciente para previsualizar el mensaje.";
    const n = (selectedPatient.name || 'Paciente').split(' ')[0];
    switch(waType) {
      case 'receta': return `Hola ${n}, te informamos de Clínica Oftálmica que tu receta óptica ya está lista para ser retirada en nuestra sede.`;
      case 'cita': return `Hola ${n}, te recordamos tu cita programada en Clínica Oftálmica. Por favor confirmar asistencia.`;
      case 'resultado': return `Hola ${n}, tus resultados de examen ya se encuentran disponibles en el sistema de Clínica Oftálmica.`;
      case 'control': return `Hola ${n}, es momento de agendar tu control oftalmológico anual. ¡Cuida tu visión con nosotros!`;
      case 'lentes': return `Hola ${n}, tus lentes nuevos ya están listos para entrega. Te esperamos en la óptica.`;
      case 'personalizado': return `Hola ${n}, ...`;
      default: return '';
    }
  };

  const copyWaMsg = () => {
    if (!selectedPatient) return;
    navigator.clipboard.writeText(getWaPreview());
    showToast("Mensaje copiado al portapapeles");
  };

  const sendWa = () => {
    if (!selectedPatient) return;
    const phone = waPhone || selectedPatient.phone;
    if (!phone) { alert("Ingrese un número de WhatsApp"); return; }
    const num = phone.replace(/\D/g,'');
    const msg = encodeURIComponent(getWaPreview());
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  };

  useEffect(() => {
    if (selectedPatient) {
      setWaPhone(selectedPatient.phone || '');
    }
  }, [selectedPatient]);

  return (
    <div className="dashboard-container">
      {/* TOPBAR */}
      <div className="topbar">
        <div className="brand">
          <div className="logo-circle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <ellipse cx="12" cy="12" rx="10" ry="10" stroke="white" strokeWidth="1.5"/>
              <path d="M2 12 C7 6 17 6 22 12 C17 18 7 18 2 12Z" stroke="white" strokeWidth="1.4" fill="none"/>
              <circle cx="12" cy="12" r="3.5" fill="#34d399"/>
              <circle cx="12" cy="12" r="1.5" fill="white"/>
            </svg>
          </div>
          <div>
            <div className="brand-name">Clínica Oftálmica</div>
            <div className="brand-sub">Panel de gestión RDA</div>
          </div>
        </div>
        <div className="topbar-right">
          <span className="badge-live"><span className="dot"></span>SISTEMA EN LÍNEA</span>
          <button className="btn-top btn-wa-top" onClick={() => showToast('Conectando con WhatsApp Business API…')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#1e293b"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp Business
          </button>
          <button className="btn-top btn-outline-light" onClick={() => {
            if(selectedId) navigate('/rda/'+selectedId);
            else navigate('/rda/new');
          }}>Ir a RDA</button>
          <button className="btn-top btn-new" onClick={handleOpenNewModal}>+ Nuevo RDA</button>
        </div>
      </div>

      {/* METRICS */}
      <div className="metrics-bar">
        <div className="metric">
          <div className="metric-label">Atenciones hoy</div>
          <div className="metric-num mn-blue">{countToday}</div>
          <div className="metric-sub">Pacientes registrados</div>
        </div>
        <div className="metric">
          <div className="metric-label">En espera / Proceso</div>
          <div className="metric-num mn-amber">{countWait}</div>
          <div className="metric-sub">Requieren atención</div>
        </div>
        <div className="metric">
          <div className="metric-label">Completados</div>
          <div className="metric-num mn-green">{countDone}</div>
          <div className="metric-sub">RDA finalizado</div>
        </div>
        <div className="metric">
          <div className="metric-label">Tasa de conversión</div>
          <div className="metric-num mn-blue">85%</div>
          <div className="metric-sub">Cotizaciones exitosas</div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="main-grid">
        {/* PANEL IZQUIERDO */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Fila de Pacientes</div>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Buscar paciente o CC..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-row">
            <button className={`fbtn ${filter==='all'?'active':''}`} onClick={()=>setFilter('all')}>Todos</button>
            <button className={`fbtn ${filter==='espera'?'active':''}`} onClick={()=>setFilter('espera')}>En espera</button>
            <button className={`fbtn ${filter==='proceso'?'active':''}`} onClick={()=>setFilter('proceso')}>En proceso</button>
            <button className={`fbtn ${filter==='completado'?'active':''}`} onClick={()=>setFilter('completado')}>Completados</button>
          </div>
          
          <div className="patient-list">
            {filteredPatients.length === 0 && <div style={{padding:'20px', color:'#64748b', fontSize:'0.85rem'}}>No hay pacientes.</div>}
            {filteredPatients.map(p => (
              <div key={p.id} className={`patient-row ${selectedId === p.id ? 'active' : ''}`} onClick={() => setSelectedId(p.id)}>
                <div className={`avatar av-${(p.name || 'P').charAt(0).toLowerCase()}`}>{(p.name || 'P').charAt(0).toUpperCase()}</div>
                <div className="patient-info">
                  <div className="patient-name">{p.name || 'Sin nombre'}</div>
                  <div className="patient-meta">{p.docType} {p.doc} • {p.tipo}</div>
                </div>
                <div className={`status-pill sp-${p.status === 'completado' ? 'done' : p.status === 'proceso' ? 'prog' : p.status === 'espera' ? 'pend' : 'canc'}`}>
                  {p.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="panel" style={{display:'flex', flexDirection:'column'}}>
          {!selectedPatient ? (
            <div style={{padding:'40px 20px', textAlign:'center', color:'#64748b', fontSize:'0.85rem'}}>
              Seleccione un paciente de la lista para ver sus detalles.
            </div>
          ) : (
            <>
              <div className="det-head" style={{display:'flex', justifyContent:'space-between'}}>
                <div>
                  <div className={`det-av av-${(selectedPatient.name || 'P').charAt(0).toLowerCase()}`}>{(selectedPatient.name || 'P').charAt(0).toUpperCase()}</div>
                  <div className="det-name">{selectedPatient.name || 'Sin nombre'}</div>
                  <div className="det-sub">CC {selectedPatient.doc} • {selectedPatient.eps}</div>
                </div>
                <button className="btn-edit" onClick={handleOpenEditModal}>✏️ Editar</button>
              </div>

              <div className="tab-row">
                <div className={`tab ${activeTab==='datos'?'active':''}`} onClick={()=>setActiveTab('datos')}>Datos Básicos</div>
                <div className={`tab ${activeTab==='historial'?'active':''}`} onClick={()=>setActiveTab('historial')}>Proceso RDA</div>
                <div className={`tab ${activeTab==='clinica'?'active':''}`} onClick={()=>setActiveTab('clinica')}>H. Clínica</div>
              </div>

              {activeTab === 'datos' && (
                <div className="tab-content show">
                  <div className="det-row"><span className="det-lbl">Teléfono</span><span className="det-val">{selectedPatient.phone || '-'}</span></div>
                  <div className="det-row"><span className="det-lbl">Motivo</span><span className="det-val">{selectedPatient.motivo || '-'}</span></div>
                  <div className="det-row"><span className="det-lbl">Profesional</span><span className="det-val">{selectedPatient.prof || '-'}</span></div>
                </div>
              )}

              {activeTab === 'historial' && (
                <div className="tab-content show">
                  <div className="tl-wrap">
                    <div className="tl-item">
                      <div className={`tl-dot tl-${selectedPatient.tls?.[0] || 'skip'}`}></div>
                      <div>
                        <div className="tl-text">Admisión y Registro</div>
                        <div className="tl-time">Datos creados</div>
                      </div>
                    </div>
                    <div className="tl-item">
                      <div className={`tl-dot tl-${selectedPatient.tls?.[1] || 'pend'}`}></div>
                      <div>
                        <div className="tl-text">Consulta Optometría</div>
                        <div className="tl-time">RDA Médico</div>
                      </div>
                    </div>
                    <div className="tl-item">
                      <div className={`tl-dot tl-${selectedPatient.tls?.[2] || 'skip'}`}></div>
                      <div>
                        <div className="tl-text">Asesoría / Óptica</div>
                        <div className="tl-time">Cotización y Venta</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'clinica' && (
                <div className="tab-content show">
                  <div style={{padding:'14px 20px 0'}}>
                    <button className="btn-outline-full" onClick={() => window.open(`/historial/${selectedId}`, '_blank')}>
                      📄 Exportar a PDF / Pestaña Nueva
                    </button>
                  </div>
                  <div style={{padding:'14px 20px', fontSize:'0.82rem', whiteSpace:'pre-wrap', color:'#1e293b'}}>
                    {(() => {
                       const rda = JSON.parse(localStorage.getItem('rda_data_' + selectedId) || '{}');
                       return rda.historial || 'No hay notas registradas.';
                    })()}
                  </div>
                </div>
              )}

              <div style={{flex:1}}></div>

              <div className="wa-panel">
                <div className="wa-panel-title">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#64748b" style={{verticalAlign:'middle', marginRight:'4px'}}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Notificación WhatsApp Business
                </div>
                <select className="wa-select" value={waType} onChange={e => setWaType(e.target.value)}>
                  <option value="receta">📋 Receta óptica lista para retirar</option>
                  <option value="cita">📅 Recordatorio de cita</option>
                  <option value="resultado">🔬 Resultados de examen disponibles</option>
                  <option value="control">👁️ Control oftalmológico programado</option>
                  <option value="lentes">👓 Lentes listos para entrega</option>
                  <option value="personalizado">✏️ Mensaje personalizado</option>
                </select>
                <div className="wa-preview">{getWaPreview()}</div>
                <div className="phone-row">
                  <input type="tel" value={waPhone} onChange={e => setWaPhone(e.target.value)} placeholder="+57 300 000 0000" />
                  <button className="btn-copy" onClick={copyWaMsg}>Copiar</button>
                </div>
                <button className="btn-send" onClick={sendWa}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#1e293b"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Enviar por WhatsApp
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* TOAST */}
      <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay show">
          <div className="modal">
            <div className="modal-title">{isEditing ? "Editar Paciente" : "Nuevo Registro"}</div>
            <div className="modal-sub">Ingrese los datos básicos para el RDA</div>
            <div className="modal-grid">
              <div className="mfield span2">
                <label>Nombre completo del paciente</label>
                <input type="text" value={modalData.name} onChange={e => setModalData({...modalData, name: e.target.value})} />
              </div>
              <div className="mfield">
                <label>Tipo doc.</label>
                <select value={modalData.docType} onChange={e => setModalData({...modalData, docType: e.target.value})}>
                  <option>CC</option><option>TI</option><option>CE</option><option>PA</option>
                </select>
              </div>
              <div className="mfield">
                <label>N° documento</label>
                <input type="text" value={modalData.doc} onChange={e => setModalData({...modalData, doc: e.target.value})} />
              </div>
              <div className="mfield">
                <label>Teléfono / WhatsApp</label>
                <input type="tel" value={modalData.phone} onChange={e => setModalData({...modalData, phone: e.target.value})} />
              </div>
              <div className="mfield">
                <label>EPS / Aseguradora</label>
                <input type="text" value={modalData.eps} onChange={e => setModalData({...modalData, eps: e.target.value})} />
              </div>
              <div className="mfield">
                <label>Tipo de consulta</label>
                <select value={modalData.tipo} onChange={e => setModalData({...modalData, tipo: e.target.value})}>
                  <option>Primera vez</option><option>Control</option><option>Urgencia</option><option>Post-quirúrgico</option>
                </select>
              </div>
              <div className="mfield">
                <label>Profesional</label>
                <select value={modalData.prof} onChange={e => setModalData({...modalData, prof: e.target.value})}>
                  <option>Opt. Andrea Salcedo</option><option>Dr. Héctor Monsalve</option>
                </select>
              </div>
              <div className="mfield span2">
                <label>Motivo de consulta</label>
                <textarea style={{minHeight:'56px'}} value={modalData.motivo} onChange={e => setModalData({...modalData, motivo: e.target.value})}></textarea>
              </div>
              {isEditing && (
                <div className="mfield span2">
                  <label>Historia Clínica</label>
                  <textarea style={{minHeight:'100px'}} value={modalData.historial} onChange={e => setModalData({...modalData, historial: e.target.value})}></textarea>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="mbtn mbtn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="mbtn mbtn-save" onClick={handleSaveModal}>{isEditing ? 'Guardar Cambios' : 'Crear RDA'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
