// src/components/ProductCard.js
export default function ProductCard({ img, title, price }) {
  return (
    <div className="col-md-3">
      <div className="card p-2">
        <img src={img} alt={title} className="product-img card-img-top" />
        <div className="card-body text-center">
          <h6 className="card-title mb-1">{title}</h6>
          <p className="text-muted mb-2">€{price}</p>
        </div>
      </div>
    </div>
  );
}
