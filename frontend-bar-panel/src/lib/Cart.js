export default class Cart {
  constructor({ taxPct = 10, currency = '€', onChange = null } = {}){
    this.taxPct = taxPct; this.currency = currency; this.onChange = onChange; this.items = new Map();
  }
  fmt(n){ return `${this.currency}${Number(n||0).toFixed(2)}`; }
  setTax(pct){ this.taxPct = Math.max(0, Number(pct)||0); this.#changed(); }
  setCurrency(sym){ this.currency = sym || this.currency; this.#changed(); }
  add(item, qty = 1){
    const id = item.id ?? item.sku ?? crypto.randomUUID();
    const cur = this.items.get(id) || { id, name:item.name||'Item', price:Number(item.price)||0, qty:0, meta:item };
    cur.qty = Math.max(0, cur.qty + Number(qty||0));
    if(cur.qty === 0) this.items.delete(id); else this.items.set(id, cur);
    this.#changed();
    return cur;
  }
  setQty(id, qty){ if(!this.items.has(id)) return; qty = Math.max(0, Number(qty)||0); if(qty===0) this.items.delete(id); else this.items.get(id).qty = qty; this.#changed(); }
  remove(id){ this.items.delete(id); this.#changed(); }
  clear(){ this.items.clear(); this.#changed(); }
  get count(){ let c=0; for(const it of this.items.values()) c+=it.qty; return c; }
  get subtotal(){ let s=0; for(const it of this.items.values()) s+=it.price*it.qty; return s; }
  get tax(){ return this.subtotal * (this.taxPct/100); }
  get total(){ return this.subtotal + this.tax; }
  toJSON(){ return { taxPct:this.taxPct, currency:this.currency, items:[...this.items.values()].map(({id,name,price,qty,meta})=>({id,name,price,qty,meta})) }; }
  toOrder({ customer='Walk‑in', status='Paid' }={}){ return { id: Date.now(), date: new Date().toISOString().slice(0,16).replace('T',' '), customer, total: this.total, status, lines:[...this.items.values()] }; }
  checkout({ onBefore=()=>true, onAfter=()=>{}, customer='Walk‑in' }={}){ if(this.count===0) return null; if(onBefore(this)===false) return null; const order = this.toOrder({ customer }); this.clear(); onAfter(order); return order; }
  #changed(){ if(typeof this.onChange==='function') this.onChange(this); }
}
