"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  Download,
  LogIn,
  Package,
  QrCode,
  Radio,
  Search,
  Shield,
  Smartphone,
  KeyRound,
  Undo2,
  UserRound,
} from "lucide-react";
import { motion } from "framer-motion";

const STORAGE_KEY = "hospital-equipment-checkout-demo-v1";

const starterEquipment = [
  { id: "EQ-1001", qr: "RADIO-1001", name: "Radio 1", type: "Radio", status: "available", notes: "Security channel ready" },
  { id: "EQ-1002", qr: "RADIO-1002", name: "Radio 2", type: "Radio", status: "available", notes: "Spare battery attached" },
  { id: "EQ-2001", qr: "PHONE-2001", name: "Duty Phone A", type: "Phone", status: "available", notes: "iPhone" },
  { id: "EQ-2002", qr: "PHONE-2002", name: "Duty Phone B", type: "Phone", status: "available", notes: "Android" },
  { id: "EQ-3001", qr: "KEYS-3001", name: "Clinic Master Keys", type: "Keys", status: "available", notes: "Orange tag" },
  { id: "EQ-3002", qr: "KEYS-3002", name: "ER Access Keys", type: "Keys", status: "available", notes: "Red tag" },
  { id: "EQ-4001", qr: "BODYCAM-4001", name: "Body Cam 1", type: "Camera", status: "available", notes: "Docking charger" },
];

const starterOfficers = [
  { badge: "I769377", name: "Ford, Cesar", shift: "Day" },
  { badge: "X021032", name: "Barkley, Jesse", shift: "Day" },
  { badge: "T078027", name: "Graham Jr, Michael", shift: "Swing" },
  { badge: "Q599575", name: "Vega, LaVonne R", shift: "Day" },
  { badge: "C549809", name: "Martinez, Norman", shift: "Day" },
  { badge: "Q344536", name: "Pierre, Jean", shift: "Day" },
  { badge: "X215421", name: "Millsom, Lindy", shift: "Day" },
  { badge: "I371451", name: "Opara, Ihuoma I", shift: "Swing" },
  { badge: "F423046", name: "Zendejas, Jorge", shift: "Day" },
  { badge: "D080509", name: "Harvey, Baylee D", shift: "Day" },
  { badge: "D129530", name: "Valdivia, Luis", shift: "Day" },
  { badge: "M428554", name: "Almazan, Eleazar", shift: "Day" },
  { badge: "O558994", name: "Kadhim, Jawad", shift: "Day" },
  { badge: "O861516", name: "Watkins, Freeman", shift: "Swing" },
  { badge: "F774818", name: "Verdugo, Larry", shift: "Swing" },
  { badge: "I907710", name: "Yuson, Joie", shift: "Swing" },
  { badge: "C482209", name: "Barajas, Mariann", shift: "Day" },
  { badge: "W072054", name: "Garcia Castillo, Erika", shift: "Grave" },
  { badge: "I099022", name: "Sutton, Harley", shift: "Grave" },
  { badge: "O120518", name: "Saenz, Sean M", shift: "Swing" },
  { badge: "K861246", name: "Privratsky, Ethan", shift: "Swing" },
  { badge: "Y760821", name: "Tucker, Evelyn", shift: "Day" },
  { badge: "Y375975", name: "Gonzalez, Benjamin", shift: "Swing" },
  { badge: "C885152", name: "Logan, Danielle", shift: "Swing" },
  { badge: "K739825", name: "Anthony, LaTosha M", shift: "Day" },
  { badge: "H571340", name: "Lopez, Daniel", shift: "Swing" },
  { badge: "H908040", name: "Waller, Bianka", shift: "Grave" },
  { badge: "I519301", name: "Reynoso, Victor", shift: "Day" },
  { badge: "P206728", name: "Lutfi, Nibras Z", shift: "Swing" },
  { badge: "B372721", name: "Smith, Nicolas", shift: "Day" },
  { badge: "G520786", name: "Soto, Fernando", shift: "Day" },
  { badge: "H250131", name: "Odierno, Jacob", shift: "Swing" },
  { badge: "I008579", name: "Kelley, Shelly", shift: "Day" },
  { badge: "A921583", name: "Pool, James", shift: "Swing" },
  { badge: "C013093", name: "Miller, Onika", shift: "Swing" },
  { badge: "F975786", name: "Coleman, Deonte", shift: "Grave" },
  { badge: "I629604", name: "Maya, Adan", shift: "Swing" },
  { badge: "L944929", name: "Thomas, Lamaar", shift: "Day" },
  { badge: "S771201", name: "Maluil, Abraham C", shift: "Day" },
  { badge: "B097184", name: "Kinchion, Shawn", shift: "Swing" },
  { badge: "D036447", name: "Allen, Shamonte", shift: "Grave" },
  { badge: "K343453", name: "Clay, Edward D", shift: "Swing" },
  { badge: "Q953950", name: "Rangel, Daniel", shift: "Swing" },
  { badge: "I194950", name: "Chhim, Borin", shift: "Grave" },
  { badge: "L095406", name: "Rodriguez, Jose A.", shift: "Swing" },
  { badge: "I265376", name: "Obub, Adaika", shift: "Grave" },
  { badge: "X659488", name: "Sparks, Cameron", shift: "Swing" },
  { badge: "C587341", name: "Blunt, Derek J", shift: "Swing" },
  { badge: "K926637", name: "Sales, Gary", shift: "Day" },
  { badge: "X417481", name: "Yousif, Ameera", shift: "Day" },
  { badge: "E726338", name: "Bradshaw, Kelly", shift: "Swing" },
  { badge: "W602788", name: "Gastelum, Carlos", shift: "Grave" },
  { badge: "F594838", name: "Adeeb, Louis", shift: "Swing" },
  { badge: "M073308", name: "Beasley, Charles", shift: "Grave" },
];


