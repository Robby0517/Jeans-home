// ══════════════════════════════════════════
// DATA STORE
// ══════════════════════════════════════════
const catEmoji = {'Slim Fit':'👖','Wide Leg':'🩻','Cargo':'🎒','Skinny':'✂️','Straight Cut':'📐'};
const catColors = {'Slim Fit':'#dbeafe','Wide Leg':'#fef3c7','Cargo':'#fee2e2','Skinny':'#dcfce7','Straight Cut':'#f3e8ff'};

let products = [
  {id:1,nama:'Slim Fit Classic Navy',kat:'Slim Fit',ukuran:'28–34',warna:'Navy Blue',sup:1,stok:24,stokMin:5,beli:120000,jual:185000,ket:'Bahan denim premium'},
  {id:2,nama:'Wide Leg Beige Linen',kat:'Wide Leg',ukuran:'27–33',warna:'Beige',sup:2,stok:7,stokMin:8,beli:145000,jual:225000,ket:''},
  {id:3,nama:'Cargo Jeans Hitam',kat:'Cargo',ukuran:'29–36',warna:'Hitam',sup:3,stok:15,stokMin:5,beli:170000,jual:275000,ket:'Banyak kantong'},
  {id:4,nama:'Skinny Ripped Blue',kat:'Skinny',ukuran:'26–32',warna:'Light Blue',sup:1,stok:3,stokMin:5,beli:125000,jual:195000,ket:''},
  {id:5,nama:'Straight Cut Grey',kat:'Straight Cut',ukuran:'28–34',warna:'Abu-abu',sup:2,stok:0,stokMin:5,beli:135000,jual:210000,ket:''},
  {id:6,nama:'Slim Fit Washed White',kat:'Slim Fit',ukuran:'27–33',warna:'Off White',sup:1,stok:18,stokMin:5,beli:115000,jual:175000,ket:''},
  {id:7,nama:'Wide Leg Dark Indigo',kat:'Wide Leg',ukuran:'28–36',warna:'Dark Indigo',sup:2,stok:5,stokMin:5,beli:158000,jual:240000,ket:''},
  {id:8,nama:'Skinny Black Coated',kat:'Skinny',ukuran:'26–31',warna:'Hitam',sup:3,stok:11,stokMin:5,beli:138000,jual:215000,ket:''},
  {id:9,nama:'Cargo Military Green',kat:'Cargo',ukuran:'30–36',warna:'Army Green',sup:3,stok:8,stokMin:5,beli:165000,jual:265000,ket:''},
  {id:10,nama:'Straight Cut Stone',kat:'Straight Cut',ukuran:'28–34',warna:'Stone Wash',sup:2,stok:12,stokMin:5,beli:140000,jual:220000,ket:''},
];

let suppliers = [
  {id:1,nama:'PT. Denim Nusantara',kota:'Bandung',telp:'022-1234567',email:'order@denimnus.co.id',spek:'Slim Fit, Skinny'},
  {id:2,nama:'CV. Tekstil Makmur',kota:'Surabaya',telp:'031-9876543',email:'tekstilmakmur@gmail.com',spek:'Wide Leg, Straight Cut'},
  {id:3,nama:'UD. Jeans Prima',kota:'Jakarta',telp:'021-5556789',email:'jeansprima@email.com',spek:'Cargo, Skinny'},
];

let masukLog = [
  {tgl:'2026-04-15',prodId:1,jml:12,faktur:'INV-042',note:'Restock bulanan'},
  {tgl:'2026-04-12',prodId:6,jml:8,faktur:'INV-041',note:''},
  {tgl:'2026-04-10',prodId:9,jml:10,faktur:'INV-040',note:'Order baru'},
];
let keluarLog = [
  {tgl:'2026-04-18',prodId:2,jml:3,jenis:'Penjualan',note:'Pelanggan Budi'},
  {tgl:'2026-04-17',prodId:4,jml:2,jenis:'Penjualan',note:''},
  {tgl:'2026-04-16',prodId:1,jml:5,jenis:'Penjualan',note:'Grosir'},
  {tgl:'2026-04-14',prodId:5,jml:2,jenis:'Rusak',note:'Cacat produksi'},
];

let activityLog = [
  {type:'in',txt:'Slim Fit Classic Navy — stok masuk 12 pcs',time:'15 Apr 09:15'},
  {type:'out',txt:'Wide Leg Beige — terjual 3 pcs',time:'18 Apr 08:42'},
  {type:'edit',txt:'Cargo Jeans Hitam — harga diperbarui',time:'13 Apr 08:10'},
  {type:'alert',txt:'Straight Cut Grey — stok habis',time:'14 Apr 10:30'},
  {type:'in',txt:'Cargo Military Green — stok masuk 10 pcs',time:'10 Apr 14:00'},
];

const salesData = [5,8,4,9,6,7,3]; // last 7 days
const stockInData = [3,5,2,6,0,4,1];

let nextId = 11; let nextSupId = 4;
let activeKat = 'semua'; let searchQ = ''; let sortMode = 'nama';
let editingId = null; let editingSupId = null;
let stokPage = 1; const PER_PAGE = 8;
let deleteTargetId = null;

// settings state
const settings = {
  notifLow:true, notifZero:true, autoDate:true, showHarga:true,
  minDefault:5, tokoNama:'Jeans Home', tokoAlamat:'Jl. Merdeka No.10, Jakarta'
};

