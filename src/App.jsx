import React, { useState, useEffect } from "react";

// -------------------------------
// Preloaded staff lists
// -------------------------------
const initialDynamicList = [
  { name: "Sicknote", role: "firefighter" },
  { name: "Kink", role: "driver" },
  { name: "The Duke", role: "firefighter" },
  { name: "German Shepherd Recruit", role: "driver" },
];

const initialPreArrangedList = [
  { name: "Sicknote", role: "firefighter" },
  { name: "Kink", role: "driver" },
  { name: "The Duke", role: "firefighter" },
  { name: "German Shepherd Recruit", role: "driver" },
];

const initialOfficersList = [
  { name: "Captain", role: "officer" },
  { name: "Tom", role: "officer" },
];

function App() {
  // -------------------------------
  // 1️⃣ State for each list
  // -------------------------------
  const [dynamicList, setDynamicList] = useState(
    JSON.parse(localStorage.getItem("dynamicList")) || initialDynamicList
  );
  const [preArrangedList, setPreArrangedList] = useState(
    JSON.parse(localStorage.getItem("preArrangedList")) || initialPreArrangedList
  );
  const [officersList, setOfficersList] = useState(
    JSON.parse(localStorage.getItem("officersList")) || initialOfficersList
  );

  // -------------------------------
  // 2️⃣ Save to local storage
  // -------------------------------
  useEffect(() => {
    localStorage.setItem("dynamicList", JSON.stringify(dynamicList));
  }, [dynamicList]);

  useEffect(() => {
    localStorage.setItem("preArrangedList", JSON.stringify(preArrangedList));
  }, [preArrangedList]);

  useEffect(() => {
    localStorage.setItem("officersList", JSON.stringify(officersList));
  }, [officersList]);

  // -------------------------------
  // 3️⃣ Mark staff as gone (move to back & log date)
  // -------------------------------
  const markGone = (person, list, setList) => {
    const now = new Date().toLocaleString(); // timestamp
    setList(
      list
        .filter((p) => p !== person)
        .concat({ ...person, lastGone: now })
    );
  };

  // -------------------------------
  // 4️⃣ Render a queue
  // -------------------------------
  const renderQueue = (queue, setQueue) =>
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
          onClick={() => markGone(person, queue, setQueue)}
        >
          Gone
        </button>
      </div>
    ));

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Fire Cover Tracker</h1>

      {/* ------------------------------- */}
      {/* Dynamic List */}
      {/* ------------------------------- */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Dynamic List</h2>
        {renderQueue(dynamicList, setDynamicList)}
        <div className="mt-1 text-gray-700">
          Next: <strong>{dynamicList[0]?.name || "None"}</strong>
        </div>
      </section>

      {/* ------------------------------- */}
      {/* Pre-arranged List */}
      {/* ------------------------------- */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Pre-arranged List</h2>
        {renderQueue(preArrangedList, setPreArrangedList)}
        <div className="mt-1 text-gray-700">
          Next: <strong>{preArrangedList[0]?.name || "None"}</strong>
        </div>
      </section>

      {/* ------------------------------- */}
      {/* Officers List */}
      {/* ------------------------------- */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Officers</h2>
        {renderQueue(officersList, setOfficersList)}
        <div className="mt-1 text-gray-700">
          Next: <strong>{officersList[0]?.name || "None"}</strong>
        </div>
      </section>
    </div>
  );
}

export default App;
