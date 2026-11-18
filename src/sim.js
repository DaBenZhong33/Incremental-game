export const RES={clay:{name:'泥土',color:0x936e48},wet:{name:'湿坯',color:0x8a6348},adobe:{name:'土坯',color:0xc3a174,value:2},polished:{name:'精制砖',color:0xd7bc8d,value:4},blue:{name:'青砖',color:0x71898b,value:7},wood:{name:'木柴',color:0x715337}};
export const DEF={
 pit:{name:'取土坑',source:'clay'},forest:{name:'柴木堆',source:'wood'},
 mold:{name:'制坯台',cost:16,time:2.5,input:{clay:2},output:'wet',desc:'2 泥土 → 1 湿坯 · 2.5 秒'},
 dryer:{name:'晾晒架',cost:18,time:4,input:{wet:1},output:'adobe',desc:'1 湿坯 → 1 土坯 · 4 秒'},
 grinder:{name:'研磨台',cost:38,time:3,input:{adobe:1},output:'polished',unlock:24,desc:'土坯 → 精制砖 · 3 秒 · 砌筑得 4 工分'},
 kiln:{name:'砖窑',cost:60,time:3.5,input:{polished:1,wood:1},output:'blue',unlock:64,desc:'精制砖 + 木柴 → 青砖 · 3.5 秒 · 砌筑得 7 工分'},
 storage:{name:'中转料箱',cost:10,desc:'存放任意物料，作为线路中转 · 容量 160'},depot:{name:'前线仓',desc:'收纳砖块，供这一段城墙施工'}
};
export const ROUTES={belt:{name:'传送带',cost:8,range:18,height:2.5,rate:1.4,speed:3,desc:'最大 18 米 / 高差 2.5 米 · 1.4 件每秒'},porter:{name:'搬运路线',cost:28,range:38,height:20,rate:.55,speed:2.8,desc:'自带一名搬运工 · 最大 38 米 · 0.55 件每秒'},lift:{name:'提升索道',cost:30,range:34,height:14,rate:1.8,speed:4,unlock:64,desc:'最大 34 米 / 高差 14 米 · 1.8 件每秒'}};
export const TOTAL=192;
export const height=(x,z)=>Math.max(0,Math.min(12,(-z-8)*.22));
export const wallPos=i=>({x:8,z:2-i*2.7});
export const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);
export function createGame(){return {version:2,tools:{wood:true,iron:false},equipped:"wood",cart:null,coins:24,time:0,placed:0,wall:Array(24).fill(0),wallKinds:Array(24).fill('adobe'),nodes:[
 {id:1,type:'pit',x:-16,z:8,rot:0,input:{},out:{},progress:0,fixed:true},
 {id:2,type:'forest',x:-19,z:-1,rot:0,input:{},out:{},progress:0,fixed:true},
 {id:3,type:'mold',x:-11,z:2,rot:0,input:{},out:{},progress:0,fixed:true},
 {id:4,type:'dryer',x:-5,z:2,rot:0,input:{},out:{},progress:0,fixed:true},
 ...[0,1,2].map(sector=>({id:5+sector,type:'depot',sector,x:13,z:2-sector*21.6,rot:0,input:{},out:{},progress:0,fixed:true}))],routes:[],nextId:8,bag:{type:null,n:0},upgrades:{dig:0,wood:0,mason:0,bag:0,speed:0},player:{x:-3,z:15,yaw:0,pitch:-.08},lit:false,flags:{},masonAcc:0,digAcc:0,woodAcc:0};}
