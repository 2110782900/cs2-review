registerTopic({
  "id": "net",
  "title": "网络编程",
  "number": "04",
  "groups": [
    "网络层次与封装",
    "IP 地址、字节序与 DNS",
    "传输协议与连接标识",
    "套接字与连接建立",
    "HTTP 请求与响应",
    "Echo 与地址接口"
  ],
  "questions": [
    {
      "id": "net-01",
      "tip": "先圈出谁发起请求、谁处理请求。把角色直接分给两台机器，会漏掉本机进程间通信的情况。",
      "type": "choice",
      "group": "网络层次与封装",
      "prompt": "服务器读取请求、组织内容并把结果交回客户端。在客户端—服务器模型中，下列哪一组可以扮演这两个角色？",
      "choices": [
        "必须是不同城市的两台计算机",
        "可以是同一台主机上两个通过套接字通信的进程",
        "只能是一个程序中的同一个函数",
        "必须由交换机代替服务器处理请求"
      ],
      "correct": 1,
      "explanation": "客户端和服务器首先是进程承担的角色。它们可运行在不同主机，也可在同一台主机中经本地网络协议栈通信；一次事务由请求和响应构成。",
      "source": "课件 10《网络》P2–15"
    },
    {
      "id": "net-02",
      "tip": "给每个数先标单位 B 或 bit，再将字节数乘以 8。IPv6 的 16 指字节数。",
      "type": "fill",
      "group": "网络层次与封装",
      "prompt": "常见以太网 MAC 地址由 6 个字节构成。普通 IPv4 地址由 4 个字节构成，IPv6 地址由 16 个字节构成。分别换算位数。",
      "fields": [
        {
          "label": "MAC 位数",
          "answers": [
            "48"
          ],
          "mode": "number"
        },
        {
          "label": "IPv4 位数",
          "answers": [
            "32"
          ],
          "mode": "number"
        },
        {
          "label": "IPv6 位数",
          "answers": [
            "128"
          ],
          "mode": "number"
        }
      ],
      "explanation": "每字节 8 位，依次得到 6×8、4×8、16×8。MAC 用于链路内传输，IP 寻址用于互连网络中的主机或接口。",
      "source": "课件 10《网络》P2–15"
    },
    {
      "id": "net-03",
      "tip": "看题干要转发的是帧还是 IP 数据报。不同局域网之间的下一跳选择属于 IP 层。",
      "type": "choice",
      "group": "网络层次与封装",
      "prompt": "两个不同类型的局域网之间需要转发 IP 数据报。哪一项最符合课件中的设备分工？",
      "choices": [
        "集线器根据 IP 地址重新选路",
        "网桥必须为每个数据帧执行 DNS 查询",
        "路由器跨网络转发 IP 数据报",
        "服务器用端口号代替所有链路层地址"
      ],
      "correct": 2,
      "explanation": "路由器能连接不同网络，按路由信息选择下一跳。集线器处理物理信号，网桥在链路层转发帧，端口用于标识主机上的传输端点。",
      "source": "课件 10《网络》P2–15"
    },
    {
      "id": "net-04",
      "tip": "画两条链路，在每条箭头上分别填目的 MAC；再沿两条箭头追踪同一个目的 IP。",
      "type": "long",
      "group": "网络层次与封装",
      "prompt": "主机 A 经一台路由器发往另一个以太网中的 B。假定没有 NAT、分片或隧道。分别考虑第一跳的以太网帧、第二跳的帧以及内部 IP 数据报。",
      "fields": [
        {
          "label": "写出第一跳与第二跳各自的目的 MAC 对象",
          "answers": [
            "第一跳的目的 MAC 是路由器入侧接口，第二跳的目的 MAC 是 B 的接口。"
          ],
          "mode": "self"
        },
        {
          "label": "两跳的目的 IP 是谁？路由器怎样处理链路封装？",
          "answers": [
            "目标 IP 在两跳中都是 B；路由器去掉入链路帧封装，处理 IP 数据报，再按出链路重封装新帧。"
          ],
          "mode": "self"
        }
      ],
      "explanation": "应用数据被封装进协议数据单元。逐跳交付用链路层地址，端到端寻址用 IP 地址。路由器会更新 TTL 等字段，不能因此认为目的 IP 也要逐跳改变。",
      "source": "课件 10《网络》P2–15"
    },
    {
      "id": "net-05",
      "tip": "题面已经给了网络顺序，逐字节转十进制即可。末字节 21 是十六进制，别直接抄成十进制 21。",
      "type": "fill",
      "group": "IP 地址、字节序与 DNS",
      "prompt": "某 IPv4 地址的网络字节序为 C0 00 02 21，各字节按十六进制显示。填写其点分十进制表示。",
      "fields": [
        {
          "label": "点分十进制地址",
          "answers": [
            "192.0.2.33"
          ],
          "mode": "text"
        }
      ],
      "explanation": "逐个字节转换：0xC0=192、0x00=0、0x02=2、0x21=33。已经按网络顺序列出字节，无需再把四字节倒序。",
      "source": "课件 10《网络》P18–27；课件 11《套接字》P8–13"
    },
    {
      "id": "net-06",
      "tip": "把转换拆成两个判断：从主机序去网络序，以及端口占 16 位。函数名的方向和宽度都要吻合。",
      "type": "choice",
      "group": "IP 地址、字节序与 DNS",
      "prompt": "在小端主机上，程序把主机序的 16 位端口号写入 sockaddr_in.sin_port，哪个调用最合适？",
      "choices": [
        "htonl(port)",
        "ntohl(port)",
        "inet_ntop(port)",
        "htons(port)"
      ],
      "correct": 3,
      "explanation": "h→n 表示主机序转网络序，s 表示 16 位短整数。端口是 16 位。32 位值才使用 htonl。地址文本与二进制之间的转换由另一组函数负责。",
      "source": "课件 10《网络》P18–27；课件 11《套接字》P8–13"
    },
    {
      "id": "net-07",
      "tip": "用两个反例检查“一一对应”：负载分担时一名可有多址，多个网站名也可能共用一个 IP。",
      "type": "choice",
      "group": "IP 地址、字节序与 DNS",
      "prompt": "关于域名与 IP 地址的对应关系，哪项成立？",
      "choices": [
        "一个域名可以有多个地址，同一地址也可以对应多个名字",
        "一个域名必须永久绑定唯一地址",
        "DNS 负责交付每一个 TCP 数据字节",
        "localhost 一定表示当前主机的公开公网地址"
      ],
      "correct": 0,
      "explanation": "DNS 提供名称解析，映射可以一对多或多对一。localhost 指本机回送，常见 IPv4 回送地址为 127.0.0.1；数据传输由网络协议栈承担。",
      "source": "课件 10《网络》P18–27；课件 11《套接字》P8–13"
    },
    {
      "id": "net-08",
      "tip": "把线上字节先写成两格，再分别转十进制。解析成功只给出候选地址，仍要逐项尝试连接。",
      "type": "long",
      "group": "IP 地址、字节序与 DNS",
      "prompt": "端口号 4660 的十六进制写法为 0x1234。小端主机要通过 IPv4 TCP 访问 example.test，要求代码也能扩展支持 IPv6。",
      "fields": [
        {
          "label": "端口网络字节序中的第一个字节（十进制）",
          "answers": [
            "18"
          ],
          "mode": "number"
        },
        {
          "label": "第二个字节（十进制）",
          "answers": [
            "52"
          ],
          "mode": "number"
        },
        {
          "label": "将主机名和服务转换为候选地址链表的函数",
          "answers": [
            "getaddrinfo"
          ],
          "mode": "text"
        },
        {
          "label": "为何客户端应遍历返回的候选项？",
          "answers": [
            "一个名字可能解析为多个地址或地址族，逐项按返回参数创建套接字并尝试连接，对失败项关 fd 后尝试下一项，能处理部分地址不可达等情况。"
          ],
          "mode": "self"
        }
      ],
      "explanation": "网络序是大端，在线路上先发 0x12 后发 0x34。getaddrinfo 可统一处理主机、服务与地址族；它负责产生候选项，建立连接仍需 socket 和 connect。",
      "source": "课件 10《网络》P20–27、11《套接字》P8–11；24251 回忆卷 P2"
    },
    {
      "id": "net-09",
      "tip": "逐个对照题目里的可靠性、顺序、双向和字节流四项要求，尤其留意 UDP 的数据报语义。",
      "type": "choice",
      "group": "传输协议与连接标识",
      "prompt": "应用希望进程间按序、可靠、双向地传输字节流，通常选用哪项？",
      "choices": [
        "IP 数据报直接提供可靠字节流",
        "TCP",
        "以太网 MAC",
        "UDP 必然提供重传和重排"
      ],
      "correct": 1,
      "explanation": "TCP 在 IP 之上提供可靠、有序、全双工的字节流。UDP 提供数据报给进程，应用若需要可靠性需自行补足。IP 本身不承诺可靠交付。",
      "source": "课件 10《网络》P11–15、28–31"
    },
    {
      "id": "net-10",
      "tip": "可试想接收方一次读到全部 5 字节。协议仍须能找回消息边界，不能把 write 次数当作消息数。",
      "type": "choice",
      "group": "传输协议与连接标识",
      "prompt": "TCP 客户端先 write 两个字节，再 write 三个字节。服务器哪种读法可靠？",
      "choices": [
        "一次 read 必定得到两个字节",
        "每次调用 read 对应发送端一次 write",
        "必须都等连接关闭才会收到",
        "按协议中的长度或分隔符组帧，同时处理短读和合并读取"
      ],
      "correct": 3,
      "explanation": "TCP 保序保存字节序列，应用层写调用的边界不会被保留。接收端可能在一次 read 中得到多个业务片段，也可能仅获得半条消息。",
      "source": "课件 10《网络》P11–15、28–31"
    },
    {
      "id": "net-11",
      "tip": "给每条连接列四栏：源 IP、源端口、目的 IP、目的端口。同一源端口从不同 IP 发出仍能区分。",
      "type": "fill",
      "group": "传输协议与连接标识",
      "prompt": "固定 TCP 协议，连接由两个端点唯一标识。在同一网络命名空间中同时存在的三个连接：A:51000→S:80、A:51001→S:80、B:51000→S:80（A、B、S 的 IP 彼此不同）。",
      "fields": [
        {
          "label": "不同的四元组数",
          "answers": [
            "3"
          ],
          "mode": "number"
        },
        {
          "label": "它们共同使用的服务端口",
          "answers": [
            "80"
          ],
          "mode": "number"
        }
      ],
      "explanation": "每个端点由 IP 与端口组成。前两条的客户端端口不同；第一与第三的客户端 IP 不同。共享服务端地址和端口不影响内核区分连接。",
      "source": "课件 10《网络》P11–15、28–31"
    },
    {
      "id": "net-12",
      "tip": "把已有连接的四元组抄下来，再给第二条连接填值；四栏完全相同时无法区分两条并行连接。",
      "type": "long",
      "group": "传输协议与连接标识",
      "prompt": "一个服务监听 192.0.2.8:9000。客户端 198.51.100.7:48001 已连接，随后同一客户端再发起一条并行 TCP 连接到该服务。题设两个 socket 都位于相同网络命名空间，未使用代理或地址转换。",
      "fields": [
        {
          "label": "第一条连接的服务器端口",
          "answers": [
            "9000"
          ],
          "mode": "number"
        },
        {
          "label": "第一条连接的客户端端口",
          "answers": [
            "48001"
          ],
          "mode": "number"
        },
        {
          "label": "第二条连接能否继续沿用同一客户端 IP 和 48001？说明内核区分两条连接的条件。",
          "answers": [
            "不能同时复用完全相同的 TCP 四元组。若两方 IP 和服务器端口不变，第二条连接需换一个客户端端口。"
          ],
          "mode": "self"
        }
      ],
      "explanation": "两方 IP、两方端口共同标识一条 TCP 连接。连接之间可以共享服务器监听端口，内核凭其完整的四元组区分传入数据。",
      "source": "课件 10《网络》P11–15、28–31"
    },
    {
      "id": "net-13",
      "tip": "按职责检查每步：给本地端点命名，把它设为监听状态，然后才从队列取连接。",
      "type": "choice",
      "group": "套接字与连接建立",
      "prompt": "已成功创建 TCP 套接字的服务器要先绑定指定的本地地址，再等待连接。哪项顺序正确？",
      "choices": [
        "listen → bind → connect",
        "connect → bind → accept",
        "bind → listen → accept",
        "accept → listen → bind"
      ],
      "correct": 2,
      "explanation": "bind 关联本地地址，listen 切换为监听套接字，accept 从待处理队列取得连接并返回新的已连接描述符。客户端使用 connect。",
      "source": "课件 11《套接字》P15–33"
    },
    {
      "id": "net-14",
      "tip": "先看辅助函数交给调用者的 fd 能做什么：一个可继续 accept，另一个已经可以读写数据。",
      "type": "fill",
      "group": "套接字与连接建立",
      "prompt": "客户端与服务器都使用教材的辅助函数。写出创建监听 fd 的函数，以及建立客户端连接并返回已连接 fd 的函数。",
      "fields": [
        {
          "label": "建立监听 fd",
          "answers": [
            "open_listenfd"
          ],
          "mode": "text"
        },
        {
          "label": "连接远端服务",
          "answers": [
            "open_clientfd"
          ],
          "mode": "text"
        }
      ],
      "explanation": "open_listenfd 封装地址候选、建套接字、绑定和监听。open_clientfd 对候选执行 socket/connect 并返回成功的一个，以便发起数据交换。",
      "source": "课件 11《套接字》P15–33"
    },
    {
      "id": "net-15",
      "tip": "给 listenfd 标“接新客”，给 connfd 标“与该客通信”。一次 accept 成功后两者仍同时有效。",
      "type": "choice",
      "group": "套接字与连接建立",
      "prompt": "accept 成功返回 connfd 后，服务器应怎样接收该客户端的应用数据？",
      "choices": [
        "在 connfd 上 read，保留 listenfd 供之后继续 accept",
        "在 listenfd 上 read，并立刻永久关闭 connfd",
        "必须先在 connfd 上再次 listen",
        "用客户端的临时端口号当作本进程文件描述符"
      ],
      "correct": 0,
      "explanation": "listenfd 代表等待连接的被动端点，connfd 专用于一个已建立的连接。端口号属于协议命名空间，文件描述符只在所属进程的描述符表中解释。",
      "source": "课件 11《套接字》P15–33"
    },
    {
      "id": "net-16",
      "tip": "分别画客户端和服务端两张 fd 表，再填入 3、5、7、8。两个进程不共享同一套 fd 编号。",
      "type": "long",
      "group": "套接字与连接建立",
      "prompt": "客户端成功 socket 得到 5 并 connect，服务器以 3 监听，第一次 accept 返回 7；随后接受另一客户端得到 8。两边程序运行在不同进程。",
      "fields": [
        {
          "label": "服务端给第一个客户端回包使用的 fd",
          "answers": [
            "7"
          ],
          "mode": "number"
        },
        {
          "label": "服务端继续等待新连接时传给 accept 的 fd",
          "answers": [
            "3"
          ],
          "mode": "number"
        },
        {
          "label": "第一个客户端读回包时使用的 fd",
          "answers": [
            "5"
          ],
          "mode": "number"
        },
        {
          "label": "解释数字 5 与 7 为何可以代表同一条连接的不同端点",
          "answers": [
            "fd 是进程本地的整数索引。客户端的 5 引用本地端点，服务端的 7 引用对端对应的已连接套接字，各进程独立编号。"
          ],
          "mode": "self"
        }
      ],
      "explanation": "connect 在已有的活动套接字 5 上建立连接，服务器的 accept 另建已连接描述符 7。服务器保留监听描述符 3 接受后来者，8 对应第二个客户。",
      "source": "课件 11《套接字》P21–25；24251 回忆卷 P2"
    },
    {
      "id": "net-17",
      "tip": "先看首词 GET 确认它是请求行；按空格切成三段，可避免把请求行与响应状态行混写。",
      "type": "choice",
      "group": "HTTP 请求与响应",
      "prompt": "对于 GET /notes/a.html HTTP/1.1，三个由空格分隔的部分从左到右是什么？",
      "choices": [
        "状态码、媒体类型、正文",
        "主机名、端口、路径",
        "版本、状态码、原因短语",
        "方法、请求目标、HTTP 版本"
      ],
      "correct": 3,
      "explanation": "请求行先给出操作方法，再给出目标，最后声明协议版本。状态行用于响应；媒体类型通常由响应首部 Content-Type 描述。",
      "source": "课件 11《套接字》P39–46；CSAPP 第3版习题 11.6（读取请求行及首部） 思路改编"
    },
    {
      "id": "net-18",
      "tip": "三个空分别看状态行、媒体类型和正文长度。计算 Content-Length 时排除首部和分隔空行。",
      "type": "fill",
      "group": "HTTP 请求与响应",
      "prompt": "HTTP 响应以 HTTP/1.1 200 OK 开头。响应实体是 PNG 图片，正文的实际字节数为 5120。",
      "fields": [
        {
          "label": "成功状态码",
          "answers": [
            "200"
          ],
          "mode": "number"
        },
        {
          "label": "Content-Type 的常见值",
          "answers": [
            "image/png"
          ],
          "mode": "text"
        },
        {
          "label": "若用 Content-Length 定界，字段的值",
          "answers": [
            "5120"
          ],
          "mode": "number"
        }
      ],
      "explanation": "状态码表示处理结果。MIME 类型指出接收方如何解释正文。Content-Length 按正文字节计，不包括状态行、首部或分隔空行。",
      "source": "课件 11《套接字》P39–46"
    },
    {
      "id": "net-19",
      "tip": "问一句“这些返回的字节从哪来”：直接取已有文件和处理请求时才生成内容，服务路径不同。",
      "type": "choice",
      "group": "HTTP 请求与响应",
      "prompt": "哪种情形属于课件中“提供静态内容”的典型实例？",
      "choices": [
        "每次请求都运行程序计算实时结果",
        "直接读取磁盘中已有的 PNG 文件并返回其字节",
        "服务器使用了 C 语言，因此所有响应都叫静态内容",
        "只要包含图片就一定是动态内容"
      ],
      "correct": 1,
      "explanation": "静态服务把已有文件内容返回客户端。若请求时运行程序生成正文，则属于动态服务。判别依据是响应内容的来源，与媒体格式无关。",
      "source": "课件 11《套接字》P39–46"
    },
    {
      "id": "net-20",
      "tip": "先找到首部后的第一个空行，此后按给定长度读正文。PNG 中出现换行字节也属于图片数据。",
      "type": "long",
      "group": "HTTP 请求与响应",
      "prompt": "浏览器发出 GET /img/a.png HTTP/1.1 并附 Host 首部。服务器返回 HTTP/1.1 200 OK，Content-Type 为 image/png，Content-Length 为 120，首部后面紧跟空行和图片字节。",
      "fields": [
        {
          "label": "请求目标",
          "answers": [
            "/img/a.png"
          ],
          "mode": "text"
        },
        {
          "label": "客户端按上述首部应读取的正文字节数",
          "answers": [
            "120"
          ],
          "mode": "number"
        },
        {
          "label": "说明空行的作用，并说明为何不能用换行符确定二进制正文的末尾",
          "answers": [
            "空行标志首部结束与正文开始。图片中可包含任意字节，包括换行；此响应须按 Content-Length 指定的 120 字节读完。"
          ],
          "mode": "self"
        }
      ],
      "explanation": "先解析请求行，再在响应中区分状态行、首部与正文。媒体类型仅说明内容的解释方式，本例的长度字段才承担正文定界功能。",
      "source": "课件 11《套接字》P39–46；CSAPP 第3版习题 11.6（HTTP 报文观察） 思路改编"
    },
    {
      "id": "net-21",
      "tip": "另留一个指针保管 getaddrinfo 返回的表头。遍历结束时的空指针无法替你释放原来的链表。",
      "type": "choice",
      "group": "Echo 与地址接口",
      "prompt": "getaddrinfo 返回候选地址链表。程序结束尝试后，怎样释放库分配的整条链表？",
      "choices": [
        "逐节点直接 close",
        "pthread_detach",
        "freeaddrinfo",
        "getnameinfo"
      ],
      "correct": 2,
      "explanation": "应保存链表首指针，完成尝试后调用 freeaddrinfo。close 是释放套接字描述符；getnameinfo 是相反方向的名字转换接口。",
      "source": "课件 11《套接字》P8–13、28–36"
    },
    {
      "id": "net-22",
      "tip": "先写转换方向：题中已有二进制套接字地址，要得到可打印的主机名和服务名。",
      "type": "fill",
      "group": "Echo 与地址接口",
      "prompt": "服务器从 accept 得到了对端的 sockaddr。现在要从该地址获取可打印的主机字符串与服务字符串，应调用哪一函数？",
      "fields": [
        {
          "label": "函数名",
          "answers": [
            "getnameinfo"
          ],
          "mode": "text"
        }
      ],
      "explanation": "getnameinfo 把套接字地址转为主机与服务字符串。需要稳定记录数值地址和端口时，可指定 NI_NUMERICHOST 和 NI_NUMERICSERV，免去反向名字查询。",
      "source": "课件 11《套接字》P8–13、28–36"
    },
    {
      "id": "net-23",
      "tip": "圈出 read 的正返回值，它限定本次有效载荷。缓冲区大小和首个零字节位置都不能替代它。",
      "type": "choice",
      "group": "Echo 与地址接口",
      "prompt": "Echo 服务器一次 read 成功返回 n=9，缓存中可能含零字节。要回送这批数据，最合适的是？",
      "choices": [
        "调用 rio_writen(connfd, buf, n) 并检查结果",
        "调用 rio_writen(connfd, buf, strlen(buf))",
        "总是写 sizeof(buf) 字节",
        "把数据写回 listenfd"
      ],
      "correct": 0,
      "explanation": "字节级 echo 应回送实际收到的 9 字节。strlen 遇零会提前停，用缓冲区容量会带出多余数据。连接的数据通道是 connfd。",
      "source": "课件 11《套接字》P8–13、28–36"
    },
    {
      "id": "net-24",
      "tip": "沿外层 accept 和内层读行循环各走一遍。一个客户没有发来下一行时，唯一的服务执行流可能仍在内层。",
      "type": "long",
      "group": "Echo 与地址接口",
      "prompt": "一个迭代式行回显服务可持续处理一个客户的多行消息。补全服务器侧的接口，再分析新客户端的等待原因。",
      "fields": [
        {
          "label": "从 listenfd 获得新连接",
          "answers": [
            "accept"
          ],
          "mode": "text"
        },
        {
          "label": "已初始化 rio_t 后，按行取数据",
          "answers": [
            "rio_readlineb"
          ],
          "mode": "text"
        },
        {
          "label": "把准确的 n 字节完整回送",
          "answers": [
            "rio_writen"
          ],
          "mode": "text"
        },
        {
          "label": "第一个客户一直保持连接却不发下一行时，第二个客户为何迟迟收不到回显？",
          "answers": [
            "唯一服务执行流可能阻塞在第一条连接的读取上，尚未返回外层循环接受或处理第二条连接；第二个客户 connect 成功也不代表应用层正在服务它。"
          ],
          "mode": "self"
        }
      ],
      "explanation": "每次 accept 产生独立 connfd，同一连接循环读行并对应回写，EOF 后关闭它。迭代结构只能依次运行这段循环，并发服务可以把不同连接交给不同执行流。",
      "source": "课件 11《套接字》P8–13、28–36"
    }
  ]
});
