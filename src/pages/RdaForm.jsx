
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RdaForm.css';

export default function RdaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const formRef = useRef(null);
  
  useEffect(() => {
    loadRDA();
  }, [id]);

  const loadRDA = () => {
    if(!id) return;
    let patients = JSON.parse(localStorage.getItem('patients_list')) || [];
    const pt = patients.find(p => p.id === id);
    const stored = localStorage.getItem('rda_data_' + id);

    if(stored) {
      const rdaData = JSON.parse(stored);
      const elements = formRef.current.querySelectorAll('input, select, textarea');
      elements.forEach((el, index) => {
        if(rdaData.fields && rdaData.fields[index] !== undefined) {
          if(el.type === 'checkbox' || el.type === 'radio') {
            el.checked = rdaData.fields[index];
            if(el.type === 'checkbox' && el.checked) {
              el.parentElement.classList.add('checked');
            }
          } else {
            el.value = rdaData.fields[index];
          }
        }
      });
      
      if(rdaData.pills) {
        formRef.current.querySelectorAll('.dx-pill').forEach(p => {
          if(rdaData.pills.includes(p.dataset.code)) {
            p.classList.add('active');
          } else {
            p.classList.remove('active');
          }
        });
      }
      
      if(formRef.current.querySelector('#historialMedico') && rdaData.historial !== undefined) {
        formRef.current.querySelector('#historialMedico').value = rdaData.historial;
      }
    }
    
    if(pt) {
       const elName = formRef.current.querySelector('#rda-name');
       const elDoc = formRef.current.querySelector('#rda-doc');
       const elPhone = formRef.current.querySelector('#rda-phone');
       const elEps = formRef.current.querySelector('#rda-eps');
       if(elName) elName.value = pt.name;
       if(elDoc && pt.doc) elDoc.value = pt.doc;
       if(elPhone && pt.phone) elPhone.value = pt.phone;
       if(elEps && pt.eps) elEps.value = pt.eps;
    }
  };

  const saveRDA = () => {
    if(!id) return;
    const elements = formRef.current.querySelectorAll('input, select, textarea');
    const data = Array.from(elements).map(el => {
      if(el.type === 'checkbox' || el.type === 'radio') return el.checked;
      return el.value;
    });
    
    const activePills = Array.from(formRef.current.querySelectorAll('.dx-pill.active')).map(p => p.dataset.code);
    
    const rdaData = {
      fields: data,
      pills: activePills,
      historial: formRef.current.querySelector('#historialMedico') ? formRef.current.querySelector('#historialMedico').value : ''
    };
    
    localStorage.setItem('rda_data_' + id, JSON.stringify(rdaData));
    
    let patients = JSON.parse(localStorage.getItem('patients_list')) || [];
    const pIndex = patients.findIndex(p => p.id === id);
    if(pIndex !== -1) {
      patients[pIndex].status = 'completado';
      patients[pIndex].tls[1] = 'done';
      patients[pIndex].tls[2] = 'done';
      
      const elName = formRef.current.querySelector('#rda-name');
      const elDoc = formRef.current.querySelector('#rda-doc');
      const elPhone = formRef.current.querySelector('#rda-phone');
      const elEps = formRef.current.querySelector('#rda-eps');

      if(elName && elName.value) patients[pIndex].name = elName.value;
      if(elDoc && elDoc.value) patients[pIndex].doc = elDoc.value;
      if(elPhone && elPhone.value) patients[pIndex].phone = elPhone.value;
      if(elEps && elEps.value) patients[pIndex].eps = elEps.value;
      
      localStorage.setItem('patients_list', JSON.stringify(patients));
    }

    alert('RDA e Historial Médico guardados correctamente.');
  };

  const toggleSection = (e) => {
    const header = e.currentTarget;
    const body = header.nextElementSibling;
    const chevron = header.querySelector('.chevron');
    if(body.classList.contains('collapsed')){
      body.classList.remove('collapsed');
      if(chevron) chevron.classList.add('open');
    }else{
      body.classList.add('collapsed');
      if(chevron) chevron.classList.remove('open');
    }
  };

  const togglePill = (e) => {
    e.currentTarget.classList.toggle('active');
  };

  const toggleCheckbox = (e) => {
    const item = e.currentTarget;
    const chk = item.querySelector('input[type="checkbox"]');
    if(e.target === chk) {
      if(chk.checked) item.classList.add('checked');
      else item.classList.remove('checked');
    } else {
      chk.checked = !chk.checked;
      if(chk.checked) item.classList.add('checked');
      else item.classList.remove('checked');
    }
  };

  // Attach event handlers after render
  useEffect(() => {
    if(!formRef.current) return;
    const headers = formRef.current.querySelectorAll('.section-header');
    headers.forEach(h => {
      h.onclick = toggleSection;
    });

    const pills = formRef.current.querySelectorAll('.dx-pill');
    pills.forEach(p => p.onclick = togglePill);

    const checks = formRef.current.querySelectorAll('.check-item');
    checks.forEach(c => c.onclick = toggleCheckbox);
  });

  return (
    <div className="rda-container" ref={formRef}>
      


<div className="header">
  <div className="header-inner">
    <svg className="logo-eye" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="28" cy="28" rx="26" ry="26" fill="none" stroke="#c9a84c" stroke-width="2"/>
      <path d="M6 28 C14 14 42 14 50 28 C42 42 14 42 6 28 Z" fill="none" stroke="white" stroke-width="2"/>
      <circle cx="28" cy="28" r="8" fill="#0d6e8a"/>
      <circle cx="28" cy="28" r="4" fill="white"/>
      <circle cx="30" cy="26" r="1.5" fill="#0d6e8a"/>
    </svg>
    <div className="header-title">
      <h1>Registro Diario de Atención</h1>
      <p>Clínica Oftálmica · Servicio de Optometría</p>
    </div>
    <div className="header-rda" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px'}}>
      <div>
        <span className="rda-badge">RDA · IPS</span>
        <div className="rda-num" style={{display: 'inline-block', marginLeft: '8px'}}>N° <span id="rdaNum">{id || '──────'}</span></div>
      </div>
      <button style={{padding: '6px 14px', borderRadius: '4px', fontFamily: '"DM Sans",sans-serif', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', transition: 'all 0.2s'}} onClick={() => navigate('/')} >← Ir al Dashboard</button>
    </div>
  </div>
  <div className="header-stripe"></div>
</div>


<div className="meta-bar">
  <div className="meta-field">
    <div className="meta-label">Fecha</div>
    <input type="date" id="fecha" />
  </div>
  <div className="meta-field">
    <div className="meta-label">Hora</div>
    <input type="time" id="hora" />
  </div>
  <div className="meta-field">
    <div className="meta-label">Sede / Consultorio</div>
    <input type="text" placeholder="Ej: Cons. 3 – Sede Norte" />
  </div>
  <div className="meta-field">
    <div className="meta-label">Tipo de consulta</div>
    <select>
      <option value="">Seleccionar…</option>
      <option>Primera vez</option>
      <option>Control</option>
      <option>Urgencia</option>
      <option>Post-quirúrgico</option>
    </select>
  </div>
  <div className="meta-field">
    <div className="meta-label">Seguridad social</div>
    <select>
      <option value="">Seleccionar…</option>
      <option>EPS – Contributivo</option>
      <option>EPS – Subsidiado</option>
      <option>Particular</option>
      <option>ARL</option>
      <option>SOAT</option>
      <option>Medicina Prepagada</option>
    </select>
  </div>
</div>

<div className="main">

  
  <div className="section">
    <div className="section-header" >
      <span className="section-icon">👤</span>
      <span className="section-num">01</span>
      <span className="section-title">Datos del Paciente</span>
      <span className="chevron open">▼</span>
    </div>
    <div className="section-body three">
      <div className="field span-full"><label>Nombre completo</label><input type="text" id="rda-name" placeholder="Apellidos y nombres" /></div>
      <div className="field"><label>Tipo de documento</label>
        <select>
          <option>CC</option><option>TI</option><option>CE</option><option>PA</option><option>RC</option><option>NUI</option>
        </select>
      </div>
      <div className="field"><label>N° de documento</label><input type="text" id="rda-doc" placeholder="" /></div>
      <div className="field"><label>Fecha de nacimiento</label><input type="date" /></div>
      <div className="field"><label>Edad</label><input type="text" placeholder="Años" /></div>
      <div className="field"><label>Sexo</label>
        <select><option>Femenino</option><option>Masculino</option><option>Otro</option></select>
      </div>
      <div className="field"><label>Estado civil</label>
        <select><option>Soltero/a</option><option>Casado/a</option><option>Unión libre</option><option>Divorciado/a</option><option>Viudo/a</option></select>
      </div>
      <div className="field"><label>Teléfono / Celular</label><input type="tel" id="rda-phone" placeholder="" /></div>
      <div className="field"><label>Correo electrónico</label><input type="email" placeholder="" /></div>
      <div className="field span3"><label>Dirección de residencia</label><input type="text" placeholder="Calle, Barrio, Ciudad" /></div>
      <div className="field"><label>EPS / Aseguradora</label><input type="text" id="rda-eps" placeholder="" /></div>
      <div className="field"><label>N° póliza / afiliación</label><input type="text" placeholder="" /></div>
      <div className="field"><label>Ocupación</label><input type="text" placeholder="" /></div>
    </div>
  </div>

  
  <div className="section">
    <div className="section-header teal" >
      <span className="section-icon">📋</span>
      <span className="section-num">02</span>
      <span className="section-title">Anamnesis · Motivo de Consulta</span>
      <span className="chevron open">▼</span>
    </div>
    <div className="section-body full">
      <div className="sub-title">Motivo principal</div>
      <div className="field"><label>Descripción del motivo de consulta</label>
        <textarea placeholder="Describa el motivo de consulta con inicio, duración, características y factores modificadores…" style={{minHeight: '80px'}}></textarea>
      </div>

      <div className="sub-title" style={{marginTop: '8px'}}>Síntomas visuales</div>
      <div className="check-grid">
        <label className="check-item"><input type="checkbox"  /> Disminución de AV</label>
        <label className="check-item"><input type="checkbox"  /> Visión borrosa</label>
        <label className="check-item"><input type="checkbox"  /> Fotofobia</label>
        <label className="check-item"><input type="checkbox"  /> Diplopía</label>
        <label className="check-item"><input type="checkbox"  /> Miopía / Dificultad lejos</label>
        <label className="check-item"><input type="checkbox"  /> Dificultad visión cercana</label>
        <label className="check-item"><input type="checkbox"  /> Cefalea asociada</label>
        <label className="check-item"><input type="checkbox"  /> Ojo rojo</label>
        <label className="check-item"><input type="checkbox"  /> Secretas / legañas</label>
        <label className="check-item"><input type="checkbox"  /> Ardor / prurito</label>
        <label className="check-item"><input type="checkbox"  /> Cuerpo extraño</label>
        <label className="check-item"><input type="checkbox"  /> Halos / destellos</label>
        <label className="check-item"><input type="checkbox"  /> Moscas volantes</label>
        <label className="check-item"><input type="checkbox"  /> Pérdida campo visual</label>
        <label className="check-item"><input type="checkbox"  /> Dolor ocular</label>
        <label className="check-item"><input type="checkbox"  /> Lagrimeo</label>
      </div>

      <div className="sub-title" style={{marginTop: '8px'}}>Antecedentes</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 20px'}}>
        <div className="ant-block">
          <label>Cirugía ocular previa</label>
          <div className="radio-row">
            <label><input type="radio" name="cirOcular" /> Sí</label>
            <label><input type="radio" name="cirOcular" checked /> No</label>
          </div>
          <input type="text" placeholder="¿Cuál? ¿Cuándo?" style={{border: '1px solid var(--border)', borderRadius: '4px', padding: '6px 10px', fontFamily: '"DM Sans",sans-serif', fontSize: '0.83rem', width: '100%', marginTop: '4px', outline: 'none', background: 'var(--section-bg)'}} />
        </div>
        <div className="ant-block">
          <label>Uso de lentes correctivos</label>
          <div className="radio-row">
            <label><input type="radio" name="lentes" /> Sí</label>
            <label><input type="radio" name="lentes" checked /> No</label>
          </div>
          <select style={{border: '1px solid var(--border)', borderRadius: '4px', padding: '6px 10px', fontFamily: '"DM Sans",sans-serif', fontSize: '0.83rem', width: '100%', marginTop: '4px', background: 'var(--section-bg)'}}>
            <option value="">Tipo…</option><option>Gafas</option><option>LC blandas</option><option>LC rígidas</option>
          </select>
        </div>
        <div className="ant-block">
          <label>Enfermedades sistémicas</label>
          <div className="radio-row">
            <label><input type="radio" name="sis" /> Sí</label>
            <label><input type="radio" name="sis" checked /> No</label>
          </div>
          <input type="text" placeholder="DM, HTA, tiroides…" style={{border: '1px solid var(--border)', borderRadius: '4px', padding: '6px 10px', fontFamily: '"DM Sans",sans-serif', fontSize: '0.83rem', width: '100%', marginTop: '4px', outline: 'none', background: 'var(--section-bg)'}} />
        </div>
        <div className="ant-block">
          <label>Medicamentos actuales</label>
          <div className="radio-row">
            <label><input type="radio" name="meds" /> Sí</label>
            <label><input type="radio" name="meds" checked /> No</label>
          </div>
          <input type="text" placeholder="Nombre y dosis" style={{border: '1px solid var(--border)', borderRadius: '4px', padding: '6px 10px', fontFamily: '"DM Sans",sans-serif', fontSize: '0.83rem', width: '100%', marginTop: '4px', outline: 'none', background: 'var(--section-bg)'}} />
        </div>
        <div className="ant-block">
          <label>Alergias conocidas</label>
          <div className="radio-row">
            <label><input type="radio" name="alrg" /> Sí</label>
            <label><input type="radio" name="alrg" checked /> No</label>
          </div>
          <input type="text" placeholder="¿A qué?" style={{border: '1px solid var(--border)', borderRadius: '4px', padding: '6px 10px', fontFamily: '"DM Sans",sans-serif', fontSize: '0.83rem', width: '100%', marginTop: '4px', outline: 'none', background: 'var(--section-bg)'}} />
        </div>
        <div className="ant-block">
          <label>Antecedentes familiares</label>
          <div className="radio-row">
            <label><input type="radio" name="fam" /> Sí</label>
            <label><input type="radio" name="fam" checked /> No</label>
          </div>
          <input type="text" placeholder="Glaucoma, DMRE, catarata…" style={{border: '1px solid var(--border)', borderRadius: '4px', padding: '6px 10px', fontFamily: '"DM Sans",sans-serif', fontSize: '0.83rem', width: '100%', marginTop: '4px', outline: 'none', background: 'var(--section-bg)'}} />
        </div>
      </div>
    </div>
  </div>

  
  <div className="section">
    <div className="section-header" style={{background: '#14425e'}} >
      <span className="section-icon">🔬</span>
      <span className="section-num">03</span>
      <span className="section-title">Examen Optométrico</span>
      <span className="chevron open">▼</span>
    </div>
    <div className="section-body full">

      
      <div className="sub-title">Agudeza Visual (sin corrección → con corrección)</div>
      <table className="eye-table">
        <thead>
          <tr>
            <th className="eye-label">Ojo</th>
            <th>AV SC<br /><small>sin corrección</small></th>
            <th>AV CC<br /><small>con corrección</small></th>
            <th>AV Cerca SC</th>
            <th>AV Cerca CC</th>
            <th>PH<br /><small>pin hole</small></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="eye-label-cell">OD</td>
            <td><input placeholder="20/" /></td>
            <td><input placeholder="20/" /></td>
            <td><input placeholder="J" /></td>
            <td><input placeholder="J" /></td>
            <td><input placeholder="20/" /></td>
          </tr>
          <tr>
            <td className="eye-label-cell">OI</td>
            <td><input placeholder="20/" /></td>
            <td><input placeholder="20/" /></td>
            <td><input placeholder="J" /></td>
            <td><input placeholder="J" /></td>
            <td><input placeholder="20/" /></td>
          </tr>
          <tr>
            <td className="eye-label-cell">AO</td>
            <td><input placeholder="20/" /></td>
            <td><input placeholder="20/" /></td>
            <td><input placeholder="J" /></td>
            <td><input placeholder="J" /></td>
            <td>–</td>
          </tr>
        </tbody>
      </table>

      
      <div className="sub-title" style={{marginTop: '16px'}}>Refracción (Lensometría / Subjetivo / Objetivo)</div>
      <table className="eye-table">
        <thead>
          <tr>
            <th className="eye-label">Ojo</th>
            <th>Esfera (D)</th>
            <th>Cilindro (D)</th>
            <th>Eje (°)</th>
            <th>Adición</th>
            <th>Prisma</th>
            <th>AV Final</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="eye-label-cell">OD</td>
            <td><input placeholder="+/–" /></td>
            <td><input placeholder="+/–" /></td>
            <td><input placeholder="0–180" /></td>
            <td><input placeholder="+" /></td>
            <td><input placeholder="" /></td>
            <td><input placeholder="20/" /></td>
          </tr>
          <tr>
            <td className="eye-label-cell">OI</td>
            <td><input placeholder="+/–" /></td>
            <td><input placeholder="+/–" /></td>
            <td><input placeholder="0–180" /></td>
            <td><input placeholder="+" /></td>
            <td><input placeholder="" /></td>
            <td><input placeholder="20/" /></td>
          </tr>
        </tbody>
      </table>

      
      <div className="sub-title" style={{marginTop: '16px'}}>Motilidad Ocular & Alineación</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px'}}>
        <div className="field"><label>Cover test lejos</label><input type="text" placeholder="Orto / Exo / Eso" /></div>
        <div className="field"><label>Cover test cerca</label><input type="text" placeholder="Orto / Exo / Eso" /></div>
        <div className="field"><label>Hirschberg</label><input type="text" placeholder="Centrado / Desviado" /></div>
        <div className="field"><label>Motilidad MOM</label><input type="text" placeholder="Completa / Restringida" /></div>
        <div className="field"><label>PPC (punto próx. convergencia)</label><input type="text" placeholder="cm" /></div>
        <div className="field"><label>Estereopsis</label><input type="text" placeholder="seg arc" /></div>
      </div>

      
      <div className="sub-title" style={{marginTop: '16px'}}>Queratometría / Topografía</div>
      <table className="eye-table">
        <thead>
          <tr>
            <th className="eye-label">Ojo</th>
            <th>K1 (D / mm)</th>
            <th>K2 (D / mm)</th>
            <th>Eje K</th>
            <th>Astigmatismo corneal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="eye-label-cell">OD</td>
            <td><input /></td><td><input /></td><td><input /></td><td><input /></td>
          </tr>
          <tr>
            <td className="eye-label-cell">OI</td>
            <td><input /></td><td><input /></td><td><input /></td><td><input /></td>
          </tr>
        </tbody>
      </table>

      
      <div className="sub-title" style={{marginTop: '16px'}}>Presión Intraocular (PIO)</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px'}}>
        <div className="field"><label>PIO OD (mmHg)</label><input type="text" placeholder="10–21" /></div>
        <div className="field"><label>PIO OI (mmHg)</label><input type="text" placeholder="10–21" /></div>
        <div className="field"><label>Hora medición</label><input type="time" /></div>
        <div className="field"><label>Método</label>
          <select><option>No contacto</option><option>Goldmann</option><option>Icare</option><option>Schiötz</option></select>
        </div>
      </div>

      <div className="field" style={{marginTop: '4px'}}><label>Observaciones optométricas</label>
        <textarea placeholder="Hallazgos adicionales, comportamiento visual, dominancia ocular…"></textarea>
      </div>
    </div>
  </div>

  
  <div className="section">
    <div className="section-header" style={{background: '#0a3d52'}} >
      <span className="section-icon">🔦</span>
      <span className="section-num">04</span>
      <span className="section-title">Examen Oftalmológico</span>
      <span className="chevron open">▼</span>
    </div>
    <div className="section-body full">

      <div className="sub-title">Segmento Anterior – Biomicroscopía</div>
      <table className="eye-table">
        <thead>
          <tr>
            <th className="eye-label">Estructura</th>
            <th>Ojo Derecho (OD)</th>
            <th>Ojo Izquierdo (OI)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="eye-label-cell">Párpados</td><td><input placeholder="Normal" /></td><td><input placeholder="Normal" /></td></tr>
          <tr><td className="eye-label-cell">Conjuntiva</td><td><input placeholder="Blanca / sin inyección" /></td><td><input placeholder="" /></td></tr>
          <tr><td className="eye-label-cell">Córnea</td><td><input placeholder="Transparente / sin lesión" /></td><td><input placeholder="" /></td></tr>
          <tr><td className="eye-label-cell">Cámara anterior</td><td><input placeholder="Profunda / limpia" /></td><td><input placeholder="" /></td></tr>
          <tr><td className="eye-label-cell">Iris</td><td><input placeholder="Normal / plano" /></td><td><input placeholder="" /></td></tr>
          <tr><td className="eye-label-cell">Pupila</td><td><input placeholder="Redonda / reactiva" /></td><td><input placeholder="" /></td></tr>
          <tr><td className="eye-label-cell">Cristalino</td><td><input placeholder="Transparente" /></td><td><input placeholder="" /></td></tr>
          <tr><td className="eye-label-cell">Vítreo</td><td><input placeholder="Sin opacidades" /></td><td><input placeholder="" /></td></tr>
        </tbody>
      </table>

      
      <div className="sub-title" style={{marginTop: '16px'}}>Fondo de Ojo (Oftalmoscopía)</div>
      <table className="eye-table">
        <thead>
          <tr>
            <th className="eye-label">Estructura</th>
            <th>Ojo Derecho (OD)</th>
            <th>Ojo Izquierdo (OI)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="eye-label-cell">Papila / Disco</td><td><input placeholder="C/D  bordes  color" /></td><td><input placeholder="" /></td></tr>
          <tr><td className="eye-label-cell">Relación C/D</td><td><input placeholder="0.3" /></td><td><input placeholder="0.3" /></td></tr>
          <tr><td className="eye-label-cell">Mácula</td><td><input placeholder="Brillo foveal / sin lesión" /></td><td><input placeholder="" /></td></tr>
          <tr><td className="eye-label-cell">Vasos</td><td><input placeholder="Relación AV / calibre" /></td><td><input placeholder="" /></td></tr>
          <tr><td className="eye-label-cell">Retina periférica</td><td><input placeholder="Sin degeneraciones" /></td><td><input placeholder="" /></td></tr>
          <tr><td className="eye-label-cell">Coroides</td><td><input placeholder="Sin alteraciones" /></td><td><input placeholder="" /></td></tr>
        </tbody>
      </table>

      
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginTop: '12px'}}>
        <div className="field"><label>Midriasis aplicada</label>
          <select><option>No</option><option>Tropicamida 1%</option><option>Ciclopentolato 1%</option><option>Fenilefrina 2.5%</option></select>
        </div>
        <div className="field"><label>Hora dilatación</label><input type="time" /></div>
        <div className="field"><label>Consentimiento dilatación</label>
          <select><option>Firmado</option><option>Verbal</option><option>No aplica</option></select>
        </div>
      </div>

      <div className="field" style={{marginTop: '8px'}}><label>Observaciones oftalmológicas adicionales</label>
        <textarea placeholder="Hallazgos especiales, esquemas, notas de examen…"></textarea>
      </div>
    </div>
  </div>

  
  <div className="section">
    <div className="section-header" style={{background: '#1a5c28'}} >
      <span className="section-icon">🩺</span>
      <span className="section-num">05</span>
      <span className="section-title">Diagnóstico & Plan de Tratamiento</span>
      <span className="chevron open">▼</span>
    </div>
    <div className="section-body full">

      <div className="sub-title">Diagnósticos CIE-10 frecuentes (clic para seleccionar)</div>
      <div id="dxPills" style={{marginBottom: '12px'}}>
        <span className="dx-pill"  data-code="H52.1">H52.1 Miopía</span>
        <span className="dx-pill"  data-code="H52.2">H52.2 Astigmatismo</span>
        <span className="dx-pill"  data-code="H52.0">H52.0 Hipermetropía</span>
        <span className="dx-pill"  data-code="H52.4">H52.4 Presbicia</span>
        <span className="dx-pill"  data-code="H10">H10 Conjuntivitis</span>
        <span className="dx-pill"  data-code="H26">H26 Catarata</span>
        <span className="dx-pill"  data-code="H40">H40 Glaucoma</span>
        <span className="dx-pill"  data-code="H35.3">H35.3 DMRE</span>
        <span className="dx-pill"  data-code="H04.1">H04.1 Ojo seco</span>
        <span className="dx-pill"  data-code="H18.6">H18.6 Queratocono</span>
        <span className="dx-pill"  data-code="H50">H50 Estrabismo</span>
        <span className="dx-pill"  data-code="H53.2">H53.2 Diplopía</span>
      </div>

      <div className="field"><label>Diagnóstico(s) definitivo(s) con código CIE-10</label>
        <textarea id="dxField" placeholder="Ej: H52.1 – Miopía bilateral / H52.2 – Astigmatismo OD" style={{minHeight: '64px'}}></textarea>
      </div>

      <hr className="divider" />
      <div className="sub-title">Formulación de lentes ópticos / LC</div>
      <table className="eye-table">
        <thead>
          <tr>
            <th className="eye-label">Ojo</th>
            <th>Esfera</th>
            <th>Cilindro</th>
            <th>Eje</th>
            <th>Adición</th>
            <th>Tipo lente / material</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="eye-label-cell">OD</td>
            <td><input /></td><td><input /></td><td><input /></td><td><input /></td>
            <td><input placeholder="Monofocal / Bifocal / Progresivo / LC…" /></td>
          </tr>
          <tr>
            <td className="eye-label-cell">OI</td>
            <td><input /></td><td><input /></td><td><input /></td><td><input /></td>
            <td><input /></td>
          </tr>
        </tbody>
      </table>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '10px'}}>
        <div className="field"><label>DPN OD (mm)</label><input type="text" /></div>
        <div className="field"><label>DPN OI (mm)</label><input type="text" /></div>
        <div className="field"><label>Altura segmento (lente progresivo)</label><input type="text" /></div>
        <div className="field"><label>Tratamiento / filtro</label>
          <select><option>Sin filtro</option><option>Antireflejo</option><option>Fotocromático</option><option>Blue filter</option><option>Polarizado</option></select>
        </div>
      </div>

      <hr className="divider" />
      <div className="sub-title">Tratamiento farmacológico</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px'}}>
        <div className="field"><label>Medicamento 1</label><input type="text" placeholder="Nombre comercial / genérico" /></div>
        <div className="field"><label>Dosis / posología 1</label><input type="text" placeholder="Ej: 1 gota c/8h × 7 días" /></div>
        <div className="field"><label>Medicamento 2</label><input type="text" placeholder="" /></div>
        <div className="field"><label>Dosis / posología 2</label><input type="text" placeholder="" /></div>
        <div className="field"><label>Medicamento 3</label><input type="text" placeholder="" /></div>
        <div className="field"><label>Dosis / posología 3</label><input type="text" placeholder="" /></div>
      </div>

      <hr className="divider" />
      <div className="sub-title">Plan de manejo y recomendaciones</div>
      <div className="field"><label>Remisiones / interconsultas</label>
        <input type="text" placeholder="Ej: Remite a oftalmología para fondo de ojo bajo dilatación, neurología…" />
      </div>
      <div className="field"><label>Exámenes paraclínicos ordenados</label>
        <input type="text" placeholder="Ej: Topografía, OCT, campo visual, ecografía ocular…" />
      </div>
      <div className="field"><label>Educación al paciente / recomendaciones</label>
        <textarea placeholder="Instrucciones de uso de LC, hábitos visuales, uso de gotas, señales de alarma…"></textarea>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px'}}>
        <div className="field"><label>Próxima cita</label><input type="date" /></div>
        <div className="field"><label>Tiempo de control</label>
          <select><option>1 semana</option><option>15 días</option><option>1 mes</option><option>3 meses</option><option>6 meses</option><option>1 año</option></select>
        </div>
        <div className="field"><label>Pronóstico</label>
          <select><option>Favorable</option><option>Reservado</option><option>Desfavorable</option></select>
        </div>
      </div>
    </div>
  </div>

  
  <div className="section">
    <div className="section-header" style={{background: '#4b3f72'}} >
      <span className="section-icon">📂</span>
      <span className="section-num">06</span>
      <span className="section-title">Historial Médico</span>
      <span className="chevron open">▼</span>
    </div>
    <div className="section-body full">
      <div className="field">
        <label>Historia Clínica del Paciente</label>
        <textarea id="historialMedico" placeholder="Escriba aquí la evolución clínica, notas pasadas y el historial médico general de este paciente..." style={{minHeight: '150px'}}></textarea>
      </div>
    </div>
  </div>

  
  <div className="section">
    <div className="section-header" style={{background: '#2d2d2d'}} >
      <span className="section-icon">✍️</span>
      <span className="section-num">07</span>
      <span className="section-title">Firmas & Responsables</span>
      <span className="chevron open">▼</span>
    </div>
    <div className="section-body full">
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '12px'}}>
        <div className="field"><label>Profesional tratante</label><input type="text" placeholder="Nombre completo" /></div>
        <div className="field"><label>Registro profesional (TP / RM)</label><input type="text" placeholder="N°" /></div>
        <div className="field"><label>Especialidad</label>
          <select><option>Optometría</option><option>Oftalmología</option><option>Optometría – Especialista en LC</option></select>
        </div>
        <div className="field"><label>Institución / IPS</label><input type="text" placeholder="" /></div>
      </div>
      <div className="firma-row">
        <div className="firma-box">
          <div className="firma-line"></div>
          <div className="firma-label">Firma del profesional</div>
        </div>
        <div className="firma-box">
          <div className="firma-line"></div>
          <div className="firma-label">Firma del paciente / acudiente</div>
        </div>
      </div>
      <div className="field" style={{marginTop: '20px'}}><label>Observaciones finales / notas de la consulta</label>
        <textarea placeholder="Notas libres, incidentes, aclaraciones…" style={{minHeight: '60px'}}></textarea>
      </div>
    </div>
  </div>

  
  <div className="actions">
    <button type="button" className="btn btn-outline" onClick={() => navigate('/')}>Volver al Dashboard</button>
    <button type="button" className="btn btn-outline" onClick={() => { if(window.confirm('¿Desea limpiar el formulario?')) { formRef.current.reset(); } }}>Limpiar formulario</button>
    <button type="button" className="btn btn-primary" onClick={() => window.open('/historial/'+id, '_blank')}>🖨️ Imprimir / PDF</button>
    <button type="button" className="btn btn-primary" style={{background: '#0d6e8a'}} onClick={saveRDA}>💾 Guardar RDA</button>
  </div>

</div>


    </div>
  );
}
