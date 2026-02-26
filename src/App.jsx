import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "retired-todo-lists";

const initialData = [
  {
    id: "cat-1",
    text: "Wharf",
    checked: false,
    children: [
      { id: "item-1", text: "Leaking faucet", checked: false, children: [] },
      {
        id: "item-2",
        text: "Boat lift issues",
        checked: false,
        children: [
          { id: "item-2a", text: "Needs grease", checked: false, children: [] },
          { id: "item-2b", text: "Needs leveling", checked: false, children: [] },
        ],
      },
      { id: "item-3", text: "Renail boards", checked: false, children: [] },
    ],
  },
  {
    id: "cat-2",
    text: "Yard",
    checked: false,
    children: [
      { id: "item-4", text: "Fix sprinkler", checked: false, children: [] },
      { id: "item-5", text: "Pick up sticks", checked: false, children: [] },
      { id: "item-6", text: "Flowerbed by water", checked: false, children: [] },
    ],
  },
];

function generateId() {
  return "id-" + Math.random().toString(36).slice(2, 9);
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function findAndUpdate(items, id, updater) {
  return items.map((item) => {
    if (item.id === id) return updater(item);
    return { ...item, children: findAndUpdate(item.children, id, updater) };
  });
}

function findAndDelete(items, id) {
  return items
    .filter((item) => item.id !== id)
    .map((item) => ({ ...item, children: findAndDelete(item.children, id) }));
}

function findAndAddChild(items, parentId, newItem) {
  return items.map((item) => {
    if (item.id === parentId) {
      return { ...item, children: [...item.children, newItem] };
    }
    return { ...item, children: findAndAddChild(item.children, parentId, newItem) };
  });
}

function countDescendants(item) {
  if (!item.children || item.children.length === 0) return 0;
  return item.children.reduce((acc, child) => acc + 1 + countDescendants(child), 0);
}

// Inline editable text
function EditableText({ text, onSave, className, style }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(text);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  // keep local state aligned if parent updates text
  useEffect(() => {
    if (!editing) setVal(text);
  }, [text, editing]);

  const commit = () => {
    const trimmed = val.trim();
    if (trimmed) onSave(trimmed);
    else setVal(text);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setVal(text);
            setEditing(false);
          }
        }}
        style={{
          fontFamily: "inherit",
          fontSize: "inherit",
          background: "rgba(255,255,230,0.9)",
          border: "1px solid #b8860b",
          borderRadius: 3,
          padding: "1px 4px",
          width: "100%",
          outline: "none",
          ...style,
        }}
      />
    );
  }

  return (
    <span
      className={className}
      style={{ cursor: "text", ...style }}
      onDoubleClick={() => {
        setEditing(true);
        setVal(text);
      }}
      title="Double-click to edit"
    >
      {text}
    </span>
  );
}

function AddItemRow({ onAdd, placeholder = "Add item..." }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const submit = () => {
    const trimmed = val.trim();
    if (trimmed) {
      onAdd(trimmed);
      setVal("");
      setOpen(false);
    }
  };

  if (!open) {
    return (
      <button
        className="no-print"
        onClick={() => setOpen(true)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#c0a060",
          fontFamily: "'Caveat', cursive",
          fontSize: 15,
          padding: "2px 0",
          display: "flex",
          alignItems: "center",
          gap: 4,
          opacity: 0.7,
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> {placeholder}
      </button>
    );
  }

  return (
    <div className="no-print" style={{ display: "flex", gap: 4, alignItems: "center" }}>
      <input
        ref={inputRef}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") {
            setVal("");
            setOpen(false);
          }
        }}
        style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 16,
          background: "rgba(255,255,230,0.8)",
          border: "none",
          borderBottom: "1px dashed #b8860b",
          outline: "none",
          flex: 1,
          padding: "2px 4px",
          color: "#3a2a10",
        }}
      />
      <button
        onClick={submit}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#5a8a5a",
          fontSize: 18,
        }}
      >
        ✓
      </button>
      <button
        onClick={() => {
          setVal("");
          setOpen(false);
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#a06060",
          fontSize: 16,
        }}
      >
        ✕
      </button>
    </div>
  );
}

