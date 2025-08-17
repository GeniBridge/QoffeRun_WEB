import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import Staff from "./pages/Staff";

export default function App() {
  return (
    <Router>
      <Container fluid className="app-container">
        <Row>
          {/* Sidebar */}
          <Col md={2} className="sidebar p-3 vh-100">
            <Sidebar />
          </Col>

          {/* Main content */}
          <Col md={10} className="p-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/products" element={<Products />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/staff" element={<Staff />} />
            </Routes>
          </Col>
        </Row>
      </Container>
    </Router>
  );
}