const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  Radio,
  Phone: Smartphone,
  Keys: KeyRound,
  Camera: QrCode,
  Default: Package,
};

type Officer = {
  badge: string;
  name: string;
  shift: string;
};

type EquipmentItem = {
  id: string;
  qr: string;
  name: string;
  type: string;
  status: "available" | "checked_out";
  notes: string;
  checkedOutBy?: string | null;
  checkedOutAt?: string | null;
};

type SessionEquipment = {
  equipmentId: string;
  qr: string;
  name: string;
  type: string;
  checkedOutAt: string;
  checkedInAt: string | null;
};

type Session = {
  id: string;
  officerBadge: string;
  officerName: string;
  shift: string;
  status: "open" | "closed";
  openedAt: string;
  closedAt: string | null;
  equipment: SessionEquipment[];
};

type LogEntry = {
  id: string;
  time: string;
  action: string;
  detail: string;
};

type AppData = {
  officers: Officer[];
  equipment: EquipmentItem[];
  sessions: Session[];
  logs: LogEntry[];
};

function nowStamp() {
  return new Date().toLocaleString();
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function downloadCSV(filename: string, rows: (string | number | null)[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function loadData(): AppData {
  if (typeof window === "undefined") {
    return {
      officers: starterOfficers,
      equipment: starterEquipment,
      sessions: [],
      logs: [],
    };
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved) as AppData;

  return {
    officers: starterOfficers,
    equipment: starterEquipment,
    sessions: [],
    logs: [],
  };
}

function cls(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cls("rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>{children}</div>;
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-5 pb-0">{children}</div>;
}

function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cls("p-5", className)}>{children}</div>;
}

function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cls("text-xl font-semibold", className)}>{children}</h2>;
}

function Button({
  children,
  onClick,
  variant = "default",
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline";
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cls(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition",
        variant === "default" && "bg-slate-900 text-white hover:bg-slate-800",
        variant === "outline" && "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
        className
      )}
    >
      {children}
    </button>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cls(
        "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400",
        props.className || ""
      )}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cls(
        "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400",
        props.className || ""
      )}
    />
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-slate-700">{children}</label>;
}

