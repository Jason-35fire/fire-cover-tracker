import React, { useState, useEffect } from "react";

// ---------------------------------
// Initial staff lists
// ---------------------------------
const initialDynamicList = [
  { name: "Sicknote", role: "firefighter" },
  { name: "Kink", role: "driver" },
  { name: "The Duke", role: "firefighter" },
  { name: "German Shepherd", role: "firefighter" },
  { name: "The Recruit", role: "firefighter" },
];

const initialPreArrangedList = [
  { name: "Sicknote", role: "firefighter" },
  { name: "Kink", role: "driver" },
  { name: "The Duke", role: "firefighter" },
  { name: "German Shepherd", role: "firefighter" },
  { name: "The Recruit", role: "firefighter" },
];

const initialOfficersList = [
  { name: "Captain", role: "officer" },
  { name: "Tom", role: "officer" },
];

function App() {
  // ---------------------------
  // State for lists
  // ---------------------------
  const [dynamicList, setDynamicList] = useState(
    JSON.parse(localStorage.getItem("dynamicList")) || initialDynamicList
  );
  const [preArrangedList, setPreArrangedList] = useState(
    JSON.parse(localStorage.getItem("preArrangedList")) || initialPreArrangedList
  );
  const [officersList, setOfficersList] = useState(
    JSON.parse(localStorage.getItem("officersList")) || initialOfficersList
  );

  // Track last gone for cancel
  const [dynamicLastGone, setDynamicLastGone] = useState(null);
  const [preArrangedLastGone, setPreArrangedLastGone] = useState(null);
  const [officersLastGone, setOfficersLastGone] = useState(null);

  // ---------------------------
  // Duties log
  // ---------------------------
  const [dutiesLog, setDutiesLog] = useState(
    JSON.parse(localStorage.getItem("dutiesLog")) || []
  );
  const [showLog, setShowLog] = useState(false);

  // ---------------------------
  // Save lists and log
  // ---------------------------
  useEffect(() => {
    localStorage.setItem("dynamicList", JSON.stringify(dynamicList));
  }, [dynamicList]);

  useEffect(() => {
    localStorage.setItem("preArrangedList", JSON.stringify(preArrangedList));
  }, [preArrangedList]);

  useEffect(() => {
    localStorage.setItem("officersList", JSON.stringify(officersList));
  }, [officersList]);

  useEffect(() => {
    localStorage.setItem("dutiesLog", JSON.stringify(dutiesLog));
  }, [dutiesLog]);

  // ---------------------------
  // Add entry to duties log (max 100)
  // ---------------------------
  const logDuty = (action, person, listType) => {
    const entry = {
      timestamp: new Date().toLocaleString(),
      name: person.name,
      role: person.role,
      action,
      list: listType,
    };

    setDutiesLog((prev) => {
      const updated = [...prev, entry];
      if (updated.length > 100) updated.shift(); // remove oldest
      return updated;
    });
  };

  // ---------------------------
  // Mark gone
  // ---------------------------
  const markGone = (person, list, setList, setLastGone, listType) => {
    const idx = list.indexOf(person);
    setLastGone({ person, index: idx });
    const newList = list.filter((p) => p !== person);
    newList.push({ ...person, lastGone: new Date().toLocaleString() });
    setList(newList);
    logDuty("Gone", person, listType);
  };

  // ---------------------------
  // Cancel last gone
  // ---------------------------
  const cancelLastGone = (list, setList, lastGone, setLastGone, listType) => {
    if (!lastGone) return;
    const { person, index } = lastGone;

    // Remove from back (where it was moved)
    const filteredList = list.filter((p) => p.name !== person.name);

    // Restore original position
    filteredList.splice(index, 0, { ...person, lastGone: null });
    setList(filteredList);
    setLastGone(null);
    logDuty("Cancel Last Gone", person, listType);
  };

  // ---------------------------
  // Render queue component
  // ---------------------------
  const renderQueue = (queue, setQueue, lastGoneSetter, listType) =>
    queue.map((person, idx) => (
      <div
        key={idx}
        className={`flex justify-between items-center p-2 rounded mb-2 ${
          idx === 0 ? "bg-yellow-200" : "bg-gray-100"
        }`}
      >
        <div>
          <strong>{person.name}</strong> ({person.role})
          {person.lastGone && (
            <span className="text-gray-500 ml-2">
              Last: {person.lastGone}
            </span>
          )}
        </div>
        <button
          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          onClick={() => markGone(person, queue, setQueue, lastGoneSetter, listType)}
        >
          Gone
        </button>
      </div>
    ));

  // ---------------------------
  // Main UI
  // ---------------------------
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🚒 Fire Cover Tracker</h1>

      {/* ------------------- Dynamic List ------------------- */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Dynamic List</h2>
        {renderQueue(dynamicList, setDynamicList, setDynamicLastGone, "Dynamic")}
        <div className="mt-1 text-gray-700">
          Next: <strong>{dynamicList[0]?.name || "None"}</strong>
        </div>
        <button
          className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          onClick={() =>
            cancelLastGone(
              dynamicList,
              setDynamicList,
              dynamicLastGone,
              setDynamicLastGone,
              "Dynamic"
            )
          }
          disabled={!dynamicLastGone}
        >
          Cancel Last Gone
        </button>
      </section>

      {/* ------------------- Pre-arranged List ------------------- */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Pre-arranged List</h2>
        {renderQueue(preArrangedList, setPreArrangedList, setPreArrangedLastGone, "Pre-arranged")}
        <div className="mt-1 text-gray-700">
          Next: <strong>{preArrangedList[0]?.name || "None"}</strong>
        </div>
        <button
          className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          onClick={() =>
            cancelLastGone(
              preArrangedList,
              setPreArrangedList,
              preArrangedLastGone,
              setPreArrangedLastGone,
              "Pre-arranged"
            )
          }
          disabled={!preArrangedLastGone}
        >
          Cancel Last Gone
        </button>
      </section>

      {/* ------------------- Officers List ------------------- */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Officers</h2>
        {renderQueue(officersList, setOfficersList, setOfficersLastGone, "Officers")}
        <div className="mt-1 text-gray-700">
          Next: <strong>{officersList[0]?.name || "None"}</strong>
        </div>
        <button
          className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          onClick={() =>
            cancelLastGone(
              officersList,
              setOfficersList,
              officersLastGone,
              setOfficersLastGone,
              "Officers"
            )
          }
          disabled={!officersLastGone}
        >
          Cancel Last Gone
        </button>
      </section>

      {/* ------------------- Review Duties Button ------------------- */}
      <div className="text-center mt-6">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => setShowLog(!showLog)}
        >
          {showLog ? "Hide Review Duties" : "Review Duties"}
        </button>
      </div>

      {/* ------------------- Duties Log ------------------- */}
      {showLog && (
        <div className="mt-4 bg-gray-50 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Duty History (last 100)</h3>
          {dutiesLog.length === 0 ? (
            <p className="text-gray-500">No actions recorded yet.</p>
          ) : (
            <ul className="max-h-60 overflow-y-auto text-sm">
              {dutiesLog
                .slice()
                .reverse()
                .map((entry, idx) => (
                  <li key={idx} className="mb-1">
                    <strong>{entry.name}</strong> ({entry.role}) — {entry.action} in{" "}
                    {entry.list} — <span className="text-gray-500">{entry.timestamp}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
