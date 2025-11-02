import React, { useState } from 'react'
import { PRODUCTS as INIT_PRODUCTS } from '../data/demo'

export default function Menu(){
  const [items, setItems] = useState(INIT_PRODUCTS.map(p=>({...p})))
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({id:null, name:'', price:0, img:'', cat:'', descrizione:''})

  function openNew(){ setEditing('new'); setForm({id:null, name:'', price:0, img:'', cat:'', descrizione:''}) }
  function openEdit(p){ setEditing('edit'); setForm({...p, descrizione: p.descrizione || ''}) }
  function save(){
    if(!form.name) return alert('Titolo obbligatorio')
    if(editing==='new'){
      const id = items.reduce((m,p)=>Math.max(m,p.id),0)+1
      setItems([...items, {...form, id}])
    } else {
      setItems(items.map(p=> p.id===form.id? {...form}: p))
    }
    setEditing(null)
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      setForm(f => ({...f, img: ev.target.result}));
    };
    reader.readAsDataURL(file);
  }
  function del(id){ if(confirm('Eliminare elemento?')) setItems(items.filter(p=>p.id!==id)) }

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Gestione Menu</h5>
        <button className="btn btn-primary" onClick={openNew}><i className="bi bi-plus-lg me-1"></i>Aggiungi</button>
      </div>

      <div className="table-responsive bg-white rounded-4 border">
        <table className="table align-middle mb-0">
          <thead><tr><th>Foto</th><th>Titolo</th><th>Categoria</th><th>Prezzo</th><th></th></tr></thead>
          <tbody>
            {items.map(p=> (
              <tr key={p.id}>
                <td><img src={p.img} width="48" height="48" className="rounded"/></td>
                {/* SKU removed */}
                <td>{p.name}</td>
                <td>{p.cat}</td>
                <td>€{Number(p.price).toFixed(2)}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-secondary me-1" onClick={()=>openEdit(p)}><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={()=>del(p.id)}><i className="bi bi-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal fade show" style={{display:'block'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">{editing==='new'?'Nuovo':'Modifica'} prodotto</h5><button className="btn-close" onClick={()=>setEditing(null)}></button></div>
              <div className="modal-body">
                <div className="row g-2">
                  <div className="col-12"><label className="form-label">Titolo</label><input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
                  <div className="col-6">
                    <label className="form-label">Categoria</label>
                    <select className="form-select" value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})}>
                      <option value="">Seleziona categoria</option>
                      <option value="Bevande calde">Bevande calde</option>
                      <option value="Bevande fredde">Bevande fredde</option>
                      <option value="Cornetti">Cornetti</option>
                      <option value="Dolce">Dolce</option>
                      <option value="Tramezzini">Tramezzini</option>
                      <option value="Snack">Snack</option>
                      <option value="Altro">Altro</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label">Prezzo</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="^\\d*[.,]?\\d*$"
                      className="form-control"
                      value={form.price}
                      onChange={e => {
                        // Allow only numbers and comma/dot
                        let v = e.target.value.replace(/[^\d.,]/g, '');
                        // Replace comma with dot for decimal
                        v = v.replace(',', '.');
                        setForm({ ...form, price: v });
                      }}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Foto</label>
                    <input type="file" accept="image/*" className="form-control mb-1" onChange={handleImageUpload}/>
                    {form.img && <img src={form.img} alt="preview" style={{maxWidth:'100%',maxHeight:120,marginTop:8}} />}
                  </div>
                  <div className="col-12">
                    <label className="form-label">Descrizione <span className="text-muted" style={{fontWeight:400}}>(opzionale)</span></label>
                    <textarea className="form-control" value={form.descrizione} onChange={e=>setForm({...form,descrizione:e.target.value})} rows={2} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={()=>setEditing(null)}>Annulla</button>
                <button className="btn btn-dark" onClick={save}>Salva</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {editing && <div className="modal-backdrop fade show" onClick={()=>setEditing(null)}></div>}
    </section>
  )
}
