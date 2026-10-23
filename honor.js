/* honor.js — النقاط والألقاب ولوحة الشرف */
(function(){
  const SA=[7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
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
    const name=String(localStorage.getItem('studentName')||F.user.displayName||'طالب').slice(0,40);
    await F.db.collection('leaderboard').doc(F.user.uid).set({name,points:c.points,ayahs:c.ayahs,surahs:c.surahs,videos:c.videos,quizzes:c.quizzes,
      title:tier(c.points).name,weekKey:wk,weekPoints:Math.max(0,c.points-base.points),hidden:!!J('lb_hidden',false),
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    return true;
  }
  let to;function publishSoon(){clearTimeout(to);to=setTimeout(()=>publish().catch(()=>{}),2500)}
  async function top(period){
    const F=window.QuranFirebase;await F.ready;let snap;
    if(period==='week')snap=await F.db.collection('leaderboard').where('weekKey','==',weekKey()).limit(200).get();
    else snap=await F.db.collection('leaderboard').orderBy('points','desc').limit(100).get();
    const key=period==='week'?'weekPoints':'points';
    return snap.docs.map(d=>({uid:d.id,...d.data()})).filter(r=>!r.hidden&&(r[key]||0)>0).sort((a,b)=>(b[key]||0)-(a[key]||0)).slice(0,50);
  }
  window.WMHonor={compute,tier,publish,publishSoon,top,weekKey,TIERS,setHidden:v=>W('lb_hidden',!!v),isHidden:()=>!!J('lb_hidden',false)};
})();
