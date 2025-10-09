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
  // 2️⃣ State for last gone (to enable Cancel)
  // -------------------------------
  const [dynamicLastGone, setDynamicLastGone] = useState(null);
  const [preArrangedLastGone, setPreArrangedLastGone] = useState(null);
  const [officersLastGone, setOfficersLastGone] = useState(null);

  // -------------------------------
  // 3️⃣ Save to local storage
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
  // 4️⃣ Mark staff as gone (move to back & log date)
  // -------------------------------
  const markGone = (person, list, setList, setLastGone) => {
    const now = new Date().toLocaleString(); // timestamp
    const idx = list.indexOf(person);
    setLastGone({ person, index: idx }); // save for cancel
    setList(
      list.filter((p) => p !== person).concat({ ...person, lastGone: now })
    );
  };

  // -------------------------------
  // 5️⃣ Cancel last gone (restore to original position)
  // -------------------------------
  const cancelLastGone = (list, setList, lastGone, setLastGone) => {
    if (!lastGone) return;
    const { person, index } = lastGone;
    const newList = [...list];
    newList.splice(index, 0, { ...person }); // restore at original position
    setList(newList);
    setLastGone(null); // clear last gone
  };

  // -------------------------------
  // 6️⃣ Render a queue
  // -------------------------------
  const renderQueue = (queue, setQueue, lastGoneSetter) =>
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
          onClick={() => markGone(person, queue, setQueue, lastGoneSetter)}
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
        {renderQueue(dynamicList, setDynamicList, setDynamicLastGone)}
        <div className="mt-1 text-gray-700">
          Next: <strong>{dynamicList[0]?.name || "None"}</strong>
        </div>
        <button
          className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          onClick={() =>
            cancelLastGone(dynamicList, setDynamicList, dynamicLastGone, setDynamicLastGone)
          }
          disabled={!dynamicLastGone}
        >
          Cancel Last Gone
        </button>
      </section>

      {/* ------------------------------- */}
      {/* Pre-arranged List */}
      {/* ------------------------------- */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Pre-arranged List</h2>
        {renderQueue(preArrangedList, setPreArrangedList, setPreArrangedLastGone)}
        <div className="mt-1 text-gray-700">
          Next: <strong>{preArrangedList[0]?.name || "None"}</strong>
        </div>
        <button
          className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          onClick={() =>
            cancelLastGone(preArrangedList, setPreArrangedList, preArrangedLastGone, setPreArrangedLastGone)
          }
          disabled={!preArrangedLastGone}
        >
          Cancel Last Gone
        </button>
      </section>

      {/* ------------------------------- */}
      {/* Officers List */}
      {/* ------------------------------- */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Officers</h2>
        {renderQueue(officersList, setOfficersList, setOfficersLastGone)}
        <div className="mt-1 text-gray-700">
          Next: <strong>{officersList[0]?.name || "None"}</strong>
        </div>
        <button
          className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          onClick={() =>
            cancelLastGone(officersList, setOfficersList, officersLastGone, setOfficersLastGone)
          }
          disabled={!officersLastGone}
        >
          Cancel Last Gone
        </button>
      </section>
    </div>
  );
}

export default App;

