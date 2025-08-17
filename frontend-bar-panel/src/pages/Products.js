import { useState } from "react";
import { Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";

export default function Products() {
  const categories = ["Show All", "Coffee", "Pastry", "Juice", "Sandwich", "Pizza"];
  const products = [
    { id: 1, name: "Espresso", category: "Coffee", price: 2.5, image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMTc3M3wwfDF8c2VhcmNofDF8fGVzcHJlc3NvfGVufDB8fHx8MTY5MjU0MDQ4Nw&ixlib=rb-4.0.3&q=80&w=150" },
    { id: 2, name: "Cappuccino", category: "Coffee", price: 3.0, image: "https://images.unsplash.com/photo-1604908177527-0d3d3eb69f3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=150" },
    { id: 3, name: "Croissant", category: "Pastry", price: 1.8, image: "https://images.unsplash.com/photo-1617196032282-c10f391bdf2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=150" },
    { id: 4, name: "Orange Juice", category: "Juice", price: 3.5, image: "https://images.unsplash.com/photo-1580910051070-0f94c11e9835?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=150" },
    { id: 5, name: "Club Sandwich", category: "Sandwich", price: 5.0, image: "https://images.unsplash.com/photo-1598866540396-52f34ec8f2b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=150" },
    { id: 6, name: "Vegetable Pizza", category: "Pizza", price: 6.5, image: "https://images.unsplash.com/photo-1594007651656-2f87c13a2f5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=150" }
  ];

  const [order, setOrder] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Show All");

  const addToOrder = (product) => {
    const exists = order.find((o) => o.id === product.id);
    if (exists) {
      setOrder(order.map((o) => o.id === product.id ? { ...o, qty: o.qty + 1 } : o));
    } else {
      setOrder([...order, { ...product, qty: 1 }]);
    }
  };

  const total = order.reduce((sum, o) => sum + o.price * o.qty, 0);

  const filteredProducts = products.filter(p => 
    (activeCategory === "Show All" || p.category === activeCategory) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Row>
      {/* Products List */}
      <Col md={8}>
        <h5 className="fw-bold">Prodotti</h5>

        <InputGroup className="mb-3 mt-3">
          <InputGroup.Text><FaSearch /></InputGroup.Text>
          <Form.Control 
            placeholder="Search in products" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </InputGroup>

        <div className="mb-3">
          {categories.map((cat, i) => (
            <Button 
              key={i} 
              className={`me-2 ${activeCategory === cat ? "btn-primary" : "btn-outline-primary"}`} 
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        <Row>
          {filteredProducts.map((p) => (
            <Col md={4} lg={3} key={p.id} className="mb-4">
              <div className="product-card text-center border p-2 rounded">
                <img src={p.image} alt={p.name} className="img-fluid rounded" />
                <h6 className="mt-2">{p.name}</h6>
                <p className="price">${p.price.toFixed(2)}</p>
                <Button className="add-btn" onClick={() => addToOrder(p)}>+</Button>
              </div>
            </Col>
          ))}
        </Row>
      </Col>

      {/* Order Summary */}
      <Col md={4} className="order-panel p-4 border-start">
        <h6 className="fw-bold">Order</h6>
        {order.length === 0 && <p className="text-muted">No items yet</p>}
        {order.map((o) => (
          <div key={o.id} className="d-flex justify-content-between border-bottom py-2">
            <span>{o.name} x {o.qty}</span>
            <span>${(o.price * o.qty).toFixed(2)}</span>
          </div>
        ))}
        <hr />
        <h5>Total: ${total.toFixed(2)}</h5>
        <div className="d-flex gap-2 mt-3">
          <Button className="btn-primary flex-fill">Bill & Payment</Button>
          <Button variant="success" className="flex-fill">Bill & Print</Button>
        </div>
      </Col>
    </Row>
  );
}
