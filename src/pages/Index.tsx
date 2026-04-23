import { useState } from "react";
import Icon from "@/components/ui/icon";

const TABS = [
  { id: "chats", label: "Чаты", icon: "MessageCircle" },
  { id: "contacts", label: "Контакты", icon: "Users" },
  { id: "groups", label: "Группы", icon: "UsersRound" },
  { id: "favorites", label: "Избранные", icon: "Star" },
  { id: "missed", label: "Звонки", icon: "PhoneMissed" },
];

const CHATS = [
  { id: 1, name: "Алиса Романова", msg: "Завтра встреча в 10:00, не забудь!", time: "14:32", unread: 3, online: true, avatar: "А", color: "from-purple-500 to-pink-500" },
  { id: 2, name: "Дмитрий Волков", msg: "Голосовое сообщение", time: "13:15", unread: 0, online: false, avatar: "Д", color: "from-cyan-500 to-blue-500", voice: true },
  { id: 3, name: "Нейросеть 🤖", msg: "Могу помочь с любым вопросом!", time: "12:00", unread: 1, online: true, avatar: "ИИ", color: "from-violet-600 to-purple-500", ai: true },
  { id: 4, name: "Мария Соколова", msg: "Отлично, договорились 👍", time: "11:47", unread: 0, online: true, avatar: "М", color: "from-green-500 to-teal-500" },
  { id: 5, name: "Иван Петров", msg: "Посмотри статус — я обновил!", time: "10:22", unread: 0, online: false, avatar: "И", color: "from-orange-500 to-red-500" },
  { id: 6, name: "Ксения Лебедева", msg: "Ок, жду звонка от тебя", time: "09:03", unread: 2, online: true, avatar: "К", color: "from-pink-500 to-rose-500" },
];

const CONTACTS = [
  { id: 1, name: "Алиса Романова", phone: "+7 900 123-45-67", online: true, avatar: "А", color: "from-purple-500 to-pink-500" },
  { id: 2, name: "Дмитрий Волков", phone: "+7 921 987-65-43", online: false, avatar: "Д", color: "from-cyan-500 to-blue-500" },
  { id: 3, name: "Иван Петров", phone: "+7 905 555-12-34", online: false, avatar: "И", color: "from-orange-500 to-red-500" },
  { id: 4, name: "Ксения Лебедева", phone: "+7 916 777-88-99", online: true, avatar: "К", color: "from-pink-500 to-rose-500" },
  { id: 5, name: "Мария Соколова", phone: "+7 903 444-33-22", online: true, avatar: "М", color: "from-green-500 to-teal-500" },
  { id: 6, name: "Нейросеть 🤖", phone: "AI Assistant", online: true, avatar: "ИИ", color: "from-violet-600 to-purple-500" },
];

const GROUPS = [
  { id: 1, name: "Команда проекта", members: 12, msg: "Алиса: Дедлайн перенесли!", time: "15:10", avatar: "КП", color: "from-blue-600 to-violet-600", unread: 5 },
  { id: 2, name: "Семья 🏠", members: 5, msg: "Мама: Ужин в 19:00", time: "14:00", avatar: "С", color: "from-green-500 to-emerald-500", unread: 0 },
  { id: 3, name: "Друзья 🎉", members: 8, msg: "Иван: Кто едет в пятницу?", time: "12:30", avatar: "Д", color: "from-orange-500 to-amber-500", unread: 11 },
  { id: 4, name: "Работа & Бизнес", members: 24, msg: "Дмитрий: Отчёт готов", time: "10:00", avatar: "РБ", color: "from-cyan-600 to-blue-500", unread: 2 },
];

const FAVORITES = [
  { id: 1, name: "Алиса Романова", avatar: "А", color: "from-purple-500 to-pink-500", online: true },
  { id: 2, name: "Мария Соколова", avatar: "М", color: "from-green-500 to-teal-500", online: true },
  { id: 3, name: "Ксения Лебедева", avatar: "К", color: "from-pink-500 to-rose-500", online: true },
  { id: 4, name: "Дмитрий Волков", avatar: "Д", color: "from-cyan-500 to-blue-500", online: false },
];

const MISSED = [
  { id: 1, name: "Алиса Романова", time: "Сегодня, 14:12", count: 2, avatar: "А", color: "from-purple-500 to-pink-500", video: false },
  { id: 2, name: "Команда проекта", time: "Сегодня, 11:35", count: 1, avatar: "КП", color: "from-blue-600 to-violet-600", video: true },
  { id: 3, name: "Ксения Лебедева", time: "Вчера, 22:15", count: 3, avatar: "К", color: "from-pink-500 to-rose-500", video: false },
  { id: 4, name: "Иван Петров", time: "Вчера, 18:00", count: 1, avatar: "И", color: "from-orange-500 to-red-500", video: true },
];