// ══════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════
function fmt(n){return'Rp'+Number(n).toLocaleString('id-ID')}
function fmtDate(d){if(!d)return'—';const x=new Date(d);return x.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}
function today(){return new Date().toISOString().split('T')[0]}
function getProd(id){return products.find(p=>p.id===id)}
function getSup(id){return suppliers.find(s=>s.id===id)}
function getSupName(id){const s=getSup(id);return s?s.nama:'—'}
function stokStatus(p){
  if(p.stok===0)return{label:'Habis',cls:'badge-danger'};
  if(p.stok<=p.stokMin)return{label:'Menipis',cls:'badge-warn'};
  return{label:'Tersedia',cls:'badge-ok'};
}
function barColor(p){if(p.stok===0)return'#ef4444';if(p.stok<=p.stokMin)return'#f59e0b';return'var(--indigo2)'}
function getFiltered(){
  let list=[...products];
  if(activeKat!=='semua')list=list.filter(p=>p.kat===activeKat);
  if(searchQ)list=list.filter(p=>p.nama.toLowerCase().includes(searchQ.toLowerCase())||p.kat.toLowerCase().includes(searchQ.toLowerCase())||getSupName(p.sup).toLowerCase().includes(searchQ.toLowerCase()));
  if(sortMode==='nama')list.sort((a,b)=>a.nama.localeCompare(b.nama));
  else if(sortMode==='stok-asc')list.sort((a,b)=>a.stok-b.stok);
  else if(sortMode==='stok-desc')list.sort((a,b)=>b.stok-a.stok);
  else if(sortMode==='harga-asc')list.sort((a,b)=>a.jual-b.jual);
  else if(sortMode==='harga-desc')list.sort((a,b)=>b.jual-a.jual);
  return list;
}

// ══════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════
function goPage(id,btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  document.querySelectorAll('.sb-item').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  const titles={dashboard:'Dashboard',stok:'Stok Barang',masuk:'Barang Masuk',keluar:'Barang Keluar',laporan:'Laporan Stok',supplier:'Data Supplier',pengaturan:'Pengaturan'};
  document.getElementById('tb-crumb').textContent=titles[id]||id;
  if(id==='dashboard')renderDashboard();
  if(id==='stok'){renderStokStats();renderStok()}
  if(id==='masuk')renderMasuk();
  if(id==='keluar')renderKeluar();
  if(id==='laporan')renderLaporan();
  if(id==='supplier')renderSupplier();
  if(id==='pengaturan')renderPengaturan('toko');
}

// ══════════════════════════════════════════
// STATS RENDER
// ══════════════════════════════════════════
function makeStatCards(el){
  const totalStok=products.reduce((a,p)=>a+p.stok,0);
  const low=products.filter(p=>p.stok>0&&p.stok<=p.stokMin).length;
  const zero=products.filter(p=>p.stok===0).length;
  const nilai=products.reduce((a,p)=>a+p.stok*p.jual,0);
  el.innerHTML=`
  <div class="stat-card">
    <div class="stat-header"><div class="stat-icon-wrap blue">📦</div><span class="stat-trend neu">${products.length} jenis</span></div>
    <div class="stat-value">${products.length}</div>
    <div class="stat-label">Total Produk</div>
    <div class="stat-sub">${totalStok} unit total stok</div>
  </div>
  <div class="stat-card">
    <div class="stat-header"><div class="stat-icon-wrap green">✅</div><span class="stat-trend up">+3 minggu ini</span></div>
    <div class="stat-value">${totalStok}</div>
    <div class="stat-label">Total Stok</div>
    <div class="stat-sub">${products.filter(p=>p.stok>p.stokMin).length} produk aman</div>
  </div>
  <div class="stat-card">
    <div class="stat-header"><div class="stat-icon-wrap amber">⚠️</div><span class="stat-trend ${low+zero>0?'down':'up'}">${low+zero} produk</span></div>
    <div class="stat-value">${low+zero}</div>
    <div class="stat-label">Stok Kritis</div>
    <div class="stat-sub">${zero} habis · ${low} menipis</div>
  </div>
  <div class="stat-card">
    <div class="stat-header"><div class="stat-icon-wrap blue">💰</div><span class="stat-trend up">nilai aset</span></div>
    <div class="stat-value" style="font-size:20px">Rp${(nilai/1000000).toFixed(1)}jt</div>
    <div class="stat-label">Nilai Stok</div>
    <div class="stat-sub">Estimasi harga jual</div>
  </div>`;
}

// ══════════════════════════════════════════
// STOK PAGE
// ══════════════════════════════════════════
function renderStokStats(){makeStatCards(document.getElementById('stok-stats'))}

