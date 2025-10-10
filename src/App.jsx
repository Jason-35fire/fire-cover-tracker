import React, { useState } from "react";

const stationNumbers = [30, 31, 52, 50, 55, 34, 51, 72, 70, 10, 12];

const initialDynamicList = [
  { name: "Sicknote", role: "driver" },
  { name: "Kink", role: "driver" },
  { name: "The Duke", role: "driver" },
  { name: "German Shepherd", role: "firefighter" },
  { name: "The Recruit", role: "firefighter" },
];

const initialPreArrangedList = [
  { name: "Sicknote", role: "driver" },
  { name: "Kink", role: "driver" },
  { name: "The Duke", role: "driver" },
  { name: "German Shepherd", role: "firefighter" },
  { name: "The Recruit", role: "firefighter" },
];

const initialOfficersList = [
  { name: "Captain", role: "officer" },
  { name: "Tom", role: "officer" },
];

export default function App() {
  const [dynamicList, setDynamicList] = useState(initialDynamicList);
  const [preArrangedList, setPreArrangedList] = useState(initialPreArrangedList);
  const [officersList, setOfficersList] = useState(initialOfficersList);
  const [history, setHistory] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleSend = (person, listType) => {
    setSelectedPerson(person);
    setSelectedList(listType);
  };

  const confirmSend = () => {
    if (!selectedPerson || selectedStation === null) return;

    const timestamp = new Date().toLocaleString();
    const entry = {
      name: selectedPerson.name,
      role: selectedPerson.role,
      station: selectedStation,
      time: timestamp,
      list: selectedList,
      action: "Sent",
    };

    setHistory((prev) => [entry, ...prev].slice(0, 100));

    const updatedPerson = { ...selectedPerson, station: selectedStation, time: timestamp };

    const updateList = (list, setList) => {
      const withoutPerson = list.filter((p) => p.name !== selectedPerson.name);
      setList([...withoutPerson, updatedPerson]);
    };

    if (selectedList === "dynamic") updateList(dynamicList, setDynamicList);
    if (selectedList === "pre") updateList(preArrangedList, setPreArrangedList);
    if (selectedList === "officer") updateList(officersList, setOfficersList);

    setSelectedPerson(null);
    setSelectedStation(null);
    setSelectedList(null);
  };

  const cancelLastGoneForList = (listType) => {
    const lastEntry = history.find((h) => h.list === listType && h.action === "Sent");
    if (!lastEntry) return;

    const cancelEntry = { ...lastEntry, time: new Date().toLocaleString(), action: "Cancelled" };
    setHistory((prev) => [cancelEntry, ...prev].slice(0, 100));

    const restore = (initialList, setList) => {
      const without = (list) => list.filter((p) => p.name !== lastEntry.name);
      const original = initialList.find((p) => p.name === lastEntry.name);
      if (original) setList((prev) => [original, ...without(prev)]);
    };

    if (listType === "dynamic") restore(initialDynamicList, setDynamicList);
    if (listType === "pre") restore(initialPreArrangedList, setPreArrangedList);
    if (listType === "officer") restore(initialOfficersList, setOfficersList);
  };

  const renderList = (list, listType, color) => (
    <div className={`p-4 rounded-lg shadow mb-4 ${color}`}>
      <h2 className="text-xl font-bold mb-2">
        {listType === "dynamic"
          ? "Dynamic List"
          : listType === "pre"
          ? "Pre Arranged List"
          : "Officers List"}
      </h2>
      <p className="text-sm text-gray-700 mb-2">
        <strong>Last Gone:</strong>{" "}
        {(() => {
          const last = history.find((h) => h.list === listType && h.action === "Sent");
          return last ? `${last.name} to Station ${last.station}` : "No one yet";
        })()}
      </p>
      <ul>
        {list.map((person, idx) => (
          <li
            key={idx}
            className="flex justify-between items-center p-2 border-b last:border-0 bg-white rounded mb-1"
          >
            <div>
              <span className="font-semibold">{person.name}</span>{" "}
              <span className="text-gray-500 text-sm">({person.role})</span>
              {person.station && person.time && (
                <span className="ml-2 text-sm text-gray-700">
                  {person.time} | Station {person.station}
                </span>
              )}
            </div>
            <button
              onClick={() => handleSend(person, listType)}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Gone
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => cancelLastGoneForList(listType)}
        className="mt-2 bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
      >
        Cancel Last Gone
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-red-700">
        Rayleigh 35 Outduties
      </h1>

      {/* Station Selection Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-bold mb-3">
              Send {selectedPerson.name} to:
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {stationNumbers.map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedStation(num)}
                  className={`p-2 rounded ${
                    selectedStation === num
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedPerson(null);
                  setSelectedStation(null);
                  setSelectedList(null);
                }}
                className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmSend}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Confirm
              </but