const MESSAGES = [
  { id: 1, out: false, text: "Привет! Как дела? 😊", time: "14:20" },
  { id: 2, out: true, text: "Отлично, занимаюсь проектом!", time: "14:22" },
  { id: 3, out: false, text: "Завтра встреча в 10:00, не забудь!", time: "14:32" },
  { id: 4, out: true, text: "Буду вовремя, уже записал 👌", time: "14:33" },
];

const AI_MESSAGES = [
  { id: 1, out: false, text: "Привет! Я твой ИИ-помощник. Спроси меня что угодно 🚀", time: "12:00" },
  { id: 2, out: true, text: "Как написать питон код для парсинга?", time: "12:01" },
  { id: 3, out: false, text: "Конечно! Для парсинга в Python используют библиотеку BeautifulSoup.\n\nВот с чего начать:\n`pip install beautifulsoup4`\n\nХочешь полный пример кода? 😊", time: "12:01" },
];

type ChatItem = {
  id: number; name: string; msg: string; time: string;
  unread: number; online: boolean; avatar: string; color: string;
  voice?: boolean; ai?: boolean;
};

function Avatar({ name, color, size = "md" }: { name: string; color: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-9 h-9 text-[10px]", md: "w-12 h-12 text-xs", lg: "w-16 h-16 text-sm" };
  return (
    <div className={`${sizes[size]} rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white flex-shrink-0 font-golos`}>
      {name}
    </div>
  );
}

function OnlineDot({ online }: { online: boolean }) {
  if (!online) return null;
  return <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0d0d18] animate-pulse-dot" />;
}

function ChatView({ chat, onBack }: { chat: ChatItem; onBack: () => void }) {
  const [input, setInput] = useState("");
  const base = chat.ai ? AI_MESSAGES : MESSAGES;
  const [msgs, setMsgs] = useState(base);
  const [aiTyping, setAiTyping] = useState(false);

  const send = () => {
    if (!input.trim()) return;
    const m = { id: Date.now(), out: true, text: input, time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }) };
    setMsgs(p => [...p, m]);
    setInput("");
    if (chat.ai) {
      setAiTyping(true);
      setTimeout(() => {
        setAiTyping(false);
        setMsgs(p => [...p, { id: Date.now(), out: false, text: "Отличный вопрос! Анализирую и формирую ответ специально для тебя... 🧠✨", time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }) }]);
      }, 1800);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="glass-strong px-4 py-3 flex items-center gap-3 flex-shrink-0 border-b border-white/5">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/10 transition-all">
          <Icon name="ChevronLeft" size={20} className="text-white/70" />
        </button>
        <div className="relative">
          <Avatar name={chat.avatar} color={chat.color} size="sm" />
          <OnlineDot online={chat.online} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm">{chat.name}</div>
          <div className="text-xs text-green-400">{chat.online ? "онлайн" : "был недавно"}</div>
        </div>
        <div className="flex gap-1">
          <button className="p-2 rounded-xl hover:bg-white/10 transition-all">
            <Icon name="Phone" size={17} className="text-purple-400" />
          </button>
          <button className="p-2 rounded-xl hover:bg-white/10 transition-all">
            <Icon name="Video" size={17} className="text-cyan-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3">
        {msgs.map((m, i) => (
          <div key={m.id} className={`flex ${m.out ? "justify-end" : "justify-start"} animate-slide-up`} style={{ animationDelay: `${i * 0.04}s` }}>
            {!m.out && <div className="mr-2 mt-auto flex-shrink-0"><Avatar name={chat.avatar} color={chat.color} size="sm" /></div>}
            <div className={`max-w-[72%] px-4 py-2.5 ${m.out ? "bubble-out" : "bubble-in"}`}>
              <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{m.text}</p>
              <p className={`text-[10px] mt-1 ${m.out ? "text-white/50 text-right" : "text-white/40"}`}>{m.time}</p>
            </div>
          </div>
        ))}
        {aiTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="mr-2"><Avatar name="ИИ" color="from-violet-600 to-purple-500" size="sm" /></div>
            <div className="bubble-in px-4 py-3">
              <div className="waveform flex gap-1 items-center h-5">
                <span /><span /><span /><span /><span /><span /><span />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="glass-strong px-4 py-3 flex items-center gap-2 border-t border-white/5 flex-shrink-0">
        <button className="p-2 rounded-xl hover:bg-white/10 transition-all">
          <Icon name="Paperclip" size={17} className="text-white/40" />
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Сообщение..."
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-purple-500/50 transition-all"
        />
        <button className="p-2 rounded-xl hover:bg-white/10 transition-all">
          <Icon name="Mic" size={17} className="text-white/40" />
        </button>
        <button onClick={send} className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center neon-glow-purple hover:scale-105 transition-all flex-shrink-0">
          <Icon name="Send" size={15} className="text-white" />
        </button>
      </div>
    </div>
  );
}

