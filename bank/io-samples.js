// 课堂风格试改版，替换 8 个题位。新题号使旧作答不会被误当作新版答案。
(() => {
  const book = "小肥鱼的ppt/08. 用户空间IO(3).pdf";
  const field = (label, answer, mode = "number") => ({ label, answers: [String(answer)], mode });
  const page = (number, title, focus) => ({ file: book, number, title, focus });
  const samples = [
    {
      id: "io-sample-01", replaces: "io-05", type: "choice", group: "读写语义与短计数",
      prompt: "关于下面这次 read 调用，下列说法错误的是哪一项？buf 至少有 80 B 空间，fd 有效；本次调用成功返回 23。",
      code: "ssize_t nread = read(fd, buf, 80);",
      choices: ["80 表示本次请求读取的最大字节数。", "23 表示本次实际读入 buf 的字节数。", "返回值小于 80，说明系统调用失败，应把这 23 字节丢弃。", "处理这批数据时，有效范围是 buf[0] 至 buf[22]。"], correct: 2,
      explanation: "① 先把三个量分开。80 是请求上限；buf 是目标缓冲区；返回值 23 是实际成功传送的数量。\n② 0 < 23 < 80，属于短计数。一次成功调用可以只完成部分请求。程序必须使用返回值处理这 23 字节。\n③ 真正报告错误的返回值为 −1。要不要继续读取，由应用协议或任务需要决定。例如定长记录还需补读，而一条已经完整的命令可能可以立即处理。\n④ 尚未写入的 buf[23] 至 buf[79] 不能当成本次新读到的数据。因此本题应选 C。",
      tip: "把请求数、返回值和缓冲区容量分别圈出来，再看题目要求选正确项还是错误项。",
      lesson: {
        concept: "read 的参数、返回值与短计数",
        basics: "read(fd, buf, n) 最多尝试读 n 字节。成功时返回实际读取量；在请求长度大于 0 的通常文件读取场景，读到 EOF 且本次未读到数据会返回 0；出错返回 −1。短计数本身不能判定失败。",
        options: ["A 正确。第三个参数给出请求上限，实际数量由返回值报告。", "B 正确。返回类型 ssize_t 可表示正常的非负字节数与负的错误返回值。", "C 错误。它把短计数与系统调用错误混为一谈。", "D 正确。23 个新字节的下标是 0 到 22；read 也不会自动追加字符串终止符。"],
        review: [page(12, "读文件", "对照代码中的 sizeof(buf) 与 nbytes，找出请求长度和返回长度。"), page(15, "关于短计数", "先看 EOF、终端与网络的示例，再读最后一条关于容忍短计数的建议。")]
      },
      source: book + "，PDF 第 12、15 页；智慧树系统级 I/O 第 1、9 题问法变式"
    },
    {
      id: "io-sample-02", replaces: "io-07", type: "choice", group: "共享偏移与元数据",
      prompt: "按课件的三表模型，一个单线程进程打开普通文件后成功 fork。父子都保留继承的描述符。关于描述符表、打开文件表和 v-node 表，下列说法错误的是哪一项？",
      choices: ["父子进程共用同一张描述符表，子进程关闭一个描述符就会删除父进程的同号表项。", "父子继承的对应描述符可以指向同一个打开文件表项。", "共享打开文件表项意味着相关读操作使用同一个文件位置。", "v-node 表项记录文件大小、类型等元数据。"], correct: 0,
      explanation: "① 先画三层。左边是每个进程自己的描述符表，中间是打开文件表，右边是 v-node 表。\n② fork 后，父子左边各有一份表；继承的对应条目继续指向中间的同一项。共享的是这些引用所指向的对象。\n③ 因为 File pos 位于中间表项，父子用继承的描述符读取时会共同推进这个位置。文件的大小、类型等属于右边的元数据。\n④ 子进程 close 只删除自己的描述符引用，并减少相关引用计数。父进程的描述符表项仍可存在。A 将两种共享层次混在一起，因此应选 A。",
      tip: "每次看到“共享”，都补问一句共享的是哪一层；close、fork、dup2 对箭头的影响各不相同。",
      lesson: {
        concept: "三张表的归属与 fork 后的共享层次",
        basics: "文件描述符是进程表中的整数索引。打开文件表项保存文件位置等打开状态。v-node 表项描述文件本身的元数据。两条箭头指向同一打开文件表项时，才共享该项里的文件位置。",
        options: ["A 错误。父子描述符表各自独立，close 不会直接删除另一个进程的表项。", "B 正确。fork 继承引用关系，对应表项指向同一打开文件对象。", "C 正确。读操作推进共享项中的 File pos。", "D 正确。可在课件右侧表格找到 File size 和 File type。"],
        review: [page(28, "在内核中如何表示已打开的文件", "按左、中、右三层读图，分别寻找“每个进程一个”、File pos 和元数据。"), page(31, "进程间共享文件：使用fork（2）", "沿父子 fd 的箭头走到同一个 File B，注意左边有两张表。")]
      },
      source: book + "，PDF 第 28、31 页；智慧树系统级 I/O 第 5 题问法变式"
    },
    {
      id: "io-sample-03", replaces: "io-08", type: "long", group: "读写语义与短计数",
      prompt: "下面是课件 rio_readn 的核心逻辑。调用时 n=12，底层 read 的返回值依次为 4、−1（errno=EINTR）、3、0（EOF）。所有后续步骤按这段代码执行。逐步分析本次调用。",
      code: "size_t nleft = n;\nssize_t nread;\nchar *bufp = usrbuf;\nwhile (nleft > 0) {\n    if ((nread = read(fd, bufp, nleft)) < 0) {\n        if (errno == EINTR)\n            nread = 0;\n        else\n            return -1;\n    } else if (nread == 0) {\n        break;\n    }\n    nleft -= nread;\n    bufp += nread;\n}\nreturn n - nleft;",
      fields: [field("① 第一次 read 返回后，nleft 为多少？", 8), field("② EINTR 这一轮结束后，bufp 相对 usrbuf 前进了多少字节？", 4), field("③ 函数最终返回多少字节？", 7), field("④ 说明为什么 EINTR 分支中的 nread=0 没有触发 EOF 分支，以及最终为什么会短计数。", "EINTR 发生在已经进入的 if(nread<0) 分支内，属于同一 if/else if 链的 EOF 分支不会再执行。该轮不改变 nleft 或 bufp，继续重试。之后累计读到 7 字节便遇到 EOF，提前退出并返回 7。", "self")],
      explanation: "① 初始 nleft=12，bufp=usrbuf。读到 4 字节后，nleft=8，指针前进 4。\n② 第二次 read 返回 −1，执行 if 的错误分支。errno=EINTR 时将 nread 设为 0，因此本轮 nleft 减 0、bufp 加 0。else if 属于已选中的同一分支链，不会因随后赋值为 0 而重新判断。\n③ 下一次读到 3 字节，nleft=5，指针累计前进 7。最后一次 read 直接返回 0，进入 EOF 分支，break 跳出循环。\n④ 返回 n−nleft=12−5=7。本题中 RIO 自动处理了中断并累积部分读取，但 EOF 使它无法凑满 12 字节。",
      tip: "分清“read 返回 0”与“错误分支把 nread 改为 0”；用 nleft、bufp 两列逐轮记账。",
      lesson: {
        concept: "rio_readn 的控制流、循环不变量与停止条件",
        basics: "nleft 表示仍需读取的数量，bufp 指向下一段写入位置。正常累计时，已读数量=n−nleft，bufp=usrbuf+已读数量。nread 使用有符号的 ssize_t，才能表达 read 的 −1 错误返回值。读满、EOF 和非 EINTR 的错误都能结束函数，但返回值不同。",
        review: [page(19, "rio_readn的实现", "对照主人标注的“还有 n 个字节没有读”，沿 if / else if 和末尾两行更新语句逐轮跟踪。"), page(18, "无缓冲的输入和输出", "将“仅在遇到 EOF 时返回短计数”与这道题的最后一次 read 联系起来。")]
      },
      source: book + "，PDF 第 18–19 页；智慧树系统级 I/O 第 3 题代码变式"
    },
    {
      id: "io-sample-04", replaces: "io-10", type: "fill", group: "RIO 与接口选型",
      prompt: "同一 TCP 连接先传来一行文本头，随后是头中给定长度的二进制正文。文本头连同换行和字符串终止符可放入目标缓冲区。已经用 rio_readinitb(&rio, fd) 初始化一次。两次读取共用这个 rio_t，以保留内部已预取的字节。按课件接口填写函数名。",
      fields: [field("① 读取文本头一行", "rio_readlineb", "text"), field("② 接着读取指定 n 字节的二进制正文", "rio_readnb", "text")],
      explanation: "① 第一段用换行符分隔，因此选有缓冲的 rio_readlineb。它通过 rio_t 取数据，并可能提前把后面的字节读入内部缓冲。\n② 正文按长度组织，而且可含任意字节，因此调用 rio_readnb(&rio, buf, n)，继续使用同一个 rio 对象。\n③ rio_readn 虽也按数量累积读取，但直接面向 fd，无法取出旧 rio_t 内已经预取的正文。如果混用，应用可能跳过那部分数据。\n④ 两个答案中的后缀 b 提醒我们，它们都使用已有的缓冲状态。调用者仍需检查实际返回值，处理正文提前 EOF 的情况。",
      tip: "先确定按行还是按长度，再确认后续调用能否继续消费原来的 rio_t 缓冲区。",
      lesson: {
        concept: "有缓冲 RIO 的组合与预取数据的归属",
        basics: "RIO 的缓冲区属于 rio_t 对象。底层 read 已经推进 fd 的位置，预取字节仍可能留在用户缓冲中。后续读取必须兼顾两处状态，保持同一缓冲读取链。",
        review: [page(20, "有缓冲的输入", "看 rio_readinitb、rio_readlineb、rio_readnb 的参数，共同的第一个参数是 rio_t *。"), page(21, "有缓冲的输入（2）", "找可交错使用的函数与不要交错调用 rio_readn 的提醒。"), page(22, "有缓冲输入输出的实现", "对照缓冲中尚未交给调用者的字节，理解为什么裸 read 可能越过它们。")]
      },
      source: book + "，PDF 第 20–22 页；智慧树系统级 I/O 第 7 题接口选型变式"
    },
    {
      id: "io-sample-05", replaces: "io-14", type: "fill", group: "共享偏移与元数据",
      prompt: "普通文件内容是 WXYZ1234，fd 的初始位置为 0。fork 后，子进程先通过继承的 fd 读 3 字节；父进程确认孩子读完，再通过自己的 fd 读 2 字节。两次 read 均读满请求量，期间没有重新 open、lseek 或其他读写。填写结果。",
      fields: [field("① 子进程读到的字符", "WXY", "text"), field("② 父进程随后读到的字符", "Z1", "text"), field("③ 两次读完后，共享文件位置（从 0 起）", 5)],
      explanation: "① fork 复制描述符表中的引用，父子的 fd 继续指向同一个打开文件表项。该项里只有一个共同使用的 File pos，初始为 0。\n② 子进程读下标 0、1、2 的 W、X、Y，返回 WXY，File pos 随即从 0 变成 3。\n③ 父进程读取从当前位置 3 开始，下标 3、4 是 Z、1，返回 Z1，File pos 从 3 变成 5。\n④ 父子自己的缓冲数组位于各自地址空间；内核文件位置仍可共享。如果父进程另行 open 同一路径，会得到独立的打开状态，需重新分析。",
      tip: "先给 fd 画箭头，再移动箭头所指表项里的游标；每个进程各画一个游标会把这题算错。",
      lesson: {
        concept: "fork 继承打开文件时的共享游标",
        basics: "文件位置属于打开文件表项。fork 继承已有引用，独立 open 创建新的打开状态。判断读取从哪里开始，先确定两次调用是否使用同一个打开文件表项。",
        authorNote: "课堂注解整理 · 主人第 31 页用父子读 HelloWorld 的例子追踪 File pos，并圈出了共享文件位置。这里可以沿用同一方法，每次 read 后先把 File pos 写出来，再算下一次读取。",
        review: [page(31, "进程间共享文件：使用fork（2）", "看主人圈出的 File pos，并沿父子描述符的两条箭头确认共享对象。"), page(29, "文件共享", "与两次 open 的图对照，数一数中间有几个打开文件表项。")]
      },
      source: book + "，PDF 第 29、31 页；课件文件共享图的参数变式"
    },
    {
      id: "io-sample-06", replaces: "io-17", type: "choice", group: "描述符与重定向",
      prompt: "shell 已成功 fork。父进程的 stdout 继续指向终端；子进程打开 out.txt 得到 fd=5，并希望将即将 exec 的程序的标准输出送到文件。所有调用成功，fd=5 未设置 close-on-exec。下列说法错误的是哪一项？",
      choices: ["子进程可以在 exec 前调用 dup2(5, 1)。", "子进程执行 dup2(5, 1) 后，父进程的描述符 1 仍可指向终端。", "fork 已经完成后，只需父进程调用 dup2(5, 1)，就能修改子进程的描述符 1。", "子进程 dup2 成功后可关闭多余的 fd=5，程序仍可通过 fd=1 写入文件。"], correct: 2,
      explanation: "① fork 后父子各有自己的描述符表。子进程打开文件得到的 fd=5 属于子进程，父进程未必拥有相同的 fd=5。\n② 子进程 dup2(5,1) 使自己的 fd=1 指向 fd=5 引用的打开文件表项，之后新程序通过标准输出写文件。\n③ 这个操作不会修改父进程的表；反过来，父进程在 fork 之后修改自己的表也不能直接改子进程的表。因此 C 错误。\n④ dup2 之后 fd=1 已经持有一份引用。子进程 close(5) 仅释放多余引用，fd=1 仍可用。exec 时此题中 fd=1 的引用可继续保留。",
      tip: "先在 fork 处划开父子两张表；对 dup2 的 oldfd、newfd 都标上所属进程，再判断它改了谁。",
      lesson: {
        concept: "dup2 的方向、进程归属与重定向时机",
        basics: "dup2(oldfd,newfd) 让调用进程的 newfd 引用 oldfd 所指的打开文件对象。通常在 shell 的子进程中、exec 前完成重定向，父 shell 才能继续用终端显示提示符。",
        options: ["A 正确。oldfd=5 是文件来源，newfd=1 是要替换的标准输出位置。", "B 正确。子进程修改自己的描述符表，父进程的表仍引用原对象。", "C 错误。题目明确 fork 已完成，父进程的表修改不会传播到孩子的表。", "D 正确。两个 fd 引用同一对象时，关闭其中一个不等于删除全部引用。"],
        review: [page(32, "I/O重定向", "比较 dup2(4,1) 前后 fd=1 的箭头，辨清参数方向。"), page(33, "I/O重定向示例", "重点读“shell fork 调用后的子进程中，执行 exec 之前”。"), page(34, "I/O重定向示例（2）", "检查重定向后的 fd=1 和 fd=4 指向哪一个中间表项。")]
      },
      source: book + "，PDF 第 32–34 页；智慧树系统级 I/O 第 8 题补明时序后的变式"
    },
    {
      id: "io-sample-07", replaces: "io-21", type: "choice", group: "标准 I/O 与缓冲",
      prompt: "按课件的缓冲输出模型，stdout 为行缓冲、初始为空，缓冲区足够大。每次刷新非空缓冲区恰调用一次 write 且完整写出；不计库初始化等额外调用。执行下列代码共调用几次 write？",
      code: 'printf("a");\nprintf("b\\n");\nprintf("c");\nprintf("d");\nfflush(stdout);\nexit(0);',
      choices: ["1 次", "2 次", "3 次", "4 次"], correct: 1,
      explanation: "① printf(\"a\") 先把 a 放入缓冲，尚未遇到刷新条件，write 次数为 0。\n② printf(\"b\\n\") 使缓冲成为 ab\\n。题目规定行缓冲，换行触发刷新，一次 write 写出这 3 字节。缓冲随后为空。\n③ printf(\"c\")、printf(\"d\") 在缓冲中积累 cd。fflush 刷新它们，发生第 2 次 write。\n④ exit 会处理流的刷新，但此时没有待输出字节，按题设不会再为该空缓冲调用 write。总计 2 次，应选 B。",
      tip: "在每一行后写出“缓冲内容 / write 累计次数”；换行能否触发刷新，要先看缓冲方式。",
      lesson: {
        concept: "库函数调用、用户缓冲与系统调用次数",
        basics: "多次 printf 可以先积累到用户缓冲，再由一次底层 write 输出。行缓冲在换行等条件下刷新，全缓冲的刷新条件不同；统计调用次数时必须先读清题设模型。",
        options: ["A 不符合题设。它漏掉了换行导致的第一次刷新；若改成全缓冲，才需要重新按另一条轨迹分析。", "B 正确。两批内容是 ab\\n 和 cd，分别刷新一次。", "C 不符合题设。常见误算是把 exit 再计一次，却没检查缓冲是否为空。", "D 不符合题设。四次 printf 不代表四次 write。"],
        review: [page(39, "标准I/O中的缓冲区", "看多次字符输出如何积累到 buf，再调用 write。"), page(42, "标准I/O缓冲区的工作方式", "把示例的多次 printf 与 strace 中的一次 write 对照，再为本题划出两批数据。")]
      },
      source: book + "，PDF 第 39、42 页；智慧树系统级 I/O 第 2 题明确缓冲条件后的变式"
    },
    {
      id: "io-sample-08", replaces: "io-24", type: "long", group: "标准 I/O 与缓冲",
      prompt: "stdout 指向普通文件，设为全缓冲且初始为空，缓冲容量充足，printf 后尚未触发刷新。下面代码的 fork 成功，父子均正常运行到 exit，无其他刷新或输出错误。前两问分别按各自代码条件分析，只统计字符 A。",
      code: 'printf("A");\npid_t pid = fork();\nexit(0);',
      fields: [field("① 最终文件中 A 出现多少次？", 2), field("② 若在 fork 前插入 fflush(stdout)，A 出现多少次？", 1), field("③ 从用户态缓冲与内核文件状态两方面解释差异。", "fork 前 A 留在用户态 stdout 缓冲，fork 复制地址空间后父子各有一个含 A 的缓冲，两个 exit 分别刷新，输出两次。先 fflush 则 A 已输出且缓冲为空，fork 后两个空缓冲都不再输出 A。父子继承的描述符仍引用共享的内核打开文件表项。", "self")],
      explanation: "① printf 先把 A 写入本进程的用户态 stdout 缓冲，全缓冲且容量充足，因此 A 尚未交给 write。\n② fork 后父子各自保有包含 A 的缓冲状态。两边 exit 分别刷新各自的流，各输出一个 A，总计 2 个。printf 语句实际位于 fork 前，代码执行一次仍可产生两份待刷新内容。\n③ 若先 fflush，A 在 fork 前已写入文件，缓冲清空。fork 后继承的两份空缓冲没有 A 可刷新，最终只有 1 个 A。\n④ 共享内核文件位置与复制用户态缓冲同时成立。分析这类题时，应分别画出每个进程里的缓冲以及 fd 所指向的内核对象。",
      tip: "分别画“每个进程自己的缓冲”和“父子共享的文件位置”，把 fork 前 A 所在的位置标出来。",
      lesson: {
        concept: "fork 复制用户缓冲与 exit 刷新之间的联系",
        basics: "stdio 缓冲位于进程的用户地址空间，fork 后父子可分别刷新各自副本。打开文件表项位于内核，继承的描述符又可以引用同一个对象。两层状态的归属决定了输出结果。",
        review: [page(39, "标准I/O中的缓冲区", "先确定 printf 后字节停在 buf，哪些操作会触发刷新。"), page(31, "进程间共享文件：使用fork（2）", "确认共享的 File pos 在中间表项中；它与用户态 stdout 缓冲是不同的对象。")]
      },
      source: book + "，PDF 第 31、39 页；文件共享与标准 I/O 缓冲的组合变式"
    }
  ];
  const topic = topics.find(t => t.id === "io");
  for (const q of samples) {
    const index = topic.questions.findIndex(old => old.id === q.replaces);
    if (index < 0) throw new Error("找不到待替换的 I/O 题目 " + q.replaces);
    q.sample = true;
    topic.questions[index] = q;
  }
})();
