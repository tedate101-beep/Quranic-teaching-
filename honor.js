/* honor.js — النقاط والألقاب ولوحة الشرف */
(function(){
  const SA=[7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
  const OWNER_EMAILS=['tedate101@gmail.com'],OWNER_NAME='وائل محمد';
  // ===== الإشراف: قائمة الحجب + الإبلاغ =====
  let banCache=null;
  const uidOf=r=>String((r&&r.uid)||r||'').split('_').pop();
  async function bans(force){
    if(banCache&&!force)return banCache;const F=window.QuranFirebase;await F.ready;
    try{const s=await F.db.collection('moderation').get();banCache={};s.docs.forEach(d=>banCache[d.id]=d.data())}catch(e){banCache={}}
    return banCache;
  }
  async function clean(rows){const b=await bans();
    return rows.filter(r=>!(b[uidOf(r)]&&b[uidOf(r)].hidden)).map(r=>{const m=b[uidOf(r)];return m&&m.rename?{...r,name:m.rename}:r})}
  async function report(uid,name,reason){
    const F=window.QuranFirebase;await F.ready;if(!F.isLoggedIn)throw new Error('login');
    const done=J('lb_reported',[]);if(done.includes(uidOf(uid)))return 'dup';
    await F.db.collection('reports').add({reportedUid:uidOf(uid),name:String(name||'').slice(0,60),reason:String(reason||'اسم مسيء').slice(0,100),by:F.user.uid,at:firebase.firestore.FieldValue.serverTimestamp()});
    done.push(uidOf(uid));W('lb_reported',done.slice(-100));return 'ok';
  }
  const J=(k,d)=>{try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}};
  const W=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
  // [الحد الأدنى للنقاط، الرمز، اللقب]
  // ===== المراتب (دوريات) والمواسم الشهرية =====
  const RANKS=[['🥉','برونزي'],['🥈','فضي'],['🥇','ذهبي'],['💎','بلاتيني'],['💠','ماسي'],['🔥','أسطوري']];
  const LTH={recite:[0,200,600,1500,3000,6000],read:[0,60,200,500,1000,1800]};
  function league(p,kind){const th=LTH[kind==='read'?'read':'recite'];let i=0;th.forEach((x,k)=>{if(p>=x)i=k});
    return{i,emoji:RANKS[i][0],name:RANKS[i][1],from:th[i],next:th[i+1]!=null?th[i+1]:null}}
  const MONTHS=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const seasonKey=d=>{d=d||new Date();return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')};
  const seasonName=k=>{const [y,m]=k.split('-').map(Number);return MONTHS[m-1]+' '+y};
  const seasonLeft=()=>{const d=new Date();return Math.max(0,Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1)-Date.now())};
  function seasonPts(){const c=compute(),sb=J('ss_base',null);
    if(!sb||sb.season!==seasonKey())return{pts:0,readPts:0};
    return{pts:Math.max(0,c.points-sb.pts),readPts:Math.max(0,c.readPts-sb.rpts)}}
  async function seasonBoard(key,kind){
    const F=window.QuranFirebase;await F.ready;const R=kind==='read',f=R?'readPts':'pts';
    const snap=await F.db.collection('seasons').doc(key).collection('players').orderBy(f,'desc').limit(30).get();
    return (await clean(snap.docs.map(d=>({uid:d.id,...d.data()})).filter(r=>!r.hidden&&(r[f]||0)>0))).slice(0,20);
  }
  async function history(){
    const F=window.QuranFirebase;await F.ready;if(!F.isLoggedIn)return[];
    const out=[],now=new Date();
    for(let k=1;k<=6;k++){
      const key=seasonKey(new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-k,1)));let h=J('ss_h_'+key,null);
      if(!h){try{
        const doc=await F.db.collection('seasons').doc(key).collection('players').doc(F.user.uid).get();
        if(!doc.exists)h={none:true};
        else{const v=doc.data(),[a,b]=await Promise.all([seasonBoard(key,'recite'),seasonBoard(key,'read')]);
          h={pts:v.pts||0,readPts:v.readPts||0,pr:a.findIndex(r=>r.uid===F.user.uid)+1,pd:b.findIndex(r=>r.uid===F.user.uid)+1}}
        W('ss_h_'+key,h)}catch(e){continue}}
      if(!h.none)out.push({key,...h});
    }
    return out;
  }
  const RTIERS=[[0,'📘','قارئ مبتدئ'],[30,'📗','قارئ منتظم'],[100,'📚','مواظب'],[300,'🌟','قارئ مجتهد'],[604,'🕌','قارئ متمكّن'],[1500,'👑','صاحب ورد'],[3000,'🌙','نجم القراءة']];
  function rtier(p){let t=0;RTIERS.forEach((x,i)=>{if(p>=x[0])t=i});return{i:t,emoji:RTIERS[t][1],name:RTIERS[t][2],from:RTIERS[t][0],next:RTIERS[t+1]||null}}
  const TIERS=[[0,'🌱','طالب مبتدئ'],[200,'📗','مجتهد'],[600,'🌿','مثابر'],[1500,'⭐','متقن'],[3500,'🏅','مرتّل'],[7000,'👑','صاحب همّة عالية'],[15000,'🌙','نجم التسميع']];

  // ===== الدوري الشهري: مراتب (دوريات) تتجدد كل شهر، مع صعود ونزول =====
  const LEAGUES=[
    {n:'البرونزية',e:'🥉',c:'#cd7f32',up:400,stay:0},
    {n:'الفضية',e:'🥈',c:'#8e99a6',up:1200,stay:150},
    {n:'الذهبية',e:'🥇',c:'#d4af37',up:2500,stay:500},
    {n:'الماسية',e:'💎',c:'#2bb3d6',up:4500,stay:1200},
    {n:'الملكية',e:'👑',c:'#8e44ad',up:null,stay:2500}];
  const prevKey=k=>{let[y,m]=k.split('-').map(Number);m--;if(m<1){m=12;y--}return y+'-'+String(m).padStart(2,'0')};
    const daysLeft=()=>{const d=new Date();return Math.max(1,Math.ceil((Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1)-d.getTime())/864e5))};
  const seasonXP=(st,c)=>Math.max(0,(c.points-st.base.p)+(c.readPts-st.base.r));
  function seasonState(){
    const c=compute(),sk=seasonKey(),tot={p:c.points,r:c.readPts};let st=J('lg_state',null);
    if(!st){st={season:sk,league:0,base:tot,hist:[]};W('lg_state',st);return st}
    if(st.season<sk){                                  // موسم جديد: احسب نتيجة القديم وارفع أو أنزل المرتبة
      const xp=seasonXP(st,c),L=LEAGUES[st.league];let nl=st.league;
      if(L.up!=null&&xp>=L.up)nl=st.league+1;else if(xp<L.stay)nl=Math.max(0,st.league-1);
      const hist=[{s:st.season,xp,league:st.league,to:nl}].concat(st.hist||[]).slice(0,12);
      W('lg_msg',{season:st.season,xp,from:st.league,to:nl});
      st={season:sk,league:nl,base:tot,hist};W('lg_state',st);
    }
    return st;
  }
  const peekMsg=()=>J('lg_msg',null);
  const takeMsg=()=>{const m=J('lg_msg',null);if(m)localStorage.removeItem('lg_msg');return m};
  async function seasonRows(where){
    const F=window.QuranFirebase;await F.ready;let q=F.db.collection('seasons').where('season','==',where.season);
    if(where.league!=null)q=q.where('league','==',where.league);
    const snap=await q.limit(300).get();
    return clean(snap.docs.map(d=>({uid:d.id,...d.data()})).filter(r=>!r.hidden&&(r.xp||0)>0).sort((a,b)=>(b.xp||0)-(a.xp||0)));
  }
  const seasonTop=league=>seasonRows({season:seasonKey(),league}).then(r=>r.slice(0,20));
  const prevChampions=()=>seasonRows({season:prevKey(seasonKey())}).then(r=>r.slice(0,3));
  function tier(p){let t=0;TIERS.forEach((x,i)=>{if(p>=x[0])t=i});return{i:t,emoji:TIERS[t][1],name:TIERS[t][2],from:TIERS[t][0],next:TIERS[t+1]||null}}
  function compute(){
    let ay=0,su=0,vd=0,qz=0;
    for(let i=1;i<=114;i++){const r=J('recited_surah_'+i,[]);ay+=r.length;if(r.length>=SA[i-1])su++}
    for(let k=0;k<localStorage.length;k++){const key=localStorage.key(k);
      if(key.startsWith('vid_done_'))vd++;if(key.startsWith('tajweed_pass_')&&localStorage.getItem(key)==='1')qz++}
    const qp=+J('quiz_pts',0)||0,pg=+J('rd_total',0)||0,mp=+J('mission_pts',0)||0;
    return{ayahs:ay,surahs:su,videos:vd,quizzes:qz,quizPts:qp,pagesRead:pg,readPts:pg*3,points:ay*10+su*100+vd*50+qz*100+qp+mp};
  }
  function weekKey(){const d=new Date(),t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())),day=t.getUTCDay()||7;
    t.setUTCDate(t.getUTCDate()+4-day);const y=new Date(Date.UTC(t.getUTCFullYear(),0,1));
    return t.getUTCFullYear()+'-W'+Math.ceil(((t-y)/864e5+1)/7)}
  async function publish(){
    const F=window.QuranFirebase;if(!F)return false;await F.ready;if(!F.isLoggedIn)return false;
    const c=compute(),wk=weekKey(),last=J('lb_last',c.points);let base=J('lb_base',null);
    if(!base||base.week!==wk){base={week:wk,points:last};W('lb_base',base)}
    W('lb_last',c.points);
    const sk=seasonKey();let sb=J('ss_base',null);
    let rb=J('lb_rbase',null);const rl=J('lb_rlast',c.readPts);if(!rb||rb.week!==wk){rb={week:wk,pts:rl};W('lb_rbase',rb)}W('lb_rlast',c.readPts);
    if(!sb||sb.season!==sk){sb={season:sk,pts:last,rpts:rl};W('ss_base',sb)}
    const isOwner=!!(F.user.email&&OWNER_EMAILS.includes(F.user.email.toLowerCase()));
    if(isOwner)W('lb_leader',true);
    const alias=String(J('lb_alias','')||'').replace(/[<>&"]/g,'').trim().slice(0,24);
    const name=isOwner?OWNER_NAME:(alias||String(localStorage.getItem('studentName')||F.user.displayName||'طالب').slice(0,40));
    await F.db.collection('leaderboard').doc(F.user.uid).set({name,points:c.points,ayahs:c.ayahs,surahs:c.surahs,videos:c.videos,quizzes:c.quizzes,
      title:tier(c.points).name,weekKey:wk,weekPoints:Math.max(0,c.points-base.points),hidden:!!J('lb_hidden',false),badge:isOwner?'owner':'',readPts:c.readPts,pagesRead:c.pagesRead,readWeek:Math.max(0,c.readPts-rb.pts),
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    await F.db.collection('seasons').doc(sk).collection('players').doc(F.user.uid).set({name,badge:isOwner?'owner':'',hidden:!!J('lb_hidden',false),
      pts:Math.max(0,c.points-sb.pts),readPts:Math.max(0,c.readPts-sb.rpts),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    const st=seasonState(),sx=seasonXP(st,c);
    if(st.league>=3)W('lb_leader',true);
    await F.db.collection('seasons').doc(st.season+'_'+F.user.uid).set({season:st.season,uid:F.user.uid,name,xp:sx,league:st.league,
      badge:isOwner?'owner':'',hidden:!!J('lb_hidden',false),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    try{
      const rs={};for(let i=1;i<=114;i++){const n=J('recited_surah_'+i,[]).length;if(n)rs[i]=n}
      let jn=J('lb_joined',null);const today=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
      if(!jn){jn=today;W('lb_joined',jn)}
      await F.db.collection('stats').doc(F.user.uid).set({recSurahs:rs,ayahs:c.ayahs,pages:c.pagesRead,joined:jn,lastDay:today,
        ua:/Android/i.test(navigator.userAgent)?'android':/iPhone|iPad/i.test(navigator.userAgent)?'ios':'web',
        last:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    }catch(e){}
    try{ // مزامنة الحلقات التي انضم إليها المستخدم
      const today2=dkey(new Date());
      for(const code of J('hq_codes',[])){
        await F.db.collection('halaqat').doc(code).collection('members').doc(F.user.uid).set({name,points:c.points,readPts:c.readPts,ayahs:c.ayahs,pagesRead:c.pagesRead,
          streak:streakNow(),lastDay:today2,updated:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
      }
    }catch(e){}
    return true;
  }
  // ===== الإنجازات =====
  const dkey=d=>new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
  function streakNow(){const r=J('kh_read',{});let n=0,d=new Date();if(!(r[dkey(d)]||[]).length)d.setDate(d.getDate()-1);
    while((r[dkey(d)]||[]).length){n++;d.setDate(d.getDate()-1)}return n}
  function achievements(){
    const c=compute(),st=streakNow();if(st>J('ach_best',0))W('ach_best',st);const best=Math.max(st,J('ach_best',0));
    let ex=0;for(let k=0;k<localStorage.length;k++){const key=localStorage.key(k);if(key.startsWith('tajweed_pass_ex_')&&localStorage.getItem(key)==='1')ex++}
    const kh=localStorage.getItem('kh_finished')?1:0,rv=+J('rv_total',0)||0,qp=+J('quiz_pts',0)||0,mf=+J('ms_full',0)||0;
    const A=[['first','🌱','البداية','سمّع أول آية',c.ayahs,1],['a10','🎯','عشر آيات','سمّع 10 آيات',c.ayahs,10],['a100','💯','مئة آية','سمّع 100 آية',c.ayahs,100],
      ['a500','🌟','خمسمئة آية','سمّع 500 آية',c.ayahs,500],['a1000','👑','ألف آية','سمّع 1000 آية',c.ayahs,1000],
      ['s1','📗','سورة كاملة','أتمّ تسميع سورة',c.surahs,1],['s5','📚','خمس سور','أتمّ تسميع 5 سور',c.surahs,5],['s20','🏛️','عشرون سورة','أتمّ تسميع 20 سورة',c.surahs,20],
      ['st7','🔥','أسبوع متواصل','اقرأ 7 أيام متتالية',best,7],['st30','⚡','شهر متواصل','اقرأ 30 يومًا متتالية',best,30],
      ['p50','📖','50 صفحة','اقرأ 50 صفحة',c.pagesRead,50],['p300','📜','300 صفحة','اقرأ 300 صفحة',c.pagesRead,300],['p604','🕌','قراءة كاملة','اقرأ 604 صفحة',c.pagesRead,604],
      ['kh','📿','ختمة القرآن','أتمّ خطة ختمتي',kh,1],['qz1','🧠','عقل ذكي','اكسب 100 نقطة من الكويز',qp,100],['qz2','🎓','متفوّق','اكسب 500 نقطة من الكويز',qp,500],
      ['tj3','📏','طالب تجويد','اجتز 3 اختبارات تجويد',ex,3],['tj8','🏅','متقن التجويد','اجتز 8 اختبارات تجويد',ex,8],
      ['rv20','📆','مواظب على المراجعة','راجع 20 آية',rv,20],['ms','🎯','صاحب همّة','أتمّ مهام اليوم 5 مرات',mf,5],
      ['ld','🏆','من المتصدرين','ادخل أول 10 في لوحة الشرف',J('lb_leader',false)?1:0,1]];
    return A.map(([id,ic,t,d,cur,goal])=>({id,ic,t,d,cur:Math.min(cur,goal),goal,have:cur>=goal}));
  }
  function achCheck(){const seen=J('ach_seen',null),A=achievements(),have=A.filter(a=>a.have).map(a=>a.id);
    if(seen===null){W('ach_seen',have);return []}
    const nw=A.filter(a=>a.have&&!seen.includes(a.id));if(nw.length)W('ach_seen',have);return nw}
  let to;function publishSoon(){clearTimeout(to);to=setTimeout(()=>publish().catch(()=>{}),2500)}
  async function top(period,kind){
    if(period==='season')return seasonBoard(seasonKey(),kind);
    const F=window.QuranFirebase;await F.ready;let snap;const R=kind==='read';
    if(period==='week')snap=await F.db.collection('leaderboard').where('weekKey','==',weekKey()).limit(200).get();
    else snap=await F.db.collection('leaderboard').orderBy(R?'readPts':'points','desc').limit(100).get();
    const key=R?(period==='week'?'readWeek':'readPts'):(period==='week'?'weekPoints':'points');
    return (await clean(snap.docs.map(d=>({uid:d.id,...d.data()})).filter(r=>!r.hidden&&(r[key]||0)>0))).sort((a,b)=>(b[key]||0)-(a[key]||0)).slice(0,20);
  }
  async function refreshRank(){
    const F=window.QuranFirebase;await F.ready;if(!F.isLoggedIn)return null;
    const my=F.user.uid,[a,w,a2,w2,s1,s2]=await Promise.all([top('all'),top('week'),top('all','read'),top('week','read'),top('season'),top('season','read')]);
    const idx=l=>l.findIndex(r=>r.uid===my)+1,ra=idx(a),rw=idx(w),rr=idx(a2),rrw=idx(w2),rs=idx(s1),rs2=idx(s2),inTop=x=>x>=1&&x<=10;
    const owner=!!(F.user.email&&OWNER_EMAILS.includes(F.user.email.toLowerCase()));
    W('lb_rank_all',ra);W('lb_rank_week',rw);
    W('lb_leader',owner||inTop(ra)||inTop(rw)||inTop(rr)||inTop(rrw)||inTop(rs)||inTop(rs2));
    return{all:ra,week:rw};
  }
  // شارة توثيق على غرار فيسبوك: owner=أزرق، leader=ذهبي
  function badge(type,size){
    if(!type)return '';const c=type==='owner'?'#1d9bf0':'#d4a017',s=size||18;
    return `<svg class="bd" width="${s}" height="${s}" viewBox="0 0 24 24" style="vertical-align:-3px;margin-inline-start:3px"><title>${type==='owner'?'مطوّر التطبيق':'من المتصدرين'}</title><rect x="3.5" y="3.5" width="17" height="17" rx="3" fill="${c}"/><rect x="3.5" y="3.5" width="17" height="17" rx="3" fill="${c}" transform="rotate(45 12 12)"/><path d="M7.6 12.4l3 3 5.8-6.2" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  window.WMHonor={achievements,achCheck,streakNow,report,uidOf,bans,league,RANKS,LEAGUES,LTH,seasonKey,seasonName,seasonLeft,daysLeft,prevKey,seasonXP,seasonPts,seasonTop,prevChampions,takeMsg,history,rtier,RTIERS,refreshRank,badge,isLeader:()=>J('lb_leader',false),OWNER_EMAILS,compute,tier,publish,publishSoon,top,weekKey,TIERS,setHidden:v=>W('lb_hidden',!!v),getAlias:()=>J('lb_alias',''),setAlias:v=>W('lb_alias',String(v||'').replace(/[<>&"]/g,'').trim().slice(0,24)),isHidden:()=>!!J('lb_hidden',false)};
})();
