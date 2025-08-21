// src/pages/Menu.js
import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

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
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Menù Caffetteria</h3>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Cerca per prodotto o categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-success" onClick={() => handleOpenModal()}>
            Nuovo Prodotto
          </button>
        </div>
      </div>

      <div className="row g-3">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p, i) => (
            <div key={i} className="col-md-3">
              <div
                className="card h-100 cursor-pointer"
                onClick={() => handleOpenModal(p)}
              >
                <img
                  src={p.img}
                  className="card-img-top"
                  alt={p.title}
                  style={{ objectFit: "cover", height: "200px" }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{p.title}</h5>
                  <p className="card-text mb-2">€{p.price}</p>
                  <p className="card-text text-muted">{p.category}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">Nessun prodotto trovato.</p>
        )}
      </div>

      {/* Modal aggiungi/modifica prodotto */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? "Modifica Prodotto" : "Nuovo Prodotto"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Nome prodotto</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Immagine</Form.Label>
              {formData.img && (
                <img
                  src={formData.img}
                  alt="Preview"
                  className="mb-2"
                  style={{ width: "100%", height: "150px", objectFit: "cover" }}
                />
              )}
              <Form.Control type="file" onChange={handleImageUpload} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Categoria</Form.Label>
              <Form.Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Seleziona categoria</option>
                {categories.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Prezzo (€)</Form.Label>
              <Form.Control
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          {editingProduct && (
            <Button variant="danger" onClick={handleDelete}>
              Elimina
            </Button>
          )}
          <div>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Annulla
            </Button>
            <Button variant="success" onClick={handleSave}>
              Salva
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