function ChatsTab() {
  const [selected, setSelected] = useState<ChatItem | null>(null);
  const [search, setSearch] = useState("");

  if (selected) return <ChatView chat={selected} onBack={() => setSelected(null)} />;

  const filtered = CHATS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-4 pt-2 pb-3 flex-shrink-0">
        <div className="relative">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск чатов..."
            className="w-full bg-white/5 border border-white/8 rounded-2xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-purple-500/40 transition-all"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filtered.map((chat, i) => (
          <button key={chat.id} onClick={() => setSelected(chat)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all animate-slide-up"
            style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="relative flex-shrink-0">
              <Avatar name={chat.avatar} color={chat.color} />
              <OnlineDot online={chat.online} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white text-sm truncate">{chat.name}</span>
                <span className="text-[11px] text-white/40 ml-2 flex-shrink-0">{chat.time}</span>
              </div>
              <div className="flex justify-between items-center mt-0.5">
                {chat.voice
                  ? <div className="flex items-center gap-1.5 text-xs text-white/50"><Icon name="Mic" size={11} className="text-purple-400" /><span>Голосовое</span></div>
                  : <span className="text-xs text-white/50 truncate">{chat.msg}</span>
                }
                {chat.unread > 0 && (
                  <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ContactsTab() {
  const grouped = CONTACTS.reduce((acc, c) => {
    const l = c.name[0];
    if (!acc[l]) acc[l] = [];
    acc[l].push(c);
    return acc;
  }, {} as Record<string, typeof CONTACTS>);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide animate-fade-in">
      {Object.entries(grouped).map(([letter, contacts]) => (
        <div key={letter}>
          <div className="px-4 py-2 text-xs font-bold text-gradient-purple font-unbounded tracking-widest">{letter}</div>
          {contacts.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all animate-slide-up cursor-pointer" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="relative flex-shrink-0">
                <Avatar name={c.avatar} color={c.color} />
                <OnlineDot online={c.online} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm">{c.name}</div>
                <div className="text-xs text-white/40 mt-0.5">{c.phone}</div>
              </div>
              <div className="flex gap-1">
                <button className="p-2 rounded-xl hover:bg-purple-500/20 transition-all">
                  <Icon name="MessageCircle" size={16} className="text-purple-400" />
                </button>
                <button className="p-2 rounded-xl hover:bg-cyan-500/20 transition-all">
                  <Icon name="Phone" size={16} className="text-cyan-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function GroupsTab() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide animate-fade-in">
      <div className="px-4 py-3">
        <button className="w-full glass rounded-2xl py-3 flex items-center justify-center gap-2 border border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/10 transition-all">
          <Icon name="Plus" size={17} className="text-purple-400" />
          <span className="text-sm font-semibold text-purple-300">Создать группу</span>
        </button>
      </div>
      {GROUPS.map((g, i) => (
        <div key={g.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all animate-slide-up cursor-pointer" style={{ animationDelay: `${i * 0.07}s` }}>
          <Avatar name={g.avatar} color={g.color} />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white text-sm">{g.name}</span>
              <span className="text-[11px] text-white/40">{g.time}</span>
            </div>
            <div className="flex justify-between items-center mt-0.5">
              <span className="text-xs text-white/50 truncate">{g.msg}</span>
              {g.unread > 0 && (
                <span className="ml-2 flex-shrink-0 min-w-5 h-5 px-1 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {g.unread}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Icon name="Users" size={10} className="text-white/30" />
              <span className="text-[10px] text-white/30">{g.members} участников</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FavoritesTab() {
  const statuses = [
    { id: 1, name: "Алиса", emoji: "🌅", color: "from-purple-500 to-pink-500" },
    { id: 2, name: "Мария", emoji: "☕", color: "from-green-500 to-teal-500" },
    { id: 3, name: "Ксения", emoji: "🎵", color: "from-pink-500 to-rose-500" },
  ];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide animate-fade-in">
      <div className="px-4 py-3">
        <p className="text-[10px] text-white/40 mb-3 font-semibold tracking-widest uppercase">Статусы</p>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl glass border-2 border-dashed border-white/20 flex items-center justify-center hover:border-purple-500/50 transition-all cursor-pointer">
              <Icon name="Plus" size={20} className="text-white/40" />
            </div>
            <span className="text-[10px] text-white/40">Мой</span>
          </div>
          {statuses.map(s => (
            <div key={s.id} className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group">
              <div className="relative w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-br from-purple-500 to-cyan-400">
                <div className={`w-full h-full rounded-[14px] bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl group-hover:scale-95 transition-all`}>
                  {s.emoji}
                </div>
              </div>
              <span className="text-[10px] text-white/60">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-2 pb-2">
        <p className="text-[10px] text-white/40 font-semibold tracking-widest uppercase">Избранные контакты</p>
      </div>
      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        {FAVORITES.map((f, i) => (
          <div key={f.id} className="glass rounded-2xl p-4 flex flex-col items-center gap-3 hover:bg-white/8 transition-all cursor-pointer animate-scale-in" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="relative">
              <Avatar name={f.avatar} color={f.color} size="lg" />
              <OnlineDot online={f.online} />
            </div>
            <div className="text-center">
              <div className="font-semibold text-white text-sm">{f.name.split(" ")[0]}</div>
              {f.online && <div className="text-[10px] text-green-400 mt-0.5">онлайн</div>}
            </div>
            <div className="flex gap-2 w-full">
              <button className="flex-1 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 transition-all flex items-center justify-center">
                <Icon name="MessageCircle" size={14} className="text-purple-300" />
              </button>
              <button className="flex-1 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 transition-all flex items-center justify-center">
                <Icon name="Phone" size={14} className="text-cyan-300" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MissedTab() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide animate-fade-in">
      <div className="px-4 py-3">
        <div className="glass rounded-2xl p-4 mb-2 border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-2">
            <Icon name="PhoneMissed" size={15} className="text-red-400" />
            <span className="text-sm font-semibold text-red-300">
              Пропущено: {MISSED.reduce((a, m) => a + m.count, 0)} звонка
            </span>
          </div>
        </div>
      </div>
      {MISSED.map((m, i) => (
        <div key={m.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all animate-slide-up cursor-pointer" style={{ animationDelay: `${i * 0.07}s` }}>
          <Avatar name={m.avatar} color={m.color} />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white text-sm">{m.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Icon name={m.video ? "Video" : "Phone"} size={11} className="text-red-400" />
              <span className="text-xs text-red-400">{m.time}</span>
              {m.count > 1 && <span className="text-xs text-white/40">× {m.count}</span>}
            </div>
          </div>
          <button className="p-2.5 rounded-xl bg-green-500/15 hover:bg-green-500/30 transition-all">
            <Icon name={m.video ? "Video" : "Phone"} size={16} className="text-green-400" />
          </button>
        </div>
      ))}
      <div className="px-4 py-5 text-center">
        <button className="text-xs text-white/30 hover:text-white/60 transition-all">Очистить историю</button>
      </div>
    </div>
  );
}

export default function Index() {
  const [activeTab, setActiveTab] = useState("chats");

  const renderContent = () => {
    switch (activeTab) {
      case "chats": return <ChatsTab />;
      case "contacts": return <ContactsTab />;
      case "groups": return <GroupsTab />;
      case "favorites": return <FavoritesTab />;
      case "missed": return <MissedTab />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <div
        className="w-full max-w-sm h-[800px] glass-strong rounded-[2.5rem] overflow-hidden flex flex-col"
        style={{ boxShadow: "0 0 100px rgba(147,82,255,0.18), 0 50px 100px rgba(0,0,0,0.6)" }}
      >
        {/* Header */}
        <div className="glass px-5 pt-10 pb-4 flex-shrink-0 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="font-unbounded font-black text-xl text-gradient-purple leading-tight">NOVA</h1>
              <p className="text-[10px] text-white/35 mt-0.5 font-golos">Мессенджер нового поколения</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <button className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
                  <Icon name="Bell" size={16} className="text-white/60" />
                </button>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-[9px] font-bold text-white">7</span>
              </div>
              <button className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
                <Icon name="Settings" size={16} className="text-white/60" />
              </button>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white font-golos">
            {TABS.find(t => t.id === activeTab)?.label}
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {renderContent()}
        </div>

        {/* Bottom Nav */}
        <div className="glass px-2 py-3 flex-shrink-0 border-t border-white/5">
          <div className="flex justify-around items-center">
            {TABS.map(tab => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${isActive ? "tab-active neon-glow-purple scale-105" : "hover:bg-white/5"}`}
                >
                  <Icon name={tab.icon} size={20} className={`transition-all duration-300 ${isActive ? "text-purple-300" : "text-white/35"}`} />
                  <span className={`text-[9px] font-semibold transition-all duration-300 leading-none ${isActive ? "text-purple-300" : "text-white/30"}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