function renderStok(){
  sortMode=document.getElementById('sort-select').value;
  const list=getFiltered();
  const total=list.length;
  const pages=Math.ceil(total/PER_PAGE)||1;
  if(stokPage>pages)stokPage=1;
  const slice=list.slice((stokPage-1)*PER_PAGE,stokPage*PER_PAGE);
  const max=Math.max(...products.map(p=>p.stok),1);
  let html='';
  if(slice.length===0)html='<tr class="no-data-row"><td colspan="8">Tidak ada produk ditemukan</td></tr>';
  slice.forEach(p=>{
    const st=stokStatus(p);
    const pct=Math.round(p.stok/max*100);
    html+=`<tr>
      <td><div class="prod-cell">
        <div class="prod-thumb" style="background:${catColors[p.kat]||'#f0f0f0'}">${catEmoji[p.kat]||'👖'}</div>
        <div><div class="prod-name">${p.nama}</div><div class="prod-sku">SKU-${String(p.id).padStart(4,'0')} · ${p.warna||'—'}</div></div>
      </div></td>
      <td style="font-size:12px;color:var(--text2)">${p.kat}</td>
      <td style="font-size:12px">${p.ukuran||'—'}</td>
      <td style="font-size:12px;color:var(--text2)">${getSupName(p.sup)}</td>
      <td><div class="stk-bar">
        <div class="stk-bar-bg"><div class="stk-bar-fill" style="width:${pct}%;background:${barColor(p)}"></div></div>
        <span class="stk-num" style="color:${barColor(p)}">${p.stok}</span>
      </div></td>
      <td style="font-weight:500">${fmt(p.jual)}</td>
      <td><span class="badge ${st.cls}">${st.label}</span></td>
      <td>
        <button class="act-btn view" onclick="openDetail(${p.id})">Detail</button>
        <button class="act-btn" onclick="openEditModal(${p.id})">Edit</button>
        <button class="act-btn del" onclick="confirmDelete(${p.id})">Hapus</button>
      </td>
    </tr>`;
  });
  document.getElementById('stok-tbody').innerHTML=html;
  document.getElementById('stok-info').textContent=`Menampilkan ${(stokPage-1)*PER_PAGE+1}–${Math.min(stokPage*PER_PAGE,total)} dari ${total} produk`;
  // pagination
  let pgHtml='';
  for(let i=1;i<=pages;i++)pgHtml+=`<button class="pg-btn ${i===stokPage?'active':''}" onclick="goStokPage(${i})">${i}</button>`;
  document.getElementById('stok-pg').innerHTML=pgHtml;
  // update sidebar badge
  const warn=products.filter(p=>p.stok<=p.stokMin).length;
  document.getElementById('sb-badge-warn').textContent=warn;
  document.getElementById('sb-badge-warn').style.display=warn>0?'':'none';
  document.getElementById('notif-dot').style.display=warn>0?'':'none';
}
function goStokPage(n){stokPage=n;renderStok()}
function setKat(k,btn){activeKat=k;stokPage=1;document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));btn.classList.add('active');renderStok()}
function globalSearch(){searchQ=document.getElementById('global-search').value;renderStok()}

