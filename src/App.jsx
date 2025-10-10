import React, { useState, useEffect } from "react";

const stationNumbers = [30, 31, 52, 50, 55, 34, 51, 72, 70, 10, 12];

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
  const [dynamicList, setDynamicList] = useState(
    JSON.parse(localStorage.getItem("dynamicList")) || initialDynamicList
  );
  const [preArrangedList, setPreArrangedList] = useState(
    JSON.parse(localStorage.getItem("preArrangedList")) || initialPreArrangedList
  );
  const [officersList, setOfficersList] = useState(
    JSON.parse(localStorage.getItem("officersList")) || initialOfficersList
  );

  const [dynamicLastGone, setDynamicLastGone] = useState(null);
  const [preArrangedLastGone, setPreArrangedLastGone] = useState(null);
  const [officersLastGone, setOfficersLastGone] = useState(null);

  const [dutiesLog, setDutiesLog] = useState(
    JSON.parse(localStorage.getItem("dutiesLog")) || []
  );
  const [showLog, setShowLog] = useState(false);

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedSetter, setSelectedSetter] = useState(null);
  const [selectedListName, setSelectedListName] = useState(null);
  const [showStationModal, setShowStationModal] = useState(false);

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

  const logDuty = (action, person, listType, station = null) => {
    const entry = {
      timestamp: new Date().toLocaleString(),
      name: person.name,
      role: person.role,
      action,
      list: listType,
      station,
    };

    setDutiesLog((prev) => {
      const updated = [...prev, entry];
      if (updated.length > 100) updated.shift();
      return updated;
    });
  };

  const confirmGone = (station) => {
    if (!selectedPerson || !selectedList) return;

    const idx = selectedList.indexOf(selectedPerson);
    selectedSetter({ person: selectedPerson, index: idx });

    const newList = selectedList.filter((p) => p !== selectedPerson);
    newList.push({
      ...selectedPerson,
      lastGone: new Date().toLocaleString(),
      station: station,
    });

    if (selectedListName === "Dynamic") setDynamicList(newList);
    else if (selectedListName === "Pre-arranged") setPreArrangedList(newList);
    else setOfficersList(newList);

    logDuty("Gone", selectedPerson, selectedListName, station);
    setSelectedPerson(null);
    setShowStationModal(false);
  };

  const cancelLastGone = (list, setList, lastGone, setLastGone, listType) => {
    if (!lastGone) return;
    const { person, index } = lastGone;
    const filteredList = list.filter((p) => p.name !== person.name);
    filteredList.splice(index, 0, { ...person, lastGone: null, station: null });
    setList(filteredList);
    setLastGone(null);
    logDuty("Cancel Last Gone", person, listType);
  };

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
          {person.station && (
            <span className="ml-2 text-blue-600">
              ➝ Station {person.station}
            </span>
          )}
          {person.lastGone && (
            <span className="text-gray-500 ml-2">
              Last: {person.lastGone}
            </span>
          )}
        </div>
        <button
          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          onClick={() => {
            setSelectedPerson(person);
            setSelectedList(queue);
            setSelectedSetter(lastGoneSetter);
            setSelectedListName(listType);
            setShowStationModal(true);
          }}
        >
          Gone
        </button>
      </div>
    ));

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear the duty history?")) {
      setDutiesLog([]);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Rayleigh 35 Outduties</h1>

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
        {renderQueue(
          preArrangedList,
          setPreArrangedList,
          setPreArrangedLastGone,
          "Pre-arranged"
        )}
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

      {/* ------------------- Review Duties ------------------- */}
      <div className="text-center mt-6">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2"
          onClick={() => setShowLog(!showLog)}
        >
          {showLog ? "Hide Review Duties" : "Review Duties"}
        </button>
        {showLog && (
          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={clearHistory}
          >
            Clear History
          </button>
        )}
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
                    {entry.list}{" "}
                    {entry.station && (
                      <span className="text-blue-600">→ Station {entry.station}</span>
                    )}{" "}
                    — <span className="text-gray-500">{entry.timestamp}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      {/* ------------------- Station Modal ------------------- */}
      {showStationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-3">Select Station</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {stationNumbers.map((num) => (
                <button
                  key={num}
                  className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                  onClick={() => confirmGone(num)}
                >
                  {num}
                </button>
              ))}
            </div>
            <button
              className="bg-gray-400 text-white w-full py-2 rounded hover:bg-gray-500"
              onClick={() => setShowStationModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
