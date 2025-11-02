// src/pages/Menu.js
import { useState } from "react";
import { 
  IonModal, 
  IonButton, 
  IonInput, 
  // IonTextarea, // Not used in current form 
  IonItem, 
  IonLabel,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonIcon
} from '@ionic/react';
import { close } from 'ionicons/icons';

export default function Menu() {
  const [products, setProducts] = useState([
    {
      title: "Cappuccino",
      price: "4.50",
      img: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400",
      category: "Bevande calde",
    },
    {
      title: "Latte",
      price: "5.00",
      img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
      category: "Bevande calde",
    },
  ]);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    img: "",
    category: "",
  });

  const categories = ["Bevande calde", "Bevande fredde", "Dolci"];

  const filteredProducts = products.filter((p) => {
    const s = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s)
    );
  });

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product });
    } else {
      setEditingProduct(null);
      setFormData({ title: "", price: "", img: "", category: "" });
    }
    setShowModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, img: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p === editingProduct ? { ...formData } : p))
      );
    } else {
      setProducts((prev) => [...prev, formData]);
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (editingProduct) {
      setProducts((prev) => prev.filter((p) => p !== editingProduct));
      setShowModal(false);
    }
  };

  return (
    <div className="pos-main">
      <div style={{ width: '100%', maxWidth: 900 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          {/* <h3>Menù Caffetteria</h3> */}
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Cerca prodotto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ minWidth: 200 }}
            />
            <IonButton onClick={() => handleOpenModal()}>Aggiungi</IonButton>
          </div>
        </div>
        <div className="pos-card-grid">
          {filteredProducts.map((product, i) => (
            <div key={i} className="pos-card" style={{ minWidth: 220 }}>
              <img src={product.img} alt={product.title} style={{ width: '100%', borderRadius: 8, marginBottom: 8 }} />
              <div style={{ fontWeight: 600, fontSize: 16 }}>{product.title}</div>
              <div style={{ color: '#888', fontSize: 14 }}>{product.category}</div>
              <div style={{ fontWeight: 700, color: '#ff6b35', fontSize: 16, margin: '8px 0' }}>€{product.price}</div>
              <IonButton expand="block" size="small" onClick={() => handleOpenModal(product)}>
                Modifica
              </IonButton>
            </div>
          ))}
        </div>
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{editingProduct ? 'Modifica Prodotto' : 'Aggiungi Prodotto'}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <div className="mb-3">
              <label>Nome</label>
              <IonInput value={formData.title} onIonChange={e => setFormData({ ...formData, title: e.detail.value })} />
            </div>
            <div className="mb-3">
              <label>Prezzo</label>
              <IonInput value={formData.price} onIonChange={e => setFormData({ ...formData, price: e.detail.value })} />
            </div>
            <div className="mb-3">
              <label>Categoria</label>
              <select className="form-control" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                <option value="">Seleziona categoria</option>
                {categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label>Immagine</label>
              <input type="file" className="form-control" onChange={handleImageUpload} />
              {formData.img && <img src={formData.img} alt="anteprima" style={{ width: 80, marginTop: 8 }} />}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <IonButton onClick={handleSave}>{editingProduct ? 'Salva' : 'Aggiungi'}</IonButton>
              {editingProduct && <IonButton color="danger" onClick={handleDelete}>Elimina</IonButton>}
              <IonButton fill="outline" onClick={() => setShowModal(false)}>Annulla</IonButton>
            </div>
          </IonContent>
        </IonModal>
      </div>
    </div>
  );
}