function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary";
  className?: string;
}) {
  return (
    <span
      className={cls(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variant === "default" && "bg-slate-900 text-white",
        variant === "secondary" && "bg-slate-100 text-slate-700",
        className
      )}
    >
      {children}
    </span>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  subtext,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  subtext: string;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
            <p className="mt-2 text-sm text-slate-500">{subtext}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-3">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EquipmentIcon({ type }: { type: string }) {
  const Icon = icons[type] || icons.Default;
  return <Icon className="h-4 w-4" />;
}

function ScanInput({
  label,
  placeholder,
  value,
  setValue,
  onSubmit,
  inputRef,
}: {
  label: string;
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
  onSubmit: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
          placeholder={placeholder}
          className="h-11"
        />
        <Button onClick={onSubmit} className="h-11">
          Scan
        </Button>
      </div>
      <p className="text-xs text-slate-500">
        Works with most badge and QR scanners that type into the focused field and send Enter.
      </p>
    </div>
  );
}

export default function EquipmentCheckoutApp() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [activeOfficerBadge, setActiveOfficerBadge] = useState("");
  const [badgeInput, setBadgeInput] = useState("");
  const [equipmentInput, setEquipmentInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"scanner" | "equipment" | "sessions" | "admin">("scanner");
  const [newOfficer, setNewOfficer] = useState({ badge: "", name: "", shift: "Day" });
  const [newEquipment, setNewEquipment] = useState({ qr: "", name: "", type: "Radio", notes: "" });

  const badgeRef = useRef<HTMLInputElement>(null);
  const equipmentRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    badgeRef.current?.focus();
  }, []);

  const activeSession = useMemo(
    () => data.sessions.find((s) => s.officerBadge === activeOfficerBadge && s.status === "open"),
    [data.sessions, activeOfficerBadge]
  );

  const activeOfficer = useMemo(
    () => data.officers.find((o) => o.badge === activeOfficerBadge),
    [data.officers, activeOfficerBadge]
  );

  const availableCount = data.equipment.filter((e) => e.status === "available").length;
  const checkedOutCount = data.equipment.filter((e) => e.status === "checked_out").length;
  const openSessions = data.sessions.filter((s) => s.status === "open").length;

  const filteredEquipment = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return data.equipment;

    return data.equipment.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q) ||
        e.qr.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
    );
  }, [search, data.equipment]);

  function addLog(action: string, detail: string) {
    setData((prev) => ({
      ...prev,
      logs: [{ id: uid(), time: nowStamp(), action, detail }, ...prev.logs],
    }));
  }

  function registerOfficerScan() {
    const badge = badgeInput.trim().toUpperCase();
    if (!badge) return;

    const officer = data.officers.find((o) => o.badge.toUpperCase() === badge);
    if (!officer) {
      addLog("Unknown badge scanned", badge);
      setBadgeInput("");
      return;
    }

    setActiveOfficerBadge(officer.badge);

    setData((prev) => {
      const existing = prev.sessions.find((s) => s.officerBadge === officer.badge && s.status === "open");
      if (existing) return prev;

      return {
        ...prev,
        sessions: [
          {
            id: uid(),
            officerBadge: officer.badge,
            officerName: officer.name,
            shift: officer.shift,
            status: "open",
            openedAt: nowStamp(),
            closedAt: null,
            equipment: [],
          },
          ...prev.sessions,
        ],
      };
    });

    addLog("Officer session opened", `${officer.name} (${officer.badge})`);
    setBadgeInput("");
    setTimeout(() => equipmentRef.current?.focus(), 50);
  }

  function handleEquipmentScan() {
    const code = equipmentInput.trim().toUpperCase();
    if (!code || !activeSession) return;

    const item = data.equipment.find((e) => e.qr.toUpperCase() === code || e.id.toUpperCase() === code);
    if (!item) {
      addLog("Unknown equipment scanned", code);
      setEquipmentInput("");
      return;
    }

    const officerName = activeOfficer?.name || activeSession.officerName;

    if (item.status === "available") {
      setData((prev) => ({
        ...prev,
        equipment: prev.equipment.map((e) =>
          e.id === item.id
            ? { ...e, status: "checked_out", checkedOutBy: activeSession.officerBadge, checkedOutAt: nowStamp() }
            : e
        ),
        sessions: prev.sessions.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                equipment: [
                  ...s.equipment,
                  {
                    equipmentId: item.id,
                    qr: item.qr,
                    name: item.name,
                    type: item.type,
                    checkedOutAt: nowStamp(),
                    checkedInAt: null,
                  },
                ],
              }
            : s
        ),
      }));
      addLog("Equipment checked out", `${item.name} → ${officerName}`);
    } else if (item.status === "checked_out" && item.checkedOutBy === activeSession.officerBadge) {
      setData((prev) => ({
        ...prev,
        equipment: prev.equipment.map((e) =>
          e.id === item.id ? { ...e, status: "available", checkedOutBy: null, checkedOutAt: null } : e
        ),
        sessions: prev.sessions.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                equipment: s.equipment.map((eq) =>
                  eq.equipmentId === item.id && !eq.checkedInAt ? { ...eq, checkedInAt: nowStamp() } : eq
                ),
              }
            : s
        ),
      }));
      addLog("Equipment checked in", `${item.name} ← ${officerName}`);
    } else {
      const holder =
        data.officers.find((o) => o.badge === item.checkedOutBy)?.name || item.checkedOutBy || "another officer";
      addLog("Scan blocked", `${item.name} is currently assigned to ${holder}`);
    }

    setEquipmentInput("");
  }

  function closeSession() {
    if (!activeSession) return;

    const outstanding = activeSession.equipment.filter((e) => !e.checkedInAt);
    if (outstanding.length > 0) {
      addLog("Session close blocked", `${activeSession.officerName} still has ${outstanding.length} item(s) checked out`);
      return;
    }

    setData((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === activeSession.id ? { ...s, status: "closed", closedAt: nowStamp() } : s
      ),
    }));

    addLog("Officer session closed", `${activeSession.officerName} (${activeSession.officerBadge})`);
    setActiveOfficerBadge("");
    setTimeout(() => badgeRef.current?.focus(), 50);
  }

  function addOfficer() {
    if (!newOfficer.badge || !newOfficer.name) return;

    setData((prev) => ({
      ...prev,
      officers: [...prev.officers, { ...newOfficer, badge: newOfficer.badge.toUpperCase() }],
    }));

    addLog("Officer added", `${newOfficer.name} (${newOfficer.badge.toUpperCase()})`);
    setNewOfficer({ badge: "", name: "", shift: "Day" });
  }

  function addEquipment() {
    if (!newEquipment.qr || !newEquipment.name) return;

    const id = `EQ-${Math.floor(1000 + Math.random() * 9000)}`;

    setData((prev) => ({
      ...prev,
      equipment: [...prev.equipment, { id, ...newEquipment, qr: newEquipment.qr.toUpperCase(), status: "available" }],
    }));

    addLog("Equipment added", `${newEquipment.name} (${newEquipment.qr.toUpperCase()})`);
    setNewEquipment({ qr: "", name: "", type: "Radio", notes: "" });
  }

  function exportLogs() {
    downloadCSV("equipment-audit-log.csv", [
      ["Time", "Action", "Detail"],
      ...data.logs.map((l) => [l.time, l.action, l.detail]),
    ]);
  }

  function exportSessions() {
    const rows: (string | number | null)[][] = [
      ["Officer", "Badge", "Shift", "Status", "Opened", "Closed", "Equipment", "Checked Out", "Checked In"],
    ];

    data.sessions.forEach((session) => {
      if (!session.equipment.length) {
        rows.push([
          session.officerName,
          session.officerBadge,
          session.shift,
          session.status,
          session.openedAt,
          session.closedAt || "",
          "",
          "",
          "",
        ]);
      } else {
        session.equipment.forEach((item) => {
          rows.push([
            session.officerName,
            session.officerBadge,
            session.shift,
            session.status,
            session.openedAt,
            session.closedAt || "",
            item.name,
            item.checkedOutAt,
            item.checkedInAt || "",
          ]);
        });
      }
    });

    downloadCSV("equipment-sessions.csv", rows);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm text-slate-600 shadow-sm">
                <Shield className="h-4 w-4" />
                Security Equipment Checkout
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Badge-in, scan gear, track accountability.
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
                Built for shift change. Officers scan their badge to start a session, scan equipment to check out, and
                scan the same items again to return them before ending the shift.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={exportLogs}>
                <Download className="mr-2 h-4 w-4" />
                Export Audit Log
              </Button>
              <Button variant="outline" onClick={exportSessions}>
                <ClipboardList className="mr-2 h-4 w-4" />
                Export Sessions
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <StatCard title="Available Equipment" value={availableCount} icon={CheckCircle2} subtext="Ready for checkout" />
            <StatCard title="Checked Out" value={checkedOutCount} icon={Package} subtext="Currently assigned" />
            <StatCard title="Open Sessions" value={openSessions} icon={LogIn} subtext="Officers on active shift" />
            <StatCard title="Registered Officers" value={data.officers.length} icon={UserRound} subtext="Badge-enabled roster" />
          </div>

          <div className="rounded-2xl bg-white p-1 shadow-sm">
            <div className="grid w-full grid-cols-4 gap-1">
              {(["scanner", "equipment", "sessions", "admin"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cls(
                    "rounded-xl px-3 py-2 text-sm font-medium capitalize",
                    activeTab === tab ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "scanner" && (
            <div className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5" />
                    Shift Start / End
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ScanInput
                    label="1) Scan officer badge"
                    placeholder="Scan badge or type badge number"
                    value={badgeInput}
                    setValue={setBadgeInput}
                    onSubmit={registerOfficerScan}
                    inputRef={badgeRef}
                  />

                  <div className="rounded-2xl border bg-slate-50 p-4">
                    {activeOfficer ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-slate-500">Active officer</p>
                            <h3 className="text-2xl font-semibold">{activeOfficer.name}</h3>
                            <p className="text-sm text-slate-600">
                              Badge: {activeOfficer.badge} · Shift: {activeOfficer.shift}
                            </p>
                          </div>
                          <Badge className="px-3 py-1">Session Open</Badge>
                        </div>

                        <ScanInput
                          label="2) Scan equipment QR code"
                          placeholder="Scan radio, phone, key set, camera, etc."
                          value={equipmentInput}
                          setValue={setEquipmentInput}
                          onSubmit={handleEquipmentScan}
                          inputRef={equipmentRef}
                        />

                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="font-medium">Current session items</h4>
                            <p className="text-sm text-slate-500">Scan again to check in</p>
                          </div>

                          <div className="space-y-2">
                            {(activeSession?.equipment || []).length === 0 && (
                              <p className="text-sm text-slate-500">No equipment checked out yet.</p>
                            )}

                            {(activeSession?.equipment || []).map((item, idx) => (
                              <div key={`${item.equipmentId}-${idx}`} className="flex items-center justify-between rounded-xl border p-3">
                                <div className="flex items-center gap-3">
                                  <div className="rounded-xl bg-slate-100 p-2">
                                    <EquipmentIcon type={item.type} />
                                  </div>
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-xs text-slate-500">{item.qr}</p>
                                  </div>
                                </div>

                                {item.checkedInAt ? (
                                  <Badge variant="secondary">Returned</Badge>
                                ) : (
                                  <Badge>Out</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button onClick={closeSession}>End shift session</Button>
                          <Button variant="outline" onClick={() => setActiveOfficerBadge("")}>
                            Switch officer
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed bg-white p-6 text-center text-slate-500">
                        Scan an officer badge to begin a checkout session.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Activity Feed
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="max-h-[560px] space-y-3 overflow-y-auto pr-2">
                    {data.logs.length === 0 && <p className="text-sm text-slate-500">No activity yet.</p>}

                    {data.logs.map((log) => (
                      <div key={log.id} className="rounded-2xl border bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{log.action}</p>
                          <p className="text-xs text-slate-500">{log.time}</p>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{log.detail}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "equipment" && (
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <CardTitle>Equipment Inventory</CardTitle>

                  <div className="relative w-full md:w-80">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search equipment"
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {filteredEquipment.map((item) => (
                    <div key={item.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-slate-100 p-2">
                            <EquipmentIcon type={item.type} />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-slate-500">
                              {item.type} · {item.qr}
                            </p>
                          </div>
                        </div>

                        {item.status === "available" ? (
                          <Badge variant="secondary">Available</Badge>
                        ) : (
                          <Badge>Checked out</Badge>
                        )}
                      </div>

                      <p className="mt-3 text-sm text-slate-600">{item.notes || "No notes"}</p>

                      {item.checkedOutBy && (
                        <p className="mt-2 text-xs text-slate-500">
                          Assigned to {item.checkedOutBy} since {item.checkedOutAt}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "sessions" && (
            <div className="grid gap-4 lg:grid-cols-2">
              {data.sessions.map((session) => {
                const outstanding = session.equipment.filter((i) => !i.checkedInAt).length;

                return (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle>{session.officerName}</CardTitle>
                          <p className="mt-1 text-sm text-slate-500">
                            {session.officerBadge} · {session.shift} shift
                          </p>
                        </div>

                        <Badge variant={session.status === "open" ? "default" : "secondary"}>
                          {session.status === "open" ? "Open" : "Closed"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-slate-500">Started</p>
                          <p className="mt-1 font-medium">{session.openedAt}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-slate-500">Ended</p>
                          <p className="mt-1 font-medium">{session.closedAt || "Still active"}</p>
                        </div>
                      </div>

                      <div className="rounded-xl border p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="font-medium">Checked equipment</p>
                          <p className="text-sm text-slate-500">Outstanding: {outstanding}</p>
                        </div>

                        <div className="space-y-2">
                          {session.equipment.length === 0 && <p className="text-sm text-slate-500">No items in this session.</p>}

                          {session.equipment.map((item, idx) => (
                            <div key={`${item.equipmentId}-${idx}`} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-slate-500">Out: {item.checkedOutAt}</p>
                              </div>

                              <div className="text-right text-xs text-slate-500">
                                {item.checkedInAt ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Undo2 className="h-3.5 w-3.5" />
                                    In: {item.checkedInAt}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1">
                                    <Package className="h-3.5 w-3.5" />
                                    Not returned
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {activeTab === "admin" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Add Officer</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Badge ID</Label>
                    <Input
                      value={newOfficer.badge}
                      onChange={(e) => setNewOfficer({ ...newOfficer, badge: e.target.value })}
                      placeholder="BCI-2001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Officer Name</Label>
                    <Input
                      value={newOfficer.name}
                      onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })}
                      placeholder="Officer Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Shift</Label>
                    <select
                      value={newOfficer.shift}
                      onChange={(e) => setNewOfficer({ ...newOfficer, shift: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="Day">Day</option>
                      <option value="Swing">Swing</option>
                      <option value="Night">Night</option>
                    </select>
                  </div>

                  <Button onClick={addOfficer}>Save officer</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add Equipment</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>QR Code Value</Label>
                    <Input
                      value={newEquipment.qr}
                      onChange={(e) => setNewEquipment({ ...newEquipment, qr: e.target.value })}
                      placeholder="RADIO-3001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Equipment Name</Label>
                    <Input
                      value={newEquipment.name}
                      onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                      placeholder="Radio 3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select
                      value={newEquipment.type}
                      onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="Radio">Radio</option>
                      <option value="Phone">Phone</option>
                      <option value="Keys">Keys</option>
                      <option value="Camera">Camera</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={newEquipment.notes}
                      onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })}
                      placeholder="Battery included, key ring color, assigned area, etc."
                    />
                  </div>

                  <Button onClick={addEquipment}>Save equipment</Button>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="flex flex-col gap-2 text-sm text-emerald-900">
              <p className="font-medium">Recommended real-world setup</p>
              <p>
                Use badge scanners and QR scanners in keyboard-wedge mode so they act like fast keyboards. In production,
                connect this UI to a secure database and add supervisor permissions, lost-item workflows, and device-camera
                scanning for mobile use.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
