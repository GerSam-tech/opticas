let defaultPatients = [
  {id:1,init:"MR",av:"av-t",name:"María Rodríguez",age:42,doc:"CC 1.023.456.789",dx:"H52.1 – Miopía bilateral",hora:"08:00",prof:"Opt. Andrea Salcedo",eps:"Sura EPS",phone:"+573124567890",receta:"OD: -2.50 -0.75 x 180 / OI: -2.25 Esf",pio:"OD 14 / OI 13 mmHg",prox:"15 abr 2025",status:"completado",tls:["done","done","done","done"]},
  {id:2,init:"CJ",av:"av-b",name:"Carlos Jiménez",age:35,doc:"CC 98.234.567",dx:"H52.4 – Presbicia",hora:"08:45",prof:"Opt. Andrea Salcedo",eps:"Compensar",phone:"+573219876543",receta:"OD: +1.00 Add +2.00 / OI: +0.75 Add +2.00",pio:"OD 15 / OI 14 mmHg",prox:"6 meses",status:"completado",tls:["done","done","done","done"]},
  {id:3,init:"LF",av:"av-p",name:"Luisa Fernanda Arias",age:28,doc:"CC 1.089.123.456",dx:"H52.2 – Astigmatismo mixto",hora:"09:30",prof:"Dr. Héctor Monsalve",eps:"Nueva EPS",phone:"+573001112233",receta:"OD: Pl -1.25 x 90 / OI: Pl -1.00 x 85",pio:"OD 12 / OI 12 mmHg",prox:"3 meses",status:"en proceso",tls:["done","done","pend","pend"]},
  {id:4,init:"JR",av:"av-a",name:"Jorge Ramírez",age:67,doc:"CC 10.234.567",dx:"H40.1 – Sospecha de glaucoma",hora:"10:15",prof:"Dr. Héctor Monsalve",eps:"Sura EPS",phone:"+573157778899",receta:"Pendiente – remitido a OCT",pio:"OD 21 / OI 22 mmHg",prox:"Remisión urgente",status:"pendiente",tls:["done","pend","pend","pend"]},
  {id:5,init:"VC",av:"av-c",name:"Valentina Castro",age:19,doc:"TI 1.004.567.890",dx:"H52.0 – Hipermetropía simple",hora:"11:00",prof:"Opt. Andrea Salcedo",eps:"Particular",phone:"+573043334455",receta:"OD: +1.75 Esf / OI: +1.50 Esf",pio:"OD 13 / OI 13 mmHg",prox:"1 año",status:"pendiente",tls:["done","pend","pend","pend"]},
  {id:6,init:"AM",av:"av-g",name:"Andrés Morales",age:55,doc:"CC 70.234.567",dx:"H26.9 – Catarata senil bilateral",hora:"11:45",prof:"Dr. Héctor Monsalve",eps:"Compensar",phone:"+573162223344",receta:"Remitido a cirugía – catarata OD",pio:"OD 16 / OI 17 mmHg",prox:"Consulta quirúrgica",status:"completado",tls:["done","done","done","done"]},
  {id:7,init:"PE",av:"av-b",name:"Patricia Echeverri",age:48,doc:"CC 43.123.456",dx:"H04.1 – Síndrome de ojo seco",hora:"12:30",prof:"Opt. Andrea Salcedo",eps:"Sanitas",phone:"+573185556677",receta:"Lágrimas artificiales c/6h + omega 3",pio:"OD 14 / OI 15 mmHg",prox:"2 meses",status:"completado",tls:["done","done","done","done"]},
];

let patients;
try {
  patients = JSON.parse(localStorage.getItem('patients_list'));
} catch (e) {
  console.error("Error parsing patients_list from localStorage", e);
  patients = null;
}

if (!patients || !Array.isArray(patients) || patients.length === 0) {
  patients = [...defaultPatients];
  localStorage.setItem('patients_list', JSON.stringify(patients));
}

