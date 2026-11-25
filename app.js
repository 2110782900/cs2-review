"use strict";
const $ = id => document.getElementById(id);
const escapeHtml = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const safe = escapeHtml;
const topicCopy = {
  vm:["VIRTUAL MEMORY","从虚拟地址到物理地址，沿着一次访存练透页表、TLB 与内存分配。","MMU","虚拟地址 VA","物理地址 PA"],
  ecf:["EXCEPTIONAL CONTROL FLOW","追踪控制流的每一次转移，推演异常、进程与信号。","CPU","异常入口","控制转移"],
  io:["SYSTEM-LEVEL I/O","沿着文件描述符追踪一次读写，理解文件共享与重定向。","I/O","文件描述符","打开文件表"],
  net:["NETWORK PROGRAMMING","从地址解析走到一次 HTTP 事务，梳理客户端与服务器的调用顺序。","TCP","客户端","服务器"],
  conc:["CONCURRENT PROGRAMMING","追踪交错执行的顺序，用信号量验证共享状态与同步条件。","SEM","线程 A","线程 B"]
};
const kind = {all:"全部",choice:"选择题",fill:"填空题",long:"大题"};
const databaseKey = "cs2-study-room.v1";
let db = {records:{},position:{}};
let storageWarn = false;
try {
  const old = JSON.parse(localStorage.getItem(databaseKey) || "null");
  if (old && old.records && old.position) db = old;
} catch { storageWarn = true; }
function save() {
  try { localStorage.setItem(databaseKey, JSON.stringify(db)); return true; }
  catch { storageWarn = true; $("progress-note").textContent="浏览器存储不可用，本次进度仅在当前页面保留。"; return false; }
}
topics.sort((a,b)=>a.number.localeCompare(b.number));
const allQuestions = topics.flatMap(t=>t.questions);
const byId = new Map(allQuestions.map(q=>[q.id,q]));
const ui = {section:"practice",topic:"vm",type:"all",group:"all",id:""};
db.rounds ||= {};
function applyPaper(value) {
  document.documentElement.dataset.paper=value;
  $("paper").value=value;
}
applyPaper(db.paper==="snow"?"snow":"sage");
$("paper").onchange=e=>{db.paper=e.target.value;applyPaper(db.paper);save();};
const inRound = () => ui.section==="shuffle" || ui.section==="drill";
const activeRound = () => inRound() ? db.rounds[ui.section] : null;
let pickingRound = false;
if (db.view && ["practice","errors","shuffle","drill"].includes(db.view.section)
    && (db.view.topic==="*" || topics.some(t=>t.id===db.view.topic))) {
  ui.section=db.view.section; ui.topic=db.view.topic;
  ui.type=Object.hasOwn(kind,db.view.type)?db.view.type:"all";
  ui.group=typeof db.view.group==="string"?db.view.group:"all";
}
function record(id) { return db.records[id] || {}; }
function editable(q) {
  const records=activeRound()?.answers || db.records;
  return records[q.id] ||= {values:[],reviews:{}};
}
function currentTopic() { return topics.find(t=>t.id===ui.topic); }
function pool() {
  if(inRound()) return (activeRound()?.ids || []).map(id=>byId.get(id)).filter(Boolean);
  const base = currentTopic()?.questions || allQuestions;
  return base.filter(q=>ui.section==="practice" || record(q.id).wrongBook);
}
function filtered(ignoreType=false) {
  return pool().filter(q=>(ui.group==="all" || ui.group===q.group || (ui.group==="@io-samples" && q.sample)) && (ignoreType || ui.type==="all" || ui.type===q.type));
}
function posKey(){return [ui.section,ui.topic,ui.type,ui.group].join("|");}
function navigate(id) { ui.id=id; if(activeRound())activeRound().current=id;else db.position[posKey()]=id; save(); render(); }
function restore() {
  if(ui.group!=="all" && !pool().some(q=>q.group===ui.group || (ui.group==="@io-samples" && q.sample))) ui.group="all";
  const list=filtered();
  const saved=inRound()?activeRound()?.current:db.position[posKey()];
  ui.id=list.some(q=>q.id===saved)?saved:(list[0]?.id || "");
  db.view={section:ui.section,topic:ui.topic,type:ui.type,group:ui.group};
  save();
  render();
}
function selectTopic(id) {ui.topic=id;ui.group="all";ui.type="all";restore();}
function section(name) {ui.section=name;pickingRound=false;selectTopic(name==="practice"?"vm":"*");}
$("practice").onclick=()=>section("practice");
$("home").onclick=e=>{e.preventDefault();section("practice");};
$("errors").onclick=()=>section("errors");
$("drill").onclick=()=>section("drill");
$("shuffle").onclick=()=>section("shuffle");
$("group").onchange=e=>{ui.group=e.target.value;restore();};
function showIoSamples() {
  ui.section="practice";ui.topic="io";ui.type="all";ui.group="@io-samples";
  pickingRound=false;restore();
}
$("io-samples").onclick=showIoSamples;
const button = (text,cls,act) => {const el=document.createElement("button");el.className=cls;el.textContent=text;el.onclick=act;return el;};
function sideButton(id,number,title,count) {
  const b=button("","topic"+(id===ui.topic?" current":""),()=>selectTopic(id));
  b.setAttribute("aria-pressed",String(id===ui.topic));
  b.innerHTML='<b>'+safe(number)+'</b>'+safe(title)+'<small>'+count+'</small>';
  $("topics").append(b);
}
function renderHeader() {
  const t=currentTopic(),wrong=ui.section==="errors";
  const copy=topicCopy[ui.topic] || (wrong?["ERROR REVIEW","回到做错的题，重新推导答案，再对照解析。","REV","回顾","订正"]:["QUESTION BANK","跨专题练同一种题型，也可以按知识点缩小范围。","CS II","专题","题型"]);
  $("title").textContent=wrong && !t?"错题本":t?.title || "综合练习";
  $("topic-code").textContent=t?"专题 "+t.number:wrong?"学习记录":"期末复习";
  ["topic-en","intro","chip-text","diagram-a","diagram-b"].forEach((id,i)=>$(id).textContent=copy[i]);
  $("hero-meta").innerHTML="<span>"+pool().length+" 道"+(wrong?"错题":"练习")+"</span><span>"+new Set(pool().map(q=>q.group)).size+" 个知识点组</span>";
  $("work-title").textContent=wrong?"错题重练":"专题练习";
  $("types").hidden=inRound();
  $("io-samples").hidden=ui.topic!=="io" || ui.section!=="practice" || ui.group==="@io-samples";
  if(ui.group==="@io-samples")$("work-title").textContent="I/O 课堂风格示例";
  $("group").parentElement.hidden=inRound();
  $("topics").parentElement.hidden=inRound();
  if(inRound()) {
    const drill=ui.section==="drill";
    $("title").textContent=drill?"同类巩固":"乱序自测";
    $("topic-code").textContent="期末复习";
    $("topic-en").textContent=drill?"TARGETED PRACTICE":"MIXED PRACTICE";
    $("intro").textContent=drill?"从一道错题出发，换几道同考点的题重新推导。":"选好范围，随机抽题。每一轮用新的作答记录计分。";
    $("chip-text").textContent=drill?"FIX":"MIX";
    $("diagram-a").textContent=drill?"错题":"题库";$("diagram-b").textContent=drill?"同考点":"本轮";
    $("work-title").textContent=drill?"巩固练习":"自测练习";
    $("hero-meta").innerHTML=drill?"<span>"+allQuestions.filter(q=>record(q.id).wrongBook).length+" 道待巩固错题</span>":"<span>"+allQuestions.length+" 道可抽题目</span><span>"+topics.length+" 个专题</span>";
  }
  $("error-count").textContent=allQuestions.filter(q=>record(q.id).wrongBook).length;
  ["practice","errors","drill","shuffle"].forEach(id=>{$(id).classList.toggle("active",ui.section===id);$(id).setAttribute("aria-pressed",String(ui.section===id));});
  $("topics").replaceChildren();
  sideButton("*","∑",wrong?"全部错题":"全部专题",wrong?$("error-count").textContent:allQuestions.length);
  for(const topic of topics) sideButton(topic.id,topic.number,topic.title,wrong?topic.questions.filter(q=>record(q.id).wrongBook).length:topic.questions.length);
  const total=allQuestions.length,done=allQuestions.filter(q=>typeof record(q.id).passed==="boolean").length;
  $("done-count").textContent=done;$("total-count").textContent=" / "+total+" 题";
  $("progress").style.width=(total?done/total*100:0)+"%";
  $("progress-note").textContent=storageWarn?"本次进度仅在当前页面保留。":"已完成批改 · 进度保存在本机";
  const groups=[...new Set(pool().map(q=>q.group))];
  $("group").replaceChildren(new Option("全部知识点","all"),...groups.map(g=>new Option(g,g)));
  if(pool().some(q=>q.sample))$("group").add(new Option("课堂风格示例 · 8 题","@io-samples"));
  $("group").value=ui.group;
  $("types").replaceChildren();
  const base=filtered(true);
  for(const [id,name] of Object.entries(kind)) {
    const b=button("","tab"+(ui.type===id?" sel":""),()=>{ui.type=id;restore();});
    b.setAttribute("aria-pressed",String(ui.type===id));
    b.innerHTML=safe(name)+"<small>"+(id==="all"?base.length:base.filter(q=>q.type===id).length)+"</small>";
    $("types").append(b);
  }
}
function statusClass(r){return typeof r.passed==="boolean"?(r.passed?"pass":"fail"):"";}
function renderMap(list) {
  $("map-count").textContent=list.length+" 题 · 绿为答对，红为答错";
  $("map-items").replaceChildren(...list.map((q,i)=>{
    const r=inRound()?(activeRound()?.answers[q.id] || {}):record(q.id),b=button(String(i+1),"num "+statusClass(r)+(q.id===ui.id?" here":""),()=>navigate(q.id));
    b.setAttribute("aria-label","第 "+(i+1)+" 题，"+(r.passed===true?"答对":r.passed===false?"答错":"未完成"));
    return b;
  }));
  $("map").hidden=!list.length;
}
function fieldState(q,r,i) {const f=q.fields[i];return f.mode==="self"?r.reviews?.[i]:fieldMatches(f,r.values?.[i]);}
function updateOutcome(q,r) {
  const marks=q.type==="choice"?[r.choice===q.correct]:q.fields.map((_,i)=>fieldState(q,r,i));
  if(marks.some(v=>v===undefined)) return;
  r.passed=marks.every(Boolean);
  if(!r.passed) r.wrongBook=true;
  storeRoundResult(q,r);
}
function storeRoundResult(q,r) {
  if(!inRound())return;
  const prior=db.records[q.id] || {};
  const hasDraft=!prior.submitted && (prior.choice!=null || prior.values?.some(Boolean));
  const latest=hasDraft?prior:structuredClone(r);
  latest.passed=r.passed;
  latest.wrongBook=!!prior.wrongBook || !r.passed;
  db.records[q.id]=latest;
}
function renderFields(q,r) {
  return '<div class="fields">'+q.fields.map((f,i)=>{
    const id="field-"+i, value=safe(r.values?.[i] || "");
    const placeholder=f.mode==="hex"?"十六进制，可省略 0x":f.mode==="number"?"输入数值":f.mode==="self"?"写下你的推导或理由":"输入答案";
    const input=f.mode==="self"?'<textarea id="'+id+'" rows="3" placeholder="'+placeholder+'" '+(r.submitted?"readonly":"")+'>'+value+'</textarea>':'<input id="'+id+'" value="'+value+'" placeholder="'+placeholder+'" '+(r.submitted?"readonly":"")+'>';
    let note="";
    if(r.submitted) {
      const ok=fieldState(q,r,i);
      if(f.mode==="self"){
        note='<div class="field-note">参考要点　'+safe(f.answers[0])+'</div><div class="review-btns"><button class="secondary" data-review="'+i+'" data-mark="yes" aria-pressed="'+(ok===true)+'">要点齐全</button><button class="secondary" data-review="'+i+'" data-mark="no" aria-pressed="'+(ok===false)+'">还需复习</button></div>';
      }else{note='<span class="field-note '+(ok?"good":"bad")+'">'+(ok?"✓ 正确":"× 需订正")+'　参考答案　'+safe(f.answers[0])+'</span>';}
    }
    return '<div class="field"><label for="'+id+'">'+safe(f.label)+'</label>'+input+note+'</div>';
  }).join("")+'</div>';
}
function renderOptions(q,r) {
  return '<div class="options">'+q.choices.map((v,i)=>{
    const selected=r.choice===i, show=r.submitted, right=show&&q.correct===i, wrong=show&&selected&&!right;
    return '<button class="option '+(right?"right":wrong?"wrong":selected?"chosen":"")+'" data-choice="'+i+'" aria-pressed="'+selected+'" '+(show?"disabled":"")+'><span class="letter">'+String.fromCharCode(65+i)+'</span><span class="option-text">'+safe(v)+'</span>'+(right||wrong?'<span class="option-status">'+(right?"✓ 正解":"× 误选")+'</span>':"")+'</button>';
  }).join("")+'</div>';
}
function renderTables(q) {
  const context=document.createElement("section");
  context.className="data-section";
  const tableHtml=q.tables.map(t=>'<div class="table-scroll"><table><caption>'+safe(t.title)+'</caption><thead><tr>'+
    t.columns.map(c=>'<th scope="col">'+safe(c)+'</th>').join("")+'</tr></thead><tbody>'+
    t.rows.map(row=>'<tr>'+row.map((cell,i)=>i===0?'<th scope="row">'+safe(cell)+'</th>':'<td>'+safe(cell)+'</td>').join("")+'</tr>').join("")+
    '</tbody></table></div>').join("");
  context.innerHTML='<p>'+safe(q.context)+'</p><div class="data-tables">'+tableHtml+'</div>';
  return context;
}
function settle(q,r) {
  const pending=q.type!=="choice"&&q.fields.some((f,i)=>f.mode==="self" && r.reviews?.[i]===undefined);
  if(q.lesson) {
    const lesson=q.lesson;
    const options=lesson.options?'<details class="lesson-block" open><summary>逐项辨析</summary><ul>'+lesson.options.map(s=>'<li>'+safe(s)+'</li>').join("")+'</ul></details>':"";
    const author=lesson.authorNote?'<aside class="author-note">'+safe(lesson.authorNote)+'</aside>':"";
    const review='<section class="lesson-block review-guide"><h4>回到课件看这里</h4><p class="slide-file">文件位置相对于课程资料文件夹；页码按 PDF 阅读器显示的页序。</p><ol>'+lesson.review.map(p=>'<li><p class="slide-file">'+safe(p.file)+'</p><strong>第 '+p.number+' 页 · '+safe(p.title)+'</strong><p>'+safe(p.focus)+'</p></li>').join("")+'</ol></section>';
    return '<section class="feedback"><div class="result-head"><h3>参考解析</h3><span class="verdict '+(pending?"":r.passed?"good":"bad")+'">'+(pending?"请对照要点完成自评":r.passed?"✓ 回答正确":"× 需要复习")+'</span></div><p class="concept">'+safe(lesson.concept)+'</p><details class="lesson-block" open><summary>先把原理接起来</summary><p>'+safe(lesson.basics)+'</p></details><section class="lesson-block"><h4>一步步推导</h4><p class="explain">'+safe(q.explanation)+'</p></section>'+options+author+review+'<p class="reference">选题依据　'+safe(q.source)+'</p></section>';
  }
  return '<section class="feedback"><div class="result-head"><h3>参考解析</h3><span class="verdict '+(pending?"":r.passed?"good":"bad")+'">'+(pending?"请对照要点完成自评":r.passed?"✓ 回答正确":"× 需要复习")+'</span></div><p class="explain">'+safe(q.explanation)+'</p><p class="reference">复习出处　'+safe(q.source)+'</p></section>';
}
function renderQuestion(list) {
  const card=$("question"),q=byId.get(ui.id),index=list.findIndex(x=>x.id===ui.id);
  if(!q || index<0) {
    const wrong=ui.section==="errors";
    card.innerHTML='<div class="empty"><h3>'+(wrong?"这里还没有符合条件的错题":"当前筛选下没有题目")+'</h3><p>'+(wrong?"答错的题会自动收入错题本，订正后可手动移出。":"可以切换题型，或查看全部知识点。")+'</p><button class="secondary" id="back">返回专题练习</button></div>';
    $("back").onclick=()=>section("practice");return;
  }
  const r=editable(q), ordinal=n=>String(n).padStart(2,"0");
  const remove=!inRound() && r.wrongBook && r.passed && r.submitted?'<button class="secondary" id="remove">移出错题本</button>':"";
  card.innerHTML='<div class="qhead"><div class="tags"><span class="kind">'+kind[q.type]+'</span>'+safe(q.group)+'</div><span class="ordinal"><strong>'+ordinal(index+1)+'</strong> / '+ordinal(list.length)+'</span></div><h3 class="prompt">'+safe(q.prompt)+'</h3>'+(q.type==="choice"?renderOptions(q,r):renderFields(q,r))+'<p id="notice" class="notice" role="status"></p><div class="qfoot"><div><button class="primary" id="submit">'+(r.submitted?"重新作答":"提交答案")+'</button> '+remove+'</div><div class="paging"><button class="page-btn" id="prev">上一题</button><button class="page-btn" id="next">下一题</button></div></div>'+(r.submitted?settle(q,r):"");
  if(q.tables?.length) card.querySelector(".prompt").after(renderTables(q));
  if(q.code) {
    const pre=document.createElement("pre");
    pre.className="question-code";
    const code=document.createElement("code");code.textContent=q.code;pre.append(code);
    card.querySelector(".prompt").after(pre);
  }
  if(r.submitted) {
    const tip=document.createElement("aside");
    tip.className="whale-tip";
    tip.innerHTML='<img src="assets/whale.jpg" alt=""><div><strong>小鲸娘 · 易错提醒</strong><p>'+safe(q.tip)+'</p></div>';
    const feedback=card.querySelector(".feedback");
    feedback.append(tip);
    if(r.passed===false && ui.section!=="drill" && related(q).length) {
      feedback.append(button("练同考点的题 →","secondary drill-link",()=>startDrill(q)));
    }
    if(inRound()) {
      $("submit").hidden=true;
      if(typeof r.passed==="boolean")card.querySelectorAll("[data-review]").forEach(b=>b.disabled=true);
    }
  }
  card.querySelectorAll("[data-choice]").forEach(b=>b.onclick=()=>{r.choice=Number(b.dataset.choice);save();renderQuestion(list);});
  if(q.type!=="choice") q.fields.forEach((_,i)=>{const field=$("field-"+i);field.oninput=()=>{(r.values ||= [])[i]=field.value;save();};});
  card.querySelectorAll("[data-review]").forEach(b=>b.onclick=()=>{(r.reviews ||= {})[b.dataset.review]=b.dataset.mark==="yes";updateOutcome(q,r);save();render();});
  $("prev").disabled=index===0;$("next").disabled=index===list.length-1;
  function step(delta){navigate(list[index+delta].id);if(card.getBoundingClientRect().top<0)card.scrollIntoView({block:"start"});}
  $("prev").onclick=()=>step(-1);$("next").onclick=()=>step(1);
  if(!r.submitted) {
    const reveal=button("不会，加入错题","reveal",()=>{
      r.submitted=true;r.passed=false;r.wrongBook=true;
      // Keep any written working so the learner can compare it with the solution.
      (q.fields || []).forEach((f,i)=>{if(f.mode==="self")(r.reviews ||= {})[i]=false;});
      storeRoundResult(q,r);
      save();render();
      document.querySelector(".feedback")?.scrollIntoView({block:"nearest"});
    });
    $("submit").after(reveal);
  }
  if($("remove")) $("remove").onclick=()=>{r.wrongBook=false;save();if(ui.section==="errors"){if(!pool().some(x=>x.group===ui.group))ui.group="all";restore();}else render();};
  if(q.lesson)renderNotebook(q,card);
  $("submit").onclick=()=>{
    if(r.submitted){r.submitted=false;r.values=[];r.reviews={};delete r.choice;}
    else {
      const missing=q.type==="choice"?r.choice==null:q.fields.some((_,i)=>!cleanAnswer(r.values?.[i]));
      if(missing){$("notice").textContent=q.type==="choice"?"请先选择一个选项。":"请先作答每个小问，再提交查看解析。";return;}
      r.submitted=true;updateOutcome(q,r);
    }
    save();render();
  };
}
function renderNotebook(q,card) {
  db.notes ||= {};
  const note=document.createElement("details");
  note.className="notebook";
    note.innerHTML='<summary>我的题目笔记'+(db.notes[q.id]?' · 已有记录':'')+'</summary><label for="personal-note">记下你卡住的一步，或用自己的话解释原理。</label><textarea id="personal-note" rows="4" placeholder="例如：这一问用到了哪个条件？我在哪一步弄混了？下次怎样检查？"></textarea><div class="note-actions"><span id="note-status" role="status">笔记保存在本机浏览器</span><button class="secondary" id="export-note">导出这题笔记</button></div>';
  card.append(note);
  $("personal-note").value=db.notes[q.id] || "";
  $("personal-note").oninput=e=>{
    db.notes[q.id]=e.target.value;
    $("note-status").textContent=save()?"已保存到本机":"当前浏览器无法保存，请导出笔记留存";
  };
  $("export-note").onclick=()=>{
    const content=[q.id+" · "+q.lesson.concept,q.prompt,"我的笔记",db.notes[q.id] || "（尚未填写）"].join("\n\n");
    const url=URL.createObjectURL(new Blob([content],{type:"text/plain;charset=utf-8"}));
    const link=document.createElement("a");link.href=url;link.download=q.id+"-我的笔记.txt";link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
}
// A round keeps its own order and draft answers. Topic browsing still uses the original records.
function shuffled(items) {
  const copy=[...items];
  for(let last=copy.length-1;last>0;last--) {
    const j=Math.floor(Math.random()*(last+1));
    [copy[last],copy[j]]=[copy[j],copy[last]];
  }
  return copy;
}
function related(q) {
  const topic=topics.find(t=>t.questions.some(item=>item.id===q.id));
  return (topic?.questions || []).filter(item=>item.id!==q.id && item.group===q.group);
}
function openRound(mode,items,label,extra={}) {
  if(!items.length)return;
  db.rounds[mode]={ids:items.map(q=>q.id),answers:{},current:items[0].id,label,...extra};
  section(mode);
  $("work-title").scrollIntoView({block:"nearest"});
}
function startDrill(q) {
  const sourceView=ui.section==="drill"?{section:"errors",topic:"*",type:"all",group:"all",id:q.id}:{...ui,id:q.id};
  // Prefer unmastered questions and then the same question format within the same knowledge group.
  const priority=item=>(record(item.id).passed===true?2:0)+(item.type===q.type?0:1);
  const items=shuffled(related(q)).sort((a,b)=>priority(a)-priority(b)).slice(0,3);
  openRound("drill",items,q.group,{origin:q.id,sourceView});
}
function backToSource(round) {
  const target=round.sourceView;
  if(!target)return;
  Object.assign(ui,target);
  pickingRound=false;
  restore();
  if(filtered().some(q=>q.id===target.id))navigate(target.id);
  else if(byId.has(target.id)) {
    ui.section="practice";
    selectTopic(topics.find(t=>t.questions.some(q=>q.id===target.id)).id);
    navigate(target.id);
  }
  $("question").scrollIntoView({block:"start"});
}
function chooseShuffle(panel,round) {
  panel.innerHTML='<h3>组一轮自测</h3><p>抽到的题在本轮只出现一次。提交后可看解析，每题按本轮首次完成的答案计分。</p><div class="round-controls"><label>专题<select id="quiz-topic"></select></label><label>题型<select id="quiz-type"></select></label><label>题量<select id="quiz-size"><option value="5">5 题</option><option value="10" selected>10 题</option><option value="20">20 题</option><option value="all">范围内全部</option></select></label><button class="primary" id="start-quiz">开始新一轮</button></div><p class="quiz-count" id="quiz-count"></p>';
  const scope=$("quiz-topic"),type=$("quiz-type"),size=$("quiz-size");
  scope.add(new Option("全部专题","*"));
  for(const t of topics)scope.add(new Option(t.title,t.id));
  for(const [id,name] of Object.entries(kind))type.add(new Option(id==="all"?"全部题型":name,id));
  scope.value=round?.scope || "*";type.value=round?.type || "all";size.value=round?.size || "10";
  function candidates() {
    const bank=topics.find(t=>t.id===scope.value)?.questions || allQuestions;
    return bank.filter(q=>type.value==="all" || q.type===type.value);
  }
  const count=length=>size.value==="all"?length:Math.min(length,Number(size.value));
  function updateCount(){
    const length=candidates().length;
    $("quiz-count").textContent="可选 "+length+" 题，本轮抽 "+count(length)+" 题。"+(round?"开始后将替换上一轮自测。":"");
    $("start-quiz").disabled=!length;
  }
  scope.onchange=type.onchange=size.onchange=updateCount;updateCount();
  $("start-quiz").onclick=()=>{
    const bank=candidates(),items=shuffled(bank).slice(0,count(bank.length));
    openRound("shuffle",items,scope.selectedOptions[0].text+" · "+type.selectedOptions[0].text,{scope:scope.value,type:type.value,size:size.value});
  };
}
function chooseDrill(panel,round) {
  const errors=allQuestions.filter(q=>record(q.id).wrongBook && related(q).length);
  panel.innerHTML='<h3>选一道错题</h3><p>'+(errors.length?"从同一专题的同一考点选最多 3 道其他题，优先练还没答对的题。":"做错或标记「不会」后，可以从这里开始同考点练习。")+'</p>';
  if(!errors.length){panel.append(button("去专题练习","secondary",()=>section("practice")));return;}
  const list=document.createElement("div");list.className="drill-list";
  for(const q of errors) {
    const b=button("","secondary",()=>startDrill(q));
    b.innerHTML='<small>'+safe(q.group)+' · '+safe(q.id)+'</small>'+safe(q.prompt.split("\n")[0]);
    list.append(b);
  }
  if(round)panel.append(document.createTextNode("选择后将开始新一组巩固。"));
  panel.append(list);
}
function renderRoundPanel(list) {
  const panel=$("round-panel");
  panel.hidden=!inRound();
  if(panel.hidden)return;
  const round=activeRound(),drill=ui.section==="drill";
  if(!round || !list.length || pickingRound) {
    if(drill)chooseDrill(panel,round);else chooseShuffle(panel,round);
    if(round && list.length)panel.append(button("继续原来这轮","secondary",()=>{pickingRound=false;render();}));
    return;
  }
  const results=list.map(q=>round.answers[q.id]?.passed);
  const done=results.filter(v=>typeof v==="boolean").length;
  const hits=results.filter(v=>v===true).length;
  const complete=done===list.length;
  panel.innerHTML='<div class="round-summary"><div><h3>'+safe(round.label)+'</h3><p>'+ (drill?'原题 '+safe(round.origin)+' · ':'')+'已完成 '+done+' / '+list.length+' 题</p></div><span class="round-score">'+(complete?'本轮完成 · ':'')+'答对 '+hits+' 题'+(complete?' · 正确率 '+Math.round(hits/list.length*100)+'%':'')+'</span></div><div class="round-actions"></div>';
  const actions=panel.querySelector(".round-actions");
  actions.append(button(drill?"另选错题":"重新组卷","secondary",()=>{pickingRound=true;render();}));
  if(drill)actions.append(button("返回原题","secondary",()=>backToSource(round)));
}
function render(){
  const list=filtered();
  renderHeader();
  renderRoundPanel(list);
  const showQuestion=!inRound() || (!pickingRound && list.length>0);
  $("question").hidden=!showQuestion;
  if(showQuestion)renderQuestion(list);else $("question").replaceChildren();
  renderMap(showQuestion?list:[]);
}
if(location.hash==="#io-samples") {
  showIoSamples();
  try { history.replaceState(null,"",location.href.split("#")[0]); } catch { /* The file reader may disallow replacing its URL. */ }
} else restore();
