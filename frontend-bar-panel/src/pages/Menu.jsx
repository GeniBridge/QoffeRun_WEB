import React, { useState, useEffect } from 'react';
import menuService from '../services/menuService';
import { useBranch } from '../context/BranchContext';

export default function Menu() {
  const { selectedBranch } = useBranch();
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
    customization_options: {},
    track_inventory: false,
    inventory_count: ''
  });

  const [imagePreview, setImagePreview] = useState('');

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

  const loadBranchMenus = async () => {
    if (!selectedBranch) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await menuService.getBranchMenus(selectedBranch.id);
      setMenus(response.menus || []);
      
      if (response.menus && response.menus.length > 0) {
        setSelectedMenu(response.menus[0]);
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
      const response = await menuService.getMenuItems(selectedBranch.id, selectedMenu.id);
      setMenuItems(response.items || []);
    } catch (error) {
      setError('Errore nel caricamento degli articoli: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMenu = async (e) => {
    e.preventDefault();
    try {
      if (editingMenu) {
        // Update menu logic would go here when API supports it
        await menuService.updateMenu(selectedBranch.id, editingMenu.id, menuForm);
      } else {
        await menuService.createMenu(selectedBranch.id, menuForm);
      }
      setShowMenuModal(false);
      setEditingMenu(null);
      setMenuForm({ name: '', description: '', is_active: true, menu_type: 'drinks' });
      loadBranchMenus();
    } catch (error) {
      setError('Errore nella gestione del menu: ' + error.message);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      // Debug: log what we're sending
      console.log('Sending item data:', itemForm);
      console.log('editingItem state:', editingItem);
      if (itemForm.image) {
        console.log('Image file:', itemForm.image.name, itemForm.image.size, 'bytes');
      }

      if (editingItem) {
        await menuService.updateMenuItem(selectedBranch.id, selectedMenu.id, editingItem.id, itemForm);
      } else {
        await menuService.addMenuItem(selectedBranch.id, selectedMenu.id, itemForm);
      }
      
      setShowItemModal(false);
      setEditingItem(null);
      resetItemForm();
      loadMenuItems();
    } catch (error) {
      setError('Errore nel salvataggio dell\'articolo: ' + error.message);
      console.error('Error details:', error);
    }
  };

  const handleDeleteItem = async (item) => {
    if (window.confirm(`Sei sicuro di voler eliminare "${item.name}"?`)) {
      try {
        await menuService.deleteMenuItem(selectedBranch.id, selectedMenu.id, item.id);
        loadMenuItems();
      } catch (error) {
        setError('Errore nell\'eliminazione dell\'articolo: ' + error.message);
      }
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await menuService.toggleItemAvailability(selectedBranch.id, selectedMenu.id, item.id);
      loadMenuItems();
    } catch (error) {
      setError('Errore nell\'aggiornamento della disponibilità: ' + error.message);
    }
  };

  const resetItemForm = () => {
    setItemForm({
      name: '',
      description: '',
      price: '',
      category: 'coffee',
      is_available: true,
      image: null,
      preparation_time: '',
      allergens: [],
      customization_options: {},
      track_inventory: false,
      inventory_count: ''
    });
    setImagePreview('');
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      category: item.category || 'coffee',
      is_available: item.is_available !== false,
      image: null,
      preparation_time: item.preparation_time || '',
      allergens: item.allergens ? (Array.isArray(item.allergens) ? item.allergens : JSON.parse(item.allergens)) : [],
      customization_options: item.customization_options ? (typeof item.customization_options === 'object' ? item.customization_options : JSON.parse(item.customization_options)) : {},
      track_inventory: item.track_inventory || false,
      inventory_count: item.stock_quantity || ''
    });
    setImagePreview(item.image_url || '');
    setShowItemModal(true);
  };

  const openEditMenu = (menu) => {
    setEditingMenu(menu);
    setMenuForm({
      name: menu.name || '',
      description: menu.description || '',
      is_active: menu.is_active !== false,
      menu_type: menu.menu_type || 'drinks'
    });
    setShowMenuModal(true);
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

  // Customization options management
  const addCustomizationType = () => {
    const typeName = prompt('Nome del tipo di personalizzazione (es: Dimensione, Tipo di latte):');
    if (!typeName) return;
    
    const typeKey = typeName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newCustomizations = {
      ...itemForm.customization_options,
      [typeKey]: {
        label: typeName,
        required: false,
        options: {}
      }
    };
    
    setItemForm(prev => ({
      ...prev,
      customization_options: newCustomizations
    }));
  };

  const removeCustomizationType = (typeKey) => {
    const newCustomizations = {...itemForm.customization_options};
    delete newCustomizations[typeKey];
    setItemForm(prev => ({
      ...prev,
      customization_options: newCustomizations
    }));
  };

  const updateCustomizationType = (typeKey, field, value) => {
    setItemForm(prev => ({
      ...prev,
      customization_options: {
        ...prev.customization_options,
        [typeKey]: {
          ...prev.customization_options[typeKey],
          [field]: value
        }
      }
    }));
  };

  const addCustomizationOption = (typeKey) => {
    const optionName = prompt('Nome dell\'opzione (es: Piccolo, Grande, Latte di mandorla):');
    if (!optionName) return;
    
    const priceStr = prompt('Prezzo aggiuntivo (0 per gratuito):');
    const price = parseFloat(priceStr) || 0;
    
    const optionKey = optionName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    setItemForm(prev => ({
      ...prev,
      customization_options: {
        ...prev.customization_options,
        [typeKey]: {
          ...prev.customization_options[typeKey],
          options: {
            ...prev.customization_options[typeKey].options,
            [optionKey]: {
              label: optionName,
              price: price
            }
          }
        }
      }
    }));
  };

  const removeCustomizationOption = (typeKey, optionKey) => {
    const newOptions = {...itemForm.customization_options[typeKey].options};
    delete newOptions[optionKey];
    
    setItemForm(prev => ({
      ...prev,
      customization_options: {
        ...prev.customization_options,
        [typeKey]: {
          ...prev.customization_options[typeKey],
          options: newOptions
        }
      }
    }));
  };

  const availableAllergens = ['dairy', 'nuts', 'gluten', 'soy', 'eggs', 'shellfish', 'sesame'];
  const categories = [
    { value: 'coffee', label: 'Caffè' },
    { value: 'tea', label: 'Tè' },
    { value: 'cold_drinks', label: 'Bevande Fredde' },
    { value: 'pastry', label: 'Pasticceria' },
    { value: 'sandwich', label: 'Panini' },
    { value: 'breakfast', label: 'Colazione' },
    { value: 'dessert', label: 'Dolci' },
    { value: 'other', label: 'Altro' }
  ];

  if (!selectedBranch) {
    return (
      <section>
        <div className="alert alert-warning">
          <i className="bi bi-info-circle me-2"></i>
          Seleziona una filiale per gestire i menu
        </div>
      </section>
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

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestione Menu - {selectedBranch.name}</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingMenu(null);
            setMenuForm({ name: '', description: '', is_active: true, menu_type: 'drinks' });
            setShowMenuModal(true);
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nuovo Menu
        </button>
      </div>

      {/* Menu Selection */}
      {menus.length > 0 && (
        <div className="mb-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="fw-semibold">Menu:</span>
            {menus.map(menu => (
              <div key={menu.id} className="position-relative">
                <button 
                  className={`btn ${selectedMenu?.id === menu.id ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                  onClick={() => setSelectedMenu(menu)}
                >
                  {menu.name}
                  <span className="badge bg-light text-dark ms-2">
                    {menu.items_count || 0}
                  </span>
                </button>
                <button 
                  className="btn btn-sm btn-outline-secondary ms-1"
                  onClick={() => openEditMenu(menu)}
                  title="Modifica Menu"
                >
                  <i className="bi bi-pencil"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items Management */}
      {selectedMenu ? (
        <div className="bg-white rounded-4 border">
          <div className="p-4 border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-1">Articoli - {selectedMenu.name}</h4>
                <p className="text-muted mb-0">{selectedMenu.description || 'Nessuna descrizione'}</p>
              </div>
              <button 
                className="btn btn-success"
                onClick={() => {
                  setEditingItem(null);
                  resetItemForm();
                  setShowItemModal(true);
                }}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Aggiungi Articolo
              </button>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Caricamento...</span>
                </div>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-cup-hot display-1"></i>
                <p className="mt-3">Nessun articolo nel menu. Aggiungi il primo articolo!</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Immagine</th>
                      <th>Nome</th>
                      <th>Categoria</th>
                      <th>Prezzo</th>
                      <th>Disponibilità</th>
                      <th>Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.map(item => (
                      <tr key={item.id}>
                        <td>
                          <img 
                            src={item.image_url || 'https://api.qofferun.com/api/placeholder/48/48'} 
                            width="48" 
                            height="48" 
                            className="rounded object-fit-cover"
                            alt={item.name}
                          />
                        </td>
                        <td>
                          <div>
                            <strong>{item.name}</strong>
                            {item.description && (
                              <div className="text-muted small">{item.description}</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {categories.find(c => c.value === item.category)?.label || item.category}
                          </span>
                        </td>
                        <td>
                          <span className="fw-semibold">€{parseFloat(item.price || 0).toFixed(2)}</span>
                        </td>
                        <td>
                          <button
                            className={`btn btn-sm ${item.is_available ? 'btn-success' : 'btn-outline-secondary'}`}
                            onClick={() => handleToggleAvailability(item)}
                          >
                            <i className={`bi ${item.is_available ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                            {item.is_available ? 'Disponibile' : 'Non Disponibile'}
                          </button>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => openEditItem(item)}
                              title="Modifica"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDeleteItem(item)}
                              title="Elimina"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-4 border p-5 text-center text-muted">
          <i className="bi bi-menu-button-wide display-1"></i>
          <h4 className="mt-3">Seleziona o crea un menu</h4>
          <p>Scegli un menu esistente o creane uno nuovo per iniziare ad aggiungere articoli.</p>
        </div>
      )}

      {/* Menu Creation/Edit Modal */}
      {showMenuModal && (
        <>
          <div className="modal fade show" style={{display:'block'}} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <form onSubmit={handleCreateMenu}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {editingMenu ? 'Modifica Menu' : 'Crea Nuovo Menu'}
                    </h5>
                    <button 
                      type="button" 
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
                        onChange={e => setMenuForm({...menuForm, name: e.target.value})}
                        required
                        placeholder="es. Menu Colazione, Menu Pranzo..."
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Descrizione</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={menuForm.description}
                        onChange={e => setMenuForm({...menuForm, description: e.target.value})}
                        placeholder="Descrizione opzionale del menu..."
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Tipo Menu</label>
                      <select
                        className="form-select"
                        value={menuForm.menu_type}
                        onChange={e => setMenuForm({...menuForm, menu_type: e.target.value})}
                      >
                        <option value="drinks">Bevande</option>
                        <option value="food">Cibo</option>
                        <option value="desserts">Dolci</option>
                        <option value="breakfast">Colazione</option>
                        <option value="lunch">Pranzo</option>
                        <option value="dinner">Cena</option>
                      </select>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={menuForm.is_active}
                        onChange={e => setMenuForm({...menuForm, is_active: e.target.checked})}
                      />
                      <label className="form-check-label">Menu Attivo</label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowMenuModal(false)}
                    >
                      Annulla
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingMenu ? 'Aggiorna Menu' : 'Crea Menu'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* Item Creation/Edit Modal */}
      {showItemModal && (
        <>
          <div className="modal fade show" style={{display:'block'}} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <form onSubmit={handleCreateItem}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {editingItem ? 'Modifica Articolo' : 'Nuovo Articolo'}
                    </h5>
                    <button 
                      type="button" 
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
                            onChange={e => setItemForm({...itemForm, name: e.target.value})}
                            required
                            placeholder="es. Cappuccino, Cornetto..."
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Prezzo (€) *</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-control"
                            value={itemForm.price}
                            onChange={e => setItemForm({...itemForm, price: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Descrizione</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={itemForm.description}
                        onChange={e => setItemForm({...itemForm, description: e.target.value})}
                        placeholder="Descrizione dell'articolo..."
                      ></textarea>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Categoria</label>
                          <select
                            className="form-select"
                            value={itemForm.category}
                            onChange={e => setItemForm({...itemForm, category: e.target.value})}
                          >
                            {categories.map(cat => (
                              <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Tempo Preparazione (min)</label>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            className="form-control"
                            value={itemForm.preparation_time}
                            onChange={e => setItemForm({...itemForm, preparation_time: e.target.value})}
                            placeholder="5"
                          />
                        </div>
                      </div>
                    </div>

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
                          <img src={imagePreview} alt="Preview" className="img-thumbnail" style={{maxHeight: '100px'}} />
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Allergeni</label>
                      <div className="d-flex flex-wrap gap-2">
                        {availableAllergens.map(allergen => (
                          <div key={allergen} className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={itemForm.allergens.includes(allergen)}
                              onChange={() => handleAllergenChange(allergen)}
                              id={`allergen-${allergen}`}
                            />
                            <label className="form-check-label" htmlFor={`allergen-${allergen}`}>
                              {allergen}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customization Options Section */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <label className="form-label mb-0">Opzioni di Personalizzazione</label>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={addCustomizationType}
                        >
                          <i className="bi bi-plus-circle me-1"></i>
                          Aggiungi Tipo
                        </button>
                      </div>
                      
                      {Object.keys(itemForm.customization_options).length === 0 ? (
                        <div className="text-muted small">
                          <i className="bi bi-info-circle me-1"></i>
                          Nessuna personalizzazione configurata. Aggiungi tipi di personalizzazione come "Dimensione", "Tipo di latte", ecc.
                        </div>
                      ) : (
                        <div className="border rounded p-3 bg-light">
                          {Object.entries(itemForm.customization_options).map(([typeKey, typeData]) => (
                            <div key={typeKey} className="mb-3 border-bottom pb-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center gap-3">
                                  <strong>{typeData.label}</strong>
                                  <div className="form-check form-check-inline">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      checked={typeData.required}
                                      onChange={e => updateCustomizationType(typeKey, 'required', e.target.checked)}
                                      id={`required-${typeKey}`}
                                    />
                                    <label className="form-check-label small" htmlFor={`required-${typeKey}`}>
                                      Obbligatorio
                                    </label>
                                  </div>
                                </div>
                                <div>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success me-2"
                                    onClick={() => addCustomizationOption(typeKey)}
                                  >
                                    <i className="bi bi-plus"></i>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => removeCustomizationType(typeKey)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </div>
                              
                              <div className="row g-2">
                                {Object.entries(typeData.options).map(([optionKey, optionData]) => (
                                  <div key={optionKey} className="col-md-6">
                                    <div className="d-flex align-items-center justify-content-between bg-white rounded p-2 border">
                                      <div>
                                        <span className="fw-medium">{optionData.label}</span>
                                        {optionData.price > 0 && (
                                          <span className="badge bg-success ms-2">+€{optionData.price.toFixed(2)}</span>
                                        )}
                                        {optionData.price === 0 && (
                                          <span className="badge bg-secondary ms-2">Gratuito</span>
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => removeCustomizationOption(typeKey, optionKey)}
                                      >
                                        <i className="bi bi-x"></i>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={itemForm.is_available}
                        onChange={e => setItemForm({...itemForm, is_available: e.target.checked})}
                      />
                      <label className="form-check-label">Articolo Disponibile</label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowItemModal(false)}
                    >
                      Annulla
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingItem ? 'Aggiorna Articolo' : 'Crea Articolo'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </section>
  );
}