const msgs = {
  receta:"Hola {nombre} 👋, le informamos que su *receta óptica* ya está lista para retirar en nuestra clínica. 📋\n\n⏰ Horario: Lun–Sáb 8am–6pm\n📍 Consulte nuestra dirección al responder este mensaje.\n\n¡Gracias por su confianza! 🙏\n_Clínica Oftálmica & Optometría_",
  cita:"Hola {nombre} 😊, le recordamos que tiene una *cita programada* con nosotros próximamente. 📅\n\nPor favor confirme su asistencia respondiendo *SÍ* a este mensaje o contáctenos si necesita reagendar.\n\n_Clínica Oftálmica & Optometría_",
  resultado:"Hola {nombre}, sus *resultados de examen oftalmológico* ya están disponibles en nuestra clínica. 🔬\n\nPuede pasar a recogerlos en horario de atención o solicitar el envío digital respondiendo este mensaje.\n\n_Clínica Oftálmica & Optometría_",
  control:"Hola {nombre} 👁️, es momento de su *control oftalmológico* periódico. Le recomendamos agendar su próxima visita para mantener su salud visual.\n\nResponda este mensaje o llámenos para reservar su cita. 📞\n\n_Clínica Oftálmica & Optometría_",
  lentes:"Hola {nombre} 👓, ¡buenas noticias! Sus *lentes ópticos* ya están listos para entrega en nuestra clínica.\n\n⏰ Horario: Lun–Sáb 8am–6pm\nRecuerde traer su orden para la entrega.\n\n¡Esperamos verle pronto! ✨\n_Clínica Oftálmica & Optometría_",
  personalizado:"Hola {nombre},\n\n[Escriba aquí su mensaje personalizado para el paciente]\n\n_Clínica Oftálmica & Optometría_"
};

let currentFilter = 'todos';
let currentSearch = '';
let selectedId = null;
let waCountNum = 6;

function init(){
  const d = new Date();
  const opts = {weekday:'long',year:'numeric',month:'long',day:'numeric'};
  document.getElementById('fecha-hoy').textContent = d.toLocaleDateString('es-CO',opts);
  renderList();
}

function renderList(){
  const list = document.getElementById('patient-list');
  const items = patients.filter(p => {
    const mf = currentFilter === 'todos' || p.status === currentFilter;
    const ms = !currentSearch || p.name.toLowerCase().includes(currentSearch.toLowerCase()) || p.dx.toLowerCase().includes(currentSearch.toLowerCase());
    return mf && ms;
  });
  if(!items.length){
    list.innerHTML = '<div style="padding:24px 20px;font-size:.82rem;color:#6b7a8d;text-align:center">Sin resultados para esta búsqueda</div>';
    return;
  }
  list.innerHTML = items.map(p => `
    <div class="patient-row${selectedId===p.id?' active':''}" onclick="selectPatient(${p.id})">
      <div class="avatar ${p.av}">${p.init}</div>
      <div class="patient-info">
        <div class="patient-name">${p.name}</div>
        <div class="patient-meta">${p.hora} &nbsp;·&nbsp; ${p.prof.split('.')[1]||p.prof} &nbsp;·&nbsp; ${p.dx.split('–')[1]||p.dx}</div>
      </div>
      <span class="status-pill ${spClass(p.status)}">${p.status}</span>
      <div class="wa-quick" onclick="event.stopPropagation();quickWA(${p.id})" title="Notificar por WhatsApp">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </div>
    </div>
  `).join('');
}

const statusClasses = {
  'completado': 'sp-done',
  'en proceso': 'sp-prog',
  'cancelado': 'sp-canc'
};
function spClass(s) { return statusClasses[s] || 'sp-pend'; }

const avColors = {
  'av-t':'background:#e1f5ee;color:#065f46',
  'av-b':'background:#dbeafe;color:#1e40af',
  'av-p':'background:#ede9fe;color:#5b21b6',
  'av-a':'background:#fef3c7;color:#92400e',
  'av-c':'background:#fce7f3;color:#9d174d',
  'av-g':'background:#f0fdf4;color:#166534'
};

