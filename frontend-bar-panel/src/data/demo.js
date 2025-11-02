export const PRODUCTS = [
  {id:1, sku:'BR-001', name:'Espresso', cat:'Caffetteria', price:1.20, stock:200, img:'https://images.unsplash.com/photo-1503481766315-7a586b20f66f?q=80&w=800&auto=format&fit=crop'},
  {id:2, sku:'BR-002', name:'Cappuccino', cat:'Caffetteria', price:1.80, stock:180, img:'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=800&auto=format&fit=crop'},
  {id:3, sku:'BR-003', name:'Cornetto', cat:'Pasticceria', price:1.30, stock:90, img:'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop'},
  {id:4, sku:'BR-004', name:'Spremuta Arancia', cat:'Bevande', price:3.00, stock:40, img:'https://images.unsplash.com/photo-1571072149931-93de89c7902a?q=80&w=800&auto=format&fit=crop'}
]

// 20 ordini per dashboard (stati: Pronto/In Attesa)
export const ORDERS = Array.from({length:20}).map((_,i)=>{
  const id = 1001 + i
  const customers = ['Mario Rossi','Anna Bianchi','John Doe','Giulia Verdi','Luca Neri','Elena Gialli','Sara Blu','Paolo Rosa','Francesca Marrone','Davide Nero']
  const customer = customers[i % customers.length]
  const date = new Date(2025,9,26 + Math.floor(i/5), 9 + (i%5)*2, 15).toISOString().slice(0,16).replace('T',' ')
  const status = (i % 3 === 0) ? 'Pronto' : 'In Attesa'
  const lines = [{productId: ((i%4)+1), qty: (i%3)+1}]
  return { id, date, customer, status, lines }
})

// Storico (solo Ritirato/Annullato) per tabella
export const HISTORY_ORDERS = [
  { id:1006, customer:'Sara Blu', date:'2025-10-27 13:15', total:12.80, status:'Ritirato',
    lines:[{productId:1, qty:2},{productId:3, qty:4}] },
  { id:1007, customer:'Paolo Rosa', date:'2025-10-27 14:00', total:7.20, status:'Annullato',
    lines:[{productId:2, qty:1},{productId:1, qty:3}] },
  { id:1010, customer:'Francesca Marrone', date:'2025-10-27 17:00', total:14.20, status:'Ritirato',
    lines:[{productId:4, qty:2},{productId:3, qty:2}] },
  { id:1013, customer:'Davide Nero', date:'2025-10-27 18:30', total:13.40, status:'Annullato',
    lines:[{productId:2, qty:2},{productId:3, qty:1}] },
]

// Pagamenti (simile screenshot)
export const PAYMENTS = [
  { customer:'Mario Rossi', orderId:1001, date:'2025-10-26 10:25', txId:'pi_1Hh1a2b3c4d5e6f7g8h9i0', amount:17.38, fee:0.49, status:'Completato' },
  { customer:'Anna Bianchi', orderId:1002, date:'2025-10-26 12:10', txId:'pi_2Jj2k3l4m5n6o7p8q9r0s1', amount:9.70, fee:0.39, status:'Completato' },
  { customer:'John Doe', orderId:1003, date:'2025-10-27 09:15', txId:'pi_3Kk3l4m5n6o7p8q9r0s1t2', amount:23.49, fee:0.69, status:'In attesa' },
  { customer:'Giulia Verdi', orderId:1004, date:'2025-10-27 11:05', txId:'pi_4Ll4m5n6o7p8q9r0s1t2u3', amount:8.50, fee:0.29, status:'Fallito' },
  { customer:'Luca Neri', orderId:1005, date:'2025-10-27 12:35', txId:'pi_5Mm5n6o7p8q9r0s1t2u3v4', amount:15.00, fee:0.45, status:'Completato' },
]
