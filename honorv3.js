/* honor.js — النقاط والألقاب ولوحة الشرف */
(function(){
  const SA=[7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
  const OWNER_EMAILS=['tedate101@gmail.com'],OWNER_NAME='وائل محمد';
  const J=(k,d)=>{try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}};
  const W=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
  // [الحد الأدنى للنقاط، الرمز، اللقب]
  const TIERS=[[0,'🌱','طالب مبتدئ'],[200,'📗','مجتهد'],[600,'🌿','مثابر'],[1500,'⭐','متقن'],[3500,'🏅','مرتّل'],[7000,'👑','صاحب همّة عالية'],[15000,'🌙','نجم التسميع']];
  function tier(p){let t=0;TIERS.forEach((x,i)=>{if(p>=x[0])t=i});return{i:t,emoji:TIERS[t][1],name:TIERS[t][2],from:TIERS[t][0],next:TIERS[t+1]||null}}
  function compute(){
    let ay=0,su=0,vd=0,qz=0;
    for(let i=1;i<=114;i++){const r=J('recited_surah_'+i,[]);ay+=r.length;if(r.length>=SA[i-1])su++}
    for(let k=0;k<localStorage.length;k++){const key=localStorage.key(k);
      if(key.startsWith('vid_done_'))vd++;if(key.startsWith('tajweed_pass_')&&localStorage.getItem(key)==='1')qz++}
    return{ayahs:ay,surahs:su,videos:vd,quizzes:qz,points:ay*10+su*100+vd*50+qz*100};
  }
  function weekKey(){const d=new Date(),t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())),day=t.getUTCDay()||7;
    t.setUTCDate(t.getUTCDate()+4-day);const y=new Date(Date.UTC(t.getUTCFullYear(),0,1));
    return t.getUTCFullYear()+'-W'+Math.ceil(((t-y)/864e5+1)/7)}
  async function publish(){
    const F=window.QuranFirebase;if(!F)return false;await F.ready;if(!F.isLoggedIn)return false;
    const c=compute(),wk=weekKey(),last=J('lb_last',c.points);let base=J('lb_base',null);
    if(!base||base.week!==wk){base={week:wk,points:last};W('lb_base',base)}
    W('lb_last',c.points);
    const isOwner=!!(F.user.email&&OWNER_EMAILS.includes(F.user.email.toLowerCase()));
    if(isOwner)W('lb_leader',true);
    const alias=String(J('lb_alias','')||'').replace(/[<>&"]/g,'').trim().slice(0,24);
    const name=isOwner?OWNER_NAME:(alias||String(localStorage.getItem('studentName')||F.user.displayName||'طالب').slice(0,40));
    await F.db.collection('leaderboard').doc(F.user.uid).set({name,points:c.points,ayahs:c.ayahs,surahs:c.surahs,videos:c.videos,quizzes:c.quizzes,
      title:tier(c.points).name,weekKey:wk,weekPoints:Math.max(0,c.points-base.points),hidden:!!J('lb_hidden',false),badge:isOwner?'owner':'',
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    return true;
  }
  let to;function publishSoon(){clearTimeout(to);to=setTimeout(()=>publish().catch(()=>{}),2500)}
  async function top(period){
    const F=window.QuranFirebase;await F.ready;let snap;
    if(period==='week')snap=await F.db.collection('leaderboard').where('weekKey','==',weekKey()).limit(200).get();
    else snap=await F.db.collection('leaderboard').orderBy('points','desc').limit(100).get();
    const key=period==='week'?'weekPoints':'points';
    return snap.docs.map(d=>({uid:d.id,...d.data()})).filter(r=>!r.hidden&&(r[key]||0)>0).sort((a,b)=>(b[key]||0)-(a[key]||0)).slice(0,20);
  }
  async function refreshRank(){
    const F=window.QuranFirebase;await F.ready;if(!F.isLoggedIn)return null;
    const my=F.user.uid,[a,w]=await Promise.all([top('all'),top('week')]);
    const ra=a.findIndex(r=>r.uid===my)+1,rw=w.findIndex(r=>r.uid===my)+1;
    const owner=!!(F.user.email&&OWNER_EMAILS.includes(F.user.email.toLowerCase()));
    W('lb_rank_all',ra);W('lb_rank_week',rw);
    W('lb_leader',owner||(ra>=1&&ra<=10)||(rw>=1&&rw<=10));
    return{all:ra,week:rw};
  }
  // شارة توثيق على غرار فيسبوك: owner=أزرق، leader=ذهبي
  function badge(type,size){
    if(!type)return '';const c=type==='owner'?'#1d9bf0':'#d4a017',s=size||18;
    return `<svg class="bd" width="${s}" height="${s}" viewBox="0 0 24 24" style="vertical-align:-3px;margin-inline-start:3px"><title>${type==='owner'?'مطوّر التطبيق':'من المتصدرين'}</title><rect x="3.5" y="3.5" width="17" height="17" rx="3" fill="${c}"/><rect x="3.5" y="3.5" width="17" height="17" rx="3" fill="${c}" transform="rotate(45 12 12)"/><path d="M7.6 12.4l3 3 5.8-6.2" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  window.WMHonor={refreshRank,badge,isLeader:()=>J('lb_leader',false),OWNER_EMAILS,compute,tier,publish,publishSoon,top,weekKey,TIERS,setHidden:v=>W('lb_hidden',!!v),getAlias:()=>J('lb_alias',''),setAlias:v=>W('lb_alias',String(v||'').replace(/[<>&"]/g,'').trim().slice(0,24)),isHidden:()=>!!J('lb_hidden',false)};
})();