function selectPatient(id){
  const p = patients.find(x=>x.id===id);
  if (!p) return;
  
  selectedId = id;
  const av = document.getElementById('det-av');
  av.textContent = p.init;
  av.className = 'det-av';
  av.style.cssText = avColors[p.av]||'background:#e8edf3;color:#374151';
  document.getElementById('det-name').textContent = p.name;
  document.getElementById('det-sub').textContent = p.doc + ' · ' + p.age + ' años · ' + p.eps;
  
  const editBtn = document.getElementById('btn-edit-patient');
  if (editBtn) editBtn.style.display = 'block';

  const rdaDataStr = localStorage.getItem('rda_data_' + id);
  let histText = 'Seleccione un paciente para ver su historia clínica.';
  if (rdaDataStr) {
    const rdaData = JSON.parse(rdaDataStr);
    histText = rdaData.historial || 'No hay historia clínica registrada.';
  } else {
    histText = 'No se ha guardado un RDA para este paciente.';
  }
  const histContainer = document.getElementById('det-historia-clinica');
  if (histContainer) histContainer.textContent = histText;
  const fields = [
    ['Diagnóstico', p.dx],
    ['Hora atención', p.hora],
    ['Profesional', p.prof],
    ['Formulación', p.receta],
    ['PIO', p.pio],
    ['Próxima cita', p.prox],
    ['Estado', `<span class="status-pill ${spClass(p.status)}">${p.status}</span>`]
  ];
  document.getElementById('det-rows').innerHTML = fields.map(([l,v])=>`
    <div class="det-row"><span class="det-lbl">${l}</span><span class="det-val">${v}</span></div>
  `).join('');
  const tlLabels = ['Admisión registrada','Examen optométrico','Formulación entregada','Notificación enviada'];
  document.getElementById('tl-wrap').innerHTML = tlLabels.map((lbl,i)=>`
    <div class="tl-item">
      <div class="tl-dot tl-${p.tls[i]}"></div>
      <div>
        <div class="tl-text">${lbl}</div>
        <div class="tl-time">${p.tls[i]==='done'?'Completado · '+p.hora:'Pendiente'}</div>
      </div>
    </div>
  `).join('');
  document.getElementById('wa-phone').value = '+' + p.phone.replace(/\D/g,'');
  updatePreview();
  renderList();
}

function updatePreview(){
  const p = patients.find(x=>x.id===selectedId);
  if(!p){document.getElementById('wa-preview').textContent='Seleccione un paciente para previsualizar el mensaje.';return;}
  const type = document.getElementById('wa-type').value;
  const firstName = p.name.split(' ')[0];
  document.getElementById('wa-preview').textContent = msgs[type].replace(/\{nombre\}/g,firstName);
}

function sendWA(){
  const p = patients.find(x=>x.id===selectedId);
  if(!p){showToast('Seleccione un paciente primero',false);return;}
  const phone = document.getElementById('wa-phone').value.replace(/\D/g,'');
  if(!phone||phone.length<7){showToast('Ingrese un número válido',false);return;}
  const msg = encodeURIComponent(document.getElementById('wa-preview').textContent);
  window.open('https://wa.me/'+phone+'?text='+msg,'_blank');
  waCountNum++;
  document.getElementById('waCount').textContent = waCountNum;
  showToast('✓ Abriendo WhatsApp — '+p.name,true);
  if(p.tls[3]==='pend'){p.tls[3]='done';}
}

function quickWA(id){
  selectPatient(id);
  document.getElementById('wa-type').value='receta';
  updatePreview();
  sendWA();
}

function copyMsg(){
  const txt = document.getElementById('wa-preview').textContent;
  navigator.clipboard.writeText(txt).then(()=>showToast('Mensaje copiado al portapapeles',true)).catch(()=>showToast('No se pudo copiar',false));
}

function setFilter(btn,f){
  document.querySelectorAll('.fbtn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter=f;
  renderList();
}

function filterList(v){currentSearch=v;renderList();}

function switchTab(tab,name){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('show'));
  tab.classList.add('active');
  document.getElementById('tab-'+name).classList.add('show');
}

function openModal(){
  document.getElementById('modal-title').textContent = 'Nuevo Registro de Atención';
  document.getElementById('modal-sub').textContent = 'Ingrese los datos básicos para iniciar el RDA';
  document.getElementById('modal-save-btn').textContent = 'Crear RDA';
  document.getElementById('modal-save-btn').onclick = saveNew;
  
  document.getElementById('new-name').value = '';
  document.getElementById('new-doc-type').value = 'CC';
  document.getElementById('new-doc').value = '';
  document.getElementById('new-phone').value = '';
  document.getElementById('new-eps').value = '';
  document.getElementById('new-tipo').value = 'Primera vez';
  document.getElementById('new-prof').value = 'Opt. Andrea Salcedo';
  document.getElementById('new-motivo').value = '';
  
  const histContainer = document.getElementById('edit-historial-container');
  if(histContainer) histContainer.style.display = 'none';
  const histText = document.getElementById('edit-historial');
  if(histText) histText.value = '';
  
  document.getElementById('modal').classList.add('show');
}

