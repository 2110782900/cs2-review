registerTopic({
  "id": "io",
  "title": "系统级 I/O",
  "number": "03",
  "groups": [
    "文件与路径",
    "读写语义与短计数",
    "RIO 与接口选型",
    "共享偏移与元数据",
    "描述符与重定向",
    "标准 I/O 与缓冲"
  ],
  "questions": [
    {
      "id": "io-01",
      "tip": "对每个候选接口分别代入普通文件和 TCP 套接字。需要随机定位或依赖换行边界的选项经不起这项检查。",
      "type": "choice",
      "group": "文件与路径",
      "prompt": "在 Linux 程序看来，下列哪一项可以同时作为普通文件和套接字的访问接口？",
      "choices": [
        "带随机定位功能的数组",
        "整数文件描述符及 read/write 接口",
        "以换行符分隔的字符流",
        "每个程序独占的磁盘块"
      ],
      "correct": 1,
      "explanation": "① 普通文件经 open 打开，网络套接字经 socket 创建，两类操作都能给进程一个整数描述符。\n② read/write 通过这个整数确定访问对象，并以字节数量表达请求和返回结果，因此选择 B。\n③ 普通文件通常有可定位的偏移，TCP 套接字承载有序字节流，应用自行定义消息边界。套接字不能因为也有 fd，就获得普通文件的随机定位能力。\n④ 统一接口的价值在于程序可使用相同的基本读写操作，具体能力和协议仍需按对象判断。",
      "source": "小肥鱼的ppt/08. 用户空间IO(3).pdf，PDF 第 4、5 页",
      "lesson": {
        "concept": "描述符统一接口与对象能力的区别",
        "basics": "fd 是当前进程描述符表中的整数索引。内核根据它找到打开的对象，read 将对象中的字节送到内存，write 将内存字节送出。统一接口并不保证每种对象都支持定位、文本行或相同的等待行为。",
        "review": [
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 4,
            "title": "概述",
            "focus": "辨认 open/close、read/write、lseek 三组接口，分别写出职责。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 5,
            "title": "文件类型",
            "focus": "在文件类型中找出普通文件与套接字，联系统一 Unix I/O 接口。"
          }
        ],
        "options": [
          "A 错误。可定位数组没有表达通用的操作系统 I/O 契约，套接字通常也不能 lseek。",
          "B 正确。整数 fd 标识内核中的打开对象，read/write 接收 fd 并按字节读写。",
          "C 错误。换行符是文本或应用协议的约定，普通文件和套接字都可包含任意二进制字节。",
          "D 错误。fd 不等于磁盘块编号，套接字也不要求对应一组程序独占的磁盘块。"
        ]
      }
    },
    {
      "id": "io-02",
      "tip": "从当前目录开始逐段走路径；遇到 .. 划掉末级目录，遇到 . 保持位置，最后补上文件名。",
      "type": "fill",
      "group": "文件与路径",
      "prompt": "工作目录为 /home/rev/io，路径中没有符号链接。程序打开 ../data/./q.txt 时，目标的规范化绝对路径是什么？",
      "fields": [
        {
          "label": "绝对路径",
          "answers": [
            "/home/rev/data/q.txt"
          ],
          "mode": "text"
        }
      ],
      "explanation": "① 起点为 /home/rev/io，题目给的是相对路径 ../data/./q.txt，因此先拼到这个起点。\n② 首段 .. 从 io 返回 /home/rev。\n③ data 进入 /home/rev/data，随后 . 保持在这个目录。\n④ q.txt 是最终文件名，得到 /home/rev/data/q.txt。这个结果描述目标路径，题目并没有提供文件是否存在或访问权限的信息。",
      "source": "小肥鱼的ppt/08. 用户空间IO(3).pdf，PDF 第 7、9 页",
      "lesson": {
        "concept": "相对路径逐段解析",
        "basics": "绝对路径从根目录 / 出发，相对路径从当前工作目录出发。路径中的 . 表示当前目录，.. 表示上级目录。本题排除了符号链接，因而可以直接按目录层级简化。",
        "review": [
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 7,
            "title": "目录",
            "focus": "看 . 和 .. 两个基本目录项分别指向哪里。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 9,
            "title": "路径名",
            "focus": "从图中的当前目录出发重走相对路径，区分与根目录起步的绝对路径。"
          }
        ]
      }
    },
    {
      "id": "io-03",
      "tip": "把「名字怎样指向文件」「谁解释文件中的字节」「目录是否为空」拆开检查，避免把目录项当成数据副本。",
      "type": "choice",
      "group": "文件与路径",
      "prompt": "下列关于文件类型与目录的说法，哪一项成立？",
      "choices": [
        "文本文件和二进制文件必须由内核使用两套 read 接口",
        "目录中每个名字都保存目标文件的完整内容",
        "rmdir 可以直接删除含有普通文件的目录",
        "目录建立文件名与文件之间的联系，普通文件本身可以含任意字节"
      ],
      "correct": 3,
      "explanation": "① 先判断文件的内容层。普通文件可保存任意字节，文本与二进制的解释由应用完成，内核不需要两套 read 接口。\n② 再判断名字层。目录项帮助按名字找到文件，不会为每个名字复制整个文件内容。\n③ 最后判断操作限制。rmdir 用于删除空目录，仍有普通文件的目录不满足这个条件。\n④ D 同时准确描述了目录的命名作用和普通文件的字节内容，因此选择 D。",
      "source": "小肥鱼的ppt/08. 用户空间IO(3).pdf，PDF 第 6、7 页",
      "lesson": {
        "concept": "文件内容、文件名与目录操作",
        "basics": "普通文件保存字节，应用按约定将其解释成文本、图像或其他格式。目录保存文件名与文件之间的联系。删除空目录、列出目录和改变工作目录分别对应不同操作。",
        "review": [
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 6,
            "title": "普通文件",
            "focus": "看“内核并不知道以上两者的区别”，将字节与应用格式分开。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 7,
            "title": "目录",
            "focus": "核对目录链接、.、.. 与 rmdir 的空目录限制。"
          }
        ],
        "options": [
          "A 错误。文本与二进制都可通过同一 read 接口读成字节，内容解释发生在应用层。",
          "B 错误。目录记录文件名与文件的映射，名字对应的内容保存在文件中。",
          "C 错误。rmdir 要求目标目录为空，含普通文件的目录不能直接这样删除。",
          "D 正确。目录负责名字与文件的联系，普通文件允许任意字节内容。"
        ]
      }
    },
    {
      "id": "io-04",
      "tip": "在 0、1、2 三个编号旁分别写下数据流的去向。重定向时对照哪些编号的目标改变了。",
      "type": "fill",
      "group": "文件与路径",
      "prompt": "新进程沿用惯例的三个标准描述符。按标准输入、标准输出、标准错误的顺序填写其编号。",
      "fields": [
        {
          "label": "标准输入",
          "answers": [
            "0"
          ],
          "mode": "number"
        },
        {
          "label": "标准输出",
          "answers": [
            "1"
          ],
          "mode": "number"
        },
        {
          "label": "标准错误",
          "answers": [
            "2"
          ],
          "mode": "number"
        }
      ],
      "explanation": "① 按惯例，STDIN_FILENO 为 0、STDOUT_FILENO 为 1、STDERR_FILENO 为 2，依次填 0、1、2。\n② 终端只是常见初始目标。执行输入输出重定向后，同样的编号可改为引用普通文件或其他 I/O 对象。\n③ 程序仍可使用 read(0,...) 或 write(1,...)；目标的改变来自描述符表的引用关系，而不是编号的重新命名。",
      "source": "小肥鱼的ppt/08. 用户空间IO(3).pdf，PDF 第 10、37 页",
      "lesson": {
        "concept": "标准描述符与标准流",
        "basics": "Unix 习惯将 0、1、2 分别用于输入、常规输出、错误输出。这些数字是描述符，C 的 stdin、stdout、stderr 则是包装相应描述符与缓冲状态的 FILE 流对象。",
        "review": [
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 10,
            "title": "打开文件",
            "focus": "对照 0、1、2 的三个用途，并区别 open 返回的 fd 与文件内容。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 37,
            "title": "标准I/O流",
            "focus": "对照 FILE *stdin/stdout/stderr 与括号内的 descriptor 0/1/2。"
          }
        ]
      }
    },
    {
      "id": "io-05",
      "tip": "用 read 的实际返回值标出缓冲区的有效范围，然后查应用协议是否还需补读。TCP 的一次读取没有消息边界保证。",
      "type": "choice",
      "group": "读写语义与短计数",
      "prompt": "阻塞式 TCP 连接上调用 read(fd, buf, 120)，成功返回 36。哪一种处理符合 read 的契约？",
      "choices": [
        "将已收到的 36 字节交给协议层，按协议决定是否继续读",
        "把整个 120 字节缓冲区当作新数据",
        "返回 36 就表明对端关闭了连接",
        "认定内核出错并丢弃这批数据"
      ],
      "correct": 0,
      "explanation": "正返回值是实际复制的字节数。只应使用 buf 的前 36 字节。若协议要求恰好 120 字节，则继续补读；有数据到达但暂时不足 120 字节时也能正常返回。",
      "source": "课件 08《用户空间IO》P10–19"
    },
    {
      "id": "io-06",
      "tip": "把偏移视为下一次要读的下标。先列出尚可读取的下标，再判断当前是否已处在 EOF。",
      "type": "fill",
      "group": "读写语义与短计数",
      "prompt": "普通文件长 11 字节，偏移初始为 7。连续两次请求读取 8 字节，期间没有写入，也没有错误。按课件普通磁盘文件模型，除 EOF 外读满请求量，期间没有其他读取、定位或信号中断。",
      "fields": [
        {
          "label": "第一次 read 的返回值",
          "answers": [
            "4"
          ],
          "mode": "number"
        },
        {
          "label": "第二次 read 的返回值",
          "answers": [
            "0"
          ],
          "mode": "number"
        },
        {
          "label": "最终偏移",
          "answers": [
            "11"
          ],
          "mode": "number"
        }
      ],
      "explanation": "① 文件长 11 字节，有效下标为 0 至 10。起始偏移 7，尚有 11−7=4 字节可读。\n② 第一次请求 8 字节，按题设普通文件模型实际读到剩余的 4 字节，返回 4，位置更新为 7+4=11。\n③ 第二次仍请求 8 字节，但位置已经在末尾，且文件没有增长，因此返回 0。\n④ 没有读到新字节就不再推进位置，最终偏移仍为 11。EOF 是本次读取的结果状态，文件末尾无需额外存放一个专门的 EOF 字节。",
      "source": "小肥鱼的ppt/08. 用户空间IO(3).pdf，PDF 第 4、12、15 页",
      "lesson": {
        "concept": "文件偏移与 EOF 短读",
        "basics": "普通文件的当前位置是下一次将要访问的字节下标。成功读取 k 字节后，位置前进 k。请求量大于剩余字节时，本次只得到剩余字节；随后在末尾执行正长度读取得到 0。",
        "review": [
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 4,
            "title": "概述",
            "focus": "看当前游标位置 k 指向下一次读写的字节。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 12,
            "title": "读文件",
            "focus": "检查读取数量、返回数量与位置更新的关系。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 15,
            "title": "关于短计数",
            "focus": "用 EOF 场景解释为什么第一次成功读取少于请求数。"
          }
        ]
      }
    },
    {
      "id": "io-07",
      "tip": "同时核对第二次 write 的起点和长度。草稿上把 64 字节划成已写与待写两段，检查两段既无重叠也无空隙。",
      "type": "choice",
      "group": "读写语义与短计数",
      "prompt": "正在复制一块二进制数据。第一次 write(fd, p, 64) 成功返回 20，下一次应写哪一段？",
      "choices": [
        "write(fd, p, 64)",
        "write(fd, p, 44)",
        "write(fd, p + 20, 44)，其中 p 的类型是 char *",
        "write(fd, p + 44, 20)"
      ],
      "correct": 2,
      "explanation": "前 20 字节已经交给内核，补写应从下标 20 开始，数量是 64−20。若再次短写，继续按实际写入量更新指针和剩余数。",
      "source": "课件 08《用户空间IO》P10–19"
    },
    {
      "id": "io-08",
      "tip": "记录正返回值的累计和，再把它与协议长度比较。流结束与一条记录收齐需要分别判断。",
      "type": "long",
      "group": "读写语义与短计数",
      "prompt": "接收一个总长为 20 字节的定长记录。三次 read 依次返回 6、9、0，均没有系统错误。协议规定半条记录不能交给上层。",
      "fields": [
        {
          "label": "已累计多少字节",
          "answers": [
            "15"
          ],
          "mode": "number"
        },
        {
          "label": "距离完整记录还差多少字节",
          "answers": [
            "5"
          ],
          "mode": "number"
        },
        {
          "label": "收到第三次返回值时，应如何处理这条记录？",
          "answers": [
            "识别 EOF 并退出补读，向上层报告截断或不完整记录，不能把 15 字节当作完整记录交付。"
          ],
          "mode": "self"
        }
      ],
      "explanation": "先累计正返回值，6+9=15。零表示流的结束，继续等待同一条记录无法补齐剩余 5 字节。传输层成功读到一些数据与应用层成功接收一条记录是两件事。",
      "source": "课件 08《用户空间IO》P10–19"
    },
    {
      "id": "io-09",
      "tip": "在连接的生命周期上标记 rio_t 的初始化位置。读下一行时先问上次预取的字节存在哪儿。",
      "type": "choice",
      "group": "RIO 与接口选型",
      "prompt": "客户端以换行分隔命令，服务端想跨多次调用复用输入缓冲区。在 CSAPP 的 RIO 接口中，哪一组最合适？",
      "choices": [
        "重复调用 rio_readinitb，随后每次只读一个字节",
        "rio_readinitb 初始化一次，再反复调用 rio_readlineb",
        "用 printf 判别输入中的换行符",
        "直接调用一次 read 获取所有命令"
      ],
      "correct": 1,
      "explanation": "① 连接以换行定界，选用按行读取的 rio_readlineb。\n② 对同一个连接先用 rio_readinitb 初始化一次 rio_t，再在循环中反复调用 rio_readlineb，因此选择 B。\n③ 如果底层一次 read 收到了两行数据，第一次调用只交出第一行，其余字节仍留在 rio_t。第二次调用应从这里继续消费。\n④ 若每行都重新初始化，尚未消费的状态可能被重置；裸 read 的一次返回又可能只有半行或多行，不能代替完整的按行逻辑。",
      "source": "小肥鱼的ppt/08. 用户空间IO(3).pdf，PDF 第 20、23、24 页",
      "lesson": {
        "concept": "按行读取与 rio_t 的生命周期",
        "basics": "rio_t 中保存 fd、尚未消费的字节数、缓冲区指针与字节数组。rio_readinitb 建立状态，rio_readlineb 在多次调用之间使用并更新这份状态，以保存一次预取中多读的后续数据。",
        "review": [
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 20,
            "title": "有缓冲的输入",
            "focus": "对照 rio_readinitb 与 rio_readlineb 的职责和参数。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 23,
            "title": "rio_t结构体",
            "focus": "找 rio_cnt、rio_bufptr 和 rio_buf，解释每项如何保存读取进度。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 24,
            "title": "RIO的使用示例",
            "focus": "确认初始化位于 while 循环外，循环体使用同一个 rio。"
          }
        ],
        "options": [
          "A 错误。重复初始化会重置缓冲状态，可能丢失上次预取而尚未交出的字节。",
          "B 正确。初始化一次建立连接状态，后续按行读取持续消费同一缓冲。",
          "C 错误。printf 是格式化输出函数，无法从套接字读取并判别命令边界。",
          "D 错误。read 返回的字节数量与应用的换行边界无固定对应关系，一次调用无法保证收到所有命令。"
        ]
      }
    },
    {
      "id": "io-10",
      "tip": "两个读取函数都应接收同一个 rio_t。看到正文含二进制时，再检查所选接口是按长度还是按换行停止。",
      "type": "fill",
      "group": "RIO 与接口选型",
      "prompt": "从同一个 rio_t 先读一行文本头，再按长度读二进制正文。请填教材中的两个有缓冲读取函数名。",
      "fields": [
        {
          "label": "读取文本行",
          "answers": [
            "rio_readlineb"
          ],
          "mode": "text"
        },
        {
          "label": "读取定长正文（至多指定字节数）",
          "answers": [
            "rio_readnb"
          ],
          "mode": "text"
        }
      ],
      "explanation": "两者都通过同一个 rio_t 消费预取数据。正文可能含零字节，因此使用显式长度。若 EOF 提前出现，仍需检查返回值是否达到正文长度。",
      "source": "课件 08《用户空间IO》P17–24、46–49"
    },
    {
      "id": "io-11",
      "tip": "画出内核接收队列和 rio_t 缓冲区两层。先定位预取的正文字节，再检查新接口会从哪一层取数据。",
      "type": "choice",
      "group": "RIO 与接口选型",
      "prompt": "一个连接由 rio_readlineb 读完协议头，后面的正文仍在这个连接上。立刻改用裸 read 读正文有什么风险？",
      "choices": [
        "第二次调用一定抛出权限错误",
        "read 会把刚刚的协议头再返回一次",
        "正文会自动变为文本",
        "RIO 已把一部分正文预取到用户缓冲中，裸 read 会绕过它"
      ],
      "correct": 3,
      "explanation": "① 设底层一次 read 同时取到协议头和正文的前几字节，它们进入 rio_t 缓冲。\n② rio_readlineb 只将协议头交给调用者，正文的这部分仍留在用户态缓冲中。\n③ 若下一步直接 read(fd,...)，它从内核仍未交出的数据处继续读取，无法取回已被 RIO 预取的正文前缀，因此选择 D。\n④ 按长度读取正文时，应继续使用 rio_readnb(&rio,buf,n)，从原 rio_t 的未消费部分接上。对 TCP 来说，应理解为数据已移出内核接收队列，不应套用可随机定位的磁盘文件游标。",
      "source": "小肥鱼的ppt/08. 用户空间IO(3).pdf，PDF 第 21、22 页",
      "lesson": {
        "concept": "两层缓冲之间的数据归属",
        "basics": "底层 read 从内核取出数据后，数据可能先进入 rio_t 的用户态缓冲。应用消费了一行，未必已经消费完这次底层读取所得的全部字节；后续读取应继续使用保存它们的同一个 rio_t。",
        "review": [
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 21,
            "title": "有缓冲的输入（2）",
            "focus": "读可交错使用的两个缓冲接口，以及不要交错使用 rio_readn 的提醒。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 22,
            "title": "有缓冲输入输出的实现",
            "focus": "找出 already read、unread、unseen 三段，指出裸 read 会跳过哪一段。"
          }
        ],
        "options": [
          "A 错误。接口混用不会必然改变权限或制造权限错误。",
          "B 错误。裸 read 不会自动回退到协议头的位置；已有预取还会使后续数据被越过。",
          "C 错误。字节的文本或二进制解释由应用决定，调用 read 不执行这种格式转换。",
          "D 正确。原 rio_t 保管着已经从内核取出、尚未交给调用者的字节，裸 read 无法直接消费它们。"
        ]
      }
    },
    {
      "id": "io-12",
      "tip": "在纸上写一个第二字节为零的 32 字节记录，试算 strlen 的结果。随后核对两端传给 RIO 的长度。",
      "type": "long",
      "group": "RIO 与接口选型",
      "prompt": "设计一个客户端：终端输入一行文件名，经网络发送一个含零字节的固定 32 字节记录（发送缓冲中已经备齐这 32 字节）。服务端使用阻塞套接字且约定读满记录或报告提前 EOF。",
      "fields": [
        {
          "label": "客户端将 32 字节完整写往套接字的 RIO 函数",
          "answers": [
            "rio_writen"
          ],
          "mode": "text"
        },
        {
          "label": "服务端采用无缓冲 RIO 读满记录的函数",
          "answers": [
            "rio_readn"
          ],
          "mode": "text"
        },
        {
          "label": "说明为什么不能用 strlen 确定记录长度",
          "answers": [
            "零字节是二进制载荷的一部分，strlen 会在首个零字节处停止。按协议显式传入 32 并检查返回值。"
          ],
          "mode": "self"
        }
      ],
      "explanation": "① 发送方要写完整的 32 字节记录，调用 rio_writen(fd,buf,32)。其内部按实际写入量移动指针、减少剩余量，因此第一次短写不会被当作整个任务完成。\n② 接收方采用无缓冲读取，调用 rio_readn(fd,buf,32)。应检查返回值是否恰为 32；0 至 31 表示本次在凑满记录前遇到 EOF，−1 表示错误。\n③ 若记录开头为 0x41、0x00、0x42，strlen 只能数出 1；协议却可能仍有完整的 32 字节。因而应使用题目给定的长度。\n④ 检查成功返回值仍是调用者的职责；RIO 的健壮性不保证网络或文件永远没有错误。",
      "source": "小肥鱼的ppt/08. 用户空间IO(3).pdf，PDF 第 18、19、49 页",
      "lesson": {
        "concept": "精确计数 RIO 与二进制记录长度",
        "basics": "rio_readn 与 rio_writen 按显式字节数循环处理短计数。rio_readn 读满或在 EOF 提前结束，也可能报告错误；rio_writen 成功时写完请求量，错误则返回 −1。二进制载荷可以包含值为零的字节。",
        "review": [
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 18,
            "title": "无缓冲的输入和输出",
            "focus": "对照两个 n 接口的参数、成功返回值和 EOF 条件。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 19,
            "title": "rio_readn的实现",
            "focus": "追踪 nleft 与 bufp 的每轮更新，说明怎样累积短读。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 49,
            "title": "如何选择I/O函数",
            "focus": "定位网络套接字推荐 RIO 的使用场景。"
          }
        ]
      }
    },
    {
      "id": "io-13",
      "tip": "统计题中独立 open 的次数，为每次 open 单独画一个游标。路径相同不能证明共用游标。",
      "type": "choice",
      "group": "共享偏移与元数据",
      "prompt": "进程连续两次 open 同一路径，各自以只读方式成功打开。从第一个 fd 读一字节后，第二个 fd 的偏移是多少？假设两次打开时偏移均为 0。",
      "choices": [
        "1",
        "等于文件总长度",
        "0",
        "取决于 fd 的数值大小"
      ],
      "correct": 2,
      "explanation": "① 画出 fd1→打开项 A→文件，fd2→打开项 B→同一个文件。题目明确 A、B 的初始偏移都是 0。\n② 从 fd1 读走一字节只推进打开项 A 的偏移到 1。\n③ fd2 指向的打开项 B 未执行读取或定位，偏移仍是 0，选择 C。\n④ 判断共享游标时要数打开文件表项，不能只数文件路径。dup 或 fork 继承已有引用时，才需要按共同游标重新分析。",
      "source": "小肥鱼的ppt/08. 用户空间IO(3).pdf，PDF 第 29、31 页；CSAPP 第3版习题 10.2（独立 open） 思路改编",
      "lesson": {
        "concept": "独立 open 与独立文件位置",
        "basics": "对同一路径各做一次 open，会产生两个打开文件表项，各自维护偏移与打开状态。它们可指向相同的底层文件，因此共享文件内容不推出共享当前文件位置。",
        "review": [
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 29,
            "title": "文件共享",
            "focus": "沿同一路径两次 open 的两个中间表项，分别找 File pos。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 31,
            "title": "进程间共享文件：使用fork（2）",
            "focus": "比较 fork 继承引用的箭头结构，明确与独立 open 的区别。"
          }
        ],
        "options": [
          "A 错误。只有第一个打开文件表项发生了读取，不能把它的新位置复制给第二项。",
          "B 错误。一次成功读取一字节不意味着把其他 fd 自动移动到末尾。",
          "C 正确。第二次 open 的表项独立，仍保有初始位置 0。",
          "D 错误。fd 的整数大小只是表项索引，不能决定字节偏移。"
        ]
      }
    },
    {
      "id": "io-14",
      "tip": "画两张描述符表，并把继承的 fd 连到同一打开文件表项。孩子读完后先更新这个表项，再模拟父进程读。",
      "type": "fill",
      "group": "共享偏移与元数据",
      "prompt": "文件内容为 ABCDEF，fd 初始偏移为 0。fork 后由子进程先通过 fd 读 2 字节，父进程确认子进程读完后再读 1 字节。",
      "fields": [
        {
          "label": "子进程读到的字符串",
          "answers": [
            "AB"
          ],
          "mode": "text"
        },
        {
          "label": "父进程读到的字符",
          "answers": [
            "C"
          ],
          "mode": "text"
        }
      ],
      "explanation": "fork 复制描述符表，父、子的相应描述符引用同一个打开文件表项。子进程读取 AB 推进共享偏移到 2，父进程因此读到下标 2 的 C。",
      "source": "课件 08《用户空间IO》P26–31；CSAPP 第3版习题 10.3（fork 共享游标） 思路改编"
    },
    {
      "id": "io-15",
      "tip": "圈出题中已经拿到的是路径还是 fd，再区分所求的是文件属性、文件内容还是游标。",
      "type": "choice",
      "group": "共享偏移与元数据",
      "prompt": "已经拿到一个打开的普通文件描述符，想直接查询它的大小和模式。哪项最合适？",
      "choices": [
        "fstat(fd, &st)",
        "read(fd, &st, sizeof st)",
        "stat(fd, &st)",
        "lseek(fd, 0, SEEK_SET)"
      ],
      "correct": 0,
      "explanation": "① 题目已提供 fd，要求大小与模式，因此直接调用 fstat(fd,&st)，选择 A。\n② 调用成功后，st.st_size 给出文件大小，st.st_mode 提供模式与类型信息；函数本身的返回值表示成功或失败。\n③ read 会把文件内容写进所给内存，并可能推进游标，不会替你组织出 struct stat。\n④ lseek(fd,0,SEEK_SET) 将当前位置设到开头；stat 的第一个参数要求路径，不能把整数 fd 直接当成路径传入。",
      "source": "小肥鱼的ppt/08. 用户空间IO(3).pdf，PDF 第 26、27 页；CSAPP 第3版习题 10.8（按描述符查元数据） 思路改编",
      "lesson": {
        "concept": "按路径或描述符查询元数据",
        "basics": "元数据描述文件的大小、类型、保护模式等属性。stat 的入口是路径，fstat 的入口是已打开的 fd，结果写入 struct stat。数据内容与当前游标另有对应接口。",
        "review": [
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 26,
            "title": "文件元数据",
            "focus": "找到 st_size 和 st_mode 的含义，对照 stat/fstat 的查询用途。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 27,
            "title": "示例",
            "focus": "读 S_ISREG、S_ISDIR 和权限位检查，分清结构成员与函数返回码。"
          }
        ],
        "options": [
          "A 正确。fstat 用已经打开的 fd 查询，适配题目现成的输入。",
          "B 错误。read 复制的是文件字节，写入 struct stat 所在内存不会让数据自动变成元数据。",
          "C 错误。stat 接收文件路径字符串，整数 fd 不符合参数要求。",
          "D 错误。此调用定位到文件开头，不会返回文件的大小与保护模式。"
        ]
      }
    },
    {
      "id": "io-16",
      "tip": "为独立 open 各画一个偏移格，dup 只给已有格添一条箭头。每次 read 或 lseek 后立即更新对应格。",
      "type": "long",
      "group": "共享偏移与元数据",
      "prompt": "普通文件内容 0123456789。a 和 b 来自两次独立 open，c=dup(a)。依次做 read(a, ..., 2)、lseek(c, 5, SEEK_SET)、read(b, ..., 1)、read(a, ..., 1)。两次 open 的初始偏移均为 0，各次 read 均读满所请求字节，所有调用成功，期间没有其他读写或定位。",
      "fields": [
        {
          "label": "通过 b 读到的字符",
          "answers": [
            "0"
          ],
          "mode": "text"
        },
        {
          "label": "最后通过 a 读到的字符",
          "answers": [
            "5"
          ],
          "mode": "text"
        },
        {
          "label": "最终 c 对应的偏移",
          "answers": [
            "6"
          ],
          "mode": "number"
        }
      ],
      "explanation": "① 初始画两项：a、c 共同指向打开项 A，偏移 0；b 指向打开项 B，偏移 0。\n② read(a,...,2) 读下标 0、1，A 的偏移变成 2；lseek(c,5,SEEK_SET) 通过共享引用把 A 直接设为 5。\n③ read(b,...,1) 使用 B 的位置 0，读到字符 0，B 的偏移变成 1。\n④ 最后 read(a,...,1) 从 A 的位置 5 读到字符 5，A 的偏移变成 6。c 也引用 A，所以所对应的最终偏移是 6。",
      "source": "小肥鱼的ppt/08. 用户空间IO(3).pdf，PDF 第 29、32、4 页；CSAPP 第10章",
      "lesson": {
        "concept": "独立打开状态与 dup 引用共存",
        "basics": "每次独立 open 建立自己的文件位置。dup 为调用进程增加一个描述符引用，仍指向原来的打开文件表项。read 与 lseek 都应更新它们实际指向的那一项。",
        "review": [
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 29,
            "title": "文件共享",
            "focus": "为两次 open 分别画出 File pos，确认 b 的独立性。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 32,
            "title": "I/O重定向",
            "focus": "由复制描述符引用的图理解 dup 与 dup2 共有的共享打开状态原理。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 4,
            "title": "概述",
            "focus": "核对 lseek 改变下一次读写位置，而非读取文件内容。"
          }
        ]
      }
    },
    {
      "id": "io-17",
      "tip": "把调用读成「让第二个编号指向第一个编号当前指向的对象」，再核对新程序实际 write 的编号。",
      "type": "choice",
      "group": "描述符与重定向",
      "prompt": "shell 子进程已用 fd=5 打开目标文件。希望让新程序正常执行 write(1,...) 就能把数据送到该文件。应调用什么？",
      "choices": [
        "dup2(1, 5)",
        "dup2(5, 1)",
        "dup2(5, 2)",
        "close(5) 即可"
      ],
      "correct": 1,
      "explanation": "dup2(oldfd,newfd) 令 newfd 引用 oldfd 的打开文件表项。这里需要改变目标描述符 1 的含义，因此参数是 5、1。",
      "source": "课件 08《用户空间IO》P28–34；24251 回忆卷 P2"
    },
    {
      "id": "io-18",
      "tip": "close 后重新列出从小到大的空位。第一次 open 占去一格后，再为第二次 open 选位。",
      "type": "fill",
      "group": "描述符与重定向",
      "prompt": "仅 0、1、2、3 四个描述符已被占用。close(1) 成功后，普通 open 成功返回系统分配的最低可用编号，随后另一次 open 也成功。进程单线程运行，期间没有其他打开、关闭或复制描述符的操作。",
      "fields": [
        {
          "label": "第一次 open 的 fd",
          "answers": [
            "1"
          ],
          "mode": "number"
        },
        {
          "label": "第二次 open 的 fd",
          "answers": [
            "4"
          ],
          "mode": "number"
        }
      ],
      "explanation": "① 初始占用集合是 {0,1,2,3}。执行 close(1) 后，已占用集合成为 {0,2,3}。\n② 此时最低空位是 1，第一次 open 返回 1，占用集合恢复为 {0,1,2,3}。\n③ 下一次 open 时最低空位变成 4，所以返回 4。\n④ 每次打开都依据当时的描述符表重新选择；不能固定认为普通文件一定从编号 3 开始。",
      "source": "小肥鱼的ppt/08. 用户空间IO(3).pdf，PDF 第 10、11 页；24251 回忆卷 P2；CSAPP 第3版习题 10.6（最低可用编号） 思路改编",
      "lesson": {
        "concept": "描述符空位的重新分配",
        "basics": "open 成功时使用进程描述符表中最低的可用编号。close 删除一个引用后，该编号可以再次分配。0、1、2 的标准用途属于惯例，不会阻止内核使用已经空出的编号。",
        "review": [
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 10,
            "title": "打开文件",
            "focus": "对照返回的小整数 fd 及三个初始描述符，检查哪些编号当前被占用。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 11,
            "title": "关闭文件",
            "focus": "确认 close 后原描述符不能继续按旧对象使用，再联系编号回收。"
          }
        ]
      }
    },
    {
      "id": "io-19",
      "tip": "把重定向分两步画：每做一步就更新一次 1、2 的箭头。复制描述符时使用该时刻的目标。",
      "type": "choice",
      "group": "描述符与重定向",
      "prompt": "程序开始时 stdout 和 stderr 都指向终端。shell 按从左到右的顺序执行 cmd > out 2>&1，所有重定向操作成功，最终的结果是什么？",
      "choices": [
        "只有 stderr 写入 out",
        "仅 stdout 写入 out",
        "stdout、stderr 分别独立 open 两次 out",
        "stdout 和 stderr 都引用重定向后 stdout 的打开文件表项"
      ],
      "correct": 3,
      "explanation": "① 初始 fd1→终端，fd2→终端。\n② 先执行 > out，使 fd1 指向为 out 打开的文件表项。\n③ 再执行 2>&1，将此刻 fd1 的引用复制给 fd2；最终 fd1、fd2 都指向同一个打开文件表项，选择 D。\n④ 这里只有一次为 out 建立打开状态的操作，复制 fd 不会再次独立 open。两份引用因而共享该打开状态。若反向分析其他命令，务必按其实际书写顺序重画箭头。",
      "source": "小肥鱼的ppt/08. 用户空间IO(3).pdf，PDF 第 32、34 页；24251 回忆卷 P2",
      "lesson": {
        "concept": "重定向的从左到右求值",
        "basics": "shell 的描述符复制采用复制当时引用关系的方式。重定向到文件先建立文件引用，随后 2>&1 将当前的标准输出引用复制到标准错误；它不会建立日后随编号 1 自动变化的永久别名。",
        "review": [
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 32,
            "title": "I/O重定向",
            "focus": "用 oldfd、newfd 的箭头描述引用复制，避免把 2>&1 误解为写入文件“1”。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 34,
            "title": "I/O重定向示例（2）",
            "focus": "核对两个描述符同时指向一个打开文件表项的图。"
          }
        ],
        "options": [
          "A 错误。第一步已经把 stdout 接到 out，后续复制不会让它自动返回终端。",
          "B 错误。第二步明确改变了 stderr 的引用，它也会输出到 out。",
          "C 错误。2>&1 复制已有引用，不会为 out 创建第二个独立的 open 状态。",
          "D 正确。按照从左到右顺序，两个输出描述符最终共享同一个打开文件表项。"
        ]
      }
    },
    {
      "id": "io-20",
      "tip": "检查重定向发生在哪个进程、在 exec 的哪一侧。关闭额外描述符前，再确认编号 1 已接到目标文件。",
      "type": "long",
      "group": "描述符与重定向",
      "prompt": "给 shell 实现 report > result.txt。父 shell 要继续向终端显示提示符。子进程中用 open 得到 fd=6，题设要求覆盖旧内容，所有调用成功。",
      "fields": [
        {
          "label": "open 已含 O_WRONLY | O_CREAT，另一个必要标志",
          "answers": [
            "O_TRUNC"
          ],
          "mode": "text"
        },
        {
          "label": "dup2 的第一个参数",
          "answers": [
            "6"
          ],
          "mode": "number"
        },
        {
          "label": "dup2 的第二个参数",
          "answers": [
            "1"
          ],
          "mode": "number"
        },
        {
          "label": "写出执行的位置、时机，以及 fd=6 的后续处理",
          "answers": [
            "在 fork 后的子进程中、exec 之前重定向。dup2 后关闭多余的 fd 6，随后 exec 启动 report，父 shell 保持原来的 stdout。"
          ],
          "mode": "self"
        }
      ],
      "explanation": "① 题目要求覆盖旧内容，打开标志使用 O_WRONLY | O_CREAT | O_TRUNC。O_CREAT 允许文件不存在时创建，O_TRUNC 处理已有文件的旧内容。\n② 所有重定向工作放在 fork 后的子进程、exec 之前。open 已返回 6，调用 dup2(6,1)，让子进程的 fd1 引用目标文件。\n③ dup2 成功后 fd1 自己持有引用，再 close(6) 释放多余引用；这不会破坏 fd1。\n④ 随后 exec 执行 report，程序正常写标准输出即可进入 result.txt。父 shell 没有改动自己的 fd1，所以仍能在终端显示提示符。",
      "source": "小肥鱼的ppt/08. 用户空间IO(3).pdf，PDF 第 33、34、10 页；24251 回忆卷 P2；CSAPP 第3版习题 10.9（shell 中的重定向） 思路改编",
      "lesson": {
        "concept": "shell 子进程中完成输出重定向",
        "basics": "父 shell 与 fork 后的孩子各有自己的描述符表。让子进程在 exec 前修改其 fd1，就能使新程序沿用目标文件作为标准输出，同时保留父 shell 的终端输出。O_TRUNC 用于在写打开时截断已有普通文件。",
        "review": [
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 33,
            "title": "I/O重定向示例",
            "focus": "读清“fork 后的子进程中，exec 之前”，确定代码插入位置。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 34,
            "title": "I/O重定向示例（2）",
            "focus": "把图中 fd4 换成本题 fd6，跟踪复制后 fd1 的目标。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 10,
            "title": "打开文件",
            "focus": "联系 open 的标志参数与返回的 fd；本题延伸应用 O_TRUNC。"
          }
        ]
      }
    },
    {
      "id": "io-21",
      "tip": "先在格式串里找换行符，再找程序进入等待之前的刷新点。仅让时间过去不会主动刷新这一行。",
      "type": "choice",
      "group": "标准 I/O 与缓冲",
      "prompt": "在 Linux 上，stdout 已明确设为行缓冲，终端程序执行 printf(\"ready\") 后要等待用户输入。怎样保证等待前就能看到提示？",
      "choices": [
        "改用更长的字符串",
        "调用 fstat(1,...)",
        "在 printf 后显式 fflush(stdout)",
        "暂停进程一秒钟"
      ],
      "correct": 2,
      "explanation": "没有换行的提示可能停在用户态缓冲区。fflush(stdout) 请求刷新它。进程暂停的时长和元数据查询都不保证缓冲区已经刷新。",
      "source": "课件 08《用户空间IO》P36–49"
    },
    {
      "id": "io-22",
      "tip": "在返回值后先写上「个完整元素」，再乘元素大小换算字节。不要把请求的元素数当成成功的元素数。",
      "type": "fill",
      "group": "标准 I/O 与缓冲",
      "prompt": "一次调用 fwrite(buf, 4, 6, fp) 返回 5。按 fwrite 的返回值单位计算已完整写出的元素数和这些完整元素的总字节数。",
      "fields": [
        {
          "label": "成功写出的完整元素数",
          "answers": [
            "5"
          ],
          "mode": "number"
        },
        {
          "label": "这些完整元素对应多少字节",
          "answers": [
            "20"
          ],
          "mode": "number"
        }
      ],
      "explanation": "① 调用中的 4 是每个元素的字节数，6 是本次请求的元素数，请求总量为 4×6=24 字节。\n② 返回值 5 的单位是完整元素，所以第一空填 5。\n③ 这些完整元素共包含 5×4=20 字节，第二空填 20。\n④ 本题仅问完整元素所覆盖的字节数。返回值不足 6 时还应检查流错误状态；它不提供额外的不完整元素字节数，也不证明这些数据已经持久化到磁盘。",
      "source": "小肥鱼的ppt/08. 用户空间IO(3).pdf，PDF 第 36、37 页",
      "lesson": {
        "concept": "fwrite 的完整元素计数",
        "basics": "fwrite(ptr,size,nmemb,stream) 请求写出 nmemb 个、每个 size 字节的元素，返回成功写出的完整元素数。写入标准流可能先进入用户缓冲，因此计数不能直接解释为磁盘持久化的字节量。",
        "review": [
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 36,
            "title": "标准I/O",
            "focus": "定位 fread/fwrite 这组二进制读写接口，再按本题给出的元素大小与数量区分三个量。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 37,
            "title": "标准I/O流",
            "focus": "复习流包含 fd 与用户缓冲，区分成功交给流与持久化存储。"
          }
        ]
      }
    },
    {
      "id": "io-23",
      "tip": "假设信号恰好打断了 stdout 缓冲区的更新，逐项检查候选函数是否有异步信号安全保证。",
      "type": "choice",
      "group": "标准 I/O 与缓冲",
      "prompt": "信号处理程序要输出一个固定的单字节标记。假定描述符有效，允许短暂阻塞。在以下接口中应优先选哪一个？",
      "choices": [
        "printf",
        "fprintf",
        "fputs",
        "write"
      ],
      "correct": 3,
      "explanation": "① 题目是在信号处理程序内部输出，首先应按异步信号安全性筛选接口。\n② printf、fprintf、fputs 都属于标准 I/O，会使用 FILE 或其他库内部状态。信号可能恰在这些状态更新中间打断主流程。\n③ write 通过给定 fd 和字节缓冲执行底层输出，具有异步信号安全保证，因此选择 D。\n④ 异步信号安全不表示调用永远不阻塞，也不表示调用一定成功。实际代码仍应按需要检查返回值，并避免处理函数破坏主流程需要的 errno。",
      "source": "小肥鱼的ppt/08. 用户空间IO(3).pdf，PDF 第 47、48、49 页",
      "lesson": {
        "concept": "信号处理函数中的异步信号安全",
        "basics": "信号可在主流程执行库函数的中间到来。如果处理函数再次操作该库正在更新的共享内部状态，就可能产生重入问题。write 具有异步信号安全保证，常见 stdio 输出接口没有这种保证。",
        "review": [
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 47,
            "title": "Unix I/O 的优缺点",
            "focus": "定位异步信号安全这一优势，并结合题目识别 write。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 48,
            "title": "标准I/O 的优缺点",
            "focus": "阅读标准 I/O 不适于信号处理程序的原因。"
          },
          {
            "file": "小肥鱼的ppt/08. 用户空间IO(3).pdf",
            "number": 49,
            "title": "如何选择I/O函数",
            "focus": "把信号处理场景与 Unix I/O 的选型对应起来。"
          }
        ],
        "options": [
          "A 错误。printf 会使用标准流及格式化相关状态，不具备所需的异步信号安全保证。",
          "B 错误。指定 FILE * 并不能消除 fprintf 对库内部流状态的操作。",
          "C 错误。fputs 虽无格式转换，仍是 stdio 流操作，也没有异步信号安全保证。",
          "D 正确。write 属于可在信号处理程序中使用的异步信号安全接口。"
        ]
      }
    },
    {
      "id": "io-24",
      "tip": "在 fork 所在处画一条线，记下 A 当时在用户缓冲区还是已提交给内核。然后逐个数两次 exit 会刷出哪些字节。",
      "type": "long",
      "group": "标准 I/O 与缓冲",
      "prompt": "stdout 已设为全缓冲且初始缓冲为空。执行 printf(\"A\"); fork(); 两个进程随后都调用 exit(0)。fork 成功，输出没有错误，也没有其他刷新。",
      "fields": [
        {
          "label": "目标文件中字符 A 出现多少次",
          "answers": [
            "2"
          ],
          "mode": "number"
        },
        {
          "label": "若在 fork 前增加 fflush(stdout)，A 又出现多少次",
          "answers": [
            "1"
          ],
          "mode": "number"
        },
        {
          "label": "解释数量为什么改变",
          "answers": [
            "fork 会复制尚存于用户态的 stdio 缓冲区；两个 exit 分别刷新自己的副本。若事先刷新，fork 时两份缓冲区均为空。"
          ],
          "mode": "self"
        }
      ],
      "explanation": "先区分内核中共享的打开文件表项和每个进程内的用户态缓冲。两次输出来自复制的缓冲内容，不是 printf 在 fork 后执行了两遍。",
      "source": "课件 08《用户空间IO》P36–49"
    }
  ]
});
