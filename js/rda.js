  // Fecha y hora automáticas
  const now = new Date();
  document.getElementById('fecha').value = now.toISOString().split('T')[0];
  document.getElementById('hora').value = now.toTimeString().slice(0,5);
  // N° RDA aleatorio demo
  document.getElementById('rdaNum').textContent = 'OFT-' + String(Math.floor(Math.random()*90000)+10000);

  function toggle(header) {
    const body = header.nextElementSibling;
    const chev = header.querySelector('.chevron');
    body.classList.toggle('collapsed');
    chev.classList.toggle('open');
  }

  function markCheck(cb) {
    cb.closest('.check-item').classList.toggle('checked', cb.checked);
  }

  function toggleDx(pill) {
    pill.classList.toggle('active');
    updateDxField();
  }

  function updateDxField() {
    const active = [...document.querySelectorAll('.dx-pill.active')].map(p => p.dataset.code + ' – ' + p.textContent.trim().replace(/^H\S+\s+/, '')).join('\n');
    document.getElementById('dxField').value = active;
  }

  function clearForm() {
    if(confirm('¿Desea limpiar todos los campos del formulario?')) {
      document.querySelectorAll('input:not([type=radio]):not([type=checkbox]), textarea, select').forEach(el => {
        if(el.type === 'date' || el.type === 'time') return;
        el.value = '';
      });
      document.querySelectorAll('.dx-pill').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.check-item').forEach(c => { c.classList.remove('checked'); c.querySelector('input').checked = false; });
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get('id');

  function saveRDA() {
    if(!patientId) {
      alert("No hay un paciente seleccionado. Vuelva al Dashboard y seleccione uno.");
      return;
    }
    const elements = document.querySelectorAll('input, select, textarea');
    const data = Array.from(elements).map(el => {
      if(el.type === 'checkbox' || el.type === 'radio') {
        return el.checked;
      }
      return el.value;
    });
    
    const activePills = Array.from(document.querySelectorAll('.dx-pill.active')).map(p => p.dataset.code);
    
    const rdaData = {
      fields: data,
      pills: activePills,
      historial: document.getElementById('historialMedico') ? document.getElementById('historialMedico').value : ''
    };
    
    localStorage.setItem('rda_data_' + patientId, JSON.stringify(rdaData));
    
    let patients = JSON.parse(localStorage.getItem('patients_list')) || [];
    const pIndex = patients.findIndex(p => p.id == patientId);
    if(pIndex !== -1) {
      patients[pIndex].status = 'completado';
      patients[pIndex].tls[1] = 'done';
      patients[pIndex].tls[2] = 'done';
      
      // Sincronizar datos básicos actualizados desde el RDA hacia el Dashboard
      if(document.getElementById('rda-name') && document.getElementById('rda-name').value) patients[pIndex].name = document.getElementById('rda-name').value;
      if(document.getElementById('rda-doc') && document.getElementById('rda-doc').value) patients[pIndex].doc = document.getElementById('rda-doc').value;
      if(document.getElementById('rda-phone') && document.getElementById('rda-phone').value) patients[pIndex].phone = document.getElementById('rda-phone').value;
      if(document.getElementById('rda-eps') && document.getElementById('rda-eps').value) patients[pIndex].eps = document.getElementById('rda-eps').value;
      
      localStorage.setItem('patients_list', JSON.stringify(patients));
    }

    alert('RDA e Historial Médico guardados correctamente. Ya puede consultar la información actualizada.');
  }

  function loadRDA() {
    if(!patientId) return;
    
    let patients = JSON.parse(localStorage.getItem('patients_list')) || [];
    const pt = patients.find(p => p.id == patientId);
    const stored = localStorage.getItem('rda_data_' + patientId);

    if(stored) {
      const rdaData = JSON.parse(stored);
      const elements = document.querySelectorAll('input, select, textarea');
      elements.forEach((el, index) => {
        if(rdaData.fields && rdaData.fields[index] !== undefined) {
          if(el.type === 'checkbox' || el.type === 'radio') {
            el.checked = rdaData.fields[index];
            if(el.type === 'checkbox') markCheck(el);
          } else {
            el.value = rdaData.fields[index];
          }
        }
      });
      
      if(rdaData.pills) {
        document.querySelectorAll('.dx-pill').forEach(p => {
          if(rdaData.pills.includes(p.dataset.code)) {
            p.classList.add('active');
          } else {
            p.classList.remove('active');
          }
        });
        updateDxField();
      }
      
      // Siempre cargar explícitamente el historial guardado para que no se sobreescriba por el array de campos
      if(document.getElementById('historialMedico') && rdaData.historial !== undefined) {
        document.getElementById('historialMedico').value = rdaData.historial;
      }
    }
    
    // Forzar siempre los datos maestros del Dashboard hacia el RDA (Si el usuario editó en Dashboard, se refleja aquí)
    if(pt) {
       if(document.getElementById('rda-name')) document.getElementById('rda-name').value = pt.name;
       if(document.getElementById('rda-doc') && pt.doc) document.getElementById('rda-doc').value = pt.doc;
       if(document.getElementById('rda-phone') && pt.phone) document.getElementById('rda-phone').value = pt.phone;
       if(document.getElementById('rda-eps') && pt.eps) document.getElementById('rda-eps').value = pt.eps;
    }
  }

  window.addEventListener('DOMContentLoaded', loadRDA);
