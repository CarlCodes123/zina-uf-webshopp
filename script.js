// ZINA UF storefront demo. Update the product names and prices below before publishing.
const products = [
  {id:1,name:"Olivgrön",desc:"Enfärgat olivgrönt halsband · pärlor ca 16 mm",price:null,category:"color",bg:"green",bead:"#59603a",image:"assets/olivia-olivgron.jpg",tag:"OLIVGRÖN"},
  {id:2,name:"Vinröd",desc:"Enfärgat vinrött halsband · pärlor ca 16 mm",price:null,category:"bold",bg:"pink",bead:"#711329",image:"assets/valentina-vinrod.jpg",tag:"VINRÖD"},
  {id:3,name:"Mörkbrun",desc:"Enfärgat mörkbrunt halsband · pärlor ca 16 mm",price:null,category:"bold",bg:"brown",bead:"#4b2b1d",image:"assets/halsband-morkbrun.jpg",tag:"MÖRKBRUN"},
  {id:4,name:"Svart",desc:"Enfärgat svart halsband · pärlor ca 16 mm",price:null,category:"bold",bg:"black",bead:"#151515",image:"assets/halsband-svart.jpg",tag:"SVART"}
];
const cart = new Map();
const $ = s => document.querySelector(s);
const money = n => `${n.toLocaleString("sv-SE")} kr`;
const grid = $("#product-grid");
const cartItems = $("#cart-items");
const drawer = $("#cart-drawer");
const overlay = $("#overlay");
const toast = $("#toast");
let toastTimer;

function renderProducts(filter="all"){
  grid.innerHTML = products.filter(p=>filter==="all"||p.category===filter).map(p=>`
    <article class="product-card">
      <div class="product-art ${p.bg}" style="--bead-color:${p.bead}">
        <img class="product-photo" src="${p.image}" alt="${p.name}, enfärgat pärlhalsband med stora pärlor omkring 16 mm">
        <span class="art-label">${p.tag}</span>
        <button class="quick-add" data-add="${p.id}" aria-label="Lägg ${p.name} i varukorgen">+</button>
      </div>
      <div class="product-info"><div><h3>${p.name}</h3><p>${p.desc}</p></div><div class="product-price">${p.price == null ? "Pris kommer" : money(p.price)}</div></div>
    </article>`).join("");
}
function showToast(message){
  toast.textContent=message;toast.classList.add("show");clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove("show"),2300);
}
function addToCart(id){
  cart.set(id,(cart.get(id)||0)+1);renderCart();
  showToast(`${products.find(p=>p.id===id).name} tillagd i varukorgen ♡`);
}
function renderCart(){
  const count=[...cart.values()].reduce((a,b)=>a+b,0);
  const hasUnknownPrice=products.some(p=>cart.has(p.id)&&p.price==null);
  const total=products.reduce((sum,p)=>sum+(p.price||0)*(cart.get(p.id)||0),0);
  $("#cart-count").textContent=count;$("#cart-total").textContent=hasUnknownPrice?"Pris bekräftas senare":money(total);
  if(!count){cartItems.innerHTML='<p class="empty-cart">Din varukorg är tom än så länge. Dags att hitta en favorit? ✳</p>';}
  else cartItems.innerHTML=products.filter(p=>cart.has(p.id)).map(p=>`
    <div class="cart-row"><div class="cart-thumb" style="background:var(--${p.bg})">✳</div>
    <div><h3>${p.name}</h3><p>${cart.get(p.id)} × ${p.price == null ? "Pris kommer" : money(p.price)}</p><button class="remove-item" data-remove="${p.id}">Ta bort en</button></div>
    <strong>${p.price == null ? "Pris kommer" : money(p.price*cart.get(p.id))}</strong></div>`).join("");
  $("#order-summary").innerHTML=products.filter(p=>cart.has(p.id)).map(p=>`${p.name} × ${cart.get(p.id)} — ${p.price == null ? "Pris bekräftas senare" : money(p.price*cart.get(p.id))}`).join("<br>")+`<hr><strong>${hasUnknownPrice ? "Slutpris bekräftas av ZINA UF" : "Produktsumma: "+money(total)}</strong>`;
  $("#checkout-button").disabled=!count;$("#checkout-button").style.opacity=count?1:.45;
}
function openCart(){drawer.classList.add("open");overlay.classList.add("visible");drawer.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";}
function closeCart(){drawer.classList.remove("open");overlay.classList.remove("visible");drawer.setAttribute("aria-hidden","true");document.body.style.overflow="";}
grid.addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(b)addToCart(Number(b.dataset.add));});
document.querySelector(".filters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderProducts(b.dataset.filter);});
cartItems.addEventListener("click",e=>{const b=e.target.closest("[data-remove]");if(!b)return;const id=Number(b.dataset.remove);if(cart.get(id)>1)cart.set(id,cart.get(id)-1);else cart.delete(id);renderCart();});
$("#open-cart").addEventListener("click",openCart);$("#close-cart").addEventListener("click",closeCart);overlay.addEventListener("click",closeCart);
$("#checkout-button").addEventListener("click",()=>{if(cart.size){closeCart();$("#checkout-dialog").showModal();}});
$("#close-checkout").addEventListener("click",()=>$("#checkout-dialog").close());
$("#checkout-form").addEventListener("submit",e=>{
  e.preventDefault();
  const data=new FormData(e.currentTarget);
  const lines=products.filter(p=>cart.has(p.id)).map(p=>`- ${p.name} x ${cart.get(p.id)}: ${p.price == null ? "Pris bekräftas senare" : money(p.price*cart.get(p.id))}`);
  const hasUnknownPrice=products.some(p=>cart.has(p.id)&&p.price==null);
  const total=products.reduce((sum,p)=>sum+(p.price||0)*(cart.get(p.id)||0),0);
  const order=`ORDERFÖRFRÅGAN – ZINA UF\n\nNamn: ${data.get("name")}\nE-post: ${data.get("email")}\nTelefon: ${data.get("phone")||"Ej angivet"}\n\nProdukter:\n${lines.join("\n")}\n\nProduktsumma: ${hasUnknownPrice ? "Bekräftas senare" : money(total)}\nMeddelande: ${data.get("message")||"Inget"}\n\nVänligen bekräfta betalning och leverans.`;
  // Replace this address with ZINA UF's real order email before launch.
  const orderEmail="BYT-TILL-ER-EPOST@EXEMPEL.SE";
  const subject=encodeURIComponent("Beställningsförfrågan – ZINA UF");
  const body=encodeURIComponent(order);
  if(orderEmail.includes("BYT-TILL-ER-EPOST")){
    const blob=new Blob([order],{type:"text/plain;charset=utf-8"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="zina-bestallningsforfragan.txt";a.click();URL.revokeObjectURL(url);
    $("#checkout-dialog").close();showToast("Ordertexten laddades ner. Lägg in er ordermejl i script.js!");
  }else{
    window.location.href=`mailto:${orderEmail}?subject=${subject}&body=${body}`;
    $("#checkout-dialog").close();showToast("Din e-postapp öppnas med orderförfrågan.");
  }
});
$("#year").textContent=new Date().getFullYear();
renderProducts();renderCart();