export const bagCap=s=>8+s.upgrades.bag*4;
export const front=s=>s.wall.findIndex(n=>n<8);
export const sector=s=>Math.min(2,Math.floor((front(s)<0?23:front(s))/8));
export const depot=s=>s.nodes.find(n=>n.type==='depot'&&n.sector===sector(s));
export const nodeById=(s,id)=>s.nodes.find(n=>n.id===id);
export const output=n=>(n.type==='storage'||n.type==='depot')?n.input:n.out;
export const capacity=n=>n.type==='storage'||n.type==='depot'?160:48;
export const accepts=(n,r)=>n.type==='storage'||(n.type==='depot'?!!RES[r]?.value:!!DEF[n.type]?.input?.[r]);
export function deposit(s,n,bag=s.bag){if(!bag.n)return {error:'没有可放入的物料'};if(!accepts(n,bag.type))return {error:'此设备不接收'+RES[bag.type].name};const count=Math.min(bag.n,capacity(n)-sum(n.input));if(count<=0)return {error:'设备入料区已满'};n.input[bag.type]=(n.input[bag.type]||0)+count;bag.n-=count;if(!bag.n)bag.type=null;return {count};}
export function take(s,n,raw=false,bag=s.bag,cap=bagCap(s)){const inv=raw?n.input:output(n),r=bag.n?bag.type:Object.keys(inv).find(k=>inv[k]>0);if(!r||!inv[r])return {error:'暂时没有可取的物料'};const count=Math.min(inv[r],cap-bag.n);if(!count)return {error:'已装满'};inv[r]-=count;bag.type=r;bag.n+=count;if(raw)n.progress=0;return {count};}
export function gather(s,type,amount=1,bag=s.bag,cap=bagCap(s)){if(bag.n&&bag.type!==type)return {error:'先卸下'+RES[bag.type].name};const count=Math.min(amount,cap-bag.n);if(count<=0)return {error:'已装满'};bag.type=type;bag.n+=count;return {count};}
export const TOOLS={wood:{name:'木铲',cost:0,amount:1,interval:.4},iron:{name:'铁锹',cost:12,unlock:4,amount:2,interval:.32}};
export const CART={cost:40,capacity:24};
export function buyTool(s,key){const d=TOOLS[key];if(!d)return {error:'未知工具'};if(s.tools[key]){s.equipped=key;return {ok:true};}if(s.placed<(d.unlock||0))return {error:'先砌筑 '+d.unlock+' 块砖'};if(s.coins<d.cost)return {error:'工分不足'};s.coins-=d.cost;s.tools[key]=true;s.equipped=key;return {ok:true};}
export function cartSite(s,x,z){const error=validSite(s,'storage',x,z);if(error)return error;if(Math.hypot(s.player.x-x,s.player.z-z)<2)return '请离放置位置稍远一些';return '';}
export function buyCart(s,x,z,yaw=0){if(s.cart)return {error:'已经拥有独轮车'};const error=cartSite(s,x,z);if(error)return {error};if(s.coins<CART.cost)return {error:'工分不足'};s.coins-=CART.cost;s.cart={x,z,yaw,load:{type:null,n:0}};return {ok:true};}
export function transferLoad(from,to,cap){if(!from.n)return {error:'没有可搬运的物料'};if(to.n&&to.type!==from.type)return {error:'先卸下'+RES[to.type].name};const count=Math.min(from.n,cap-to.n);if(count<=0)return {error:'已装满'};to.type=from.type;to.n+=count;from.n-=count;if(!from.n)from.type=null;return {count};}
export function placeBrick(s,fromBag=false){const i=front(s);if(i<0)return false;const inv=fromBag?{[s.bag.type]:s.bag.n}:depot(s).input;const r=['blue','polished','adobe'].find(k=>inv[k]>0);if(!r)return false;if(fromBag){s.bag.n--;if(!s.bag.n)s.bag.type=null;}else inv[r]--;s.wall[i]++;s.wallKinds[i]=r;s.placed++;s.coins+=RES[r].value;if(s.placed%64===0)s.coins+=40;return true;}
export function validSite(s,type,x,z){if(!DEF[type]?.cost)return '不能建造此设施';if(Math.abs(x)>29||z>20||z< -65)return '请选择营地区域内的地面';if(Math.abs(x-8)<3&&z<5)return '不能占用城墙施工区域';if(s.cart&&Math.hypot(s.cart.x-x,s.cart.z-z)<2.5)return '不能占用独轮车的位置';if(s.nodes.some(n=>Math.hypot(n.x-x,n.z-z)<3.4))return '与现有设备太近';return '';}
export function addNode(s,type,x,z,rot=0){const d=DEF[type];if(!d?.cost)return {error:'未知设备'};if(s.placed<(d.unlock||0))return {error:'砌筑 '+d.unlock+' 块后解锁'};const error=validSite(s,type,x,z);if(error)return {error};if(s.coins<d.cost)return {error:'工分不足'};const n={id:s.nextId++,type,x,z,rot,input:{},out:{},progress:0,paid:d.cost};s.coins-=d.cost;s.nodes.push(n);return {node:n};}
export function addRoute(s,from,to,type){const a=nodeById(s,from),b=nodeById(s,to),d=ROUTES[type];if(!a||!b||a===b||!d)return {error:'请选择不同的起点和终点'};if(s.placed<(d.unlock||0))return {error:'砌筑 '+d.unlock+' 块后解锁'};if(s.routes.some(r=>r.from===from&&r.to===to))return {error:'这两个设施已经连接'};const keys=DEF[a.type].source?[DEF[a.type].source]:DEF[a.type].output?[DEF[a.type].output]:Object.keys(RES);if(!keys.some(k=>accepts(b,k)))return {error:'这两台设备的物料不匹配'};if(Math.hypot(a.x-b.x,a.z-b.z)>d.range)return {error:'距离太远，请设置中转料箱'};if(Math.abs(height(a.x,a.z)-height(b.x,b.z))>d.height)return {error:'坡度过大，请改用搬运工或提升索道'};if(s.coins<d.cost)return {error:'工分不足'};s.coins-=d.cost;const route={id:s.nextId++,from,to,type,acc:0,items:[],paid:d.cost};s.routes.push(route);return {route};}
export function removeRoute(s,id){const r=s.routes.find(r=>r.id===id);if(!r)return;const a=nodeById(s,r.from);for(const item of r.items){const inv=output(a);inv[item.kind]=(inv[item.kind]||0)+1;}s.coins+=r.paid;s.routes=s.routes.filter(x=>x!==r);}
export function removeNode(s,id){const n=nodeById(s,id);if(!n||n.fixed)return {error:'初始营地设施不能回收'};if(s.routes.some(r=>r.from===id||r.to===id))return {error:'请先在营造册回收连接的线路'};if(sum(n.input)+sum(n.out)>0||n.progress>0)return {error:'先取走物料；Shift + E 取回未加工原料'};s.nodes=s.nodes.filter(v=>v!==n);s.coins+=n.paid;return {ok:true};}
export const upgradeCost=(s,k)=>Math.round(({dig:22,wood:20,mason:32,bag:18,speed:24}[k]||999)*Math.pow(1.65,s.upgrades[k]||0));
export function upgrade(s,k){if(!(k in s.upgrades))return false;const c=upgradeCost(s,k);if(s.coins<c||s.upgrades[k]>=5)return false;s.coins-=c;s.upgrades[k]++;return true;}
export function status(n){const d=DEF[n.type];if(d.source)return '手工采集 / 工人供料';if(!d.input)return sum(n.input)+' / '+capacity(n)+' 件库存';if(sum(n.out)>=32)return '出口已满';if(!Object.entries(d.input).every(([k,v])=>(n.input[k]||0)>=v))return '缺少 '+Object.entries(d.input).filter(([k,v])=>(n.input[k]||0)<v).map(([k])=>RES[k].name).join('、');return '加工中 '+Math.floor(n.progress/d.time*100)+'%';}
export function tick(s,dt){if(!Number.isFinite(dt)||dt<=0)return;s.time+=dt;
 for(const [key,kind,id,acc] of [['dig','clay',1,'digAcc'],['wood','wood',2,'woodAcc']]){const n=nodeById(s,id);s[acc]+=s.upgrades[key]*(key==='dig'?1.2:.45)*dt;while(s[acc]>=1&&sum(n.out)<160){s[acc]--;n.out[kind]=(n.out[kind]||0)+1;}s[acc]=Math.min(s[acc],1);}
 for(const n of s.nodes){const d=DEF[n.type];if(!d.input)continue;if(sum(n.out)>=32||!Object.entries(d.input).every(([k,v])=>(n.input[k]||0)>=v))continue;n.progress+=dt;while(n.progress>=d.time&&sum(n.out)<32&&Object.entries(d.input).every(([k,v])=>(n.input[k]||0)>=v)){n.progress-=d.time;for(const [k,v] of Object.entries(d.input))n.input[k]-=v;n.out[d.output]=(n.out[d.output]||0)+1;}if(sum(n.out)>=32)n.progress=Math.min(n.progress,d.time);}
 for(const r of s.routes){const a=nodeById(s,r.from),b=nodeById(s,r.to),d=ROUTES[r.type];const distance=Math.hypot(a.x-b.x,a.z-b.z,height(a.x,a.z)-height(b.x,b.z));for(const item of r.items)item.p=Math.min(1,item.p+dt*d.speed/Math.max(1,distance));for(let i=r.items.length-1;i>=0;i--){const item=r.items[i];if(item.p>=1&&sum(b.input)<capacity(b)){b.input[item.kind]=(b.input[item.kind]||0)+1;r.items.splice(i,1);}}
 r.acc=Math.min(1,r.acc+d.rate*dt);const inv=output(a);if(r.acc>=1&&r.items.length<Math.max(3,Math.ceil(distance/1.2))&&sum(b.input)<capacity(b)){const kind=Object.keys(inv).find(k=>inv[k]>0&&accepts(b,k));if(kind){inv[kind]--;r.items.push({kind,p:0});r.acc--;}}}
 s.masonAcc=Math.min(1,s.masonAcc+s.upgrades.mason*.55*dt);if(s.masonAcc>=1&&placeBrick(s))s.masonAcc--;
}
export function validateSave(raw){if(!raw||raw.version!==2)throw Error('存档版本不匹配');const finite=(v,min=0,max=1e8)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;const integer=(v,min=0,max=1e8)=>Number.isInteger(v)&&finite(v,min,max);const inv=o=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.entries(o).every(([k,v])=>RES[k]&&integer(v,0,100000));
 if(!integer(raw.coins)||!finite(raw.time)||!integer(raw.placed,0,TOTAL)||!Array.isArray(raw.wall)||raw.wall.length!==24||!raw.wall.every(v=>integer(v,0,8))||sum(raw.wall)!==raw.placed)throw Error('施工数据无效');let gap=false;for(const n of raw.wall){if(gap&&n>0)throw Error('施工顺序无效');if(n<8)gap=true;}
 if(!Array.isArray(raw.wallKinds)||raw.wallKinds.length!==24||!raw.wallKinds.every(k=>RES[k]?.value))throw Error('砖材记录无效');if(!raw.upgrades||!['dig','wood','mason','bag','speed'].every(k=>integer(raw.upgrades[k],0,5)))throw Error('升级数据无效');
 if(!raw.tools||raw.tools.wood!==true||typeof raw.tools.iron!=='boolean'||!Object.hasOwn(TOOLS,raw.equipped)||!raw.tools[raw.equipped])throw Error('工具记录无效');
 if(raw.cart!==null){const c=raw.cart;if(!c||!finite(c.x,-30,30)||!finite(c.z,-69,22)||!finite(c.yaw,-1e6,1e6)||!c.load||!integer(c.load.n,0,CART.capacity)||(c.load.n>0&&!Object.hasOwn(RES,c.load.type))||(c.load.n===0&&c.load.type!==null))throw Error('独轮车记录无效');}
 if(!raw.bag||!integer(raw.bag.n,0,bagCap(raw))||(raw.bag.n>0&&!RES[raw.bag.type])||(raw.bag.n===0&&raw.bag.type!==null))throw Error('背篓数据无效');if(!raw.player||!finite(raw.player.x,-32,32)||!finite(raw.player.z,-72,24)||!finite(raw.player.yaw,-1e6,1e6)||!finite(raw.player.pitch,-1.5,1.5))throw Error('角色坐标无效');
 if(!Array.isArray(raw.nodes)||raw.nodes.length>250||raw.nodes.length<7)throw Error('设施数据无效');const ids=new Set();for(const n of raw.nodes){if(!integer(n.id,1)||ids.has(n.id)||!DEF[n.type]||!finite(n.x,-32,32)||!finite(n.z,-72,24)||!finite(n.rot,-1e6,1e6)||!inv(n.input)||!inv(n.out)||!finite(n.progress,0,20)||(!n.fixed&&!integer(n.paid)))throw Error('设施记录无效');ids.add(n.id);}
 for(const n of createGame().nodes){const a=raw.nodes.find(x=>x.id===n.id);if(!a||a.type!==n.type||a.x!==n.x||a.z!==n.z||!a.fixed||(n.type==='depot'&&a.sector!==n.sector))throw Error('初始营地记录无效');}
 if(!Array.isArray(raw.routes)||raw.routes.length>500)throw Error('线路数据无效');for(const r of raw.routes){if(!integer(r.id,1)||ids.has(r.id)||!nodeById(raw,r.from)||!nodeById(raw,r.to)||r.from===r.to||!ROUTES[r.type]||!finite(r.acc,0,1)||!integer(r.paid)||!Array.isArray(r.items)||r.items.length>100||!r.items.every(i=>RES[i.kind]&&finite(i.p,0,1)))throw Error('线路记录无效');ids.add(r.id);}
 if(!integer(raw.nextId,8)||raw.nextId<=Math.max(...ids)||typeof raw.lit!=='boolean'||(raw.lit&&raw.placed!==TOTAL)||!['masonAcc','digAcc','woodAcc'].every(k=>finite(raw[k],0,1)))throw Error('存档状态无效');if(raw.loose!==undefined&&(!Array.isArray(raw.loose)||raw.loose.length>1000||!raw.loose.every(d=>Object.hasOwn(RES,d.kind)&&finite(d.x,-32,32)&&finite(d.z,-72,24)&&finite(d.y,-5,100))))throw Error('散落物料记录无效');raw.flags=raw.flags&&typeof raw.flags==='object'?raw.flags:{};return raw;
}
