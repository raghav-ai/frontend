import CustomSelect from "./Select";
import { useState, useEffect } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Stack, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});
const TypeCard = ({ onGenerate, ID }) => {
  const [showGraph, setShowGraph] = useState("");
  const [showCharacteristic, setShowCharacteristic] = useState("");
  const [showLoad, setShowLoad] = useState("");
  const [WQStation, setWQStation] = useState("");
  const [DISStation, setDISStation] = useState("");
  const [startDate, setStartDate] = useState("2000-01");
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM"));
  const [wqAutoComplete, setWQAutoComplete] = useState("");
  const [disAutoComplete, setDISAutoComplete] = useState("");
  const [temp, setTemp] = useState("Yearly");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [station,setStation] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/wqs-data?hub=lakewinnipeg", {
          headers: {
            Accept: "application/json",
          },
        });
        if (response.data !== null) {
          setWQAutoComplete(response.data);
          setLoading(false);
        } else if (error !== null) {
          throw "No stations available";
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err);
        setLoading(false);
      }
    };

    const fetchDisData = async () => {
      try {
        const response = await axiosInstance.get("/discharge-station-data?", {
          headers: {
            Accept: "application/json",
          },
        });
        if (response.data) {
          setDISAutoComplete(response.data);
          setLoading(false);
          setError(null);
        } else {
          throw new Error("No Stations found");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDisData();
    fetchData();
  }, [error]);

  const graphs = [
    "Flux Q - Scatter Plot",
    "Conc Q - Scatter Plot",
    "Flux vs Time - Line Graph",
    "Conc vs Time - Line Graph",
    "Discharge vs Time - Line Graph",
    "Discharge vs Time - Box Plot",
    "Discharge vs Time - Violin Chart",
    "Water Quality vs Time - Box Plot",
    //"Water Quality - Scatter Plot"
    //"Hydrograph",
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
    "Saskatchewan River at Grand Rapids - TP - WRTDS",
    "Saskatchewan River at Grand Rapids - TN - WRTDS",
  ];
  const options = [
    { id: "Monthly", label: "Monthly" },
    { id: "Yearly", label: "Yearly" },
    { id: "Seasonal", label: "Seasonal" },
  ];
  const HandleGraph = (value) => {
    setShowGraph(value);
    if (
      showGraph !== "" &&
      (showGraph.at(0) === "F" || showGraph.at(0) === "C") &&
      (value.at(0) === "F" || value.at(0) === "C")
    ) {
    } else if (
      showGraph !== "" &&
      showGraph.at(0) === "W" &&
      value.at(0) === "W"
    ) {
    } else if (
      showGraph !== "" &&
      showGraph.at(0) === "D" &&
      value.at(0) === "D"
    ) {
    } else {
      setShowCharacteristic("");
      setShowLoad("");
      setDISStation("");
      setWQStation("");
    }
  };
  const HandleCharacteristic = (value) => {
    setShowCharacteristic(value);
  };
  const HandleLoad = (value) => {
    switch (value) {
      case "Saskatchewan River at Grand Rapids - TP - WRTDS":
        setShowLoad("Total Phosphorus, mixed forms");
        break;
      case "Saskatchewan River at Grand Rapids - TN - WRTDS":
        setShowLoad("Total Nitrogen, mixed forms");
        break;
      default:
        break;
    }
  };
  const Generate = () => {
    if (showGraph !== "") {
      let newVal = {
        graph: showGraph,
        wqStation: WQStation,
        disStation: DISStation,
        characteristic: showCharacteristic,
        load: showLoad,
        startDate: startDate,
        endDate: endDate,
        stationName: station,
        temporal: temp,
      };
      console.log(newVal);
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
        {showGraph !== "" &&
          (showGraph.at(0) === "F" || showGraph.at(0) === "C") && (
            <div className="mt-5">
              <CustomSelect
                placeholder={"Select Load Estimate"}
                ops={LoadGraphs}
                style={{ top: "7px", width: "80%" }}
                onSelect={HandleLoad}
              />
            </div>
          )}

        {showGraph !== "" && showGraph.at(0) === "D" && (
          <div className="mt-5 w-4/5">
            <Autocomplete
              options={disAutoComplete}
              getOptionLabel={(option) =>
                option.stationName + " - " + option.stationNo
              }
              onChange={(event, newValue) => {
                setDISStation(newValue ? newValue.stationNo : "");
                  setStation(newValue ? newValue.stationName : "");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Station"
                  variant="outlined"
                />
              )}
              isOptionEqualToValue={(option, value) =>
                option.stationNo === value.stationNo
              }
            />
          </div>
        )}
        {showGraph !== "" && showGraph.at(0) === "W" && (
          <div className="mt-5">
            <CustomSelect
              placeholder={"Select Characteristic"}
              ops={characteristics}
              style={{ top: "7px", width: "80%" }}
              onSelect={HandleCharacteristic}
            />
            <div className="mt-5 w-4/5">
              <Autocomplete
                options={wqAutoComplete}
                getOptionLabel={(option) =>
                  option.name + " - " + option.locationId
                }
                onChange={(event, newValue) => {
                  setWQStation(newValue ? newValue.locationId : "");
                  setStation(newValue ? newValue.name : "");
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Station"
                    variant="outlined"
                  />
                )}
                isOptionEqualToValue={(option, value) =>
                  option.locationId === value.locationId
                }
              />
            </div>
          </div>
        )}
        {(showGraph === "Water Quality vs Time - Box Plot" ||
          showGraph === "Discharge vs Time - Box Plot") && (
          <div className="flex-col gap-4 p-2">
            {options.map(({ id, label }) => (
              <label
                key={id}
                className="flex items-center gap-2 cursor-pointer hover:bg-orange-300 p-2 rounded-md"
              >
                <input
                  type="radio"
                  name={"temporal" + ID}
                  id={id}
                  checked={temp === id}
                  onChange={() => setTemp(id)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-black">{label}</span>
              </label>
            ))}
          </div>
        )}
        {showGraph !== "" && (
          <div className="mt-10">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography>From:</Typography>
                <DatePicker
                  views={["month", "year"]}
                  value={dayjs(startDate)}
                  onChange={(newValue) => {
                    if (newValue) setStartDate(newValue.format("YYYY-MM"));
                  }}
                  format="MM/YYYY"
                  slotProps={{
                    textField: {
                      size: "small",
                      placeholder: "YYYY-MM",
                    },
                  }}
                />
                <Typography>To:</Typography>
                <DatePicker
                  views={["year", "month"]}
                  value={dayjs(endDate)}
                  onChange={(newValue) => {
                    if (newValue) setEndDate(newValue.format("YYYY-MM"));
                  }}
                  format="MM/YYYY"
                  slotProps={{
                    textField: {
                      size: "small",
                      placeholder: "YYYY-MM",
                    },
                  }}
                />
              </Stack>
            </LocalizationProvider>

            <div className="w-4/5 flex mt-10 justify-around">
              <button
                className="hover:bg-blue-500 bg-blue-400 rounded-2xl px-2 py-2 font-bold"
                onClick={Generate}
              >
                Generate
              </button>
              <button
                className="hover:bg-red-500 bg-red-400 rounded-2xl px-3 py-2 font-bold"
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
