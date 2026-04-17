'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Officer = {
  badge: string;
  name: string;
  shift: string;
};

type Equipment = {
  id: string;
  qr: string;
  name: string;
  type: string;
  status: 'available' | 'checked_out';
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
  status: 'open' | 'closed';
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
  equipment: Equipment[];
  sessions: Session[];
  logs: LogEntry[];
};

const STORAGE_KEY = 'equipment-checkout-app-v1';

const starterEquipment: Equipment[] = [
  { id: 'EQ-1001', qr: '\642UBS1203\', name: 'ZIO_01', type: 'Radio', status: 'available', notes: 'Primary dispatch channel' },
  { id: 'EQ-1002', qr: 'RADIO-1002', name: 'Radio 2', type: 'Radio', status: 'available', notes: 'Spare radio with extra battery' },
  { id: 'EQ-2001', qr: 'PHONE-2001', name: 'Duty Phone A', type: 'Phone', status: 'available', notes: 'Supervisor line' },
  { id: 'EQ-3001', qr: 'KEYS-3001', name: 'ER Keys', type: 'Keys', status: 'available', notes: 'Red key ring' },
  { id: 'EQ-3002', qr: 'KEYS-3002', name: 'Clinic Keys', type: 'Keys', status: 'available', notes: 'Orange key ring' },
  { id: 'EQ-4001', qr: 'TABLET-4001', name: 'Incident Tablet', type: 'Tablet', status: 'available', notes: 'Report writing tablet' },
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
  { badge: "\O558994\", name: "ASM Kadhim, Jawad", shift: "Day" },
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
function nowStamp() {
  return new Date().toLocaleString();
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function downloadCSV(filename: string, rows: (string | number | null | undefined)[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function loadData(): AppData {
  if (typeof window === 'undefined') {
    return { officers: starterOfficers, equipment: starterEquipment, sessions: [], logs: [] };
  }
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as AppData;
    } catch {
      return { officers: starterOfficers, equipment: starterEquipment, sessions: [], logs: [] };
    }
  }
  return { officers: starterOfficers, equipment: starterEquipment, sessions: [], logs: [] };
}

export default function Page() {
  const [data, setData] = useState<AppData>({ officers: starterOfficers, equipment: starterEquipment, sessions: [], logs: [] });
  const [loaded, setLoaded] = useState(false);
  const [activeOfficerBadge, setActiveOfficerBadge] = useState('');
  const [badgeInput, setBadgeInput] = useState('');
  const [equipmentInput, setEquipmentInput] = useState('');
  const [search, setSearch] = useState('');
  const [newOfficer, setNewOfficer] = useState<Officer>({ badge: '', name: '', shift: 'Day' });
  const [newEquipment, setNewEquipment] = useState({ qr: '', name: '', type: 'Radio', notes: '' });
  const badgeRef = useRef<HTMLInputElement | null>(null);
  const equipmentRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setData(loadData());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, loaded]);

  useEffect(() => {
    badgeRef.current?.focus();
  }, []);

  const activeSession = useMemo(
    () => data.sessions.find((s) => s.officerBadge === activeOfficerBadge && s.status === 'open'),
    [data.sessions, activeOfficerBadge]
  );

  const activeOfficer = useMemo(
    () => data.officers.find((o) => o.badge === activeOfficerBadge),
    [data.officers, activeOfficerBadge]
  );

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
      addLog('Unknown badge scanned', badge);
      setBadgeInput('');
      return;
    }

    setActiveOfficerBadge(officer.badge);

    setData((prev) => {
      const existing = prev.sessions.find((s) => s.officerBadge === officer.badge && s.status === 'open');
      if (existing) return prev;
      return {
        ...prev,
        sessions: [
          {
            id: uid(),
            officerBadge: officer.badge,
            officerName: officer.name,
            shift: officer.shift,
            status: 'open',
            openedAt: nowStamp(),
            closedAt: null,
            equipment: [],
          },
          ...prev.sessions,
        ],
      };
    });

    addLog('Officer session opened', `${officer.name} (${officer.badge})`);
    setBadgeInput('');
    setTimeout(() => equipmentRef.current?.focus(), 50);
  }

  function handleEquipmentScan() {
    const code = equipmentInput.trim().toUpperCase();
    if (!code || !activeSession) return;

    const item = data.equipment.find((e) => e.qr.toUpperCase() === code || e.id.toUpperCase() === code);
    if (!item) {
      addLog('Unknown equipment scanned', code);
      setEquipmentInput('');
      return;
    }

    const officerName = activeOfficer?.name || activeSession.officerName;

    if (item.status === 'available') {
      setData((prev) => ({
        ...prev,
        equipment: prev.equipment.map((e) =>
          e.id === item.id
            ? { ...e, status: 'checked_out', checkedOutBy: activeSession.officerBadge, checkedOutAt: nowStamp() }
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
      addLog('Equipment checked out', `${item.name} → ${officerName}`);
    } else if (item.status === 'checked_out' && item.checkedOutBy === activeSession.officerBadge) {
      setData((prev) => ({
        ...prev,
        equipment: prev.equipment.map((e) =>
          e.id === item.id ? { ...e, status: 'available', checkedOutBy: null, checkedOutAt: null } : e
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
      addLog('Equipment checked in', `${item.name} ← ${officerName}`);
    } else {
      const holder = data.officers.find((o) => o.badge === item.checkedOutBy)?.name || item.checkedOutBy || 'another officer';
      addLog('Scan blocked', `${item.name} is currently assigned to ${holder}`);
    }

    setEquipmentInput('');
  }

  function closeSession() {
    if (!activeSession) return;
    const outstanding = activeSession.equipment.filter((e) => !e.checkedInAt);
    if (outstanding.length > 0) {
      addLog('Session close blocked', `${activeSession.officerName} still has ${outstanding.length} item(s) checked out`);
      return;
    }

    setData((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === activeSession.id ? { ...s, status: 'closed', closedAt: nowStamp() } : s
      ),
    }));
    addLog('Officer session closed', `${activeSession.officerName} (${activeSession.officerBadge})`);
    setActiveOfficerBadge('');
    setTimeout(() => badgeRef.current?.focus(), 50);
  }

  function addOfficer() {
    if (!newOfficer.badge.trim() || !newOfficer.name.trim()) return;
    setData((prev) => ({
      ...prev,
      officers: [...prev.officers, { ...newOfficer, badge: newOfficer.badge.toUpperCase() }],
    }));
    addLog('Officer added', `${newOfficer.name} (${newOfficer.badge.toUpperCase()})`);
    setNewOfficer({ badge: '', name: '', shift: 'Day' });
  }

  function addEquipment() {
    if (!newEquipment.qr.trim() || !newEquipment.name.trim()) return;
    const id = `EQ-${Math.floor(1000 + Math.random() * 9000)}`;
    setData((prev) => ({
      ...prev,
      equipment: [
        ...prev.equipment,
        {
          id,
          qr: newEquipment.qr.toUpperCase(),
          name: newEquipment.name,
          type: newEquipment.type,
          notes: newEquipment.notes,
          status: 'available',
        },
      ],
    }));
    addLog('Equipment added', `${newEquipment.name} (${newEquipment.qr.toUpperCase()})`);
    setNewEquipment({ qr: '', name: '', type: 'Radio', notes: '' });
  }

  function exportLogs() {
    downloadCSV('equipment-audit-log.csv', [
      ['Time', 'Action', 'Detail'],
      ...data.logs.map((l) => [l.time, l.action, l.detail]),
    ]);
  }

  function exportSessions() {
    const rows: (string | number | null | undefined)[][] = [
      ['Officer', 'Badge', 'Shift', 'Status', 'Opened', 'Closed', 'Equipment', 'Checked Out', 'Checked In'],
    ];
    data.sessions.forEach((session) => {
      if (!session.equipment.length) {
        rows.push([
          session.officerName,
          session.officerBadge,
          session.shift,
          session.status,
          session.openedAt,
          session.closedAt || '',
          '',
          '',
          '',
        ]);
      } else {
        session.equipment.forEach((item) => {
          rows.push([
            session.officerName,
            session.officerBadge,
            session.shift,
            session.status,
            session.openedAt,
            session.closedAt || '',
            item.name,
            item.checkedOutAt,
            item.checkedInAt || '',
          ]);
        });
      }
    });
    downloadCSV('equipment-sessions.csv', rows);
  }

  const availableCount = data.equipment.filter((e) => e.status === 'available').length;
  const checkedOutCount = data.equipment.filter((e) => e.status === 'checked_out').length;
  const openSessions = data.sessions.filter((s) => s.status === 'open').length;

  return (
    <main className="page-shell">
      <div className="hero">
        <div>
          <span className="eyebrow">Security Equipment Checkout</span>
          <h1>BCI - Zion Medical Center.</h1>
          <p>
            Badge scan in. QR scan out. Scan again to return.</p>
        </div>
        <div className="hero-actions">
          <button className="btn secondary" onClick={exportLogs}>Export Audit Log</button>
          <button className="btn secondary" onClick={exportSessions}>Export Sessions</button>
        </div>
      </div>

      <section className="stats-grid">
        <StatCard title="Available Equipment" value={availableCount} subtitle="Ready for checkout" />
        <StatCard title="Checked Out" value={checkedOutCount} subtitle="Currently assigned" />
        <StatCard title="Open Sessions" value={openSessions} subtitle="Active shifts" />
        <StatCard title="Registered Officers" value={data.officers.length} subtitle="Badge-enabled roster" />
      </section>

      <section className="content-grid">
        <div className="panel span-2">
          <h2>Officer session</h2>
          <p className="muted">Badge scanners and QR scanners usually act like keyboards. Click in a field and scan.</p>

          <div className="form-block">
            <label htmlFor="badge">1) Scan officer badge</label>
            <div className="input-row">
              <input
                id="badge"
                ref={badgeRef}
                value={badgeInput}
                onChange={(e) => setBadgeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && registerOfficerScan()}
                placeholder="Scan badge or type badge ID"
              />
              <button className="btn" onClick={registerOfficerScan}>Scan Badge</button>
            </div>
          </div>

          <div className="session-box">
            {activeOfficer && activeSession ? (
              <>
                <div className="session-header">
                  <div>
                    <div className="session-title">{activeOfficer.name}</div>
                    <div className="muted">Badge: {activeOfficer.badge} · Shift: {activeOfficer.shift}</div>
                  </div>
                  <span className="pill success">Session Open</span>
                </div>

                <div className="form-block">
                  <label htmlFor="equipment">2) Scan equipment QR code</label>
                  <div className="input-row">
                    <input
                      id="equipment"
                      ref={equipmentRef}
                      value={equipmentInput}
                      onChange={(e) => setEquipmentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEquipmentScan()}
                      placeholder="Scan radio, phone, keys, tablet, etc."
                    />
                    <button className="btn" onClick={handleEquipmentScan}>Scan Item</button>
                  </div>
                </div>

                <div className="subpanel">
                  <div className="subpanel-header">
                    <strong>Current session items</strong>
                    <span className="muted">Scan again to check in</span>
                  </div>
                  <div className="item-list">
                    {activeSession.equipment.length === 0 && <div className="empty">No equipment checked out yet.</div>}
                    {activeSession.equipment.map((item, idx) => (
                      <div className="item-row" key={`${item.equipmentId}-${idx}`}>
                        <div>
                          <div className="item-name">{item.name}</div>
                          <div className="muted small">{item.qr}</div>
                        </div>
                        <span className={`pill ${item.checkedInAt ? 'neutral' : 'warning'}`}>
                          {item.checkedInAt ? 'Returned' : 'Out'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="action-row">
                  <button className="btn" onClick={closeSession}>End Shift Session</button>
                  <button className="btn secondary" onClick={() => setActiveOfficerBadge('')}>Switch Officer</button>
                </div>
              </>
            ) : (
              <div className="empty tall">Scan an officer badge to begin a shift session.</div>
            )}
          </div>
        </div>

        <div className="panel">
          <h2>Activity feed</h2>
          <div className="feed">
            {data.logs.length === 0 && <div className="empty">No activity yet.</div>}
            {data.logs.map((log) => (
              <div className="feed-entry" key={log.id}>
                <div className="feed-top">
                  <strong>{log.action}</strong>
                  <span className="muted small">{log.time}</span>
                </div>
                <div className="muted">{log.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="content-grid lower-grid">
        <div className="panel span-2">
          <div className="panel-head-inline">
            <h2>Equipment inventory</h2>
            <input
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search equipment"
            />
          </div>
          <div className="inventory-grid">
            {filteredEquipment.map((item) => (
              <div className="inventory-card" key={item.id}>
                <div className="inventory-top">
                  <div>
                    <div className="item-name">{item.name}</div>
                    <div className="muted small">{item.type} · {item.qr}</div>
                  </div>
                  <span className={`pill ${item.status === 'available' ? 'neutral' : 'warning'}`}>
                    {item.status === 'available' ? 'Available' : 'Checked Out'}
                  </span>
                </div>
                <p className="card-note">{item.notes || 'No notes'}</p>
                {item.checkedOutBy && (
                  <div className="muted small">Assigned to {item.checkedOutBy} since {item.checkedOutAt}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Add officer</h2>
          <div className="form-stack">
            <label>Badge ID</label>
            <input value={newOfficer.badge} onChange={(e) => setNewOfficer({ ...newOfficer, badge: e.target.value })} placeholder="BCI-2001" />
            <label>Officer name</label>
            <input value={newOfficer.name} onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })} placeholder="Officer Name" />
            <label>Shift</label>
            <select value={newOfficer.shift} onChange={(e) => setNewOfficer({ ...newOfficer, shift: e.target.value })}>
              <option>Day</option>
              <option>Swing</option>
              <option>Night</option>
            </select>
            <button className="btn" onClick={addOfficer}>Save Officer</button>
          </div>
        </div>
      </section>

      <section className="content-grid lower-grid">
        <div className="panel span-3">
          <h2>Sessions</h2>
          <div className="session-cards">
            {data.sessions.length === 0 && <div className="empty">No sessions yet.</div>}
            {data.sessions.map((session) => {
              const outstanding = session.equipment.filter((i) => !i.checkedInAt).length;
              return (
                <div className="session-card" key={session.id}>
                  <div className="session-header">
                    <div>
                      <div className="item-name">{session.officerName}</div>
                      <div className="muted small">{session.officerBadge} · {session.shift} shift</div>
                    </div>
                    <span className={`pill ${session.status === 'open' ? 'success' : 'neutral'}`}>{session.status}</span>
                  </div>
                  <div className="session-meta-grid">
                    <div><span className="muted small">Started</span><div>{session.openedAt}</div></div>
                    <div><span className="muted small">Ended</span><div>{session.closedAt || 'Still active'}</div></div>
                    <div><span className="muted small">Outstanding</span><div>{outstanding}</div></div>
                  </div>
                  <div className="mini-list">
                    {session.equipment.length === 0 && <div className="muted small">No equipment in this session.</div>}
                    {session.equipment.map((item, idx) => (
                      <div className="mini-item" key={`${item.equipmentId}-${idx}`}>
                        <div>
                          <div className="small-strong">{item.name}</div>
                          <div className="muted small">Out: {item.checkedOutAt}</div>
                        </div>
                        <div className="muted small">{item.checkedInAt ? `In: ${item.checkedInAt}` : 'Not returned'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="content-grid lower-grid">
        <div className="panel span-3">
          <h2>Add equipment</h2>
          <div className="form-grid">
            <div className="form-stack">
              <label>QR Code value</label>
              <input value={newEquipment.qr} onChange={(e) => setNewEquipment({ ...newEquipment, qr: e.target.value })} placeholder="RADIO-3001" />
            </div>
            <div className="form-stack">
              <label>Equipment name</label>
              <input value={newEquipment.name} onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })} placeholder="Radio 3" />
            </div>
            <div className="form-stack">
              <label>Type</label>
              <select value={newEquipment.type} onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value })}>
                <option>Radio</option>
                <option>Phone</option>
                <option>Keys</option>
                <option>Tablet</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-stack span-2">
              <label>Notes</label>
              <textarea value={newEquipment.notes} onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })} placeholder="Battery included, key ring color, assigned area, serial notes, etc." />
            </div>
            <div className="form-stack">
              <label>&nbsp;</label>
              <button className="btn" onClick={addEquipment}>Save Equipment</button>
            </div>
          </div>
        </div>
      </section>

      <section className="notice">
        <strong>Important:</strong> this packaged version stores data in the browser only. For real multi-user use at work, the next upgrade is connecting it to a shared cloud database like Supabase or Firebase.
      </section>
    </main>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: number; subtitle: string }) {
  return (
    <div className="stat-card">
      <div className="muted small">{title}</div>
      <div className="stat-value">{value}</div>
      <div className="muted small">{subtitle}</div>
    </div>
  );
}