// ══════════════════════════════════════════
// PRODUCT MODAL
// ══════════════════════════════════════════
function populateSupSelect(selId){
  const el=document.getElementById(selId);
  el.innerHTML='<option value="">— pilih —</option>';
  suppliers.forEach(s=>el.innerHTML+=`<option value="${s.id}">${s.nama}</option>`);
}
function openAddModal(){
  editingId=null;
  document.getElementById('modal-prod-title').textContent='Tambah Produk Baru';
  ['f-nama','f-ukuran','f-warna','f-ket'].forEach(id=>document.getElementById(id).value='');
  ['f-stok','f-min','f-beli','f-jual'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('f-min').value=settings.minDefault;
  document.getElementById('f-kat').value='Slim Fit';
  populateSupSelect('f-sup');
  openModal('modal-prod');
}
function openEditModal(id){
  editingId=id;
  const p=getProd(id);
  document.getElementById('modal-prod-title').textContent='Edit Produk';
  document.getElementById('f-nama').value=p.nama;
  document.getElementById('f-kat').value=p.kat;
  document.getElementById('f-ukuran').value=p.ukuran||'';
  document.getElementById('f-warna').value=p.warna||'';
  document.getElementById('f-stok').value=p.stok;
  document.getElementById('f-min').value=p.stokMin;
  document.getElementById('f-beli').value=p.beli||'';
  document.getElementById('f-jual').value=p.jual;
  document.getElementById('f-ket').value=p.ket||'';
  populateSupSelect('f-sup');
  document.getElementById('f-sup').value=p.sup||'';
  openModal('modal-prod');
}
function saveProduct(){
  const nama=document.getElementById('f-nama').value.trim();
  const jual=parseInt(document.getElementById('f-jual').value)||0;
  const stok=parseInt(document.getElementById('f-stok').value)||0;
  if(!nama){toast('Nama produk wajib diisi','warn');return}
  if(!jual){toast('Harga jual wajib diisi','warn');return}
  const obj={
    nama,kat:document.getElementById('f-kat').value,
    sup:parseInt(document.getElementById('f-sup').value)||null,
    ukuran:document.getElementById('f-ukuran').value.trim(),
    warna:document.getElementById('f-warna').value.trim(),
    stok,stokMin:parseInt(document.getElementById('f-min').value)||5,
    beli:parseInt(document.getElementById('f-beli').value)||0,jual,
    ket:document.getElementById('f-ket').value.trim()
  };
  if(editingId){
    const p=getProd(editingId);Object.assign(p,obj);
    activityLog.unshift({type:'edit',txt:`${obj.nama} — data diperbarui`,time:'Baru saja'});
    toast('Produk berhasil diperbarui','success');
  } else {
    obj.id=nextId++;
    products.push(obj);
    activityLog.unshift({type:'in',txt:`${obj.nama} — produk baru ditambahkan`,time:'Baru saja'});
    toast('Produk berhasil ditambahkan','success');
  }
  closeModal('modal-prod');
  renderStokStats();renderStok();
}

// ══════════════════════════════════════════
// DETAIL MODAL
// ══════════════════════════════════════════
function openDetail(id){
  const p=getProd(id);
  const st=stokStatus(p);
  const totalMasuk=masukLog.filter(x=>x.prodId===id).reduce((a,x)=>a+x.jml,0);
  const totalKeluar=keluarLog.filter(x=>x.prodId===id).reduce((a,x)=>a+x.jml,0);
  document.getElementById('detail-title').textContent=p.nama;
  let histHtml='<div class="detail-grid">';
  histHtml+=`<div class="detail-item"><div class="detail-label">SKU</div><div class="detail-val">SKU-${String(p.id).padStart(4,'0')}</div></div>`;
  histHtml+=`<div class="detail-item"><div class="detail-label">Kategori</div><div class="detail-val">${p.kat}</div></div>`;
  histHtml+=`<div class="detail-item"><div class="detail-label">Ukuran</div><div class="detail-val">${p.ukuran||'—'}</div></div>`;
  histHtml+=`<div class="detail-item"><div class="detail-label">Warna</div><div class="detail-val">${p.warna||'—'}</div></div>`;
  histHtml+=`<div class="detail-item"><div class="detail-label">Supplier</div><div class="detail-val">${getSupName(p.sup)}</div></div>`;
  histHtml+=`<div class="detail-item"><div class="detail-label">Status</div><div class="detail-val"><span class="badge ${st.cls}">${st.label}</span></div></div>`;
  histHtml+=`<div class="detail-item"><div class="detail-label">Stok Sekarang</div><div class="detail-val" style="font-size:18px;font-family:'Playfair Display',serif">${p.stok}</div></div>`;
  histHtml+=`<div class="detail-item"><div class="detail-label">Stok Minimum</div><div class="detail-val">${p.stokMin}</div></div>`;
  histHtml+=`<div class="detail-item"><div class="detail-label">Harga Beli</div><div class="detail-val">${p.beli?fmt(p.beli):'—'}</div></div>`;
  histHtml+=`<div class="detail-item"><div class="detail-label">Harga Jual</div><div class="detail-val">${fmt(p.jual)}</div></div>`;
  histHtml+=`<div class="detail-item"><div class="detail-label">Total Masuk</div><div class="detail-val" style="color:var(--success)">+${totalMasuk}</div></div>`;
  histHtml+=`<div class="detail-item"><div class="detail-label">Total Keluar</div><div class="detail-val" style="color:var(--danger)">−${totalKeluar}</div></div>`;
  histHtml+='</div>';
  if(p.ket)histHtml+=`<div style="margin-top:.875rem;padding:.75rem;background:var(--cream);border-radius:8px;font-size:12.5px;color:var(--text2)">${p.ket}</div>`;
  // history table
  const logs=[...masukLog.filter(x=>x.prodId===id).map(x=>({...x,dir:'Masuk'})),...keluarLog.filter(x=>x.prodId===id).map(x=>({...x,dir:'Keluar'}))];
  if(logs.length>0){
    histHtml+=`<hr class="divider"><div style="font-weight:500;font-size:13px;margin-bottom:.5rem">Riwayat Transaksi</div><table class="hist-table"><thead><tr><th>Tanggal</th><th>Tipe</th><th>Jumlah</th><th>Keterangan</th></tr></thead><tbody>`;
    logs.sort((a,b)=>b.tgl.localeCompare(a.tgl)).forEach(l=>{
      histHtml+=`<tr><td>${fmtDate(l.tgl)}</td><td><span class="badge ${l.dir==='Masuk'?'badge-ok':'badge-danger'}">${l.dir}</span></td><td style="font-weight:600">${l.dir==='Masuk'?'+':'-'}${l.jml}</td><td style="color:var(--text2)">${l.note||l.jenis||'—'}</td></tr>`;
    });
    histHtml+='</tbody></table>';
  }
  document.getElementById('detail-body').innerHTML=histHtml;
  openModal('modal-detail');
}

// ══════════════════════════════════════════
// DELETE
// ══════════════════════════════════════════
function confirmDelete(id){
  deleteTargetId=id;
  const p=getProd(id);
  document.getElementById('confirm-text').textContent=`Yakin ingin menghapus "${p.nama}"? Tindakan ini tidak dapat dibatalkan.`;
  document.getElementById('confirm-ok-btn').onclick=()=>{
    products=products.filter(x=>x.id!==deleteTargetId);
    activityLog.unshift({type:'edit',txt:`Produk dihapus dari sistem`,time:'Baru saja'});
    closeModal('modal-confirm');renderStokStats();renderStok();
    toast('Produk berhasil dihapus','danger');
  };
  openModal('modal-confirm');
}

// ══════════════════════════════════════════
// BARANG MASUK
// ══════════════════════════════════════════
function renderMasuk(){
  const sel=document.getElementById('in-produk');
  sel.innerHTML='<option value="">— pilih produk —</option>';
  products.forEach(p=>sel.innerHTML+=`<option value="${p.id}">SKU-${String(p.id).padStart(4,'0')} · ${p.nama} (stok: ${p.stok})</option>`);
  if(settings.autoDate)document.getElementById('in-tgl').value=today();
  renderMasukTable();
}
function renderMasukTable(){
  let html='';
  if(masukLog.length===0)html='<tr class="no-data-row"><td colspan="5">Belum ada data barang masuk</td></tr>';
  [...masukLog].reverse().forEach(l=>{
    const p=getProd(l.prodId);
    html+=`<tr><td>${fmtDate(l.tgl)}</td><td>${p?p.nama:'—'}</td><td style="color:var(--success);font-weight:600">+${l.jml}</td><td style="color:var(--text2)">${l.faktur||'—'}</td><td style="color:var(--text2)">${l.note||'—'}</td></tr>`;
  });
  document.getElementById('masuk-tbody').innerHTML=html;
}
function submitMasuk(){
  const prodId=parseInt(document.getElementById('in-produk').value);
  const jml=parseInt(document.getElementById('in-jml').value)||0;
  if(!prodId){toast('Pilih produk terlebih dahulu','warn');return}
  if(jml<=0){toast('Jumlah harus lebih dari 0','warn');return}
  const p=getProd(prodId);
  p.stok+=jml;
  masukLog.push({tgl:document.getElementById('in-tgl').value||today(),prodId,jml,faktur:document.getElementById('in-faktur').value.trim(),note:document.getElementById('in-note').value.trim()});
  activityLog.unshift({type:'in',txt:`${p.nama} — stok masuk ${jml} pcs`,time:'Baru saja'});
  toast(`Stok ${p.nama} bertambah ${jml} → total ${p.stok}`,'success');
  clearMasuk();renderMasukTable();renderStokStats();
}
function clearMasuk(){
  document.getElementById('in-produk').value='';
  document.getElementById('in-jml').value='';
  document.getElementById('in-faktur').value='';
  document.getElementById('in-note').value='';
  if(settings.autoDate)document.getElementById('in-tgl').value=today();
}

// ══════════════════════════════════════════
// BARANG KELUAR
// ══════════════════════════════════════════
function renderKeluar(){
  const sel=document.getElementById('out-produk');
  sel.innerHTML='<option value="">— pilih produk —</option>';
  products.forEach(p=>sel.innerHTML+=`<option value="${p.id}">SKU-${String(p.id).padStart(4,'0')} · ${p.nama} (stok: ${p.stok})</option>`);
  sel.onchange=()=>{
    const p=getProd(parseInt(sel.value));
    document.getElementById('out-stok-avail').value=p?`${p.stok} unit`:'—';
  };
  if(settings.autoDate)document.getElementById('out-tgl').value=today();
  renderKeluarTable();
}
function renderKeluarTable(){
  let html='';
  if(keluarLog.length===0)html='<tr class="no-data-row"><td colspan="5">Belum ada data barang keluar</td></tr>';
  [...keluarLog].reverse().forEach(l=>{
    const p=getProd(l.prodId);
    html+=`<tr><td>${fmtDate(l.tgl)}</td><td>${p?p.nama:'—'}</td><td style="color:var(--danger);font-weight:600">-${l.jml}</td><td><span class="badge badge-info">${l.jenis||'Penjualan'}</span></td><td style="color:var(--text2)">${l.note||'—'}</td></tr>`;
  });
  document.getElementById('keluar-tbody').innerHTML=html;
}
function submitKeluar(){
  const prodId=parseInt(document.getElementById('out-produk').value);
  const jml=parseInt(document.getElementById('out-jml').value)||0;
  if(!prodId){toast('Pilih produk terlebih dahulu','warn');return}
  if(jml<=0){toast('Jumlah harus lebih dari 0','warn');return}
  const p=getProd(prodId);
  if(jml>p.stok){toast(`Stok tidak cukup! Tersedia hanya ${p.stok} unit`,'danger');return}
  p.stok-=jml;
  keluarLog.push({tgl:document.getElementById('out-tgl').value||today(),prodId,jml,jenis:document.getElementById('out-jenis').value,note:document.getElementById('out-note').value.trim()});
  activityLog.unshift({type:'out',txt:`${p.nama} — keluar ${jml} pcs (${document.getElementById('out-jenis').value})`,time:'Baru saja'});
  if(p.stok===0)toast(`⚠ Stok ${p.nama} habis!`,'danger');
  else if(p.stok<=p.stokMin)toast(`⚠ Stok ${p.nama} menipis (${p.stok} unit)!`,'warn');
  else toast(`Stok ${p.nama} berkurang ${jml} → sisa ${p.stok}`,'success');
  clearKeluar();renderKeluarTable();renderStokStats();
}
function clearKeluar(){
  document.getElementById('out-produk').value='';
  document.getElementById('out-jml').value='';
  document.getElementById('out-stok-avail').value='';
  document.getElementById('out-note').value='';
  document.getElementById('out-jenis').value='Penjualan';
  if(settings.autoDate)document.getElementById('out-tgl').value=today();
}

// ══════════════════════════════════════════
// LAPORAN
// ══════════════════════════════════════════
function renderLaporan(){
  const totalStok=products.reduce((a,p)=>a+p.stok,0);
  const totalNilai=products.reduce((a,p)=>a+p.stok*p.jual,0);
  const totalKeluar=keluarLog.reduce((a,l)=>a+l.jml,0);
  document.getElementById('lap-stats').innerHTML=`
  <div class="stat-card"><div class="stat-header"><div class="stat-icon-wrap blue">📋</div></div><div class="stat-value">${products.length}</div><div class="stat-label">Total Produk</div><div class="stat-sub">Terdaftar di sistem</div></div>
  <div class="stat-card"><div class="stat-header"><div class="stat-icon-wrap green">📦</div></div><div class="stat-value">${totalStok}</div><div class="stat-label">Total Stok</div><div class="stat-sub">${masukLog.reduce((a,l)=>a+l.jml,0)} unit masuk bulan ini</div></div>
  <div class="stat-card"><div class="stat-header"><div class="stat-icon-wrap amber">📤</div></div><div class="stat-value">${totalKeluar}</div><div class="stat-label">Total Keluar</div><div class="stat-sub">Penjualan &amp; pengeluaran</div></div>`;

  // kategori chart
  const katMap={};
  products.forEach(p=>{katMap[p.kat]=(katMap[p.kat]||0)+p.stok});
  const katMax=Math.max(...Object.values(katMap),1);
  const colors=['#3b5bdb','#f59e0b','#ef4444','#22c55e','#8b5cf6'];
  let katHtml='';
  Object.entries(katMap).forEach(([k,v],i)=>{
    katHtml+=`<div class="chart-row"><div class="chart-label" style="font-size:11px;text-align:right">${k}</div><div class="chart-bar-bg"><div class="chart-bar-fill" style="width:${Math.round(v/katMax*100)}%;background:${colors[i%colors.length]}"></div></div><div class="chart-val">${v}</div></div>`;
  });
  document.getElementById('kat-chart').innerHTML=katHtml;

  // trx chart (monthly simulation)
  const months=['Jan','Feb','Mar','Apr'];
  const mIn=[45,60,38,masukLog.reduce((a,l)=>a+l.jml,0)];
  const mOut=[30,42,28,keluarLog.reduce((a,l)=>a+l.jml,0)];
  const trxMax=Math.max(...mIn,...mOut,1);
  let trxHtml='';
  months.forEach((m,i)=>{
    trxHtml+=`<div class="chart-row"><div class="chart-label">${m}</div><div style="flex:1;display:flex;flex-direction:column;gap:3px"><div class="chart-bar-bg" style="height:7px"><div class="chart-bar-fill" style="width:${Math.round(mIn[i]/trxMax*100)}%;background:var(--gold2)"></div></div><div class="chart-bar-bg" style="height:7px"><div class="chart-bar-fill" style="width:${Math.round(mOut[i]/trxMax*100)}%;background:var(--indigo2)"></div></div></div><div class="chart-val" style="font-size:10px">${mIn[i]}/${mOut[i]}</div></div>`;
  });
  document.getElementById('trx-chart').innerHTML=trxHtml;

  // table
  let html='';
  products.forEach(p=>{
    const msk=masukLog.filter(l=>l.prodId===p.id).reduce((a,l)=>a+l.jml,0);
    const klr=keluarLog.filter(l=>l.prodId===p.id).reduce((a,l)=>a+l.jml,0);
    const stokAwal=p.stok-msk+klr;
    const st=stokStatus(p);
    html+=`<tr>
      <td><div class="prod-cell"><div class="prod-thumb" style="background:${catColors[p.kat]||'#f0f0f0'}">${catEmoji[p.kat]||'👖'}</div><div><div class="prod-name">${p.nama}</div><div class="prod-sku">SKU-${String(p.id).padStart(4,'0')}</div></div></div></td>
      <td style="font-size:12px;color:var(--text2)">${p.kat}</td>
      <td style="font-size:12.5px">${stokAwal}</td>
      <td style="color:var(--success);font-weight:600">+${msk}</td>
      <td style="color:var(--danger);font-weight:600">-${klr}</td>
      <td style="font-weight:600">${p.stok}</td>
      <td style="font-size:12px">${fmt(p.stok*p.jual)}</td>
      <td><span class="badge ${st.cls}">${st.label}</span></td>
    </tr>`;
  });
  document.getElementById('lap-tbody').innerHTML=html||'<tr class="no-data-row"><td colspan="8">Tidak ada data</td></tr>';
}

// ══════════════════════════════════════════
// SUPPLIER
// ══════════════════════════════════════════
const supColors=['#dbeafe','#dcfce7','#fef3c7','#f3e8ff','#fee2e2'];
function renderSupplier(){
  let html='';
  suppliers.forEach((s,i)=>{
    const pCount=products.filter(p=>p.sup===s.id).length;
    html+=`<div class="sup-card">
      <div class="sup-avatar" style="background:${supColors[i%supColors.length]};color:var(--navy)">${s.nama.charAt(0)}</div>
      <div class="sup-name">${s.nama}</div>
      <div class="sup-city">${s.kota}</div>
      <div class="sup-detail">
        <div class="sup-row"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="5" r="3"/><path d="M2 11c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5"/></svg>${pCount} produk terdaftar</div>
        <div class="sup-row"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="2" width="10" height="8" rx="1"/><polyline points="1,4 6,7 11,4"/></svg>${s.email||'—'}</div>
        <div class="sup-row"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2c0 5.5 4 8 4 8s4-2.5 4-8c0-1.1-.9-2-2-2H5C3.9 0 3 .9 3 2z"/></svg>${s.telp||'—'}</div>
        <div class="sup-row" style="font-size:11px;color:var(--text3)">${s.spek||'—'}</div>
      </div>
      <div class="sup-actions">
        <button class="act-btn" onclick="openEditSupplier(${s.id})">Edit</button>
        <button class="act-btn del" onclick="deleteSupplier(${s.id})">Hapus</button>
      </div>
    </div>`;
  });
  document.getElementById('supplier-grid').innerHTML=html||'<div class="empty-state"><div class="empty-icon">🤝</div><div class="empty-text">Belum ada supplier</div></div>';
}
function openAddSupplier(){editingSupId=null;['sup-nama','sup-kota','sup-telp','sup-email','sup-spek'].forEach(id=>document.getElementById(id).value='');document.getElementById('sup-modal-title').textContent='Tambah Supplier';openModal('modal-supplier')}
function openEditSupplier(id){
  editingSupId=id;const s=getSup(id);
  document.getElementById('sup-modal-title').textContent='Edit Supplier';
  document.getElementById('sup-nama').value=s.nama;
  document.getElementById('sup-kota').value=s.kota||'';
  document.getElementById('sup-telp').value=s.telp||'';
  document.getElementById('sup-email').value=s.email||'';
  document.getElementById('sup-spek').value=s.spek||'';
  openModal('modal-supplier');
}
function saveSupplier(){
  const nama=document.getElementById('sup-nama').value.trim();
  if(!nama){toast('Nama supplier wajib diisi','warn');return}
  const obj={nama,kota:document.getElementById('sup-kota').value.trim(),telp:document.getElementById('sup-telp').value.trim(),email:document.getElementById('sup-email').value.trim(),spek:document.getElementById('sup-spek').value.trim()};
  if(editingSupId){Object.assign(getSup(editingSupId),obj);toast('Supplier diperbarui','success')}
  else{obj.id=nextSupId++;suppliers.push(obj);toast('Supplier ditambahkan','success')}
  closeModal('modal-supplier');renderSupplier();
}
function deleteSupplier(id){
  if(!confirm('Hapus supplier ini?'))return;
  suppliers=suppliers.filter(s=>s.id!==id);
  renderSupplier();toast('Supplier dihapus','danger');
}

// ══════════════════════════════════════════
// PENGATURAN
// ══════════════════════════════════════════
function renderPengaturan(tab){
  if(tab==='toko'){
    document.getElementById('sett-content').innerHTML=`
    <div class="sett-section-title">Informasi Toko</div>
    <div class="form-grp"><label class="form-label">Nama Toko</label><input class="form-input" id="s-nama" value="${settings.tokoNama}"></div>
    <div class="form-grp"><label class="form-label">Alamat</label><input class="form-input" id="s-alamat" value="${settings.tokoAlamat}"></div>
    <div class="form-grp"><label class="form-label">No. Telepon</label><input class="form-input" id="s-telp" placeholder="08xx-xxxx"></div>
    <div style="margin-top:1rem"><button class="btn-pri" onclick="saveToko()">Simpan Perubahan</button></div>`;
  } else if(tab==='stok'){
    document.getElementById('sett-content').innerHTML=`
    <div class="sett-section-title">Pengaturan Stok</div>
    <div class="form-grp"><label class="form-label">Stok Minimum Default</label><input class="form-input" type="number" id="s-min" value="${settings.minDefault}" style="max-width:120px"><div class="form-hint">Digunakan saat menambah produk baru</div></div>
    <div class="sett-row"><div class="sett-info"><div class="sett-info-label">Tampilkan Harga Beli</div><div class="sett-info-desc">Tampilkan kolom harga beli di laporan</div></div><label class="toggle"><input type="checkbox" ${settings.showHarga?'checked':''} onchange="settings.showHarga=this.checked"><span class="toggle-slider"></span></label></div>
    <div style="margin-top:1rem"><button class="btn-pri" onclick="saveStokSett()">Simpan</button></div>`;
  } else if(tab==='notif'){
    document.getElementById('sett-content').innerHTML=`
    <div class="sett-section-title">Pengaturan Notifikasi</div>
    <div class="sett-row"><div class="sett-info"><div class="sett-info-label">Peringatan Stok Menipis</div><div class="sett-info-desc">Tampilkan notifikasi saat stok ≤ minimum</div></div><label class="toggle"><input type="checkbox" ${settings.notifLow?'checked':''} onchange="settings.notifLow=this.checked"><span class="toggle-slider"></span></label></div>
    <div class="sett-row"><div class="sett-info"><div class="sett-info-label">Peringatan Stok Habis</div><div class="sett-info-desc">Tampilkan peringatan saat stok = 0</div></div><label class="toggle"><input type="checkbox" ${settings.notifZero?'checked':''} onchange="settings.notifZero=this.checked"><span class="toggle-slider"></span></label></div>
    <div class="sett-row"><div class="sett-info"><div class="sett-info-label">Tanggal Otomatis</div><div class="sett-info-desc">Isi tanggal otomatis di form transaksi</div></div><label class="toggle"><input type="checkbox" ${settings.autoDate?'checked':''} onchange="settings.autoDate=this.checked"><span class="toggle-slider"></span></label></div>`;
  } else if(tab==='akun'){
    document.getElementById('sett-content').innerHTML=`
    <div class="sett-section-title">Pengaturan Akun</div>
    <div class="form-grp"><label class="form-label">Nama Pengguna</label><input class="form-input" value="Admin Toko"></div>
    <div class="form-grp"><label class="form-label">Email</label><input class="form-input" type="email" value="admin@jeanshome.id"></div>
    <div class="form-grp"><label class="form-label">Password Baru</label><input class="form-input" type="password" placeholder="Kosongkan jika tidak diubah"></div>
    <div style="margin-top:1rem"><button class="btn-pri" onclick="toast('Akun berhasil diperbarui','success')">Simpan Akun</button></div>`;
  }
}
function settNav(tab,btn){document.querySelectorAll('.sett-nav-item').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderPengaturan(tab)}
function saveToko(){settings.tokoNama=document.getElementById('s-nama').value;settings.tokoAlamat=document.getElementById('s-alamat').value;toast('Informasi toko disimpan','success')}
function saveStokSett(){settings.minDefault=parseInt(document.getElementById('s-min').value)||5;toast('Pengaturan stok disimpan','success')}

// ══════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════
function renderDashboard(){
  makeStatCards(document.getElementById('dash-stats'));
  renderClock();
  // alert table
  const alerts=products.filter(p=>p.stok<=p.stokMin);
  let atHtml='';
  if(alerts.length===0)atHtml='<tr><td colspan="4" style="text-align:center;color:var(--text3);font-size:12px;padding:1.5rem">Semua stok dalam kondisi aman ✓</td></tr>';
  alerts.forEach(p=>{
    const st=stokStatus(p);
    atHtml+=`<tr><td>${p.nama}</td><td style="font-weight:600;color:${barColor(p)}">${p.stok}</td><td><span class="badge ${st.cls}">${st.label}</span></td><td><button class="act-btn" onclick="goPage('masuk',document.querySelectorAll('.sb-item')[2])">Tambah Stok</button></td></tr>`;
  });
  document.getElementById('alert-tbody').innerHTML=atHtml;
  // top products (by keluar)
  const topMap={};keluarLog.forEach(l=>{topMap[l.prodId]=(topMap[l.prodId]||0)+l.jml});
  const sorted=Object.entries(topMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxTop=sorted[0]?sorted[0][1]:1;
  const rankColors=['#f59e0b','#94a3b8','#b45309','#3b5bdb','#22c55e'];
  let tpHtml='';
  sorted.forEach(([id,v],i)=>{
    const p=getProd(parseInt(id));if(!p)return;
    tpHtml+=`<div class="top-prod-item"><div class="tp-rank" style="background:${rankColors[i]}20;color:${rankColors[i]}">${i+1}</div><div class="tp-name">${p.nama}</div><div class="tp-bar-bg"><div class="tp-bar-fill" style="width:${Math.round(v/maxTop*100)}%"></div></div><div class="tp-val">${v}</div></div>`;
  });
  document.getElementById('top-prod-list').innerHTML=tpHtml||'<div class="empty-state" style="padding:1rem"><div class="empty-text">Belum ada data penjualan</div></div>';
  // activity
  let actHtml='';
  activityLog.slice(0,5).forEach(a=>{
    actHtml+=`<li class="act-item"><div class="act-dot dot-${a.type}"></div><div class="act-body"><div class="act-txt">${a.txt}</div></div><span class="act-time">${a.time}</span></li>`;
  });
  document.getElementById('dash-activity').innerHTML=actHtml;
  // line chart
  renderLineChart();
}
function renderLineChart(){
  const W=500,H=90,pad=8;
  const maxV=Math.max(...salesData,...stockInData,1);
  function pts(data,y0=H-pad){return data.map((v,i)=>{const x=i*(W/(data.length-1));const y=y0-(v/maxV*(H-pad*2));return[x,y]})}
  function path(data,color,id){
    const p=pts(data);const d='M'+p.map(([x,y])=>`${x},${y}`).join(' L');
    const area='M'+p.map(([x,y])=>`${x},${y}`).join(' L')+` L${W},${H} L0,${H} Z`;
    return`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity="0.18"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path d="${area}" fill="url(#${id})"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  const svg=path(salesData,'#3b5bdb','g1')+path(stockInData,'#c9943a','g2');
  document.getElementById('sales-chart').innerHTML=svg;
  const days=['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  document.getElementById('chart-days').innerHTML=days.map(d=>`<span>${d}</span>`).join('');
}

// ══════════════════════════════════════════
// CLOCK
// ══════════════════════════════════════════
function renderClock(){
  const now=new Date();
  const tEl=document.getElementById('dash-time');
  const dEl=document.getElementById('dash-date');
  if(tEl)tEl.textContent=now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
  if(dEl)dEl.textContent=now.toLocaleDateString('id-ID',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
}
setInterval(renderClock,1000);

// ══════════════════════════════════════════
// EXPORT CSV
// ══════════════════════════════════════════
function exportCSV(){
  const rows=[['SKU','Nama','Kategori','Ukuran','Warna','Supplier','Stok','Stok Min','Harga Beli','Harga Jual','Status']];
  products.forEach(p=>{const st=stokStatus(p);rows.push([`SKU-${String(p.id).padStart(4,'0')}`,p.nama,p.kat,p.ukuran||'',p.warna||'',getSupName(p.sup),p.stok,p.stokMin,p.beli||0,p.jual,st.label])});
  const csv=rows.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n');
  const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='stok_jeans_home.csv';a.click();
  toast('File CSV berhasil diunduh','success');
}

// ══════════════════════════════════════════
// ALERT PANEL
// ══════════════════════════════════════════
function openAlertPanel(){
  const alerts=products.filter(p=>p.stok<=p.stokMin);
  if(alerts.length===0){toast('Semua stok dalam kondisi aman!','success');return}
  let msg=`${alerts.length} produk perlu perhatian: `;
  msg+=alerts.map(p=>p.nama+' ('+p.stok+')').join(', ');
  toast(msg,'warn');
}

// ══════════════════════════════════════════
// MODAL HELPERS
// ══════════════════════════════════════════
function openModal(id){document.getElementById(id).classList.add('open')}
function closeModal(id){document.getElementById(id).classList.remove('open')}
document.querySelectorAll('.modal-bg').forEach(el=>{el.addEventListener('click',e=>{if(e.target===el)el.classList.remove('open')})});

// ══════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════
function toast(msg,type='success'){
  const el=document.createElement('div');
  el.className=`toast-item ${type}`;
  const icons={success:'✓',warn:'⚠',danger:'✕',info:'ℹ'};
  el.innerHTML=`<span style="font-weight:600;font-size:14px">${icons[type]||'✓'}</span><span style="flex:1">${msg}</span>`;
  const wrap=document.getElementById('toast');wrap.appendChild(el);
  setTimeout(()=>{el.style.animation='toastOut .3s ease forwards';setTimeout(()=>el.remove(),300)},3500);
}

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
document.addEventListener('DOMContentLoaded',()=>{
  renderStokStats();renderStok();
  const warn=products.filter(p=>p.stok<=p.stokMin).length;
  document.getElementById('sb-badge-warn').textContent=warn;
  document.getElementById('sb-badge-warn').style.display=warn>0?'':'none';
  document.getElementById('notif-dot').style.display=warn>0?'':'none';
  renderClock();
});