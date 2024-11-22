import CustomSelect from "./Select";
import { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Stack, Typography } from "@mui/material";
const TypeCard = ({ onGenerate }) => {
  const [showGraph, setShowGraph] = useState("");
  const [showCharacteristic, setShowCharacteristic] = useState("");
  const [showLoad, setShowLoad] = useState("");
  const [WQStation, setWQStation] = useState("");
  const [DISStation, setDISStation] = useState("");
  const [startDate, setStartDate] = useState("2000");
  const [endDate, setEndDate] = useState(dayjs().format("YYYY"));
  const graphs = [
    "Load Estimation",
    //"Hydrograph",
    "Discharge Gap - Line Graph",
    "Discharge - Line Graph",
    "Discharge - Box Plot",
    "Discharge - Violin Chart",
    "Water Quality - Box Plot",
    //"Water Quality - Scatter Plot",
  ];
  const characteristics = [
    "Ammonia",
    "Chloride",
    "Nitrate",
    "Nitrite",
    "Total carbon",
    "Total Nitrogen, mixed forms",
    "Total Phosphorus, mixed forms",
  ];
  const LoadGraphs = [
    "Total Phosphorus, mixed forms",
    "Total Nitrogen, mixed forms",
  ];
  const HandleGraph = (value) => {
    setShowGraph(value);
  };
  const HandleCharacteristic = (value) => {
    setShowCharacteristic(value);
  };
  const HandleLoad = (value) => {
    setShowLoad(value);
  };
  const Generate = () => {
    if (showGraph !== "") {
      let newVal = {
        graph: showGraph,
        wqStation: WQStation,
        disStation: DISStation,
        characteristic: showCharacteristic,
        load: showLoad,
        startDate:startDate,
        endDate:endDate
      };
      onGenerate(newVal);
    } else {
      return;
    }
  };
  const Clear = () => {
    onGenerate(null);
  };
  return (
    <div>
      <CustomSelect
        placeholder={"Select Graph"}
        ops={graphs}
        style={{ top: "7px", width: "90%", minWidth: "fit-content" }}
        onSelect={HandleGraph}
      />
      <div>
        {showGraph !== "" ? (
          showGraph.at(0) === "D" ? (
            <div className="mt-5">
              <input
                placeholder="Station No."
                onChange={(e) => setDISStation(e.target.value)}
              />
            </div>
          ) : showGraph.at(0) === "W" ? (
            <div className="mt-5">
              <CustomSelect
                placeholder={"Select Characteristic"}
                ops={characteristics}
                style={{ top: "7px", width: "80%", minWidth: "fit-content" }}
                onSelect={HandleCharacteristic}
              />
              <input
                className="mt-5"
                placeholder="Location Id"
                onChange={(e) => setWQStation(e.target.value)}
              />
            </div>
          ) : showGraph.at(0) === "H" ? (
            <div className="mt-5">
              <CustomSelect
                placeholder={"Select Characteristic"}
                ops={characteristics}
                style={{ top: "7px", width: "80%", minWidth: "fit-content" }}
                onSelect={HandleCharacteristic}
              />
              <div className="mt-5 w-4/5">
                <input
                  placeholder="Station No."
                  onChange={(e) => setDISStation(e.target.value)}
                />
                <input
                  placeholder="Location ID"
                  onChange={(e) => setWQStation(e.target.value)}
                />
              </div>
            </div>
          ) : showGraph.at(0) === "L" ? (
            <div className="mt-5">
              <CustomSelect
                placeholder={"Select Load Estimate"}
                ops={LoadGraphs}
                style={{ top: "7px", width: "80%", minWidth: "fit-content" }}
                onSelect={HandleLoad}
              />
            </div>
          ) : (
            <div></div>
          )
        ) : (
          <div></div>
        )}
        {showGraph !== "" && (
          <div className="mt-10">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography>From:</Typography>
                <DatePicker
                  views={["year"]}
                  value={dayjs(startDate)}
                  onChange={(newValue) => {
                    if (newValue) setStartDate(newValue.format("YYYY"));
                  }}
                  slotProps={{ textField: { size: "small" } }}
                />

                <Typography>To:</Typography>
                <DatePicker
                  views={["year"]}
                  value={dayjs(endDate)}
                  onChange={(newValue) => {
                    if (newValue) setEndDate(newValue.format("YYYY"));
                  }}
                  slotProps={{ textField: { size: "small" } }}
                />
              </Stack>
            </LocalizationProvider>
            <div className="w-4/5 flex mt-10 justify-around">
              <button
                className="hover:bg-blue-500 bg-blue-300 rounded-2xl px-2 py-2 font-bold"
                onClick={Generate}
              >
                Generate
              </button>
              <button
                className="hover:bg-red-500 bg-red-300 rounded-2xl px-3 py-2 font-bold"
                onClick={Clear}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default TypeCard;
