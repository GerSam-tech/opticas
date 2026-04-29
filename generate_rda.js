import fs from 'fs';

const html = fs.readFileSync('RDA_Oftalmica_Optometria.html', 'utf8');

// Extract everything between <body> and <script>
const bodyStart = html.indexOf('<body>') + 6;
let scriptStart = html.indexOf('<script src');
if (scriptStart === -1) scriptStart = html.indexOf('</body>');
let content = html.substring(bodyStart, scriptStart);

// Replacements for JSX
content = content.replace(/<!--[\s\S]*?-->/g, '');
content = content.replace(/class=/g, 'className=');
content = content.replace(/for=/g, 'htmlFor=');
content = content.replace(/onclick="[^"]*"/g, ''); // Remove inline onclicks
content = content.replace(/onchange="[^"]*"/g, ''); 
content = content.replace(/oninput="[^"]*"/g, ''); 
content = content.replace(/onmouseover="[^"]*"/g, ''); 
content = content.replace(/onmouseout="[^"]*"/g, ''); 

// Close self-closing tags
const selfClosing = ['input', 'hr', 'img', 'br'];
selfClosing.forEach(tag => {
  const regex = new RegExp(`<${tag}([^>]*?)>`, 'g');
  content = content.replace(regex, (match, attrs) => {
    if (attrs.trim().endsWith('/')) return match;
    return `<${tag}${attrs} />`;
  });
});

// Specific style fixes
content = content.replace(/style="([^"]*)"/g, (match, p1) => {
  const parts = p1.split(';').filter(p => p.trim() !== '');
  const styleObj = parts.map(part => {
    let [key, val] = part.split(':');
    if(!val) return '';
    key = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
    val = val.trim().replace(/'/g, '"');
    return `${key}: '${val}'`;
  }).filter(p => p).join(', ');
  return `style={{${styleObj}}}`;
});

const jsx = `
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
      <button className="btn btn-outline" style={{margin:'20px', background:'white'}} onClick={() => navigate('/')}>← Volver al Dashboard</button>
      ${content}
    </div>
  );
}
`;

fs.writeFileSync('src/pages/RdaForm.jsx', jsx);
console.log('RdaForm.jsx generated.');
