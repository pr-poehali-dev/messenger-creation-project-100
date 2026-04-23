import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/1319dde5-8aaa-4527-bc05-6f881f9ec31b";
const MSG_URL = "https://functions.poehali.dev/5260fb1d-a6f5-4f5d-8868-993109c82935";

type User = { id: number; name: string; email: string; avatar_color: string };
type ChatItem = { user_id: number; name: string; avatar_color: string; conv_id: number | null; last_msg: string; last_time: string };
type Message = { id: number; sender_id: number; sender_name: string; text: string; time: string };
type Contact = { id: number; name: string; avatar_color: string };

const TABS = [
  { id: "chats", label: "Чаты", icon: "MessageCircle" },
  { id: "contacts", label: "Контакты", icon: "Users" },
  { id: "groups", label: "Группы", icon: "UsersRound" },
  { id: "favorites", label: "Избранные", icon: "Star" },
  { id: "missed", label: "Звонки", icon: "PhoneMissed" },
];

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function Avatar({ name, color, size = "md" }: { name: string; color: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-9 h-9 text-[10px]", md: "w-12 h-12 text-xs", lg: "w-16 h-16 text-sm" };
  return (
    <div className={`${sizes[size]} rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white flex-shrink-0 font-golos`}>
      {getInitials(name)}
    </div>
  );
}

function AuthScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    const body: Record<string, string> = { action: mode, email, password };
    if (mode === "register") body.name = name;

    const res = await fetch(AUTH_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = JSON.parse(typeof (await res.clone().json()) === "string" ? await res.json() : await res.text().then(t => t));

    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    setLoading(false);

    if (parsed.error) { setError(parsed.error); return; }
    if (parsed.ok) {
      localStorage.setItem("nova_user", JSON.stringify(parsed.user));
      onLogin(parsed.user);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="mb-8 text-center">
          <h1 className="font-unbounded font-black text-3xl text-gradient-purple">NOVA</h1>
          <p className="text-white/40 text-sm mt-2">Мессенджер нового поколения</p>
        </div>

        <div className="w-full space-y-3">
          {mode === "register" && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-purple-500/60 transition-all" />
          )}
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-purple-500/60 transition-all" />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" type="password"
            onKeyDown={e => e.key === "Enter" && submit()}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-purple-500/60 transition-all" />

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button onClick={submit} disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 font-semibold text-white text-sm neon-glow-purple hover:scale-[1.02] transition-all disabled:opacity-50">
            {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>

          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="w-full py-2 text-sm text-white/40 hover:text-white/70 transition-all">
            {mode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatView({ me, contact, convId, onBack }: { me: User; contact: Contact; convId: number | null; onBack: (newConvId?: number) => void }) {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentConvId, setCurrentConvId] = useState<number | null>(convId);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = async (cid: number) => {
    const res = await fetch(MSG_URL, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_messages", user_id: me.id, conv_id: cid }) });
    const raw = await res.json();
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    setMsgs(data.messages || []);
    setLoading(false);
  };

  useEffect(() => {
    if (currentConvId) loadMessages(currentConvId);
    else setLoading(false);
    const interval = currentConvId ? setInterval(() => loadMessages(currentConvId), 3000) : null;
    return () => { if (interval) clearInterval(interval); };
  }, [currentConvId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    const res = await fetch(MSG_URL, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send_message", user_id: me.id, to_user_id: contact.id, conv_id: currentConvId, text }) });
    const raw = await res.json();
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (data.conv_id && !currentConvId) setCurrentConvId(data.conv_id);
    if (currentConvId || data.conv_id) loadMessages(currentConvId || data.conv_id);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="glass-strong px-4 py-3 flex items-center gap-3 flex-shrink-0 border-b border-white/5">
        <button onClick={() => onBack(currentConvId || undefined)} className="p-2 rounded-xl hover:bg-white/10 transition-all">
          <Icon name="ChevronLeft" size={20} className="text-white/70" />
        </button>
        <Avatar name={contact.name} color={contact.avatar_color} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm">{contact.name}</div>
          <div className="text-xs text-green-400">в сети</div>
        </div>
        <button className="p-2 rounded-xl hover:bg-white/10 transition-all">
          <Icon name="Phone" size={17} className="text-purple-400" />
        </button>
        <button className="p-2 rounded-xl hover:bg-white/10 transition-all">
          <Icon name="Video" size={17} className="text-cyan-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3">
        {loading && <div className="text-center text-white/30 text-sm pt-8">Загрузка...</div>}
        {!loading && msgs.length === 0 && (
          <div className="text-center text-white/30 text-sm pt-8">Напишите первое сообщение!</div>
        )}
        {msgs.map((m) => {
          const isOut = m.sender_id === me.id;
          return (
            <div key={m.id} className={`flex ${isOut ? "justify-end" : "justify-start"} animate-fade-in`}>
              {!isOut && <div className="mr-2 mt-auto"><Avatar name={contact.name} color={contact.avatar_color} size="sm" /></div>}
              <div className={`max-w-[72%] px-4 py-2.5 ${isOut ? "bubble-out" : "bubble-in"}`}>
                <p className="text-sm text-white leading-relaxed">{m.text}</p>
                <p className={`text-[10px] mt-1 ${isOut ? "text-white/50 text-right" : "text-white/40"}`}>{m.time}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="glass-strong px-4 py-3 flex items-center gap-2 border-t border-white/5 flex-shrink-0">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Сообщение..."
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-purple-500/50 transition-all" />
        <button onClick={send} className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center neon-glow-purple hover:scale-105 transition-all flex-shrink-0">
          <Icon name="Send" size={15} className="text-white" />
        </button>
      </div>
    </div>
  );
}

function ChatsTab({ me, onOpenChat }: { me: User; onOpenChat: (contact: Contact, convId: number | null) => void }) {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch(MSG_URL, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_chats", user_id: me.id }) });
    const raw = await res.json();
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    setChats(data.chats || []);
    setLoading(false);
  };

  useEffect(() => { load(); const i = setInterval(load, 5000); return () => clearInterval(i); }, []);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide animate-fade-in">
      {loading && <div className="text-center text-white/30 text-sm pt-8">Загрузка чатов...</div>}
      {!loading && chats.length === 0 && (
        <div className="text-center text-white/30 text-sm pt-8 px-6">
          <p>Чатов пока нет.</p>
          <p className="mt-1">Перейдите в «Контакты» и начните переписку!</p>
        </div>
      )}
      {chats.map((chat) => (
        <button key={chat.conv_id} onClick={() => onOpenChat({ id: chat.user_id, name: chat.name, avatar_color: chat.avatar_color }, chat.conv_id)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all animate-slide-up">
          <Avatar name={chat.name} color={chat.avatar_color} />
          <div className="flex-1 min-w-0 text-left">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white text-sm truncate">{chat.name}</span>
              <span className="text-[11px] text-white/40 ml-2 flex-shrink-0">{chat.last_time}</span>
            </div>
            <span className="text-xs text-white/50 truncate block mt-0.5">{chat.last_msg || "Нет сообщений"}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function ContactsTab({ me, onOpenChat }: { me: User; onOpenChat: (contact: Contact, convId: null) => void }) {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    fetch(MSG_URL, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_users", user_id: me.id }) })
      .then(r => r.json())
      .then(raw => { const d = typeof raw === "string" ? JSON.parse(raw) : raw; setContacts(d.users || []); });
  }, []);

  const grouped = contacts.reduce((acc, c) => {
    const l = c.name[0].toUpperCase();
    if (!acc[l]) acc[l] = [];
    acc[l].push(c);
    return acc;
  }, {} as Record<string, Contact[]>);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide animate-fade-in">
      {contacts.length === 0 && (
        <div className="text-center text-white/30 text-sm pt-8 px-6">Других пользователей пока нет.<br />Пригласи друга зарегистрироваться!</div>
      )}
      {Object.entries(grouped).sort().map(([letter, list]) => (
        <div key={letter}>
          <div className="px-4 py-2 text-xs font-bold text-gradient-purple font-unbounded tracking-widest">{letter}</div>
          {list.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all cursor-pointer animate-slide-up">
              <Avatar name={c.name} color={c.avatar_color} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm">{c.name}</div>
              </div>
              <button onClick={() => onOpenChat(c, null)} className="p-2 rounded-xl hover:bg-purple-500/20 transition-all">
                <Icon name="MessageCircle" size={16} className="text-purple-400" />
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function GroupsTab() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-white/30 text-sm px-6 text-center">
      <Icon name="UsersRound" size={40} className="mb-3 opacity-20" />
      <p>Групповые чаты скоро появятся</p>
    </div>
  );
}

function FavoritesTab() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-white/30 text-sm px-6 text-center">
      <Icon name="Star" size={40} className="mb-3 opacity-20" />
      <p>Добавляйте контакты в избранное</p>
    </div>
  );
}

function MissedTab() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-white/30 text-sm px-6 text-center">
      <Icon name="PhoneMissed" size={40} className="mb-3 opacity-20" />
      <p>Пропущенных звонков нет</p>
    </div>
  );
}

function SettingsScreen({ me, onClose, onLogout }: { me: User; onClose: () => void; onLogout: () => void }) {
  const sections = [
    { icon: "User", label: "Профиль", desc: "Имя, фото, статус", color: "text-purple-400", bg: "bg-purple-500/15" },
    { icon: "Bell", label: "Уведомления", desc: "Звуки, вибрация, баннеры", color: "text-cyan-400", bg: "bg-cyan-500/15" },
    { icon: "Lock", label: "Конфиденциальность", desc: "Безопасность, блокировка", color: "text-green-400", bg: "bg-green-500/15" },
    { icon: "Palette", label: "Оформление", desc: "Тема, шрифт, фон", color: "text-pink-400", bg: "bg-pink-500/15" },
    { icon: "HardDrive", label: "Хранилище", desc: "Кэш, загрузки, медиа", color: "text-blue-400", bg: "bg-blue-500/15" },
  ];

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="glass px-5 pt-10 pb-4 flex-shrink-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-all">
            <Icon name="ChevronLeft" size={20} className="text-white/70" />
          </button>
          <h2 className="text-2xl font-bold text-white font-golos">Настройки</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4">
        <div className="glass rounded-2xl p-4 flex items-center gap-4 mb-4 border border-purple-500/20">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${me.avatar_color} flex items-center justify-center text-xl font-bold text-white`}>
            {getInitials(me.name)}
          </div>
          <div>
            <div className="font-bold text-white text-base">{me.name}</div>
            <div className="text-sm text-white/50 mt-0.5">{me.email}</div>
          </div>
        </div>
        <div className="space-y-1">
          {sections.map((s, i) => (
            <button key={s.label} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-white/5 transition-all" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon name={s.icon} size={18} className={s.color} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-white text-sm">{s.label}</div>
                <div className="text-xs text-white/40 mt-0.5">{s.desc}</div>
              </div>
              <Icon name="ChevronRight" size={16} className="text-white/25" />
            </button>
          ))}
        </div>
        <button onClick={onLogout} className="w-full mt-4 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all">
          <span className="text-sm font-semibold text-red-400">Выйти из аккаунта</span>
        </button>
        <p className="text-center text-[10px] text-white/20 mt-4">NOVA v1.0</p>
      </div>
    </div>
  );
}

export default function Index() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("nova_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState("chats");
  const [showSettings, setShowSettings] = useState(false);
  const [openChat, setOpenChat] = useState<{ contact: Contact; convId: number | null } | null>(null);

  const handleLogin = (u: User) => setUser(u);
  const handleLogout = () => { localStorage.removeItem("nova_user"); setUser(null); setShowSettings(false); };

  const handleOpenChat = (contact: Contact, convId: number | null) => {
    setOpenChat({ contact, convId });
    setActiveTab("chats");
  };

  const handleBackFromChat = (newConvId?: number) => {
    setOpenChat(null);
  };

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm h-[800px] glass-strong rounded-[2.5rem] overflow-hidden flex flex-col"
        style={{ boxShadow: "0 0 100px rgba(147,82,255,0.18), 0 50px 100px rgba(0,0,0,0.6)" }}>
        {children}
      </div>
    </div>
  );

  if (!user) return shell(<AuthScreen onLogin={handleLogin} />);

  if (showSettings) return shell(<SettingsScreen me={user} onClose={() => setShowSettings(false)} onLogout={handleLogout} />);

  if (openChat) return shell(
    <ChatView me={user} contact={openChat.contact} convId={openChat.convId} onBack={handleBackFromChat} />
  );

  const renderContent = () => {
    switch (activeTab) {
      case "chats": return <ChatsTab me={user} onOpenChat={handleOpenChat} />;
      case "contacts": return <ContactsTab me={user} onOpenChat={handleOpenChat} />;
      case "groups": return <GroupsTab />;
      case "favorites": return <FavoritesTab />;
      case "missed": return <MissedTab />;
      default: return null;
    }
  };

  return shell(
    <>
      <div className="glass px-5 pt-10 pb-4 flex-shrink-0 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-unbounded font-black text-xl text-gradient-purple leading-tight">NOVA</h1>
            <p className="text-[10px] text-white/35 mt-0.5 font-golos">Привет, {user.name.split(" ")[0]}!</p>
          </div>
          <div className="flex gap-2">
            <button className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
              <Icon name="Bell" size={16} className="text-white/60" />
            </button>
            <button onClick={() => setShowSettings(true)} className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
              <Icon name="Settings" size={16} className="text-white/60" />
            </button>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white font-golos">{TABS.find(t => t.id === activeTab)?.label}</h2>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {renderContent()}
      </div>

      <div className="glass px-2 py-3 flex-shrink-0 border-t border-white/5">
        <div className="flex justify-around items-center">
          {TABS.map(tab => {
            const isActive = tab.id === activeTab;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${isActive ? "tab-active neon-glow-purple scale-105" : "hover:bg-white/5"}`}>
                <Icon name={tab.icon} size={20} className={`transition-all duration-300 ${isActive ? "text-purple-300" : "text-white/35"}`} />
                <span className={`text-[9px] font-semibold transition-all duration-300 leading-none ${isActive ? "text-purple-300" : "text-white/30"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
