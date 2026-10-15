// ZINA UF storefront. Order requests are sent through FormSubmit; activate the recipient email before launch.
const products = [
  {id:1,name:"Olivgrön",desc:"Enfärgat olivgrönt halsband · pärlor ca 16 mm",price:249,category:"color",bg:"green",bead:"#59603a",image:"assets/olivia-olivgron.jpg",tag:"OLIVGRÖN"},
  {id:2,name:"Vinröd",desc:"Enfärgat vinrött halsband · pärlor ca 16 mm",price:249,category:"bold",bg:"pink",bead:"#711329",image:"assets/valentina-vinrod.jpg",tag:"VINRÖD"},
  {id:3,name:"Mörkbrun",desc:"Enfärgat mörkbrunt halsband · pärlor ca 16 mm",price:249,category:"bold",bg:"brown",bead:"#4b2b1d",image:"assets/halsband-morkbrun.jpg",tag:"MÖRKBRUN"},
  {id:4,name:"Svart",desc:"Enfärgat svart halsband · pärlor ca 16 mm",price:249,category:"bold",bg:"black",bead:"#151515",image:"assets/halsband-svart.jpg",tag:"SVART"}
];
const cart = new Map();
const SHIPPING_FEE = 49;
const ORDER_EMAIL = "zina.uf2026@gmail.com";
const SWISH_NUMBER = "1237073257";
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
  const subtotal=products.reduce((sum,p)=>sum+(p.price||0)*(cart.get(p.id)||0),0);
  const total=subtotal+(count?SHIPPING_FEE:0);
  $("#cart-count").textContent=count;$("#cart-total").textContent=hasUnknownPrice?"Pris bekräftas senare":money(total);
  if(!count){cartItems.innerHTML='<p class="empty-cart">Din varukorg är tom än så länge. Dags att hitta en favorit? ✳</p>';}
  else cartItems.innerHTML=products.filter(p=>cart.has(p.id)).map(p=>`
    <div class="cart-row"><div class="cart-thumb" style="background:var(--${p.bg})">✳</div>
    <div><h3>${p.name}</h3><p>${cart.get(p.id)} × ${p.price == null ? "Pris kommer" : money(p.price)}</p><button class="remove-item" data-remove="${p.id}">Ta bort en</button></div>
    <strong>${p.price == null ? "Pris kommer" : money(p.price*cart.get(p.id))}</strong></div>`).join("");
  const subtotal=products.reduce((sum,p)=>sum+(p.price||0)*(cart.get(p.id)||0),0);
  const total=subtotal+(count?SHIPPING_FEE:0);
  $("#order-summary").innerHTML=products.filter(p=>cart.has(p.id)).map(p=>`${p.name} × ${cart.get(p.id)} — ${money(p.price*cart.get(p.id))}`).join("<br>")+`<hr>Produktsumma: ${money(subtotal)}<br>Frakt: ${money(SHIPPING_FEE)}<br><strong>Totalt: ${money(total)}</strong><p>Betalning sker via Swish efter att ZINA UF bekräftat beställningen.</p>`;
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
$("#checkout-form").addEventListener("submit",async e=>{
  e.preventDefault();
  if(!cart.size){showToast("Varukorgen är tom.");return;}
  const form=e.currentTarget;
  const submitButton=form.querySelector('button[type="submit"]');
  const data=new FormData(form);
  const items=products.filter(p=>cart.has(p.id)).map(p=>({name:p.name,quantity:cart.get(p.id),unitPrice:p.price,lineTotal:p.price*cart.get(p.id)}));
  const subtotal=items.reduce((sum,p)=>sum+p.lineTotal,0);
  const total=subtotal+SHIPPING_FEE;
  const orderId="ZINA-"+Date.now().toString().slice(-8);
  const itemLines=items.map(p=>`- ${p.name} x ${p.quantity}: ${money(p.lineTotal)}`).join("\\n");
  const message=[
    "NY BESTÄLLNING – ZINA UF",
    "Ordernummer: "+orderId,
    "",
    "Kund: "+data.get("name"),
    "E-post: "+data.get("email"),
    "Telefon: "+data.get("phone"),
    "Adress: "+data.get("address"),
    "Postnummer och ort: "+data.get("postcode")+" "+data.get("city"),
    "",
    "Produkter:",
    itemLines,
    "",
    "Produktsumma: "+money(subtotal),
    "Frakt: "+money(SHIPPING_FEE),
    "TOTALT: "+money(total),
    "Betalning: Swish efter bekräftelse",
    "Swishnummer: "+SWISH_NUMBER,
    "Meddelande: "+(data.get("message")||"Inget"),
    "",
    "Kontrollera lager och adress och bekräfta sedan beställningen med kunden."
  ].join("\\n");
  submitButton.disabled=true;
  submitButton.textContent="Skickar beställning…";
  try{
    const response=await fetch("https://formsubmit.co/ajax/"+ORDER_EMAIL,{
      method:"POST",
      headers:{"Content-Type":"application/json","Accept":"application/json"},
      body:JSON.stringify({
        _subject:"ZINA UF – ny beställning "+orderId,
        _template:"table",
        _captcha:"true",
        _replyto:data.get("email"),
        order_number:orderId,
        customer_name:data.get("name"),
        customer_email:data.get("email"),
        customer_phone:data.get("phone"),
        shipping_address:data.get("address")+", "+data.get("postcode")+" "+data.get("city"),
        products:itemLines,
        product_subtotal:money(subtotal),
        shipping:money(SHIPPING_FEE),
        total:money(total),
        payment:"Swish efter bekräftelse",
        swish_number:SWISH_NUMBER,
        customer_message:data.get("message")||"Inget",
        order_details:message
      })
    });
    const result=await response.json();
    if(!response.ok||result.success!== "true" && result.success!==true){
      throw new Error("Formulärtjänsten bekräftade inte mottagandet.");
    }
    $("#checkout-dialog").close();
    form.reset();
    cart.clear();
    renderCart();
    const confirmation=document.createElement("dialog");
    confirmation.className="checkout-dialog";
    confirmation.innerHTML='<div class="dialog-head"><div><p class="eyebrow">TACK FÖR DIN BESTÄLLNING</p><h2>Orderförfrågan <span>skickad!</span></h2></div><button type="button" class="icon-button" aria-label="Stäng">✕</button></div><p class="dialog-intro">Ditt ordernummer är <strong>'+orderId+'</strong>. ZINA UF behöver bekräfta beställningen innan du betalar.</p><div class="order-summary"><strong>Betalning via Swish</strong><br>Swishnummer: '+SWISH_NUMBER+'<br>Att betala inklusive frakt: '+money(total)+'<br><br><strong>Vänta med att betala</strong> tills ZINA UF har bekräftat att beställningen kan levereras och skickat betalningsinstruktioner.</div><button class="button button-dark checkout-button" type="button">Klart</button>';
    document.body.appendChild(confirmation);
    confirmation.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{confirmation.close();confirmation.remove();}));
    confirmation.addEventListener("close",()=>confirmation.remove());
    confirmation.showModal();
  }catch(error){
    console.error(error);
    showToast("Beställningen kunde inte skickas. Försök igen eller kontakta zina.uf2026@gmail.com.");
  }finally{
    submitButton.disabled=false;
    submitButton.innerHTML='Skicka beställning <span>↗</span>';
  }
});
$("#year").textContent=new Date().getFullYear();
renderProducts();renderCart();
