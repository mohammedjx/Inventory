"use client";

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

let XLSX: any;
if (typeof window !== "undefined") {
  XLSX = require("xlsx");
}

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
  { badge: "BCI-1452", name: "Officer Archer", shift: "Day" },
  { badge: "BCI-1841", name: "Officer Beltran", shift: "Swing" },
  { badge: "BCI-1999", name: "Officer Crawford", shift: "Night" },
  { badge: "BCI-1777", name: "Officer Delaney", shift: "Day" },
];

const icons = {
  Radio,
  Phone: Smartphone,
  Keys: KeyRound,
  Camera: QrCode,
  Default: Package,
};

function nowStamp() {
  return new Date().toLocaleString();
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function downloadCSV(filename, rows) {
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

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return {
    officers: starterOfficers,
    equipment: starterEquipment,
    sessions: [],
    logs: [],
  };
}

function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, subtext }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-5">
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

function EquipmentIcon({ type }) {
  const Icon = icons[type] || icons.Default;
  return <Icon className="h-4 w-4" />;
}

function ScanInput({ label, placeholder, value, setValue, onSubmit, inputRef }) {
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
          className="h-11 rounded-xl"
        />
        <Button onClick={onSubmit} className="h-11 rounded-xl">Scan</Button>
      </div>
      <p className="text-xs text-slate-500">Works with most badge and QR scanners that type into the focused field and send Enter.</p>
    </div>
  );
}

