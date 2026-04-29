import fs from 'fs';

const html = fs.readFileSync('Historial_Clinico.html', 'utf8');

const bodyStart = html.indexOf('<body>') + 6;
const scriptStart = html.indexOf('<script>');
let content = html.substring(bodyStart, scriptStart);

// Replacements for JSX
content = content.replace(/<!--[\s\S]*?-->/g, '');
content = content.replace(/class=/g, 'className=');
content = content.replace(/onclick="[^"]*"/g, ''); // Remove inline onclicks
content = content.replace(/onmouseover="[^"]*"/g, ''); 
content = content.replace(/onmouseout="[^"]*"/g, ''); 
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
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function HistorialClinico() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [rdaData, setRdaData] = useState(null);

  useEffect(() => {
    if (id) {
      const patients = JSON.parse(localStorage.getItem('patients_list')) || [];
      const p = patients.find(x => x.id === id);
      if (p) setPatient(p);
      
      const rdaStr = localStorage.getItem('rda_data_' + id);
      if (rdaStr) {
        setRdaData(JSON.parse(rdaStr));
      }
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '20px', fontFamily: "'DM Sans', sans-serif", background: '#f1f5f9', minHeight: '100vh', color: '#1e293b' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '40px', boxShadow: '0 4px 12px rgba(30,41,59,0.05)', borderRadius: '8px' }}>
        <div className="header" style={{ borderBottom: '2px solid #0284c7', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div className="brand">
            <h1 style={{ fontFamily: "'DM Serif Display', serif", margin: 0, color: '#0284c7', fontSize: '2rem' }}>Historia Clínica</h1>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Clínica Oftálmica & Optometría</p>
          </div>
          <div style={{ textAlign: 'right', color: '#64748b', fontSize: '0.9rem' }}>
            Fecha de impresión: <span>{new Date().toLocaleDateString('es-CO')}</span>
          </div>
        </div>

        <div className="patient-info" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px', background: '#f8fafc', padding: '20px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div className="info-item"><label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Paciente</label><div style={{ fontSize: '1rem', fontWeight: 500 }}>{patient?.name || '-'}</div></div>
          <div className="info-item"><label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Documento</label><div style={{ fontSize: '1rem', fontWeight: 500 }}>{patient?.doc || '-'}</div></div>
          <div className="info-item"><label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>EPS / Aseguradora</label><div style={{ fontSize: '1rem', fontWeight: 500 }}>{patient?.eps || 'No registrada'}</div></div>
          <div className="info-item"><label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Teléfono</label><div style={{ fontSize: '1rem', fontWeight: 500 }}>{patient?.phone || 'No registrado'}</div></div>
        </div>

        <div className="patient-info" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px', marginTop: '-15px', background: '#f8fafc', padding: '20px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div className="info-item"><label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Fecha y Hora</label><div style={{ fontSize: '1rem', fontWeight: 500 }}>{rdaData?.fields?.[0] ? \`\${rdaData.fields[0]} \${rdaData.fields[1] || ''}\` : '-'}</div></div>
          <div className="info-item"><label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Sede / Consultorio</label><div style={{ fontSize: '1rem', fontWeight: 500 }}>{rdaData?.fields?.[2] || '-'}</div></div>
          <div className="info-item"><label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Tipo de consulta</label><div style={{ fontSize: '1rem', fontWeight: 500 }}>{rdaData?.fields?.[3] || '-'}</div></div>
          <div className="info-item"><label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Seguridad social</label><div style={{ fontSize: '1rem', fontWeight: 500 }}>{rdaData?.fields?.[4] || '-'}</div></div>
        </div>

        <div className="section-title" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1e293b', marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Evolución e Historial Médico</div>
        <div className="history-content" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#334155', fontSize: '0.95rem' }}>
          {rdaData ? (rdaData.historial || 'No hay notas de historial médico registradas en el RDA para este paciente.') : 'El paciente no tiene un RDA guardado con historial médico.'}
        </div>

        <div className="actions" style={{ textAlign: 'center', marginTop: '40px' }}>
          <button style={{ background: '#0284c7', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', fontFamily: "'DM Sans', sans-serif" }} onClick={handlePrint}>🖨️ Exportar a PDF / Imprimir</button>
        </div>
      </div>
      <style>
        {\`
          @media print {
            body { background: white !important; padding: 0 !important; }
            .container { box-shadow: none !important; padding: 0 !important; max-width: 100% !important; border: none !important; }
            .actions { display: none !important; }
            .patient-info { border: none !important; background: transparent !important; padding: 0 !important; }
          }
        \`}
      </style>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/HistorialClinico.jsx', jsx);
console.log('HistorialClinico.jsx generated.');
