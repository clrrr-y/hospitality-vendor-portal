const icons={home:'⌂',calendar:'▦',orders:'▣',listings:'☰',earnings:'₱',profile:'◯',search:'⌕',arrow:'→',plus:'+'};
const navIconNames={home:'home-01',calendar:'calendar-03',orders:'package-delivered',listings:'grid-02',earnings:'wallet-01',chat:'chat-01',menu:'menu-01',profile:'user-circle'};
const navIcon=(icon,active)=>`<i class="nav-hugeicon ${active?'hgi-solid ':''}hgi-stroke hgi-${navIconNames[icon]||icon}${active?' nav-hugeicon-active':''}" aria-hidden="true"></i>`;
const esc=s=>String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const displayBookingReference=id=>String(id||'').replace(/^[A-Z]+-/i,'BK-');
const state={page:'dashboard',role:'Owner',ordersPaused:false,orderFilter:'All',orderTypeFilter:'All',orderStatusFilter:'All',orderPaymentFilter:'All',query:'',orderView:'list',orderViewMenuOpen:false,range:'Today',detail:null,listing:null,listingDetail:null,listingView:'list',listingStatusFilter:'All',listingQuery:'',listingMenu:null,toast:'',dashboardScroll:0,dashboardSeenRequests:['ORD-1042'],dashboardRequestProcessing:null,insightQuery:'',insightSort:'count',insightMetric:'revenue',insightTab:'listings',performanceTab:'top',filterSheet:false,filterDraftRange:'Today',compareMode:'previous',filterDraftCompare:'previous',customFrom:'',customTo:'',devPosition:null,listingsExportOpen:false,insightsDownloadOpen:false,listingsZeroOnly:false,listingSortOpen:false};
const cabanaLastViewKey='cabana:last-view';
let cabanaRestoredFromStorage=false;
let cabanaBooting=true;
const cabanaLastViewFromUrl=()=>{
  try{
    const raw=String(window.location.hash||'').replace(/^#/,'');
    const params=new URLSearchParams(raw);
    const page=params.get('view');
    return page?{page:decodeURIComponent(page),pending:params.get('pending')?decodeURIComponent(params.get('pending')):null}:null;
  }catch(error){return null}
};
try {
  const saved=JSON.parse(localStorage.getItem(cabanaLastViewKey)||'null');
  if(saved?.page){ state.page=saved.page; cabanaRestoredFromStorage=true; }
  if(saved?.detail) state.detail=saved.detail;
  if(saved?.orderTimeTab) state.orderTimeTab=['Requests','Active','Past'].includes(saved.orderTimeTab)?saved.orderTimeTab:saved.orderTimeTab==='Today'?'Requests':'Active';
  if(saved?.orderView) state.orderView=saved.orderView;
  if(saved?.range) state.range=saved.range;
  if(saved?.insightTab) state.insightTab=saved.insightTab;
  if(saved?.performanceTab) state.performanceTab=saved.performanceTab;
  if(saved?.earningsTab) state.earningsTab=saved.earningsTab;
  if(saved?.earningsRange) state.earningsRange=saved.earningsRange;
  state.listingView=localStorage.getItem('cabana:listings-view')==='grid'?'grid':'list';
} catch (error) {}
const cabanaUrlView=cabanaLastViewFromUrl();
if(!cabanaRestoredFromStorage&&cabanaUrlView?.page&&cabanaUrlView.page!=='insights') state.page=cabanaUrlView.page;
if(cabanaUrlView?.pending) state.dashboardRequestFocusId=cabanaUrlView.pending;
if(!cabanaUrlView?.page&&!window.location.hash) state.page='dashboard';
/* Preserve the route requested by the URL/storage while legacy startup layers initialise. */
const cabanaInitialPage=state.page==='insights'?'dashboard':state.page;
let cabanaResumePending=Boolean(cabanaUrlView?.page);
function rememberLastView(){
  if(cabanaBooting)return;
  const payload={page:state.page,detail:state.detail,orderTimeTab:state.orderTimeTab,orderView:state.orderView,range:state.range,insightTab:state.insightTab,performanceTab:state.performanceTab,earningsTab:state.earningsTab,earningsRange:state.earningsRange};
  try {
    localStorage.setItem(cabanaLastViewKey,JSON.stringify(payload));
    localStorage.setItem('cabana:listings-view',state.listingView||'list');
  } catch (error) {}
  try {
    const hash=`#view=${encodeURIComponent(payload.page)}`;
    if(window.location.hash!==hash) window.location.hash=hash;
  } catch (error) {}
  cabanaResumePending=false;
}

const listings=[
 {id:'cake',name:'Whole Sans Rival Cake',category:'Bakery',price:'₱1,200',unit:'per item',stock:'12 available',status:'Active',location:'Pick-up at shop',payment:'Room charge + Gateway'},
 {id:'box',name:'Island Breakfast Box',category:'Food',price:'₱680',unit:'per item',stock:'24 available',status:'Active',location:'Delivery to room',payment:'Room charge + Gateway'},
 {id:'coffee',name:'Cold Brew Bottle',category:'Drinks',price:'₱220',unit:'per item',stock:'Paused',status:'Paused',location:'Pick-up at shop',payment:'Gateway only'}
];
const orders=[
 {id:'ORD-1042',kind:'In-app order',guest:'John D.',hotel:'Henry’s Resort Dumaguete',room:'101',item:'Whole Sans Rival Cake',quantity:'Qty 1',when:'Pickup Oct 6 · 3:00 PM',fulfilment:'Pick-up at shop',total:'₱1,200.00',payment:'Charge to room',settlement:'Awaiting guest checkout',status:'Pending',responseMinutes:60,timeline:[['Booking requested','Sep 29 · 8:14 AM']],notes:'Please write “Happy Anniversary” on the box.',contact:'Open guest chat'},
 {id:'CB-8821',kind:'Booking',guest:'Amelia Reyes',hotel:'Henry’s Resort Dumaguete',room:'508',item:'Private bakery tasting',quantity:'2 guests',when:'Oct 6 · 5:30 PM · 1 hour',fulfilment:'Tasting room',total:'₱2,400.00',payment:'Gateway payment pending',settlement:'Payment pending',status:'Pending',responseMinutes:24,timeline:[['Booking requested','Sep 29 · 9:02 AM']],notes:'Window seat if available.',contact:'Open guest chat'},
 {id:'CB-9001',kind:'Booking',guest:'Maya Tan',hotel:'Henry’s Resort Dumaguete',room:'314',item:'Island Hopping Tour',quantity:'3 guests',when:'Oct 7 · 9:00 AM · 4 hours',fulfilment:'Hotel pick-up',total:'₱7,500.00',payment:'Paid via gateway',settlement:'Paid by guest',status:'Confirmed',timeline:[['Booking confirmed','Oct 1 · 9:02 AM']],notes:'Hotel pick-up confirmed.',contact:'Open guest chat'},
 {id:'CB-9002',kind:'Booking',guest:'Nina Garcia',hotel:'Henry’s Resort Dumaguete',room:'203',item:'Private bakery tasting',quantity:'4 guests',when:'Oct 6 · 2:00 PM · 1 hour',fulfilment:'Tasting room',total:'₱4,800.00',payment:'Paid via gateway',settlement:'Paid by guest',status:'Confirmed',timeline:[['Booking confirmed','Oct 2 · 11:20 AM']],notes:'Tasting room prepared.',contact:'Open guest chat'},
 {id:'ORD-1044',kind:'In-app order',guest:'Leo Santos',hotel:'Henry’s Resort Dumaguete',room:'207',item:'Island Breakfast Box',quantity:'2 ×',when:'Oct 8 · 11:30 AM',fulfilment:'Delivery to room',total:'₱1,360.00',payment:'Paid via gateway',settlement:'Paid by guest',status:'Confirmed',timeline:[['Order confirmed','Oct 3 · 4:15 PM']],notes:'Deliver before noon.',contact:'Open guest chat'},
 {id:'CT-2208',kind:'Counter charge',guest:'Maya Tan',hotel:'Henry’s Resort Dumaguete',room:'314',item:'Coffee and pastry set',quantity:'2 ×',when:'Today · 10:15 AM',fulfilment:'Counter',total:'₱540',payment:'Charged to room',settlement:'Posted to room',status:'Posted to room',timeline:[['Posted by validator app','Sep 29 · 10:15 AM']],notes:'Read-only record. Voids happen in the validator app.',contact:'View record'},
 {id:'ORD-1037',kind:'In-app order',guest:'Oliver Brown',hotel:'Henry’s Resort Dumaguete',room:'205',item:'Island Breakfast Box',quantity:'2 ×',when:'Today · 8:00 AM',fulfilment:'Delivery to room',total:'₱1,360',payment:'Paid via gateway',settlement:'In payout',status:'Completed',timeline:[['Order placed','Sep 28 · 6:40 PM'],['Completed','Sep 29 · 8:32 AM']],notes:'No nuts, please.',contact:'Open guest chat'},
 {id:'CB-8812',kind:'Booking',guest:'Priya Shah',hotel:'Henry’s Resort Dumaguete',room:'412',item:'Chef’s counter experience',quantity:'4 guests',when:'Sep 28 · 7:00 PM',fulfilment:'Chef’s counter',total:'₱8,800',payment:'Charged to room',settlement:'Guest checked out',status:'Completed',timeline:[['Booking confirmed','Sep 25 · 11:20 AM'],['Completed','Sep 28 · 9:10 PM'],['Guest checked out','Sep 29 · 11:04 AM']],notes:'',contact:'View guest record'}
];
const pendingRequestCount=()=>typeof orders!=='undefined'?orders.filter(order=>order.status==='Pending').length:0;
const navBadge=id=>id==='dashboard'&&pendingRequestCount()?`<b class="nav-badge">${pendingRequestCount()}</b>`:'';
let nav=(id,label,icon)=>`<button class="nav-item ${state.page===id?'active':''}" data-page="${id}"><span class="nav-icon">${navIcon(icon,state.page===id)}</span><span>${label}</span>${navBadge(id)}</button>`;
function shell(content){return `<aside class="sidebar"><div class="brand"><span class="brand-mark">C</span>Cabana</div><button class="outlet-button"><span class="outlet-avatar">CT</span><span><strong>Lakbay Negros Rentals</strong><small>Transportation rental service · Live</small></span><span>⌄</span></button><nav class="nav-list">${nav('dashboard','Home','home')}${nav('orders','Bookings','orders')}${nav('chat','Chat','chat')}${nav('menu','Menu','menu')}</nav><div class="sidebar-bottom"><div class="partner-mini"><strong>${state.role}</strong><span>Portal access</span></div></div></aside><div class="main-wrap"><header class="topbar"><div class="topbar-context"><strong>${state.page==='listings'?'Listings':(['orders','bookings'].includes(state.page)?'Bookings':state.page[0].toUpperCase()+state.page.slice(1))}</strong></div></header><main class="page">${content}</main><nav class="mobile-nav">${nav('dashboard','Home','home')}${nav('orders','Bookings','orders')}${nav('chat','Chat','chat')}${nav('menu','Menu','menu')}</nav></div>`}
function nav2(id,label,ico){return `<button class="nav-item ${state.page===id?'active':''}" data-page="${id}"><span class="nav-icon">${navIcon(ico,state.page===id)}</span><span>${label}</span>${navBadge(id)}</button>`}
function shell2(content){const html=shell(content);const side=html.match(/<nav class="nav-list">[\s\S]*?<\/nav>/)?.[0];const mobile=html.match(/<nav class="mobile-nav">[\s\S]*?<\/nav>/)?.[0];const sideNav=`<nav class="nav-list">${nav2('dashboard','Home','home')}${nav2('orders','Bookings','orders')}${nav2('chat','Chat','chat')}${nav2('menu','Menu','menu')}</nav>`;const mobileNav=`<nav class="mobile-nav ${state.role==='Staff'?'staff-nav':''}">${nav2('dashboard','Home','home')}${nav2('orders','Bookings','orders')}${nav2('chat','Chat','chat')}${nav2('menu','Menu','menu')}</nav>`;return html.replace(side,sideNav).replace(mobile,mobileNav)}
function head(title,sub,action=''){return `<div class="page-head"><div><h1>${title}</h1>${sub?`<p class="subtext">${sub}</p>`:''}</div>${action}</div>`}
function dashboard(){const filtered=state.range==='Today';const rangeDate=filtered?'Monday, September 30':state.range==='Yesterday'?'Sunday, September 29':state.range==='This month'?'September 1–30':'September 23–30';const activity=filtered?orders.filter(o=>['Pending','Confirmed','Preparing','Ready'].includes(o.status)).slice(0,5):orders.filter(o=>o.status!=='Cancelled').slice(0,5);const values=filtered?[42,58,47,72,63,88,76]:state.range==='Yesterday'?[35,44,39,52,48,60,55]:[58,72,63,88,76,91,84];return `${head('Dashboard','')}<div class="greeting"><h1>Good morning, Leah</h1><p>${rangeDate}</p></div><section class="date-filter card"><div><strong>Dashboard period</strong><span>${rangeDate} · Sans Rival Bakehouse</span></div><div class="date-options">${['Today','Yesterday','Last 7 days','This month','Custom range'].map(x=>`<button class="filter ${state.range===x?'active':''}" data-range="${x}">${x}</button>`).join('')}</div></section><div class="dashboard-columns dashboard-flow"><div class="dashboard-main"><section class="card needs-card"><div class="card-header"><div><h2>Needs attention</h2><span class="count">Unresolved requests</span></div><span class="attention-count">3</span></div><div class="alert-list"><button class="alert-row" data-page="orders"><span class="alert-icon warning">!</span><span><strong>2 orders await confirmation</strong><small>One booking · one in-app order</small></span>${icons.arrow}</button><button class="alert-row" data-page="orders"><span class="alert-icon warning">!</span><span><strong>Refund request</strong><small>ORD-1028 · Review before Oct 1</small></span>${icons.arrow}</button><button class="alert-row" data-page="orders"><span class="alert-icon warning">!</span><span><strong>Fully booked date needs review</strong><small>Oct 2 · Whole Sans Rival Cake</small></span>${icons.arrow}</button></div></section><section class="card"><div class="card-header"><div><h2>${filtered?'Today':'Activity'}</h2><span class="count">${filtered?'Upcoming bookings and active orders':rangeDate}</span></div><button class="button ghost" data-page="orders">View all ${icons.arrow}</button></div><div class="upcoming-list">${activity.map(o=>`<button class="upcoming-row" data-detail="${o.id}"><span class="upcoming-time">${o.when}</span><span class="upcoming-main"><strong>${esc(o.item)} <em>${esc(o.guest)} · Room ${esc(o.room)}</em></strong><small>${o.kind} · ${esc(o.status)}</small></span><span class="payment-badge ${o.payment.includes('room')?'room':'gateway'}">${o.payment}</span>${icons.arrow}</button>`).join('')}</div></section></div><div class="dashboard-side"><section class="card earnings-card dashboard-earnings"><div class="card-header"><div><h2>Earnings</h2><span class="count">${rangeDate}</span></div></div><div class="earnings-total"><strong>${filtered?'₱6,420':state.range==='This month'?'₱118,420':'₱84,260'}</strong><span>Revenue in selected period</span></div><div class="mini-chart">${values.map((n,i)=>`<div class="chart-col"><div class="chart-bar" style="height:${n/1.5}px"></div><small>${['24','25','26','27','28','29','30'][i]}</small></div>`).join('')}</div><div class="settlement-line"><span>Room charges awaiting settlement</span><strong>${filtered?'₱3,860':'₱26,840'}</strong></div><button class="button ghost transactions-link" data-page="earnings">View transactions & payouts ${icons.arrow}</button></section></div></div>`}
function dashboardChart(values,labels,kind='bar'){const max=Math.max(...values,1);return `<div class="dashboard-chart ${kind}" role="img" aria-label="Chart from ${labels[0]} to ${labels[labels.length-1]}">${values.map((n,i)=>`<div class="chart-col"><div class="chart-plot"><div class="chart-bar ${i===values.length-1?'selected':''}" style="height:${Math.max(8,Math.round(n/max*132))}px"></div></div><small>${labels[i]}</small></div>`).join('')}</div>`}
function dashboard2(){const owner=state.role==='Owner',today=state.range==='Today',range=state.range==='This month'?'Sep 1–30':state.range==='Yesterday'?'Sep 29':state.range==='Last 7 days'?'Sep 24–30':today?'Sep 30':'Custom range';const activity=orders.filter(o=>o.status!=='Cancelled').slice(0,5);const total=state.range==='This month'?'₱118,420':today?'₱6,420':'₱84,260';const previous=state.range==='Yesterday'?'₱5,880':state.range==='This month'?'₱104,600':'₱5,920';const change=previous==='₱0'?'—':'+8.1%';return `<section class="dashboard-business"><div><div class="eyebrow">SANS RIVAL BAKEHOUSE</div><strong>Sans Rival Bakehouse</strong></div><div class="order-state ${state.ordersPaused?'paused':''}"><span class="state-dot"></span><span>${state.ordersPaused?'Paused':'Accepting orders'}</span>${owner?`<button data-toggle-orders>${state.ordersPaused?'Resume':'Pause'}</button>`:'<small>Read-only</small>'}</div></section><section class="dashboard-period card"><div><strong>Date range</strong><span>${range}</span></div><div class="date-options">${['Today','Yesterday','Last 7 days','This month','Custom range'].map(x=>`<button class="filter ${state.range===x?'active':''}" data-range="${x}">${x}</button>`).join('')}</div></section><section class="dashboard-section needs-action card"><div class="section-heading"><div><h2>Needs action</h2><span>Current unresolved items</span></div></div><div class="action-count-grid"><button data-page="orders" data-order-filter-link="Pending"><strong>2</strong><span>Awaiting confirmation</span>${icons.arrow}</button><button data-page="orders" data-order-filter-link="Ready"><strong>1</strong><span>Ready for pickup</span>${icons.arrow}</button>${owner?`<button data-page="orders" data-order-filter-link="Refunds"><strong>1</strong><span>Refund request</span>${icons.arrow}</button>`:''}</div></section><section class="dashboard-section glance-section"><div class="section-heading"><div><h2>Period at a glance</h2><span>${range} · compared with previous equivalent period</span></div></div><div class="glance-grid ${owner?'owner':'staff'}">${owner?`<div class="glance-card"><span>Orders</span><strong>${today?'8':42}</strong><small>+2 vs previous</small><i class="sparkline">▁▃▂▅▃▆▅</i></div><div class="glance-card"><span>Revenue</span><strong>${total}</strong><small>${change} vs previous</small><i class="sparkline">▂▃▂▅▄▆▅</i></div><div class="glance-card"><span>Room charges</span><strong>${today?'₱3,860':'₱26,840'}</strong><small>Posted separately</small><i class="sparkline">▁▂▃▂▄▅▄</i></div><div class="glance-card"><span>Average order value</span><strong>${today?'₱802':'₱1,006'}</strong><small>+4.2% vs previous</small><i class="sparkline">▂▃▄▃▅▄▆</i></div>`:`<div class="glance-card"><span>Orders</span><strong>${today?'8':42}</strong><small>+2 vs previous</small><i class="sparkline">▁▃▂▅▃▆▅</i></div>`}</div></section><div class="dashboard-grid"><section class="dashboard-section card schedule-section"><div class="section-heading"><div><h2>Schedule</h2><span>${today?'Today’s bookings, pickups, and returns':`Grouped by day · ${range}`}</span></div><button class="button ghost" data-page="orders">View orders ${icons.arrow}</button></div><div class="schedule-list">${activity.slice(0,5).map((o,i)=>`<button class="schedule-entry" data-detail="${o.id}"><span class="schedule-time">${today?o.when.split(' · ').pop():i<2?'Sep 30 · '+o.when.split(' · ').pop():'Oct 1 · '+o.when.split(' · ').pop()}</span><span><strong>${esc(o.item)}</strong><small>${esc(o.guest)} · Room ${esc(o.room)} · ${esc(o.quantity)}</small></span><span class="status ${o.status.toLowerCase().replaceAll(' ','-')}">${o.status}</span>${icons.arrow}</button>`).join('')}</div></section><section class="dashboard-section card chart-section"><div class="section-heading"><div><h2>Orders per day</h2><span>${today?'Seven days ending Sep 30':range} · orders</span></div></div>${dashboardChart(today?[4,6,5,8,7,10,8]:[8,7,10,12,9,14,12],['24','25','26','27','28','29','30'])}</section><section class="dashboard-section card chart-section"><div class="section-heading"><div><h2>${owner?'Occupancy / Busiest hours':'Occupancy / Busiest hours'}</h2><span>${owner?'Food vendor · orders by hour':'Food vendor · orders by hour'} · ${range}</span></div></div>${dashboardChart(today?[2,4,3,6,5,8,7]:[6,7,9,8,11,10,12],['8 AM','10','12 PM','2','4','6','8'])}</section>${owner?`<section class="dashboard-section card chart-section revenue-trend"><div class="section-heading"><div><h2>Revenue trend</h2><span>${range} vs previous equivalent period</span></div><strong class="trend-change">${change}</strong></div><div class="line-chart"><span class="line-current">${total}</span><span class="line-previous">${previous} previous</span><div class="line-path">╱╲╱╱╲╱</div></div></section><section class="dashboard-section card money-section"><div class="section-heading"><div><h2>Money</h2><span>Financial states kept separate</span></div></div><div class="money-grid"><div><span>Next payout</span><strong>₱42,180</strong><small>Friday, Oct 2</small></div><div><span>Room charges awaiting checkout</span><strong>₱26,840</strong><small>Guest checkout pending</small></div><div><span>Payment split</span><strong>₱52,240 / ₱32,020</strong><small>Room charge / Gateway</small></div></div></section>`:''}</div><section class="dashboard-section card top-listings"><div class="section-heading"><div><h2>Top listings</h2><span>${range} · up to five listings</span></div></div><div class="listing-rankings">${[['Whole Sans Rival Cake','42 orders','₱50,400'],['Island Breakfast Box','28 orders','₱19,040'],['Cold Brew Bottle','18 orders','₱3,960']].slice(0,3).map((x,i)=>`<div><b>${i+1}</b><span><strong>${x[0]}</strong><small>${x[1]}</small></span>${owner?`<strong>${x[2]}</strong>`:''}</div>`).join('')}</div></section>${owner?`<button class="insights-link" data-toast="Full insights opened">View insights ${icons.arrow}</button>`:''}`}
function todayLabel(){return new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric',timeZone:'Asia/Manila'}).format(new Date())}
function dashboard3(){const stateMarkup=`<div class="order-state ${state.ordersPaused?'paused':''}"><span class="state-dot"></span><span>${state.ordersPaused?'Paused':'Accepting orders'}</span>${state.role==='Owner'?`<button data-toggle-orders>${state.ordersPaused?'Resume':'Pause'}</button>`:'<small>Read-only</small>'}</div>`;const replacement=`<section class="dashboard-business"><div><strong>Welcome back, Leah!</strong><span class="dashboard-date">${todayLabel()}</span></div>${stateMarkup}</section>`;return dashboard2().replace(/<section class="dashboard-business">[\s\S]*?<\/section><section class="dashboard-period card">([\s\S]*?)<\/section><section class="dashboard-section needs-action card">([\s\S]*?)<\/section>/,`${replacement}<section class="dashboard-section needs-action card">$2</section><section class="dashboard-period card">$1</section>`)}
function dashboard4(){let html=dashboard3().replace(/<button data-page="orders" data-order-filter-link="Refunds">[\s\S]*?<\/button>/,'').replace('<span>Current unresolved items</span>','').replace('<strong>2</strong><span>Awaiting confirmation</span>','<strong>2</strong><span>orders to confirm</span>').replace('<div class="line-path">╱╲╱╱╲╱</div>','<svg class="revenue-lines" viewBox="0 0 320 92" preserveAspectRatio="none"><path class="current-line" d="M4 70 C45 48 65 62 101 36 S159 57 190 28 S248 49 316 14"/><path class="previous-line" d="M4 78 C44 66 75 72 104 56 S160 70 194 48 S250 67 316 42"/></svg>');const dateFilter=`<section class="dashboard-period card"><button class="date-field" data-date-toggle><span class="date-icon">▣</span><span><small>Date range</small><strong>${state.range}</strong></span><span class="date-chevron">⌄</span></button><div class="date-menu">${['Today','Yesterday','Last 7 days','This month','Custom range'].map(x=>`<button data-range="${x}">${x}</button>`).join('')}</div></section>`;return html.replace(/<section class="dashboard-period card">[\s\S]*?<\/section>/,dateFilter)}
function dashboard5(){let html=dashboard4();html=html.replace(/(<section class="dashboard-business">[\s\S]*?<\/section>)(<section class="dashboard-section needs-action card">[\s\S]*?<\/section>)/,'$2$1');html=html.replace('<strong>2</strong><span>orders to confirm</span>','<strong class="action-icon">▣</strong><span>2 orders to confirm</span>').replace('<strong>1</strong><span>Ready for pickup</span>','<strong class="action-icon pickup">◇</strong><span>1 ready for pickup</span>').replaceAll('Occupancy / Busiest hours','Busiest hours').replace('<i class="sparkline">▁▃▂▅▃▆▅</i>','<svg class="sparkline-svg" viewBox="0 0 100 36" preserveAspectRatio="none"><defs><linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#08a86a" stop-opacity=".18"/><stop offset="1" stop-color="#08a86a" stop-opacity="0"/></linearGradient></defs><path class="spark-fill" d="M2 28 C18 14 25 25 39 17 S58 25 71 12 S86 18 98 6 L98 36 L2 36 Z"/><path d="M2 28 C18 14 25 25 39 17 S58 25 71 12 S86 18 98 6"/></svg>');if(state.role==='Staff'){html=html.replace('<small>Read-only</small>','<span class="state-lock" aria-label="Read-only">▣</span>').replace('<strong>8</strong><small>+2 vs previous</small>','<strong>18</strong><small>+12% vs yesterday</small>').replace('42 orders','8 orders').replace('28 orders','6 orders').replace('18 orders','4 orders');html=html.replace(/<section class="dashboard-section card schedule-section">[\s\S]*?<\/section>/,`<section class="dashboard-section card schedule-section"><div class="section-heading"><div><h2>Schedule</h2></div></div><div class="schedule-list"><button class="schedule-entry" data-detail="ORD-1042"><span class="schedule-time">10:30 AM</span><span><strong>Cake pickup</strong><small>Leah Cruz · Room 304 · Qty 1</small></span>${icons.arrow}</button><button class="schedule-entry" data-detail="CB-8821"><span class="schedule-time">12:00 PM</span><span><strong>Table booking</strong><small>Maria Santos · Room 512 · 4 guests</small></span>${icons.arrow}</button></div></section>`)}return html}
function dashboard6(){let html=dashboard5();html=html.replace(/<svg class="revenue-lines"[\s\S]*?<\/svg>/,'<svg class="revenue-lines" viewBox="0 0 320 92" preserveAspectRatio="none"><defs><linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#704158" stop-opacity=".14"/><stop offset="1" stop-color="#704158" stop-opacity="0"/></linearGradient></defs><path class="current-fill" d="M4 70 C45 48 65 62 101 36 S159 57 190 28 S248 49 316 14 L316 92 L4 92 Z"/><path class="current-line" d="M4 70 C45 48 65 62 101 36 S159 57 190 28 S248 49 316 14"/><path class="previous-line" d="M4 78 C44 66 75 72 104 56 S160 70 194 48 S250 67 316 42"/></svg>');const spark=`<svg class="sparkline-svg" viewBox="0 0 100 36" preserveAspectRatio="none"><defs><linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#08a86a" stop-opacity=".18"/><stop offset="1" stop-color="#08a86a" stop-opacity="0"/></linearGradient></defs><path class="spark-fill" d="M2 28 C18 14 25 25 39 17 S58 25 71 12 S86 18 98 6 L98 36 L2 36 Z"/><path d="M2 28 C18 14 25 25 39 17 S58 25 71 12 S86 18 98 6"/></svg>`;html=html.replace(/<i class="sparkline">[^<]*<\/i>/g,spark).replace('<small>+2 vs previous</small>','<small class="trend positive">↑ +2% <span>vs previous</span></small>').replace('<small>+8.1% vs previous</small>','<small class="trend positive">↑ +8.1% <span>vs previous</span></small>').replace('<small>Posted separately</small>','<small class="trend negative">↓ 3.2% <span>vs yesterday</span></small>').replace('<small>+4.2% vs previous</small>','<small class="trend positive">↑ +4.2% <span>vs previous</span></small>').replace('<strong>18</strong><small>+12% vs yesterday</small>','<strong>18</strong><small class="trend positive">↑ +12% <span>vs yesterday</span></small>');return html}
function dashboard7(){let html=dashboard6();const status=`<div class="order-state ${state.ordersPaused?'paused':''}"><span class="order-toggle ${state.ordersPaused?'off':''} ${state.role==='Staff'?'locked':''}" ${state.role==='Owner'?'data-toggle-orders':''} role="switch" aria-checked="${!state.ordersPaused}" aria-label="${state.role==='Owner'?'Toggle accepting orders':'Accepting orders read-only'}"><span></span></span><span>${state.ordersPaused?'Paused':'Accepting orders'}</span></div>`;const clipboard='<span class="action-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="6" y="5" width="12" height="15" rx="2"/><path d="M9 5.5V4h6v1.5M9 10h6M9 14h4"/></svg></span>';const packageIcon='<span class="action-icon pickup" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m4 8 8-4 8 4-8 4-8-4Z"/><path d="M4 8v8l8 4 8-4V8M12 12v8"/></svg></span>';html=html.replace(/(<section class="dashboard-section needs-action card">[\s\S]*?<\/section>)(<section class="dashboard-business">[\s\S]*?<\/section>)/,'$2$1').replace(/<div class="order-state[\s\S]*?<\/div>/,status).replace('<strong class="action-icon">▣</strong>',clipboard).replace('<strong class="action-icon pickup">◇</strong>',packageIcon).replace('<span>2 orders to confirm</span>→','<span>2 orders to confirm</span><span class="action-chevron" aria-hidden="true">→</span>').replace('<span>1 ready for pickup</span>→','<span>1 ready for pickup</span><span class="action-chevron" aria-hidden="true">→</span>').replaceAll('>10</small>','>10 AM</small>').replaceAll('>2</small>','>2 PM</small>').replaceAll('>4</small>','>4 PM</small>').replaceAll('>6</small>','>6 PM</small>').replaceAll('>8</small>','>8 PM</small>');return html}
function dashboard8(){let html=dashboard7();const glance=html.match(/<section class="dashboard-section glance-section">[\s\S]*?<\/section>/)?.[0]||'';const grid=html.match(/<div class="dashboard-grid">([\s\S]*?)(?=<section class="dashboard-section card top-listings">)/);if(glance&&grid){const schedule=grid[1].match(/<section class="dashboard-section card schedule-section">[\s\S]*?<\/section>/)?.[0]||'';const charts=grid[1].replace(schedule,'');const overview=glance.replace('Period at a glance','Overview');const performance=`<section class="performance-heading"><h2>Performance</h2></section>${overview}<div class="dashboard-grid">${charts}</div>`;html=html.replace(glance,'').replace(grid[0],`${schedule}${performance}`)}return html.replaceAll('Orders per day','Daily orders').replace(/(<section class="dashboard-business">[\s\S]*?<\/section>)(<section class="dashboard-section needs-action card">[\s\S]*?<\/section>)/,'$2$1')}
function dashboard9(){return dashboard8().replace(/<div class="order-state[\s\S]*?<\/div>/,'')}
function dashboard10(){let html=dashboard9();html=html.replace(/<div class="section-heading"><div><h2>Overview<\/h2>[\s\S]*?<\/div><\/div>/,'').replace('Seven days ending Sep 30 · orders','Sep 24–30').replace('Food vendor · orders by hour · Sep 30','Today').replace(/(<section class="dashboard-section needs-action card">[\s\S]*?<\/section>)(<section class="dashboard-business">[\s\S]*?<\/section>)/,'$2$1');return html}
function dashboard11(){let html=dashboard10();const top=html.match(/<section class="dashboard-section card top-listings">[\s\S]*?<\/section>/)?.[0]||'';const money=html.match(/<section class="dashboard-section card money-section">[\s\S]*?<\/section>/)?.[0]||'';const insights=html.match(/<button class="insights-link"[\s\S]*?<\/button>/)?.[0]||'';html=html.replace(top,'').replace(money,'').replace(insights,'');if(state.role==='Owner')html=html.replace('<section class="performance-heading"><h2>Performance</h2></section>','<section class="performance-heading"><h2>Performance</h2><button class="performance-insights" data-toast="Full insights opened">View insights '+icons.arrow+'</button></section>');if(top){if(state.role==='Owner')html=html.replace(/(<section class="dashboard-section card revenue-trend">[\s\S]*?<\/section>)/,'$1'+top);else html=html.replace(/(<section class="dashboard-section card chart-section">[\s\S]*?<h2>Busiest hours<\/h2>[\s\S]*?<\/section>)/,'$1'+top)}if(state.role==='Owner'&&money)html+=money;return html}
function dashboard12(){let html=dashboard10();const top=html.match(/<section class="dashboard-section card top-listings">[\s\S]*?<\/section>/)?.[0]||'';const money=html.match(/<section class="dashboard-section card money-section">[\s\S]*?<\/section>/)?.[0]||'';const insights=html.match(/<button class="insights-link"[\s\S]*?<\/button>/)?.[0]||'';html=html.replace(top,'').replace(money,'').replace(insights,'');if(state.role==='Owner')html=html.replace('<section class="performance-heading"><h2>Performance</h2></section>','<section class="performance-heading"><h2>Performance</h2><button class="performance-insights" data-toast="Full insights opened">View insights '+icons.arrow+'</button></section>');if(top){if(state.role==='Owner')html=html.replace(/(<section class="dashboard-section card chart-section revenue-trend">[\s\S]*?<\/section>)/,'$1'+top);else html=html.replace(/(<section class="dashboard-section card chart-section">[\s\S]*?<h2>Busiest hours<\/h2>[\s\S]*?<\/section>)/,'$1'+top)}if(state.role==='Owner'&&money)html+=money;return html}
function dashboard13(){let html=dashboard12();const counts=state.range==='Today'?['8 orders','6 orders','4 orders']:['42 orders','28 orders','18 orders'];const names=['Whole Sans Rival Cake','Island Breakfast Box','Cold Brew Bottle'];const card='<section class="dashboard-section card top-listings"><div class="section-heading"><div><h2>Top listings</h2></div></div><div class="listing-rankings">'+names.map((name,i)=>'<div><span><strong>'+name+'</strong></span><strong>'+counts[i]+'</strong></div>').join('')+'</div></section>';return html.replace(/<section class="dashboard-section card top-listings">[\s\S]*?<\/section>/,card)}
function dashboard14(){return dashboard13().replace('class="performance-insights" data-toast="Full insights opened"','class="performance-insights" data-insights')}
function dashboard15(){return dashboard14().replace(/<section class="dashboard-period card">[\s\S]*?<\/section>/,'')}
function dashboard16(){const html=dashboard15(),owner=state.role==='Owner',today=state.range==='Today',range=state.range==='This month'?'Sep 1–30':state.range==='Yesterday'?'Sep 29':state.range==='Last 7 days'?'Sep 24–30':'Custom range',needs=html.match(/<section class="dashboard-section needs-action card">[\s\S]*?<\/section>/)?.[0]||'',business=html.match(/<section class="dashboard-business">[\s\S]*?<\/section>/)?.[0]||'',schedule=html.match(/<section class="dashboard-section card schedule-section">[\s\S]*?<\/section>/)?.[0]||'',chartSections=[...html.matchAll(/<section class="dashboard-section card chart-section">[\s\S]*?<\/section>/g)].map(x=>x[0]),dailySection=chartSections.find(x=>x.includes('<h2>Daily orders</h2>'))||'',busySection=chartSections.find(x=>x.includes('<h2>Busiest hours</h2>'))||'',money=owner?(html.match(/<section class="dashboard-section card money-section">[\s\S]*?<\/section>/)?.[0]||''):'',daily=dailySection.replace(/^<section[^>]*>/,'').replace(/<\/section>$/,''),busy=busySection.replace(/^<section[^>]*>/,'').replace(/<\/section>$/,''),orderValue=today?'18':'42',revenue=today?'₱6,420':'₱84,260',topSellers=[['Whole Sans Rival Cake','42 orders'],['Island Breakfast Box','28 orders'],['Cold Brew Bottle','18 orders'],['Celebration Cake Slice','14 orders'],['Pandan Latte','11 orders']],listingContent='<div class="performance-listing-list">'+topSellers.map(x=>'<div class="performance-listing-row"><strong>'+x[0]+'</strong><span>'+x[1]+'</span></div>').join('')+'</div>',tab=state.performanceTab||'daily',content=tab==='busy'?busy:tab==='top'?listingContent:daily;const performance='<section class="dashboard-performance"><div class="performance-heading"><h2>Performance</h2>'+(owner?'<button class="performance-insights" data-insights>View insights '+icons.arrow+'</button>':'')+'</div><div class="performance-kpis"><article class="performance-kpi"><span>Orders</span><strong>'+orderValue+'</strong><small>↑ +12% vs previous</small></article><article class="performance-kpi"><span>Revenue</span><strong>'+revenue+'</strong><small>↑ +8.1% vs previous</small></article></div><div class="performance-tabs" role="tablist"><button class="'+(tab==='daily'?'active':'')+'" data-performance-tab="daily">Daily orders</button><button class="'+(tab==='busy'?'active':'')+'" data-performance-tab="busy">Busiest hours</button><button class="'+(tab==='top'?'active':'')+'" data-performance-tab="top">Top listings</button></div><section class="performance-tab-card card" data-performance-panel>'+content+'</section></section>';return business+needs+performance+schedule+money}
function dashboardPerformanceChart(values,labels,takeaway,intervals=labels,highlightIndex=-1){const maxValue=Math.max(...values,1),scale=maxValue<=8?8:Math.ceil(maxValue/2)*2,ticks=[];for(let n=scale;n>=0;n-=2)ticks.push(n);const highlight=highlightIndex<0?values.indexOf(Math.max(...values)):highlightIndex;return '<div class="performance-activity-chart" role="img" aria-label="Orders for selected period"><div class="performance-chart-grid"><div class="performance-y-axis">'+ticks.map(n=>'<span>'+n+'</span>').join('')+'</div><div class="performance-chart-plot"><div class="performance-gridlines">'+ticks.map(()=>'<i></i>').join('')+'</div><div class="performance-bars">'+values.map((n,i)=>{const inProgress=state.range==='Today'&&i===values.length-1?' · In progress':'';return '<button class="performance-bar '+(i===highlight?'selected ':'')+(n===0?'zero':'')+'" style="height:'+(n===0?0:Math.round(n/scale*100))+'%" title="'+intervals[i]+' · '+n+' '+(n===1?'order':'orders')+inProgress+'" aria-label="'+intervals[i]+' · '+n+' '+(n===1?'order':'orders')+inProgress+'"></button>'}).join('')+'</div></div></div><div class="performance-x-axis">'+labels.map(label=>'<span>'+label+'</span>').join('')+'</div><div class="performance-chart-legend"><span><i class="regular"></i>Orders</span><span><i class="busy"></i>Busiest interval</span></div></div><p class="performance-takeaway">'+takeaway+'</p>'}
function dashboard18(){let html=dashboard16(),today=state.range==='Today',owner=state.role==='Owner',period={title:'Today',sub:'orders by hour',compare:'vs yesterday',change:'+12%',values:[2,3,5,8,6,4],labels:['10 AM','12 PM','2 PM','4 PM','6 PM','8 PM'],takeaway:'Busiest time: 4–5 PM.'};if(state.range==='Yesterday')period={title:'Yesterday',sub:'orders by hour',compare:'vs previous day',change:'+6%',values:[1,2,4,5,3,2],labels:['10 AM','12 PM','2 PM','4 PM','6 PM','8 PM'],takeaway:'Busiest time: 4–5 PM.'};if(state.range==='Last week')period={title:'Last week',sub:'orders by day',compare:'vs previous week',change:'+9%',values:[5,7,4,8,10,6,8],labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],takeaway:'Busiest day: Saturday.'};if(state.range==='This month')period={title:'This month',sub:'orders by day',compare:'vs previous month',change:'+14%',values:[12,16,10,18,22,15,19],labels:['Sep 1','5','10','15','20','25','30'],takeaway:'Busiest day: Sep 20.'};if(state.range==='Custom range')period={title:'Custom range',sub:'orders by day',compare:'vs previous period',change:'+8%',values:[4,6,5,8,7,10,8],labels:['Day 1','2','3','4','5','6','7'],takeaway:'Busiest day: Day 6.'};const ordersValue=today?'18':state.range==='Yesterday'?'15':state.range==='This month'?'124':state.range==='Last week'?'48':'42',revenueValue=today?'₱6,420':state.range==='Yesterday'?'₱5,880':state.range==='This month'?'₱124,860':state.range==='Last week'?'₱84,260':'₱84,260',rangeLabel=period.title==='Today'?'Today · Sep 30':period.title+' · selected period',tab=state.performanceTab==='top'?'top':'activity',topCounts=state.range==='Today'?[['Whole Sans Rival Cake','8 orders'],['Island Breakfast Box','5 orders'],['Cold Brew Bottle','3 orders']]:state.range==='This month'?[['Whole Sans Rival Cake','48 orders'],['Island Breakfast Box','32 orders'],['Cold Brew Bottle','22 orders']]:[['Whole Sans Rival Cake','42 orders'],['Island Breakfast Box','28 orders'],['Cold Brew Bottle','18 orders']],activityContent='<div class="performance-card-heading"><div><h3>Order activity</h3><span>'+period.title+' · '+period.sub+'</span></div></div>'+dashboardPerformanceChart(period.values,period.labels,period.takeaway),topContent='<div class="performance-card-heading"><div><h3>Top listings</h3><span>'+period.title+' · top three by order count</span></div></div><div class="performance-listing-list">'+topCounts.map(x=>'<div class="performance-listing-row"><strong>'+x[0]+'</strong><span>'+x[1]+'</span></div>').join('')+'</div>',performance='<section class="dashboard-performance"><div class="performance-heading"><h2>Performance</h2>'+(owner?'<button class="performance-insights" data-insights>View insights '+icons.arrow+'</button>':'')+'</div><div class="performance-kpis '+(owner?'owner':'staff')+'"><article class="performance-kpi"><span>Orders</span><strong>'+ordersValue+'</strong><small>↑ '+period.change+' <em>'+period.compare+'</em></small></article>'+(owner?'<article class="performance-kpi"><span>Revenue</span><strong>'+revenueValue+'</strong><small>↑ +8.1% <em>'+period.compare+'</em></small></article>':'')+'</div><div class="performance-tabs" role="tablist"><button class="'+(tab==='activity'?'active':'')+'" data-performance-tab="activity">Order activity</button><button class="'+(tab==='top'?'active':'')+'" data-performance-tab="top">Top listings</button></div><section class="performance-tab-card card" data-performance-panel>'+(tab==='top'?topContent:activityContent)+'</section></section>';return html.replace(/<section class="dashboard-performance">[\s\S]*?(?=<section class="dashboard-section card schedule-section)/,performance)}
function dashboard17(){let html=dashboard18();if(state.role==='Staff')html=html.replace(/<article class="performance-kpi"><span>Revenue<\/span>[\s\S]*?<\/article>/,'').replace('<div class="performance-kpis">','<div class="performance-kpis staff">');let rangeLabel=state.range==='Today'?'Today · Sep 30':state.range==='Yesterday'?'Yesterday · Sep 29':state.range==='This month'?'This month · Sep 1–30':state.range==='Last week'?'Last week':'Sep 24–30';const scheduleCard='<section class="dashboard-section card schedule-section polished-schedule"><div class="polished-card-header"><div><h2>Schedule</h2><span>'+rangeLabel+'</span></div><button class="button ghost" data-page="orders">View orders '+icons.arrow+'</button></div><div class="polished-schedule-list"><button class="polished-schedule-row" data-detail="ORD-1042"><span class="polished-time">3:00 PM</span><span class="polished-schedule-details"><strong>Whole Sans Rival Cake</strong><small>John D. · Room 101 · Qty 1</small><em class="confirmed">Confirmed</em></span><span class="polished-chevron">›</span></button><button class="polished-schedule-row" data-detail="CB-8821"><span class="polished-time">5:30 PM</span><span class="polished-schedule-details"><strong>Private bakery tasting</strong><small>Amelia Reyes · Room 508 · 2 guests</small><em class="pending">Pending</em></span><span class="polished-chevron">›</span></button></div></section>';const earningsCard=state.role==='Owner'?'<section class="dashboard-section card earnings-section polished-earnings"><div class="polished-card-header"><h2>Earnings</h2><button class="button ghost" data-page="earnings">View earnings '+icons.arrow+'</button></div><div class="earnings-primary"><span>Next payout</span><strong>₱42,180.00</strong><small>Expected Oct 2</small></div><div class="earnings-pending"><span>Room charges pending checkout</span><strong>₱26,840.00</strong></div></section>':'';html=html.replace(/<section class="dashboard-section card schedule-section">[\s\S]*?<\/section>/,scheduleCard).replace(/<section class="dashboard-section card money-section">[\s\S]*?<\/section>/,earningsCard);return html}
function insightsPage3(){return insightsPage2().replace(/<section class="insights-filter card">[\s\S]*?<\/section>/,'')}
function shell3(content){let html=shell2(content);if(state.page==='insights'||state.page==='staff-listings'||state.page==='orders'||state.page==='bookings')html=html.replace(/<header class="topbar">[\s\S]*?<\/header>/,'');else if(state.page==='dashboard')html=html.replace('</header>','<button class="header-filter" data-header-filter aria-label="Open Dashboard date filter"><span>'+state.range+'</span><i class="hgi-stroke hgi-calendar-cog header-filter-icon" aria-hidden="true"></i></button></header>');return html}
function filterSheet(){if(!state.filterSheet)return '';const insight=state.page==='insights',options=insight?['Last 7 days','Last 30 days','This month','Last month','Custom range']:['Today','Yesterday','This month','Last week','Custom range'],selected=state.filterDraftRange||state.range,custom=state.filterSheet==='custom';return '<div class="filter-sheet-backdrop" data-sheet-close></div><section class="filter-sheet" role="dialog" aria-modal="true" aria-label="Date range filter"><div class="sheet-handle"></div><div class="sheet-heading"><div><h2>Date range</h2><span>'+(insight?'Apply to all Insights reporting':'Apply to dashboard reporting')+'</span></div><button data-sheet-close aria-label="Close date range filter">×</button></div><div class="sheet-options">'+options.map(x=>'<button class="'+(selected===x?'active':'')+'" data-sheet-range="'+x+'"><span>'+x+'</span>'+(selected===x?'<b>✓</b>':'')+'</button>').join('')+'</div>'+(insight?'<div class="compare-options"><strong>Compare to</strong><label><input type="radio" name="compare" data-compare="previous" '+(state.filterDraftCompare==='previous'?'checked':'')+'> Previous period</label><label><input type="radio" name="compare" data-compare="year" '+(state.filterDraftCompare==='year'?'checked':'')+'> Same period last year</label></div>':'')+(custom?'<form class="custom-range-form" data-custom-submit><label>From<input type="date" name="from" value="'+state.customFrom+'"></label><label>To<input type="date" name="to" value="'+state.customTo+'"></label></form>':'')+'<button class="button primary filter-apply" data-apply-filters>Apply filters</button></section>'}
function insightSpark(id,color){return '<svg class="insight-spark" viewBox="0 0 120 44" preserveAspectRatio="none"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+color+'" stop-opacity=".18"/><stop offset="1" stop-color="'+color+'" stop-opacity="0"/></linearGradient></defs><path class="insight-spark-fill" fill="url(#'+id+')" d="M2 34 C20 18 30 31 46 22 S68 29 82 14 S101 23 118 6 L118 44 L2 44 Z"/><path class="insight-spark-line" stroke="'+color+'" d="M2 34 C20 18 30 31 46 22 S68 29 82 14 S101 23 118 6"/></svg>'}
function insightBars(values,labels){const max=Math.max.apply(null,values.concat([1]));return '<div class="insight-bars" role="img" aria-label="Filtered data chart">'+values.map((n,i)=>'<div class="insight-bar-slot"><div class="insight-bar-plot"><button class="insight-bar" style="height:'+Math.max(8,Math.round(n/max*112))+'px" title="'+labels[i]+': '+n+'" aria-label="'+labels[i]+': '+n+'"></button></div><small>'+labels[i]+'</small></div>').join('')+'</div>'}
function insightsPage(){if(state.role!=='Owner')return '<div class="insights-access card"><strong>Owner access required</strong><span>Insights and financial reporting are available to the establishment owner.</span><button class="button primary" data-insights-back>Back to Dashboard</button></div>';const today=state.range==='Today',range=state.range==='This month'?'Sep 1–30':state.range==='Yesterday'?'Sep 29':state.range==='Last 7 days'?'Sep 24–30':today?'Sep 30':'Custom range',metrics=today?{orders:'8',revenue:'₱6,420',room:'₱3,860',average:'₱802'}:{orders:'42',revenue:'₱84,260',room:'₱26,840',average:'₱1,006'},labels=today?['8 AM','10 AM','12 PM','2 PM','4 PM','6 PM']:['Sep 24','Sep 25','Sep 26','Sep 27','Sep 28','Sep 29','Sep 30'],sales=state.insightMetric==='orders'?(today?[2,3,1,4,3,5]:[8,7,10,12,9,14,12]):(today?[540,820,620,1120,980,1260]:[8200,7600,9400,11800,10200,13600,12400]),all=[['Whole Sans Rival Cake',42,42,'₱50,400'],['Island Breakfast Box',28,36,'₱19,040'],['Cold Brew Bottle',18,24,'₱3,960'],['Private bakery tasting',12,24,'₱28,800'],['Celebration cupcake box',9,18,'₱8,100']],query=state.insightQuery.toLowerCase(),rows=all.filter(x=>x.join(' ').toLowerCase().includes(query)).sort((a,b)=>state.insightSort==='count'?b[1]-a[1]:parseInt(b[3].replace(/[₱,]/g,''))-parseInt(a[3].replace(/[₱,]/g,'')));return '<div class="insights-page"><header class="insights-header"><button class="insights-back" data-insights-back aria-label="Back to Dashboard">←</button><div><div class="eyebrow">SANS RIVAL BAKEHOUSE</div><h1>Insights</h1></div></header><section class="insights-filter card"><button class="date-field" data-date-toggle><span class="date-icon">▣</span><span><small>Date range</small><strong>'+range+'</strong></span><span class="date-chevron">⌄</span></button><div class="date-menu">'+['Today','Yesterday','Last 7 days','This month','Custom range'].map(x=>'<button data-range="'+x+'">'+x+'</button>').join('')+'</div></section><section class="insights-section"><h2>Summary</h2><div class="insights-kpis"><div class="insight-kpi"><span>Orders</span><strong>'+metrics.orders+'</strong><small class="positive">↑ +12% <em>vs previous</em></small>'+insightSpark('insight-orders','#08a86a')+'</div><div class="insight-kpi"><span>Revenue</span><strong>'+metrics.revenue+'</strong><small class="positive">↑ +8.1% <em>vs previous</em></small>'+insightSpark('insight-revenue','#08a86a')+'</div><div class="insight-kpi"><span>Room charges</span><strong>'+metrics.room+'</strong><small class="negative">↓ 3.2% <em>vs previous</em></small>'+insightSpark('insight-room','#bd646a')+'</div><div class="insight-kpi"><span>Average order value</span><strong>'+metrics.average+'</strong><small class="positive">↑ +4.2% <em>vs previous</em></small>'+insightSpark('insight-average','#08a86a')+'</div></div></section><section class="insights-section card insight-sales"><div class="insight-card-head"><div><h2>Sales trend</h2><span>'+range+' vs previous equivalent period</span></div><div class="insight-toggle"><button class="'+(state.insightMetric==='revenue'?'active':'')+'" data-insight-metric="revenue">Revenue</button><button class="'+(state.insightMetric==='orders'?'active':'')+'" data-insight-metric="orders">Orders</button></div></div><div class="insight-total"><strong>'+ (state.insightMetric==='orders'?metrics.orders:metrics.revenue) +'</strong><span class="positive">↑ +8.1%</span></div>'+insightBars(sales,labels)+'<div class="insight-legend"><span><i class="current-dot"></i>Selected period</span><span><i class="previous-dot"></i>Previous period</span></div></section><section class="insights-section card insight-listings"><div class="insight-card-head"><div><h2>Listing performance</h2><span>All listings · '+range+'</span></div><div class="insight-sort"><button class="'+(state.insightSort==='revenue'?'active':'')+'" data-insight-sort="revenue">Revenue</button><button class="'+(state.insightSort==='count'?'active':'')+'" data-insight-sort="count">Count</button></div></div><label class="insight-search">⌕<input data-insight-search value="'+esc(state.insightQuery)+'" placeholder="Search listings"/></label><div class="insight-table"><div class="insight-table-head"><span>Listing</span><span>Orders</span><span>Quantity</span><span>Revenue</span></div>'+(rows.length?rows.map(x=>'<div class="insight-table-row"><strong>'+x[0]+'</strong><span>'+x[1]+'</span><span>'+x[2]+'</span><strong>'+x[3]+'</strong></div>').join(''):'<div class="insight-empty">No listings match your search.</div>')+'</div></section><section class="insights-section card insight-demand"><div class="insight-card-head"><div><h2>Busiest hours</h2><span>Orders by hour · '+(today?'Today':range)+'</span></div></div>'+insightBars(today?[2,4,3,6,5,8,7]:[6,7,9,8,11,10,12],['8 AM','10 AM','12 PM','2 PM','4 PM','6 PM','8 PM'])+'</section><section class="insights-section card insight-payments"><div class="insight-card-head"><div><h2>Payment breakdown</h2><span>'+range+' · current establishment</span></div></div><div class="payment-total-row"><span>Gateway</span><strong>₱52,240</strong></div><div class="payment-total-row"><span>Charge to room</span><strong>₱32,020</strong></div><div class="payment-stack"><span style="width:62%"></span><span style="width:38%"></span></div><div class="payment-key"><span><i class="gateway-dot"></i>Gateway <strong>₱52,240</strong></span><span><i class="room-dot"></i>Charge to room <strong>₱32,020</strong></span></div><div class="payment-settlement"><div><span>Awaiting hotel settlement</span><strong>₱26,840</strong></div><div><span>Settled</span><strong>₱5,180</strong></div></div></section></div>'}
function filterChips(){const group=(label,items,attr,current)=>`<div class="orders-filter-group"><span>${label}</span><div class="filter-scroll">${items.map(x=>`<button class="filter ${current===x?'active':''}" ${attr}="${x}">${x}</button>`).join('')}</div></div>`;return `<div class="orders-filters">${group('Order type',['All','Bookings','In-app orders','Counter charges'],'data-order-type',state.orderTypeFilter)}${group('Status',['All','Pending','Confirmed','Preparing','Ready','Completed','Posted to room'],'data-order-status',state.orderStatusFilter)}${group('Payment method',['All','Charge to room','Gateway'],'data-order-payment',state.orderPaymentFilter)}</div>`}
function ordersView(){const selected=state.range==='Today'?'Today · Sep 30, 2026':state.range==='Yesterday'?'Yesterday · Sep 29, 2026':state.range==='This month'?'This month · Sep 1–30, 2026':state.range==='Last week'?'Last week · Sep 24–30, 2026':'Custom range';const type=state.orderTypeFilter||'All',status=state.orderStatusFilter||'All',payment=state.orderPaymentFilter||'All';const filtered=orders.filter(o=>(!state.query||`${o.id} ${o.guest} ${o.room} ${o.item}`.toLowerCase().includes(state.query.toLowerCase()))&&(type==='All'||type===o.kind||type==='Counter charges'&&o.kind==='Counter charge')&&(status==='All'||status===o.status)&&(payment==='All'||payment==='Charge to room'&&o.payment==='Charged to room'||payment==='Gateway'&&o.payment==='Paid via gateway'));return `${head('Orders',`Selected period: ${selected} · bookings, in-app orders, and counter charges.`,`<button class="button primary" data-toast="Block date controls opened">${icons.plus} Block availability</button>`)}<div class="orders-toolbar"><label class="search-box">${icons.search}<input value="${esc(state.query)}" data-search placeholder="Search guest, room, listing, or order reference" /></label><div class="view-toggle"><button class="${state.orderView==='list'?'active':''}" data-view="list">List</button><button class="${state.orderView==='calendar'?'active':''}" data-view="calendar">Calendar</button></div></div>${filterChips()}${state.orderView==='calendar'?calendarOrders():`<section class="order-list">${filtered.length?filtered.map(orderCard).join(''):`<div class="empty-state"><strong>No matching orders</strong><span>Try another guest, room, listing, or order reference.</span></div>`}</section>`}`}
function orderCard(o){return `<button class="order-card" data-detail="${o.id}"><div class="order-card-top"><div><span class="type-badge ${o.kind.toLowerCase().replaceAll(' ','-')}">${o.kind}</span><strong>${esc(o.guest)} <small>Room ${esc(o.room)}</small></strong></div><span class="status ${o.status.toLowerCase().replaceAll(' ','-')}">${o.status}</span></div><div class="order-card-body"><div><span class="order-item">${esc(o.item)}</span><small>${esc(o.quantity)} · ${esc(o.when)}</small></div><div><span class="payment-badge ${o.payment.includes('room')?'room':'gateway'}">${o.payment}</span><strong class="order-total">${o.total}</strong></div></div><div class="order-card-foot"><span>${o.hotel} · ${o.fulfilment}</span><span>${icons.arrow}</span></div></button>`}
function calendarOrders(){return `<section class="card calendar-card"><div class="card-header"><div><h2>October 2026</h2><span class="count">Monday, Sep 28 – Sunday, Oct 4</span></div><div class="calendar-controls"><button class="button small">Day</button><button class="button small active">Week</button><button class="button small">Month</button></div></div><div class="calendar-capacity"><span>Today’s capacity</span><strong>3 of 12 bakery slots booked</strong><button class="button small" data-toast="Availability blocker opened">Block date or unit</button></div><div class="schedule-grid">${['Mon 28','Tue 29','Wed 30','Thu 1','Fri 2','Sat 3','Sun 4'].map((d,i)=>`<div class="schedule-day"><strong>${d}</strong>${i===1?`<button data-detail="CT-2208"><b>10:15</b> Counter charge</button>`:''}${i===3?`<button data-detail="ORD-1042"><b>3:00 PM</b> Cake pick-up</button>`:''}${i===4?`<button data-detail="CB-8821"><b>5:30 PM</b> Tasting booking</button>`:''}</div>`).join('')}</div></section>`}
function orderDetail(){const o=orders.find(x=>x.id===state.detail);if(!o)return ordersView();const counter=o.kind==='Counter charge';return `<button class="back" data-page="orders">← Back to orders</button><div class="detail-panel"><div class="detail-main"><section class="card detail-card"><div class="detail-title"><div><div class="section-label">${o.kind} · ${o.id}</div><h1>${esc(o.item)}</h1><p class="subtext">${esc(o.guest)} · ${o.hotel} · Room ${o.room}</p></div><span class="status ${o.status.toLowerCase().replaceAll(' ','-')}">${o.status}</span></div><div class="detail-meta"><div class="meta-item"><label>Guest</label><strong>${esc(o.guest)} · Room ${esc(o.room)}</strong></div><div class="meta-item"><label>Date / time</label><strong>${o.when}</strong></div><div class="meta-item"><label>Fulfilment</label><strong>${o.fulfilment}</strong></div><div class="meta-item"><label>Payment</label><strong>${o.payment}</strong></div><div class="meta-item"><label>Settlement</label><strong>${o.settlement}</strong></div><div class="meta-item"><label>Total</label><strong>${o.total}</strong></div></div><div class="detail-contact"><button class="button small" data-toast="${o.contact}">${o.contact}</button><span>Guest details shown only for fulfilment.</span></div></section><section class="card detail-card"><div class="section-label">Items and notes</div><div class="line-item"><span>${esc(o.item)} <small>${esc(o.quantity)}</small></span><strong>${o.total}</strong></div><div class="price-breakdown"><span>Unit price × quantity</span><strong>${o.total}</strong><span>Add-ons</span><strong>₱0</strong><span class="total-line">Total</span><strong class="total-line">${o.total}</strong></div><div class="info-block"><strong>Guest notes</strong><p>${esc(o.notes||'No special notes.')}</p></div></section></div><aside class="detail-side"><section class="card side-action"><h3>${counter?'Record status':'Next action'}</h3>${counter?`<div class="notice">Counter charges are read-only here. Voids happen in the separate validator app.</div>`:`<div class="action-stack">${o.status==='Pending'?`<button class="button primary" data-action="confirm">Confirm</button><button class="button" data-action="reschedule">Reschedule</button><button class="button danger" data-action="cancel">Decline / cancel</button>`:o.status==='Confirmed'?`<button class="button primary" data-action="preparing">Mark preparing</button><button class="button" data-action="inuse">Mark in use</button><button class="button danger" data-action="cancel">Cancel</button>`:o.status==='Preparing'?`<button class="button primary" data-action="ready">Mark ready · notify guest</button><button class="button danger" data-action="cancel">Cancel</button>`:o.status==='Ready'?`<button class="button primary" data-action="complete">Mark completed</button>`:`<span class="completion-note">No further vendor action is needed.</span>`}</div>`}</section><section class="card side-action"><h3>Status timeline</h3><div class="timeline">${o.timeline.map((t,i)=>`<div class="timeline-row"><span class="timeline-dot"></span><div><strong>${t[0]}</strong><span>${t[1]}</span></div></div>`).join('')}</div></section></aside></div>`}
function listingsView(){return `${head('Listings','Manage what guests can book or buy, at your own prices.',`<button class="button primary" data-listing-new>${icons.plus} Add listing</button>`)}<div class="listing-toolbar"><div class="listing-summary"><strong>${listings.filter(x=>x.status==='Active').length} active listings</strong><span>Visible to guests of Henry’s Resort Dumaguete</span></div><button class="button" data-toast="Availability settings opened">Availability settings</button></div><div class="listing-grid">${listings.map(l=>`<article class="listing-card"><div class="listing-photo">${l.category==='Bakery'?'CAKE':l.category==='Food'?'BOX':'COFFEE'}</div><div class="listing-content"><div class="listing-heading"><div><span class="section-label">${l.category}</span><h2>${l.name}</h2></div><span class="status ${l.status.toLowerCase()}">${l.status}</span></div><div class="listing-price"><strong>${l.price}</strong><span>${l.unit}</span></div><div class="listing-details"><span>${l.stock}</span><span>${l.location}</span><span>${l.payment}</span></div><div class="listing-actions"><button class="button small" data-toast="${l.name} editor opened">Edit</button><button class="toggle ${l.status==='Active'?'on':''}" aria-label="Toggle ${l.name}"></button></div></div></article>`).join('')}</div><section class="card listing-rules"><div class="card-header"><div><h2>Booking and payment rules</h2><span class="count">Applied to new guest requests</span></div><button class="button small" data-toast="Rules editor opened">Edit</button></div><div class="rules-grid"><div><strong>Payment options</strong><span>Charge to room · Pay now via gateway</span></div><div><strong>Cancellation policy</strong><span>Moderate · Refund amount shown before cancel</span></div><div><strong>Pre-arrival booking</strong><span>Allowed · Gateway payment only before check-in</span></div><div><strong>Operating hours</strong><span>Daily · 7:00 AM–9:00 PM</span></div></div></section>`}
function earningsClean(){return earningsView().replace('<button>Refunds <b>1</b></button>','')}
function listingsClean(){return listingsView().replace('Add listing','Create listing').replace('Refund amount shown before cancel','Cancellation terms shown before cancel')}
function servicesClean(){return listingsClean().replace('<h1>Listings</h1>','<h1>Services</h1>')}
function profileView(){return `${head('Profile','Business details, team access, settlement terms, and support.')}<div class="profile-grid"><section class="card profile-card"><div class="card-header"><h2>Business details</h2><button class="button small" data-toast="Business details editor opened">Edit</button></div><div class="profile-body"><div class="profile-identity"><span class="profile-avatar">SB</span><div><strong>Sans Rival Bakehouse</strong><span>Bakery · Partner vendor</span></div></div><div class="settings-list"><div class="setting-row"><div><strong>Contact</strong><span>Leah Santos · +63 917 555 0182</span></div></div><div class="setting-row"><div><strong>Address</strong><span>South wing · Henry’s Resort Dumaguete</span></div></div><div class="setting-row"><div><strong>Linked hotel</strong><span>Henry’s Resort Dumaguete</span></div></div></div></div></section><section class="card profile-card"><div class="card-header"><h2>Verification documents</h2><span class="status confirmed">Verified</span></div><div class="profile-body"><div class="setting-row"><div><strong>Business permit</strong><span>Uploaded Sep 12 · Valid through 2027</span></div><button class="button small" data-toast="Document viewer opened">View</button></div><div class="setting-row"><div><strong>Owner ID</strong><span>Uploaded Sep 12 · Verified</span></div><button class="button small" data-toast="Document viewer opened">View</button></div></div></section><section class="card profile-card"><div class="card-header"><h2>Team accounts</h2><button class="button small" data-toast="Invite staff opened">Add staff</button></div><div class="profile-body"><div class="setting-row"><div><strong>Leah Santos</strong><span>Owner · Full access</span></div><span class="status confirmed">Active</span></div><div class="setting-row"><div><strong>Marco Dela Cruz</strong><span>Staff · Orders and Listings view</span></div><span class="status confirmed">Active</span></div></div></section><section class="card profile-card"><div class="card-header"><h2>Payout account</h2><button class="button small" data-toast="Payout account editor opened">Edit</button></div><div class="profile-body"><div class="setting-row"><div><strong>BDO · ending 2084</strong><span>Weekly settlement by default · Every Friday</span></div><span class="status confirmed">Verified</span></div><div class="setting-row"><div><strong>Notifications</strong><span>Push, SMS, and email for order updates</span></div><button class="toggle on" aria-label="Notifications enabled"></button></div><div class="profile-links"><button data-toast="Help center opened">Help & support ${icons.arrow}</button><button data-toast="Logged out">Log out ${icons.arrow}</button></div></div></section></div>`}
function insightMoney(n){return '₱'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function dashboard18(){let html=dashboard16(),today=state.range==='Today',owner=state.role==='Owner',period={title:'Today',sub:'Orders by hour',values:[0,1,2,3,7,5],labels:['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM'],intervals:['8–9 AM','9–10 AM','10–11 AM','11 AM–12 PM','12–1 PM','1–2 PM'],highlight:4,takeaway:'Busiest time: 12–1 PM · 7 orders',compare:'vs yesterday',change:'+12%'};if(state.range==='Yesterday')period={title:'Yesterday',sub:'Orders by hour',values:[1,2,4,5,3,2],labels:['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM'],intervals:['8–9 AM','9–10 AM','10–11 AM','11 AM–12 PM','12–1 PM','1–2 PM'],highlight:3,takeaway:'Busiest time: 11 AM–12 PM · 5 orders',compare:'vs previous day',change:'+6%'};if(state.range==='Last week')period={title:'Last week',sub:'Orders by day',values:[5,7,4,8,10,6,8],labels:['Sep 24','25','26','27','28','29','30'],intervals:['Sep 24','Sep 25','Sep 26','Sep 27','Sep 28','Sep 29','Sep 30'],highlight:4,takeaway:'Busiest day: Sep 28 · 10 orders',compare:'vs previous week',change:'+9%'};if(state.range==='This month')period={title:'This month',sub:'Orders by day',values:[12,16,10,18,22,15,19],labels:['Sep 1','5','10','15','20','25','30'],intervals:['Sep 1','Sep 5','Sep 10','Sep 15','Sep 20','Sep 25','Sep 30'],highlight:4,takeaway:'Busiest day: Sep 20 · 22 orders',compare:'vs previous month',change:'+14%'};if(state.range==='Custom range')period={title:'Custom range',sub:'Orders by day',values:[4,6,5,8,7,10,8],labels:['Day 1','2','3','4','5','6','7'],intervals:['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'],highlight:5,takeaway:'Busiest day: Day 6 · 10 orders',compare:'vs previous period',change:'+8%'};const ordersValue=today?'18':state.range==='Yesterday'?'15':state.range==='This month'?'124':state.range==='Last week'?'48':'42',revenueValue=today?'₱6,420':state.range==='Yesterday'?'₱5,880':state.range==='This month'?'₱124,860':state.range==='Last week'?'₱84,260':'₱84,260',tab=state.performanceTab==='top'?'top':'activity',fullTopCounts=dashboardTopListings(),topCounts=fullTopCounts.slice(0,3),activityContent='<div class="performance-card-heading"><div><h3>Order activity</h3><span>'+period.title+' · '+period.sub+'</span></div></div>'+dashboardPerformanceChart(period.values,period.labels,period.takeaway,period.intervals,period.highlight),topContent='<div class="polished-card-header"><div><h2>Top listings</h2></div>'+(fullTopCounts.length>3?'<button class="button ghost" data-view-all-listings>View all listings '+icons.arrow+'</button>':'')+'</div><div class="performance-listing-list">'+topCounts.map(x=>'<div class="performance-listing-row"><strong>'+x[0]+'</strong><span>'+x[1]+'</span></div>').join('')+'</div>';const performance='<section class="dashboard-performance"><div class="performance-heading"><h2>Performance</h2>'+(owner?'<button class="performance-insights" data-insights>View insights '+icons.arrow+'</button>':'')+'</div><div class="performance-kpis '+(owner?'owner':'staff')+'"><article class="performance-kpi"><span>Orders</span><strong>'+ordersValue+'</strong><small>↑ '+period.change+' <em>'+period.compare+'</em></small></article>'+(owner?'<article class="performance-kpi"><span>Revenue</span><strong>'+revenueValue+'</strong><small>↑ +8.1% <em>'+period.compare+'</em></small></article>':'')+'</div><div class="performance-tabs" role="tablist"><button class="'+(tab==='activity'?'active':'')+'" data-performance-tab="activity">Order activity</button><button class="'+(tab==='top'?'active':'')+'" data-performance-tab="top">Top listings</button></div><section class="performance-tab-card card" data-performance-panel>'+(tab==='top'?topContent:activityContent)+'</section></section>';return html.replace(/<section class="dashboard-performance">[\s\S]*?(?=<section class="dashboard-section card schedule-section)/,performance)}
function insightRangeLabel(){return state.range==='Last 30 days'?'Sep 1–30, 2026':state.range==='This month'?'Sep 1–30, 2026':state.range==='Last month'?'Aug 1–31, 2026':state.range==='Custom range'?(state.customFrom&&state.customTo?state.customFrom+' – '+state.customTo:'Custom range'):'Sep 24–30, 2026'}
function insightLineChart(values,previous,labels){const w=560,h=156,p=10,all=values.concat(previous||[]),max=Math.max.apply(null,all.concat([1]))*1.08;const path=a=>a.map((n,i)=>{const x=p+i*(w-p*2)/Math.max(1,a.length-1),y=h-p-(n/max)*(h-p*2);return (i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)}).join(' ');return '<div class="insight-line-wrap"><svg class="insight-line" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" role="img" aria-label="Trend chart"><defs><linearGradient id="insight-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#18a66d" stop-opacity=".18"/><stop offset="1" stop-color="#18a66d" stop-opacity="0"/></linearGradient></defs><path class="insight-gridline" d="M0 42H560M0 84H560M0 126H560"/><path class="insight-area" d="'+path(values)+' L550 146 L10 146 Z"/><path class="insight-previous-line" d="'+path(previous||[])+'"/><path class="insight-current-line" d="'+path(values)+'"/></svg><div class="insight-line-labels">'+labels.map(x=>'<span>'+x+'</span>').join('')+'</div></div>'}
function insightMetricCard(label,value,change,trend,color='#18a66d'){return '<article class="insight-summary-card"><span>'+label+'</span><strong>'+value+'</strong><small class="'+(change<0?'down':'up')+'">'+(change<0?'↓ ':'↑ ') +Math.abs(change)+'% <em>vs '+(state.compareMode==='year'?'same period last year':'previous period')+'</em></small>'+insightSpark('spark-'+label.replace(/[^a-z]/gi,'').toLowerCase(),color)+'</article>'}
function insightsPageNew(){if(state.role!=='Owner')return '<div class="insights-access card"><strong>Owner access required</strong><span>Insights and financial reporting are available to the establishment owner.</span><button class="button primary" data-insights-back>Back to Dashboard</button></div>';const range=insightRangeLabel(),metricRevenue=state.insightMetric!=='orders',sales=[8200,7600,9400,11800,10200,13600,12400],previous=[7400,7200,8600,9900,9800,11200,10800],orderSeries=[8,7,10,12,9,14,12],tabs=[['sales','Sales'],['orders','Orders'],['listings','Listings'],['guests','Guests & hotels']],all=insightsListingRows(),query=state.insightQuery.toLowerCase(),rows=all.filter(x=>x.join(' ').toLowerCase().includes(query)).sort((a,b)=>state.insightSort==='count'?b[1]-a[1]:b[3]-a[3]),totalRevenue=84260,comparison=state.compareMode==='year'?'+5.4%':'+8.1%';return '<div class="insights-page-new"><header class="insights-header-new"><button class="insights-back-new" data-insights-back aria-label="Back to Dashboard">←</button><div><h1>Insights</h1><span>Sans Rival Bakehouse · '+range+'</span></div><button class="insights-header-filter" data-header-filter aria-label="Filter insights"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 12h32M14 24h20M20 36h8"/></svg></button></header><div class="insights-tools"><span class="insights-export-label">Filtered reporting</span><div><button class="button small" data-toast="CSV export prepared for '+state.insightTab+' · '+range+' · '+(state.compareMode==='year'?'same period last year':'previous period')+'">Export CSV</button><button class="button small" data-toast="PDF export prepared for '+state.insightTab+' · '+range+' · '+(state.compareMode==='year'?'same period last year':'previous period')+'">Export PDF</button></div></div><nav class="insights-tabs" aria-label="Insights sections">'+tabs.map(x=>'<button class="'+(state.insightTab===x[0]?'active':'')+'" data-insight-tab="'+x[0]+'">'+x[1]+'</button>').join('')+'</nav><main class="insights-content"><section class="insights-tab-panel '+(state.insightTab==='sales'?'active':'')+'" data-tab-panel="sales"><div class="insights-section-title"><h2>Sales</h2><span>'+range+'</span></div><div class="insights-summary-grid">'+insightMetricCard('Gross revenue',insightMoney(84260),8.1,'')+insightMetricCard('Commission',insightMoney(8426),6.2,'','#c7e8d5')+insightMetricCard('Net earnings',insightMoney(75834),8.3,'')+insightMetricCard('Average order value',insightMoney(2006),4.2,'')+'</div><div class="insights-report-grid"><section class="insight-report-card"><div class="insight-report-head"><div><h3>Revenue over time</h3><span>'+range+' · '+(state.range==='Last 7 days'?'daily':'weekly')+'</span></div><div class="insight-toggle"><button class="'+(metricRevenue?'active':'')+'" data-insight-metric="revenue">Revenue</button><button class="'+(!metricRevenue?'active':'')+'" data-insight-metric="orders">Orders</button></div></div><div class="insight-total"><strong>'+ (metricRevenue?insightMoney(totalRevenue):42) +'</strong><span class="insight-positive">'+comparison+'</span></div>'+insightLineChart(metricRevenue?sales:orderSeries,metricRevenue?previous:[7,6,8,9,8,11,10],['Sep 24','25','26','27','28','29','30'])+'<div class="insight-legend"><span><i class="current-dot"></i>Selected period</span><span><i class="previous-dot"></i>Comparison</span></div></section><section class="insight-report-card"><div class="insight-report-head"><div><h3>Room charge vs. Gateway</h3><span>Weekly payment mix</span></div></div><div class="stacked-weeks"><div><span><i style="height:66%"></i><i style="height:34%"></i></span><small>Week 1</small></div><div><span><i style="height:58%"></i><i style="height:42%"></i></span><small>Week 2</small></div><div><span><i style="height:72%"></i><i style="height:28%"></i></span><small>Week 3</small></div><div><span><i style="height:61%"></i><i style="height:39%"></i></span><small>Week 4</small></div></div><div class="insight-legend"><span><i class="current-dot"></i>Gateway · ₱52,240.00</span><span><i class="room-dot"></i>Charge to room · ₱32,020.00</span></div></section></div><section class="insight-report-card"><div class="insight-report-head"><div><h3>Revenue by day of the week</h3><span>'+range+'</span></div></div>'+insightBars([18,14,22,28,20,30,24],['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])+'<p class="insight-takeaway">Saturdays account for 30% of revenue.</p></section></section><section class="insights-tab-panel '+(state.insightTab==='orders'?'active':'')+'" data-tab-panel="orders"><div class="insights-section-title"><h2>Orders</h2><span>'+range+'</span></div><div class="insights-summary-grid order-summary-grid"><div class="insight-summary-text"><span>Total orders</span><strong>42</strong><small>+12% vs previous period</small></div><div class="insight-summary-text"><span>Completed</span><strong>34</strong><small>80.9% of orders</small></div><div class="insight-summary-text"><span>Cancelled</span><strong>3</strong><small>7.1% of orders</small></div><div class="insight-summary-text"><span>No-shows</span><strong>1</strong><small>2.4% of bookings</small></div></div><div class="insights-report-grid"><section class="insight-report-card"><div class="insight-report-head"><div><h3>Orders over time</h3><span>'+range+'</span></div></div>'+insightBars(orderSeries,['Sep 24','25','26','27','28','29','30'])+'</section><section class="insight-report-card"><div class="insight-report-head"><div><h3>Order type split</h3><span>All order records</span></div></div><div class="split-list"><div><span>Bookings</span><strong>18 · 43%</strong><i style="width:43%"></i></div><div><span>In-app orders</span><strong>19 · 45%</strong><i style="width:45%"></i></div><div><span>Counter charges</span><strong>5 · 12%</strong><i style="width:12%"></i></div></div></section></div><div class="insights-report-grid"><section class="insight-report-card"><div class="insight-report-head"><div><h3>Busiest hours</h3><span>Orders by hour</span></div></div>'+insightBars([4,8,12,9,6,3],['8 AM','10 AM','12 PM','2 PM','4 PM','6 PM'])+'</section><section class="insight-report-card"><div class="insight-report-head"><div><h3>Cancellation and no-show rate</h3><span>Selected period</span></div></div>'+insightLineChart([3,5,4,8,7,9,7],[1,2,2,3,3,4,3],['24','25','26','27','28','29','30'])+'<div class="reason-list"><strong>Leading cancellation reasons</strong><span>Guest changed plans · 2</span><span>Capacity unavailable · 1</span></div></section></div></section><section class="insights-tab-panel '+(state.insightTab==='listings'?'active':'')+'" data-tab-panel="listings"><div class="insights-section-title"><h2>Listings</h2><span>'+range+'</span></div><section class="insight-report-card"><div class="insight-report-head"><div><h3>Top listings</h3><span>All listings · sortable</span></div><div class="insight-sort"><button class="'+(state.insightSort==='revenue'?'active':'')+'" data-insight-sort="revenue">Revenue</button><button class="'+(state.insightSort==='count'?'active':'')+'" data-insight-sort="count">Orders</button></div></div><label class="insight-search">⌕<input data-insight-search value="'+esc(state.insightQuery)+'" placeholder="Search listings"></label><div class="insights-table-scroll"><table class="insights-table"><thead><tr><th>Rank</th><th>Listing</th><th>Orders</th><th>Revenue</th><th>% of total</th></tr></thead><tbody>'+(rows.length?rows.map((x,i)=>'<tr><td>'+ (i+1) +'</td><td><strong>'+x[0]+'</strong></td><td>'+x[1]+'</td><td>'+insightMoney(x[3])+'</td><td>'+Math.round(x[3]/totalRevenue*100)+'%</td></tr>').join(''):'<tr><td colspan="5">No listings match your search.</td></tr>')+'</tbody></table></div></section><section class="insight-report-card low-performers"><div class="insight-report-head"><div><h3>Low performers</h3><span>Active listings with few or no orders</span></div></div><p>Cold Brew Bottle has 4 orders in this period. Review its photos or pricing to improve visibility.</p></section></section><section class="insights-tab-panel '+(state.insightTab==='guests'?'active':'')+'" data-tab-panel="guests"><div class="insights-section-title"><h2>Guests &amp; hotels</h2><span>'+range+'</span></div><div class="insights-report-grid"><section class="insight-report-card"><div class="insight-report-head"><div><h3>Orders by partner hotel</h3><span>Volume and revenue</span></div></div><div class="hotel-bars"><div><span>Henry’s Resort Dumaguete</span><i style="width:82%"></i><strong>42 orders · ₱84,260.00</strong></div><div><span>Harborview Hotel</span><i style="width:38%"></i><strong>18 orders · ₱31,420.00</strong></div></div></section><section class="insight-report-card"><div class="insight-report-head"><div><h3>Pre-arrival vs. In-stay orders</h3><span>Guest timing</span></div></div><div class="prestay-bar"><span style="width:18%"></span><span style="width:82%"></span></div><div class="split-legend"><span>Pre-arrival <strong>8 · 18%</strong></span><span>In-stay <strong>34 · 82%</strong></span></div><div class="repeat-guest"><span>Repeat guests</span><strong>12 · 29%</strong></div></section></div><section class="insight-report-card"><div class="insight-report-head"><div><h3>Guest ratings</h3><span>Reviews have not launched yet</span></div></div><div class="insight-empty-state">Guest ratings will appear after reviews launch.</div></section></section></main></div>'}
function insightsPageListingsFocus(){if(state.role!=='Owner')return '<div class="insights-access card"><strong>Owner access required</strong><span>Insights and financial reporting are available to the establishment owner.</span><button class="button primary" data-insights-back>Back to Dashboard</button></div>';const rows=insightsListingRows(),query=state.insightQuery.trim().toLowerCase(),hasOrders=rows.some(x=>x[1]>0),filtered=rows.filter(x=>(!state.listingsZeroOnly||x[1]===0)&&x.join(' ').toLowerCase().includes(query)).sort((a,b)=>state.insightSort==='count'?b[1]-a[1]:b[3]-a[3]),sortLabel=state.insightSort==='count'?'Orders':'Revenue',range=insightRangeLabel(),renderRow=x=>'<article class="insights-listing-card"><h3>'+esc(x[0])+'</h3><div class="insights-listing-metrics"><div><span>Orders</span><strong>'+x[1]+'</strong></div>'+(state.role==='Owner'?'<div><span>Revenue</span><strong>'+insightMoney(x[3])+'</strong></div>':'')+'</div></article>',empty=query?'<div class="insights-listing-empty">No listings match your search</div>':'',noOrdersNote=!hasOrders?'<div class="insights-listing-empty">No orders in this period</div>':'';return '<div class="insights-listings-focus"><header class="insights-focus-header"><button class="insights-back-new" data-insights-back aria-label="Back to Dashboard">←</button><div class="insights-focus-title"><h1>Insights</h1><span>Sans Rival Bakehouse · '+range+'</span></div><div class="insights-focus-actions"><button class="insights-export-icon" data-listings-export-toggle aria-label="Export listings"><i class="hgi-stroke hgi-download-04" aria-hidden="true"></i></button><button class="insights-header-filter" data-header-filter aria-label="Filter insights"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 12h32M14 24h20M20 36h8"/></svg></button>'+(state.listingsExportOpen?'<div class="insights-export-menu"><button data-toast="CSV export prepared for listings · '+range+'">CSV</button><button data-toast="PDF export prepared for listings · '+range+'">PDF</button></div>':'')+'</div></header><nav class="insights-tabs" aria-label="Insights sections"><button class="'+(state.insightTab==='sales'?'active':'')+'" data-insight-tab="sales">Sales</button><button class="'+(state.insightTab==='orders'?'active':'')+'" data-insight-tab="orders">Orders</button><button class="active" data-insight-tab="listings">Listings</button></nav><main class="insights-focus-content"><div class="insights-listing-heading"><h2>Listing performance</h2><span>'+rows.length+' listings</span></div><label class="insights-listing-search"><i class="hgi-stroke hgi-search-01" aria-hidden="true"></i><input data-insight-search value="'+esc(state.insightQuery)+'" placeholder="Search listings" aria-label="Search listings"></label><div class="insights-listing-controls"><div class="insights-listing-sort-wrap"><button class="insights-listing-sort" data-listing-sort-toggle>Sort by: '+sortLabel+' <span>⌄</span></button>'+(state.listingSortOpen?'<div class="insights-listing-sort-menu"><button data-listing-sort-option="count" class="'+(state.insightSort==='count'?'active':'')+'">Orders</button><button data-listing-sort-option="revenue" class="'+(state.insightSort==='revenue'?'active':'')+'">Revenue</button></div>':'')+'</div>'+(rows.some(x=>x[1]===0)?'<div class="insights-listing-filter-group" role="group" aria-label="Listing filter"><button class="'+(!state.listingsZeroOnly?'active':'')+'" data-listing-filter="all" aria-pressed="'+(!state.listingsZeroOnly)+'">All listings</button><button class="'+(state.listingsZeroOnly?'active':'')+'" data-listing-filter="zero" aria-pressed="'+state.listingsZeroOnly+'">No orders</button></div>':'')+'</div><div class="insights-listing-cards">'+noOrdersNote+(filtered.length?filtered.map(renderRow).join(''):empty)+'</div></main></div>'}
function dashboardTopListings(){const ranges={Today:[['Whole Sans Rival Cake','8 orders'],['Island Breakfast Box','5 orders'],['Cold Brew Bottle','3 orders'],['Celebration Cake Slice','2 orders'],['Pandan Latte','1 order'],['Seasonal tart','0 orders']],Yesterday:[['Whole Sans Rival Cake','7 orders'],['Island Breakfast Box','5 orders'],['Cold Brew Bottle','3 orders'],['Celebration Cake Slice','2 orders'],['Pandan Latte','1 order'],['Seasonal tart','0 orders']],'Last week':[['Whole Sans Rival Cake','42 orders'],['Island Breakfast Box','28 orders'],['Cold Brew Bottle','18 orders'],['Celebration Cake Slice','14 orders'],['Pandan Latte','11 orders'],['Seasonal tart','0 orders']],'This month':[['Whole Sans Rival Cake','48 orders'],['Island Breakfast Box','32 orders'],['Cold Brew Bottle','22 orders'],['Celebration Cake Slice','16 orders'],['Pandan Latte','12 orders'],['Seasonal tart','0 orders']],'Custom range':[['Whole Sans Rival Cake','42 orders'],['Island Breakfast Box','28 orders'],['Cold Brew Bottle','18 orders'],['Celebration Cake Slice','14 orders'],['Pandan Latte','11 orders'],['Seasonal tart','0 orders']]};return ranges[state.range]||ranges['Custom range']}
function insightsListingRows(){const revenue={Today:[9600,3400,660,440,220,0],Yesterday:[8400,3400,660,440,220,0],'Last week':[50400,19040,3960,2800,2420,0],'This month':[57600,21760,4840,3200,2640,0], 'Custom range':[50400,19040,3960,2800,2420,0]};return dashboardTopListings().map((x,i)=>[x[0],parseInt(x[1],10),parseInt(x[1],10)+(i<2?i+1:0),(revenue[state.range]||revenue['Custom range'])[i]])}
function dashboard18(){let html=dashboard16(),today=state.range==='Today',owner=state.role==='Owner',period={title:'Today',sub:'orders by hour',compare:'vs yesterday',change:'+12%',values:[2,3,5,8,6,4],labels:['10 AM','12 PM','2 PM','4 PM','6 PM','8 PM'],takeaway:'Busiest time: 4–5 PM.'};if(state.range==='Yesterday')period={title:'Yesterday',sub:'orders by hour',compare:'vs previous day',change:'+6%',values:[1,2,4,5,3,2],labels:['10 AM','12 PM','2 PM','4 PM','6 PM','8 PM'],takeaway:'Busiest time: 4–5 PM.'};if(state.range==='Last week')period={title:'Last week',sub:'orders by day',compare:'vs previous week',change:'+9%',values:[5,7,4,8,10,6,8],labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],takeaway:'Busiest day: Saturday.'};if(state.range==='This month')period={title:'This month',sub:'orders by day',compare:'vs previous month',change:'+14%',values:[12,16,10,18,22,15,19],labels:['Sep 1','5','10','15','20','25','30'],takeaway:'Busiest day: Sep 20.'};if(state.range==='Custom range')period={title:'Custom range',sub:'orders by day',compare:'vs previous period',change:'+8%',values:[4,6,5,8,7,10,8],labels:['Day 1','2','3','4','5','6','7'],takeaway:'Busiest day: Day 6.'};const ordersValue=today?'18':state.range==='Yesterday'?'15':state.range==='This month'?'124':state.range==='Last week'?'48':'42',revenueValue=today?'₱6,420':state.range==='Yesterday'?'₱5,880':state.range==='This month'?'₱124,860':'₱84,260',rangeLabel=period.title==='Today'?'Today · Sep 30':period.title+' · selected period',tab=state.performanceTab==='top'?'top':'activity',fullTopCounts=dashboardTopListings(),topCounts=fullTopCounts.slice(0,3),activityContent='<div class="performance-card-heading"><div><h3>Order activity</h3><span>'+period.title+' · '+period.sub+'</span></div></div>'+dashboardPerformanceChart(period.values,period.labels,period.takeaway),topContent='<div class="polished-card-header"><div><h2>Top listings</h2></div>'+(fullTopCounts.length>3?'<button class="button ghost" data-view-all-listings>View all listings '+icons.arrow+'</button>':'')+'</div><div class="performance-listing-list">'+topCounts.map(x=>'<div class="performance-listing-row"><strong>'+x[0]+'</strong><span>'+x[1]+'</span></div>').join('')+'</div>';const performance='<section class="dashboard-performance"><div class="performance-heading"><h2>Performance</h2>'+(owner?'<button class="performance-insights" data-insights>View insights '+icons.arrow+'</button>':'')+'</div><div class="performance-kpis '+(owner?'owner':'staff')+'"><article class="performance-kpi"><span>Orders</span><strong>'+ordersValue+'</strong><small>↑ '+period.change+' <em>'+period.compare+'</em></small></article>'+(owner?'<article class="performance-kpi"><span>Revenue</span><strong>'+revenueValue+'</strong><small>↑ +8.1% <em>'+period.compare+'</em></small></article>':'')+'</div><div class="performance-tabs" role="tablist"><button class="'+(tab==='activity'?'active':'')+'" data-performance-tab="activity">Order activity</button><button class="'+(tab==='top'?'active':'')+'" data-performance-tab="top">Top listings</button></div><section class="performance-tab-card card" data-performance-panel>'+(tab==='top'?topContent:activityContent)+'</section></section>';return html.replace(/<section class="dashboard-performance">[\s\S]*?(?=<section class="dashboard-section card schedule-section)/,performance)}
function dashboardActivityPeriod(){if(state.range==='Today')return {title:'Today',sub:'Orders by hour',values:[0,1,2,3,7,5],labels:['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM'],intervals:['8–9 AM','9–10 AM','10–11 AM','11 AM–12 PM','12–1 PM','1–2 PM'],highlight:4,takeaway:'Busiest time: 12–1 PM · 7 orders'};if(state.range==='Yesterday')return {title:'Yesterday',sub:'Orders by hour',values:[1,2,4,5,3,2],labels:['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM'],intervals:['8–9 AM','9–10 AM','10–11 AM','11 AM–12 PM','12–1 PM','1–2 PM'],highlight:3,takeaway:'Busiest time: 11 AM–12 PM · 5 orders'};if(state.range==='Last week')return {title:'Last week',sub:'Orders by day',values:[5,7,4,8,10,6,8],labels:['Sep 24','25','26','27','28','29','30'],intervals:['Sep 24','Sep 25','Sep 26','Sep 27','Sep 28','Sep 29','Sep 30'],highlight:4,takeaway:'Busiest day: Sep 28 · 10 orders'};if(state.range==='This month')return {title:'This month',sub:'Orders by day',values:[12,16,10,18,22,15,19],labels:['Sep 1','5','10','15','20','25','30'],intervals:['Sep 1','Sep 5','Sep 10','Sep 15','Sep 20','Sep 25','Sep 30'],highlight:4,takeaway:'Busiest day: Sep 20 · 22 orders'};return {title:'Custom range',sub:'Orders by day',values:[4,6,5,8,7,10,8],labels:['Day 1','2','3','4','5','6','7'],intervals:['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'],highlight:5,takeaway:'Busiest day: Day 6 · 10 orders'}}
function dashboardPerformanceChart(values,labels,takeaway,intervals=labels,highlightIndex=-1){const maxValue=Math.max(...values,1),scale=Math.max(20,Math.ceil(maxValue/20)*20),ticks=[];for(let n=scale;n>=0;n-=20)ticks.push(n);const highlight=highlightIndex<0?values.indexOf(Math.max(...values)):highlightIndex,minWidth=Math.max(360,values.length*56);return '<div class="performance-activity-chart" role="img" aria-label="Orders for selected period"><div class="performance-chart-frame"><div class="performance-y-axis">'+ticks.map(n=>'<span>'+n+'</span>').join('')+'</div><div class="performance-chart-scroll"><div class="performance-chart-plot" style="min-width:'+minWidth+'px"><div class="performance-gridlines">'+ticks.map(()=>'<i></i>').join('')+'</div><div class="performance-bars">'+values.map((n,i)=>'<button class="performance-bar '+(i===highlight?'selected ':'')+(n===0?'zero':'')+'" style="height:'+(n===0?0:Math.round(n/scale*100))+'%" title="'+intervals[i]+' · '+n+' '+(n===1?'order':'orders')+'" aria-label="'+intervals[i]+' · '+n+' '+(n===1?'order':'orders')+'"></button>').join('')+'</div></div><div class="performance-x-axis" style="min-width:'+minWidth+'px">'+labels.map(label=>'<span>'+label+'</span>').join('')+'</div></div></div><div class="performance-chart-legend"><span><i class="regular"></i>Orders</span><span><i class="busy"></i>Busiest interval</span></div></div><p class="performance-takeaway">'+takeaway+'</p>'}
function dashboardActivityPeriod(){if(state.range==='Today')return {title:'Today',sub:'Orders by hour',values:[24,32,44,56,76,64,52,46,40,36,32,28,26,24,22],labels:['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM'],intervals:['8–9 AM','9–10 AM','10–11 AM','11 AM–12 PM','12–1 PM','1–2 PM','2–3 PM','3–4 PM','4–5 PM','5–6 PM','6–7 PM','7–8 PM','8–9 PM','9–10 PM','10 PM–close'],highlight:4,takeaway:'Busiest time: 12–1 PM'};if(state.range==='Yesterday')return {title:'Yesterday',sub:'Orders by hour',values:[22,28,36,48,42,34,30,28,26,24,22,21,20,20,20],labels:['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM'],intervals:['8–9 AM','9–10 AM','10–11 AM','11 AM–12 PM','12–1 PM','1–2 PM','2–3 PM','3–4 PM','4–5 PM','5–6 PM','6–7 PM','7–8 PM','8–9 PM','9–10 PM','10 PM–close'],highlight:3,takeaway:'Busiest time: 11 AM–12 PM'};if(state.range==='Last week')return {title:'Last week',sub:'Orders by day',values:[42,56,48,72,86,64,78],labels:['Sep 24','25','26','27','28','29','30'],intervals:['Sep 24','Sep 25','Sep 26','Sep 27','Sep 28','Sep 29','Sep 30'],highlight:4,takeaway:'Busiest day: Sep 28'};if(state.range==='This month')return {title:'This month',sub:'Orders by day',values:[34,52,68,74,96,82,108],labels:['Sep 1','5','10','15','20','25','30'],intervals:['Sep 1','Sep 5','Sep 10','Sep 15','Sep 20','Sep 25','Sep 30'],highlight:6,takeaway:'Busiest day: Sep 20'};return {title:'Custom range',sub:'Orders by day',values:[28,44,59,71,88,76,92],labels:['Day 1','2','3','4','5','6','7'],intervals:['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'],highlight:5,takeaway:'Busiest day: Day 6'}}
function dashboard18Final(){let html=dashboard18();if(state.performanceTab==='top')return html;const period=dashboardActivityPeriod(),activity='<div class="performance-card-heading"><div><h3>Order activity</h3><span>'+period.title+' · '+period.sub+'</span></div></div>'+dashboardPerformanceChart(period.values,period.labels,period.takeaway,period.intervals,period.highlight),panel='<section class="performance-tab-card card" data-performance-panel>'+activity+'</section>';return html.replace(/<section class="performance-tab-card card" data-performance-panel>[\s\S]*?<\/section>/,panel)}
function dashboard17(){return dashboard18Final()}

/* Dashboard action state: make unresolved work distinct while preserving filtered Orders links. */
function dashboard18Final(){
  let html=dashboard18();
  const owner=state.role==='Owner';
  const actionItems=[
    {count:2,label:'orders to confirm',icon:'clipboard-02',filter:'Pending'},
    {count:1,label:'ready for pickup',icon:'package-delivered',filter:'Ready'}
  ].filter(item=>item.count>0);
  const actionCard=actionItems.length
    ? '<section class="dashboard-section needs-action card"><div class="section-heading"><div><h2>Action required</h2></div></div><div class="action-count-grid">'+actionItems.map(item=>'<button class="needs-action-row" data-page="orders" data-order-filter-link="'+item.filter+'"><span class="needs-action-icon"><i class="hgi-stroke hgi-'+item.icon+'" aria-hidden="true"></i></span><span class="needs-action-label"><strong>'+item.count+'</strong> '+item.label+'</span><span class="needs-action-chevron" aria-hidden="true">›</span></button>').join('')+'</div></section>'
    : '<section class="dashboard-section needs-action card needs-action-empty"><div class="section-heading"><div><h2>Action required</h2></div></div><p>You’re all caught up.</p></section>';
  html=html.replace(/<section class="dashboard-section needs-action card">[\s\S]*?<\/section>/,actionCard);
  const currentPerformance=html.match(/<section class="dashboard-performance">[\s\S]*?(?=<section class="dashboard-section card schedule-section)/)?.[0]||'';
  if(currentPerformance){
    const rangeSummary=state.range==='Today'?todayLabel():state.range==='Yesterday'?'Wednesday, September 30, 2026':state.range==='This month'?'September 1–30, 2026':state.range==='Last week'?'September 24–30, 2026':state.customFrom&&state.customTo?state.customFrom+' – '+state.customTo:'Custom range';
    const heading='<div class="performance-heading"><div><h2>Performance</h2><span class="performance-range">'+rangeSummary+'</span></div><button class="performance-date-filter" data-header-filter aria-label="Change Dashboard date range"><span>'+state.range+'</span><i class="hgi-stroke hgi-calendar-03" aria-hidden="true"></i></button></div>';
    html=html.replace(currentPerformance,currentPerformance.replace(/<div class="performance-heading">[\s\S]*?<\/div><div class="performance-kpis/,heading+'<div class="performance-kpis'));
  }
  const scheduleCard='<section class="dashboard-section card schedule-section polished-schedule"><div class="polished-card-header"><div><h2>Schedule</h2><span>Today · Sep 30</span></div><button class="button ghost" data-page="orders">View orders '+icons.arrow+'</button></div><div class="polished-schedule-list"><button class="polished-schedule-row" data-detail="ORD-1042"><span class="polished-time">3:00 PM</span><span class="polished-schedule-details"><strong>Whole Sans Rival Cake</strong><small>John D. · Room 101 · Qty 1</small><em class="confirmed">Confirmed</em></span><span class="polished-chevron">›</span></button><button class="polished-schedule-row" data-detail="CB-8821"><span class="polished-time">5:30 PM</span><span class="polished-schedule-details"><strong>Private bakery tasting</strong><small>Amelia Reyes · Room 508 · 2 guests</small><em class="pending">Pending</em></span><span class="polished-chevron">›</span></button></div></section>';
  const earningsCard=owner?'<section class="dashboard-section card earnings-section polished-earnings"><div class="polished-card-header"><h2>Earnings</h2><button class="button ghost" data-page="earnings">View earnings '+icons.arrow+'</button></div><div class="earnings-primary"><span>Next payout</span><strong>₱42,180.00</strong><small>Expected Oct 2</small></div><div class="earnings-pending"><span>Room charges pending checkout</span><strong>₱26,840.00</strong></div></section>':'';
  return html.replace(/<section class="dashboard-section card schedule-section">[\s\S]*?<\/section>/,scheduleCard).replace(/<section class="dashboard-section card money-section">[\s\S]*?<\/section>/,earningsCard);
}

/* Current Dashboard refinement: keep the historical filter with Performance,
   while operational Schedule and owner-only Earnings remain independent. */
function dashboard18Final(){
  let html=dashboard18();
  const owner=state.role==='Owner';
  const rangeSummary=state.range==='Today'?todayLabel():state.range==='Yesterday'?'Wednesday, September 30, 2026':state.range==='This month'?'September 1–30, 2026':state.range==='Last week'?'September 24–30, 2026':state.customFrom&&state.customTo?state.customFrom+' – '+state.customTo:'Custom range';
  const currentPerformance=html.match(/<section class="dashboard-performance">[\s\S]*?(?=<section class="dashboard-section card schedule-section)/)?.[0]||'';
  if(currentPerformance){
    const heading='<div class="performance-heading"><div><h2>Performance</h2><span class="performance-range">'+rangeSummary+'</span></div><button class="performance-date-filter" data-header-filter aria-label="Change Dashboard date range"><span>'+state.range+'</span><i class="hgi-stroke hgi-calendar-03" aria-hidden="true"></i></button></div>';
    let revised=currentPerformance.replace(/<div class="performance-heading">[\s\S]*?<\/div><div class="performance-kpis/,heading+'<div class="performance-kpis');
    html=html.replace(currentPerformance,revised);
  }
  const scheduleCard='<section class="dashboard-section card schedule-section polished-schedule"><div class="polished-card-header"><div><h2>Schedule</h2><span>Today · Sep 30</span></div><button class="button ghost" data-page="orders">View orders '+icons.arrow+'</button></div><div class="polished-schedule-list"><button class="polished-schedule-row" data-detail="ORD-1042"><span class="polished-time">3:00 PM</span><span class="polished-schedule-details"><strong>Whole Sans Rival Cake</strong><small>John D. · Room 101 · Qty 1</small><em class="confirmed">Confirmed</em></span><span class="polished-chevron">›</span></button><button class="polished-schedule-row" data-detail="CB-8821"><span class="polished-time">5:30 PM</span><span class="polished-schedule-details"><strong>Private bakery tasting</strong><small>Amelia Reyes · Room 508 · 2 guests</small><em class="pending">Pending</em></span><span class="polished-chevron">›</span></button></div></section>';
  const earningsCard=owner?'<section class="dashboard-section card earnings-section polished-earnings"><div class="polished-card-header"><h2>Earnings</h2><button class="button ghost" data-page="earnings">View earnings '+icons.arrow+'</button></div><div class="earnings-primary"><span>Next payout</span><strong>₱42,180.00</strong><small>Expected Oct 2</small></div><div class="earnings-pending"><span>Room charges pending checkout</span><strong>₱26,840.00</strong></div></section>':'';
  html=html.replace(/<section class="dashboard-section card schedule-section">[\s\S]*?<\/section>/,scheduleCard).replace(/<section class="dashboard-section card money-section">[\s\S]*?<\/section>/,earningsCard);
  return html;
}
function insightRangeLabel(){return state.range==='Today'?'Sep 30, 2026':state.range==='Yesterday'?'Sep 29, 2026':state.range==='Last week'?'Sep 24–30, 2026':state.range==='Last 7 days'?'Sep 24–30, 2026':state.range==='Last 30 days'?'Sep 1–30, 2026':state.range==='This month'?'Sep 1–30, 2026':state.range==='Last month'?'Aug 1–31, 2026':state.range==='Custom range'?(state.customFrom&&state.customTo?state.customFrom+' – '+state.customTo:'Custom range'):'Sep 24–30, 2026'}
function staffListingsView(){const rows=dashboardTopListings();return '<div class="staff-listings-page"><header class="staff-listings-head"><button class="staff-listings-back" data-staff-listings-back aria-label="Back to Dashboard">←</button><div><h1>Top listings</h1></div></header><section class="staff-listings-card card"><div class="staff-listings-card-head"><h2>All listings</h2><span>Distinct orders in selected period</span></div><div class="staff-listing-full-list">'+rows.map(x=>'<div class="staff-listing-full-row"><strong>'+x[0]+'</strong><span>'+x[1]+'</span></div>').join('')+'</div></section></div>'}
function bindDashboardListings(){document.querySelectorAll('[data-view-all-listings]').forEach(b=>b.onclick=()=>{const page=document.querySelector('.page');state.dashboardScroll=page?page.scrollTop:0;state.filterSheet=false;state.insightSort='count';state.listingsZeroOnly=false;state.listingSortOpen=false;if(state.role==='Owner'){state.page='insights';state.insightTab='listings'}else state.page='staff-listings';render()});document.querySelectorAll('[data-staff-listings-back]').forEach(b=>b.onclick=()=>{state.page='dashboard';state.performanceTab='top';state.filterSheet=false;render();setTimeout(()=>{const page=document.querySelector('.page');if(page)page.scrollTop=state.dashboardScroll},0)});document.querySelectorAll('[data-insights-back]').forEach(b=>b.onclick=()=>{state.page='dashboard';state.performanceTab='top';state.filterSheet=false;render();setTimeout(()=>{const page=document.querySelector('.page');if(page)page.scrollTop=state.dashboardScroll},0)})}
function bindListingsFocus(){document.querySelectorAll('[data-listings-export-toggle]').forEach(b=>b.onclick=()=>{state.listingsExportOpen=!state.listingsExportOpen;render()});document.querySelectorAll('[data-listing-sort-toggle]').forEach(b=>b.onclick=()=>{state.listingSortOpen=!state.listingSortOpen;render()});document.querySelectorAll('[data-listing-sort-option]').forEach(b=>b.onclick=()=>{state.insightSort=b.dataset.listingSortOption;state.listingSortOpen=false;render()});document.querySelectorAll('[data-listing-filter]').forEach(b=>b.onclick=()=>{state.listingsZeroOnly=b.dataset.listingFilter==='zero';render()})}
function salesPeriodData(){
  const range=state.range;
  if(range==='Today')return {title:'Today',group:'hourly',subtitle:'Today · hourly',compare:'vs yesterday',change:'+12%',orders:18,gross:6420,labels:['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM'],values:[0,540,720,1080,2460,1620],previous:[0,420,600,900,1980,1200],intervals:['8–9 AM','9–10 AM','10–11 AM','11 AM–12 PM','12–1 PM','1–2 PM'],payment:[3980,2440],takeaway:'Busiest time: 12–1 PM · 7 orders'};
  if(range==='Yesterday')return {title:'Yesterday',group:'hourly',subtitle:'Yesterday · hourly',compare:'vs previous day',change:'+6%',orders:15,gross:5880,labels:['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM'],values:[180,420,780,1200,1440,1860],previous:[160,360,620,980,1220,1510],intervals:['8–9 AM','9–10 AM','10–11 AM','11 AM–12 PM','12–1 PM','1–2 PM'],payment:[3646,2234],takeaway:'Busiest time: 1–2 PM · 4 orders'};
  if(range==='Last week')return {title:'Last week',group:'daily',subtitle:'Sep 24–30 · daily',compare:'vs previous week',change:'+9%',orders:48,gross:84260,labels:['Sep 24','25','26','27','28','29','30'],values:[8200,7600,9400,11800,10200,23460,13600],previous:[7400,7200,8600,9900,9800,18400,11200],payment:[52240,32020],takeaway:'Highest revenue day: Sep 29 · ₱23,460.00'};
  if(range==='Last 7 days')return {title:'Last 7 days',group:'daily',subtitle:'Sep 24–30 · daily',compare:'vs previous 7 days',change:'+9%',orders:48,gross:84260,labels:['Sep 24','25','26','27','28','29','30'],values:[8200,7600,9400,11800,10200,23460,13600],previous:[7400,7200,8600,9900,9800,18400,11200],payment:[52240,32020],takeaway:'Highest revenue day: Sep 29 · ₱23,460.00'};
  if(range==='This month')return {title:'This month',group:'daily',subtitle:'Sep 1–30 · daily',compare:'vs previous month',change:'+14%',orders:124,gross:248600,labels:['Sep 1','5','10','15','20','25','30'],values:[24800,30200,32600,35400,40200,38200,47200],previous:[22000,27800,30000,32200,35000,33600,41000],payment:[154132,94468],takeaway:'Highest revenue day: Sep 30 · ₱47,200.00'};
  if(range==='Last 30 days')return {title:'Last 30 days',group:'daily',subtitle:'Sep 1–30 · daily',compare:'vs previous 30 days',change:'+11%',orders:124,gross:248600,labels:['Sep 1','5','10','15','20','25','30'],values:[24800,30200,32600,35400,40200,38200,47200],previous:[22400,26800,29800,31600,34400,32800,42000],payment:[154132,94468],takeaway:'Highest revenue day: Sep 30 · ₱47,200.00'};
  return {title:'Custom range',group:'daily',subtitle:'Selected range · daily',compare:'vs previous period',change:'+8%',orders:42,gross:84260,labels:['Day 1','2','3','4','5','6','7'],values:[8200,7600,9400,11800,10200,13600,23460],previous:[7400,7200,8600,9900,9800,11200,18400],payment:[52240,32020],takeaway:'Highest revenue day: Day 7 · ₱23,460.00'};
}
function salesMetricCard(label,value,change,compare,neutral=false){return '<article class="sales-summary-card"><span>'+label+'</span><strong>'+value+'</strong><small class="'+(neutral?'neutral':'positive')+'">'+(neutral?'':'↑ ')+change+' <em>'+compare+'</em></small></article>'}
function salesTrendMarkup(period){if(period.group==='hourly')return '<div class="sales-trend-hourly"><div class="sales-axis-labels"><span>8</span><span>6</span><span>4</span><span>2</span><span>0</span></div>'+insightBars(period.values,period.labels)+'</div>';return '<div class="sales-trend-line"><div class="sales-axis-labels"><span>₱'+Math.round(Math.max(...period.values)/1000)+'k</span><span>₱'+Math.round(Math.max(...period.values)*.67/1000)+'k</span><span>₱0</span></div>'+insightLineChart(period.values,period.previous,period.labels)+'</div>'}
function salesPaymentMarkup(period){const total=period.gross,gateway=period.payment[0],room=period.payment[1],gatewayPct=Math.round(gateway/total*100),roomPct=100-gatewayPct;if(period.group==='hourly')return '<div class="payment-single-bar"><span style="width:'+gatewayPct+'%"></span><span style="width:'+roomPct+'%"></span></div><div class="payment-single-labels"><span>Gateway · '+insightMoney(gateway)+' ('+gatewayPct+'%)</span><span>Charge to room · '+insightMoney(room)+' ('+roomPct+'%)</span></div>';const portions=[.24,.22,.29,.25],labels=period.labels.slice(0,4).map((x,i)=>period.group==='daily'?(i===0?'Sep 1':i===1?'Sep 8':i===2?'Sep 15':'Sep 22'):'Week '+(i+1));return '<div class="payment-week-bars">'+portions.map((portion,i)=>'<div><span><i style="height:'+(Math.round((roomPct/100)*100))+'%"></i><i style="height:'+(Math.round((gatewayPct/100)*100))+'%"></i></span><small>'+labels[i]+'</small></div>').join('')+'</div><div class="payment-summary"><span>Gateway · '+insightMoney(gateway)+' ('+gatewayPct+'%)</span><span>Charge to room · '+insightMoney(room)+' ('+roomPct+'%)</span></div>'}
function salesWeekdayMarkup(period){if(period.group==='hourly')return '';const values=[18,14,22,28,20,30,24],labels=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],max=Math.max(...values),day=labels[values.indexOf(max)];return '<section class="insight-report-card sales-weekday-card"><div class="insight-report-head"><div><h3>Average revenue by day of the week</h3><span>'+insightRangeLabel()+'</span></div></div>'+insightBars(values,labels)+'<p class="insight-takeaway">'+day+' has the highest average revenue.</p></section>'}
function salesInsightsPanel(){const p=salesPeriodData(),commission=Math.round(p.gross*.1),net=p.gross-commission,aov=p.orders?Math.round(p.gross/p.orders):0,periodText=state.range==='Today'?'Today · Sep 30, 2026':insightRangeLabel();return '<section class="insights-tab-panel active" data-tab-panel="sales"><div class="insights-reporting-period">'+periodText+'</div><div class="insights-summary-grid sales-summary-grid">'+salesMetricCard('Gross revenue',insightMoney(p.gross),p.change,p.compare)+salesMetricCard('Net earnings',insightMoney(net),p.change,p.compare)+salesMetricCard('Commission',insightMoney(commission),'—',p.compare,true)+salesMetricCard('Average order value',aov?insightMoney(aov):'—',aov?p.change:'No comparison data',aov?p.compare:'',false)+'</div><div class="insight-report-card sales-trend-card"><div class="insight-report-head"><div><h3>Revenue over time</h3><span>'+p.subtitle+'</span></div></div><div class="insight-total"><strong>'+insightMoney(p.gross)+'</strong><span class="insight-positive">'+p.change+'</span></div>'+salesTrendMarkup(p)+'<div class="insight-legend"><span><i class="current-dot"></i>Selected period</span><span><i class="previous-dot"></i>Previous period</span></div></div><div class="insight-report-card payment-methods-card"><div class="insight-report-head"><div><h3>Payment methods</h3><span>'+p.subtitle+'</span></div></div>'+salesPaymentMarkup(p)+'<div class="insight-legend"><span><i class="current-dot"></i>Gateway</span><span><i class="room-dot"></i>Charge to room</span></div></div>'+salesWeekdayMarkup(p)+'</section>'}
function addInsightsExport(html,range){const menu=state.listingsExportOpen?'<div class="insights-export-menu"><button data-toast="CSV export prepared for sales · '+range+'">CSV</button><button data-toast="PDF export prepared for sales · '+range+'">PDF</button></div>':'';const icon='<button class="insights-export-icon" data-listings-export-toggle aria-label="Export insights"><i class="hgi-stroke hgi-download-04" aria-hidden="true"></i></button>';return html.replace(/<div class="insights-tools">[\s\S]*?<\/div>\s*<nav class="insights-tabs"/,'<nav class="insights-tabs"').replace('<button class="insights-header-filter"',icon+menu+'<button class="insights-header-filter"')}
function insightsPageForView(){let html=state.insightTab==='listings'?insightsPageListingsFocus():insightsPageNew();html=html.replace(/<button class="[^"]*" data-insight-tab="guests">Guests (?:&amp;|&) hotels<\/button>/,'').replace(/<span>Sans Rival Bakehouse · [^<]*<\/span>/g,'');if(state.insightTab==='sales'){const start=html.indexOf('<section class="insights-tab-panel active" data-tab-panel="sales">'),next=html.indexOf('<section class="insights-tab-panel ',start+10);if(start>=0&&next>start)html=html.slice(0,start)+salesInsightsPanel()+html.slice(next);html=addInsightsExport(html,insightRangeLabel())}else if(state.insightTab==='listings'){const range=insightRangeLabel();const tools='<div class="insights-tools"><span class="insights-export-label">Filtered reporting</span><div><button class="button small" data-toast="CSV export prepared for listings · '+range+' · '+(state.compareMode==='year'?'same period last year':'previous period')+'">Export CSV</button><button class="button small" data-toast="PDF export prepared for listings · '+range+' · '+(state.compareMode==='year'?'same period last year':'previous period')+'">Export PDF</button></div></div>';html=html.replace(/<button class="insights-export-icon"[\s\S]*?<\/button>/,'').replace('</header><nav class="insights-tabs"','</header>'+tools+'<nav class="insights-tabs"')}return html}
function menuRow(label,icon,attrs=''){return `<button class="menu-row" ${attrs}><span class="menu-row-icon">${navIcon(icon,false)}</span><span>${label}</span>${icons.arrow}</button>`}
function menuView(){const owner=state.role==='Owner';return `${head('Menu','Manage your business, account, and support.') }<div class="menu-groups"><section class="card menu-group"><h2>Business</h2>${owner?menuRow('Insights','analytics-01','data-insights'):''}${menuRow('Listings','grid-02','data-page="listings"')}${owner?menuRow('Create a new listing','plus-sign','data-page="listings" data-listing-new'):''}${owner?menuRow('Partner hotels','hotel-01','data-toast="Partner hotels opened"'):''}${owner?menuRow('Staff accounts','user-group','data-toast="Staff accounts opened"'):''}${menuRow('Business profile','store-01','data-page="profile"')}</section><section class="card menu-group"><h2>Account</h2>${owner?menuRow('Earnings','wallet-01','data-page="earnings"'):''}${owner?menuRow('Payout account','wallet-01','data-page="earnings"'):''}${menuRow('Notifications','notification-03','data-toast="Notification settings opened"')}</section><section class="card menu-group"><h2>Support</h2>${menuRow('Help and support','help-circle','data-toast="Help center opened"')}${menuRow('Log out','logout-01','data-logout')}</section></div>`}
function chatView(){return `${head('Chat','Guest conversations and booking messages.')}<section class="card chat-workspace"><div class="card-header"><div><h2>Guest messages</h2><span>Keep booking conversations together</span></div></div><button class="chat-row" data-toast="Guest chat opened"><span><strong>Amelia Reyes</strong><small>Private bakery tasting · Booking request</small></span><span class="chat-unread">New</span></button><p class="chat-empty-note">Messages stay connected to their booking records.</p></section>`}
function view(){return state.page==='dashboard'?dashboard17():state.page==='insights'?insightsPageForView():state.page==='staff-listings'?staffListingsView():state.page==='orders'?ordersView():state.page==='bookings'?ordersView():state.page==='chat'?chatView():state.page==='listings'?listingsClean():state.page==='services'?servicesClean():state.page==='earnings'?earningsClean():state.page==='menu'?menuView():state.page==='profile'?profileView():dashboard17()}
function devTools(){const pos=state.devPosition?` style="left:${state.devPosition.left}px;top:${state.devPosition.top}px;right:auto;bottom:auto"`:'';return `<div class="dev-tools"${pos}><button class="dev-tools-trigger" aria-label="Development settings" title="Development settings"><i class="hgi-stroke hgi-settings-01" aria-hidden="true"></i><span class="sr-only">Development settings</span></button><div class="dev-tools-popover"><strong>Development preview</strong><span>Preview role</span><button data-role="Owner" class="${state.role==='Owner'?'active':''}">Owner</button><button data-role="Staff" class="${state.role==='Staff'?'active':''}">Staff</button><hr><strong>Simulation</strong><button data-dev-simulate-new-request>Simulate new request</button><button data-dev-reset-simulations>Reset simulations</button></div></div>`}
function insightsPage2(){let html=insightsPage();if(state.role!=='Owner')return html;const demand=html.match(/<section class="insights-section card insight-demand">[\s\S]*?<\/section>/)?.[0]||'';const payments=html.match(/<section class="insights-section card insight-payments">[\s\S]*?<\/section>/)?.[0]||'';if(demand&&payments){html=html.replace(demand,'').replace(payments,'').replace('</div></div>','<div class="insights-lower-grid">'+demand+payments+'</div></div>')}return html}
function bindFilterSheet(){document.querySelectorAll('[data-header-filter]').forEach(b=>b.onclick=()=>{state.filterDraftRange=state.range;state.filterDraftCompare=state.compareMode;state.filterSheet=true;render()});document.querySelectorAll('[data-sheet-close]').forEach(b=>b.onclick=()=>{state.filterSheet=false;render()});document.querySelectorAll('[data-sheet-range]').forEach(b=>b.onclick=()=>{state.filterDraftRange=b.dataset.sheetRange;state.filterSheet=b.dataset.sheetRange==='Custom range'?'custom':true;render()});document.querySelectorAll('[data-compare]').forEach(b=>b.onchange=()=>{state.filterDraftCompare=b.dataset.compare});const form=document.querySelector('[data-custom-submit]');if(form)form.onsubmit=e=>{e.preventDefault();state.customFrom=form.elements.from.value;state.customTo=form.elements.to.value;state.filterDraftRange='Custom range';render()};document.querySelectorAll('[data-apply-filters]').forEach(b=>b.onclick=()=>{state.range=state.filterDraftRange||state.range;state.compareMode=state.filterDraftCompare||'previous';state.filterSheet=false;render()})}
function bindInsightsExtras(){document.querySelectorAll('[data-insights]').forEach(b=>b.onclick=()=>{const page=document.querySelector('.page');state.dashboardScroll=page?page.scrollTop:0;state.page='insights';state.filterSheet=false;render()});document.querySelectorAll('[data-insights-back]').forEach(b=>b.onclick=()=>{state.page='dashboard';state.filterSheet=false;render();setTimeout(()=>{const page=document.querySelector('.page');if(page)page.scrollTop=state.dashboardScroll},0)});document.querySelectorAll('[data-insight-tab]').forEach(b=>b.onclick=()=>{state.insightTab=b.dataset.insightTab;render()});document.querySelectorAll('[data-insight-metric]').forEach(b=>b.onclick=()=>{state.insightMetric=b.dataset.insightMetric;render()});document.querySelectorAll('[data-insight-sort]').forEach(b=>b.onclick=()=>{state.insightSort=b.dataset.insightSort;render()});const search=document.querySelector('[data-insight-search]');if(search)search.oninput=e=>{state.insightQuery=e.target.value;const pos=search.selectionStart;render();const next=document.querySelector('[data-insight-search]');if(next){next.focus();next.setSelectionRange(pos,pos)}}}
function bindPerformanceTabs(){document.querySelectorAll('[data-performance-tab]').forEach(b=>b.onclick=()=>{state.performanceTab=b.dataset.performanceTab;render()})}
function bindDevToolDrag(){const trigger=document.querySelector('.dev-tools-trigger'),dev=document.querySelector('.dev-tools');if(!trigger||!dev)return;let dragging=false,moved=false,startX=0,startY=0,startLeft=0,startTop=0,frame,frameRect;trigger.onclick=e=>{if(moved){moved=false;e.preventDefault();return}dev.classList.toggle('open')};trigger.onpointerdown=e=>{if(e.button!==undefined&&e.button!==0)return;dragging=true;moved=false;startX=e.clientX;startY=e.clientY;const rect=dev.getBoundingClientRect();startLeft=rect.left;startTop=rect.top;frame=document.querySelector('.app-shell.phone-frame')||document.querySelector('#app')||document.documentElement;frameRect=frame.getBoundingClientRect();dev.classList.remove('open');trigger.setPointerCapture?.(e.pointerId);e.preventDefault()};trigger.onpointermove=e=>{if(!dragging)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dx)>3||Math.abs(dy)>3)moved=true;if(!moved)return;const maxLeft=Math.max(8,frameRect.width-dev.offsetWidth-8),maxTop=Math.max(8,frameRect.height-dev.offsetHeight-8),left=Math.max(8,Math.min(maxLeft,startLeft-frameRect.left+dx)),top=Math.max(8,Math.min(maxTop,startTop-frameRect.top+dy));dev.style.position='absolute';dev.style.left=left+'px';dev.style.top=top+'px';dev.style.right='auto';dev.style.bottom='auto';state.devPosition={left,top};e.preventDefault()};const stop=e=>{if(!dragging)return;dragging=false;trigger.releasePointerCapture?.(e.pointerId)};trigger.onpointerup=stop;trigger.onpointercancel=stop}
function listingFilterSheetMarkup(){if(!state.listingFilterSheet)return '';const sort=state.listingFilterDraftSort||state.insightSort||'count',show=state.listingFilterDraftShow||(state.listingsZeroOnly?'zero':'all');return '<div class="listing-filter-backdrop" data-listing-sheet-close></div><section class="listing-filter-sheet" role="dialog" aria-modal="true" aria-label="Listing filters"><div class="sheet-handle"></div><div class="sheet-heading"><div><h2>Listing filters</h2><span>Sort and show listings</span></div><button data-listing-sheet-close aria-label="Close listing filters">×</button></div><fieldset><legend>Sort by</legend><button class="'+(sort==='count'?'active':'')+'" data-listing-sort-choice="count"><span>Most orders</span>'+(sort==='count'?'<b>✓</b>':'')+'</button><button class="'+(sort==='revenue'?'active':'')+'" data-listing-sort-choice="revenue"><span>Highest revenue</span>'+(sort==='revenue'?'<b>✓</b>':'')+'</button></fieldset><fieldset><legend>Show</legend><button class="'+(show==='all'?'active':'')+'" data-listing-show-choice="all"><span>All listings</span>'+(show==='all'?'<b>✓</b>':'')+'</button><button class="'+(show==='zero'?'active':'')+'" data-listing-show-choice="zero"><span>Listings with no orders</span>'+(show==='zero'?'<b>✓</b>':'')+'</button></fieldset><div class="listing-filter-actions"><button class="button ghost" data-listing-filter-reset>Reset</button><button class="button primary" data-listing-filter-apply>Apply filters</button></div></section>'}
function insightsPageListingsFocus(){if(state.role!=='Owner')return '<div class="insights-access card"><strong>Owner access required</strong><span>Insights and financial reporting are available to the establishment owner.</span><button class="button primary" data-insights-back>Back to Dashboard</button></div>';const all=insightsListingRows(),query=state.insightQuery.trim().toLowerCase(),show=state.listingsZeroOnly?'zero':'all',filtered=all.filter(x=>(show==='all'||x[1]===0)&&x.join(' ').toLowerCase().includes(query)).sort((a,b)=>{const primary=state.insightSort==='revenue'?b[3]-a[3]:b[1]-a[1];return primary||a[0].localeCompare(b[0])}),range=insightRangeLabel(),sortText=state.insightSort==='revenue'?'Sorted by highest revenue.':'Sorted by most orders.',chip=state.listingsZeroOnly?'<button class="listing-filter-chip" data-listing-filter-chip>No orders ×</button>':'';const renderRow=x=>'<article class="insights-listing-card"><h3>'+esc(x[0])+'</h3><div class="insights-listing-metrics"><div><span>Orders</span><strong>'+x[1]+'</strong></div><div><span>Revenue</span><strong>'+insightMoney(x[3])+'</strong></div></div></article>';const cards=filtered.length?filtered.map(renderRow).join(''):(query?'<div class="insights-listing-empty">No listings match your search</div>':'');return '<div class="insights-listings-focus"><header class="insights-focus-header"><button class="insights-back-new" data-insights-back aria-label="Back to Dashboard">←</button><div class="insights-focus-title"><h1>Insights</h1></div><div class="insights-focus-actions"><button class="insights-export-icon" data-listings-export-toggle aria-label="Export listings"><i class="hgi-stroke hgi-download-04" aria-hidden="true"></i></button>'+(state.listingsExportOpen?'<div class="insights-export-menu"><button data-toast="CSV export prepared for listings · '+range+'">CSV</button><button data-toast="PDF export prepared for listings · '+range+'">PDF</button></div>':'')+'</div></header><button class="insights-period-control" data-header-filter aria-label="Change Insights date range"><span><strong>'+state.range+'</strong><small>'+range+'</small></span><i class="hgi-stroke hgi-calendar-cog" aria-hidden="true"></i></button><nav class="insights-tabs" aria-label="Insights sections"><button class="" data-insight-tab="sales">Sales</button><button class="" data-insight-tab="orders">Orders</button><button class="active" data-insight-tab="listings">Listings</button></nav><main class="insights-focus-content"><div class="insights-listing-heading"><h2>Listing performance</h2><span>'+all.length+' listings</span></div><div class="insights-search-row"><label class="insights-listing-search"><i class="hgi-stroke hgi-search-01" aria-hidden="true"></i><input data-insight-search value="'+esc(state.insightQuery)+'" placeholder="Search listings" aria-label="Search listings"></label><button class="insights-listing-filter-trigger" data-listing-filter-toggle aria-label="Open listing filters"><i class="hgi-stroke hgi-filter-horizontal" aria-hidden="true"></i></button></div><div class="insights-listing-summary"><span>'+sortText+'</span>'+chip+'</div><div class="insights-listing-cards">'+cards+'</div></main></div>'}
function insightsPageForView(){let html=state.insightTab==='listings'?insightsPageListingsFocus():insightsPageNew();html=html.replace(/<button class="[^\"]*" data-insight-tab="guests">Guests (?:&amp;|&) hotels<\/button>/,'').replace(/<span>Sans Rival Bakehouse · [^<]*<\/span>/g,'');if(state.insightTab==='sales'){const start=html.indexOf('<section class="insights-tab-panel active" data-tab-panel="sales">'),next=html.indexOf('<section class="insights-tab-panel ',start+10);if(start>=0&&next>start)html=html.slice(0,start)+salesInsightsPanel()+html.slice(next);html=addInsightsExport(html,insightRangeLabel())}return html}
function bindListingsFocus(){document.querySelectorAll('[data-listings-export-toggle]').forEach(b=>b.onclick=()=>{state.listingsExportOpen=!state.listingsExportOpen;render()});document.querySelectorAll('[data-listing-filter-toggle]').forEach(b=>b.onclick=()=>{state.listingFilterDraftSort=state.insightSort||'count';state.listingFilterDraftShow=state.listingsZeroOnly?'zero':'all';state.listingFilterSheet=true;render()});document.querySelectorAll('[data-listing-sheet-close]').forEach(b=>b.onclick=()=>{state.listingFilterSheet=false;render()});document.querySelectorAll('[data-listing-sort-choice]').forEach(b=>b.onclick=()=>{state.listingFilterDraftSort=b.dataset.listingSortChoice;render()});document.querySelectorAll('[data-listing-show-choice]').forEach(b=>b.onclick=()=>{state.listingFilterDraftShow=b.dataset.listingShowChoice;render()});document.querySelectorAll('[data-listing-filter-reset]').forEach(b=>b.onclick=()=>{state.insightSort='count';state.listingsZeroOnly=false;state.listingFilterDraftSort='count';state.listingFilterDraftShow='all';state.listingFilterSheet=false;render()});document.querySelectorAll('[data-listing-filter-apply]').forEach(b=>b.onclick=()=>{state.insightSort=state.listingFilterDraftSort||'count';state.listingsZeroOnly=(state.listingFilterDraftShow||'all')==='zero';state.listingFilterSheet=false;render()});document.querySelectorAll('[data-listing-filter-chip]').forEach(b=>b.onclick=()=>{state.listingsZeroOnly=false;render()})}
function dashboardPerformanceChart(values,labels,takeaway,intervals=labels,highlightIndex=-1){const maxValue=Math.max(...values,1),scale=Math.max(10,Math.ceil(maxValue/10)*10),ticks=[];for(let n=scale;n>=0;n-=10)ticks.push(n);const highlight=highlightIndex<0?values.indexOf(Math.max(...values)):highlightIndex,minWidth=Math.max(320,values.length*56);return '<div class="performance-activity-chart" role="img" aria-label="Orders for selected period"><div class="performance-chart-frame"><div class="performance-y-axis">'+ticks.map(n=>'<span>'+n+'</span>').join('')+'</div><div class="performance-chart-scroll"><div class="performance-chart-plot" style="min-width:'+minWidth+'px"><div class="performance-gridlines">'+ticks.map(()=>'<i></i>').join('')+'</div><div class="performance-bars">'+values.map((n,i)=>'<button class="performance-bar '+(i===highlight?'selected ':'')+(n===0?'zero':'')+'" style="height:'+(n===0?0:Math.round(n/scale*100))+'%" title="'+intervals[i]+' · '+n+' '+(n===1?'order':'orders')+'" aria-label="'+intervals[i]+' · '+n+' '+(n===1?'order':'orders')+'"></button>').join('')+'</div></div><div class="performance-x-axis" style="min-width:'+minWidth+'px">'+labels.map(label=>'<span>'+label+'</span>').join('')+'</div></div></div><div class="performance-chart-legend"><span><i class="regular"></i>Orders</span><span><i class="time"></i>Time</span></div></div>'}
function dashboard17(){let html=dashboard18Final();if(state.performanceTab==='top')return html;const period=dashboardActivityPeriod(),activity='<div class="performance-card-heading"><div><h3>Order activity</h3><span>'+period.title+' · '+period.sub+'</span></div></div>'+dashboardPerformanceChart(period.values,period.labels,'',period.intervals,period.highlight),panel='<section class="performance-tab-card card" data-performance-panel>'+activity+'</section>';return html.replace(/<section class="performance-tab-card card" data-performance-panel>[\s\S]*?<\/section>/,panel)}
function dashboardActivityPeriod(){if(state.range==='Today')return {title:'Today',sub:'Orders by hour',values:[22,35,48,62,84,67,54,46,39,31,26,23,21],labels:['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM'],intervals:['8–9 AM','9–10 AM','10–11 AM','11 AM–12 PM','12–1 PM','1–2 PM','2–3 PM','3–4 PM','4–5 PM','5–6 PM','6–7 PM','7–8 PM','8–9 PM'],highlight:4,takeaway:''};if(state.range==='Yesterday')return {title:'Yesterday',sub:'Orders by hour',values:[26,39,52,70,61,44,58,49,42,35,29,24,22],labels:['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM'],intervals:['8–9 AM','9–10 AM','10–11 AM','11 AM–12 PM','12–1 PM','1–2 PM','2–3 PM','3–4 PM','4–5 PM','5–6 PM','6–7 PM','7–8 PM','8–9 PM'],highlight:3,takeaway:''};if(state.range==='Last week')return {title:'Last week',sub:'Orders by day',values:[42,56,48,72,86,64,78],labels:['Sep 24','25','26','27','28','29','30'],intervals:['Sep 24','Sep 25','Sep 26','Sep 27','Sep 28','Sep 29','Sep 30'],highlight:4,takeaway:''};if(state.range==='This month')return {title:'This month',sub:'Orders by day',values:[34,52,68,74,96,82,108],labels:['Sep 1','5','10','15','20','25','30'],intervals:['Sep 1','Sep 5','Sep 10','Sep 15','Sep 20','Sep 25','Sep 30'],highlight:6,takeaway:''};return {title:'Custom range',sub:'Orders by day',values:[28,44,59,71,88,76,92],labels:['Day 1','2','3','4','5','6','7'],intervals:['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'],highlight:6,takeaway:''}}
function dashboard17(){let html=dashboard18Final();if(state.performanceTab==='top')return html;const period=dashboardActivityPeriod(),total=period.values.reduce((sum,value)=>sum+value,0),activity='<div class="performance-card-heading"><div><h3>Order activity</h3><span>'+period.title+' · '+period.sub+'</span></div></div>'+dashboardPerformanceChart(period.values,period.labels,'',period.intervals,period.highlight),panel='<section class="performance-tab-card card" data-performance-panel>'+activity+'</section>';html=html.replace(/(<article class="performance-kpi"><span>Orders<\/span><strong>)[^<]+(<\/strong>)/,'$1'+total+'$2');return html.replace(/<section class="performance-tab-card card" data-performance-panel>[\s\S]*?<\/section>/,panel)}
function dashboard17(){let html=dashboard18Final();if(state.performanceTab==='top'){const viewAll='<button class="view-all-listings" data-view-all-listings>View all listings '+icons.arrow+'</button>';html=html.replace(/<button class="button ghost" data-view-all-listings>[\s\S]*?<\/button>/,'').replace(/(<section class="performance-tab-card card" data-performance-panel>[\s\S]*?)(<\/section><\/section>)/,'$1<div class="performance-card-footer">'+viewAll+'</div>$2');return html}const period=dashboardActivityPeriod(),total=period.values.reduce((sum,value)=>sum+value,0),insightLink=state.role==='Owner'?'<button class="performance-insights" data-insights>View insights '+icons.arrow+'</button>':'',activity='<div class="performance-card-heading"><div><h3>Order activity</h3><span>'+period.title+' · '+period.sub+'</span></div></div>'+dashboardPerformanceChart(period.values,period.labels,period.takeaway,period.intervals,period.highlight)+'<div class="performance-card-footer">'+insightLink+'</div>',panel='<section class="performance-tab-card card" data-performance-panel>'+activity+'</section>';html=html.replace(/(<article class="performance-kpi"><span>Orders<\/span><strong>)[^<]+(<\/strong>)/,'$1'+total+'$2');return html.replace(/<section class="performance-tab-card card" data-performance-panel>[\s\S]*?<\/section>/,panel)}
function dashboardPerformanceChart(values,labels,takeaway,intervals=labels,highlightIndex=-1){const maxValue=Math.max(...values,1),scale=maxValue<=8?8:Math.ceil(maxValue/2)*2,ticks=[];for(let n=scale;n>=0;n-=2)ticks.push(n);const highlight=highlightIndex<0?values.indexOf(Math.max(...values)):highlightIndex,minWidth=Math.max(320,values.length*56);return '<div class="performance-activity-chart" role="img" aria-label="Orders for selected period"><div class="performance-chart-frame"><div class="performance-y-axis">'+ticks.map(n=>'<span>'+n+'</span>').join('')+'</div><div class="performance-chart-scroll"><div class="performance-chart-plot" style="min-width:'+minWidth+'px"><div class="performance-gridlines">'+ticks.map(()=>'<i></i>').join('')+'</div><div class="performance-bars">'+values.map((n,i)=>'<button class="performance-bar '+(i===highlight?'selected ':'')+(n===0?'zero':'')+'" style="height:'+(n===0?0:Math.round(n/scale*100))+'%" title="'+intervals[i]+' · '+n+' '+(n===1?'order':'orders')+'" aria-label="'+intervals[i]+' · '+n+' '+(n===1?'order':'orders')+'"></button>').join('')+'</div></div><div class="performance-x-axis" style="min-width:'+minWidth+'px">'+labels.map(label=>'<span>'+label+'</span>').join('')+'</div></div></div><div class="performance-chart-legend"><span><i class="regular"></i>Orders</span><span><i class="busy"></i>Busiest interval</span></div></div><p class="performance-takeaway">'+takeaway+'</p>'}
function dashboardActivityPeriod(){if(state.range==='Today')return {title:'Today',sub:'Orders by hour',values:[0,1,2,3,7,5],labels:['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM'],intervals:['8–9 AM','9–10 AM','10–11 AM','11 AM–12 PM','12–1 PM','1–2 PM'],highlight:4,takeaway:'Busiest time: 12–1 PM · 7 orders'};if(state.range==='Yesterday')return {title:'Yesterday',sub:'Orders by hour',values:[1,2,4,5,3,2],labels:['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM'],intervals:['8–9 AM','9–10 AM','10–11 AM','11 AM–12 PM','12–1 PM','1–2 PM'],highlight:3,takeaway:'Busiest time: 11 AM–12 PM · 5 orders'};if(state.range==='Last week')return {title:'Last week',sub:'Orders by day',values:[5,7,4,8,10,6,8],labels:['Sep 24','25','26','27','28','29','30'],intervals:['Sep 24','Sep 25','Sep 26','Sep 27','Sep 28','Sep 29','Sep 30'],highlight:4,takeaway:'Busiest day: Sep 28 · 10 orders'};if(state.range==='This month')return {title:'This month',sub:'Orders by day',values:[12,16,10,18,22,15,19],labels:['Sep 1','5','10','15','20','25','30'],intervals:['Sep 1','Sep 5','Sep 10','Sep 15','Sep 20','Sep 25','Sep 30'],highlight:4,takeaway:'Busiest day: Sep 20 · 22 orders'};return {title:'Custom range',sub:'Orders by day',values:[4,6,5,8,7,10,8],labels:['Day 1','2','3','4','5','6','7'],intervals:['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'],highlight:5,takeaway:'Busiest day: Day 6 · 10 orders'}}
function dashboardTopListings(){const ranges={Today:[['Whole Sans Rival Cake','42 orders'],['Island Breakfast Box','35 orders'],['Cold Brew Bottle','28 orders'],['Celebration Cake Slice','24 orders'],['Pandan Latte','22 orders'],['Seasonal tart','21 orders']],Yesterday:[['Whole Sans Rival Cake','38 orders'],['Island Breakfast Box','32 orders'],['Cold Brew Bottle','27 orders'],['Celebration Cake Slice','24 orders'],['Pandan Latte','22 orders'],['Seasonal tart','21 orders']],'Last week':[['Whole Sans Rival Cake','84 orders'],['Island Breakfast Box','72 orders'],['Cold Brew Bottle','58 orders'],['Celebration Cake Slice','46 orders'],['Pandan Latte','38 orders'],['Seasonal tart','22 orders']],'This month':[['Whole Sans Rival Cake','128 orders'],['Island Breakfast Box','104 orders'],['Cold Brew Bottle','86 orders'],['Celebration Cake Slice','62 orders'],['Pandan Latte','48 orders'],['Seasonal tart','24 orders']],'Custom range':[['Whole Sans Rival Cake','92 orders'],['Island Breakfast Box','74 orders'],['Cold Brew Bottle','58 orders'],['Celebration Cake Slice','44 orders'],['Pandan Latte','36 orders'],['Seasonal tart','22 orders']]};return ranges[state.range]||ranges['Custom range']}
function insightsDateControl(){const exact=state.range==='Today'?todayLabel():insightRangeLabel();return '<button class="insights-period-control" data-header-filter aria-label="Change Insights date range"><span><strong>'+state.range+'</strong><small>'+exact+'</small></span><span class="insights-period-chevron" aria-hidden="true">⌄</span></button>'}
function insightsDownloadMarkup(tab,range){const label=tab==='listings'?'listings':tab;return '<button class="insights-export-icon" data-listings-export-toggle aria-label="Download report"><i class="hgi-stroke hgi-download-04" aria-hidden="true"></i></button>'+(state.listingsExportOpen?'<div class="insights-export-menu" role="dialog" aria-label="Download report"><strong>Download report</strong><button data-toast="CSV export prepared for '+label+' · '+range+'">CSV</button><button data-toast="PDF export prepared for '+label+' · '+range+'">PDF</button></div>':'')}
function insightsPageListingsFocus(){if(state.role!=='Owner')return '<div class="insights-access card"><strong>Owner access required</strong><span>Insights and financial reporting are available to the establishment owner.</span><button class="button primary" data-insights-back>Back to Dashboard</button></div>';const all=insightsListingRows(),query=state.insightQuery.trim().toLowerCase(),filtered=all.filter(x=>x.join(' ').toLowerCase().includes(query)).sort((a,b)=>{const primary=state.insightSort==='revenue'?b[3]-a[3]:b[1]-a[1];return primary||a[0].localeCompare(b[0])}),range=insightRangeLabel(),sortLabel=state.insightSort==='revenue'?'Highest revenue':'Most orders',renderRow=x=>'<article class="insights-listing-card"><h3>'+esc(x[0])+'</h3><div class="insights-listing-metrics"><div><span>Orders</span><strong>'+x[1]+'</strong></div><div><span>Revenue</span><strong>'+insightMoney(x[3])+'</strong></div></div></article>';const cards=filtered.length?filtered.map(renderRow).join(''):(query?'<div class="insights-listing-empty">No listings match your search</div>':'');return '<div class="insights-listings-focus"><header class="insights-focus-header"><button class="insights-back-new" data-insights-back aria-label="Back to Dashboard">←</button><div class="insights-focus-title"><h1>Insights</h1></div><div class="insights-focus-actions">'+insightsDownloadMarkup('listings',range)+'</div></header><nav class="insights-tabs" role="tablist" aria-label="Insights sections"><button role="tab" aria-selected="false" data-insight-tab="sales">Sales</button><button role="tab" aria-selected="false" data-insight-tab="orders">Orders</button><button role="tab" aria-selected="true" class="active" data-insight-tab="listings">Listings</button></nav>'+insightsDateControl()+'<main class="insights-focus-content"><div class="insights-listing-heading"><h2>Listing performance</h2><span>'+all.length+' listings</span></div><label class="insights-listing-search"><i class="hgi-stroke hgi-search-01" aria-hidden="true"></i><input data-insight-search value="'+esc(state.insightQuery)+'" placeholder="Search listings" aria-label="Search listings"></label><div class="insights-listing-sort-row"><div class="insights-listing-sort-wrap"><button class="insights-listing-sort" data-listing-sort-toggle>Sort: '+sortLabel+' <span>⌄</span></button>'+(state.listingSortOpen?'<div class="insights-listing-sort-menu"><button data-listing-sort-option="count" class="'+(state.insightSort==='count'?'active':'')+'">Most orders</button><button data-listing-sort-option="revenue" class="'+(state.insightSort==='revenue'?'active':'')+'">Highest revenue</button></div>':'')+'</div></div><div class="insights-listing-cards">'+cards+'</div></main></div>'}
function insightsPageForView(){if(state.insightTab==='listings')return insightsPageListingsFocus();let html=insightsPageNew();html=html.replace(/<button class="[^\"]*" data-insight-tab="guests">Guests (?:&amp;|&) hotels<\/button>/,'').replace(/<span>Sans Rival Bakehouse · [^<]*<\/span>/g,'');if(state.insightTab==='sales'){const start=html.indexOf('<section class="insights-tab-panel active" data-tab-panel="sales">'),next=html.indexOf('<section class="insights-tab-panel ',start+10);if(start>=0&&next>start)html=html.slice(0,start)+salesInsightsPanel()+html.slice(next)}html=html.replace(/<div class="insights-tools">[\s\S]*?<nav class="insights-tabs"/,'<nav class="insights-tabs"').replace(/<button class="insights-header-filter"[\s\S]*?<\/button>/g,'').replace(/<button class="insights-export-icon"[\s\S]*?<\/button>/g,'').replace(/<div class="insights-reporting-period">[\s\S]*?<\/div>/,'');html=html.replace('</header>',insightsDownloadMarkup(state.insightTab,insightRangeLabel())+'</header>').replace('</nav><main class="insights-content">','</nav>'+insightsDateControl()+'<main class="insights-content">');return html}

/* Sales and Orders use the Listings header geometry so every Insights tab starts consistently. */
function insightsPageForView(){if(state.insightTab==='listings')return insightsPageListingsFocus();let html=insightsPageNew();html=html.replace(/<button class="[^\"]*" data-insight-tab="guests">Guests (?:&amp;|&) hotels<\/button>/,'').replace(/<span>Sans Rival Bakehouse · [^<]*<\/span>/g,'');if(state.insightTab==='sales'){const start=html.indexOf('<section class="insights-tab-panel active" data-tab-panel="sales">'),next=html.indexOf('<section class="insights-tab-panel ',start+10);if(start>=0&&next>start)html=html.slice(0,start)+salesInsightsPanel()+html.slice(next)}html=html.replace(/<div class="insights-tools">[\s\S]*?<nav class="insights-tabs"/,'<nav class="insights-tabs"').replace(/<button class="insights-header-filter"[\s\S]*?<\/button>/g,'').replace(/<button class="insights-export-icon"[\s\S]*?<\/button>/g,'').replace(/<div class="insights-reporting-period">[\s\S]*?<\/div>/,'');html=html.replace('</header>',insightsDownloadMarkup(state.insightTab,insightRangeLabel())+'</header>').replace('</nav><main class="insights-content">','</nav>'+insightsDateControl()+'<main class="insights-content">');return html.replace(/<header class="insights-header-new">([\s\S]*?)<\/header>/,(_,body)=>{const title=body.replace('<div><h1>Insights</h1></div>','<div class="insights-focus-title"><h1>Insights</h1></div>');const content=title.replace(/(<button class="insights-export-icon"[\s\S]*?<\/button>)/,'<div class="insights-focus-actions">$1</div>');return '<header class="insights-focus-header">'+content+'</header>'})}
function bindListingsFocus(){document.querySelectorAll('[data-listings-export-toggle]').forEach(b=>b.onclick=()=>{state.listingsExportOpen=!state.listingsExportOpen;render()});document.querySelectorAll('[data-listing-sort-toggle]').forEach(b=>b.onclick=()=>{state.listingSortOpen=!state.listingSortOpen;render()});document.querySelectorAll('[data-listing-sort-option]').forEach(b=>b.onclick=()=>{state.insightSort=b.dataset.listingSortOption;state.listingSortOpen=false;render()})}
function insightsDateControl(){const exact=state.range==='Today'?todayLabel():insightRangeLabel();return '<button class="insights-period-control" data-header-filter aria-label="Change Insights date range"><span class="insights-period-copy"><strong>'+state.range+'</strong><small>'+exact+'</small></span><i class="hgi-stroke hgi-calendar-03 insights-period-calendar" aria-hidden="true"></i></button>'}
function insightsDownloadModal(){if(!state.insightsDownloadOpen)return '';const tab=state.insightTab==='listings'?'Listings':state.insightTab==='orders'?'Orders':'Sales';const range=insightRangeLabel();return '<div class="insights-download-backdrop" data-download-close></div><section class="insights-download-modal" role="dialog" aria-modal="true" aria-label="Download report"><div class="sheet-handle"></div><div class="insights-download-heading"><div><h2>Download report</h2><span>'+tab+' · '+range+'</span></div><button data-download-close aria-label="Close download report">×</button></div><button class="insights-download-option" data-download-format="CSV"><span>CSV</span><small>Comma-separated values</small><b aria-hidden="true">›</b></button><button class="insights-download-option" data-download-format="PDF"><span>PDF</span><small>Portable document</small><b aria-hidden="true">›</b></button></section>'}
function wrapInsightsStickyFilters(content){content=content.replace(/<button class="insights-export-icon"[\s\S]*?<\/button>/g,'').replace(/<div class="insights-export-menu"[\s\S]*?<\/div>/g,'').replace(/<div class="insights-focus-actions">\s*<\/div>/g,'');return content.replace(/(<nav class="insights-tabs"[\s\S]*?<\/nav>)(<button class="insights-period-control"[\s\S]*?<\/button>)/,'<div class="insights-sticky-filter-shell">$1<div class="insights-sticky-action-row">$2<button class="insights-download-report" data-download-report aria-label="Download report" title="Download report"><i class="hgi-stroke hgi-download-04" aria-hidden="true"></i></button></div></div>')}
function shell3(content){content=wrapInsightsStickyFilters(content);let html=shell2(content);if(state.page==='insights'||state.page==='staff-listings'||state.page==='dashboard'||state.page==='orders'||state.page==='bookings')html=html.replace(/<header class="topbar">[\s\S]*?<\/header>/,'');return html+insightsDownloadModal()}
function bindInsightsDownload(){document.querySelectorAll('[data-download-report]').forEach(b=>b.onclick=()=>{state.insightsDownloadOpen=true;render()});document.querySelectorAll('[data-download-close]').forEach(b=>b.onclick=()=>{state.insightsDownloadOpen=false;render()});document.querySelectorAll('[data-download-format]').forEach(b=>b.onclick=()=>{const format=b.dataset.downloadFormat,tab=state.insightTab==='listings'?'Listings':state.insightTab==='orders'?'Orders':'Sales',range=insightRangeLabel();state.insightsDownloadOpen=false;render();setTimeout(()=>toast(format+' report prepared for '+tab+' · '+range),0)})}
function render(){document.querySelector('#app').innerHTML=shell3(view());document.querySelector('#app').insertAdjacentHTML('beforeend',devTools()+filterSheet()+listingFilterSheetMarkup());document.querySelectorAll('.insights-tabs [data-insight-tab]').forEach(b=>{b.setAttribute('role','tab');b.setAttribute('aria-selected',b.classList.contains('active')?'true':'false')});bind();bindDevToolDrag();bindPerformanceTabs();bindFilterSheet();bindInsightsExtras();bindDashboardListings();bindListingsFocus();bindInsightsDownload()}
function toast(message){message=message.replaceAll('refund policy shown to guest','cancellation recorded');const node=document.createElement('div');node.className='toast';node.textContent=message;document.querySelector('#toast-region').append(node);setTimeout(()=>node.remove(),2600)}
function bind(){document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{state.page=b.dataset.page;state.detail=null;rememberLastView();render()});document.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>{state.detail=b.dataset.detail;render()});document.querySelectorAll('[data-range]').forEach(b=>b.onclick=()=>{state.range=b.dataset.range;render()});document.querySelectorAll('[data-order-filter]').forEach(b=>b.onclick=()=>{state.orderFilter=b.dataset.orderFilter;render()});document.querySelectorAll('[data-order-type]').forEach(b=>b.onclick=()=>{state.orderTypeFilter=b.dataset.orderType;render()});document.querySelectorAll('[data-order-status]').forEach(b=>b.onclick=()=>{state.orderStatusFilter=b.dataset.orderStatus;render()});document.querySelectorAll('[data-order-payment]').forEach(b=>b.onclick=()=>{state.orderPaymentFilter=b.dataset.orderPayment;render()});document.querySelectorAll('[data-order-filter-link]').forEach(b=>b.onclick=()=>{state.page='orders';state.orderFilter=b.dataset.orderFilterLink;state.orderStatusFilter=b.dataset.orderFilterLink;render()});document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{state.orderView=b.dataset.view;render()});document.querySelectorAll('[data-role]').forEach(b=>b.onclick=()=>{state.role=b.dataset.role;render()});const dateToggle=document.querySelector('[data-date-toggle]');if(dateToggle)dateToggle.onclick=()=>dateToggle.parentElement.classList.toggle('open');const toggle=document.querySelector('[data-toggle-orders]');if(toggle)toggle.onclick=()=>{state.ordersPaused=!state.ordersPaused;toast(state.ordersPaused?'Orders paused':'Orders accepting');render()};const trigger=document.querySelector('.dev-tools-trigger');if(trigger){const dev=document.querySelector('.dev-tools');let dragging=false,moved=false,startX=0,startY=0,startLeft=0,startTop=0,frame,frameRect;trigger.onclick=()=>{if(moved){moved=false;return}dev.classList.toggle('open')};trigger.onpointerdown=e=>{dragging=true;moved=false;startX=e.clientX;startY=e.clientY;const rect=dev.getBoundingClientRect();startLeft=rect.left;startTop=rect.top;frame=dev.offsetParent||document.documentElement;frameRect=frame.getBoundingClientRect();dev.classList.remove('open');trigger.setPointerCapture?.(e.pointerId)};trigger.onpointermove=e=>{if(!dragging)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dx)>3||Math.abs(dy)>3)moved=true;if(!moved)return;const left=Math.max(8,Math.min(frame.clientWidth-dev.offsetWidth-8,startLeft+dx-frameRect.left)),top=Math.max(8,Math.min(frame.clientHeight-dev.offsetHeight-8,startTop+dy-frameRect.top));state.devPosition={left,top};dev.style.left=left+'px';dev.style.top=top+'px';dev.style.right='auto';dev.style.bottom='auto';e.preventDefault()};const stop=e=>{if(!dragging)return;dragging=false;trigger.releasePointerCapture?.(e.pointerId)};trigger.onpointerup=stop;trigger.onpointercancel=stop}const search=document.querySelector('[data-search]');if(search){search.oninput=e=>{state.query=e.target.value;const pos=e.target.selectionStart;render();const next=document.querySelector('[data-search]');next.focus();next.setSelectionRange(pos,pos)}}document.querySelectorAll('[data-toast]').forEach(b=>b.onclick=()=>toast(b.dataset.toast));document.querySelectorAll('[data-logout]').forEach(b=>b.onclick=()=>{if(window.confirm('Log out of Cabana Vendor Portal?'))toast('Logged out')});document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{const o=orders.find(x=>x.id===state.detail);const a=b.dataset.action;if(a==='confirm')o.status='Confirmed';if(a==='preparing')o.status='Preparing';if(a==='ready')o.status='Ready';if(a==='complete')o.status='Completed';if(a==='cancel'){o.status='Cancelled';toast('Cancellation recorded')}if(a==='reschedule')toast('Reschedule request opened');if(a!=='reschedule')toast(`Order ${o.id} updated`);render()});document.querySelectorAll('[data-listing-new]').forEach(b=>b.onclick=()=>toast('New listing form opened'))}
/* Final Dashboard action-card override. */
const dashboard18BaseForActions=dashboard18Final;
dashboard18Final=function(){
  let html=dashboard18BaseForActions();
  const actionItems=[{count:2,label:'orders to confirm',filter:'Pending'},{count:1,label:'ready for pickup',filter:'Ready'}].filter(item=>item.count>0);
  const actionCard=actionItems.length
    ? '<section class="dashboard-section needs-action card"><div class="section-heading"><div class="needs-action-heading"><i class="hgi-stroke hgi-alert-02" aria-hidden="true"></i><h2>Action required</h2></div></div><div class="action-count-grid">'+actionItems.map(item=>'<button class="needs-action-row" data-page="orders" data-order-filter-link="'+item.filter+'"><span class="needs-action-label"><strong>'+item.count+'</strong> '+item.label+'</span><span class="needs-action-chevron" aria-hidden="true">›</span></button>').join('')+'</div></section>'
    : '<section class="dashboard-section needs-action card needs-action-empty"><div class="section-heading"><div><h2>Action required</h2></div></div><p>You’re all caught up.</p></section>';
  html=html.replace(/<button[^>]*data-view-all-listings[^>]*>[\s\S]*?<\/button>/g,'');
  return html.replace(/<section class="dashboard-section needs-action card">[\s\S]*?<\/section>/,actionCard);
};

/* Final Dashboard order-activity override: keep the full closing-hours series inside the card. */
function dashboardPerformanceChart(values,labels,takeaway,intervals=labels,highlightIndex=-1){const maxValue=Math.max(...values,1),scale=Math.max(20,Math.ceil(maxValue/20)*20),ticks=[];for(let n=scale;n>=0;n-=20)ticks.push(n);const highlight=highlightIndex<0?values.indexOf(Math.max(...values)):highlightIndex,minWidth=Math.max(840,values.length*56);return '<div class="performance-activity-chart" role="img" aria-label="Orders for selected period"><div class="performance-chart-frame"><div class="performance-y-axis">'+ticks.map(n=>'<span>'+n+'</span>').join('')+'</div><div class="performance-chart-scroll"><div class="performance-chart-plot" style="min-width:'+minWidth+'px"><div class="performance-gridlines">'+ticks.map(()=>'<i></i>').join('')+'</div><div class="performance-bars">'+values.map((n,i)=>'<button class="performance-bar '+(i===highlight?'selected ':'')+(n===0?'zero':'')+'" style="height:'+(n===0?0:Math.round(n/scale*100))+'%" title="'+intervals[i]+' · '+n+' '+(n===1?'order':'orders')+'" aria-label="'+intervals[i]+' · '+n+' '+(n===1?'order':'orders')+'"></button>').join('')+'</div></div><div class="performance-x-axis" style="min-width:'+minWidth+'px">'+labels.map(label=>'<span>'+label+'</span>').join('')+'</div></div></div><div class="performance-chart-legend"><span><i class="regular"></i>Orders</span><span><i class="busy"></i>Busiest interval</span></div></div><p class="performance-takeaway">'+takeaway+'</p>'}
function dashboardActivityPeriod(){if(state.range==='Today')return {title:'Today',sub:'Orders by hour',values:[24,32,44,56,76,64,52,46,40,36,32,28,26,24,22],labels:['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM'],intervals:['8–9 AM','9–10 AM','10–11 AM','11 AM–12 PM','12–1 PM','1–2 PM','2–3 PM','3–4 PM','4–5 PM','5–6 PM','6–7 PM','7–8 PM','8–9 PM','9–10 PM','10 PM–close'],highlight:4,takeaway:'Busiest time: 12–1 PM'};if(state.range==='Yesterday')return {title:'Yesterday',sub:'Orders by hour',values:[22,28,36,48,42,34,30,28,26,24,22,21,20,20,20],labels:['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM'],intervals:['8–9 AM','9–10 AM','10–11 AM','11 AM–12 PM','12–1 PM','1–2 PM','2–3 PM','3–4 PM','4–5 PM','5–6 PM','6–7 PM','7–8 PM','8–9 PM','9–10 PM','10 PM–close'],highlight:3,takeaway:'Busiest time: 11 AM–12 PM'};if(state.range==='Last week')return {title:'Last week',sub:'Orders by day',values:[42,56,48,72,86,64,78],labels:['Sep 24','25','26','27','28','29','30'],intervals:['Sep 24','Sep 25','Sep 26','Sep 27','Sep 28','Sep 29','Sep 30'],highlight:4,takeaway:'Busiest day: Sep 28'};if(state.range==='This month')return {title:'This month',sub:'Orders by day',values:[34,52,68,74,96,82,108],labels:['Sep 1','5','10','15','20','25','30'],intervals:['Sep 1','Sep 5','Sep 10','Sep 15','Sep 20','Sep 25','Sep 30'],highlight:6,takeaway:'Busiest day: Sep 30'};return {title:'Custom range',sub:'Orders by day',values:[28,44,59,71,88,76,92],labels:['Day 1','2','3','4','5','6','7'],intervals:['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'],highlight:6,takeaway:'Busiest day: Day 7'}}
const dashboard17WithoutListingShortcut=dashboard17;
dashboard17=function(){return dashboard17WithoutListingShortcut().replace(/<button[^>]*data-view-all-listings[^>]*>[\s\S]*?<\/button>/g,'')};
const dashboard17StackedPerformanceBase=dashboard17;
dashboard17=function(){
  let html=dashboard17StackedPerformanceBase();
  const owner=state.role==='Owner';
  const rangeDates=state.range==='Today'?todayLabel():state.range==='Yesterday'?'Thursday, October 1, 2026':state.range==='This month'?'September 1–30, 2026':state.range==='Last week'?'September 24–30, 2026':state.customFrom&&state.customTo?state.customFrom+' – '+state.customTo:'Custom range';
  const period=dashboardActivityPeriod();
  const ordersTotal=period.values.reduce((sum,value)=>sum+value,0);
  const revenue=state.range==='Today'?'₱6,420':state.range==='Yesterday'?'₱5,880':state.range==='This month'?'₱124,860':state.range==='Last week'?'₱84,260':'₱84,260';
  const comparison=state.range==='Today'?'vs yesterday':state.range==='Yesterday'?'vs previous day':state.range==='This month'?'vs previous month':state.range==='Last week'?'vs previous week':'vs previous period';
  const change=state.range==='Today'?'+12%':state.range==='Yesterday'?'+6%':state.range==='This month'?'+14%':state.range==='Last week'?'+9%':'+8%';
  const greeting='<section class="dashboard-business dashboard-greeting"><div><strong>Welcome back, Leah!</strong></div></section>';
  const dateFilter='<button class="dashboard-date-filter-below-action" data-header-filter aria-label="Change Dashboard date range"><span><strong>'+dashboardAppliedRangeLabel()+'</strong><small>'+dashboardExactRangeLabel()+'</small></span><i class="hgi-stroke hgi-calendar-03" aria-hidden="true"></i></button>';
  const kpis='<div class="performance-kpis '+(owner?'owner':'staff')+'"><article class="performance-kpi"><span>Orders</span><strong>'+ordersTotal+'</strong><small>↑ '+change+' <em>'+comparison+'</em></small></article>'+(owner?'<article class="performance-kpi"><span>Revenue</span><strong>'+revenue+'</strong><small>↑ +8.1% <em>'+comparison+'</em></small></article>':'')+'</div>';
  const insight=owner?'<button class="performance-insights" data-insights>View insights '+icons.arrow+'</button>':'';
  const activityCard='<section class="performance-tab-card card order-activity-card" data-performance-panel><div class="performance-card-heading"><div><h3>Order activity</h3><span>'+period.title+' · '+period.sub+'</span></div></div>'+dashboardPerformanceChart(period.values,period.labels,period.takeaway,period.intervals,period.highlight)+'</section>';
  const topRows=dashboardTopListings().slice(0,3).map(x=>'<div class="performance-listing-row"><strong>'+x[0]+'</strong><span>'+x[1]+'</span></div>').join('');
  const topCard='<section class="performance-tab-card card top-listings-performance-card" data-performance-panel><div class="performance-card-heading"><div><h3>Top listings</h3><span>'+period.title+' · top three by order count</span></div></div><div class="performance-listing-list">'+topRows+'</div><div class="performance-card-footer"><button class="view-all-listings" data-view-all-listings>View all listings '+icons.arrow+'</button></div></section>';
  const performance='<section class="dashboard-performance"><div class="performance-heading"><div><h2>Performance</h2><span class="performance-range">'+rangeDates+'</span></div>'+insight+'</div>'+kpis+activityCard+topCard+'</section>';
  html=html.replace(/<section class="dashboard-business">[\s\S]*?<\/section>/,greeting).replace(/(<section class="dashboard-section needs-action card(?: needs-action-empty)?">[\s\S]*?<\/section>)/,'$1'+dateFilter);
  return html.replace(/<section class="dashboard-performance">[\s\S]*?(?=<section class="dashboard-section card schedule-section)/,performance);
};

function dashboardCustomRangeLabel(from,to){
  if(!from||!to)return 'Custom range';
  const parse=value=>{const parts=value.split('-').map(Number);return parts.length===3?{year:parts[0],month:parts[1],day:parts[2]}:null};
  const start=parse(from),end=parse(to),months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if(!start||!end||!start.month||!end.month)return 'Custom range';
  if(start.year===end.year&&start.month===end.month){return start.day===end.day?months[start.month-1]+' '+start.day+', '+start.year:months[start.month-1]+' '+start.day+'–'+end.day+', '+start.year}
  if(start.year===end.year)return months[start.month-1]+' '+start.day+'–'+months[end.month-1]+' '+end.day+', '+start.year;
  return months[start.month-1]+' '+start.day+', '+start.year+'–'+months[end.month-1]+' '+end.day+', '+end.year;
}
function dashboardAppliedRangeLabel(){return state.range==='Custom range'?dashboardCustomRangeLabel(state.customFrom,state.customTo):state.range}
function dashboardExactRangeLabel(){if(state.range==='Today')return todayLabel();if(state.range==='Yesterday'){const date=new Date();date.setDate(date.getDate()-1);return new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(date)}if(state.range==='This month'){const date=new Date();return new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'}).format(date)}if(state.range==='Last week'){const current=new Date(),day=current.getDay(),start=new Date(current);start.setDate(current.getDate()-(day===0?6:day-1)-7);const end=new Date(start);end.setDate(start.getDate()+6);return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(start)+'–'+new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(end)}return dashboardAppliedRangeLabel()}
filterSheet=function(){if(!state.filterSheet)return '';const insight=state.page==='insights',options=insight?['Last 7 days','Last 30 days','This month','Last month','Custom range']:['Today','Yesterday','This month','Last week','Custom range'],selected=state.filterDraftRange||state.range,custom=state.filterSheet==='custom',from=state.filterDraftFrom!==undefined?state.filterDraftFrom:state.customFrom,to=state.filterDraftTo!==undefined?state.filterDraftTo:state.customTo;return '<div class="filter-sheet-backdrop" data-sheet-close></div><section class="filter-sheet" role="dialog" aria-modal="true" aria-label="Date range filter"><div class="sheet-handle"></div><div class="sheet-heading"><div><h2>Date range</h2><span>'+(insight?'Apply to all Insights reporting':'Select the reporting period')+'</span></div><button data-sheet-close aria-label="Close date range filter">×</button></div><div class="sheet-options">'+options.map(x=>'<button class="'+(selected===x?'active':'')+'" data-sheet-range="'+x+'"><span>'+x+'</span>'+(selected===x?'<b>✓</b>':'')+'</button>').join('')+'</div>'+(insight?'<div class="compare-options"><strong>Compare to</strong><label><input type="radio" name="compare" data-compare="previous" '+(state.filterDraftCompare==='previous'?'checked':'')+'> Previous period</label><label><input type="radio" name="compare" data-compare="year" '+(state.filterDraftCompare==='year'?'checked':'')+'> Same period last year</label></div>':'')+(custom?'<form class="custom-range-form" data-custom-submit><label>From<input type="date" name="from" value="'+from+'"></label><label>To<input type="date" name="to" value="'+to+'"></label></form>':'')+'<div class="filter-sheet-actions"><button class="filter-cancel" data-sheet-close>Cancel</button><button class="button primary filter-apply" data-apply-filters>Apply</button></div></section>'}
bindFilterSheet=function(){document.querySelectorAll('[data-header-filter]').forEach(b=>b.onclick=()=>{state.filterDraftRange=state.range;state.filterDraftCompare=state.compareMode;state.filterDraftFrom=state.customFrom;state.filterDraftTo=state.customTo;state.filterSheet=state.range==='Custom range'?'custom':true;render()});document.querySelectorAll('[data-sheet-close]').forEach(b=>b.onclick=()=>{state.filterSheet=false;render()});document.querySelectorAll('[data-sheet-range]').forEach(b=>b.onclick=()=>{state.filterDraftRange=b.dataset.sheetRange;state.filterSheet=b.dataset.sheetRange==='Custom range'?'custom':true;render()});document.querySelectorAll('[data-compare]').forEach(b=>b.onchange=()=>{state.filterDraftCompare=b.dataset.compare});const form=document.querySelector('[data-custom-submit]');if(form)form.onsubmit=e=>{e.preventDefault();state.filterDraftFrom=form.elements.from.value;state.filterDraftTo=form.elements.to.value;state.filterDraftRange='Custom range';state.filterSheet='custom';render()};document.querySelectorAll('[data-apply-filters]').forEach(b=>b.onclick=()=>{const activeForm=document.querySelector('[data-custom-submit]');if(activeForm){state.filterDraftFrom=activeForm.elements.from.value;state.filterDraftTo=activeForm.elements.to.value;state.filterDraftRange='Custom range'}const next=state.filterDraftRange||state.range;if(next==='Custom range'){state.customFrom=state.filterDraftFrom||state.customFrom;state.customTo=state.filterDraftTo||state.customTo}state.range=next;state.compareMode=state.filterDraftCompare||'previous';state.filterSheet=false;render()})}
/* Final Dashboard Schedule refinement: compact vertical booking rows with a scheduled Orders view. */
const dashboard17BeforeScheduleRefinement=dashboard17;
const dashboardScheduledOrders=[
  {id:'ORD-1042',sort:15,time:'Pickup · 3:00 PM',item:'Whole Sans Rival Cake',details:'John D. · Room 101 · Qty 1',status:'Confirmed',statusClass:'confirmed'},
  {id:'CB-8821',sort:17.5,time:'5:30 PM',item:'Private bakery tasting',details:'Amelia Reyes · Room 508 · 2 guests',status:'Needs confirmation',statusClass:'needs-confirmation'}
];
function dashboardScheduleMarkup(){
  const rows=dashboardScheduledOrders.slice().sort((a,b)=>a.sort-b.sort).slice(0,3).map(order=>'<button class="polished-schedule-row" data-detail="'+order.id+'" aria-label="'+esc(order.time+' · '+order.item+' · '+order.status)+'"><span class="polished-schedule-row-top"><span class="polished-time">'+order.time+'</span><em class="schedule-status '+order.statusClass+'">'+order.status+'</em></span><span class="polished-schedule-details"><strong>'+order.item+'</strong><small>'+order.details+'</small></span></button>').join('');
  return '<section class="dashboard-section card schedule-section polished-schedule"><div class="polished-card-header"><h2>Schedule</h2><button class="button ghost schedule-view-orders" data-schedule-filter>View orders '+icons.arrow+'</button></div>'+(rows?'<div class="polished-schedule-list">'+rows+'</div>':'<p class="schedule-empty">No upcoming bookings.</p>')+'</section>';
}
dashboard17=function(){return dashboard17BeforeScheduleRefinement().replace(/<section class="dashboard-section card schedule-section[^\"]*">[\s\S]*?<\/section>/,dashboardScheduleMarkup())};
const ordersViewBeforeScheduleFilter=ordersView;
ordersView=function(){
  const html=ordersViewBeforeScheduleFilter();
  if(!state.scheduleOnly)return html;
  const scheduled=orders.filter(o=>['Pending','Confirmed','Preparing','Ready'].includes(o.status));
  const list=scheduled.length?scheduled.map(orderCard).join(''):'<div class="empty-state"><strong>No upcoming bookings</strong><span>There are no scheduled orders to show.</span></div>';
  return html.replace(' · bookings, in-app orders, and counter charges.',' · upcoming scheduled bookings.').replace(/<section class="order-list">[\s\S]*?<\/section>/,'<section class="order-list">'+list+'</section>');
};
const renderBeforeScheduleBinding=render;
render=function(){renderBeforeScheduleBinding();document.querySelectorAll('[data-schedule-filter]').forEach(button=>button.onclick=()=>{state.scheduleOnly=true;state.page='orders';state.orderView='list';state.orderFilter='All';state.orderStatusFilter='All';render()});document.querySelectorAll('.polished-schedule-row').forEach(row=>row.onclick=()=>{state.scheduleOnly=false;state.page='orders';state.detail=row.dataset.detail;render()});document.querySelectorAll('[data-page="orders"]:not([data-schedule-filter])').forEach(button=>{const original=button.onclick;button.onclick=event=>{state.scheduleOnly=false;original?.call(button,event)}})};

/* Final Orders workspace: compact controls, shared records, filter sheet, and mobile detail/calendar views. */
const cabanaOrderTimeTabs=['Today','Upcoming','Past'];
const cabanaOrderStatuses=['All','Pending','Confirmed','Preparing','Ready','Completed','Posted to room'];
function cabanaOrderType(o){return o.kind==='Booking'?'Booking':o.kind==='In-app order'?'In-app order':'Counter charge'}
function cabanaOrderTypeMatches(o,type){return type==='All'||type==='Bookings'&&o.kind==='Booking'||type==='In-app orders'&&o.kind==='In-app order'||type==='Counter charges'&&o.kind==='Counter charge'}
function cabanaOrderDateLabel(o){const when=o.when||'';if(when.includes('Today')||when.startsWith('Oct 2'))return 'Today';return when.split(' · ')[0]||'Today'}
function cabanaOrderDateRank(o){const label=cabanaOrderDateLabel(o);if(label==='Today')return 0;if(label==='Tomorrow')return 1;if(label.startsWith('Oct'))return 2;return 3}
function cabanaOrderIsScheduled(o){return o.kind!=='Counter charge'&&/\d{1,2}:\d{2}/.test(o.when||'')}
function cabanaOrderTimeMatch(o){const tab=state.orderTimeTab||'Today',when=o.when||'';if(state.orderConfirmationScope)return true;if(tab==='Today')return when.includes('Today')||when.startsWith('Oct 2');if(tab==='Upcoming')return cabanaOrderIsScheduled(o)&&!when.includes('Today')&&!when.startsWith('Oct 2')&&!when.startsWith('Sep 28');return when.startsWith('Sep')||(!cabanaOrderIsScheduled(o)&&!when.includes('Today')&&!when.startsWith('Oct 2'))}
function cabanaOrderPaymentMatch(o){const filter=state.orderPaymentFilter||'All';return filter==='All'||filter==='Charge to room'&&o.payment==='Charged to room'||filter==='Gateway'&&o.payment==='Paid via gateway'}
function cabanaOrderFilteredRecords(){const type=state.orderTypeFilter||'All',status=state.orderStatusFilter||'All',query=(state.query||'').trim().toLowerCase(),listing=state.orderListingFilter||[];return orders.filter(o=>cabanaOrderTimeMatch(o)&&(!query||`${o.id} ${o.guest} ${o.room} ${o.item}`.toLowerCase().includes(query))&&cabanaOrderTypeMatches(o,type)&&(status==='All'||o.status===status)&&cabanaOrderPaymentMatch(o)&&(!listing.length||listing.includes(o.item)))}
function cabanaOrderTimeValue(o){const match=(o.when||'').match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);if(!match)return 9999;let hour=Number(match[1])%12;if(match[3].toUpperCase()==='PM')hour+=12;return hour*60+Number(match[2])}
function cabanaAppliedOrderChips(){const chips=[];if(state.orderTypeFilter&&state.orderTypeFilter!=='All')chips.push(['Type: '+state.orderTypeFilter,'type']);if(state.orderPaymentFilter&&state.orderPaymentFilter!=='All')chips.push(['Payment: '+state.orderPaymentFilter,'payment']);if(state.orderStatusFilter&&state.orderStatusFilter!=='All')chips.push(['Status: '+state.orderStatusFilter,'status']);(state.orderListingFilter||[]).forEach(name=>chips.push(['Listing: '+name,'listing:'+name]));return chips}
function cabanaOrderStatus(status){return status==='Pending'?'Pending':status}
function cabanaOrderQuickActions(o){if(o.kind==='Counter charge')return '';if(o.status==='Pending')return '<button class="order-quick-action" data-order-quick-action="confirm" data-order-id="'+o.id+'">Confirm</button>';if(o.kind==='Booking'&&o.status==='Confirmed')return '<button class="order-quick-action" data-order-quick-action="inuse" data-order-id="'+o.id+'">Mark in use</button>';if(o.kind==='In-app order'&&o.status==='Confirmed')return '<button class="order-quick-action" data-order-quick-action="preparing" data-order-id="'+o.id+'">Start preparing</button>';if(o.status==='Preparing')return '<button class="order-quick-action" data-order-quick-action="ready" data-order-id="'+o.id+'">Mark ready</button>';if(o.status==='Ready')return '<button class="order-quick-action" data-order-quick-action="complete" data-order-id="'+o.id+'">Mark completed</button>';return ''}
function cabanaOrderCard(o){const owner=state.role==='Owner',paymentMethod=o.payment==='Charged to room'?'Room charge':'Gateway',paymentState=o.payment==='Charged to room'?o.settlement:o.payment==='Paid via gateway'?'Paid':'Payment pending',room=o.room? ' · Room '+esc(o.room):'';return '<article class="order-card compact-order-card"><button class="order-card-hit" data-detail="'+o.id+'"><div class="compact-order-heading"><div><span class="compact-order-type">'+cabanaOrderType(o)+'</span><h3>'+esc(o.item)+' <small>'+esc(o.quantity)+'</small></h3></div><span class="status '+o.status.toLowerCase().replaceAll(' ','-')+'">'+cabanaOrderStatus(o.status)+'</span></div><p class="compact-order-when">'+esc(o.when)+'</p><p class="compact-order-guest">'+esc(o.guest)+room+' · '+esc(o.hotel)+'</p>'+(o.notes?'<p class="compact-order-note">'+(o.notes.includes('Anniversary')?'Birthday or celebration reminder':'Guest note')+'</p>':'')+(owner?'<div class="compact-order-payment"><span>'+paymentMethod+'</span><span>'+paymentState+'</span><strong>'+esc(o.total)+'</strong></div>':'<div class="compact-order-payment staff-total"><strong>'+esc(o.total)+'</strong></div>')+'</button>'+(cabanaOrderQuickActions(o)?'<div class="order-quick-actions">'+cabanaOrderQuickActions(o)+'</div>':'')+'</article>'}
function ordersFilterSheetFinal(){if(!state.orderFilterSheet)return '';const type=state.orderFilterDraftType||state.orderTypeFilter||'All',payment=state.orderFilterDraftPayment||state.orderPaymentFilter||'All',status=state.orderFilterDraftStatus||state.orderStatusFilter||'All',listings=state.orderFilterDraftListings||state.orderListingFilter||[];const choice=(label,value,attr,current)=>'<button class="orders-filter-choice '+(current===value?'active':'')+'" '+attr+'="'+value+'"><span>'+label+'</span>'+(current===value?'<b>✓</b>':'')+'</button>';return '<div class="orders-filter-backdrop" data-order-filter-close></div><section class="orders-filter-sheet" role="dialog" aria-modal="true" aria-label="Order filters"><div class="sheet-handle"></div><div class="orders-filter-sheet-head"><div><h2>Filters</h2><span>Refine the Orders workspace</span></div><button data-order-filter-close aria-label="Close filters">×</button></div><fieldset><legend>Type</legend>'+choice('All types','All','data-order-filter-type',type)+choice('Bookings','Bookings','data-order-filter-type',type)+choice('In-app orders','In-app orders','data-order-filter-type',type)+choice('Counter charges','Counter charges','data-order-filter-type',type)+'</fieldset><fieldset><legend>Payment method</legend>'+choice('All methods','All','data-order-filter-payment',payment)+choice('Room charge','Charge to room','data-order-filter-payment',payment)+choice('Gateway','Gateway','data-order-filter-payment',payment)+'</fieldset><fieldset><legend>Status</legend>'+cabanaOrderStatuses.map(x=>choice(x,x,'data-order-filter-status',status)).join('')+'</fieldset><fieldset><legend>Listing</legend>'+listingsList().map(x=>'<button class="orders-filter-choice '+(listings.includes(x.name)?'active':'')+'" data-order-filter-listing="'+esc(x.name)+'"><span>'+esc(x.name)+'</span>'+(listings.includes(x.name)?'<b>✓</b>':'')+'</button>').join('')+'</fieldset><div class="orders-filter-actions"><button class="button ghost" data-order-filter-reset>Reset</button><button class="button primary" data-order-filter-apply>Apply filters</button></div></section>'}
function listingsList(){return listings.map(x=>({name:x.name}))}
function cabanaOrdersCalendar(){const scheduled=orders.filter(cabanaOrderIsScheduled),mode=state.calendarMode||'Month',selected=state.calendarSelectedDate||'Today',selectedOrders=scheduled.filter(o=>cabanaOrderDateLabel(o)===selected),days=['Sep 28','Sep 29','Sep 30','Today','Oct 3','Oct 4','Oct 5'];return '<section class="orders-calendar-workspace"><div class="orders-calendar-head"><div><h2>October 2026</h2><span>Scheduled services and pickups only</span></div><div class="orders-calendar-modes">'+['Month','Week','Day'].map(x=>'<button class="'+(mode===x?'active':'')+'" data-order-calendar-mode="'+x+'">'+x+'</button>').join('')+'</div></div><p class="orders-calendar-note">Unscheduled orders and counter charges remain in List.</p>'+(mode==='Month'?'<div class="orders-calendar-month">'+days.map(day=>'<button class="orders-calendar-day '+(day===selected?'active':'')+'" data-order-calendar-date="'+day+'"><strong>'+day+'</strong><span>'+scheduled.filter(o=>cabanaOrderDateLabel(o)===day).length+' orders</span></button>').join('')+'</div>':'<div class="orders-calendar-timeline">'+(selectedOrders.length?selectedOrders.map(cabanaOrderCard).join(''):'<p class="orders-calendar-empty">No scheduled orders for this date.</p>')+'</div>')+'<div class="orders-calendar-selected"><div><strong>'+selected+'</strong><span>'+selectedOrders.length+' scheduled '+(selectedOrders.length===1?'order':'orders')+'</span></div><button class="button small" data-block-availability>Block this date</button></div></section>'}
function cabanaOrdersWorkspace(){const tab=state.orderTimeTab||'Today',viewMode=state.orderView||'list',records=cabanaOrderFilteredRecords(),groups={};records.sort((a,b)=>{if(tab==='Today'&&a.status==='Pending'&&b.status!=='Pending')return -1;if(tab==='Today'&&b.status==='Pending'&&a.status!=='Pending')return 1;return cabanaOrderDateRank(a)-cabanaOrderDateRank(b)||cabanaOrderTimeValue(a)-cabanaOrderTimeValue(b)}).forEach(o=>{const key=cabanaOrderDateLabel(o);(groups[key]||(groups[key]=[])).push(o)});const groupMarkup=Object.entries(groups).map(([date,rows])=>'<section class="orders-date-group"><h2>'+date+'</h2>'+rows.map(cabanaOrderCard).join('')+'</section>').join('');const empty=state.orderConfirmationScope?'No orders match these filters.':tab==='Today'?'No orders today. Check Upcoming for scheduled orders.':tab==='Upcoming'?'No upcoming orders.':'No past orders.';const chips=cabanaAppliedOrderChips().map(([label,key])=>'<button class="orders-filter-chip" data-order-chip-remove="'+esc(key)+'">'+esc(label)+' ×</button>').join('');return '<div class="orders-workspace"><header class="orders-workspace-head"><h1>Orders</h1>'+(records.filter(o=>o.status==='Pending').length?'<button class="orders-confirm-counter '+(state.orderConfirmationScope?'active':'')+'" data-order-confirmations>2 to confirm</button>':'')+'</header><div class="orders-time-tabs" role="tablist">'+cabanaOrderTimeTabs.map(x=>'<button role="tab" aria-selected="'+(tab===x?'true':'false')+'" class="'+(tab===x?'active':'')+'" data-order-time="'+x+'">'+x+'</button>').join('')+'</div><div class="orders-controls"><div class="orders-control-row"><label class="orders-search"><i class="hgi-stroke hgi-search-01" aria-hidden="true"></i><input data-orders-search value="'+esc(state.query||'')+'" placeholder="Search guest, room, or order ID." aria-label="Search guest, room, or order ID" /></label><button class="orders-filters-button" data-orders-filter-toggle><i class="hgi-stroke hgi-filter-horizontal" aria-hidden="true"></i><span>Filters</span></button></div><div class="orders-view-switch" role="tablist">'+['list','calendar'].map(x=>'<button class="'+(viewMode===x?'active':'')+'" data-order-view="'+x+'">'+(x==='list'?'List':'Calendar')+'</button>').join('')+'</div>'+(chips?'<div class="orders-filter-chips">'+chips+'</div>':'')+(state.orderConfirmationScope?'<div class="orders-scope-banner"><strong>Pending confirmations</strong><span>Across all dates</span><button data-order-confirmations>Clear</button></div>':'')+'</div>'+(viewMode==='calendar'?cabanaOrdersCalendar():(groupMarkup||'<div class="orders-empty-state"><strong>'+empty+'</strong>'+(state.query||chips?'<button data-order-clear-filters>Clear filters</button>':'')+'</div>'))+'</div>'}
ordersView=function(){return cabanaOrdersWorkspace()};
function cabanaOrderDetailPage(){const o=orders.find(x=>x.id===state.detail);if(!o)return cabanaOrdersWorkspace();const owner=state.role==='Owner',paymentMethod=o.payment==='Charged to room'?'Room charge':'Gateway',paymentState=o.payment==='Charged to room'?o.settlement:o.payment==='Paid via gateway'?'Paid':'Payment pending',actions=cabanaOrderQuickActions(o),notes=o.notes||'No private notes yet.';return '<div class="orders-detail-page"><button class="back" data-page="orders">← Back to Orders</button><header class="orders-detail-header"><div><span>'+cabanaOrderType(o)+' · '+o.id+'</span><h1>'+esc(o.item)+'</h1></div><span class="status '+o.status.toLowerCase().replaceAll(' ','-')+'">'+o.status+'</span></header><section class="orders-detail-section"><h2>Guest</h2><p><strong>'+esc(o.guest)+'</strong><br>'+esc(o.hotel)+' · Room '+esc(o.room)+'</p><button class="button small" data-toast="Guest chat opened">Chat with guest</button></section><section class="orders-detail-section"><h2>Order</h2><dl><div><dt>Listing</dt><dd>'+esc(o.item)+'</dd></div><div><dt>Quantity</dt><dd>'+esc(o.quantity)+'</dd></div><div><dt>Scheduled time</dt><dd>'+esc(o.when)+'</dd></div><div><dt>Guest notes</dt><dd>'+esc(o.notes||'None')+'</dd></div></dl></section><section class="orders-detail-section"><h2>Service location</h2><p>'+esc(o.fulfilment)+'<br><span class="muted">Meeting instructions shown to the team.</span></p></section><section class="orders-detail-section"><h2>Payment</h2><dl><div><dt>Total</dt><dd>'+esc(o.total)+'</dd></div><div><dt>Method</dt><dd>'+paymentMethod+'</dd></div><div><dt>Payment state</dt><dd>'+paymentState+'</dd></div>'+(owner?'<div><dt>Settlement</dt><dd>'+esc(o.settlement)+'</dd></div>':'')+'</dl>'+(owner?'<button class="button ghost" data-page="earnings">View in Earnings →</button>':'')+'</section><section class="orders-detail-section"><h2>Activity</h2><div class="orders-activity-list">'+o.timeline.map(x=>'<div><strong>'+esc(x[0])+'</strong><span>'+esc(x[1])+' · Team member</span></div>').join('')+'</div></section><section class="orders-detail-section"><h2>Private vendor notes</h2><p><strong>Visible only to your team.</strong><br>'+esc(notes)+'</p></section>'+(actions?'<footer class="orders-detail-footer">'+actions+'</footer>':'')+'</div>'}
const orderDetailBeforeWorkspace=orderDetail;
orderDetail=function(){return cabanaOrderDetailPage()};
const cabanaOrderDetailPageBeforeRole=cabanaOrderDetailPage;
cabanaOrderDetailPage=function(){const html=cabanaOrderDetailPageBeforeRole();if(state.role!=='Staff')return html;return html.replace(/<section class="orders-detail-section"><h2>Payment<\/h2>[\s\S]*?<\/section>/,'<section class="orders-detail-section"><h2>Payment</h2><dl><div><dt>Total</dt><dd>'+esc(orders.find(x=>x.id===state.detail)?.total||'')+'</dd></div></dl></section>')};
function bindOrdersWorkspace(){document.querySelectorAll('[data-order-time]').forEach(b=>b.onclick=()=>{state.orderTimeTab=b.dataset.orderTime;state.orderConfirmationScope=false;state.query='';render()});document.querySelectorAll('[data-order-view]').forEach(b=>b.onclick=()=>{state.orderView=b.dataset.orderView;render()});document.querySelectorAll('[data-orders-filter-toggle]').forEach(b=>b.onclick=()=>{state.orderFilterDraftType=state.orderTypeFilter||'All';state.orderFilterDraftPayment=state.orderPaymentFilter||'All';state.orderFilterDraftStatus=state.orderStatusFilter||'All';state.orderFilterDraftListings=[...(state.orderListingFilter||[])];state.orderFilterSheet=true;render()});document.querySelectorAll('[data-order-filter-close]').forEach(b=>b.onclick=()=>{state.orderFilterSheet=false;render()});document.querySelectorAll('[data-order-filter-type]').forEach(b=>b.onclick=()=>{state.orderFilterDraftType=b.dataset.orderFilterType;render()});document.querySelectorAll('[data-order-filter-payment]').forEach(b=>b.onclick=()=>{state.orderFilterDraftPayment=b.dataset.orderFilterPayment;render()});document.querySelectorAll('[data-order-filter-status]').forEach(b=>b.onclick=()=>{state.orderFilterDraftStatus=b.dataset.orderFilterStatus;render()});document.querySelectorAll('[data-order-filter-listing]').forEach(b=>b.onclick=()=>{const name=b.dataset.orderFilterListing,items=state.orderFilterDraftListings||[];state.orderFilterDraftListings=items.includes(name)?items.filter(x=>x!==name):items.concat(name);render()});document.querySelectorAll('[data-order-filter-reset]').forEach(b=>b.onclick=()=>{state.orderTypeFilter='All';state.orderPaymentFilter='All';state.orderStatusFilter='All';state.orderListingFilter=[];state.orderFilterSheet=false;render()});document.querySelectorAll('[data-order-filter-apply]').forEach(b=>b.onclick=()=>{state.orderTypeFilter=state.orderFilterDraftType||'All';state.orderPaymentFilter=state.orderFilterDraftPayment||'All';state.orderStatusFilter=state.orderFilterDraftStatus||'All';state.orderListingFilter=state.orderFilterDraftListings||[];state.orderFilterSheet=false;render()});document.querySelectorAll('[data-order-chip-remove]').forEach(b=>b.onclick=()=>{const key=b.dataset.orderChipRemove;if(key==='type')state.orderTypeFilter='All';if(key==='payment')state.orderPaymentFilter='All';if(key==='status')state.orderStatusFilter='All';if(key.startsWith('listing:'))state.orderListingFilter=(state.orderListingFilter||[]).filter(x=>x!==key.slice(8));render()});document.querySelectorAll('[data-order-confirmations]').forEach(b=>b.onclick=()=>{state.orderConfirmationScope=!state.orderConfirmationScope;state.orderStatusFilter=state.orderConfirmationScope?'Pending':'All';state.orderTimeTab=state.orderConfirmationScope?'Today':state.orderTimeTab;render()});document.querySelectorAll('[data-order-clear-filters]').forEach(b=>b.onclick=()=>{state.query='';state.orderTypeFilter='All';state.orderPaymentFilter='All';state.orderStatusFilter='All';state.orderListingFilter=[];state.orderConfirmationScope=false;render()});const search=document.querySelector('[data-orders-search]');if(search)search.oninput=e=>{state.query=e.target.value;const pos=e.target.selectionStart;render();const next=document.querySelector('[data-orders-search]');if(next){next.focus();next.setSelectionRange(pos,pos)}};document.querySelectorAll('[data-order-calendar-mode]').forEach(b=>b.onclick=()=>{state.calendarMode=b.dataset.orderCalendarMode;render()});document.querySelectorAll('[data-order-calendar-date]').forEach(b=>b.onclick=()=>{state.calendarSelectedDate=b.dataset.orderCalendarDate;render()});document.querySelectorAll('[data-block-availability]').forEach(b=>b.onclick=()=>toast('Availability editor opened in Listings'));document.querySelectorAll('[data-order-quick-action]').forEach(b=>b.onclick=()=>{if(b.disabled)return;const o=orders.find(x=>x.id===b.dataset.orderId);if(!o)return;b.disabled=true;const action=b.dataset.orderQuickAction;if(action==='confirm')o.status='Confirmed';if(action==='inuse')o.status='In use';if(action==='preparing')o.status='Preparing';if(action==='ready')o.status='Ready';if(action==='complete')o.status='Completed';state.detail=null;render()})}

/* Final Orders control refinement: one date-range container and a view dropdown. */
function cabanaOrdersWorkspaceRefined(){
  let html=cabanaOrdersWorkspace();
  html=html.replace(/<div class="orders-time-tabs" role="tablist">([\s\S]*?)<\/div><div class="orders-controls">/,'<div class="orders-time-tabs" role="tablist" aria-label="Order time period"><div class="orders-time-tabs-inner">$1</div></div><div class="orders-controls">');
  html=html.replace(/<div class="orders-view-switch" role="tablist">[\s\S]*?<\/div>/,ordersViewDropdownMarkup(state.orderView||'list'));
  return html;
}
ordersView=function(){return cabanaOrdersWorkspaceRefined()};
const bindOrdersWorkspaceBeforeDropdown=bindOrdersWorkspace;
bindOrdersWorkspace=function(){
  bindOrdersWorkspaceBeforeDropdown();
  document.querySelectorAll('select[data-order-view]').forEach(select=>select.onchange=()=>{state.orderView=select.value;render()});
};

/* Final Orders workflow refinement: Requests, Active, and Past. */
function cabanaWorkflowIsRequest(o){return (o.status||'')==='Pending'}
function cabanaWorkflowIsActive(o){return ['Confirmed','In use','Preparing','Ready'].includes(o.status||'')}
function cabanaWorkflowIsPast(o){return ['Completed','Declined','Cancelled','No-show','Posted to room','Voided','Settled'].includes(o.status||'')}
function cabanaWorkflowStamp(o){const source=(o.timeline&&o.timeline.length?o.timeline[o.timeline.length-1][1]:o.when)||'',match=source.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})/i),months={Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12},month=match?months[match[1].slice(0,3)]:source.includes('Today')?13:0,day=match?Number(match[2]):source.includes('Today')?31:0;return month*32*1440+day*1440+cabanaOrderTimeValue({when:source})}
function cabanaWorkflowDateGroup(o){const when=o.when||'';if(['In use','Preparing','Ready'].includes(o.status||''))return 'In progress';if(when.includes('Today')||when.startsWith('Oct 2'))return 'Today';if(when.includes('Tomorrow')||when.startsWith('Oct 3'))return 'Tomorrow';if(cabanaOrderIsScheduled(o))return when.split(' · ')[0]||'Later';return 'Unscheduled'}
function cabanaWorkflowFilteredRecords(tab){const query=(state.query||'').trim().toLowerCase(),type=state.orderTypeFilter||'All',status=state.orderStatusFilter||'All',payment=state.orderPaymentFilter||'All',listing=state.orderListingFilter||[];return orders.filter(o=>{const routed=tab==='Requests'?cabanaWorkflowIsRequest(o):tab==='Active'?cabanaWorkflowIsActive(o):cabanaWorkflowIsPast(o);return routed&&(!query||`${o.id} ${o.guest} ${o.room} ${o.item}`.toLowerCase().includes(query))&&cabanaOrderTypeMatches(o,type)&&(status==='All'||o.status===status)&&cabanaOrderPaymentMatch(o)&&(!listing.length||listing.includes(o.item))})}
function cabanaWorkflowCard(o){let html=cabanaOrderCard(o);if(o.status==='Pending'&&state.role==='Owner')html=html.replace(/<div class="order-quick-actions"><button class="order-quick-action" data-order-quick-action="confirm" data-order-id="[^"]+">Confirm<\/button><\/div>/,'<div class="order-quick-actions workflow-request-actions"><button class="order-quick-action" data-order-quick-action="confirm" data-order-id="'+o.id+'">Confirm</button><button class="order-quick-action decline" data-order-quick-action="decline" data-order-id="'+o.id+'">Decline</button></div>');return html}
function cabanaWorkflowTabs(tab,pendingCount){const allInstant=(listings||[]).every(l=>(l.confirmationMethod||state.confirmationMethod||'Manual approval')==='Instant confirmation'),showRequests=pendingCount>0||!allInstant,tabs=showRequests?['Requests','Active','Past']:['Active','Past'];return '<div class="orders-workflow-tabs" role="tablist" aria-label="Order workflow">'+tabs.map(x=>'<button role="tab" aria-selected="'+(tab===x?'true':'false')+'" class="'+(tab===x?'active':'')+'" data-order-workflow="'+x+'">'+x+(x==='Requests'&&pendingCount?'<b class="orders-workflow-badge">'+pendingCount+'</b>':'')+'</button>').join('')+'</div>'}
function cabanaWorkflowPastFilters(tab){if(tab!=='Past')return '';const options=[['Completed','status'],['Declined','status'],['Cancelled','status'],['No-show','status'],['Counter charges','type']];return '<div class="orders-past-filters" role="group" aria-label="Past order status filters">'+options.map(([label,kind])=>{const active=kind==='type'?state.orderTypeFilter==='Counter charges':state.orderStatusFilter===label;return '<button class="'+(active?'active':'')+'" data-order-past-filter="'+kind+':'+label+'">'+label+'</button>'}).join('')+'</div>'}
function ordersDateFilterMarkup(){return '<button class="dashboard-date-filter-below-action orders-date-filter" data-header-filter aria-label="Change Orders date range"><span><strong>'+dashboardAppliedRangeLabel()+'</strong><small>'+dashboardExactRangeLabel()+'</small></span><i class="hgi-stroke hgi-calendar-03" aria-hidden="true"></i></button>'}
function ordersViewDropdownMarkup(viewMode){const label=viewMode==='calendar'?'Calendar view':'List view';return '<div class="orders-view-dropdown custom-orders-view-dropdown"><button type="button" data-order-view-toggle aria-expanded="'+(state.orderViewMenuOpen?'true':'false')+'" aria-label="Orders view: '+label+'"><span>'+label+'</span><span class="orders-view-dropdown-chevron" aria-hidden="true">⌄</span></button>'+(state.orderViewMenuOpen?'<div class="orders-view-dropdown-menu" role="menu"><button type="button" data-order-view-option="list" role="menuitem" class="'+(viewMode==='list'?'active':'')+'">List view</button><button type="button" data-order-view-option="calendar" role="menuitem" class="'+(viewMode==='calendar'?'active':'')+'">Calendar view</button></div>':'')+'</div>'}
function cabanaOrdersWorkflowWorkspace(){const pendingCount=orders.filter(cabanaWorkflowIsRequest).length,allInstant=(listings||[]).every(l=>(l.confirmationMethod||state.confirmationMethod||'Manual approval')==='Instant confirmation');let tab=['Requests','Active','Past'].includes(state.orderTimeTab)?state.orderTimeTab:(pendingCount||!allInstant?'Requests':'Active');if(tab==='Requests'&&!pendingCount&&allInstant)tab='Active';state.orderTimeTab=tab;const viewMode=state.orderView||'list',records=cabanaWorkflowFilteredRecords(tab),groups={};if(tab==='Active')records.sort((a,b)=>{const ag=cabanaWorkflowDateGroup(a),bg=cabanaWorkflowDateGroup(b),rank=x=>x==='In progress'?0:x==='Today'?1:x==='Tomorrow'?2:x==='Unscheduled'?4:3;return rank(ag)-rank(bg)||cabanaOrderTimeValue(a)-cabanaOrderTimeValue(b)});else if(tab==='Requests')records.sort((a,b)=>cabanaWorkflowStamp(a)-cabanaWorkflowStamp(b));else records.sort((a,b)=>cabanaWorkflowStamp(b)-cabanaWorkflowStamp(a));records.forEach(o=>{const key=tab==='Active'?cabanaWorkflowDateGroup(o):cabanaOrderDateLabel(o);(groups[key]||(groups[key]=[])).push(o)});const groupMarkup=Object.entries(groups).map(([date,rows])=>'<section class="orders-date-group"><h2>'+date+'</h2>'+rows.map(cabanaWorkflowCard).join('')+'</section>').join(''),empty=tab==='Requests'?'No requests waiting for confirmation.':tab==='Active'?'No active orders.':'No past orders.',chips=cabanaAppliedOrderChips().map(([label,key])=>'<button class="orders-filter-chip" data-order-chip-remove="'+esc(key)+'">'+esc(label)+' ×</button>').join(''),calendarModes=viewMode==='calendar'?'<div class="orders-calendar-workflow-tabs" role="tablist" aria-label="Calendar view"><button class="'+((state.calendarMode||'Month')==='Month'?'active':'')+'" data-order-calendar-mode="Month">Month</button><button class="'+(state.calendarMode==='Week'?'active':'')+'" data-order-calendar-mode="Week">Week</button><button class="'+(state.calendarMode==='Day'?'active':'')+'" data-order-calendar-mode="Day">Day</button></div>':'';return '<div class="orders-workspace"><header class="orders-workspace-head"><h1>Orders</h1>'+(pendingCount?'<button class="orders-confirm-counter '+(tab==='Requests'?'active':'')+'" data-order-confirmations>'+pendingCount+' to confirm</button>':'')+'</header>'+(viewMode==='list'?cabanaWorkflowTabs(tab,pendingCount):calendarModes)+ordersDateFilterMarkup()+'<div class="orders-controls"><div class="orders-control-row"><label class="orders-search"><i class="hgi-stroke hgi-search-01" aria-hidden="true"></i><input data-orders-search value="'+esc(state.query||'')+'" placeholder="Search guest, room, or order ID." aria-label="Search guest, room, or order ID" /></label><button class="orders-filters-button" data-orders-filter-toggle><i class="hgi-stroke hgi-filter-horizontal" aria-hidden="true"></i><span>Filters</span></button></div>'+ordersViewDropdownMarkup(viewMode)+cabanaWorkflowPastFilters(tab)+(chips?'<div class="orders-filter-chips">'+chips+'</div>':'')+(state.orderConfirmationScope?'<div class="orders-scope-banner"><strong>Pending confirmations</strong><span>Across all dates</span><button data-order-confirmations>Clear</button></div>':'')+'</div>'+(viewMode==='calendar'?cabanaOrdersCalendar():(groupMarkup||'<div class="orders-empty-state"><strong>'+empty+'</strong>'+(state.query||chips?'<button data-order-clear-filters>Clear filters</button>':'')+'</div>'))+'</div>'}
function cabanaOrdersCalendarWorkflow(){const scheduled=orders.filter(o=>cabanaWorkflowIsActive(o)&&cabanaOrderIsScheduled(o)),mode=state.calendarMode||'Month',selected=state.calendarSelectedDate||'Today',selectedOrders=scheduled.filter(o=>cabanaOrderDateLabel(o)===selected),days=['Sep 28','Sep 29','Sep 30','Today','Tomorrow','Oct 3','Oct 4'];return '<section class="orders-calendar-workspace"><div class="orders-calendar-head"><div><h2>Scheduled orders</h2><span>Confirmed and ongoing scheduled orders only</span></div></div><p class="orders-calendar-note">Unscheduled orders and counter charges remain in List.</p>'+(mode==='Month'?'<div class="orders-calendar-month">'+days.map(day=>'<button class="orders-calendar-day '+(day===selected?'active':'')+'" data-order-calendar-date="'+day+'"><strong>'+day+'</strong><span>'+scheduled.filter(o=>cabanaOrderDateLabel(o)===day).length+' orders</span></button>').join('')+'</div>':'<div class="orders-calendar-timeline">'+(selectedOrders.length?selectedOrders.map(cabanaWorkflowCard).join(''):'<p class="orders-calendar-empty">No scheduled orders for this date.</p>')+'</div>')+'<div class="orders-calendar-selected"><div><strong>'+selected+'</strong><span>'+selectedOrders.length+' scheduled '+(selectedOrders.length===1?'order':'orders')+'</span></div><button class="button small" data-block-availability>Block this date</button></div></section>'}
cabanaOrdersCalendar=cabanaOrdersCalendarWorkflow;
ordersView=function(){return cabanaOrdersWorkflowWorkspace()};
const bindOrdersWorkflowBefore=bindOrdersWorkspace;
bindOrdersWorkspace=function(){bindOrdersWorkflowBefore();document.querySelectorAll('[data-order-workflow]').forEach(button=>button.onclick=()=>{state.orderTimeTab=button.dataset.orderWorkflow;state.orderConfirmationScope=false;state.orderStatusFilter='All';state.orderTypeFilter='All';state.query='';render()});document.querySelectorAll('[data-order-past-filter]').forEach(button=>button.onclick=()=>{const [kind,value]=button.dataset.orderPastFilter.split(':');if(kind==='type'){state.orderTypeFilter='Counter charges';state.orderStatusFilter='All'}else{state.orderTypeFilter='All';state.orderStatusFilter=value}render()});document.querySelectorAll('[data-order-filter-link]').forEach(button=>button.onclick=()=>{const filter=button.dataset.orderFilterLink;state.page='orders';state.detail=null;state.orderTimeTab=filter==='Pending'?'Requests':'Active';state.orderStatusFilter=filter==='Pending'?'All':filter;state.orderTypeFilter='All';state.orderView='list';render()});document.querySelectorAll('[data-schedule-filter]').forEach(button=>button.onclick=()=>{state.page='orders';state.detail=null;state.orderTimeTab='Active';state.orderStatusFilter='All';state.orderTypeFilter='All';state.orderView='list';render()});document.querySelectorAll('[data-order-quick-action="decline"]').forEach(button=>button.onclick=()=>{const order=orders.find(x=>x.id===button.dataset.orderId);if(order)order.status='Declined';state.detail=null;render()});document.querySelectorAll('[data-confirmation-method]').forEach(button=>button.onclick=()=>{state.confirmationMethod=button.dataset.confirmationMethod;render()})};
const bindOrdersWorkflowRoutingBefore=bindOrdersWorkspace;
bindOrdersWorkspace=function(){bindOrdersWorkflowRoutingBefore();document.querySelectorAll('[data-order-quick-action="confirm"]').forEach(button=>button.onclick=()=>{const order=orders.find(x=>x.id===button.dataset.orderId);if(order)order.status='Confirmed';state.orderTimeTab='Active';state.detail=null;render()});document.querySelectorAll('[data-order-quick-action="decline"]').forEach(button=>button.onclick=()=>{const order=orders.find(x=>x.id===button.dataset.orderId);if(order)order.status='Declined';state.orderTimeTab='Past';state.detail=null;render()})};
const bindOrdersWorkflowOrderBefore=bindOrdersWorkspace;
bindOrdersWorkspace=function(){bindOrdersWorkflowOrderBefore();if(state.orderTimeTab==='Past'){const month={Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12},rank=label=>{if(label==='Today')return 999999;if(label==='Tomorrow')return 999998;const match=label.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d+)/);return match?month[match[1]]*32+Number(match[2]):0},workspace=document.querySelector('.orders-workspace');if(workspace)[...workspace.querySelectorAll(':scope > .orders-date-group')].sort((a,b)=>rank(b.querySelector('h2')?.textContent.trim()||'')-rank(a.querySelector('h2')?.textContent.trim()||'')).forEach(group=>workspace.appendChild(group))}};
const listingsCleanBeforeConfirmation=listingsClean;
listingsClean=function(){const method=state.confirmationMethod||'Manual approval';return listingsCleanBeforeConfirmation()+'<section class="card listing-confirmation-setting"><div class="card-header"><div><h2>Confirmation method</h2><span class="count">Controls new orders; existing requests stay unchanged.</span></div></div><div class="confirmation-method-options"><button class="'+(method==='Instant confirmation'?'active':'')+'" data-confirmation-method="Instant confirmation">Instant confirmation</button><button class="'+(method==='Manual approval'?'active':'')+'" data-confirmation-method="Manual approval">Manual approval</button></div></section>'};
const ordersFilterSheetBeforeWorkflow=ordersFilterSheetFinal;
ordersFilterSheetFinal=function(){let html=ordersFilterSheetBeforeWorkflow();if(!html)return html;const tab=state.orderTimeTab||'Requests',options=tab==='Requests'?['Pending']:tab==='Active'?['All','Confirmed','In use','Preparing','Ready']:['All','Completed','Declined','No-show','Posted to room','Voided','Settled'],current=state.orderFilterDraftStatus||state.orderStatusFilter||'All',choice=value=>'<button class="orders-filter-choice '+(current===value?'active':'')+'" data-order-filter-status="'+value+'"><span>'+value+'</span>'+(current===value?'<b>✓</b>':'')+'</button>';return html.replace(/<fieldset><legend>Status<\/legend>[\s\S]*?<\/fieldset>/,'<fieldset><legend>Status</legend>'+options.map(choice).join('')+'</fieldset>')};

/* Owner-only Earnings workspace. Outstanding balances stay current while the ledger and paid history honor the selected range. */
const cabanaEarningsTransactions=[
 {id:'TX-1042',date:'Oct 2, 2026',sort:202610021500,listing:'Whole Sans Rival Cake',guest:'John D.',room:'101',orderId:'ORD-1042',type:'Booking',method:'Room charge',gross:1200,commission:120,refunds:0,adjustments:0,status:'Awaiting guest checkout',detail:'Guest checkout is expected on Oct 5.'},
 {id:'TX-1048',date:'Oct 5, 2026',sort:202610051200,listing:'Island Hopping Tour',guest:'Maya Tan',room:'314',orderId:'CB-9001',type:'Booking',method:'Room charge',gross:600,commission:60,refunds:0,adjustments:0,status:'Awaiting settlement',detail:'Guest checkout completed; hotel settlement is being reconciled.'},
 {id:'TX-1037',date:'Oct 2, 2026',sort:202610020800,listing:'Island Breakfast Box',guest:'Oliver Brown',room:'205',orderId:'ORD-1037',type:'In-app order',method:'Gateway',gross:1360,commission:136,refunds:0,adjustments:0,status:'Awaiting settlement',detail:'Payment was received and is being reconciled.'},
 {id:'TX-2208',date:'Oct 2, 2026',sort:202610021015,listing:'Coffee and pastry set',guest:'Maya Tan',room:'314',orderId:'CT-2208',type:'Counter charge',method:'Room charge',gross:540,commission:54,refunds:0,adjustments:0,status:'Ready for payout',detail:'Posted to room; awaiting settlement.'},
 {id:'TX-1007',date:'Oct 1, 2026',sort:202610011200,listing:'Private bakery tasting',guest:'Amelia Reyes',room:'508',orderId:'CB-8821',type:'Booking',method:'Gateway',gross:4800,commission:480,refunds:0,adjustments:0,status:'In payout',detail:'Assigned to the next scheduled payout.'},
 {id:'TX-0991',date:'Sep 29, 2026',sort:202609290832,listing:'Island Breakfast Box',guest:'Oliver Brown',room:'205',orderId:'ORD-1037',type:'In-app order',method:'Gateway',gross:1360,commission:136,refunds:0,adjustments:0,status:'Paid',detail:'Included in payout CAB-PAY-1003.'},
 {id:'TX-0987',date:'Sep 28, 2026',sort:202609282110,listing:'Chef’s counter experience',guest:'Priya Shah',room:'412',orderId:'CB-8812',type:'Refund',method:'Room charge',gross:0,commission:0,refunds:1200,adjustments:0,status:'Deducted from payout',detail:'Cancelled tour refund deducted from payout.'}
];
const cabanaEarningsPayouts=[
 {id:'CAB-PAY-1003',date:'Oct 3, 2026',period:'Sep 22–28, 2026',status:'Sent',net:31240,account:'•••• 4821',reference:'CAB-PAY-1003',reason:'',items:['TX-0991','TX-0987']},
 {id:'CAB-PAY-1002',date:'Sep 26, 2026',period:'Sep 15–21, 2026',status:'Processing',net:18450,account:'•••• 4821',reference:'CAB-PAY-1002',reason:'Bank processing is still in progress.',items:['TX-1007']},
 {id:'CAB-PAY-1001',date:'Sep 19, 2026',period:'Sep 8–14, 2026',status:'Failed',net:12600,account:'•••• 4821',reference:'CAB-PAY-1001',reason:'Receiving bank rejected the transfer. Check the payout account.',items:[]}
];
function earningsMoney(value){const number=Number(value)||0;return (number<0?'−':'')+'₱'+Math.abs(number).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2})}
function earningsDateObject(value){const parsed=new Date(value+' 00:00:00');return Number.isNaN(parsed.getTime())?new Date():parsed}
function earningsShortDate(value){return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(earningsDateObject(value))}
function earningsToday(){return new Date()}
function earningsCurrentWeekBounds(){const now=earningsToday(),day=now.getDay(),start=new Date(now);start.setDate(now.getDate()-(day===0?6:day-1));start.setHours(0,0,0,0);const end=new Date(start);end.setDate(start.getDate()+6);return [start,end]}
function earningsRangeBounds(range){const now=earningsToday(),year=now.getFullYear(),month=now.getMonth(),day=now.getDate();if(range==='This week')return earningsCurrentWeekBounds();if(range==='Last week'){const current=earningsCurrentWeekBounds(),start=new Date(current[0]);start.setDate(start.getDate()-7);const end=new Date(current[1]);end.setDate(end.getDate()-7);return [start,end]}if(range==='This month')return [new Date(year,month,1),new Date(year,month+1,0)];if(range==='Last month')return [new Date(year,month-1,1),new Date(year,month,0)];if(range==='Custom range'&&state.earningsCustomFrom&&state.earningsCustomTo)return [earningsDateObject(state.earningsCustomFrom),earningsDateObject(state.earningsCustomTo)];return [new Date(year,month,day),new Date(year,month,day)]}
function earningsDateRangeLabel(range){const bounds=earningsRangeBounds(range||state.earningsRange||'This week'),same=bounds[0].getFullYear()===bounds[1].getFullYear()&&bounds[0].getMonth()===bounds[1].getMonth(),fmt=x=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(x);if(same&&bounds[0].getDate()!==bounds[1].getDate())return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(bounds[0])+'–'+bounds[1].getDate()+', '+bounds[1].getFullYear();if(bounds[0].getTime()===bounds[1].getTime())return fmt(bounds[0]);return fmt(bounds[0])+'–'+fmt(bounds[1])}
function earningsTransactionNet(tx){return tx.gross-tx.commission-tx.refunds+tx.adjustments}
function earningsPayoutNet(payout){return payout.items.reduce((sum,id)=>{const tx=cabanaEarningsTransactions.find(row=>row.id===id);return sum+(tx?earningsTransactionNet(tx):0)},0)}
function earningsSelectedTransactions(){const range=state.earningsRange||'This week',bounds=earningsRangeBounds(range),query=(state.earningsQuery||'').trim().toLowerCase(),method=state.earningsFilterMethod||'All',type=state.earningsFilterType||'All',status=state.earningsFilterStatus||'All';return cabanaEarningsTransactions.filter(tx=>{const date=earningsDateObject(tx.date),search=(tx.listing+' '+tx.guest+' '+tx.room+' '+tx.orderId+' '+tx.id).toLowerCase();return date>=bounds[0]&&date<=new Date(bounds[1].getTime()+86399999)&&(!query||search.includes(query))&&(method==='All'||tx.method===method)&&(type==='All'||tx.type===type)&&(status==='All'||tx.status===status)})}
function earningsSummary(){const rows=earningsSelectedTransactions(),gross=rows.reduce((sum,x)=>sum+x.gross,0),commission=rows.reduce((sum,x)=>sum+x.commission,0),refunds=rows.reduce((sum,x)=>sum+x.refunds,0),adjustments=rows.reduce((sum,x)=>sum+x.adjustments,0);return {rows,gross,commission,refunds,adjustments,net:gross-commission-refunds+adjustments}}
function earningsNextPayoutDate(){const now=earningsToday(),next=new Date(now);next.setDate(now.getDate()+((5-now.getDay()+7)%7||7));return next.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric',year:'numeric'})}
function earningsTransactionStatusClass(status){return status.toLowerCase().replaceAll(' ','-')}
function earningsUpcomingView(){
 const onlyAwaiting=state.earningsFilterStatus==='Awaiting guest checkout',outstanding=cabanaEarningsTransactions.filter(x=>['Awaiting guest checkout','Awaiting settlement','Ready for payout','In payout'].includes(x.status)&&(!onlyAwaiting||x.status==='Awaiting guest checkout'));
 const groups=[['Awaiting guest checkout',outstanding.filter(x=>['Awaiting guest checkout','Awaiting settlement'].includes(x.status))],['Ready for payout',outstanding.filter(x=>x.status==='Ready for payout')],['In next payout',outstanding.filter(x=>x.status==='In payout')]];
 return '<div class="earnings-scope-label">Current outstanding amounts</div>'+groups.map(group=>group[1].length?'<section class="earnings-upcoming-group"><h2>'+group[0]+'</h2>'+group[1].map(x=>'<button class="earnings-money-row" data-earnings-transaction="'+x.id+'"><span><strong>'+esc(x.listing)+'</strong><small>'+esc(x.guest)+' · Room '+esc(x.room)+'</small></span><b>'+earningsMoney(earningsTransactionNet(x))+'</b><em class="earnings-status '+earningsTransactionStatusClass(x.status)+'">'+x.status+'</em><small>'+esc(x.detail)+'</small></button>').join('')+'</section>':'').join('')+'<p class="earnings-note">Guest checkout alone does not prove settlement. Payments being reconciled are shown as <strong>Awaiting settlement</strong>.</p>';
}
function earningsPaidView(){
 const payouts=cabanaEarningsPayouts.slice().sort((a,b)=>earningsDateObject(b.date)-earningsDateObject(a.date));
 return '<section class="earnings-list-section"><h2>Payout history</h2>'+(payouts.length?payouts.map(x=>'<button class="earnings-payout-row" data-earnings-payout="'+x.id+'"><span><strong>'+x.date+'</strong><small>'+x.period+' · '+x.account+'</small></span><b>'+earningsMoney(earningsPayoutNet(x))+'</b><em class="earnings-status '+x.status.toLowerCase()+'">'+x.status+'</em></button>').join(''):'<p class="earnings-empty">No payouts yet.</p>')+'</section>';
}
function earningsTransactionsView(){
 const summary=earningsSummary(),rows=summary.rows.slice().sort((a,b)=>b.sort-a.sort),chips=[['Method',state.earningsFilterMethod],['Type',state.earningsFilterType],['Status',state.earningsFilterStatus]].filter(x=>x[1]&&x[1]!=='All').map(x=>'<button class="earnings-filter-chip" data-earnings-chip="'+x[0]+'">'+x[0]+': '+x[1]+' ×</button>').join('');
 return '<div class="earnings-transaction-toolbar"><label class="earnings-search"><i class="hgi-stroke hgi-search-01" aria-hidden="true"></i><input data-earnings-search value="'+esc(state.earningsQuery||'')+'" placeholder="Search guest, listing, order ID, or transaction reference" aria-label="Search transactions"></label><button class="earnings-filters-trigger" data-earnings-filter-toggle>Filters</button></div>'+(chips?'<div class="earnings-filter-chips">'+chips+'</div>':'')+'<div class="earnings-scope-label">Transaction date · '+earningsDateRangeLabel(state.earningsRange)+'</div><section class="earnings-transaction-list">'+(rows.length?rows.map(x=>'<button class="earnings-transaction-row" data-earnings-transaction="'+x.id+'"><span><strong>'+esc(x.listing)+'</strong><small>'+x.date+' · '+esc(x.guest)+' · '+x.method+'</small><small>'+x.type+' · '+x.id+'</small></span><b>'+earningsMoney(earningsTransactionNet(x))+'</b><em class="earnings-status '+earningsTransactionStatusClass(x.status)+'">'+x.status+'</em></button>').join(''):'<p class="earnings-empty">No transactions match these filters.</p>')+'</section>';
}
function earningsPayoutDetailView(payout){
 const items=cabanaEarningsTransactions.filter(x=>payout.items.includes(x.id));
 const payoutNet=items.reduce((sum,x)=>sum+earningsTransactionNet(x),0);
 return '<div class="earnings-detail-page"><button class="earnings-back" data-earnings-back>← Earnings</button><header class="earnings-detail-header"><div><span>Payout details</span><h1>'+payout.id+'</h1></div><em class="earnings-status '+payout.status.toLowerCase()+'">'+payout.status+'</em></header><section class="earnings-detail-card"><h2>Payout period</h2><p>'+payout.period+'<br>'+payout.date+' · '+payout.account+'</p>'+(payout.reason?'<p class="earnings-warning">'+payout.reason+'</p>':'')+'</section><section class="earnings-detail-card"><h2>Included transactions</h2>'+(items.length?items.map(x=>'<div class="earnings-detail-line"><span>'+esc(x.listing)+'<small>'+x.id+'</small></span><b>'+earningsMoney(earningsTransactionNet(x))+'</b></div>').join(''):'<p>No transactions included.</p>')+'</section><section class="earnings-detail-card"><h2>Statement</h2><dl><div><dt>Gross</dt><dd>'+earningsMoney(items.reduce((s,x)=>s+x.gross,0))+'</dd></div><div><dt>Commission</dt><dd>−'+earningsMoney(items.reduce((s,x)=>s+x.commission,0))+'</dd></div><div><dt>Refunds</dt><dd>−'+earningsMoney(items.reduce((s,x)=>s+x.refunds,0))+'</dd></div><div><dt>Adjustments</dt><dd>'+earningsMoney(items.reduce((s,x)=>s+x.adjustments,0))+'</dd></div><div class="earnings-net-line"><dt>Net amount</dt><dd>'+earningsMoney(payoutNet)+'</dd></div><div><dt>Reference</dt><dd>'+payout.reference+'</dd></div></dl><button class="button ghost" data-earnings-statement>Download statement PDF</button></section></div>';
}
function earningsTransactionDetailView(tx){
 return '<div class="earnings-detail-page"><button class="earnings-back" data-earnings-back>← Earnings</button><header class="earnings-detail-header"><div><span>Transaction details</span><h1>'+esc(tx.listing)+'</h1></div><em class="earnings-status '+earningsTransactionStatusClass(tx.status)+'">'+tx.status+'</em></header><section class="earnings-detail-card"><h2>Transaction</h2><p>'+tx.date+' · '+tx.id+'<br>'+esc(tx.guest)+' · Room '+esc(tx.room)+'<br>'+tx.type+' · '+tx.method+' · Order '+tx.orderId+'</p></section><section class="earnings-detail-card"><h2>Financial breakdown</h2><dl><div><dt>Gross</dt><dd>'+earningsMoney(tx.gross)+'</dd></div><div><dt>Commission</dt><dd>−'+earningsMoney(tx.commission)+'</dd></div><div><dt>Refunds</dt><dd>−'+earningsMoney(tx.refunds)+'</dd></div><div><dt>Adjustments</dt><dd>'+earningsMoney(tx.adjustments)+'</dd></div><div class="earnings-net-line"><dt>Net amount</dt><dd>'+earningsMoney(earningsTransactionNet(tx))+'</dd></div></dl><p class="earnings-note">'+esc(tx.detail)+'</p><button class="button ghost" data-page="orders" data-detail="'+tx.orderId+'">View order</button></section></div>';
}
function earningsPageView(){
 if(state.role!=='Owner')return '<div class="insights-access card"><strong>Owner access required</strong><span>Earnings and financial routes are available to the establishment owner.</span></div>';
 if(state.earningsPayoutDetail){const payout=cabanaEarningsPayouts.find(x=>x.id===state.earningsPayoutDetail);if(payout)return earningsPayoutDetailView(payout)}
 if(state.earningsTransactionDetail){const tx=cabanaEarningsTransactions.find(x=>x.id===state.earningsTransactionDetail);if(tx)return earningsTransactionDetailView(tx)}
 state.earningsRange=state.earningsRange||'This week';state.earningsTab=state.earningsTab||'Upcoming';const summary=earningsSummary(),month=earningsToday().toLocaleDateString('en-US',{month:'long'}),tab=state.earningsTab;
 const paidThisMonth=cabanaEarningsPayouts.filter(x=>x.status==='Sent'&&earningsDateObject(x.date).getMonth()===earningsToday().getMonth()&&earningsDateObject(x.date).getFullYear()===earningsToday().getFullYear()).reduce((sum,x)=>sum+earningsPayoutNet(x),0),awaitingRows=cabanaEarningsTransactions.filter(x=>x.status==='Awaiting guest checkout'),awaitingAmount=awaitingRows.reduce((sum,x)=>sum+earningsTransactionNet(x),0);
 return '<div class="earnings-page"><header class="earnings-header"><h1>Earnings</h1><button class="earnings-download" data-earnings-download aria-label="Download earnings statement"><i class="hgi-stroke hgi-download-04" aria-hidden="true"></i></button></header><button class="earnings-date-control" data-earnings-range-toggle><span><strong>'+state.earningsRange+'</strong><small>'+earningsDateRangeLabel(state.earningsRange)+'</small></span><i class="hgi-stroke hgi-calendar-03" aria-hidden="true"></i></button><section class="earnings-next-payout"><span>Next payout</span><strong>'+earningsMoney(18450)+'</strong><small>Expected '+earningsNextPayoutDate()+' · '+ '•••• 4821'+'</small></section><section class="earnings-summary-grid"><article class="earnings-summary-card"><span>Awaiting checkout</span><strong>'+earningsMoney(awaitingAmount)+'</strong><small>'+awaitingRows.length+' '+(awaitingRows.length===1?'charge':'charges')+' · current outstanding</small><button data-earnings-awaiting>View awaiting checkout →</button></article><article class="earnings-summary-card"><span>Paid this month</span><strong>'+earningsMoney(paidThisMonth)+'</strong><small>'+month+' · paid payouts only</small></article><article class="earnings-summary-card"><span>Net earnings</span><strong>'+earningsMoney(summary.net)+'</strong><small>'+earningsDateRangeLabel(state.earningsRange)+' · gross less deductions</small></article></section><div class="earnings-tabs" role="tablist">'+['Upcoming','Paid','Transactions'].map(x=>'<button role="tab" aria-selected="'+(tab===x?'true':'false')+'" class="'+(tab===x?'active':'')+'" data-earnings-tab="'+x+'">'+x+'</button>').join('')+'</div><main class="earnings-content">'+(tab==='Upcoming'?earningsUpcomingView():tab==='Paid'?earningsPaidView():earningsTransactionsView())+'</main><section class="earnings-payout-info"><h2>Payout information</h2><p><strong>•••• 4821</strong> <button data-toast="Payout account opened">Change</button><br>Settlement schedule: weekly, every Friday.<br>Commission: 10% on eligible Cabana transactions.</p></section></div>';
}
earningsView=function(){return earningsPageView()};
function earningsRangeSheetMarkup(){if(!state.earningsRangeSheet)return '';const range=state.earningsRangeDraft||state.earningsRange||'This week',options=['This week','Last week','This month','Last month','Custom range'];return '<div class="earnings-sheet-backdrop" data-earnings-range-close></div><section class="earnings-sheet" role="dialog" aria-modal="true" aria-label="Earnings date range"><div class="sheet-handle"></div><header><div><h2>Date range</h2><span>Select the reporting period</span></div><button data-earnings-range-close aria-label="Close date range">×</button></header><div class="earnings-range-options">'+options.map(x=>'<button class="'+(range===x?'active':'')+'" data-earnings-range-choice="'+x+'">'+x+(range===x?'<b>✓</b>':'')+'</button>').join('')+'</div>'+(range==='Custom range'?'<div class="earnings-custom-fields"><label>From<input type="date" data-earnings-custom-from value="'+(state.earningsCustomFrom||'')+'"></label><label>To<input type="date" data-earnings-custom-to value="'+(state.earningsCustomTo||'')+'"></label></div>':'')+'<div class="earnings-sheet-actions"><button class="button ghost" data-earnings-range-close>Cancel</button><button class="button primary" data-earnings-range-apply>Apply</button></div></section>'}
function earningsDownloadModal(){if(!state.earningsDownloadOpen)return '';return '<div class="earnings-sheet-backdrop" data-earnings-download-close></div><section class="earnings-sheet" role="dialog" aria-modal="true" aria-label="Download statement"><div class="sheet-handle"></div><header><div><h2>Download statement</h2><span>'+earningsDateRangeLabel(state.earningsRange)+'</span></div><button data-earnings-download-close aria-label="Close download">×</button></header><button class="earnings-download-option" data-earnings-format="CSV"><strong>CSV statement</strong><small>Transactions and payout records</small></button><button class="earnings-download-option" data-earnings-format="PDF"><strong>PDF statement</strong><small>Formatted financial report</small></button></section>'}
function earningsFilterSheetMarkup(){if(!state.earningsFilterSheet)return '';const method=state.earningsFilterDraftMethod||state.earningsFilterMethod||'All',type=state.earningsFilterDraftType||state.earningsFilterType||'All',status=state.earningsFilterDraftStatus||state.earningsFilterStatus||'All';const choice=(label,value,attr,current)=>'<button class="'+(value===current?'active':'')+'" '+attr+'="'+value+'"><span>'+label+'</span>'+(value===current?'<b>✓</b>':'')+'</button>';return '<div class="earnings-sheet-backdrop" data-earnings-filter-close></div><section class="earnings-sheet" role="dialog" aria-modal="true" aria-label="Transaction filters"><div class="sheet-handle"></div><header><div><h2>Transaction filters</h2><span>Applied to transaction date</span></div><button data-earnings-filter-close aria-label="Close transaction filters">×</button></header><fieldset><legend>Payment method</legend>'+choice('All methods','All','data-earnings-filter-method',method)+choice('Room charge','Room charge','data-earnings-filter-method',method)+choice('Gateway','Gateway','data-earnings-filter-method',method)+'</fieldset><fieldset><legend>Transaction type</legend>'+choice('All types','All','data-earnings-filter-type',type)+choice('Bookings','Booking','data-earnings-filter-type',type)+choice('In-app orders','In-app order','data-earnings-filter-type',type)+choice('Counter charges','Counter charge','data-earnings-filter-type',type)+choice('Refunds','Refund','data-earnings-filter-type',type)+'</fieldset><fieldset><legend>Settlement status</legend>'+choice('All statuses','All','data-earnings-filter-status',status)+choice('Awaiting checkout','Awaiting guest checkout','data-earnings-filter-status',status)+choice('Awaiting settlement','Awaiting settlement','data-earnings-filter-status',status)+choice('Ready for payout','Ready for payout','data-earnings-filter-status',status)+choice('Paid','Paid','data-earnings-filter-status',status)+'</fieldset><div class="earnings-sheet-actions"><button class="button ghost" data-earnings-filter-reset>Reset</button><button class="button primary" data-earnings-filter-apply>Apply filters</button></div></section>'}
function bindEarningsWorkspace(){
 document.querySelectorAll('[data-earnings-tab]').forEach(button=>button.onclick=()=>{state.earningsTab=button.dataset.earningsTab;state.earningsPayoutDetail=null;state.earningsTransactionDetail=null;render()});
 document.querySelectorAll('[data-earnings-range-toggle]').forEach(button=>button.onclick=()=>{state.earningsRangeDraft=state.earningsRange||'This week';state.earningsRangeSheet=true;render()});
 document.querySelectorAll('[data-earnings-range-close]').forEach(button=>button.onclick=()=>{state.earningsRangeSheet=false;render()});
 document.querySelectorAll('[data-earnings-range-choice]').forEach(button=>button.onclick=()=>{state.earningsRangeDraft=button.dataset.earningsRangeChoice;render()});
 document.querySelectorAll('[data-earnings-range-apply]').forEach(button=>button.onclick=()=>{const from=document.querySelector('[data-earnings-custom-from]'),to=document.querySelector('[data-earnings-custom-to]');if(state.earningsRangeDraft==='Custom range'){if(from?.value)state.earningsCustomFrom=from.value;if(to?.value)state.earningsCustomTo=to.value}state.earningsRange=state.earningsRangeDraft||'This week';state.earningsRangeSheet=false;render()});
 document.querySelectorAll('[data-earnings-download]').forEach(button=>button.onclick=()=>{state.earningsDownloadOpen=true;render()});
 document.querySelectorAll('[data-earnings-download-close]').forEach(button=>button.onclick=()=>{state.earningsDownloadOpen=false;render()});
 document.querySelectorAll('[data-earnings-format]').forEach(button=>button.onclick=()=>{state.earningsDownloadOpen=false;render();setTimeout(()=>toast(button.dataset.earningsFormat+' statement prepared'),0)});
 document.querySelectorAll('[data-earnings-awaiting]').forEach(button=>button.onclick=()=>{state.earningsTab='Upcoming';state.earningsFilterStatus='Awaiting guest checkout';render()});
 document.querySelectorAll('[data-earnings-payout]').forEach(button=>button.onclick=()=>{state.earningsPayoutDetail=button.dataset.earningsPayout;render()});
 document.querySelectorAll('[data-earnings-transaction]').forEach(button=>button.onclick=()=>{state.earningsTransactionDetail=button.dataset.earningsTransaction;render()});
 document.querySelectorAll('[data-earnings-back]').forEach(button=>button.onclick=()=>{state.earningsPayoutDetail=null;state.earningsTransactionDetail=null;render()});
 document.querySelectorAll('[data-earnings-statement]').forEach(button=>button.onclick=()=>toast('PDF statement prepared'));
 document.querySelectorAll('[data-page="orders"][data-detail]').forEach(button=>button.onclick=()=>{state.page='orders';state.detail=button.dataset.detail;render()});
 const search=document.querySelector('[data-earnings-search]');if(search)search.oninput=e=>{state.earningsQuery=e.target.value;const pos=e.target.selectionStart;render();const next=document.querySelector('[data-earnings-search]');if(next){next.focus();next.setSelectionRange(pos,pos)}};
 document.querySelectorAll('[data-earnings-filter-toggle]').forEach(button=>button.onclick=()=>{state.earningsFilterDraftMethod=state.earningsFilterMethod||'All';state.earningsFilterDraftType=state.earningsFilterType||'All';state.earningsFilterDraftStatus=state.earningsFilterStatus||'All';state.earningsFilterSheet=true;render()});
 document.querySelectorAll('[data-earnings-filter-close]').forEach(button=>button.onclick=()=>{state.earningsFilterSheet=false;render()});
 document.querySelectorAll('[data-earnings-filter-method]').forEach(button=>button.onclick=()=>{state.earningsFilterDraftMethod=button.dataset.earningsFilterMethod;render()});
 document.querySelectorAll('[data-earnings-filter-type]').forEach(button=>button.onclick=()=>{state.earningsFilterDraftType=button.dataset.earningsFilterType;render()});
 document.querySelectorAll('[data-earnings-filter-status]').forEach(button=>button.onclick=()=>{state.earningsFilterDraftStatus=button.dataset.earningsFilterStatus;render()});
 document.querySelectorAll('[data-earnings-filter-reset]').forEach(button=>button.onclick=()=>{state.earningsFilterMethod='All';state.earningsFilterType='All';state.earningsFilterStatus='All';state.earningsFilterSheet=false;render()});
 document.querySelectorAll('[data-earnings-filter-apply]').forEach(button=>button.onclick=()=>{state.earningsFilterMethod=state.earningsFilterDraftMethod||'All';state.earningsFilterType=state.earningsFilterDraftType||'All';state.earningsFilterStatus=state.earningsFilterDraftStatus||'All';state.earningsFilterSheet=false;render()});
 document.querySelectorAll('[data-earnings-chip]').forEach(button=>button.onclick=()=>{const key=button.dataset.earningsChip;if(key==='Method')state.earningsFilterMethod='All';if(key==='Type')state.earningsFilterType='All';if(key==='Status')state.earningsFilterStatus='All';render()});
}
/* Final Orders view binding: the visible dropdown trigger and options update the same workspace. */
const bindOrdersViewDropdownFinal=bindOrdersWorkspace;
bindOrdersWorkspace=function(){
  bindOrdersViewDropdownFinal();
  document.querySelectorAll('[data-order-view-toggle]').forEach(button=>button.onclick=()=>{state.orderViewMenuOpen=!state.orderViewMenuOpen;render()});
  document.querySelectorAll('[data-order-view-option]').forEach(button=>button.onclick=()=>{state.orderView=button.dataset.orderViewOption==='calendar'?'calendar':'list';state.orderViewMenuOpen=false;state.detail=null;render()});
  document.querySelectorAll('select[data-order-view]').forEach(select=>{
    select.value=state.orderView==='calendar'?'calendar':'list';
    select.onchange=event=>{
      state.orderView=event.currentTarget.value==='calendar'?'calendar':'list';
      state.detail=null;
      render();
    };
  });
};
const renderBeforeOrdersWorkspace=render;
render=function(){rememberLastView();renderBeforeOrdersWorkspace();document.querySelector('#app')?.insertAdjacentHTML('beforeend',ordersFilterSheetFinal()+earningsRangeSheetMarkup()+earningsFilterSheetMarkup()+earningsDownloadModal());bindOrdersWorkspace();bindEarningsWorkspace()};
const viewBeforeScheduleDetail=view;
view=function(){return state.page==='orders'&&state.detail?orderDetail():viewBeforeScheduleDetail()};
/* Compact Listings workspace: list-first browsing with per-listing availability actions. */
function listingMoney(value){const amount=Number(String(value||'').replace(/[^0-9.-]/g,''))||0;return '₱'+amount.toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2})}
function listingOrderCount(listing){const ids=new Set(orders.filter(order=>order.item===listing.name&&!['Cancelled','Declined','No-show'].includes(order.status)).map(order=>order.id));return ids.size}
function listingHasStock(listing){return ['Bakery','Food','Drinks','Shop item'].includes(listing.category)||String(listing.unit||'').toLowerCase().includes('item')}
const listingMockPhotos={cake:'assets/listings/whole-sans-rival-cake.png',box:'assets/listings/island-breakfast-box.png',coffee:'assets/listings/cold-brew-bottle.png'};
function listingPhotoMarkup(listing,grid=false){const source=listing.photo||listingMockPhotos[listing.id];if(grid&&source)return '<div class="listing-cover-frame"><img class="listing-cover grid" src="'+esc(source)+'" alt="'+esc(listing.name)+' photo"></div>';return listing.photo?'<img class="listing-cover" src="'+esc(listing.photo)+'" alt="'+esc(listing.name)+' photo">':'<div class="listing-cover listing-cover-placeholder" aria-label="No cover photo"><i class="hgi-stroke hgi-image-01" aria-hidden="true"></i></div>'}
function listingAvailabilitySummary(listing){if(listingHasStock(listing))return listing.stock||'Stock availability not set';return 'Next available: Oct 7'}
function listingStatusCounts(){return {All:listings.length,Active:listings.filter(x=>x.status==='Active').length,Paused:listings.filter(x=>x.status==='Paused').length,Drafts:listings.filter(x=>x.status==='Draft').length}}
function listingFilteredRows(){const query=(state.listingQuery||'').trim().toLowerCase(),status=state.listingStatusFilter||'All';return listings.filter(listing=>(status==='All'||(status==='Drafts'?listing.status==='Draft':listing.status===status))&&(!query||listing.name.toLowerCase().includes(query)))}
function listingMenuMarkup(listing){if(state.listingMenu!==listing.id)return '';const pause=listing.status==='Active'?'Pause':'Resume';return '<div class="listing-action-menu" role="menu"><button data-listing-menu-action="edit" data-listing-id="'+listing.id+'">Edit</button><button data-listing-menu-action="preview" data-listing-id="'+listing.id+'">Preview as guest</button><button data-listing-menu-action="duplicate" data-listing-id="'+listing.id+'">Duplicate</button><button data-listing-menu-action="pause" data-listing-id="'+listing.id+'">'+pause+'</button><button data-listing-menu-action="delete" data-listing-id="'+listing.id+'">Delete</button></div>'}
function listingCardMarkup(listing,grid=false){const owner=state.role==='Owner',count=listingOrderCount(listing),draft=listing.status==='Draft',statusClass=(listing.status||'').toLowerCase();return '<article class="listing-compact-card '+(grid?'listing-grid-card':'listing-list-card')+'" data-listing-card="'+listing.id+'">'+(grid?listingPhotoMarkup(listing,true):listingPhotoMarkup(listing,false))+'<div class="listing-compact-body"><button class="listing-card-main" data-listing-detail="'+listing.id+'"><span class="listing-card-heading"><span><strong>'+esc(listing.name)+'</strong><small>'+esc(listing.category)+'</small></span><em class="listing-status-pill '+statusClass+'">'+esc(listing.status)+'</em></span>'+(grid?'<span class="listing-price-line"><strong>'+listingMoney(listing.price)+'</strong><small>/ '+esc(String(listing.unit||'').replace(/^per\s+/i,''))+'</small></span>':'<span class="listing-price-line"><strong>'+listingMoney(listing.price)+'</strong><small>/ '+esc(String(listing.unit||'').replace(/^per\s+/i,''))+'</small></span>')+'<span class="listing-quick-info"><span>'+count+' '+(count===1?'order':'orders')+' this week</span><span>'+listingAvailabilitySummary(listing)+'</span></span></button><div class="listing-compact-actions">'+(draft?'<button class="listing-setup-action" data-listing-menu-action="setup" data-listing-id="'+listing.id+'">Continue setup</button>':owner?'<label class="listing-toggle-control"><input type="checkbox" data-listing-toggle data-listing-id="'+listing.id+'" '+(listing.status==='Active'?'checked':'')+' aria-label="'+(listing.status==='Active'?'Pause ':'Activate ')+esc(listing.name)+'"><span></span></label>':'')+(owner?'<button class="listing-menu-trigger" data-listing-menu-toggle data-listing-id="'+listing.id+'" aria-label="More actions for '+esc(listing.name)+'">•••</button>':'')+listingMenuMarkup(listing)+'</div></div></article>'}
function compactListingsPage(){const owner=state.role==='Owner',counts=listingStatusCounts(),rows=listingFilteredRows(),cards=rows.length?rows.map(x=>listingCardMarkup(x,state.listingView==='grid')).join(''):(state.listingQuery?'<div class="listings-empty-state"><strong>No listings match your search.</strong></div>':owner?'<div class="listings-empty-state"><strong>You don’t have any listings yet.</strong><span>Create your first listing so Cabana guests can book or buy from you.</span><button class="button primary" data-listing-new>+ Create new listing</button></div>':'<div class="listings-empty-state"><strong>No listings yet.</strong><span>Ask your business owner to add one.</span></div>');const filters=[['All',counts.All],['Active',counts.Active],['Paused',counts.Paused],['Drafts',counts.Drafts]];return head('Listings','',owner?'<button class="button primary listings-create-action" data-listing-new>'+icons.plus+' Create new listing</button>':'')+'<section class="listings-workspace"><div class="listings-toolbar-compact"><label class="listings-search"><i class="hgi-stroke hgi-search-01" aria-hidden="true"></i><input data-listings-search value="'+esc(state.listingQuery||'')+'" placeholder="Search listings" aria-label="Search listings"></label><div class="listings-view-controls" role="group" aria-label="Listing view"><button class="'+(state.listingView==='list'?'active':'')+'" data-listing-view="list" aria-label="List view"><i class="hgi-stroke hgi-list-view" aria-hidden="true"></i><span>List</span></button><button class="'+(state.listingView==='grid'?'active':'')+'" data-listing-view="grid" aria-label="Grid view"><i class="hgi-stroke hgi-grid-view" aria-hidden="true"></i><span>Grid</span></button></div></div><div class="listings-status-filters" role="tablist" aria-label="Listing status">'+filters.map(([label,count])=>'<button class="'+(state.listingStatusFilter===label?'active':'')+'" data-listing-status="'+label+'">'+label+' <span>'+count+'</span></button>').join('')+'</div><div class="listing-grid compact-listing-grid '+(state.listingView==='grid'?'is-grid':'is-list')+'">'+cards+'</div></section>'}
function listingDetailPage(){const listing=listings.find(x=>x.id===state.listingDetail);if(!listing)return compactListingsPage();const owner=state.role==='Owner',count=listingOrderCount(listing),stock=listingAvailabilitySummary(listing);return '<div class="listing-detail-page"><button class="listing-detail-back" data-listing-detail-back>← Listings</button><header class="listing-detail-header">'+listingPhotoMarkup(listing,true)+'<div><span class="listing-status-pill '+String(listing.status||'').toLowerCase()+'">'+esc(listing.status)+'</span><h1>'+esc(listing.name)+'</h1><p>'+esc(listing.category)+' · '+listingMoney(listing.price)+' / '+esc(String(listing.unit||'').replace(/^per\s+/i,''))+'</p></div></header><div class="listing-detail-actions">'+(owner?'<button class="button primary" data-toast="Guest preview opened">Preview as guest</button><button class="button ghost" data-listing-edit> Edit </button>':'')+'</div><section class="listing-detail-section"><h2>Details</h2><p>'+esc(listing.category)+' listing with guest-facing descriptions and photos.</p></section><section class="listing-detail-section"><h2>Pricing</h2><p>'+listingMoney(listing.price)+' per '+esc(String(listing.unit||'').replace(/^per\s+/i,''))+' · Payment: '+esc(listing.payment||'Not set')+'</p></section><section class="listing-detail-section"><h2>Availability</h2><div class="listing-availability-summary"><strong>'+esc(stock)+'</strong><span>Select a date to manage units, price, or blocks.</span></div><div class="listing-calendar-mini">'+['Oct 5','Oct 6','Oct 7','Oct 8','Oct 9'].map((day,i)=>'<button data-listing-date="'+day+'"><strong>'+day+'</strong><span>'+((i===2&&!listingHasStock(listing))?'Available':'Open')+'</span></button>').join('')+'</div></section><section class="listing-detail-section"><h2>Capacity</h2><p>'+esc(listing.stock||'Capacity configured in availability')+'</p></section><section class="listing-detail-section"><h2>Location &amp; instructions</h2><p>'+esc(listing.location||'Service location not set')+'</p></section><section class="listing-detail-section"><h2>Booking rules</h2><p>Confirmation method: '+esc(listing.confirmationMethod||'Manual approval')+'</p></section><section class="listing-detail-section"><h2>Payment</h2><p>'+esc(listing.payment||'Payment methods not set')+'</p></section>'+(owner?'<section class="listing-detail-section"><h2>Performance</h2><p>'+count+' orders this month</p><button class="button ghost" data-insights>View insights →</button></section>':'')+'</div>'}
listingsClean=function(){return compactListingsPage()};
const viewBeforeCompactListings=view;
view=function(){return state.page==='listings'&&state.listingDetail?listingDetailPage():viewBeforeCompactListings()};
function bindCompactListings(){document.querySelectorAll('[data-listing-view]').forEach(button=>button.onclick=()=>{state.listingView=button.dataset.listingView==='grid'?'grid':'list';localStorage.setItem('cabana:listings-view',state.listingView);render()});document.querySelectorAll('[data-listing-status]').forEach(button=>button.onclick=()=>{state.listingStatusFilter=button.dataset.listingStatus;render()});const search=document.querySelector('[data-listings-search]');if(search)search.oninput=event=>{state.listingQuery=event.target.value;const pos=event.target.selectionStart;render();const next=document.querySelector('[data-listings-search]');if(next){next.focus();next.setSelectionRange(pos,pos)}};document.querySelectorAll('[data-listing-detail]').forEach(button=>button.onclick=()=>{state.listingDetail=button.dataset.listingDetail;render()});document.querySelectorAll('[data-listing-detail-back]').forEach(button=>button.onclick=()=>{state.listingDetail=null;render()});document.querySelectorAll('[data-listing-toggle]').forEach(input=>input.onchange=event=>{if(state.role!=='Owner')return;const listing=listings.find(x=>x.id===event.target.dataset.listingId);if(listing){listing.status=event.target.checked?'Active':'Paused';render()}});document.querySelectorAll('[data-listing-menu-toggle]').forEach(button=>button.onclick=event=>{event.stopPropagation();state.listingMenu=state.listingMenu===button.dataset.listingId?null:button.dataset.listingId;render()});document.querySelectorAll('[data-listing-menu-action]').forEach(button=>button.onclick=event=>{event.stopPropagation();const listing=listings.find(x=>x.id===button.dataset.listingId),action=button.dataset.listingMenuAction;if(!listing)return;if(action==='pause')listing.status=listing.status==='Active'?'Paused':'Active';if(action==='delete'){if(window.confirm('Delete this listing? Existing orders must be resolved first.')){const index=listings.indexOf(listing);if(index>=0)listings.splice(index,1)}}if(action==='duplicate'){listings.push({...listing,id:listing.id+'-copy',name:listing.name+' copy',status:'Draft'})}state.listingMenu=null;render()});document.querySelectorAll('[data-listing-new]').forEach(button=>button.onclick=()=>toast('Create listing flow opened'));}
const renderBeforeCompactListings=render;
render=function(){renderBeforeCompactListings();bindCompactListings()};
/* Orders: keep List / Calendar inside the Filters sheet instead of a standalone dropdown. */
ordersViewDropdownMarkup=()=>'';
const ordersFilterSheetBeforeViewType=ordersFilterSheetFinal;
ordersFilterSheetFinal=function(){const html=ordersFilterSheetBeforeViewType();if(!html)return html;const current=state.orderFilterDraftView||state.orderView||'list',choice=(label,value)=>'<button class="orders-filter-choice '+(current===value?'active':'')+'" data-order-filter-view="'+value+'"><span>'+label+'</span>'+(current===value?'<b>✓</b>':'')+'</button>';return html.replace('<fieldset><legend>Type</legend>','<fieldset><legend>View type</legend>'+choice('List view','list')+choice('Calendar view','calendar')+'</fieldset><fieldset><legend>Type</legend>')};
const bindOrdersBeforeViewType=bindOrdersWorkspace;
bindOrdersWorkspace=function(){bindOrdersBeforeViewType();document.querySelectorAll('[data-orders-filter-toggle]').forEach(button=>button.onclick=()=>{state.orderFilterDraftType=state.orderTypeFilter||'All';state.orderFilterDraftPayment=state.orderPaymentFilter||'All';state.orderFilterDraftStatus=state.orderStatusFilter||'All';state.orderFilterDraftListings=[...(state.orderListingFilter||[])];state.orderFilterDraftView=state.orderView||'list';state.orderFilterSheet=true;render()});document.querySelectorAll('[data-order-filter-view]').forEach(button=>button.onclick=()=>{state.orderFilterDraftView=button.dataset.orderFilterView==='calendar'?'calendar':'list';render()});document.querySelectorAll('[data-order-filter-reset]').forEach(button=>button.onclick=()=>{state.orderTypeFilter='All';state.orderPaymentFilter='All';state.orderStatusFilter='All';state.orderListingFilter=[];state.orderView='list';state.orderFilterDraftView='list';state.orderFilterSheet=false;render()});document.querySelectorAll('[data-order-filter-apply]').forEach(button=>button.onclick=()=>{state.orderTypeFilter=state.orderFilterDraftType||'All';state.orderPaymentFilter=state.orderFilterDraftPayment||'All';state.orderStatusFilter=state.orderFilterDraftStatus||'All';state.orderListingFilter=state.orderFilterDraftListings||[];state.orderView=state.orderFilterDraftView==='calendar'?'calendar':'list';state.orderViewMenuOpen=false;state.orderFilterSheet=false;render()})};
const listingCardMarkupBeforeEditAction=listingCardMarkup;
listingCardMarkup=function(listing,grid=false){return listingCardMarkupBeforeEditAction(listing,grid).replace(/<div class="listing-action-menu"[\s\S]*?<\/div>/g,'').replace(/<button class="listing-menu-trigger"[^>]*>•••<\/button>/,'<button class="listing-edit-action" data-listing-edit-id="'+listing.id+'" aria-label="Edit '+esc(listing.name)+'"><i class="hgi-stroke hgi-edit-02" aria-hidden="true"></i></button>')};
const listingDetailPageBeforeEditActions=listingDetailPage;
listingDetailPage=function(){const listing=listings.find(x=>x.id===state.listingDetail),html=listingDetailPageBeforeEditActions();if(!listing||state.role!=='Owner')return html;return html.replace(/<div class="listing-detail-actions">[\s\S]*?<\/div>/,'<div class="listing-detail-actions"><button class="button primary" data-listing-duplicate="'+listing.id+'">Duplicate</button><button class="button danger" data-listing-delete="'+listing.id+'">Delete</button></div>')};
const bindCompactListingsBeforeEditActions=bindCompactListings;
bindCompactListings=function(){bindCompactListingsBeforeEditActions();document.querySelectorAll('[data-listing-duplicate]').forEach(button=>button.onclick=()=>{const listing=listings.find(x=>x.id===button.dataset.listingDuplicate);if(!listing)return;listings.push({...listing,id:listing.id+'-copy-'+Date.now(),name:listing.name+' copy',status:'Draft'});state.listingDetail=null;render()});document.querySelectorAll('[data-listing-delete]').forEach(button=>button.onclick=()=>{const index=listings.findIndex(x=>x.id===button.dataset.listingDelete);if(index<0)return;if(window.confirm('Delete this listing? Existing orders must be resolved first.')){listings.splice(index,1);state.listingDetail=null;render()}})};
function listingGuestPreviewPage(){const listing=listings.find(x=>x.id===state.listingDetail);if(!listing)return compactListingsPage();const source=listing.photo||listingMockPhotos[listing.id],photo=source?'<img class="listing-guest-preview-photo" src="'+esc(source)+'" alt="'+esc(listing.name)+' photo">':'<div class="listing-guest-preview-photo listing-cover-placeholder" aria-label="No cover photo"><i class="hgi-stroke hgi-image-01" aria-hidden="true"></i></div>';return '<div class="listing-guest-preview-page"><button class="listing-detail-back" data-listing-detail-back>← Listings</button><article class="listing-guest-preview card">'+photo+'<div class="listing-guest-preview-body"><span class="section-label">'+esc(listing.category)+'</span><h1>'+esc(listing.name)+'</h1><p>Enjoy this Cabana experience during your stay.</p><div class="listing-guest-preview-price"><strong>'+listingMoney(listing.price)+'</strong><span>/ '+esc(String(listing.unit||'').replace(/^per\s+/i,''))+'</span></div><div class="listing-guest-preview-meta"><span>'+esc(listingAvailabilitySummary(listing))+'</span><span>'+esc(listing.location||'Service location available after booking')+'</span></div><button class="button primary" data-toast="Guest booking flow opened">Book now</button></div></article></div>'}
const listingDetailPageBeforeGuestPreview=listingDetailPage;
listingDetailPage=function(){return state.listingEdit?listingDetailPageBeforeGuestPreview():listingGuestPreviewPage()};
const bindCompactListingsBeforeGuestPreview=bindCompactListings;
bindCompactListings=function(){bindCompactListingsBeforeGuestPreview();document.querySelectorAll('[data-listing-detail]').forEach(button=>button.onclick=()=>{state.listingDetail=button.dataset.listingDetail;state.listingEdit=false;render()});document.querySelectorAll('[data-listing-edit-id]').forEach(button=>button.onclick=event=>{event.stopPropagation();state.listingDetail=button.dataset.listingEditId;state.listingEdit=true;render()});document.querySelectorAll('[data-listing-detail-back]').forEach(button=>button.onclick=()=>{state.listingDetail=null;state.listingEdit=false;render()})};

/* Operational Dashboard: prioritize requests, scheduled work, and role-safe receivables. */
function dashboardOperationalRangeLabel(){return 'Today'}
function dashboardOperationalRequestStamp(order){return String(order.timeline?.[0]?.[1]||'')}
function dashboardOperationalPending(){return orders.filter(order=>order.status==='Pending').slice().sort((a,b)=>dashboardOperationalRequestStamp(a).localeCompare(dashboardOperationalRequestStamp(b))) }
const dashboardPendingOriginalBase=dashboardOperationalPending;
function dashboardOperationalToday(){const date=new Date();date.setHours(0,0,0,0);return date}
function dashboardOperationalOrderDate(order){const raw=String(order.when||'');if(/\bToday\b/i.test(raw))return dashboardOperationalToday();if(/\bTomorrow\b/i.test(raw)){const date=dashboardOperationalToday();date.setDate(date.getDate()+1);return date}const months={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11},match=raw.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})(?:,\s*(\d{4}))?/i);if(!match)return null;const today=dashboardOperationalToday(),date=new Date(Number(match[3]||today.getFullYear()),months[match[1].slice(0,3).toLowerCase()],Number(match[2]));date.setHours(0,0,0,0);if(!match[3]&&date<today){const days=(today-date)/86400000;if(days>180)date.setFullYear(date.getFullYear()+1)}return date}
function dashboardOperationalScheduled(){const start=dashboardOperationalToday(),end=new Date(start);end.setDate(end.getDate()+6);return orders.filter(order=>{if(!['Confirmed','In use','Preparing','Ready'].includes(order.status)||order.kind==='Counter charge')return false;if(['In use','Preparing','Ready'].includes(order.status))return true;const date=dashboardOperationalOrderDate(order);return date&&date>=start&&date<=end})}
function dashboardOperationalGroup(order){if(['In use','Preparing','Ready'].includes(order.status))return 'In progress';const date=dashboardOperationalOrderDate(order),today=dashboardOperationalToday();if(!date)return 'Later';const days=Math.round((date-today)/86400000);if(days===0)return 'Today';if(days===1)return 'Tomorrow';return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(date)}
function dashboardOperationalStatus(order){if(['In use','Preparing','Ready'].includes(order.status))return 'In progress';if(order.status==='Confirmed')return 'Confirmed';return order.status}
function dashboardOperationalWhen(order){return esc(order.when||'Scheduled time not set')}
function dashboardOperationalDeadline(order){const minutes=Number(order.responseMinutes||24);return minutes>=60?'Respond within '+Math.round(minutes/60)+' hr':'Respond within '+minutes+' min'}
function dashboardOperationalRequestSummary(order){const raw=String(order.when||'Scheduled time not set'),duration=raw.match(/\d+\s+(?:hours?|minutes?)/i),base=raw.replace(/\s*·\s*\d+\s+(?:hours?|minutes?)\b/i,'').trim(),durationLabel=duration?duration[0].replace(/hours?/i,'hr').replace(/minutes?/i,'min'):'';return [base,order.quantity,durationLabel].filter(Boolean).join(' · ')}
function dashboardOperationalRequestCard(order){const seen=(state.dashboardSeenRequests||[]).includes(order.id),processing=state.dashboardRequestProcessing===order.id,newPill=seen?'':'<span class="dashboard-request-new-pill">New</span>';return '<article class="dashboard-request-card '+(seen?'seen':'unseen')+'"><button class="dashboard-request-main" data-dashboard-request-view="'+esc(order.id)+'"><div class="dashboard-request-title-row"><h3>'+esc(order.item)+'</h3>'+newPill+'</div><p>'+esc(dashboardOperationalRequestSummary(order))+'</p></button><div class="dashboard-request-footer"><strong class="dashboard-request-deadline '+(Number(order.responseMinutes||24)<=30?'urgent':'')+'">'+dashboardOperationalDeadline(order)+'</strong><div class="dashboard-request-actions"><button '+(processing?'disabled':'')+' data-dashboard-request-action="confirm" data-dashboard-request-id="'+esc(order.id)+'">'+(processing?'Processing…':'Confirm')+'</button><button class="secondary" '+(processing?'disabled':'')+' data-dashboard-request-action="decline" data-dashboard-request-id="'+esc(order.id)+'">Decline</button></div></div></article>'}
function dashboardOperationalRequestSection(){const pending=dashboardOperationalPending();return '<section class="dashboard-operational-section dashboard-requests-section"><div class="dashboard-operational-heading"><h2>To confirm <b>'+pending.length+'</b></h2></div>'+(pending.length?'<div class="dashboard-request-list">'+pending.map(dashboardOperationalRequestCard).join('')+'</div>':'<div class="dashboard-operational-empty">No bookings waiting for confirmation.</div>')+'</section>'}
function dashboardOperationalTodayServed(){if(typeof salesPeriodData!=='function')return 0;const previous=state.range;state.range='Today';const count=salesPeriodData().orders;state.range=previous;return count}
function dashboardOperationalReceivables(){if(state.role!=='Owner')return '';const ledger=typeof cabanaEarningsTransactions!=='undefined'?cabanaEarningsTransactions:[],rows=ledger.filter(item=>item.method==='Room charge'&&['Awaiting guest checkout','Awaiting settlement'].includes(item.status)),total=rows.reduce((sum,item)=>sum+earningsTransactionNet(item),0),served=dashboardOperationalTodayServed(),checkout=rows.filter(item=>item.status==='Awaiting guest checkout').reduce((sum,item)=>sum+earningsTransactionNet(item),0),settlement=rows.filter(item=>item.status==='Awaiting settlement').reduce((sum,item)=>sum+earningsTransactionNet(item),0);return '<section class="dashboard-operational-section dashboard-receivables"><div class="dashboard-receivable-header"><div><h2>Receivables</h2><strong>'+earningsMoney(total)+'</strong></div><button class="dashboard-inline-link" data-page="earnings">View earnings '+icons.arrow+'</button></div><div class="dashboard-receivable-metrics"><div><span>Awaiting checkout</span><strong>'+earningsMoney(checkout)+'</strong></div><div><span>Awaiting hotel payment</span><strong>'+earningsMoney(settlement)+'</strong></div></div><div class="dashboard-receivable-footer"><span><strong>'+served+'</strong> bookings served · Today</span></div></section>'}
function dashboardOperationalBookingTime(order){const match=String(order.when||'').match(/\d{1,2}:\d{2}\s?(?:AM|PM)/i);return match?match[0]:String(order.when||'Scheduled time not set').split(' · ')[0]}
function dashboardOperationalBookingDuration(order){const match=String(order.when||'').match(/\d+\s+(?:hours?|minutes?)/i);return match?match[0]:''}
function dashboardOperationalBookingQuantity(order){return String(order.quantity||'').replace(/^(\d+)\s*[×x]$/,'$1 items.')}
function dashboardOperationalBookingRow(order,dateLabel){const duration=dashboardOperationalBookingDuration(order),details=[dashboardOperationalBookingQuantity(order),duration].filter(Boolean).join(' · '),dateTime=[dateLabel,dashboardOperationalBookingTime(order)].filter(Boolean).join(' · ');return '<button class="dashboard-booking-row" data-detail="'+esc(order.id)+'"><span class="dashboard-booking-main"><span class="dashboard-booking-time-line"><small>'+esc(dateTime)+'</small><em class="dashboard-booking-status '+dashboardOperationalStatus(order).toLowerCase().replaceAll(' ','-')+'">'+dashboardOperationalStatus(order)+'</em></span><strong class="dashboard-booking-title">'+esc(order.item)+'</strong><small>'+esc(details)+'</small></span></button>'}
function dashboardOperationalUpcoming(){const scheduled=dashboardOperationalScheduled(),groups=['In progress','Today','Tomorrow'],groupMap=new Map();scheduled.forEach(order=>{const key=dashboardOperationalGroup(order);if(!groupMap.has(key))groupMap.set(key,[]);groupMap.get(key).push(order)});const keys=[...groups,...[...groupMap.keys()].filter(key=>!groups.includes(key))],cards=keys.filter(key=>groupMap.has(key)).map(key=>groupMap.get(key).slice().sort((a,b)=>String(a.when).localeCompare(String(b.when))).map(order=>dashboardOperationalBookingRow(order,key)).join('')).join('');return '<section class="dashboard-operational-section dashboard-upcoming-section"><div class="dashboard-operational-heading"><div><h2>Upcoming bookings</h2><span>Next 7 days</span></div><button class="dashboard-inline-link" data-page="orders">View bookings '+icons.arrow+'</button></div>'+(cards?'<div class="dashboard-booking-list">'+cards+'</div>':'<div class="dashboard-operational-empty">No upcoming bookings.</div>')+'</section>'}
function dashboardOperationalStaffQueue(){const queue=orders.filter(order=>['Confirmed','In use','Preparing','Ready'].includes(order.status)&&order.kind!=='Counter charge').slice().sort((a,b)=>String(a.when).localeCompare(String(b.when)));const groups=['Today','Tomorrow'].map(group=>{const rows=queue.filter(order=>dashboardOperationalGroup(order)===group);if(!rows.length)return '';return '<section class="dashboard-booking-group"><h3>'+group+'</h3>'+rows.map(order=>{const action=order.status==='Ready'?'complete':order.kind==='In-app order'?'ready':'inuse',label=action==='complete'?'Complete':action==='ready'?'Mark ready':'Start';return '<div class="dashboard-staff-row"><div><strong>'+dashboardOperationalWhen(order)+'</strong><span>'+esc(order.item)+'</span><small>'+esc(order.guest)+(order.room?' · Room '+esc(order.room):'')+' · '+esc(order.quantity)+'</small></div><span class="dashboard-booking-status '+dashboardOperationalStatus(order).toLowerCase().replaceAll(' ','-')+'">'+dashboardOperationalStatus(order)+'</span><button data-dashboard-queue-action="'+action+'" data-dashboard-queue-id="'+esc(order.id)+'">'+label+'</button></div>'}).join('')+'</section>'}).join('');return '<section class="dashboard-operational-section dashboard-staff-queue"><div class="dashboard-operational-heading"><div><h2>Today’s queue</h2><span>Confirmed and ongoing bookings</span></div><button class="dashboard-inline-link" data-page="orders">View bookings '+icons.arrow+'</button></div>'+(groups||'<div class="dashboard-operational-empty">No bookings scheduled for today.</div>')+'</section>'}
function dashboardOperationalQrModal(){if(!state.dashboardQrOpen)return '';return '<div class="dashboard-qr-backdrop" data-dashboard-qr-close></div><section class="dashboard-qr-modal" role="dialog" aria-modal="true" aria-label="Validate booking"><button class="dashboard-qr-close" data-dashboard-qr-close aria-label="Close QR scanner">×</button><i class="hgi-stroke hgi-qr-code-01" aria-hidden="true"></i><h2>Validate booking</h2><p>Scan a guest booking QR code before confirming check-in.</p>'+(state.dashboardQrValidated?'<div class="dashboard-qr-success">Booking validated successfully.</div><button class="button primary" data-dashboard-qr-checkin>Confirm check-in</button>':'<button class="button primary" data-dashboard-qr-validate>Scan booking QR</button>')+'</section>'}
function dashboardOperationalMarkup(){const owner=state.role==='Owner',pending=dashboardOperationalPending(),unread=pending.filter(order=>!(state.dashboardSeenRequests||[]).includes(order.id)).length;return '<div class="dashboard-operational-page"><header class="dashboard-operational-header"><h1>Dashboard</h1><button class="dashboard-header-icon" data-dashboard-notifications aria-label="Notifications, '+unread+' unread"><i class="hgi-stroke hgi-notification-03" aria-hidden="true"></i>'+(unread?'<b>'+unread+'</b>':'')+'</button></header><section class="dashboard-greeting"><div><strong>Welcome back, Leah!</strong><small class="dashboard-current-date">'+esc(todayLabel())+'</small></div></section>'+dashboardOperationalRequestSection()+dashboardOperationalUpcoming()+dashboardOperationalReceivables()+(owner?'<button class="dashboard-insights-link" data-insights>View insights '+icons.arrow+'</button>':'')+'</div>'}
dashboard17=function(){return dashboardOperationalMarkup()};
function bindDashboardOperational(){document.querySelectorAll('[data-dashboard-notifications]').forEach(button=>button.onclick=()=>{const seen=state.dashboardSeenRequests||[],request=dashboardOperationalPending().find(order=>!seen.includes(order.id));if(!request){toast('No unread booking notifications');return}state.dashboardSeenRequests=[...seen,request.id];state.page='orders';state.detail=request.id;render()});document.querySelectorAll('[data-dashboard-request-view]').forEach(button=>button.onclick=()=>{const id=button.dataset.dashboardRequestView;state.dashboardSeenRequests=[...(state.dashboardSeenRequests||[]),id];state.page='orders';state.detail=id;render()});document.querySelectorAll('[data-dashboard-request-action]').forEach(button=>button.onclick=event=>{event.stopPropagation();const order=orders.find(item=>item.id===button.dataset.dashboardRequestId);if(!order||state.dashboardRequestProcessing)return;if(button.dataset.dashboardRequestAction==='decline'&&!window.confirm('Decline this booking request?'))return;state.dashboardRequestProcessing=order.id;render();setTimeout(()=>{order.status=button.dataset.dashboardRequestAction==='confirm'?'Confirmed':'Declined';state.dashboardSeenRequests=[...(state.dashboardSeenRequests||[]),order.id];state.dashboardRequestProcessing=null;toast(order.status==='Confirmed'?'Booking confirmed':'Booking declined');render()},250)});document.querySelectorAll('[data-dashboard-queue-action]').forEach(button=>button.onclick=()=>{const order=orders.find(item=>item.id===button.dataset.dashboardQueueId);if(!order)return;order.status=button.dataset.dashboardQueueAction==='inuse'?'In use':button.dataset.dashboardQueueAction==='ready'?'Ready':'Completed';toast('Booking updated');render()})}
const renderBeforeDashboardOperational=render;
render=function(){renderBeforeDashboardOperational();bindDashboardOperational()};
if(state.page!=='chat')render();

/* Reference-matched Chat surface: compact mobile inbox with icon search. */
state.chatSearchOpen=state.chatSearchOpen||false;
const chatReferenceRow=thread=>'<button class="chat-reference-row '+(thread.unread?'is-unread ':'')+'" data-chat-thread="'+thread.id+'">'+chatAvatar(thread)+'<span class="chat-reference-copy"><span class="chat-reference-title"><strong>'+esc(thread.name)+'</strong>'+chatLabel(thread)+'</span><small>'+esc(thread.kind==='frontdesk'?thread.hotel+' · Front Desk':thread.hotel+' · Room '+thread.room)+'</small><span class="chat-reference-preview">'+(thread.booking?'<em>'+esc(thread.booking)+'</em> · ':'')+esc(thread.preview)+'</span></span><span class="chat-reference-meta"><time>'+esc(thread.time)+'</time>'+(thread.unread?'<b class="chat-count">'+thread.unread+'</b>':'')+'</span></button>';
chatView=function(){const filters=['All','Unread','Guests','Front Desk'],filtered=cabanaThreadsForReference().filter(chatCompactFilter2).filter(chatCompactMatches2),thread=chatThreadById(state.chatThread);if(state.chatMobileOpen)return '<div class="chat-reference-page chat-reference-open"><header class="chat-reference-header"><button class="chat-reference-back" data-chat-back>‹ <span>Chat</span></button><button class="chat-settings" data-toast="Settings opened" aria-label="Chat settings">⚙</button></header>'+chatConversation(thread)+'</div>';return '<div class="chat-reference-page"><header class="chat-reference-header"><h1>Chat</h1><button class="chat-settings" data-toast="Settings opened" aria-label="Chat settings">⚙</button></header><div class="chat-reference-controls"><button class="chat-search-button '+(state.chatSearchOpen?'open':'')+'" data-chat-search-toggle aria-label="Search conversations">⌕</button>'+(state.chatSearchOpen?'<input class="chat-reference-search" data-chat-search value="'+esc(state.chatQuery)+'" placeholder="Search conversations…">':'')+'<div class="chat-reference-filters" role="tablist">'+filters.map(filter=>'<button class="chat-filter '+(state.chatFilter===filter?'active':'')+'" data-chat-filter="'+filter+'">'+filter+'</button>').join('')+'</div></div><section class="chat-reference-list" aria-label="Conversations">'+(filtered.length?filtered.map(chatReferenceRow).join(''):'<p class="chat-compact-empty">No conversations found.</p>')+'</section></div>'};
function cabanaThreadsForReference(){return cabanaChatThreads}
const chatReferenceRenderBase=render;
render=function(){if(state.page==='chat')return;chatReferenceRenderBase();if(state.page!=='chat')return;document.querySelectorAll('[data-chat-filter]').forEach(button=>button.onclick=()=>{state.chatFilter=button.dataset.chatFilter;state.chatMobileOpen=false;render()});document.querySelectorAll('[data-chat-thread]').forEach(button=>button.onclick=()=>{state.chatThread=button.dataset.chatThread;state.chatMobileOpen=true;chatThreadById(state.chatThread).unread=0;render()});document.querySelectorAll('[data-chat-back]').forEach(button=>button.onclick=()=>{state.chatMobileOpen=false;render()});document.querySelectorAll('[data-chat-search-toggle]').forEach(button=>button.onclick=()=>{state.chatSearchOpen=!state.chatSearchOpen;render();document.querySelector('[data-chat-search]')?.focus()});const search=document.querySelector('[data-chat-search]');if(search)search.oninput=event=>{state.chatQuery=event.target.value;render();const next=document.querySelector('[data-chat-search]');next?.focus();next?.setSelectionRange(state.chatQuery.length,state.chatQuery.length)}};
render();

/* Final pending-card timer and schedule treatment. */
const homeCardScheduleParts=record=>{
  const raw=String(record.when||'Scheduled time not set').trim();
  const range=raw.split(/\s*–\s*/);
  const startRaw=range[0].replace(/\s*·\s*(?=\d{1,2}:\d{2}\s*(?:AM|PM))/i,', ').trim();
  const explicit=raw.match(/\s*·\s*(\d+\s+(?:hours?|days?|day|minutes?))\s*$/i)?.[1]||'';
  let duration=explicit;
  if(!duration&&range.length>1){
    const parseDate=value=>{const parsed=Date.parse(new Date().getFullYear()+' '+value.replace(/\s*·\s*/,' '));return Number.isFinite(parsed)?parsed:null};
    const start=parseDate(range[0]),end=parseDate(range[1]);
    if(start!==null&&end!==null){const days=Math.max(1,Math.round((end-start)/86400000));duration=days+' day'+(days===1?'':'s')}
    else duration='1 day';
  }
  return {dateTime:startRaw.replace(/\s*·\s*(\d+\s+(?:hours?|days?|day|minutes?))\s*$/i,'').trim(),duration,quantity:homeQuantityWithoutBaggage(record.quantity),inlineQuantity:!duration};
};
const homeCardTimerStarts=state.homeCardTimerStarts||(state.homeCardTimerStarts={});
const homeCardTimerMinutes=record=>{
  if(!homeCardTimerStarts[record.id])homeCardTimerStarts[record.id]=Date.now();
  return Math.max(0,dashboardPendingResponseMinutes(record)-Math.floor((Date.now()-homeCardTimerStarts[record.id])/60000));
};
const homeCardTimerLabel=record=>{const minutes=homeCardTimerMinutes(record);return minutes>=60?'⏱ '+Math.ceil(minutes/60)+'h left':'⏱ '+minutes+'m left'};
const homeCardScheduleMarkup=record=>{
  const parts=homeCardScheduleParts(record),first=[parts.dateTime,parts.duration].filter(Boolean).join(' · ');
  return {first,second:parts.inlineQuantity?'':parts.quantity,inline:parts.inlineQuantity?[first,parts.quantity].filter(Boolean).join(' · '):first};
};

dashboardOperationalRequestCard=function(order){
  return '';
  const isNew=(state.dashboardNewPendingRequests||[]).includes(order.id)&&!(state.dashboardSeenRequests||[]).includes(order.id),processing=state.dashboardRequestProcessing===order.id;
  const guestRoom=homeCardGuestRoom(order),payment=homeCardPayment(order),schedule=homeCardScheduleMarkup(order),minutes=homeCardTimerMinutes(order);
  return '<article class="dashboard-request-card '+(isNew?'unseen':'seen')+'"><button class="dashboard-request-main" data-dashboard-request-view="'+esc(order.id)+'">'
    +'<div class="dashboard-request-reference-row"><span class="dashboard-request-reference-group"><small>#'+esc(displayBookingReference(order.id))+'</small>'+(isNew?'<span class="dashboard-request-new-pill">New</span>':'')+'</span><strong class="dashboard-request-timer '+(minutes<15?'critical':'')+'">'+esc(homeCardTimerLabel(order))+'</strong></div>'
    +'<h3>'+esc(order.item)+'</h3>'
    +'<p>'+esc(schedule.inline)+'</p>'
    +(schedule.second?'<small class="dashboard-request-quantity">'+esc(schedule.second)+'</small>':'')
    +(guestRoom?'<small class="dashboard-request-guest-room">'+esc(guestRoom)+'</small>':'')
    +(state.role==='Owner'?'<small class="dashboard-request-financial">'+esc(homeCardAmount(order.total))+' · '+esc(payment)+'</small>':'')
    +'</button><div class="dashboard-request-footer"><div class="dashboard-request-actions"><button class="secondary" '+(processing?'disabled':'')+' data-dashboard-request-action="decline" data-dashboard-request-id="'+esc(order.id)+'">Decline</button><button '+(processing?'disabled':'')+' data-dashboard-request-action="confirm" data-dashboard-request-id="'+esc(order.id)+'">'+(processing?'Processing…':'Confirm')+'</button></div></div></article>';
};

dashboardOperationalBookingRow=function(order){
  return '';
  const status=dashboardOperationalStatus(order),guestRoom=homeCardGuestRoom(order),schedule=homeCardScheduleMarkup(order);
  return '<button class="dashboard-booking-row" data-detail="'+esc(order.id)+'"><span class="dashboard-booking-main">'
    +'<span class="dashboard-request-reference-row"><small class="dashboard-booking-reference">#'+esc(displayBookingReference(order.id))+'</small><em class="dashboard-booking-status '+status.toLowerCase().replaceAll(' ','-')+'">'+esc(status)+'</em></span>'
    +'<strong class="dashboard-booking-title">'+esc(order.item)+'</strong>'
    +'<small class="dashboard-booking-summary">'+esc(schedule.inline)+'</small>'
    +(schedule.second?'<small class="dashboard-booking-quantity">'+esc(schedule.second)+'</small>':'')
    +(guestRoom?'<small class="dashboard-booking-guest-room">'+esc(guestRoom)+'</small>':'')
    +'<small class="dashboard-booking-payment">'+esc(homeCardPayment(order))+'</small>'
    +'</span></button>';
};

bookingLatestCard=function(record){
  return '';
  const past=state.bookingTab==='Past',status=bookingFinalDisplayStatus(record),next=past?'':bookingFinalNextAction(record),menu=state.bookingCardMenuId===record.id,canCancel=!past&&bookingLatestCanCancel(record),schedule=homeCardScheduleMarkup(record);
  const action=next?'<button class="booking-action primary '+(next==='Mark as completed'?'status-next-completed':'status-next-progress')+'" data-final-status-action="'+(next==='Mark as completed'?'complete':'progress')+'" data-final-status-id="'+esc(record.id)+'">'+esc(next)+'</button>':'';
  const more=!past?'<button class="booking-card-more" type="button" data-card-menu="'+esc(record.id)+'" aria-label="More booking actions">⋯</button>':'';
  const cardMenu=menu?'<div class="booking-card-menu"><button data-card-charge="'+esc(record.id)+'">Add charge</button><button data-card-message="'+esc(record.id)+'">Message guest</button>'+(canCancel?'<button class="danger" data-latest-cancel="'+esc(record.id)+'">Cancel booking</button>':'')+'</div>':'';
  return '<article class="booking-card final-booking-card latest-booking-card"><div class="booking-card-hit" role="button" tabindex="0" data-latest-detail="'+esc(record.id)+'"><span class="booking-main-line"><span class="booking-reference-line">#'+esc(displayBookingReference(record.id))+'</span><span class="booking-status '+String(status||'').toLowerCase().replaceAll(' ','-')+'">'+esc(status)+'</span></span><div class="booking-listing">'+esc(record.item)+'</div><div class="booking-line booking-card-schedule">'+esc(schedule.inline)+'</div>'+(schedule.second?'<div class="booking-line booking-card-quantity">'+esc(schedule.second)+'</div>':'')+'<div class="booking-line booking-card-guest-room">'+esc(homeCardGuestRoom(record))+'</div><div class="booking-line booking-card-payment">'+esc(homeCardPayment(record))+'</div>'+(record.cancelReason?'<div class="booking-line booking-cancellation-reason">'+esc(record.cancelledBy==='guest'?'Cancelled by guest':'Cancelled by vendor · '+record.cancelReason)+'</div>':'')+'</div>'+(action||more?'<div class="booking-actions">'+action+more+'</div>':'')+cardMenu+'</article>';
};

if(!window.__cabanaPendingTimerLoop){
  window.__cabanaPendingTimerLoop=setInterval(()=>{
    let expired=false;
    orders.filter(order=>order.status==='Pending').forEach(order=>{
      if(homeCardTimerMinutes(order)>0)return;
      order.status='Expired';
      order.timeline=Array.isArray(order.timeline)?order.timeline.concat([['Expired',todayLabel()]]):[['Expired',todayLabel()]];
      state.dashboardNewPendingRequests=(state.dashboardNewPendingRequests||[]).filter(id=>id!==order.id);
      expired=true;
    });
    if(expired||state.page==='dashboard')render();
  },30000);
}

/* Compact inbox redesign: search, unread filter, and full-width rows. */
state.chatQuery=state.chatQuery||'';
state.chatFilter=state.chatFilter||'All';
const chatCompactMatches=thread=>{const query=String(state.chatQuery||'').trim().toLowerCase();return !query||[thread.name,thread.hotel,thread.room,thread.preview,thread.booking,thread.role].filter(Boolean).join(' ').toLowerCase().includes(query)};
const chatCompactFilter=thread=>state.chatFilter==='All'||state.chatFilter==='Unread'&&thread.unread>0||state.chatFilter==='Guests'&&thread.kind==='guest'||state.chatFilter==='Front Desk'&&thread.kind==='frontdesk';
function chatCompactRow(thread){return '<button class="chat-compact-row '+(thread.unread?'is-unread ':'')+'" data-chat-thread="'+thread.id+'">'+chatAvatar(thread)+'<span class="chat-compact-copy"><span class="chat-compact-name"><strong>'+esc(thread.name)+'</strong>'+chatLabel(thread)+'</span><small>'+esc(thread.kind==='frontdesk'?thread.hotel:thread.hotel+' · Room '+thread.room)+'</small><span class="chat-compact-preview">'+(thread.booking?'<em>'+esc(thread.booking)+'</em> · ':'')+esc(thread.preview)+'</span></span><span class="chat-compact-meta"><time>'+esc(thread.time)+'</time>'+(thread.unread?'<b class="chat-count">'+thread.unread+'</b>':'')+'</span></button>'}
function chatView(){const filters=['All','Unread','Guests','Front Desk'],filtered=cabanaChatThreads.filter(chatCompactFilter).filter(chatCompactMatches),thread=chatThreadById(state.chatThread);if(state.chatMobileOpen)return '<div class="chat-compact-page chat-compact-open"><header class="chat-compact-header"><button class="chat-compact-back" data-chat-back>‹ <span>Chat</span></button><button class="chat-settings" data-toast="Settings opened" aria-label="Chat settings">⚙</button></header>'+chatConversation(thread)+'</div>';return '<div class="chat-compact-page"><header class="chat-compact-header"><h1>Chat</h1><button class="chat-settings" data-toast="Settings opened" aria-label="Chat settings">⚙</button></header><div class="chat-compact-tools"><label class="chat-search" aria-label="Search conversations"><span>⌕</span><input data-chat-search value="'+esc(state.chatQuery)+'" placeholder="Search conversations…"></label><div class="chat-compact-filters" role="tablist">'+filters.map(filter=>'<button class="chat-filter '+(state.chatFilter===filter?'active':'')+'" data-chat-filter="'+filter+'">'+filter+'</button>').join('')+'</div></div><section class="chat-compact-list" aria-label="Conversations">'+(filtered.length?filtered.map(chatCompactRow).join(''):'<p class="chat-compact-empty">No conversations found.</p>')+'</section></div>'}
const chatCompactRenderBase=render;
render=function(){chatCompactRenderBase();if(state.page!=='chat')return;document.querySelectorAll('[data-chat-filter]').forEach(button=>button.onclick=()=>{state.chatFilter=button.dataset.chatFilter;state.chatMobileOpen=false;render()});document.querySelectorAll('[data-chat-thread]').forEach(button=>button.onclick=()=>{state.chatThread=button.dataset.chatThread;state.chatMobileOpen=true;chatThreadById(state.chatThread).unread=0;render()});document.querySelectorAll('[data-chat-back]').forEach(button=>button.onclick=()=>{state.chatMobileOpen=false;render()});const search=document.querySelector('[data-chat-search]');if(search){search.oninput=event=>{state.chatQuery=event.target.value;render();const next=document.querySelector('[data-chat-search]');next?.focus();next?.setSelectionRange(state.chatQuery.length,state.chatQuery.length)}}};
render();

/* Final chat binding: keep the workspace interactive after all page overrides. */
const chatFinalRenderBase=render;
render=function(){
  chatFinalRenderBase();
  if(state.page!=='chat')return;
  document.querySelectorAll('[data-chat-filter]').forEach(button=>button.onclick=()=>{state.chatFilter=button.dataset.chatFilter;state.chatMobileOpen=false;const next=cabanaChatThreads.find(thread=>state.chatFilter==='All'||state.chatFilter==='Front Desk'&&thread.kind==='frontdesk'||state.chatFilter==='Guests'&&thread.kind==='guest');if(next)state.chatThread=next.id;render()});
  document.querySelectorAll('[data-chat-thread]').forEach(button=>button.onclick=()=>{state.chatThread=button.dataset.chatThread;state.chatMobileOpen=true;chatThreadById(state.chatThread).unread=0;render()});
  document.querySelectorAll('[data-chat-back]').forEach(button=>button.onclick=()=>{state.chatMobileOpen=false;render()});
  const form=document.querySelector('[data-chat-form]');
  if(form)form.onsubmit=event=>{event.preventDefault();const input=form.elements.message,text=String(input.value||'').trim();if(!text)return;const selected=chatThreadById(state.chatThread);selected.messages.push({from:'me',text,time:'now'});selected.preview=text;selected.time='now';render()};
};
render();

/* Rebind chat controls after the portal's final render wrapper is installed. */
if(!window.__cabanaChatFinalized){
  window.__cabanaChatFinalized=true;
  const chatRenderFinalBase=render;
  render=function(){
    chatRenderFinalBase();
    if(state.page!=='chat')return;
    document.querySelectorAll('[data-chat-filter]').forEach(button=>button.onclick=()=>{state.chatFilter=button.dataset.chatFilter;render()});
    document.querySelectorAll('[data-chat-thread]').forEach(button=>button.onclick=()=>{state.chatThread=button.dataset.chatThread;chatThreadById(state.chatThread).unread=0;render()});
    const form=document.querySelector('[data-chat-form]');
    if(form)form.onsubmit=event=>{event.preventDefault();const input=form.elements.message,text=String(input.value||'').trim();if(!text)return;const selected=chatThreadById(state.chatThread);selected.messages.push({from:'me',text,time:'now'});selected.preview=text;selected.time='now';render();setTimeout(()=>document.querySelector('.chat-messages')?.scrollTo({top:99999,behavior:'smooth'}),0)};
  };
  render();
}

/* Chat workspace: partner hotel threads stay pinned above guest conversations. */
const cabanaChatThreads=[
  {id:'front-desk-luna',kind:'frontdesk',name:'Henry’s Resort Dumaguete',role:'Front Desk',hotel:'Henry’s Resort Dumaguete',room:'',time:'10:42 AM',preview:'Can you take 2 more pax tomorrow?',unread:1,icon:'⌂',messages:[{from:'them',text:'Can you take 2 more pax tomorrow?',time:'10:42 AM'}]},
  {id:'nina-garcia',kind:'guest',name:'Nina Garcia',role:'Guest',hotel:'Henry’s Resort Dumaguete',room:'203',booking:'#BK-9002',time:'9:15 AM',preview:'Thanks, see you at the lobby!',icon:'NG',messages:[{from:'them',text:'Thanks, see you at the lobby!',time:'9:15 AM'},{from:'me',text:'You’re welcome — we’ll see you there.',time:'9:18 AM'}]},
  {id:'marco-santos',kind:'guest',name:'Marco Santos',role:'Guest',hotel:'Henry’s Resort Dumaguete',room:'508',booking:'#BK-9003',time:'Yesterday',preview:'What time is pickup?',icon:'MS',messages:[{from:'them',text:'What time is pickup?',time:'Yesterday'},{from:'me',text:'Pickup is at 4:30 PM from the lobby.',time:'Yesterday'}]}
];
state.chatFilter=state.chatFilter||'All';
state.chatThread=state.chatThread||'front-desk-luna';
const chatThreadById=id=>cabanaChatThreads.find(thread=>thread.id===id)||cabanaChatThreads[0];
const chatAvatar=thread=>thread.kind==='frontdesk'?'<span class="chat-avatar hotel-avatar" aria-hidden="true">⌂</span>':'<span class="chat-avatar guest-avatar" aria-hidden="true">'+esc(thread.icon)+'</span>';
const chatLabel=thread=>thread.kind==='frontdesk'?'<span class="chat-type frontdesk-type">Front Desk</span>':'<span class="chat-type guest-type">Guest</span>';
function chatListItem(thread){return '<button class="chat-thread-row '+(state.chatThread===thread.id?'selected ':'')+(thread.unread?'has-unread':'')+'" data-chat-thread="'+thread.id+'">'+chatAvatar(thread)+'<span class="chat-thread-copy"><span class="chat-thread-top"><strong>'+esc(thread.name)+'</strong>'+chatLabel(thread)+'<time>'+esc(thread.time)+'</time></span><small class="chat-thread-subtitle">'+(thread.kind==='frontdesk'?esc(thread.hotel)+' · Front Desk':esc(thread.hotel)+' · Room '+esc(thread.room))+'</small><span class="chat-thread-preview">'+(thread.booking?'<em>'+esc(thread.booking)+'</em> · ':'')+esc(thread.preview)+'</span></span>'+(thread.unread?'<b class="chat-count">'+thread.unread+'</b>':'')+'</button>'}
function chatConversation(thread){const guest=thread.kind==='guest';return '<section class="chat-conversation"><header class="chat-conversation-header"><button class="chat-mobile-back" data-chat-back aria-label="Back to conversations">‹</button>'+chatAvatar(thread)+'<span><strong>'+esc(thread.name)+'</strong><small>'+chatLabel(thread)+' · '+esc(thread.hotel)+(thread.room?' · Room '+esc(thread.room):'')+'</small></span><button class="chat-more" data-toast="Conversation options opened" aria-label="Conversation options">•••</button></header>'+(guest?'<button class="chat-booking-card" data-page="orders" data-detail="CB-9003"><span><strong>#BK-9003 · Airport Transfer — SUV</strong><small>Today · 4:30 PM · <b>Confirmed</b></small></span><span>View&nbsp; →</span></button>':'')+'<div class="chat-messages">'+thread.messages.map(message=>'<div class="chat-message '+message.from+'"><div class="chat-bubble">'+esc(message.text)+'</div><time>'+esc(message.time)+'</time></div>').join('')+(thread.kind==='frontdesk'?'<div class="chat-system-card"><span class="chat-system-icon">✓</span><span><strong>Booking #BK-1050 created for Room 203</strong><small>Booked by Front Desk · Pending request in Home</small></span><button data-page="dashboard">View</button></div>':'')+'</div><form class="chat-composer" data-chat-form><button type="button" class="chat-attach" data-toast="Photo picker opened" aria-label="Attach a photo">＋</button><input name="message" autocomplete="off" placeholder="Message '+(guest?'guest':'Front Desk')+'…" aria-label="Message"><button class="chat-send" type="submit" aria-label="Send message">↑</button></form></section>'}
function chatView(){const filter=state.chatFilter||'All',filtered=cabanaChatThreads.filter(thread=>filter==='All'||filter==='Front Desk'&&thread.kind==='frontdesk'||filter==='Guests'&&thread.kind==='guest'),thread=chatThreadById(state.chatThread);return '<div class="chat-page"><header class="chat-page-head"><div><div class="eyebrow">INBOX</div><h1>Chat</h1><p class="subtext">Keep guest and hotel conversations together.</p></div><span class="chat-unread-summary">1 unread</span></header><div class="chat-filter-bar">'+['All','Guests','Front Desk'].map(filterName=>'<button class="chat-filter '+(filter===filterName?'active':'')+'" data-chat-filter="'+filterName+'">'+filterName+(filterName==='Front Desk'?'<span class="filter-icon-label">⌂</span>':'' )+'</button>').join('')+'</div><div class="chat-layout '+(state.chatMobileOpen?'show-conversation':'')+'"><aside class="chat-inbox"><div class="chat-inbox-heading"><strong>Conversations</strong><span>'+filtered.length+'</span></div>'+(filtered.length?'<div class="chat-thread-list">'+(filtered.filter(item=>item.kind==='frontdesk').map(chatListItem).join('')+filtered.filter(item=>item.kind==='guest').map(chatListItem).join(''))+'</div>':'<div class="chat-no-results">No conversations in this filter.</div>')+'</aside>'+chatConversation(thread)+'</div></div>'}
const cabanaChatRenderBase=render;
render=function(){cabanaChatRenderBase();if(state.page!=='chat')return;document.querySelectorAll('[data-chat-filter]').forEach(button=>button.onclick=()=>{state.chatFilter=button.dataset.chatFilter;render()});document.querySelectorAll('[data-chat-thread]').forEach(button=>button.onclick=()=>{state.chatThread=button.dataset.chatThread;const selected=chatThreadById(state.chatThread);selected.unread=0;render()});document.querySelectorAll('[data-chat-back]').forEach(button=>button.onclick=()=>{document.querySelector('.chat-layout')?.classList.remove('show-conversation')});const form=document.querySelector('[data-chat-form]');if(form)form.onsubmit=event=>{event.preventDefault();const input=form.elements.message,text=String(input.value||'').trim();if(!text)return;const selected=chatThreadById(state.chatThread);selected.messages.push({from:'me',text,time:'now'});selected.preview=text;selected.time='now';input.value='';render();setTimeout(()=>document.querySelector('.chat-messages')?.scrollTo({top:99999,behavior:'smooth'}),0)};document.querySelectorAll('[data-chat-thread]').forEach(button=>button.addEventListener('click',()=>document.querySelector('.chat-layout')?.classList.add('show-conversation'),{once:true}))};
render();

/* Single-sheet vendor cancellation flow with an undo window. */
const vendorCancellationUndoEntries=new Map();
const vendorCancellationSnapshotKeys=['status','cancelledBy','cancelReason','cancelNote','roomChargeRemoved','payment','settlement'];
function vendorCancellationSnapshot(record){const snapshot={};vendorCancellationSnapshotKeys.forEach(key=>{snapshot[key]=record[key]});return snapshot}
function vendorCancellationRestore(record,snapshot){vendorCancellationSnapshotKeys.forEach(key=>{if(snapshot[key]===undefined)delete record[key];else record[key]=snapshot[key]})}
function vendorCancellationRemoveById(list,id){for(let index=list.length-1;index>=0;index--)if(list[index]?.id===id)list.splice(index,1)}
function vendorCancellationNotify(entry){if(entry.undone||entry.notified)return;entry.notified=true;vendorCancellationUndoEntries.delete(entry.id);toast('Guest and Front Desk notified')}
function vendorCancellationUndo(entry){if(entry.undone)return;entry.undone=true;clearTimeout(entry.timer);vendorCancellationUndoEntries.delete(entry.id);vendorCancellationRestore(entry.record,entry.snapshot);if(entry.addedVendor)vendorCancellationRemoveById(vendorCancelledRecords,entry.id);if(entry.addedPast&&typeof bookingPastExtras!=='undefined')vendorCancellationRemoveById(bookingPastExtras,entry.id);entry.toastNode?.remove();state.bookingLatestCancelId=null;state.bookingLatestCancelReason='';state.bookingLatestCancelNote='';state.bookingTab='Active';state.detail=null;render();toast('Cancellation undone')}
function vendorCancellationUndoToast(entry){const region=document.querySelector('#toast-region');if(!region)return;const node=document.createElement('div');node.className='toast vendor-cancellation-toast';const label=document.createElement('span');label.textContent=entry.reference+' cancelled';const separator=document.createTextNode(' · ');const undo=document.createElement('button');undo.type='button';undo.className='toast-undo';undo.textContent='Undo';undo.onclick=()=>vendorCancellationUndo(entry);node.append(label,separator,undo);region.append(node);entry.toastNode=node}
if(!window.__cabanaSingleCancelFlowBound){
  window.__cabanaSingleCancelFlowBound=true;
  document.addEventListener('input',event=>{
    const note=event.target.closest?.('[data-vendor-cancel-note]');
    if(!note)return;
    state.bookingLatestCancelNote=note.value;
    const submit=document.querySelector('[data-vendor-cancel-submit]');
    if(submit)submit.disabled=!String(state.bookingLatestCancelReason||'').trim()||(state.bookingLatestCancelReason==='Other'&&!String(note.value||'').trim());
  },true);
  document.addEventListener('click',event=>{
    const reasonOption=event.target.closest?.('[data-vendor-cancel-reason]');
    if(reasonOption){event.preventDefault();event.stopImmediatePropagation();state.bookingLatestCancelReason=reasonOption.dataset.vendorCancelReason||'';state.bookingLatestCancelNote=state.bookingLatestCancelReason==='Other'?state.bookingLatestCancelNote:'';render();return}
    const close=event.target.closest?.('[data-vendor-cancel-close]');
    if(close){event.preventDefault();event.stopImmediatePropagation();state.bookingLatestCancelId=null;state.bookingLatestCancelReason='';state.bookingLatestCancelNote='';render();return}
    const submit=event.target.closest?.('[data-vendor-cancel-submit]');
    if(!submit){return}
    event.preventDefault();event.stopImmediatePropagation();
    const record=bookingLatestAll().find(item=>item.id===state.bookingLatestCancelId),selectedReason=String(state.bookingLatestCancelReason||''),note=String(state.bookingLatestCancelNote||document.querySelector('[data-vendor-cancel-note]')?.value||'').trim();
    if(!record||!selectedReason||(selectedReason==='Other'&&!note))return;
    const entry={id:record.id,reference:'#'+displayBookingReference(record.id),record,snapshot:vendorCancellationSnapshot(record),addedVendor:false,addedPast:false,undone:false,notified:false,timer:null,toastNode:null};
    record.status='Cancelled';record.cancelledBy='vendor';record.cancelReason=selectedReason;record.cancelNote=note;
    if(/room/i.test(String(record.payment||''))||/awaiting checkout|pending/i.test(String(record.settlement||''))){record.roomChargeRemoved=true;record.payment='No charge';record.settlement='Cancelled — room charge removed'}
    if(!vendorCancelledRecords.some(item=>item.id===record.id)){vendorCancelledRecords.push({...record});entry.addedVendor=true}
    if(typeof bookingPastExtras!=='undefined'&&!bookingPastExtras.some(item=>item.id===record.id)){bookingPastExtras.push({...record});entry.addedPast=true}
    vendorCancellationUndoEntries.set(entry.id,entry);entry.timer=setTimeout(()=>vendorCancellationNotify(entry),5000);
    state.bookingLatestCancelId=null;state.bookingLatestCancelReason='';state.bookingLatestCancelNote='';state.bookingCardMenuId=null;state.bookingTab='Past';state.detail=null;render();vendorCancellationUndoToast(entry);
  },true);
}
bookingLatestCancelModal=function(){
  if(!state.bookingLatestCancelId)return '';
  const record=bookingLatestAll().find(item=>item.id===state.bookingLatestCancelId),reference=record?'#'+displayBookingReference(record.id):'',reason=state.bookingLatestCancelReason||'',note=state.bookingLatestCancelNote||'',ready=!!reason&&(reason!=='Other'||!!String(note).trim()),reasons=['Weather','Vehicle or equipment unavailable','Staff unavailable','Fully booked','Other'];
  const options=reasons.map(item=>'<button type="button" role="radio" aria-checked="'+(reason===item?'true':'false')+'" class="decline-reasons-option '+(reason===item?'active':'')+'" data-vendor-cancel-reason="'+esc(item)+'"><span class="cancel-sheet-radio" aria-hidden="true"></span><span>'+esc(item)+'</span></button>').join('');
  return '<div class="booking-decline-backdrop" data-vendor-cancel-close></div><section class="booking-decline-modal booking-cancel-sheet" role="dialog" aria-modal="true" aria-label="Cancel '+esc(reference)+'?"><div class="cancel-sheet-handle"></div><button type="button" class="cancel-sheet-close" data-vendor-cancel-close aria-label="Close">×</button><h2>Cancel '+esc(reference)+'?</h2><p>Choose a reason. The guest and Front Desk will be notified.</p><div class="decline-reasons" role="radiogroup" aria-label="Cancellation reason">'+options+'</div>'+(reason==='Other'?'<textarea data-vendor-cancel-note aria-label="Cancellation note" placeholder="Add a note (required)">'+esc(note)+'</textarea>':'')+'<div class="booking-detail-actions cancel-sheet-actions"><button type="button" class="button ghost" data-vendor-cancel-close>Keep booking</button><button type="button" class="button cancel-sheet-danger" data-vendor-cancel-submit '+(!ready?'disabled':'')+'>Cancel booking</button></div></section>';
};
render();

/* Home status copy: future upcoming bookings are confirmed; in-progress is blue in the shared UI. */
dashboardOperationalStatus=function(order){
  if(['Scheduled','Confirmed'].includes(order.status))return 'Confirmed';
  if(['In progress','In use','Preparing','Ready','Ready for pickup','Checked in'].includes(order.status))return 'In progress';
  return order.status;
};
/* Final booking filters: radios for one date and checkboxes for multiple listings. */
function bookingLatestRecordDate(record){
  const match=String(record.when||'').match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})/i);
  if(!match)return null;
  const months={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
  return new Date(2026,months[match[1].slice(0,1).toUpperCase()+match[1].slice(1).toLowerCase()],Number(match[2]));
}
function bookingLatestDateMatches(record,date,filters){
  if(!date||date==='All dates')return true;
  const current=bookingLatestRecordDate(record);if(!current)return false;
  const today=new Date(2026,9,7);today.setHours(0,0,0,0);current.setHours(0,0,0,0);
  if(date==='Today')return current.getTime()===today.getTime();
  if(date==='Tomorrow'){const next=new Date(today);next.setDate(next.getDate()+1);return current.getTime()===next.getTime()}
  if(date==='This week'){const start=new Date(today);start.setDate(start.getDate()-((start.getDay()+6)%7));const end=new Date(start);end.setDate(end.getDate()+6);return current>=start&&current<=end}
  if(date==='Last 7 days'||date==='Last 30 days'){const start=new Date(today);start.setDate(start.getDate()-(date==='Last 7 days'?6:29));return current>=start&&current<=today}
  if(date==='Custom range…'){
    const from=filters.customFrom?new Date(filters.customFrom+'T00:00:00'):null,to=filters.customTo?new Date(filters.customTo+'T00:00:00'):null;
    if(from)from.setHours(0,0,0,0);if(to)to.setHours(0,0,0,0);return (!from||current>=from)&&(!to||current<=to);
  }
  return true;
}
bookingLatestFilterSheet=function(){
  if(!state.bookingFilterOpen)return '';
  const f=state.bookingLatestFilters||{},selectedListings=bookingLatestSelectedListings(),allListingsSelected=!selectedListings.length;
  const dateOptions=['All dates','Last 7 days','Last 30 days','This month','Last month','This year','Custom range…'];
  const dateChoice=value=>'<label class="booking-choice booking-choice-radio '+(f.date===value?'active':'')+'"><input type="radio" name="booking-date-filter" value="'+esc(value)+'" data-latest-filter-option="date" '+(f.date===value?'checked':'')+'><span class="booking-choice-indicator" aria-hidden="true"></span><span class="booking-choice-label">'+esc(value)+'</span></label>';
  const listingChoice=value=>{const checked=value==='All listings'?allListingsSelected:selectedListings.includes(value);return '<label class="booking-choice booking-choice-checkbox '+(checked?'active':'')+'"><input type="checkbox" name="booking-listing-filter" value="'+esc(value)+'" data-latest-filter-option="listing" '+(checked?'checked':'')+'><span class="booking-choice-indicator" aria-hidden="true"></span><span class="booking-choice-label">'+esc(value)+'</span></label>'};
  const custom=f.date==='Custom range…'?'<div class="booking-custom-range"><label>From<input type="date" data-latest-custom-from value="'+esc(f.customFrom||'')+'"></label><label>To<input type="date" data-latest-custom-to value="'+esc(f.customTo||'')+'"></label></div>':'';
  const resultCount=bookingLatestRows().length;
  return '<div class="booking-sheet-backdrop" data-latest-filter-close></div><section class="booking-filter-sheet" role="dialog" aria-modal="true"><div class="sheet-handle"></div><header><div><h2>Filters</h2><p>Choose one date range and one or more listings.</p></div><button data-latest-filter-close aria-label="Close filters">×</button></header><fieldset><legend>Date</legend>'+dateOptions.map(dateChoice).join('')+'</fieldset>'+custom+'<fieldset><legend>Listing</legend>'+listingChoice('All listings')+listings.map(x=>listingChoice(x.name)).join('')+'</fieldset><div class="booking-filter-actions"><button class="button ghost" data-latest-filter-reset>Reset</button><button class="button primary" data-latest-filter-apply>Show '+resultCount+' bookings</button></div></section>';
};
bookingLatestRows=function(){
  const tab=state.bookingTab==='Past'?'Past':'Active',f=state.bookingLatestFilters||{},selectedListings=bookingLatestSelectedListings(),q=(state.bookingQuery||'').toLowerCase().trim(),source=bookingLatestAll().concat(typeof bookingLatestCancelled!=='undefined'?bookingLatestCancelled:[]);
  return source.filter(record=>{const dateOk=bookingLatestDateMatches(record,f.date,f),listingOk=!selectedListings.length||selectedListings.includes(record.item),searchOk=!q||`${record.id} ${record.guest} ${record.room} ${record.item} ${record.hotel}`.toLowerCase().includes(q);return (tab==='Active'?bookingLatestActive(record):bookingLatestPast(record)||record.status==='Cancelled')&&dateOk&&listingOk&&searchOk}).filter((record,index,all)=>all.findIndex(other=>other.id===record.id)===index).sort((a,b)=>bookingCalendarSortValue(bookingCalendarLabel(a))-bookingCalendarSortValue(bookingCalendarLabel(b))||String(a.when).localeCompare(String(b.when)));
};
const bookingLatestFilterControlsRenderBase=render;
render=function(){
  bookingLatestFilterControlsRenderBase();
  if(state.page!=='orders')return;
  document.querySelectorAll('[data-latest-filter-option]').forEach(control=>control.onchange=()=>{
    const key=control.dataset.latestFilterOption,value=control.value;
    if(key==='date')state.bookingLatestFilters.date=value;
    if(key==='listing'){
      const selected=bookingLatestSelectedListings();
      if(value==='All listings')state.bookingLatestFilters.listing=[];
      else state.bookingLatestFilters.listing=selected.includes(value)?selected.filter(item=>item!==value):selected.concat(value);
    }
    render();
  });
  document.querySelectorAll('[data-latest-custom-from],[data-latest-custom-to]').forEach(input=>input.onchange=()=>{state.bookingLatestFilters[input.hasAttribute('data-latest-custom-from')?'customFrom':'customTo']=input.value;render()});
  document.querySelectorAll('[data-latest-filter-reset]').forEach(button=>button.onclick=()=>{state.bookingLatestFilters={date:'All dates',listing:[],type:'All'};render()});
};
dashboardOperationalBookingRow=function(order,dateLabel){
  const isAirportTransfer=/^Airport Transfer/i.test(String(order.item||''));
  const displayId=order.id==='CB-9002'?'BK-9002':order.id;
  const displayItem=isAirportTransfer?'Airport Transfer':order.item;
  const displayWhen=order.id==='CB-9002'?'Oct 7 · 11:00 AM':order.when;
  const duration=dashboardOperationalBookingDuration({...order,when:displayWhen}),details=[dashboardOperationalBookingQuantity(order),duration].filter(Boolean).join(' · ');
  const raw=String(displayWhen||'').trim();
  let dateText=raw.split(/\s*·\s*/)[0]||dateLabel;
  if(/^Today$/i.test(dateText))dateText=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(dashboardOperationalToday());
  if(/^Tomorrow$/i.test(dateText)){const tomorrow=dashboardOperationalToday();tomorrow.setDate(tomorrow.getDate()+1);dateText=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(tomorrow)}
  const time=dashboardOperationalBookingTime({...order,when:displayWhen}),dateTime=[dateText,time].filter(Boolean).join(' · '),status=dashboardOperationalStatus(order);
  const guestRoom=[order.guest,order.room?'Room '+order.room:''].filter(Boolean).join(' · ');
  return '<button class="dashboard-booking-row" data-detail="'+esc(order.id)+'"><span class="dashboard-booking-main"><span class="dashboard-booking-time-line"><strong class="dashboard-booking-reference">#'+esc(displayId)+'</strong><em class="dashboard-booking-status '+status.toLowerCase().replaceAll(' ','-')+'">'+esc(status)+'</em></span><strong class="dashboard-booking-title">'+esc(displayItem)+'</strong><small class="dashboard-booking-date">'+esc(dateTime)+'</small>'+(guestRoom?'<small>'+esc(guestRoom)+'</small>':'')+'<small>'+esc(details)+'</small></span></button>';
};

/* Final Bookings schedule refinement: calendar-day groups, no Later bucket, no QR controls. */
const bookingScheduleExtras=[
  {id:'CB-9007',kind:'Booking',guest:'Amelia Reyes',hotel:'Henry’s Resort Dumaguete',room:'508',item:'Airport Transfer — Sedan',quantity:'2 pax · 2 bags',when:'Oct 7 · 4:30 PM · 2 hours',fulfilment:'Hotel pick-up · Dumaguete–Sibulan Airport',total:'₱2,400.00',payment:'Gateway payment pending',settlement:'Payment pending',status:'Confirmed',timeline:[['Booking confirmed','Oct 6 · 10:14 AM']],notes:'Child seat requested.',contact:'Open guest chat'},
  {id:'CB-9010',kind:'Booking',guest:'Amelia Reyes',hotel:'Henry’s Resort Dumaguete',room:'508',item:'Airport Transfer — Sedan',quantity:'2 pax · 2 bags',when:'Oct 9 · 8:30 AM · 2 hours',fulfilment:'Hotel pick-up · Dumaguete–Sibulan Airport',total:'₱2,400.00',payment:'Gateway payment pending',settlement:'Payment pending',status:'Confirmed',timeline:[['Booking confirmed','Oct 2 · 10:14 AM']],notes:'Child seat requested.',contact:'Open guest chat'},
  {id:'CB-9013',kind:'Booking',guest:'Leo Santos',hotel:'Henry’s Resort Dumaguete',room:'207',item:'Toyota Innova Rental',quantity:'1 vehicle',when:'Oct 13 · 9:00 AM–Oct 14 · 9:00 AM · 1 day',fulfilment:'Pickup and return: Henry’s Resort Dumaguete lobby',total:'₱4,800.00',payment:'Charged to room',settlement:'Awaiting guest checkout',status:'Confirmed',timeline:[['Booking confirmed','Oct 4 · 1:20 PM']],notes:'Return by 9:00 AM on Oct 14.',contact:'Open guest chat'},
  {id:'PAST-DECLINED-02',kind:'Booking',guest:'Nina Garcia',hotel:'Henry’s Resort Dumaguete',room:'203',item:'Private bakery tasting',quantity:'4 guests',when:'Oct 2 · 2:00 PM · 1 hour',fulfilment:'Tasting room',total:'₱4,800.00',payment:'Gateway payment pending',settlement:'Vendor declined',status:'Declined',timeline:[['Booking requested','Sep 29 · 4:00 PM'],['Declined','Oct 1 · 8:14 AM']],notes:'',contact:'View guest record'}
];
function bookingCalendarLabel(o){
  const raw=String(o.when||'');
  if(/Today/i.test(raw)||/Oct 7/i.test(raw))return 'Today · Oct 7';
  if(/Tomorrow/i.test(raw)||/Oct 8/i.test(raw))return 'Tomorrow · Oct 8';
  if(/Oct 9/i.test(raw))return 'Thu · Oct 9';
  if(/Oct 13/i.test(raw))return 'Mon · Oct 13';
  const match=raw.match(/(?:^|\s)(Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug)\s+(\d{1,2})/i);
  return match?match[1]+' '+match[2]:'Other date';
}
const bookingCalendarOrder={'Today · Oct 7':1007,'Tomorrow · Oct 8':1008,'Thu · Oct 9':1009,'Mon · Oct 13':1013};
function bookingCalendarSortValue(label){
  if(Object.prototype.hasOwnProperty.call(bookingCalendarOrder,label))return bookingCalendarOrder[label];
  const match=String(label).match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})/);
  if(!match)return 99;
  const months={Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12};
  return months[match[1]]*100+Number(match[2]);
}
bookingLatestAll=function(){return orders.concat(bookingPastExtras||[]).concat(bookingScheduleExtras).concat(bookingLatestCancelled||[]).filter((item,index,all)=>all.findIndex(other=>other.id===item.id)===index)};
bookingLatestGroup=bookingCalendarLabel;
bookingLatestRows=function(){
  const tab=state.bookingTab==='Past'?'Past':'Active',f=state.bookingLatestFilters||{date:'All dates',type:'All',listing:'All listings'},q=(state.bookingQuery||'').toLowerCase().trim();
  return bookingLatestAll().filter(o=>{
    const typeOk=f.type==='All'||f.type===bookingLatestKind(o),listOk=f.listing==='All listings'||f.listing===o.item;
    const group=bookingCalendarLabel(o),dateOk=f.date==='All dates'||f.date==='Last 7 days'||f.date===group||f.date===group.split(' · ').pop();
    const searchOk=!q||`${o.id} ${o.guest} ${o.room} ${o.item} ${o.hotel}`.toLowerCase().includes(q);
    return (tab==='Active'?bookingLatestActive(o):bookingLatestPast(o))&&typeOk&&listOk&&dateOk&&searchOk;
  }).sort((a,b)=>{
    const groupDiff=bookingCalendarSortValue(bookingCalendarLabel(a))-bookingCalendarSortValue(bookingCalendarLabel(b));
    return groupDiff||String(a.when).localeCompare(String(b.when));
  });
};
bookingLatestCard=function(o){
  const past=state.bookingTab==='Past',kind=bookingLatestKind(o),shownStatus=o.status==='Scheduled'?'Confirmed':o.status==='In progress'?'Checked in':o.status==='Ready'?'Ready for pickup':o.status;
  const action=past?'':shownStatus==='Confirmed'?(kind==='Product'?'<button class="booking-action primary" data-latest-action="ready" data-latest-id="'+o.id+'">Mark ready</button>':'<button class="booking-action primary" data-latest-action="checkin" data-latest-id="'+o.id+'">Check in</button>'):['Checked in','Ready for pickup'].includes(shownStatus)?'<button class="booking-action primary" data-latest-action="complete" data-latest-id="'+o.id+'">Mark completed</button>':'';
  return '<article class="booking-card final-booking-card latest-booking-card"><button class="booking-card-hit" data-latest-detail="'+o.id+'"><div class="booking-final-title"><span class="booking-kind-icon '+(kind==='Product'?'product':'service')+'">'+(kind==='Product'?'▣':'⌁')+'</span><div><div class="booking-listing">'+esc(o.item)+'</div><span class="booking-type">'+kind+'</span></div><span class="booking-status '+shownStatus.toLowerCase().replaceAll(' ','-')+'">'+esc(shownStatus)+'</span></div><div class="booking-reference-line">Booking #'+esc(o.id)+'</div><div class="booking-line">◷ '+esc(o.when)+'</div><div class="booking-line">♙ '+esc(o.guest)+' · '+esc(o.hotel)+' · Room '+esc(o.room)+'</div><div class="booking-line">▤ '+esc(o.quantity||'—')+' · '+bookingLatestPayment(o)+'</div>'+(o.cancelReason?'<div class="booking-line booking-cancellation-reason">Cancellation reason: '+esc(o.cancelReason)+'</div>':'')+'</button>'+(action?'<div class="booking-actions">'+action+'</div>':'')+'</article>';
};
bookingLatestFilterSheet=function(){if(!state.bookingFilterOpen)return '';const f=state.bookingLatestFilters||{},choices=['All dates','Today · Oct 7','Tomorrow · Oct 8','Thu · Oct 9','Mon · Oct 13','Last 7 days'];const choice=(key,values)=>'<fieldset><legend>'+key.charAt(0).toUpperCase()+key.slice(1)+'</legend>'+values.map(v=>'<button class="booking-choice '+(f[key]===v?'active':'')+'" data-latest-filter="'+key+'" data-latest-filter-value="'+esc(v)+'"><span>'+esc(v)+'</span>'+(f[key]===v?'<b>✓</b>':'')+'</button>').join('')+'</fieldset>';return '<div class="booking-sheet-backdrop" data-latest-filter-close></div><section class="booking-filter-sheet" role="dialog" aria-modal="true"><div class="sheet-handle"></div><header><div><h2>Filters</h2><p>Choose a booking date, type, or listing.</p></div><button data-latest-filter-close>×</button></header>'+choice('date',choices)+choice('type',['All','Product','Service & rental'])+choice('listing',['All listings',...listings.map(x=>x.name)])+'<div class="booking-filter-actions"><button class="button ghost" data-latest-filter-reset>Reset</button><button class="button primary" data-latest-filter-apply>Apply filters</button></div></section>'};
bookingLatestWorkspace=function(){
  const tab=state.bookingTab==='Past'?'Past':'Active',rows=bookingLatestRows(),activeCount=bookingLatestAll().filter(record=>bookingLatestActive(record)).length,groups={};
  rows.forEach(o=>{const key=tab==='Past'?'Past bookings':bookingCalendarLabel(o);(groups[key]||(groups[key]=[])).push(o)});
  const chips=Object.entries(state.bookingLatestFilters||{}).filter(([k,v])=>v&&v!=='All'&&v!=='All dates'&&v!=='All listings').map(([k,v])=>'<button class="booking-chip" data-latest-chip="'+k+'">'+esc(v)+' ×</button>').join('');
  const body=Object.entries(groups).sort((a,b)=>bookingCalendarSortValue(a[0])-bookingCalendarSortValue(b[0])).map(([g,items])=>'<section class="booking-group"><h2>'+g+'</h2>'+items.map(bookingLatestCard).join('')+'</section>').join('');
  return '<div class="bookings-workspace final-bookings-workspace latest-bookings-workspace"><header class="dashboard-operational-header booking-page-header"><h1>Bookings</h1><div class="booking-header-actions"><button class="dashboard-header-icon" data-toast="No new notifications" aria-label="Notifications"><i class="hgi-stroke hgi-notification-03"></i></button></div></header><nav class="bookings-tabs final-bookings-tabs" role="tablist"><button class="'+(tab==='Active'?'active':'')+'" data-latest-tab="Active">Active</button><button class="'+(tab==='Past'?'active':'')+'" data-latest-tab="Past">Past</button></nav><div class="bookings-tools"><div class="bookings-search"><i class="hgi-stroke hgi-search-01"></i><input data-latest-search value="'+esc(state.bookingQuery||'')+'" placeholder="Search guest, room, or booking number" aria-label="Search guest, room, or booking number"></div><button class="booking-filter-trigger" data-latest-filter-open><i class="hgi-stroke hgi-filter-horizontal"></i><span>Filter</span></button></div>'+(chips?'<div class="booking-chips">'+chips+'</div>':'')+(tab==='Past'&&state.role==='Owner'?'<button class="booking-export final-export" data-latest-export><i class="hgi-stroke hgi-download-04" aria-hidden="true"></i> Export CSV</button>':'')+(body||'<div class="bookings-empty"><strong>No '+tab.toLowerCase()+' bookings.</strong><span>Try changing your search or filters.</span></div>')+'</div>';
};
const bookingLatestDetailBeforeScheduleRefinement=bookingLatestDetail;
bookingLatestDetail=function(){
  const html=bookingLatestDetailBeforeScheduleRefinement();
  return html.replace('<div class="booking-request-field"><span>Booked by</span><strong>Guest</strong></div>','<div class="booking-request-field"><span>Booked by</span><strong>'+(bookingLatestAll().find(x=>x.id===state.detail)?.frontDesk?'Front Desk':'Guest')+'</strong></div>').replace('</section><section class="booking-request-section"><h2>Guest</h2>','<div class="booking-request-field"><span>Notes</span><strong>'+esc(bookingLatestAll().find(x=>x.id===state.detail)?.notes||'None')+'</strong></div></section><section class="booking-request-section"><h2>Guest</h2>');
};
state.page='orders';state.detail=null;state.bookingTab='Active';
render();

/* Pending Requests: compact overviews with the full record kept in details. */
dashboardOperationalRequestCard=function(order){
  const isNew=(state.dashboardNewPendingRequests||[]).includes(order.id)&&!(state.dashboardSeenRequests||[]).includes(order.id),processing=state.dashboardRequestProcessing===order.id;
  const newPill=isNew?'<span class="dashboard-request-new-pill">New</span>':'';
  const guestRoom=[order.guest,order.hotel,order.room?'Room '+order.room:''].filter(Boolean).join(' · '),financial=[order.total,order.payment].filter(Boolean).join(' · ');
  const deadline=dashboardOperationalDeadline(order);
  return '<article class="dashboard-request-card '+(isNew?'unseen':'seen')+'"><button class="dashboard-request-main" data-dashboard-request-view="'+esc(order.id)+'"><div class="dashboard-request-reference-row"><small>#'+esc(displayBookingReference(order.id))+'</small>'+newPill+'</div><div class="dashboard-request-title-row"><h3>'+esc(order.item)+'</h3></div><p>'+esc(dashboardOperationalRequestSummary(order))+'</p>'+(guestRoom?'<small class="dashboard-request-guest-room">'+esc(guestRoom)+'</small>':'')+(financial?'<small class="dashboard-request-financial">'+esc(financial)+'</small>':'')+'<strong class="dashboard-request-deadline '+(Number(order.responseMinutes||24)<=30?'urgent':'')+'">'+deadline+'</strong></button><div class="dashboard-request-footer"><div class="dashboard-request-actions"><button class="secondary" '+(processing?'disabled':'')+' data-dashboard-request-action="decline" data-dashboard-request-id="'+esc(order.id)+'">Decline</button><button '+(processing?'disabled':'')+' data-dashboard-request-action="confirm" data-dashboard-request-id="'+esc(order.id)+'">'+(processing?'Processing…':'Confirm')+'</button></div></div></article>';
};
const bookingsDetailCompactOverviewBase=bookingsDetail;
bookingsDetail=function(){
  const o=orders.find(x=>x.id===state.detail),html=bookingsDetailCompactOverviewBase();
  if(!o||o.status!=='Pending')return html;
  const detailNote=o.notes?'<br><strong>Guest note</strong><br>'+esc(o.notes):'';
  const frontDesk=o.frontDesk?'<br><strong>Front Desk attribution</strong><br>'+esc(o.frontDesk):'';
  return html.replace('<br>'+esc(o.fulfilment)+'</p></section><section><h2>Payment','<br>'+esc(o.fulfilment)+detailNote+frontDesk+'</p></section><section><h2>Payment').replace('<button class="button primary" data-detail-action="confirm">Confirm</button><button class="button" data-detail-action="decline">Decline</button>','<button class="button" data-detail-action="decline">Decline</button><button class="button primary" data-detail-action="confirm">Confirm</button>').replace('<div class="booking-detail-actions">','<div class="booking-detail-actions pending-detail-actions">');
};
view=function(){return state.page==='orders'&&state.detail?bookingsDetail():state.page==='orders'?bookingsWorkspaceFinal():state.page==='bookings'?bookingsWorkspaceFinal():state.page==='dashboard'?dashboard17():state.page==='insights'?insightsPageForView():state.page==='staff-listings'?staffListingsView():state.page==='chat'?chatView():state.page==='listings'?listingsClean():state.page==='services'?servicesClean():state.page==='earnings'?earningsClean():state.page==='menu'?menuView():state.page==='profile'?profileView():dashboard17()};
state.page='dashboard';state.detail=null;state.bookingTab='Requests';
render();

/* Pending request details: clear, single-purpose section cards. */
bookingsDetail=function(){
  const record=orders.find(x=>x.id===state.detail)||((typeof bookingPastExtras!=='undefined')?bookingPastExtras.find(x=>x.id===state.detail):null);
  if(!record)return bookingsWorkspaceFinal();
  const owner=state.role==='Owner',statusClass=String(record.status||'').toLowerCase().replaceAll(' ','-');
  const quantityParts=String(record.quantity||'').split(' · '),passenger=quantityParts.find(part=>/passenger|pax|guest/i.test(part))||'—',baggage=quantityParts.find(part=>/suitcase|bag/i.test(part))||'—';
  const fulfilment=String(record.fulfilment||''),pickupMatch=fulfilment.match(/Pickup:\s*(.+?)(?:\s*·\s*Destination:\s*(.+))?$/i),pickupLocation=pickupMatch?pickupMatch[1]:fulfilment.replace(/^Pickup and return:\s*/i,''),destination=pickupMatch&&pickupMatch[2]?pickupMatch[2]:'';
  const placed=record.timeline&&record.timeline[0]?record.timeline[0][1]:'—';
  const actions=record.status==='Pending'?'<button class="button pending-detail-decline" data-detail-action="decline">Decline</button><button class="button primary" data-detail-action="confirm">Confirm</button><button class="button ghost pending-detail-message" data-detail-action="message">Message guest</button>':bookingActive(record)?'<button class="button primary" data-detail-action="status">Update status</button>'+(record.kind==='Booking'?'<button class="button" data-detail-action="qr">Scan QR</button>':'')+(owner?'<button class="button" data-detail-action="charge">Add charge / add-on</button>':'')+'<button class="button ghost pending-detail-message" data-detail-action="message">Message guest</button>':'';
  const detailField=(label,value,emphasis=false)=>'<div class="booking-request-field"><span>'+label+'</span><strong class="'+(emphasis?'emphasis':'')+'">'+value+'</strong></div>';
  return '<div class="booking-detail-view booking-request-detail-view"><button class="booking-back" data-booking-back>← Back to Bookings</button><div class="booking-request-detail-header"><div class="booking-request-heading"><div class="booking-request-number-row"><h1>Booking #'+esc(record.id)+'</h1><button class="booking-reference-copy booking-detail-copy" type="button" data-copy-booking-reference="'+esc(record.id)+'" aria-label="Copy booking number '+esc(record.id)+'"><i class="hgi-stroke hgi-copy-01" aria-hidden="true"></i></button></div></div><button class="booking-close" data-booking-back aria-label="Close booking details">×</button></div><section class="booking-request-section"><h2>Request</h2><div class="booking-request-summary"><strong>'+esc(record.item)+'</strong><span class="booking-status '+statusClass+'">'+esc(record.status)+'</span></div><small>'+esc(bookingType(record))+'</small></section><section class="booking-request-section"><h2>Guest</h2>'+detailField('Guest name',esc(record.guest),true)+detailField('Hotel',esc(record.hotel))+detailField('Room',esc(record.room))+'</section><section class="booking-request-section"><h2>Passengers</h2>'+detailField('Passenger count',esc(passenger))+detailField('Baggage',esc(baggage))+'</section><section class="booking-request-section"><h2>Pickup &amp; trip</h2>'+detailField('Pickup date and time',esc(record.when),true)+detailField('Pickup location',esc(pickupLocation))+ (destination?detailField('Destination',esc(destination)):'')+'</section><section class="booking-request-section"><h2>Payment</h2>'+(owner?detailField('Amount',esc(record.total),true)+detailField('Payment',esc(record.payment))+detailField('Payment status',esc(record.settlement||'—')): '<p class="booking-request-restricted">Financial details are restricted for your role.</p>')+'</section><section class="booking-request-section"><h2>Booking date</h2>'+detailField('Request placed',esc(placed),true)+'</section>'+(actions?'<div class="booking-detail-actions booking-detail-actions-inline pending-detail-actions">'+actions+'</div>':'')+'</div>';
};
view=function(){return state.page==='orders'&&state.detail?bookingsDetail():state.page==='orders'?bookingsWorkspaceFinal():state.page==='bookings'?bookingsWorkspaceFinal():state.page==='dashboard'?dashboard17():state.page==='insights'?insightsPageForView():state.page==='staff-listings'?staffListingsView():state.page==='chat'?chatView():state.page==='listings'?listingsClean():state.page==='services'?servicesClean():state.page==='earnings'?earningsClean():state.page==='menu'?menuView():state.page==='profile'?profileView():dashboard17()};
/* Latest Bookings refinement: decided bookings only, with role-safe detail actions. */
state.bookingTab='Active';state.detail=null;state.bookingLatestMenu=false;state.bookingLatestCancelId=null;state.bookingLatestFilters=state.bookingLatestFilters||{date:'All dates',type:'All',listing:'All listings'};state.page='orders';
var bookingLatestCancelled=[];
function bookingLatestAll(){return orders.concat(bookingPastExtras||[]).concat(bookingLatestCancelled)}
function bookingLatestKind(o){return /rental|transfer/i.test(o.item||'')?'Service & rental':'Product'}
function bookingLatestActive(o){return ['Confirmed','Scheduled','In progress','In use','Preparing','Ready','Checked in'].includes(o.status||'')}
function bookingLatestPast(o){return ['Completed','Declined','Expired'].includes(o.status||'')}
function bookingLatestGroup(o){const when=String(o.when||'');return when.includes('Oct 6')||when.includes('Today')?'Today':when.includes('Oct 7')||when.includes('Tomorrow')?'Tomorrow':'Later'}
function bookingLatestPayment(o){const raw=String(o.payment||'');return /room/i.test(raw)?'Charged to room':/pending|unpaid/i.test(raw)?'Pay via QR · Unpaid':'Pay via QR · Paid'}
function bookingLatestCanCancel(o){const paid=String(o.payment||'').toLowerCase().includes('paid')||String(o.settlement||'').toLowerCase().includes('paid')||o.qrValidated;return ['Confirmed','Checked in','Ready','Ready for pickup'].includes(o.status)&&!paid&&!o.qrValidated}
function bookingLatestRows(){const tab=state.bookingTab==='Past'?'Past':'Active',f=state.bookingLatestFilters,q=(state.bookingQuery||'').toLowerCase().trim();return bookingLatestAll().filter(o=>{const typeOk=f.type==='All'||f.type===bookingLatestKind(o);const listOk=f.listing==='All listings'||f.listing===o.item;const dateOk=f.date==='All dates'||f.date==='Last 7 days'||(f.date==='Today'&&bookingLatestGroup(o)==='Today')||(f.date==='Tomorrow'&&bookingLatestGroup(o)==='Tomorrow');const searchOk=!q||`${o.id} ${o.guest} ${o.room} ${o.item} ${o.hotel}`.toLowerCase().includes(q);return (tab==='Active'?bookingLatestActive(o):bookingLatestPast(o))&&typeOk&&listOk&&dateOk&&searchOk}).sort((a,b)=>String(a.when).localeCompare(String(b.when)))}
function bookingLatestCard(o){const past=state.bookingTab==='Past',kind=bookingLatestKind(o),shownStatus=o.status==='Scheduled'?'Confirmed':o.status==='In progress'?'Checked in':o.status==='Ready'?'Ready for pickup':o.status,action=past?'':shownStatus==='Confirmed'?(kind==='Product'?'<button class="booking-action primary" data-latest-action="ready" data-latest-id="'+o.id+'">Mark ready</button>':'<button class="booking-action primary" data-latest-action="checkin" data-latest-id="'+o.id+'">Check in</button>'):['Checked in','In use','Ready','Ready for pickup'].includes(shownStatus)?'<button class="booking-action primary" data-latest-action="complete" data-latest-id="'+o.id+'">Mark completed</button>':'';return '<article class="booking-card final-booking-card latest-booking-card"><button class="booking-card-hit" data-latest-detail="'+o.id+'"><div class="booking-final-title"><span class="booking-kind-icon '+(kind==='Product'?'product':'service')+'">'+(kind==='Product'?'▣':'⌁')+'</span><div><div class="booking-listing">'+esc(o.item)+'</div><span class="booking-type">'+kind+'</span></div><span class="booking-status '+shownStatus.toLowerCase().replaceAll(' ','-')+'">'+esc(shownStatus)+'</span></div><div class="booking-line">◷ '+esc(o.when)+(o.quantity?' · '+esc(o.quantity):'')+'</div><div class="booking-line">♙ '+esc(o.guest)+' · '+esc(o.hotel)+' · Room '+esc(o.room)+'</div><div class="booking-line">▤ '+esc(o.quantity||'—')+' · '+bookingLatestPayment(o)+'</div>'+(kind==='Service & rental'&&o.when.includes('–')?'<div class="booking-return-deadline">Return deadline: '+esc(o.when.split('–').pop().trim())+'</div>':'')+'</button>'+(action?'<div class="booking-actions">'+action+'</div>':'')+'</article>';}
function bookingLatestFilterSheet(){if(!state.bookingFilterOpen)return '';const f=state.bookingLatestFilters,choice=(key,values)=>'<fieldset><legend>'+key.charAt(0).toUpperCase()+key.slice(1)+'</legend>'+values.map(v=>'<button class="booking-choice '+(f[key]===v?'active':'')+'" data-latest-filter="'+key+'" data-latest-filter-value="'+esc(v)+'"><span>'+esc(v)+'</span>'+(f[key]===v?'<b>✓</b>':'')+'</button>').join('')+'</fieldset>';return '<div class="booking-sheet-backdrop" data-latest-filter-close></div><section class="booking-filter-sheet" role="dialog" aria-modal="true"><div class="sheet-handle"></div><header><div><h2>Filters</h2><p>Filter active schedules or past booking dates.</p></div><button data-latest-filter-close>×</button></header>'+choice('date',['All dates','Today','Tomorrow','Last 7 days'])+choice('type',['All','Product','Service & rental'])+choice('listing',['All listings',...listings.map(x=>x.name)])+'<div class="booking-filter-actions"><button class="button ghost" data-latest-filter-reset>Reset</button><button class="button primary" data-latest-filter-apply>Apply filters</button></div></section>'}
function bookingLatestWorkspace(){const tab=state.bookingTab==='Past'?'Past':'Active',rows=bookingLatestRows(),groups={};rows.forEach(o=>{const key=tab==='Past'?'Past bookings':bookingLatestGroup(o);(groups[key]||(groups[key]=[])).push(o)});const chips=Object.entries(state.bookingLatestFilters).filter(([k,v])=>v&&v!=='All'&&v!=='All dates'&&v!=='All listings').map(([k,v])=>'<button class="booking-chip" data-latest-chip="'+k+'">'+esc(v)+' ×</button>').join(''),body=Object.entries(groups).map(([g,items])=>'<section class="booking-group"><h2>'+g+'</h2>'+items.map(bookingLatestCard).join('')+'</section>').join('');return '<div class="bookings-workspace final-bookings-workspace latest-bookings-workspace"><header class="dashboard-operational-header booking-page-header"><h1>Bookings</h1><div class="booking-header-actions"><button class="dashboard-header-icon" data-toast="No new notifications" aria-label="Notifications"><i class="hgi-stroke hgi-notification-03"></i></button></div></header><nav class="bookings-tabs final-bookings-tabs" role="tablist"><button class="'+(tab==='Active'?'active':'')+'" data-latest-tab="Active">Active</button><button class="'+(tab==='Past'?'active':'')+'" data-latest-tab="Past">Past</button></nav><div class="bookings-tools"><div class="bookings-search"><i class="hgi-stroke hgi-search-01"></i><input data-latest-search value="'+esc(state.bookingQuery||'')+'" placeholder="Search guest, room, or booking number" aria-label="Search guest, room, or booking number"></div><button class="booking-filter-trigger" data-latest-filter-open><i class="hgi-stroke hgi-filter-horizontal"></i><span>Filter</span></button></div>'+(chips?'<div class="booking-chips">'+chips+'</div>':'')+(tab==='Past'&&state.role==='Owner'?'<button class="booking-export final-export" data-latest-export><i class="hgi-stroke hgi-download-04" aria-hidden="true"></i> Export CSV</button>':'')+(body||'<div class="bookings-empty"><strong>No '+tab.toLowerCase()+' bookings.</strong><span>Try changing your search or filters.</span></div>')+'</div>'}
function bookingLatestDetail(){const o=bookingLatestAll().find(x=>x.id===state.detail);if(!o)return bookingLatestWorkspace();const past=bookingLatestPast(o),kind=bookingLatestKind(o),shownStatus=o.status==='Scheduled'?'Confirmed':o.status==='In progress'?'Checked in':o.status,canCancel=!past&&bookingLatestCanCancel(o);const next=shownStatus==='Confirmed'?(kind==='Product'?'Mark ready':'Check in'):['Checked in','Ready','Ready for pickup'].includes(shownStatus)?'Mark completed':'';return '<div class="booking-detail-view latest-booking-detail"><button class="booking-back" data-latest-back>← Back to Bookings</button><header class="latest-detail-heading"><div><span class="booking-type">'+kind+'</span><h1>'+esc(o.item)+'</h1><p>'+esc(shownStatus)+' · #'+esc(o.id)+'</p></div></header><section class="booking-request-section"><h2>Booking</h2><div class="booking-request-field"><span>Listing</span><strong>'+esc(o.item)+'</strong></div><div class="booking-request-field"><span>Status</span><strong>'+esc(shownStatus)+'</strong></div><div class="booking-request-field"><span>Booking number</span><strong>#'+esc(o.id)+'</strong></div><div class="booking-request-field"><span>Booked date</span><strong>'+esc(o.when)+'</strong></div></section><section class="booking-request-section"><h2>Booking details</h2><div class="booking-request-field"><span>'+(kind==='Service & rental'?'Schedule / rental period':'Schedule')+'</span><strong>'+esc(o.when)+'</strong></div><div class="booking-request-field"><span>Quantity / pax</span><strong>'+esc(o.quantity||'—')+'</strong></div><div class="booking-request-field"><span>Pickup / meeting point</span><strong>'+esc(o.fulfilment||'—')+'</strong></div></section><section class="booking-request-section"><h2>Guest</h2><div class="booking-request-field"><span>Name</span><strong>'+esc(o.guest)+'</strong></div><div class="booking-request-field"><span>Hotel · Room</span><strong>'+esc(o.hotel)+' · '+esc(o.room)+'</strong></div><div class="booking-request-field"><span>Booked by</span><strong>Guest</strong></div>'+(o.notes?'<div class="booking-request-note"><span>Guest note</span><p>'+esc(o.notes)+'</p></div>':'')+'<button class="booking-message-link" data-latest-message="guest">Message guest</button></section><section class="booking-request-section"><h2>Payment</h2><div class="booking-request-field"><span>Amount</span><strong>'+esc(o.total||'—')+'</strong></div><div class="booking-request-field"><span>Payment type</span><strong>'+bookingLatestPayment(o)+'</strong></div><div class="booking-request-field"><span>Add-ons</span><strong>None</strong></div>'+(o.status==='Cancelled'?'<div class="booking-request-note"><span>Cancellation reason</span><p>'+esc(o.cancelReason||'—')+'</p></div>':'')+'</section>'+(past?'':'<div class="latest-detail-actions"><button class="button primary" data-latest-detail-next data-latest-id="'+o.id+'">'+next+'</button><button class="button" data-latest-menu>⋯</button></div>')+(state.bookingLatestMenu?'<div class="latest-action-menu"><button data-latest-charge>Add charge</button><button data-latest-message="guest">Message guest</button><button data-latest-message="front-desk">Message Front Desk</button>'+(canCancel?'<button data-latest-cancel="'+o.id+'">Cancel booking</button>':'<button data-latest-cancel-blocked>Contact the Front Desk to cancel.</button>')+'</div>':'')+'</div>'}
function bookingLatestCancelModal(){
  if(!state.bookingLatestCancelId)return '';
  const record=bookingLatestAll().find(item=>item.id===state.bookingLatestCancelId),reference=record?'#'+displayBookingReference(record.id):'',reason=state.bookingLatestCancelReason||'',note=state.bookingLatestCancelNote||'',ready=!!reason&&(reason!=='Other'||!!String(note).trim()),reasons=['Weather','Vehicle or equipment unavailable','Staff unavailable','Fully booked','Other'];
  const reasonOptions=reasons.map(x=>'<button type="button" role="radio" aria-checked="'+(reason===x?'true':'false')+'" class="decline-reasons-option '+(reason===x?'active':'')+'" data-vendor-cancel-reason="'+esc(x)+'"><span class="cancel-sheet-radio" aria-hidden="true"></span><span>'+esc(x)+'</span></button>').join('');
  const noteField=reason==='Other'?'<textarea data-vendor-cancel-note aria-label="Cancellation note" placeholder="Add a note (required)">'+esc(note)+'</textarea>':'';
  return '<div class="booking-decline-backdrop" data-vendor-cancel-close></div><section class="booking-decline-modal booking-cancel-sheet" role="dialog" aria-modal="true" aria-label="Cancel '+esc(reference)+'"><div class="cancel-sheet-handle"></div><button type="button" class="cancel-sheet-close" data-vendor-cancel-close aria-label="Close">×</button><h2>Cancel '+esc(reference)+'?</h2><p>Choose a reason. The guest and Front Desk will be notified.</p><div class="decline-reasons" role="radiogroup" aria-label="Cancellation reason">'+reasonOptions+'</div>'+noteField+'<div class="booking-detail-actions cancel-sheet-actions"><button type="button" class="button ghost" data-vendor-cancel-close>Keep booking</button><button type="button" class="button cancel-sheet-danger" data-vendor-cancel-submit '+(!ready?'disabled':'')+'>Cancel booking</button></div></section>';
}
view=function(){return state.page==='orders'&&state.detail?bookingLatestDetail():state.page==='orders'?bookingLatestWorkspace():state.page==='bookings'?bookingLatestWorkspace():state.page==='dashboard'?dashboard17():state.page==='insights'?insightsPageForView():state.page==='staff-listings'?staffListingsView():state.page==='chat'?chatView():state.page==='listings'?listingsClean():state.page==='services'?servicesClean():state.page==='earnings'?earningsClean():state.page==='menu'?menuView():state.page==='profile'?profileView():dashboard17()};
const bookingsLatestRenderBefore=render;
render=function(){bookingsLatestRenderBefore();if(state.page==='orders'){document.querySelector('#app')?.insertAdjacentHTML('beforeend',bookingLatestFilterSheet()+bookingLatestCancelModal());document.querySelectorAll('[data-latest-tab]').forEach(b=>b.onclick=()=>{state.bookingTab=b.dataset.latestTab;state.detail=null;render()});const s=document.querySelector('[data-latest-search]');if(s)s.oninput=e=>{state.bookingQuery=e.target.value;render()};document.querySelectorAll('[data-latest-filter-open]').forEach(b=>b.onclick=()=>{state.bookingFilterOpen=true;render()});document.querySelectorAll('[data-latest-filter-close]').forEach(b=>b.onclick=()=>{state.bookingFilterOpen=false;render()});document.querySelectorAll('[data-latest-filter]').forEach(b=>b.onclick=()=>{state.bookingLatestFilters[b.dataset.latestFilter]=b.dataset.latestFilterValue;render()});document.querySelectorAll('[data-latest-filter-reset]').forEach(b=>b.onclick=()=>{state.bookingLatestFilters={date:'All dates',type:'All',listing:'All listings'};render()});document.querySelectorAll('[data-latest-filter-apply]').forEach(b=>b.onclick=()=>{state.bookingFilterOpen=false;render()});document.querySelectorAll('[data-latest-chip]').forEach(b=>b.onclick=()=>{const k=b.dataset.latestChip;state.bookingLatestFilters[k]=k==='date'?'All dates':k==='listing'?'All listings':'All';render()});document.querySelectorAll('[data-latest-detail]').forEach(b=>b.onclick=()=>{state.detail=b.dataset.latestDetail;state.bookingLatestMenu=false;render()});document.querySelectorAll('[data-latest-back]').forEach(b=>b.onclick=()=>{state.detail=null;render()});document.querySelectorAll('[data-latest-action]').forEach(b=>b.onclick=e=>{e.stopPropagation();const o=bookingLatestAll().find(x=>x.id===b.dataset.latestId);if(!o)return;if(b.dataset.latestAction==='ready')o.status='Ready';if(b.dataset.latestAction==='checkin')o.status='Checked in';if(b.dataset.latestAction==='complete')o.status='Completed';render()});document.querySelectorAll('[data-latest-detail-next]').forEach(b=>b.onclick=()=>{const o=bookingLatestAll().find(x=>x.id===b.dataset.latestId);if(!o)return;if(o.status==='Confirmed'||o.status==='Scheduled')o.status=bookingLatestKind(o)==='Product'?'Ready':'Checked in';else o.status='Completed';render()});document.querySelectorAll('[data-latest-menu]').forEach(b=>b.onclick=()=>{state.bookingLatestMenu=!state.bookingLatestMenu;render()});document.querySelectorAll('[data-latest-charge]').forEach(b=>b.onclick=()=>toast('Add charge flow opened'));document.querySelectorAll('[data-latest-message]').forEach(b=>b.onclick=()=>toast('Chat thread opened'));document.querySelectorAll('[data-latest-cancel]').forEach(b=>b.onclick=()=>{state.bookingLatestCancelId=b.dataset.latestCancel;state.bookingLatestCancelReason='';render()});document.querySelectorAll('[data-latest-cancel-blocked]').forEach(b=>b.onclick=()=>toast('Contact the Front Desk to cancel.'));document.querySelectorAll('[data-latest-cancel-close]').forEach(b=>b.onclick=()=>{state.bookingLatestCancelId=null;render()});document.querySelectorAll('[data-latest-cancel-reason]').forEach(b=>b.onclick=()=>{state.bookingLatestCancelReason=b.dataset.latestCancelReason;render()});document.querySelectorAll('[data-latest-cancel-submit]').forEach(b=>b.onclick=()=>{const o=bookingLatestAll().find(x=>x.id===state.bookingLatestCancelId);if(o){o.status='Cancelled';o.cancelReason=state.bookingLatestCancelReason;bookingLatestCancelled.push(o)}state.bookingLatestCancelId=null;state.bookingLatestCancelReason='';state.bookingTab='Past';state.detail=null;render()});document.querySelectorAll('[data-latest-export]').forEach(b=>b.onclick=()=>toast('Filtered bookings CSV prepared'));}};
state.page='orders';state.detail=null;state.bookingTab='Active';
render();

/* Home header QR scanner: validate the guest first, then require an explicit room-charge confirmation. */
const dashboardRoomChargeScannerMarkup=function(){
  if(!state.dashboardRoomChargeQrOpen)return '';
  const step=state.dashboardRoomChargeQrStep||'scan';
  let body='';
  if(step==='scanned')body='<div class="dashboard-qr-guest"><span class="dashboard-qr-guest-label">Guest identified</span><strong>Amelia Reyes</strong><span>Henry’s Resort Dumaguete · Room 508</span></div><p class="dashboard-qr-confirm-note">Review the guest details before charging this purchase to the room. Scanning did not create a charge.</p><div class="dashboard-qr-actions"><button class="button" data-dashboard-qr-close>Cancel</button><button class="button primary" data-dashboard-qr-confirm>Confirm room charge</button></div>';
  else if(step==='invalid')body='<div class="dashboard-qr-error"><strong>QR code not recognized</strong><span>The code may be invalid, expired, or too blurry to read.</span></div><button class="button primary" data-dashboard-qr-retry>Try again</button>';
  else if(step==='confirmed')body='<div class="dashboard-qr-success">Room charge confirmed for Amelia Reyes · Room 508.</div><button class="button primary" data-dashboard-qr-close>Done</button>';
  else body='<div class="dashboard-qr-frame"><i class="hgi-stroke hgi-qr-code-01" aria-hidden="true"></i><span>Place the guest’s QR code inside the frame</span></div><p>Ask the guest to open their Cabana room-charge QR. Scan it to verify their name, hotel, and room. Nothing is charged until you confirm.</p><button class="button primary" data-dashboard-qr-scan>Scan guest QR</button><button class="dashboard-qr-help" data-dashboard-qr-invalid>Show unreadable-code error</button>';
  return '<div class="dashboard-qr-backdrop" data-dashboard-qr-close></div><section class="dashboard-qr-modal dashboard-room-charge-qr" role="dialog" aria-modal="true" aria-label="Scan QR for room charge"><button class="dashboard-qr-close" data-dashboard-qr-close aria-label="Close QR scanner">×</button><i class="hgi-stroke hgi-qr-code-01 dashboard-qr-modal-icon" aria-hidden="true"></i><h2>Charge to room</h2>'+body+'</section>';
};
const dashboardRoomChargeMarkupBase=dashboardOperationalMarkup;
dashboardOperationalMarkup=function(){
  let html=dashboardRoomChargeMarkupBase();
  html=html.replace(/(<header class="dashboard-operational-header"><h1>Home<\/h1>)(<button class="dashboard-header-icon" data-dashboard-notifications[\s\S]*?<\/button>)(<\/header>)/,'$1<button class="dashboard-header-icon" data-dashboard-room-charge-qr aria-label="Scan QR for room charge"><i class="hgi-stroke hgi-qr-code-01" aria-hidden="true"></i></button>$3');
  return html+dashboardRoomChargeScannerMarkup();
};
const renderWithRoomChargeQr=render;
render=function(){
  renderWithRoomChargeQr();
  document.querySelectorAll('[data-dashboard-room-charge-qr]').forEach(button=>button.onclick=()=>{state.dashboardRoomChargeQrOpen=true;state.dashboardRoomChargeQrStep='scan';render()});
  document.querySelectorAll('[data-dashboard-qr-close]').forEach(button=>button.onclick=()=>{state.dashboardRoomChargeQrOpen=false;state.dashboardRoomChargeQrStep='scan';render()});
  document.querySelectorAll('[data-dashboard-qr-scan]').forEach(button=>button.onclick=()=>{state.dashboardRoomChargeQrStep='scanned';render()});
  document.querySelectorAll('[data-dashboard-qr-invalid]').forEach(button=>button.onclick=()=>{state.dashboardRoomChargeQrStep='invalid';render()});
  document.querySelectorAll('[data-dashboard-qr-retry]').forEach(button=>button.onclick=()=>{state.dashboardRoomChargeQrStep='scan';render()});
  document.querySelectorAll('[data-dashboard-qr-confirm]').forEach(button=>button.onclick=()=>{state.dashboardRoomChargeQrStep='confirmed';render()});
};
state.dashboardRoomChargeQrOpen=false;state.dashboardRoomChargeQrStep='scan';

/* Rebind once the layered demo script has finished defining its final Home route. */
setTimeout(()=>{
  const effectiveMarkupBase=dashboardOperationalMarkup;
  dashboardOperationalMarkup=function(){
    let html=effectiveMarkupBase();
    html=html.replace(/(<header class="dashboard-operational-header"><h1>Home<\/h1>)(<button class="dashboard-header-icon" data-dashboard-notifications[\s\S]*?<\/button>)(<\/header>)/,'$1<button class="dashboard-header-icon" data-dashboard-room-charge-qr aria-label="Scan QR for room charge"><i class="hgi-stroke hgi-qr-code-01" aria-hidden="true"></i></button>$3');
    return html+dashboardRoomChargeScannerMarkup();
  };
  const effectiveRenderBase=render;
  render=function(){
    effectiveRenderBase();
    document.querySelectorAll('[data-dashboard-room-charge-qr]').forEach(button=>button.onclick=()=>{state.dashboardRoomChargeQrOpen=true;state.dashboardRoomChargeQrStep='scan';render()});
    document.querySelectorAll('[data-dashboard-qr-close]').forEach(button=>button.onclick=()=>{state.dashboardRoomChargeQrOpen=false;state.dashboardRoomChargeQrStep='scan';render()});
    document.querySelectorAll('[data-dashboard-qr-scan]').forEach(button=>button.onclick=()=>{state.dashboardRoomChargeQrStep='scanned';render()});
    document.querySelectorAll('[data-dashboard-qr-invalid]').forEach(button=>button.onclick=()=>{state.dashboardRoomChargeQrStep='invalid';render()});
    document.querySelectorAll('[data-dashboard-qr-retry]').forEach(button=>button.onclick=()=>{state.dashboardRoomChargeQrStep='scan';render()});
    document.querySelectorAll('[data-dashboard-qr-confirm]').forEach(button=>button.onclick=()=>{state.dashboardRoomChargeQrStep='confirmed';render()});
  };
  state.dashboardRoomChargeQrOpen=false;state.dashboardRoomChargeQrStep='scan';
  render();
},0);

/* Final Bookings workflow: decided records only; requests stay on Home. */
var bookingPastExtras=[
 {id:'PAST-DECLINED-01',kind:'Booking',guest:'John D.',hotel:'Henry’s Resort Dumaguete',room:'101',item:'Toyota Innova Rental',quantity:'1 vehicle',when:'Oct 4 · 1 day',fulfilment:'Pickup and return: Henry’s Resort Dumaguete lobby',total:'₱4,800.00',payment:'Charged to room',settlement:'Vehicle unavailable',status:'Declined',timeline:[['Booking requested','Oct 4 · 7:10 AM'],['Declined','Oct 4 · 7:18 AM']]},
 {id:'PAST-EXPIRED-01',kind:'Booking',guest:'Maya Tan',hotel:'Henry’s Resort Dumaguete',room:'314',item:'Airport Transfer — Van',quantity:'4 pax',when:'Oct 3 · 2:00 PM',fulfilment:'Pickup: Henry’s Resort Dumaguete lobby · Destination: Dumaguete–Sibulan Airport',total:'₱3,600.00',payment:'Paid in app',settlement:'Confirmation deadline passed',status:'Expired',timeline:[['Booking requested','Oct 3 · 9:00 AM'],['Expired','Oct 3 · 10:00 AM']]}
];
function bookingFinalKind(o){return /rental|transfer/i.test(o.item||'')?'Service & rental':'Product'}
function bookingFinalRecords(){return orders.concat(bookingPastExtras)}
function bookingFinalActive(o){return ['Confirmed','Scheduled','In progress','In use','Preparing','Ready','Checked in'].includes(o.status||'')}
function bookingFinalPast(o){return ['Completed','Declined','Expired'].includes(o.status||'')}
function bookingFinalDay(o){const when=String(o.when||'');if(when.includes('Oct 6')||when.includes('Today'))return 'Today';if(when.includes('Oct 7')||when.includes('Tomorrow'))return 'Tomorrow';return 'Later'}
function bookingFinalFiltered(){const tab=state.bookingTab==='Past'?'Past':'Active',f=state.bookingFilters||{date:'All dates',type:'All',listing:'All listings'},q=(state.bookingQuery||'').toLowerCase().trim();return bookingFinalRecords().filter(o=>{const typeOk=f.type==='All'||(f.type==='Products'&&bookingFinalKind(o)==='Product')||(f.type==='Service & rentals'&&bookingFinalKind(o)==='Service & rental');const listOk=f.listing==='All listings'||f.listing===o.item;const dateOk=f.date==='All dates'||f.date==='Last 7 days'||f.date==='Custom From / To'||(f.date==='Today'&&bookingFinalDay(o)==='Today')||(f.date==='Tomorrow'&&bookingFinalDay(o)==='Tomorrow');const searchOk=!q||`${o.guest} ${o.room} ${o.item} ${o.hotel}`.toLowerCase().includes(q);const route=tab==='Active'?bookingFinalActive(o):bookingFinalPast(o);return route&&typeOk&&listOk&&dateOk&&searchOk;}).sort((a,b)=>String(a.when).localeCompare(String(b.when)))}
function bookingFinalAction(o){const kind=bookingFinalKind(o);if(o.status==='Confirmed'&&kind==='Product')return '<button class="booking-action primary" data-final-booking-action="ready" data-final-booking-id="'+o.id+'">Mark ready for pickup</button>';if(['Confirmed','Scheduled'].includes(o.status)&&kind==='Service & rental')return '<button class="booking-action primary" data-final-booking-action="qr" data-final-booking-id="'+o.id+'">▣ Scan QR to check in</button>';if(['Checked in','In progress','In use','Preparing','Ready'].includes(o.status))return '<button class="booking-action primary" data-final-booking-action="complete" data-final-booking-id="'+o.id+'">Mark completed</button>';return '';}
function bookingFinalCard(o){const owner=state.role==='Owner',kind=bookingFinalKind(o),past=state.bookingTab==='Past',status=o.status==='In progress'?'Checked in':o.status,action=past?'':bookingFinalAction(o),payment=o.payment==='Charged to room'?'Charged to room':'Paid in app',icon=kind==='Product'?'▣':'⌁';return '<article class="booking-card final-booking-card"><button class="booking-card-hit" data-booking-detail="'+o.id+'"><div class="booking-final-title"><span class="booking-kind-icon '+(kind==='Product'?'product':'service')+'">'+icon+'</span><div><div class="booking-listing">'+esc(o.item)+'</div><span class="booking-type">'+kind+'</span></div><span class="booking-status '+status.toLowerCase().replaceAll(' ','-')+'">'+esc(status)+'</span></div><div class="booking-line">◷ '+esc(o.when)+(o.when.includes('–')?'':' · '+(o.quantity||''))+'</div><div class="booking-line">♙ '+esc(o.guest)+' · '+esc(o.hotel)+' · Room '+esc(o.room)+'</div><div class="booking-line">▤ '+esc(o.quantity||'')+' · '+payment+'</div>'+(kind==='Service & rental'&&o.when.includes('–')?'<div class="booking-return-deadline">Return deadline visible in booking details</div>':'')+'</button>'+(action?'<div class="booking-actions">'+action+'</div>':'')+'</article>';}
function bookingFinalFilterSheet(){if(!state.bookingFilterOpen)return '';const f=state.bookingFilters||{},choice=(label,key,values)=>'<fieldset><legend>'+label+'</legend>'+values.map(v=>'<button class="booking-choice '+(f[key]===v?'active':'')+'" data-booking-filter-choice="'+key+'" data-booking-filter-value="'+esc(v)+'"><span>'+esc(v)+'</span>'+(f[key]===v?'<b>✓</b>':'')+'</button>').join('')+'</fieldset>';return '<div class="booking-sheet-backdrop" data-booking-filter-close></div><section class="booking-filter-sheet" role="dialog" aria-modal="true"><div class="sheet-handle"></div><header><div><h2>Filters</h2><p>Date uses scheduled or completion dates.</p></div><button data-booking-filter-close>×</button></header>'+choice('Date range','date',['All dates','Today','Tomorrow','Last 7 days','Custom From / To'])+choice('Type','type',['All','Products','Service & rentals'])+choice('Listing','listing',['All listings',...listings.map(x=>x.name)])+'<div class="booking-filter-actions"><button class="button ghost" data-booking-filter-reset>Reset</button><button class="button primary" data-booking-filter-apply>Apply filters</button></div></section>';}
function bookingsWorkspaceFinal(){const tab=state.bookingTab==='Past'?'Past':'Active',rows=bookingFinalFiltered(),groups={};rows.forEach(o=>{const g=tab==='Past'?'Past bookings':bookingFinalDay(o);(groups[g]||(groups[g]=[])).push(o)});const chips=Object.entries(state.bookingFilters||{}).filter(([k,v])=>v&&v!=='All'&&v!=='All dates'&&v!=='All listings').map(([k,v])=>'<button class="booking-chip" data-booking-chip="'+k+'">'+esc(v)+' ×</button>').join(''),body=Object.entries(groups).map(([g,items])=>'<section class="booking-group"><h2>'+g+'</h2>'+items.map(bookingFinalCard).join('')+'</section>').join('');return '<div class="bookings-workspace final-bookings-workspace"><header class="dashboard-operational-header booking-page-header"><h1>Bookings</h1><div class="booking-header-actions"><button class="dashboard-header-icon" data-toast="No new notifications" aria-label="Notifications"><i class="hgi-stroke hgi-notification-03"></i></button><button class="booking-scan-header" data-final-header-qr><span>▣</span> Scan QR</button></div></header><nav class="bookings-tabs final-bookings-tabs" role="tablist">'+['Active','Past'].map(x=>'<button class="'+(tab===x?'active':'')+'" data-booking-tab="'+x+'">'+x+'</button>').join('')+'</nav><div class="bookings-tools"><div class="bookings-search"><i class="hgi-stroke hgi-search-01"></i><input data-booking-search value="'+esc(state.bookingQuery||'')+'" placeholder="Search guest or room" aria-label="Search guest or room"></div><button class="booking-filter-trigger" data-booking-filter-open><i class="hgi-stroke hgi-filter-horizontal"></i><span>Filter</span></button></div>'+(chips?'<div class="booking-chips">'+chips+'</div>':'')+(tab==='Past'&&state.role==='Owner'?'<button class="booking-export final-export" data-booking-export><i class="hgi-stroke hgi-download-04" aria-hidden="true"></i> Export CSV</button>':'')+(body||'<div class="bookings-empty"><strong>No '+tab.toLowerCase()+' bookings.</strong><span>Try changing your search or filters.</span></div>')+'</div>';}
bookingsWorkspace=bookingsWorkspaceFinal;
view=function(){return state.page==='orders'&&state.detail?bookingsDetail():state.page==='orders'?bookingsWorkspaceFinal():state.page==='bookings'?bookingsWorkspaceFinal():state.page==='dashboard'?dashboard17():state.page==='insights'?insightsPageForView():state.page==='staff-listings'?staffListingsView():state.page==='chat'?chatView():state.page==='listings'?listingsClean():state.page==='services'?servicesClean():state.page==='earnings'?earningsClean():state.page==='menu'?menuView():state.page==='profile'?profileView():dashboard17()};
state.page='orders';state.detail=null;state.bookingTab='Active';state.orderView='list';
const finalBookingsRenderBefore=render;
render=function(){finalBookingsRenderBefore();if(state.page==='orders'){document.querySelector('#app')?.insertAdjacentHTML('beforeend',bookingFinalFilterSheet());document.querySelectorAll('[data-booking-tab]').forEach(b=>b.onclick=()=>{state.bookingTab=b.dataset.bookingTab;render()});document.querySelectorAll('[data-final-booking-action]').forEach(b=>b.onclick=e=>{e.stopPropagation();const o=bookingFinalRecords().find(x=>x.id===b.dataset.finalBookingId);if(!o)return;const a=b.dataset.finalBookingAction;if(a==='ready')o.status='Ready';if(a==='complete')o.status='Completed';if(a==='qr'){if(o.qrValidated){o.status='Checked in';toast('Booking already checked in')}else{o.qrValidated=true;toast('Booking validated. Check-in recorded.');o.status='Checked in'}}render()});document.querySelectorAll('[data-final-header-qr]').forEach(b=>b.onclick=()=>toast('Validation flow opened'));}};
render();

/* Insights is reached from Menu; keep the Dashboard focused on operational work. */
const renderWithoutDashboardInsights=render;
render=function(){renderWithoutDashboardInsights();if(state.page==='dashboard')document.querySelectorAll('.dashboard-insights-link').forEach(node=>node.remove())};
render();

/* Final activation for Insights → Bookings after all page overrides. */
try{localStorage.setItem('cabana:latest-revision','current-home-portal-v1')}catch(error){}
insightsPageForView=function(){return phase1InsightsPage()};
const renderInsightsBookingLast=render;
render=function(){renderInsightsBookingLast();if(state.page==='insights'){document.querySelectorAll('[data-phase1-booking-mode]').forEach(button=>button.onclick=()=>{state.phase1BookingMode=button.dataset.phase1BookingMode;render()});document.querySelectorAll('[data-insight-tab]').forEach(button=>button.onclick=()=>{state.insightTab=button.dataset.insightTab;render()});}};
render();

/* Final Insights → Bookings refinement: derived metrics and chart data. */
function phase1BookingSeriesRefined(total,weights){const sum=weights.reduce((a,b)=>a+b,0),values=weights.map(w=>Math.floor(total*w/sum));let remainder=total-values.reduce((a,b)=>a+b,0);for(let i=0;remainder>0;i=(i+1)%values.length){values[i]++;remainder--}return values;}
function phase1BookingAnalyticsRefined(){const range=state.range||'Last 7 days',totals={'Last 7 days':42,'Last 30 days':96,'This month':124,'Last month':38,'Custom range':42},total=totals[range]||42,confirmed=range==='Last 7 days'?34:Math.round(total*.81),declined=range==='Last 7 days'?5:Math.round(total*.12),expired=Math.max(0,total-confirmed-declined),previousTotal=range==='Last 7 days'?36:Math.max(1,total-6),previousConfirmed=Math.round(previousTotal*.76),dayValues=phase1BookingSeriesRefined(total,[4,6,5,7,10,6,4]),timeValues=phase1BookingSeriesRefined(total,[6,8,10,8,6,4]),dayLabels=range==='Last 7 days'?['Sep 30','Oct 1','Oct 2','Oct 3','Oct 4','Oct 5','Oct 6']:['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'],timeLabels=['8–10 AM','10 AM–12 PM','12–2 PM','2–4 PM','4–6 PM','6 PM–close'],confirmedDurations=Array.from({length:confirmed},(_,i)=>i%4===0?6:i%3===0?9:8),avgMinutes=Math.round(confirmedDurations.reduce((a,b)=>a+b,0)/Math.max(1,confirmedDurations.length)),change=((total-previousTotal)/previousTotal)*100;return {range,total,confirmed,declined,expired,previousTotal,previousConfirmed,dayValues,timeValues,dayLabels,timeLabels,avgMinutes,change};}
function phase1BookingBarsRefined(mode){const data=phase1BookingAnalyticsRefined(),values=mode==='time'?data.timeValues:data.dayValues,labels=mode==='time'?data.timeLabels:data.dayLabels,max=Math.max(...values,1),peak=Math.max(...values),peakIndexes=values.map((v,i)=>v===peak?i:-1).filter(i=>i>=0),peakLabel=peakIndexes.length>1?peakIndexes.map(i=>labels[i]).join(' and '):labels[peakIndexes[0]],aria=mode==='time'?'Booking counts by time slot':'Booking counts by day';return '<div class="phase1-bars phase1-bars-refined phase1-bars-'+mode+'" role="img" aria-label="'+aria+'"><div class="phase1-bar-grid">'+values.map((value,index)=>'<span class="phase1-bar-column"><b class="phase1-bar-value">'+value+'</b><i style="height:'+Math.max(5,Math.round(value/max*100))+'%" class="'+(value===peak?'active':'')+'" aria-label="'+esc(labels[index]+' · '+value+' bookings')+'"></i><small>'+esc(labels[index])+'</small></span>').join('')+'</div><p><strong>Busiest '+(mode==='time'?'time slot':'day')+':</strong> '+esc(peakLabel)+' · '+peak+' bookings</p></div>';}
function phase1BookingMiniChart(values){const max=Math.max(...values,1);return '<div class="phase1-total-mini-chart" aria-label="Booking totals across the selected period">'+values.map((value,index)=>'<span title="'+value+' bookings"><i style="height:'+Math.max(10,Math.round(value/max*100))+'%"></i><small>'+['W','T','F','S','S','M','T'][index]+'</small></span>').join('')+'</div>';}
function phase1BookingsPanelRefined(){const data=phase1BookingAnalyticsRefined(),mode=state.phase1BookingMode||'day',direction=data.change>0?'↑':data.change<0?'↓':'→',changeLabel=Math.abs(data.change).toFixed(1)+'%',rate=Math.round(data.confirmed/data.total*100);return '<section class="phase1-insights-panel phase1-bookings-refined" data-phase1-panel="bookings"><div class="phase1-metrics phase1-booking-metrics"><article class="phase1-metric phase1-total-bookings"><span>Total bookings</span><div class="phase1-total-primary"><strong>'+data.total+'</strong><b>'+rate+'% confirmed</b></div><small class="phase1-change '+(data.change<0?'negative':'positive')+'">'+direction+' '+changeLabel+' vs previous equivalent period</small><p>'+data.confirmed+' of '+data.total+' requests confirmed · '+rate+'%</p><div class="phase1-breakdown"><span><i class="confirmed-dot"></i><b>'+data.confirmed+'</b> confirmed</span><span><i class="declined-dot"></i><b>'+data.declined+'</b> declined</span><span><i class="expired-dot"></i><b>'+data.expired+'</b> expired</span></div>'+phase1BookingMiniChart(data.dayValues)+'</article><article class="phase1-metric"><span>Avg. time to confirm</span><strong>'+data.avgMinutes+' min</strong><small>From request to confirm.</small></article><article class="phase1-metric '+(data.expired>0?'has-warning':'')+'"><span>Expired requests</span><strong>'+data.expired+'</strong><small>Needs attention</small></article></div><section class="phase1-report-card phase1-booking-activity-card"><div class="phase1-card-heading"><div><h2>Booking activity</h2></div><div class="phase1-toggle refined-toggle" role="group" aria-label="Booking activity grouping"><button class="'+(mode==='day'?'active':'')+'" data-phase1-booking-mode="day">Day</button><button class="'+(mode==='time'?'active':'')+'" data-phase1-booking-mode="time">Time slot</button></div></div>'+phase1BookingBarsRefined(mode)+'</section></section>';}
const phase1InsightsPageRefined=phase1InsightsPage;
phase1InsightsPage=function(){if(state.role!=='Owner')return phase1InsightsPageRefined();const tab=state.insightTab==='orders'?'orders':state.insightTab==='listings'?'listings':'sales';if(tab!=='orders')return phase1InsightsPageRefined();const panel=phase1BookingsPanelRefined();return '<div class="phase1-insights-page"><header class="phase1-insights-header"><button class="phase1-insights-back" data-insights-back aria-label="Back to Menu">←</button><h1>Insights</h1><div class="phase1-insights-actions"><button data-download-report aria-label="Download report"><i class="hgi-stroke hgi-download-04" aria-hidden="true"></i></button></div></header><button class="phase1-insights-period phase1-insights-date-control" data-header-filter aria-label="Filter Insights by date"><div><strong>'+phase1RangeName()+'</strong><span>'+phase1DateRangeLabel()+'</span></div><i class="hgi-stroke hgi-calendar-03" aria-hidden="true"></i></button><nav class="phase1-insights-tabs" role="tablist" aria-label="Insights sections"><button role="tab" aria-selected="false" data-insight-tab="sales">Sales</button><button role="tab" aria-selected="true" class="active" data-insight-tab="orders">Bookings</button><button role="tab" aria-selected="false" data-insight-tab="listings">Listings</button></nav><main class="phase1-insights-content">'+panel+'</main></div>';};
insightsPageForView=function(){return phase1InsightsPage()};
const renderBeforeInsightsBookingFinal=render;
render=function(){renderBeforeInsightsBookingFinal();if(state.page==='insights'){document.querySelectorAll('[data-phase1-booking-mode]').forEach(button=>button.onclick=()=>{state.phase1BookingMode=button.dataset.phase1BookingMode;render()});document.querySelectorAll('[data-insight-tab]').forEach(button=>button.onclick=()=>{state.insightTab=button.dataset.insightTab;render()});}};
try{localStorage.setItem('cabana:latest-revision','current-home-portal-v1')}catch(error){}
render();

/* Transportation rental demo data and final route-safe presentation. */
const transportListings=[
  {id:'airport-sedan',name:'Airport Transfer — Sedan',category:'Transfer',price:'1800',unit:'per trip',stock:'2 sedans available',status:'Active',location:'Hotel lobby pickup · Airport drop-off',payment:'Room charge + Gateway',confirmationMethod:'Manual approval',photo:'https://images.unsplash.com/photo-1596429916858-6f97b5b9cf48?auto=format&fit=crop&w=1200&q=82'},
  {id:'innova',name:'Toyota Innova Rental',category:'Vehicle rental',price:'3200',unit:'per day',stock:'1 vehicle available',status:'Active',location:'Hotel pickup · Return to vendor yard',payment:'Room charge + Gateway',confirmationMethod:'Manual approval',photo:'https://images.unsplash.com/photo-1748215210939-ad8b6c8c086d?auto=format&fit=crop&w=1200&q=82'},
  {id:'van-driver',name:'Van with Driver — Full Day',category:'Vehicle rental',price:'3500',unit:'per day',stock:'Up to 12 passengers',status:'Active',location:'Hotel pickup',payment:'Room charge + Gateway',confirmationMethod:'Manual approval',photo:'https://images.unsplash.com/photo-1787028331201-75a0abb8ab0e?auto=format&fit=crop&w=1200&q=82'},
  {id:'city-tour',name:'Dumaguete City Tour',category:'Tour',price:'650',unit:'per person',stock:'Up to 4 guests',status:'Active',location:'Rizal Boulevard',payment:'Room charge + Gateway',confirmationMethod:'Manual approval',photo:'https://images.unsplash.com/photo-1765862857338-aba0a47782c6?auto=format&fit=crop&w=1200&q=82'},
  {id:'island-hopping',name:'Island Hopping Tour',category:'Tour',price:'1200',unit:'per person',stock:'Up to 10 guests',status:'Paused',location:'Resort beach front',payment:'Room charge + Gateway',confirmationMethod:'Manual approval',photo:'https://images.unsplash.com/photo-1759773106970-9e3b78cac2fb?auto=format&fit=crop&w=1200&q=82'},
  {id:'scooter',name:'Scooter Rental',category:'Vehicle rental',price:'500',unit:'per day',stock:'2 units',status:'Draft',location:'Resort lobby',payment:'Room charge + Gateway',confirmationMethod:'Manual approval',photo:'https://images.unsplash.com/photo-1503434396599-58ba8a18d932?auto=format&fit=crop&w=1200&q=82',setup:{photos:['https://images.unsplash.com/photo-1503434396599-58ba8a18d932?auto=format&fit=crop&w=1200&q=82'],name:'Scooter Rental',description:'',location:'Resort lobby',price:'500',pricedPer:'Day',durationMode:'guest',durationValue:'1',durationUnit:'hours',guestMin:'1',guestMax:'7',guestUnit:'days',countBy:'Units',maxPer:'2',payRoom:true,payOnline:true,_payV2:true,days:[true,true,true,true,true,true,true],timeMode:'hours',slots:['08:00','13:00'],hoursStart:'06:00',hoursEnd:'22:00',dailyLimit:'2',blocked:[],notice:'2 hours',fields:{baggage:false,pickup:false,dropoff:false,flight:false,prefs:false,health:false,requests:true},addons:[],_step:2}}
];
const transportOrders=[
  {id:'ORD-1042',kind:'Booking',guest:'Amelia Reyes',hotel:'Henry’s Resort Dumaguete',room:'508',item:'Airport Transfer — Sedan',quantity:'2 passengers · 2 suitcases',when:'Oct 7 · 8:30 AM',fulfilment:'Pickup: Henry’s Resort Dumaguete lobby · Destination: Dumaguete–Sibulan Airport',total:'₱2,400.00',payment:'Gateway payment pending',settlement:'Payment pending',status:'Pending',responseMinutes:24,timeline:[['Booking requested','Oct 6 · 8:06 AM']],notes:'Flight pickup for an early departure.',contact:'Open guest chat'},
  {id:'CB-8821',kind:'Booking',guest:'John D.',hotel:'Henry’s Resort Dumaguete',room:'101',item:'Toyota Innova Rental',quantity:'1 vehicle',when:'Oct 7 · 9:00 AM – Oct 8 · 9:00 AM',fulfilment:'Pickup and return: Henry’s Resort Dumaguete lobby',total:'₱4,800.00',payment:'Charged to room',settlement:'Awaiting guest checkout',status:'Pending',responseMinutes:60,timeline:[['Booking requested','Oct 6 · 8:12 AM']],notes:'Return vehicle by Oct 8 at 9:00 AM.',contact:'Open guest chat'},
  {id:'CB-8830',kind:'Booking',guest:'Sofia Lim',hotel:'Henry’s Resort Dumaguete',room:'602',item:'Airport Transfer — Sedan',quantity:'3 passengers · 4 suitcases',when:'Oct 7 · 11:00 AM',fulfilment:'Pickup: Henry’s Resort Dumaguete lobby · Destination: Dumaguete–Sibulan Airport',total:'₱3,600.00',payment:'Charged to room',settlement:'Awaiting guest checkout',status:'Pending',responseMinutes:18,timeline:[['Booking requested','Oct 6 · 8:18 AM']],notes:'Please allow space for four checked bags.',contact:'Open guest chat'},
  {id:'CB-8835',kind:'Booking',guest:'Daniel Cruz',hotel:'Henry’s Resort Dumaguete',room:'410',item:'Tourist Van Rental',quantity:'1 vehicle · 5 passengers',when:'Oct 8 · 1:30 PM – Oct 9 · 1:30 PM',fulfilment:'Pickup and return: Henry’s Resort Dumaguete lobby',total:'₱5,500.00',payment:'Gateway payment pending',settlement:'Payment pending',status:'Pending',responseMinutes:42,timeline:[['Booking requested','Oct 6 · 8:22 AM']],notes:'Family luggage included; return by Oct 9 at 1:30 PM.',contact:'Open guest chat'},
  {id:'CB-8840',kind:'Booking',guest:'Lara Villanueva',hotel:'Henry’s Resort Dumaguete',room:'118',item:'Airport Transfer — SUV',quantity:'2 passengers · 2 suitcases',when:'Oct 9 · 10:00 AM',fulfilment:'Pickup: Henry’s Resort Dumaguete lobby · Destination: NAIA Terminal 1',total:'₱2,900.00',payment:'Gateway payment pending',settlement:'Payment pending',status:'Pending',responseMinutes:36,timeline:[['Booking requested','Oct 6 · 8:26 AM']],notes:'Morning airport transfer.',contact:'Open guest chat'},
  {id:'CB-8854',kind:'Booking',guest:'Paolo Garcia',hotel:'Henry’s Resort Dumaguete',room:'309',item:'Toyota Innova Rental',quantity:'1 vehicle · 3 passengers',when:'Oct 9 · 9:00 AM – Oct 10 · 9:00 AM',fulfilment:'Pickup and return: Henry’s Resort Dumaguete lobby',total:'₱3,200.00',payment:'Gateway payment pending',settlement:'Payment pending',status:'Pending',responseMinutes:40,timeline:[['Booking requested','Oct 6 · 8:28 AM']],notes:'Day rental for a family trip to the hot springs.',contact:'Open guest chat'},
  {id:'CB-9001',kind:'Booking',guest:'Maya Tan',hotel:'Henry’s Resort Dumaguete',room:'314',item:'Tourist Van Rental',quantity:'1 vehicle · 6 passengers',when:'Oct 8 · 9:00 AM – Oct 9 · 9:00 AM',fulfilment:'Pickup and return: Henry’s Resort Dumaguete lobby',total:'₱5,500.00',payment:'Paid via gateway',settlement:'Paid by guest',status:'Scheduled',timeline:[['Booking confirmed','Oct 5 · 9:02 AM']],notes:'Return deadline Oct 9 at 9:00 AM.',contact:'Open guest chat'},
  {id:'CB-9002',kind:'Booking',guest:'Nina Garcia',hotel:'Henry’s Resort Dumaguete',room:'203',item:'Airport Transfer — Sedan',quantity:'3 passengers · 3 suitcases',when:'Oct 6 · 2:00 PM',fulfilment:'Pickup: Henry’s Resort Dumaguete lobby · Destination: NAIA Terminal 1',total:'₱1,800.00',payment:'Paid via gateway',settlement:'Paid by guest',status:'In progress',timeline:[['Booking confirmed','Oct 6 · 10:20 AM'],['Driver dispatched','Oct 6 · 1:45 PM']],notes:'Driver is en route to the hotel.',contact:'Open guest chat'},
  {id:'ORD-1044',kind:'Booking',guest:'Leo Santos',hotel:'Henry’s Resort Dumaguete',room:'207',item:'Toyota Innova Rental',quantity:'1 vehicle',when:'Oct 10 · 11:30 AM – Oct 12 · 11:30 AM',fulfilment:'Pickup and return: Henry’s Resort Dumaguete lobby',total:'₱6,400.00',payment:'Paid via gateway',settlement:'Paid by guest',status:'Confirmed',timeline:[['Booking confirmed','Oct 6 · 4:15 PM']],notes:'Return deadline Oct 12 at 11:30 AM.',contact:'Open guest chat'},
  {id:'ORD-1037',kind:'Booking',guest:'Oliver Brown',hotel:'Henry’s Resort Dumaguete',room:'205',item:'Tourist Van Rental',quantity:'1 vehicle · 5 passengers',when:'Oct 6 · 8:00 AM – Oct 6 · 6:00 PM',fulfilment:'Pickup and return: Henry’s Resort Dumaguete lobby',total:'₱5,500.00',payment:'Paid via gateway',settlement:'In payout',status:'Completed',timeline:[['Booking confirmed','Oct 4 · 6:40 PM'],['Completed','Oct 6 · 6:12 PM']],notes:'Vehicle returned and checked.',contact:'View booking record'},
  {id:'CB-8812',kind:'Booking',guest:'Priya Shah',hotel:'Henry’s Resort Dumaguete',room:'412',item:'Airport Transfer — Sedan',quantity:'2 passengers · 2 suitcases',when:'Oct 3 · 7:00 PM',fulfilment:'Pickup: Henry’s Resort Dumaguete lobby · Destination: Dumaguete–Sibulan Airport',total:'₱1,800.00',payment:'Charged to room',settlement:'Guest checked out',status:'Completed',timeline:[['Booking confirmed','Oct 2 · 11:20 AM'],['Completed','Oct 3 · 9:10 PM']],notes:'Transfer completed.',contact:'View booking record'}
];
orders.splice(0,orders.length,...transportOrders);
/* Seed a representative Home queue: four existing requests and three newly arrived ones. */
const homeSeededNewPendingIds=[];
const dashboardPendingDisplayIds=new Set(['ORD-1042','CB-8835','CB-8840','CB-8854']);
listings.splice(0,listings.length,...transportListings);
transportListings.forEach(item=>{listingMockPhotos[item.id]=item.photo});
listingHasStock=function(){return false};
listingAvailabilitySummary=function(listing){return listing.stock||'Availability managed by vehicle capacity'};
bookingType=function(){return 'Booking'};
bookingActive=function(order){return ['Confirmed','Scheduled','In progress','In use'].includes(order.status||'')};
bookingStatusOptions=function(){return state.bookingTab==='Requests'?['All','Pending']:state.bookingTab==='Active'?['All','Confirmed','Scheduled','In progress','In use']:['All','Completed','Declined','Expired','No-show']};
dashboardOperationalScheduled=function(){const start=dashboardOperationalToday(),end=new Date(start);end.setDate(end.getDate()+6);return orders.filter(order=>bookingActive(order)&&order.kind!=='Counter charge'&&((dashboardOperationalGroup(order)==='In progress')||((dashboardOperationalOrderDate(order)||new Date(0))>=start&&(dashboardOperationalOrderDate(order)||new Date(0))<=end)))};
dashboardOperationalGroup=function(order){if(['In progress','In use'].includes(order.status))return 'In progress';const date=dashboardOperationalOrderDate(order),today=dashboardOperationalToday();if(!date)return 'Later';const days=Math.round((date-today)/86400000);if(days===0)return 'Today';if(days===1)return 'Tomorrow';return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(date)};
const dashboardRequestPlacedStamp=order=>{const raw=String(order.timeline?.[0]?.[1]||''),normalized=raw.replace(/\s*·\s*/,' '),stamp=Date.parse(dashboardOperationalToday().getFullYear()+' '+normalized);return Number.isFinite(stamp)?stamp:homePendingStamp(order)};
const dashboardPendingResponseMinutes=order=>{const rows=dashboardPendingOriginalBase().filter(item=>dashboardPendingDisplayIds.has(item.id)),latest=Math.max(...rows.map(dashboardRequestPlacedStamp),0),placed=dashboardRequestPlacedStamp(order),elapsed=Math.max(0,Math.round((latest-placed)/60000));return Math.max(1,60-elapsed)};
dashboardOperationalDeadline=function(order){const minutes=dashboardPendingResponseMinutes(order);return minutes>=60?'Respond within 1 hr':'Respond within '+minutes+' min'};
const dashboardHomeQuantity=value=>String(value||'').replace(/\s*·\s*\d+\s+(?:suitcases?|bags?)\b/ig,'').trim();
const dashboardHomePaymentSummary=order=>{const raw=String(order.payment||'')+' '+String(order.settlement||''),type=/room/i.test(raw)?'Charged to room':'Pay via QR',state=/paid/i.test(raw)?'Paid':'Unpaid';return type+' · '+state};
const dashboardHomeDateQuantity=order=>{const schedule=String(order.when||'Scheduled time not set').replace(/\s*·\s*\d+\s+(?:hours?|minutes?)\b/i,'').trim(),quantity=dashboardHomeQuantity(order.quantity);return [schedule,quantity].filter(Boolean).join(' · ')};
const dashboardHomeAmount=value=>String(value||'').replace(/\.00\b/g,'');
dashboardOperationalStatus=function(order){if(order.status==='In progress'||order.status==='In use')return 'In progress';return order.status==='Scheduled'||order.status==='Confirmed'?'Scheduled':order.status};
dashboardOperationalRequestSummary=function(order){return [String(order.when||'').replace(/^Pickup\s*/,'').replace(/\s*·\s*\d+\s+(?:hours?|minutes?)\b/i,''),order.quantity].filter(Boolean).join(' · ')};
dashboardOperationalRequestCard=function(order){const seen=(state.dashboardSeenRequests||[]).includes(order.id),processing=state.dashboardRequestProcessing===order.id,newPill=seen?'':'<span class="dashboard-request-new-pill">New</span>',financial=state.role==='Owner'?'<small class="dashboard-request-financial">'+esc(order.total)+' · '+esc(order.payment)+'</small>':'';return '<article class="dashboard-request-card '+(seen?'seen':'unseen')+'"><button class="dashboard-request-main" data-dashboard-request-view="'+esc(order.id)+'"><div class="dashboard-request-title-row"><h3>'+esc(order.item)+'</h3>'+newPill+'</div><p>'+esc(dashboardOperationalRequestSummary(order))+'</p>'+financial+'</button><div class="dashboard-request-footer"><strong class="dashboard-request-deadline '+(Number(order.responseMinutes||24)<=30?'urgent':'')+'">'+dashboardOperationalDeadline(order)+'</strong><div class="dashboard-request-actions"><button '+(processing?'disabled':'')+' data-dashboard-request-action="confirm" data-dashboard-request-id="'+esc(order.id)+'">'+(processing?'Processing…':'Confirm')+'</button><button class="secondary" '+(processing?'disabled':'')+' data-dashboard-request-action="decline" data-dashboard-request-id="'+esc(order.id)+'">Decline</button></div></div></article>'};
dashboardOperationalRequestSection=function(){const pending=dashboardOperationalPending();return '<section class="dashboard-operational-section dashboard-requests-section"><div class="dashboard-operational-heading"><h2>'+(state.role==='Owner'?'To confirm':'Incoming requests')+' <b>'+pending.length+'</b></h2></div>'+(pending.length?'<div class="dashboard-request-list">'+pending.map(dashboardOperationalRequestCard).join('')+'</div>':'<div class="dashboard-operational-empty">No bookings waiting for confirmation.</div>')+'</section>'};
dashboardOperationalBookingRow=function(order){const status=dashboardOperationalStatus(order),guestRoom=[order.guest,order.room?'Room '+order.room:''].filter(Boolean).join(' · ');return '<button class="dashboard-booking-row" data-detail="'+esc(order.id)+'"><span class="dashboard-booking-main"><span class="dashboard-request-reference-row"><small>#'+esc(displayBookingReference(order.id))+'</small><em class="dashboard-booking-status '+status.toLowerCase().replaceAll(' ','-')+'">'+esc(status)+'</em></span><strong class="dashboard-booking-title">'+esc(order.item)+'</strong><small class="dashboard-booking-summary">'+esc(dashboardHomeDateQuantity(order))+'</small><small class="dashboard-booking-guest-room">'+esc(guestRoom)+'</small><small class="dashboard-booking-payment">'+esc(dashboardHomePaymentSummary(order))+'</small></span></button>'};
dashboardOperationalUpcoming=function(){const scheduled=dashboardOperationalScheduled(),groups=['In progress','Today','Tomorrow'],groupMap=new Map();scheduled.forEach(order=>{const key=dashboardOperationalGroup(order);if(!groupMap.has(key))groupMap.set(key,[]);groupMap.get(key).push(order)});const keys=[...groups,...[...groupMap.keys()].filter(key=>!groups.includes(key))],cards=keys.filter(key=>groupMap.has(key)).map(key=>groupMap.get(key).slice().sort((a,b)=>String(a.when).localeCompare(String(b.when))).map(order=>dashboardOperationalBookingRow(order,key)).join('')).join('');return '<section class="dashboard-operational-section dashboard-upcoming-section"><div class="dashboard-operational-heading"><div><h2>Upcoming bookings</h2><span>Next 7 days</span></div><button class="dashboard-inline-link" data-page="orders">View bookings '+icons.arrow+'</button></div>'+(cards?'<div class="dashboard-booking-list">'+cards+'</div>':'<div class="dashboard-operational-empty">No upcoming bookings.</div>')+'</section>'};
dashboardOperationalStaffQueue=function(){const queue=orders.filter(order=>bookingActive(order)&&order.kind!=='Counter charge').slice().sort((a,b)=>String(a.when).localeCompare(String(b.when)));const rows=queue.map(order=>{const action=order.status==='In progress'?'complete':'start',label=action==='complete'?'Complete':'Start';return '<div class="dashboard-staff-row"><div><strong>'+dashboardOperationalWhen(order)+'</strong><span>'+esc(order.item)+'</span><small>'+esc(order.guest)+(order.room?' · Room '+esc(order.room):'')+' · '+esc(order.quantity)+'</small></div><span class="dashboard-booking-status '+dashboardOperationalStatus(order).toLowerCase().replaceAll(' ','-')+'">'+dashboardOperationalStatus(order)+'</span><button data-dashboard-queue-action="'+action+'" data-dashboard-queue-id="'+esc(order.id)+'">'+label+'</button></div>'}).join('');return '<section class="dashboard-operational-section dashboard-staff-queue"><div class="dashboard-operational-heading"><div><h2>Today’s queue</h2><span>Confirmed and ongoing bookings</span></div><button class="dashboard-inline-link" data-page="orders">View bookings '+icons.arrow+'</button></div>'+(rows||'<div class="dashboard-operational-empty">No bookings scheduled for today.</div>')+'</section>'};
dashboardOperationalMarkup=function(){const owner=state.role==='Owner',pending=dashboardOperationalPending(),unread=pending.filter(order=>!(state.dashboardSeenRequests||[]).includes(order.id)).length;return '<div class="dashboard-operational-page"><header class="dashboard-operational-header"><h1>Dashboard</h1><button class="dashboard-header-icon" data-dashboard-notifications aria-label="Notifications, '+unread+' unread"><i class="hgi-stroke hgi-notification-03" aria-hidden="true"></i>'+(unread?'<b>'+unread+'</b>':'')+'</button></header><section class="dashboard-greeting"><div><strong>Welcome back, Leah!</strong><small class="dashboard-current-date">'+esc(todayLabel())+'</small></div></section>'+dashboardOperationalRequestSection()+(state.role==='Staff'?dashboardOperationalStaffQueue():dashboardOperationalUpcoming())+dashboardOperationalReceivables()+(owner?'<button class="dashboard-insights-link" data-insights>View insights '+icons.arrow+'</button>':'')+'</div>'};
dashboard17=function(){return dashboardOperationalMarkup()};
dashboardTopListings=function(){return [['Airport Transfer — Sedan','14 orders'],['Toyota Innova Rental','8 orders'],['Tourist Van Rental','6 orders']]};
phase1ListingData=function(){const rows=[['Airport Transfer — Sedan',14,25200],['Toyota Innova Rental',8,25600],['Tourist Van Rental',6,33000]];return state.phase1ListingMetric==='revenue'?rows.slice().sort((a,b)=>b[2]-a[2]):rows};
profileView=function(){return head('Profile','Business details, team access, settlement terms, and support.')+'<div class="profile-grid"><section class="card profile-card"><div class="card-header"><h2>Business details</h2><button class="button small" data-toast="Business details editor opened">Edit</button></div><div class="profile-body"><div class="profile-identity"><span class="profile-avatar">CT</span><div><strong>Lakbay Negros Rentals</strong><span>Transportation rental service · Partner vendor</span></div></div><div class="settings-list"><div class="setting-row"><div><strong>Contact</strong><span>Leah Santos · +63 917 555 0182</span></div></div><div class="setting-row"><div><strong>Service area</strong><span>Henry’s Resort Dumaguete · Manila airport corridor</span></div></div><div class="setting-row"><div><strong>Linked hotel</strong><span>Henry’s Resort Dumaguete</span></div></div></div></div></section><section class="card profile-card"><div class="card-header"><h2>Team accounts</h2></div><div class="profile-body"><div class="setting-row"><div><strong>Leah Santos</strong><span>Owner · Full access</span></div><span class="status confirmed">Active</span></div><div class="setting-row"><div><strong>Marco Dela Cruz</strong><span>Staff · Bookings and Listings view</span></div><span class="status confirmed">Active</span></div></div></section><section class="card profile-card"><div class="card-header"><h2>Payout account</h2><button class="button small" data-toast="Payout account editor opened">Edit</button></div><div class="profile-body"><div class="setting-row"><div><strong>BDO · ending 2084</strong><span>Weekly settlement by default · Every Friday</span></div><span class="status confirmed">Verified</span></div></div></section></div>'};
const transportEarnings=[
 {id:'TX-1042',date:'Oct 7, 2026',sort:202610070830,listing:'Airport Transfer — Sedan',guest:'Amelia Reyes',room:'508',orderId:'ORD-1042',type:'Booking',method:'Gateway',gross:2400,commission:240,refunds:0,adjustments:0,status:'Awaiting settlement',detail:'Gateway payment is pending confirmation.'},
 {id:'TX-1047',date:'Oct 10, 2026',sort:202610100900,listing:'Dumaguete City Tour',guest:'Carlo Ramos',room:'315',orderId:'BK1047',type:'Booking',method:'Room charge',gross:1200,commission:0,refunds:0,adjustments:0,status:'Awaiting guest checkout',detail:''},
 {id:'TX-1042',date:'Oct 9, 2026',sort:202610091400,listing:'Airport Transfer — Sedan',guest:'Sofia Lim',room:'602',orderId:'BK1042',type:'Booking',method:'Room charge',gross:1800,commission:0,refunds:0,adjustments:0,status:'Awaiting guest checkout',detail:''},
 {id:'TX-1040',date:'Oct 9, 2026',sort:202610090900,listing:'Island Hopping Tour',guest:'Nina Cruz',room:'118',orderId:'BK1040',type:'Booking',method:'Room charge',gross:1200,commission:0,refunds:0,adjustments:0,status:'Awaiting guest checkout',detail:''},
 {id:'TX-1038',date:'Oct 8, 2026',sort:202610081000,listing:'Island Hopping Tour',guest:'Paolo Diaz',room:'410',orderId:'BK1038',type:'Booking',method:'Room charge',gross:1200,commission:0,refunds:0,adjustments:0,status:'Awaiting guest checkout',detail:''},
 {id:'TX-1031',date:'Oct 5, 2026',sort:202610050900,listing:'Van with Driver — Full Day',guest:'Maya Tan',room:'210',orderId:'BK1031',type:'Booking',method:'Room charge',gross:2070,commission:0,refunds:0,adjustments:0,status:'Awaiting settlement',detail:'',checkout:'Oct 7'},
 {id:'TX-1019',date:'Sep 27, 2026',sort:202609270900,listing:'Airport Transfer — Sedan',guest:'John D.',room:'305',orderId:'BK1019',type:'Booking',method:'Room charge',gross:1800,commission:0,refunds:0,adjustments:0,status:'Awaiting settlement',detail:'',checkout:'Sep 30'},
 {id:'TX-1007',date:'Oct 6, 2026',sort:202610061400,listing:'Airport Transfer — Sedan',guest:'Nina Garcia',room:'203',orderId:'CB-9002',type:'Booking',method:'Gateway',gross:1800,commission:180,refunds:0,adjustments:0,status:'Ready for payout',detail:'Eligible for the next payout.'},
 {id:'TX-0991',date:'Oct 3, 2026',sort:202610032110,listing:'Airport Transfer — Sedan',guest:'Priya Shah',room:'412',orderId:'CB-8812',type:'Booking',method:'Room charge',gross:1800,commission:180,refunds:0,adjustments:0,status:'Paid',detail:'Included in payout CAB-PAY-1003.'},
 {id:'TX-0987',date:'Oct 1, 2026',sort:202610011100,listing:'Toyota Innova Rental',guest:'Oliver Brown',room:'205',orderId:'ORD-1037',type:'Refund',method:'Room charge',gross:0,commission:0,refunds:1200,adjustments:0,status:'Deducted from payout',detail:'Cancelled rental refund deducted from payout.'}
];
cabanaEarningsTransactions.splice(0,cabanaEarningsTransactions.length,...transportEarnings);
bookingCard=function(order){const owner=state.role==='Owner',newRequest=order.status==='Pending'&&!(state.dashboardSeenRequests||[]).includes(order.id);let action='';if(order.status==='Pending')action='<button class="booking-action primary" data-booking-action="confirm" data-booking-id="'+order.id+'">Confirm</button><button class="booking-action outline" data-booking-action="decline" data-booking-id="'+order.id+'">Decline</button>';else if(order.status==='Confirmed'||order.status==='Scheduled')action='<button class="booking-action primary" data-booking-action="start" data-booking-id="'+order.id+'">Start</button>';else if(order.status==='In progress'||order.status==='In use')action='<button class="booking-action primary" data-booking-action="complete" data-booking-id="'+order.id+'">Complete</button>';return '<article class="booking-card '+(newRequest?'is-new':'')+'"><button class="booking-card-hit" data-booking-detail="'+order.id+'"><div class="booking-title"><div><div class="booking-listing">'+esc(order.item)+'</div><span class="booking-type">Booking</span></div><span class="booking-status '+order.status.toLowerCase().replaceAll(' ','-')+'">'+esc(order.status)+'</span></div>'+(newRequest?'<span class="booking-new-label">New request</span>':'')+'<div class="booking-line">'+esc(order.guest)+' · '+esc(order.hotel)+' · Room '+esc(order.room)+'</div><div class="booking-line">'+esc(order.when)+' · '+esc(order.quantity)+'</div><div class="booking-bottom">'+(owner?'<span>'+esc(order.total)+' · '+esc(order.payment)+'</span>':'<span>Financial details restricted</span>')+'</div>'+(order.status==='Pending'?'<div class="booking-deadline">Respond within '+(order.responseMinutes||24)+' min</div>':'')+'</button>'+(action?'<div class="booking-actions">'+action+'</div>':'')+'</article>'};
bookingDeclineModal=function(){if(!state.declineId)return '';return '<div class="booking-decline-backdrop" data-decline-close></div><section class="booking-decline-modal" role="dialog" aria-modal="true"><h2>Why are you declining?</h2><p>Choose a reason to help the guest understand what happened.</p><div class="decline-reasons">'+['Vehicle unavailable','No driver available','Unable to fulfil','Other'].map(x=>'<button class="'+(state.declineReason===x?'active':'')+'" data-decline-reason="'+x+'">'+x+'</button>').join('')+'</div>'+(state.declineReason==='Other'?'<textarea data-decline-note placeholder="Add a short reason"></textarea>':'')+'<div class="booking-detail-actions"><button class="button ghost" data-decline-close>Cancel</button><button class="button primary" data-decline-submit '+(state.declineReason?'':'disabled')+'>Decline request</button></div></section>'};
try{localStorage.setItem('cabana:latest-revision','transport-rental-v1')}catch(error){}
state.page='dashboard';state.detail=null;state.bookingTab='Requests';state.orderView='list';state.range='Today';
const transportRenderBefore=render;
render=function(){transportRenderBefore();document.querySelectorAll('#app *').forEach(node=>{if(node.children.length===0&&node.textContent.includes('Sans Rival Bakehouse'))node.textContent=node.textContent.replaceAll('Sans Rival Bakehouse','Lakbay Negros Rentals');if(node.children.length===0&&node.textContent.includes('Bakery · Live'))node.textContent=node.textContent.replaceAll('Bakery · Live','Transportation rental service · Live')});bindDashboardOperational()};
render();

/* Latest revision: keep the requested Insights → Bookings view visible. */
try{localStorage.setItem('cabana:latest-revision','current-home-portal-v1')}catch(error){}
insightsPageForView=function(){return phase1InsightsPage()};
const renderInsightsBookingsFinal=render;
render=function(){renderInsightsBookingsFinal();if(state.page==='insights'){document.querySelectorAll('[data-phase1-booking-mode]').forEach(button=>button.onclick=()=>{state.phase1BookingMode=button.dataset.phase1BookingMode;render()});document.querySelectorAll('[data-insight-tab]').forEach(button=>button.onclick=()=>{state.insightTab=button.dataset.insightTab;render()});}};
render();

/* Bookings workspace refinement: the product-facing Requests / Active / Past flow. */
state.bookingTab=state.bookingTab||'Requests';
state.bookingQuery=state.bookingQuery||'';
state.bookingFilters=state.bookingFilters||{date:'All dates',type:'All',listing:'All listings',status:'All'};
state.bookingFilterOpen=false;

function bookingType(o){return o.kind==='In-app order'?'Product':o.kind==='Counter charge'?'Charge':'Service';}
function bookingPast(o){return ['Completed','Declined','Expired','No-show','Posted to room','Voided','Settled'].includes(o.status||'');}
function bookingActive(o){return ['Confirmed','Scheduled','In use','In progress','Preparing','Ready'].includes(o.status||'');}
function bookingDateLabel(o){const when=o.when||'';if(when.includes('Today')||when.startsWith('Oct 2'))return 'Today';if(when.includes('Tomorrow')||when.startsWith('Oct 3'))return 'Tomorrow';return 'Later';}
function bookingStatusOptions(){return state.bookingTab==='Requests'?['All','Pending']:state.bookingTab==='Active'?['All','Confirmed','Preparing','Ready','Scheduled','In progress','In use']:['All','Completed','Declined','Expired'];}
function bookingRecords(){const f=state.bookingFilters,q=(state.bookingQuery||'').trim().toLowerCase();return orders.filter(o=>{const tab=state.bookingTab;const routed=tab==='Requests'?o.status==='Pending':tab==='Active'?bookingActive(o):bookingPast(o);const search=!q||`${o.id} ${o.guest} ${o.room} ${o.item} ${o.hotel}`.toLowerCase().includes(q);const type=f.type==='All'||f.type===bookingType(o)||(f.type==='Services & rentals'&&bookingType(o)==='Service');const listing=f.listing==='All listings'||f.listing===o.item;const status=f.status==='All'||f.status===o.status;const date=f.date==='All dates'||f.date==='Last 7 days'||f.date==='Custom From / To'||(f.date==='Today'&&bookingDateLabel(o)==='Today')||(f.date==='Tomorrow'&&bookingDateLabel(o)==='Tomorrow');return routed&&search&&type&&listing&&status&&date;});}
function bookingCard(o){const owner=state.role==='Owner',newRequest=o.status==='Pending'&&!(state.dashboardSeenRequests||[]).includes(o.id),isProduct=bookingType(o)==='Product';let action='';if(o.status==='Pending')action='<button class="booking-action primary" data-booking-action="confirm" data-booking-id="'+o.id+'">Confirm</button><button class="booking-action outline" data-booking-action="decline" data-booking-id="'+o.id+'">Decline</button>';else if(o.status==='Confirmed'&&isProduct)action='<button class="booking-action primary" data-booking-action="preparing" data-booking-id="'+o.id+'">Start preparing</button>';else if(o.status==='Preparing')action='<button class="booking-action primary" data-booking-action="ready" data-booking-id="'+o.id+'">Mark ready</button>';else if(o.status==='Ready')action='<button class="booking-action primary" data-booking-action="complete" data-booking-id="'+o.id+'">Complete</button>';else if(o.status==='Confirmed')action='<button class="booking-action primary" data-booking-action="start" data-booking-id="'+o.id+'">Start</button><button class="booking-action outline" data-booking-action="qr" data-booking-id="'+o.id+'">Scan QR</button>';return '<article class="booking-card '+(newRequest?'is-new':'')+'"><button class="booking-card-hit" data-booking-detail="'+o.id+'"><div class="booking-title"><div><div class="booking-listing">'+esc(o.item)+'</div><span class="booking-type">'+bookingType(o)+'</span></div><span class="booking-status '+o.status.toLowerCase().replaceAll(' ','-')+'">'+esc(o.status)+'</span></div>'+(newRequest?'<span class="booking-new-label">New request</span>':'')+'<div class="booking-line">'+esc(o.guest)+' · '+esc(o.hotel)+' · Room '+esc(o.room)+'</div><div class="booking-line">'+esc(o.when)+' · '+esc(o.quantity)+(o.kind==='Booking'?' · 1 hr':'')+'</div><div class="booking-bottom">'+(owner?'<span>'+esc(o.total)+' · '+esc(o.payment)+'</span>':'<span>Payment details restricted</span>')+'</div>'+(o.status==='Pending'?'<div class="booking-deadline">Respond within '+(o.responseMinutes||24)+' min</div>':'')+'</button>'+(action?'<div class="booking-actions">'+action+'</div>':'')+'</article>';}
function bookingFilterSheet(){if(!state.bookingFilterOpen)return '';const f=state.bookingFilters,choices=(label,key,values)=>'<fieldset><legend>'+label+'</legend>'+values.map(v=>'<button class="booking-choice '+(f[key]===v?'active':'')+'" data-booking-filter-choice="'+key+'" data-booking-filter-value="'+esc(v)+'"><span>'+esc(v)+'</span>'+(f[key]===v?'<b>✓</b>':'')+'</button>').join('')+'</fieldset>';return '<div class="booking-sheet-backdrop" data-booking-filter-close></div><section class="booking-filter-sheet" role="dialog" aria-modal="true"><div class="sheet-handle"></div><header><div><h2>Filters</h2><p>Date uses service / pickup dates for Requests and Active, and completion / closure dates for Past.</p></div><button data-booking-filter-close aria-label="Close filters">×</button></header>'+choices('Date range','date',['All dates','Today','Tomorrow','Last 7 days','Custom From / To'])+choices('Type','type',['All','Products','Services & rentals'])+choices('Listing','listing',['All listings',...listings.map(x=>x.name)])+choices('Status','status',bookingStatusOptions())+'<div class="booking-filter-actions"><button class="button ghost" data-booking-filter-reset>Reset</button><button class="button primary" data-booking-filter-apply>Apply filters</button></div></section>';}
function bookingsWorkspace(){const tab=state.bookingTab,pending=orders.filter(o=>o.status==='Pending').length,records=bookingRecords();if(tab==='Active')records.sort((a,b)=>{const rank=x=>bookingDateLabel(x)==='Today'?0:bookingDateLabel(x)==='Tomorrow'?1:2;return rank(a)-rank(b)||cabanaOrderTimeValue(a)-cabanaOrderTimeValue(b)});const groups={};records.forEach(o=>{const key=tab==='Active'?bookingDateLabel(o):tab==='Past'?'Past bookings':'Awaiting your decision';(groups[key]||(groups[key]=[])).push(o)});const chips=Object.entries(state.bookingFilters).filter(([k,v])=>v&&v!=='All'&&v!=='All dates'&&v!=='All listings').map(([k,v])=>'<button class="booking-chip" data-booking-chip="'+k+'">'+esc(v)+' ×</button>').join('');const groupMarkup=Object.entries(groups).map(([g,rows])=>'<section class="booking-group"><h2>'+g+'</h2>'+rows.map(bookingCard).join('')+'</section>').join('');const pastExport=tab==='Past'&&state.role==='Owner'?'<button class="booking-export" data-booking-export><i class="hgi-stroke hgi-download-04" aria-hidden="true"></i> Export CSV</button>':'';const unread=pending-(state.dashboardSeenRequests||[]).filter(id=>orders.some(o=>o.id===id&&o.status==='Pending')).length;return '<div class="bookings-workspace"><header class="dashboard-operational-header booking-page-header"><h1>Bookings</h1><button class="dashboard-header-icon" data-toast="No new notifications" aria-label="Notifications"><i class="hgi-stroke hgi-notification-03" aria-hidden="true"></i>'+(unread>0?'<b>'+unread+'</b>':'')+'</button></header><header class="bookings-head">'+pastExport+'</header><nav class="bookings-tabs" role="tablist">'+['Requests','Active','Past'].map(x=>'<button class="'+(tab===x?'active':'')+'" data-booking-tab="'+x+'">'+x+(x==='Requests'&&pending?'<b>'+pending+'</b>':'')+'</button>').join('')+'</nav><div class="bookings-tools"><div class="bookings-search"><i class="hgi-stroke hgi-search-01"></i><input data-booking-search value="'+esc(state.bookingQuery)+'" placeholder="Search guest or room" aria-label="Search guest or room"></div><button class="booking-filter-trigger" data-booking-filter-open aria-label="Open filters"><i class="hgi-stroke hgi-filter-horizontal"></i><span>Filter</span></button></div>'+(chips?'<div class="booking-chips">'+chips+'</div>':'')+(groupMarkup||'<div class="bookings-empty"><strong>'+ (tab==='Requests'?'No requests waiting for confirmation.':tab==='Active'?'No active bookings.':'No past bookings.')+'</strong><span>Try changing your search or filters.</span></div>')+'</div>';}
function bookingsDetail(){const o=orders.find(x=>x.id===state.detail);if(!o)return bookingsWorkspace();const owner=state.role==='Owner';const canScan=o.kind==='Booking'&&bookingActive(o);const action=o.status==='Pending'?'<button class="button primary" data-detail-action="confirm">Confirm</button><button class="button" data-detail-action="decline">Decline</button>':bookingActive(o)?'<button class="button primary" data-detail-action="status">Update status</button>'+(canScan?'<button class="button" data-detail-action="qr">Scan QR</button>':'')+(owner?'<button class="button" data-detail-action="charge">Add charge / add-on</button>':''):'';return '<div class="booking-detail-view"><button class="booking-back" data-booking-back>← Back to Bookings</button><div class="booking-detail-modal"><header><div><span class="booking-type">'+bookingType(o)+' · '+o.id+'</span><h1>'+esc(o.item)+'</h1><p>'+esc(o.status)+'</p></div><button class="booking-close" data-booking-back>×</button></header><section><h2>Guest</h2><p><strong>'+esc(o.guest)+'</strong><br>'+esc(o.hotel)+' · Room '+esc(o.room)+'<br>Stay dates available in guest profile</p></section><section><h2>Booking</h2><p><strong>'+esc(o.item)+'</strong><br>'+esc(o.quantity)+' · '+esc(o.when)+'<br>'+esc(o.fulfilment)+'</p></section><section><h2>Payment</h2><p>'+(owner?esc(o.total)+' · '+esc(o.payment)+'<br>'+esc(o.settlement):'Financial details are restricted for your role.')+'</p></section><section><h2>Pickup / meeting point</h2><p>'+esc(o.fulfilment)+'<br>Use the listing instructions for guest handoff.</p></section><section><h2>Timeline</h2><div class="booking-timeline">'+(o.timeline||[]).map(t=>'<div><b>'+esc(t[0])+'</b><span>'+esc(t[1])+'</span></div>').join('')+'</div></section><div class="booking-detail-actions">'+action+'<button class="button ghost" data-detail-action="message">Message guest</button></div></div></div>';}
function bookingDeclineModal(){if(!state.declineId)return '';return '<div class="booking-decline-backdrop" data-decline-close></div><section class="booking-decline-modal" role="dialog" aria-modal="true"><h2>Why are you declining?</h2><p>Choose a reason to help the guest understand what happened.</p><div class="decline-reasons">'+['Out of stock','No availability','Unable to fulfil','Other'].map(x=>'<button class="'+(state.declineReason===x?'active':'')+'" data-decline-reason="'+x+'">'+x+'</button>').join('')+'</div>'+(state.declineReason==='Other'?'<textarea data-decline-note placeholder="Add a short reason"></textarea>':'')+'<div class="booking-detail-actions"><button class="button ghost" data-decline-close>Cancel</button><button class="button primary" data-decline-submit '+(state.declineReason?'':'disabled')+'>Decline request</button></div></section>';}
const bookingsViewFinal=()=>state.page==='orders'&&state.detail?bookingsDetail():bookingsWorkspace();
view=bookingsViewFinal;
const renderBeforeBookingsFinal=render;
render=function(){renderBeforeBookingsFinal();if(state.page==='orders'){document.querySelector('#app')?.insertAdjacentHTML('beforeend',bookingFilterSheet());bindBookingsFinal();}};
function bindBookingsFinal(){document.querySelectorAll('[data-booking-tab]').forEach(b=>b.onclick=()=>{state.bookingTab=b.dataset.bookingTab;render()});const s=document.querySelector('[data-booking-search]');if(s)s.oninput=e=>{state.bookingQuery=e.target.value;const p=e.target.selectionStart;render();const n=document.querySelector('[data-booking-search]');n?.focus();n?.setSelectionRange(p,p)};document.querySelectorAll('[data-booking-filter-open]').forEach(b=>b.onclick=()=>{state.bookingFilterOpen=true;render()});document.querySelectorAll('[data-booking-filter-close]').forEach(b=>b.onclick=()=>{state.bookingFilterOpen=false;render()});document.querySelectorAll('[data-booking-filter-choice]').forEach(b=>b.onclick=()=>{state.bookingFilters[b.dataset.bookingFilterChoice]=b.dataset.bookingFilterValue;render()});document.querySelectorAll('[data-booking-filter-reset]').forEach(b=>b.onclick=()=>{state.bookingFilters={date:'All dates',type:'All',listing:'All listings',status:'All'};render()});document.querySelectorAll('[data-booking-filter-apply]').forEach(b=>b.onclick=()=>{state.bookingFilterOpen=false;render()});document.querySelectorAll('[data-booking-chip]').forEach(b=>b.onclick=()=>{const k=b.dataset.bookingChip;state.bookingFilters[k]=k==='date'?'All dates':k==='listing'?'All listings':'All';render()});document.querySelectorAll('[data-booking-detail]').forEach(b=>b.onclick=()=>{state.detail=b.dataset.bookingDetail;state.dashboardSeenRequests=[...(state.dashboardSeenRequests||[]),state.detail];render()});document.querySelectorAll('[data-booking-back]').forEach(b=>b.onclick=()=>{state.detail=null;render()});document.querySelectorAll('[data-booking-action]').forEach(b=>b.onclick=e=>{e.stopPropagation();const o=orders.find(x=>x.id===b.dataset.bookingId);if(!o)return;const a=b.dataset.bookingAction;if(a==='decline'){state.declineId=o.id;state.declineReason='';render();return}o.status=a==='confirm'?'Confirmed':a==='preparing'?'Preparing':a==='ready'?'Ready':a==='complete'?'Completed':a==='start'?'In progress':o.status;state.bookingTab=a==='confirm'?'Active':state.bookingTab;render()});document.querySelectorAll('[data-booking-export]').forEach(b=>b.onclick=()=>toast('Filtered bookings CSV prepared'));document.querySelectorAll('[data-detail-action]').forEach(b=>b.onclick=()=>{const o=orders.find(x=>x.id===state.detail);if(!o)return;if(b.dataset.detailAction==='confirm')o.status='Confirmed';if(b.dataset.detailAction==='decline'){state.declineId=o.id;state.declineReason='';render();return}if(b.dataset.detailAction==='status')o.status=o.kind==='In-app order'?'Preparing':'In progress';if(b.dataset.detailAction==='charge'&&state.role==='Owner')toast('Add-on review opened');if(b.dataset.detailAction==='qr')toast('Validation flow opened');if(b.dataset.detailAction==='message')toast('Chat thread opened');if(['confirm'].includes(b.dataset.detailAction))state.bookingTab='Active';if(b.dataset.detailAction!=='charge'&&b.dataset.detailAction!=='qr'&&b.dataset.detailAction!=='message')state.detail=null;render()});document.querySelectorAll('[data-decline-close]').forEach(b=>b.onclick=()=>{state.declineId=null;state.declineReason='';render()});document.querySelectorAll('[data-decline-reason]').forEach(b=>b.onclick=()=>{state.declineReason=b.dataset.declineReason;render()});document.querySelectorAll('[data-decline-submit]').forEach(b=>b.onclick=()=>{const o=orders.find(x=>x.id===state.declineId);if(o){o.status='Declined';o.declineReason=state.declineReason;state.bookingTab='Past'}state.declineId=null;state.declineReason='';render()});}
render();

/* Phase 1 Insights: Owner-only reporting surface. */
function phase1DateLabel(date,year=true){return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'Asia/Manila',...(year?{year:'numeric'}:{})}).format(date)}
function phase1DateRangeLabel(){const now=new Date();now.setHours(0,0,0,0);const range=state.range||'Last 7 days';if(range==='Custom range'&&state.customFrom&&state.customTo){const from=new Date(state.customFrom+'T00:00:00'),to=new Date(state.customTo+'T00:00:00');return phase1DateLabel(from,from.getFullYear()!==to.getFullYear()||from.getMonth()!==to.getMonth())+'–'+phase1DateLabel(to,true)}if(range==='This month'){const start=new Date(now.getFullYear(),now.getMonth(),1);return phase1DateLabel(start,false)+'–'+phase1DateLabel(now,true)}if(range==='Last month'){const start=new Date(now.getFullYear(),now.getMonth()-1,1),end=new Date(now.getFullYear(),now.getMonth(),0);return phase1DateLabel(start,false)+'–'+phase1DateLabel(end,true)}const days=range==='Last 30 days'?29:6,start=new Date(now);start.setDate(start.getDate()-days);return phase1DateLabel(start,false)+'–'+phase1DateLabel(now,true)}
function phase1RangeName(){return state.range==='Custom range'?'Custom':state.range||'Last 7 days'}
function phase1Info(label){return '<button class="phase1-info" data-toast="'+esc(label)+' details" aria-label="'+esc(label)+' details">i</button>'}
function phase1Metric(label,value,meta=''){return '<article class="phase1-metric"><span>'+label+'</span><strong>'+value+'</strong>'+(meta?'<small>'+meta+'</small>':'')+'</article>'}
function phase1SalesData(){const ranges={'Last 7 days':{gross:28400,platform:2840,hotel:1420,net:24140,room:17040,gateway:11360,values:[1800,2600,4200,3400,5000,7200,4200],labels:['Sep 30','Oct 1','2','3','4','5','6']},'Last 30 days':{gross:84260,platform:8426,hotel:4213,net:71621,room:50560,gateway:33700,values:[8200,7600,9400,11800,10200,13600,23460],labels:['Sep 7','12','17','22','27','Oct 2','6']},'This month':{gross:124860,platform:12486,hotel:6243,net:106131,room:74916,gateway:49944,values:[14000,18000,12000,22000,16000,24000,18860],labels:['Oct 1','2','3','4','5','6','']},'Last month':{gross:118420,platform:11842,hotel:5921,net:100657,room:71052,gateway:47368,values:[12000,15000,13000,19000,17000,21000,21420],labels:['Sep 1','6','11','16','21','26','30']}};return ranges[state.range]||ranges['Last 7 days']}
function phase1ComparisonLabel(){const range=state.range||'Last 7 days';return range==='Last 30 days'?'previous 30 days':range==='This month'?'previous month':range==='Last month'?'previous month':range==='Custom range'?'previous period':'previous 7 days'}
function phase1LineChart(values,labels){return '<div class="phase1-line-chart">'+insightLineChart(values,values.map(value=>Math.round(value*.82)),labels)+'</div>'}
function phase1SalesTrendChart(data){const max=Math.max(...data.values);return '<div class="phase1-sales-trend" role="img" aria-label="Daily gross sales bar chart">'+data.values.map((value,index)=>'<button class="phase1-sales-bar" data-phase1-sales-bar="'+esc(data.labels[index]+' · '+insightMoney(value))+'" style="--bar-height:'+Math.max(8,Math.round(value/max*100))+'%" aria-label="'+esc(data.labels[index]+' '+insightMoney(value))+'"><i></i><small>'+esc(data.labels[index])+'</small></button>').join('')+'</div>'}
function phase1SalesHeroChart(data){const min=Math.min(...data.values),max=Math.max(...data.values),span=Math.max(1,max-min),points=data.values.map((value,index)=>{const x=4+(index*112/(data.values.length-1)),y=38-((value-min)/span*28);return [x.toFixed(1),y.toFixed(1)]}),line='M'+points.map(point=>point.join(' ')).join(' L'),area=line+' L116 46 L4 46 Z';return '<div class="phase1-sales-hero-chart" role="img" aria-label="Sales trend preview"><svg viewBox="0 0 120 52" preserveAspectRatio="none" aria-hidden="true"><path class="phase1-sales-hero-area" d="'+area+'"></path><path class="phase1-sales-hero-line" d="'+line+'"></path><circle cx="'+points[points.length-1][0]+'" cy="'+points[points.length-1][1]+'" r="3"></circle></svg></div>'}
function phase1PaymentBreakdown(data){const expanded=state.phase1PaymentExpanded===true;return '<section class="phase1-report-card phase1-payment-card"><div class="phase1-card-heading"><div><h2>Sales by payment method</h2></div></div><div class="phase1-payment-method"><strong>'+insightMoney(data.room)+'</strong><span>Charged to guests’ rooms</span></div><div class="phase1-payment-divider"></div><div class="phase1-payment-method"><strong>'+insightMoney(data.gateway)+'</strong><span>Paid by guests in the app</span></div><button class="phase1-payment-toggle" data-phase1-payment-toggle aria-expanded="'+(expanded?'true':'false')+'">'+(expanded?'Hide breakdown ▴':'View breakdown ▾')+'</button>'+(expanded?'<div class="phase1-payment-breakdown"><div><span>GCash</span><strong>₱4,320.00</strong></div><div><span>Maya</span><strong>₱3,480.00</strong></div><div><span>Card</span><strong>₱3,560.00</strong></div></div>':'')+'</section>'}
function phase1SalesPanel(){const data=phase1SalesData();return '<section class="phase1-insights-panel" data-phase1-panel="sales"><article class="phase1-sales-hero"><div class="phase1-sales-hero-copy"><span>Net earnings</span><strong>'+insightMoney(data.net)+'</strong><small>After commissions</small><div class="phase1-sales-comparison"><b>↗ 12%</b><span>vs. '+phase1ComparisonLabel()+'</span><em>Demo data</em></div></div>'+phase1SalesHeroChart(data)+'</article><section class="phase1-report-card phase1-earnings-breakdown"><div class="phase1-card-heading"><div><h2>Earnings breakdown</h2></div></div><div class="phase1-breakdown-row"><span>Gross sales</span><strong>'+insightMoney(data.gross)+'</strong></div><div class="phase1-breakdown-row deduction"><span>Platform fee (10%)</span><strong>−'+insightMoney(data.platform)+'</strong></div><div class="phase1-breakdown-row deduction"><span>Hotel share (5%)</span><strong>−'+insightMoney(data.hotel)+'</strong></div><div class="phase1-breakdown-total"><span>Net earnings</span><strong>'+insightMoney(data.net)+'</strong></div></section><section class="phase1-report-card phase1-sales-trend-card"><div class="phase1-card-heading"><div><h2>Sales trend</h2><span>Gross sales · daily</span></div></div>'+phase1SalesTrendChart(data)+'</section></section>'}
function phase1BookingBars(mode){const day=mode!=='time',values=day?[4,8,6,7,12,17,9]:[3,7,5,8,12,17],labels=day?['Mon','Tue','Wed','Thu','Fri','Sat','Sun']:['8 AM','10 AM','12 PM','2 PM','4 PM','6 PM'];return '<div class="phase1-bars" role="img" aria-label="Booking activity"><div class="phase1-bar-grid">'+values.map((value,index)=>'<span class="phase1-bar-column"><i style="height:'+Math.round(value/17*100)+'%" class="'+(value===Math.max(...values)?'active':'')+'" aria-label="'+labels[index]+' '+value+' bookings"></i><small>'+labels[index]+'</small></span>').join('')+'</div><p><strong>Busiest:</strong> '+(day?'Saturday':'4–6 PM')+' · '+Math.max(...values)+' bookings</p></div>'}
function phase1BookingsPanel(){const mode=state.phase1BookingMode||'day';return '<section class="phase1-insights-panel" data-phase1-panel="bookings"><div class="phase1-metrics phase1-booking-metrics"><article class="phase1-metric phase1-total-bookings"><span>Total bookings</span><strong>42</strong><div class="phase1-breakdown"><span><i class="confirmed-dot"></i>Confirmed <b>34</b></span><span><i class="declined-dot"></i>Declined <b>5</b></span><span><i class="expired-dot"></i>Expired <b>3</b></span></div></article>'+phase1Metric('Confirmation rate','81%',phase1Info('Confirmation rate')+' Confirmed ÷ received requests')+phase1Metric('Avg. time to confirm','8 min','Manual requests only')+'</div><section class="phase1-report-card"><div class="phase1-card-heading"><div><h2>Booking activity</h2><span>'+phase1RangeName()+' · busiest '+(mode==='day'?'days':'time slots')+'</span></div><div class="phase1-toggle" role="group" aria-label="Booking activity grouping"><button class="'+(mode==='day'?'active':'')+'" data-phase1-booking-mode="day">Day</button><button class="'+(mode==='time'?'active':'')+'" data-phase1-booking-mode="time">Time slot</button></div></div>'+phase1BookingBars(mode)+'</section></section>'}
function phase1ListingData(){const rows=[['Island Hopping Tour',14,7500],['Private bakery tasting',8,7200],['Island Breakfast Box',6,4080],['Whole Sans Rival Cake',4,4800],['Airport transfer',2,3600]];return state.phase1ListingMetric==='revenue'?rows.slice().sort((a,b)=>b[2]-a[2]):rows}
function phase1ListingBars(){const rows=phase1ListingData(),max=Math.max(...rows.map(row=>state.phase1ListingMetric==='revenue'?row[2]:row[1]));return '<div class="phase1-horizontal-bars">'+rows.map(row=>{const value=state.phase1ListingMetric==='revenue'?row[2]:row[1];return '<div><span>'+esc(row[0])+'</span><i><b style="width:'+Math.round(value/max*100)+'%"></b></i><strong>'+(state.phase1ListingMetric==='revenue'?insightMoney(value):value)+'</strong></div>'}).join('')+'</div>'}
function phase1ListingsPanel(){const metric=state.phase1ListingMetric||'bookings';return '<section class="phase1-insights-panel" data-phase1-panel="listings"><div class="phase1-metrics phase1-listing-metrics">'+phase1Metric('Active listings','8')+phase1Metric('Listings needing attention','3')+'<article class="phase1-metric phase1-capacity-metric"><span>Capacity filled</span><strong>10 of 14 slots booked</strong><small>Boat slots · compatible capacity only</small></article></div><section class="phase1-report-card"><div class="phase1-card-heading"><div><h2>Top listings</h2><span>Up to five listings</span></div><div class="phase1-toggle" role="group" aria-label="Top listings metric"><button class="'+(metric==='bookings'?'active':'')+'" data-phase1-listing-metric="bookings">Bookings</button><button class="'+(metric==='revenue'?'active':'')+'" data-phase1-listing-metric="revenue">Revenue</button></div></div>'+phase1ListingBars()+'</section><details class="phase1-report-card phase1-attention-card"><summary><h2>Needs attention</h2><b>⌄</b></summary><div><span>Inactive listings <strong>1</strong></span><span>No bookings this period <strong>2</strong></span></div></details></section>'}
function phase1InsightsPage(){if(state.role!=='Owner')return '<div class="insights-access card"><strong>Owner access required</strong><span>Insights and exports are available only to the business owner.</span></div>';const tab=state.insightTab==='orders'?'orders':state.insightTab==='listings'?'listings':'sales',panel=tab==='sales'?phase1SalesPanel():tab==='orders'?phase1BookingsPanel():phase1ListingsPanel();return '<div class="phase1-insights-page"><header class="phase1-insights-header"><button class="phase1-insights-back" data-insights-back aria-label="Back to Menu">←</button><h1>Insights</h1><div class="phase1-insights-actions"><button data-download-report aria-label="Download report"><i class="hgi-stroke hgi-download-04" aria-hidden="true"></i></button></div></header><button class="phase1-insights-period phase1-insights-date-control" data-header-filter aria-label="Filter Insights by date"><div><strong>'+phase1RangeName()+'</strong><span>'+phase1DateRangeLabel()+'</span></div><i class="hgi-stroke hgi-calendar-03" aria-hidden="true"></i></button><nav class="phase1-insights-tabs" role="tablist" aria-label="Insights sections"><button role="tab" aria-selected="'+(tab==='sales')+'" class="'+(tab==='sales'?'active':'')+'" data-insight-tab="sales">Sales</button><button role="tab" aria-selected="'+(tab==='orders')+'" class="'+(tab==='orders'?'active':'')+'" data-insight-tab="orders">Bookings</button><button role="tab" aria-selected="'+(tab==='listings')+'" class="'+(tab==='listings'?'active':'')+'" data-insight-tab="listings">Listings</button></nav><main class="phase1-insights-content">'+panel+'</main></div>'}
const phase1InsightsPageBeforeOverride=insightsPageForView;
insightsPageForView=function(){return phase1InsightsPage()};
const phase1ShellBeforeOverride=shell3;
shell3=function(content){if(content.includes('phase1-insights-page')){let html=shell2(content);if(state.page==='insights')html=html.replace(/<header class="topbar">[\s\S]*?<\/header>/,'');return html+insightsDownloadModal()}return phase1ShellBeforeOverride(content)};
const phase1FilterSheetBeforeOverride=filterSheet;
filterSheet=function(){return phase1FilterSheetBeforeOverride().replace(/<div class="compare-options">[\s\S]*?<\/div>/,'').replaceAll('>Custom range<','>Custom<')};
const phase1DownloadModalBeforeOverride=insightsDownloadModal;
insightsDownloadModal=function(){if(!state.insightsDownloadOpen)return '';const tab=state.insightTab==='listings'?'Listings':state.insightTab==='orders'?'Bookings':'Sales';return '<div class="insights-download-backdrop" data-download-close></div><section class="insights-download-modal" role="dialog" aria-modal="true" aria-label="Download report"><div class="sheet-handle"></div><div class="insights-download-heading"><div><h2>Download report</h2><span>'+tab+' · '+phase1DateRangeLabel()+'</span></div><button data-download-close aria-label="Close download report">×</button></div><button class="insights-download-option" data-download-format="CSV"><span>CSV</span><small>Comma-separated values</small><b aria-hidden="true">›</b></button><button class="insights-download-option" data-download-format="PDF"><span>PDF</span><small>Portable document</small><b aria-hidden="true">›</b></button></section>'};
const phase1BindDownloadBeforeOverride=bindInsightsDownload;
bindInsightsDownload=function(){phase1BindDownloadBeforeOverride();document.querySelectorAll('[data-download-format]').forEach(button=>button.onclick=()=>{const format=button.dataset.downloadFormat,tab=state.insightTab==='listings'?'Listings':state.insightTab==='orders'?'Bookings':'Sales';state.insightsDownloadOpen=false;render();setTimeout(()=>toast(format+' report prepared for '+tab+' · '+phase1DateRangeLabel()),0)})};
const phase1BindInsightsBeforeOverride=bindInsightsExtras;
bindInsightsExtras=function(){phase1BindInsightsBeforeOverride();document.querySelectorAll('[data-insights]').forEach(button=>button.onclick=()=>{state.page='insights';state.insightTab='sales';state.range='Last 7 days';state.filterSheet=false;render()});document.querySelectorAll('[data-phase1-booking-mode]').forEach(button=>button.onclick=()=>{state.phase1BookingMode=button.dataset.phase1BookingMode;render()});document.querySelectorAll('[data-phase1-listing-metric]').forEach(button=>button.onclick=()=>{state.phase1ListingMetric=button.dataset.phase1ListingMetric;render()});document.querySelectorAll('[data-phase1-sales-bar]').forEach(button=>button.onclick=()=>toast(button.dataset.phase1SalesBar));document.querySelectorAll('[data-phase1-payment-toggle]').forEach(button=>button.onclick=()=>{state.phase1PaymentExpanded=state.phase1PaymentExpanded!==true;render()})};
const phase1ShellSurfaceBefore=shell3;
shell3=function(content){const html=phase1ShellSurfaceBefore(content);return content.includes('phase1-insights-page')?html.replace('<main class="page">','<main class="page phase1-page-shell" style="background:#f6f6f8">'):html};
state.range='Last 7 days';state.insightTab='sales';
render();

/* Ensure Bookings wins over the legacy page overrides above. */
view=function(){return state.page==='orders'&&state.detail?bookingsDetail():state.page==='orders'?bookingsWorkspace():state.page==='bookings'?bookingsWorkspace():state.page==='dashboard'?dashboard17():state.page==='insights'?insightsPageForView():state.page==='staff-listings'?staffListingsView():state.page==='chat'?chatView():state.page==='listings'?listingsClean():state.page==='services'?servicesClean():state.page==='earnings'?earningsClean():state.page==='menu'?menuView():state.page==='profile'?profileView():dashboard17()};
const renderLegacyFinal=render;
render=function(){renderLegacyFinal();if(state.page==='orders'||state.page==='bookings'){document.querySelector('#app')?.insertAdjacentHTML('beforeend',bookingFilterSheet()+bookingDeclineModal());bindBookingsFinal();}};
const latestRevisionKey='cabana:latest-revision';
const latestRevision='bookings-refined-v2';
try {
  if(localStorage.getItem(latestRevisionKey)!==latestRevision){
    state.page='orders';
    state.detail=null;
    state.bookingTab='Requests';
    localStorage.setItem(latestRevisionKey,latestRevision);
  }
} catch (error) {
  state.page='orders';
  state.detail=null;
  state.bookingTab='Requests';
}
render();

/* Keep Staff focused on today and tomorrow, with transport workflow actions. */
dashboardOperationalStaffQueue=function(){const queue=orders.filter(order=>bookingActive(order)&&order.kind!=='Counter charge').slice().sort((a,b)=>String(a.when).localeCompare(String(b.when))),groups=['In progress','Today','Tomorrow'].map(group=>{const rows=queue.filter(order=>dashboardOperationalGroup(order)===group);if(!rows.length)return '';return '<section class="dashboard-booking-group"><h3>'+group+'</h3>'+rows.map(order=>{const action=order.status==='In progress'?'complete':'start',label=action==='complete'?'Complete':'Start';return '<div class="dashboard-staff-row"><div><strong>'+dashboardOperationalWhen(order)+'</strong><span>'+esc(order.item)+'</span><small>'+esc(order.guest)+(order.room?' · Room '+esc(order.room):'')+' · '+esc(order.quantity)+'</small></div><span class="dashboard-booking-status '+dashboardOperationalStatus(order).toLowerCase().replaceAll(' ','-')+'">'+dashboardOperationalStatus(order)+'</span><button data-dashboard-queue-action="'+action+'" data-dashboard-queue-id="'+esc(order.id)+'">'+label+'</button></div>'}).join('')+'</section>'}).join('');return '<section class="dashboard-operational-section dashboard-staff-queue"><div class="dashboard-operational-heading"><div><h2>Today’s queue</h2><span>Confirmed and ongoing bookings</span></div><button class="dashboard-inline-link" data-page="orders">View bookings '+icons.arrow+'</button></div>'+(groups||'<div class="dashboard-operational-empty">No bookings scheduled for today.</div>')+'</section>'};

/* Bookings keeps workflow tabs separate from a compact List / Calendar control. */
bookingsWorkspace=function(){const tab=state.bookingTab||'Requests',pending=orders.filter(o=>o.status==='Pending').length,records=bookingRecords(),calendar=state.orderView==='calendar';const chips=Object.entries(state.bookingFilters||{}).filter(([k,v])=>v&&v!=='All'&&v!=='All dates'&&v!=='All listings').map(([k,v])=>'<button class="booking-chip" data-booking-chip="'+k+'">'+esc(v)+' ×</button>').join('');let body='';if(calendar){const scheduled=orders.filter(o=>bookingActive(o)&&o.kind!=='Counter charge').slice().sort((a,b)=>String(a.when).localeCompare(String(b.when)));body='<section class="transport-calendar-panel"><p>Scheduled transfers and rental periods</p>'+(['Oct 6','Oct 7','Oct 8','Oct 9','Oct 10','Oct 11','Oct 12'].map(day=>{const rows=scheduled.filter(o=>String(o.when).includes(day));return '<button class="transport-calendar-day" data-order-calendar-date="'+day+'"><strong>'+day+'</strong><span>'+rows.length+' '+(rows.length===1?'booking':'bookings')+'</span></button>'}).join(''))+'</section>'+(scheduled.length?'<section class="booking-group"><h2>Scheduled bookings</h2>'+scheduled.map(bookingCard).join('')+'</section>':'<div class="bookings-empty"><strong>No scheduled bookings for this date.</strong></div>')}else{const filtered=bookingRecords();if(tab==='Active')filtered.sort((a,b)=>String(a.when).localeCompare(String(b.when)));const groups={};filtered.forEach(o=>{const key=tab==='Requests'?'Awaiting your decision':tab==='Past'?'Past bookings':dashboardOperationalGroup(o);(groups[key]||(groups[key]=[])).push(o)});body=Object.entries(groups).map(([g,rows])=>'<section class="booking-group"><h2>'+g+'</h2>'+rows.map(bookingCard).join('')+'</section>').join('')||'<div class="bookings-empty"><strong>'+(tab==='Requests'?'No requests waiting for confirmation.':tab==='Active'?'No active bookings.':'No past bookings yet.')+'</strong><span>Try changing your search or filters.</span></div>'}return '<div class="bookings-workspace"><header class="dashboard-operational-header booking-page-header"><h1>Bookings</h1><button class="dashboard-header-icon" data-toast="No new notifications" aria-label="Notifications"><i class="hgi-stroke hgi-notification-03" aria-hidden="true"></i>'+(pending?'<b>'+pending+'</b>':'')+'</button></header><nav class="bookings-tabs" role="tablist">'+['Requests','Active','Past'].map(x=>'<button class="'+(tab===x?'active':'')+'" data-booking-tab="'+x+'">'+x+(x==='Requests'&&pending?'<b>'+pending+'</b>':'')+'</button>').join('')+'</nav><div class="bookings-tools"><div class="bookings-search"><i class="hgi-stroke hgi-search-01"></i><input data-booking-search value="'+esc(state.bookingQuery||'')+'" placeholder="Search guest, room, or booking ID." aria-label="Search guest, room, or booking ID."></div><button class="booking-filter-trigger" data-booking-filter-open><i class="hgi-stroke hgi-filter-horizontal"></i><span>Filter</span></button><select class="booking-view-select" data-booking-view-select aria-label="Booking view"><option value="list" '+(!calendar?'selected':'')+'>List view</option><option value="calendar" '+(calendar?'selected':'')+'>Calendar view</option></select></div>'+(chips?'<div class="booking-chips">'+chips+'</div>':'')+body+'</div>'};

const transportBindFinal=bindBookingsFinal;
bindBookingsFinal=function(){transportBindFinal();document.querySelectorAll('[data-booking-view-select]').forEach(select=>select.onchange=event=>{state.orderView=event.target.value==='calendar'?'calendar':'list';state.detail=null;render()});document.querySelectorAll('[data-dashboard-queue-action]').forEach(button=>button.onclick=()=>{const order=orders.find(item=>item.id===button.dataset.dashboardQueueId);if(!order)return;order.status=button.dataset.dashboardQueueAction==='start'?'In progress':'Completed';toast('Booking updated');render()})};

/* Dashboard section links use the same compact label and align with their headings. */
const dashboardOperationalUpcomingFinal=dashboardOperationalUpcoming;
dashboardOperationalUpcoming=function(){
  const upcoming=orders.filter(order=>bookingActive(order)&&order.kind!=='Counter charge').slice().sort((a,b)=>{
    const aNow=['In progress','In use'].includes(a.status),bNow=['In progress','In use'].includes(b.status);
    if(aNow!==bNow)return aNow?-1:1;
    const aDate=dashboardOperationalOrderDate(a),bDate=dashboardOperationalOrderDate(b);
    return (aDate?aDate.getTime():Infinity)-(bDate?bDate.getTime():Infinity)||String(a.when||'').localeCompare(String(b.when||''));
  });
  const cards=upcoming.slice(0,3).map(order=>dashboardOperationalBookingRow(order,dashboardOperationalGroup(order))).join('');
  return '<section class="dashboard-operational-section dashboard-upcoming-section"><div class="dashboard-operational-heading"><div><h2>Upcoming bookings</h2></div><button class="dashboard-inline-link" data-open-active-bookings>View all '+icons.arrow+'</button></div>'+(cards?'<div class="dashboard-booking-list">'+cards+'</div>':'<div class="dashboard-operational-empty">No upcoming bookings.</div>')+'</section>';
};
const dashboardUpcomingActiveLinkRenderBase=render;
render=function(){
  dashboardUpcomingActiveLinkRenderBase();
  document.querySelectorAll('[data-open-active-bookings]').forEach(button=>button.onclick=()=>{state.page='orders';state.bookingTab='Active';state.detail=null;render()});
};
const dashboardOperationalReceivablesFinal=dashboardOperationalReceivables;
dashboardOperationalReceivables=function(){return dashboardOperationalReceivablesFinal().replace('View earnings','View All')};

/* Activate the transport dataset after all legacy route overrides have loaded. */
try{localStorage.setItem('cabana:latest-revision','transport-rental-v1')}catch(error){}
state.page='dashboard';state.detail=null;state.bookingTab='Requests';state.orderView='list';state.range='Today';
const transportFinalRenderBefore=render;
render=function(){transportFinalRenderBefore();document.querySelectorAll('#app *').forEach(node=>{if(node.children.length===0&&node.textContent.includes('Sans Rival Bakehouse'))node.textContent=node.textContent.replaceAll('Sans Rival Bakehouse','Lakbay Negros Rentals');if(node.children.length===0&&node.textContent.includes('Bakery · Live'))node.textContent=node.textContent.replaceAll('Bakery · Live','Transportation rental service · Live')});bindDashboardOperational()};
render();

/* Latest revision activation: Insights → Bookings must be the visible page. */
state.page=state.page==='insights'?'dashboard':state.page;
insightsPageForView=function(){return phase1InsightsPage()};
const renderInsightsBookingsLast=render;
render=function(){renderInsightsBookingsLast();if(state.page==='insights'){document.querySelectorAll('[data-phase1-booking-mode]').forEach(button=>button.onclick=()=>{state.phase1BookingMode=button.dataset.phase1BookingMode;render()});document.querySelectorAll('[data-insight-tab]').forEach(button=>button.onclick=()=>{state.insightTab=button.dataset.insightTab;render()});}};
render();

/* Home keeps pending requests visible and lets the vendor choose the queue order. */
const homePendingBase=dashboardOperationalPending;
const homePendingStamp=order=>{const raw=String(order.timeline?.[0]?.[1]||'').replace(' · ',' '),parsed=Date.parse(raw);return Number.isFinite(parsed)?parsed:0};
dashboardOperationalPending=function(){const mode=state.dashboardPendingSort||'oldest',rows=homePendingBase().slice();return rows.sort((a,b)=>mode==='newest'?homePendingStamp(b)-homePendingStamp(a):mode==='expiring'?Number(a.responseMinutes||Infinity)-Number(b.responseMinutes||Infinity):homePendingStamp(a)-homePendingStamp(b))};
dashboardOperationalRequestSection=function(){const pending=dashboardOperationalPending(),mode=state.dashboardPendingSort||'oldest';return '<section class="dashboard-operational-section dashboard-requests-section"><div class="dashboard-operational-heading dashboard-pending-heading"><h2>Pending Requests <b>'+pending.length+'</b></h2><label class="dashboard-pending-sort"><span>Sort</span><select data-dashboard-pending-sort aria-label="Sort pending requests"><option value="oldest" '+(mode==='oldest'?'selected':'')+'>Oldest first</option><option value="newest" '+(mode==='newest'?'selected':'')+'>Newest first</option><option value="expiring" '+(mode==='expiring'?'selected':'')+'>Expiring soon</option></select></label></div>'+(pending.length?'<div class="dashboard-request-list">'+pending.map(dashboardOperationalRequestCard).join('')+'</div>':'<div class="dashboard-operational-empty">No bookings waiting for confirmation.</div>')+'</section>'};
const dashboardOperationalMarkupHomeBase=dashboardOperationalMarkup;
dashboardOperationalMarkup=function(){return dashboardOperationalMarkupHomeBase().replace('<h1>Dashboard</h1>','<h1>Home</h1>')};
state.dashboardPendingSort=state.dashboardPendingSort||'oldest';
try{state.dashboardPendingSort=localStorage.getItem('cabana:home-pending-sort')||state.dashboardPendingSort}catch(error){}
const renderHomeFinal=render;
render=function(){renderHomeFinal();if(state.page==='dashboard'){document.querySelectorAll('[data-dashboard-pending-sort]').forEach(select=>select.onchange=()=>{state.dashboardPendingSort=select.value;try{localStorage.setItem('cabana:home-pending-sort',select.value)}catch(error){}render()});document.querySelectorAll('.dashboard-operational-header h1').forEach(node=>{if(node.textContent.trim()==='Dashboard')node.textContent='Home'});document.querySelectorAll('.nav-item > span:not(.nav-icon)').forEach(node=>{if(node.textContent.trim()==='Dashboard')node.textContent='Home'});document.querySelectorAll('.topbar-context strong').forEach(node=>{if(node.textContent.trim()==='Dashboard')node.textContent='Home'})}};
state.page='dashboard';state.detail=null;state.bookingTab='Requests';state.orderView='list';state.range='Today';try{localStorage.setItem('cabana:latest-revision','home-pending-requests-v1')}catch(error){}
render();

/* Keep the renamed Home route label consistent in the floating navigation everywhere. */
const renderHomeNavLabelFinal=render;
render=function(){renderHomeNavLabelFinal();document.querySelectorAll('.nav-item > span:not(.nav-icon), .topbar-context strong').forEach(node=>{if(node.textContent.trim()==='Dashboard')node.textContent='Home'});document.querySelectorAll('[aria-label]').forEach(node=>{const label=node.getAttribute('aria-label');if(label&&label.includes('Dashboard'))node.setAttribute('aria-label',label.replaceAll('Dashboard','Home'))})};
render();

/* Open pending-request sorting in a mobile bottom sheet instead of the native select menu. */
const pendingSortLabel=mode=>mode==='newest'?'Newest first':mode==='expiring'?'Expiring soon':'Oldest first';
const pendingSortSheetMarkup=()=>{if(!state.dashboardPendingSortSheet)return '';const mode=state.dashboardPendingSort||'oldest';return '<div class="dashboard-sort-backdrop" data-dashboard-pending-sort-close></div><section class="dashboard-sort-sheet" role="dialog" aria-modal="true" aria-label="Sort pending requests"><div class="sheet-handle"></div><header><div><h2>Sort pending requests</h2><span>Choose how requests are ordered</span></div><button data-dashboard-pending-sort-close aria-label="Close sort options">×</button></header><div class="dashboard-sort-options"><button class="'+(mode==='oldest'?'active':'')+'" data-dashboard-pending-sort-option="oldest"><span>Oldest first</span>'+(mode==='oldest'?'<b>✓</b>':'')+'</button><button class="'+(mode==='newest'?'active':'')+'" data-dashboard-pending-sort-option="newest"><span>Newest first</span>'+(mode==='newest'?'<b>✓</b>':'')+'</button><button class="'+(mode==='expiring'?'active':'')+'" data-dashboard-pending-sort-option="expiring"><span>Expiring soon</span>'+(mode==='expiring'?'<b>✓</b>':'')+'</button></div></section>'};
dashboardOperationalRequestSection=function(){const pending=dashboardOperationalPending(),mode=state.dashboardPendingSort||'oldest';return '<section class="dashboard-operational-section dashboard-requests-section"><div class="dashboard-operational-heading dashboard-pending-heading"><h2>Pending Requests <b>'+pending.length+'</b></h2><button class="dashboard-pending-sort" type="button" data-dashboard-pending-sort-open aria-haspopup="dialog" aria-expanded="'+(state.dashboardPendingSortSheet?'true':'false')+'"><span>Sort</span><strong>'+pendingSortLabel(mode)+'</strong><i aria-hidden="true">⌄</i></button></div>'+(pending.length?'<div class="dashboard-request-list">'+pending.map(dashboardOperationalRequestCard).join('')+'</div>':'<div class="dashboard-operational-empty">No bookings waiting for confirmation.</div>')+'</section>'+pendingSortSheetMarkup()};
const renderHomeSortSheetFinal=render;
render=function(){renderHomeSortSheetFinal();if(state.page==='dashboard'){document.querySelectorAll('[data-dashboard-pending-sort-open]').forEach(button=>button.onclick=()=>{state.dashboardPendingSortSheet=true;render()});document.querySelectorAll('[data-dashboard-pending-sort-close]').forEach(button=>button.onclick=()=>{state.dashboardPendingSortSheet=false;render()});document.querySelectorAll('[data-dashboard-pending-sort-option]').forEach(button=>button.onclick=()=>{state.dashboardPendingSort=button.dataset.dashboardPendingSortOption;state.dashboardPendingSortSheet=false;try{localStorage.setItem('cabana:home-pending-sort',state.dashboardPendingSort)}catch(error){}render()})}};
state.dashboardPendingSortSheet=false;
render();

/* Final Home queue rule: expose only the requested two sort modes. */
const pendingSortLabelFixed=mode=>mode==='booking-date'?'Booking date':mode==='newest'?'Newest first':'Expiring soon';
const pendingSortSheetMarkupFixed=()=>{if(!state.dashboardPendingSortSheet)return '';const mode=['expiring','booking-date','newest'].includes(state.dashboardPendingSort)?state.dashboardPendingSort:'expiring',option=(value,label)=>'<button class="'+(mode===value?'active':'')+'" data-dashboard-pending-sort-option="'+value+'"><span class="dashboard-sort-radio" aria-hidden="true">'+(mode===value?'●':'')+'</span><span class="dashboard-sort-label">'+label+'</span></button>';return '<div class="dashboard-sort-backdrop" data-dashboard-pending-sort-close></div><section class="dashboard-sort-sheet" role="dialog" aria-modal="true" aria-label="Sort pending requests"><div class="sheet-handle"></div><header><div><h2>Sort pending requests</h2><span>Choose how requests are ordered</span></div><button data-dashboard-pending-sort-close aria-label="Close sort options">×</button></header><div class="dashboard-sort-options">'+option('expiring','Expiring soon')+option('booking-date','Booking date')+option('newest','Newest first')+'</div></section>'};
state.dashboardPendingSort='expiring';
dashboardOperationalPending=function(){
  const mode=['expiring','booking-date','newest'].includes(state.dashboardPendingSort)?state.dashboardPendingSort:'expiring';
  return homePendingBase().filter(order=>dashboardPendingDisplayIds.has(order.id)).slice().sort((a,b)=>{
    if(mode==='booking-date'){
      const aDate=dashboardOperationalOrderDate(a)?.getTime?.()??Infinity,bDate=dashboardOperationalOrderDate(b)?.getTime?.()??Infinity;
      return aDate-bDate||Number(a.responseMinutes||Infinity)-Number(b.responseMinutes||Infinity);
    }
    if(mode==='newest')return homePendingStamp(b)-homePendingStamp(a)||Number(a.responseMinutes||Infinity)-Number(b.responseMinutes||Infinity);
    return dashboardRequestPlacedStamp(a)-dashboardRequestPlacedStamp(b)||homePendingStamp(a)-homePendingStamp(b);
  });
};
dashboardOperationalRequestSection=function(){
  const pending=dashboardOperationalPending(),mode=['expiring','booking-date','newest'].includes(state.dashboardPendingSort)?state.dashboardPendingSort:'expiring';
  return '<section class="dashboard-operational-section dashboard-requests-section"><div class="dashboard-operational-heading dashboard-pending-heading"><h2>Pending Requests <b>'+pending.length+'</b></h2><button class="dashboard-pending-sort" type="button" data-dashboard-pending-sort-open aria-haspopup="dialog" aria-expanded="'+(state.dashboardPendingSortSheet?'true':'false')+'"><span>Sort</span><strong>'+pendingSortLabelFixed(mode)+'</strong><i aria-hidden="true">⌄</i></button></div>'+(pending.length?'<div class="dashboard-request-list">'+pending.map(dashboardOperationalRequestCard).join('')+'</div>':'<div class="dashboard-operational-empty">No bookings waiting for confirmation.</div>')+'</section>'+pendingSortSheetMarkupFixed();
};

/* Activate latest main Bookings route after every legacy override. */
state.page='orders';state.detail=null;state.bookingTab='Active';state.orderView='list';
const bookingsDetailBeforeFinalRoute=bookingsDetail;
bookingsDetail=function(){const extra=bookingPastExtras.find(item=>item.id===state.detail);if(extra){orders.push(extra);const html=bookingsDetailBeforeFinalRoute();orders.pop();return html}return bookingsDetailBeforeFinalRoute()};
view=function(){return state.page==='orders'&&state.detail?bookingsDetail():state.page==='orders'?bookingsWorkspaceFinal():state.page==='bookings'?bookingsWorkspaceFinal():state.page==='dashboard'?dashboard17():state.page==='insights'?insightsPageForView():state.page==='staff-listings'?staffListingsView():state.page==='chat'?chatView():state.page==='listings'?listingsClean():state.page==='services'?servicesClean():state.page==='earnings'?earningsClean():state.page==='menu'?menuView():state.page==='profile'?profileView():dashboard17()};
const latestMainBookingsRender=render;
render=function(){latestMainBookingsRender();if(state.page==='orders'){document.querySelector('#app')?.insertAdjacentHTML('beforeend',bookingFinalFilterSheet());document.querySelectorAll('[data-booking-tab]').forEach(b=>b.onclick=()=>{state.bookingTab=b.dataset.bookingTab;render()});document.querySelectorAll('[data-booking-filter-open]').forEach(b=>b.onclick=()=>{state.bookingFilterOpen=true;render()});document.querySelectorAll('[data-booking-filter-close]').forEach(b=>b.onclick=()=>{state.bookingFilterOpen=false;render()});document.querySelectorAll('[data-booking-filter-choice]').forEach(b=>b.onclick=()=>{state.bookingFilters[b.dataset.bookingFilterChoice]=b.dataset.bookingFilterValue;render()});document.querySelectorAll('[data-booking-filter-reset]').forEach(b=>b.onclick=()=>{state.bookingFilters={date:'All dates',type:'All',listing:'All listings'};render()});document.querySelectorAll('[data-booking-filter-apply]').forEach(b=>b.onclick=()=>{state.bookingFilterOpen=false;render()});document.querySelectorAll('[data-booking-chip]').forEach(b=>b.onclick=()=>{const k=b.dataset.bookingChip;state.bookingFilters[k]=k==='date'?'All dates':k==='listing'?'All listings':'All';render()});document.querySelectorAll('[data-booking-search]').forEach(s=>s.oninput=e=>{state.bookingQuery=e.target.value;render()});document.querySelectorAll('[data-booking-detail]').forEach(b=>b.onclick=()=>{state.detail=b.dataset.bookingDetail;render()});document.querySelectorAll('[data-booking-export]').forEach(b=>b.onclick=()=>toast('Filtered bookings CSV prepared'));document.querySelectorAll('[data-final-header-qr]').forEach(b=>b.onclick=()=>toast('Validation flow opened'));document.querySelectorAll('[data-final-booking-action]').forEach(b=>b.onclick=e=>{e.stopPropagation();const o=bookingFinalRecords().find(x=>x.id===b.dataset.finalBookingId);if(!o)return;if(b.dataset.finalBookingAction==='ready')o.status='Ready';if(b.dataset.finalBookingAction==='complete')o.status='Completed';if(b.dataset.finalBookingAction==='qr'){if(o.qrValidated)toast('Booking already checked in');else{o.qrValidated=true;o.status='Checked in';toast('Booking validated. Check-in recorded.')}}render()})}};

/* Owner receivables explain the money movement from guest checkout to hotel payment. */
const outstandingReceivablesMoney=value=>{const formatted=earningsMoney(value);return formatted.endsWith('.00')?formatted.slice(0,-3):formatted};
dashboardOperationalReceivables=function(){if(state.role!=='Owner')return '';const ledger=typeof cabanaEarningsTransactions!=='undefined'?cabanaEarningsTransactions:[],rows=ledger.filter(item=>item.method==='Room charge'&&['Awaiting guest checkout','Awaiting settlement'].includes(item.status)),total=rows.reduce((sum,item)=>sum+earningsTransactionNet(item),0),served=dashboardOperationalTodayServed(),checkout=rows.filter(item=>item.status==='Awaiting guest checkout').reduce((sum,item)=>sum+earningsTransactionNet(item),0),settlement=rows.filter(item=>item.status==='Awaiting settlement').reduce((sum,item)=>sum+earningsTransactionNet(item),0);return '<section class="dashboard-operational-section dashboard-receivables"><div class="dashboard-receivable-header"><div><h2>Receivables</h2></div><button class="dashboard-inline-link" data-page="earnings">View earnings '+icons.arrow+'</button></div><div class="dashboard-receivable-metrics hr-totals"><div><span>Received</span><strong>'+outstandingReceivablesMoney(window.cabanaReceivedTotal?window.cabanaReceivedTotal('Last 30 days'):0)+'</strong><small>Last 30 days</small></div><div><span>To receive</span><strong>'+outstandingReceivablesMoney(total)+'</strong><small>Unpaid room charges</small></div></div><div class="dashboard-receivable-metrics"><div><span>Guests still staying</span><strong>'+outstandingReceivablesMoney(checkout)+'</strong><small>Paid after checkout</small></div><div><span>Hotel to pay you</span><strong>'+outstandingReceivablesMoney(settlement)+'</strong><small>Guests have checked out</small></div></div><div class="dashboard-receivable-footer"><span>From <strong>'+served+'</strong> bookings</span></div></section>'};
render();
const outstandingReceivablesViewAllBase=dashboardOperationalReceivables;
dashboardOperationalReceivables=function(){return outstandingReceivablesViewAllBase().replace('View earnings','View All')};
render();

/* Show the existing booking reference on compact pending-request cards as well. */
const dashboardRequestCardWithReferenceBase=dashboardOperationalRequestCard;
dashboardOperationalRequestCard=function(order){
  return dashboardRequestCardWithReferenceBase(order).replace('</div><p>','</div><small class="dashboard-request-reference">#'+esc(order.id)+'</small><p>');
};

/* Keep the existing booking reference visible in pending-request details only. */
const bookingsDetailWithReferenceBase=bookingsDetail;
bookingsDetail=function(){
  const o=orders.find(x=>x.id===state.detail);
  if(!o)return bookingsDetailWithReferenceBase();
  const html=bookingsDetailWithReferenceBase();
  if(o.status!=='Pending')return html;
  const reference='<div class="booking-reference"><span>Booking #'+esc(o.id)+'</span><button class="booking-reference-copy" type="button" data-copy-booking-reference="'+esc(o.id)+'" aria-label="Copy booking number '+esc(o.id)+'"><i class="hgi-stroke hgi-copy-01" aria-hidden="true"></i></button></div>';
  return html.replace('<span class="booking-type">'+bookingType(o)+' · '+o.id+'</span>','<span class="booking-type">'+bookingType(o)+'</span>').replace('<p>'+esc(o.status)+'</p>','<p>'+esc(o.status)+'</p>'+reference);
};
view=function(){return state.page==='orders'&&state.detail?bookingsDetail():state.page==='orders'?bookingsWorkspaceFinal():state.page==='bookings'?bookingsWorkspaceFinal():state.page==='dashboard'?dashboard17():state.page==='insights'?insightsPageForView():state.page==='staff-listings'?staffListingsView():state.page==='chat'?chatView():state.page==='listings'?listingsClean():state.page==='services'?servicesClean():state.page==='earnings'?earningsClean():state.page==='menu'?menuView():state.page==='profile'?profileView():dashboard17()};
const renderWithBookingReference=render;
render=function(){
  renderWithBookingReference();
  document.querySelectorAll('[data-copy-booking-reference]').forEach(button=>button.onclick=async event=>{
    event.stopPropagation();
    const reference=button.dataset.copyBookingReference;
    try{
      await navigator.clipboard.writeText(reference);
    }catch(error){
      const fallback=document.createElement('textarea');
      fallback.value=reference;
      fallback.setAttribute('readonly','');
      fallback.style.position='fixed';
      fallback.style.opacity='0';
      document.body.append(fallback);
      fallback.select();
      document.execCommand('copy');
      fallback.remove();
    }
    toast('Booking number copied');
  });
};
render();

/* Final Home request card presentation after all legacy route layers. */
dashboardOperationalRequestCard=function(order){
  const isNew=(state.dashboardNewPendingRequests||[]).includes(order.id)&&!(state.dashboardSeenRequests||[]).includes(order.id),processing=state.dashboardRequestProcessing===order.id;
  const newPill=isNew?'<span class="dashboard-request-new-pill">New</span>':'';
  const guestRoom=[order.guest,order.hotel,order.room?'Room '+order.room:''].filter(Boolean).join(' · '),financial=[order.total,order.payment].filter(Boolean).join(' · ');
  const deadline=dashboardOperationalDeadline(order);
  return '<article class="dashboard-request-card '+(isNew?'unseen':'seen')+'"><button class="dashboard-request-main" data-dashboard-request-view="'+esc(order.id)+'"><div class="dashboard-request-reference-row"><small>#'+esc(displayBookingReference(order.id))+'</small>'+newPill+'</div><div class="dashboard-request-title-row"><h3>'+esc(order.item)+'</h3></div><p>'+esc(dashboardOperationalRequestSummary(order))+'</p>'+(guestRoom?'<small class="dashboard-request-guest-room">'+esc(guestRoom)+'</small>':'')+(financial?'<small class="dashboard-request-financial">'+esc(financial)+'</small>':'')+'<strong class="dashboard-request-deadline '+(dashboardPendingResponseMinutes(order)<=30?'urgent':'')+'">'+deadline+'</strong></button><div class="dashboard-request-footer"><div class="dashboard-request-actions"><button class="secondary" '+(processing?'disabled':'')+' data-dashboard-request-action="decline" data-dashboard-request-id="'+esc(order.id)+'">Decline</button><button '+(processing?'disabled':'')+' data-dashboard-request-action="confirm" data-dashboard-request-id="'+esc(order.id)+'">'+(processing?'Processing…':'Confirm')+'</button></div></div></article>';
};
state.page='dashboard';state.detail=null;state.bookingTab='Requests';
render();

/* Final pending-request detail page after all legacy route layers. */
bookingsDetail=function(){
  const record=orders.find(x=>x.id===state.detail)||((typeof bookingPastExtras!=='undefined')?bookingPastExtras.find(x=>x.id===state.detail):null);
  if(!record)return bookingsWorkspaceFinal();
  const owner=state.role==='Owner',statusClass=String(record.status||'').toLowerCase().replaceAll(' ','-');
  const quantity=String(record.quantity||'—'),quantityLabel=/passenger|pax|guest/i.test(quantity)?'Passengers':/vehicle|scooter|sedan|van/i.test(quantity+' '+record.item)?'Vehicles':'Quantity';
  const quantityParts=quantity.split(' · '),passengerPart=quantityParts.find(part=>/passenger|pax|guest/i.test(part))||'',vehiclePart=quantityParts.find(part=>/vehicle|scooter|sedan|van/i.test(part))||'',baggage=quantityParts.find(part=>/suitcase|bag/i.test(part))||'',quantityValue=vehiclePart||passengerPart||quantityParts[0]||'—';
  const fulfilment=String(record.fulfilment||''),pickupMatch=fulfilment.match(/^Pickup(?:\s+and\s+return)?:\s*(.*?)(?:\s*·\s*Destination:\s*(.+))?$/i),pickupLocation=pickupMatch?pickupMatch[1]:fulfilment.replace(/^Pickup and return:\s*/i,''),destination=pickupMatch&&pickupMatch[2]?pickupMatch[2]:'';
  const placed=record.timeline&&record.timeline[0]?record.timeline[0][1]:'—',placedLabel=String(placed).replace(' · ', ', '),isRental=/rental|vehicle/i.test(record.item+' '+quantity),isTransport=/transfer|sedan|van|scooter/i.test(record.item),paymentType=/room/i.test(String(record.payment||''))?'Charged to room':'Pay via QR';
  const detailField=(label,value,emphasis=false)=>'<div class="booking-request-field"><span>'+label+'</span><strong class="'+(emphasis?'emphasis':'')+'">'+value+'</strong></div>';
  const bookingRows=[detailField(isRental?'Rental period':isTransport?'Service schedule':'Schedule',esc(record.when),true),detailField(vehiclePart?'Vehicles':quantityLabel,esc(quantityValue))];
  if(vehiclePart&&passengerPart)bookingRows.push(detailField('Passengers',esc(passengerPart)));
  if(baggage)bookingRows.push(detailField('Baggage',esc(baggage)));
  if(pickupLocation)bookingRows.push(detailField(isRental?'Pickup & return':'Pickup location',esc(pickupLocation)));
  if(destination)bookingRows.push(detailField('Drop-off',esc(destination)));
  const guestNote=record.notes?'<div class="booking-request-note"><span>Guest note</span><p>'+esc(record.notes)+'</p></div>':'';
  const messageLink='<button class="booking-message-link" type="button" data-detail-action="message">Message guest</button>';
  const actionBar=record.status==='Pending'?'<div class="booking-request-action-bar"><button class="button pending-detail-decline" data-detail-action="decline">Decline</button><button class="button primary" data-detail-action="confirm">Confirm</button></div>':bookingActive(record)?'<div class="booking-request-action-bar booking-request-action-bar-active"><button class="button primary" data-detail-action="status">Update status</button>'+(record.kind==='Booking'?'<button class="button" data-detail-action="qr">Scan QR</button>':'')+(owner?'<button class="button" data-detail-action="charge">Add charge / add-on</button>':'')+'</div>':'';
  return '<div class="booking-detail-view booking-request-detail-view"><div class="booking-request-detail-header"><button class="booking-back booking-header-back" data-booking-back aria-label="Back to Bookings">←</button><span class="booking-breadcrumb">#'+esc(record.id)+'</span></div><section class="booking-request-section"><div class="booking-request-section-heading"><h2>Request</h2><span class="booking-status '+statusClass+'">'+esc(record.status)+'</span></div><div class="booking-request-summary"><strong>'+esc(record.item)+'</strong></div><div class="booking-request-deadline-row"><span>Time left to confirm</span><strong>'+esc(record.status==='Pending'?dashboardOperationalDeadline(record):'Confirmation complete')+'</strong></div><div class="booking-request-divider"></div><div class="booking-request-field booking-number-field"><span>Booking number</span><strong>#'+esc(record.id)+'<button class="booking-reference-copy booking-detail-copy" type="button" data-copy-booking-reference="'+esc(record.id)+'" aria-label="Copy booking number '+esc(record.id)+'"><i class="hgi-stroke hgi-copy-01" aria-hidden="true"></i></button></strong></div>'+detailField('Request date',esc(placedLabel),true)+'</section><section class="booking-request-section"><h2>Booking details</h2>'+bookingRows.join('')+'</section><section class="booking-request-section"><h2>Guest</h2>'+detailField('Guest',esc(record.guest),true)+detailField('Hotel',esc(record.hotel))+detailField('Room',esc(record.room))+detailField('Booked by',record.frontDesk?'Front Desk':'Guest')+guestNote+messageLink+'</section><section class="booking-request-section"><h2>Payment</h2>'+(owner?detailField('Amount',esc(record.total),true)+detailField('Payment type',paymentType):'<p class="booking-request-restricted">Financial details are restricted for your role.</p>')+'</section>'+actionBar+'</div>';
};
view=function(){return state.page==='orders'&&state.detail?bookingsDetail():state.page==='orders'?bookingsWorkspaceFinal():state.page==='bookings'?bookingsWorkspaceFinal():state.page==='dashboard'?dashboard17():state.page==='insights'?insightsPageForView():state.page==='staff-listings'?staffListingsView():state.page==='chat'?chatView():state.page==='listings'?listingsClean():state.page==='services'?servicesClean():state.page==='earnings'?earningsClean():state.page==='menu'?menuView():state.page==='profile'?profileView():dashboard17()};
/* Final route guard: open the decided-bookings workspace. */
state.page='orders';state.detail=null;state.bookingTab='Active';state.orderView='list';
view=function(){return state.page==='orders'&&state.detail?bookingLatestDetail():state.page==='orders'?bookingLatestWorkspace():state.page==='bookings'?bookingLatestWorkspace():state.page==='dashboard'?dashboard17():state.page==='insights'?insightsPageForView():state.page==='staff-listings'?staffListingsView():state.page==='chat'?chatView():state.page==='listings'?listingsClean():state.page==='services'?servicesClean():state.page==='earnings'?earningsClean():state.page==='menu'?menuView():state.page==='profile'?profileView():dashboard17()};
const finalBookingsRouteRender=render;
render=function(){
  if(state.page==='orders'){
    const app=document.querySelector('#app');
    if(app)app.innerHTML=shell3(state.detail?bookingLatestDetail():bookingLatestWorkspace());
    bind();
    document.querySelector('#app')?.insertAdjacentHTML('beforeend',bookingLatestFilterSheet()+bookingLatestCancelModal());
    document.querySelectorAll('[data-latest-tab]').forEach(b=>b.onclick=()=>{state.bookingTab=b.dataset.latestTab;state.detail=null;render()});document.querySelectorAll('[data-latest-filter-open]').forEach(b=>b.onclick=()=>{state.bookingFilterOpen=true;render()});document.querySelectorAll('[data-latest-filter-close]').forEach(b=>b.onclick=()=>{state.bookingFilterOpen=false;render()});document.querySelectorAll('[data-latest-filter]').forEach(b=>b.onclick=()=>{state.bookingLatestFilters[b.dataset.latestFilter]=b.dataset.latestFilterValue;render()});document.querySelectorAll('[data-latest-filter-reset]').forEach(b=>b.onclick=()=>{state.bookingLatestFilters={date:'All dates',type:'All',listing:'All listings'};render()});document.querySelectorAll('[data-latest-filter-apply]').forEach(b=>b.onclick=()=>{state.bookingFilterOpen=false;render()});document.querySelectorAll('[data-latest-chip]').forEach(b=>b.onclick=()=>{const k=b.dataset.latestChip;state.bookingLatestFilters[k]=k==='date'?'All dates':k==='listing'?'All listings':'All';render()});document.querySelectorAll('[data-latest-detail]').forEach(b=>b.onclick=()=>{state.detail=b.dataset.latestDetail;state.bookingLatestMenu=false;render()});document.querySelectorAll('[data-latest-back]').forEach(b=>b.onclick=()=>{state.detail=null;render()});document.querySelectorAll('[data-latest-action]').forEach(b=>b.onclick=e=>{e.stopPropagation();const o=bookingLatestAll().find(x=>x.id===b.dataset.latestId);if(!o)return;if(b.dataset.latestAction==='ready')o.status='Ready';if(b.dataset.latestAction==='checkin')o.status='Checked in';if(b.dataset.latestAction==='complete')o.status='Completed';render()});document.querySelectorAll('[data-latest-detail-next]').forEach(b=>b.onclick=()=>{const o=bookingLatestAll().find(x=>x.id===b.dataset.latestId);if(!o)return;if(o.status==='Confirmed'||o.status==='Scheduled')o.status=bookingLatestKind(o)==='Product'?'Ready':'Checked in';else o.status='Completed';render()});document.querySelectorAll('[data-latest-menu]').forEach(b=>b.onclick=()=>{state.bookingLatestMenu=!state.bookingLatestMenu;render()});document.querySelectorAll('[data-latest-charge]').forEach(b=>b.onclick=()=>toast('Add charge flow opened'));document.querySelectorAll('[data-latest-message]').forEach(b=>b.onclick=()=>toast('Chat thread opened'));document.querySelectorAll('[data-latest-cancel]').forEach(b=>b.onclick=()=>{state.bookingLatestCancelId=b.dataset.latestCancel;state.bookingLatestCancelReason='';render()});document.querySelectorAll('[data-latest-cancel-blocked]').forEach(b=>b.onclick=()=>toast('Contact the Front Desk to cancel.'));document.querySelectorAll('[data-latest-cancel-close]').forEach(b=>b.onclick=()=>{state.bookingLatestCancelId=null;render()});document.querySelectorAll('[data-latest-cancel-reason]').forEach(b=>b.onclick=()=>{state.bookingLatestCancelReason=b.dataset.latestCancelReason;render()});document.querySelectorAll('[data-latest-cancel-submit]').forEach(b=>b.onclick=()=>{const o=bookingLatestAll().find(x=>x.id===state.bookingLatestCancelId);if(o){o.status='Cancelled';o.cancelReason=state.bookingLatestCancelReason;bookingLatestCancelled.push(o)}state.bookingLatestCancelId=null;state.bookingLatestCancelReason='';state.bookingTab='Past';state.detail=null;render()});document.querySelectorAll('[data-latest-export]').forEach(b=>b.onclick=()=>toast('Filtered bookings CSV prepared'));const search=document.querySelector('[data-latest-search]');if(search)search.oninput=e=>{state.bookingQuery=e.target.value;render()};
  }else finalBookingsRouteRender();
};

/* Reusable request details layout: four spaced cards with a fixed decision bar. */
bookingLatestDetail=function(){
  const record=bookingLatestAll().find(item=>item.id===state.detail);
  if(!record)return bookingLatestWorkspace();
  const owner=state.role==='Owner',pending=record.status==='Pending',kind=bookingLatestKind(record);
  const status=record.status||'Pending',statusClass=status.toLowerCase().replaceAll(' ','-');
  const quantity=String(record.quantity||'—'),pickup=String(record.fulfilment||'—'),notes=record.notes||'';
  const field=(label,value,emphasis=false)=>'<div class="booking-request-field"><span>'+label+'</span><strong class="'+(emphasis?'emphasis':'')+'">'+value+'</strong></div>';
  const request='<section class="booking-request-section"><div class="booking-request-section-heading"><h2>Booking</h2><span class="booking-status '+statusClass+'">'+esc(status)+'</span></div>'+field('Listing',esc(record.item),true)+field('Status',esc(status))+field('Booking number','#'+esc(record.id))+field('Booked date',esc(record.when),true)+'</section>';
  const details='<section class="booking-request-section"><h2>Booking details</h2>'+field(/rental|transfer/i.test(record.item)?'Schedule / rental period':'Schedule',esc(record.when),true)+field(/passenger|pax/i.test(quantity)?'Quantity / pax':'Quantity',esc(quantity))+field('Pickup / meeting point',esc(pickup))+(notes?field('Notes',esc(notes)):'')+'</section>';
  const guest='<section class="booking-request-section"><h2>Guest</h2>'+field('Name',esc(record.guest),true)+field('Hotel · Room',esc(record.hotel)+' · '+esc(record.room))+field('Booked by',record.frontDesk?'Front Desk':'Guest')+(notes?'<div class="booking-request-note"><span>Guest note</span><p>'+esc(notes)+'</p></div>':'')+'<button class="booking-message-link" type="button" data-latest-message="guest">Message guest</button></section>';
  const payment='<section class="booking-request-section"><h2>Payment</h2>'+(owner?field('Amount',esc(record.total),true)+field('Payment type',esc(bookingLatestPayment(record))):'<p class="booking-request-restricted">Financial details are restricted for your role.</p>')+field('Add-ons','None')+'</section>';
  const actions=pending?'<div class="booking-request-action-bar"><button class="button pending-detail-decline" data-request-detail-action="decline" data-request-detail-id="'+esc(record.id)+'">Decline</button><button class="button primary" data-request-detail-action="confirm" data-request-detail-id="'+esc(record.id)+'">Confirm</button></div>':'';
  return '<div class="booking-detail-view latest-request-detail"><header class="latest-request-topbar"><button class="booking-back latest-request-back" data-latest-back aria-label="Back to Bookings">← Back to Bookings</button><div class="latest-request-meta"><span class="booking-type">'+esc(kind)+'</span><h1>'+esc(record.item)+'</h1><p>'+esc(status)+' · #'+esc(record.id)+'</p></div></header>'+request+details+guest+payment+actions+'</div>';
};
const requestDetailActionRenderBase=render;
render=function(){
  requestDetailActionRenderBase();
  document.querySelectorAll('[data-request-detail-action]').forEach(button=>button.onclick=event=>{
    event.stopPropagation();
    const record=bookingLatestAll().find(item=>item.id===button.dataset.requestDetailId);
    if(!record)return;
    if(button.dataset.requestDetailAction==='decline'){
      if(!window.confirm('Decline this booking request?'))return;
      record.status='Declined';
      state.bookingTab='Past';
    }else{
      record.status='Confirmed';
      state.bookingTab='Active';
    }
    state.detail=null;
    render();
  });
};
render();

/* Final booking card treatment: one full-width status action below the details. */
function bookingFinalDisplayStatus(record){
  if(['In progress','In use','Preparing','Ready','Ready for pickup','Checked in'].includes(record.status))return 'In progress';
  if(record.status==='Scheduled')return 'Confirmed';
  return record.status;
}
function bookingFinalNextAction(record){
  const status=bookingFinalDisplayStatus(record);
  if(status==='Confirmed')return 'Mark as in progress';
  if(status==='In progress')return 'Mark as completed';
  return '';
}
bookingLatestCanCancel=function(record){
  const paid=String(record.payment||'').toLowerCase().includes('paid')||String(record.settlement||'').toLowerCase().includes('paid')||record.qrValidated;
  return ['Confirmed','In progress','Ready','Ready for pickup'].includes(record.status)&&!paid&&!record.qrValidated;
};
bookingLatestCard=function(record){
  const past=state.bookingTab==='Past',status=bookingFinalDisplayStatus(record),kind=bookingLatestKind(record),next=past?'':bookingFinalNextAction(record);
  return '<article class="booking-card final-booking-card latest-booking-card"><div class="booking-card-hit" role="button" tabindex="0" data-latest-detail="'+esc(record.id)+'"><div class="booking-final-title"><div><div class="booking-listing">'+esc(record.item)+'</div><span class="booking-type">'+kind+'</span></div><span class="booking-status '+String(status||'').toLowerCase().replaceAll(' ','-')+'">'+esc(status)+'</span></div><div class="booking-reference-line">Booking #'+esc(record.id)+'</div><div class="booking-line">◷ '+esc(record.when)+'</div><div class="booking-line">♙ '+esc(record.guest)+' · '+esc(record.hotel)+' · Room '+esc(record.room)+'</div><div class="booking-line">▤ '+esc(record.quantity||'—')+' · '+bookingLatestPayment(record)+'</div>'+(record.cancelReason?'<div class="booking-line booking-cancellation-reason">Cancellation reason: '+esc(record.cancelReason)+'</div>':'')+'</div>'+(next?'<div class="booking-actions"><button class="booking-action primary" data-final-status-action="'+(next==='Mark as completed'?'complete':'progress')+'" data-final-status-id="'+esc(record.id)+'">'+next+'</button></div>':'')+'</article>';
};
bookingLatestDetail=function(){
  const record=bookingLatestAll().find(item=>item.id===state.detail);
  if(!record)return bookingLatestWorkspace();
  const owner=state.role==='Owner',past=bookingLatestPast(record),status=bookingFinalDisplayStatus(record),next=bookingFinalNextAction(record),kind=bookingLatestKind(record),canCancel=!past&&bookingLatestCanCancel(record),field=(label,value,emphasis=false)=>'<div class="booking-request-field"><span>'+label+'</span><strong class="'+(emphasis?'emphasis':'')+'">'+value+'</strong></div>';
  const bookingCard='<section class="booking-request-section"><h2>Booking</h2>'+field('Listing',esc(record.item),true)+field('Status','<span class="booking-status '+String(status||'').toLowerCase().replaceAll(' ','-')+'">'+esc(status)+'</span>')+field('Booking number','#'+esc(displayBookingReference(record.id)))+field('Booked date',esc(record.when),true)+'</section>';
  const detailsCard='<section class="booking-request-section"><h2>Booking details</h2>'+field(/rental|transfer/i.test(record.item)?'Schedule / duration':'Schedule',esc(record.when),true)+field(/passenger|pax/i.test(String(record.quantity))?'Pax / quantity':'Quantity',esc(record.quantity||'—'))+field('Pickup / meeting point',esc(record.fulfilment||'—'))+(record.notes?field('Preferences / notes',esc(record.notes)):'')+'</section>';
  const guestCard='<section class="booking-request-section"><h2>Guest</h2>'+field('Name',esc(record.guest),true)+field('Hotel · Room',esc(record.hotel)+' · '+esc(record.room))+field('Booked by',record.frontDesk?'Front Desk':'Guest')+(record.notes?'<div class="booking-request-note"><span>Guest note</span><p>'+esc(record.notes)+'</p></div>':'')+'<button class="booking-message-link" type="button" data-latest-message="guest">Message guest</button></section>';
  const paymentCard='<section class="booking-request-section"><h2>Payment</h2>'+(owner?field('Amount',esc(record.total||'—'),true):'<p class="booking-request-restricted">Financial details are restricted for your role.</p>')+field('Payment',esc(bookingLatestPayment(record)))+field('Add-ons','None')+(record.cancelReason?'<div class="booking-request-note"><span>Cancellation reason</span><p>'+esc(record.cancelReason)+'</p></div>':'')+'</section>';
  const actions=past?'':'<div class="latest-detail-actions"><button class="button primary" data-final-detail-action="'+(next==='Mark as completed'?'complete':'progress')+'" data-final-detail-id="'+esc(record.id)+'">'+next+'</button><button class="button" data-latest-menu aria-label="More booking actions">⋯</button></div>'+(state.bookingLatestMenu?'<div class="latest-action-menu"><button data-latest-charge>Add charge</button><button data-latest-message="guest">Message guest</button><button data-latest-message="front-desk">Message Front Desk</button>'+(canCancel?'<button class="danger" data-latest-cancel="'+esc(record.id)+'">Cancel booking</button>':'')+'</div>':'');
  return '<div class="booking-detail-view latest-final-detail"><button class="booking-back" data-latest-back>← Back to Bookings</button><header class="latest-detail-heading"><div><span class="booking-type">'+kind+'</span><h1>'+esc(record.item)+'</h1><p>'+esc(status)+' · #'+esc(record.id)+'</p></div></header>'+bookingCard+detailsCard+guestCard+paymentCard+actions+'</div>';
};
const finalBookingActionRenderBase=render;
setTimeout(()=>{
  const requestDetailsPassengerValue=record=>{const value=String(record.quantity||'—'),match=value.match(/\d+\s+(?:passengers?|pax)/i);return match?match[0]:value};
  const requestDetailsLocationValues=record=>{const raw=String(record.fulfilment||'—'),destination=raw.match(/Destination:\s*(.+)$/i),pickup=raw.replace(/^Pickup(?:\s+and\s+return)?:\s*/i,'').replace(/\s*·\s*Destination:.+$/i,'').trim()||'—';return {pickup,destination:destination?destination[1].trim():/rental/i.test(record.item)?'Return to pickup location':'—'}};
  bookingLatestDetail=function(){
    const record=bookingLatestAll().find(item=>item.id===state.detail);if(!record)return bookingLatestWorkspace();
    const owner=state.role==='Owner',pending=record.status==='Pending',status=record.status||'Pending',statusClass=status.toLowerCase().replaceAll(' ','-'),locations=requestDetailsLocationValues(record);
    const field=(label,value,emphasis=false,extraClass='')=>'<div class="booking-request-field '+extraClass+'"><span>'+label+'</span><strong class="'+(emphasis?'emphasis':'')+'">'+value+'</strong></div>';
    const requestCard='<section class="booking-request-section"><div class="booking-request-section-heading"><h2>Request</h2><span class="booking-status '+statusClass+'">'+esc(status)+'</span></div>'+field('Listing',esc(record.item),true)+field('Booking number','#'+esc(displayBookingReference(record.id)),true)+field('Booking date',esc(record.when),true)+'</section>';
    const detailsCard='<section class="booking-request-section"><h2>Booking Details</h2>'+field('Pickup date &amp; time',esc(record.when),true)+field('Pickup location',esc(locations.pickup))+field('Drop-off',esc(locations.destination))+field('Passengers',esc(requestDetailsPassengerValue(record)))+(record.notes?field('Note',esc(record.notes)):'')+'</section>';
    const guestCard='<section class="booking-request-section"><h2>Guest</h2>'+field('Guest',esc(record.guest),true)+field('Hotel',esc(record.hotel))+field('Room number',esc(record.room))+field('Booked by',record.frontDesk?'Front Desk':'Guest')+'<button class="booking-message-link" type="button" data-latest-message="guest"><i class="hgi-stroke hgi-chat-01" aria-hidden="true"></i><span>Message guest</span></button></section>';
    const paymentCard='<section class="booking-request-section"><h2>Payment</h2>'+(owner?field('Amount',esc(record.total||'—'),true)+field('Payment type',esc(bookingLatestPayment(record))):'<p class="booking-request-restricted">Financial details are restricted for your role.</p>')+'</section>';
    const actions=pending?'<div class="booking-request-action-bar"><button class="button pending-detail-decline" data-request-detail-action="decline" data-request-detail-id="'+esc(record.id)+'">Decline</button><button class="button primary" data-request-detail-action="confirm" data-request-detail-id="'+esc(record.id)+'">Confirm</button></div>':'';
    return '<div class="booking-detail-view latest-request-detail"><header class="latest-request-topbar latest-request-header"><button class="booking-back latest-request-back" data-latest-back aria-label="Back to Bookings">←</button><h1>Request details</h1></header>'+requestCard+detailsCard+guestCard+paymentCard+actions+'</div>';
  };
  const requestDetailsFinalRenderBase=render;
  render=function(){
    requestDetailsFinalRenderBase();
    document.querySelectorAll('[data-request-detail-action]').forEach(button=>button.onclick=event=>{
      event.stopPropagation();const record=bookingLatestAll().find(item=>item.id===button.dataset.requestDetailId);if(!record)return;
      if(button.dataset.requestDetailAction==='decline'){if(!window.confirm('Decline this booking request?'))return;record.status='Declined';state.bookingTab='Past'}else{record.status='Confirmed';state.bookingTab='Active'}
      state.detail=null;render();
    });
  };
  render();
},0);
render=function(){
  finalBookingActionRenderBase();
  document.querySelectorAll('[data-final-status-action],[data-final-detail-action]').forEach(button=>button.onclick=event=>{
    event.stopPropagation();
    const id=button.dataset.finalStatusId||button.dataset.finalDetailId,record=bookingLatestAll().find(item=>item.id===id);
    if(!record)return;
    const action=button.dataset.finalStatusAction||button.dataset.finalDetailAction;
    if(action==='complete'&&!button.dataset.confirmed){lccDialog({title:'Mark as completed?',body:'The booking moves to Past and the guest can no longer change it.',confirm:'Mark as completed',onConfirm:()=>{button.dataset.confirmed='1';button.onclick(event);delete button.dataset.confirmed}});return}
    record.status=action==='progress'?'In progress':'Completed';
    record.timeline=Array.isArray(record.timeline)?record.timeline.concat([[action==='progress'?'In progress':'Completed',todayLabel()]]):record.timeline;
    if(record.status==='Completed'){state.bookingTab='Past';state.detail=null;}
    render();
  });
};
render();

/* Final transport card surface: concise summary, status menu, and detail-only metadata. */
state.bookingCardMenuId=null;
bookingLatestCanCancel=function(record){
  return !!record && ['Pending','Confirmed','Scheduled','In progress','In use','Preparing','Ready','Ready for pickup','Checked in'].includes(record.status);
};
function bookingCardPaymentType(record){return /room/i.test(String(record.payment||''))?'Charged to room':'Paid via GCash'}
function bookingCardPaymentState(record){return /paid|posted|payout|checkout/i.test(String(record.payment||'')+' '+String(record.settlement||''))?'Paid':'Unpaid'}
bookingLatestCard=function(record){
  const past=state.bookingTab==='Past',status=bookingFinalDisplayStatus(record),next=past?'':bookingFinalNextAction(record),menu=state.bookingCardMenuId===record.id,canCancel=!past&&bookingLatestCanCancel(record);
  return '<article class="booking-card final-booking-card latest-booking-card"><div class="booking-card-hit" role="button" tabindex="0" data-latest-detail="'+esc(record.id)+'"><div class="booking-final-title"><div><div class="booking-listing">'+esc(record.item)+'</div></div><span class="booking-status '+String(status||'').toLowerCase().replaceAll(' ','-')+'">'+esc(status)+'</span><button class="booking-card-more" type="button" data-card-menu="'+esc(record.id)+'" aria-label="More booking actions">⋯</button></div><div class="booking-reference-line">Booking #'+esc(record.id)+'</div><div class="booking-line">◷ '+esc(record.when)+'</div><div class="booking-line">♙ '+esc(record.guest)+' · '+esc(record.hotel)+' · Room '+esc(record.room)+'</div></div>'+(next?'<div class="booking-actions"><button class="booking-action primary" data-final-status-action="'+(next==='Mark as completed'?'complete':'progress')+'" data-final-status-id="'+esc(record.id)+'">'+next+'</button></div>':'')+(menu?'<div class="booking-card-menu"><button data-card-charge="'+esc(record.id)+'">Add charge</button>'+(canCancel?'<button data-latest-cancel="'+esc(record.id)+'">Cancel booking</button>':'')+'</div>':'')+'</article>';
};
bookingLatestDetail=function(){
  const record=bookingLatestAll().find(item=>item.id===state.detail);
  if(!record)return bookingLatestWorkspace();
  const owner=state.role==='Owner',past=bookingLatestPast(record),status=bookingFinalDisplayStatus(record),next=bookingFinalNextAction(record),kind=bookingLatestKind(record),canCancel=!past&&bookingLatestCanCancel(record),field=(label,value,emphasis=false)=>'<div class="booking-request-field"><span>'+label+'</span><strong class="'+(emphasis?'emphasis':'')+'">'+value+'</strong></div>';
  const bookingCard='<section class="booking-request-section"><h2>Booking</h2>'+field('Listing',esc(record.item),true)+field('Status','<span class="booking-status '+String(status||'').toLowerCase().replaceAll(' ','-')+'">'+esc(status)+'</span>')+field('Booking number','#'+esc(record.id))+field('Booked date',esc(record.when),true)+'</section>';
  const detailCard='<section class="booking-request-section"><h2>Booking details</h2>'+field('Schedule / duration',esc(record.when),true)+field('Passenger / item count',esc(record.quantity||'—'))+field('Locations',esc(record.fulfilment||'—'))+(record.notes?field('Preferences / notes',esc(record.notes)):'')+'</section>';
  const guestCard='<section class="booking-request-section"><h2>Guest</h2>'+field('Guest name',esc(record.guest),true)+field('Hotel · Room',esc(record.hotel)+' · '+esc(record.room))+field('Booked by',record.frontDesk?'Front Desk':'Guest')+(record.notes?'<div class="booking-request-note"><span>Guest note</span><p>'+esc(record.notes)+'</p></div>':'')+'<button class="booking-message-link" type="button" data-latest-message="guest">Message guest</button></section>';
  const paymentCard='<section class="booking-request-section"><h2>Payment</h2>'+(owner?field('Amount',esc(record.total||'—'),true):'<p class="booking-request-restricted">Financial details are restricted for your role.</p>')+field('Payment type',bookingCardPaymentType(record))+field('Payment status',bookingCardPaymentState(record))+field('Add-ons','None')+(record.cancelReason?'<div class="booking-request-note"><span>Cancellation reason</span><p>'+esc(record.cancelReason)+'</p></div>':'')+'</section>';
  const actions=past?'':'<div class="latest-detail-actions"><button class="button primary" data-final-detail-action="'+(next==='Mark as completed'?'complete':'progress')+'" data-final-detail-id="'+esc(record.id)+'">'+next+'</button><button class="button" data-latest-menu aria-label="More booking actions">⋯</button></div>'+(state.bookingLatestMenu?'<div class="latest-action-menu"><button data-latest-charge>Add charge</button><button data-latest-message="guest">Message guest</button><button data-latest-message="front-desk">Message Front Desk</button></div>':'');
  return '<div class="booking-detail-view latest-final-detail"><button class="booking-back" data-latest-back>← Back to Bookings</button><header class="latest-detail-heading"><div><h1>'+esc(record.item)+'</h1><p>'+esc(status)+' · #'+esc(displayBookingReference(record.id))+'</p></div></header>'+bookingCard+detailCard+guestCard+paymentCard+actions+'</div>';
};
const finalTransportActionRenderBase=render;
render=function(){
  finalTransportActionRenderBase();
  document.querySelectorAll('[data-card-menu]').forEach(button=>button.onclick=event=>{event.stopPropagation();state.bookingCardMenuId=state.bookingCardMenuId===button.dataset.cardMenu?null:button.dataset.cardMenu;render()});
  document.querySelectorAll('[data-card-charge]').forEach(button=>button.onclick=event=>{event.stopPropagation();toast('Add charge flow opened')});
  document.querySelectorAll('[data-final-status-action],[data-final-detail-action]').forEach(button=>button.onclick=event=>{
    event.stopPropagation();
    const record=bookingLatestAll().find(item=>item.id===(button.dataset.finalStatusId||button.dataset.finalDetailId));
    if(!record)return;
    const action=button.dataset.finalStatusAction||button.dataset.finalDetailAction;
    if(action==='complete'&&!button.dataset.confirmed){lccDialog({title:'Mark as completed?',body:'The booking moves to Past and the guest can no longer change it.',confirm:'Mark as completed',onConfirm:()=>{button.dataset.confirmed='1';button.onclick(event);delete button.dataset.confirmed}});return}
    record.status=action==='progress'?'In progress':'Completed';
    if(record.status==='Completed'){state.bookingTab='Past';state.detail=null;}
    render();
  });
  document.querySelectorAll('[data-latest-cancel-submit]').forEach(button=>button.onclick=()=>{
    const record=bookingLatestAll().find(item=>item.id===state.bookingLatestCancelId);
    if(!record)return;
    record.status='Cancelled';record.cancelReason=state.bookingLatestCancelReason||'Other';
    state.bookingLatestCancelId=null;state.bookingLatestCancelReason='';state.bookingCardMenuId=null;state.bookingTab='Past';state.detail=null;
    toast('Guest and Front Desk notified');render();
  });
};
render();

/* Final Active examples and menu behavior for the transportation vendor view. */
const bookingPromptRecords=[
  {id:'BK-9002',kind:'Booking',guest:'Nina Garcia',hotel:'Henry’s Resort Dumaguete',room:'203',item:'Airport Transfer — Sedan',quantity:'3 passengers · 3 suitcases',when:'Oct 6 · 2:00 PM',fulfilment:'Pickup: Henry’s Resort Dumaguete lobby · Destination: NAIA Terminal 1',total:'₱1,800.00',payment:'Paid via gateway',settlement:'Paid by guest',status:'In progress',timeline:[['Booking confirmed','Oct 6 · 10:20 AM'],['In progress','Oct 6 · 1:45 PM']],notes:'Driver is en route to the hotel.'},
  {id:'BK-9003',kind:'Booking',guest:'Marco Santos',hotel:'Henry’s Resort Dumaguete',room:'508',item:'Airport Transfer — SUV',quantity:'2 passengers · 2 suitcases',when:'Oct 7 · 4:30 PM',fulfilment:'Pickup: Henry’s Resort Dumaguete lobby · Destination: Dumaguete–Sibulan Airport',total:'₱2,400.00',payment:'Charged to room',settlement:'Awaiting guest checkout',status:'Confirmed',timeline:[['Booking confirmed','Oct 6 · 10:14 AM']],notes:'Child seat requested.'}
];
const bookingPromptHiddenIds=new Set(['CB-9002']);
const bookingLatestAllBeforePrompt=bookingLatestAll;
bookingLatestAll=function(){return bookingLatestAllBeforePrompt().filter(item=>!bookingPromptHiddenIds.has(item.id)).concat(bookingPromptRecords).filter((item,index,all)=>all.findIndex(other=>other.id===item.id)===index)};
state.bookingLatestFilters={date:state.bookingLatestFilters?.date||'All dates',listing:state.bookingLatestFilters?.listing||'All listings',type:'All'};
function bookingLatestSelectedListings(){const value=(state.bookingLatestFilters||{}).listing;return Array.isArray(value)?value.filter(Boolean):value&&value!=='All listings'?[value]:[]}
function bookingLatestActiveFilterCount(){const f=state.bookingLatestFilters||{};return [f.date&&f.date!=='All dates',bookingLatestSelectedListings().length>0].filter(Boolean).length}
bookingLatestFilterSheet=function(){
  if(!state.bookingFilterOpen)return '';
  const f=state.bookingLatestFilters||{},resultCount=bookingLatestRows().length,choice=(key,values)=>'<fieldset><legend>'+key.charAt(0).toUpperCase()+key.slice(1)+'</legend>'+values.map(v=>'<button class="booking-choice '+(f[key]===v?'active':'')+'" data-latest-filter="'+key+'" data-latest-filter-value="'+esc(v)+'"><span>'+esc(v)+'</span>'+(f[key]===v?'<b>✓</b>':'')+'</button>').join('')+'</fieldset>';
  return '<div class="booking-sheet-backdrop" data-latest-filter-close></div><section class="booking-filter-sheet" role="dialog" aria-modal="true"><div class="sheet-handle"></div><header><div><h2>Filters</h2><p>Choose a fixed booking date or listing.</p></div><button data-latest-filter-close>×</button></header>'+choice('date',['All dates','Today · Oct 7','Tomorrow · Oct 8','Thu · Oct 9','Mon · Oct 13','Last 7 days'])+choice('listing',['All listings',...listings.map(x=>x.name)])+'<div class="booking-filter-actions"><button class="button ghost" data-latest-filter-reset>Reset</button><button class="button primary" data-latest-filter-apply>Show '+resultCount+' bookings</button></div></section>';
};
bookingLatestRows=function(){
  const tab=state.bookingTab==='Past'?'Past':'Active',f=state.bookingLatestFilters||{},q=(state.bookingQuery||'').toLowerCase().trim();
  return bookingLatestAll().filter(record=>{const group=bookingCalendarLabel(record),dateOk=f.date==='All dates'||f.date==='Last 7 days'||f.date===group||f.date===group.split(' · ').pop(),listingOk=!f.listing||f.listing==='All listings'||f.listing===record.item,searchOk=!q||`${record.id} ${record.guest} ${record.room} ${record.item} ${record.hotel}`.toLowerCase().includes(q);return (tab==='Active'?bookingLatestActive(record):bookingLatestPast(record))&&dateOk&&listingOk&&searchOk}).sort((a,b)=>bookingCalendarSortValue(bookingCalendarLabel(a))-bookingCalendarSortValue(bookingCalendarLabel(b))||String(a.when).localeCompare(String(b.when)));
};
bookingLatestCard=function(record){
  const past=state.bookingTab==='Past',status=bookingFinalDisplayStatus(record),next=past?'':bookingFinalNextAction(record),menu=state.bookingCardMenuId===record.id,canCancel=!past&&bookingLatestCanCancel(record),overdue=record.id==='BK-9002'||/Oct 6/.test(String(record.when))&&status==='In progress';
  return '<article class="booking-card final-booking-card latest-booking-card"><div class="booking-card-hit" role="button" tabindex="0" data-latest-detail="'+esc(record.id)+'"><div class="booking-final-title"><div><div class="booking-reference-line">#'+esc(record.id)+'</div><div class="booking-listing">'+esc(record.item)+'</div></div><span class="booking-status '+String(status||'').toLowerCase().replaceAll(' ','-')+'">'+esc(status)+'</span><button class="booking-card-more" type="button" data-card-menu="'+esc(record.id)+'" aria-label="More booking actions">⋯</button></div><div class="booking-line">◷ '+esc(record.when)+(overdue?'<span class="booking-overdue">Overdue</span>':'')+'</div><div class="booking-line">♙ '+esc(record.guest)+' · '+esc(record.hotel)+' · Room '+esc(record.room)+'</div><div class="booking-line">♧ '+esc(record.quantity||'—')+'</div><div class="booking-line">▤ '+bookingCardPaymentType(record)+' · <span class="booking-payment-state '+bookingCardPaymentState(record).toLowerCase()+'">'+bookingCardPaymentState(record)+'</span></div>'+(record.status==='Cancelled'?'<div class="booking-line booking-cancellation-reason">'+esc(record.cancelledBy==='guest'?'Cancelled by guest':'Cancelled by vendor · '+(record.cancelReason||'Other'))+'</div>':'')+'</div>'+(next?'<div class="booking-actions"><button class="booking-action primary" data-final-status-action="'+(next==='Mark as completed'?'complete':'progress')+'" data-final-status-id="'+esc(record.id)+'">'+next+'</button></div>':'')+(menu?'<div class="booking-card-menu"><button data-card-charge="'+esc(record.id)+'">Add charge</button><button data-card-message="'+esc(record.id)+'">Message guest</button>'+(canCancel?'<button class="danger" data-latest-cancel="'+esc(record.id)+'">Cancel booking</button>':'')+'</div>':'')+'</article>';
};
const promptMenuRenderBase=render;
render=function(){
  promptMenuRenderBase();
  document.querySelectorAll('[data-card-message]').forEach(button=>button.onclick=event=>{event.stopPropagation();toast('Chat thread opened')});
};
render();

/* Final screenshot alignment: yesterday/today groups and no overdue pill. */
bookingCalendarLabel=function(record){
  const raw=String(record.when||'');
  if(/Oct 6/i.test(raw))return 'Yesterday · Oct 6';
  if(/Today|Oct 7/i.test(raw))return 'Today · Oct 7';
  if(/Tomorrow|Oct 8/i.test(raw))return 'Tomorrow · Oct 8';
  if(/Oct 9/i.test(raw))return 'Thu · Oct 9';
  if(/Oct 13/i.test(raw))return 'Mon · Oct 13';
  const match=raw.match(/(?:^|\s)(Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug)\s+(\d{1,2})/i);
  return match?match[1]+' '+match[2]:'Other date';
};
const screenshotGroupOrder={'Yesterday · Oct 6':1006,'Today · Oct 7':1007,'Tomorrow · Oct 8':1008,'Thu · Oct 9':1009,'Mon · Oct 13':1013};
bookingCalendarSortValue=function(label){
  if(Object.prototype.hasOwnProperty.call(screenshotGroupOrder,label))return screenshotGroupOrder[label];
  const match=String(label).match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})/);if(!match)return 99;
  const months={Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12};return months[match[1]]*100+Number(match[2]);
};
render();

/* Restore the last visited route after all layered startup guards have run. */
setTimeout(()=>{
  let saved=cabanaLastViewFromUrl();
  const validPages=['dashboard','orders','bookings','listings','staff-listings','chat','menu','profile','services','earnings'];
  if(saved?.page&&validPages.includes(saved.page)){
    state.page=saved.page;
    state.detail=saved.detail||null;
    if(saved.orderView)state.orderView=saved.orderView;
    if(saved.orderTimeTab)state.orderTimeTab=saved.orderTimeTab;
    if(saved.insightTab)state.insightTab=saved.insightTab;
    if(saved.range)state.range=saved.range;
  }
  cabanaResumePending=false;
  const renderWithLastViewPersistence=render;
  render=function(){renderWithLastViewPersistence();rememberLastView()};
  render();
},0);

/* Final Home status presentation. */
const bookingLatestWorkspaceBeforeNoBell=bookingLatestWorkspace;
bookingLatestWorkspace=function(){
  const filterLabel='Filters'+(bookingLatestActiveFilterCount()?' ('+bookingLatestActiveFilterCount()+')':'');
  return bookingLatestWorkspaceBeforeNoBell().replace(/<div class="booking-header-actions">[\s\S]*?<\/div>/,'').replace('<span>Filter</span>','<span>'+filterLabel+'</span>');
};
const homeQuantityWithoutBaggage=value=>String(value||'').replace(/\s*·\s*\d+\s+(?:suitcases?|bags?)\b/ig,'').trim();
dashboardOperationalRequestSummary=function(order){
  const raw=String(order.when||'Scheduled time not set').replace(/^Pickup\s*/,'').replace(/\s*·\s*\d+\s+(?:hours?|minutes?)\b/i,'').trim();
  return [raw,homeQuantityWithoutBaggage(order.quantity)].filter(Boolean).join(' · ');
};
dashboardOperationalBookingQuantity=function(order){return homeQuantityWithoutBaggage(order.quantity).replace(/^(\d+)\s*[×x]$/,'$1 items.')};
/* Final booking filter controls: explicit date radios and listing checkboxes. */
bookingLatestFilterSheet=function(){
  if(!state.bookingFilterOpen)return '';
  const f=state.bookingLatestFilters||{},selectedListings=bookingLatestSelectedListings(),allListingsSelected=!selectedListings.length;
  const dateOptions=['All dates','Last 7 days','Last 30 days','This month','Last month','This year','Custom range…'];
  const dateChoice=value=>'<label class="booking-choice booking-choice-radio '+(f.date===value?'active':'')+'"><input type="radio" name="booking-date-filter" value="'+esc(value)+'" data-latest-filter-option="date" '+(f.date===value?'checked':'')+'><span class="booking-choice-indicator" aria-hidden="true"></span><span class="booking-choice-label">'+esc(value)+'</span></label>';
  const listingChoice=value=>{const checked=value==='All listings'?allListingsSelected:selectedListings.includes(value);return '<label class="booking-choice booking-choice-checkbox '+(checked?'active':'')+'"><input type="checkbox" name="booking-listing-filter" value="'+esc(value)+'" data-latest-filter-option="listing" '+(checked?'checked':'')+'><span class="booking-choice-indicator" aria-hidden="true"></span><span class="booking-choice-label">'+esc(value)+'</span></label>'};
  const custom=f.date==='Custom range…'?'<div class="booking-custom-range"><label>From<input type="date" data-latest-custom-from value="'+esc(f.customFrom||'')+'"></label><label>To<input type="date" data-latest-custom-to value="'+esc(f.customTo||'')+'"></label></div>':'';
  const resultCount=bookingLatestRows().length;
  return '<div class="booking-sheet-backdrop" data-latest-filter-close></div><section class="booking-filter-sheet" role="dialog" aria-modal="true"><div class="sheet-handle"></div><header><div><h2>Filters</h2><p>Choose one date range and one or more listings.</p></div><button data-latest-filter-close aria-label="Close filters">×</button></header><fieldset><legend>Date</legend>'+dateOptions.map(dateChoice).join('')+'</fieldset>'+custom+'<fieldset><legend>Listing</legend>'+listingChoice('All listings')+listings.map(x=>listingChoice(x.name)).join('')+'</fieldset><div class="booking-filter-actions"><button class="button ghost" data-latest-filter-reset>Reset</button><button class="button primary" data-latest-filter-apply>Show '+resultCount+' bookings</button></div></section>';
};
bookingLatestRows=function(){
  const tab=state.bookingTab==='Past'?'Past':'Active',f=state.bookingLatestFilters||{},selectedListings=bookingLatestSelectedListings(),q=(state.bookingQuery||'').toLowerCase().trim();
  return bookingLatestAll().filter(record=>{const dateOk=bookingLatestDateMatches(record,f.date,f),listingOk=!selectedListings.length||selectedListings.includes(record.item),searchOk=!q||`${record.id} ${record.guest} ${record.room} ${record.item} ${record.hotel}`.toLowerCase().includes(q);return (tab==='Active'?bookingLatestActive(record):bookingLatestPast(record))&&dateOk&&listingOk&&searchOk}).sort((a,b)=>bookingCalendarSortValue(bookingCalendarLabel(a))-bookingCalendarSortValue(bookingCalendarLabel(b))||String(a.when).localeCompare(String(b.when)));
};
const bookingLatestFilterControlsRenderBaseFinal=render;
render=function(){
  bookingLatestFilterControlsRenderBaseFinal();
  if(state.page!=='orders')return;
  document.querySelectorAll('[data-latest-filter-option]').forEach(control=>control.onchange=()=>{
    const key=control.dataset.latestFilterOption,value=control.value;
    if(key==='date')state.bookingLatestFilters.date=value;
    if(key==='listing'){
      const selected=bookingLatestSelectedListings();
      if(value==='All listings')state.bookingLatestFilters.listing=[];
      else state.bookingLatestFilters.listing=selected.includes(value)?selected.filter(item=>item!==value):selected.concat(value);
    }
    render();
  });
  document.querySelectorAll('[data-latest-custom-from],[data-latest-custom-to]').forEach(input=>input.onchange=()=>{state.bookingLatestFilters[input.hasAttribute('data-latest-custom-from')?'customFrom':'customTo']=input.value;render()});
  document.querySelectorAll('[data-latest-filter-reset]').forEach(button=>button.onclick=()=>{state.bookingLatestFilters={date:'All dates',listing:[],type:'All'};render()});
};
const bookingLatestCardBeforeFinalIconCleanup=bookingLatestCard;
bookingLatestCard=function(record){
  let html=bookingLatestCardBeforeFinalIconCleanup(record).replace(/(<div class="booking-line">)[◷♙♧▤]\s*/g,'$1').replace(/\s*·\s*\d+\s+(?:suitcases?|bags?)\b/ig,'').replace(/#[A-Z]+-/g,'#BK-');
  const more=html.match(/<button class="booking-card-more"[\s\S]*?<\/button>/)?.[0]||'';
  html=html.replace(more,'');
  const nextTone=record.status==='Confirmed'||record.status==='Scheduled'?'status-next-progress':record.status==='In progress'||record.status==='In use'?'status-next-completed':'';
  if(nextTone)html=html.replace('class="booking-action primary"','class="booking-action primary '+nextTone+'"');
  if(state.bookingTab!=='Past'&&more){
    html=html.replace(/(<div class="booking-actions"><button class="booking-action primary[^\"]*"[\s\S]*?<\/button>)(<\/div>)/,'$1'+more+'$2');
  }
  return html;
};
dashboardOperationalStatus=function(order){
  if(['Scheduled','Confirmed'].includes(order.status))return 'Confirmed';
  if(['In progress','In use','Preparing','Ready','Ready for pickup','Checked in'].includes(order.status))return 'In progress';
  return order.status;
};
dashboardOperationalBookingRow=function(order,dateLabel){
  const isAirportTransfer=/^Airport Transfer/i.test(String(order.item||''));
  const displayId=displayBookingReference(order.id);
  const displayItem=isAirportTransfer?'Airport Transfer':order.item;
  const displayWhen=order.id==='CB-9002'?'Oct 7 · 11:00 AM':order.when;
  const duration=dashboardOperationalBookingDuration({...order,when:displayWhen}),details=[dashboardOperationalBookingQuantity(order),duration].filter(Boolean).join(' · ');
  const raw=String(displayWhen||'').trim();
  let dateText=raw.split(/\s*·\s*/)[0]||dateLabel;
  if(/^Today$/i.test(dateText))dateText=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(dashboardOperationalToday());
  if(/^Tomorrow$/i.test(dateText)){const tomorrow=dashboardOperationalToday();tomorrow.setDate(tomorrow.getDate()+1);dateText=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(tomorrow)}
  const time=dashboardOperationalBookingTime({...order,when:displayWhen}),dateTime=[dateText,time].filter(Boolean).join(' · '),status=dashboardOperationalStatus(order);
  const guestRoom=[order.guest,order.room?'Room '+order.room:''].filter(Boolean).join(' · ');
  return '<button class="dashboard-booking-row" data-detail="'+esc(order.id)+'"><span class="dashboard-booking-main"><span class="dashboard-booking-time-line"><strong class="dashboard-booking-reference">#'+esc(displayId)+'</strong><em class="dashboard-booking-status '+status.toLowerCase().replaceAll(' ','-')+'">'+esc(status)+'</em></span><strong class="dashboard-booking-title">'+esc(displayItem)+'</strong><small class="dashboard-booking-date">'+esc(dateTime)+'</small>'+(guestRoom?'<small>'+esc(guestRoom)+'</small>':'')+'<small>'+esc(details)+'</small></span></button>';
};
const bookingChargeMoney=value=>'₱'+Math.round(Number(value||0)).toLocaleString('en-PH');
const bookingChargeNumber=value=>Number(String(value||'').replace(/[^\d.-]/g,''))||0;
const bookingChargeRoomAllowed=record=>{if(!record?.room)return false;if(record.roomDeposit!==undefined)return record.roomDeposit===true;if(record.hasRoomDeposit!==undefined)return record.hasRoomDeposit===true;return /room/i.test(String(record.payment||''))};
const bookingChargeRecord=()=>bookingLatestAll().find(item=>item.id===state.bookingAddChargeId);
const bookingChargeSheetMarkup=()=>{
  const record=bookingChargeRecord();if(!record)return '';
  const roomAllowed=bookingChargeRoomAllowed(record);
  const item=state.bookingChargeItem||'Extra hour',description=state.bookingChargeDescription??(item==='Extra hour'?'Extra hour':item==='Extra passenger'?'Extra passenger':''),amount=state.bookingChargeAmount??(item==='Extra hour'?'500':item==='Extra passenger'?'250':''),quantity=Math.max(1,Number(state.bookingChargeQuantity||1)),chargeTo=state.bookingChargeTo||(roomAllowed&&/room/i.test(String(record.payment||''))?'Room':'Pay via QR'),base=bookingChargeNumber(record.total),extra=bookingChargeNumber(amount)*quantity,total=base+extra,error=state.bookingChargeError||'',submitLabel=extra>0?'Add '+bookingChargeMoney(extra)+' charge':'Add charge';
  const quick=(label,value)=>'<button type="button" class="booking-charge-quick '+(item===value?'active':'')+'" data-booking-charge-item="'+esc(value)+'">'+esc(label)+'</button>';
  return '<div class="booking-charge-backdrop" data-booking-charge-close></div><section class="booking-charge-sheet" role="dialog" aria-modal="true" aria-label="Add charge"><div class="sheet-handle"></div><header><div><h2>Add charge</h2><p>#'+esc(record.id)+' · '+esc(record.guest)+(record.room?' · Room '+esc(record.room):'')+'</p></div><button type="button" data-booking-charge-close aria-label="Close">×</button></header><fieldset><legend>Item</legend><div class="booking-charge-quick-list">'+quick('Extra hour','Extra hour')+quick('Extra passenger','Extra passenger')+quick('Custom','Custom')+'</div></fieldset><label class="booking-charge-field"><span>Description</span><input data-booking-charge-description value="'+esc(description)+'" placeholder="Describe the extra"></label><div class="booking-charge-fields"><label class="booking-charge-field"><span>Price each</span><div class="booking-charge-money-input"><span aria-hidden="true">₱</span><input data-booking-charge-amount type="number" min="0" step="50" value="'+esc(amount)+'" placeholder="0"></div></label><div class="booking-charge-field"><span>Quantity</span><div class="booking-charge-quantity"><button type="button" data-booking-charge-quantity="down" aria-label="Decrease quantity">−</button><strong>'+quantity+'</strong><button type="button" data-booking-charge-quantity="up" aria-label="Increase quantity">+</button></div></div></div><fieldset><legend>Charge to</legend><div class="booking-charge-destinations">'+(roomAllowed?'<label><input type="radio" name="booking-charge-to" value="Room" '+(chargeTo==='Room'?'checked':'')+' data-booking-charge-to> Room '+esc(record.room)+'</label>':'')+'<label><input type="radio" name="booking-charge-to" value="Pay via QR" '+(chargeTo==='Pay via QR'?'checked':'')+' data-booking-charge-to> Pay via QR</label></div></fieldset><label class="booking-charge-field"><span>Note <small>(optional)</small></span><textarea data-booking-charge-note placeholder="Shown to the guest">'+esc(state.bookingChargeNote||'')+'</textarea></label><div class="booking-charge-total"><span>Booking total</span><strong>'+(extra>0?bookingChargeMoney(base)+' → '+bookingChargeMoney(total):bookingChargeMoney(base))+'</strong></div>'+ (error?'<p class="booking-charge-error">'+esc(error)+'</p>':'')+'<p class="booking-charge-agreement">Make sure the guest has agreed to this charge.</p><button type="button" class="button primary booking-charge-submit" data-booking-charge-submit '+(extra<=0||!description.trim()?'disabled':'')+'>'+submitLabel+'</button></section>';
};
const bookingLatestDetailBeforeAddOns=bookingLatestDetail;
bookingLatestDetail=function(){
  const record=bookingLatestAll().find(item=>item.id===state.detail),html=bookingLatestDetailBeforeAddOns();
  if(!record||!record.addOns?.length)return html;
  const addOns=record.addOns.map(extra=>'<span class="booking-addon-line">'+esc(extra.description)+' · '+extra.quantity+' × '+bookingChargeMoney(extra.amount)+' · '+esc(extra.chargeTo)+' · '+esc(extra.status)+'<small>Added by '+esc(extra.addedBy)+' · '+esc(extra.addedAt)+'</small></span>').join('');
  return html.replace('<div class="booking-request-field"><span>Add-ons</span><strong>None</strong></div>','<div class="booking-request-field booking-addons-field"><span>Add-ons</span><strong>'+addOns+'</strong></div>');
};
const renderBeforeBookingCharge=render;
/* Final Home/navigation rules: pending work belongs to Home, unread messages belong to Chat. */
const cabanaPendingRequestCount=()=>dashboardOperationalPending().length;
const cabanaUnreadChatCount=()=>1;
const cabanaNavMarkup=(id,label,ico)=>{const shownLabel=id==='dashboard'?'Home':label,badge=id==='dashboard'?cabanaPendingRequestCount():id==='chat'?cabanaUnreadChatCount():0;return '<button class="nav-item '+(state.page===id?'active':'')+'" data-page="'+id+'"><span class="nav-icon">'+navIcon(ico,state.page===id)+'</span><span>'+shownLabel+'</span>'+(badge?'<b class="nav-badge">'+badge+'</b>':'')+'</button>'};
nav=function(id,label,icon){return cabanaNavMarkup(id,label,icon)};
nav2=function(id,label,ico){return cabanaNavMarkup(id,label,ico)};
const dashboardMarkupBeforePendingBadgeFix=dashboardOperationalMarkup;
dashboardOperationalMarkup=function(){const pending=cabanaPendingRequestCount(),button='<button class="dashboard-header-icon" data-dashboard-notifications aria-label="Notifications, '+pending+' pending requests"><i class="hgi-stroke hgi-notification-03" aria-hidden="true"></i>'+(pending?'<b>'+pending+'</b>':'')+'</button>';return dashboardMarkupBeforePendingBadgeFix().replace(/<button class="dashboard-header-icon" data-dashboard-notifications[\s\S]*?<\/button>/,button).replace('<h1>Dashboard</h1>','<h1>Home</h1>')};

/* Payment copy is explicit on Home: room charges are separate from QR payments. */
const cabanaPaymentSummary=record=>{if(record?.status==='Cancelled'||record?.roomChargeRemoved)return {type:'No charge',state:'Removed'};const raw=String(record?.payment||'')+' '+String(record?.settlement||''),room=/room/i.test(raw),unpaid=/pending|unpaid|awaiting/i.test(raw);return {type:room?'Charged to room':'Pay via QR',state:unpaid?'Unpaid':'Paid'}};
bookingLatestPayment=function(record){const payment=cabanaPaymentSummary(record);return payment.type+' · '+payment.state};
bookingCardPaymentType=function(record){return cabanaPaymentSummary(record).type};
bookingCardPaymentState=function(record){return cabanaPaymentSummary(record).state};

/* Auto-complete 24 hours after a known scheduled end, except unpaid QR bookings. */
const cabanaScheduledEnd=record=>{const raw=String(record?.when||''),match=raw.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s*[·-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);if(!match)return null;let hour=Number(match[3])%12;if(match[5].toUpperCase()==='PM')hour+=12;const month={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11}[match[1].slice(0,3)];const date=new Date(new Date().getFullYear(),month,Number(match[2]),hour,Number(match[4]));const duration=raw.match(/(\d+)\s+hours?/i);if(duration)date.setHours(date.getHours()+Number(duration[1]));return date.getTime()};
const cabanaAutoCompleteIfDue=record=>{if(!record||['Completed','Declined','Expired','Cancelled'].includes(record.status)||cabanaPaymentSummary(record).type==='Pay via QR'&&cabanaPaymentSummary(record).state==='Unpaid')return;const end=cabanaScheduledEnd(record);if(end&&Date.now()>=end+86400000){record.status='Completed';record.autoCompleted=true;record.timeline=Array.isArray(record.timeline)&&!record.timeline.some(row=>row[0]==='Auto-completed')?record.timeline.concat([['Auto-completed',todayLabel()]]):record.timeline}};
const bookingLatestAllBeforeAutoComplete=bookingLatestAll;
bookingLatestAll=function(){const rows=bookingLatestAllBeforeAutoComplete();rows.forEach(cabanaAutoCompleteIfDue);return rows};
const bookingLatestActiveBeforeAutoComplete=bookingLatestActive;
const bookingLatestPastBeforeAutoComplete=bookingLatestPast;
bookingLatestActive=function(record){cabanaAutoCompleteIfDue(record);return bookingLatestActiveBeforeAutoComplete(record)&&!record.autoCompleted};
bookingLatestPast=function(record){cabanaAutoCompleteIfDue(record);return bookingLatestPastBeforeAutoComplete(record)||record.status==='Cancelled'||record.autoCompleted};
const bookingFinalDisplayStatusBeforeAutoComplete=bookingFinalDisplayStatus;
bookingFinalDisplayStatus=function(record){return record.autoCompleted&&state.bookingTab==='Past'?'Auto-completed':bookingFinalDisplayStatusBeforeAutoComplete(record)};

/* Home cards use time only inside Today; unpaid QR bookings remain visible with a payment tag. */
dashboardOperationalBookingRow=function(order,dateLabel){const duration=dashboardOperationalBookingDuration({...order,when:order.when}),details=[homeQuantityWithoutBaggage(order.quantity),duration].filter(Boolean).join(' · '),time=dashboardOperationalBookingTime(order),raw=String(order.when||''),dateText=raw.split(/\s*·\s*/)[0]||dateLabel,dateTime=dateLabel==='Today'?[time,duration].filter(Boolean).join(' · '):[dateText,time,duration].filter(Boolean).join(' · '),status=dashboardOperationalStatus(order),payment=cabanaPaymentSummary(order),paymentPending=payment.type==='Pay via QR'&&payment.state==='Unpaid';return '<button class="dashboard-booking-row" data-detail="'+esc(order.id)+'"><span class="dashboard-booking-main"><span class="dashboard-booking-time-line"><small>'+esc(dateTime)+'</small><em class="dashboard-booking-status '+status.toLowerCase().replaceAll(' ','-')+'">'+esc(status)+'</em>'+(paymentPending?'<em class="dashboard-booking-payment-pending">Payment pending</em>':'')+'</span><strong class="dashboard-booking-title">'+esc(order.item)+'</strong><small>'+esc(details)+'</small><small class="dashboard-booking-payment">'+esc(payment.type)+' · '+esc(payment.state)+'</small></span></button>'};
/* New pending-request notifications and the Home-only sticky indicator. */
state.dashboardNewPendingRequests=state.dashboardNewPendingRequests||[];
state.dashboardRequestFocusId=state.dashboardRequestFocusId||null;
const pendingSnapshotKey='cabana:pending-request-snapshot';
const pendingNewKey='cabana:new-pending-request-ids';
const simulatedPendingKey='cabana:simulated-pending-requests';
const currentPendingRequestIds=()=>orders.filter(order=>order.status==='Pending').map(order=>order.id);
const readPendingStorage=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key)||'null');return Array.isArray(value)?value:fallback}catch(error){return fallback}};
const writePendingStorage=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch(error){}};
writePendingStorage(simulatedPendingKey,[]);readPendingStorage(simulatedPendingKey,[]).filter(order=>order&&order.status==='Pending').forEach(order=>{if(!orders.some(existing=>existing.id===order.id))orders.push(order);dashboardPendingDisplayIds.add(order.id)});
const openPendingRequestFromNotification=id=>{if(!id)return;state.page='dashboard';state.detail=null;state.dashboardRequestFocusId=id;if(!(state.dashboardNewPendingRequests||[]).includes(id))state.dashboardNewPendingRequests=[...(state.dashboardNewPendingRequests||[]),id];render();setTimeout(()=>{const card=[...document.querySelectorAll('[data-dashboard-request-view]')].find(node=>node.dataset.dashboardRequestView===id);card?.scrollIntoView({block:'center',behavior:'smooth'});card?.focus({preventScroll:true})},80)};
const clearPendingRequestIndicator=id=>{state.dashboardNewPendingRequests=(state.dashboardNewPendingRequests||[]).filter(item=>item!==id);state.dashboardSeenRequests=[...new Set([...(state.dashboardSeenRequests||[]),id])];writePendingStorage(pendingNewKey,state.dashboardNewPendingRequests);if(state.dashboardRequestFocusId===id)state.dashboardRequestFocusId=null;const card=[...document.querySelectorAll('[data-dashboard-request-view]')].find(node=>node.dataset.dashboardRequestView===id)?.closest('.dashboard-request-card');if(card){card.classList.remove('unseen');card.classList.add('seen');card.querySelector('.dashboard-request-new-pill')?.remove()}document.querySelector('[data-dashboard-new-request-indicator]')?.classList.remove('is-visible')};
const sendNewPendingRequestNotification=async order=>{if(!order||typeof Notification==='undefined'||Notification.permission!=='granted')return;const title='New booking request',body=order.item+' is waiting for your confirmation.',options={body,tag:'cabana-pending-'+order.id,renotify:true,data:{type:'open-pending-request',requestId:order.id}};try{const registration=await Promise.race([navigator.serviceWorker?.getRegistration?.()??null,new Promise(resolve=>setTimeout(()=>resolve(null),1500))]).catch(()=>null);if(registration?.active&&registration.showNotification)await registration.showNotification(title,options);else{const notification=new Notification(title,options);notification.onclick=()=>{window.focus();openPendingRequestFromNotification(order.id)}}}catch(error){try{const notification=new Notification(title,options);notification.onclick=()=>{window.focus();openPendingRequestFromNotification(order.id)}}catch(notificationError){}}};
const requestNotificationPermission=async()=>{if(typeof Notification==='undefined')return 'denied';if(Notification.permission!=='default')return Notification.permission;try{return await Notification.requestPermission()}catch(error){return 'denied'}};
const initializePendingRequestNotifications=()=>{const currentIds=currentPendingRequestIds(),savedSnapshot=readPendingStorage(pendingSnapshotKey,null),savedNew=readPendingStorage(pendingNewKey,[]);state.dashboardNewPendingRequests=savedNew.filter(id=>currentIds.includes(id));if(!Array.isArray(savedSnapshot))writePendingStorage(pendingSnapshotKey,currentIds);if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').catch(()=>{});navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='open-pending-request')openPendingRequestFromNotification(event.data.requestId)})}};
const checkForNewPendingRequests=async()=>{const currentIds=currentPendingRequestIds(),previous=readPendingStorage(pendingSnapshotKey,null);if(!Array.isArray(previous)){writePendingStorage(pendingSnapshotKey,currentIds);return}const arrivals=currentIds.filter(id=>!previous.includes(id));if(arrivals.length){state.dashboardNewPendingRequests=[...new Set([...(state.dashboardNewPendingRequests||[]),...arrivals])];writePendingStorage(pendingNewKey,state.dashboardNewPendingRequests);writePendingStorage(pendingSnapshotKey,currentIds);if(state.page==='dashboard')render()}else if(previous.some(id=>!currentIds.includes(id))){writePendingStorage(pendingSnapshotKey,currentIds);state.dashboardNewPendingRequests=(state.dashboardNewPendingRequests||[]).filter(id=>currentIds.includes(id));writePendingStorage(pendingNewKey,state.dashboardNewPendingRequests)}};
const simulatedRequestTemplates=[{guest:'Bianca Torres',room:'402',item:'Airport Transfer — Sedan',quantity:'2 passengers · 2 suitcases',when:'Oct 10 · 6:00 AM',fulfilment:'Pickup: Henry’s Resort Dumaguete lobby · Destination: Dumaguete–Sibulan Airport',total:'₱2,400.00',notes:'Early flight, please arrive 10 minutes ahead.'},{guest:'Kenji Watanabe',room:'611',item:'Toyota Innova Rental',quantity:'1 vehicle · 4 passengers',when:'Oct 10 · 9:00 AM – Oct 11 · 9:00 AM',fulfilment:'Pickup and return: Henry’s Resort Dumaguete lobby',total:'₱3,200.00',notes:'Day trip to Tagaytay.'},{guest:'Grace Lim',room:'226',item:'Tourist Van Rental',quantity:'1 vehicle · 6 passengers',when:'Oct 11 · 8:00 AM – Oct 12 · 8:00 AM',fulfilment:'Pickup and return: Henry’s Resort Dumaguete lobby',total:'₱5,500.00',notes:'Family tour, child seat requested.'},{guest:'Marcus Bell',room:'318',item:'Airport Transfer — SUV',quantity:'3 passengers · 4 suitcases',when:'Oct 11 · 2:00 PM',fulfilment:'Pickup: Henry’s Resort Dumaguete lobby · Destination: NAIA Terminal 1',total:'₱2,900.00',notes:'Extra luggage space needed.'}];
const simulateOnePendingRequest=async()=>{const nextNumber=Math.max(8854,...orders.map(item=>Number(String(item.id).match(/^CB-(88\d\d)$/)?.[1]||0)))+1,id='CB-'+nextNumber,simCount=readPendingStorage(simulatedPendingKey,[]).length,template=simulatedRequestTemplates[simCount%simulatedRequestTemplates.length],placedMinutes=42+simCount*4,placed='Oct 6 · '+(8+Math.floor(placedMinutes/60))+':'+String(placedMinutes%60).padStart(2,'0')+' AM',order={id,kind:'Booking',hotel:'Henry’s Resort Dumaguete',...template,payment:'Gateway payment pending',settlement:'Payment pending',status:'Pending',responseMinutes:60,timeline:[['Booking requested',placed]],contact:'Open guest chat'};orders.push(order);dashboardPendingDisplayIds.add(id);const stored=readPendingStorage(simulatedPendingKey,[]);writePendingStorage(simulatedPendingKey,[...stored.filter(item=>item.id!==id),order]);state.page='dashboard';state.detail=null;state.dashboardNewPendingRequests=[...new Set([...(state.dashboardNewPendingRequests||[]),id])];writePendingStorage(pendingNewKey,state.dashboardNewPendingRequests);writePendingStorage(pendingSnapshotKey,currentPendingRequestIds());render()};
const simulateNewPendingRequest=async()=>{await simulateOnePendingRequest();await simulateOnePendingRequest()};
const resetDevSimulations=()=>{const simulated=readPendingStorage(simulatedPendingKey,[]),simulatedIds=new Set(simulated.map(item=>item?.id).filter(Boolean));orders.splice(0,orders.length,...orders.filter(order=>!simulatedIds.has(order.id)&&!String(order.id).startsWith('SIM-')));try{localStorage.removeItem(simulatedPendingKey)}catch(error){}state.dashboardNewPendingRequests=(state.dashboardNewPendingRequests||[]).filter(id=>!simulatedIds.has(id)&&!String(id).startsWith('SIM-'));state.dashboardRequestFocusId=null;writePendingStorage(pendingNewKey,state.dashboardNewPendingRequests);writePendingStorage(pendingSnapshotKey,currentPendingRequestIds());render();toast('Simulations reset')};
initializePendingRequestNotifications();
const pendingSampleSeedKey='cabana:pending-sample-seeded-v5';
try{
  if(localStorage.getItem(pendingSampleSeedKey)!=='1'){
    const currentIds=currentPendingRequestIds(),seeded=homeSeededNewPendingIds.filter(id=>currentIds.includes(id));
    state.dashboardNewPendingRequests=seeded.slice();
    writePendingStorage(pendingNewKey,state.dashboardNewPendingRequests);
    writePendingStorage(pendingSnapshotKey,currentIds);
    localStorage.setItem(pendingSampleSeedKey,'1');
  }
}catch(error){}
setInterval(checkForNewPendingRequests,1500);
document.addEventListener('click',event=>{const view=event.target.closest?.('[data-dashboard-request-view]'),action=event.target.closest?.('[data-dashboard-request-action]');if(view)clearPendingRequestIndicator(view.dataset.dashboardRequestView);if(action)clearPendingRequestIndicator(action.dataset.dashboardRequestId)},true);
if(!window.__cabanaDevSimulationBound){window.__cabanaDevSimulationBound=true;document.addEventListener('click',event=>{const simulateButton=event.target.closest?.('[data-dev-simulate-new-request]'),resetButton=event.target.closest?.('[data-dev-reset-simulations]');if(simulateButton){event.preventDefault();event.stopPropagation();simulateNewPendingRequest();return}if(resetButton){event.preventDefault();event.stopPropagation();resetDevSimulations()}},true)}
if(state.dashboardRequestFocusId)setTimeout(()=>{const card=[...document.querySelectorAll('[data-dashboard-request-view]')].find(node=>node.dataset.dashboardRequestView===state.dashboardRequestFocusId);card?.scrollIntoView({block:'center',behavior:'smooth'});card?.focus({preventScroll:true})},120);
const dashboardRequestSectionBeforeStickyIndicator=dashboardOperationalRequestSection;
const dashboardRequestCardBeforeStickyIndicator=dashboardOperationalRequestCard;
dashboardOperationalRequestCard=function(order){return dashboardRequestCardBeforeStickyIndicator(order)};
dashboardOperationalRequestSection=function(){let html=dashboardRequestSectionBeforeStickyIndicator(),pending=dashboardOperationalPending(),newIds=(state.dashboardNewPendingRequests||[]).filter(id=>pending.some(order=>order.id===id));if(!newIds.length)return html;const listToken='<div class="dashboard-request-list">';if(!html.includes(listToken))return html;const marker='<button class="dashboard-new-request-marker" type="button" data-dashboard-new-request-indicator role="status">New Requests ↓</button>';return html.replace(listToken,marker+listToken)};
const shell2BeforeHomeNavLabel=shell2;
shell2=function(content){return shell2BeforeHomeNavLabel(content).replaceAll('<span>Dashboard</span>','<span>Home</span>')};
const bookingLatestCardBeforePaymentPendingTag=bookingLatestCard;
bookingLatestCard=function(record){return bookingLatestCardBeforePaymentPendingTag(record)};
render=function(){
  renderBeforeBookingCharge();
  if(state.bookingAddChargeId){
    document.querySelector('#app')?.insertAdjacentHTML('beforeend',bookingChargeSheetMarkup());
    document.querySelectorAll('[data-booking-charge-close]').forEach(button=>button.onclick=()=>{state.bookingAddChargeId=null;state.bookingChargeError='';render()});
    document.querySelectorAll('[data-booking-charge-item]').forEach(button=>button.onclick=()=>{const item=button.dataset.bookingChargeItem;state.bookingChargeItem=item;state.bookingChargeDescription=item==='Extra hour'?'Extra hour':item==='Extra passenger'?'Extra passenger':'';state.bookingChargeAmount=item==='Extra hour'?'500':item==='Extra passenger'?'250':'';state.bookingChargeError='';render();if(item==='Custom')requestAnimationFrame(()=>{const customDescription=document.querySelector('[data-booking-charge-description]');if(customDescription){customDescription.focus();customDescription.scrollIntoView({block:'center',behavior:'smooth'})}})});
    const description=document.querySelector('[data-booking-charge-description]');if(description)description.oninput=event=>{state.bookingChargeDescription=event.target.value;const cursor=event.target.selectionStart??event.target.value.length;render();requestAnimationFrame(()=>{const next=document.querySelector('[data-booking-charge-description]');if(next){next.focus();const position=Math.min(cursor,next.value.length);next.setSelectionRange(position,position)}})};
    const amount=document.querySelector('[data-booking-charge-amount]');if(amount){amount.onfocus=()=>setTimeout(()=>amount.scrollIntoView({block:'center',behavior:'smooth'}),150);amount.oninput=event=>{state.bookingChargeAmount=event.target.value;render();requestAnimationFrame(()=>{const next=document.querySelector('[data-booking-charge-amount]');if(next){next.focus();next.scrollIntoView({block:'center',behavior:'smooth'})}})}}
    const note=document.querySelector('[data-booking-charge-note]');if(note)note.oninput=event=>{state.bookingChargeNote=event.target.value;render()};
    document.querySelectorAll('[data-booking-charge-quantity]').forEach(button=>button.onclick=()=>{state.bookingChargeQuantity=Math.max(1,Number(state.bookingChargeQuantity||1)+(button.dataset.bookingChargeQuantity==='up'?1:-1));render()});
    document.querySelectorAll('[data-booking-charge-to]').forEach(input=>input.onchange=event=>{state.bookingChargeTo=event.target.value;render()});
    document.querySelectorAll('[data-booking-charge-submit]').forEach(button=>button.onclick=()=>{const record=bookingChargeRecord(),description=String(state.bookingChargeDescription||'').trim(),amount=bookingChargeNumber(state.bookingChargeAmount),quantity=Math.max(1,Number(state.bookingChargeQuantity||1)),roomAllowed=bookingChargeRoomAllowed(record);if(!record||!description||amount<=0){state.bookingChargeError='Add a description and an amount greater than zero.';render();return}const chargeTo=state.bookingChargeTo==='Room'&&roomAllowed?'Room':'Pay via QR',base=bookingChargeNumber(record.total),total=base+amount*quantity,roomLimit=Number(record.roomChargeLimit||0),status=chargeTo==='Room'&&roomLimit&&total>roomLimit?'Awaiting Front Desk approval':chargeTo==='Room'?'Awaiting checkout':'Unpaid';record.addOns=record.addOns||[];record.addOns.push({description,amount,quantity,chargeTo,note:String(state.bookingChargeNote||'').trim(),status,addedBy:state.role,addedAt:'Oct 7 · now'});record.total=bookingChargeMoney(total);state.bookingAddChargeId=null;state.bookingChargeError='';state.bookingChargeDescription='';state.bookingChargeAmount='';state.bookingChargeQuantity=1;state.bookingChargeNote='';toast('Extra charge '+bookingChargeMoney(amount*quantity)+' · '+description);render()});
  }
  document.querySelectorAll('[data-card-charge],[data-latest-charge]').forEach(button=>button.onclick=event=>{event.stopPropagation();state.bookingAddChargeId=button.dataset.cardCharge||state.detail;state.bookingChargeItem='Custom';state.bookingChargeDescription='';state.bookingChargeAmount='';state.bookingChargeQuantity=1;state.bookingChargeTo='';state.bookingChargeNote='';state.bookingChargeError='';render()});
};
render();

/* Vendor cancellation flow: reason first, optional note, then explicit confirmation. */
const vendorCancelModalMarkup=()=>bookingLatestCancelModal();
const vendorCancelledRecords=[];
const bookingLatestAllBeforeVendorCancellation=bookingLatestAll;
bookingLatestAll=function(){
  const rows=bookingLatestAllBeforeVendorCancellation();
  return rows.concat(vendorCancelledRecords).filter((item,index,all)=>all.findIndex(other=>other.id===item.id)===index);
};
const installVendorCancelFlow=()=>{const vendorCancelRenderBase=render;
render=function(){
  vendorCancelRenderBase();
  if(state.bookingLatestCancelId){
    document.querySelectorAll('.booking-decline-backdrop,.booking-decline-modal').forEach(node=>node.remove());
    document.querySelector('#app')?.insertAdjacentHTML('beforeend',vendorCancelModalMarkup());
  }
  document.querySelectorAll('[data-latest-cancel]').forEach(button=>button.onclick=event=>{
    event.stopPropagation();
    state.bookingLatestCancelId=button.dataset.latestCancel;
    state.bookingLatestCancelReason='';
    state.bookingLatestCancelNote='';
    state.bookingCardMenuId=null;
    render();
  });
  document.querySelectorAll('[data-latest-cancel-close]').forEach(button=>button.onclick=()=>{
    state.bookingLatestCancelId=null;
    state.bookingLatestCancelReason='';
    state.bookingLatestCancelNote='';
    render();
  });
  document.querySelectorAll('[data-latest-cancel-reason]').forEach(button=>button.onclick=()=>{
    state.bookingLatestCancelReason=button.dataset.latestCancelReason;
    state.bookingLatestCancelStep='reason';
    if(state.bookingLatestCancelReason!=='Other')state.bookingLatestCancelNote='';
    render();
  });
  document.querySelectorAll('[data-latest-cancel-next]').forEach(button=>button.onclick=()=>{
    if(!state.bookingLatestCancelReason)return;
    state.bookingLatestCancelStep='confirm';
    render();
  });
  document.querySelectorAll('[data-latest-cancel-back]').forEach(button=>button.onclick=()=>{
    state.bookingLatestCancelStep='reason';
    state.bookingLatestCancelReason='';
    state.bookingLatestCancelNote='';
    render();
  });
  const cancelNote=document.querySelector('[data-latest-cancel-note]');
  if(cancelNote)cancelNote.oninput=event=>{
    state.bookingLatestCancelNote=event.target.value;
    const submit=document.querySelector('[data-latest-cancel-submit]');
    if(submit)submit.disabled=!String(event.target.value).trim();
  };
  document.querySelectorAll('[data-latest-cancel-submit]').forEach(button=>button.onclick=()=>{
    const modalReference=document.querySelector('.booking-decline-modal')?.textContent.match(/#([A-Z0-9-]+)/i)?.[1],cancelId=state.bookingLatestCancelId||modalReference,record=bookingLatestAll().find(item=>item.id===cancelId),reason=String(state.bookingLatestCancelReason||''),note=String(state.bookingLatestCancelNote||document.querySelector('[data-latest-cancel-note]')?.value||'').trim();
    if(!record||!reason||(reason==='Other'&&!note))return;
    record.status='Cancelled';
    record.cancelledBy='vendor';
    record.cancelReason=reason;
    record.cancelNote=note;
    if(/room/i.test(String(record.payment||''))||/awaiting checkout|pending/i.test(String(record.settlement||''))){
      record.roomChargeRemoved=true;
      record.payment='No charge';
      record.settlement='Cancelled — room charge removed';
    }
    if(!vendorCancelledRecords.some(item=>item.id===record.id))vendorCancelledRecords.push({...record});
    if(typeof bookingPastExtras!=='undefined'&&!bookingPastExtras.some(item=>item.id===record.id))bookingPastExtras.push({...record});
    state.bookingLatestCancelId=null;
    state.bookingLatestCancelReason='';
    state.bookingLatestCancelNote='';
    state.bookingCardMenuId=null;
    state.bookingTab='Past';
    state.detail=null;
    toast('Guest and Front Desk notified');
    render();
  });
};
};
installVendorCancelFlow();
setTimeout(installVendorCancelFlow,0);

/* Keep the dynamically inserted cancellation note and confirmation state in sync. */
if(!window.__cabanaVendorCancelBound){
  window.__cabanaVendorCancelBound=true;
  document.addEventListener('input',event=>{
    const note=event.target.closest?.('[data-latest-cancel-note]');
    if(!note)return;
    state.bookingLatestCancelNote=note.value;
    const submit=document.querySelector('[data-latest-cancel-submit]');
    if(submit)submit.disabled=!String(note.value||'').trim();
  },true);
  document.addEventListener('click',event=>{
    const submit=event.target.closest?.('[data-latest-cancel-submit]');
    if(!submit)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const modalReference=document.querySelector('.booking-decline-modal')?.textContent.match(/#([A-Z0-9-]+)/i)?.[1],cancelId=state.bookingLatestCancelId||modalReference,record=bookingLatestAll().find(item=>item.id===cancelId),reason=String(state.bookingLatestCancelReason||''),note=String(state.bookingLatestCancelNote||document.querySelector('[data-latest-cancel-note]')?.value||'').trim();
    if(!record||!reason||(reason==='Other'&&!note))return;
    record.status='Cancelled';
    record.cancelledBy='vendor';
    record.cancelReason=reason;
    record.cancelNote=note;
    if(/room/i.test(String(record.payment||''))||/awaiting checkout|pending/i.test(String(record.settlement||''))){
      record.roomChargeRemoved=true;
      record.payment='No charge';
      record.settlement='Cancelled — room charge removed';
    }
    if(!vendorCancelledRecords.some(item=>item.id===record.id))vendorCancelledRecords.push({...record});
    if(typeof bookingPastExtras!=='undefined'&&!bookingPastExtras.some(item=>item.id===record.id))bookingPastExtras.push({...record});
    state.bookingLatestCancelId=null;
    state.bookingLatestCancelReason='';
    state.bookingLatestCancelNote='';
    state.bookingCardMenuId=null;
    state.bookingTab='Past';
    state.detail=null;
    toast('Guest and Front Desk notified');
    render();
  },true);
}

/* Rebind the confirmation button after each sheet render so the vendor action owns the final submit. */
if(!window.__cabanaVendorCancelObserver){
  window.__cabanaVendorCancelObserver=true;
  const bindVendorCancelControls=()=>{
    const note=document.querySelector('[data-latest-cancel-note]');
    if(note&&!note.dataset.vendorCancelBound){
      note.dataset.vendorCancelBound='true';
      note.oninput=event=>{state.bookingLatestCancelNote=event.target.value;};
    }
    document.querySelectorAll('[data-latest-cancel-submit]').forEach(button=>{
      if(button.dataset.vendorCancelBound)return;
      button.dataset.vendorCancelBound='true';
      button.onclick=event=>{
        event.preventDefault();
        const modalReference=document.querySelector('.booking-decline-modal')?.textContent.match(/#([A-Z0-9-]+)/i)?.[1],cancelId=state.bookingLatestCancelId||modalReference,record=bookingLatestAll().find(item=>item.id===cancelId),reason=String(state.bookingLatestCancelReason||''),noteValue=String(state.bookingLatestCancelNote||note?.value||'').trim();
        if(!record||!reason||(reason==='Other'&&!noteValue))return;
        record.status='Cancelled';record.cancelledBy='vendor';record.cancelReason=reason;record.cancelNote=noteValue;
        if(/room/i.test(String(record.payment||''))||/awaiting checkout|pending/i.test(String(record.settlement||''))){record.roomChargeRemoved=true;record.payment='No charge';record.settlement='Cancelled — room charge removed'}
        if(!vendorCancelledRecords.some(item=>item.id===record.id))vendorCancelledRecords.push({...record});
        if(typeof bookingPastExtras!=='undefined'&&!bookingPastExtras.some(item=>item.id===record.id))bookingPastExtras.push({...record});
        state.bookingLatestCancelId=null;state.bookingLatestCancelReason='';state.bookingLatestCancelNote='';state.bookingCardMenuId=null;state.bookingTab='Past';state.detail=null;
        toast('Guest and Front Desk notified');
        render();
      };
    });
  };
  new MutationObserver(bindVendorCancelControls).observe(document.body,{childList:true,subtree:true});
  bindVendorCancelControls();
}

/* Cancellation is a two-step bottom sheet: choose a reason, then review it before submitting. */
if(!window.__cabanaCancelSheetStepsBound){
  window.__cabanaCancelSheetStepsBound=true;
  document.addEventListener('click',event=>{
    const reason=event.target.closest?.('[data-latest-cancel-reason]');
    if(reason){
      event.preventDefault();
      event.stopImmediatePropagation();
      state.bookingLatestCancelReason=reason.dataset.latestCancelReason||'';
      state.bookingLatestCancelStep='reason';
      render();
      return;
    }
    const back=event.target.closest?.('[data-latest-cancel-back]');
    if(back){
      event.preventDefault();
      event.stopImmediatePropagation();
      state.bookingLatestCancelStep='reason';
      state.bookingLatestCancelReason='';
      state.bookingLatestCancelNote='';
      render();
      return;
    }
    const trigger=event.target.closest?.('[data-latest-cancel]');
    if(trigger){
      state.bookingLatestCancelStep='reason';
      state.bookingLatestCancelReason='';
      state.bookingLatestCancelNote='';
      state.bookingLatestMenu=false;
      state.bookingCardMenuId=null;
      return;
    }
    const close=event.target.closest?.('[data-latest-cancel-close]');
    if(close){
      state.bookingLatestCancelStep='reason';
      state.bookingLatestCancelReason='';
      state.bookingLatestCancelNote='';
    }
  },true);
}

/* Cancellation sheet actions follow the standard secondary-left, confirm-right order. */
const bookingLatestCancelModalBeforeButtonOrder=bookingLatestCancelModal;
bookingLatestCancelModal=function(){
  let html=bookingLatestCancelModalBeforeButtonOrder();
  const swap=pattern=>{html=html.replace(pattern,(match,primary,keep)=>keep+primary)};
  swap(/(<button type="button" class="button primary" data-latest-cancel-next[^>]*>Confirm<\/button>)(<button type="button" class="button ghost" data-latest-cancel-close>Keep booking<\/button>)/);
  swap(/(<button type="button" class="button primary" data-latest-cancel-submit[^>]*>Confirm<\/button>)(<button type="button" class="button ghost" data-latest-cancel-close>Keep booking<\/button>)/);
  return html.replace('‹ Choose another reason','← Choose another reason');
};

/* Keep the confirmation-sheet back action explicit after every render. */
const renderBeforeCancelBackFix=render;
render=function(){
  renderBeforeCancelBackFix();
  document.querySelectorAll('[data-latest-cancel-back]').forEach(button=>button.onclick=event=>{
    event.preventDefault();
    event.stopPropagation();
    state.bookingLatestCancelStep='reason';
    state.bookingLatestCancelReason='';
    state.bookingLatestCancelNote='';
    render();
  });
};
render();

/* Final chat binding after every portal render override. */
const chatFinalRenderBase2=render;
render=function(){
  chatFinalRenderBase2();
  if(state.page!=='chat')return;
  document.querySelectorAll('[data-chat-filter]').forEach(button=>button.onclick=()=>{state.chatFilter=button.dataset.chatFilter;state.chatMobileOpen=false;const next=cabanaChatThreads.find(thread=>state.chatFilter==='All'||state.chatFilter==='Front Desk'&&thread.kind==='frontdesk'||state.chatFilter==='Guests'&&thread.kind==='guest');if(next)state.chatThread=next.id;render()});
  document.querySelectorAll('[data-chat-thread]').forEach(button=>button.onclick=()=>{state.chatThread=button.dataset.chatThread;state.chatMobileOpen=true;chatThreadById(state.chatThread).unread=0;render()});
  document.querySelectorAll('[data-chat-back]').forEach(button=>button.onclick=()=>{state.chatMobileOpen=false;render()});
  const form=document.querySelector('[data-chat-form]');
  if(form)form.onsubmit=event=>{event.preventDefault();const input=form.elements.message,text=String(input.value||'').trim();if(!text)return;const selected=chatThreadById(state.chatThread);selected.messages.push({from:'me',text,time:'now'});selected.preview=text;selected.time='now';render()};
};
render();

/* Final compact Chat route override. */
state.chatQuery=state.chatQuery||'';
const chatCompactMatches2=thread=>{const query=String(state.chatQuery||'').trim().toLowerCase();return !query||[thread.name,thread.hotel,thread.room,thread.preview,thread.booking,thread.role].filter(Boolean).join(' ').toLowerCase().includes(query)};
const chatCompactFilter2=thread=>state.chatFilter==='All'||state.chatFilter==='Unread'&&thread.unread>0||state.chatFilter==='Guests'&&thread.kind==='guest'||state.chatFilter==='Front Desk'&&thread.kind==='frontdesk';
function chatCompactRow2(thread){return '<button class="chat-compact-row '+(thread.unread?'is-unread ':'')+'" data-chat-thread="'+thread.id+'">'+chatAvatar(thread)+'<span class="chat-compact-copy"><span class="chat-compact-name"><strong>'+esc(thread.name)+'</strong>'+chatLabel(thread)+'</span><small>'+esc(thread.kind==='frontdesk'?thread.hotel:thread.hotel+' · Room '+thread.room)+'</small><span class="chat-compact-preview">'+(thread.booking?'<em>'+esc(thread.booking)+'</em> · ':'')+esc(thread.preview)+'</span></span><span class="chat-compact-meta"><time>'+esc(thread.time)+'</time>'+(thread.unread?'<b class="chat-count">'+thread.unread+'</b>':'')+'</span></button>'}
chatView=function(){const filters=['All','Unread','Guests','Front Desk'],filtered=cabanaChatThreads.filter(chatCompactFilter2).filter(chatCompactMatches2),thread=chatThreadById(state.chatThread);if(state.chatMobileOpen)return '<div class="chat-compact-page chat-compact-open"><header class="chat-compact-header"><button class="chat-compact-back" data-chat-back>‹ <span>Chat</span></button><button class="chat-settings" data-toast="Settings opened" aria-label="Chat settings">⚙</button></header>'+chatConversation(thread)+'</div>';return '<div class="chat-compact-page"><header class="chat-compact-header"><h1>Chat</h1><button class="chat-settings" data-toast="Settings opened" aria-label="Chat settings">⚙</button></header><div class="chat-compact-tools"><label class="chat-search" aria-label="Search conversations"><span>⌕</span><input data-chat-search value="'+esc(state.chatQuery)+'" placeholder="Search conversations…"></label><div class="chat-compact-filters" role="tablist">'+filters.map(filter=>'<button class="chat-filter '+(state.chatFilter===filter?'active':'')+'" data-chat-filter="'+filter+'">'+filter+'</button>').join('')+'</div></div><section class="chat-compact-list" aria-label="Conversations">'+(filtered.length?filtered.map(chatCompactRow2).join(''):'<p class="chat-compact-empty">No conversations found.</p>')+'</section></div>'};
const chatCompactRenderBase2=render;
render=function(){chatCompactRenderBase2();if(state.page!=='chat')return;document.querySelectorAll('[data-chat-filter]').forEach(button=>button.onclick=()=>{state.chatFilter=button.dataset.chatFilter;state.chatMobileOpen=false;render()});document.querySelectorAll('[data-chat-thread]').forEach(button=>button.onclick=()=>{state.chatThread=button.dataset.chatThread;state.chatMobileOpen=true;chatThreadById(state.chatThread).unread=0;render()});document.querySelectorAll('[data-chat-back]').forEach(button=>button.onclick=()=>{state.chatMobileOpen=false;render()});const search=document.querySelector('[data-chat-search]');if(search)search.oninput=event=>{state.chatQuery=event.target.value;render();const next=document.querySelector('[data-chat-search]');next?.focus();next?.setSelectionRange(state.chatQuery.length,state.chatQuery.length)}};
render();

/* Final reference-matched Chat route. */
state.chatSearchOpen=state.chatSearchOpen||false;
function cabanaThreadsForReferenceFinal(){return cabanaChatThreads}
function chatReferenceRowFinal(thread){return '<button class="chat-reference-row '+(thread.unread?'is-unread ':'')+'" data-chat-thread="'+thread.id+'">'+chatAvatar(thread)+'<span class="chat-reference-copy"><span class="chat-reference-title"><strong>'+esc(thread.name)+'</strong>'+chatLabel(thread)+'</span><small>'+esc(thread.kind==='frontdesk'?thread.hotel+' · Front Desk':thread.hotel+' · Room '+thread.room)+'</small><span class="chat-reference-preview">'+(thread.booking?'<em>'+esc(thread.booking)+'</em> · ':'')+esc(thread.preview)+'</span></span><span class="chat-reference-meta"><time>'+esc(thread.time)+'</time>'+(thread.unread?'<b class="chat-count">'+thread.unread+'</b>':'')+'</span></button>'}
chatView=function(){const filters=['All','Unread','Guests','Front Desk'],filtered=cabanaThreadsForReferenceFinal().filter(chatCompactFilter2).filter(chatCompactMatches2),thread=chatThreadById(state.chatThread);if(state.chatMobileOpen)return '<div class="chat-reference-page chat-reference-open"><header class="chat-reference-header"><button class="chat-reference-back" data-chat-back>‹ <span>Chat</span></button><button class="chat-settings" data-toast="Settings opened" aria-label="Chat settings">⚙</button></header>'+chatConversation(thread)+'</div>';return '<div class="chat-reference-page"><header class="chat-reference-header"><h1>Chat</h1><button class="chat-settings" data-toast="Settings opened" aria-label="Chat settings">⚙</button></header><div class="chat-reference-controls"><button class="chat-search-button '+(state.chatSearchOpen?'open':'')+'" data-chat-search-toggle aria-label="Search conversations">⌕</button>'+(state.chatSearchOpen?'<input class="chat-reference-search" data-chat-search value="'+esc(state.chatQuery)+'" placeholder="Search conversations…">':'')+'<div class="chat-reference-filters" role="tablist">'+filters.map(filter=>'<button class="chat-filter '+(state.chatFilter===filter?'active':'')+'" data-chat-filter="'+filter+'">'+filter+'</button>').join('')+'</div></div><section class="chat-reference-list" aria-label="Conversations">'+(filtered.length?filtered.map(chatReferenceRowFinal).join(''):'<p class="chat-compact-empty">No conversations found.</p>')+'</section></div>'};
const chatReferenceRenderFinal=render;
render=function(){chatReferenceRenderFinal();if(state.page!=='chat')return;document.querySelectorAll('[data-chat-filter]').forEach(button=>button.onclick=()=>{state.chatFilter=button.dataset.chatFilter;state.chatMobileOpen=false;render()});document.querySelectorAll('[data-chat-thread]').forEach(button=>button.onclick=()=>{state.chatThread=button.dataset.chatThread;state.chatMobileOpen=true;chatThreadById(state.chatThread).unread=0;render()});document.querySelectorAll('[data-chat-back]').forEach(button=>button.onclick=()=>{state.chatMobileOpen=false;render()});document.querySelectorAll('[data-chat-search-toggle]').forEach(button=>button.onclick=()=>{state.chatSearchOpen=!state.chatSearchOpen;render();document.querySelector('[data-chat-search]')?.focus()});const search=document.querySelector('[data-chat-search]');if(search)search.oninput=event=>{state.chatQuery=event.target.value;render();const next=document.querySelector('[data-chat-search]');next?.focus();next?.setSelectionRange(state.chatQuery.length,state.chatQuery.length)}};
render();

/* Menu information architecture: role-aware groups and profile header. */
const menuProfileForRole=()=>state.role==='Owner'?{business:'Lakbay Negros Rentals',name:'Leah Santos',role:'Owner',phone:'+63 917 555 0182',email:'leah@lakbaynegros.com'}:{business:'Lakbay Negros Rentals',name:'Marco Dela Cruz',role:'Staff',phone:'+63 917 555 0183',email:'marco@lakbaynegros.com'};
const menuSection=(title,rows)=>'<section class="menu-section"><h2>'+title+'</h2><div class="menu-section-list">'+rows.join('')+'</div></section>';
const menuProfileInitials=profile=>String(profile.name||'').split(/\s+/).map(part=>part[0]||'').join('').slice(0,2).toUpperCase();
const menuProfileHeader=profile=>'<button class="menu-profile-header" type="button" data-menu-account><span class="menu-profile-icon">'+esc(menuProfileInitials(profile))+'</span><span><strong>'+esc(profile.name)+'</strong><small>'+esc(profile.role)+' · '+esc(profile.business)+'</small></span><span class="menu-profile-action" aria-hidden="true">›</span></button>';
const menuRowFinal=(label,icon,attrs='')=>'<button class="menu-row" '+attrs+'><span class="menu-row-icon">'+navIcon(icon,false)+'</span><span>'+label+'</span>'+(attrs.includes('data-logout')?'':'<span class="menu-row-chevron" aria-hidden="true">›</span>')+'</button>';
const menuAccountView=profile=>'<div class="menu-account-page"><section class="menu-account-card"><span class="menu-account-avatar">'+esc(menuProfileInitials(profile))+'</span><div><h2>'+esc(profile.name)+'</h2><p>'+esc(profile.role)+' · '+esc(profile.business)+'</p></div></section><section class="menu-account-section"><h2>Personal details</h2><div class="menu-account-list"><div><strong>Phone</strong><span>'+esc(profile.phone)+'</span></div><div><strong>Email</strong><span>'+esc(profile.email)+'</span></div></div></section><section class="menu-account-section"><h2>Security and preferences</h2><div class="menu-account-list"><button type="button" data-toast="Password or PIN settings opened"><strong>Password or PIN</strong><span>Update your sign-in method <b>›</b></span></button><button type="button" data-toast="Language settings opened"><strong>Language</strong><span>English <b>›</b></span></button></div></section></div>';
const profileViewBeforeMenuAccount=profileView;
profileView=function(){return state.profileMode==='account'?menuAccountView(menuProfileForRole()):profileViewBeforeMenuAccount()};
menuView=function(){const owner=state.role==='Owner',profile=menuProfileForRole(),business=owner?[menuRowFinal('Insights','analytics-01','data-insights'),menuRowFinal('Earnings','wallet-01','data-page="earnings"'),menuRowFinal('Listings','grid-02','data-page="listings"'),menuRowFinal('Partner hotels','hotel-01','data-toast="Partner hotels opened"'),menuRowFinal('Staff accounts','user-group','data-toast="Staff accounts opened"')]:[menuRowFinal('Listings','grid-02','data-page="listings"'),menuRowFinal('Partner hotels','hotel-01','data-toast="Partner hotels opened"')];const settings=owner?[menuRowFinal('Business profile','store-01','data-business-profile'),menuRowFinal('Payout account','bank','data-toast="Payout account settings opened"'),menuRowFinal('Auto-messages','message-02','data-cx-booking-messages'),menuRowFinal('Notifications','notification-03','data-toast="Notification settings opened"')]:[menuRowFinal('Notifications','notification-03','data-toast="Notification settings opened"')];const support=[menuRowFinal('Help and support','help-circle','data-toast="Help center opened"'),menuRowFinal('Log out','logout-01','data-logout')];return '<div class="menu-page"><header class="menu-page-header"><h1>Menu</h1></header>'+menuProfileHeader(profile)+(business.length?menuSection('Business',business):'')+menuSection('Settings',settings)+menuSection('Support',support)+'</div>'};
const menuRenderFinal=render;
render=function(){menuRenderFinal();document.querySelector('#app')?.classList.toggle('menu-route',state.page==='menu');document.querySelectorAll('[data-menu-account]').forEach(button=>button.onclick=()=>{state.page='profile';state.profileMode='account';state.detail=null;render()});document.querySelectorAll('[data-business-profile]').forEach(button=>button.onclick=()=>{state.page='profile';state.profileMode='business';state.detail=null;render()});document.querySelectorAll('[data-menu-back]').forEach(button=>button.onclick=()=>{state.page='menu';state.profileMode=null;state.detail=null;render()})};
render();

/* Home new-request awareness: keep arrivals discoverable without shifting the queue. */
state.dashboardNewRequestFlashed=state.dashboardNewRequestFlashed||[];
const dashboardNewRequestIds=()=>{const shown=new Set(dashboardOperationalPending().map(order=>order.id));return [...new Set((state.dashboardNewPendingRequests||[]).filter(id=>shown.has(id)&&orders.some(order=>order.id===id&&order.status==='Pending')))];};
const dashboardNewRequestCard=id=>[...document.querySelectorAll('[data-dashboard-request-view]')].find(node=>node.dataset.dashboardRequestView===id)?.closest('.dashboard-request-card');
const dashboardNewRequestHeaderBottom=()=>{const header=document.querySelector('.dashboard-operational-header'),rect=header?.getBoundingClientRect();return rect?.bottom||0};
const dashboardNewRequestVisible=card=>{const rect=card?.getBoundingClientRect();if(!rect)return false;return rect.bottom>dashboardNewRequestHeaderBottom()&&rect.top<window.innerHeight};
const dashboardFlashNewRequestCard=id=>{const card=dashboardNewRequestCard(id);if(!card)return;state.dashboardNewRequestFlashed=[...new Set([...(state.dashboardNewRequestFlashed||[]),id])];card.classList.add('dashboard-request-seen-flash');setTimeout(()=>card.classList.remove('dashboard-request-seen-flash'),2000)};
function dashboardNewRequestAwarenessSchedule(){if(window.__cabanaNewRequestAwarenessFrame)return;window.__cabanaNewRequestAwarenessFrame=requestAnimationFrame(()=>{window.__cabanaNewRequestAwarenessFrame=0;dashboardUpdateNewRequestAwareness()})}
function dashboardUpdateNewRequestAwareness(){if(state.page!=='dashboard')return;const ids=dashboardNewRequestIds(),marker=document.querySelector('[data-dashboard-new-request-indicator]');if(!marker)return;if(!ids.length){marker.classList.remove('is-visible');return}const visible=ids.filter(id=>dashboardNewRequestVisible(dashboardNewRequestCard(id))),offscreen=ids.filter(id=>!dashboardNewRequestVisible(dashboardNewRequestCard(id)));visible.forEach(id=>{if(!(state.dashboardNewRequestFlashed||[]).includes(id))dashboardFlashNewRequestCard(id)});if(!offscreen.length){marker.classList.remove('is-visible');return}const target=dashboardNewRequestCard(offscreen[0]),rect=target?.getBoundingClientRect(),arrow=rect&&rect.bottom<=dashboardNewRequestHeaderBottom()?'↑':'↓';marker.textContent='New Requests '+arrow;marker.classList.add('is-visible')}
if(!window.__cabanaNewRequestAwarenessBound){window.__cabanaNewRequestAwarenessBound=true;document.addEventListener('scroll',dashboardNewRequestAwarenessSchedule,true);window.addEventListener('resize',dashboardNewRequestAwarenessSchedule);document.addEventListener('click',event=>{const marker=event.target.closest?.('[data-dashboard-new-request-indicator]');if(!marker)return;event.preventDefault();event.stopPropagation();const ids=dashboardNewRequestIds(),targetId=ids.find(id=>!dashboardNewRequestVisible(dashboardNewRequestCard(id)))||ids[0],card=dashboardNewRequestCard(targetId);if(!targetId||!card)return;marker.classList.remove('is-visible');clearPendingRequestIndicator(targetId);dashboardFlashNewRequestCard(targetId);card.scrollIntoView({block:'center',behavior:'smooth'});dashboardNewRequestAwarenessSchedule()},true)}
const homeNewRequestAwarenessRenderBase=render;
render=function(){homeNewRequestAwarenessRenderBase();if(state.page==='dashboard')requestAnimationFrame(dashboardUpdateNewRequestAwareness)};
render();

/* Final Past filters: status is multi-select and stays first in the bottom sheet. */
const bookingPastStatusOptionsFinal=['Completed','Declined','Expired','Cancelled'];
const bookingLatestSelectedStatusesFinal=()=>{
  const value=state.bookingLatestFilters?.status;
  if(Array.isArray(value))return value.filter(item=>bookingPastStatusOptionsFinal.includes(item));
  return value&&value!=='All statuses'&&bookingPastStatusOptionsFinal.includes(value)?[value]:[];
};
state.bookingLatestFilters=state.bookingLatestFilters||{};
state.bookingLatestFilters.status=bookingLatestSelectedStatusesFinal();
const bookingLatestRowsBeforePastStatusFilter=bookingLatestRows;
bookingLatestRows=function(){
  const rows=bookingLatestRowsBeforePastStatusFilter();
  if(state.bookingTab!=='Past')return rows;
  const selected=bookingLatestSelectedStatusesFinal();
  if(!selected.length)return rows;
  return rows.filter(record=>{
    const status=record.autoCompleted?'Completed':String(record.status||'');
    return selected.includes(status);
  });
};
bookingLatestActiveFilterCount=function(){
  const f=state.bookingLatestFilters||{},selectedStatuses=bookingLatestSelectedStatusesFinal();
  return [f.date&&f.date!=='All dates',bookingLatestSelectedListings().length>0,selectedStatuses.length>0].filter(Boolean).length;
};
bookingLatestFilterSheet=function(){
  if(!state.bookingFilterOpen)return '';
  const f=state.bookingLatestFilters||{},selectedStatuses=bookingLatestSelectedStatusesFinal(),selectedListings=bookingLatestSelectedListings(),allListingsSelected=!selectedListings.length;
  const dateOptions=['All dates','Last 7 days','Last 30 days','This month','Last month','This year','Custom range…'];
  const dateChoice=value=>'<label class="booking-choice booking-choice-radio '+(f.date===value?'active':'')+'"><input type="radio" name="booking-date-filter" value="'+esc(value)+'" data-latest-filter-option="date" '+(f.date===value?'checked':'')+'><span class="booking-choice-indicator" aria-hidden="true"></span><span class="booking-choice-label">'+esc(value)+'</span></label>';
  const statusChoice=value=>{const checked=value==='All statuses'?!selectedStatuses.length:selectedStatuses.includes(value);return '<label class="booking-choice booking-choice-checkbox '+(checked?'active':'')+'"><input type="checkbox" name="booking-status-filter" value="'+esc(value)+'" data-latest-status-filter="'+esc(value)+'" '+(checked?'checked':'')+'><span class="booking-choice-indicator" aria-hidden="true"></span><span class="booking-choice-label">'+esc(value)+'</span></label>'};
  const listingChoice=value=>{const checked=value==='All listings'?allListingsSelected:selectedListings.includes(value);return '<label class="booking-choice booking-choice-checkbox '+(checked?'active':'')+'"><input type="checkbox" name="booking-listing-filter" value="'+esc(value)+'" data-latest-filter-option="listing" '+(checked?'checked':'')+'><span class="booking-choice-indicator" aria-hidden="true"></span><span class="booking-choice-label">'+esc(value)+'</span></label>'};
  const custom=f.date==='Custom range…'?'<div class="booking-custom-range"><label>From<input type="date" data-latest-custom-from value="'+esc(f.customFrom||'')+'"></label><label>To<input type="date" data-latest-custom-to value="'+esc(f.customTo||'')+'"></label></div>':'';
  const resultCount=bookingLatestRows().length;
  const statusSection=state.bookingTab==='Past'?'<fieldset><legend>Status</legend>'+statusChoice('All statuses')+bookingPastStatusOptionsFinal.map(statusChoice).join('')+'</fieldset>':'';
  return '<div class="booking-sheet-backdrop" data-latest-filter-close></div><section class="booking-filter-sheet" role="dialog" aria-modal="true"><div class="sheet-handle"></div><header><div><h2>Filters</h2><p>'+(state.bookingTab==='Past'?'Choose statuses, a date range, and listings.':'Choose a date range and listings.')+'</p></div><button data-latest-filter-close aria-label="Close filters">×</button></header>'+statusSection+'<fieldset><legend>Date</legend>'+dateOptions.map(dateChoice).join('')+'</fieldset>'+custom+'<fieldset><legend>Listing</legend>'+listingChoice('All listings')+listings.map(x=>listingChoice(x.name)).join('')+'</fieldset><div class="booking-filter-actions"><button class="button ghost" data-latest-filter-reset>Reset</button><button class="button primary" data-latest-filter-apply>Show '+resultCount+' bookings</button></div></section>';
};
bookingLatestWorkspace=function(){
  const tab=state.bookingTab==='Past'?'Past':'Active',rows=bookingLatestRows(),groups={};
  if(tab==='Past')groups.Past=rows;
  else rows.forEach(record=>{const group=bookingLatestGroup(record);(groups[group]||(groups[group]=[])).push(record)});
  const f=state.bookingLatestFilters||{},selectedStatuses=bookingLatestSelectedStatusesFinal(),selectedListings=bookingLatestSelectedListings(),filterCount=bookingLatestActiveFilterCount();
  const chips=[];
  if(f.date&&f.date!=='All dates')chips.push('<button class="booking-chip" data-latest-chip="date">'+esc(f.date)+' ×</button>');
  selectedStatuses.forEach(status=>chips.push('<button class="booking-chip" data-latest-status-chip="'+esc(status)+'">Status: '+esc(status)+' ×</button>'));
  selectedListings.forEach(listing=>chips.push('<button class="booking-chip" data-latest-chip="listing" data-latest-listing-chip="'+esc(listing)+'">'+esc(listing)+' ×</button>'));
  const body=Object.entries(groups).map(([group,items])=>'<section class="booking-group">'+(tab==='Past'?'':'<h2>'+esc(group)+'</h2>')+items.map(bookingLatestCard).join('')+'</section>').join('');
  const exportAction=tab==='Past'&&state.role==='Owner'?'<button class="booking-export-icon" data-latest-export aria-label="Export CSV" title="Export CSV"><i class="hgi-stroke hgi-download-04" aria-hidden="true"></i></button>':'';
  return '<div class="bookings-workspace final-bookings-workspace latest-bookings-workspace"><header class="dashboard-operational-header booking-page-header"><h1>Bookings</h1></header><nav class="bookings-tabs final-bookings-tabs" role="tablist"><button class="'+(tab==='Active'?'active':'')+'" data-latest-tab="Active">Active <b class="booking-tab-count">'+bookingLatestAll().filter(record=>bookingLatestActive(record)).length+'</b></button><button class="'+(tab==='Past'?'active':'')+'" data-latest-tab="Past">Past</button></nav><div class="bookings-tools"><div class="bookings-search"><i class="hgi-stroke hgi-search-01"></i><input data-latest-search value="'+esc(state.bookingQuery||'')+'" placeholder="Search guest, room, or booking number" aria-label="Search guest, room, or booking number"></div><button class="booking-filter-trigger" data-latest-filter-open><i class="hgi-stroke hgi-filter-horizontal"></i><span>Filters'+(filterCount?' ('+filterCount+')':'')+'</span></button>'+exportAction+'</div>'+(chips.length?'<div class="booking-chips">'+chips.join('')+'</div>':'')+(body||'<div class="bookings-empty"><strong>No '+tab.toLowerCase()+' bookings.</strong><span>Try changing your search or filters.</span></div>')+'</div>';
};
const pastStatusFilterRenderFinal=render;
render=function(){
  pastStatusFilterRenderFinal();
  const activeCount=bookingLatestAll().filter(record=>bookingLatestActive(record)).length;
  const activeTab=[...document.querySelectorAll('button')].find(button=>button.textContent.trim()==='Active');
  if(activeTab){
    activeTab.setAttribute('aria-label','Active ('+activeCount+')');
  }
  if(activeTab&&!activeTab.querySelector('.booking-tab-count')){
    const badge=document.createElement('b');
    badge.className='booking-tab-count';
    badge.textContent=String(activeCount);
    activeTab.appendChild(badge);
  }
  document.querySelectorAll('[data-latest-status-filter]').forEach(control=>control.onchange=()=>{
    const value=control.dataset.latestStatusFilter,selected=bookingLatestSelectedStatusesFinal();
    let next=[];
    if(value!=='All statuses'){
      next=control.checked?(selected.includes(value)?selected:selected.concat(value)):selected.filter(item=>item!==value);
      if(next.length===bookingPastStatusOptionsFinal.length)next=[];
    }
    state.bookingLatestFilters.status=next;
    render();
  });
  document.querySelectorAll('[data-latest-filter-reset]').forEach(button=>button.onclick=()=>{state.bookingLatestFilters={date:'All dates',listing:[],type:'All',status:[]};render()});
  document.querySelectorAll('[data-latest-status-chip]').forEach(button=>button.onclick=()=>{state.bookingLatestFilters.status=bookingLatestSelectedStatusesFinal().filter(item=>item!==button.dataset.latestStatusChip);render()});
};
render();

/* Project Plaza-inspired Chat header with Cabana conversation content. */
chatView=function(){const filters=['All','Unread','Guests','Front Desk'],filtered=cabanaThreadsForReferenceFinal().filter(chatCompactFilter2).filter(chatCompactMatches2),thread=chatThreadById(state.chatThread);if(state.chatMobileOpen)return '<div class="chat-reference-page chat-reference-open"><header class="chat-reference-header chat-reference-header-open"><button class="chat-reference-back" data-chat-back>‹ <span>Chats</span></button><button class="chat-settings" data-toast="Settings opened" aria-label="Chat settings">⚙</button></header>'+chatConversation(thread)+'</div>';return '<div class="chat-reference-page"><header class="chat-reference-header chat-plaza-header"><button class="chat-settings chat-header-settings" data-toast="Settings opened" aria-label="Chat settings">⚙</button><h1>Chats</h1><span class="chat-header-actions"><button data-toast="Edit conversations opened">Edit</button><button class="chat-add" data-toast="New chat opened" aria-label="New chat">+</button></span></header><div class="chat-reference-controls"><button class="chat-search-button '+(state.chatSearchOpen?'open':'')+'" data-chat-search-toggle aria-label="Search conversations">⌕</button>'+(state.chatSearchOpen?'<input class="chat-reference-search" data-chat-search value="'+esc(state.chatQuery)+'" placeholder="Search conversations…">':'')+'<div class="chat-reference-filters" role="tablist">'+filters.map(filter=>'<button class="chat-filter '+(state.chatFilter===filter?'active':'')+'" data-chat-filter="'+filter+'">'+filter+'</button>').join('')+'</div></div><section class="chat-reference-list" aria-label="Conversations">'+(filtered.length?filtered.map(chatReferenceRowFinal).join(''):'<p class="chat-compact-empty">No conversations found.</p>')+'</section></div>'};
const chatPlazaRenderBase=render;
render=function(){chatPlazaRenderBase();if(state.page!=='chat')return;document.querySelectorAll('[data-chat-filter]').forEach(button=>button.onclick=()=>{state.chatFilter=button.dataset.chatFilter;state.chatMobileOpen=false;render()});document.querySelectorAll('[data-chat-thread]').forEach(button=>button.onclick=()=>{state.chatThread=button.dataset.chatThread;state.chatMobileOpen=true;chatThreadById(state.chatThread).unread=0;render()});document.querySelectorAll('[data-chat-back]').forEach(button=>button.onclick=()=>{state.chatMobileOpen=false;render()});document.querySelectorAll('[data-chat-search-toggle]').forEach(button=>button.onclick=()=>{state.chatSearchOpen=!state.chatSearchOpen;render();document.querySelector('[data-chat-search]')?.focus()});const search=document.querySelector('[data-chat-search]');if(search)search.oninput=event=>{state.chatQuery=event.target.value;render();const next=document.querySelector('[data-chat-search]');next?.focus();next?.setSelectionRange(state.chatQuery.length,state.chatQuery.length)}};
render();

/* Refresh recovery: render Chat directly after legacy startup wrappers. */
const chatRefreshRecoveryBaseFinal=render;
render=function(){
  if(state.page==='insights')state.page='dashboard';
  if(state.page!=='chat'){chatRefreshRecoveryBaseFinal();return}
  rememberLastView();
  document.querySelector('#app').innerHTML=shell3(view());
  document.querySelector('#app').insertAdjacentHTML('beforeend',devTools()+filterSheet()+listingFilterSheetMarkup());
  bind();
  document.querySelectorAll('[data-chat-filter]').forEach(button=>button.onclick=()=>{state.chatFilter=button.dataset.chatFilter;state.chatMobileOpen=false;render()});
  document.querySelectorAll('[data-chat-thread]').forEach(button=>button.onclick=()=>{state.chatThread=button.dataset.chatThread;state.chatMobileOpen=true;chatThreadById(state.chatThread).unread=0;render()});
  document.querySelectorAll('[data-chat-back]').forEach(button=>button.onclick=()=>{state.chatMobileOpen=false;render()});
  document.querySelectorAll('[data-chat-search-toggle]').forEach(button=>button.onclick=()=>{state.chatSearchOpen=!state.chatSearchOpen;render();document.querySelector('[data-chat-search]')?.focus()});
  const search=document.querySelector('[data-chat-search]');
  if(search)search.oninput=event=>{state.chatQuery=event.target.value;render();const next=document.querySelector('[data-chat-search]');next?.focus();next?.setSelectionRange(state.chatQuery.length,state.chatQuery.length)};
};
cabanaBooting=false;
state.page=cabanaInitialPage;
state.detail=null;
render();

/* Compact Chats inbox: Project Plaza layout with Cabana content and floating navigation. */
const chatInboxConversationView=chatView;
const chatInboxAvatar=thread=>thread.kind==='frontdesk'?'<span class="chat-inbox-avatar is-frontdesk" aria-hidden="true"><i class="hgi-stroke hgi-home-01"></i></span>':'<span class="chat-inbox-avatar is-guest" aria-hidden="true">'+esc(thread.icon)+'</span>';
const chatInboxTag=thread=>thread.kind==='frontdesk'?'<span class="chat-inbox-tag is-frontdesk">Front Desk</span>':'<span class="chat-inbox-tag is-guest">Guest</span>';
const chatInboxRow=thread=>'<button class="chat-inbox-row'+(thread.unread?' is-unread':'')+'" data-chat-thread="'+thread.id+'">'+chatInboxAvatar(thread)+'<span class="chat-inbox-copy"><span class="chat-inbox-title"><strong>'+esc(thread.name)+'</strong>'+chatInboxTag(thread)+'</span><span class="chat-inbox-preview">'+(thread.booking?'<b>'+esc(thread.booking)+'</b> · ':'')+esc(thread.preview)+'</span></span><span class="chat-inbox-meta"><time>'+esc(thread.time)+'</time>'+(thread.unread?'<b class="chat-inbox-badge" aria-label="'+thread.unread+' unread">'+thread.unread+'</b>':'')+'</span></button>';
const chatInboxMatches=thread=>{const query=String(state.chatQuery||'').trim().toLowerCase();if(!query)return true;const messages=(thread.messages||[]).map(message=>message.text||'');return [thread.name,thread.hotel,thread.room?'Room '+thread.room:'',thread.preview,thread.booking,thread.kind==='frontdesk'?'Front Desk':'Guest',...messages].filter(Boolean).join(' ').toLowerCase().includes(query)};
chatView=function(){
  if(state.chatMobileOpen)return chatInboxConversationView();
  const filters=['All','Unread','Guests','Front Desk'],searching=Boolean(state.chatSearchOpen);
  const filtered=cabanaThreadsForReferenceFinal().filter(thread=>searching||chatCompactFilter2(thread)).filter(chatInboxMatches);
  const controls=searching
    ?'<div class="chat-inbox-controls is-searching"><label class="chat-inbox-field"><i class="hgi-stroke hgi-search-01" aria-hidden="true"></i><input type="search" data-chat-search value="'+esc(state.chatQuery||'')+'" placeholder="Search people or messages" aria-label="Search people or messages" autocomplete="off"></label><button class="chat-inbox-cancel" type="button" data-chat-search-close>Cancel</button></div>'
    :'<div class="chat-inbox-controls" role="tablist" aria-label="Filter conversations"><button class="chat-inbox-search-toggle" type="button" data-chat-search-toggle aria-label="Search conversations"><i class="hgi-stroke hgi-search-01" aria-hidden="true"></i></button>'+filters.map(filter=>'<button class="chat-inbox-chip'+(state.chatFilter===filter?' is-active':'')+'" type="button" role="tab" aria-selected="'+(state.chatFilter===filter)+'" data-chat-filter="'+filter+'">'+filter+'</button>').join('')+'</div>';
  const empty=searching&&String(state.chatQuery||'').trim()?'No people or messages match “'+esc(String(state.chatQuery).trim())+'”.':'No conversations found.';
  return '<div class="chat-inbox-page">'
    +'<header class="chat-inbox-header"><h1>Chats</h1><button class="chat-inbox-new" type="button" data-toast="New message opened" aria-label="New message"><i class="hgi-stroke hgi-add-01" aria-hidden="true"></i></button></header>'
    +controls
    +'<section class="chat-inbox-list" aria-label="Conversations">'+(filtered.length?filtered.map(chatInboxRow).join(''):'<p class="chat-inbox-empty">'+empty+'</p>')+'</section>'
    +'</div>';
};
const chatInboxSearchRenderBase=render;
render=function(){
  chatInboxSearchRenderBase.apply(this,arguments);
  if(state.page!=='chat'||state.chatMobileOpen)return;
  const close=()=>{state.chatSearchOpen=false;state.chatQuery='';render()};
  document.querySelectorAll('[data-chat-search-close]').forEach(button=>button.onclick=close);
  const field=document.querySelector('[data-chat-search]');
  if(field)field.onkeydown=event=>{if(event.key==='Escape'){event.preventDefault();close()}};
};
render();

/* Final shared booking-card skeleton for Home and Bookings → Active. */
const homeCardGuestRoom=record=>[record.guest,record.room?'Room '+record.room:''].filter(Boolean).join(' · ');
const homeCardDateQuantity=record=>{
  const schedule=String(record.when||'Scheduled time not set').replace(/\s*·\s*\d+\s+(?:hours?|minutes?)\b/i,'').trim();
  return [schedule,homeQuantityWithoutBaggage(record.quantity)].filter(Boolean).join(' · ');
};
const homeCardPayment=record=>{
  const raw=String(record.payment||'')+' '+String(record.settlement||'');
  const type=/room/i.test(raw)?'Charged to room':'Pay via QR';
  const status=/paid|posted|payout|checkout/i.test(raw)&&!/(pending|unpaid|awaiting)/i.test(raw)?'Paid':'Unpaid';
  return type+' · '+status;
};
const homeCardAmount=value=>String(value||'').replace(/\.00\b/g,'');

dashboardOperationalRequestCard=function(order){
  const isNew=(state.dashboardNewPendingRequests||[]).includes(order.id)&&!(state.dashboardSeenRequests||[]).includes(order.id);
  const processing=state.dashboardRequestProcessing===order.id;
  const guestRoom=homeCardGuestRoom(order),payment=homeCardPayment(order),schedule=homeCardScheduleMarkup(order),minutes=homeCardTimerMinutes(order);
  return '<article class="dashboard-request-card '+(isNew?'unseen':'seen')+'"><button class="dashboard-request-main" data-dashboard-request-view="'+esc(order.id)+'">'
    +'<div class="dashboard-request-reference-row"><span class="dashboard-request-reference-group"><small>#'+esc(displayBookingReference(order.id))+'</small>'+(isNew?'<span class="dashboard-request-new-pill">New</span>':'')+'</span><strong class="dashboard-request-timer '+(minutes<15?'critical':'')+'">'+esc(homeCardTimerLabel(order))+'</strong></div>'
    +'<h3>'+esc(order.item)+'</h3>'
    +'<p>'+esc(schedule.inline)+'</p>'
    +(schedule.second?'<small class="dashboard-request-quantity">'+esc(schedule.second)+'</small>':'')
    +(guestRoom?'<small class="dashboard-request-guest-room">'+esc(guestRoom)+'</small>':'')
    +(state.role==='Owner'?'<small class="dashboard-request-financial">'+esc(homeCardAmount(order.total))+' · '+esc(payment)+'</small>':'')
    +'</button><div class="dashboard-request-footer"><div class="dashboard-request-actions"><button class="secondary" '+(processing?'disabled':'')+' data-dashboard-request-action="decline" data-dashboard-request-id="'+esc(order.id)+'">Decline</button><button '+(processing?'disabled':'')+' data-dashboard-request-action="confirm" data-dashboard-request-id="'+esc(order.id)+'">'+(processing?'Processing…':'Confirm')+'</button></div></div></article>';
};

dashboardOperationalBookingRow=function(order){
  const status=dashboardOperationalStatus(order),guestRoom=homeCardGuestRoom(order),schedule=homeCardScheduleMarkup(order);
  return '<button class="dashboard-booking-row" data-detail="'+esc(order.id)+'"><span class="dashboard-booking-main">'
    +'<span class="dashboard-request-reference-row"><small class="dashboard-booking-reference">#'+esc(displayBookingReference(order.id))+'</small><em class="dashboard-booking-status '+status.toLowerCase().replaceAll(' ','-')+'">'+esc(status)+'</em></span>'
    +'<strong class="dashboard-booking-title">'+esc(order.item)+'</strong>'
    +'<small class="dashboard-booking-summary">'+esc(schedule.inline)+'</small>'
    +(schedule.second?'<small class="dashboard-booking-quantity">'+esc(schedule.second)+'</small>':'')
    +(guestRoom?'<small class="dashboard-booking-guest-room">'+esc(guestRoom)+'</small>':'')
    +'<small class="dashboard-booking-payment">'+esc(homeCardPayment(order))+'</small>'
    +'</span></button>';
};

dashboardOperationalUpcoming=function(){
  const upcoming=orders.filter(order=>bookingActive(order)&&order.kind!=='Counter charge').slice().sort((a,b)=>{
    const aNow=['In progress','In use'].includes(a.status),bNow=['In progress','In use'].includes(b.status);
    if(aNow!==bNow)return aNow?-1:1;
    const aDate=dashboardOperationalOrderDate(a),bDate=dashboardOperationalOrderDate(b);
    return (aDate?aDate.getTime():Infinity)-(bDate?bDate.getTime():Infinity)||String(a.when||'').localeCompare(String(b.when||''));
  });
  const cards=upcoming.slice(0,3).map(order=>dashboardOperationalBookingRow(order)).join('');
  return '<section class="dashboard-operational-section dashboard-upcoming-section"><div class="dashboard-operational-heading"><div><h2>Upcoming bookings</h2></div><button class="dashboard-inline-link" data-open-active-bookings>View all ('+upcoming.length+') '+icons.arrow+'</button></div>'+(cards?'<div class="dashboard-booking-list">'+cards+'</div>':'<div class="dashboard-operational-empty">No upcoming bookings</div>')+'</section>';
};

bookingLatestCard=function(record){
  const past=state.bookingTab==='Past',status=bookingFinalDisplayStatus(record),next=past?'':bookingFinalNextAction(record),menu=state.bookingCardMenuId===record.id,canCancel=!past&&bookingLatestCanCancel(record),schedule=homeCardScheduleMarkup(record);
  const action=next?'<button class="booking-action primary '+(next==='Mark as completed'?'status-next-completed':'status-next-progress')+'" data-final-status-action="'+(next==='Mark as completed'?'complete':'progress')+'" data-final-status-id="'+esc(record.id)+'">'+esc(next)+'</button>':'';
  const more=!past?'<button class="booking-card-more" type="button" data-card-menu="'+esc(record.id)+'" aria-label="More booking actions">⋯</button>':'';
  const cardMenu=menu?'<div class="booking-card-menu"><button data-card-charge="'+esc(record.id)+'">Add charge</button><button data-card-message="'+esc(record.id)+'">Message guest</button>'+(canCancel?'<button class="danger" data-latest-cancel="'+esc(record.id)+'">Cancel booking</button>':'')+'</div>':'';
  return '<article class="booking-card final-booking-card latest-booking-card"><div class="booking-card-hit" role="button" tabindex="0" data-latest-detail="'+esc(record.id)+'"><span class="booking-main-line"><span class="booking-reference-line">#'+esc(displayBookingReference(record.id))+'</span><span class="booking-status '+String(status||'').toLowerCase().replaceAll(' ','-')+'">'+esc(status)+'</span></span><div class="booking-listing">'+esc(record.item)+'</div><div class="booking-line booking-card-schedule">'+esc(schedule.inline)+'</div>'+(schedule.second?'<div class="booking-line booking-card-quantity">'+esc(schedule.second)+'</div>':'')+'<div class="booking-line booking-card-guest-room">'+esc(homeCardGuestRoom(record))+'</div><div class="booking-line booking-card-payment">'+esc(homeCardPayment(record))+'</div>'+(record.cancelReason?'<div class="booking-line booking-cancellation-reason">'+esc(record.cancelledBy==='guest'?'Cancelled by guest':'Cancelled by vendor · '+record.cancelReason)+'</div>':'')+'</div>'+(action||more?'<div class="booking-actions">'+action+more+'</div>':'')+cardMenu+'</article>';
};

const bookingsWorkspaceFinalWithActiveCount=bookingsWorkspaceFinal;
bookingsWorkspaceFinal=function(){
  const html=bookingsWorkspaceFinalWithActiveCount();
  const count=bookingFinalRecords().filter(bookingFinalActive).length;
  return html.replace('>Active</button>','>Active <b class="booking-tab-count">'+count+'</b></button>');
};

render();

/* Keep the scroll position when the same screen re-renders (pending timers, simulations, filters). */
const renderBeforeScrollKeep=render;
render=function(){
  const viewKey=state.page+'|'+(state.detail||'')+'|'+(state.chatMobileOpen?'open':''),page=document.querySelector('.page');
  const top=page&&window.__cabanaRenderViewKey===viewKey?page.scrollTop:null;
  renderBeforeScrollKeep.apply(this,arguments);
  window.__cabanaRenderViewKey=state.page+'|'+(state.detail||'')+'|'+(state.chatMobileOpen?'open':'');
  if(top!==null&&window.__cabanaRenderViewKey===viewKey){const next=document.querySelector('.page');if(next&&next.scrollTop!==top)next.scrollTop=top}
};
window.__cabanaRenderViewKey=state.page+'|'+(state.detail||'')+'|'+(state.chatMobileOpen?'open':'');

/* Pending request details opened from Home return to Home, and the request is no longer new. */
if(!window.__cabanaHomeRequestReturnBound){
  window.__cabanaHomeRequestReturnBound=true;
  document.addEventListener('click',event=>{
    const open=event.target.closest?.('[data-dashboard-request-view]');
    if(open&&state.page==='dashboard'){
      state.requestDetailOrigin='dashboard';
      state.homeReturnScroll=document.querySelector('.page')?.scrollTop||0;
      clearPendingRequestIndicator(open.dataset.dashboardRequestView);
      return;
    }
    const back=event.target.closest?.('[data-latest-back]');
    if(back&&state.requestDetailOrigin==='dashboard'){
      event.preventDefault();
      event.stopImmediatePropagation();
      const id=state.detail,scroll=state.homeReturnScroll||0;
      if(id)clearPendingRequestIndicator(id);
      state.requestDetailOrigin=null;
      state.page='dashboard';
      state.detail=null;
      rememberLastView();
      render();
      const restore=()=>{const page=document.querySelector('.page');if(page&&state.page==='dashboard')page.scrollTop=scroll};
      restore();requestAnimationFrame(restore);setTimeout(restore,60);
    }
  },true);
}
const renderBeforeHomeRequestReturn=render;
render=function(){
  if(state.requestDetailOrigin==='dashboard'&&!(state.page==='orders'&&state.detail))state.requestDetailOrigin=null;
  renderBeforeHomeRequestReturn.apply(this,arguments);
  if(state.requestDetailOrigin==='dashboard')document.querySelectorAll('[data-latest-back]').forEach(button=>button.setAttribute('aria-label','Back to Home'));
};

/* Keep the sticky new-request pill steady across re-renders instead of fading it out and back in. */
const renderBeforeSteadyNewRequestPill=render;
render=function(){
  const before=document.querySelector('[data-dashboard-new-request-indicator]'),wasVisible=Boolean(before?.classList.contains('is-visible')&&state.page==='dashboard');
  renderBeforeSteadyNewRequestPill.apply(this,arguments);
  if(!wasVisible||state.page!=='dashboard')return;
  const marker=document.querySelector('[data-dashboard-new-request-indicator]');
  if(!marker)return;
  marker.style.transition='none';
  marker.classList.add('is-visible');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{marker.style.transition=''}));
};

/* The "New Requests" pill only tracks requests that arrived during this visit and have not been seen on screen yet. */
state.dashboardPillQueue=[];
window.__cabanaKnownNewRequests=new Set(state.dashboardNewPendingRequests||[]);
const dashboardPillIds=()=>{
  const shown=new Set(dashboardOperationalPending().map(order=>order.id)),seen=state.dashboardSeenRequests||[];
  state.dashboardPillQueue=(state.dashboardPillQueue||[]).filter(id=>shown.has(id)&&!seen.includes(id)&&orders.some(order=>order.id===id&&order.status==='Pending'));
  return state.dashboardPillQueue;
};
dashboardUpdateNewRequestAwareness=function(){
  if(state.page!=='dashboard')return;
  const marker=document.querySelector('[data-dashboard-new-request-indicator]');
  const ids=dashboardPillIds();
  ids.filter(id=>dashboardNewRequestVisible(dashboardNewRequestCard(id))).forEach(id=>{if(!(state.dashboardNewRequestFlashed||[]).includes(id))dashboardFlashNewRequestCard(id)});
  if(!marker)return;
  if(!ids.length){marker.classList.remove('is-visible');return}
  const target=ids.find(id=>!dashboardNewRequestVisible(dashboardNewRequestCard(id)))||ids[0];
  const rect=dashboardNewRequestCard(target)?.getBoundingClientRect();
  const arrow=rect&&rect.top<dashboardNewRequestHeaderBottom()?' ↑':' ↓';
  marker.textContent='New Requests'+arrow;
  marker.classList.add('is-visible');
};
const renderBeforeNewRequestPillQueue=render;
render=function(){
  const known=window.__cabanaKnownNewRequests,current=state.dashboardNewPendingRequests||[],arrivals=current.filter(id=>!known.has(id));
  [...known].forEach(id=>{if(!current.includes(id))known.delete(id)});
  arrivals.forEach(id=>known.add(id));
  if(arrivals.length)state.dashboardPillQueue=[...new Set([...(state.dashboardPillQueue||[]),...arrivals])];
  renderBeforeNewRequestPillQueue.apply(this,arguments);
  if(state.page==='dashboard'){
    const marker=document.querySelector('[data-dashboard-new-request-indicator]');
    if(marker&&!dashboardPillIds().length)marker.classList.remove('is-visible');
  }
};
window.addEventListener('click',event=>{
  const marker=event.target.closest?.('[data-dashboard-new-request-indicator]');
  if(!marker)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const ids=dashboardPillIds(),targetId=ids.find(id=>!dashboardNewRequestVisible(dashboardNewRequestCard(id)))||ids[0],card=dashboardNewRequestCard(targetId);
  if(!targetId||!card)return;
  dashboardFlashNewRequestCard(targetId);
  card.scrollIntoView({block:'center',behavior:'smooth'});
},true);

/* ===== Chat (Phase 1 spec): list, conversation, system cards, archiving, notifications. ===== */
const cxMonths={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
const cxToday='Oct 7',cxYesterday='Oct 6';
const cxNow=new Date(2026,9,7,20,0).getTime();
const cxStamp=(day,time)=>{const d=String(day||'').match(/([A-Z][a-z]{2})\s+(\d{1,2})/),t=String(time||'').match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);if(!d)return 0;let h=t?Number(t[1])%12+(/p/i.test(t[3])?12:0):23,m=t?Number(t[2]):59;return new Date(2026,cxMonths[d[1]]??9,Number(d[2]),h,m).getTime()};
const cxDayLabel=day=>day===cxToday?'Today':day===cxYesterday?'Yesterday':day;
const cxNowTime=()=>new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
const cxSender=()=>state.role==='Owner'?'Leah · Owner':'Marco · Staff';
const cxAmount=value=>String(value||'').replace(/\.00\b/g,'');
const cxBookingRef=id=>'#'+displayBookingReference(id);
const cxActiveStatuses=['Pending','Confirmed','Scheduled','In progress','In use','Ready'];
const cxAllBookings=()=>{const list=typeof bookingLatestAll==='function'?bookingLatestAll():[];const ids=new Set(list.map(item=>item.id));return list.concat(orders.filter(order=>order.status==='Pending'&&!ids.has(order.id)))};
const cxBooking=id=>cxAllBookings().find(item=>item.id===id);
const cxStatus=record=>{if(!record)return '';const status=typeof bookingFinalDisplayStatus==='function'?bookingFinalDisplayStatus(record):record.status;return status==='Scheduled'?'Confirmed':status};
const cxStatusClass=status=>'cx-status-'+String(status||'').toLowerCase().replace(/[^a-z]+/g,'-');
const cxBookingEnd=record=>{const text=String(record?.when||''),dates=[...text.matchAll(/([A-Z][a-z]{2})\s+(\d{1,2})(?:\s*[·,]\s*(\d{1,2}:\d{2}\s*[AP]M))?/g)];if(!dates.length)return 0;const last=dates[dates.length-1];let end=cxStamp(last[1]+' '+last[2],last[3]||'11:59 PM');const hours=text.match(/·\s*(\d+)\s*hours?\s*$/i),days=dates.length===1&&text.match(/·\s*(\d+)\s*days?\s*$/i);if(hours)end+=Number(hours[1])*3600000;else if(days)end+=Number(days[1])*86400000;else if(dates.length===1&&last[3])end+=2*3600000;return end};
const cxThreads=[
  {id:'fd-luna',kind:'frontdesk',hotel:'Henry’s Resort Dumaguete',unread:1,messages:[
    {day:cxYesterday,time:'4:10 PM',from:'them',text:'Hi! Guest in Room 314 wants a van for a day trip.'},
    {day:cxYesterday,time:'4:14 PM',from:'system',kind:'created',booking:'CB-9001',text:'Booking #BK-9001 created by Front Desk for Room 314'},
    {day:cxYesterday,time:'4:20 PM',from:'me',sender:'Ana · Staff',status:'read',text:'Got it. The van will be ready at 9:00 AM.'},
    {day:cxToday,time:'10:42 AM',from:'them',text:'Can you take 2 more pax tomorrow?'}]},
  {id:'g-marco',kind:'guest',name:'Marco Santos',room:'508',hotel:'Henry’s Resort Dumaguete',unread:2,messages:[
    {day:cxToday,time:'9:02 AM',from:'system',kind:'confirmed',booking:'BK-9003',text:'Booking #BK-9003 confirmed · Today 4:30 PM'},
    {day:cxToday,time:'9:40 AM',from:'them',text:'Hi! What time should I be at the lobby?'},
    {day:cxToday,time:'9:44 AM',from:'me',sender:'Leah · Owner',status:'read',text:'Please be at the lobby by 4:15 PM. Your driver will message you here.'},
    {day:cxToday,time:'10:30 AM',from:'them',text:'Is the SUV big enough for 4 suitcases?'},
    {day:cxToday,time:'10:31 AM',from:'them',text:'What time is pickup?'}]},
  {id:'g-amelia',kind:'guest',name:'Amelia Reyes',room:'508',hotel:'Henry’s Resort Dumaguete',unread:0,messages:[
    {day:cxYesterday,time:'6:05 PM',from:'system',kind:'confirmed',booking:'CB-9007',text:'Booking #BK-9007 confirmed · Oct 7 4:30 PM'},
    {day:cxYesterday,time:'6:20 PM',from:'them',text:'Can we keep the car for an extra hour?'},
    {day:cxYesterday,time:'6:24 PM',from:'me',sender:'Ana · Staff',status:'read',text:'Yes, we can. I’ve added the extra hour.'},
    {day:cxYesterday,time:'6:25 PM',from:'system',kind:'charge',booking:'CB-9007',text:'Extra charge ₱500 · Extra hour'},
    {day:cxToday,time:'8:12 AM',from:'system',kind:'confirmed',booking:'CB-9010',text:'Booking #BK-9010 confirmed · Oct 9 8:30 AM'},
    {day:cxToday,time:'8:20 AM',from:'me',sender:'Leah · Owner',status:'failed',text:'See you at the lobby at 4:30 PM today.'}]},
  {id:'g-maya',kind:'guest',name:'Maya Tan',room:'314',hotel:'Henry’s Resort Dumaguete',unread:0,messages:[
    {day:'Oct 2',time:'3:15 PM',from:'them',text:'Do you have a van for the airport tomorrow?'},
    {day:'Oct 2',time:'3:20 PM',from:'me',sender:'Ana · Staff',status:'read',text:'We do. Please send the request in the app and we’ll confirm.'},
    {day:cxToday,time:'7:30 AM',from:'divider',booking:'CB-9001',text:'New booking #BK-9001 · Oct 6'},
    {day:cxToday,time:'7:32 AM',from:'me',sender:'Ana · Staff',status:'read',text:'Hi Maya, your van is booked for 9:00 AM tomorrow. See you at the lobby.'},
    {day:cxToday,time:'7:50 AM',from:'them',text:'Perfect, thank you!'}]},
  {id:'g-sofia',kind:'guest',name:'Sofia Lim',room:'602',hotel:'Henry’s Resort Dumaguete',unread:0,messages:[
    {day:cxToday,time:'9:55 AM',from:'me',sender:'Leah · Owner',status:'read',text:'Your driver is at the lobby.'},
    {day:cxToday,time:'11:40 AM',from:'them',text:'Made it to the airport. Thanks!'}]},
  {id:'g-nina',kind:'guest',name:'Nina Garcia',room:'203',hotel:'Henry’s Resort Dumaguete',unread:0,messages:[
    {day:cxYesterday,time:'9:15 AM',from:'them',text:'Thanks, see you at the lobby!'},
    {day:cxYesterday,time:'9:18 AM',from:'me',sender:'Ana · Staff',status:'read',text:'You’re welcome. We’ll see you there.'}]},
  {id:'g-oliver',kind:'guest',name:'Oliver Brown',room:'205',hotel:'Henry’s Resort Dumaguete',unread:0,messages:[
    {day:cxYesterday,time:'7:45 AM',from:'me',sender:'Ana · Staff',status:'read',text:'Good morning! Your van is outside.'},
    {day:cxYesterday,time:'6:30 PM',from:'them',text:'Great day out. Thanks for the ride!'}]},
  {id:'g-priya',kind:'guest',name:'Priya Shah',room:'412',hotel:'Henry’s Resort Dumaguete',unread:0,messages:[
    {day:'Oct 2',time:'9:00 AM',from:'system',kind:'cancelled',text:'Booking cancelled · Weather'},
    {day:'Oct 3',time:'10:05 AM',from:'divider',booking:'CB-8812',text:'New booking #BK-8812 · Oct 3'},
    {day:'Oct 3',time:'6:40 PM',from:'me',sender:'Leah · Owner',status:'read',text:'Your sedan is at the lobby.'},
    {day:'Oct 3',time:'9:10 PM',from:'them',text:'Arrived safely. Thank you!'}]}
];
const cxThreadSeed=JSON.parse(JSON.stringify(cxThreads));
const cxResetChatThreads=()=>{const clean=JSON.parse(JSON.stringify(cxThreadSeed));cxThreads.splice(0,cxThreads.length,...clean);state.cxDraft='';};
cxResetChatThreads();
const cxDefaultBookingTemplate='Hi {guest name}! Your {listing} on {date & time} is confirmed. We’ll message you here if anything changes. See you soon!';
try{state.cxBookingTemplate=localStorage.getItem('cabana:booking-message-template')||cxDefaultBookingTemplate}catch(error){state.cxBookingTemplate=cxDefaultBookingTemplate}
const cxBookingMessageBusiness=()=>{try{return menuProfileForRole?.().business||'Lakbay Negros Rentals'}catch(error){return 'Lakbay Negros Rentals'}};
const cxBookingMessageText=record=>String(state.cxBookingTemplate||cxDefaultBookingTemplate).replaceAll('{guest name}',String(record.guest||'guest').split(' ')[0]).replaceAll('{listing}',String(record.item||'your booking')).replaceAll('{date & time}',cxWhenLabel(record)).replaceAll('{booking number}',cxBookingRef(record.id));
const cxGuestThreadForBooking=record=>{
  let thread=cxThreads.find(item=>item.kind==='guest'&&item.name===record.guest&&String(item.room)===String(record.room)&&item.hotel===record.hotel);
  if(!thread){thread={id:'g-'+String(record.guest||'guest').toLowerCase().replace(/[^a-z]+/g,'-')+'-'+String(record.room||'room'),kind:'guest',name:record.guest,room:String(record.room||''),hotel:record.hotel||'Henry’s Resort Dumaguete',unread:0,messages:[]};cxThreads.push(thread)}
  return thread;
};
const cxSendBookingConfirmation=record=>{
  if(!record||record.status!=='Confirmed'||record.kind==='Counter charge')return null;
  const thread=cxGuestThreadForBooking(record),already=thread.messages.some(message=>message.from==='auto'&&message.booking===record.id);
  if(!already){
    const message={day:cxToday,time:cxNowTime(),from:'auto',sender:cxBookingMessageBusiness(),booking:record.id,text:cxBookingMessageText(record)};
    thread.messages.push(message);thread.preview=message.text;thread.time=message.time;
  }
  state.page='chat';state.detail=null;state.cx.view='thread';state.cx.threadId=thread.id;state.cxDraft='';
  return thread;
};
if(!window.__cxConfirmationBridge){
  window.__cxConfirmationBridge=true;
  document.addEventListener('click',event=>{
    const trigger=event.target.closest?.('[data-dashboard-request-action="confirm"],[data-request-detail-action="confirm"]');
    if(!trigger)return;
    const delay=trigger.matches('[data-dashboard-request-action]')?350:20;
    setTimeout(()=>{
      const id=trigger.dataset.dashboardRequestId||trigger.dataset.requestDetailId,record=orders.find(item=>item.id===id)||((typeof bookingLatestAll==='function')?bookingLatestAll().find(item=>item.id===id):null);
      if(record?.status==='Confirmed'){cxSendBookingConfirmation(record);render()}
    },delay);
  },true);
}
state.cx=state.cx||{view:'list',filter:'All',query:'',threadId:null,showAllBookings:false,bookingsSheet:false};
state.cx.bookingsSheet=Boolean(state.cx.bookingsSheet);
state.cxDraft=state.cxDraft||'';
try{state.cxSound=localStorage.getItem('cabana:chat-sound')||'Default'}catch(error){state.cxSound='Default'}
const cxThread=id=>cxThreads.find(thread=>thread.id===id);
const cxGuestBookings=thread=>thread.kind!=='guest'?[]:cxAllBookings().filter(item=>item.guest===thread.name&&String(item.room)===String(thread.room));
const cxActiveBookings=thread=>cxGuestBookings(thread).filter(item=>cxActiveStatuses.includes(item.status));
const cxBookingPriority=record=>{const status=cxStatus(record);if(status==='Pending')return 0;if(['In progress','In use','Ready'].includes(status))return 1;if(status==='Confirmed')return 2;return 3};
const cxBookingOrder=(a,b)=>{const aPriority=cxBookingPriority(a),bPriority=cxBookingPriority(b);if(aPriority!==bPriority)return aPriority-bPriority;return aPriority>=3?cxBookingEnd(b)-cxBookingEnd(a):cxBookingEnd(a)-cxBookingEnd(b)};
const cxSortedBookings=thread=>cxGuestBookings(thread).filter(item=>cxStatus(item)!=='Pending').sort(cxBookingOrder);
const cxPrimaryBooking=thread=>cxSortedBookings(thread)[0];
const cxLastStamp=thread=>{const last=thread.messages[thread.messages.length-1];return last?cxStamp(last.day,last.time):0};
const cxIsArchived=thread=>{
  if(thread.kind!=='guest')return false;
  const bookings=cxGuestBookings(thread);
  if(!bookings.length||bookings.some(item=>item.status!=='Pending'&&cxActiveStatuses.includes(item.status)))return false;
  const lastEnd=Math.max(...bookings.map(cxBookingEnd),0);
  return lastEnd>0&&cxNow>lastEnd+86400000;
};
const cxUnreadTotal=()=>cxThreads.filter(thread=>!cxIsArchived(thread)).reduce((sum,thread)=>sum+(thread.unread||0),0);
const cxPreview=thread=>{const last=[...thread.messages].reverse().find(message=>message.from!=='divider');if(!last)return 'No messages yet.';return last.from==='me'?'You: '+last.text:last.text};
const cxRowTime=thread=>{const last=thread.messages[thread.messages.length-1];if(!last)return '';return last.day===cxToday?last.time:cxDayLabel(last.day)};
const cxTitle=thread=>thread.kind==='frontdesk'?thread.hotel+' · Front Desk':thread.name+' · Room '+thread.room;
const cxInitials=name=>String(name||'').split(/\s+/).map(part=>part[0]||'').join('').slice(0,2).toUpperCase();
const cxAvatar=thread=>thread.kind==='frontdesk'
  ?'<span class="cx-avatar is-frontdesk" aria-hidden="true"><i class="hgi-stroke hgi-building-03"></i></span>'
  :'<span class="cx-avatar is-guest" aria-hidden="true">'+esc(cxInitials(thread.name))+'<i class="hgi-stroke hgi-user"></i></span>';
const cxRoleTag=thread=>thread.kind==='frontdesk'?'<span class="cx-role is-frontdesk"><i class="hgi-stroke hgi-building-03" aria-hidden="true"></i>Front Desk</span>':'<span class="cx-role is-guest"><i class="hgi-stroke hgi-user" aria-hidden="true"></i>Guest</span>';
const cxMatches=thread=>{
  const query=String(state.cx.query||'').trim().toLowerCase();if(!query)return true;
  const refs=cxGuestBookings(thread).filter(item=>cxStatus(item)!=='Pending').map(item=>[item.id,displayBookingReference(item.id),'#'+displayBookingReference(item.id)].join(' '));
  return [thread.name,thread.hotel,thread.kind==='frontdesk'?'Front Desk':'',thread.room?'Room '+thread.room:'',thread.room,...refs].filter(Boolean).join(' ').toLowerCase().includes(query);
};
const cxRow=thread=>{
  const archived=cxIsArchived(thread),unread=!archived&&thread.unread>0,booking=cxPrimaryBooking(thread),preview=cxPreview(thread);
  const subtitle=thread.kind==='guest'?(booking?'<b>'+esc(cxBookingRef(booking.id))+'</b> · ':'')+esc(preview):esc(preview);
  return '<button class="cx-row'+(unread?' is-unread':'')+'" type="button" data-cx-open="'+thread.id+'">'+cxAvatar(thread)
    +'<span class="cx-row-copy"><span class="cx-row-title"><strong>'+esc(cxTitle(thread))+'</strong></span>'
    +'<span class="cx-row-preview">'+subtitle+'</span></span>'
    +'<span class="cx-row-side"><time>'+esc(cxRowTime(thread))+'</time>'+(unread?'<b class="cx-unread" aria-label="'+thread.unread+' unread">'+thread.unread+'</b>':'')+'</span></button>';
};
const cxListView=()=>{
  const query=String(state.cx.query||'').trim(),filter=state.cx.filter||'All';
  const inFilter=thread=>filter==='All'||filter==='Unread'&&thread.unread>0&&!cxIsArchived(thread)||filter==='Guests'&&thread.kind==='guest'||filter==='Front Desk'&&thread.kind==='frontdesk';
  const pool=cxThreads.filter(cxThreadListed).filter(inFilter).filter(cxMatches).filter(thread=>query||!cxIsArchived(thread));
  const frontDesk=pool.filter(thread=>thread.kind==='frontdesk'),guests=pool.filter(thread=>thread.kind==='guest').sort((a,b)=>cxLastStamp(b)-cxLastStamp(a));
  const archivedCount=cxThreads.filter(thread=>cxIsArchived(thread)&&inFilter(thread)).length;
  const rows=frontDesk.concat(guests);
  const list=rows.length?rows.map(cxRow).join(''):'<p class="cx-empty">'+(query?'No conversations match “'+esc(query)+'”.':'No messages yet.')+'</p>';
  const archivedRow=filter==='All'&&archivedCount>0?'<button class="cx-archived-link" type="button" data-cx-archived><span class="cx-archived-label"><i class="hgi-stroke hgi-archive-01" aria-hidden="true"></i><span>Archived</span></span><span class="cx-archived-meta"><b>'+archivedCount+'</b><span aria-hidden="true">→</span></span></button>':'';
  const unreadCount=cxUnreadTotal();
  return '<div class="cx-page cx-list-page">'
    +'<header class="cx-header"><h1>Chat</h1></header>'
    +'<div class="cx-tools"><label class="cx-search"><i class="hgi-stroke hgi-search-01" aria-hidden="true"></i><input type="search" data-cx-search value="'+esc(state.cx.query||'')+'" placeholder="Search guest, room, or booking number" aria-label="Search guest, room, or booking number" autocomplete="off"></label>'
    +'<div class="cx-pills" role="group" aria-label="Filter conversations">'+[['All','All'],['Unread','Unread '+unreadCount],['Guests','Guests'],['Front Desk','Front Desk']].map(([name,label])=>'<button type="button" aria-pressed="'+(filter===name)+'" class="cx-pill '+(filter===name?'is-active':'')+'" data-cx-filter="'+name+'">'+label+'</button>').join('')+'</div></div>'
    +(query?'<p class="cx-search-note">Including archived conversations</p>':'')
    +'<section class="cx-list" aria-label="Conversations">'+archivedRow+list+'</section></div>';
};
const cxArchivedView=()=>{
  const rows=cxThreads.filter(cxIsArchived).sort((a,b)=>cxLastStamp(b)-cxLastStamp(a));
  return '<div class="cx-page cx-archived-page"><header class="cx-header cx-header-back"><button class="cx-back" type="button" data-cx-back aria-label="Back to Chat">←</button><h1>Archived</h1></header>'
    +'<div class="cx-archived-tip"><button type="button" class="cx-tip-button" data-cx-archive-tip aria-expanded="false" aria-controls="cx-archive-tip-copy" aria-label="About archived chats"><i class="hgi-stroke hgi-information-circle" aria-hidden="true"></i></button><span id="cx-archive-tip-copy" role="tooltip">Guest chats close 24 hours after their last booking ends. They are read-only.</span></div>'
    +'<section class="cx-list">'+(rows.length?rows.map(cxRow).join(''):'<p class="cx-empty">No archived conversations.</p>')+'</section></div>';
};
const cxBookingWhen=record=>String(record?.when||'').replace(cxToday+' · ','Today, ').replace(cxToday+', ','Today, ');
const cxBookingStripWhen=record=>cxBookingWhen(record).replace(/\s*·\s*\d+\s+hours?$/i,'');
const cxBookingSheetWhen=record=>cxBookingWhen(record).replace(/\bhours?\b/gi,'hrs');
const cxBookingCard=(record,pinned,multiple=false,total=1)=>{
  if(!record)return '';
  const status=cxStatus(record),when=cxBookingStripWhen(record),action=multiple?'data-cx-bookings-open':'data-cx-booking="'+esc(record.id)+'"';
  return '<button class="cx-booking'+(pinned?' is-pinned':'')+'" type="button" '+action+'><span class="cx-booking-main"><span class="cx-booking-top"><strong>'+esc(record.item)+'</strong><span class="cx-booking-actions"><span class="cx-booking-status '+cxStatusClass(status)+'">● '+esc(status)+'</span>'+(multiple?'<span class="cx-booking-switch">1 of '+total+'<i class="hgi-stroke hgi-arrow-down-01" aria-hidden="true"></i></span>':'<span class="cx-booking-view" aria-hidden="true">›</span>')+'</span></span><span class="cx-booking-bottom"><span>'+esc(cxBookingRef(record.id))+' · '+esc(when)+'</span></span></span></button>';
};
const cxBookingsSheet=(thread,bookings)=>'<div class="cx-bookings-backdrop" data-cx-bookings-close></div><section class="cx-bookings-sheet" role="dialog" aria-modal="true" aria-label="'+esc(thread.name)+' bookings"><header><h2>'+esc(thread.name)+"'s bookings"+'</h2><button type="button" data-cx-bookings-close aria-label="Close">×</button></header><div class="cx-bookings-sheet-list">'+bookings.map(record=>'<button type="button" class="cx-booking-sheet-row" data-cx-sheet-booking="'+esc(record.id)+'"><span class="cx-sheet-booking-status '+cxStatusClass(cxStatus(record))+'">● '+esc(cxStatus(record))+'</span><span class="cx-sheet-booking-copy"><strong>'+esc(record.item)+'</strong><small>'+esc(cxBookingRef(record.id))+' · '+esc(cxBookingSheetWhen(record))+'</small></span><span class="cx-sheet-booking-chevron" aria-hidden="true">›</span></button>').join('')+'</div></section>';
const cxTicks=message=>message.status==='sending'?'<span class="cx-state is-sending" aria-label="Sending">◷</span>':message.status==='sent'?'<span class="cx-state is-sent" aria-label="Sent">✓</span>':message.status==='read'?'<span class="cx-state is-read" aria-label="Read">✓✓</span>':'';
const cxSystemIcon={confirmed:'checkmark-circle-02',charge:'money-add-02',created:'calendar-add-01',cancelled:'cancel-circle'};
const cxMessage=(message,index,thread)=>{
  if(message.from==='divider')return '<div class="cx-new-booking"><span>'+esc(message.text)+'</span></div>';
  if(message.from==='system'){
    const view=message.kind==='created'&&message.booking?'<button type="button" class="cx-system-link" data-cx-booking="'+esc(message.booking)+'">View →</button>':'';
    return '<div class="cx-system is-'+esc(message.kind||'info')+'"><i class="hgi-stroke hgi-'+(cxSystemIcon[message.kind]||'information-circle')+'" aria-hidden="true"></i><span>'+esc(message.text)+'</span>'+view+'</div>';
  }
  if(message.from==='auto')return '<div class="cx-msg is-mine is-auto-sent"><div class="cx-bubble">'+esc(message.text)+'</div><span class="cx-meta"><span>'+esc(message.time)+'</span>'+cxTicks({status:message.status||'read'})+'</span></div>';
  const mine=message.from==='me';
  const body=message.image?'<img class="cx-photo" src="'+message.image+'" alt="Photo sent">':esc(message.text);
  const sender=String(message.sender||cxSender()).split(' · ')[0];
  const previous=thread.messages[index-1],next=thread.messages[index+1];
  const previousSender=previous?.from==='me'?String(previous.sender||cxSender()).split(' · ')[0]:'';
  const nextSender=next?.from==='me'?String(next.sender||cxSender()).split(' · ')[0]:'';
  const startsGroup=!previous||previous.from==='system'||previous.from==='divider'||previous.from!==message.from||(mine&&previousSender!==sender);
  const endsGroup=!next||next.from==='system'||next.from==='divider'||next.from!==message.from||(mine&&nextSender!==sender);
  const meta=endsGroup
    ?'<span class="cx-meta">'+'<span>'+esc(message.time)+'</span>'+(mine?cxTicks(message):'')+'</span>'
    :'';
  const failed=mine&&message.status==='failed'?'<button type="button" class="cx-retry" data-cx-retry="'+index+'">Not sent · Tap to retry</button>':'';
  return '<div class="cx-msg '+(mine?'is-mine':'is-theirs')+(message.status==='failed'?' is-failed':'')+'"><div class="cx-bubble">'+body+'</div>'+(failed||meta)+'</div>';
};
const cxThreadView=()=>{
  const thread=cxThread(state.cx.threadId);if(!thread){state.cx.view='list';return cxListView()}
  const archived=cxIsArchived(thread),guest=thread.kind==='guest';
  const sub=guest?esc(thread.hotel)+' · Room '+esc(thread.room):'Front Desk · '+esc(thread.hotel);
  let pinned='';
  if(guest){
    const bookings=cxSortedBookings(thread),primary=bookings[0],multiple=bookings.length>1;
    pinned=primary?'<div class="cx-pinned">'+cxBookingCard(primary,true,multiple,bookings.length)+'</div>':'';
  }
  let lastDay='',stream='';
  thread.messages.forEach((message,index)=>{if(message.day!==lastDay){stream+='<div class="cx-day"><span>'+esc(cxDayLabel(message.day))+'</span></div>';lastDay=message.day}stream+=cxMessage(message,index,thread)});
  const primaryBooking=guest?cxPrimaryBooking(thread):null;
  const bookingStatus=String(cxStatus(primaryBooking)||'').toLowerCase();
  const quickAllowed=!archived&&!['completed','cancelled','expired','auto-completed'].includes(bookingStatus)&&!String(state.cxDraft||'').trim();
  const quick=['On my way','I’m at the lobby','Running 10 min late','Thank you!'];
  const footer=archived
    ?'<footer class="cx-ended">This conversation has ended. Contact the Front Desk for help.</footer>'
    :'<footer class="cx-composer-wrap">'+(quickAllowed?'<div class="cx-quick" data-cx-quick-replies aria-label="Quick replies">'+quick.map(text=>'<button type="button" data-cx-quick="'+esc(text)+'">'+esc(text)+'</button>').join('')+'</div>':'')
      +'<form class="cx-composer" data-cx-form><label class="cx-attach" aria-label="Attach photo"><i class="hgi-stroke hgi-image-add-02" aria-hidden="true"></i><input type="file" accept="image/*" data-cx-photo hidden></label><input class="cx-input" name="message" value="'+esc(state.cxDraft||'')+'" placeholder="Message '+esc(guest?thread.name.split(' ')[0]:'Front Desk')+'" autocomplete="off" aria-label="Message"><button class="cx-send" type="submit" aria-label="Send"><i class="hgi-stroke hgi-sent" aria-hidden="true"></i></button></form></footer>';
  const sheet=guest&&state.cx.bookingsSheet?cxBookingsSheet(thread,cxSortedBookings(thread)):'';
  return '<div class="cx-page cx-thread'+(archived?' is-archived':'')+'"><header class="cx-header cx-header-back cx-thread-header"><button class="cx-back" type="button" data-cx-back aria-label="Back to Chat">←</button>'+cxAvatar(thread)+'<span class="cx-thread-title"><strong>'+esc(guest?thread.name:thread.hotel)+'</strong><small><span>'+sub+'</span></small></span></header>'
    +pinned+'<section class="cx-stream" aria-label="Messages">'+(stream||'<p class="cx-empty">No messages yet.</p>')+'</section>'+footer+sheet+'</div>';
};
chatView=function(){return state.cx.view==='thread'?cxThreadView():state.cx.view==='archived'?cxArchivedView():cxListView()};
const cxScrollToEnd=()=>{const stream=document.querySelector('.cx-stream');if(stream){stream.scrollTop=stream.scrollHeight;return}const page=document.querySelector('.page');if(page)page.scrollTop=page.scrollHeight};
const cxOpenThread=id=>{const thread=cxThread(id);if(!thread)return;state.page='chat';state.detail=null;state.cx.view='thread';state.cx.threadId=id;state.cx.showAllBookings=false;state.cx.bookingsSheet=false;state.cxDraft='';if(!cxIsArchived(thread))thread.unread=0;render();cxScrollToEnd();requestAnimationFrame(cxScrollToEnd)};
const cxDeliver=message=>{setTimeout(()=>{message.status='sent';if(state.page==='chat')render()},700);setTimeout(()=>{message.status='read';if(state.page==='chat')render()},2600)};
const cxSend=(thread,text,image)=>{if(!thread||cxIsArchived(thread))return;const message={day:cxToday,time:cxNowTime(),from:'me',sender:cxSender(),status:'sending',text:text||'',image:image||null};thread.messages.push(message);render();cxScrollToEnd();cxDeliver(message)};
const chatTabRenderBase=render;
render=function(){
  chatTabRenderBase.apply(this,arguments);
  const unread=cxUnreadTotal();
  document.querySelectorAll('[data-page="chat"]').forEach(button=>{let badge=button.querySelector('.nav-badge,.cabana-nav-badge,b');if(unread){if(!badge){badge=document.createElement('b');badge.className='nav-badge';button.appendChild(badge)}badge.textContent=String(unread)}else badge?.remove()});
  if(state.page!=='chat')return;
  document.querySelectorAll('[data-cx-filter]').forEach(button=>button.onclick=()=>{state.cx.filter=button.dataset.cxFilter;render()});
  const search=document.querySelector('[data-cx-search]');
  if(search)search.oninput=event=>{state.cx.query=event.target.value;render();const next=document.querySelector('[data-cx-search]');if(next){next.focus();next.setSelectionRange(next.value.length,next.value.length)}};
  document.querySelectorAll('[data-cx-open]').forEach(button=>button.onclick=()=>cxOpenThread(button.dataset.cxOpen));
  document.querySelectorAll('[data-cx-archived]').forEach(button=>button.onclick=()=>{state.cx.view='archived';render();const page=document.querySelector('.page');if(page)page.scrollTop=0});
  document.querySelectorAll('[data-cx-archive-tip]').forEach(button=>button.onclick=()=>{const tip=button.closest('.cx-archived-tip'),open=tip?.classList.toggle('is-open');button.setAttribute('aria-expanded',String(Boolean(open)))});
  document.querySelectorAll('[data-cx-back]').forEach(button=>button.onclick=()=>{const fromArchive=state.cx.view==='thread'&&cxIsArchived(cxThread(state.cx.threadId)||{})&&!state.cx.query;state.cx.view=fromArchive?'archived':'list';state.cx.threadId=null;render();const page=document.querySelector('.page');if(page)page.scrollTop=0});
  document.querySelectorAll('[data-cx-booking]').forEach(button=>button.onclick=()=>{state.cxDetailOrigin=state.cx.threadId;state.page='orders';state.detail=button.dataset.cxBooking;render();const page=document.querySelector('.page');if(page)page.scrollTop=0});
  document.querySelectorAll('[data-cx-bookings-open]').forEach(button=>button.onclick=()=>{state.cx.bookingsSheet=true;render()});
  document.querySelectorAll('[data-cx-bookings-close]').forEach(button=>button.onclick=()=>{state.cx.bookingsSheet=false;render()});
  document.querySelectorAll('[data-cx-sheet-booking]').forEach(button=>button.onclick=()=>{state.cx.bookingsSheet=false;state.cxDetailOrigin=state.cx.threadId;state.page='orders';state.detail=button.dataset.cxSheetBooking;render();const page=document.querySelector('.page');if(page)page.scrollTop=0});
  const thread=cxThread(state.cx.threadId);
  document.querySelectorAll('[data-cx-quick]').forEach(button=>button.onclick=()=>cxSend(thread,button.dataset.cxQuick));
  document.querySelectorAll('[data-cx-retry]').forEach(button=>button.onclick=()=>{const message=thread?.messages[Number(button.dataset.cxRetry)];if(!message)return;message.status='sending';render();cxDeliver(message)});
  const form=document.querySelector('[data-cx-form]');
  const messageInput=form?.elements.message;
  if(messageInput)messageInput.oninput=event=>{state.cxDraft=event.target.value;document.querySelector('[data-cx-quick-replies]')?.classList.toggle('is-hidden',Boolean(String(state.cxDraft||'').trim()))};
  if(form)form.onsubmit=event=>{event.preventDefault();const input=form.elements.message,text=String(input.value||'').trim();if(!text)return;state.cxDraft='';cxSend(thread,text);document.querySelector('.cx-input')?.focus()};
  const photo=document.querySelector('[data-cx-photo]');
  if(photo)photo.onchange=()=>{const file=photo.files?.[0];if(file)cxSend(thread,'Photo',URL.createObjectURL(file))};
};

/* Booking detail → "Message guest" / "Message Front Desk" opens the matching thread; View from chat returns to it. */
window.addEventListener('click',event=>{
  const trigger=event.target.closest?.('[data-latest-message],[data-detail-action="message"],[data-card-message]');
  if(trigger){
    const record=cxBooking(trigger.dataset.cardMessage||state.detail);
    if(!record)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(trigger.dataset.latestMessage==='front-desk'){const desk=cxThreads.find(thread=>thread.kind==='frontdesk'&&thread.hotel===record.hotel)||cxThreads.find(thread=>thread.kind==='frontdesk');if(desk)cxOpenThread(desk.id);return}
    let thread=cxFindGuestThread(record);
    if(!thread){
      if(!cxConfirmedTypes().includes(cxStatus(record)))return;
      thread=cxGuestThreadForBooking(record);
      if(!thread.messages.some(message=>message.from==='auto'&&message.booking===record.id))thread.messages.push({day:cxToday,time:cxNowTime(),from:'auto',sender:cxBookingMessageBusiness(),booking:record.id,text:cxBookingMessageText(record)});
    }
    cxOpenThread(thread.id);
    return;
  }
  const back=event.target.closest?.('[data-latest-back]');
  if(back&&state.cxDetailOrigin&&state.page==='orders'){
    event.preventDefault();event.stopImmediatePropagation();
    const id=state.cxDetailOrigin;state.cxDetailOrigin=null;cxOpenThread(id);
  }
},true);

/* New-message notifications: dev simulation, in-app banner, system notification, Chat badge. */
const cxNotify=(thread,message)=>{
  if(cxIsArchived(thread))return;
  document.querySelector('.request-push')?.remove();
  const banner=document.createElement('div');banner.className='request-push cx-push';banner.setAttribute('role','status');
  banner.innerHTML='<button class="request-push-body" type="button" data-cx-push-open><span class="request-push-icon" aria-hidden="true"><i class="hgi-stroke hgi-message-01"></i></span><span class="request-push-copy"><span class="request-push-top"><strong>'+esc(cxTitle(thread))+'</strong><time>now</time></span><span class="request-push-item">'+esc(message.text)+'</span></span></button><button class="request-push-close" type="button" aria-label="Dismiss notification">×</button>';
  document.body.appendChild(banner);
  const dismiss=()=>{banner.classList.remove('is-visible');setTimeout(()=>banner.remove(),220)};
  banner.querySelector('[data-cx-push-open]').onclick=()=>{dismiss();cxOpenThread(thread.id)};
  banner.querySelector('.request-push-close').onclick=dismiss;
  requestAnimationFrame(()=>banner.classList.add('is-visible'));setTimeout(dismiss,6000);
  if(state.cxSound!=='Off'&&typeof Notification!=='undefined'&&Notification.permission==='granted'){try{const note=new Notification(cxTitle(thread),{body:message.text,tag:'cabana-chat-'+thread.id,silent:state.cxSound==='Off'});note.onclick=()=>{window.focus();cxOpenThread(thread.id)}}catch(error){}}
};
const cxSimulatedMessages=['Hi! Can the driver call me when he arrives?','We’re running 5 minutes late, sorry!','Is there space for a stroller?','Can we change pickup to the main entrance?'];
const cxSimulateMessage=()=>{
  const thread=cxThread('g-marco')||cxThreads.find(item=>item.kind==='guest'&&!cxIsArchived(item));if(!thread)return;
  const text=cxSimulatedMessages[(state.cxSimCount=(state.cxSimCount||0)+1)%cxSimulatedMessages.length];
  const message={day:cxToday,time:cxNowTime(),from:'them',text};
  thread.messages.push(message);
  const viewing=state.page==='chat'&&state.cx.view==='thread'&&state.cx.threadId===thread.id;
  if(!viewing)thread.unread=(thread.unread||0)+1;
  render();
  if(viewing)cxScrollToEnd();else cxNotify(thread,message);
};
const devToolsBeforeChatSimulation=devTools;
devTools=function(){return devToolsBeforeChatSimulation().replace('<button data-dev-reset-simulations>','<button data-dev-simulate-chat>Simulate new message</button><button data-dev-reset-simulations>')};
window.addEventListener('click',event=>{if(event.target.closest?.('[data-dev-simulate-chat]')){event.preventDefault();event.stopImmediatePropagation();document.querySelector('.dev-tools')?.classList.remove('open');cxSimulateMessage()}},true);

/* Menu → Notifications: chat sound is adjustable; new-booking alerts cannot be muted. */
const cxBookingMessagesSheet=()=>'<div class="cx-sheet-backdrop" data-cx-sheet-close></div><section class="cx-sheet" role="dialog" aria-label="Booking messages"><header><h2>Booking messages</h2><button type="button" data-cx-sheet-close aria-label="Close">×</button></header><p class="cx-sheet-intro">This message is sent automatically when a booking is confirmed.</p><label class="cx-template-label" for="cx-booking-template">Confirmation template</label><textarea id="cx-booking-template" class="cx-template-textarea" data-cx-booking-template maxlength="240">'+esc(state.cxBookingTemplate||cxDefaultBookingTemplate)+'</textarea><small class="cx-template-help">Use {guest name}, {listing}, {date &amp; time}, or {booking number}.</small><div class="cx-template-actions"><button type="button" class="button ghost" data-cx-sheet-close>Cancel</button><button type="button" class="button primary" data-cx-template-save>Save template</button></div></section>';
const cxNotificationSheet=()=>'<div class="cx-sheet-backdrop" data-cx-sheet-close></div><section class="cx-sheet" role="dialog" aria-label="Notifications"><header><h2>Notifications</h2><button type="button" data-cx-sheet-close aria-label="Close">×</button></header>'
  +'<div class="cx-sheet-row"><span><strong>New booking alerts</strong><small>Always on. Booking alerts can’t be muted.</small></span><em class="cx-locked"><i class="hgi-stroke hgi-square-lock-02" aria-hidden="true"></i>On</em></div>'
  +'<div class="cx-sheet-row is-stacked"><span><strong>Chat message sound</strong><small>Plays for new messages from guests and the Front Desk.</small></span><div class="cx-segment">'+['Default','Soft','Off'].map(name=>'<button type="button" class="'+(state.cxSound===name?'is-active':'')+'" data-cx-sound="'+name+'">'+name+'</button>').join('')+'</div></div></section>';
window.addEventListener('click',event=>{
  const bookingMessages=event.target.closest?.('[data-cx-booking-messages]');
  if(bookingMessages){event.preventDefault();event.stopImmediatePropagation();document.querySelector('.cx-sheet-wrap')?.remove();state.amDraft=null;state.page='automessages';render();const p=document.querySelector('.page');if(p)p.scrollTop=0;return}
  const templateSave=event.target.closest?.('[data-cx-template-save]');
  if(templateSave){const value=String(document.querySelector('[data-cx-booking-template]')?.value||'').trim();if(!value){toast('Add a confirmation message first');return}state.cxBookingTemplate=value;try{localStorage.setItem('cabana:booking-message-template',value)}catch(error){}document.querySelector('.cx-sheet-wrap')?.remove();toast('Booking message template saved');return}
  const row=event.target.closest?.('[data-toast="Notification settings opened"]');
  if(row){event.preventDefault();event.stopImmediatePropagation();document.querySelector('.cx-sheet-wrap')?.remove();state.page='notifs';render();const pg=document.querySelector('.page');if(pg)pg.scrollTop=0;return}
  const sound=event.target.closest?.('[data-cx-sound]');
  if(sound){state.cxSound=sound.dataset.cxSound;try{localStorage.setItem('cabana:chat-sound',state.cxSound)}catch(error){}const wrap=document.querySelector('.cx-sheet-wrap');if(wrap)wrap.innerHTML=cxNotificationSheet();return}
  if(event.target.closest?.('[data-cx-sheet-close]'))document.querySelector('.cx-sheet-wrap')?.remove();
},true);
render();

/* Refresh resumes the exact screen you were on: tab, open detail, chat thread, sub-tabs and scroll position. */
const cabanaResumeKey='cabana:resume-view';
const cabanaResumeSnapshot=()=>({page:state.page,detail:state.detail||null,bookingTab:state.bookingTab||null,cx:state.cx?{view:state.cx.view,threadId:state.cx.threadId,filter:state.cx.filter}:null,requestDetailOrigin:state.requestDetailOrigin||null,cxDetailOrigin:state.cxDetailOrigin||null,scroll:document.querySelector('.page')?.scrollTop||0});
const cabanaResumeSave=()=>{
  if(!window.__cabanaResumeReady)return;
  try{localStorage.setItem(cabanaResumeKey,JSON.stringify(cabanaResumeSnapshot()))}catch(error){}
  try{const hash='#view='+encodeURIComponent(state.page);if(location.hash!==hash)history.replaceState(null,'',location.pathname+location.search+hash)}catch(error){}
};
const renderBeforeResumeSave=render;
render=function(){renderBeforeResumeSave.apply(this,arguments);cabanaResumeSave()};
document.addEventListener('scroll',event=>{if(!event.target?.classList?.contains('page'))return;clearTimeout(window.__cabanaResumeScrollTimer);window.__cabanaResumeScrollTimer=setTimeout(cabanaResumeSave,150)},true);
window.addEventListener('pagehide',cabanaResumeSave);
setTimeout(()=>{
  let saved=null;
  try{saved=JSON.parse(localStorage.getItem(cabanaResumeKey)||'null')}catch(error){}
  if(saved?.page&&saved.page!=='insights'){
    state.page=saved.page;
    state.detail=saved.detail||null;
    if(saved.bookingTab)state.bookingTab=saved.bookingTab;
    if(saved.cx&&state.cx){state.cx.view=saved.cx.view||'list';state.cx.threadId=saved.cx.threadId||null;state.cx.filter=saved.cx.filter||'All';if(state.cx.view==='thread'&&typeof cxThread==='function'&&!cxThread(state.cx.threadId))state.cx.view='list'}
    state.requestDetailOrigin=saved.requestDetailOrigin||null;
    state.cxDetailOrigin=saved.cxDetailOrigin||null;
    render();
    const scroll=Number(saved.scroll)||0,restore=()=>{const page=document.querySelector('.page');if(page)page.scrollTop=scroll};
    restore();requestAnimationFrame(restore);setTimeout(restore,120);
  }
  window.__cabanaResumeReady=true;
  setTimeout(cabanaResumeSave,200);
},0);


/* Guest threads open with the vendor's automatic booking confirmation; guests can reply but never start a chat. */
function cxWhenLabel(record){const match=String(record?.when||'').match(/([A-Z][a-z]{2}\s+\d{1,2})(?:\s*[·,]\s*(\d{1,2}:\d{2}\s*[AP]M))?/);if(!match)return 'the scheduled time';return match[2]?match[1]+' at '+match[2]:match[1]}
const cxAutoSeed=(bookingId,day,time)=>{const record=cxBooking(bookingId)||{id:bookingId,guest:'',item:'booking',when:''};return {day,time,from:'auto',sender:cxBookingMessageBusiness(),booking:bookingId,text:cxBookingMessageText(record)}};
const cxRuleThreads=[
  {id:'fd-luna',kind:'frontdesk',hotel:'Henry’s Resort Dumaguete',unread:1,messages:[
    {day:cxYesterday,time:'4:10 PM',from:'them',text:'Hi! Guest in Room 314 wants a van for a day trip.'},
    {day:cxYesterday,time:'4:14 PM',from:'system',kind:'created',booking:'CB-9001',text:'Booking #BK-9001 created by Front Desk for Room 314'},
    {day:cxYesterday,time:'4:20 PM',from:'me',sender:'Ana · Staff',status:'read',text:'Got it. The van will be ready at 9:00 AM.'},
    {day:cxToday,time:'10:42 AM',from:'them',text:'Can you take 2 more pax tomorrow?'}]},
  {id:'g-marco',kind:'guest',name:'Marco Santos',room:'508',hotel:'Henry’s Resort Dumaguete',unread:2,messages:[
    cxAutoSeed('BK-9003',cxToday,'9:02 AM'),
    {day:cxToday,time:'9:40 AM',from:'them',text:'Thanks! What time should I be at the lobby?'},
    {day:cxToday,time:'9:44 AM',from:'me',sender:'Leah · Owner',status:'read',text:'Please be at the lobby by 4:15 PM. Your driver will message you here.'},
    {day:cxToday,time:'10:30 AM',from:'them',text:'Is the SUV big enough for 4 suitcases?'},
    {day:cxToday,time:'10:31 AM',from:'them',text:'What time is pickup?'}]},
  {id:'g-amelia',kind:'guest',name:'Amelia Reyes',room:'508',hotel:'Henry’s Resort Dumaguete',unread:0,messages:[
    cxAutoSeed('CB-9007',cxYesterday,'6:05 PM'),
    {day:cxYesterday,time:'6:20 PM',from:'them',text:'Can we keep the car for an extra hour?'},
    {day:cxYesterday,time:'6:24 PM',from:'me',sender:'Ana · Staff',status:'read',text:'Yes, we can. I’ve added the extra hour.'},
    {day:cxYesterday,time:'6:25 PM',from:'system',kind:'charge',booking:'CB-9007',text:'Extra charge ₱500 · Extra hour'},
    cxAutoSeed('CB-9010',cxToday,'8:12 AM'),
    {day:cxToday,time:'8:20 AM',from:'me',sender:'Leah · Owner',status:'failed',text:'See you at the lobby at 4:30 PM today.'}]},
  {id:'g-maya',kind:'guest',name:'Maya Tan',room:'314',hotel:'Henry’s Resort Dumaguete',unread:0,messages:[
    cxAutoSeed('CB-9001',cxYesterday,'4:16 PM'),
    {day:cxYesterday,time:'5:02 PM',from:'them',text:'Perfect, thank you!'}]},
  {id:'g-leo',kind:'guest',name:'Leo Santos',room:'207',hotel:'Henry’s Resort Dumaguete',unread:0,messages:[
    cxAutoSeed('ORD-1044',cxYesterday,'11:05 AM'),
    cxAutoSeed('CB-9013',cxToday,'7:45 AM'),
    {day:cxToday,time:'8:03 AM',from:'them',text:'Great, two rentals booked. Can I pick up both at the lobby?'},
    {day:cxToday,time:'8:10 AM',from:'me',sender:'Ana · Staff',status:'read',text:'Yes, both cars will be ready at the lobby.'}]},
  {id:'g-sofia',kind:'guest',name:'Sofia Lim',room:'602',hotel:'Henry’s Resort Dumaguete',unread:0,messages:[
    cxAutoSeed('CB-8830',cxYesterday,'2:10 PM'),
    {day:cxToday,time:'9:55 AM',from:'me',sender:'Leah · Owner',status:'read',text:'Your driver is at the lobby.'},
    {day:cxToday,time:'11:40 AM',from:'them',text:'Made it to the airport. Thanks!'}]},
  {id:'g-nina',kind:'guest',name:'Nina Garcia',room:'203',hotel:'Henry’s Resort Dumaguete',unread:0,messages:[
    cxAutoSeed('BK-9002','Oct 5','3:30 PM'),
    {day:cxYesterday,time:'9:15 AM',from:'them',text:'Thanks, see you at the lobby!'},
    {day:cxYesterday,time:'9:18 AM',from:'me',sender:'Ana · Staff',status:'read',text:'You’re welcome. We’ll see you there.'}]},
  {id:'g-oliver',kind:'guest',name:'Oliver Brown',room:'205',hotel:'Henry’s Resort Dumaguete',unread:0,messages:[
    cxAutoSeed('ORD-1037','Oct 5','6:20 PM'),
    {day:cxYesterday,time:'7:45 AM',from:'me',sender:'Ana · Staff',status:'read',text:'Good morning! Your van is outside.'},
    {day:cxYesterday,time:'6:30 PM',from:'them',text:'Great day out. Thanks for the ride!'}]},
  {id:'g-priya',kind:'guest',name:'Priya Shah',room:'412',hotel:'Henry’s Resort Dumaguete',unread:0,messages:[
    cxAutoSeed('CB-8812','Oct 2','10:05 AM'),
    {day:'Oct 3',time:'6:40 PM',from:'me',sender:'Leah · Owner',status:'read',text:'Your sedan is at the lobby.'},
    {day:'Oct 3',time:'9:10 PM',from:'them',text:'Arrived safely. Thank you!'}]}
];
cxThreadSeed.splice(0,cxThreadSeed.length,...JSON.parse(JSON.stringify(cxRuleThreads)));
cxResetChatThreads();
render();


/* Thread rules: guest threads exist only after a confirmation; Request details adapt to that. */
function cxConfirmedTypes(){return ['Confirmed','In progress','In use','Ready','Completed','Auto-completed']}
function cxFindGuestThread(record){return cxThreads.find(item=>item.kind==='guest'&&item.name===record?.guest&&String(item.room)===String(record?.room))}
function cxThreadListed(thread){return thread.kind!=='guest'||thread.messages.some(message=>message.from==='auto')||cxGuestBookings(thread).some(item=>cxConfirmedTypes().includes(cxStatus(item)))}
const cxRequestTimer=record=>{let minutes=null;try{minutes=typeof homeCardTimerMinutes==='function'?homeCardTimerMinutes(record):dashboardPendingResponseMinutes(record)}catch(error){try{minutes=dashboardPendingResponseMinutes(record)}catch(inner){}}return Number.isFinite(minutes)?minutes:null};
const cxRequestDetailPolish=()=>{
  const view=document.querySelector('.latest-request-detail');if(!view||state.page!=='orders'||!state.detail)return;
  const record=cxBooking(state.detail)||orders.find(item=>item.id===state.detail);if(!record)return;
  const pending=record.status==='Pending',thread=cxFindGuestThread(record),listed=thread&&cxThreadListed(thread);
  view.querySelectorAll('[data-latest-message="guest"]').forEach(button=>{
    if(listed){button.innerHTML='<i class="hgi-stroke hgi-chat-01" aria-hidden="true"></i><span>Open chat →</span>';button.setAttribute('aria-label','Open chat with '+record.guest)}
    else if(pending||!cxConfirmedTypes().includes(cxStatus(record)))button.remove();
  });
  if(pending){
    view.querySelectorAll('.booking-request-field').forEach(field=>{const label=field.querySelector('span');if(label&&label.textContent.trim()==='Booking date'){label.textContent='Requested on';const value=field.querySelector('strong');if(value)value.textContent=String(record.timeline?.[0]?.[1]||record.when||'—')}});
    const chip=view.querySelector('.booking-request-section-heading .booking-status');
    const minutes=cxRequestTimer(record);
    if(chip&&minutes!==null&&!view.querySelector('.cx-request-timer')){
      const timer=document.createElement('span');timer.className='cx-request-timer'+(minutes<15?' is-urgent':'');
      timer.textContent='⏱ '+(minutes>=60?Math.floor(minutes/60)+'h '+(minutes%60?minutes%60+'m ':''):minutes+'m ')+'left';
      const wrap=document.createElement('span');wrap.className='cx-request-status';chip.replaceWith(wrap);wrap.append(chip,timer);
    }
  }
  const walker=document.createTreeWalker(view,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode())){if(/₱[\d,]+\.00\b/.test(node.nodeValue))node.nodeValue=node.nodeValue.replace(/(₱[\d,]+)\.00\b/g,'$1')}
};
const renderBeforeThreadRules=render;
render=function(){renderBeforeThreadRules.apply(this,arguments);cxRequestDetailPolish()};
render();

/* Pinned strip + bookings sheet: status pills, first-name sheet title, and sheet rows open the booking detail. */
const cxStripPolish=()=>{
  if(state.page!=='chat'||state.cx?.view!=='thread')return;
  document.querySelectorAll('.cx-booking-status,.cx-sheet-booking-status').forEach(node=>{node.textContent=node.textContent.replace(/^●\s*/,'')});
  const thread=cxThread(state.cx.threadId),title=document.querySelector('.cx-bookings-sheet header h2');
  if(thread&&title)title.textContent=String(thread.name||'').split(' ')[0]+'’s bookings';
};
const renderBeforeStripPolish=render;
render=function(){renderBeforeStripPolish.apply(this,arguments);cxStripPolish()};
window.addEventListener('click',event=>{
  const row=event.target.closest?.('[data-cx-sheet-booking]');
  if(!row)return;
  event.preventDefault();event.stopImmediatePropagation();
  state.cx.bookingsSheet=false;state.cxDetailOrigin=state.cx.threadId;state.page='orders';state.detail=row.dataset.cxSheetBooking;render();
  const page=document.querySelector('.page');if(page)page.scrollTop=0;
},true);
render();

/* Menu → Profile: back button returns to Menu. */
const renderBeforeProfileBack=render;
render=function(){
  renderBeforeProfileBack.apply(this,arguments);
  if(!['profile','earnings','listings','staff-listings','vinsights','automessages'].includes(state.page))return;
  const bar=document.querySelector('.main-wrap > .topbar, .topbar');
  if(!bar||bar.querySelector('[data-profile-back]'))return;
  bar.classList.add('profile-topbar');
  const back=document.createElement('button');
  back.type='button';back.className='profile-back';back.setAttribute('data-profile-back','');back.setAttribute('aria-label','Back to Menu');back.textContent='←';
  back.onclick=()=>{state.page='menu';state.detail=null;render();const page=document.querySelector('.page');if(page)page.scrollTop=0};
  bar.prepend(back);
};
render();

/* Archived: show the archiving note as an always-visible info box instead of a tooltip. */
const renderBeforeArchivedInfo=render;
render=function(){
  renderBeforeArchivedInfo.apply(this,arguments);
  if(state.page!=='chat'||state.cx?.view!=='archived')return;
  const tip=document.querySelector('.cx-archived-tip');
  if(!tip)return;
  const text='Conversations are archived 24 hours after a guest’s final booking is completed. Archived conversations are view-only.';
  const box=document.createElement('div');
  box.className='cx-archived-info';box.setAttribute('role','note');
  box.innerHTML='<i class="hgi-stroke hgi-information-circle" aria-hidden="true"></i><p></p>';
  box.querySelector('p').textContent=text;
  tip.replaceWith(box);
};
render();

/* Earnings: header bar carries the title + download action, so the duplicate in-page title is hidden. */
const renderBeforeEarningsHeader=render;
render=function(){
  renderBeforeEarningsHeader.apply(this,arguments);
  if(state.page!=='earnings')return;
  const bar=document.querySelector('.topbar.profile-topbar'),pageHeader=document.querySelector('.earnings-header'),download=pageHeader?.querySelector('[data-earnings-download]');
  if(!bar||!pageHeader)return;
  if(download&&!bar.querySelector('[data-earnings-download]')){download.classList.add('topbar-action');bar.appendChild(download)}
  pageHeader.classList.add('is-merged-into-topbar');
};
render();

/* My account (Menu → profile card): avatar with Change photo, editable personal details, centred chevrons. */
try{state.accountProfile=JSON.parse(localStorage.getItem('cabana:account-profile')||'null')||{}}catch(error){state.accountProfile={}}
const accountProfile=()=>{const base=menuProfileForRole(),saved=(state.accountProfile||{})[state.role]||{};return {...base,...saved}};
const accountInitials=name=>String(name||'').split(/\s+/).map(part=>part[0]||'').join('').slice(0,2).toUpperCase();
const accountView=()=>{
  const profile=accountProfile(),editing=Boolean(state.accountEditing),photo=state.accountPhoto?.[state.role];
  const avatar='<div class="acct-avatar-wrap"><label class="acct-avatar" aria-label="Change photo">'+(photo?'<img src="'+photo+'" alt="">':esc(accountInitials(profile.name)))+'<span class="acct-camera" aria-hidden="true"><i class="hgi-stroke hgi-camera-01"></i></span><input type="file" accept="image/*" data-account-photo hidden></label><label class="acct-change-photo">Change photo<input type="file" accept="image/*" data-account-photo hidden></label></div>';
  const field=(label,key,type)=>editing
    ?'<label class="acct-row acct-field"><span>'+label+'</span><input type="'+type+'" data-account-field="'+key+'" value="'+esc(profile[key]||'')+'" autocomplete="off"></label>'
    :'<div class="acct-row"><span>'+label+'</span><strong>'+esc(profile[key]||'—')+'</strong></div>';
  const details='<section class="acct-section"><div class="acct-section-head"><h2>Personal details</h2>'+(editing?'':'<button type="button" class="acct-edit" data-account-edit>Edit</button>')+'</div><div class="acct-list">'+field('Name','name','text')+field('Phone','phone','tel')+field('Email','email','email')+'</div>'+(editing?'<div class="acct-actions"><button type="button" class="button ghost" data-account-cancel>Cancel</button><button type="button" class="button primary" data-account-save>Save</button></div>':'')+'</section>';
  const link=(title,sub,toast)=>'<button type="button" class="acct-row acct-link" data-toast="'+toast+'"><span class="acct-link-copy"><strong>'+title+'</strong><small>'+sub+'</small></span><span class="acct-chevron" aria-hidden="true">›</span></button>';
  const security='<section class="acct-section"><div class="acct-section-head"><h2>Security and preferences</h2></div><div class="acct-list">'+link('Password or PIN','Update your sign-in method','Password or PIN settings opened')+link('Language','English','Language settings opened')+'</div></section>';
  return '<div class="acct-page"><section class="acct-identity">'+avatar+'<h2>'+esc(profile.name)+'</h2><p>'+esc(profile.role)+' · '+esc(profile.business)+'</p></section>'+details+security+'</div>';
};
const profileViewBeforeAccount=profileView;
profileView=function(){return state.profileMode==='account'?accountView():profileViewBeforeAccount()};
const renderBeforeAccount=render;
render=function(){
  if(state.page!=='profile'||state.profileMode!=='account')state.accountEditing=false;
  renderBeforeAccount.apply(this,arguments);
  if(state.page==='menu'){
    const profile=accountProfile(),card=document.querySelector('.menu-profile-header');
    if(card){const name=card.querySelector('strong');if(name)name.textContent=profile.name;const icon=card.querySelector('.menu-profile-icon');const photo=state.accountPhoto?.[state.role];if(icon)icon.innerHTML=photo?'<img src="'+photo+'" alt="">':esc(accountInitials(profile.name))}
  }
  if(state.page!=='profile')return;
  const title=document.querySelector('.topbar .topbar-context strong');
  if(title)title.textContent=state.profileMode==='account'?'Profile':'Business profile';
  if(state.profileMode!=='account')return;
  document.querySelectorAll('[data-account-edit]').forEach(button=>button.onclick=()=>{state.accountEditing=true;render();document.querySelector('[data-account-field="name"]')?.focus()});
  document.querySelectorAll('[data-account-cancel]').forEach(button=>button.onclick=()=>{state.accountEditing=false;render()});
  document.querySelectorAll('[data-account-save]').forEach(button=>button.onclick=()=>{
    const values={};document.querySelectorAll('[data-account-field]').forEach(input=>{values[input.dataset.accountField]=String(input.value||'').trim()});
    if(!values.name){toast('Add your name');return}
    state.accountProfile={...(state.accountProfile||{}),[state.role]:{...((state.accountProfile||{})[state.role]||{}),...values}};
    try{localStorage.setItem('cabana:account-profile',JSON.stringify(state.accountProfile))}catch(error){}
    state.accountEditing=false;render();toast('Personal details saved');
  });
  document.querySelectorAll('[data-account-photo]').forEach(input=>input.onchange=()=>{const file=input.files?.[0];if(!file)return;state.accountPhoto={...(state.accountPhoto||{}),[state.role]:URL.createObjectURL(file)};render();toast('Photo updated')});
};
render();

/* Profile (simple): business is the hero; your account is one compact block. Replaces the "My account" layout. */
try{state.businessProfile=JSON.parse(localStorage.getItem('cabana:business-profile')||'null')||{}}catch(error){state.businessProfile={}}
const businessProfile=()=>({name:menuProfileForRole().business||'Lakbay Negros Rentals',category:'Transport · Partner vendor',...(state.businessProfile||{})});
const businessInitials=name=>String(name||'').split(/\s+/).filter(word=>/^[A-Za-z]/.test(word)).map(word=>word[0]).join('').slice(0,2).toUpperCase();
const profileSimpleView=()=>{
  const owner=state.role==='Owner',business=businessProfile(),me=accountProfile(),editingBusiness=owner&&Boolean(state.businessEditing),editingMe=Boolean(state.accountEditing);
  const hero=editingBusiness
    ?'<section class="pf-hero"><span class="pf-logo">'+esc(businessInitials(business.name))+'</span><div class="pf-form"><label><span>Business name</span><input data-business-field="name" value="'+esc(business.name)+'"></label><label><span>Category</span><input data-business-field="category" value="'+esc(business.category)+'"></label><div class="acct-actions"><button type="button" class="button ghost" data-business-cancel>Cancel</button><button type="button" class="button primary" data-business-save>Save</button></div></div></section>'
    :'<section class="pf-hero"><span class="pf-logo">'+esc(businessInitials(business.name))+'</span><h2>'+esc(business.name)+'</h2><p>'+esc(business.category)+'</p>'+(owner?'<button type="button" class="pf-edit-business" data-business-edit>Edit business</button>':'')+'</section>';
  const meBlock=editingMe
    ?'<div class="pf-me pf-me-editing"><label class="acct-row acct-field"><span>Name</span><input data-account-field="name" value="'+esc(me.name||'')+'"></label><label class="acct-row acct-field"><span>Phone</span><input type="tel" data-account-field="phone" value="'+esc(me.phone||'')+'"></label><label class="acct-row acct-field"><span>Email</span><input type="email" data-account-field="email" value="'+esc(me.email||'')+'"></label><div class="acct-actions pf-me-actions"><button type="button" class="button ghost" data-account-cancel>Cancel</button><button type="button" class="button primary" data-account-save>Save</button></div></div>'
    :'<div class="pf-me"><div class="pf-me-copy"><strong>'+esc(me.name)+' · '+esc(me.role)+'</strong><span>'+esc(me.phone||'')+'</span><span>'+esc(me.email||'')+'</span></div><button type="button" class="acct-edit" data-account-edit>Edit</button></div>';
  const link=(title,value,toast)=>'<button type="button" class="pf-link" data-toast="'+toast+'"><strong>'+title+'</strong>'+(value?'<span>'+value+'</span>':'')+'<span class="acct-chevron" aria-hidden="true">›</span></button>';
  return '<div class="acct-page pf-page">'+hero+'<section class="acct-section"><div class="acct-section-head"><h2>Your account</h2></div><div class="acct-list">'+meBlock+link('Password or PIN','','Password or PIN settings opened')+link('Language','English','Language settings opened')+'</div></section></div>';
};
const profileViewBeforeSimple=profileView;
profileView=function(){return state.profileMode==='account'?profileSimpleView():profileViewBeforeSimple()};
const renderBeforeProfileSimple=render;
render=function(){
  if(state.page!=='profile')state.businessEditing=false;
  renderBeforeProfileSimple.apply(this,arguments);
  if(state.page==='menu'){
    const business=businessProfile(),me=accountProfile(),card=document.querySelector('.menu-profile-header');
    if(card){
      const icon=card.querySelector('.menu-profile-icon');if(icon){icon.textContent=businessInitials(business.name);icon.classList.add('is-business-logo')}
      const name=card.querySelector('strong');if(name)name.textContent=business.name;
      const sub=card.querySelector('small');if(sub)sub.textContent=me.name+' · '+me.role;
      card.setAttribute('aria-label','Profile: '+business.name);
    }
    document.querySelectorAll('.menu-page [data-business-profile]').forEach(row=>row.remove());
  }
  if(state.page!=='profile'||state.profileMode!=='account')return;
  const title=document.querySelector('.topbar .topbar-context strong');if(title)title.textContent='Profile';
  document.querySelectorAll('[data-business-edit]').forEach(button=>button.onclick=()=>{state.businessEditing=true;render();document.querySelector('[data-business-field="name"]')?.focus()});
  document.querySelectorAll('[data-business-cancel]').forEach(button=>button.onclick=()=>{state.businessEditing=false;render()});
  document.querySelectorAll('[data-business-save]').forEach(button=>button.onclick=()=>{
    const values={};document.querySelectorAll('[data-business-field]').forEach(input=>{values[input.dataset.businessField]=String(input.value||'').trim()});
    if(!values.name){toast('Add the business name');return}
    state.businessProfile={...(state.businessProfile||{}),...values};
    try{localStorage.setItem('cabana:business-profile',JSON.stringify(state.businessProfile))}catch(error){}
    state.businessEditing=false;render();toast('Business details saved');
  });
};
render();

/* Profile (final): business header, access and permissions (Manage → for owners), your account. */
const pfStore=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')||fallback}catch(error){return fallback}};
const pfSave=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch(error){}};
state.team=pfStore('cabana:team',null)||[{id:'owner',name:'Leah Santos',role:'Owner',contact:'leah@lakbaynegros.com'},{id:'staff',name:'Marco Dela Cruz',role:'Staff',contact:'marco@lakbaynegros.com'}];
const pfAccess=role=>role==='Owner'?'Full access':'Bookings · Chat';
const pfBusiness=()=>({name:menuProfileForRole().business||'Lakbay Negros Rentals',category:'Transport',contact:'+63 917 555 0182',area:'Henry’s Resort Dumaguete · Dumaguete airport corridor',...(state.businessProfile||{})});
const pfMemberName=member=>{const linked=member.id==='owner'?'Owner':member.id==='staff'?'Staff':null;const saved=linked&&(state.accountProfile||{})[linked]?.name;return saved||member.name};
const pfLogo=(business,size)=>'<span class="pf-logo'+(size?' '+size:'')+'">'+(state.businessLogo?'<img src="'+state.businessLogo+'" alt="">':esc(businessInitials(business.name)))+'</span>';
const pfTeamView=()=>{
  const owner=state.role==='Owner';
  const rows=state.team.map((member,index)=>'<div class="pf-manage-row"><div class="pf-member-copy"><strong>'+esc(pfMemberName(member))+'</strong><span>'+esc(member.contact||'')+'</span></div>'+(member.id==='owner'?'<span class="pf-role-tag">Owner</span>':'<select data-team-role="'+index+'" aria-label="Role for '+esc(member.name)+'"'+(owner?'':' disabled')+'><option'+(member.role==='Staff'?' selected':'')+'>Staff</option><option'+(member.role==='Owner'?' selected':'')+'>Owner</option></select><button type="button" class="pf-remove" data-team-remove="'+index+'">Remove</button>')+'</div>').join('');
  return '<div class="acct-page pf-page"><section class="acct-section"><div class="acct-section-head"><h2>Members</h2></div><div class="acct-list">'+rows+'</div></section>'
    +'<section class="acct-section"><div class="acct-section-head"><h2>Invite a member</h2></div><div class="acct-list pf-invite"><label><span>Name</span><input data-invite-field="name" placeholder="Full name"></label><label><span>Email or phone</span><input data-invite-field="contact" placeholder="name@example.com"></label><label><span>Role</span><select data-invite-field="role"><option>Staff</option><option>Owner</option></select></label><p class="pf-invite-note">Staff can see Bookings and Chat. Owners have full access.</p><button type="button" class="button primary" data-invite-send>Send invite</button></div></section></div>';
};
const pfView=()=>{
  if(state.profileSub==='team'&&state.role==='Owner')return pfTeamView();
  const owner=state.role==='Owner',business=pfBusiness(),me=accountProfile(),editingBusiness=owner&&Boolean(state.businessEditing),editingMe=Boolean(state.accountEditing);
  const field=(label,key,value,type='text')=>'<label><span>'+label+'</span><input type="'+type+'" data-business-field="'+key+'" value="'+esc(value||'')+'"></label>';
  const hero=editingBusiness
    ?'<section class="pf-hero"><label class="pf-logo-edit" aria-label="Change logo">'+pfLogo(business)+'<span class="pf-logo-badge" aria-hidden="true"><i class="hgi-stroke hgi-camera-01"></i></span><input type="file" accept="image/*" data-business-logo hidden></label><span class="pf-logo-hint">Tap the logo to change it</span><div class="pf-form">'+field('Business name','name',business.name)+field('Category','category',business.category)+field('Contact number','contact',business.contact,'tel')+field('Service area','area',business.area)+'<div class="acct-actions"><button type="button" class="button ghost" data-business-cancel>Cancel</button><button type="button" class="button primary" data-business-save>Save</button></div></div></section>'
    :'<section class="pf-hero">'+pfLogo(business)+'<h2>'+esc(business.name)+'</h2>'+(owner?'<button type="button" class="pf-edit-business" data-business-edit>Edit business</button>':'')+'</section>';
  const team='<section class="acct-section"><div class="acct-section-head"><h2>Access and permissions</h2>'+(owner?'<button type="button" class="acct-edit" data-team-manage>Manage →</button>':'')+'</div><div class="acct-list">'+state.team.map(member=>'<div class="pf-member"><div class="pf-member-copy"><strong>'+esc(pfMemberName(member))+'</strong><span>'+esc(pfAccess(member.role))+'</span></div><span class="pf-role-tag">'+esc(member.role)+'</span></div>').join('')+'</div></section>';
  const meBlock=editingMe
    ?'<div class="pf-me pf-me-editing"><label class="acct-row acct-field"><span>Name</span><input data-account-field="name" value="'+esc(me.name||'')+'"></label><label class="acct-row acct-field"><span>Phone</span><input type="tel" data-account-field="phone" value="'+esc(me.phone||'')+'"></label><label class="acct-row acct-field"><span>Email</span><input type="email" data-account-field="email" value="'+esc(me.email||'')+'"></label><div class="acct-actions pf-me-actions"><button type="button" class="button ghost" data-account-cancel>Cancel</button><button type="button" class="button primary" data-account-save>Save</button></div></div>'
    :'<div class="pf-me"><div class="pf-me-copy"><strong>'+esc(me.name)+' · '+esc(me.role)+'</strong><span>'+esc(me.phone||'')+'</span><span>'+esc(me.email||'')+'</span></div></div>';
  const link=(title,value,toast)=>'<button type="button" class="pf-link" data-toast="'+toast+'"><strong>'+title+'</strong>'+(value?'<span>'+value+'</span>':'')+'<span class="acct-chevron" aria-hidden="true">›</span></button>';
  const account='<section class="acct-section"><div class="acct-section-head"><h2>Your account</h2>'+(editingMe?'':'<button type="button" class="acct-edit" data-account-edit>Edit</button>')+'</div><div class="acct-list">'+meBlock+link('Password or PIN','','Password or PIN settings opened')+link('Language','English','Language settings opened')+'</div></section>';
  return '<div class="acct-page pf-page">'+hero+account+team+'</div>';
};
const profileViewBeforeFinal=profileView;
profileView=function(){return pfView()};
const renderBeforeProfileFinal=render;
render=function(){
  if(state.page!=='profile')state.profileSub=null;
  if(state.page==='profile')state.profileMode='account';
  renderBeforeProfileFinal.apply(this,arguments);
  if(state.page==='menu'){
    document.querySelectorAll('.menu-page .menu-row').forEach(row=>{if(/Staff accounts/.test(row.textContent))row.remove()});
    const icon=document.querySelector('.menu-profile-header .menu-profile-icon');if(icon&&state.businessLogo)icon.innerHTML='<img src="'+state.businessLogo+'" alt="">';
  }
  if(state.page!=='profile'||state.profileMode!=='account')return;
  const title=document.querySelector('.topbar .topbar-context strong');if(title)title.textContent=state.profileSub==='team'?'Manage access':'Profile';
  const back=document.querySelector('[data-profile-back]');
  if(back&&state.profileSub)back.onclick=()=>{state.profileSub=null;render();const page=document.querySelector('.page');if(page)page.scrollTop=0};
  document.querySelectorAll('[data-team-manage]').forEach(button=>button.onclick=()=>{state.profileSub='team';state.businessEditing=false;state.accountEditing=false;render();const page=document.querySelector('.page');if(page)page.scrollTop=0});
  document.querySelectorAll('[data-business-save]').forEach(button=>button.onclick=()=>{
    const values={};document.querySelectorAll('[data-business-field]').forEach(input=>{values[input.dataset.businessField]=String(input.value||'').trim()});
    if(!values.name){toast('Add the business name');return}
    state.businessProfile={...(state.businessProfile||{}),...values};pfSave('cabana:business-profile',state.businessProfile);
    state.businessEditing=false;render();toast('Business details saved');
  });
  document.querySelectorAll('[data-business-logo]').forEach(input=>input.onchange=()=>{const file=input.files?.[0];if(!file)return;state.businessLogo=URL.createObjectURL(file);document.querySelectorAll('.pf-logo').forEach(node=>node.innerHTML='<img src="'+state.businessLogo+'" alt="">')});
  document.querySelectorAll('[data-team-role]').forEach(select=>select.onchange=()=>{const member=state.team[Number(select.dataset.teamRole)];if(!member)return;member.role=select.value;pfSave('cabana:team',state.team);toast(member.name+' is now '+member.role)});
  document.querySelectorAll('[data-team-remove]').forEach(button=>button.onclick=()=>{const index=Number(button.dataset.teamRemove),member=state.team[index];if(!member||member.id==='owner')return;state.team.splice(index,1);pfSave('cabana:team',state.team);render();toast('Access removed for '+member.name)});
  document.querySelectorAll('[data-invite-send]').forEach(button=>button.onclick=()=>{
    const values={};document.querySelectorAll('[data-invite-field]').forEach(input=>{values[input.dataset.inviteField]=String(input.value||'').trim()});
    if(!values.name||!values.contact){toast('Add a name and email or phone');return}
    state.team.push({id:'m'+Date.now(),name:values.name,role:values.role||'Staff',contact:values.contact});pfSave('cabana:team',state.team);render();toast('Invite sent to '+values.name);
  });
};
render();

/* Profile: Business details section (owner Edit → Edit business screen), category under the name. */
const bizCategories=['Transport','Tours','Rentals','Spa & wellness','Products'];
const bizData=()=>({name:menuProfileForRole().business||'Lakbay Negros Rentals',category:'Transport',contact:'+63 35 422 1188',email:'hello@lakbaynegros.com',address:'Rizal Blvd, Dumaguete City',area:'Dumaguete · Sibulan Airport',...(state.businessProfile||{})});
const bizEditView=()=>{
  const b=bizData(),input=(label,key,value,type='text',required=false)=>'<label class="biz-field"><span>'+label+(required?' <em>Required</em>':'')+'</span><input type="'+type+'" data-biz-field="'+key+'" value="'+esc(value||'')+'"'+(required?' required':'')+'></label>';
  return '<div class="acct-page pf-page biz-edit-page"><section class="biz-logo-field"><label class="pf-logo-edit" aria-label="Upload or change logo">'+pfLogo(b)+'<span class="pf-logo-badge" aria-hidden="true"><i class="hgi-stroke hgi-camera-01"></i></span><input type="file" accept="image/*" data-biz-logo hidden></label><label class="biz-logo-link">'+(state.businessLogo?'Change logo':'Upload logo')+'<input type="file" accept="image/*" data-biz-logo hidden></label></section>'
    +'<section class="acct-list biz-form">'+input('Business name','name',b.name,'text',true)
    +'<label class="biz-field"><span>Category</span><select data-biz-field="category">'+bizCategories.map(option=>'<option'+(option===b.category?' selected':'')+'>'+esc(option)+'</option>').join('')+'</select></label>'
    +input('Contact number','contact',b.contact,'tel')+'<p class="biz-hint">Business line, not personal</p>'+input('Email','email',b.email,'email')+input('Address','address',b.address)+'<p class="biz-hint">Street, city</p>'+input('Service area','area',b.area)+'<p class="biz-hint">Where you operate, e.g. pickup zones</p></section>'
    +'<button type="button" class="button primary biz-save" data-biz-save>Save</button></div>';
};
const pfView2=()=>{
  if(state.profileSub==='team'&&state.role==='Owner')return pfTeamView();
  if(state.profileSub==='business'&&state.role==='Owner')return bizEditView();
  const owner=state.role==='Owner',b=bizData(),me=accountProfile(),editingMe=Boolean(state.accountEditing);
  const editingBiz=owner&&Boolean(state.bizEditing);
  const hero=editingBiz
    ?'<section class="pf-hero is-editing"><label class="pf-logo-edit" aria-label="Upload or change logo">'+pfLogo(b)+'<span class="pf-logo-badge" aria-hidden="true"><i class="hgi-stroke hgi-camera-01"></i></span><input type="file" accept="image/*" data-biz-logo hidden></label><input class="pf-hero-name" data-biz-field="name" value="'+esc(b.name)+'" aria-label="Business name" required><select class="pf-hero-category" data-biz-field="category" aria-label="Category">'+bizCategories.map(option=>'<option'+(option===b.category?' selected':'')+'>'+esc(option)+'</option>').join('')+'</select></section>'
    :'<section class="pf-hero">'+(owner?'<label class="pf-logo-edit pf-logo-upload" aria-label="Upload profile photo">'+pfLogo(b)+'<span class="pf-logo-badge" aria-hidden="true"><i class="hgi-stroke hgi-camera-01"></i></span><input type="file" accept="image/*" data-biz-logo hidden></label>':pfLogo(b))+'<h2>'+esc(b.name)+'</h2><p>'+esc(b.category)+' · Partner vendor</p></section>';
  const row=(label,key,value,type='text')=>editingBiz
    ?'<label class="biz-row is-editing"><span>'+label+'</span><input type="'+type+'" data-biz-field="'+key+'" value="'+esc(value||'')+'"></label>'
    :'<div class="biz-row"><span>'+label+'</span><strong>'+esc(value||'—')+'</strong></div>';
  const details='<section class="acct-section"><div class="acct-section-head"><h2>Business details</h2>'+(owner&&!editingBiz?'<button type="button" class="acct-edit" data-biz-edit>Edit</button>':'')+'</div><div class="acct-list">'+row('Email','email',b.email,'email')+row('Contact number','contact',b.contact,'tel')+row('Address','address',b.address)+'</div>'+(editingBiz?'<div class="acct-actions biz-inline-actions"><button type="button" class="button ghost" data-biz-cancel>Cancel</button><button type="button" class="button primary" data-biz-save>Save</button></div>':'')+'</section>';
  const meBlock=editingMe
    ?'<div class="pf-me pf-me-editing"><label class="biz-row is-editing"><span>Name</span><input data-account-field="name" value="'+esc(me.name||'')+'"></label><label class="biz-row is-editing"><span>Email</span><input type="email" data-account-field="email" value="'+esc(me.email||'')+'"></label><label class="biz-row is-editing"><span>Phone</span><input type="tel" data-account-field="phone" value="'+esc(me.phone||'')+'"></label><div class="acct-actions pf-me-actions"><button type="button" class="button ghost" data-account-cancel>Cancel</button><button type="button" class="button primary" data-account-save>Save</button></div></div>'
    :'<div class="pf-me pf-me-rows"><div class="biz-row"><span>Name</span><strong>'+esc(me.name||'—')+'</strong></div><div class="biz-row"><span>Email</span><strong>'+esc(me.email||'—')+'</strong></div><div class="biz-row"><span>Phone</span><strong>'+esc(me.phone||'—')+'</strong></div></div>';
  const link=(title,value,toast)=>'<button type="button" class="pf-link" data-toast="'+toast+'"><strong>'+title+'</strong>'+(value?'<span>'+value+'</span>':'')+'<span class="acct-chevron" aria-hidden="true">›</span></button>';
  const account='<section class="acct-section"><div class="acct-section-head"><h2>Account details</h2>'+(editingMe?'':'<button type="button" class="acct-edit" data-account-edit>Edit</button>')+'</div><div class="acct-list">'+meBlock+'<button type="button" class="biz-row pf-password-row" data-toast="Password settings opened"><span>Password</span><strong>••••••••</strong><span class="acct-chevron" aria-hidden="true">›</span></button>'+'</div></section>';
  const memberRow=(member,index)=>{
    const tappable=owner&&member.id!=='owner',status=member.status==='Invited'?'Invited':(member.role==='Owner'?'Owner':'Staff');
    const inner='<strong>'+esc(pfDisplayName(member))+'</strong><span class="pf-member-role'+(status==='Invited'?' is-invited':'')+'">'+status+'</span>'+(tappable?'<span class="acct-chevron" aria-hidden="true">›</span>':'');
    return tappable?'<button type="button" class="pf-member pf-member-tap" data-team-member="'+index+'">'+inner+'</button>':'<div class="pf-member">'+inner+'</div>';
  };
  const team='<section class="acct-section"><div class="acct-section-head"><h2>Access and Permissions</h2></div><div class="acct-list">'+state.team.map(memberRow).join('')+(owner?'<button type="button" class="pf-invite-button" data-team-invite><span aria-hidden="true">+</span><span>Invite a member</span></button>':'')+'</div></section>';
  return '<div class="acct-page pf-page">'+hero+details+account+team+'</div>';
};
profileView=function(){return pfView2()};
const renderBeforeBizDetails=render;
render=function(){
  if(state.page!=='profile')state.bizEditing=false;
  renderBeforeBizDetails.apply(this,arguments);
  if(state.page!=='profile')return;
  const title=document.querySelector('.topbar .topbar-context strong');
  const back=document.querySelector('[data-profile-back]');
  if(state.profileSub==='business'){
    if(title)title.textContent='Edit business';
    if(back){back.textContent='Cancel';back.classList.add('is-cancel');back.setAttribute('aria-label','Cancel editing');back.onclick=()=>{state.profileSub=null;render();const page=document.querySelector('.page');if(page)page.scrollTop=0}}
  }
  document.querySelectorAll('[data-biz-edit]').forEach(button=>button.onclick=()=>{state.bizEditing=true;state.accountEditing=false;render();const first=document.querySelector('.biz-row [data-biz-field]');if(first){first.focus();const len=first.value.length;try{first.setSelectionRange(len,len)}catch(error){}}});
  document.querySelectorAll('[data-biz-cancel]').forEach(button=>button.onclick=()=>{state.bizEditing=false;render()});
  document.querySelectorAll('[data-account-edit]').forEach(button=>button.addEventListener('click',()=>setTimeout(()=>{const first=document.querySelector('[data-account-field="name"]');if(first){first.focus();const len=first.value.length;try{first.setSelectionRange(len,len)}catch(error){}}},0)));
  document.querySelectorAll('[data-biz-logo]').forEach(input=>input.onchange=()=>{const file=input.files?.[0];if(!file)return;state.businessLogo=URL.createObjectURL(file);document.querySelectorAll('.pf-logo').forEach(node=>node.innerHTML='<img src="'+state.businessLogo+'" alt="">');document.querySelectorAll('.biz-logo-link').forEach(link=>link.firstChild.textContent='Change logo')});
  document.querySelectorAll('[data-biz-save]').forEach(button=>button.onclick=()=>{
    const values={};document.querySelectorAll('[data-biz-field]').forEach(input=>{values[input.dataset.bizField]=String(input.value||'').trim()});
    if(!values.name){toast('Business name is required');document.querySelector('[data-biz-field="name"]')?.focus();return}
    state.businessProfile={...(state.businessProfile||{}),...values};pfSave('cabana:business-profile',state.businessProfile);
    state.profileSub=null;state.bizEditing=false;render();toast('Business details saved');
  });
};
render();

/* Access and Permissions: member name, then role (Owner shown as Admin). */
function pfDisplayName(member){return String(pfMemberName(member)).replace(/^Marco Dela Cruz$/,'Marco de la Cruz')}

/* Access and Permissions: Edit shows remove buttons; Invite a member opens an inline form. */
const renderBeforeTeamInline=render;
render=function(){
  if(state.page!=='profile'){state.teamEditing=false;state.teamInviting=false}
  renderBeforeTeamInline.apply(this,arguments);
  if(state.page!=='profile'||state.profileSub)return;
  document.querySelectorAll('[data-team-edit]').forEach(button=>button.onclick=()=>{state.teamEditing=!state.teamEditing;state.teamInviting=false;render()});
  document.querySelectorAll('[data-invite-open]').forEach(button=>button.onclick=()=>{state.teamInviting=true;state.teamEditing=false;render();document.querySelector('[data-invite-field="name"]')?.focus()});
  document.querySelectorAll('[data-invite-cancel]').forEach(button=>button.onclick=()=>{state.teamInviting=false;render()});
  document.querySelectorAll('[data-invite-send]').forEach(button=>button.onclick=()=>{
    const values={};document.querySelectorAll('[data-invite-field]').forEach(input=>{values[input.dataset.inviteField]=String(input.value||'').trim()});
    if(!values.name||!values.contact){toast('Add a name and email or phone');return}
    state.team.push({id:'m'+Date.now(),name:values.name,role:values.role||'Staff',contact:values.contact});pfSave('cabana:team',state.team);
    state.teamInviting=false;render();toast('Invite sent to '+values.name);
  });
  document.querySelectorAll('[data-team-remove]').forEach(button=>button.onclick=()=>{
    const index=Number(button.dataset.teamRemove),member=state.team[index];if(!member||member.id==='owner')return;
    state.team.splice(index,1);pfSave('cabana:team',state.team);
    if(!state.team.some(item=>item.id!=='owner'))state.teamEditing=false;
    render();toast('Access removed for '+pfDisplayName(member));
  });
};
render();

/* Access and Permissions sheets: tap Staff → Remove from team (with confirm); + Invite a member → Name + Mobile. */
const pfFirstName=member=>String(pfDisplayName(member)).split(' ')[0];
const pfTeamSheet=()=>{
  const sheet=state.teamSheet;if(!sheet)return '';
  if(sheet.type==='invite')return '<div class="pf-sheet-backdrop" data-team-sheet-close></div><section class="pf-sheet" role="dialog" aria-label="Invite a member"><header><h2>Invite a member</h2><button type="button" data-team-sheet-close aria-label="Close">×</button></header><label class="pf-sheet-field"><span>Name</span><input data-invite-field="name" placeholder="Full name" autocomplete="off"></label><label class="pf-sheet-field"><span>Mobile number</span><input type="tel" data-invite-field="mobile" placeholder="+63 9XX XXX XXXX" autocomplete="off"></label><p class="pf-sheet-note">They’ll join as Staff with access to Bookings and Chat.</p><button type="button" class="button primary pf-sheet-primary" data-team-invite-send>Send invite</button></section>';
  const member=state.team[sheet.index];if(!member)return '';
  const body=sheet.confirm
    ?'<p class="pf-sheet-confirm">Remove '+esc(pfFirstName(member))+'? They’ll lose access right away.</p><div class="pf-sheet-actions"><button type="button" class="button ghost" data-team-confirm-cancel>Cancel</button><button type="button" class="button pf-danger" data-team-confirm-remove>Remove</button></div>'
    :'<button type="button" class="button pf-danger pf-sheet-primary" data-team-remove-ask>Remove from team</button>';
  return '<div class="pf-sheet-backdrop" data-team-sheet-close></div><section class="pf-sheet" role="dialog" aria-label="'+esc(pfDisplayName(member))+'"><header><h2>'+esc(pfDisplayName(member))+' · '+(member.status==='Invited'?'Invited':'Staff')+'</h2><button type="button" data-team-sheet-close aria-label="Close">×</button></header>'+body+'</section>';
};
const renderBeforeTeamSheet=render;
render=function(){
  if(state.page!=='profile')state.teamSheet=null;
  renderBeforeTeamSheet.apply(this,arguments);
  document.querySelector('.pf-sheet-wrap')?.remove();
  if(state.page!=='profile'||state.profileSub)return;
  const close=()=>{state.teamSheet=null;render()};
  document.querySelectorAll('[data-team-member]').forEach(button=>button.onclick=()=>{state.teamSheet={type:'member',index:Number(button.dataset.teamMember),confirm:false};render()});
  document.querySelectorAll('[data-team-invite]').forEach(button=>button.onclick=()=>{state.teamSheet={type:'invite'};render();document.querySelector('[data-invite-field="name"]')?.focus()});
  if(!state.teamSheet||state.role!=='Owner')return;
  const wrap=document.createElement('div');wrap.className='pf-sheet-wrap';wrap.innerHTML=pfTeamSheet();document.body.appendChild(wrap);
  wrap.querySelectorAll('[data-team-sheet-close]').forEach(node=>node.onclick=close);
  wrap.querySelector('[data-team-remove-ask]')?.addEventListener('click',()=>{state.teamSheet.confirm=true;render()});
  wrap.querySelector('[data-team-confirm-cancel]')?.addEventListener('click',()=>{state.teamSheet.confirm=false;render()});
  wrap.querySelector('[data-team-confirm-remove]')?.addEventListener('click',()=>{const member=state.team[state.teamSheet.index];if(member&&member.id!=='owner'){state.team.splice(state.teamSheet.index,1);pfSave('cabana:team',state.team);toast(pfDisplayName(member)+' was removed from the team')}close()});
  wrap.querySelector('[data-team-invite-send]')?.addEventListener('click',()=>{
    const name=String(wrap.querySelector('[data-invite-field="name"]')?.value||'').trim(),mobile=String(wrap.querySelector('[data-invite-field="mobile"]')?.value||'').trim();
    if(!name||!mobile){toast('Add a name and mobile number');return}
    state.team.push({id:'m'+Date.now(),name,role:'Staff',status:'Invited',contact:mobile});pfSave('cabana:team',state.team);toast('Invite sent to '+name);close();
  });
};
render();

/* Business profile photo: tap the circular logo to upload; kept across refreshes. */
try{const savedLogo=localStorage.getItem('cabana:business-logo');if(savedLogo)state.businessLogo=savedLogo}catch(error){}
if(!state.businessLogo)state.businessLogo='assets/brand/lakbay-negros-logo.svg';
const renderBeforeLogoUpload=render;
render=function(){
  renderBeforeLogoUpload.apply(this,arguments);
  if(state.page==='menu'&&state.businessLogo){const icon=document.querySelector('.menu-profile-header .menu-profile-icon');if(icon&&!icon.querySelector('img'))icon.innerHTML='<img src="'+state.businessLogo+'" alt="">'}
  if(state.page!=='profile')return;
  document.querySelectorAll('[data-biz-logo]').forEach(input=>input.onchange=()=>{
    const file=input.files?.[0];if(!file)return;
    if(!/^image\//.test(file.type)){toast('Choose an image file');return}
    const reader=new FileReader();
    reader.onload=()=>{
      const image=new Image();
      image.onload=()=>{
        const size=256,canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
        const side=Math.min(image.width,image.height),ctx=canvas.getContext('2d');
        ctx.drawImage(image,(image.width-side)/2,(image.height-side)/2,side,side,0,0,size,size);
        state.businessLogo=canvas.toDataURL('image/jpeg',0.86);
        try{localStorage.setItem('cabana:business-logo',state.businessLogo)}catch(error){}
        render();toast('Profile photo updated');
      };
      image.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
};
render();

/* ===== Profile page (final spec): business header, business details, account details, access and permissions. ===== */
const pf3Business=()=>{const b=bizData();return {name:b.name,category:b.category||'Transport',email:b.email,contact:b.contact,address:b.address}};
const pf3Esc=value=>esc(value==null?'':String(value));
const pf3Role=member=>member.status==='Invited'?'Invited':(member.role==='Owner'?'Owner':'Staff');
const pf3StaffCount=()=>state.team.filter(member=>member.id!=='owner'&&member.role!=='Owner').length;
const pf3EditBusinessView=()=>{
  const b=pf3Business(),field=(label,key,value,type='text',required=false)=>'<label class="biz-field"><span>'+label+(required?' <em>Required</em>':'')+'</span><input type="'+type+'" data-pf3-field="'+key+'" value="'+pf3Esc(value)+'"'+(required?' required':'')+'></label>';
  return '<div class="acct-page pf-page pf3-page biz-edit-page"><section class="acct-list biz-form">'+field('Business name','name',b.name,'text',true)
    +'<label class="biz-field"><span>Category</span><select data-pf3-field="category">'+bizCategories.map(option=>'<option'+(option===b.category?' selected':'')+'>'+pf3Esc(option)+'</option>').join('')+'</select></label>'
    +field('Email','email',b.email,'email')+field('Contact number','contact',b.contact,'tel')+field('Address','address',b.address)+'</section>'
    +'<div class="pf3-edit-actions"><button type="button" class="button primary biz-save" data-pf3-biz-save>Save</button><button type="button" class="button ghost biz-cancel" data-pf3-sub-cancel>Cancel</button></div></div>';
};
const pf3View=()=>{
  const owner=state.role==='Owner';
  if(state.profileSub==='business'&&owner)return pf3EditBusinessView();
  if(state.profileSub==='account')return pf3EditAccountView();
  const bizInline=false,acctInline=false;
  const b=pf3Business(),me=accountProfile(),editingMe=Boolean(state.accountEditing),editingTeam=owner&&Boolean(state.pf3TeamEditing)&&pf3StaffCount()>0;
  const logo=owner?'<label class="pf-logo-edit pf-logo-upload" aria-label="Upload or change logo">'+pfLogo(b)+'<span class="pf-logo-badge" aria-hidden="true"><i class="hgi-stroke hgi-camera-01"></i></span><input type="file" accept="image/*" data-biz-logo hidden></label>':pfLogo(b);
  const hero=bizInline
    ?'<section class="pf-hero pf3-hero is-editing">'+logo+'<input class="pf-hero-name" data-pf3-inline-biz="name" value="'+pf3Esc(b.name)+'" aria-label="Business name" required><select class="pf-hero-category" data-pf3-inline-biz="category" aria-label="Category">'+bizCategories.map(option=>'<option'+(option===b.category?' selected':'')+'>'+pf3Esc(option)+'</option>').join('')+'</select></section>'
    :'<section class="pf-hero pf3-hero">'+logo+'<h2>'+pf3Esc(b.name)+'</h2><p>'+pf3Esc(b.category)+'</p></section>';
  const row=(label,value)=>'<div class="biz-row"><span>'+label+'</span><strong>'+pf3Esc(value||'—')+'</strong></div>';
  const inputRow=(label,attr,key,value,type='text')=>'<label class="biz-row is-editing"><span>'+label+'</span><input type="'+type+'" '+attr+'="'+key+'" value="'+pf3Esc(value)+'"></label>';
  const inlineActions=(cancel,save)=>'<div class="acct-actions pf3-inline-actions"><button type="button" class="button ghost" '+cancel+'>Cancel</button><button type="button" class="button primary" '+save+'>Save</button></div>';
  const details='<section class="acct-section"><div class="acct-section-head"><h2>Business details</h2>'+(owner&&!bizInline?'<button type="button" class="acct-edit" data-pf3-biz-edit>Edit</button>':'')+'</div><div class="acct-list">'+(bizInline?inputRow('Email','data-pf3-inline-biz','email',b.email,'email')+inputRow('Contact number','data-pf3-inline-biz','contact',b.contact,'tel')+inputRow('Address','data-pf3-inline-biz','address',b.address):row('Email',b.email)+row('Contact number',b.contact)+row('Address',b.address))+'</div>'+(bizInline?inlineActions('data-pf3-inline-biz-cancel','data-pf3-inline-biz-save'):'')+'</section>';
  const accountRows=acctInline
    ?inputRow('Name','data-pf3-inline-acct','name',me.name)+inputRow('Email','data-pf3-inline-acct','email',me.email,'email')+inputRow('Phone','data-pf3-inline-acct','phone',me.phone,'tel')
    :'<div class="pf-me pf-me-rows">'+row('Name',me.name)+row('Email',me.email)+row('Phone',me.phone)+'</div><button type="button" class="biz-row pf-password-row" data-pf3-password><span>Password</span><span class="acct-chevron" aria-hidden="true">›</span></button>';
  const account='<section class="acct-section"><div class="acct-section-head"><h2>Account details</h2>'+(acctInline?'':'<button type="button" class="acct-edit" data-pf3-acct-edit>Edit</button>')+'</div><div class="acct-list">'+accountRows+'</div>'+(acctInline?inlineActions('data-pf3-inline-acct-cancel','data-pf3-inline-acct-save'):'')+'</section>';
  const member=(m,index)=>{const removable=editingTeam&&m.id!=='owner'&&m.role!=='Owner';return '<div class="pf3-member" data-pf3-row="'+index+'">'+(editingTeam?(removable?'<button type="button" class="pf3-minus" data-pf3-remove="'+index+'" aria-label="Remove '+pf3Esc(pfDisplayName(m))+'"><span aria-hidden="true"></span></button>':'<span class="pf3-minus-spacer" aria-hidden="true"></span>'):'')+'<strong>'+pf3Esc(pfDisplayName(m))+'</strong><span class="pf3-role">'+pf3Role(m)+'</span></div>'};
  const showEdit=owner&&pf3StaffCount()>0;
  const team='<section class="acct-section"><div class="acct-section-head"><h2>Access and permissions</h2>'+(showEdit?'<button type="button" class="acct-edit" data-pf3-team-edit>'+(editingTeam?'Done':'Edit')+'</button>':'')+'</div><div class="acct-list">'+state.team.map(member).join('')+(owner&&!editingTeam?'<button type="button" class="pf-invite-button" data-pf3-invite><span aria-hidden="true">+</span><span>Invite a member</span></button>':'')+'</div></section>';
  return '<div class="acct-page pf-page pf3-page">'+hero+details+account+team+'</div>';
};
profileView=function(){return pf3View()};
const pf3Overlay=()=>{
  const sheet=state.pf3Sheet;
  if(sheet==='invite')return '<div class="pf-sheet-backdrop" data-pf3-close></div><section class="pf-sheet" role="dialog" aria-label="Invite a member"><header><h2>Invite a member</h2><button type="button" data-pf3-close aria-label="Close">×</button></header><label class="pf-sheet-field"><span>Name</span><input data-pf3-invite="name" placeholder="Full name" autocomplete="off"></label><label class="pf-sheet-field"><span>Email</span><input type="email" data-pf3-invite="email" placeholder="name@example.com" autocomplete="off"></label><label class="pf-sheet-field"><span>Mobile number</span><input type="tel" data-pf3-invite="mobile" placeholder="+63 9XX XXX XXXX" autocomplete="off"></label><button type="button" class="button primary pf-sheet-primary" data-pf3-invite-send>Send invite</button></section>';
  if(sheet==='password')return '<div class="pf-sheet-backdrop" data-pf3-close></div><section class="pf-sheet" role="dialog" aria-label="Change password"><header><h2>Change password</h2><button type="button" data-pf3-close aria-label="Close">×</button></header><label class="pf-sheet-field"><span>Current password</span><input type="password" data-pf3-pw="current" autocomplete="current-password"></label><label class="pf-sheet-field"><span>New password</span><input type="password" data-pf3-pw="next" autocomplete="new-password"></label><label class="pf-sheet-field"><span>Confirm new password</span><input type="password" data-pf3-pw="confirm" autocomplete="new-password"></label><p class="pf-sheet-note">Use at least 8 characters.</p><button type="button" class="button primary pf-sheet-primary" data-pf3-pw-save>Update password</button></section>';
  if(Number.isInteger(state.pf3Confirm)){const m=state.team[state.pf3Confirm];if(!m)return '';const name=pf3Esc(pfDisplayName(m));return '<div class="pf-sheet-backdrop" data-pf3-close></div><section class="pf3-dialog" role="alertdialog" aria-labelledby="pf3-dialog-title" aria-describedby="pf3-dialog-body"><h2 id="pf3-dialog-title">Remove '+name+'?</h2><p id="pf3-dialog-body">They’ll lose access to this business right away.</p><div class="pf-sheet-actions"><button type="button" class="button ghost" data-pf3-close>Cancel</button><button type="button" class="button pf-danger" data-pf3-confirm-remove>Remove</button></div></section>'}
  return '';
};
const renderBeforePf3=render;
render=function(){
  if(state.page!=='profile'){state.pf3Sheet=null;state.pf3Confirm=null;state.pf3TeamEditing=false}
  if(state.page==='profile'&&state.profileSub==='team')state.profileSub=null;
  renderBeforePf3.apply(this,arguments);
  document.querySelector('.pf3-overlay')?.remove();
  if(state.page==='menu'){const icon=document.querySelector('.menu-profile-header .menu-profile-icon');if(icon)icon.classList.add('is-business-logo')}
  if(state.page!=='profile')return;
  const page=()=>document.querySelector('.page');
  document.querySelectorAll('[data-pf3-biz-edit]').forEach(button=>button.onclick=()=>{state.profileSub='business';state.accountEditing=false;state.pf3TeamEditing=false;render();if(page())page().scrollTop=0});
  document.querySelectorAll('[data-pf3-biz-save]').forEach(button=>button.onclick=()=>{
    const values={};document.querySelectorAll('[data-pf3-field]').forEach(input=>{values[input.dataset.pf3Field]=String(input.value||'').trim()});
    if(!values.name){toast('Business name is required');document.querySelector('[data-pf3-field="name"]')?.focus();return}
    state.businessProfile={...(state.businessProfile||{}),...values};pfSave('cabana:business-profile',state.businessProfile);
    state.profileSub=null;render();toast('Business details saved');if(page())page().scrollTop=0;
  });
  document.querySelectorAll('[data-pf3-password]').forEach(button=>button.onclick=()=>{state.pf3Sheet='password';render();document.querySelector('[data-pf3-pw="current"]')?.focus()});
  document.querySelectorAll('[data-pf3-team-edit]').forEach(button=>button.onclick=()=>{state.pf3TeamEditing=!state.pf3TeamEditing;render()});
  document.querySelectorAll('[data-pf3-remove]').forEach(button=>button.onclick=()=>{state.pf3Confirm=Number(button.dataset.pf3Remove);render()});
  document.querySelectorAll('[data-pf3-invite]').forEach(button=>{if(button.tagName==='BUTTON')button.onclick=()=>{state.pf3Sheet='invite';render();document.querySelector('input[data-pf3-invite="name"]')?.focus()}});
  const overlay=pf3Overlay();if(!overlay)return;
  const wrap=document.createElement('div');wrap.className='pf3-overlay';wrap.innerHTML=overlay;document.body.appendChild(wrap);
  const close=()=>{state.pf3Sheet=null;state.pf3Confirm=null;render()};
  wrap.querySelectorAll('[data-pf3-close]').forEach(node=>node.onclick=close);
  wrap.querySelector('[data-pf3-invite-send]')?.addEventListener('click',()=>{
    const name=String(wrap.querySelector('[data-pf3-invite="name"]')?.value||'').trim(),email=String(wrap.querySelector('[data-pf3-invite="email"]')?.value||'').trim(),mobile=String(wrap.querySelector('[data-pf3-invite="mobile"]')?.value||'').trim();
    if(!name){toast('Add a name');wrap.querySelector('[data-pf3-invite="name"]')?.focus();return}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){toast('Add a valid email');wrap.querySelector('[data-pf3-invite="email"]')?.focus();return}
    if(!mobile){toast('Add a mobile number');wrap.querySelector('[data-pf3-invite="mobile"]')?.focus();return}
    state.team.push({id:'m'+Date.now(),name,role:'Staff',status:'Invited',email,mobile,contact:email});pfSave('cabana:team',state.team);toast('Invite sent to '+name);close();
  });
  wrap.querySelector('[data-pf3-pw-save]')?.addEventListener('click',()=>{
    const v=key=>String(wrap.querySelector('[data-pf3-pw="'+key+'"]')?.value||'');
    if(!v('current')){toast('Enter your current password');return}
    if(v('next').length<8){toast('New password needs at least 8 characters');return}
    if(v('next')!==v('confirm')){toast('New passwords don’t match');return}
    toast('Password updated');close();
  });
  wrap.querySelector('[data-pf3-confirm-remove]')?.addEventListener('click',()=>{
    const index=state.pf3Confirm,m=state.team[index];state.pf3Confirm=null;wrap.remove();
    if(!m||m.id==='owner'||m.role==='Owner'){render();return}
    const rowEl=document.querySelector('[data-pf3-row="'+index+'"]');
    const finish=()=>{state.team.splice(index,1);pfSave('cabana:team',state.team);render();toast(pfDisplayName(m)+' was removed')};
    if(rowEl){rowEl.style.height=rowEl.offsetHeight+'px';requestAnimationFrame(()=>rowEl.classList.add('is-removing'));setTimeout(finish,240)}else finish();
  });
};
render();

/* Screens opened from Menu keep the Menu tab highlighted. */
const menuSubpages=['profile','earnings','listings','staff-listings','insights','vinsights','automessages','vperf','photels','payacct','notifs','help'];
const renderBeforeMenuTabActive=render;
render=function(){
  renderBeforeMenuTabActive.apply(this,arguments);
  if(!menuSubpages.includes(state.page))return;
  document.querySelectorAll('.mobile-nav [data-page="menu"], .nav-list [data-page="menu"]').forEach(button=>{
    button.classList.add('active');button.setAttribute('aria-current','page');
    const icon=button.querySelector('.nav-hugeicon');if(icon)icon.classList.add('hgi-solid','nav-hugeicon-active');
  });
};
render();

/* Edit (Business details or Account details): put the cursor in the first field right away. */
const pfFocusFirst=selector=>{const go=()=>{const field=document.querySelector(selector);if(!field)return false;field.focus({preventScroll:false});if(typeof field.setSelectionRange==='function'&&field.type!=='email'){const len=field.value.length;try{field.setSelectionRange(len,len)}catch(error){}}return true};setTimeout(()=>{if(!go())setTimeout(go,80)},20)};
window.addEventListener('click',event=>{
  if(event.target.closest?.('[data-pf3-biz-edit]'))setTimeout(()=>pfFocusFirst('[data-pf3-field="name"]'),0);
  if(event.target.closest?.('[data-account-edit]'))setTimeout(()=>pfFocusFirst('[data-account-field="name"]'),0);
});

/* Account details Edit → "Edit account" screen, same pattern as Edit business. */
function pf3EditAccountView(){
  const me=accountProfile(),field=(label,key,value,type='text',required=false)=>'<label class="biz-field"><span>'+label+(required?' <em>Required</em>':'')+'</span><input type="'+type+'" data-pf3-acct="'+key+'" value="'+esc(value==null?'':String(value))+'"'+(required?' required':'')+'></label>';
  return '<div class="acct-page pf-page pf3-page biz-edit-page"><section class="acct-list biz-form">'+field('Name','name',me.name,'text',true)+field('Email','email',me.email,'email')+field('Phone','phone',me.phone,'tel')+'</section><div class="pf3-edit-actions"><button type="button" class="button primary biz-save" data-pf3-acct-save>Save</button><button type="button" class="button ghost biz-cancel" data-pf3-sub-cancel>Cancel</button></div></div>';
}
const renderBeforeEditAccount=render;
render=function(){
  if(state.page==='profile')state.accountEditing=false;
  renderBeforeEditAccount.apply(this,arguments);
  if(state.page!=='profile')return;
  const pageEl=()=>document.querySelector('.page');
  document.querySelectorAll('[data-pf3-acct-edit]').forEach(button=>button.onclick=()=>{
    state.profileSub='account';state.pf3TeamEditing=false;render();if(pageEl())pageEl().scrollTop=0;
    setTimeout(()=>{const first=document.querySelector('[data-pf3-acct="name"]');if(first){first.focus();const len=first.value.length;try{first.setSelectionRange(len,len)}catch(error){}}},30);
  });
  if(state.profileSub!=='account')return;
  const title=document.querySelector('.topbar .topbar-context strong');if(title)title.textContent='Edit account';
  const back=document.querySelector('[data-profile-back]');
  if(back){back.textContent='Cancel';back.classList.add('is-cancel');back.setAttribute('aria-label','Cancel editing');back.onclick=()=>{state.profileSub=null;render();if(pageEl())pageEl().scrollTop=0}}
  document.querySelectorAll('[data-pf3-acct-save]').forEach(button=>button.onclick=()=>{
    const values={};document.querySelectorAll('[data-pf3-acct]').forEach(input=>{values[input.dataset.pf3Acct]=String(input.value||'').trim()});
    if(!values.name){toast('Name is required');document.querySelector('[data-pf3-acct="name"]')?.focus();return}
    if(values.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)){toast('Add a valid email');document.querySelector('[data-pf3-acct="email"]')?.focus();return}
    state.accountProfile={...(state.accountProfile||{}),[state.role]:{...((state.accountProfile||{})[state.role]||{}),...values}};
    try{localStorage.setItem('cabana:account-profile',JSON.stringify(state.accountProfile))}catch(error){}
    state.profileSub=null;render();toast('Account details saved');if(pageEl())pageEl().scrollTop=0;
  });
};
render();

/* Inline editing for Business details and Account details (no separate screen). */
const renderBeforeInlineEdit=render;
render=function(){
  if(state.page!=='profile'){state.pf3BizInline=false;state.pf3AcctInline=false}
  renderBeforeInlineEdit.apply(this,arguments);
  if(state.page!=='profile')return;
  const focusFirst=selector=>setTimeout(()=>{const field=document.querySelector(selector);if(!field)return;field.focus();if(field.type!=='email'){const len=field.value.length;try{field.setSelectionRange(len,len)}catch(error){}}},30);
  const openScreen=(sub,selector)=>{state.profileSub=sub;state.pf3TeamEditing=false;render();const page=document.querySelector('.page');if(page)page.scrollTop=0;focusFirst(selector)};
  document.querySelectorAll('[data-pf3-biz-edit]').forEach(button=>button.onclick=()=>openScreen('business','[data-pf3-field="name"]'));
  document.querySelectorAll('[data-pf3-acct-edit]').forEach(button=>button.onclick=()=>openScreen('account','[data-pf3-acct="name"]'));
  document.querySelectorAll('[data-pf3-inline-biz-cancel]').forEach(button=>button.onclick=()=>{state.pf3BizInline=false;render()});
  document.querySelectorAll('[data-pf3-inline-acct-cancel]').forEach(button=>button.onclick=()=>{state.pf3AcctInline=false;render()});
  const validEmail=value=>!value||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  document.querySelectorAll('[data-pf3-inline-biz-save]').forEach(button=>button.onclick=()=>{
    const values={};document.querySelectorAll('[data-pf3-inline-biz]').forEach(input=>{values[input.dataset.pf3InlineBiz]=String(input.value||'').trim()});
    if(!values.name){toast('Business name is required');document.querySelector('[data-pf3-inline-biz="name"]')?.focus();return}
    if(!validEmail(values.email)){toast('Add a valid email');document.querySelector('[data-pf3-inline-biz="email"]')?.focus();return}
    state.businessProfile={...(state.businessProfile||{}),...values};pfSave('cabana:business-profile',state.businessProfile);
    state.pf3BizInline=false;render();toast('Business details saved');
  });
  document.querySelectorAll('[data-pf3-inline-acct-save]').forEach(button=>button.onclick=()=>{
    const values={};document.querySelectorAll('[data-pf3-inline-acct]').forEach(input=>{values[input.dataset.pf3InlineAcct]=String(input.value||'').trim()});
    if(!values.name){toast('Name is required');document.querySelector('[data-pf3-inline-acct="name"]')?.focus();return}
    if(!validEmail(values.email)){toast('Add a valid email');document.querySelector('[data-pf3-inline-acct="email"]')?.focus();return}
    state.accountProfile={...(state.accountProfile||{}),[state.role]:{...((state.accountProfile||{})[state.role]||{}),...values}};
    try{localStorage.setItem('cabana:account-profile',JSON.stringify(state.accountProfile))}catch(error){}
    state.pf3AcctInline=false;render();toast('Account details saved');
  });
};
render();

/* Edit business / Edit account: ← back in the header; Cancel as a secondary button under Save. */
const renderBeforeEditBack=render;
render=function(){
  renderBeforeEditBack.apply(this,arguments);
  if(state.page!=='profile'||!['business','account'].includes(state.profileSub))return;
  const leave=()=>{state.profileSub=null;render();const page=document.querySelector('.page');if(page)page.scrollTop=0};
  const back=document.querySelector('[data-profile-back]');
  if(back){back.textContent='←';back.classList.remove('is-cancel');back.setAttribute('aria-label','Back to Profile');back.onclick=leave}
  document.querySelectorAll('[data-pf3-sub-cancel]').forEach(button=>button.onclick=leave);
};
render();

/* ===== Create listing: 4 steps + review (Basics · Price and capacity · Availability · Booking details), plus Listings ⋯ menu. ===== */
const lcMonths=['January','February','March','April','May','June','July','August','September','October','November','December'];
const lcDayNames=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const lcToday=new Date(2026,9,10);
const lcDefaults=()=>({photos:[],name:'',description:'',location:'',price:'',pricedPer:'Booking',durationMode:'fixed',durationValue:'2',durationUnit:'hours',guestMin:'1',guestMax:'7',guestUnit:'days',countBy:'Passengers',maxPer:'4',payRoom:true,payOnline:true,_payV2:true,days:[true,true,true,true,true,true,true],timeMode:'hours',slots:['07:00','13:00'],hoursStart:'06:00',hoursEnd:'22:00',dailyLimit:'2',blocked:[],notice:'2 hours',fields:{baggage:true,pickup:true,dropoff:true,flight:true,prefs:false,health:false,requests:true},addons:[]});
state.lc=state.lc||{open:false,step:1,data:lcDefaults(),month:[2026,9]};
try{const saved=JSON.parse(localStorage.getItem('cabana:created-listings')||'[]');saved.forEach(item=>{if(!listings.some(existing=>existing.id===item.id))listings.push(item)})}catch(error){}
const lcSaveCreated=()=>{try{localStorage.setItem('cabana:created-listings',JSON.stringify(listings.filter(item=>item.created)))}catch(error){toast('Saved, but photos are too large to keep after refresh')}};
const lcE=value=>esc(value==null?'':String(value));
const lcPeso=value=>'₱'+Number(String(value||0).replace(/[^\d]/g,'')||0).toLocaleString('en-PH');
const lcTime=value=>{const [h,m]=String(value||'00:00').split(':').map(Number);const period=h>=12?'PM':'AM',hour=h%12||12;return hour+':'+String(m||0).padStart(2,'0')+' '+period};
const lcDuration=d=>d.durationMode==='fixed'?(d.durationValue+' '+(Number(d.durationValue)===1?d.durationUnit.replace(/s$/,''):d.durationUnit)):('Up to '+d.guestMax+' '+(Number(d.guestMax)===1?d.guestUnit.replace(/s$/,''):d.guestUnit));
const lcSeg=(name,value,options)=>'<div class="lc-seg" role="group">'+options.map(option=>'<button type="button" class="'+(value===option?'is-active':'')+'" data-lc-set="'+name+'" data-lc-value="'+lcE(option)+'">'+lcE(option)+'</button>').join('')+'</div>';
const lcField=(label,control,hint)=>'<div class="lc-field"><span class="lc-label">'+label+'</span>'+control+(hint?'<small class="lc-hint">'+hint+'</small>':'')+'</div>';
const lcInput=(key,value,attrs='')=>'<input class="lc-input" data-lc-input="'+key+'" value="'+lcE(value)+'" '+attrs+'>';
const lcSwitch=(key,on,label,sub,disabled)=>'<label class="lc-switch-row'+(disabled?' is-locked':'')+'"><span><strong>'+label+'</strong>'+(sub?'<small>'+sub+'</small>':'')+'</span><input type="checkbox" data-lc-check="'+key+'"'+(on?' checked':'')+(disabled?' disabled':'')+'><span class="lc-switch" aria-hidden="true"></span></label>';
const lcStep1=d=>{
  const tried=Boolean(state.lc.tried1),noName=tried&&!d.name.trim(),noCover=tried&&!d.photos.length;
  const photosBlock=lcPhotosMarkup(d,noCover);
  const error=(show,text)=>show?'<small class="lc1-error" role="alert">'+text+'</small>':'';
  return '<div class="lc1">'
    +photosBlock
    +'<div class="lc1-field"><label class="lc1-label" for="lc-name">Listing name</label><input id="lc-name" class="lc1-input'+(noName?' has-error':'')+'" data-lc-input="name" value="'+lcE(d.name)+'" placeholder="e.g. Airport Transfer — Sedan" maxlength="60" autocomplete="off">'+error(noName,'Add a listing name')+'</div>'
    +'<div class="lc1-field"><div class="lc1-label-row"><label class="lc1-label" for="lc-desc">Description</label><span class="lc1-optional">Optional</span></div><div class="lc1-textarea-wrap"><textarea id="lc-desc" class="lc1-input lc1-textarea" data-lc-input="description" maxlength="300" placeholder="What’s included">'+lcE(d.description)+'</textarea><small class="lc1-count" aria-live="polite"><span data-lc-count>'+d.description.length+'</span>/300</small></div></div>'
    +'<div class="lc1-field"><label class="lc1-label" for="lc-location">Location</label><input id="lc-location" class="lc1-input" data-lc-input="location" value="'+lcE(d.location)+'" placeholder="e.g. Hotel lobby" autocomplete="off"></div>'
    +'</div>';
};
const lcStep2Ready=d=>Number(String(d.price).replace(/[^\d]/g,''))>0&&Number(d.maxPer)>0&&(d.payRoom||d.payOnline)&&(d.durationMode!=='guest'||Number(d.guestMax)>=1);
const lcStep2Apply=d=>{
  const byTime=d.pricedPer==='Hour'||d.pricedPer==='Day';
  if(d._lastPricedPer!==d.pricedPer){
    d.durationMode=byTime?'guest':'fixed';
    if(d._lastPricedPer!==undefined&&byTime)d.guestMax=d.pricedPer==='Hour'?'8':'7';
    d._lastPricedPer=d.pricedPer;
  }
  if(byTime){d.durationMode='guest';d.guestMin='1';d.guestUnit=d.pricedPer==='Hour'?'hours':'days';if(!(Number(d.guestMax)>=1))d.guestMax=d.pricedPer==='Hour'?'8':'7'}
  else d.durationMode='fixed';
  if(!['minutes','hours'].includes(d.durationUnit))d.durationUnit='hours';
  if(d.countBy==='Vehicles')d.countBy='Units';
  if(!d._payV2){d.payRoom=true;d.payOnline=true;d._payV2=true}
};
const lcRangeValid=d=>d.durationMode!=='guest'||Number(d.guestMax)>=1;
const lcPriceSummary=d=>{
  const price=Number(String(d.price).replace(/[^\d]/g,''))||0;if(!price)return 'Add a price to see what guests pay';
  const per=d.pricedPer.toLowerCase(),unitShort=u=>u==='minutes'?'min':u==='hours'?'hrs':'days';
  if(d.durationMode!=='guest')return 'Guests pay '+lcPeso(price)+' per '+per+' · '+(Number(d.durationValue)||0)+' '+unitShort(d.durationUnit);
  const min=Number(d.guestMin)||0,max=Number(d.guestMax)||0,range=min+'–'+max+' '+unitShort(d.guestUnit);
  const matches=(d.pricedPer==='Hour'&&d.guestUnit==='hours')||(d.pricedPer==='Day'&&d.guestUnit==='days');
  return 'Guests pay '+lcPeso(price)+' per '+per+' · '+range+(matches&&min&&max?' ('+lcPeso(price*min)+'–'+lcPeso(price*max)+')':'');
};
const lcDdOptions={};
const lcGroup=v=>{const n=String(v||'').replace(/[^\d]/g,'');return n?Number(n).toLocaleString('en-US'):''};
const lcStep2=d=>{
  lcStep2Apply(d);
  const tried=Boolean(state.lc.tried2),noPrice=tried&&!(Number(String(d.price).replace(/[^\d]/g,''))>0),noPay=tried&&!d.payRoom&&!d.payOnline;
  const chips=(name,value,options)=>'<div class="lc2-chips" role="radiogroup">'+options.map(option=>'<button type="button" role="radio" aria-checked="'+(value===option)+'" tabindex="'+(value===option?'0':'-1')+'" class="lc2-chip'+(value===option?' is-active':'')+'" data-lc-set="'+name+'" data-lc-value="'+lcE(option)+'">'+lcE(option)+'</button>').join('')+'</div>';
  const stepper=(key,value,label,min=1)=>'<div class="lc2-stepper-one" role="group" aria-label="'+label+'"><button type="button" data-lc-step-num="'+key+'" data-lc-delta="-1" aria-label="Decrease '+label+'"'+(Number(value)<=min?' disabled':'')+'>−</button><input data-lc-input="'+key+'" inputmode="numeric" value="'+lcE(value)+'" aria-label="'+label+'"><button type="button" data-lc-step-num="'+key+'" data-lc-delta="1" aria-label="Increase '+label+'">+</button></div>';
  const select=(key,value,options,label)=>{lcDdOptions[key]={label,options};const current=options.find(([v])=>v===value)||options[0];return '<div class="lc2-select-wrap"><button type="button" class="lc1-input lc2-dd" data-lc-dd="'+key+'" aria-haspopup="dialog" aria-label="'+label+': '+current[1]+'">'+current[1]+'</button></div>'};
  const error=(show,text)=>show?'<small class="lc1-error" role="alert">'+text+'</small>':'';
  const byTime=d.pricedPer==='Hour'||d.pricedPer==='Day',unit=d.pricedPer==='Hour'?'hours':'days',max=Number(d.guestMax)||1;
  const duration=byTime
    ?'<div class="lc1-field"><span class="lc1-label">Max '+unit+'</span><div class="lc2-row lc2-row-nowrap">'+stepper('guestMax',d.guestMax,'Max '+unit)+'</div></div>'
    :'<div class="lc1-field"><span class="lc1-label">Duration</span><div class="lc2-row lc2-row-nowrap"><input class="lc1-input lc2-numbox" data-lc-input="durationValue" inputmode="numeric" value="'+lcE(d.durationValue)+'" aria-label="Duration">'+select('durationUnit',d.durationUnit,(Number(d.durationValue)===1?[['minutes','minute'],['hours','hour']]:[['minutes','minutes'],['hours','hours']]),'Duration unit')+'</div></div>';
  const count=Number(d.maxPer)||0,noun=d.countBy.toLowerCase(),nounText=count===1?noun.replace(/s$/,''):noun;
  const check=(key,on,label,hint)=>'<label class="lc2-check lc2-pay-card'+(on?' is-on':'')+'"><input type="checkbox" data-lc-check="'+key+'"'+(on?' checked':'')+'><span class="lc2-box" aria-hidden="true"></span><span class="lc2-pay-text"><strong>'+label+'</strong><small>'+hint+'</small></span></label>';
  return '<div class="lc1 lc2-v4"><div class="lc2-group">'
    +'<div class="lc1-field"><label class="lc1-label" for="lc-price">Price</label><div class="lc2-row lc2-row-nowrap lc2-price-row"><div class="lc2-price'+(noPrice?' has-error':'')+'"><span>₱</span><input id="lc-price" data-lc-input="price" inputmode="numeric" value="'+lcE(lcGroup(d.price))+'" placeholder="e.g. 1800" autocomplete="off"></div>'+select('pricedPer',d.pricedPer,[['Booking','per booking'],['Person','per person'],['Hour','per hour'],['Day','per day']],'Priced per')+'</div>'+error(noPrice,'Add a price')+'</div>'
    +duration
    +'</div><div class="lc2-group">'
    +'<div class="lc1-field"><span class="lc1-label">Count by</span>'+chips('countBy',d.countBy,['Passengers','Guests','Units'])+'</div>'
    +'<div class="lc1-field"><span class="lc1-label">Max '+lcE(noun)+'</span><div class="lc2-row">'+stepper('maxPer',d.maxPer,'Max '+noun+' per booking')+'</div></div>'
    +'</div><div class="lc2-group">'
    +'<div class="lc1-field lc2-pay"><span class="lc1-label">Payment options</span><div class="lc2-toggles lc2-checks">'+check('payRoom',d.payRoom,'Charge to room','Added to the guest’s hotel bill')+check('payOnline',d.payOnline,'Pay online','Card, GCash or Maya')+'</div>'+error(noPay,'Choose at least one payment option')+'</div>'
    +'</div></div>';
};
const lcCalendar=d=>{
  const [year,month]=state.lc.month,first=new Date(year,month,1),offset=(first.getDay()+6)%7,days=new Date(year,month+1,0).getDate();
  let cells='';for(let i=0;i<offset;i++)cells+='<span></span>';
  for(let day=1;day<=days;day++){const key=year+'-'+String(month+1).padStart(2,'0')+'-'+String(day).padStart(2,'0'),date=new Date(year,month,day),past=date<lcToday,blocked=d.blocked.includes(key);cells+='<button type="button" class="'+(blocked?'is-blocked ':'')+(past?'is-past':'')+'" data-lc-date="'+key+'"'+(past?' disabled':'')+' aria-pressed="'+blocked+'">'+day+'</button>'}
  const canPrev=year>lcToday.getFullYear()||month>lcToday.getMonth();
  return '<div class="lc-calendar"><div class="lc-cal-head"><button type="button" data-lc-month="-1"'+(canPrev?'':' disabled')+' aria-label="Previous month">‹</button><strong>'+lcMonths[month]+' '+year+'</strong><button type="button" data-lc-month="1" aria-label="Next month">›</button></div><div class="lc-cal-week">'+lcDayNames.map(n=>'<span>'+n[0]+'</span>').join('')+'</div><div class="lc-cal-grid">'+cells+'</div></div>';
};
const lcKey=(y,m,day)=>y+'-'+String(m+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
const lcKeyDate=key=>{const [y,m,day]=key.split('-').map(Number);return new Date(y,m-1,day)};
const lcKeyAdd=(key,n)=>{const t=lcKeyDate(key);t.setDate(t.getDate()+n);return lcKey(t.getFullYear(),t.getMonth(),t.getDate())};
const lcTimeOptions=(from='05:00',to='23:00')=>{const out=[];for(let mins=0;mins<24*60;mins+=30){const v=String(Math.floor(mins/60)).padStart(2,'0')+':'+String(mins%60).padStart(2,'0');if(v>=from&&v<=to)out.push([v,lcTime(v)])}return out};
const lcNoticeOptions=['None','1 hour','2 hours','1 day','2 days'];
const lcBlocksSync=d=>{
  if(!Array.isArray(d.blocks))d.blocks=(d.blocked||[]).slice().sort().map(k=>({start:k,end:k}));
  d.blocks.sort((x,y)=>x.start<y.start?-1:1);
  const all=[];d.blocks.forEach(b=>{let k=b.start;while(k<=b.end){all.push(k);k=lcKeyAdd(k,1)}});d.blocked=all;
};
const lcStep3Apply=d=>{
  if(d._timePer!==d.pricedPer){d.timeMode=d.pricedPer==='Hour'?'hours':'slots';d._timePer=d.pricedPer}
  if(!lcNoticeOptions.includes(d.notice))d.notice=d.notice==='No notice needed'?'None':'2 hours';
  if(!d.pickupStart)d.pickupStart='07:00';if(!d.pickupEnd)d.pickupEnd='18:00';
  if(!Array.isArray(d.slots))d.slots=['08:00','13:00'];
  if(!d.blockMode)d.blockMode='Single day';
  lcBlocksSync(d);
};
const lcDdButton=(key,value,options,label,onPick)=>{lcDdOptions[key]={label,options,onPick};const current=options.find(([v])=>v===value)||[value,lcTime(value)];return '<div class="lc2-select-wrap"><button type="button" class="lc1-input lc2-dd" data-lc-dd="'+key+'" aria-haspopup="dialog" aria-label="'+label+': '+current[1]+'">'+current[1]+'</button></div>'};
const lcCalendar3=d=>{
  const [year,month]=state.lc.month,first=new Date(year,month,1),offset=(first.getDay()+6)%7,days=new Date(year,month+1,0).getDate();
  const todayKey=lcKey(lcToday.getFullYear(),lcToday.getMonth(),lcToday.getDate()),pending=state.lc.rangeStart||null;
  const blockOf=key=>d.blocks.find(b=>key>=b.start&&key<=b.end);
  let cells='';for(let i=0;i<offset;i++)cells+='<span class="lc3-cell is-empty"></span>';
  for(let day=1;day<=days;day++){
    const key=lcKey(year,month,day),date=new Date(year,month,day),col=(offset+day-1)%7,past=date<lcToday&&key!==todayKey,closed=!d.days[col],block=blockOf(key);
    let cls='lc3-cell';
    if(block){const single=block.start===block.end,startEdge=key===block.start||col===0||day===1,endEdge=key===block.end||col===6||day===days;cls+=' is-blocked'+(single?' is-single':' is-band'+(startEdge?' is-band-start':'')+(endEdge?' is-band-end':''))}
    else if(closed&&!past)cls+=' is-closed';
    if(past)cls+=' is-past';if(key===todayKey)cls+=' is-today';if(pending===key)cls+=' is-pending';
    const disabled=past||(closed&&!block);
    cells+='<button type="button" class="'+cls+'" data-lc3-date="'+key+'"'+(disabled?' disabled':'')+' aria-pressed="'+Boolean(block)+'" aria-label="'+lcMonths[month]+' '+day+(block?', blocked':closed?', closed weekly':'')+'"><span>'+day+'</span></button>';
  }
  const canPrev=year>lcToday.getFullYear()||month>lcToday.getMonth();
  return '<div class="lc3-cal"><div class="lc3-cal-head"><strong>'+lcMonths[month]+' '+year+'</strong><div><button type="button" data-lc-month="-1"'+(canPrev?'':' disabled')+' aria-label="Previous month">‹</button><button type="button" data-lc-month="1" aria-label="Next month">›</button></div></div><div class="lc3-week">'+['M','T','W','T','F','S','S'].map(n=>'<span>'+n+'</span>').join('')+'</div><div class="lc3-grid">'+cells+'</div><div class="lc3-legend"><span><i class="is-blocked"></i>Blocked</span><span><i class="is-closed"></i>Closed weekly</span></div></div>';
};
const lcBlockLabel=b=>{const s=lcKeyDate(b.start),e=lcKeyDate(b.end),m=x=>lcMonths[x.getMonth()].slice(0,3);if(b.start===b.end)return m(s)+' '+s.getDate();return m(s)+' '+s.getDate()+' – '+(s.getMonth()===e.getMonth()?'':m(e)+' ')+e.getDate()};
const lcLimitCopy=d=>d.pricedPer==='Day'?['Units available','How many you can rent out at once.']:d.timeMode==='slots'?['Max bookings per slot','Each departure takes one booking.']:['Daily limit','Most bookings you can take in a day.'];
const lcStep3=d=>{
  lcStep3Apply(d);
  const seg=(name,value,options)=>'<div class="lc3-seg" role="radiogroup">'+options.map(o=>'<button type="button" role="radio" aria-checked="'+(value===o)+'" class="'+(value===o?'is-active':'')+'" data-lc-set="'+name+'" data-lc-value="'+lcE(o)+'">'+lcE(o)+'</button>').join('')+'</div>';
  const timeRange=(startKey,endKey,startLabel,endLabel)=>'<div class="lc3-range">'+lcDdButton(startKey,d[startKey],lcTimeOptions('00:00',lcKeyTimeBefore(d[endKey])),startLabel)+'<span class="lc3-to">to</span>'+lcDdButton(endKey,d[endKey],lcTimeOptions(lcKeyTimeAfter(d[startKey]),'23:30'),endLabel)+'</div>';
  const slots=d.slots.slice().sort();
  let times;
  if(d.pricedPer==='Day')times='<div class="lc1-field"><span class="lc1-label">Pickup hours</span>'+timeRange('pickupStart','pickupEnd','Pickup from','Pickup until')+'</div>';
  else times='<div class="lc1-field"><span class="lc1-label">Booking times</span>'+seg('timeMode',d.timeMode==='slots'?'Fixed slots':'Any time',['Fixed slots','Any time'])
    +(d.timeMode==='slots'
      ?'<div class="lc3-slots">'+slots.map(v=>'<span class="lc3-slot">'+lcTime(v)+'<button type="button" data-lc3-slot-remove="'+v+'" aria-label="Remove '+lcTime(v)+'">✕</button></span>').join('')+(slots.length<8?'<button type="button" class="lc3-slot-add" data-lc-dd="slotAdd" aria-haspopup="dialog">+ Add time</button>':'')+'</div>'+(state.lc.tried3&&!slots.length?'<small class="lc1-error" role="alert">Add at least one time</small>':'')
      :timeRange('hoursStart','hoursEnd','Opens','Closes'))+'</div>';
  lcDdOptions.slotAdd={label:'Add time',options:lcTimeOptions().filter(([v])=>!d.slots.includes(v)),onPick:v=>{d.slots.push(v);d.slots.sort()}};
  const [limitLabel,limitHint]=lcLimitCopy(d),limit=Number(d.dailyLimit)||1;
  const stepper='<div class="lc2-stepper-one" role="group" aria-label="'+limitLabel+'"><button type="button" data-lc-step-num="dailyLimit" data-lc-delta="-1" aria-label="Decrease"'+(limit<=1?' disabled':'')+'>−</button><input data-lc-input="dailyLimit" inputmode="numeric" value="'+lcE(d.dailyLimit)+'" aria-label="'+limitLabel+'"><button type="button" data-lc-step-num="dailyLimit" data-lc-delta="1" aria-label="Increase">+</button></div>';
  const count=d.blocked.length,chipsHtml=d.blocks.length?'<div class="lc3-chips">'+d.blocks.map((b,i)=>'<span class="lc3-chip">'+lcBlockLabel(b)+'<button type="button" data-lc3-unblock="'+i+'" aria-label="Unblock '+lcBlockLabel(b)+'">✕</button></span>').join('')+'</div>':'';
  return '<div class="lc1 lc2-v4 lc3"><div class="lc2-group">'
    +'<div class="lc1-field"><span class="lc1-label">Available days</span><div class="lc3-days">'+lcDayNames.map((name,i)=>'<button type="button" class="'+(d.days[i]?'is-active':'')+'" data-lc-day="'+i+'" aria-pressed="'+d.days[i]+'">'+name+'</button>').join('')+'</div></div>'
    +times
    +'</div><div class="lc2-group">'
    +'<div class="lc1-field"><span class="lc1-label">Advance notice</span>'+lcDdButton('notice',d.notice,lcNoticeOptions.map(o=>[o,o]),'Advance notice')+'</div>'
    +'<div class="lc1-field"><span class="lc1-label">'+limitLabel+'</span><div class="lc2-row">'+stepper+'</div><small class="lc3-help">'+limitHint+'</small></div>'
    +'</div><div class="lc2-group">'
    +'<div class="lc1-field"><div class="lc3-label-row"><span class="lc1-label">Blocked dates</span><span class="lc3-optional">Optional</span></div>'
    +'<button type="button" class="lc3-block-row" data-lc3-open-blocks aria-haspopup="dialog"><i class="hgi-stroke hgi-calendar-03" aria-hidden="true"></i><span>'+(count?count+' date'+(count===1?'':'s')+' blocked':'No blocked dates')+'</span><b aria-hidden="true">›</b></button>'
    +chipsHtml+'</div>'
    +'</div></div>'
    +(state.lc.blockSheet?'<div class="lc3-sheet-wrap"><div class="pf-sheet-backdrop" data-lc3-close-blocks></div><section class="lc3-sheet" role="dialog" aria-modal="true" aria-label="Block dates"><span class="lc3-grab" aria-hidden="true"></span><header><h2>Block dates</h2><button type="button" class="lc3-x" data-lc3-close-blocks aria-label="Close">✕</button></header><div class="lc3-sheet-body">'+seg('blockMode',d.blockMode,['Single day','Date range'])+lcCalendar3(d)+chipsHtml+'</div><footer><button type="button" class="button primary lc3-done" data-lc3-close-blocks>Done</button></footer></section></div>':'');
};
const lcKeyTimeBefore=t=>{const [h,m]=t.split(':').map(Number),x=h*60+m-30;return x<0?'00:00':String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0')};
const lcKeyTimeAfter=t=>{const [h,m]=t.split(':').map(Number),x=h*60+m+30;return x>=1440?'23:30':String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0')};
const lcCategoryKind=d=>{const c=String(d.category||pf3Business?.().category||'Transport');return /spa|wellness|massage/i.test(c)?'spa':/tour|activit|excursion/i.test(c)?'tours':/transport|transfer|vehicle|rental|van|car|shuttle/i.test(c)?'transport':'other'};
const lcQuestionSets={transport:['pickup','dropoff','flight','baggage'],spa:['prefs','health'],tours:['pickup','health'],other:[]};
const lcQuestionCopy={pickup:['Pickup location'],dropoff:['Drop-off location'],flight:['Flight number'],baggage:['Baggage'],prefs:['Preferences','e.g. therapist gender'],health:['Health notes'],requests:['Special requests','Include in note']};
const lcQuestions=d=>lcQuestionSets[lcCategoryKind(d)].concat('requests');
const lcStep4Apply=d=>{
  d.fields=d.fields||{};
  if(d.fields.dropoff===undefined)d.fields.dropoff=d.fields.pickup!==false;
  if(d.fields.requests===undefined)d.fields.requests=true;
  if(!d._flightV2){d.fields.flight=true;d._flightV2=true}
  d.addons=[];
};
const lcStep4=d=>{
  lcStep4Apply(d);
  const rows=lcQuestions(d).map(k=>lcSwitch('f-'+k,Boolean(d.fields[k]),lcQuestionCopy[k][0],lcQuestionCopy[k][1])).join('');
  const addons=d.addons.map((a,i)=>'<div class="lc4-addon"><button type="button" class="lc4-addon-main" data-lc4-addon-edit="'+i+'" aria-label="Edit '+lcE(a.name)+'"><span>'+lcE(a.name)+'</span><b>'+lcPeso(a.price||0)+'</b></button><button type="button" class="lc4-addon-x" data-lc4-addon-remove="'+i+'" aria-label="Remove '+lcE(a.name)+'">✕</button></div>').join('');
  return '<div class="lc1 lc2-v4 lc4"><div class="lc2-group">'
    +'<div class="lc1-field"><span class="lc1-label">Ask guests for</span><small class="lc4-help">You’ll see their answers on each request.</small><div class="lc4-list">'+rows+'</div><small class="lc4-note">Date, time and '+lcE(d.countBy.toLowerCase())+' are always asked.</small></div>'
    +'</div></div>';
};
const lcAddonSheet=index=>{
  lcSheetClose();
  const d=state.lc.data,editing=index!=null,addon=editing?d.addons[index]:{name:'',price:''};
  const wrap=document.createElement('div');wrap.className='lc-sheet-wrap';
  wrap.innerHTML='<div class="pf-sheet-backdrop" data-lc4-close></div><section class="pf-sheet lc-sheet lc4-sheet" role="dialog" aria-label="'+(editing?'Edit add-on':'Add an add-on')+'"><header><h2>'+(editing?'Edit add-on':'Add an add-on')+'</h2><button type="button" data-lc4-close aria-label="Close">×</button></header><div class="lc4-form"><label class="lc1-field"><span class="lc1-label">Name</span><input class="lc1-input" data-lc4-name value="'+lcE(addon.name)+'" placeholder="e.g. Extra hour" maxlength="40" autocomplete="off"></label><label class="lc1-field"><span class="lc1-label">Price</span><div class="lc2-price"><span>₱</span><input data-lc4-price inputmode="numeric" value="'+lcE(lcGroup(addon.price))+'" placeholder="e.g. 500" autocomplete="off"></div></label><button type="button" class="button primary lc4-save" data-lc4-save>'+(editing?'Save':'Add add-on')+'</button></div></section>';
  document.body.appendChild(wrap);
  const name=wrap.querySelector('[data-lc4-name]'),price=wrap.querySelector('[data-lc4-price]'),save=wrap.querySelector('[data-lc4-save]');
  const ready=()=>{const ok=name.value.trim()&&Number(price.value.replace(/[^\d]/g,''))>0;save.disabled=!ok;return ok};
  name.oninput=ready;price.oninput=()=>{price.value=lcGroup(price.value);ready()};ready();
  setTimeout(()=>name.focus(),40);
  const commit=()=>{if(!ready())return;const item={name:name.value.trim(),price:price.value.replace(/[^\d]/g,'')};if(editing)d.addons[index]=item;else d.addons.push(item);lcSheetClose();lcRerender()};
  wrap.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();commit()}if(e.key==='Escape')lcSheetClose()};
  wrap.onclick=e=>{if(e.target.closest('[data-lc4-close]'))lcSheetClose();else if(e.target.closest('[data-lc4-save]'))commit()};
};
const lcCategoryLabel=d=>String(d.category||pf3Business?.().category||'Transport');
const lcReview=d=>{
  lcStep3Apply(d);lcStep4Apply(d);
  const cover=d.photos[0],category=lcCategoryLabel(d),per=d.pricedPer.toLowerCase();
  const days=d.days.every(Boolean)?'Every day':d.days.some(Boolean)?lcDayNames.filter((n,i)=>d.days[i]).join(', '):'None';
  const times=d.pricedPer==='Day'?lcTime(d.pickupStart)+' – '+lcTime(d.pickupEnd):d.timeMode==='slots'?(d.slots.slice().sort().map(lcTime).join(', ')||'—'):lcTime(d.hoursStart)+' – '+lcTime(d.hoursEnd);
  const asked=lcQuestions(d).filter(k=>d.fields[k]).map(k=>lcQuestionCopy[k][0].replace(/ location$/,''));
  const askedText=asked.length?asked.map((x,i)=>i?x.toLowerCase():x).join(', '):'Nothing extra';
  const noun=d.countBy.toLowerCase(),max=Number(d.maxPer)||0,maxText=max+' '+(max===1?noun.replace(/s$/,''):noun);
  const limit=Number(d.dailyLimit)||0,[limitLabel]=lcLimitCopy(d),limitShort=d.pricedPer==='Day'?'Units available':d.timeMode==='slots'?'Max per slot':'Daily limit',limitText=d.pricedPer==='Day'?String(limit):limit+' booking'+(limit===1?'':'s');
  const row=(k,v,cls='')=>'<div class="lcr-row"><span>'+k+'</span><strong class="'+cls+'">'+v+'</strong></div>';
  const section=(title,step,rows)=>'<section class="lcr-section"><header><h3>'+title+'</h3><button type="button" class="lcr-edit" data-lc-goto="'+step+'" aria-label="Edit '+title+'">Edit</button></header>'+rows.join('')+'</section>';
  const preview='<article class="lcr-preview"><div class="lcr-cover">'+(cover?'<img src="'+cover+'" alt="">':'')+'<span class="lcr-tag">'+lcE(category)+'</span></div><div class="lcr-body"><strong>'+lcE(d.name||'Untitled listing')+'</strong><span class="lcr-price"><b>'+lcPeso(d.price)+'</b> / '+lcE(per)+'</span><span class="lcr-meta">'+lcE([lcDuration(d),'Up to '+maxText].join(' · '))+'</span>'+(d.description?'<p>'+lcE(d.description)+'</p>':'')+'</div></article>';
  return '<div class="lcr">'+preview
    +section('Basics',1,[row('Category',lcE(category)),row('Photos',cover?'<span class="lcr-photos"><img class="lcr-thumb" src="'+cover+'" alt="Cover photo">'+(d.photos.length>1?'<span>+'+(d.photos.length-1)+' photo'+(d.photos.length===2?'':'s')+'</span>':'')+'</span>':'—'),row('Meeting point',lcE(d.location||'—'))])
    +section('Price and capacity',2,[row('Price',lcPeso(d.price)+' per '+lcE(per)),row(d.durationMode==='guest'?'Max '+d.guestUnit:'Duration',lcE(d.durationMode==='guest'?d.guestMax+' '+(Number(d.guestMax)===1?d.guestUnit.replace(/s$/,''):d.guestUnit):lcDuration(d))),row('Max per booking',lcE(maxText)),row('Payment',[d.payRoom&&'Charge to room',d.payOnline&&'Pay online'].filter(Boolean).join('<br>')||'—')])
    +section('Availability',3,[row('Days',lcE(days)),row(d.pricedPer==='Day'?'Pickup hours':'Booking times',lcE(times)),row('Advance notice',lcE(d.notice)),row(limitShort,lcE(limitText)),row('Blocked dates',d.blocks.length?lcE(d.blocks.map(lcBlockLabel).join(', ')):'None',d.blocks.length?'is-blocked':'')])
    +section('Booking details',4,[row('Ask guests for',lcE(askedText))])
    +'<p class="lcr-note">Guests can book as soon as you publish.<br>You can edit or deactivate it anytime.</p></div>';
};
const lcTitles=['Basics','Price and capacity','Availability','Booking details','Review and publish'];
const lcSubtitles=['Tell guests what you offer.','Set your price and how many you can take.','Choose when guests can book.','Choose what guests tell you when they book.','Check how guests will see your listing.'];
const lcStep1Ready=d=>Boolean(d.name.trim()&&d.photos.length);
const lcMarkup=()=>{
  const {step,data}=state.lc,review=step===5;
  const progress='<div class="lc-bars" aria-hidden="true">'+[1,2,3,4].map(n=>'<span class="'+(n<=step?'is-done':'')+'"></span>').join('')+'</div><div class="lc-heading"><span>'+(review?'Review':'Step '+step+' of 4')+'</span><h2>'+lcTitles[step-1]+'</h2><p>'+lcSubtitles[step-1]+'</p></div>';
  const body=step===1?lcStep1(data):step===2?lcStep2(data):step===3?lcStep3(data):step===4?lcStep4(data):lcReview(data);
  const nextReady=step===1?lcStep1Ready(data):step===2?lcStep2Ready(data):true;
  const next=review?'<button type="button" class="button primary" data-lc-publish>Publish</button>':'<button type="button" class="button primary lc-next'+(nextReady?'':' is-waiting')+'" data-lc-next aria-disabled="'+(!nextReady)+'">'+(step===4?'Review listing':'Next')+'</button>';
  const footer='<footer class="lc-footer'+(step===1?' is-single':'')+'">'+(step>1?'<button type="button" class="button ghost lc-back" data-lc-back>Back</button>':'')+next+'</footer>';
  if(review)return '<div class="lc-page is-refined is-review">'+progress+'<div class="lc-body">'+body+'</div><footer class="lc-footer is-single"><button type="button" class="button primary" data-lc-publish>Publish listing</button></footer></div>';
  return '<div class="lc-page is-refined">'+progress+'<div class="lc-body">'+body+'</div>'+footer+'</div>';
};
const lcValidate=step=>{
  const d=state.lc.data;
  if(step===1&&!lcStep1Ready(d)){state.lc.tried1=true;render();setTimeout(()=>{(d.name.trim()?document.querySelector('.lcp-empty'):document.querySelector('[data-lc-input="name"]'))?.focus?.();document.querySelector('.lc1-error')?.scrollIntoView({block:'center'})},20);return false}
  if(step===2&&!lcStep2Ready(d)){state.lc.tried2=true;render();setTimeout(()=>{document.querySelector('.lc1-error')?.scrollIntoView({block:'center'});if(!(Number(String(d.price).replace(/[^\d]/g,''))>0))document.querySelector('[data-lc-input="price"]')?.focus()},20);return false}
  if(step===3&&!d.days.some(Boolean)){toast('Choose at least one available day');return false}
  if(step===3&&d.pricedPer!=='Day'&&d.timeMode==='slots'&&!d.slots.some(Boolean)){state.lc.tried3=true;render();return false}
  if(step===3&&!(Number(d.dailyLimit)>0)){toast('Set a daily limit');return false}
  return true;
};
const lcToListing=(status,existingId)=>{
  const d=state.lc.data,unitLabel={Booking:'per booking',Person:'per person',Hour:'per hour',Day:'per day'}[d.pricedPer];
  return {id:existingId||('listing-'+Date.now()),created:true,name:d.name.trim()||'Untitled listing',category:pf3Business?.().category||'Transport',price:String(Number(String(d.price).replace(/[^\d]/g,''))||0),unit:unitLabel,stock:'Up to '+d.maxPer+' '+d.countBy.toLowerCase(),status,location:d.location,payment:[d.payRoom&&'Room charge',d.payOnline&&'Online'].filter(Boolean).join(' + '),confirmationMethod:'Manual approval',photo:d.photos[0]||'',photos:d.photos.slice(),description:d.description,setup:JSON.parse(JSON.stringify(d))};
};
const lcExit=()=>{state.lc.open=false;render();const page=document.querySelector('.page');if(page)page.scrollTop=0};
const lcFinish=status=>{
  const d=state.lc.data;
  if(status==='Active'&&!lcValidate(1))return;
  const editingId=state.lc.editingId,listing=lcToListing(status,editingId);
  const index=listings.findIndex(item=>item.id===editingId);
  if(index>=0)listings[index]=listing;else listings.unshift(listing);
  if(typeof listingMockPhotos==='object'&&listing.photo)listingMockPhotos[listing.id]=listing.photo;
  lcSaveCreated();
  state.lc={open:false,step:1,data:lcDefaults(),month:[2026,9]};
  render();toast(status==='Draft'?'Draft saved':'Listing published');
};
const lcResize=file=>new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>{const image=new Image();image.onload=()=>{const max=900,scale=Math.min(1,max/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',0.8))};image.onerror=()=>resolve(null);image.src=reader.result};reader.readAsDataURL(file)});
const lcOpen=(listing,duplicate)=>{
  const data=listing?.setup?JSON.parse(JSON.stringify(listing.setup)):{...lcDefaults(),name:listing?listing.name:'',location:listing?.location||'',price:listing?String(listing.price).replace(/[^\d]/g,''):'',photos:listing?.photo?[listing.photo]:[]};
  if(duplicate)data.name=(data.name||'Listing')+' (copy)';
  state.lc={open:true,step:1,data,month:[2026,9],editingId:listing&&!duplicate?listing.id:null};
  render();const page=document.querySelector('.page');if(page)page.scrollTop=0;
};
window.addEventListener('click',event=>{
  if(event.target.closest?.('[data-listing-new]')){event.preventDefault();event.stopImmediatePropagation();const draft=state.lc;if(draft&&!draft.open&&draft.data&&(draft.data.name||draft.data.photos.length)&&!draft.editingId){state.lc.open=true;render()}else lcOpen(null,false);return}
},true);
const renderBeforeCreateListing=render;
render=function(){
  if(state.page!=='listings'&&state.lc)state.lc.open=false;
  renderBeforeCreateListing.apply(this,arguments);
  if(state.page!=='listings')return;
  if(!state.lc?.open){lcListingsPolish();return}
  const pageEl=document.querySelector('.page');if(!pageEl)return;
  pageEl.innerHTML=lcMarkup();
  const title=document.querySelector('.topbar .topbar-context strong');if(title){const existing=listings.find(item=>item.id===state.lc.editingId);title.textContent=state.lc.step===5?'Review listing':existing&&existing.status!=='Draft'?'Edit listing':'New listing'}
  const back=document.querySelector('[data-profile-back]');if(back){back.setAttribute('aria-label','Back to Listings');back.onclick=lcExit}
  const bar=document.querySelector('.topbar');
  if(bar&&!bar.querySelector('[data-lc-draft]')){const draft=document.createElement('button');draft.type='button';draft.className='lc-draft-button';draft.setAttribute('data-lc-draft','');draft.textContent='Save draft';bar.appendChild(draft)}
  lcBind();
};
const lcRerender=()=>{const scroll=document.querySelector('.page')?.scrollTop||0;render();const page=document.querySelector('.page');if(page)page.scrollTop=scroll};
const lcBind=()=>{
  const d=state.lc.data,q=selector=>document.querySelectorAll(selector);
  q('[data-lc-draft]').forEach(button=>button.onclick=()=>{if(!d.name.trim()){toast('Add a listing name to save a draft');state.lc.step=1;render();document.querySelector('[data-lc-input="name"]')?.focus();return}d._step=Math.min(4,state.lc.step||1);lcFinish('Draft')});
  q('[data-lc-input]').forEach(input=>{const update=()=>{const key=input.dataset.lcInput;let value=input.value;if(['price','maxPer','dailyLimit','durationValue','guestMin','guestMax'].includes(key)){value=value.replace(/[^\d]/g,'');if(input.value!==value)input.value=value}d[key]=value;if(key==='description'){const counter=document.querySelector('[data-lc-count]');if(counter)counter.textContent=value.length}};input.oninput=update;input.onchange=update});
  q('[data-lc-set]').forEach(button=>button.onclick=()=>{const key=button.dataset.lcSet,value=button.dataset.lcValue;if(key==='durationMode')d.durationMode=value==='Fixed'?'fixed':'guest';else if(key==='timeMode')d.timeMode=value==='Fixed slots'?'slots':'hours';else if(key==='blockMode'){d.blockMode=value;state.lc.rangeStart=null}else d[key]=value;lcRerender()});
  q('[data-lc-check]').forEach(input=>input.onchange=()=>{const key=input.dataset.lcCheck;if(key.startsWith('f-'))d.fields[key.slice(2)]=input.checked;else d[key]=input.checked});
  q('[data-lc-step-num]').forEach(button=>button.onclick=()=>{const key=button.dataset.lcStepNum;d[key]=String(Math.max(1,Math.min(99,(Number(d[key])||0)+Number(button.dataset.lcDelta))));if(key==='guestMin'&&Number(d.guestMax)<Number(d.guestMin))d.guestMax=d.guestMin;if(key==='guestMax'&&Number(d.guestMax)<Number(d.guestMin))d.guestMin=d.guestMax;lcRerender()});
  q('[data-lc-day]').forEach(button=>button.onclick=()=>{const i=Number(button.dataset.lcDay);d.days[i]=!d.days[i];lcRerender()});
  q('[data-lc-slot]').forEach(input=>input.onchange=()=>{d.slots[Number(input.dataset.lcSlot)]=input.value});
  q('[data-lc-slot-remove]').forEach(button=>button.onclick=()=>{d.slots.splice(Number(button.dataset.lcSlotRemove),1);lcRerender()});
  q('[data-lc-slot-add]').forEach(button=>button.onclick=()=>{d.slots.push('16:00');lcRerender()});
  q('[data-lc-date]').forEach(button=>button.onclick=()=>{const key=button.dataset.lcDate,i=d.blocked.indexOf(key);if(i>=0)d.blocked.splice(i,1);else d.blocked.push(key);lcRerender()});
  q('[data-lc-month]').forEach(button=>button.onclick=()=>{let [y,m]=state.lc.month;m+=Number(button.dataset.lcMonth);if(m<0){m=11;y--}if(m>11){m=0;y++}state.lc.month=[y,m];lcRerender()});
  q('[data-lc-addon-add]').forEach(button=>button.onclick=()=>{d.addons.push({name:'',price:''});lcRerender();const inputs=document.querySelectorAll('[data-lc-addon-name]');inputs[inputs.length-1]?.focus()});
  q('[data-lc-addon-remove]').forEach(button=>button.onclick=()=>{d.addons.splice(Number(button.dataset.lcAddonRemove),1);lcRerender()});
  q('[data-lc-addon-name]').forEach(input=>input.oninput=()=>{d.addons[Number(input.dataset.lcAddonName)].name=input.value});
  q('[data-lc-addon-price]').forEach(input=>input.oninput=()=>{const value=input.value.replace(/[^\d]/g,'');if(value!==input.value)input.value=value;d.addons[Number(input.dataset.lcAddonPrice)].price=value});
  q('[data-lc-photos]').forEach(input=>input.onchange=async()=>{const files=[...(input.files||[])].filter(f=>/^image\//.test(f.type)).slice(0,5-d.photos.length);for(const file of files){const src=await lcResize(file);if(src)d.photos.push(src)}lcRerender()});
  q('[data-lc-photo-remove]').forEach(button=>button.onclick=()=>{d.photos.splice(Number(button.dataset.lcPhotoRemove),1);lcRerender()});
  q('[data-lc-cover]').forEach(button=>button.onclick=()=>{const i=Number(button.dataset.lcCover),[photo]=d.photos.splice(i,1);d.photos.unshift(photo);lcRerender()});
  q('[data-lc-goto]').forEach(button=>button.onclick=()=>{state.lc.step=Number(button.dataset.lcGoto);render();const page=document.querySelector('.page');if(page)page.scrollTop=0});
  q('[data-lc-back]').forEach(button=>button.onclick=()=>{state.lc.step=Math.max(1,state.lc.step-1);render();const page=document.querySelector('.page');if(page)page.scrollTop=0});
  q('[data-lc-next]').forEach(button=>button.onclick=()=>{if(!lcValidate(state.lc.step))return;state.lc.step=Math.min(5,state.lc.step+1);render();const page=document.querySelector('.page');if(page)page.scrollTop=0});
  q('[data-lc-publish]').forEach(button=>button.onclick=()=>{for(const s of [1,2,3]){if(!lcValidate.call(null,s)){state.lc.step=s;render();return}}lcFinish('Active')});
};
/* Listings page: prices without decimals and a ⋯ menu (Edit · Duplicate · Delete) on each card. */
const lcListingsPolish=()=>{
  document.querySelectorAll('.page .listing-price-line strong, .page [class*=listing] .price').forEach(node=>{node.textContent=node.textContent.replace(/(₱[\d,]+)\.00\b/,'$1')});
  document.querySelectorAll('.page [data-listing-card]').forEach(card=>{
    const id=card.dataset.listingCard,edit=card.querySelector('[data-listing-edit-id]');
    if(card.querySelector('[data-lc-more]'))return;
    if(edit)edit.classList.add('lc-hidden-edit');
    const more=document.createElement('button');more.type='button';more.className='lc-more';more.setAttribute('data-lc-more',id);more.setAttribute('aria-label','More actions');more.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>';
    (card.querySelector('.listing-compact-actions')||card).appendChild(more);
  });
};
/* ⋯ on a listing card opens a bottom sheet: Edit · Duplicate · Delete (delete confirms inside the sheet). */
const lcSheetClose=()=>{document.querySelector('.lc-sheet-wrap')?.remove()};
const lcOpenSheet=(id,confirm)=>{
  lcSheetClose();
  const listing=listings.find(item=>item.id===id);if(!listing)return;
  const wrap=document.createElement('div');wrap.className='lc-sheet-wrap';
  const body=confirm
    ?'<p class="lc-sheet-confirm">Guests won’t be able to book it anymore. Past bookings stay in your records.</p><div class="lc-sheet-actions"><button type="button" class="button ghost" data-lc-sheet="back">Cancel</button><button type="button" class="button pf-danger" data-lc-sheet="confirm-delete">Delete</button></div>'
    :'<div class="lc-sheet-list"><button type="button" data-lc-sheet="edit"><i class="hgi-stroke hgi-edit-02" aria-hidden="true"></i><span>Edit</span></button><button type="button" data-lc-sheet="duplicate"><i class="hgi-stroke hgi-copy-01" aria-hidden="true"></i><span>Duplicate</span></button><button type="button" class="is-danger" data-lc-sheet="delete"><i class="hgi-stroke hgi-delete-02" aria-hidden="true"></i><span>Delete</span></button></div>';
  wrap.innerHTML='<div class="pf-sheet-backdrop" data-lc-sheet="close"></div><section class="pf-sheet lc-sheet" role="dialog" data-lc-sheet-id="'+lcE(listing.id)+'" aria-label="'+lcE(listing.name)+'"><header><h2>'+(confirm?'Delete '+lcE(listing.name)+'?':lcE(listing.name))+'</h2><button type="button" data-lc-sheet="close" aria-label="Close">×</button></header>'+body+'</section>';
  document.body.appendChild(wrap);
  wrap.onclick=event=>{
    const action=event.target.closest('[data-lc-sheet]')?.dataset.lcSheet;if(!action)return;
    if(action==='close'){lcSheetClose();return}
    if(action==='back'){lcOpenSheet(id,false);return}
    if(action==='delete'){lcOpenSheet(id,true);return}
    lcSheetClose();
    if(action==='edit'){if(listing.created)lcOpen(listing,false);else document.querySelector('[data-listing-card="'+id+'"] [data-listing-edit-id]')?.click()}
    if(action==='toggle'){listing.status=listing.status==='Active'?'Paused':'Active';lcSaveCreated();render();toast(listing.name+(listing.status==='Active'?' activated':' deactivated'))}
    if(action==='duplicate'){const copy={...JSON.parse(JSON.stringify(listing)),id:'listing-'+Date.now(),created:true,name:listing.name+' (copy)',status:'Draft',capacity:lcCapacity(listing)};listings.splice(listings.indexOf(listing)+1,0,copy);if(typeof listingMockPhotos==='object'&&(copy.photo||listingMockPhotos[id]))listingMockPhotos[copy.id]=copy.photo||listingMockPhotos[id];lcSaveCreated();render();toast('Duplicated as a draft')}
    if(action==='confirm-delete'){const i=listings.indexOf(listing);if(i>=0)listings.splice(i,1);lcSaveCreated();render();toast(listing.name+' deleted')}
  };
};
window.addEventListener('click',event=>{
  const more=event.target.closest?.('[data-lc-more]');
  if(!more)return;
  event.preventDefault();event.stopImmediatePropagation();
  lcOpenSheet(more.dataset.lcMore,false);
},true);
render();

/* Step 1: Next looks disabled until name + cover photo are in; errors clear as soon as they're fixed. */
const renderBeforeLcStep1=render;
render=function(){
  renderBeforeLcStep1.apply(this,arguments);
  if(state.page!=='listings'||!state.lc?.open||state.lc.step!==1)return;
  const name=document.querySelector('[data-lc-input="name"]'),next=document.querySelector('[data-lc-next]');
  if(name)name.addEventListener('input',()=>{const ready=lcStep1Ready(state.lc.data);next?.classList.toggle('is-waiting',!ready);next?.setAttribute('aria-disabled',String(!ready));if(name.value.trim()){name.classList.remove('has-error');name.parentElement.querySelector('.lc1-error')?.remove()}});
};
render();

/* Step 2: Next brightens as soon as there's a price and a payment option. */
const renderBeforeLcStep2=render;
render=function(){
  renderBeforeLcStep2.apply(this,arguments);
  if(state.page!=='listings'||!state.lc?.open||state.lc.step!==2)return;
  const next=document.querySelector('[data-lc-next]');
  const refresh=()=>{const ready=lcStep2Ready(state.lc.data);next?.classList.toggle('is-waiting',!ready);next?.setAttribute('aria-disabled',String(!ready))};
  const price=document.querySelector('[data-lc-input="price"]');
  if(price)price.addEventListener('input',()=>{refresh();if(Number(price.value)>0){price.parentElement.classList.remove('has-error');price.closest('.lc1-field')?.querySelector('.lc1-error')?.remove()}});
  document.querySelectorAll('[data-lc-check="payRoom"],[data-lc-check="payOnline"]').forEach(input=>input.addEventListener('change',()=>{refresh();if(state.lc.data.payRoom||state.lc.data.payOnline){const box=document.querySelector('.lc2-toggles');box?.classList.remove('has-error');box?.parentElement.querySelector('.lc1-error')?.remove()}}));
  const max=document.querySelector('[data-lc-input="maxPer"]');if(max)max.addEventListener('input',refresh);
};
render();

/* Listings: show "Inactive" instead of "Paused" (status data unchanged). */
const renderBeforeInactiveLabel=render;
render=function(){
  renderBeforeInactiveLabel.apply(this,arguments);
  return;
  const root=document.querySelector('.page');if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
  while((node=walker.nextNode())){if(/\bPaused\b|\bpaused\b/.test(node.nodeValue))node.nodeValue=node.nodeValue.replace(/\bPaused\b/g,'Inactive').replace(/\bpaused\b/g,'inactive')}
  root.querySelectorAll('[aria-label]').forEach(el=>{const label=el.getAttribute('aria-label');if(/^Pause /.test(label))el.setAttribute('aria-label',label.replace(/^Pause /,'Set inactive: '));else if(/^(Resume|Activate|Unpause) /.test(label))el.setAttribute('aria-label',label.replace(/^(Resume|Activate|Unpause) /,'Set active: '))});
};
const toastBeforeInactive=toast;
toast=function(message){return toastBeforeInactive(String(message))};
render();

/* Step 1: a single cover photo (add, change or remove). */
const renderBeforeSingleCover=render;
render=function(){
  renderBeforeSingleCover.apply(this,arguments);
  if(state.page!=='listings'||!state.lc?.open||state.lc.step!==1)return;
  document.querySelectorAll('[data-lc-cover-replace]').forEach(input=>input.onchange=async()=>{
    const file=input.files?.[0];if(!file)return;
    if(!/^image\//.test(file.type)){toast('Choose an image file');return}
    const src=await lcResize(file);if(!src)return;
    state.lc.data.photos=[src];
    const scroll=document.querySelector('.page')?.scrollTop||0;render();const page=document.querySelector('.page');if(page)page.scrollTop=scroll;
  });
};
render();

/* Listing cards: no category, no weekly orders; capacity line; status chips without counts (hidden under 5 listings). */
const lcSampleCapacity={'airport-sedan':4,innova:7,'tourist-van':12};
function lcCapacity(listing){
  if(listing.capacity)return listing.capacity;
  const setup=listing.setup;
  if(setup)return 'Up to '+setup.maxPer+' '+String(setup.countBy||'guests').toLowerCase();
  const people=lcSampleCapacity[listing.id],vehicles=Number(String(listing.stock||'').match(/\d+/)?.[0]||0);
  return [people?'Up to '+people+' passengers':'',vehicles?vehicles+' vehicle'+(vehicles===1?'':'s'):''].filter(Boolean).join(' · ')||String(listing.stock||'');
}
const renderBeforeListingCards=render;
render=function(){
  renderBeforeListingCards.apply(this,arguments);
  if(state.page!=='listings'||state.lc?.open)return;
  document.querySelectorAll('.page [data-listing-card]').forEach(card=>{
    const listing=listings.find(item=>item.id===card.dataset.listingCard);if(!listing)return;
    card.querySelectorAll('.listing-card-heading small, .listing-category').forEach(node=>node.remove());
    const info=card.querySelector('.listing-quick-info');
    if(info)info.innerHTML='<span>'+lcE(lcCapacity(listing))+'</span>';
  });
  const filters=document.querySelector('.listings-status-filters');
  if(filters){
    filters.querySelectorAll('button').forEach(button=>{button.querySelectorAll('b,em,.count,small').forEach(node=>node.remove());button.childNodes.forEach(node=>{if(node.nodeType===3)node.nodeValue=node.nodeValue.replace(/\s*\d+\s*$/,'')})});
    filters.hidden=false;
  }
};
render();

/* Step 2 radio groups: arrow keys move the selection like native radios. */
document.addEventListener('keydown',event=>{
  const option=event.target.closest?.('.lc2-radios [role="radio"], .lc2-chips [role="radio"]');if(!option)return;
  if(!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(event.key))return;
  event.preventDefault();
  const options=[...option.parentElement.querySelectorAll('[role="radio"]')],index=options.indexOf(option),step=['ArrowRight','ArrowDown'].includes(event.key)?1:-1;
  const next=options[(index+step+options.length)%options.length],group=next.dataset.lcSet,value=next.dataset.lcValue;
  next.click();
  setTimeout(()=>document.querySelector('[role="radio"][data-lc-set="'+group+'"][data-lc-value="'+value+'"]')?.focus(),0);
});

/* Filter pill counts: Listings and Chat show how many are in each filter; no number when it's 0. */
const renderBeforePillCounts=render;
render=function(){
  renderBeforePillCounts.apply(this,arguments);
  if(state.page==='listings'&&!state.lc?.open){
    document.querySelectorAll('.listings-status-filters button').forEach(button=>{
      const span=button.querySelector('span');
      if(span){const n=Number(span.textContent.trim());span.hidden=false;span.setAttribute('aria-label',n+' listings')}
    });
  }
  if(state.page==='chat'&&state.cx?.view==='list'){
    const pool=cxThreads.filter(cxThreadListed).filter(thread=>!cxIsArchived(thread));
    const counts={All:pool.length,Unread:cxUnreadTotal(),Guests:pool.filter(t=>t.kind==='guest').length,'Front Desk':pool.filter(t=>t.kind==='frontdesk').length};
    document.querySelectorAll('[data-cx-filter]').forEach(button=>{
      const name=button.dataset.cxFilter,n=counts[name]||0;
      button.textContent=name+(n>0?' '+n:'');
    });
  }
};
render();

/* Refresh also resumes in-progress screens: Create listing (step + entries), Edit business / Edit account, listing detail. */
const resumeExtraKey='cabana:resume-extra';
const resumeExtraSave=()=>{
  if(!window.__cabanaResumeReady)return;
  const extra={page:state.page,profileSub:state.profileSub||null,listingDetail:state.listingDetail||null,listingEditId:state.listingEditId||null,lc:state.lc?{open:Boolean(state.lc.open),step:state.lc.step,data:state.lc.data,month:state.lc.month,editingId:state.lc.editingId||null,tried1:state.lc.tried1,tried2:state.lc.tried2}:null};
  try{localStorage.setItem(resumeExtraKey,JSON.stringify(extra))}catch(error){try{const lite={...extra,lc:extra.lc?{...extra.lc,data:{...extra.lc.data,photos:[]}}:null};localStorage.setItem(resumeExtraKey,JSON.stringify(lite))}catch(inner){}}
};
const renderBeforeResumeExtra=render;
render=function(){renderBeforeResumeExtra.apply(this,arguments);resumeExtraSave()};
document.addEventListener('input',()=>{clearTimeout(window.__cabanaResumeExtraTimer);window.__cabanaResumeExtraTimer=setTimeout(resumeExtraSave,250)},true);
document.addEventListener('change',()=>{clearTimeout(window.__cabanaResumeExtraTimer);window.__cabanaResumeExtraTimer=setTimeout(resumeExtraSave,250)},true);
window.addEventListener('pagehide',resumeExtraSave);
setTimeout(()=>{
  let extra=null;try{extra=JSON.parse(localStorage.getItem(resumeExtraKey)||'null')}catch(error){}
  if(extra&&extra.page===state.page){
    let changed=false;
    if(state.page==='listings'&&extra.lc?.open&&extra.lc.data){state.lc={open:true,step:Math.min(5,Math.max(1,Number(extra.lc.step)||1)),data:{...lcDefaults(),...extra.lc.data},month:extra.lc.month||[2026,9],editingId:extra.lc.editingId||null,tried1:extra.lc.tried1,tried2:extra.lc.tried2};changed=true}
    if(state.page==='listings'&&!extra.lc?.open&&extra.listingDetail){state.listingDetail=extra.listingDetail;changed=true}
    if(state.page==='listings'&&!extra.lc?.open&&extra.listingEditId){state.listingEditId=extra.listingEditId;changed=true}
    if(state.page==='profile'&&['business','account','password'].includes(extra.profileSub)){state.profileSub=extra.profileSub;changed=true}
    if(changed){
      let saved=null;try{saved=JSON.parse(localStorage.getItem('cabana:resume-view')||'null')}catch(error){}
      render();
      const scroll=Number(saved?.scroll)||0,restore=()=>{const page=document.querySelector('.page');if(page)page.scrollTop=scroll};
      restore();setTimeout(restore,120);
    }
  }
  setTimeout(resumeExtraSave,300);
},0);

/* Step 2: live price summary above the buttons; Next waits for a price, a payment option and a valid range. */
const renderBeforeLcSummary=render;
render=function(){
  renderBeforeLcSummary.apply(this,arguments);
  if(state.page!=='listings'||!state.lc?.open||state.lc.step!==2)return;
  const footer=document.querySelector('.lc-footer');if(!footer)return;
  footer.querySelector('[data-lc-summary]')?.remove();return;
  let summary=footer.querySelector('[data-lc-summary]');
  if(!summary){summary=document.createElement('p');summary.className='lc2-summary';summary.setAttribute('data-lc-summary','');summary.setAttribute('aria-live','polite');footer.prepend(summary)}
  const next=footer.querySelector('[data-lc-next]');
  const update=()=>{const d=state.lc.data;summary.textContent=lcPriceSummary(d);summary.classList.toggle('is-empty',!(Number(String(d.price).replace(/[^\d]/g,''))>0));const ready=lcStep2Ready(d);next?.classList.toggle('is-waiting',!ready);next?.setAttribute('aria-disabled',String(!ready))};
  update();
  document.querySelectorAll('.lc-page [data-lc-input]').forEach(input=>input.addEventListener('input',update));
  document.querySelectorAll('.lc-page [data-lc-input="guestMin"],.lc-page [data-lc-input="guestMax"]').forEach(input=>input.addEventListener('change',()=>{const scroll=document.querySelector('.page')?.scrollTop||0;render();const page=document.querySelector('.page');if(page)page.scrollTop=scroll}));
};
render();

/* Step 2: dropdowns (Priced per, duration unit) re-render; "Up to N ___ per booking" stays singular/plural as you type. */
const renderBeforeLcSelects=render;
render=function(){
  renderBeforeLcSelects.apply(this,arguments);
  if(state.page!=='listings'||!state.lc?.open||state.lc.step!==2)return;
  const d=state.lc.data;
  document.querySelectorAll('[data-lc-select]').forEach(sel=>sel.onchange=()=>{const scroll=document.querySelector('.page')?.scrollTop||0;d[sel.dataset.lcSelect]=sel.value;render();const page=document.querySelector('.page');if(page)page.scrollTop=scroll});
  const max=document.querySelector('[data-lc-input="maxPer"]'),noun=document.querySelector('[data-lc-upto-noun]');
  if(max&&noun)max.addEventListener('input',()=>{const n=d.countBy.toLowerCase();noun.textContent=(Number(max.value)===1?n.replace(/s$/,''):n)+' per booking'});
  const gmax=document.querySelector('[data-lc-input="guestMax"]');
  if(gmax)gmax.addEventListener('change',()=>{if(!(Number(gmax.value)>=1))d.guestMax='1';render()});
};
render();

/* Step 2: dropdowns open a bottom sheet of options instead of the native picker. */
const lcDdOpen=key=>{
  lcSheetClose();
  const conf=lcDdOptions[key];if(!conf)return;const d=state.lc.data;
  const wrap=document.createElement('div');wrap.className='lc-sheet-wrap';
  wrap.innerHTML='<div class="pf-sheet-backdrop" data-lc-dd-close></div><section class="pf-sheet lc-sheet lc-dd-sheet" role="dialog" aria-label="'+lcE(conf.label)+'"><header><h2>'+lcE(conf.label)+'</h2><button type="button" data-lc-dd-close aria-label="Close">×</button></header><div class="lc-sheet-list" role="listbox">'+conf.options.map(([v,t])=>'<button type="button" role="option" aria-selected="'+(d[key]===v)+'" class="'+(d[key]===v?'is-selected':'')+'" data-lc-dd-value="'+lcE(v)+'"><span>'+lcE(t)+'</span>'+(d[key]===v?'<i class="hgi-stroke hgi-tick-02" aria-hidden="true"></i>':'')+'</button>').join('')+'</div></section>';
  document.body.appendChild(wrap);
  setTimeout(()=>{const sel=wrap.querySelector('.is-selected')||wrap.querySelector('[data-lc-dd-value]');sel?.scrollIntoView({block:'center'});sel?.focus({preventScroll:true})},30);
  wrap.onclick=event=>{
    if(event.target.closest('[data-lc-dd-close]')){lcSheetClose();document.querySelector('[data-lc-dd="'+key+'"]')?.focus();return}
    const option=event.target.closest('[data-lc-dd-value]');if(!option)return;
    lcSheetClose();
    if(conf.onPick||d[key]!==option.dataset.lcDdValue){const scroll=document.querySelector('.page')?.scrollTop||0;if(conf.onPick)conf.onPick(option.dataset.lcDdValue);else d[key]=option.dataset.lcDdValue;render();const page=document.querySelector('.page');if(page)page.scrollTop=scroll}
    document.querySelector('[data-lc-dd="'+key+'"]')?.focus();
  };
};
window.addEventListener('click',event=>{
  const dd=event.target.closest?.('[data-lc-dd]');if(!dd)return;
  event.preventDefault();event.stopImmediatePropagation();lcDdOpen(dd.dataset.lcDd);
},true);
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.querySelector('.lc-dd-sheet'))lcSheetClose()});

/* Step 2: price shows thousands separators; duration unit reads "hour" when the value is 1. */
const renderBeforeLcV4=render;
render=function(){
  renderBeforeLcV4.apply(this,arguments);
  if(state.page!=='listings'||!state.lc?.open||state.lc.step!==2)return;
  const price=document.querySelector('[data-lc-input="price"]');
  if(price)price.addEventListener('input',()=>{const end=price.value.length-price.selectionEnd;price.value=lcGroup(price.value);const pos=Math.max(0,price.value.length-end);try{price.setSelectionRange(pos,pos)}catch(e){}});
  const dur=document.querySelector('[data-lc-input="durationValue"]'),unitBtn=document.querySelector('[data-lc-dd="durationUnit"]');
  if(dur&&unitBtn)dur.addEventListener('input',()=>{const one=Number(dur.value)===1,u=state.lc.data.durationUnit;unitBtn.textContent=u==='minutes'?(one?'minute':'minutes'):(one?'hour':'hours');lcDdOptions.durationUnit.options=one?[['minutes','minute'],['hours','hour']]:[['minutes','minutes'],['hours','hours']]});
};
render();

/* Step 2: payment cards highlight when ticked. */
const renderBeforeLcPayCards=render;
render=function(){
  renderBeforeLcPayCards.apply(this,arguments);
  if(state.page!=='listings'||!state.lc?.open||state.lc.step!==2)return;
  document.querySelectorAll('.lc2-pay-card input').forEach(input=>input.addEventListener('change',()=>input.closest('.lc2-pay-card').classList.toggle('is-on',input.checked)));
};
render();

/* Step 3: calendar taps (single day / date range), unblock chips, slot removal. */
window.addEventListener('click',event=>{
  if(state.page!=='listings'||!state.lc?.open||state.lc.step!==3)return;
  const d=state.lc.data;
  const cell=event.target.closest?.('[data-lc3-date]'),unblock=event.target.closest?.('[data-lc3-unblock]'),slot=event.target.closest?.('[data-lc3-slot-remove]');
  if(!cell&&!unblock&&!slot)return;
  event.preventDefault();event.stopImmediatePropagation();
  lcBlocksSync(d);
  if(slot){d.slots=d.slots.filter(v=>v!==slot.dataset.lc3SlotRemove)}
  else if(unblock){d.blocks.splice(Number(unblock.dataset.lc3Unblock),1);state.lc.rangeStart=null}
  else{
    const key=cell.dataset.lc3Date,hit=d.blocks.findIndex(b=>key>=b.start&&key<=b.end);
    if(hit>=0&&!state.lc.rangeStart){d.blocks.splice(hit,1)}
    else if(d.blockMode==='Date range'){
      if(!state.lc.rangeStart){state.lc.rangeStart=key;d.blocks.push({start:key,end:key})}
      else{let start=state.lc.rangeStart,end=key;if(end<start)[start,end]=[end,start];state.lc.rangeStart=null;
        d.blocks=d.blocks.filter(b=>b.end<start||b.start>end);d.blocks.push({start,end})}
    }
    else d.blocks.push({start:key,end:key});
  }
  lcBlocksSync(d);lcRerender();
},true);

/* Step 3: blocked dates live in a bottom sheet. */
window.addEventListener('click',event=>{
  if(state.page!=='listings'||!state.lc?.open||state.lc.step!==3)return;
  const open=event.target.closest?.('[data-lc3-open-blocks]'),close=event.target.closest?.('[data-lc3-close-blocks]');
  if(!open&&!close)return;
  event.preventDefault();event.stopImmediatePropagation();
  state.lc.blockSheet=Boolean(open);state.lc.rangeStart=null;lcRerender();
  if(close)setTimeout(()=>document.querySelector('[data-lc3-open-blocks]')?.focus({preventScroll:true}),30);
},true);
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&state.lc?.blockSheet&&!document.querySelector('.lc-dd-sheet')){state.lc.blockSheet=false;state.lc.rangeStart=null;lcRerender()}});
const renderBeforeLcBlockSheet=render;
render=function(){
  renderBeforeLcBlockSheet.apply(this,arguments);
  if(state.lc&&!(state.page==='listings'&&state.lc.open&&state.lc.step===3))state.lc.blockSheet=false;
  const fresh=[...document.querySelectorAll('.lc3-sheet-wrap')].find(x=>x.parentElement!==document.body);
  document.querySelectorAll('body > .lc3-sheet-wrap').forEach(x=>x.remove());
  if(fresh)document.body.appendChild(fresh);
};

/* Step 4: add-on rows open a small sheet; ✕ removes. */
window.addEventListener('click',event=>{
  if(state.page!=='listings'||!state.lc?.open||state.lc.step!==4)return;
  const add=event.target.closest?.('[data-lc4-addon-new]'),edit=event.target.closest?.('[data-lc4-addon-edit]'),remove=event.target.closest?.('[data-lc4-addon-remove]');
  if(!add&&!edit&&!remove)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(remove){state.lc.data.addons.splice(Number(remove.dataset.lc4AddonRemove),1);lcRerender()}
  else lcAddonSheet(edit?Number(edit.dataset.lc4AddonEdit):null);
},true);

/* Listings: continue an unfinished setup (unsaved progress banner + "Continue setup" on draft cards). */
const lcHasProgress=lc=>Boolean(lc&&!lc.open&&!lc.editingId&&lc.data&&(String(lc.data.name||'').trim()||(lc.data.photos||[]).length||String(lc.data.price||'').trim()));
const lcResumeStep=(d,saved)=>Math.max(1,Math.min(4,Number(saved)||1));
window.addEventListener('click',event=>{
  const setup=event.target.closest?.('[data-listing-menu-action="setup"]'),cont=event.target.closest?.('[data-lc-continue]'),discard=event.target.closest?.('[data-lc-discard]');
  if(!setup&&!cont&&!discard)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(discard){state.lc={open:false,step:1,data:lcDefaults(),month:[2026,9]};render();toast('Unfinished listing discarded');return}
  if(cont){state.lc.open=true;state.lc.step=Math.min(4,state.lc.step||1);render();const page=document.querySelector('.page');if(page)page.scrollTop=0;return}
  const listing=listings.find(item=>item.id===setup.dataset.listingId);if(!listing)return;
  lcOpen(listing,false);state.lc.step=lcResumeStep(state.lc.data,state.lc.data._step);render();
  const page=document.querySelector('.page');if(page)page.scrollTop=0;
},true);
const renderBeforeLcContinue=render;
render=function(){
  renderBeforeLcContinue.apply(this,arguments);
  if(state.page!=='listings'||state.listingDetail||!lcHasProgress(state.lc))return;
  const page=document.querySelector('.page');if(!page||page.querySelector('.lc-continue'))return;
  const d=state.lc.data,step=Math.min(4,state.lc.step||1),card=document.createElement('section');
  card.className='lc-continue';card.setAttribute('aria-label','Unfinished listing');
  card.innerHTML='<div class="lc-continue-text"><span>Unfinished listing</span><strong>'+lcE(String(d.name||'').trim()||'Untitled listing')+'</strong><small>Step '+step+' of 4 · '+lcTitles[step-1].replace('‑','-')+'</small><i class="lc-continue-bar" aria-hidden="true">'+[1,2,3,4].map(n=>'<b class="'+(n<=step?'is-on':'')+'"></b>').join('')+'</i></div><div class="lc-continue-actions"><button type="button" class="button primary" data-lc-continue>Continue setup</button><button type="button" class="lc-continue-discard" data-lc-discard>Discard</button></div>';
  const anchor=page.querySelector('.listing-toolbar, .listings-status-filters, [data-listing-card]');
  if(anchor&&anchor.parentElement)anchor.parentElement.insertBefore(card,anchor);else page.prepend(card);
};
render();

/* Create/Edit listing: the header back arrow asks before leaving; main action saves a draft and closes. */
const lcLeaveClose=()=>document.querySelector('.lc-leave-wrap')?.remove();
const lcLeaveOpen=()=>{
  lcLeaveClose();
  const editing=Boolean(state.lc.editingId),wrap=document.createElement('div');wrap.className='lc-leave-wrap';
  wrap.innerHTML='<div class="lc-leave-backdrop" data-lc-leave="stay"></div><section class="lc-leave" role="alertdialog" aria-modal="true" aria-labelledby="lc-leave-title" aria-describedby="lc-leave-text"><h2 id="lc-leave-title">Leave '+(editing?'editing':'this listing')+'?</h2><p id="lc-leave-text">Your progress will be lost unless you save it as a draft.</p><div class="lc-leave-actions"><button type="button" class="button primary" data-lc-leave="save">Save draft and close</button><button type="button" class="lc-leave-discard" data-lc-leave="discard">Leave without saving</button><button type="button" class="lc-leave-stay" data-lc-leave="stay">Keep editing</button></div></section>';
  document.body.appendChild(wrap);
  setTimeout(()=>wrap.querySelector('[data-lc-leave="save"]')?.focus(),30);
  wrap.onkeydown=e=>{if(e.key==='Escape')lcLeaveClose()};
  wrap.onclick=e=>{
    const action=e.target.closest('[data-lc-leave]')?.dataset.lcLeave;if(!action)return;
    lcLeaveClose();
    if(action==='save'){const d=state.lc.data;d._step=Math.min(4,state.lc.step||1);lcFinish('Draft');const page=document.querySelector('.page');if(page)page.scrollTop=0}
    else if(action==='discard'){state.lc={open:false,step:1,data:lcDefaults(),month:[2026,9]};render();const page=document.querySelector('.page');if(page)page.scrollTop=0}
    else document.querySelector('[data-profile-back]')?.focus();
  };
};
const renderBeforeLcLeave=render;
render=function(){
  renderBeforeLcLeave.apply(this,arguments);
  if(state.page!=='listings'||!state.lc?.open){lcLeaveClose();return}
  const back=document.querySelector('[data-profile-back]');if(back){back.setAttribute('aria-label',state.lc.step===5?'Back to Booking details':'Back to Listings');back.onclick=event=>{event.preventDefault();if(state.lc.step===5){state.lc.step=4;render();const page=document.querySelector('.page');if(page)page.scrollTop=0;return}lcLeaveOpen()}}
};
render();

/* Listings cards v2: photo, title, price / unit, "Up to N · duration"; pill only when not live; actions live in ⋯. */
const lcSampleDetail={'airport-sedan':[4,'passengers','2 hours'],innova:[7,'passengers','7 days max'],'tourist-van':[12,'passengers','7 days max'],'island-hopping':[10,'guests','6 hours'],'van-driver':[12,'passengers','1 day'],'city-tour':[4,'guests','3 hours'],scooter:[2,'units','']};
const lcCardUnit=listing=>{if(listing.setup?.pricedPer)return listing.setup.pricedPer.toLowerCase();const u=String(listing.unit||'').replace(/^per\s+/i,'').toLowerCase();return u==='trip'?'booking':u};
const lcCardDetail=listing=>{
  const s=listing.setup;
  if(s){const n=Number(s.maxPer)||0,noun=String(s.countBy||'guests').toLowerCase(),nounText=n===1?noun.replace(/s$/,''):noun,time=s.durationMode==='guest'?(s.guestMax+' '+(Number(s.guestMax)===1?String(s.guestUnit).replace(/s$/,''):s.guestUnit)+' max'):lcDuration(s);return 'Up to '+n+' '+nounText+' · '+time}
  const sample=lcSampleDetail[listing.id];if(sample)return 'Up to '+sample[0]+' '+sample[1]+(sample[2]?' · '+sample[2]:'');
  return String(listing.stock||'');
};
listingCardMarkup=function(listing,grid=false){
  const owner=state.role==='Owner',status=listing.status||'Active',draft=status==='Draft',paused=status==='Paused'||status==='Inactive';
  const source=listing.photo||(typeof listingMockPhotos==='object'?listingMockPhotos[listing.id]:'');
  const photo='<span class="lcc-photo">'+(source?'<img src="'+esc(source)+'" alt="">':'<i class="hgi-stroke hgi-image-01" aria-hidden="true"></i>')+'</span>';
  const pill=draft?'<em class="lcc-pill is-draft">Draft</em>':paused?'<em class="lcc-pill is-paused">Inactive</em>':'';
  const main=draft&&owner?'data-listing-menu-action="setup" data-listing-id="'+listing.id+'"':'data-listing-detail="'+listing.id+'"';
  return '<article class="lcc-card'+(grid?' is-cards':' is-row')+(paused?' is-paused':'')+(draft?' is-draft':'')+'" data-listing-card="'+listing.id+'"><button type="button" class="lcc-main" '+main+' aria-label="'+esc(listing.name)+(pill?', '+(draft?'draft':'inactive'):'')+'">'+photo+'<span class="lcc-body"><span class="lcc-title"><strong>'+esc(listing.name)+'</strong>'+pill+'</span><span class="lcc-price"><b>'+lcPeso(listing.price)+'</b> / '+esc(lcCardUnit(listing))+'</span><span class="lcc-meta">'+esc(lcCardDetail(listing))+'</span></span></button>'+(owner?'<button type="button" class="lc-more lcc-more" data-lc-more="'+listing.id+'" aria-label="More actions for '+esc(listing.name)+'"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg></button>':'')+'</article>';
};
const renderBeforeLcCardsV2=render;
render=function(){
  renderBeforeLcCardsV2.apply(this,arguments);
  const dev=document.querySelector('.dev-tools');if(dev)dev.hidden=['listings','vinsights'].includes(state.page);
  if(state.page!=='listings'||state.lc?.open)return;
  const cardsBtn=document.querySelector('[data-listing-view="grid"]');
  const pausedChip=document.querySelector('.listings-status-filters [data-listing-status="Paused"]');
  if(pausedChip)pausedChip.childNodes.forEach(node=>{if(node.nodeType===3&&/Paused/.test(node.nodeValue))node.nodeValue=node.nodeValue.replace('Paused','Inactive')});
  if(cardsBtn){cardsBtn.setAttribute('aria-label','Card view');const label=cardsBtn.querySelector('span');if(label)label.textContent='Cards'}
};
render();

/* Listings v3: switch on each card (Active/Inactive), draft footer, ⋮ sheet (Edit · Duplicate · Delete), undo toast, empty states. */
const lcKebab='<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>';
const lcUpcoming=listing=>orders.filter(o=>o.item===listing.name&&!['Completed','Cancelled','Declined','No-show'].includes(o.status)).length;
listingCardMarkup=function(listing,grid=false){
  const owner=state.role==='Owner',status=listing.status||'Active',draft=status==='Draft',off=status==='Paused'||status==='Inactive';
  const source=listing.photo||(typeof listingMockPhotos==='object'?listingMockPhotos[listing.id]:'');
  const photo='<span class="lcc-photo">'+(source?'<img src="'+esc(source)+'" alt="">':'<i class="hgi-stroke hgi-image-01" aria-hidden="true"></i>')+'</span>';
  const main=draft&&owner?'data-listing-menu-action="setup" data-listing-id="'+listing.id+'"':'data-listing-detail="'+listing.id+'"';
  const sw=owner&&!draft?'<button type="button" class="lcc-switch" role="switch" aria-checked="'+(!off)+'" data-lcc-toggle="'+listing.id+'" aria-label="Show '+esc(listing.name)+' to guests"><span></span></button>':'';
  const more=owner?'<button type="button" class="lc-more lcc-more" data-lc-more="'+listing.id+'" aria-label="More actions for '+esc(listing.name)+'">'+lcKebab+'</button>':'';
  const price='<span class="lcc-price"><b>'+lcPeso(listing.price)+'</b> / '+esc(lcCardUnit(listing))+'</span>';
  if(!grid)return '<article class="lcc-card is-row'+(off?' is-paused':'')+(draft?' is-draft':'')+'" data-listing-card="'+listing.id+'"><button type="button" class="lcc-main" '+main+'>'+photo+'<span class="lcc-body"><span class="lcc-title"><strong>'+esc(listing.name)+'</strong></span>'+price+(draft?'<em class="lcc-pill is-draft">Draft</em>':'')+'</span></button><span class="lcc-row-actions">'+sw+more+'</span></article>';
  const foot=draft?'<div class="lcc-foot"><em class="lcc-pill is-draft">Draft</em>'+(owner?'<button type="button" class="lcc-finish" data-listing-menu-action="setup" data-listing-id="'+listing.id+'">Finish setup ›</button>':'')+'</div>'
    :'<div class="lcc-foot"><span class="lcc-status'+(off?' is-off':'')+'">'+(off?'Inactive':'Active')+'</span>'+sw+'</div>';
  return '<article class="lcc-card is-cards'+(off?' is-paused':'')+(draft?' is-draft':'')+'" data-listing-card="'+listing.id+'"><button type="button" class="lcc-main" '+main+'>'+photo+'<span class="lcc-body"><span class="lcc-title"><strong>'+esc(listing.name)+'</strong></span>'+price+'<span class="lcc-meta">'+esc(lcCardDetail(listing))+'</span></span></button>'+more+foot+'</article>';
};
const lccToast=(message,undo)=>{
  document.querySelectorAll('.lcc-toast').forEach(n=>n.remove());
  const node=document.createElement('div');node.className='toast lcc-toast';node.setAttribute('role','status');
  node.innerHTML='<span>'+lcE(message)+'</span>'+(undo?'<button type="button">Undo</button>':'');
  (document.querySelector('#toast-region')||document.body).append(node);
  if(undo)node.querySelector('button').onclick=()=>{node.remove();undo()};
  setTimeout(()=>node.remove(),4000);
};
const lccSetStatus=(listing,on,withUndo=true)=>{
  const before=listing.status;listing.status=on?'Active':'Paused';
  if(listing.created)lcSaveCreated();lcRerender();
  lccToast(on?'Visible to guests':'Hidden from guests',withUndo&&!on?()=>{listing.status=before;if(listing.created)lcSaveCreated();lcRerender()}:null);
};
const lccDialog=({title,body,confirm,danger,onConfirm})=>{
  lcLeaveClose();
  const wrap=document.createElement('div');wrap.className='lc-leave-wrap';
  wrap.innerHTML='<div class="lc-leave-backdrop" data-lcc-d="cancel"></div><section class="lc-leave lcc-dialog" role="alertdialog" aria-modal="true" aria-labelledby="lcc-d-title"><h2 id="lcc-d-title">'+title+'</h2><p>'+body+'</p><div class="lcc-dialog-actions"><button type="button" class="button ghost" data-lcc-d="cancel">Cancel</button><button type="button" class="button primary'+(danger?' is-danger':'')+'" data-lcc-d="ok">'+confirm+'</button></div></section>';
  document.body.appendChild(wrap);setTimeout(()=>wrap.querySelector('[data-lcc-d="cancel"].button')?.focus(),30);
  wrap.onkeydown=e=>{if(e.key==='Escape')wrap.remove()};
  wrap.onclick=e=>{const a=e.target.closest('[data-lcc-d]')?.dataset.lccD;if(!a)return;wrap.remove();if(a==='ok')onConfirm()};
};
window.addEventListener('click',event=>{
  const toggle=event.target.closest?.('[data-lcc-toggle]'),del=event.target.closest?.('.lc-sheet [data-lc-sheet="delete"]');
  if(!toggle&&!del)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(toggle){
    const listing=listings.find(item=>item.id===toggle.dataset.lccToggle);if(!listing)return;
    const on=!(listing.status==='Active');
    if(!on&&lcUpcoming(listing)>0)lccDialog({title:'Turn off this listing?',body:'Existing bookings will continue. Guests can’t make new ones.',confirm:'Turn off',onConfirm:()=>lccSetStatus(listing,false)});
    else lccSetStatus(listing,on);
    return;
  }
  const id=document.querySelector('.lc-sheet')?.dataset.lcSheetId;const listing=listings.find(item=>item.id===id);
  lcSheetClose();if(!listing)return;
  lccDialog({title:'Delete this listing?',body:'This can’t be undone.',confirm:'Delete',danger:true,onConfirm:()=>{const i=listings.indexOf(listing);if(i>=0)listings.splice(i,1);lcSaveCreated();render();toast(listing.name+' deleted')}});
},true);
const renderBeforeLccV3=render;
render=function(){
  renderBeforeLccV3.apply(this,arguments);
  if(state.page!=='listings'||state.lc?.open||state.listingDetail)return;
  const empty=document.querySelector('.page .listings-empty-state');
  if(empty&&!(state.listingQuery||'').trim()){
    const filter=state.listingStatusFilter||'All';
    if(!listings.length)empty.innerHTML='<strong>Create your first listing so guests can book you.</strong><button type="button" class="button primary" data-listing-new>+ Create new listing</button>';
    else empty.innerHTML='<span>'+(filter==='Drafts'?'No drafts':filter==='Paused'?'No inactive listings':filter==='Active'?'No active listings':'No listings')+'</span>';
    empty.classList.toggle('is-filter',listings.length>0);
  }
};
render();

/* Listings: cards only — no List/Cards switch. */
const renderBeforeCardsOnly=render;
render=function(){
  state.listingView='grid';
  renderBeforeCardsOnly.apply(this,arguments);
  document.querySelectorAll('.listings-view-controls').forEach(node=>node.remove());
};
render();

/* Profile: Password opens its own "Change password" screen (not a sheet). */
window.addEventListener('click',event=>{
  if(!event.target.closest?.('[data-pf3-password]'))return;
  event.preventDefault();event.stopImmediatePropagation();
  state.pf3Sheet=null;state.profileSub='password';state.pf3TeamEditing=false;render();
  const page=document.querySelector('.page');if(page)page.scrollTop=0;
  setTimeout(()=>document.querySelector('[data-pf3-newpw="current"]')?.focus(),30);
},true);
const renderBeforePf3Password=render;
render=function(){
  renderBeforePf3Password.apply(this,arguments);
  if(state.page!=='profile'||state.profileSub!=='password')return;
  const page=document.querySelector('.page');if(!page)return;
  const field=(label,key,auto)=>'<label class="biz-field"><span>'+label+'</span><input type="password" data-pf3-newpw="'+key+'" autocomplete="'+auto+'"></label>';
  page.innerHTML='<div class="acct-page pf-page pf3-page biz-edit-page pf3-pw-page"><section class="acct-list biz-form">'+field('Current password','current','current-password')+field('New password','next','new-password')+field('Confirm new password','confirm','new-password')+'</section><p class="pf3-pw-note">Use at least 8 characters.</p><p class="pf3-pw-error" role="alert" hidden></p><div class="pf3-edit-actions"><button type="button" class="button primary biz-save" data-pf3-newpw-save>Update password</button><button type="button" class="button ghost biz-cancel" data-pf3-newpw-cancel>Cancel</button></div></div>';
  const leave=()=>{state.profileSub=null;render();const p=document.querySelector('.page');if(p)p.scrollTop=0};
  const title=document.querySelector('.topbar .topbar-context strong');if(title)title.textContent='Change password';
  const back=document.querySelector('[data-profile-back]');
  if(back){back.textContent='←';back.classList.remove('is-cancel');back.setAttribute('aria-label','Back to Profile');back.onclick=leave}
  page.querySelector('[data-pf3-newpw-cancel]').onclick=leave;
  const error=page.querySelector('.pf3-pw-error');
  const fail=(message,key)=>{error.textContent=message;error.hidden=false;page.querySelector('[data-pf3-newpw="'+key+'"]')?.focus()};
  page.querySelectorAll('[data-pf3-newpw]').forEach(input=>input.addEventListener('input',()=>{error.hidden=true}));
  page.querySelector('[data-pf3-newpw-save]').onclick=()=>{
    const v=key=>String(page.querySelector('[data-pf3-newpw="'+key+'"]')?.value||'');
    if(!v('current'))return fail('Enter your current password','current');
    if(v('next').length<8)return fail('New password needs at least 8 characters','next');
    if(v('next')!==v('confirm'))return fail('New passwords don’t match','confirm');
    leave();toast('Password updated');
  };
};
render();

/* ===== Insights (owner-only): Week | Month | Year with ‹ ›, Sales and Bookings tabs. ===== */
const viMonths=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const viToday=new Date(2026,9,10),viStart=new Date(2026,5,1); /* pilot data starts Jun 1, 2026 */
const viSeed=n=>{let x=Math.sin(n*9301+49297)*233280;return x-Math.floor(x)};
const viPeso=n=>'₱'+Math.round(n).toLocaleString('en-PH');
const viState=()=>{state.vi=state.vi||{period:'Month',offset:0,tab:'Sales'};return state.vi};
const viRange=(period,offset)=>{
  if(period==='Week'){const monday=new Date(viToday);monday.setDate(viToday.getDate()-((viToday.getDay()+6)%7)+offset*7);const end=new Date(monday);end.setDate(monday.getDate()+6);const f=d=>viMonths[d.getMonth()]+' '+d.getDate();return {start:monday,end,label:f(monday)+' – '+(monday.getMonth()===end.getMonth()?end.getDate():f(end)),short:'last week',days:7,key:'w'+offset}}
  if(period==='Year'){const y=viToday.getFullYear()+offset;return {start:new Date(y,0,1),end:new Date(y,11,31),label:String(y),short:String(y-1),days:12,key:'y'+offset}}
  const d=new Date(viToday.getFullYear(),viToday.getMonth()+offset,1),end=new Date(d.getFullYear(),d.getMonth()+1,0);
  const prev=new Date(d.getFullYear(),d.getMonth()-1,1);
  return {start:d,end,label:viMonths[d.getMonth()]+' '+d.getFullYear(),short:viMonths[prev.getMonth()],days:end.getDate(),key:'m'+offset};
};
const viData=(period,offset)=>{
  const r=viRange(period,offset);
  if(r.end<viStart)return null;
  const scale=period==='Week'?.24:period==='Year'?(offset===0?4.2:0):1;
  if(!scale)return null;
  const s=k=>viSeed(offset*13+k+(period==='Week'?100:period==='Year'?200:0));
  const factor=(offset===0?1:(.78+s(1)*.17))*scale*(r.start<viStart?.55:1);
  const completed=Math.max(1,Math.round(32*factor)),sales=Math.round(48600*factor/100)*100,outstanding=Math.round(sales*(.12+s(2)*.08)/100)*100;
  const received=Math.round(completed*1.25),declined=Math.max(0,Math.round(received*.05)),expired=Math.max(0,Math.round(received*(.06+s(3)*.06))),confirmed=received-declined-expired;
  const bars=Array.from({length:r.days},(_,i)=>{const future=period!=='Year'&&new Date(r.start.getFullYear(),r.start.getMonth(),r.start.getDate()+i)>viToday;const futureMonth=period==='Year'&&new Date(r.start.getFullYear(),i,1)>viToday;return future||futureMonth?0:Math.round((.35+viSeed(offset*31+i+7)*.9)*100)});
  const total=bars.reduce((a,b)=>a+b,0)||1;
  const weekday=[.9,.8,.85,1,1.25,1.5,1.35].map((w,i)=>Math.round(completed*w/7.65*(.9+viSeed(i+offset)*.2)));
  const top=[['Airport Transfer — Sedan',.46],['Toyota Innova Rental',.36],['Island Hopping Tour',.18]].map(([name,share],i)=>({name,sales:Math.round(sales*share/100)*100,bookings:Math.max(0,Math.round(completed*[.53,.25,.22][i]))}));
  if(period==='Month'&&offset===0)return {r,sales:48600,collected:41200,outstanding:7400,completed:32,received:40,confirmed:34,declined:2,expired:4,response:18,cancelGuest:3,cancelYou:1,bars:bars.map(b=>Math.round(48600*b/total)),weekday,top:[{name:'Airport Transfer — Sedan',sales:22400,bookings:17},{name:'Toyota Innova Rental',sales:17600,bookings:8},{name:'Island Hopping Tour',sales:8600,bookings:7}]};
  if(period==='Month'&&offset===-1)return {r,sales:43400,collected:43400,outstanding:0,completed:29,received:37,confirmed:30,declined:3,expired:4,response:24,cancelGuest:2,cancelYou:1,bars,weekday,top};
  return {r,sales,collected:sales-outstanding,outstanding,completed,received,confirmed,declined,expired,response:Math.round(14+s(4)*10),cancelGuest:Math.round(3*factor/scale*(scale<1?.4:1)),cancelYou:Math.round(1*factor/scale*(scale<1?.4:1)),bars:bars.map(b=>Math.round(sales*b/total)),weekday,top};
};
const viChange=(now,before,label,invert)=>{
  if(before==null||!before)return '';
  const pct=Math.round((now-before)/before*100);if(!pct)return '<span class="vi-change is-flat">Same as '+label+'</span>';
  const up=pct>0,good=invert?!up:up;
  return '<span class="vi-change '+(good?'is-good':'is-bad')+'">'+(up?'▲':'▼')+' '+Math.abs(pct)+'% vs '+label+'</span>';
};
const viBars=(values,labels,opts={})=>{
  const max=Math.max(...values,1),every=values.length>12?Math.ceil(values.length/6):1;
  return '<div class="vi-bars'+(values.length>12?' is-dense':'')+'" role="img" aria-label="'+(opts.aria||'Chart')+'">'+values.map((v,i)=>'<span class="vi-bar'+(opts.highlight===i?' is-top':'')+'"><i style="height:'+Math.max(v?4:0,Math.round(v/max*100))+'%"></i><em>'+(i%every===0||values.length<=12?labels[i]:'')+'</em></span>').join('')+'</div>';
};
const viPage=()=>{
  if(state.role!=='Owner')return '<div class="vi-page"><div class="vi-empty"><strong>Owner access only</strong><span>Insights show revenue, so only the business owner can see them.</span></div></div>';
  const st=viState(),d=viData(st.period,st.offset),prev=viData(st.period,st.offset-1),r=viRange(st.period,st.offset);
  const canPrev=viRange(st.period,st.offset-1).end>=viStart&&!(st.period==='Year'),canNext=st.offset<0;
  const head='<div class="vi-controls"><div class="vi-seg" role="radiogroup" aria-label="Period">'+['Week','Month','Year'].map(p=>'<button type="button" role="radio" aria-checked="'+(st.period===p)+'" class="'+(st.period===p?'is-active':'')+'" data-vi-period="'+p+'">'+p+'</button>').join('')+'</div><div class="vi-nav"><button type="button" data-vi-step="-1" aria-label="Previous period"'+(canPrev?'':' disabled')+'>‹</button><strong>'+r.label+'</strong><button type="button" data-vi-step="1" aria-label="Next period"'+(canNext?'':' disabled')+'>›</button></div></div>'
    +'<div class="vi-tabs" role="tablist">'+['Sales','Bookings'].map(t=>'<button type="button" role="tab" aria-selected="'+(st.tab===t)+'" class="'+(st.tab===t?'is-active':'')+'" data-vi-tab="'+t+'">'+t+'</button>').join('')+'</div>';
  if(!d||!d.completed)return '<div class="vi-page">'+head+'<div class="vi-empty"><i class="hgi-stroke hgi-analytics-01" aria-hidden="true"></i><strong>No insights yet</strong><span>Your insights will appear after your first completed booking.</span></div></div>';
  const label=r.short,card=(cls,html)=>'<section class="vi-card '+cls+'">'+html+'</section>';
  const chartLabels=st.period==='Year'?viMonths.map(m=>m[0]):st.period==='Week'?['M','T','W','T','F','S','S']:d.bars.map((_,i)=>String(i+1));
  let body='';
  if(st.tab==='Sales'){
    body=card('vi-hero','<span class="vi-label">Total sales</span><strong class="vi-big">'+viPeso(d.sales)+'</strong>'+viChange(d.sales,prev?.sales,label)+'<small class="vi-note">From completed bookings</small>')
      +'<button type="button" class="vi-card vi-money" data-vi-outstanding><span><span class="vi-label">Collected</span><strong>'+viPeso(d.collected)+'</strong></span><span><span class="vi-label">Outstanding</span><strong class="is-due">'+viPeso(d.outstanding)+'</strong></span><b aria-hidden="true">›</b></button>'
      +card('','<div class="vi-card-head"><h3>Sales</h3><span>'+(st.period==='Year'?'by month':'by day')+'</span></div>'+viBars(d.bars,chartLabels,{aria:'Sales '+(st.period==='Year'?'by month':'by day')}))
      +card('','<div class="vi-card-head"><h3>Top listings</h3><span>by sales</span></div>'+d.top.slice().sort((a,b)=>b.sales-a.sales).map((t,i)=>'<div class="vi-row"><span class="vi-rank">'+(i+1)+'</span><span class="vi-row-name">'+esc(t.name)+'<small>'+t.bookings+' booking'+(t.bookings===1?'':'s')+'</small></span><strong>'+viPeso(t.sales)+'</strong></div>').join(''));
  }else{
    const maxDay=d.weekday.indexOf(Math.max(...d.weekday));
    body=card('vi-hero','<span class="vi-label">Completed bookings</span><strong class="vi-big">'+d.completed+'</strong>'+viChange(d.completed,prev?.completed,label))
      +card('','<div class="vi-card-head"><h3>Requests</h3><span>'+d.received+' received</span></div><div class="vi-funnel"><span><strong>'+d.confirmed+'</strong>Confirmed</span><span><strong>'+d.declined+'</strong>Declined</span><span class="is-warn"><strong>'+d.expired+'</strong>Expired</span></div>')
      +card('vi-response','<span class="vi-label">Average response time</span><strong class="vi-mid">'+d.response+' min</strong>'+viChange(d.response,prev?.response,label,true)+'<small class="vi-note">Reply faster so requests don’t expire. Expired requests are lost bookings.</small>')
      +card('','<div class="vi-card-head"><h3>Cancellations</h3></div><div class="vi-funnel is-two"><span><strong>'+d.cancelGuest+'</strong>By guest</span><span><strong>'+d.cancelYou+'</strong>By you</span></div>')
      +card('','<div class="vi-card-head"><h3>Busiest days</h3><span>bookings by weekday</span></div>'+viBars(d.weekday,['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],{highlight:maxDay,aria:'Bookings by weekday'}))
      +card('','<div class="vi-card-head"><h3>Top listings</h3><span>by bookings</span></div>'+d.top.slice().sort((a,b)=>b.bookings-a.bookings).map((t,i)=>'<div class="vi-row"><span class="vi-rank">'+(i+1)+'</span><span class="vi-row-name">'+esc(t.name)+'</span><strong>'+t.bookings+'</strong></div>').join(''));
  }
  return '<div class="vi-page">'+head+'<div class="vi-body">'+body+'</div></div>';
};
const viewBeforeVi=view;
view=function(){if(state.page!=='vinsights')return viewBeforeVi.apply(this,arguments);try{if(window.cabanaInsightsPage)return window.cabanaInsightsPage()}catch(error){console.error('Insights render failed',error)}return '<div class="vi2"></div>'};
window.addEventListener('click',event=>{
  const open=event.target.closest?.('[data-insights]');
  if(open){event.preventDefault();event.stopImmediatePropagation();if(state.role!=='Owner'){toast('Insights are for the business owner');return}state.page='vinsights';render();const p=document.querySelector('.page');if(p)p.scrollTop=0;return}
  if(state.page!=='vinsights')return;
  const st=viState(),period=event.target.closest?.('[data-vi-period]'),step=event.target.closest?.('[data-vi-step]'),tab=event.target.closest?.('[data-vi-tab]'),due=event.target.closest?.('[data-vi-outstanding]');
  if(!period&&!step&&!tab&&!due)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(period){st.period=period.dataset.viPeriod;st.offset=0}
  if(step&&!step.disabled)st.offset+=Number(step.dataset.viStep);
  if(tab)st.tab=tab.dataset.viTab;
  if(due){state.page='earnings';state.earningsTab='Upcoming';state.earningsFilterStatus='Awaiting guest checkout';state.earningsPayoutDetail=null;state.earningsTransactionDetail=null;render();const p=document.querySelector('.page');if(p)p.scrollTop=0;return}
  const scroll=document.querySelector('.page')?.scrollTop||0;render();if(tab||period){const p=document.querySelector('.page');if(p)p.scrollTop=0}else{const p=document.querySelector('.page');if(p)p.scrollTop=scroll}
},true);
const renderBeforeVi=render;
render=function(){
  if(state.page==='vinsights'&&state.role!=='Owner')state.page='menu';
  renderBeforeVi.apply(this,arguments);
  if(state.page!=='vinsights')return;
  const page=document.querySelector('.page');if(page&&window.cabanaInsightsPage&&!page.querySelector('.vi2'))page.innerHTML=window.cabanaInsightsPage();
  const title=document.querySelector('.topbar .topbar-context strong, .topbar h1');if(title)title.textContent='Insights';
  document.querySelectorAll('.bottom-nav [data-page="menu"], nav [data-page="menu"]').forEach(b=>b.classList.add('active'));
};
render();

/* ===== Insights v2 (Shopify-style): one range pill, sales line chart vs previous period, overview grid, requests bar, top listings. ===== */
const vi2Ranges=['Last 7 days','Last 30 days','This month','Last month','This year'];
const vi2Fmt=d=>viMonths[d.getMonth()]+' '+d.getDate();
const vi2Day=(n)=>{const d=new Date(viToday);d.setDate(d.getDate()+n);return d};
const vi2Series=(n,total,seed,zeroUntil=0)=>{let v=.9;const walk=Array.from({length:n},(_,i)=>{v=Math.min(1.45,Math.max(.5,v+(viSeed(seed+i*1.7)-.5)*.42));return v});const raw=walk.map((w,i)=>i<zeroUntil?0:(i>0&&i<n-1?(walk[i-1]+w*2+walk[i+1])/4:w));const sum=raw.reduce((a,b)=>a+b,0)||1;return raw.map(v=>Math.round(total*v/sum))};
const vi2Data=range=>{
  if(range==='Custom')return vi2CustomData();
  const base={sales:48600,prev:43400,bookings:32,prevBookings:29,response:18,prevResponse:24,collected:41200,outstanding:7400,received:40,confirmed:34,declined:2,expired:4};
  const k={'Last 7 days':.24,'Last 30 days':1,'This month':.33,'Last month':.9,'This year':4.6}[range];
  const scaled=v=>Math.round(v*k/100)*100,count=v=>Math.max(1,Math.round(v*k));
  let d=range==='Last 30 days'?{...base}:{sales:scaled(base.sales),prev:range==='This year'?0:scaled(base.prev*(range==='Last month'?.94:1.02)),bookings:count(base.bookings),prevBookings:range==='This year'?0:count(base.prevBookings),response:range==='Last 7 days'?16:range==='Last month'?22:19,prevResponse:range==='This year'?0:23,collected:0,outstanding:range==='Last month'?0:scaled(base.outstanding),received:count(base.received),declined:Math.max(0,Math.round(2*k)),expired:Math.max(0,Math.round(4*k))};
  if(range!=='Last 30 days'){d.collected=d.sales-d.outstanding;d.confirmed=d.received-d.declined-d.expired}
  if(range==='Last 7 days'){d.points=7;d.labels=[vi2Fmt(vi2Day(-6)),vi2Fmt(vi2Day(-3)),vi2Fmt(viToday)];d.compare='previous 7 days';d.legend=['Last 7 days','Previous 7 days']}
  else if(range==='Last 30 days'){d.points=30;d.labels=[vi2Fmt(vi2Day(-29)),vi2Fmt(vi2Day(-15)),vi2Fmt(viToday)];d.compare='previous 30 days';d.legend=['Last 30 days','Previous 30 days']}
  else if(range==='This month'){d.points=10;d.labels=['Oct 1','Oct 5','Oct 10'];d.compare='Sep 1–10';d.legend=['Oct 1–10','Sep 1–10']}
  else if(range==='Last month'){d.points=30;d.labels=['Sep 1','Sep 15','Sep 30'];d.compare='August';d.legend=['September','August']}
  else {d.points=10;d.labels=['Jan','May','Oct'];d.compare='';d.legend=['2026',''];d.zeroUntil=5}
  const seed=vi2Ranges.indexOf(range)*41+3;
  d.series=vi2Series(d.points,d.sales,seed,d.zeroUntil||0);
  d.prevSeries=d.prev?vi2Series(d.points,d.prev,seed+97):null;
  const share=[[.46,.53],[.36,.25],[.18,.22]];
  d.top=[['airport-sedan','Airport Transfer — Sedan'],['innova','Toyota Innova Rental'],['island-hopping','Island Hopping Tour']].map(([id,name],i)=>({id,name,sales:range==='Last 30 days'?[22400,17600,8600][i]:Math.round(d.sales*share[i][0]/100)*100,bookings:range==='Last 30 days'?[17,8,7][i]:Math.max(1,Math.round(d.bookings*share[i][1]))}));
  return d;
};
const vi2Pct=(now,before)=>before?Math.round((now-before)/before*100):null;
const vi2Chart=d=>{
  const W=320,H=150,pad=6,all=[...d.series,...(d.prevSeries||[])].filter(v=>v>0),max=Math.max(...all,1)*1.08,min=d.zeroUntil?0:Math.min(...all)*.55,n=d.points;
  const x=i=>n===1?W/2:pad+(W-pad*2)*i/(n-1),y=v=>H-pad-(H-pad*2)*Math.max(0,v-min)/Math.max(1,max-min);
  const path=arr=>arr.map((v,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(v).toFixed(1)).join(' ');
  const line=path(d.series),area=line+' L'+x(n-1).toFixed(1)+' '+(H-pad)+' L'+x(0).toFixed(1)+' '+(H-pad)+' Z';
  const avg=d.series.reduce((a,b)=>a+b,0)/n;
  return '<svg class="vi2-chart" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" role="img" aria-label="Sales over time'+(d.prevSeries?', compared with '+d.compare:'')+'"><defs><linearGradient id="vi2fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A2133" stop-opacity=".12"/><stop offset="1" stop-color="#4A2133" stop-opacity="0"/></linearGradient></defs>'
    +'<line x1="0" x2="'+W+'" y1="'+y(avg).toFixed(1)+'" y2="'+y(avg).toFixed(1)+'" stroke="#E3DDE0" stroke-width="1" vector-effect="non-scaling-stroke"/>'
    +'<line x1="0" x2="'+W+'" y1="'+(H-pad)+'" y2="'+(H-pad)+'" stroke="#E3DDE0" stroke-width="1" vector-effect="non-scaling-stroke"/>'
    +'<path d="'+area+'" fill="url(#vi2fill)"/>'
    +(d.prevSeries?'<path d="'+path(d.prevSeries)+'" fill="none" stroke="#B9AEB4" stroke-width="1.6" stroke-dasharray="4 4" vector-effect="non-scaling-stroke"/>':'')
    +'<path d="'+line+'" fill="none" stroke="#4A2133" stroke-width="2.2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>'
    +'</svg><span class="vi2-dot" style="left:'+(x(n-1)/W*100).toFixed(2)+'%;top:'+(y(d.series[n-1])/H*100).toFixed(2)+'%"></span>';
};
const viPage2=()=>{
  if(state.role!=='Owner')return '<div class="vi2"><div class="vi-empty"><strong>Owner access only</strong><span>Insights show revenue, so only the business owner can see them.</span></div></div>';
  state.vi2Range=state.vi2Range||'Last 30 days';
  const d=vi2Data(state.vi2Range),pct=vi2Pct(d.sales,d.prev),bk=vi2Pct(d.bookings,d.prevBookings),rt=d.prevResponse?Math.round((d.prevResponse-d.response)/d.prevResponse*100):null;
  if(!d.bookings)return '<div class="vi2"><div class="vi-empty"><strong>No insights yet</strong><span>Your insights will appear after your first completed booking.</span></div></div>';
  const change=(v,word)=>v==null?'':'<span class="vi2-change '+(v>=0?'is-up':'is-down')+'">'+(v>=0?'▲':'▼')+' '+Math.abs(v)+'%'+(word?'</span><span class="vi2-vs"> '+word+'</span>':'</span>');
  const tot=d.confirmed+d.declined+d.expired||1,seg=(n,c)=>n?'<i class="'+c+'" style="flex:'+n+'"></i>':'';
  const photo=id=>{const src=listings.find(l=>l.id===id)?.photo||listingMockPhotos?.[id];return '<span class="vi2-thumb">'+(src?'<img src="'+esc(src)+'" alt="">':'')+'</span>'};
  const reqRate=Math.round(d.confirmed/(d.received||1)*100);window.vi2Current=d;
  const toReceive=typeof vi2ToReceive==='function'?vi2ToReceive():d.outstanding;
  const received=window.cabanaReceivedTotal?window.cabanaReceivedTotal(state.vi2Range||'Last 30 days'):d.sales-toReceive;
  return '<div class="vi2 is-cards"><button type="button" class="e5-switch vi2-range-row" data-vi2-range aria-haspopup="dialog"><span class="e5-tile"><i class="hgi-stroke hgi-calendar-03" aria-hidden="true"></i></span><span class="e5-name">'+esc(state.vi2Range==='Custom'&&typeof vi2CustomLabel==='function'?vi2CustomLabel():(state.vi2Range||'Last 30 days'))+'</span><i class="e5-caret" aria-hidden="true">▾</i></button>'
    +'<section class="vi2-card vi2-hero"><span class="vi2-label">Sales</span><strong class="vi2-total">'+viPeso(d.sales)+'</strong>'
    +(pct!=null?'<p class="vi2-delta">'+change(pct,'vs '+d.compare)+'</p>':'<p class="vi2-delta is-muted">No earlier period to compare yet</p>')
    +'<div class="vi2-legend"><span><i class="is-solid"></i>'+d.legend[0]+'</span>'+(d.prevSeries?'<span><i class="is-dash"></i>'+d.legend[1]+'</span>':'')+'</div>'
    +'<div class="vi2-chart-wrap" data-vi2-scrub tabindex="0" aria-label="Sales chart. Drag or use arrow keys to see each day.">'+vi2Chart(d)+'<span class="vi2-guide" hidden></span><span class="vi2-hover-dot" hidden></span><div class="vi2-tip" hidden></div></div><div class="vi2-axis"><span>'+d.labels[0]+'</span><span>'+d.labels[1]+'</span><span>'+d.labels[2]+'</span></div></section>'
    +'<section class="vi2-card vi2-pay"><h3>Payments</h3><div class="vi2-pair">'
    +'<div><span class="vi2-label">Received</span><strong>'+viPeso(received)+'</strong><small>In this period</small></div>'
    +'<div><span class="vi2-label">To receive</span><strong>'+viPeso(toReceive)+'</strong><small>'+(toReceive?'As of today':'All caught up')+'</small></div>'
    +'</div><button type="button" class="vi2-foot" data-vi2-earnings><span>View earnings</span><i aria-hidden="true">›</i></button></section>'
    +'<section class="vi2-card"><h3>Bookings</h3><div class="vi2-pair">'
    +'<div><span class="vi2-label">Completed</span><strong>'+d.bookings+'</strong>'+change(bk)+'</div>'
    +'<div><span class="vi2-label">Avg. response time</span><strong>'+d.response+' min</strong>'+(rt==null?'':'<span class="vi2-change '+(rt>=0?'is-up':'is-down')+'">'+(rt>=0?'▼ '+rt+'% faster':'▲ '+Math.abs(rt)+'% slower')+'</span>')+'</div>'
    +'</div><div class="vi2-sub"><div class="vi2-head"><h4>Requests</h4><span>'+d.received+' received</span></div><div class="vi2-bar" role="img" aria-label="'+d.confirmed+' confirmed, '+d.declined+' declined, '+d.expired+' expired">'+seg(d.confirmed,'is-ok')+seg(d.declined,'is-no')+seg(d.expired,'is-exp')+'</div><div class="vi2-keys"><span><i class="is-ok"></i>Confirmed <b>'+d.confirmed+'</b></span><span><i class="is-no"></i>Declined <b>'+d.declined+'</b></span><span><i class="is-exp"></i>Expired <b>'+d.expired+'</b></span></div></div></section>'
    +'<section class="vi2-card"><div class="vi2-head"><h3>Top listings</h3>'+(vi2Perf(state.vi2Range).length>3?'<button type="button" class="vi2-link" data-vi2-all>See all</button>':'')+'</div>'
    +vi2Perf(state.vi2Range).slice(0,5).filter(t=>t.bookings>0).map(t=>'<div class="vi2-row">'+photo(t.id)+'<span class="vi2-row-name"><strong>'+esc(t.name)+'</strong><small>'+t.bookings+' booking'+(t.bookings===1?'':'s')+'</small></span><b>'+viPeso(t.sales)+'</b></div>').join('')+'</section>'
    +'</div>';
};
window.cabanaInsightsPage=viPage2;
const vi2Sheet=()=>{
  lcSheetClose();
  const wrap=document.createElement('div');wrap.className='lc-sheet-wrap';
  const cur=state.vi2Range||'Last 30 days',c=state.vi2Custom||{start:'2026-09-01',end:'2026-09-30'};
  const list='<div class="lc-sheet-list" role="listbox">'+vi2Ranges.concat('Custom').map(r=>'<button type="button" role="option" aria-selected="'+(cur===r)+'" class="'+(cur===r?'is-selected':'')+'" data-vi2-pick="'+r+'"><span>'+(r==='Custom'?'Custom range'+(cur==='Custom'?' · '+vi2CustomLabel():''):r)+'</span>'+(cur===r?'<i class="hgi-stroke hgi-tick-02" aria-hidden="true"></i>':'<i class="vi2-sheet-chev" aria-hidden="true">'+(r==='Custom'?'›':'')+'</i>')+'</button>').join('')+'</div>';
  const form='<div class="vi2-custom"><label><span>Start date</span><input type="date" data-vi2-start min="2026-06-01" max="2026-10-10" value="'+c.start+'"></label><label><span>End date</span><input type="date" data-vi2-end min="2026-06-01" max="2026-10-10" value="'+c.end+'"></label><p class="vi2-custom-note">Data is available from Jun 1, 2026.</p><p class="vi2-custom-error" role="alert" hidden></p><button type="button" class="button primary vi2-custom-apply" data-vi2-apply>Apply</button><button type="button" class="vi2-custom-back" data-vi2-back>Back to ranges</button></div>';
  const show=mode=>{wrap.innerHTML='<div class="pf-sheet-backdrop" data-vi2-close></div><section class="pf-sheet lc-sheet lc-dd-sheet" role="dialog" aria-label="Date range"><header><h2>'+(mode==='custom'?'Custom range':'Date range')+'</h2><button type="button" data-vi2-close aria-label="Close">×</button></header>'+(mode==='custom'?form:list)+'</section>';if(mode==='custom')setTimeout(()=>wrap.querySelector('[data-vi2-start]')?.focus(),30)};
  show('list');document.body.appendChild(wrap);
  wrap.onclick=e=>{
    if(e.target.closest('[data-vi2-close]')){lcSheetClose();return}
    if(e.target.closest('[data-vi2-back]')){show('list');return}
    if(e.target.closest('[data-vi2-apply]')){
      const st=wrap.querySelector('[data-vi2-start]').value,en=wrap.querySelector('[data-vi2-end]').value,err=wrap.querySelector('.vi2-custom-error');
      const fail=m=>{err.textContent=m;err.hidden=false};
      if(!st||!en)return fail('Choose a start and end date');
      if(st>en)return fail('The start date must be before the end date');
      if(st<'2026-06-01'||en>'2026-10-10')return fail('Choose dates between Jun 1 and Oct 10, 2026');
      state.vi2Custom={start:st,end:en};state.vi2Range='Custom';lcSheetClose();render();return;
    }
    const pick=e.target.closest('[data-vi2-pick]');if(!pick)return;
    if(pick.dataset.vi2Pick==='Custom'){show('custom');return}
    state.vi2Range=pick.dataset.vi2Pick;lcSheetClose();render();
  };
  wrap.onkeydown=e=>{if(e.key==='Escape')lcSheetClose()};
};
window.addEventListener('click',event=>{
  if(state.page!=='vinsights')return;
  const pill=event.target.closest?.('[data-vi2-range]'),due=event.target.closest?.('[data-vi2-receivables]'),all=event.target.closest?.('[data-vi2-all]');
  if(!pill&&!due&&!all)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(pill){vi2Sheet();return}
  if(due){state.vrecvFrom='vinsights';state.page='vrecv'}
  if(all){state.page='vperf';state.vperfSort=state.vperfSort||'Sales'}
  render();const p=document.querySelector('.page');if(p)p.scrollTop=0;
},true);
const renderBeforeVi2=render;
render=function(){
  renderBeforeVi2.apply(this,arguments);
  const bar=document.querySelector('.topbar');
  bar?.querySelectorAll('[data-vi2-range]').forEach(n=>{if(state.page!=='vinsights')n.remove()});
  document.querySelector('.app-shell')?.classList.remove('is-vi2');
  if(state.page!=='vinsights'||state.role!=='Owner'||!bar)return;
  let pill=bar.querySelector('[data-vi2-range]');
  if(!pill){pill=document.createElement('button');pill.type='button';pill.className='vi2-range';pill.setAttribute('data-vi2-range','');pill.setAttribute('aria-haspopup','dialog');bar.appendChild(pill)}
  pill.innerHTML='<span>'+(state.vi2Range==='Custom'?vi2CustomLabel():(state.vi2Range||'Last 30 days'))+'</span><i aria-hidden="true">▾</i>';
};
render();

/* Insights: any legacy route to 'insights' (old menu/dashboard handlers, saved views) opens the new Insights page. */
const renderBeforeViRoute=render;
render=function(){
  if(state.page==='insights')state.page=state.role==='Owner'?'vinsights':'menu';
  try{renderBeforeViRoute.apply(this,arguments)}
  catch(error){
    console.error('Render failed',error);
    if(state.page==='vinsights'&&window.cabanaInsightsPage){const page=document.querySelector('.page');if(page)page.innerHTML=window.cabanaInsightsPage()}
  }
};
document.addEventListener('click',event=>{
  const open=event.target.closest?.('[data-insights]');if(!open||state.page==='vinsights')return;
  if(state.role!=='Owner')return;
  event.preventDefault();state.page='vinsights';render();const p=document.querySelector('.page');if(p)p.scrollTop=0;
},true);

/* Menu → Auto-messages: its own page (not a bottom sheet) with the confirmation template, quick-insert fields and a live preview. */
const amFields=[['{guest name}','Guest name'],['{listing}','Listing'],['{date & time}','Date & time'],['{booking number}','Booking number']];
const amSample=text=>String(text||'').replaceAll('{guest name}','Amelia').replaceAll('{listing}','Airport Transfer — Sedan').replaceAll('{date & time}','Oct 12, 8:30 AM').replaceAll('{booking number}','#BK-1042');
const amPage=()=>{
  const value=state.amDraft!=null?state.amDraft:(state.cxBookingTemplate||cxDefaultBookingTemplate);
  return '<div class="acct-page pf-page pf3-page biz-edit-page am-page">'
    +'<p class="am-intro">This message is sent to the guest in Chat as soon as you confirm a booking.</p>'
    +'<section class="am-card"><label class="am-label" for="am-template">Booking confirmed</label><div class="am-textarea-wrap"><textarea id="am-template" class="am-textarea" data-am-template maxlength="240" rows="5">'+esc(value)+'</textarea><span class="am-count" data-am-count>'+value.length+'/240</span></div>'
    +'<span class="am-sub">Tap to insert</span><div class="am-chips">'+amFields.map(([token,label])=>'<button type="button" class="am-chip" data-am-insert="'+esc(token)+'">'+label+'</button>').join('')+'</div></section>'
    +'<p class="am-error" role="alert" hidden></p>'
    +'<div class="pf3-edit-actions"><button type="button" class="button primary biz-save" data-am-save>Save</button><button type="button" class="button ghost biz-cancel" data-am-cancel>Cancel</button><button type="button" class="am-reset" data-am-reset>Reset to default</button></div></div>';
};
window.cabanaAutoMessagesPage=amPage;
const viewBeforeAm=view;
view=function(){return state.page==='automessages'?window.cabanaAutoMessagesPage():viewBeforeAm.apply(this,arguments)};
window.addEventListener('click',event=>{
  if(!event.target.closest?.('[data-cx-booking-messages]'))return;
  event.preventDefault();event.stopImmediatePropagation();
  document.querySelector('.cx-sheet-wrap')?.remove();
  state.amDraft=null;state.page='automessages';render();const p=document.querySelector('.page');if(p)p.scrollTop=0;
},true);
const renderBeforeAm=render;
render=function(){
  renderBeforeAm.apply(this,arguments);
  if(state.page!=='automessages')return;
  const page=document.querySelector('.page');if(!page)return;
  if(!page.querySelector('.am-page'))page.innerHTML=amPage();
  const title=document.querySelector('.topbar .topbar-context strong, .topbar h1');if(title)title.textContent='Auto-messages';
  const leave=()=>{state.amDraft=null;state.page='menu';render();const p=document.querySelector('.page');if(p)p.scrollTop=0};
  const back=document.querySelector('[data-profile-back]');if(back){back.textContent='←';back.setAttribute('aria-label','Back to Menu');back.onclick=leave}
  const area=page.querySelector('[data-am-template]'),count=page.querySelector('[data-am-count]'),preview=page.querySelector('[data-am-preview]'),error=page.querySelector('.am-error');
  const sync=()=>{state.amDraft=area.value;count.textContent=area.value.length+'/240';if(preview)preview.textContent=amSample(area.value)||' ';error.hidden=true};
  area.addEventListener('input',sync);
  ['focus','click','keyup','select'].forEach(ev=>area.addEventListener(ev,()=>{area.dataset.touched='1'}));
  page.querySelectorAll('[data-am-insert]').forEach(chip=>chip.onclick=()=>{
    const token=chip.dataset.amInsert,touched=area.dataset.touched==='1',start=touched?(area.selectionStart??area.value.length):area.value.length,end=touched?(area.selectionEnd??start):start;
    if(area.value.length-(end-start)+token.length>240)return;
    area.value=area.value.slice(0,start)+token+area.value.slice(end);area.focus();const pos=start+token.length;area.setSelectionRange(pos,pos);sync();
  });
  page.querySelector('[data-am-reset]').onclick=()=>{area.value=cxDefaultBookingTemplate;sync();area.focus()};
  page.querySelector('[data-am-cancel]').onclick=leave;
  page.querySelector('[data-am-save]').onclick=()=>{
    const value=area.value.trim();
    if(!value){error.textContent='Add a confirmation message first';error.hidden=false;area.focus();return}
    state.cxBookingTemplate=value;try{localStorage.setItem('cabana:booking-message-template',value)}catch(e){}
    state.amDraft=null;state.page='menu';render();toast('Auto-message saved');
  };
};
render();

/* Insights: drag left/right across the sales chart (or use arrow keys) to read each point. */
const vi2PointDate=(d,i)=>{
  const range=state.vi2Range||'Last 30 days',fmt=x=>viMonths[x.getMonth()]+' '+x.getDate();
  if(range==='Custom'){const x=vi2CustomStart();x.setDate(x.getDate()+i);return fmt(x)}
  if(range==='This year')return viMonths[i]+' 2026';
  if(range==='This month')return 'Oct '+(i+1);
  if(range==='Last month')return 'Sep '+(i+1);
  const day=new Date(viToday);day.setDate(viToday.getDate()-(d.points-1-i));return fmt(day);
};
const vi2PrevDate=(d,i)=>{
  const range=state.vi2Range||'Last 30 days';
  if(range==='Custom'){const x=vi2CustomStart();x.setDate(x.getDate()+i-d.points);return viMonths[x.getMonth()]+' '+x.getDate()}
  if(range==='This month')return 'Sep '+(i+1);
  if(range==='Last month')return 'Aug '+(i+1);
  const day=new Date(viToday);day.setDate(viToday.getDate()-(d.points-1-i)-d.points);return viMonths[day.getMonth()]+' '+day.getDate();
};
const renderBeforeVi2Scrub=render;
render=function(){
  renderBeforeVi2Scrub.apply(this,arguments);
  if(state.page!=='vinsights')return;
  const wrap=document.querySelector('[data-vi2-scrub]'),d=window.vi2Current;if(!wrap||!d||wrap.dataset.bound)return;
  wrap.dataset.bound='1';
  const svg=wrap.querySelector('svg'),guide=wrap.querySelector('.vi2-guide'),dot=wrap.querySelector('.vi2-hover-dot'),tip=wrap.querySelector('.vi2-tip'),end=wrap.querySelector('.vi2-dot');
  const W=320,H=150,pad=6,all=[...d.series,...(d.prevSeries||[])].filter(v=>v>0),max=Math.max(...all,1)*1.08,min=d.zeroUntil?0:Math.min(...all)*.55,n=d.points;
  const xPct=i=>(n===1?50:(pad+(W-pad*2)*i/(n-1))/W*100),yPct=v=>(H-pad-(H-pad*2)*Math.max(0,v-min)/Math.max(1,max-min))/H*100;
  let current=null;
  const show=i=>{
    i=Math.max(0,Math.min(n-1,i));current=i;
    const x=xPct(i);guide.hidden=dot.hidden=tip.hidden=false;if(end)end.style.opacity='0';
    guide.style.left=x+'%';dot.style.left=x+'%';dot.style.top=yPct(d.series[i])+'%';
    tip.innerHTML='<strong>'+viPeso(d.series[i])+'</strong><span>'+vi2PointDate(d,i)+'</span>'+(d.prevSeries?'<em>'+viPeso(d.prevSeries[i])+' · '+vi2PrevDate(d,i)+'</em>':'');
    const w=wrap.clientWidth,h=wrap.clientHeight,tw=tip.offsetWidth,th=tip.offsetHeight,px=x/100*w,py=yPct(d.series[i])/100*h;tip.style.left=Math.max(0,Math.min(w-tw,px-tw/2))+'px';tip.style.top=(py-th-14>=-8?py-th-14:py+14)+'px';
  };
  const hide=()=>{current=null;guide.hidden=dot.hidden=tip.hidden=true;if(end)end.style.opacity=''};
  const indexAt=clientX=>{const r=svg.getBoundingClientRect(),rel=(clientX-r.left)/r.width*W;return Math.round((rel-pad)/(W-pad*2)*(n-1))};
  let dragging=false,startX=0,startY=0,locked=false;
  wrap.addEventListener('pointerdown',e=>{dragging=true;locked=e.pointerType==='mouse';startX=e.clientX;startY=e.clientY;if(locked){wrap.setPointerCapture(e.pointerId);show(indexAt(e.clientX))}});
  wrap.addEventListener('pointermove',e=>{
    if(e.pointerType==='mouse'&&!dragging){show(indexAt(e.clientX));return}
    if(!dragging)return;
    if(!locked){const dx=Math.abs(e.clientX-startX),dy=Math.abs(e.clientY-startY);if(dx<6&&dy<6)return;if(dy>dx){dragging=false;return}locked=true;wrap.setPointerCapture(e.pointerId)}
    show(indexAt(e.clientX));
  });
  const stop=e=>{if(dragging&&!locked&&e?.type==='pointerup')show(indexAt(e.clientX));dragging=false;locked=false};
  wrap.addEventListener('pointerup',stop);wrap.addEventListener('pointercancel',()=>{dragging=false;locked=false});
  wrap.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')hide()});
  wrap.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(current==null?n-1:current+(e.key==='ArrowRight'?1:-1))}if(e.key==='Escape')hide()});
  wrap.addEventListener('blur',hide);
  document.addEventListener('pointerdown',e=>{if(!wrap.isConnected)return;if(!wrap.contains(e.target))hide()},{capture:true});
};
render();

/* Listing performance: every bookable listing ranked for the selected Insights period. */
function vi2Perf(range,sort='Sales'){
  const vi2PerfBase={'airport-sedan':[18000,10],innova:[12800,4],'van-driver':[10500,3],'island-hopping':[6000,3],'city-tour':[1300,1]};
  const k=range==='Custom'?vi2CustomDays()/30:{'Last 7 days':.24,'Last 30 days':1,'This month':.33,'Last month':.9,'This year':4.6}[range||'Last 30 days'];
  const rows=listings.filter(l=>l.status!=='Draft').map(l=>{const b=vi2PerfBase[l.id]||[0,0];const bookings=k===1?b[1]:Math.round(b[1]*k);return {id:l.id,name:l.name,status:l.status,sales:k===1?b[0]:(bookings?Math.round(b[0]*k/100)*100:0),bookings}});
  return rows.sort((a,b)=>sort==='Bookings'?(b.bookings-a.bookings||b.sales-a.sales):(b.sales-a.sales||b.bookings-a.bookings));
}
const vpPhoto=id=>{const src=listings.find(l=>l.id===id)?.photo||(typeof listingMockPhotos==='object'?listingMockPhotos[id]:'');return '<span class="vi2-thumb">'+(src?'<img src="'+esc(src)+'" alt="">':'')+'</span>'};
const vpPage=()=>{
  const sort=state.vperfSort||'Sales',rows=vi2Perf(state.vi2Range,sort);
  if(!rows.length)return '<div class="vi2 vp"><div class="vi-empty"><strong>No listings yet</strong><span>Your listings will appear here once they’re live.</span></div></div>';
  return '<div class="vi2 vp"><div class="vp-bar"><span>'+rows.length+' listing'+(rows.length===1?'':'s')+'</span><button type="button" class="vp-sort" data-vp-sort aria-haspopup="dialog">Sort: '+sort+' <i aria-hidden="true">▾</i></button></div>'
    +'<section class="vi2-card vp-list">'+rows.map((t,i)=>{const off=t.status==='Paused'||t.status==='Inactive';return '<button type="button" class="vi2-row vp-row" data-vp-open="'+t.id+'"><span class="vp-rank">'+(i+1)+'</span>'+vpPhoto(t.id)+'<span class="vi2-row-name"><strong>'+esc(t.name)+'</strong><small>'+t.bookings+' booking'+(t.bookings===1?'':'s')+(off?' <em>· Inactive</em>':'')+'</small></span><b>'+viPeso(t.sales)+'</b></button>'}).join('')+'</section></div>';
};
window.cabanaListingPerfPage=vpPage;
const viewBeforeVp=view;
view=function(){if(state.page==='vperf')return window.cabanaListingPerfPage();if(state.page==='listings'&&state.listingDetail&&!state.lc?.open&&listings.some(l=>l.id===state.listingDetail))return listingDetailPage();return viewBeforeVp.apply(this,arguments)};
const vpSortSheet=()=>{
  lcSheetClose();
  const wrap=document.createElement('div');wrap.className='lc-sheet-wrap';const cur=state.vperfSort||'Sales';
  wrap.innerHTML='<div class="pf-sheet-backdrop" data-vp-close></div><section class="pf-sheet lc-sheet lc-dd-sheet" role="dialog" aria-label="Sort by"><header><h2>Sort by</h2><button type="button" data-vp-close aria-label="Close">×</button></header><div class="lc-sheet-list" role="listbox">'+['Sales','Bookings'].map(o=>'<button type="button" role="option" aria-selected="'+(cur===o)+'" class="'+(cur===o?'is-selected':'')+'" data-vp-pick="'+o+'"><span>'+o+'</span>'+(cur===o?'<i class="hgi-stroke hgi-tick-02" aria-hidden="true"></i>':'')+'</button>').join('')+'</div></section>';
  document.body.appendChild(wrap);
  wrap.onclick=e=>{if(e.target.closest('[data-vp-close]')){lcSheetClose();return}const pick=e.target.closest('[data-vp-pick]');if(!pick)return;state.vperfSort=pick.dataset.vpPick;lcSheetClose();render()};
  wrap.onkeydown=e=>{if(e.key==='Escape')lcSheetClose()};
};
window.addEventListener('click',event=>{
  if(state.page!=='vperf')return;
  const sort=event.target.closest?.('[data-vp-sort]'),row=event.target.closest?.('[data-vp-open]'),pill=event.target.closest?.('[data-vi2-range]');
  if(!sort&&!row&&!pill)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(pill){vi2Sheet();return}
  if(sort){vpSortSheet();return}
  const id=row.dataset.vpOpen;state.page='listings';if(state.lc)state.lc.open=false;state.listingDetail=null;state.listingStatusFilter='All';state.listingQuery='';render();
  setTimeout(()=>{const card=document.querySelector('[data-listing-card="'+id+'"]');if(!card)return;card.scrollIntoView({block:'center'});card.classList.add('is-spotlight');setTimeout(()=>card.classList.remove('is-spotlight'),1800)},60);
},true);
const renderBeforeVp=render;
render=function(){
  renderBeforeVp.apply(this,arguments);
  if(state.page!=='vperf')return;
  const page=document.querySelector('.page');if(page&&!page.querySelector('.vp'))page.innerHTML=vpPage();
  const bar=document.querySelector('.topbar');if(!bar)return;
  const title=bar.querySelector('.topbar-context strong, h1');if(title)title.textContent='Listing performance';
  let back=bar.querySelector('[data-profile-back]');
  if(!back){bar.classList.add('profile-topbar');back=document.createElement('button');back.type='button';back.className='profile-back';back.setAttribute('data-profile-back','');back.textContent='←';bar.prepend(back)}
  back.setAttribute('aria-label','Back to Insights');back.onclick=()=>{state.page='vinsights';render();const p=document.querySelector('.page');if(p)p.scrollTop=0};
  let pill=bar.querySelector('[data-vi2-range]');
  if(!pill){pill=document.createElement('button');pill.type='button';pill.className='vi2-range';pill.setAttribute('data-vi2-range','');pill.setAttribute('aria-haspopup','dialog');bar.appendChild(pill)}
  pill.innerHTML='<span>'+(state.vi2Range==='Custom'?vi2CustomLabel():(state.vi2Range||'Last 30 days'))+'</span><i aria-hidden="true">▾</i>';
  document.querySelector('.dev-tools')?.setAttribute('hidden','');
  document.querySelectorAll('.bottom-nav [data-page="menu"], nav [data-page="menu"]').forEach(b=>b.classList.add('active'));
};
render();

/* "To receive" = room charges the resort still owes (same total and list as the Home card). */
function vi2ToReceive(){try{const ledger=typeof cabanaEarningsTransactions!=='undefined'?cabanaEarningsTransactions:[];return Math.round(ledger.filter(item=>item.method==='Room charge'&&['Awaiting guest checkout','Awaiting settlement'].includes(item.status)).reduce((sum,item)=>sum+earningsTransactionNet(item),0))}catch(e){return 0}}

/* Receivables: one total, split in the order money moves (awaiting checkout → awaiting resort payment). Opened from Insights and Home. */
const vrPaymentDays=7;
const vrRows=()=>{const ledger=typeof cabanaEarningsTransactions!=='undefined'?cabanaEarningsTransactions:[];return ledger.filter(t=>t.method==='Room charge'&&['Awaiting guest checkout','Awaiting settlement'].includes(t.status))};
const vrOverdue=t=>{if(!t.checkout)return false;const [m,dd]=t.checkout.split(' ');const date=new Date(2026,viMonths.indexOf(m),Number(dd));return (viToday-date)/864e5>vrPaymentDays};
const vrPage=()=>{
  const rows=vrRows(),net=t=>earningsTransactionNet(t),total=rows.reduce((a,t)=>a+net(t),0);
  const stay=rows.filter(t=>t.status==='Awaiting guest checkout').sort((a,b)=>b.sort-a.sort),resort=rows.filter(t=>t.status==='Awaiting settlement').sort((a,b)=>a.sort-b.sort);
  const day=t=>String(t.date).replace(/, \d{4}$/,'');
  const group=(title,sub,list,line)=>'<section class="vi2-card vr-group"><div class="vr-group-head"><span><h3>'+title+'</h3><small>'+sub+' · '+list.length+' booking'+(list.length===1?'':'s')+'</small></span><b>'+viPeso(list.reduce((a,t)=>a+net(t),0))+'</b></div>'
    +(list.length?list.map(t=>'<div class="vr-row'+(vrOverdue(t)?' is-overdue':'')+'"><span><strong>#'+esc(String(t.orderId).replace(/^#/,''))+' · Room '+esc(t.room)+'</strong><small>'+line(t)+(vrOverdue(t)?' · <em>Overdue</em>':'')+'</small></span><b>'+viPeso(net(t))+'</b></div>').join(''):'<p class="vr-empty">Nothing here right now.</p>')+'</section>';
  if(!rows.length)return '<div class="vi2 vr"><div class="vi-empty"><strong>Nothing to receive</strong><span>When guests charge bookings to their room, you’ll see them here until the resort pays you.</span></div></div>';
  return '<div class="vi2 vr"><section class="vi2-card vr-total"><span class="vi2-label">To receive</span><strong>'+viPeso(total)+'</strong><small>Unpaid room charges. Once the resort pays, a booking moves to Received.</small></section>'
    +group('Awaiting checkout','Guests still staying',stay,t=>esc(t.listing)+' · '+day(t))
    +group('Awaiting resort payment','Guests checked out',resort,t=>'Checked out '+esc(t.checkout||day(t)))
    +'<p class="vr-note">The resort pays room charges within '+vrPaymentDays+' days of checkout. Late ones are marked Overdue so you know what to raise with the front desk.</p></div>';
};
window.cabanaReceivablesPage=vrPage;
const viewBeforeVr=view;
view=function(){if(state.page==='vrecv'){try{return window.cabanaReceivablesPage()}catch(e){console.error('Receivables render failed',e);return '<div class="vi2"></div>'}}return viewBeforeVr.apply(this,arguments)};
window.addEventListener('click',event=>{
  const home=event.target.closest?.('.dashboard-receivables .dashboard-inline-link, .dashboard-receivables [data-page="earnings"]');
  if(!home)return;
  event.preventDefault();event.stopImmediatePropagation();
  enGo('dashboard');
},true);
const renderBeforeVr=render;
render=function(){
  renderBeforeVr.apply(this,arguments);
  if(state.page!=='vrecv')return;
  const page=document.querySelector('.page');if(page&&!page.querySelector('.vr'))page.innerHTML=vrPage();
  const bar=document.querySelector('.topbar');if(!bar)return;
  bar.querySelectorAll('[data-vi2-range]').forEach(n=>n.remove());
  const title=bar.querySelector('.topbar-context strong, h1');if(title)title.textContent='Receivables';
  let back=bar.querySelector('[data-profile-back]');
  if(!back){bar.classList.add('profile-topbar');back=document.createElement('button');back.type='button';back.className='profile-back';back.setAttribute('data-profile-back','');back.textContent='←';bar.prepend(back)}
  const to=state.vrecvFrom||'vinsights';
  back.setAttribute('aria-label',to==='dashboard'?'Back to Home':'Back to Insights');back.onclick=()=>{state.page=to;render();const p=document.querySelector('.page');if(p)p.scrollTop=0};
  document.querySelector('.dev-tools')?.setAttribute('hidden','');
};
render();

/* ===== Money: one Earnings page (To receive + Received), Insights Payments card, Home Receivables link. ===== */
function cabanaReceivedRows(){
  const raw=[['BK1036','online','Oct 9',1800,'Airport Transfer — Sedan','Lea Gomez','506'],['BK1033','room','Oct 8',3200,'Toyota Innova Rental','Ken Sato','221'],['BK1030','online','Oct 7',1200,'Island Hopping Tour','Ana Lopez','330'],
    ['BK1028','online','Oct 6',3500,'Van with Driver — Full Day','Rico Tan','415'],['BK1026','room','Oct 5',1800,'Airport Transfer — Sedan','Mia Reyes','207'],['BK1025','online','Oct 4',1300,'Dumaguete City Tour','Jun Park','612'],['BK1023','room','Oct 3',3200,'Toyota Innova Rental','Bea Cruz','318'],['BK1021','online','Oct 2',1800,'Airport Transfer — Sedan','Tom Hale','509'],
    ['BK1017','room','Sep 30',2400,'Island Hopping Tour','Ivy Lim','122'],['BK1015','online','Sep 28',3500,'Van with Driver — Full Day','Sam Ortiz','430'],['BK1013','online','Sep 26',1800,'Airport Transfer — Sedan','Liza Ong','214'],['BK1011','room','Sep 24',3200,'Toyota Innova Rental','Noel Yap','305'],['BK1009','online','Sep 21',1300,'Dumaguete City Tour','Kai Wong','611'],['BK1007','room','Sep 19',1800,'Airport Transfer — Sedan','Rose Uy','402'],['BK1005','online','Sep 16',3200,'Toyota Innova Rental','Dan Go','218'],['BK1003','online','Sep 14',1200,'Island Hopping Tour','Ella Sy','127'],['BK1001','room','Sep 12',3130,'Toyota Innova Rental','Gil Chua','520'],
    ['BK0998','online','Sep 9',1800,'Airport Transfer — Sedan','Pia Lao','301'],['BK0995','room','Sep 6',3200,'Toyota Innova Rental','Ray Dee','210'],['BK0992','online','Sep 3',1200,'Island Hopping Tour','Joy Ty','118'],['BK0988','online','Aug 28',3500,'Van with Driver — Full Day','Al Co','404'],['BK0984','room','Aug 20',1800,'Airport Transfer — Sedan','Mae Sia','309']];
  return raw.map(([id,how,date,amount,item,guest,room])=>{const [m,d]=date.split(' ');return {id,how,date,amount,item,guest,room,at:new Date(2026,viMonths.indexOf(m),Number(d))}});
}
function cabanaRangeStart(range){if(range==='Custom')return vi2CustomStart();const t=new Date(2026,9,10);if(range==='Last 7 days')return new Date(2026,9,4);if(range==='This month')return new Date(2026,9,1);if(range==='Last month')return new Date(2026,8,1);if(range==='This year')return new Date(2026,0,1);return new Date(2026,8,11)}
function cabanaRangeEnd(range){if(range==='Custom')return vi2CustomEnd();return range==='Last month'?new Date(2026,8,30):new Date(2026,9,10)}
function cabanaReceivedIn(range){const a=cabanaRangeStart(range),b=cabanaRangeEnd(range);return cabanaReceivedRows().filter(r=>r.at>=a&&r.at<=b)}
window.cabanaReceivedTotal=range=>cabanaReceivedIn(range).reduce((s,r)=>s+r.amount,0);
/* Make every money row open Request details. */
function cabanaEnsureOrders(){
  if(typeof orders==='undefined'||!orders.length)return;
  const base=orders[0],add=(id,o)=>{if(orders.some(x=>x.id===id))return;orders.push({...JSON.parse(JSON.stringify(base)),id,...o,timeline:[['Booking requested',o.when]],notes:'',contact:'Open guest chat'})};
  cabanaReceivedRows().forEach(r=>add(r.id,{guest:r.guest,room:r.room,item:r.item,quantity:'1 booking',when:r.date+' · 9:00 AM',total:'₱'+r.amount.toLocaleString('en-PH')+'.00',payment:r.how==='online'?'Paid online':'Charged to room',settlement:r.how==='online'?'Paid':'Paid by resort',status:'Completed'}));
  (typeof cabanaEarningsTransactions!=='undefined'?cabanaEarningsTransactions:[]).filter(t=>t.method==='Room charge'&&['Awaiting guest checkout','Awaiting settlement'].includes(t.status)).forEach(t=>add(t.orderId,{guest:t.guest,room:t.room,item:t.listing,quantity:'1 booking',when:String(t.date).replace(/, \d{4}$/,'')+' · 9:00 AM',total:'₱'+earningsTransactionNet(t).toLocaleString('en-PH')+'.00',payment:'Charged to room',settlement:t.status==='Awaiting guest checkout'?'Awaiting guest checkout':'Awaiting resort payment',status:t.status==='Awaiting guest checkout'?'Confirmed':'Completed'}));
}
cabanaEnsureOrders();
const enRanges=['Last 7 days','Last 30 days','This month','Last month'];
const enPage=()=>{
  const rows=vrRows(),net=t=>earningsTransactionNet(t),total=rows.reduce((a,t)=>a+net(t),0);
  const stay=rows.filter(t=>t.status==='Awaiting guest checkout').sort((a,b)=>b.sort-a.sort),resort=rows.filter(t=>t.status==='Awaiting settlement').sort((a,b)=>b.sort-a.sort);
  const day=t=>String(t.date).replace(/, \d{4}$/,'');
  const bk=id=>'#'+String(id).replace(/^#/,'').replace(/^BK-?/,'BK');
  const row=(id,top,sub,amount,overdue)=>'<button type="button" class="en-row" data-en-open="'+esc(id)+'"><span><strong>'+top+'</strong><small>'+sub+(overdue?' · <em>Overdue</em>':'')+'</small></span><b>'+viPeso(amount)+'</b></button>';
  const group=(title,sub,list,line)=>{const sum=list.reduce((a,t)=>a+net(t),0);if(!sum)return '';return '<div class="en-group"><div class="en-group-head"><strong>'+title+'</strong><b>'+viPeso(sum)+'</b></div><small class="en-group-sub">'+sub+' · '+list.length+' booking'+(list.length===1?'':'s')+'</small>'+list.map(t=>row(t.orderId,bk(t.orderId)+' · Room '+esc(t.room),line(t),net(t),vrOverdue(t))).join('')+'</div>'};
  const toReceive='<section class="en-card"><div class="en-title"><h3>To receive</h3><span>As of today</span></div><strong class="en-big">'+viPeso(total)+'</strong>'
    +(total?group('Awaiting checkout','Guests still staying',stay,t=>'Stay '+day(t))+group('Awaiting resort payment','Guests checked out',resort,t=>'Checked out '+esc(t.checkout||day(t))):'<p class="en-empty">All caught up</p>')+'</section>';
  const range=state.enRange||'Last 30 days',got=cabanaReceivedIn(range).sort((a,b)=>b.at-a.at),sum=got.reduce((a,r)=>a+r.amount,0);
  const received='<section class="en-card"><div class="en-title"><h3>Received</h3><button type="button" class="vi2-range en-range" data-en-range aria-haspopup="dialog"><span>'+range+'</span><i aria-hidden="true">▾</i></button></div><strong class="en-big">'+viPeso(sum)+'</strong>'
    +(got.length?'<div class="en-group">'+got.slice(0,state.enShowAll?got.length:10).map(r=>row(r.id,bk(r.id)+' · '+(r.how==='online'?'Paid online':'Charged to room'),(r.how==='online'?'':'Paid by resort ')+r.date,r.amount)).join('')+(got.length>10&&!state.enShowAll?'<button type="button" class="en-more" data-en-more>Show more</button>':'')+'</div>':'<p class="en-empty">No payments in this period</p>')+'</section>';
  return '<div class="en">'+toReceive+received+'</div>';
};
window.cabanaEarningsPage=enPage;
const viewBeforeEn=view;
view=function(){if(state.page==='earnings'&&state.role==='Owner'){try{return window.cabanaEarningsPage()}catch(e){console.error('Earnings render failed',e);return '<div class="en"></div>'}}return viewBeforeEn.apply(this,arguments)};
const enRangeSheet=()=>{
  lcSheetClose();const cur=state.enRange||'Last 30 days',wrap=document.createElement('div');wrap.className='lc-sheet-wrap';
  wrap.innerHTML='<div class="pf-sheet-backdrop" data-en-close></div><section class="pf-sheet lc-sheet lc-dd-sheet" role="dialog" aria-label="Date range"><header><h2>Date range</h2><button type="button" data-en-close aria-label="Close">×</button></header><div class="lc-sheet-list" role="listbox">'+enRanges.map(r=>'<button type="button" role="option" aria-selected="'+(cur===r)+'" class="'+(cur===r?'is-selected':'')+'" data-en-pick="'+r+'"><span>'+r+'</span>'+(cur===r?'<i class="hgi-stroke hgi-tick-02" aria-hidden="true"></i>':'')+'</button>').join('')+'</div></section>';
  document.body.appendChild(wrap);
  wrap.onclick=e=>{if(e.target.closest('[data-en-close]')){lcSheetClose();return}const pick=e.target.closest('[data-en-pick]');if(!pick)return;state.enRange=pick.dataset.enPick;state.enShowAll=false;lcSheetClose();const sc=document.querySelector('.page')?.scrollTop||0;render();const p=document.querySelector('.page');if(p)p.scrollTop=sc};
  wrap.onkeydown=e=>{if(e.key==='Escape')lcSheetClose()};
};
const enGo=from=>{state.enFrom=from;state.enShowAll=false;state.page='earnings';state.earningsPayoutDetail=null;state.earningsTransactionDetail=null;render();const p=document.querySelector('.page');if(p)p.scrollTop=0};
window.addEventListener('click',event=>{
  const t=event.target;
  const home=t.closest?.('.dashboard-receivables .dashboard-inline-link, .dashboard-receivables [data-page="earnings"]');
  const ins=t.closest?.('[data-vi2-earnings]'),open=state.page==='earnings'&&t.closest?.('[data-en-open]'),pill=state.page==='earnings'&&t.closest?.('[data-en-range]');
  if(!home&&!ins&&!open&&!pill)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(home)return enGo('dashboard');
  if(ins)return enGo('vinsights');
  if(pill)return enRangeSheet();
  state.enReturn=true;state.page='orders';state.detail=open.dataset.enOpen;render();const p=document.querySelector('.page');if(p)p.scrollTop=0;
},true);
const renderBeforeEn=render;
render=function(){
  if(state.page==='vrecv'){state.enFrom=state.vrecvFrom||'vinsights';state.page='earnings'}
  if(state.page==='earnings'&&state.role!=='Owner')state.page='menu';
  if(state.page!=='orders'&&state.page!=='earnings')state.enReturn=false;
  renderBeforeEn.apply(this,arguments);
  const homeLink=document.querySelector('.dashboard-receivables .dashboard-inline-link');
  if(homeLink&&!homeLink.dataset.enLabel&&!homeLink.classList.contains('e4-home-foot')){homeLink.dataset.enLabel='1';homeLink.innerHTML='View earnings <span aria-hidden="true">›</span>'}
  if(state.page==='orders'&&state.enReturn&&state.detail){const lb=document.querySelector('[data-latest-back]');if(lb)lb.setAttribute('aria-label','Back to Earnings');const back=document.querySelector('[data-detail-back], .detail-back, [data-back]');if(back&&!back.dataset.enBound){back.dataset.enBound='1';back.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();state.detail=null;state.enReturn=false;state.page='earnings';render()},true)}}
  if(state.page!=='earnings')return;
  const page=document.querySelector('.page');if(page&&!page.querySelector('.en'))page.innerHTML=enPage();
  const bar=document.querySelector('.topbar');if(!bar)return;
  bar.querySelectorAll('[data-vi2-range]').forEach(n=>n.remove());
  const title=bar.querySelector('.topbar-context strong, h1');if(title)title.textContent='Earnings';
  let back=bar.querySelector('[data-profile-back]');
  if(!back){bar.classList.add('profile-topbar');back=document.createElement('button');back.type='button';back.className='profile-back';back.setAttribute('data-profile-back','');back.textContent='←';bar.prepend(back)}
  const to=state.enFrom||'menu';back.setAttribute('aria-label','Back');back.onclick=()=>{state.page=to;state.enFrom=null;render();const p=document.querySelector('.page');if(p)p.scrollTop=0};
  document.querySelector('.dev-tools')?.setAttribute('hidden','');
};
render();
/* Request details opened from Earnings: back returns to Earnings. */
window.addEventListener('click',event=>{
  if(!state.enReturn||state.page!=='orders')return;
  const back=event.target.closest?.('[data-latest-back], .latest-request-back, .booking-back');if(!back)return;
  event.preventDefault();event.stopImmediatePropagation();
  state.detail=null;state.enReturn=false;state.page='earnings';render();
},true);

/* Insights: custom date range. */
function vi2CustomStart(){const c=state.vi2Custom||{start:'2026-09-01'};const [y,m,d]=c.start.split('-').map(Number);return new Date(y,m-1,d)}
function vi2CustomEnd(){const c=state.vi2Custom||{end:'2026-09-30'};const [y,m,d]=c.end.split('-').map(Number);return new Date(y,m-1,d)}
function vi2CustomDays(){return Math.max(1,Math.round((vi2CustomEnd()-vi2CustomStart())/864e5)+1)}
function vi2CustomLabel(){const a=vi2CustomStart(),b=vi2CustomEnd(),M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];return a.getMonth()===b.getMonth()?M[a.getMonth()]+' '+a.getDate()+'–'+b.getDate():M[a.getMonth()]+' '+a.getDate()+' – '+M[b.getMonth()]+' '+b.getDate()}
function vi2CustomData(){
  const days=vi2CustomDays(),k=days/30,start=vi2CustomStart(),end=vi2CustomEnd(),M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],f=x=>M[x.getMonth()]+' '+x.getDate();
  const prevStart=new Date(start);prevStart.setDate(start.getDate()-days);const hasPrev=prevStart>=new Date(2026,5,1);
  const r100=v=>Math.round(v/100)*100,c=v=>Math.max(1,Math.round(v));
  const d={sales:r100(48600*k),prev:hasPrev?r100(43400*k):0,bookings:c(32*k),prevBookings:hasPrev?c(29*k):0,response:Math.round(16+viSeed(days)*6),prevResponse:hasPrev?23:0,received:c(40*k),declined:Math.round(2*k),expired:Math.round(4*k)};
  d.outstanding=0;d.collected=d.sales;d.confirmed=Math.max(0,d.received-d.declined-d.expired);
  d.points=days;const mid=new Date(start);mid.setDate(start.getDate()+Math.floor((days-1)/2));d.labels=[f(start),f(mid),f(end)];
  const prevEnd=new Date(start);prevEnd.setDate(start.getDate()-1);
  d.compare=hasPrev?'previous '+days+' day'+(days===1?'':'s'):'';d.legend=[vi2CustomLabel(),hasPrev?f(prevStart)+' – '+f(prevEnd):''];
  d.series=vi2Series(days,d.sales,days*7+start.getDate());d.prevSeries=hasPrev?vi2Series(days,d.prev,days*7+start.getDate()+97):null;
  return d;
}

window.addEventListener('click',event=>{
  if(state.page!=='earnings'||!event.target.closest?.('[data-en-more]'))return;
  event.preventDefault();event.stopImmediatePropagation();
  const sc=document.querySelector('.page')?.scrollTop||0;state.enShowAll=true;render();const p=document.querySelector('.page');if(p)p.scrollTop=sc;
},true);
window.addEventListener('click',event=>{
  const row=event.target.closest?.('.page [data-page="earnings"]');if(!row||state.page!=='menu')return;
  state.enFrom='menu';state.enShowAll=false;
},true);

/* ===== Earnings v3: summary tiles (To receive | Received), detail one tap away. ===== */
const e3Net=t=>earningsTransactionNet(t);
const e3Day=t=>String(t.date).replace(/, \d{4}$/,'');
const e3Bk=id=>'#'+String(id).replace(/^#/,'').replace(/^BK-?/,'BK');
const e3Short=d=>viMonths[d.getMonth()]+' '+d.getDate();
function e3Owed(){
  const rows=vrRows(),stay=rows.filter(t=>t.status==='Awaiting guest checkout'),resort=rows.filter(t=>t.status==='Awaiting settlement');
  const sum=l=>l.reduce((a,t)=>a+e3Net(t),0),overdue=resort.filter(vrOverdue);
  return {rows,stay,resort,total:sum(rows),stayTotal:sum(stay),resortTotal:sum(resort),overdue,overdueTotal:sum(overdue)};
}
function e3Buckets(range){
  const a=cabanaRangeStart(range),b=cabanaRangeEnd(range),days=Math.round((b-a)/864e5)+1,rows=cabanaReceivedIn(range),out=[];
  if(days<=10){for(let i=0;i<days;i++){const d=new Date(a);d.setDate(a.getDate()+i);out.push({start:d,end:d,label:range==='Last 7 days'?['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]:String(d.getDate()),full:e3Short(d)})}}
  else{const n=Math.max(1,Math.floor(days/7));for(let i=0;i<n;i++){const s=new Date(a);s.setDate(a.getDate()+i*7);const e=i===n-1?new Date(b):new Date(s.getFullYear(),s.getMonth(),s.getDate()+6);const lab=s.getMonth()===e.getMonth()?viMonths[s.getMonth()]+' '+s.getDate()+'–'+e.getDate():e3Short(s)+'–'+e3Short(e);out.push({start:s,end:e,label:lab,full:lab})}}
  out.forEach(k=>{k.total=rows.filter(r=>r.at>=k.start&&r.at<=k.end).reduce((s,r)=>s+r.amount,0)});
  return out;
}
const e3Icon=(name,cls='')=>'<span class="e3-ic '+cls+'"><i class="hgi-stroke hgi-'+name+'" aria-hidden="true"></i></span>';
const e3PayRow=r=>'<button type="button" class="e3-pay" data-en-open="'+esc(r.id)+'">'+e3Icon(r.how==='online'?'credit-card':'key-01','is-tile')+'<span><strong>'+e3Bk(r.id)+' · '+(r.how==='online'?'Paid online':'Charged to room')+'</strong><small>'+(r.how==='online'?r.date:'Paid by resort · '+r.date)+'</small></span><b>'+viPeso(r.amount)+'</b></button>';
const e3Pill=(attr,label)=>'<button type="button" class="vi2-range e3-pill" '+attr+' aria-haspopup="dialog"><span>'+label+'</span><i aria-hidden="true">▾</i></button>';
function e3Main(){
  const o=e3Owed(),range=state.enRange||'Last 30 days',recv=cabanaReceivedIn(range),recvTotal=recv.reduce((a,r)=>a+r.amount,0);
  if(!state.enView)state.enView=o.total?'receive':'received';
  const v=state.enView,tile=(key,label,amount,help)=>'<button type="button" class="e3-tile'+(v===key?' is-on':'')+'" data-e3-view="'+key+'" aria-pressed="'+(v===key)+'"><span>'+label+'</span><strong>'+viPeso(amount)+'</strong><small>'+help+'</small></button>';
  let body='';
  if(v==='receive'){
    if(!o.total)body='<section class="en-card e3-empty"><strong>All caught up</strong><span>Room charges you’re owed will appear here.</span></section>';
    else{
      const old=o.overdue.slice().sort((a,b)=>a.sort-b.sort)[0];
      body=(o.overdue.length?'<button type="button" class="e3-alert" data-e3-sub="resort" data-e3-overdue><span class="e3-alert-ic"><i class="hgi-stroke hgi-alert-circle" aria-hidden="true"></i></span><span><strong>'+o.overdue.length+' overdue payment'+(o.overdue.length===1?'':'s')+' · '+viPeso(o.overdueTotal)+'</strong><small>'+(o.overdue.length===1?'Checked out '+esc(old.checkout||e3Day(old))+' · Room '+esc(old.room):'Oldest: checked out '+esc(old.checkout||e3Day(old)))+'</small></span><i class="e3-chev" aria-hidden="true">›</i></button>':'')
        +'<section class="en-card e3-stages">'
        +(o.stayTotal?'<button type="button" class="e3-stage" data-e3-sub="checkout">'+e3Icon('bed-double')+'<span><strong>Awaiting checkout</strong><small>Still staying · '+o.stay.length+' booking'+(o.stay.length===1?'':'s')+'</small></span><b>'+viPeso(o.stayTotal)+'</b><i class="e3-chev" aria-hidden="true">›</i></button>':'')
        +(o.resortTotal?'<button type="button" class="e3-stage" data-e3-sub="resort">'+e3Icon('building-03')+'<span><strong>Awaiting resort payment</strong><small>Checked out · '+o.resort.length+' booking'+(o.resort.length===1?'':'s')+'</small></span><b>'+viPeso(o.resortTotal)+'</b><i class="e3-chev" aria-hidden="true">›</i></button>':'')
        +'</section>';
    }
  }else{
    const buckets=e3Buckets(range),max=Math.max(...buckets.map(k=>k.total),1),weekly=buckets.length&&buckets[0].start!==buckets[0].end;
    body='<section class="en-card e3-chart"><div class="en-title"><h3>'+(weekly?'By week':'By day')+'</h3>'+e3Pill('data-en-range',range)+'</div>'
      +(recvTotal?'<div class="e3-bars" role="img" aria-label="Received '+(weekly?'by week':'by day')+'">'+buckets.map((k,i)=>'<button type="button" class="e3-bar'+(i===buckets.length-1?' is-now':'')+'" data-e3-bar="'+i+'" aria-label="'+k.full+': '+viPeso(k.total)+'"><span class="e3-bar-col"><i style="height:'+Math.max(k.total?4:0,Math.round(k.total/max*100))+'%"></i></span><em>'+k.label+'</em></button>').join('')+'<div class="e3-tip" hidden></div></div>':'<p class="en-empty">No payments in this period</p>')+'</section>'
      +(recv.length?'<section class="en-card e3-recent"><span class="e3-caps">Recent payments</span>'+recv.slice().sort((a,b)=>b.at-a.at).slice(0,3).map(e3PayRow).join('')+'<button type="button" class="vi2-foot e3-foot" data-e3-sub="payments"><span>See all payments</span><i aria-hidden="true">›</i></button></section>':'');
  }
  return '<div class="en e3"><div class="e3-tiles">'+tile('receive','To receive',o.total,'As of today')+tile('received','Received',recvTotal,range)+'</div>'+body+'</div>';
}
function e3Group(list,dateOf,rowHtml,headTotal){
  const groups=[];list.forEach(x=>{const k=dateOf(x);let g=groups.find(g=>g.key===k);if(!g){g={key:k,items:[]};groups.push(g)}g.items.push(x)});
  return groups.map(g=>'<div class="e3-date"><span>'+g.key.toUpperCase()+'</span>'+(headTotal?'<b>'+viPeso(headTotal(g.items))+'</b>':'')+'</div><section class="en-card e3-list">'+g.items.map(rowHtml).join('')+'</section>').join('');
}
function e3Sub(){
  const sub=state.enSub,limit=state.enLimit||20;
  if(sub==='checkout'||sub==='resort'){
    const o=e3Owed();let list=(sub==='checkout'?o.stay:o.resort).slice();
    if(state.enOverdueOnly&&sub==='resort')list=list.filter(vrOverdue);
    list.sort((a,b)=>(vrOverdue(b)-vrOverdue(a))||(b.sort-a.sort));
    const total=list.reduce((a,t)=>a+e3Net(t),0);
    const row=t=>'<button type="button" class="e3-pay" data-en-open="'+esc(t.orderId)+'"><span><strong>'+e3Bk(t.orderId)+' · Room '+esc(t.room)+'</strong><small>'+(sub==='checkout'?'Stay '+e3Day(t):'Checked out '+esc(t.checkout||e3Day(t)))+'</small></span>'+(vrOverdue(t)?'<em class="e3-overdue">Overdue</em>':'')+'<b>'+viPeso(e3Net(t))+'</b></button>';
    const filter=sub==='resort'&&o.overdue.length?'<div class="e3-chips">'+[['all','All'],['overdue','Overdue']].map(([k,l])=>'<button type="button" class="e3-chip'+((state.enOverdueOnly?'overdue':'all')===k?' is-on':'')+'" data-e3-overdue-chip="'+k+'">'+l+'</button>').join('')+'</div>':'';
    return '<div class="en e3 e3-sub"><p class="e3-summary"><strong>'+viPeso(total)+'</strong> · '+list.length+' booking'+(list.length===1?'':'s')+'</p>'+filter
      +(list.length?e3Group(list.slice(0,limit),t=>sub==='checkout'?e3Day(t):(t.checkout||e3Day(t)),row):'<section class="en-card e3-empty"><strong>Nothing here</strong></section>')+(list.length>limit?'<div class="e3-loading" data-e3-more>Loading more…</div>':'')+'</div>';
  }
  const range=state.enRange||'Last 30 days',kind=state.enPayFilter||'all';
  let list=cabanaReceivedIn(range).filter(r=>kind==='all'||r.how===kind).sort((a,b)=>b.at-a.at);
  const chips='<div class="e3-chips">'+[['all','All'],['online','Paid online'],['room','Charged to room']].map(([k,l])=>'<button type="button" class="e3-chip'+(kind===k?' is-on':'')+'" data-e3-pay-chip="'+k+'">'+l+'</button>').join('')+'</div>';
  return '<div class="en e3 e3-sub"><div class="e3-subbar">'+e3Pill('data-en-range',range)+'</div>'+chips
    +(list.length?e3Group(list.slice(0,limit),r=>r.date,e3PayRow,items=>items.reduce((a,r)=>a+r.amount,0)):'<section class="en-card e3-empty"><strong>No payments in this period</strong></section>')+(list.length>limit?'<div class="e3-loading" data-e3-more>Loading more…</div>':'')+'</div>';
}
window.cabanaEarningsPage=()=>state.enSub?e3Sub():e3Main();
window.addEventListener('click',event=>{
  if(state.page!=='earnings')return;
  const t=event.target,view=t.closest?.('[data-e3-view]'),sub=t.closest?.('[data-e3-sub]'),bar=t.closest?.('[data-e3-bar]'),pc=t.closest?.('[data-e3-pay-chip]'),oc=t.closest?.('[data-e3-overdue-chip]');
  if(!view&&!sub&&!bar&&!pc&&!oc)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(bar){const wrap=bar.closest('.e3-bars'),tip=wrap.querySelector('.e3-tip'),k=e3Buckets(state.enRange||'Last 30 days')[Number(bar.dataset.e3Bar)];wrap.querySelectorAll('.e3-bar').forEach(b=>b.classList.toggle('is-picked',b===bar));tip.textContent=k.full+' · '+viPeso(k.total);tip.hidden=false;const wr=wrap.getBoundingClientRect(),br=bar.getBoundingClientRect(),tw=tip.offsetWidth;tip.style.left=Math.max(0,Math.min(wr.width-tw,br.left-wr.left+br.width/2-tw/2))+'px';return}
  if(view){state.enView=view.dataset.e3View}
  if(sub){state.enSub=sub.dataset.e3Sub;state.enOverdueOnly=sub.hasAttribute('data-e3-overdue');state.enLimit=20;state.enPayFilter='all'}
  if(pc){state.enPayFilter=pc.dataset.e3PayChip;state.enLimit=20}
  if(oc){state.enOverdueOnly=oc.dataset.e3OverdueChip==='overdue'}
  render();if(sub){const p=document.querySelector('.page');if(p)p.scrollTop=0}
},true);
document.addEventListener('scroll',event=>{
  if(state.page!=='earnings'||!state.enSub)return;
  const p=event.target;if(!(p instanceof Element)||!p.classList.contains('page'))return;
  if(p.scrollTop+p.clientHeight>=p.scrollHeight-120&&document.querySelector('[data-e3-more]')){const sc=p.scrollTop;state.enLimit=(state.enLimit||20)+20;render();const q=document.querySelector('.page');if(q)q.scrollTop=sc}
},true);
const renderBeforeE3=render;
render=function(){
  if(state.page!=='earnings'&&state.page!=='orders'){state.enSub=null}
  renderBeforeE3.apply(this,arguments);
  if(state.page!=='earnings'||state.role!=='Owner')return;
  const page=document.querySelector('.page');if(page&&!page.querySelector('.e3'))page.innerHTML=window.cabanaEarningsPage();
  const title=document.querySelector('.topbar .topbar-context strong, .topbar h1');
  const names={checkout:'Awaiting checkout',resort:'Awaiting resort payment',payments:'Payments'};
  if(title)title.textContent=state.enSub?names[state.enSub]:'Earnings';
  const back=document.querySelector('[data-profile-back]');
  if(back&&state.enSub){back.onclick=()=>{state.enSub=null;state.enOverdueOnly=false;render();const p=document.querySelector('.page');if(p)p.scrollTop=0}}
};
render();

/* ===== Earnings v4: Awaiting checkout → Ready to request → Requested → Paid (hotel payouts + online). ===== */
const e4Hotels={henrys:'Henry’s Resort Dumaguete',luna:'Luna Bay Resort'};
const e4M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const e4Date=s=>{const [m,d]=String(s).split(' ');return new Date(2026,e4M.indexOf(m),Number(d))};
const e4Fmt=d=>e4M[d.getMonth()]+' '+d.getDate();
const e4Today=()=>new Date(2026,9,10);
const e4Peso=n=>'₱'+Math.round(n).toLocaleString('en-PH');
function e4Split(prefix,start,n,total,hotel,dateOut){const out=[];let left=total;for(let i=0;i<n;i++){const amt=i===n-1?left:Math.round(total/n/10)*10;left-=amt;const od=e4Date(dateOut);od.setDate(od.getDate()-Math.round((n-1-i)*6/Math.max(1,n-1)));out.push({id:'BK'+(start+i),hotel,room:String(200+((start+i)*37)%500),amount:amt,out:e4Fmt(od),item:['Airport Transfer — Sedan','Toyota Innova Rental','Island Hopping Tour','Dumaguete City Tour','Van with Driver — Full Day'][(start+i)%5],guest:['Ana Cruz','Ben Yu','Cara Lim','Dino Sy','Eva Tan','Fe Ong'][(start+i)%6]})}return out}
function e4Seed(){return {
  bookings:[
    {id:'BK1047',hotel:'henrys',room:'315',item:'Dumaguete City Tour',guest:'Carlo Ramos',amount:1200,stage:'checkout',until:'Oct 12'},
    {id:'BK1042',hotel:'henrys',room:'602',item:'Airport Transfer — Sedan',guest:'Sofia Lim',amount:1800,stage:'checkout',until:'Oct 11'},
    {id:'BK1040',hotel:'henrys',room:'118',item:'Island Hopping Tour',guest:'Nina Cruz',amount:1200,stage:'checkout',until:'Oct 13'},
    {id:'BK1038',hotel:'henrys',room:'410',item:'Island Hopping Tour',guest:'Paolo Diaz',amount:1200,stage:'checkout',until:'Oct 12'},
    {id:'BK1031',hotel:'henrys',room:'210',item:'Van with Driver — Full Day',guest:'Maya Tan',amount:1170,stage:'ready',out:'Oct 7'},
    {id:'BK1035',hotel:'henrys',room:'220',item:'Dumaguete City Tour',guest:'Leo Bautista',amount:900,stage:'ready',out:'Oct 9'},
    {id:'BK1034',hotel:'luna',room:'305',item:'Airport Transfer — Sedan',guest:'John D.',amount:1800,stage:'ready',out:'Oct 8'}
  ],
  requests:[
    {id:'RQ208',hotel:'henrys',date:'Oct 8',bookings:e4Split('BK',1022,3,4400,'henrys','Oct 6')},
    {id:'RQ201',hotel:'henrys',date:'Oct 1',bookings:[{id:'BK1019',hotel:'henrys',room:'305',amount:1800,out:'Sep 30',item:'Airport Transfer — Sedan',guest:'John D.'}]}
  ],
  payouts:[
    {id:'PO114',hotel:'henrys',date:'Oct 6',bookings:e4Split('BK',1008,5,7400,'henrys','Oct 2')},
    {id:'PO109',hotel:'henrys',date:'Sep 29',bookings:e4Split('BK',990,4,6200,'henrys','Sep 25')},
    {id:'PO103',hotel:'henrys',date:'Sep 20',bookings:e4Split('BK',980,3,5130,'henrys','Sep 16')},
    {id:'PO097',hotel:'henrys',date:'Sep 5',bookings:e4Split('BK',960,3,4800,'henrys','Sep 1')},
    {id:'PO090',hotel:'henrys',date:'Aug 22',bookings:e4Split('BK',950,2,3600,'henrys','Aug 18')},
    {id:'PO088',hotel:'luna',date:'Aug 28',bookings:e4Split('BK',940,3,4200,'luna','Aug 24')}
  ]}}
function e4Model(){
  if(!state.e4Model){try{state.e4Model=JSON.parse(localStorage.getItem('cabana:earnings-model-v4')||'null')}catch(e){}if(!state.e4Model||!state.e4Model.bookings)state.e4Model=e4Seed()}
  return state.e4Model;
}
const e4Save=()=>{try{localStorage.setItem('cabana:earnings-model-v4',JSON.stringify(state.e4Model))}catch(e){}};
const e4Sum=l=>l.reduce((a,x)=>a+x.amount,0);
function e4Online(){return (typeof cabanaReceivedRows==='function'?cabanaReceivedRows():[]).filter(r=>r.how==='online').map(r=>({kind:'online',hotel:'henrys',id:r.id,date:r.date,at:r.at,amount:r.amount,item:r.item,guest:r.guest,room:r.room}))}
function e4Paid(){const m=e4Model();return m.payouts.map(p=>({kind:'payout',id:p.id,hotel:p.hotel,date:p.date,at:e4Date(p.date),amount:e4Sum(p.bookings),count:p.bookings.length})).concat(e4Online()).sort((a,b)=>b.at-a.at)}
function e4Totals(){const m=e4Model(),ready=m.bookings.filter(b=>b.stage==='ready'),checkout=m.bookings.filter(b=>b.stage==='checkout'),requested=m.requests.reduce((a,r)=>a+e4Sum(r.bookings),0);return {ready,checkout,readyTotal:e4Sum(ready),checkoutTotal:e4Sum(checkout),requested,toReceive:e4Sum(ready)+e4Sum(checkout)+requested}}
const e4Age=date=>Math.round((e4Today()-e4Date(date))/864e5);
/* Date range for Paid */
function e4Range(r){
  r=r||state.e4Range||{preset:'Last 30 days'};const t=e4Today();
  if(r.preset==='Today')return {start:t,end:t,label:'Today',sub:e4Fmt(t)};
  if(r.preset==='Last 7 days'){const s=new Date(2026,9,4);return {start:s,end:t,label:'Last 7 days',sub:e4Fmt(s)+' – '+e4Fmt(t)}}
  if(r.preset==='This month')return {start:new Date(2026,9,1),end:t,label:'Oct 2026',sub:'Oct 1 – '+e4Fmt(t)};
  if(r.preset==='Last month')return {start:new Date(2026,8,1),end:new Date(2026,8,30),label:'Sep 2026',sub:'Sep 1 – Sep 30'};
  if(r.preset==='Custom'){const s=new Date(r.start),e=new Date(r.end);return {start:s,end:e,label:e4Fmt(s)+' – '+e4Fmt(e),sub:e4Fmt(s)+' – '+e4Fmt(e)+', '+e.getFullYear()}}
  const s=new Date(2026,8,11);return {start:s,end:t,label:'Last 30 days',sub:e4Fmt(s)+' – '+e4Fmt(t)};
}
const e4PaidIn=(r,hotel)=>{const x=e4Range(r);return e4Paid().filter(p=>p.at>=x.start&&p.at<=x.end&&(!hotel||p.hotel===hotel))};
/* Insights + Home use the same model */
window.cabanaReceivedTotal=range=>{const a=cabanaRangeStart(range),b=cabanaRangeEnd(range);return e4Paid().filter(p=>p.at>=a&&p.at<=b).reduce((s,p)=>s+p.amount,0)};
vi2ToReceive=function(){return e4Totals().toReceive};
const e4Pill=(attr,label)=>'<button type="button" class="vi2-range e3-pill" '+attr+' aria-haspopup="dialog"><span>'+label+'</span><i aria-hidden="true">▾</i></button>';
const e4StatusPill=req=>e4Age(req.date)>7?'<em class="e4-pill is-follow">Follow up</em>':'<em class="e4-pill is-req">Requested</em>';
const e4ShortHotel=h=>String(e4Hotels[h]||'').replace(/ Dumaguete$/,'');
const e4Method=id=>['GCash','Maya','Card','GCash'][Number(String(id).replace(/\D/g,''))%4];
const e4PaidRow=p=>p.kind==='payout'
  ?'<button type="button" class="e3-pay" data-e4-open="payout:'+p.id+'">'+e3Icon('building-03','is-tile is-plum')+'<span><strong>Payout</strong><small>'+(state.e4Sub==='payments'?'':p.date+' · ')+(['GCash','Card'][Number(String(p.id).replace(/\D/g,''))%2])+'</small></span><b>'+e4Peso(p.amount)+'</b></button>'
  :'<button type="button" class="e3-pay" data-en-open="'+esc(p.id)+'">'+e3Icon('credit-card','is-tile is-blue')+'<span><strong>Online payment</strong><small>'+(state.e4Sub==='payments'?'':p.date+' · ')+e4Method(p.id)+'</small></span><b>'+e4Peso(p.amount)+'</b></button>';
function e4Main(){
  const m=e4Model(),t=e4Totals(),range=e4Range(),paid=e4PaidIn(),hotels=[...new Set(t.ready.map(b=>b.hotel))];
  const hero='<section class="e4-hero"><span>Available for payout</span><strong>'+e4Peso(t.readyTotal)+'</strong><small>'+(t.readyTotal?'From checked-out guests':'Nothing available yet')+'</small><button type="button" class="e4-hero-btn" data-e4-request'+(t.readyTotal?'':' disabled')+'>Request payout</button></section>';
  const reqs=m.requests.slice().sort((a,b)=>e4Date(b.date)-e4Date(a.date));
  const requested=reqs.length?'<div class="e4-sec"><h3>Requested payouts</h3></div><section class="en-card e4-list">'+reqs.map(r=>{return '<button type="button" class="e3-stage" data-e4-open="request:'+r.id+'">'+e3Icon('clock-01','is-amber')+'<span><strong class="e4-one">'+esc(e4ShortHotel(r.hotel))+'</strong><small>'+r.date+'</small></span><span class="e4-right"><b>'+e4Peso(e4Sum(r.bookings))+'</b></span><i class="e3-chev" aria-hidden="true">›</i></button>'}).join('')+'</section>':'';
  const notReady=t.checkoutTotal?'<div class="e4-sec"><h3>Awaiting checkout</h3></div><section class="en-card e4-list"><button type="button" class="e3-stage" data-e4-open="checkout">'+e3Icon('bed-double')+'<span><strong>'+t.checkout.length+' booking'+(t.checkout.length===1?'':'s')+'</strong><small>Guests still staying</small></span><b>'+e4Peso(t.checkoutTotal)+'</b><i class="e3-chev" aria-hidden="true">›</i></button></section>':'';
  const paidSec='<div class="e4-sec"><h3>Payments received</h3>'+e4Pill('data-e4-range',range.label)+'</div><section class="en-card e4-list e4-paid">'
    +(paid.length?'<div class="e4-paid-total"><strong>'+e4Peso(e4Sum(paid))+'</strong><small>'+range.sub+'</small></div>'+paid.slice(0,3).map(e4PaidRow).join('')+'<button type="button" class="vi2-foot e3-foot" data-e4-open="payments"><span>View payment history</span><i aria-hidden="true">›</i></button>':'<p class="en-empty">No payments in this range</p>')+'</section>';
  return '<div class="en e3 e4">'+hero+'<div class="e4-hero-note"><span>As of today</span></div>'+requested+notReady+paidSec+'</div>';
}
function e4Detail(){
  const m=e4Model(),[kind,id]=String(state.e4Sub).split(':'),limit=state.enLimit||20;
  const bookingRow=(b,line)=>'<button type="button" class="e3-pay" data-en-open="'+esc(b.id)+'"><span><strong>#'+esc(b.id)+' · Room '+esc(b.room)+'</strong><small>'+line+'</small></span><b>'+e4Peso(b.amount)+'</b></button>';
  if(kind==='request'||kind==='payout'){
    const r=(kind==='request'?m.requests:m.payouts).find(x=>x.id===id);if(!r)return '<div class="en e3 e4"></div>';
    const paid=kind==='payout',short=e4ShortHotel(r.hotel),reqDate=paid?(r.requested||e4Fmt(new Date(e4Date(r.date).getTime()-2*864e5))):r.date;
    const status=paid
      ?'<div class="e4-status is-paid"><span class="e4-status-ic"><i class="hgi-stroke hgi-checkmark-circle-02" aria-hidden="true"></i></span><span><strong>Paid '+r.date+'</strong><small>Requested '+reqDate+' · Paid to '+(r.account||'BDO •••• 4821')+'</small></span></div>'
      :'<div class="e4-status"><span class="e4-status-ic"><i class="hgi-stroke hgi-clock-01" aria-hidden="true"></i></span><span><strong>Waiting for '+esc(short)+' to pay</strong><small>Requested '+reqDate+' · To '+(r.account||'BDO •••• 4821')+'</small></span></div>';
    const row=b=>'<button type="button" class="e3-pay" data-en-open="'+esc(b.id)+'"><span><strong>#'+esc(b.id)+' · Room '+esc(b.room)+'</strong><small>Checked out '+b.out+'</small></span><b>'+e4Peso(b.amount)+'</b><i class="e3-chev" aria-hidden="true">›</i></button>';
    return '<div class="en e3 e4 e4-req"><section class="en-card e4-req-top"><span class="e4-req-hotel">'+esc(e4Hotels[r.hotel])+'</span><strong>'+e4Peso(e4Sum(r.bookings))+'</strong>'+status+'</section>'
      +'<div class="e4-sec"><h3>Room charges ('+r.bookings.length+')</h3></div><section class="en-card e4-list">'+r.bookings.map(row).join('')+'</section>'
      +(paid?'':'<button type="button" class="e4-outline" data-e4-message="'+r.hotel+'"><i class="hgi-stroke hgi-message-01" aria-hidden="true"></i>Message front desk</button>')+'</div>';
  }
  if(kind==='checkout'){
    const list=m.bookings.filter(b=>b.stage==='checkout');
    return '<div class="en e3 e4"><p class="e3-summary"><strong>'+e4Peso(e4Sum(list))+'</strong> · '+list.length+' booking'+(list.length===1?'':'s')+'</p>'+Object.keys(e4Hotels).map(h=>{const l=list.filter(b=>b.hotel===h);return l.length?'<div class="e3-date"><span>'+e4Hotels[h].toUpperCase()+'</span><b>'+e4Peso(e4Sum(l))+'</b></div><section class="en-card e3-list">'+l.map(b=>bookingRow(b,'Staying until '+b.until)).join('')+'</section>':''}).join('')+'</div>';
  }
  const range=e4Range(),f=state.e4PayFilter||'all',list=e4PaidIn(null,e4CurHotel()).filter(p=>f==='all'||(f==='payout'?p.kind==='payout':p.kind==='online'));
  const chips='<div class="e3-chips">'+[['all','All'],['payout','Payouts'],['online','Online payments']].map(([k,l])=>'<button type="button" class="e3-chip'+(f===k?' is-on':'')+'" data-e4-chip="'+k+'">'+l+'</button>').join('')+'</div>';
  const groups=[];list.slice(0,limit).forEach(p=>{let g=groups.find(g=>g.key===p.date);if(!g){g={key:p.date,items:[]};groups.push(g)}g.items.push(p)});
  return '<div class="en e3 e4 e4-history"><div class="e4-sticky">'+chips+'</div>'
    +(list.length?'<section class="en-card e4-statement">'+groups.map(g=>'<div class="e4-day-head"><span>'+g.key.toUpperCase()+'</span></div>'+g.items.map(e4PaidRow).join('')).join('')+'</section>':'<section class="en-card e3-empty"><strong>No payments in this range</strong></section>')
    +(list.length>limit?'<div class="e3-loading" data-e4-more>Loading more…</div>':'')+'</div>';
}
window.cabanaEarningsPage=()=>state.e4Sub?e4Detail():e4Main();
/* Request payout sheet */
function e4RequestSheet(){
  lcSheetClose();const t=e4Totals(),hotels=Object.keys(e4Hotels).filter(h=>t.ready.some(b=>b.hotel===h));if(!hotels.length)return;
  const wrap=document.createElement('div');wrap.className='lc-sheet-wrap';
  const rowFor=h=>{const l=t.ready.filter(b=>b.hotel===h),ds=l.map(b=>e4Date(b.out)).sort((a,b)=>a-b),span=ds.length>1&&+ds[0]!==+ds[ds.length-1]?e4Fmt(ds[0])+'–'+(ds[0].getMonth()===ds[ds.length-1].getMonth()?ds[ds.length-1].getDate():e4Fmt(ds[ds.length-1])):e4Fmt(ds[0]);return '<label class="e4-check"><input type="checkbox" data-e4-hotel="'+h+'" checked><span class="lc2-box" aria-hidden="true"></span><span><strong>'+esc(e4Hotels[h])+'</strong><small>'+l.length+' booking'+(l.length===1?'':'s')+' · checked out '+span+'</small></span><b data-amt="'+e4Sum(l)+'">'+e4Peso(e4Sum(l))+'</b></label>'};
  wrap.innerHTML='<div class="pf-sheet-backdrop" data-e4-close></div><section class="pf-sheet lc-sheet e4-sheet" role="dialog" aria-label="Request payout"><header><h2>Request payout</h2><button type="button" data-e4-close aria-label="Close">×</button></header><p class="e4-help">Each hotel pays its own room charges. We’ll notify the front desk.</p><div class="e4-checks">'+hotels.map(rowFor).join('')+'</div><div class="e4-total"><span>Total</span><b data-e4-total></b></div>'+paPayToRow()+'<button type="button" class="button primary e4-wide" data-e4-send>Send request</button></section>';
  document.body.appendChild(wrap);
  const sync=()=>{const on=[...wrap.querySelectorAll('[data-e4-hotel]')].filter(i=>i.checked);wrap.querySelector('[data-e4-total]').textContent=e4Peso(on.reduce((a,i)=>a+Number(i.closest('label').querySelector('b').dataset.amt),0));wrap.querySelector('[data-e4-send]').disabled=!on.length||!paDefault()};
  wrap.querySelectorAll('[data-e4-hotel]').forEach(i=>i.onchange=sync);sync();
  wrap.onkeydown=e=>{if(e.key==='Escape')lcSheetClose()};
  wrap.onclick=e=>{
    if(e.target.closest('[data-e4-close]')){lcSheetClose();return}
    if(!e.target.closest('[data-e4-send]'))return;
    const m=e4Model(),picked=[...wrap.querySelectorAll('[data-e4-hotel]')].filter(i=>i.checked).map(i=>i.dataset.e4Hotel);if(!picked.length)return;
    picked.forEach(h=>{const l=m.bookings.filter(b=>b.stage==='ready'&&b.hotel===h);m.bookings=m.bookings.filter(b=>!(b.stage==='ready'&&b.hotel===h));m.requests.push({id:'RQ'+Date.now().toString().slice(-5)+h.slice(0,2),hotel:h,date:'Oct 10',account:paLabel(paDefault()),bookings:l.map(({stage,...b})=>b)})});
    e4Save();lcSheetClose();render();toast('Payout requested');
  };
}
/* Date range sheet with presets + custom calendar */
function e4RangeSheet(){
  lcSheetClose();const cur=state.e4Range||{preset:'Last 30 days'},wrap=document.createElement('div');wrap.className='lc-sheet-wrap';
  let pick={start:cur.preset==='Custom'?cur.start:null,end:cur.preset==='Custom'?cur.end:null},month=cur.preset==='Custom'?new Date(cur.end):e4Today();month=new Date(month.getFullYear(),month.getMonth(),1);
  const presets=['Today','Last 7 days','Last 30 days','This month','Last month','Custom range'];
  const list=()=>'<div class="lc-sheet-list" role="listbox">'+presets.map(p=>{const key=p==='Custom range'?'Custom':p,on=cur.preset===key;return '<button type="button" role="option" aria-selected="'+on+'" class="'+(on?'is-selected':'')+'" data-e4-preset="'+key+'"><span>'+p+(key==='Custom'&&on?' · '+e4Range(cur).label:'')+'</span>'+(on?'<i class="hgi-stroke hgi-tick-02" aria-hidden="true"></i>':(key==='Custom'?'<i class="vi2-sheet-chev" aria-hidden="true">›</i>':''))+'</button>'}).join('')+'</div>';
  const cal=()=>{
    const y=month.getFullYear(),mo=month.getMonth(),first=(new Date(y,mo,1).getDay()+6)%7,days=new Date(y,mo+1,0).getDate(),s=pick.start?new Date(pick.start):null,e=pick.end?new Date(pick.end):null,today=e4Today(),min=new Date(2026,5,1);
    let cells='';for(let i=0;i<first;i++)cells+='<span></span>';
    for(let d=1;d<=days;d++){const dt=new Date(y,mo,d),future=dt>today||dt<min,isS=s&&+dt===+s,isE=e&&+dt===+e,mid=s&&e&&dt>s&&dt<e;cells+='<button type="button" class="e4-day'+(isS||isE?' is-end':'')+(mid?' is-mid':'')+(isS&&e?' is-start':'')+(isE&&s?' is-last':'')+'" data-e4-day="'+dt.toISOString()+'"'+(future?' disabled':'')+'>'+d+'</button>'}
    const summary=s&&e?e4Fmt(s)+' – '+e4Fmt(e)+', '+e.getFullYear():s?e4Fmt(s)+' – pick an end date':'Pick a start date';
    return '<p class="e4-cal-sum">'+summary+'</p><div class="e4-cal"><div class="e4-cal-head"><strong>'+e4M[mo]+' '+y+'</strong><div><button type="button" data-e4-month="-1" aria-label="Previous month"'+(new Date(y,mo,1)<=min?' disabled':'')+'>‹</button><button type="button" data-e4-month="1" aria-label="Next month"'+(y===2026&&mo>=9?' disabled':'')+'>›</button></div></div><div class="e4-cal-week">'+['M','T','W','T','F','S','S'].map(x=>'<span>'+x+'</span>').join('')+'</div><div class="e4-cal-grid">'+cells+'</div></div><div class="e4-cal-foot"><button type="button" class="e4-clear" data-e4-clear>Clear</button><button type="button" class="button primary" data-e4-apply'+(s&&e?'':' disabled')+'>Apply</button></div>';
  };
  const show=mode=>{wrap.innerHTML='<div class="pf-sheet-backdrop" data-e4-close></div><section class="pf-sheet lc-sheet lc-dd-sheet e4-range-sheet" role="dialog" aria-label="Date range"><header><h2>'+(mode==='cal'?'Custom range':'Date range')+'</h2><button type="button" data-e4-close aria-label="Close">×</button></header>'+(mode==='cal'?cal():list())+'</section>';wrap.dataset.mode=mode};
  show('list');document.body.appendChild(wrap);
  const apply=r=>{state.e4Range=r;state.enLimit=20;lcSheetClose();const sc=document.querySelector('.page')?.scrollTop||0;render();const p=document.querySelector('.page');if(p)p.scrollTop=sc};
  wrap.onkeydown=e=>{if(e.key==='Escape')lcSheetClose()};
  wrap.onclick=e=>{
    if(e.target.closest('[data-e4-close]')){lcSheetClose();return}
    const pr=e.target.closest('[data-e4-preset]');if(pr){if(pr.dataset.e4Preset==='Custom'){show('cal');return}apply({preset:pr.dataset.e4Preset});return}
    const mv=e.target.closest('[data-e4-month]');if(mv&&!mv.disabled){month=new Date(month.getFullYear(),month.getMonth()+Number(mv.dataset.e4Month),1);show('cal');return}
    const day=e.target.closest('[data-e4-day]');if(day&&!day.disabled){const d=day.dataset.e4Day;if(!pick.start||pick.end){pick={start:d,end:null}}else if(new Date(d)<new Date(pick.start)){pick={start:d,end:pick.start}}else pick.end=d;show('cal');return}
    if(e.target.closest('[data-e4-clear]')){pick={start:null,end:null};show('cal');return}
    if(e.target.closest('[data-e4-apply]')&&pick.start&&pick.end)apply({preset:'Custom',start:pick.start,end:pick.end});
  };
}
/* Export sheet */
function e4ExportSheet(){
  lcSheetClose();const r=state.e4Range||{preset:'Last 30 days'},x=e4Range(r);
  let period=r.preset==='This month'||r.preset==='Last month'?r.preset:'Custom',format='pdf';
  const wrap=document.createElement('div');wrap.className='lc-sheet-wrap';
  const draw=()=>{wrap.innerHTML='<div class="pf-sheet-backdrop" data-e4-close></div><section class="pf-sheet lc-sheet e4-sheet" role="dialog" aria-label="Export earnings"><header><h2>Export earnings</h2><button type="button" data-e4-close aria-label="Close">×</button></header><span class="e4-label">Period</span><div class="e3-chips">'+['This month','Last month','Last 3 months','Custom'].map(p=>'<button type="button" class="e3-chip'+(period===p?' is-on':'')+'" data-e4-period="'+p+'">'+p+'</button>').join('')+'</div>'+(period==='Custom'?'<small class="e4-period-dates">'+x.sub+'</small>':'')
    +'<span class="e4-label">Format</span><div class="e4-formats">'+[['pdf','PDF statement','To share or print'],['csv','Spreadsheet (CSV)','Every booking, for your records']].map(([k,t,s])=>'<label class="e4-format'+(format===k?' is-on':'')+'"><input type="radio" name="e4fmt" value="'+k+'"'+(format===k?' checked':'')+' data-e4-format><span class="e4-radio" aria-hidden="true"></span><span><strong>'+t+'</strong><small>'+s+'</small></span></label>').join('')+'</div><button type="button" class="button primary e4-wide" data-e4-export>Export</button></section>'};
  draw();document.body.appendChild(wrap);
  wrap.onkeydown=e=>{if(e.key==='Escape')lcSheetClose()};
  wrap.onclick=e=>{
    if(e.target.closest('[data-e4-close]')){lcSheetClose();return}
    const p=e.target.closest('[data-e4-period]');if(p){period=p.dataset.e4Period;draw();return}
    const f=e.target.closest('[data-e4-format]');if(f){format=f.value;draw();return}
    if(e.target.closest('[data-e4-export]')){lcSheetClose();toast((format==='pdf'?'PDF statement':'CSV file')+' is ready · '+(period==='Custom'?x.sub:period))}
  };
}
const e4OpenFrontDesk=hotel=>{
  const name=e4Hotels[hotel];const thread=(typeof cxThreads!=='undefined'?cxThreads:[]).find(t=>t.kind==='frontdesk'&&(t.hotel===name||t.name===name))||(typeof cxThreads!=='undefined'?cxThreads.find(t=>t.kind==='frontdesk'):null);
  state.page='chat';render();if(thread&&typeof cxOpenThread==='function')cxOpenThread(thread.id);
};
window.addEventListener('click',event=>{
  const t=event.target;
  const req=t.closest?.('[data-e4-request]');
  if(req){event.preventDefault();event.stopImmediatePropagation();if(!req.disabled)e4RequestSheet();return}
  if(state.page!=='earnings')return;
  const open=t.closest?.('[data-e4-open]'),range=t.closest?.('[data-e4-range]'),chip=t.closest?.('[data-e4-chip]'),msg=t.closest?.('[data-e4-message]'),exp=t.closest?.('[data-e4-export-open]');
  if(!open&&!range&&!chip&&!msg&&!exp)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(range)return e4RangeSheet();
  if(exp)return e4ExportSheet();
  if(msg)return e4OpenFrontDesk(msg.dataset.e4Message);
  if(chip){state.e4PayFilter=chip.dataset.e4Chip;state.enLimit=20}
  if(open){state.e4Sub=open.dataset.e4Open;state.enLimit=20;if(state.e4Sub==='payments')state.e4PayFilter='all'}
  render();if(open){const p=document.querySelector('.page');if(p)p.scrollTop=0}
},true);
document.addEventListener('scroll',event=>{
  if(state.page!=='earnings'||state.e4Sub!=='payments')return;const p=event.target;if(!(p instanceof Element)||!p.classList.contains('page'))return;
  if(p.scrollTop+p.clientHeight>=p.scrollHeight-120&&document.querySelector('[data-e4-more]')){const sc=p.scrollTop;state.enLimit=(state.enLimit||20)+20;render();const q=document.querySelector('.page');if(q)q.scrollTop=sc}
},true);
const renderBeforeE4=render;
render=function(){
  if(state.page!=='earnings'&&state.page!=='orders')state.e4Sub=null;
  state.enSub=null;
  renderBeforeE4.apply(this,arguments);
  if(state.page!=='earnings'||state.role!=='Owner')return;
  const page=document.querySelector('.page');if(page&&!page.querySelector('.e4'))page.innerHTML=window.cabanaEarningsPage();
  const bar=document.querySelector('.topbar');if(!bar)return;
  const [kind,id]=String(state.e4Sub||'').split(':'),m=e4Model();
  const title=bar.querySelector('.topbar-context strong, h1');
  if(title){let tx='Earnings';if(kind==='checkout')tx='Awaiting checkout';else if(kind==='payments')tx='Payment history';else if(kind==='request'||kind==='payout'){tx='Payout request'}title.textContent=tx}
  bar.querySelectorAll('[data-e4-export-open],[data-e4-bar-range]').forEach(n=>n.remove());
  if(state.e4Sub==='payments'){const pill=document.createElement('button');pill.type='button';pill.className='vi2-range e3-pill';pill.setAttribute('data-e4-range','');pill.setAttribute('data-e4-bar-range','');pill.setAttribute('aria-haspopup','dialog');pill.innerHTML='<span>'+e4Range().label+'</span><i aria-hidden="true">▾</i>';bar.appendChild(pill)}
  if(!state.e4Sub&&!(typeof e4HotelIds==='function'&&e4HotelIds().length>1)){const b=document.createElement('button');b.type='button';b.className='e4-export';b.setAttribute('data-e4-export-open','');b.setAttribute('aria-label','Export');b.innerHTML='<i class="hgi-stroke hgi-download-04" aria-hidden="true"></i>';bar.appendChild(b)}
  const back=bar.querySelector('[data-profile-back]');
  if(back&&state.e4Sub){back.onclick=()=>{state.e4Sub=null;render();const p=document.querySelector('.page');if(p)p.scrollTop=0}}
};
/* Request details for every booking in the model */
(function(){if(typeof orders==='undefined'||!orders.length)return;const base=orders[0],m=e4Model(),add=(b,o)=>{if(orders.some(x=>x.id===b.id))return;orders.push({...JSON.parse(JSON.stringify(base)),id:b.id,guest:b.guest||'Guest',room:b.room,item:b.item||'Booking',quantity:'1 booking',when:(b.out||b.until||'Oct 10')+' · 9:00 AM',total:e4Peso(b.amount)+'.00',payment:'Charged to room',timeline:[['Booking requested',(b.out||b.until||'Oct 10')]],notes:'',contact:'Open guest chat',...o})};
  m.bookings.forEach(b=>add(b,{status:b.stage==='checkout'?'Confirmed':'Completed',settlement:b.stage==='checkout'?'Awaiting guest checkout':'Ready to request'}));
  m.requests.forEach(r=>r.bookings.forEach(b=>add(b,{status:'Completed',settlement:'Requested from '+e4Hotels[r.hotel]})));
  m.payouts.forEach(p=>p.bookings.forEach(b=>add(b,{status:'Completed',settlement:'Paid by '+e4Hotels[p.hotel]})));})();
/* Home › Receivables card */
dashboardOperationalReceivables=function(){
  if(state.role!=='Owner')return '';const t=e4Totals();if(!t.readyTotal&&!t.checkoutTotal&&!t.requested)return '';
  return '<section class="dashboard-operational-section dashboard-receivables e4-home"><h2>Receivables</h2><strong class="e4-home-amt">'+e4Peso(t.readyTotal)+'</strong><span class="e4-home-label">Available for payout</span>'+(t.checkoutTotal?'<small class="e4-home-later">'+e4Peso(t.checkoutTotal)+' after checkout</small>':'')+'<button type="button" class="vi2-foot e4-home-foot dashboard-inline-link"><span>View earnings</span><i aria-hidden="true">›</i></button></section>';
};
render();

function e4StayRange(list){const ds=list.map(b=>e4Date(b.out)).sort((a,b)=>a-b);if(!ds.length)return '';const a=ds[0],b=ds[ds.length-1];return +a===+b?e4Fmt(a):e4Fmt(a)+' – '+(a.getMonth()===b.getMonth()?b.getDate():e4Fmt(b))}
window.addEventListener('click',event=>{const pill=event.target.closest?.('.topbar [data-e4-bar-range]');if(!pill||state.page!=='earnings')return;event.preventDefault();event.stopImmediatePropagation();e4RangeSheet()},true);

/* Business renamed to Lakbay Negros Rentals: update any saved copies of the old name/logo. */
(function(){try{
  if(state.businessProfile&&/Cabana Transport/.test(state.businessProfile.name||'')){state.businessProfile.name='Lakbay Negros Rentals';localStorage.setItem('cabana:business-profile',JSON.stringify(state.businessProfile))}
  if(state.businessProfile&&/cabanatransport\.com/.test(state.businessProfile.email||'')){state.businessProfile.email=state.businessProfile.email.replace('cabanatransport.com','lakbaynegros.com');localStorage.setItem('cabana:business-profile',JSON.stringify(state.businessProfile))}
  if(!state.businessLogo||/cabana-transport-logo\.svg/.test(state.businessLogo))state.businessLogo='assets/brand/lakbay-negros-logo.svg';
}catch(e){}})();
render();

/* Bookings: in-progress samples dated today, so "Mark as completed" is available. */
(function(){
  const M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],now=new Date(),d=M[now.getMonth()]+' '+now.getDate(),t=new Date(now.getTime()+864e5),d2=M[t.getMonth()]+' '+t.getDate();
  const hotel='Henry’s Resort Dumaguete';
  const rows=[
    {id:'BK-9010',kind:'Booking',guest:'Andrea Villanueva',hotel,room:'412',item:'Airport Transfer — Sedan',quantity:'2 passengers · 2 suitcases',when:d+' · 8:30 AM',fulfilment:'Pickup: '+hotel+' lobby · Destination: Dumaguete–Sibulan Airport',total:'₱1,800.00',payment:'Charged to room',settlement:'Awaiting guest checkout',status:'In progress',timeline:[['Booking confirmed',d+' · 7:10 AM'],['In progress',d+' · 8:25 AM']],notes:'Flight PR 2542 at 10:15 AM.'},
    {id:'BK-9011',kind:'Booking',guest:'Kenji Morales',hotel,room:'218',item:'Van with Driver — Full Day',quantity:'8 passengers',when:d+' · 7:00 AM',fulfilment:'Pickup: '+hotel+' lobby · Apo Island tour and return',total:'₱3,500.00',payment:'Paid via gateway',settlement:'Paid by guest',status:'In progress',timeline:[['Booking confirmed',d.replace(/\d+$/,String(now.getDate()))+' · 6:15 AM'],['In progress',d+' · 7:05 AM']],notes:'Return to the hotel by 6:00 PM.'},
    {id:'BK-9012',kind:'Booking',guest:'Patricia Lim',hotel,room:'305',item:'Toyota Innova Rental',quantity:'1 vehicle',when:d+' · 9:00 AM – '+d2+' · 9:00 AM',fulfilment:'Pickup and return: '+hotel+' lobby',total:'₱3,200.00',payment:'Charged to room',settlement:'Awaiting guest checkout',status:'In progress',timeline:[['Booking confirmed',d+' · 8:00 AM'],['Vehicle handed over',d+' · 9:05 AM']],notes:'Return with a full tank.'}
  ];
  try{rows.forEach(r=>{if(!bookingPromptRecords.some(x=>x.id===r.id))bookingPromptRecords.push(r)})}catch(e){}
})();
render();

/* Bookings date filter: same ranges as Insights (Last 7 days, Last 30 days, This month, Last month, This year, Custom range). */
bookingLatestDateMatches=function(record,date,filters){
  if(!date||date==='All dates')return true;
  const current=bookingLatestRecordDate(record);if(!current)return false;
  const today=new Date();today.setHours(0,0,0,0);current.setHours(0,0,0,0);
  const between=(a,b)=>current>=a&&current<=b;
  if(date==='Last 7 days'||date==='Last 30 days'){const a=new Date(today);a.setDate(a.getDate()-(date==='Last 7 days'?6:29));return between(a,today)}
  if(date==='This month')return current.getFullYear()===today.getFullYear()&&current.getMonth()===today.getMonth();
  if(date==='Last month'){const a=new Date(today.getFullYear(),today.getMonth()-1,1),b=new Date(today.getFullYear(),today.getMonth(),0);return between(a,b)}
  if(date==='This year')return current.getFullYear()===today.getFullYear();
  if(date==='Today')return +current===+today;
  if(date==='Custom range…'){const from=filters?.customFrom?new Date(filters.customFrom+'T00:00:00'):null,to=filters?.customTo?new Date(filters.customTo+'T00:00:00'):null;return (!from||current>=from)&&(!to||current<=to)}
  return true;
};
if(state.bookingLatestFilters&&['Today','Tomorrow','This week'].includes(state.bookingLatestFilters.date))state.bookingLatestFilters.date='All dates';
const renderBeforeBookingDateLabels=render;
render=function(){
  renderBeforeBookingDateLabels.apply(this,arguments);
  document.querySelectorAll('.booking-filter-sheet .booking-choice-label').forEach(l=>{if(l.textContent==='Custom range…')l.textContent='Custom range'});
};
render();

/* ===== Partner hotels (Menu): list, hotel detail with per-listing visibility, invitation accept/decline. ===== */
function phSeed(){return [
  {id:'henrys',name:'Henry’s Resort Dumaguete',address:'Rizal Blvd, Dumaguete City',phone:'+63 35 225 1188',status:'active',since:'Aug 2026',color:'#1f5c5a',
    shown:{'airport-sedan':true,innova:true,'van-driver':true,'city-tour':true,'island-hopping':true},
    guidelines:['Pickups and drop-offs at the main lobby','No vehicle entry after 10 PM','Charge to room allowed']},
  {id:'luna',name:'Luna Bay Resort',address:'Dauin, Negros Oriental',phone:'+63 35 422 7710',status:'active',since:'Sep 2026',color:'#2b5ba8',
    shown:{'airport-sedan':true,innova:true,'island-hopping':true,'van-driver':false,'city-tour':false},
    guidelines:['Meet guests at the beach-side gate','Quiet hours from 9 PM','Charge to room allowed']},
  {id:'coral',name:'Coral Cove Hotel',address:'Valencia, Negros Oriental',phone:'+63 35 400 2234',status:'pending',invited:'Oct 9',color:'#b8742a',
    shown:{},guidelines:['Pickups at the driveway, not the lobby','Vehicles must display your business name','Online payments only, no charge to room']},
  {id:'bahura',name:'Bahura Resort & Spa',address:'Dauin, Negros Oriental',phone:'+63 35 425 0099',status:'paused',since:'Jul 2026',color:'#6b6368',
    shown:{'airport-sedan':true,'island-hopping':true},guidelines:['Pickups at the main lobby','Charge to room allowed']}
]}
function phHotels(){
  if(!state.phHotels){try{state.phHotels=JSON.parse(localStorage.getItem('cabana:partner-hotels')||'null')}catch(e){}if(!Array.isArray(state.phHotels))state.phHotels=phSeed()}
  return state.phHotels;
}
const phSave=()=>{try{localStorage.setItem('cabana:partner-hotels',JSON.stringify(state.phHotels))}catch(e){}};
const phBookable=()=>listings.filter(l=>l.status!=='Draft');
const phCount=h=>phBookable().filter(l=>h.shown[l.id]).length;
const phLogos={henrys:'assets/brand/hotels/henrys-photo.png',luna:'assets/brand/hotels/luna-photo.png',coral:'assets/brand/hotels/coral-photo.png',bahura:'assets/brand/hotels/bahura-photo.png'};
const phLogo=h=>'<span class="ph-logo" style="background:'+h.color+'">'+(phLogos[h.id]?'<img src="'+phLogos[h.id]+'" alt="">':esc(h.name.replace(/[’']s\b/,'').split(/\s+/).filter(w=>/^[A-Z]/.test(w)).slice(0,2).map(w=>w[0]).join('')))+'</span>';
const phStatus=h=>h.status==='active'?'<span class="ph-st is-active"><i></i>Active</span>':h.status==='pending'?'<span class="ph-st is-pending"><i></i>Invitation pending</span>':'<span class="ph-st is-paused"><i></i>Inactive</span>';
function phList(){
  const order={pending:0,active:1,paused:2},list=phHotels().slice().sort((a,b)=>order[a.status]-order[b.status]);
  if(!list.length)return '<div class="en e3 ph"><section class="en-card e3-empty"><strong>No partner hotels yet</strong><span>Hotels invite you to appear for their guests. Invitations will show up here.</span></section></div>';
  return '<div class="en e3 ph"><section class="en-card ph-list">'+list.map(h=>'<button type="button" class="ph-row" data-ph-open="'+h.id+'">'+phLogo(h)+'<span class="ph-txt"><strong>'+esc(h.name)+'</strong><small>'+phStatus(h)+(h.status==='active'?' · '+phCount(h)+' listing'+(phCount(h)===1?'':'s'):'')+'</small>'+(h.status==='paused'?'<em>Guests can’t book you here right now</em>':'')+'</span><i class="e3-chev" aria-hidden="true">›</i></button>').join('')+'</section></div>';
}
function phDetail(h){
  const pending=h.status==='pending',inactive=h.status==='paused',shown=phBookable();
  const head='<section class="en-card ph-head">'+phLogo(h)+'<div><strong>'+esc(h.name)+'</strong><small>'+esc(h.address)+'</small><span>'+phStatus(h)+(pending?' · Invited '+h.invited:' · Partner since '+h.since)+'</span></div></section>';
  const paused=inactive?'<div class="ph-note">This hotel is inactive. Guests can’t book you here right now.</div>':'';
  const contact=pending?'':inactive?'<div class="ph-actions"><button type="button" class="button primary ph-disabled" disabled aria-disabled="true"><i class="hgi-stroke hgi-message-01" aria-hidden="true"></i>Message front desk</button><button type="button" class="button ph-call ph-disabled" disabled aria-disabled="true"><i class="hgi-stroke hgi-call" aria-hidden="true"></i>Call</button></div>':'<div class="ph-actions"><button type="button" class="button primary" data-ph-message="'+h.id+'"><i class="hgi-stroke hgi-message-01" aria-hidden="true"></i>Message front desk</button><a class="button ph-call" href="tel:'+h.phone.replace(/\s/g,'')+'"><i class="hgi-stroke hgi-call" aria-hidden="true"></i>Call</a></div>';
  const lst=pending?'':'<div class="e4-sec"><h3>Listings shown here ('+phCount(h)+')</h3></div><section class="en-card ph-listings">'+shown.map(l=>{const on=Boolean(h.shown[l.id]);return '<div class="ph-li"><span><strong>'+esc(l.name)+'</strong>'+(l.status!=='Active'?'<small>Inactive in Listings</small>':'')+'</span>'+(state.role==='Owner'?'<button type="button" class="lcc-switch" role="switch" aria-checked="'+on+'"'+(inactive?' disabled aria-disabled="true"':'')+' data-ph-toggle="'+l.id+'" aria-label="Show '+esc(l.name)+' at '+esc(h.name)+'"><span></span></button>':'<em class="ph-onoff'+(on?' is-on':'')+'">'+(on?'Shown':'Hidden')+'</em>')+'</div>'}).join('')+'</section>';
  const rules='<div class="e4-sec"><h3>Hotel guidelines</h3></div><section class="en-card ph-rules"><ul>'+h.guidelines.map(g=>'<li>'+esc(g)+'</li>').join('')+'</ul></section>';
  const foot=pending&&state.role!=='Owner'?'<div class="ph-invite"><p>Waiting for the business owner to accept or decline this invitation.</p></div>':pending?'<div class="ph-invite"><p>Accept to show your listings to '+esc(h.name)+' guests. All your active listings will be shown, and you can turn them off any time.</p><div class="ph-actions"><button type="button" class="e4-outline" data-ph-decline>Decline</button><button type="button" class="button primary" data-ph-accept>Accept invitation</button></div></div>':'';
  return '<div class="en e3 ph'+(inactive?' is-inactive':'')+'">'+head+paused+contact+lst+rules+foot+'</div>';
}
window.cabanaPartnerHotelsPage=()=>{const h=state.phHotel&&phHotels().find(x=>x.id===state.phHotel);return h?phDetail(h):phList()};
const viewBeforePh=view;
view=function(){if(state.page==='photels'){try{return window.cabanaPartnerHotelsPage()}catch(e){console.error('Partner hotels render failed',e);return '<div class="ph"></div>'}}return viewBeforePh.apply(this,arguments)};
function phOpenChat(h){
  if(typeof cxThreads==='undefined')return;
  let t=cxThreads.find(x=>x.kind==='frontdesk'&&x.hotel===h.name);
  if(!t){t={id:'fd-'+h.id,kind:'frontdesk',hotel:h.name,name:h.name,role:'Front Desk',unread:0,messages:[]};cxThreads.push(t)}
  cxOpenThread(t.id);
}
window.addEventListener('click',event=>{
  const t=event.target;
  const menuRow=t.closest?.('[data-toast="Partner hotels opened"]');
  if(menuRow){event.preventDefault();event.stopImmediatePropagation();state.page='photels';state.phHotel=null;render();const p=document.querySelector('.page');if(p)p.scrollTop=0;return}
  if(state.page!=='photels')return;
  const open=t.closest?.('[data-ph-open]'),tog=t.closest?.('[data-ph-toggle]'),msg=t.closest?.('[data-ph-message]'),acc=t.closest?.('[data-ph-accept]'),dec=t.closest?.('[data-ph-decline]');
  if(!open&&!tog&&!msg&&!acc&&!dec)return;
  event.preventDefault();event.stopImmediatePropagation();
  const h=phHotels().find(x=>x.id===(state.phHotel||open?.dataset.phOpen));
  if(open){state.phHotel=open.dataset.phOpen;render();const p=document.querySelector('.page');if(p)p.scrollTop=0;return}
  if(!h)return;
  if(msg)return phOpenChat(h);
  if(tog){const id=tog.dataset.phToggle,on=!h.shown[id];h.shown[id]=on;phSave();const sc=document.querySelector('.page')?.scrollTop||0;render();const p=document.querySelector('.page');if(p)p.scrollTop=sc;toast((listings.find(l=>l.id===id)?.name||'Listing')+(on?' shown to ':' hidden from ')+h.name+' guests');return}
  if(acc){h.status='active';h.since='Oct 2026';h.shown={};phBookable().filter(l=>l.status==='Active').forEach(l=>{h.shown[l.id]=true});phSave();render();toast('You’re now a partner of '+h.name);return}
  if(dec)lccDialog({title:'Decline invitation?',body:h.name+' won’t be able to show your listings. They can invite you again later.',confirm:'Decline',danger:true,onConfirm:()=>{state.phHotels=phHotels().filter(x=>x.id!==h.id);phSave();state.phHotel=null;render();toast('Invitation declined')}});
},true);
const renderBeforePh=render;
render=function(){
  if(state.page!=='photels')state.phHotel=null;
  renderBeforePh.apply(this,arguments);
  if(state.page!=='photels')return;
  const page=document.querySelector('.page');if(page&&!page.querySelector('.ph'))page.innerHTML=window.cabanaPartnerHotelsPage();
  const bar=document.querySelector('.topbar');if(!bar)return;
  const h=state.phHotel&&phHotels().find(x=>x.id===state.phHotel);
  const title=bar.querySelector('.topbar-context strong, h1');if(title)title.textContent=h?h.name:'Partner hotels';
  let back=bar.querySelector('[data-profile-back]');
  if(!back){bar.classList.add('profile-topbar');back=document.createElement('button');back.type='button';back.className='profile-back';back.setAttribute('data-profile-back','');back.textContent='←';bar.prepend(back)}
  back.setAttribute('aria-label',h?'Back to Partner hotels':'Back to Menu');
  back.onclick=()=>{if(state.phHotel){state.phHotel=null}else state.page='menu';render();const p=document.querySelector('.page');if(p)p.scrollTop=0};
  document.querySelector('.dev-tools')?.setAttribute('hidden','');
  document.querySelectorAll('.bottom-nav [data-page="menu"], nav [data-page="menu"]').forEach(b=>b.classList.add('active'));
};
render();

/* Dev tools: visible on every page, draggable anywhere, position remembered. */
try{const saved=JSON.parse(localStorage.getItem('cabana:dev-position')||'null');if(saved&&typeof saved.left==='number')state.devPosition=saved}catch(e){}
const devPlace=()=>{
  let dev=document.querySelector('.dev-tools');
  if(!dev&&typeof devTools==='function'){(document.querySelector('.app-shell')||document.querySelector('#app'))?.insertAdjacentHTML('beforeend',devTools());dev=document.querySelector('.dev-tools')}
  if(!dev)return;
  dev.hidden=false;dev.removeAttribute('hidden');
  const trig=dev.querySelector('.dev-tools-trigger');if(trig){trig.onclick=null;trig.onpointerdown=null;trig.onpointermove=null;trig.onpointerup=null;trig.onpointercancel=null}
  dev.classList.toggle('open',Boolean(state.devOpen));
  const parent=dev.offsetParent||document.body,pw=parent.clientWidth,ph=parent.clientHeight;
  if(state.devPosition){const left=Math.max(4,Math.min(pw-dev.offsetWidth-4,state.devPosition.left)),top=Math.max(4,Math.min(ph-dev.offsetHeight-4,state.devPosition.top));devSetPos(dev,left,top)}
};
const renderBeforeDevAnywhere=render;
render=function(){renderBeforeDevAnywhere.apply(this,arguments);devPlace()};
(function(){
  let drag=null,suppressClick=false;
  document.addEventListener('pointerdown',e=>{
    const trigger=e.target.closest?.('.dev-tools-trigger');if(!trigger)return;
    const dev=trigger.closest('.dev-tools'),parent=dev.offsetParent||document.body,pr=parent.getBoundingClientRect(),dr=dev.getBoundingClientRect();
    drag={dev,parent,pr,sx:e.clientX,sy:e.clientY,ox:dr.left-pr.left,oy:dr.top-pr.top,moved:false,id:e.pointerId};
  },true);
  document.addEventListener('pointermove',e=>{
    if(!drag)return;const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;
    if(!drag.moved&&Math.abs(dx)<4&&Math.abs(dy)<4)return;
    drag.moved=true;e.preventDefault();e.stopImmediatePropagation();
    const pw=drag.parent.clientWidth,ph=drag.parent.clientHeight,d=drag.dev;
    const left=Math.max(4,Math.min(pw-d.offsetWidth-4,drag.ox+dx)),top=Math.max(4,Math.min(ph-d.offsetHeight-4,drag.oy+dy));
    devSetPos(d,left,top);d.classList.remove('open');state.devOpen=false;
    state.devPosition={left,top};
  },{capture:true,passive:false});
  const end=e=>{if(!drag)return;if(drag.moved){suppressClick=true;try{localStorage.setItem('cabana:dev-position',JSON.stringify(state.devPosition))}catch(err){}setTimeout(()=>{suppressClick=false},250)}drag=null};
  document.addEventListener('pointerup',end,true);document.addEventListener('pointercancel',end,true);
  document.addEventListener('click',e=>{if(suppressClick&&e.target.closest?.('.dev-tools-trigger')){e.preventDefault();e.stopImmediatePropagation();suppressClick=false}},true);
  window.addEventListener('resize',devPlace);
})();
render();

function devSetPos(el,left,top){el.style.setProperty('left',left+'px','important');el.style.setProperty('top',top+'px','important');el.style.setProperty('right','auto','important');el.style.setProperty('bottom','auto','important')}
/* Dev tools buttons work even where the page didn't bind them. */
document.addEventListener('click',e=>{
  const trig=e.target.closest?.('.dev-tools-trigger');
  if(trig){e.preventDefault();state.devOpen=!state.devOpen;trig.closest('.dev-tools').classList.toggle('open',state.devOpen);return}
  if(state.devOpen&&!e.target.closest?.('.dev-tools')){state.devOpen=false;document.querySelector('.dev-tools')?.classList.remove('open')}
  const role=e.target.closest?.('.dev-tools [data-role]');
  if(role&&!role.onclick){e.preventDefault();state.role=role.dataset.role;render()}
});
render();

/* ===== Payout account (Menu › Payout account): saved accounts, add/edit flow, used by Request payout. ===== */
const paBanks=['BDO Unibank','BPI','Metrobank','UnionBank','Landbank','Security Bank'];
function paShort(a){return a.type==='bank'?({'BDO Unibank':'BDO'}[a.bank]||a.bank.split(' ')[0]):a.type==='gcash'?'GCash':'Maya'}
function paLast4(a){return String(a.number||'').replace(/\D/g,'').slice(-4)}
function paLabel(a){return a?paShort(a)+' •••• '+paLast4(a):''}
function paAccounts(){
  if(!state.paAccounts){try{state.paAccounts=JSON.parse(localStorage.getItem('cabana:payout-accounts')||'null')}catch(e){}
    if(!Array.isArray(state.paAccounts))state.paAccounts=[{id:'acc-bdo',type:'bank',bank:'BDO Unibank',name:'Lakbay Negros Rentals Inc.',number:'0012 3456 4821',default:true,added:'Oct 2, 2026'},{id:'acc-gcash',type:'gcash',bank:'GCash',name:'Lakbay Negros Rentals Inc.',number:'0917 555 7712',default:false,added:'Sep 18, 2026'}]}
  state.paAccounts.forEach(a=>{if(a.id==='acc-gcash'&&a.name==='Lakbay Negros Rentals')a.name='Lakbay Negros Rentals Inc.';if(!a.added)a.added=a.id==='acc-bdo'?'Oct 2, 2026':a.id==='acc-gcash'?'Sep 18, 2026':'Oct 12, 2026'})
  return state.paAccounts;
}
function paSave(){try{localStorage.setItem('cabana:payout-accounts',JSON.stringify(state.paAccounts))}catch(e){}}
function paDefault(){const l=paAccounts();return l.find(a=>a.default)||l[0]||null}
function paBadge(a){
  const image=a.type==='bank'&&a.bank==='BDO Unibank'?'assets/brand/bdo.png':a.type==='gcash'?'assets/brand/gcash.png':'';
  return image
    ? '<span class="pa-badge is-image is-'+a.type+'"><img src="'+image+'" alt="'+esc(a.type==='gcash'?'GCash':'BDO Unibank')+' logo"></span>'
    : '<span class="pa-badge is-'+a.type+'">'+(a.type==='bank'?esc(paShort(a)):a.type==='gcash'?'G':'M')+'</span>';
}
const paBusiness=()=>{try{return pf3Business().name||'Lakbay Negros Rentals'}catch(e){return 'Lakbay Negros Rentals'}};
const paNameOk=n=>{const norm=x=>String(x||'').toLowerCase().replace(/\b(inc|corp|corporation|co|ltd)\b\.?/g,'').replace(/[^a-z0-9]/g,'');const b=norm(paBusiness()),v=norm(n);return !!v&&(v.includes(b)||b.includes(v))};
function paPayToRow(){
  const a=paDefault();
  return a?'<button type="button" class="pa-payto" data-pa-change><span class="pa-payto-l">Pay to</span>'+paBadge(a)+'<span class="pa-payto-name">'+esc(a.type==='bank'?a.bank:paShort(a))+' •••• '+paLast4(a)+'</span><span class="pa-link">Change ›</span></button>'
    :'<button type="button" class="pa-payto is-empty" data-pa-add-from-sheet><span class="pa-payto-l">Pay to</span><span class="pa-link">Add payout account ›</span></button>';
}
function paPicker(){
  const list=paAccounts(),wrap=document.createElement('div');wrap.className='lc-sheet-wrap pa-picker';
  wrap.innerHTML='<div class="pf-sheet-backdrop" data-pa-pclose></div><section class="pf-sheet lc-sheet lc-dd-sheet" role="dialog" aria-label="Pay to"><header><h2>Pay to</h2><button type="button" data-pa-pclose aria-label="Close">×</button></header><div class="lc-sheet-list" role="listbox">'+list.map(a=>'<button type="button" role="option" class="pa-opt'+(a.default?' is-selected':'')+'" data-pa-pick="'+a.id+'">'+paBadge(a)+'<span><strong>'+esc(a.type==='bank'?a.bank:paShort(a))+'</strong><small>'+esc(a.name)+' · •••• '+paLast4(a)+'</small></span>'+(a.default?'<i class="hgi-stroke hgi-tick-02" aria-hidden="true"></i>':'')+'</button>').join('')+'<button type="button" class="pa-opt pa-opt-add" data-pa-add-from-sheet><span class="pa-plus">+</span><span><strong>Add payout account</strong></span></button></div></section>';
  document.body.appendChild(wrap);
  wrap.onclick=e=>{
    if(e.target.closest('[data-pa-pclose]')){wrap.remove();return}
    const pick=e.target.closest('[data-pa-pick]');if(pick){paAccounts().forEach(a=>a.default=a.id===pick.dataset.paPick);paSave();wrap.remove();const row=document.querySelector('.e4-sheet .pa-payto');if(row)row.outerHTML=paPayToRow();const send=document.querySelector('.e4-sheet [data-e4-send]');if(send){const boxes=[...document.querySelectorAll('.e4-sheet [data-e4-hotel]')];send.disabled=(boxes.length&&!boxes.some(i=>i.checked))||!paDefault()}toast('Payouts will go to '+paLabel(paDefault()))}
  };
}
function paList(){
  const list=paAccounts();
  return '<div class="en e3 pa">'
    +'<section class="en-card pa-list">'+(list.length?list.map(a=>'<button type="button" class="pa-row" data-pa-open="'+a.id+'">'+paBadge(a)+'<span class="pa-txt"><strong>'+esc(a.type==='bank'?a.bank:paShort(a))+(a.default?' <em class="pa-default">Default</em>':'')+'</strong><small>'+esc(a.name)+' · •••• '+paLast4(a)+'</small></span><i class="e3-chev" aria-hidden="true">›</i></button>').join(''):'<div class="e3-empty pa-empty"><strong>No payout account yet</strong><span>Add one so hotels can pay your room charges.</span></div>')+'<button type="button" class="vi2-foot pa-add-row" data-pa-add><span><b>+</b> Add payout account</span></button></section>'
    +'</div>';
}
function paDetail(a){
  const only=paAccounts().length===1;
  return '<div class="en e3 pa"><section class="en-card pa-head">'+paBadge(a)+'<div><strong>'+esc(a.type==='bank'?a.bank:paShort(a))+(a.default?' <em class="pa-default">Default</em>':'')+'</strong></div></section>'
    +'<section class="en-card pa-fields"><div><span>Account name</span><b>'+esc(a.name)+'</b></div><div><span>'+(a.type==='bank'?'Account number':'Mobile number')+'</span><b>•••• '+paLast4(a)+'</b></div><div><span>Type</span><b>'+(a.type==='bank'?'Bank account':paShort(a))+'</b></div></section>'
    +(paNameOk(a.name)?'':'<div class="pa-warn">This account name doesn’t match '+esc(paBusiness())+'. Hotels may hold payouts to accounts under a different name.</div>')
    +'<div class="pa-actions">'+(a.default?'':'<button type="button" class="button primary e4-wide" data-pa-default>Set as default</button>')+'<button type="button" class="e4-outline" data-pa-edit>Edit</button>'
    +'<button type="button" class="pa-remove" data-pa-remove'+(a.default&&!only?' disabled':'')+'>Remove account</button>'+'</div>'
    +'</div>';
}
function paFlow(){
  const f=state.paFlow,d=f.data,step=f.step;
  const bar='<div class="lc-bars pa-bars" aria-hidden="true">'+[1,2,3,4].map(n=>'<span class="'+(n<=step?'is-done':'')+'"></span>').join('')+'</div>';
  let body='';
  if(step===1)body='<h3 class="pa-h">Where should hotels send your payouts?</h3><div class="pa-types">'+[['bank','Bank account','BDO, BPI, Metrobank and more'],['gcash','GCash','Your GCash mobile number'],['maya','Maya','Your Maya mobile number']].map(([k,t,sub])=>'<button type="button" class="pa-type'+(d.type===k?' is-on':'')+'" data-pa-type="'+k+'"><span class="pa-badge is-'+k+'">'+(k==='bank'?'<i class="hgi-stroke hgi-bank" aria-hidden="true"></i>':k==='gcash'?'G':'M')+'</span><span><strong>'+t+'</strong><small>'+sub+'</small></span><i class="e3-chev" aria-hidden="true">›</i></button>').join('')+'</div>';
  if(step===2){
    const err=f.errors||{},field=(k,label,val,attrs)=>'<label class="biz-field"><span>'+label+'</span><input data-pa-field="'+k+'" value="'+esc(val||'')+'" '+attrs+'>'+(err[k]?'<small class="pa-err">'+err[k]+'</small>':'')+'</label>';
    body='<h3 class="pa-h">'+(d.type==='bank'?'Bank account details':(d.type==='gcash'?'GCash':'Maya')+' details')+'</h3>'
      +(d.type==='bank'?'<span class="pa-label">Bank</span><div class="e3-chips pa-banks">'+paBanks.map(b=>'<button type="button" class="e3-chip'+(d.bank===b?' is-on':'')+'" data-pa-bank="'+esc(b)+'">'+esc(b)+'</button>').join('')+'</div>'+(err.bank?'<small class="pa-err">'+err.bank+'</small>':''):'')
      +'<section class="acct-list biz-form pa-form">'+field('name','Account name',d.name,'autocomplete="name"')+field('number',d.type==='bank'?'Account number':'Mobile number',d.number,'inputmode="numeric" autocomplete="off"')+'</section>'
      +(d.name&&!paNameOk(d.name)?'<div class="pa-warn">This name doesn’t match '+esc(paBusiness())+'. Use the name on your business account if you can.</div>':'');
  }
  if(step===3)body='<h3 class="pa-h">Review</h3><section class="en-card pa-fields"><div><span>Type</span><b>'+(d.type==='bank'?'Bank account':d.type==='gcash'?'GCash':'Maya')+'</b></div>'+(d.type==='bank'?'<div><span>Bank</span><b>'+esc(d.bank)+'</b></div>':'')+'<div><span>Account name</span><b>'+esc(d.name)+'</b></div><div><span>'+(d.type==='bank'?'Account number':'Mobile number')+'</span><b>'+esc(d.number)+'</b></div></section>'
    +(paNameOk(d.name)?'':'<div class="pa-warn">The account name doesn’t match '+esc(paBusiness())+'. Hotels may hold payouts to accounts under a different name.</div>')
    +'<label class="pa-check"><input type="checkbox" data-pa-setdefault'+(d.setDefault?' checked':'')+'><span class="lc2-box" aria-hidden="true"></span><span>Use as default payout account</span></label>';
  if(step===4)body='<h3 class="pa-h">Enter the 6-digit code</h3><p class="pa-sub">We sent a code to +63 917 •••• 182 to confirm it’s you.</p><input class="pa-otp" data-pa-otp inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="••••••" value="'+esc(f.otp||'')+'">'+(f.errors&&f.errors.otp?'<small class="pa-err">'+f.errors.otp+'</small>':'')+'<button type="button" class="pa-resend" data-pa-resend>Resend code</button>';
  const next=step===1?'':'<div class="pa-foot"><button type="button" class="button primary e4-wide" data-pa-next>'+(step===2?'Review':step===3?'Continue':'Save account')+'</button></div>';
  return '<div class="en e3 pa pa-flow">'+bar+body+next+'</div>';
}
window.cabanaPayoutAccountPage=()=>{if(state.paFlow)return paFlow();const a=state.paSub&&paAccounts().find(x=>x.id===state.paSub);return a?paDetail(a):paList()};
const viewBeforePa=view;
view=function(){if(state.page==='payacct'){try{return window.cabanaPayoutAccountPage()}catch(e){console.error('Payout account render failed',e);return '<div class="pa"></div>'}}return viewBeforePa.apply(this,arguments)};
const paGo=(opts={})=>{Object.assign(state,{page:'payacct',paSub:null,paFlow:null},opts);render();const p=document.querySelector('.page');if(p)p.scrollTop=0};
const paStartFlow=(edit,returnTo)=>{const a=edit?paAccounts().find(x=>x.id===edit):null;paGo({paSub:edit||null,paReturn:returnTo||null,paFlow:{step:a?2:1,editId:edit||null,data:a?{type:a.type,bank:a.bank,name:a.name,number:a.number,setDefault:a.default}:{type:null,bank:null,name:'',number:'',setDefault:!paAccounts().length}}})};
const paReadFields=()=>{const f=state.paFlow;document.querySelectorAll('[data-pa-field]').forEach(i=>{f.data[i.dataset.paField]=i.value.trim()})};
window.addEventListener('click',event=>{
  const t=event.target;
  const menu=t.closest?.('[data-toast="Payout account settings opened"]');
  if(menu){event.preventDefault();event.stopImmediatePropagation();if(state.role!=='Owner'){toast('Payout account is for the business owner');return}paGo({paReturn:null});return}
  const change=t.closest?.('.e4-sheet [data-pa-change]');if(change){event.preventDefault();event.stopImmediatePropagation();paPicker();return}
  const addSheet=t.closest?.('[data-pa-add-from-sheet]');if(addSheet){event.preventDefault();event.stopImmediatePropagation();document.querySelectorAll('.pa-picker').forEach(n=>n.remove());lcSheetClose();paStartFlow(null,'earnings');return}
  if(state.page!=='payacct')return;
  const f=state.paFlow,open=t.closest?.('[data-pa-open]'),add=t.closest?.('[data-pa-add]'),setD=t.closest?.('[data-pa-default]'),edit=t.closest?.('[data-pa-edit]'),rem=t.closest?.('[data-pa-remove]'),type=t.closest?.('[data-pa-type]'),bank=t.closest?.('[data-pa-bank]'),next=t.closest?.('[data-pa-next]'),resend=t.closest?.('[data-pa-resend]'),chk=t.closest?.('[data-pa-setdefault]');
  if(!open&&!add&&!setD&&!edit&&!rem&&!type&&!bank&&!next&&!resend&&!chk)return;
  if(chk){state.paFlow.data.setDefault=chk.checked;return}
  event.preventDefault();event.stopImmediatePropagation();
  if(open)return paGo({paSub:open.dataset.paOpen});
  if(add)return paStartFlow(null,null);
  const acc=state.paSub&&paAccounts().find(x=>x.id===state.paSub);
  if(setD&&acc){paAccounts().forEach(a=>a.default=a.id===acc.id);paSave();render();toast(paLabel(acc)+' is now your default');return}
  if(edit&&acc)return paStartFlow(acc.id,null);
  if(rem&&acc&&!rem.disabled){lccDialog({title:'Remove this account?',body:paLabel(acc)+' won’t receive new payouts.',confirm:'Remove',danger:true,onConfirm:()=>{state.paAccounts=paAccounts().filter(a=>a.id!==acc.id);if(!state.paAccounts.some(a=>a.default)&&state.paAccounts[0])state.paAccounts[0].default=true;paSave();paGo({paSub:null});toast('Account removed')}});return}
  if(type){f.data.type=type.dataset.paType;f.data.bank=f.data.type==='bank'?f.data.bank:null;f.step=2;f.errors=null;render();setTimeout(()=>document.querySelector('[data-pa-field="name"]')?.focus(),30);return}
  if(bank){paReadFields();f.data.bank=bank.dataset.paBank;render();return}
  if(resend){toast('New code sent');return}
  if(next){
    if(f.step===2){paReadFields();const e={},digits=f.data.number.replace(/\D/g,'');if(f.data.type==='bank'&&!f.data.bank)e.bank='Choose your bank';if(!f.data.name)e.name='Enter the account name';if(f.data.type==='bank'?digits.length<10:!/^(09|639)\d{9}$/.test(digits))e.number=f.data.type==='bank'?'Enter a valid account number':'Enter an 11-digit mobile number, e.g. 0917 555 7712';f.errors=Object.keys(e).length?e:null;if(!f.errors)f.step=3;render();return}
    if(f.step===3){f.step=4;f.otp='';f.errors=null;render();setTimeout(()=>document.querySelector('[data-pa-otp]')?.focus(),30);return}
    if(f.step===4){const code=String(document.querySelector('[data-pa-otp]')?.value||'').replace(/\D/g,'');if(code.length!==6){f.otp=code;f.errors={otp:'Enter the 6-digit code'};render();return}
      const list=paAccounts();let a=f.editId&&list.find(x=>x.id===f.editId);
      if(a)Object.assign(a,{type:f.data.type,bank:f.data.type==='bank'?f.data.bank:(f.data.type==='gcash'?'GCash':'Maya'),name:f.data.name,number:f.data.number});
      else{a={id:'acc-'+Date.now(),type:f.data.type,bank:f.data.type==='bank'?f.data.bank:(f.data.type==='gcash'?'GCash':'Maya'),name:f.data.name,number:f.data.number,default:false};list.push(a)}
      if(f.data.setDefault||!list.some(x=>x.default))list.forEach(x=>x.default=x.id===a.id);
      paSave();const back=state.paReturn;state.paFlow=null;
      if(back==='earnings'){state.page='earnings';state.e4Sub=null;render();toast('Payout account saved');setTimeout(()=>{if(e4Totals().readyTotal)e4RequestSheet()},120);return}
      paGo({paSub:a.id});toast('Payout account saved');return}
  }
},true);
const renderBeforePa=render;
render=function(){
  if(state.page!=='payacct'){state.paFlow=null;state.paSub=null}
  renderBeforePa.apply(this,arguments);
  if(state.page!=='payacct')return;
  if(state.role!=='Owner'){state.page='menu';render();return}
  const page=document.querySelector('.page');if(page&&!page.querySelector('.pa'))page.innerHTML=window.cabanaPayoutAccountPage();
  const bar=document.querySelector('.topbar');if(!bar)return;
  const acc=state.paSub&&paAccounts().find(x=>x.id===state.paSub),f=state.paFlow;
  const title=bar.querySelector('.topbar-context strong, h1');
  if(title)title.textContent=f?'Add payout account':acc?'Payout account':'Payout accounts';
  let back=bar.querySelector('[data-profile-back]');
  if(!back){bar.classList.add('profile-topbar');back=document.createElement('button');back.type='button';back.className='profile-back';back.setAttribute('data-profile-back','');back.textContent='←';bar.prepend(back)}
  back.onclick=()=>{
    if(f){if(f.step>1&&!(f.editId&&f.step===2)){f.step--;f.errors=null;render();return}state.paFlow=null;if(state.paReturn==='earnings'){state.page='earnings';state.paReturn=null;render();setTimeout(()=>{if(e4Totals().readyTotal)e4RequestSheet()},120);return}render();return}
    if(state.paSub){state.paSub=null;render();return}
    state.page='menu';render();
  };
  document.querySelectorAll('.bottom-nav [data-page="menu"], nav [data-page="menu"]').forEach(b=>b.classList.add('active'));
};
render();

/* Menu row label: Payout accounts */
const renderBeforePaLabel=render;
render=function(){renderBeforePaLabel.apply(this,arguments);document.querySelectorAll('[data-toast="Payout account settings opened"]').forEach(r=>{r.childNodes.forEach(n=>{if(n.nodeType===3&&/Payout account\b/.test(n.nodeValue))n.nodeValue=n.nodeValue.replace(/Payout account\b(?!s)/,'Payout accounts')});r.querySelectorAll('span').forEach(sp=>{if(sp.textContent==='Payout account')sp.textContent='Payout accounts'})})};
render();

/* ===== Add / Edit payout account: one screen (bank or e-wallet → details → save → code sheet). ===== */
const pafProviders=[
  {id:'gcash',type:'gcash',name:'GCash',code:'G',color:'#0a6cff',wallet:true},
  {id:'maya',type:'maya',name:'Maya',code:'M',color:'#0b8f5a',wallet:true},
  {id:'BDO Unibank',type:'bank',name:'BDO Unibank',code:'BDO',color:'#1f3c88'},
  {id:'BPI',type:'bank',name:'BPI',code:'BPI',color:'#a3122a'},
  {id:'Landbank',type:'bank',name:'Landbank',code:'LBP',color:'#1d7a3a'},
  {id:'Metrobank',type:'bank',name:'Metrobank',code:'MB',color:'#23408e'},
  {id:'PNB',type:'bank',name:'PNB',code:'PNB',color:'#0b3a6e'},
  {id:'RCBC',type:'bank',name:'RCBC',code:'RCBC',color:'#1b4f9c'},
  {id:'Security Bank',type:'bank',name:'Security Bank',code:'SB',color:'#0f5132'},
  {id:'UnionBank',type:'bank',name:'UnionBank',code:'UB',color:'#e36b00'}
];
function pafProviderOf(a){return a?(a.type==='bank'?pafProviders.find(p=>p.id===a.bank):pafProviders.find(p=>p.id===a.type)):null}
paShort=function(a){if(a.type!=='bank')return a.type==='gcash'?'GCash':'Maya';return {'BDO Unibank':'BDO'}[a.bank]||a.bank};
paBadge=function(a){const p=pafProviderOf(a);return '<span class="pa-badge is-'+a.type+'"'+(p?' style="background:'+p.color+'"':'')+'>'+esc(p?p.code:paShort(a))+'</span>'};
const pafTile=p=>'<span class="paf-tile" style="background:'+p.color+'">'+esc(p.code)+'</span>';
const pafDigits=v=>String(v||'').replace(/\D/g,'');
const pafFormat=(p,v)=>{const d=pafDigits(v);if(p&&p.wallet){const m=d.replace(/^63/,'').replace(/^0/,'').slice(0,10);return [m.slice(0,3),m.slice(3,6),m.slice(6,10)].filter(Boolean).join(' ')}return d.slice(0,16).replace(/(\d{4})(?=\d)/g,'$1 ')};
function pafErrors(f){
  const p=f.provider,d=pafDigits(f.number),e={};
  if(!p)e.provider='Choose a bank or e-wallet';
  if(!String(f.name||'').trim())e.name='Enter the account name';
  if(p&&p.wallet){if(!/^9\d{9}$/.test(d.replace(/^63/,'').replace(/^0/,'')))e.number='Enter a valid 11-digit mobile number'}
  else if(p&&(d.length<10||d.length>16))e.number='Enter a valid account number';
  if(!e.number&&f.dup)e.number='This account is already saved.';
  return e;
}
function pafState(){
  const f=state.paFlow;if(!f)return null;
  if(!f.form){const d=f.data||{},edit=f.editId&&paAccounts().find(a=>a.id===f.editId);
    const prov=edit?pafProviderOf(edit):null;
    f.form={provider:prov,name:edit?edit.name:(d.name||(/\binc\.?$/i.test(paBusiness())?paBusiness():paBusiness()+' Inc.')),number:edit?pafFormat(prov,edit.number):'',setDefault:edit?edit.default:!paAccounts().length,touched:{}}}
  return f.form;
}
paFlow=function(){
  const f=pafState(),p=f.provider,err=pafErrors(f),show=k=>f.touched[k]||f.tried;
  if(f.stage==='otp')return pafOtpPage(f);
  if(f.stage==='done')return pafDonePage(f);
  const others=paAccounts().filter(a=>a.id!==state.paFlow.editId).length;
  const field=(label,inner,key,helper)=>'<div class="paf-field'+(show(key)&&err[key]?' has-error':'')+'"><span class="paf-label">'+label+'</span>'+inner+(show(key)&&err[key]?'<small class="paf-err">'+err[key]+'</small>':helper?'<small class="paf-help">'+helper+'</small>':'')+'</div>';
  const select='<button type="button" class="paf-input paf-select" data-paf-provider aria-haspopup="dialog">'+(p?pafTile(p)+'<span>'+esc(p.name)+'</span>':'<span class="paf-ph">Choose bank or e-wallet</span>')+'<i aria-hidden="true">▾</i></button>';
  const num=p&&p.wallet?'<div class="paf-input paf-prefixed"><span class="paf-prefix">+63</span><input data-paf-number inputmode="numeric" autocomplete="tel-national" placeholder="917 123 4567" value="'+esc(f.number)+'"></div>':'<input class="paf-input" data-paf-number inputmode="numeric" autocomplete="off" placeholder="'+(p?'0012 3456 7890':'Choose a bank first')+'" value="'+esc(f.number)+'"'+(p?'':' disabled')+'>';
  const ok=!Object.keys(err).length;
  return '<div class="en e3 pa paf">'
    +field('Bank or e-wallet',select,'provider')
    +field('Account name','<input class="paf-input" data-paf-name autocomplete="name" value="'+esc(f.name)+'">','name','As shown on your bank account')
    +field(p&&p.wallet?'Mobile number':'Account number',num,'number','Check the number carefully. Saved accounts can’t be edited.')
    +(others?'<div class="paf-toggle-row is-plain"><span>Set as default</span><button type="button" class="lcc-switch" role="switch" aria-checked="'+Boolean(f.setDefault)+'" data-paf-default aria-label="Set as default"><span></span></button></div>':'')
    +'<div class="paf-foot"><button type="button" class="button primary e4-wide" data-paf-save'+(ok?'':' disabled')+'>'+(f.saving?'<span class="paf-spin" aria-hidden="true"></span>Saving…':'Save account')+'</button></div></div>';
};
function pafProviderSheet(){
  const wrap=document.createElement('div');wrap.className='lc-sheet-wrap paf-sheet-wrap';
  const rows=q=>{const m=x=>!q||x.name.toLowerCase().includes(q.toLowerCase());const w=pafProviders.filter(x=>x.wallet&&m(x)),b=pafProviders.filter(x=>!x.wallet&&m(x)).sort((a,c)=>a.name.localeCompare(c.name));const row=x=>'<button type="button" class="paf-opt" data-paf-pick="'+esc(x.id)+'">'+pafTile(x)+'<span>'+esc(x.name)+'</span></button>';return (w.length?'<span class="paf-caps">E-WALLETS</span>'+w.map(row).join(''):'')+(b.length?'<span class="paf-caps">BANKS</span>'+b.map(row).join(''):'')+(!w.length&&!b.length?'<p class="paf-none">No match. Try another name.</p>':'')};
  wrap.innerHTML='<div class="pf-sheet-backdrop" data-paf-close></div><section class="pf-sheet lc-sheet paf-sheet" role="dialog" aria-label="Choose bank or e-wallet"><header><h2>Choose bank or e-wallet</h2><button type="button" data-paf-close aria-label="Close">×</button></header><label class="paf-search"><i class="hgi-stroke hgi-search-01" aria-hidden="true"></i><input data-paf-q placeholder="Search" autocomplete="off"></label><div class="paf-opts">'+rows('')+'</div></section>';
  document.body.appendChild(wrap);
  const q=wrap.querySelector('[data-paf-q]');q.oninput=()=>{wrap.querySelector('.paf-opts').innerHTML=rows(q.value)};
  wrap.onkeydown=e=>{if(e.key==='Escape')wrap.remove()};
  wrap.onclick=e=>{if(e.target.closest('[data-paf-close]')){wrap.remove();return}const pick=e.target.closest('[data-paf-pick]');if(!pick)return;const f=pafState(),p=pafProviders.find(x=>x.id===pick.dataset.pafPick),was=f.provider;f.provider=p;f.touched.provider=true;if(!was||Boolean(was.wallet)!==Boolean(p.wallet))f.number='';else f.number=pafFormat(p,f.number);wrap.remove();render();setTimeout(()=>document.querySelector('[data-paf-number]')?.focus(),40)};
}
function pafOtpSheet(onDone){
  const wrap=document.createElement('div');wrap.className='lc-sheet-wrap paf-sheet-wrap';
  wrap.innerHTML='<div class="pf-sheet-backdrop" data-paf-close></div><section class="pf-sheet lc-sheet paf-sheet" role="dialog" aria-label="Enter verification code"><header><h2>Enter verification code</h2><button type="button" data-paf-close aria-label="Close">×</button></header><p class="paf-otp-sub">Sent to 0917 ••• 0182</p><div class="paf-otp">'+Array.from({length:6},(_,i)=>'<input inputmode="numeric" maxlength="1" autocomplete="'+(i?'off':'one-time-code')+'" aria-label="Digit '+(i+1)+'" data-paf-d="'+i+'">').join('')+'</div><small class="paf-err" hidden>Enter the 6-digit code</small><button type="button" class="paf-resend" data-paf-resend disabled>Resend code in 0:30</button><button type="button" class="button primary e4-wide" data-paf-verify disabled>Verify</button></section>';
  document.body.appendChild(wrap);
  const boxes=[...wrap.querySelectorAll('[data-paf-d]')],verify=wrap.querySelector('[data-paf-verify]'),resend=wrap.querySelector('[data-paf-resend]');
  let left=30;const tick=setInterval(()=>{left--;if(!wrap.isConnected){clearInterval(tick);return}if(left<=0){clearInterval(tick);resend.disabled=false;resend.textContent='Resend code'}else resend.textContent='Resend code in 0:'+String(left).padStart(2,'0')},1000);
  const code=()=>boxes.map(b=>b.value).join(''),sync=()=>{verify.disabled=code().length!==6;if(code().length===6)finish()};
  const finish=()=>{clearInterval(tick);wrap.remove();onDone()};
  boxes.forEach((b,i)=>{b.oninput=()=>{const v=b.value.replace(/\D/g,'');if(v.length>1){v.split('').slice(0,6-i).forEach((ch,k)=>{boxes[i+k].value=ch});boxes[Math.min(5,i+v.length)].focus()}else{b.value=v;if(v&&boxes[i+1])boxes[i+1].focus()}sync()};b.onkeydown=e=>{if(e.key==='Backspace'&&!b.value&&boxes[i-1])boxes[i-1].focus()}});
  setTimeout(()=>boxes[0].focus(),40);
  wrap.onclick=e=>{if(e.target.closest('[data-paf-close]')){clearInterval(tick);wrap.remove();return}if(e.target.closest('[data-paf-resend]')&&!resend.disabled){toast('New code sent');left=30;resend.disabled=true;resend.textContent='Resend code in 0:30'}if(e.target.closest('[data-paf-verify]')&&code().length===6)finish()};
}
function pafCommit(){
  const fl=state.paFlow,f=pafState(),p=f.provider,list=paAccounts(),d=pafDigits(f.number);
  const number=p.wallet?'0'+d.replace(/^63/,'').replace(/^0/,'').replace(/^(\d{3})(\d{3})(\d{4})$/,'$1 $2 $3'):pafFormat(p,f.number);
  let a=fl.editId&&list.find(x=>x.id===fl.editId);
  const vals={type:p.type,bank:p.wallet?p.name:p.id,name:String(f.name).trim(),number};
  if(a)Object.assign(a,vals);else{const d=new Date();a={id:'acc-'+Date.now(),default:false,added:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]+' '+d.getDate()+', '+d.getFullYear(),...vals};list.unshift(a)}
  if(f.setDefault||!list.some(x=>x.default)||state.paReturn==='earnings')list.forEach(x=>x.default=x.id===a.id);
  paSave();const edited=Boolean(fl.editId),back=state.paReturn;state.paFlow=null;state.paReturn=null;
  if(back==='earnings'){state.page='earnings';state.e4Sub=null;render();toast('Payout account added');setTimeout(()=>{if(e4Totals().readyTotal)e4RequestSheet()},120);return}
  state.page='payacct';state.paSub=edited?a.id:null;render();const pg=document.querySelector('.page');if(pg)pg.scrollTop=0;toast(edited?'Payout account updated':'Payout account added');
}
window.addEventListener('click',event=>{
  if(state.page!=='payacct'||!state.paFlow)return;
  const t=event.target,prov=t.closest?.('[data-paf-provider]'),save=t.closest?.('[data-paf-save]'),def=t.closest?.('[data-paf-default]');
  if(!prov&&!save&&!def)return;
  event.preventDefault();event.stopImmediatePropagation();
  const f=pafState();
  if(prov)return pafProviderSheet();
  if(def){f.setDefault=!f.setDefault;def.setAttribute('aria-checked',String(f.setDefault));return}
  if(save){if(save.disabled||f.saving)return;pafSubmit();return}
},true);
const renderBeforePaf=render;
render=function(){
  renderBeforePaf.apply(this,arguments);
  const formMode=state.page==='payacct'&&Boolean(state.paFlow);
  document.querySelector('.app-shell')?.classList.toggle('paf-mode',formMode);
  if(!formMode)return;
  const page=document.querySelector('.page');if(page&&!page.querySelector('.paf'))page.innerHTML=paFlow();
  const f=pafState(),saveBtn=()=>document.querySelector('[data-paf-save]');
  const refresh=()=>{const ok=!Object.keys(pafErrors(f)).length&&!f.dup,b=saveBtn();if(b)b.disabled=!ok||f.saving};
  const name=document.querySelector('[data-paf-name]'),num=document.querySelector('[data-paf-number]');
  const mark=(el,key,helper)=>{const box=el.closest('.paf-field');if(!box)return;const msg=pafErrors(f)[key];box.classList.toggle('has-error',Boolean(msg));box.querySelectorAll('.paf-err,.paf-help').forEach(n=>n.remove());if(msg)box.insertAdjacentHTML('beforeend','<small class="paf-err">'+msg+'</small>');else if(helper)box.insertAdjacentHTML('beforeend','<small class="paf-help">'+helper+'</small>')};
  if(name){name.oninput=()=>{f.name=name.value;refresh();if(f.touched.name||f.tried)mark(name,'name','As shown on your bank account')};name.onblur=()=>{f.touched.name=true;mark(name,'name','As shown on your bank account')}}
  if(num){num.oninput=()=>{const end=num.value.length-num.selectionEnd;num.value=pafFormat(f.provider,num.value);f.number=num.value;try{const pos=Math.max(0,num.value.length-end);num.setSelectionRange(pos,pos)}catch(e){}refresh();if(f.touched.number||f.tried)mark(num,'number')};num.onblur=()=>{f.touched.number=true;mark(num,'number')}}
};
render();

/* ===== Earnings v5: scoped to one hotel, hotel switcher, confirmation-only Request payout. ===== */
function e4TotalsFor(h){const m=e4Model(),ready=m.bookings.filter(b=>b.stage==='ready'&&b.hotel===h),checkout=m.bookings.filter(b=>b.stage==='checkout'&&b.hotel===h);return {ready,checkout,readyTotal:e4Sum(ready),checkoutTotal:e4Sum(checkout),requests:m.requests.filter(r=>r.hotel===h)}}
function e4HotelIds(){return Object.keys(e4Hotels)}
function e4CurHotel(){
  const ids=e4HotelIds();
  if(state.e4Hotel&&ids.includes(state.e4Hotel))return state.e4Hotel;
  let saved=null;try{saved=localStorage.getItem('cabana:earnings-hotel')}catch(e){}
  const best=ids.slice().sort((a,b)=>e4TotalsFor(b).readyTotal-e4TotalsFor(a).readyTotal)[0];
  state.e4Hotel=e4TotalsFor(best).readyTotal>0?best:(saved&&ids.includes(saved)?saved:best);
  return state.e4Hotel;
}
const e4TodayLabel=()=>{const d=new Date();return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]+' '+d.getDate()};
e4Main=function(){
  const h=e4CurHotel(),t=e4TotalsFor(h),range=e4Range(),paid=e4PaidIn(null,h),multi=e4HotelIds().length>1;
  const switcher=multi?'<div class="e5-bar"><button type="button" class="e5-switch" data-e5-switch aria-haspopup="dialog"><span class="e5-tile"><i class="hgi-stroke hgi-building-03" aria-hidden="true"></i></span><span class="e5-name">'+esc(e4Hotels[h])+'</span><i class="e5-caret" aria-hidden="true">▾</i></button><button type="button" class="e5-export" data-e4-export-open aria-label="Export"><i class="hgi-stroke hgi-download-04" aria-hidden="true"></i></button></div>':'';
  const hero='<section class="e4-hero"><span>Available for payout</span><strong>'+e4Peso(t.readyTotal)+'</strong><small>'+(t.readyTotal?'From checked-out guests':'Nothing available yet')+'</small><button type="button" class="e4-hero-btn" data-e4-request'+(t.readyTotal?'':' disabled')+'>Request payout</button></section>';
  const reqs=t.requests.slice().sort((a,b)=>e4Date(a.date)-e4Date(b.date));
  const requested=reqs.length?'<div class="e4-sec"><h3>Requested payouts</h3></div><section class="en-card e4-list">'+reqs.map(r=>'<button type="button" class="e3-stage" data-e4-open="request:'+r.id+'">'+e3Icon('clock-01','is-amber')+'<span><strong class="e4-one">Requested '+r.date+'</strong></span><span class="e4-right"><b>'+e4Peso(e4Sum(r.bookings))+'</b></span><i class="e3-chev" aria-hidden="true">›</i></button>').join('')+'</section>':'';
  const notReady=t.checkoutTotal?'<div class="e4-sec"><h3>Awaiting checkout</h3></div><section class="en-card e4-list"><button type="button" class="e3-stage" data-e4-open="checkout">'+e3Icon('bed-double')+'<span><strong>'+t.checkout.length+' booking'+(t.checkout.length===1?'':'s')+'</strong><small>Guests still staying</small></span><b>'+e4Peso(t.checkoutTotal)+'</b><i class="e3-chev" aria-hidden="true">›</i></button></section>':'';
  const paidSec='<div class="e4-sec"><h3>Payments received</h3>'+e4Pill('data-e4-range',range.label)+'</div><section class="en-card e4-list e4-paid">'
    +(paid.length?'<div class="e4-paid-total"><strong>'+e4Peso(e4Sum(paid))+'</strong><small>'+range.sub+'</small></div>'+paid.slice(0,3).map(e4PaidRow).join('')+'<button type="button" class="vi2-foot e3-foot" data-e4-open="payments"><span>View payment history</span><i aria-hidden="true">›</i></button>':'<p class="en-empty">No payments in this range</p>')+'</section>';
  return '<div class="en e3 e4">'+switcher+hero+requested+notReady+paidSec+'</div>';
};
function e5HotelSheet(){
  lcSheetClose();const cur=e4CurHotel(),wrap=document.createElement('div');wrap.className='lc-sheet-wrap';
  wrap.innerHTML='<div class="pf-sheet-backdrop" data-e5-close></div><section class="pf-sheet lc-sheet e5-sheet" role="dialog" aria-label="Partner hotels"><header><h2>Partner hotels</h2><button type="button" data-e5-close aria-label="Close">×</button></header><div class="e5-opts">'+e4HotelIds().map(id=>{const a=e4TotalsFor(id).readyTotal;return '<button type="button" class="e5-opt'+(id===cur?' is-on':'')+'" data-e5-pick="'+id+'"><span class="e5-tile"><i class="hgi-stroke hgi-building-03" aria-hidden="true"></i></span><span><strong>'+esc(e4Hotels[id])+'</strong><small>'+(a?e4Peso(a)+' available':'Nothing available')+'</small></span>'+(id===cur?'<i class="hgi-stroke hgi-tick-02 e5-check" aria-hidden="true"></i>':'')+'</button>'}).join('')+'</div></section>';
  document.body.appendChild(wrap);
  wrap.onkeydown=e=>{if(e.key==='Escape')lcSheetClose()};
  wrap.onclick=e=>{if(e.target.closest('[data-e5-close]')){lcSheetClose();return}const pick=e.target.closest('[data-e5-pick]');if(!pick)return;state.e4Hotel=pick.dataset.e5Pick;try{localStorage.setItem('cabana:earnings-hotel',state.e4Hotel)}catch(err){}lcSheetClose();render();const p=document.querySelector('.page');if(p)p.scrollTop=0};
}
e4RequestSheet=function(){
  lcSheetClose();const h=e4CurHotel(),t=e4TotalsFor(h);if(!t.readyTotal)return;
  const wrap=document.createElement('div');wrap.className='lc-sheet-wrap';
  wrap.innerHTML='<div class="pf-sheet-backdrop" data-e4-close></div><section class="pf-sheet lc-sheet e4-sheet e5-req" role="dialog" aria-label="Request payout"><header><h2>Request payout</h2><button type="button" data-e4-close aria-label="Close">×</button></header><div class="e5-req-amt"><small>From '+esc(e4Hotels[h])+'</small><strong>'+e4Peso(t.readyTotal)+'</strong><small>'+t.ready.length+' booking'+(t.ready.length===1?'':'s')+'</small></div>'+paPayToRow()+'<button type="button" class="button primary e4-wide" data-e4-send'+(paDefault()?'':' disabled')+'>Request '+e4Peso(t.readyTotal)+'</button></section>';
  document.body.appendChild(wrap);
  wrap.onkeydown=e=>{if(e.key==='Escape')lcSheetClose()};
  wrap.onclick=e=>{
    if(e.target.closest('[data-e4-close]')){lcSheetClose();return}
    const send=e.target.closest('[data-e4-send]');if(!send||send.disabled)return;
    const m=e4Model(),l=m.bookings.filter(b=>b.stage==='ready'&&b.hotel===h);if(!l.length)return;
    m.bookings=m.bookings.filter(b=>!(b.stage==='ready'&&b.hotel===h));
    m.requests.push({id:'RQ'+Date.now().toString().slice(-6),hotel:h,date:e4TodayLabel(),account:paLabel(paDefault()),bookings:l.map(({stage,...b})=>b)});
    e4Save();lcSheetClose();render();toast('Payout requested');
  };
};
window.addEventListener('click',event=>{
  if(state.page!=='earnings')return;
  const sw=event.target.closest?.('[data-e5-switch]');if(!sw)return;
  event.preventDefault();event.stopImmediatePropagation();e5HotelSheet();
},true);
const renderBeforeE5=render;
render=function(){
  renderBeforeE5.apply(this,arguments);
  if(state.page!=='earnings'||state.e4Sub!=='payments')return;
  const title=document.querySelector('.topbar .topbar-context strong, .topbar h1');
  if(title&&e4HotelIds().length>1)title.innerHTML='Payment history<small class="e5-sub">'+esc(e4Hotels[e4CurHotel()])+'</small>';
};
render();

/* Payout account detail: fixed once saved. Only Set as default and Remove (no editing). */
paDetail=function(a){
  const only=paAccounts().length===1,shown=state.paReveal===a.id;
  return '<div class="en e3 pa pad"><section class="en-card pad-head">'+paBadge(a)+'<strong>'+esc(a.type==='bank'?a.bank:paShort(a))+'</strong><span>•••• '+paLast4(a)+'</span>'+(a.default?'<em class="pa-default">Default</em>':'')+'</section>'
    +'<section class="en-card pa-fields"><div><span>Account name</span><b>'+esc(a.name)+'</b></div><div><span>'+(a.type==='bank'?'Account number':'Mobile number')+'</span><b class="pad-num">'+(shown?esc(a.number):'•••• '+paLast4(a))+'<button type="button" class="pad-eye" data-pad-reveal aria-label="'+(shown?'Hide':'Show')+' number"><i class="hgi-stroke '+(shown?'hgi-view-off':'hgi-view')+'" aria-hidden="true"></i></button></b></div><div><span>Added</span><b>'+esc(a.added||'—')+'</b></div></section>'
    +'<section class="en-card pad-actions">'+(a.default?'':'<button type="button" class="pad-row" data-pad-default><i class="hgi-stroke hgi-star" aria-hidden="true"></i><span>Set as default</span><i class="e3-chev" aria-hidden="true">›</i></button>')
    +'<button type="button" class="pad-row is-danger" data-pad-remove'+(only?' disabled':'')+'><i class="hgi-stroke hgi-delete-02" aria-hidden="true"></i><span>Remove account</span></button></section></div>';
};
function padDialog(html,bind){lcLeaveClose();const wrap=document.createElement('div');wrap.className='lc-leave-wrap';wrap.innerHTML='<div class="lc-leave-backdrop" data-pad-x></div><section class="lc-leave lcc-dialog" role="alertdialog" aria-modal="true">'+html+'</section>';document.body.appendChild(wrap);wrap.onkeydown=e=>{if(e.key==='Escape')wrap.remove()};wrap.onclick=e=>{if(e.target.closest('[data-pad-x]')){wrap.remove();return}bind(e,wrap)};setTimeout(()=>wrap.querySelector('[data-pad-x].button')?.focus(),30)}
window.addEventListener('click',event=>{
  if(state.page!=='payacct'||state.paFlow)return;
  const t=event.target,rev=t.closest?.('[data-pad-reveal]'),def=t.closest?.('[data-pad-default]'),rem=t.closest?.('[data-pad-remove]');
  if(!rev&&!def&&!rem)return;
  event.preventDefault();event.stopImmediatePropagation();
  const list=paAccounts(),a=list.find(x=>x.id===state.paSub);if(!a)return;
  const sc=document.querySelector('.page')?.scrollTop||0,rerender=()=>{render();const p=document.querySelector('.page');if(p)p.scrollTop=sc};
  if(rev){state.paReveal=state.paReveal===a.id?null:a.id;return rerender()}
  if(def){
    const old=paDefault(),pending=(typeof e4Model==='function'?e4Model().requests:[]).length>0;
    const apply=()=>{list.forEach(x=>x.default=x.id===a.id);paSave();rerender();toast(paLabel(a)+' is now your default')};
    if(!pending)return apply();
    return padDialog('<h2>Set as default?</h2><p>New payouts will go to '+esc(paLabel(a))+'. Your pending request still goes to '+esc(paLabel(old))+'.</p><div class="lcc-dialog-actions"><button type="button" class="button ghost" data-pad-x>Cancel</button><button type="button" class="button primary" data-pad-ok>Set as default</button></div>',(e,w)=>{if(e.target.closest('[data-pad-ok]')){w.remove();apply()}});
  }
  if(rem&&!rem.disabled){
    const others=list.filter(x=>x.id!==a.id);
    const remove=newDef=>{state.paAccounts=list.filter(x=>x.id!==a.id);if(newDef)state.paAccounts.forEach(x=>x.default=x.id===newDef);else if(!state.paAccounts.some(x=>x.default)&&state.paAccounts[0])state.paAccounts[0].default=true;paSave();state.paSub=null;state.paReveal=null;render();const p=document.querySelector('.page');if(p)p.scrollTop=0;toast(paLabel(a)+' removed')};
    if(!a.default)return padDialog('<h2>Remove '+esc(paLabel(a))+'?</h2><p>It won’t receive new payouts.</p><div class="lcc-dialog-actions"><button type="button" class="button ghost" data-pad-x>Cancel</button><button type="button" class="button primary is-danger" data-pad-ok>Remove</button></div>',(e,w)=>{if(e.target.closest('[data-pad-ok]')){w.remove();remove(null)}});
    return padDialog('<h2>Remove '+esc(paLabel(a))+'?</h2><p>Choose your new default payout account.</p><div class="pad-choices">'+others.map((x,i)=>'<label class="pad-choice"><input type="radio" name="pad-new" value="'+x.id+'"'+(i===0?' checked':'')+'><span class="e4-radio" aria-hidden="true"></span>'+paBadge(x)+'<span>'+esc(paLabel(x))+'</span></label>').join('')+'</div><div class="lcc-dialog-actions"><button type="button" class="button ghost" data-pad-x>Cancel</button><button type="button" class="button primary is-danger" data-pad-ok>Remove</button></div>',(e,w)=>{if(e.target.closest('[data-pad-ok]')){const pick=w.querySelector('input[name="pad-new"]:checked')?.value;w.remove();remove(pick)}});
  }
},true);
render();

/* Add payout account: save → checks → full-screen code → success → back to start. */
function pafIsDirty(f){return Boolean(f&&(f.provider||String(f.number||'').trim()||(f.name&&f.name!==(/\binc\.?$/i.test(paBusiness())?paBusiness():paBusiness()+' Inc.'))))}
function pafMasked(f){const d=pafDigits(f.number);return (f.provider?f.provider.name:'')+' •••• '+d.slice(-4)}
function pafWillBeDefault(f){return Boolean(f.setDefault||!paAccounts().length||state.paReturn==='earnings')}
function pafOtpPage(f){
  return '<div class="en e3 pa paf paf-otp-page"><div class="otp-icon"><i class="hgi-stroke hgi-square-lock-02" aria-hidden="true"></i></div><h1>Verify it’s you</h1><p>Enter the 6-digit code we sent to<br><b>0917 ••• 0182</b></p><label class="otp" data-otp><input data-otp-input type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]*" aria-label="6-digit code"><span></span><span></span><span></span><span></span><span></span><span></span></label><p class="otp-error" data-otp-error hidden>Incorrect code. Try again.</p><p class="otp-resend" data-otp-resend>Didn’t get it? Resend in <span data-otp-t>0:30</span></p></div>';
}
function pafDonePage(f){
  return '<div class="en e3 pa paf paf-done"><span class="paf-done-ic"><i class="hgi-stroke hgi-tick-02" aria-hidden="true"></i></span><h3>Account added</h3><p><strong>'+esc(pafMasked(f))+'</strong>'+(pafWillBeDefault(f)?'<br>is now your default payout account':'')+'</p></div>';
}
function pafGoOtp(){const f=pafState();f.stage='otp';f.saving=false;render()}
function pafSubmit(){
  const f=pafState();f.saving=true;render();
  setTimeout(()=>{
    if(!state.paFlow)return;
    f.saving=false;
    if(navigator.onLine===false){render();toast('Couldn’t save. Check your connection and try again.');return}
    const d=pafDigits(f.number).replace(/^63/,'').replace(/^0/,''),dup=paAccounts().some(a=>a.id!==state.paFlow.editId&&a.type===f.provider.type&&(a.type!=='bank'||a.bank===f.provider.id)&&pafDigits(a.number).replace(/^63/,'').replace(/^0/,'')===d);
    if(dup){f.dup=true;f.touched.number=true;render();return}
    if(!paNameOk(f.name)){render();padDialog('<h2>Account name doesn’t match</h2><p>“'+esc(f.name)+'” doesn’t match '+esc((/\binc\.?$/i.test(paBusiness())?paBusiness():paBusiness()+' Inc.').replace(/\.$/,''))+'. Payouts may be delayed or rejected.</p><div class="lcc-dialog-actions"><button type="button" class="button ghost" data-pad-x data-paf-editname>Edit name</button><button type="button" class="button primary" data-pad-ok>Continue anyway</button></div>',(e,w)=>{if(e.target.closest('[data-pad-ok]')){w.remove();pafGoOtp()}});document.querySelector('[data-paf-editname]')?.addEventListener('click',()=>setTimeout(()=>{const n=document.querySelector('[data-paf-name]');if(n){n.focus();n.select()}},40));return}
    pafGoOtp();
  },700);
}
function pafBindOtp(){
  const wrap=document.querySelector('.paf-otp-page [data-otp]');if(!wrap)return;
  const input=wrap.querySelector('[data-otp-input]'),boxes=[...wrap.querySelectorAll('span')],err=document.querySelector('[data-otp-error]'),rs=document.querySelector('[data-otp-resend]');
  let busy=false;
  const paint=()=>{const v=input.value.replace(/\D/g,'').slice(0,6);input.value=v;boxes.forEach((b,i)=>{b.textContent=v[i]||'';b.classList.toggle('active',i===Math.min(v.length,5)&&document.activeElement===input)});if(v.length===6&&!busy)submit(v)};
  const submit=code=>{busy=true;input.blur();setTimeout(()=>{
    if(code==='000000'){wrap.classList.add('error','shake');err.hidden=false;setTimeout(()=>{wrap.classList.remove('shake');input.value='';busy=false;paint();input.focus()},600);return}
    clearInterval(window.__pafTick);const f=pafState();f.stage='done';render();setTimeout(()=>{if(state.paFlow&&pafState().stage==='done')pafCommit()},1100);
  },350)};
  input.addEventListener('input',()=>{wrap.classList.remove('error');err.hidden=true;paint()});
  input.addEventListener('focus',paint);input.addEventListener('blur',paint);
  const startTimer=()=>{let sec=30;rs.innerHTML='Didn’t get it? Resend in <span data-otp-t>0:30</span>';clearInterval(window.__pafTick);window.__pafTick=setInterval(()=>{if(!rs.isConnected){clearInterval(window.__pafTick);return}sec--;const t=rs.querySelector('[data-otp-t]');if(sec<=0){clearInterval(window.__pafTick);rs.innerHTML='Didn’t get it? <a href="#" data-otp-again>Resend code</a>'}else if(t)t.textContent='0:'+String(sec).padStart(2,'0')},1000)};
  rs.onclick=e=>{const a=e.target.closest('[data-otp-again]');if(!a)return;e.preventDefault();toast('New code sent');startTimer()};
  startTimer();paint();setTimeout(()=>input.focus(),40);
}
function pafLeave(){
  clearInterval(window.__pafTick);state.paFlow=null;
  if(state.paReturn==='earnings'){state.page='earnings';state.paReturn=null;render();setTimeout(()=>{if(typeof e4CurHotel==='function'&&e4TotalsFor(e4CurHotel()).readyTotal)e4RequestSheet()},120);return}
  state.paReturn=null;render();
}
const renderBeforePafFlow=render;
render=function(){
  renderBeforePafFlow.apply(this,arguments);
  const shell=document.querySelector('.app-shell');
  if(state.page!=='payacct'||!state.paFlow||['otp','done'].includes(state.paFlow.form?.stage)){shell?.querySelectorAll(':scope > .paf-foot').forEach(n=>n.remove());if(state.page!=='payacct'||!state.paFlow)return}
  const f=pafState();
  const title=document.querySelector('.topbar .topbar-context strong, .topbar h1');if(title)title.textContent=f.stage==='otp'||f.stage==='done'?'':'Add payout account';
  const foot=document.querySelector('.page .paf-foot');
  if(foot&&shell){shell.querySelectorAll(':scope > .paf-foot').forEach(n=>n.remove());shell.appendChild(foot)}
  document.querySelector('.paf')?.classList.add('has-foot');
  const sb=document.querySelector('[data-paf-save]');if(sb){sb.disabled=Boolean(Object.keys(pafErrors(f)).length||f.saving);sb.innerHTML=f.saving?'<span class="paf-spin" aria-hidden="true"></span>Saving…':'Save account'}
  const num=document.querySelector('[data-paf-number]');if(num)num.addEventListener('input',()=>{if(f.dup){f.dup=false;const box=num.closest('.paf-field');box?.classList.remove('has-error');box?.querySelector('.paf-err')?.remove()}const b=document.querySelector('[data-paf-save]');if(b)b.disabled=Boolean(Object.keys(pafErrors(f)).length||f.saving)});
  const back=document.querySelector('[data-profile-back]');
  if(back)back.onclick=()=>{
    if(f.stage==='done')return;
    if(f.stage==='otp'||pafIsDirty(f)){padDialog('<h2>Discard this account?</h2><p>Nothing is saved until the code is verified.</p><div class="lcc-dialog-actions"><button type="button" class="button ghost" data-pad-x>Keep editing</button><button type="button" class="button primary is-danger" data-pad-ok>Discard</button></div>',(e,w)=>{if(e.target.closest('[data-pad-ok]')){w.remove();pafLeave()}});return}
    pafLeave();
  };
  if(f.stage==='otp'&&!document.querySelector('.paf-otp-page')?.dataset.bound){const pg=document.querySelector('.paf-otp-page');if(pg){pg.dataset.bound='1';pafBindOtp()}}
};
render();
/* Choosing an action in the dev panel closes it for good (it won't reopen on the next redraw). */
document.addEventListener('pointerdown',e=>{if(e.target.closest?.('.dev-tools-popover button'))state.devOpen=false},true);

/* Staff: Listings and Partner hotels are view-only. */
window.addEventListener('click',event=>{
  if(state.role==='Owner')return;
  const blocked=event.target.closest?.('[data-ph-toggle],[data-ph-accept],[data-ph-decline],[data-lcc-toggle],[data-lc-more],[data-listing-new],[data-listing-menu-action="setup"]');
  if(!blocked)return;
  event.preventDefault();event.stopImmediatePropagation();toast('Only the business owner can make changes');
},true);
const renderBeforeStaffView=render;
render=function(){renderBeforeStaffView.apply(this,arguments);if(state.role!=='Owner'&&state.page==='listings')document.querySelectorAll('.page [data-lc-more],.page .lcc-switch,.page [data-listing-new]').forEach(n=>n.remove())};
render();

/* Insights: date filter lives above the Sales card (full width), not in the header. */
const renderBeforeViRangeRow=render;
render=function(){renderBeforeViRangeRow.apply(this,arguments);if(state.page==='vinsights')document.querySelectorAll('.topbar [data-vi2-range]').forEach(n=>n.remove())};
render();

/* ===== Notifications (Menu › Notifications): per-device settings. ===== */
const ntSounds=[['chime','Chime',[880,1320]],['bell','Bell',[660,990,1320]],['marimba','Marimba',[523,659,784]],['pulse','Pulse',[740,740,740]]];
function ntSettings(){
  if(!state.ntSettings){try{state.ntSettings=JSON.parse(localStorage.getItem('cabana:notif-settings')||'null')}catch(e){}
    state.ntSettings={loud:true,sound:'chime',expiring:true,messages:true,cancelled:true,reminder:true,payout:true,online:false,hotels:true,...(state.ntSettings||{})}}
  return state.ntSettings;
}
const ntSave=()=>{try{localStorage.setItem('cabana:notif-settings',JSON.stringify(state.ntSettings))}catch(e){}};
function ntPlay(id){
  try{const tones=(ntSounds.find(x=>x[0]===id)||ntSounds[0])[2],ctx=new (window.AudioContext||window.webkitAudioContext)();tones.forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=id==='pulse'?'square':'sine';o.frequency.value=f;g.gain.setValueAtTime(0.0001,ctx.currentTime+i*0.18);g.gain.exponentialRampToValueAtTime(0.25,ctx.currentTime+i*0.18+0.02);g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+i*0.18+0.3);o.connect(g).connect(ctx.destination);o.start(ctx.currentTime+i*0.18);o.stop(ctx.currentTime+i*0.18+0.32)});setTimeout(()=>ctx.close(),1500)}catch(e){}
}
const ntBlocked=()=>typeof Notification!=='undefined'&&Notification.permission==='denied';
function ntPage(){
  const n=ntSettings(),owner=state.role==='Owner';
  const sw=(k,label,sub)=>'<div class="nt-row"><span><strong>'+label+'</strong>'+(sub?'<small>'+sub+'</small>':'')+'</span><button type="button" class="lcc-switch" role="switch" aria-checked="'+Boolean(n[k])+'" data-nt-toggle="'+k+'" aria-label="'+label+'"><span></span></button></div>';
  const sec=(title,rows)=>'<div class="e4-sec"><h3>'+title+'</h3></div><section class="en-card nt-card">'+rows+'</section>';
  const sound=(ntSounds.find(x=>x[0]===n.sound)||ntSounds[0])[1];
  return '<div class="en e3 nt">'
    +(ntBlocked()?'<button type="button" class="nt-blocked" data-nt-settings><i class="hgi-stroke hgi-alert-circle" aria-hidden="true"></i><span><strong>Notifications are off for this app</strong><small>Turn on in phone settings ›</small></span></button>':'')
    +sec('New requests','<div class="nt-row"><span><strong>New booking requests</strong></span><em class="nt-always">Always on</em></div>'
      +sw('loud','Loud alert','Plays a sound until you open the app')
      +'<button type="button" class="nt-row nt-link" data-nt-sound><span><strong>Alert sound</strong></span><em>'+sound+'</em><i class="e3-chev" aria-hidden="true">›</i></button>'
      +sw('expiring','Request expiring soon','10 minutes before it expires'))
    +sec('Bookings',sw('messages','Guest messages')+sw('cancelled','Booking cancelled by guest')+sw('reminder','Upcoming booking reminder','1 hour before start'))
    +(owner?sec('Payments',sw('payout','Payout paid by hotel')+sw('online','Online payment received'))+sec('Partner hotels',sw('hotels','Invitations and updates')):'')
    +'<button type="button" class="e4-outline nt-test" data-nt-test><i class="hgi-stroke hgi-notification-03" aria-hidden="true"></i>Send test notification</button>'
    +'<p class="nt-note">These settings apply to this phone only.</p></div>';
}
window.cabanaNotificationsPage=ntPage;
const viewBeforeNt=view;
view=function(){if(state.page==='notifs'){try{return window.cabanaNotificationsPage()}catch(e){console.error('Notifications render failed',e);return '<div class="nt"></div>'}}return viewBeforeNt.apply(this,arguments)};
function ntSoundSheet(){
  lcSheetClose();const n=ntSettings(),wrap=document.createElement('div');wrap.className='lc-sheet-wrap';
  const draw=()=>{wrap.innerHTML='<div class="pf-sheet-backdrop" data-nt-close></div><section class="pf-sheet lc-sheet lc-dd-sheet" role="dialog" aria-label="Alert sound"><header><h2>Alert sound</h2><button type="button" data-nt-close aria-label="Close">×</button></header><div class="lc-sheet-list" role="listbox">'+ntSounds.map(([id,label])=>'<button type="button" role="option" aria-selected="'+(n.sound===id)+'" class="nt-sound'+(n.sound===id?' is-selected':'')+'" data-nt-pick="'+id+'"><i class="hgi-stroke hgi-volume-high nt-play" aria-hidden="true"></i><span>'+label+'</span>'+(n.sound===id?'<i class="hgi-stroke hgi-tick-02" aria-hidden="true"></i>':'')+'</button>').join('')+'</div><p class="nt-sheet-note">Tap a sound to hear it.</p></section>'};
  draw();document.body.appendChild(wrap);
  wrap.onkeydown=e=>{if(e.key==='Escape')lcSheetClose()};
  wrap.onclick=e=>{if(e.target.closest('[data-nt-close]')){lcSheetClose();render();return}const pick=e.target.closest('[data-nt-pick]');if(!pick)return;n.sound=pick.dataset.ntPick;ntSave();ntPlay(n.sound);draw()};
}
window.addEventListener('click',event=>{
  if(state.page!=='notifs')return;
  const t=event.target,tog=t.closest?.('[data-nt-toggle]'),snd=t.closest?.('[data-nt-sound]'),test=t.closest?.('[data-nt-test]'),set=t.closest?.('[data-nt-settings]');
  if(!tog&&!snd&&!test&&!set)return;
  event.preventDefault();event.stopImmediatePropagation();
  const n=ntSettings();
  if(tog){const k=tog.dataset.ntToggle;n[k]=!n[k];ntSave();tog.setAttribute('aria-checked',String(n[k]));return}
  if(snd)return ntSoundSheet();
  if(set){toast('Open your phone’s Settings › Notifications › Cabana Vendor and turn on Allow notifications');return}
  if(test){
    ntPlay(n.sound);
    const show=()=>{try{if(navigator.serviceWorker?.controller)navigator.serviceWorker.ready.then(r=>r.showNotification('Test notification',{body:'This is how new booking requests will alert you.',tag:'cabana-test'}));else new Notification('Test notification',{body:'This is how new booking requests will alert you.'})}catch(e){}};
    if(typeof Notification!=='undefined'&&Notification.permission==='granted')show();
    else if(typeof Notification!=='undefined'&&Notification.permission==='default')Notification.requestPermission().then(p=>{if(p==='granted')show();render()});
    toast(ntBlocked()?'Notifications are off for this app. Turn them on in phone settings.':'Test notification sent');
  }
},true);
const renderBeforeNt=render;
render=function(){
  renderBeforeNt.apply(this,arguments);
  if(state.page!=='notifs')return;
  const page=document.querySelector('.page');if(page&&!page.querySelector('.nt'))page.innerHTML=ntPage();
  const bar=document.querySelector('.topbar');if(!bar)return;
  const title=bar.querySelector('.topbar-context strong, h1');if(title)title.textContent='Notifications';
  let back=bar.querySelector('[data-profile-back]');
  if(!back){bar.classList.add('profile-topbar');back=document.createElement('button');back.type='button';back.className='profile-back';back.setAttribute('data-profile-back','');back.textContent='←';bar.prepend(back)}
  back.setAttribute('aria-label','Back to Menu');back.onclick=()=>{state.page='menu';render();const p=document.querySelector('.page');if(p)p.scrollTop=0};
  document.querySelectorAll('.bottom-nav [data-page="menu"], nav [data-page="menu"]').forEach(b=>b.classList.add('active'));
};
render();

/* ===== Help & support (Menu › Help and support): contact first, FAQs second, report a problem. ===== */
const hpVersion='1.0.3 (pilot)';
const hpTopics=[
  {id:'bookings',title:'Bookings',items:[
    ['What happens if I don’t respond to a request?','Each request has a time limit shown on the card (for example “38m left”). If you don’t accept or decline in time, the request expires and the guest is told it wasn’t confirmed. Expired requests are lost bookings, so keep notifications on and reply as soon as you can.'],
    ['How do I cancel a booking?','Open the booking from Bookings, tap ⋯ and choose Cancel booking. Pick a reason so the guest understands. You can only cancel bookings that haven’t been paid or started.'],
    ['When is a booking marked completed automatically?','24 hours after its scheduled end, unless it’s an unpaid QR booking. You can also tap Mark as completed yourself once the service is done.']]},
  {id:'payouts',title:'Payouts and earnings',items:[
    ['When can I request a payout?','As soon as a guest who charged a booking to their room has checked out. That money shows as Available for payout in Earnings. Tap Request payout to ask that hotel to pay you.'],
    ['How long does the hotel take to pay?','Most partner hotels pay within 7 days of your request. If it takes longer, open the request in Earnings and tap Message front desk.'],
    ['Why is a booking still “Awaiting checkout”?','Room charges are paid by the hotel only after the guest checks out. Until then the amount stays under Awaiting checkout.'],
    ['How do I change my payout account?','Go to Menu › Payout accounts. Add the new account, then set it as default. Saved accounts can’t be edited, so remove any account with wrong details and add it again.']]},
  {id:'listings',title:'Listings',items:[
    ['How do I turn a listing off for a day?','Open Create or Edit listing › Availability and block the date in the calendar. To hide it completely, switch it off on the Listings page.'],
    ['Why can’t guests see my listing?','Check that it’s Active on the Listings page, that it’s switched on for that hotel in Partner hotels, and that the date isn’t blocked or a closed day.']]},
  {id:'account',title:'Account and staff',items:[
    ['How do I add staff?','Go to Menu › Business profile › Access and permissions and tap Invite a member. Enter their name, email and mobile number.'],
    ['What can staff see?','Staff can manage bookings and chat with guests and the front desk. They can view listings and partner hotels but can’t change them, and they can’t see earnings, insights or payout accounts.']]}
];
function hpOpenChat(){
  if(typeof cxThreads==='undefined'){toast('Support chat isn’t available right now');return}
  let t=cxThreads.find(x=>x.id==='kabana-support');
  if(!t){t={id:'kabana-support',kind:'frontdesk',support:true,hotel:'Kabana support',name:'Kabana support',role:'Support',unread:0,messages:[{day:'Today',time:'9:00 AM',from:'them',text:'Hi! This is Kabana support. How can we help you today?'}]};cxThreads.unshift(t)}
  cxOpenThread(t.id);
}
function hpPage(){
  const sub=state.hpSub;
  const row=(attr,icon,title,sub2)=>'<button type="button" class="hp-row" '+attr+'>'+(icon?'<span class="hp-ic"><i class="hgi-stroke hgi-'+icon+'" aria-hidden="true"></i></span>':'')+'<span><strong>'+title+'</strong>'+(sub2?'<small>'+sub2+'</small>':'')+'</span><i class="e3-chev" aria-hidden="true">›</i></button>';
  if(sub&&sub.startsWith('topic:')){const tp=hpTopics.find(x=>x.id===sub.slice(6));return '<div class="en e3 hp"><section class="en-card hp-card">'+tp.items.map((q,i)=>row('data-hp-q="'+tp.id+':'+i+'"','',esc(q[0]),'')).join('')+'</section></div>'}
  if(sub&&sub.startsWith('q:')){const [tid,i]=sub.slice(2).split(':'),tp=hpTopics.find(x=>x.id===tid),q=tp.items[Number(i)];return '<div class="en e3 hp hp-article"><h2>'+esc(q[0])+'</h2><p>'+esc(q[1])+'</p><div class="hp-still"><span>Still need help?</span><button type="button" class="e4-outline" data-hp-chat><i class="hgi-stroke hgi-message-01" aria-hidden="true"></i>Chat with us</button></div></div>'}
  if(sub==='terms'||sub==='privacy')return '<div class="en e3 hp hp-article"><h2>'+(sub==='terms'?'Terms of service':'Privacy policy')+'</h2><p>'+(sub==='terms'?'These terms explain how partner vendors use the Kabana vendor app, how bookings and room charges work, and each side’s responsibilities. The full terms will be published before launch.':'This policy explains what information the vendor app collects, such as bookings, guest names and room numbers, and how it’s used and protected. The full policy will be published before launch.')+'</p></div>';
  if(sub==='report'){const r=state.hpReport||(state.hpReport={text:'',booking:'',file:null});
    return '<div class="en e3 hp hp-report"><label class="paf-field"><span class="paf-label">What went wrong?</span><textarea class="paf-input hp-text" data-hp-text rows="5" placeholder="Tell us what happened and what you expected">'+esc(r.text)+'</textarea>'+(state.hpTried&&!r.text.trim()?'<small class="paf-err">Describe the problem</small>':'')+'</label>'
      +'<div class="paf-field"><span class="paf-label">Screenshot <em class="hp-opt">Optional</em></span><label class="hp-file"><input type="file" accept="image/*" data-hp-file><i class="hgi-stroke hgi-image-01" aria-hidden="true"></i><span>'+(r.file?esc(r.file):'Add a screenshot')+'</span></label></div>'
      +'<label class="paf-field"><span class="paf-label">Related booking <em class="hp-opt">Optional</em></span><input class="paf-input" data-hp-booking placeholder="#BK1042" value="'+esc(r.booking)+'"></label>'
      +'<p class="hp-meta">We’ll attach your device and app version ('+hpVersion+') to help us look into it.</p>'
      +'<button type="button" class="button primary e4-wide" data-hp-send>Send report</button></div>'}
  return '<div class="en e3 hp"><h2 class="hp-h">How can we help?</h2>'
    +'<section class="en-card hp-card">'+row('data-hp-chat','message-01','Chat with Kabana support','Usually replies within 1 hour')+'<a class="hp-row" href="tel:+63285550100"><span class="hp-ic"><i class="hgi-stroke hgi-call" aria-hidden="true"></i></span><span><strong>Call support</strong><small>Mon–Sun, 8 AM – 8 PM</small></span><i class="e3-chev" aria-hidden="true">›</i></a><a class="hp-row" href="mailto:support@kabana.ph?subject=Vendor%20app%20support"><span class="hp-ic"><i class="hgi-stroke hgi-mail-01" aria-hidden="true"></i></span><span><strong>Email support</strong><small>support@kabana.ph</small></span><i class="e3-chev" aria-hidden="true">›</i></a></section>'
    +'<div class="e4-sec"><h3>Common questions</h3></div><section class="en-card hp-card">'+hpTopics.map(t=>row('data-hp-topic="'+t.id+'"','',t.title,'')).join('')+'</section>'
    +'<section class="en-card hp-card hp-gap">'+row('data-hp-report','bug-01','Report a problem','Something not working? Tell us.')+'</section>'
    +'<section class="en-card hp-card">'+row('data-hp-legal="terms"','','Terms of service','')+row('data-hp-legal="privacy"','','Privacy policy','')+'</section>'
    +'<p class="hp-version">App version '+hpVersion+'</p></div>';
}
window.cabanaHelpPage=hpPage;
const viewBeforeHp=view;
view=function(){if(state.page==='help'){try{return window.cabanaHelpPage()}catch(e){console.error('Help render failed',e);return '<div class="hp"></div>'}}return viewBeforeHp.apply(this,arguments)};
const hpGo=sub=>{state.hpSub=sub;render();const p=document.querySelector('.page');if(p)p.scrollTop=0};
window.addEventListener('click',event=>{
  const t=event.target;
  const menu=t.closest?.('[data-toast="Help center opened"]');
  if(menu){event.preventDefault();event.stopImmediatePropagation();state.page='help';state.hpSub=null;render();const p=document.querySelector('.page');if(p)p.scrollTop=0;return}
  if(state.page!=='help')return;
  const chat=t.closest?.('[data-hp-chat]'),topic=t.closest?.('[data-hp-topic]'),q=t.closest?.('[data-hp-q]'),rep=t.closest?.('[data-hp-report]'),legal=t.closest?.('[data-hp-legal]'),send=t.closest?.('[data-hp-send]');
  if(!chat&&!topic&&!q&&!rep&&!legal&&!send)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(chat)return hpOpenChat();
  if(topic)return hpGo('topic:'+topic.dataset.hpTopic);
  if(q)return hpGo('q:'+q.dataset.hpQ);
  if(rep){state.hpReport=null;state.hpTried=false;return hpGo('report')}
  if(legal)return hpGo(legal.dataset.hpLegal);
  if(send){const r=state.hpReport;if(!r||!r.text.trim()){state.hpTried=true;render();document.querySelector('[data-hp-text]')?.focus();return}state.hpReport=null;state.hpTried=false;hpGo(null);toast('Thanks. We got your report and will reply in Chat.')}
},true);
const renderBeforeHp=render;
render=function(){
  if(state.page!=='help')state.hpSub=null;
  renderBeforeHp.apply(this,arguments);
  if(state.page!=='help')return;
  const page=document.querySelector('.page');if(page&&!page.querySelector('.hp'))page.innerHTML=hpPage();
  const sub=state.hpSub,bar=document.querySelector('.topbar');if(!bar)return;
  let tx='Help & support';if(sub&&sub.startsWith('topic:'))tx=hpTopics.find(x=>x.id===sub.slice(6))?.title||tx;else if(sub&&sub.startsWith('q:'))tx=hpTopics.find(x=>x.id===sub.slice(2).split(':')[0])?.title||tx;else if(sub==='report')tx='Report a problem';else if(sub==='terms')tx='Terms of service';else if(sub==='privacy')tx='Privacy policy';
  const title=bar.querySelector('.topbar-context strong, h1');if(title)title.textContent=tx;
  let back=bar.querySelector('[data-profile-back]');
  if(!back){bar.classList.add('profile-topbar');back=document.createElement('button');back.type='button';back.className='profile-back';back.setAttribute('data-profile-back','');back.textContent='←';bar.prepend(back)}
  back.onclick=()=>{if(sub&&sub.startsWith('q:'))return hpGo('topic:'+sub.slice(2).split(':')[0]);if(sub)return hpGo(null);state.page='menu';render()};
  const txt=document.querySelector('[data-hp-text]'),bk=document.querySelector('[data-hp-booking]'),file=document.querySelector('[data-hp-file]');
  if(txt)txt.oninput=()=>{state.hpReport.text=txt.value};
  if(bk)bk.oninput=()=>{state.hpReport.booking=bk.value};
  if(file)file.onchange=()=>{const f=file.files?.[0];if(f){state.hpReport.file=f.name;render()}};
  document.querySelectorAll('.bottom-nav [data-page="menu"], nav [data-page="menu"]').forEach(b=>b.classList.add('active'));
};
render();
/* Kabana support thread: label it as support, not Front Desk. */
const renderBeforeHpChat=render;
render=function(){renderBeforeHpChat.apply(this,arguments);if(state.page!=='chat'||state.cx?.threadId!=='kabana-support')return;const w=document.createTreeWalker(document.querySelector('.page')||document.body,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){if(/Front Desk · Kabana support/.test(n.nodeValue))n.nodeValue=n.nodeValue.replace('Front Desk · Kabana support','Support · Usually replies within 1 hour')}};
render();

/* ===== Step 1 Photos: up to 8, first is the cover; multi-select add, ✕ remove, long-press drag to reorder, per-photo upload state. ===== */
const LCP_MAX=8;
function lcpPending(){state.lc.pending=state.lc.pending||[];return state.lc.pending}
function lcPhotosMarkup(d,noCover){
  const pending=lcpPending(),total=d.photos.length+pending.length;
  const head='<div class="lcp-head"><span class="lc1-label">Photos</span><span class="lcp-count">'+(total?total+' of '+LCP_MAX:'Up to '+LCP_MAX)+'</span></div>';
  const input='<input type="file" accept="image/*" multiple data-lcp-add hidden>';
  const err=noCover&&!total?'<small class="lc1-error" role="alert">Add at least 1 photo</small>':'';
  if(!total)return '<div class="lcp">'+head+'<label class="lcp-empty'+(noCover?' has-error':'')+'" tabindex="0"><span class="lc1-cover-icon" aria-hidden="true"><i class="hgi-stroke hgi-camera-01"></i></span><strong>Add photos</strong><small>The first photo is your cover</small>'+input+'</label>'+err+'</div>';
  const tile=(src,i)=>'<div class="lcp-tile'+(i===0?' is-cover':'')+'" data-lcp-tile="'+i+'"><img src="'+src+'" alt="'+(i===0?'Cover photo':'Photo '+(i+1))+'" draggable="false">'+(i===0?'<span class="lcp-cover-tag">Cover</span>':'')+'<button type="button" class="lcp-remove" data-lcp-remove="'+i+'" aria-label="Remove photo">'+'<i class="hgi-stroke hgi-cancel-01" aria-hidden="true"></i></button></div>';
  const pend=p=>'<div class="lcp-tile is-'+p.status+'"><img src="'+p.src+'" alt="" draggable="false"><span class="lcp-state">'+(p.status==='failed'?'<button type="button" class="lcp-retry" data-lcp-retry="'+p.id+'" aria-label="Retry upload"><i class="hgi-stroke hgi-reload" aria-hidden="true"></i></button>':'<span class="lcp-spinner" aria-label="Uploading"></span>')+'</span><button type="button" class="lcp-remove" data-lcp-drop="'+p.id+'" aria-label="Remove photo"><i class="hgi-stroke hgi-cancel-01" aria-hidden="true"></i></button></div>';
  const cover=d.photos.length?tile(d.photos[0],0):pend(pending[0]);
  const rest=d.photos.slice(1).map((src,k)=>tile(src,k+1)).concat((d.photos.length?pending:pending.slice(1)).map(pend));
  const add=total<LCP_MAX?'<label class="lcp-add" aria-label="Add photos"><span aria-hidden="true">+</span><small>Add</small>'+input+'</label>':'';
  return '<div class="lcp">'+head+'<div class="lcp-grid" data-lcp-grid>'+cover+rest.join('')+add+'</div>'+(d.photos.length>1?'<small class="lcp-hint">Hold and drag to reorder</small>':'')+'</div>';
}
function lcpRerender(){const page=document.querySelector('.page'),top=page?.scrollTop||0;render();const p=document.querySelector('.page');if(p)p.scrollTop=top}
function lcpUpload(item){
  item.status='uploading';
  setTimeout(()=>{
    const list=lcpPending(),i=list.indexOf(item);if(i<0)return;
    if(!navigator.onLine){item.status='failed'}
    else{list.splice(i,1);state.lc.data.photos.push(item.src)}
    if(state.page==='listings'&&state.lc?.open&&state.lc.step===1)lcpRerender();
  },700+Math.random()*600);
}
async function lcpAdd(files){
  const d=state.lc.data,room=LCP_MAX-d.photos.length-lcpPending().length;
  const images=[...(files||[])].filter(f=>/^image\//.test(f.type));
  if(images.length>room)toast('You can add up to '+LCP_MAX+' photos');
  for(const file of images.slice(0,Math.max(0,room))){const src=await lcResize(file);if(src){const item={id:'p'+Date.now()+Math.random().toString(36).slice(2,6),src,status:'uploading'};lcpPending().push(item);lcpUpload(item)}}
  lcpRerender();
}
const renderBeforeLcPhotos=render;
render=function(){
  renderBeforeLcPhotos.apply(this,arguments);
  if(state.page!=='listings'||!state.lc?.open||state.lc.step!==1)return;
  const d=state.lc.data;
  const next=document.querySelector('[data-lc-next]');
  if(next){const ready=Boolean(d.name.trim()&&d.photos.length);next.classList.toggle('is-waiting',!ready);next.setAttribute('aria-disabled',String(!ready))}
  document.querySelectorAll('[data-lcp-add]').forEach(input=>input.onchange=()=>{lcpAdd(input.files);input.value=''});
  document.querySelector('.lcp-empty')?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.currentTarget.querySelector('input')?.click()}});
  document.querySelectorAll('[data-lcp-remove]').forEach(b=>b.onclick=e=>{e.stopPropagation();d.photos.splice(Number(b.dataset.lcpRemove),1);lcpRerender()});
  document.querySelectorAll('[data-lcp-drop]').forEach(b=>b.onclick=()=>{const list=lcpPending(),i=list.findIndex(p=>p.id===b.dataset.lcpDrop);if(i>=0)list.splice(i,1);lcpRerender()});
  document.querySelectorAll('[data-lcp-retry]').forEach(b=>b.onclick=()=>{const item=lcpPending().find(p=>p.id===b.dataset.lcpRetry);if(item){lcpUpload(item);lcpRerender()}});
  lcpBindDrag(d);
};
/* Long-press (350ms) a photo, then drag; dropping on another tile moves it there. Index 0 = cover. */
let lcpDrag=null;
function lcpBindDrag(d){
  const grid=document.querySelector('[data-lcp-grid]');if(!grid)return;
  grid.querySelectorAll('[data-lcp-tile]').forEach(tile=>{
    tile.oncontextmenu=e=>e.preventDefault();
    tile.onpointerdown=e=>{
      if(e.target.closest('.lcp-remove')||d.photos.length<2)return;
      const from=Number(tile.dataset.lcpTile),sx=e.clientX,sy=e.clientY;
      const timer=setTimeout(()=>{
        lcpDrag={from,to:from,tile,sx,sy};tile.classList.add('is-lifted');grid.classList.add('is-sorting');
        navigator.vibrate?.(15);
      },350);
      const move=ev=>{
        if(!lcpDrag){if(Math.hypot(ev.clientX-sx,ev.clientY-sy)>8){clearTimeout(timer);end(false)}return}
        ev.preventDefault();
        tile.style.transform='translate('+(ev.clientX-sx)+'px,'+(ev.clientY-sy)+'px) scale(1.04)';
        tile.style.pointerEvents='none';
        const over=document.elementFromPoint(ev.clientX,ev.clientY)?.closest?.('[data-lcp-tile]');
        grid.querySelectorAll('.is-target').forEach(n=>n.classList.remove('is-target'));
        if(over&&over!==tile){over.classList.add('is-target');lcpDrag.to=Number(over.dataset.lcpTile)}else if(!over)lcpDrag.to=lcpDrag.from;
      };
      const end=commit=>{
        clearTimeout(timer);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cancel);
        const drag=lcpDrag;lcpDrag=null;if(!drag)return;
        if(commit&&drag.to!==drag.from){const [src]=d.photos.splice(drag.from,1);d.photos.splice(drag.to,0,src);if(drag.to===0)toast('Cover photo updated')}
        lcpRerender();
      };
      const up=()=>end(true),cancel=()=>end(false);
      window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',up);window.addEventListener('pointercancel',cancel);
    };
  });
}
document.addEventListener('touchmove',e=>{if(lcpDrag)e.preventDefault()},{passive:false});
render();

/* Dev tool: "Reset page" wipes saved demo state and reloads the same screen blank (same page and role; Create listing reopens empty at Step 1). */
devTools=(function(base){return function(){return base.apply(this,arguments).replace(/<button data-dev-reset-simulations>[^<]*<\/button>/,'<button data-dev-reset-simulations>Reset page</button>')}})(devTools);
window.addEventListener('click',event=>{
  if(!event.target.closest?.('[data-dev-reset-simulations]'))return;
  event.preventDefault();event.stopImmediatePropagation();
  const page=state.page==='insights'?'dashboard':state.page||'dashboard',keep={'cabana:dev-position':localStorage.getItem('cabana:dev-position')};
  const wipe=()=>{try{Object.keys(localStorage).filter(k=>k.startsWith('cabana:')).forEach(k=>localStorage.removeItem(k));Object.entries(keep).forEach(([k,v])=>{if(v!=null)localStorage.setItem(k,v)})}catch(e){}};
  window.__cabanaResumeReady=false;try{cabanaBooting=true}catch(e){}
  wipe();window.addEventListener('pagehide',wipe);window.addEventListener('beforeunload',wipe);
  try{sessionStorage.clear();sessionStorage.setItem('cabana:dev-reset-screen',JSON.stringify({page,role:state.role||'Owner',lcNew:Boolean(page==='listings'&&state.lc?.open)}))}catch(e){}
  location.replace(location.pathname+location.search+'#view='+encodeURIComponent(page));
  location.reload();
},true);
(()=>{let screen=null;try{screen=JSON.parse(sessionStorage.getItem('cabana:dev-reset-screen')||'null');sessionStorage.removeItem('cabana:dev-reset-screen')}catch(e){}
  if(!screen)return;
  const apply=()=>{state.role=screen.role||'Owner';state.page=screen.page;if(screen.lcNew)lcOpen(null,false);else render();const p=document.querySelector('.page');if(p)p.scrollTop=0};
  apply();setTimeout(apply,60);
})();
render();
