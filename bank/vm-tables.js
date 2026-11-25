// 四道独立题共用初始快照。所有题中访问的 VPN 都在页表摘录内。
(() => {
  const group = "综合查表实战";
  const source = "课件 06《地址翻译》第 18–23 页；虚拟内存作业第 12 题与 CSAPP 家庭作业 9.11–9.13 的原创查表变式";
  const tables = [
    {title:"TLB · 每项按「有效位 / Tag / PPN」排列",columns:["组","路 0","路 1"],rows:[
      ["0","1 / 1 / 11","1 / 5 / 1A"],["1","1 / 0 / 05","1 / 3 / 0F"],
      ["2","0 / 3 / 12","1 / 1 / 0A"],["3","1 / 4 / 08","1 / 2 / 18"]
    ]},
    {title:"当前进程的页表摘录",columns:["VPN","驻留位","PPN","访问属性"],rows:[
      ["04","1","11","读写"],["09","1","0E","读写"],["0E","0","—","合法文件映射，可读"],
      ["13","1","08","只读代码页，无写时复制"]
    ]},
    {title:"数据 Cache · 行内字节按地址递增排列",columns:["组","有效位","Tag","字节 0 / 1 / 2 / 3"],rows:[
      ["0","1","12","55 / 22 / 30 / 41"],["1","0","0D","12 / 3A / 4F / 00"],
      ["2","1","23","10 / 2F / A6 / 19"],["3","1","0B","33 / 7C / 22 / A0"],
      ["4","1","20","01 / 03 / 02 / 04"],["5","1","0C","20 / 83 / 5A / 18"],
      ["6","1","10","80 / FF / 00 / 01"],["7","1","0D","24 / 8A / 01 / FF"]
    ]}
  ];
  const model = "机器按字节寻址，页大小 64 B。TLB 有 4 组、每组 2 路，用 VPN 低 2 位选组。物理寻址的数据 Cache 有 8 组，直接映射，块大小 4 B。下表的组号、Tag、页号和字节值均用十六进制表示。每题从表中初始状态独立开始。";
  const hex=(label,answer)=>({label:label+"（十六进制）",mode:"hex",answers:[answer]});
  const yn=(label,yes)=>({label:label+"（是/否）",mode:"text",answers:yes?["是","是的"]:["否","不是"]});
  const q=(id,task,fields,explanation)=>({id,type:"long",group,prompt:task,context:model,tables,fields,explanation,source});
  const tips = {
    "vm-table-hit": "在匹配的 Cache 行上圈出首字节对应的偏移，并把该字节写在结果的高八位，大端读取很容易误从行首抄起。",
    "vm-table-refill": "记录调块前的 Cache 标记再判断命中；调入对齐块后，要从 0x395 所在的偏移开始取小端字节对。",
    "vm-table-fault": "把第一次访问和重试分成两列，首次遇到失效 TLB 项时不能沿用其中的 0x12，重试必须使用新页框。",
    "vm-table-perm": "先把两字节拼成完整的 16 位位型，再看第 15 位定符号；判断后续写入时还要单独查写权限。",
  };
  const questions = [
    q("vm-table-hit","从 VA=0x012A 读取一个大端序的 16 位无符号数。依据三张表，还原这条读取指令。",
      [hex("① VPN","4"),hex("② TLB 组号","0"),yn("③ TLB 是否命中",true),hex("④ 首字节物理地址","46A"),hex("⑤ Cache 组号","2"),yn("⑥ 数据 Cache 是否命中",true),hex("⑦ 返回值","A619")],
      "① 0x12A ÷ 0x40 得 VPN=4、VPO=0x2A。TLB 组号 4 & 3 = 0，Tag=1，第 0 组路 0 有效且匹配，PPN=0x11。\n② PA=(0x11 × 0x40)+0x2A=0x46A。按 Tag / 3 位组号 / 2 位块偏移分解，得到 Tag=0x23、组=2、偏移=2。\n③ 第 2 组有效且标记匹配，取字节 2、3，即 A6 和 19。大端序先读到的字节占高位，结果为 0xA619。"),
    q("vm-table-refill","允许非对齐读取，从 VA=0x0255 读取一个小端序的 16 位无符号数。主存中自物理地址 0x394 起的 4 字节依次为 0C、71、24、9D。若 Cache 未命中，本题按整块从主存调入。",
      [hex("① TLB 标记","2"),yn("② TLB 是否命中",false),yn("③ 是否发生缺页",false),hex("④ 首字节物理地址","395"),hex("⑤ 所需 Cache 标记","1C"),yn("⑥ 调块前 Cache 是否命中",false),hex("⑦ 返回值","2471")],
      "① VPN=9、VPO=0x15，TLB 组 1、Tag=2。两路都没有有效匹配项。页表 VPN=09 的驻留位为 1，取 PPN=0x0E。\n② PA=0x0E × 0x40+0x15=0x395。块偏移 1、组号 5、Tag=0x1C。组 5 虽有效，旧 Tag=0x0C，不匹配。\n③ 对齐到物理块首 0x394 并取入四字节。偏移 1、2 的内容为 71、24，小端序返回 0x2471。"),
    q("vm-table-fault","读取 VA=0x03AC 的一个字节。若缺页，内核成功把目标页装入新页框 0x06，再重试原指令。判断重试前的故障与重试后的物理地址。",
      [hex("① VPN","E"),hex("② VPO","2C"),hex("③ TLB 组号","2"),yn("④ 首次查 TLB 是否命中",false),yn("⑤ 是否要由内核调入文件页",true),hex("⑥ 重试时目标物理地址","1AC"),hex("⑦ 重试时数据 Cache 组号","3")],
      "① 0x3AC = 0xE × 0x40 + 0x2C，VPN 低两位为 2，高位 Tag 为 3。组 2 的路 0 虽写着 Tag=3，但有效位为 0，不能使用其中的旧 PPN。\n② 页表中 VPN=0x0E 属于合法的可读文件映射，且未驻留，内核可以调页后重试。\n③ 使用题设的新 PPN 得 PA=6 × 0x40+0x2C=0x1AC。组号=(0x1AC >> 2) & 7=3。"),
    q("vm-table-perm","从 VA=0x04D8 读取小端序 16 位有符号整数，采用二进制补码。之后尝试向同一地址写入一个字节。TLB 权限与页表一致，写入时页面属性未发生变化。",
      [hex("① 读操作的 PPN","8"),hex("② 首字节物理地址","218"),hex("③ Cache 组号","6"),hex("④ 16 位原始位型","FF80"),{label:"⑤ 有符号十进制值",mode:"number",answers:["-128"]},yn("⑥ 后续写入能否成功",false)],
      "① VPN=0x13、VPO=0x18，组 3、Tag=4；TLB 路 0 命中 PPN=8。物理地址=8 × 0x40+0x18=0x218。\n② Cache 组 6、Tag=0x10、块偏移 0，匹配行的前两字节为 80 和 FF。按小端序组成 0xFF80，其 16 位补码值为 0xFF80−0x10000=−128。\n③ 页的访问属性为只读，且题中明确无写时复制。即使有有效 TLB 映射和缓存数据，后续写入仍触发保护异常。")
  ];
  const page = (number, title, focus) => ({file:"课件PPT/06. 地址翻译.pdf",number,title,focus});
  const lessons = {
    "vm-table-hit": {
      concept: "TLB 命中、物理 Cache 命中与大端数值",
      basics: "64 B 页使 VA 的低 6 位为页内偏移。4 组 TLB 用 VPN 低 2 位选组；8 组、4 B 块的物理 Cache 用 PA 的低 2 位作块偏移、随后 3 位选组。两个缓存各自核对有效位与 Tag，最后才能从数据行选字节并按大端序组合。",
      review: [page(19, "举例：简单的内存系统", "核对 TLB 的选组与逐路有效标记匹配方法，本题路数与课件不同，按题给两路查。"), page(21, "举例：简单的内存系统", "把行内 B0～B3 与物理地址偏移对应，本题只有 8 组，要用 3 位组索引。"), page(22, "地址翻译示例#1", "依次填写 VPN、TLBI、TLBT、PPN、CO、CI、CT，再扩展到本题双字节读取。")]
    },
    "vm-table-refill": {
      concept: "两次缓存未命中与小端读取",
      basics: "TLB 无匹配时查页表驻留项，得到 PA 后独立查数据 Cache。数据行有效还需 Tag 一致。按块调入时先将 PA 向下对齐到块首，读取的数据仍从原字节偏移开始，小端序将低地址字节放在低 8 位。",
      review: [page(12, "TLB未命中", "看页表 PTE 的补查路径，这次翻译缓存未命中并不要求磁盘读入目标页。"), page(23, "地址翻译示例#2", "对照 TLB 未命中、无缺页、Cache 未命中的层层判断，逐项使用本题参数。")]
    },
    "vm-table-fault": {
      concept: "失效 TLB 项、合法缺页与新页框",
      basics: "TLB 命中依赖有效位与标记同时匹配。合法的非驻留文件页可由内核装入新页框，更新映射后重试，重试使用新 PPN 并保留原页内偏移。",
      review: [page(19, "举例：简单的内存系统", "识别无效项中的 Tag 字段，避免把外观匹配当作有效翻译。"), page(7, "地址翻译：缺页", "对应页调入、更新 PTE、返回并重试三个步骤。"), page(21, "举例：简单的内存系统", "使用重试后的 PA 计算数据 Cache 字段。")]
    },
    "vm-table-perm": {
      concept: "字节序、补码解释与写权限的独立检查",
      basics: "地址翻译得到访问位置，字节序决定两个字节如何组成位型，类型决定该位型如何解释为数值。16 位补码高位为 1 时，用无符号值减 2^16 得有符号值；随后写操作还要重新检查写权限。",
      review: [page(22, "地址翻译示例#1", "从命中 TLB 项得到 PPN，再按物理 Cache 字段定位字节。"), {file:"课件PPT/05. 虚拟内存.pdf",number:26,title:"虚拟内存作为内存保护的工具",focus:"分别核对 READ 与 WRITE 列，理解为什么缓存命中不能授予额外写权限。"}, page(39, "私有对象：写时复制", "对照本题明确排除 COW 的条件，避免将普通只读代码页误判为可写时复制。")]
    },
  };
  const explanations = {
    "vm-table-hit": "① 页大小 64 B=0x40，0x012A=0x04×0x40+0x2A，故 VPN=0x04、VPO=0x2A。\n② TLB 有 4 组，组号=VPN mod 4=0，Tag=floor(VPN/4)=1。第 0 组路 0 的有效位为 1 且 Tag=1，命中得到 PPN=0x11。其结果与页表 VPN=04 的映射一致。\n③ PA=0x11×0x40+0x2A=0x46A。Cache 每块 4 B，因此 CO=PA mod 4=2；8 组使 CI=floor(PA/4) mod 8=2；CT=floor(PA/32)=0x23。\n④ 第 2 组有效且 Tag=0x23，命中。16 位读取需要 2 字节，CO=2 和 3 都在该行，依次得到 A6、19。\n⑤ 大端序把 A6 放到高 8 位，值为 0xA6×256+0x19=0xA619。组号 2 与块内偏移 2 恰巧相同，应分别计算。",
    "vm-table-refill": "① VA=0x0255=9×0x40+0x15，VPN=9、VPO=0x15。TLB 组号=9 mod 4=1，Tag=floor(9/4)=2。组 1 两路的有效 Tag 为 0 和 3，均不匹配，所以 TLB 未命中。\n② 页表 VPN=09 的驻留位为 1，PPN=0x0E，页已在内存，无需缺页调入。PA=0x0E×0x40+0x15=0x395。\n③ CO=0x395 mod 4=1；CI=floor(0x395/4) mod 8=5；CT=floor(0x395/32)=0x1C。第 5 组虽然有效，但旧 Tag=0x0C，所以调块前 Cache 未命中。\n④ 4 B 对齐块首为 PA−CO=0x394，调入题给 0C、71、24、9D。读取从 CO=1 开始，两个字节为 71、24，仍在同一块内。\n⑤ 小端序的低地址 71 占低 8 位，返回 0x24×256+0x71=0x2471。这里补 TLB 与装入数据 Cache 是两次不同的缓存更新。",
    "vm-table-fault": "① 0x03AC=0x0E×0x40+0x2C，VPN=0x0E、VPO=0x2C。TLB 组号=14 mod 4=2，Tag=floor(14/4)=3。\n② 组 2 路 0 的 Tag=3，但有效位为 0，不能使用其旧 PPN=0x12；路 1 有效却 Tag=1，故首次查 TLB 未命中。\n③ 页表 VPN=0x0E 的驻留位为 0，但访问属性明确是合法可读文件映射，内核可读入该文件页。题设保证调页成功，随后更新 PTE 并重试原指令。\n④ 题给的新页框为 0x06，保留原偏移后，PA=0x06×0x40+0x2C=0x1AC。\n⑤ 重试时 CO=0，CI=floor(0x1AC/4) mod 8=3，CT=floor(0x1AC/32)=0x0D。本题只要求该组号，首次缺页前残留的旧页号不能参与重试地址计算。",
    "vm-table-perm": "① VA=0x04D8=0x13×0x40+0x18，VPN=0x13、VPO=0x18。TLB 组=19 mod 4=3、Tag=floor(19/4)=4；第 3 组路 0 有效且匹配，PPN=0x08。\n② PA=0x08×0x40+0x18=0x218，CO=0，CI=floor(0x218/4) mod 8=6，CT=floor(0x218/32)=0x10。\n③ 第 6 组行有效且 Tag=0x10，取偏移 0、1 两字节 80、FF。小端序合成为 0xFF×256+0x80=0xFF80。\n④ 0xFF80 的第 15 位为 1，是负的 16 位补码，其值为 65408−65536=−128。先组成位型再作有符号解释。\n⑤ VPN=0x13 的属性为只读代码页且无 COW，后续写访问不能通过写权限检查。TLB 与数据 Cache 命中只说明映射和数据可找到，仍须服从权限。"
  };
  for (const question of questions) {
    question.tip = tips[question.id];
    question.lesson = lessons[question.id];
    question.explanation = explanations[question.id];
  }
  registerTopic({id:"vm",number:"02",title:"虚拟内存",groups:[group],questions});
})();
