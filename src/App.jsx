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
  // lists
  const [dynamicList, setDynamicList] = useState(
    JSON.parse(localStorage.getItem("dynamicList")) || initialDynamicList
  );
  const [preArrangedList, setPreArrangedList] = useState(
    JSON.parse(localStorage.getItem("preArrangedList")) || initialPreArrangedList
  );
  const [officersList, setOfficersList] = useState(
    JSON.parse(localStorage.getItem("officersList")) || initialOfficersList
  );

  // last gone trackers for cancel
  const [dynamicLastGone, setDynamicLastGone] = useState(null);
  const [preArrangedLastGone, setPreArrangedLastGone] = useState(null);
  const [officersLastGone, setOfficersLastGone] = useState(null);

  // duties log
  const [dutiesLog, setDutiesLog] = useState(
    JSON.parse(localStorage.getItem("dutiesLog")) || []
  );
  const [showLog, setShowLog] = useState(false);

  // modal & selection state
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedListName, setSelectedListName] = useState(null); // "Dynamic" / "Pre-arranged" / "Officers"
  const [selectedStation, setSelectedStation] = useState(null);
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

  // add to log (max 100)
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

  // open modal by selecting a person (this is called from the Gone button in each list)
  const openStationModalFor = (person, listName) => {
    setSelectedPerson(person);
    setSelectedListName(listName);
    setSelectedStation(null); // reset station selection
    setShowStationModal(true);
  };

  // confirm after selecting station in modal
  const confirmGoneWithStation = () => {
    if (!selectedPerson || !selectedListName || selectedStation == null) return;

    // choose the list and setter based on selectedListName
    let list, setList, setLastGone;
    if (selectedListName === "Dynamic") {
      list = dynamicList;
      setList = setDynamicList;
      setLastGone = setDynamicLastGone;
    } else if (selectedListName === "Pre-arranged") {
      list = preArrangedList;
      setList = setPreArrangedList;
      setLastGone = setPreArrangedLastGone;
    } else {
      list = officersList;
      setList = setOfficersList;
      setLastGone = setOfficersLastGone;
    }

    // find index of selectedPerson by name (safer than object identity)
    const idx = list.findIndex((p) => p.name === selectedPerson.name);
    // save lastGone info for Cancel
    setLastGone({ person: selectedPerson, index: idx });

    // remove the person from their current position and push to back with station info
    const newList = list.filter((p) => p.name !== selectedPerson.name);
    newList.push({
      ...selectedPerson,
      lastGone: new Date().toLocaleString(),
      station: selectedStation,
    });

    setList(newList);
    logDuty("Gone", selectedPerson, selectedListName, selectedStation);

    // close modal + clear selected
    setSelectedPerson(null);
    setSelectedListName(null);
    setSelectedStation(null);
    setShowStationModal(false);
  };

  // cancel last gone (restore to original index, removing any moved instance)
  const cancelLastGone = (list, setList, lastGone, setLastGone, listType) => {
    if (!lastGone) return;
    const { person, index } = lastGone;

    // remove any instance (by name) from list (prevents duplicates)
    const filtered = list.filter((p) => p.name !== person.name);
    // insert original object at recorded index
    const restored = [...filtered];
    restored.splice(index, 0, { ...person, lastGone: null, station: null });
    setList(restored);
    setLastGone(null);
    logDuty("Cancel Last Gone", person, listType);
  };

  // render the queue items
  const renderQueue = (queue, setQueue, lastGoneSetter, listType) =>
    queue.map((person, idx) => (
      <div
        key={person.name + idx}
        className={`flex justify-between items-center p-2 rounded mb-2 ${
          idx === 0 ? "bg-yellow-200" : "bg-gray-100"
        }`}
      >
        <div>
          <strong>{person.name}</strong> ({person.role})
          {person.station && (
            <span className="ml-2 text-blue-600 font-semibold">
              ➝ Station {person.station}
            </span>
          )}
          {person.lastGone && (
            <span className="text-gray-500 ml-2">Last: {person.lastGone}</span>
          )}
        </div>

        <button
          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          onClick={() => openStationModalFor(person, listType)}
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

      {/* Dynamic */}
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

      {/* Pre-arranged */}
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

      {/* Officers */}
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

      {/* Review duties */}
      <div className="text-center mt-6">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2"
          onClick={() => setShowLog(!showLog)}
        >
          {showLog ? "Hide Review Duties" : "Review Duties"}
        </button>
        {showLog && (
          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ml-2"
            onClick={clearHistory}
          >
            Clear History
          </button>
        )}
      </div>

      {/* duties log */}
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

      {/* Station modal */}
      {showStationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-3">Select Station</h3>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {stationNumbers.map((num) => (
                <button
                  key={num}
                  className={`py-2 rounded ${
                    selectedStation === num
                      ? "bg-blue-700 text-white"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                  onClick={() => setSelectedStation(num)}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                className={`flex-1 py-2 rounded ${
                  selectedStation == null
                    ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
                onClick={() => confirmGoneWithStation()}
                disabled={selectedStation == null}
              >
                Confirm
              </button>

              <button
                className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
                onClick={() => {
                  setShowStationModal(false);
                  setSelectedPerson(null);
                  setSelectedListName(null);
                  setSelectedStation(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