function TodoItem({ item, depth = 0, onCheck, onDelete, onRename, onAddChild }) {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const indentColors = ["#4a7ab5", "#7a5ab5", "#5ab57a", "#b57a5a", "#5ab5b5"];
  const bulletColor = indentColors[depth % indentColors.length];

  const bulletChar = depth === 0 ? "◆" : depth === 1 ? "◇" : depth === 2 ? "•" : "–";

  return (
    <div style={{ marginLeft: depth > 0 ? 20 : 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 6,
          padding: "5px 0 5px 4px",
          borderBottom: "1px solid rgba(100,140,200,0.25)",
          minHeight: 32,
          position: "relative",
        }}
      >
        {hasChildren && (
          <button
            className="no-print"
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#8a8a8a",
              fontSize: 10,
              padding: 0,
              marginTop: 4,
              width: 12,
              flexShrink: 0,
            }}
          >
            {collapsed ? "▶" : "▼"}
          </button>
        )}
        {!hasChildren && <span style={{ width: 12, flexShrink: 0 }} />}

        <input
          type="checkbox"
          checked={item.checked}
          onChange={() => onCheck(item.id)}
          style={{
            marginTop: 4,
            cursor: "pointer",
            accentColor: bulletColor,
            flexShrink: 0,
          }}
        />

        <span
          style={{
            color: bulletColor,
            fontSize: depth === 0 ? 13 : 11,
            marginTop: 4,
            flexShrink: 0,
          }}
        >
          {bulletChar}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <EditableText
            text={item.text}
            onSave={(newText) => onRename(item.id, newText)}
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: depth === 0 ? 20 : depth === 1 ? 17 : 15,
              fontWeight: depth === 0 ? "bold" : "normal",
              color: item.checked ? "#a09080" : "#3a2a10",
              textDecoration: item.checked ? "line-through" : "none",
              display: "block",
              lineHeight: 1.3,
            }}
          />
          {!collapsed && (
            <AddItemRow
              onAdd={(text) => onAddChild(item.id, text)}
              placeholder={`Add sub-item to "${item.text.slice(0, 20)}..."`}
            />
          )}
        </div>

        <button
          className="no-print"
          onClick={() => onDelete(item.id)}
          title="Delete"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#c8a0a0",
            fontSize: 14,
            opacity: 0.5,
            flexShrink: 0,
            marginTop: 2,
          }}
          onMouseEnter={(e) => (e.target.style.opacity = 1)}
          onMouseLeave={(e) => (e.target.style.opacity = 0.5)}
        >
          🗑
        </button>
      </div>

      {!collapsed && hasChildren && (
        <div>
          {item.children.map((child) => (
            <TodoItem
              key={child.id}
              item={child}
              depth={depth + 1}
              onCheck={onCheck}
              onDelete={onDelete}
              onRename={onRename}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [lists, setLists] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLists(JSON.parse(raw));
      else setLists(deepClone(initialData));
    } catch {
      setLists(deepClone(initialData));
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever lists change
  useEffect(() => {
    if (lists === null) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 1500);
      return () => clearTimeout(t);
    } catch (e) {
      console.error("Save failed", e);
    }
  }, [lists]);

  const handleCheck = (id) => {
    setLists((prev) => findAndUpdate(prev, id, (item) => ({ ...item, checked: !item.checked })));
  };

  const handleDelete = (id) => {
    setLists((prev) => findAndDelete(prev, id));
  };

  const handleRename = (id, text) => {
    setLists((prev) => findAndUpdate(prev, id, (item) => ({ ...item, text })));
  };

  const handleAddChild = (parentId, text) => {
    setLists((prev) =>
      findAndAddChild(prev, parentId, { id: generateId(), text, checked: false, children: [] })
    );
  };

  const handleAddCategory = (text) => {
    setLists((prev) => [...prev, { id: generateId(), text, checked: false, children: [] }]);
  };

  const totalItems = lists ? lists.reduce((acc, cat) => acc + 1 + countDescendants(cat), 0) : 0;
  const checkedItems = lists
    ? (() => {
        let count = 0;
        const walk = (items) =>
          items.forEach((i) => {
            if (i.checked) count++;
            walk(i.children);
          });
        walk(lists);
        return count;
      })()
    : 0;

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "'Caveat', cursive",
          fontSize: 24,
          color: "#8a7a60",
        }}
      >
        Loading your lists...
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Lora:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #c8b89a; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #e8d8c0; }
        ::-webkit-scrollbar-thumb { background: #b8a880; border-radius: 3px; }

        @media print {
          body { background: #ffffff !important; }
          * { box-shadow: none !important; text-shadow: none !important; }
          .no-print { display: none !important; }
          .print-root { padding: 0 !important; background: #fff !important; }
          .print-notebook { max-width: none !important; margin: 0 !important; border-radius: 0 !important; }
          .print-content { margin-left: 0 !important; padding-left: 0 !important; padding-right: 0 !important; }
          .print-notebook, .print-notebook * { color: #000 !important; }
        }
      `}</style>

      <div
        className="print-root"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #c8b89a 0%, #b8a880 50%, #c8b89a 100%)",
          padding: "20px 16px",
          fontFamily: "'Caveat', cursive",
        }}
      >
        <div
          className="print-notebook"
          style={{
            maxWidth: 680,
            margin: "0 auto",
            background: "#fef9f0",
            borderRadius: 4,
            boxShadow:
              "4px 4px 0 #8a7a60, 8px 8px 0 #7a6a50, -2px 0 8px rgba(0,0,0,0.2), 0 2px 20px rgba(0,0,0,0.3)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            className="no-print"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 32,
              height: "100%",
              background: "#e8d8c0",
              borderRight: "2px solid #c8b890",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 24,
              gap: 28,
              zIndex: 2,
            }}
          >
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "#b8a870",
                  border: "2px solid #8a7a50",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)",
                  flexShrink: 0,
                }}
              />
            ))}
          </div>

          <div
            className="no-print"
            style={{
              position: "absolute",
              top: 0,
              left: 68,
              width: 2,
              height: "100%",
              background: "rgba(200,80,80,0.35)",
              zIndex: 1,
            }}
          />

          <div className="print-content" style={{ marginLeft: 32, paddingLeft: 44, paddingRight: 16, paddingBottom: 32 }}>
            <div
              style={{
                borderBottom: "2px solid rgba(100,140,200,0.4)",
                paddingTop: 20,
                paddingBottom: 12,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div>
                  <h1
                    style={{
                      fontFamily: "'Caveat', cursive",
                      fontSize: 34,
                      fontWeight: 700,
                      color: "#3a2a10",
                      lineHeight: 1,
                      marginBottom: 2,
                    }}
                  >
                    My To-Do Lists
                  </h1>
                  <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 13, color: "#8a7a60" }}>
                    Double-click any item to rename it
                  </p>
                </div>

                <div className="no-print" style={{ textAlign: "right" }}>
                  <button
                    onClick={() => window.print()}
                    style={{
                      fontFamily: "'Lora', serif",
                      fontSize: 12,
                      cursor: "pointer",
                      background: "rgba(255,255,255,0.6)",
                      border: "1px solid rgba(120,100,70,0.35)",
                      borderRadius: 6,
                      padding: "4px 8px",
                      color: "#3a2a10",
                      marginBottom: 6,
                    }}
                  >
                    Print
                  </button>

                  <div style={{ fontFamily: "'Lora', serif", fontSize: 12, color: "#8a7a60" }}>
                    {checkedItems} / {totalItems} done
                  </div>
                  <div
                    style={{
                      width: 120,
                      height: 6,
                      background: "#e0d0b8",
                      borderRadius: 3,
                      overflow: "hidden",
                      marginTop: 3,
                    }}
                  >
                    <div
                      style={{
                        width: totalItems ? `${(checkedItems / totalItems) * 100}%` : "0%",
                        height: "100%",
                        background: "linear-gradient(90deg, #5a8a5a, #7ab57a)",
                        borderRadius: 3,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                  {saved && (
                    <div style={{ fontSize: 11, color: "#5a8a5a", marginTop: 2, fontFamily: "'Lora', serif" }}>
                      ✓ Saved
                    </div>
                  )}
                </div>
              </div>
            </div>

            {lists.map((category) => (
              <div key={category.id} style={{ marginBottom: 8 }}>
                <TodoItem
                  item={category}
                  depth={0}
                  onCheck={handleCheck}
                  onDelete={handleDelete}
                  onRename={handleRename}
                  onAddChild={handleAddChild}
                />
              </div>
            ))}

            <div
              style={{
                marginTop: 16,
                paddingTop: 12,
                borderTop: "2px solid rgba(100,140,200,0.3)",
              }}
            >
              <AddItemRow onAdd={handleAddCategory} placeholder="Add new category..." />
            </div>
          </div>
        </div>

        <p
          className="no-print"
          style={{
            textAlign: "center",
            marginTop: 12,
            fontFamily: "'Lora', serif",
            fontStyle: "italic",
            fontSize: 12,
            color: "#8a7060",
            opacity: 0.7,
          }}
        >
          Your lists are saved automatically ☁
        </p>
      </div>
    </>
  );
}