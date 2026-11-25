// 维护题库后，在站点目录运行 node check-bank.cjs。只使用 Node 标准库。
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const context = vm.createContext({});
const read = name => fs.readFileSync(path.join(__dirname,name),"utf8");
const scripts = [...read("index.html").matchAll(/<script src="([^"]+)"><\/script>/g)].map(match=>match[1]);
for(const name of scripts) {
  const compiled = new vm.Script(read(name), {filename:name});
  if(name !== "app.js") compiled.runInContext(context);
}
const {topics,fieldMatches} = vm.runInContext("({topics,fieldMatches})",context);
const ids = new Set();
const numbers = new Set();
const types = ["choice","fill","long"];
const hasText = value => typeof value === "string" && value.trim().length > 0;
for(const topic of topics) {
  assert(!numbers.has(topic.number),"专题编号重复："+topic.number);
  numbers.add(topic.number);
  const counts = {choice:0,fill:0,long:0};
  const groups = new Map(topic.groups.map(g=>[g,0]));
  for(const q of topic.questions) {
    const id = q.id;
    assert(hasText(id) && !ids.has(id),"题号为空或重复："+id);
    ids.add(id);
    assert([q.prompt,q.explanation,q.source].every(hasText),id+" 题干、解析或出处缺失");
    assert(hasText(q.tip),id+" 缺少逐题易错提醒 tip");
    if(["ecf","vm","io"].includes(topic.id)) assert(q.lesson,id+" 缺少逐题知识回顾");
    if(q.lesson) {
      assert(hasText(q.lesson.concept) && hasText(q.lesson.basics),id+" 知识回顾缺失");
      assert(q.lesson.review.length>0 && q.lesson.review.every(p=>Number.isInteger(p.number) && p.number>0 && hasText(p.file) && hasText(p.title) && hasText(p.focus)),id+" 课件定位不完整");
      if(q.type==="choice")assert(Array.isArray(q.lesson.options) && q.lesson.options.length===q.choices.length && q.lesson.options.every(hasText),id+" 选项辨析缺失");
    }
    assert(groups.has(q.group),id+" 知识点未在 groups 中登记");
    groups.set(q.group, groups.get(q.group)+1);
    assert(types.includes(q.type),id+" 题型不支持");
    if(q.tables) {
      assert(hasText(q.context),id+" 缺少查表条件");
      for(const t of q.tables) {
        assert(hasText(t.title) && t.columns.every(hasText),id+" 查表标题或列名缺失");
        assert(t.rows.length && t.rows.every(row=>row.length===t.columns.length && row.every(hasText)),id+" 查表数据与表头不匹配");
      }
    }
    counts[q.type]++;
    if(q.type === "choice") {
      assert(q.choices.length>=2 && q.choices.every(hasText),id+" 选项不完整");
      assert(Number.isInteger(q.correct) && q.correct>=0 && q.correct<q.choices.length,id+" 答案索引越界");
    } else {
      assert(q.fields.length>0,id+" 缺少小问");
      for(const f of q.fields) {
        assert(hasText(f.label) && ["text","hex","number","self"].includes(f.mode),id+" 小问配置异常");
        assert(f.answers.length>0 && f.answers.every(a=>String(a).trim()),id+" 缺少答案");
        if(f.mode!=="self") {
          for(const answer of f.answers) assert(fieldMatches(f,answer),id+" 参考答案未通过判分："+answer);
          assert(!fieldMatches(f,""),id+" 接受空白作答");
        }
      }
    }
  }
  for(const [group,count] of groups) assert(count>=3,topic.title+"的「"+group+"」不足 3 道题");
  for(const type of types) assert(counts[type]>=3,topic.title+"的 "+type+" 不足 3 道题");
  console.log(topic.number,topic.title,topic.questions.length+" 题",counts);
}
console.log("校验通过："+topics.length+" 个专题，"+ids.size+" 个独立题号。");
