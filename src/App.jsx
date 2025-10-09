import React, { useState, useEffect } from "react";

// Example initial staff
const initialStaff = [
  { name: "Alice", role: "firefighter", type: "dynamic" },
  { name: "Bob", role: "driver", type: "dynamic" },
  { name: "Charlie", role: "officer" },
  { name: "David", role: "firefighter", type: "pre-arranged" },
  { name: "Eve", role: "driver", type: "pre-arranged" },
  { name: "Frank", role: "officer" },
  { name: "Grace", role: "firefighter", type: "dynamic" },
];

function App() {
  // -------------------------------
  // 1️⃣ State: Lists of staff
  // -------------------------------
  const [dynamicList, setDynamicList] = useState(
    JSON.parse(localStorage.getItem("dynamicList")) ||
      initialStaff.filter((p) => p.type === "dynamic")
  );
  const [preArrangedList, setPreArrangedList] = useState(
    JSON.parse(localStorage.getItem("preArrangedList")) ||
      initialStaff.filter((p) => p.type === "pre-arranged")
  );
  const [officersList, setOfficersList] = useState(
    JSON.parse(localStorage.getItem("officersList")) ||
      initialStaff.filter((p) => p.role === "officer")
  );

  // -------------------------------
  // 2️⃣ Save lists to local storage
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
  const markGone = (person) => {
    const now = new Date().toLocaleString(); // change format here if needed
    const updateQueue = (queue, setQueue) =>
      setQueue(
        queue
          .filter((p) => p !== person)
          .concat({ ...person, lastGone: now })
      );

    if (person.role === "officer") updateQueue(officersList, setOfficersList);
    else if (person.type === "dynamic") updateQueue(dynamicList, setDynamicList);
    else updateQueue(preArrangedList, setPreArrangedList);
  };

  // -------------------------------
  // 4️⃣ Toggle between Dynamic ↔ Pre-arranged
  // -------------------------------
  const toggleType = (person) => {
    if (person.type === "dynamic") {
      setDynamicList(dynamicList.filter((p) => p !== person));
      setPreArrangedList([
        ...preArrangedList,
        { ...person, type: "pre-arranged" },
      ]);
    } else if (person.type === "pre-arranged") {
      setPreArrangedList(preArrangedList.filter((p) => p !== person));
      setDynamicList([...dynamicList, { ...person, type: "dynamic" }]);
    }
    // Officers cannot be toggled; add logic here if you want them to switch
  };

  // -------------------------------
  // 5️⃣ Render a queue with optional toggle button
  // Highlight first person in line
  // -------------------------------
  const renderQueue = (queue, allowToggle = false) =>
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
        <div className="flex gap-2">
          {allowToggle && (
            <button
              className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
              onClick={() => toggleType(person)}
            >
              Switch Type
            </button>
          )}
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            onClick={() => markGone(person)}
          >
            Gone
          </button>
        </div>
      </div>
    ));

  // -------------------------------
  // 6️⃣ Form for adding new staff
  // -------------------------------
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("firefighter");
  const [newType, setNewType] = useState("dynamic");
  const [newBadge, setNewBadge] = useState(""); // example extra field

  const addStaff = (e) => {
    e.preventDefault();
    const newPerson = { name: newName, role: newRole };
    if (newRole !== "officer") newPerson.type = newType;
    if (newBadge) newPerson.badge = newBadge;

    if (newRole === "officer") setOfficersList([...officersList, newPerson]);
    else if (newType === "dynamic") setDynamicList([...dynamicList, newPerson]);
    else setPreArrangedList([...preArrangedList, newPerson]);

    setNewName("");
    setNewBadge("");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Fire Cover Tracker
      </h1>

      {/* Add new staff form */}
      <form
        className="mb-6 p-4 bg-gray-50 rounded shadow"
        onSubmit={addStaff}
      >
        <h2 className="text-xl font-semibold mb-2">Add New Staff</h2>
        <input
          className="border p-1 mr-2 rounded w-32"
          type="text"
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <input
          className="border p-1 mr-2 rounded w-32"
          type="text"
          placeholder="Badge Number"
          value={newBadge}
          onChange={(e) => setNewBadge(e.target.value)}
        />
        <select
          className="border p-1 mr-2 rounded"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
        >
          <option value="firefighter">Firefighter</option>
          <option value="driver">Driver</option>
          <option value="officer">Officer</option>
        </select>
        {newRole !== "officer" && (
          <select
            className="border p-1 mr-2 rounded"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          >
            <option value="dynamic">Dynamic</option>
            <option value="pre-arranged">Pre-arranged</option>
          </select>
        )}
        <button
          type="submit"
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        >
          Add
        </button>
      </form>

      {/* Dynamic List */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Dynamic List</h2>
        {renderQueue(dynamicList, true)}
        <div className="mt-1 text-gray-700">
          Next: <strong>{dynamicList[0]?.name || "None"}</strong>
        </div>
      </section>

      {/* Pre-arranged List */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Pre-arranged List</h2>
        {renderQueue(preArrangedList, true)}
        <div className="mt-1 text-gray-700">
          Next: <strong>{preArrangedList[0]?.name || "None"}</strong>
        </div>
      </section>

      {/* Officers List */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Officers</h2>
        {renderQueue(officersList)}
        <div className="mt-1 text-gray-700">
          Next: <strong>{officersList[0]?.name || "None"}</strong>
        </div>
      </section>
    </div>
  );
}

export default App;
