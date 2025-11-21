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
        </>
      )}

      {/* Create Menu Modal */}
      {showMenuModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingMenu ? 'Modifica Menu' : 'Nuovo Menu'}
                </h5>
                <button 
                  className="btn-close"
                  onClick={() => setShowMenuModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nome Menu *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={menuForm.name}
                    onChange={(e) => setMenuForm(prev => ({...prev, name: e.target.value}))}
                    placeholder="es. Menu Colazione"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Descrizione</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={menuForm.description}
                    onChange={(e) => setMenuForm(prev => ({...prev, description: e.target.value}))}
                    placeholder="Descrizione del menu..."
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tipo Menu</label>
                  <select
                    className="form-select"
                    value={menuForm.menu_type}
                    onChange={(e) => setMenuForm(prev => ({...prev, menu_type: e.target.value}))}
                  >
                    {menuService.getMenuTypes().map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={menuForm.is_active}
                    onChange={(e) => setMenuForm(prev => ({...prev, is_active: e.target.checked}))}
                  />
                  <label className="form-check-label">Menu attivo</label>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowMenuModal(false)}
                >
                  Annulla
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleSaveMenu}
                  disabled={!menuForm.name || loading}
                >
                  {loading ? 'Salvataggio...' : 'Salva Menu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Item Modal */}
      {showItemModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingItem ? 'Modifica Articolo' : 'Nuovo Articolo'}
                </h5>
                <button 
                  className="btn-close"
                  onClick={() => setShowItemModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-8">
                    <div className="mb-3">
                      <label className="form-label">Nome Articolo *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={itemForm.name}
                        onChange={(e) => setItemForm(prev => ({...prev, name: e.target.value}))}
                        placeholder="es. Cappuccino"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Descrizione</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={itemForm.description}
                        onChange={(e) => setItemForm(prev => ({...prev, description: e.target.value}))}
                        placeholder="Descrizione dell'articolo..."
                      />
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Prezzo (€) *</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-control"
                            value={itemForm.price}
                            onChange={(e) => setItemForm(prev => ({...prev, price: e.target.value}))}
                            placeholder="2.50"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Categoria</label>
                          <select
                            className="form-select"
                            value={itemForm.category}
                            onChange={(e) => setItemForm(prev => ({...prev, category: e.target.value}))}
                          >
                            {menuService.getMenuCategories().map(cat => (
                              <option key={cat} value={cat}>
                                {menuService.getCategoryLabel(cat)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Tempo Preparazione (minuti)</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        className="form-control"
                        value={itemForm.preparation_time}
                        onChange={(e) => setItemForm(prev => ({...prev, preparation_time: e.target.value}))}
                        placeholder="5"
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Immagine</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      {imagePreview && (
                        <div className="mt-2">
                          <img 
                            src={imagePreview} 
                            className="img-thumbnail" 
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            alt="Preview"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Allergeni</label>
                  <div className="row">
                    {menuService.getAllergens().map(allergen => (
                      <div key={allergen} className="col-md-4 col-sm-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={itemForm.allergens.includes(allergen)}
                            onChange={() => handleAllergenChange(allergen)}
                          />
                          <label className="form-check-label">
                            {menuService.getAllergenLabel(allergen)}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={itemForm.is_available}
                        onChange={(e) => setItemForm(prev => ({...prev, is_available: e.target.checked}))}
                      />
                      <label className="form-check-label">Disponibile</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={itemForm.track_inventory}
                        onChange={(e) => setItemForm(prev => ({...prev, track_inventory: e.target.checked}))}
                      />
                      <label className="form-check-label">Traccia inventario</label>
                    </div>
                  </div>
                </div>

                {itemForm.track_inventory && (
                  <div className="mt-3">
                    <label className="form-label">Quantità in stock</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={itemForm.inventory_count}
                      onChange={(e) => setItemForm(prev => ({...prev, inventory_count: e.target.value}))}
                      placeholder="0"
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowItemModal(false)}
                >
                  Annulla
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleSaveItem}
                  disabled={!itemForm.name || !itemForm.price || loading}
                >
                  {loading ? 'Salvataggio...' : 'Salva Articolo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}