function openEditModal(){
  if(!selectedId) return;
  const p = patients.find(x=>x.id===selectedId);
  if(!p) return;
  
  document.getElementById('modal-title').textContent = 'Editar Paciente';
  document.getElementById('modal-sub').textContent = 'Modifique los datos básicos del paciente';
  document.getElementById('modal-save-btn').textContent = 'Guardar Cambios';
  document.getElementById('modal-save-btn').onclick = updatePatient;
  
  document.getElementById('new-name').value = p.name;
  
  const docParts = p.doc.split(' ');
  if(docParts.length > 1) {
    document.getElementById('new-doc-type').value = docParts[0];
    document.getElementById('new-doc').value = docParts.slice(1).join(' ');
  } else {
    document.getElementById('new-doc').value = p.doc;
  }
  
  document.getElementById('new-phone').value = p.phone;
  document.getElementById('new-eps').value = p.eps;
  document.getElementById('new-prof').value = p.prof;
  document.getElementById('new-motivo').value = p.dx;
  
  const histContainer = document.getElementById('edit-historial-container');
  const histText = document.getElementById('edit-historial');
  if(histContainer && histText) {
    histContainer.style.display = 'block';
    const rdaDataStr = localStorage.getItem('rda_data_' + selectedId);
    if(rdaDataStr) {
      const rdaData = JSON.parse(rdaDataStr);
      histText.value = rdaData.historial || '';
    } else {
      histText.value = '';
    }
  }
  
  document.getElementById('modal').classList.add('show');
}
function closeModal(){document.getElementById('modal').classList.remove('show')}
function saveNew(){
  const name = document.getElementById('new-name').value || 'Paciente Nuevo';
  const doc = document.getElementById('new-doc-type').value + ' ' + document.getElementById('new-doc').value;
  const phone = document.getElementById('new-phone').value || '';
  const eps = document.getElementById('new-eps').value || '';
  const prof = document.getElementById('new-prof').value || '';
  const dx = document.getElementById('new-motivo').value || 'Sin diagnóstico';
  
  const newId = Date.now();
  const newPatient = {
    id: newId,
    init: name.substring(0, 2).toUpperCase(),
    av: 'av-b',
    name: name,
    age: '-',
    doc: doc,
    dx: dx,
    hora: new Date().toTimeString().slice(0,5),
    prof: prof,
    eps: eps,
    phone: phone,
    receta: 'Pendiente',
    pio: '-',
    prox: '-',
    status: 'en proceso',
    tls: ['done','pend','pend','pend']
  };
  patients.push(newPatient);
  localStorage.setItem('patients_list', JSON.stringify(patients));

  showToast('✓ Redirigiendo a formulario RDA...',true);
  setTimeout(() => {
    window.location.href = 'RDA_Oftalmica_Optometria.html?id=' + newId;
  }, 1000);
}

function updatePatient() {
  if(!selectedId) return;
  const pIndex = patients.findIndex(x=>x.id===selectedId);
  if(pIndex === -1) return;
  
  const name = document.getElementById('new-name').value || 'Paciente Editado';
  const doc = document.getElementById('new-doc-type').value + ' ' + document.getElementById('new-doc').value;
  const phone = document.getElementById('new-phone').value || '';
  const eps = document.getElementById('new-eps').value || '';
  const prof = document.getElementById('new-prof').value || '';
  const dx = document.getElementById('new-motivo').value || 'Sin diagnóstico';
  
  patients[pIndex].name = name;
  patients[pIndex].init = name.substring(0, 2).toUpperCase();
  patients[pIndex].doc = doc;
  patients[pIndex].phone = phone;
  patients[pIndex].eps = eps;
  patients[pIndex].prof = prof;
  patients[pIndex].dx = dx;
  
  localStorage.setItem('patients_list', JSON.stringify(patients));
  
  const histText = document.getElementById('edit-historial');
  if(histText && document.getElementById('edit-historial-container').style.display !== 'none') {
    let rdaDataStr = localStorage.getItem('rda_data_' + selectedId);
    let rdaData = rdaDataStr ? JSON.parse(rdaDataStr) : { fields: [], pills: [] };
    rdaData.historial = histText.value;
    localStorage.setItem('rda_data_' + selectedId, JSON.stringify(rdaData));
    
    const histDetContainer = document.getElementById('det-historia-clinica');
    if(histDetContainer) {
      histDetContainer.textContent = rdaData.historial || 'No hay historia clínica registrada.';
    }
  }
  
  closeModal();
  renderList();
  selectPatient(selectedId);
  showToast('✓ Paciente y su historia han sido actualizados',true);
}

let toastTimeout;
function showToast(msg,ok=true){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.style.background=ok?'#0a1628':'#dc2626';
  t.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout=setTimeout(()=>t.classList.remove('show'),3200);
}

document.getElementById('modal').addEventListener('click',function(e){if(e.target===this)closeModal()});

init();
if (patients.length > 0) {
  selectPatient(patients[0].id);
}
