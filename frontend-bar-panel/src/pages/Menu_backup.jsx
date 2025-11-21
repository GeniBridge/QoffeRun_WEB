import React, { useState, useEffect } from 'react';
import menuService from '../services/menuService';
import branchService from '../services/branchService';

export default function Menu() {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branches, setBranches] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal states
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingMenu, setEditingMenu] = useState(null);

  // Form states
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    is_active: true,
    menu_type: 'drinks'
  });

  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'coffee',
    is_available: true,
    image: null,
    preparation_time: '',
    allergens: [],
    customization_options: [],
    track_inventory: false,
    inventory_count: ''
  });

  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    loadUserBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      loadBranchMenus();
    }
  }, [selectedBranch]);

  useEffect(() => {
    if (selectedBranch && selectedMenu) {
      loadMenuItems();
    }
  }, [selectedBranch, selectedMenu]);

  const loadUserBranches = async () => {
    try {
      setLoading(true);
      const branchesData = await branchService.getUserBranches();
      setBranches(branchesData.branches || []);
      
      if (branchesData.branches && branchesData.branches.length > 0) {
        setSelectedBranch(branchesData.branches[0]);
      }
    } catch (error) {
      setError('Errore nel caricamento delle filiali: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBranchMenus = async () => {
    if (!selectedBranch) return;
    
    try {
      setLoading(true);
      const menuData = await menuService.getBranchMenus(selectedBranch.id);
      setMenus(menuData.menus || []);
      
      if (menuData.menus && menuData.menus.length > 0) {
        setSelectedMenu(menuData.menus[0]);
      } else {
        setSelectedMenu(null);
        setMenuItems([]);
      }
    } catch (error) {
      setError('Errore nel caricamento dei menu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async () => {
    if (!selectedBranch || !selectedMenu) return;
    
    try {
      setLoading(true);
      const itemData = await menuService.getMenuItems(selectedBranch.id, selectedMenu.id);
      setMenuItems(itemData.items || []);
    } catch (error) {
      setError('Errore nel caricamento degli articoli: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMenu = () => {
    setEditingMenu(null);
    setMenuForm({
      name: '',
      description: '',
      is_active: true,
      menu_type: 'drinks'
    });
    setShowMenuModal(true);
  };

  const handleSaveMenu = async () => {
    if (!selectedBranch || !menuForm.name) return;

    try {
      setLoading(true);
      
      if (editingMenu) {
        // Update existing menu logic would go here
        // Currently API doesn't have update menu endpoint
      } else {
        await menuService.createMenu(selectedBranch.id, menuForm);
      }
      
      setShowMenuModal(false);
      await loadBranchMenus();
    } catch (error) {
      setError('Errore nel salvare il menu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      description: '',
      price: '',
      category: 'coffee',
      is_available: true,
      image: null,
      preparation_time: '',
      allergens: [],
      customization_options: [],
      track_inventory: false,
      inventory_count: ''
    });
    setImagePreview('');
    setShowItemModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      category: item.category || 'coffee',
      is_available: item.is_available !== undefined ? item.is_available : true,
      image: null, // Don't set existing image as file
      preparation_time: item.preparation_time || '',
      allergens: Array.isArray(item.allergens) ? item.allergens : 
                (typeof item.allergens === 'string' ? JSON.parse(item.allergens || '[]') : []),
      customization_options: Array.isArray(item.customization_options) ? item.customization_options :
                           (typeof item.customization_options === 'string' ? JSON.parse(item.customization_options || '[]') : []),
      track_inventory: item.track_inventory || false,
      inventory_count: item.inventory_count || ''
    });
    setImagePreview(item.image ? menuService.getImageUrl(item.image) : '');
    setShowItemModal(true);
  };

  const handleSaveItem = async () => {
    if (!selectedBranch || !selectedMenu || !itemForm.name || !itemForm.price) return;

    try {
      setLoading(true);
      
      if (editingItem) {
        await menuService.updateMenuItem(
          selectedBranch.id, 
          selectedMenu.id, 
          editingItem.id, 
          itemForm
        );
      } else {
        await menuService.addMenuItem(
          selectedBranch.id, 
          selectedMenu.id, 
          itemForm
        );
      }
      
      setShowItemModal(false);
      await loadMenuItems();
    } catch (error) {
      setError('Errore nel salvare l\'articolo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!confirm('Sei sicuro di voler eliminare questo articolo?')) return;

    try {
      setLoading(true);
      await menuService.deleteMenuItem(selectedBranch.id, selectedMenu.id, item.id);
      await loadMenuItems();
    } catch (error) {
      setError('Errore nell\'eliminazione: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await menuService.toggleItemAvailability(selectedBranch.id, selectedMenu.id, item.id);
      await loadMenuItems();
    } catch (error) {
      setError('Errore nel cambiare disponibilità: ' + error.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemForm(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAllergenChange = (allergen) => {
    setItemForm(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  if (loading && branches.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
      </div>
    );
  }

  return (
    <section>
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      {/* Branch and Menu Selection */}
      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label">Filiale</label>
          <select 
            className="form-select"
            value={selectedBranch?.id || ''}
            onChange={(e) => {
              const branch = branches.find(b => b.id == e.target.value);
              setSelectedBranch(branch);
            }}
          >
            <option value="">Seleziona filiale</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="col-md-4">
          <label className="form-label">Menu</label>
          <select 
            className="form-select"
            value={selectedMenu?.id || ''}
            onChange={(e) => {
              const menu = menus.find(m => m.id == e.target.value);
              setSelectedMenu(menu);
            }}
          >
            <option value="">Seleziona menu</option>
            {menus.map(menu => (
              <option key={menu.id} value={menu.id}>
                {menu.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="col-md-2">
          <label className="form-label">&nbsp;</label>
          <div>
            <button 
              className="btn btn-outline-primary w-100"
              onClick={handleCreateMenu}
              disabled={!selectedBranch}
            >
              <i className="bi bi-plus-lg me-1"></i>Nuovo Menu
            </button>
          </div>
        </div>
      </div>

      {/* Menu Items Management */}
      {selectedMenu && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              Gestione Menu: {selectedMenu.name}
              <span className="badge bg-secondary ms-2">{menuItems.length} articoli</span>
            </h5>
            <button 
              className="btn btn-primary"
              onClick={handleCreateItem}
            >
              <i className="bi bi-plus-lg me-1"></i>Aggiungi Articolo
            </button>
          </div>

          <div className="table-responsive bg-white rounded-4 border">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Prezzo</th>
                  <th>Disponibile</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      <i className="bi bi-cup-hot display-4"></i>
                      <p className="mt-2">Nessun articolo nel menu</p>
                    </td>
                  </tr>
                ) : (
                  menuItems.map(item => (
                    <tr key={item.id}>
                      <td>
                        <img 
                          src={item.image ? menuService.getImageUrl(item.image) : 'https://api.qofferun.com/api/placeholder/48/48'} 
                          width="48" 
                          height="48" 
                          className="rounded"
                          alt={item.name}
                        />
                      </td>
                      <td>
                        <strong>{item.name}</strong>
                        {item.description && (
                          <div className="small text-muted">{item.description}</div>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {menuService.getCategoryLabel(item.category)}
                        </span>
                      </td>
                      <td>{menuService.formatPrice(item.price)}</td>
                      <td>
                        <button
                          className={`btn btn-sm ${item.is_available ? 'btn-success' : 'btn-outline-secondary'}`}
                          onClick={() => handleToggleAvailability(item)}
                        >
                          {item.is_available ? (
                            <>
                              <i className="bi bi-check-circle me-1"></i>
                              Disponibile
                            </>
                          ) : (
                            <>
                              <i className="bi bi-x-circle me-1"></i>
                              Non disponibile
                            </>
                          )}
                        </button>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleEditItem(item)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteItem(item)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
