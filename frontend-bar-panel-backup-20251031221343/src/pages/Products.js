import React, { useState, useRef } from "react";

function emptyProduct() {
  return { id: null, name: "", price: "", description: "", photo: null, photoUrl: "" };
}

export default function Products() {
  const [products, setProducts] = useState([
    { id: 1, name: "Caffè", price: 1.2, description: "Espresso italiano.", photo: null, photoUrl: "" },
    { id: 2, name: "Cornetto", price: 1.5, description: "Cornetto fresco.", photo: null, photoUrl: "" },
    { id: 3, name: "Cappuccino", price: 1.8, description: "Cappuccino schiumoso.", photo: null, photoUrl: "" },
    { id: 4, name: "Panino", price: 3.5, description: "Panino farcito.", photo: null, photoUrl: "" },
    { id: 5, name: "Torta", price: 6.5, description: "Fetta di torta del giorno.", photo: null, photoUrl: "" },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(emptyProduct());
  const [deleteId, setDeleteId] = useState(null);
  const fileInput = useRef();
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(products.length / pageSize);
  const paginatedProducts = products.slice((page - 1) * pageSize, page * pageSize);

  // Open modal for add/edit
  const openModal = (product = emptyProduct()) => {
    setEditing(!!product.id);
    setCurrent(product.id ? { ...product } : emptyProduct());
    setModalOpen(true);
  };

  // Handle form change
  const handleChange = e => {
    const { name, value } = e.target;
    setCurrent(c => ({ ...c, [name]: value }));
  };

  // Handle photo upload
  const handlePhoto = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setCurrent(c => ({ ...c, photo: file, photoUrl: ev.target.result }));
      reader.readAsDataURL(file);
    }
  };

  // Save product (add or update)
  const handleSave = e => {
    e.preventDefault();
    if (!current.name.trim() || !current.price || isNaN(current.price) || Number(current.price) <= 0) return;
    if (editing) {
      setProducts(ps => ps.map(p => p.id === current.id ? { ...current, price: parseFloat(current.price) } : p));
    } else {
      setProducts(ps => [
        ...ps,
        { ...current, id: Date.now(), price: parseFloat(current.price) }
      ]);
    }
    setModalOpen(false);
    setCurrent(emptyProduct());
    setEditing(false);
  };

  // Delete product
  const handleDelete = () => {
    setProducts(ps => ps.filter(p => p.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="products-page-container py-4">
  {/* <h3>Prodotti</h3> */}
      <div className="alert alert-light border mt-3 d-flex align-items-center justify-content-between">
  {/* <span><i className="bi bi-box-seam me-2"></i>Gestione prodotti.</span> */}
        <button className="btn btn-primary" onClick={() => openModal()}><i className="bi bi-plus-lg me-1"></i>Aggiungi prodotto</button>
      </div>

      {/* Product Table */}
      <div className="table-responsive mt-4" style={{ maxHeight: 340, overflowY: 'auto' }}>
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nome</th>
              <th>Prezzo (€)</th>
              <th>Descrizione</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr><td colSpan={5} className="text-center text-muted">Nessun prodotto.</td></tr>
            )}
            {paginatedProducts.map(product => (
              <tr key={product.id}>
                <td style={{ width: 64 }}>
                  {product.photoUrl ? (
                    <img src={product.photoUrl} alt="foto" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }} />
                  ) : (
                    <span className="text-muted"><i className="bi bi-image" style={{ fontSize: 32 }}></i></span>
                  )}
                </td>
                <td>{product.name}</td>
                <td>{Number(product.price).toFixed(2)}</td>
                <td>{product.description}</td>
                <td>
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openModal(product)}><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteId(product.id)}><i className="bi bi-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-2">
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item${page === 1 ? ' disabled' : ''}`}><button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>&laquo;</button></li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i+1} className={`page-item${page === i+1 ? ' active' : ''}`}><button className="page-link" onClick={() => setPage(i+1)}>{i+1}</button></li>
            ))}
            <li className={`page-item${page === totalPages ? ' disabled' : ''}`}><button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages}>&raquo;</button></li>
          </ul>
        </nav>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(44,44,44,0.45)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <form onSubmit={handleSave} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(44,44,44,0.22)', maxWidth: 360, width: '100%', padding: 0, overflow: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="modal-header" style={{ padding: '1rem 1.5rem', background: '#fafbff', borderBottom: '1px solid #f0f0f0' }}>
              <h5 className="modal-title" style={{ fontWeight: 600 }}>{editing ? "Modifica" : "Aggiungi"} Prodotto</h5>
              <button type="button" className="btn-close" style={{ fontSize: '1.25rem', opacity: 0.7 }} onClick={() => setModalOpen(false)}></button>
            </div>
            <div className="modal-body" style={{ padding: '1.2rem 1.5rem 1rem 1.5rem', maxHeight: 320, overflowY: 'auto' }}>
              <div className="mb-3 text-center">
                {current.photoUrl ? (
                  <img src={current.photoUrl} alt="foto" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, marginBottom: 8 }} />
                ) : (
                  <span className="text-muted"><i className="bi bi-image" style={{ fontSize: 48 }}></i></span>
                )}
                <input type="file" accept="image/*" className="form-control mt-2" style={{ maxWidth: 220, margin: '0 auto' }} ref={fileInput} onChange={handlePhoto} />
              </div>
              <div className="mb-3">
                <label className="form-label">Nome</label>
                <input type="text" className="form-control" name="name" value={current.name} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Prezzo (€)</label>
                <input type="number" className="form-control" name="price" value={current.price} onChange={handleChange} min="0.01" step="0.01" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Descrizione</label>
                <textarea className="form-control" name="description" value={current.description} onChange={handleChange} rows={2} />
              </div>
            </div>
            <div className="modal-footer" style={{ background: '#fafbff', padding: '1rem 1.5rem', display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Annulla</button>
              <button type="submit" className="btn btn-primary">Salva</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(44,44,44,0.45)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(44,44,44,0.22)', maxWidth: 320, width: '100%', padding: 0, overflow: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="modal-header" style={{ padding: '1rem 1.5rem', background: '#fafbff', borderBottom: '1px solid #f0f0f0' }}>
              <h5 className="modal-title" style={{ fontWeight: 600 }}>Elimina prodotto</h5>
              <button type="button" className="btn-close" style={{ fontSize: '1.25rem', opacity: 0.7 }} onClick={() => setDeleteId(null)}></button>
            </div>
            <div className="modal-body text-center" style={{ padding: '1.2rem 1.5rem 1rem 1.5rem', maxHeight: 180, overflowY: 'auto' }}>
              <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: "2.5rem" }}></i>
              <p className="mt-3 mb-0">Sei sicuro di voler eliminare questo prodotto?</p>
            </div>
            <div className="modal-footer" style={{ background: '#fafbff', padding: '1rem 1.5rem', display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteId(null)}>Annulla</button>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>Elimina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