export default function EquipmentCheckoutApp() {
  const [data, setData] = useState(() => loadData());
  const [activeOfficerBadge, setActiveOfficerBadge] = useState("");
  const [badgeInput, setBadgeInput] = useState("");
  const [equipmentInput, setEquipmentInput] = useState("");
  const [search, setSearch] = useState("");
  const [newOfficer, setNewOfficer] = useState({ badge: "", name: "", shift: "Day" });
  const [newEquipment, setNewEquipment] = useState({ qr: "", name: "", type: "Radio", notes: "" });
  const badgeRef = useRef(null);
  const equipmentRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const activeSession = useMemo(() => data.sessions.find((s) => s.officerBadge === activeOfficerBadge && s.status === "open"), [data.sessions, activeOfficerBadge]);
  const activeOfficer = useMemo(() => data.officers.find((o) => o.badge === activeOfficerBadge), [data.officers, activeOfficerBadge]);

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

  function addLog(action, detail) {
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
          e.id === item.id ? { ...e, status: "checked_out", checkedOutBy: activeSession.officerBadge, checkedOutAt: nowStamp() } : e
        ),
        sessions: prev.sessions.map((s) =>
          s.id === activeSession.id ? { ...s, equipment: [...s.equipment, { equipmentId: item.id, qr: item.qr, name: item.name, type: item.type, checkedOutAt: nowStamp(), checkedInAt: null }] } : s
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
      const holder = data.officers.find((o) => o.badge === item.checkedOutBy)?.name || item.checkedOutBy || "another officer";
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

  async function importOfficersFromExcel(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

      const imported = rows
        .map((row) => {
          const badge = String(
            row["Badge"] ||
              row["Badge ID"] ||
              row["BadgeID"] ||
              row["Employee ID"] ||
              row["EmployeeID"] ||
              row["ID"] ||
              ""
          )
            .trim()
            .toUpperCase();

          const name = String(
            row["Name"] ||
              row["Officer Name"] ||
              row["Officer"] ||
              row["Employee Name"] ||
              ""
          ).trim();

          const shift = String(row["Shift"] || "Day").trim() || "Day";

          if (!badge || !name) return null;
          return { badge, name, shift };
        })
        .filter(Boolean);

      if (!imported.length) {
        addLog("Officer import failed", "No valid rows found in Excel file");
        event.target.value = "";
        return;
      }

      setData((prev) => {
        const existingBadges = new Set(prev.officers.map((o) => o.badge.toUpperCase()));
        const uniqueNewOfficers = imported.filter((o) => !existingBadges.has(o.badge));
        return {
          ...prev,
          officers: [...prev.officers, ...uniqueNewOfficers],
        };
      });

      addLog("Officers imported", `${imported.length} row(s) processed from ${file.name}`);
    } catch (error) {
      addLog("Officer import failed", `Could not read ${file.name}`);
    }

    event.target.value = "";
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
    const rows = [["Officer", "Badge", "Shift", "Status", "Opened", "Closed", "Equipment", "Checked Out", "Checked In"]];
    data.sessions.forEach((session) => {
      if (!session.equipment.length) {
        rows.push([session.officerName, session.officerBadge, session.shift, session.status, session.openedAt, session.closedAt || "", "", "", ""]);
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

  useEffect(() => {
    badgeRef.current?.focus();
  }, []);

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm text-slate-600 shadow-sm">
              <Shield className="h-4 w-4" /> Security Equipment Checkout
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Badge-in, scan gear, track accountability.</h1>
            <p className="mt-2 max-w-3xl text-sm md:text-base text-slate-600">
              Built for shift change. Officers scan their badge to start a session, scan equipment to check out, and scan the same items again to return them before ending the shift.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-xl" onClick={exportLogs}><Download className="mr-2 h-4 w-4" /> Export Audit Log</Button>
            <Button variant="outline" className="rounded-xl" onClick={exportSessions}><ClipboardList className="mr-2 h-4 w-4" /> Export Sessions</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Available Equipment" value={availableCount} icon={CheckCircle2} subtext="Ready for checkout" />
          <StatCard title="Checked Out" value={checkedOutCount} icon={Package} subtext="Currently assigned" />
          <StatCard title="Open Sessions" value={openSessions} icon={LogIn} subtext="Officers on active shift" />
          <StatCard title="Registered Officers" value={data.officers.length} icon={UserRound} subtext="Badge-enabled roster" />
        </div>

        <Tabs defaultValue="scanner" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-white p-1 shadow-sm">
            <TabsTrigger value="scanner" className="rounded-xl">Scanner</TabsTrigger>
            <TabsTrigger value="equipment" className="rounded-xl">Equipment</TabsTrigger>
            <TabsTrigger value="sessions" className="rounded-xl">Sessions</TabsTrigger>
            <TabsTrigger value="admin" className="rounded-xl">Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Add Officer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Badge ID</Label><Input className="rounded-xl" value={newOfficer.badge} onChange={(e) => setNewOfficer({ ...newOfficer, badge: e.target.value })} placeholder="BCI-2001" /></div>
                  <div className="space-y-2"><Label>Officer Name</Label><Input className="rounded-xl" value={newOfficer.name} onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })} placeholder="Officer Name" /></div>
                  <div className="space-y-2">
                    <Label>Shift</Label>
                    <Select value={newOfficer.shift} onValueChange={(value) => setNewOfficer({ ...newOfficer, shift: value })}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Day">Day</SelectItem>
                        <SelectItem value="Swing">Swing</SelectItem>
                        <SelectItem value="Night">Night</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addOfficer} className="rounded-xl">Save officer</Button>

                  <div className="rounded-2xl border bg-slate-50 p-4">
                    <p className="font-medium">Bulk import officers from Excel</p>
                    <p className="mt-1 text-sm text-slate-500">Upload an .xlsx file with columns like Name, Badge ID, and Shift.</p>
                    <Input type="file" accept=".xlsx,.xls" className="mt-3 rounded-xl" onChange={importOfficersFromExcel} />
                    <p className="mt-2 text-xs text-slate-500">Supported column names: Name / Officer Name, Badge / Badge ID / Employee ID / ID, Shift.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl"><AlertCircle className="h-5 w-5" /> Activity Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[560px] pr-4">
                    <div className="space-y-3">
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
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="equipment">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <CardTitle className="text-xl">Equipment Inventory</CardTitle>
                  <div className="relative w-full md:w-80">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search equipment" className="rounded-xl pl-9" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {filteredEquipment.map((item) => (
                    <div key={item.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-slate-100 p-2"><EquipmentIcon type={item.type} /></div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-slate-500">{item.type} · {item.qr}</p>
                          </div>
                        </div>
                        {item.status === "available" ? (
                          <Badge variant="secondary" className="rounded-full">Available</Badge>
                        ) : (
                          <Badge className="rounded-full">Checked out</Badge>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{item.notes || "No notes"}</p>
                      {item.checkedOutBy && (
                        <p className="mt-2 text-xs text-slate-500">Assigned to {item.checkedOutBy} since {item.checkedOutAt}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <div className="grid gap-4 lg:grid-cols-2">
              {data.sessions.map((session) => {
                const outstanding = session.equipment.filter((i) => !i.checkedInAt).length;
                return (
                  <Card key={session.id} className="rounded-2xl shadow-sm">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-xl">{session.officerName}</CardTitle>
                          <p className="mt-1 text-sm text-slate-500">{session.officerBadge} · {session.shift} shift</p>
                        </div>
                        <Badge variant={session.status === "open" ? "default" : "secondary"} className="rounded-full">
                          {session.status === "open" ? "Open" : "Closed"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-500">Started</p><p className="mt-1 font-medium">{session.openedAt}</p></div>
                        <div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-500">Ended</p><p className="mt-1 font-medium">{session.closedAt || "Still active"}</p></div>
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
                                  <span className="inline-flex items-center gap-1"><Undo2 className="h-3.5 w-3.5" /> In: {item.checkedInAt}</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1"><Package className="h-3.5 w-3.5" /> Not returned</span>
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
          </TabsContent>

          <TabsContent value="admin">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Add Officer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Badge ID</Label><Input className="rounded-xl" value={newOfficer.badge} onChange={(e) => setNewOfficer({ ...newOfficer, badge: e.target.value })} placeholder="BCI-2001" /></div>
                  <div className="space-y-2"><Label>Officer Name</Label><Input className="rounded-xl" value={newOfficer.name} onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })} placeholder="Officer Name" /></div>
                  <div className="space-y-2">
                    <Label>Shift</Label>
                    <Select value={newOfficer.shift} onValueChange={(value) => setNewOfficer({ ...newOfficer, shift: value })}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Day">Day</SelectItem>
                        <SelectItem value="Swing">Swing</SelectItem>
                        <SelectItem value="Night">Night</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addOfficer} className="rounded-xl">Save officer</Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Add Equipment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>QR Code Value</Label><Input className="rounded-xl" value={newEquipment.qr} onChange={(e) => setNewEquipment({ ...newEquipment, qr: e.target.value })} placeholder="RADIO-3001" /></div>
                  <div className="space-y-2"><Label>Equipment Name</Label><Input className="rounded-xl" value={newEquipment.name} onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })} placeholder="Radio 3" /></div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={newEquipment.type} onValueChange={(value) => setNewEquipment({ ...newEquipment, type: value })}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Radio">Radio</SelectItem>
                        <SelectItem value="Phone">Phone</SelectItem>
                        <SelectItem value="Keys">Keys</SelectItem>
                        <SelectItem value="Camera">Camera</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Notes</Label><Textarea className="rounded-xl" value={newEquipment.notes} onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })} placeholder="Battery included, key ring color, assigned area, etc." /></div>
                  <Button onClick={addEquipment} className="rounded-xl">Save equipment</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Card className="rounded-2xl border-emerald-200 bg-emerald-50 shadow-sm">
          <CardContent className="flex flex-col gap-2 p-5 text-sm text-emerald-900">
            <p className="font-medium">Recommended real-world setup</p>
            <p>Use badge scanners and QR scanners in keyboard-wedge mode so they act like fast keyboards. In production, connect this UI to a secure database and add supervisor permissions, lost-item workflows, and device-camera scanning for mobile use.</p>
          </CardContent>
        </Card>
      </motion.div>
    </AppShell>
  );
}
