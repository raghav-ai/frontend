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
import { Link } from "react-router-dom";

const axiosInstance = axios.create({
  //baseURL: "https://api-jemx.onrender.com",
  baseURL: "http://localhost:8080",
  withCredentials: true,
});
const TypeCard = ({ onGenerate, ID, selected }) => {
  const [showGraph, setShowGraph] = useState("");
  const [select, setSelect] = useState(null);
  const [showCharacteristic, setShowCharacteristic] = useState("");
  const [showLoad, setShowLoad] = useState("");
  const [Station, setStation] = useState("");
  const [StationName, setStationName] = useState("");
  const [startDate, setStartDate] = useState("2000-01");
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM"));
  const [wqAutoComplete, setWQAutoComplete] = useState("");
  const [disAutoComplete, setDISAutoComplete] = useState("");
  const [temp, setTemp] = useState("Yearly");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);

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
  useEffect(() => {
    const makeList = async () => {
      if (wqAutoComplete !== null && wqAutoComplete.length > 0) {
        let temp = [];
        wqAutoComplete.map((value) => {
          temp.push({
            name: value.name + " - " + value.locationId + " wq",
            id: value.locationId,
            stationName: value.name,
            latitude: value.latitude,
            longitude: value.longitude,
          });
        });
        disAutoComplete.map((value) => {
          temp.push({
            name: value.stationName + " - " + value.stationNo + " dis",
            id: value.stationNo,
            stationName: value.stationName,
            latitude: value.latitude,
            longitude: value.longitude,
          });
        });
        setList(temp);

        // Move getSelect logic here after list is set
        if (selected) {
          const newVal = temp.find((item) => item.name === selected);
          if (newVal) {
            setSelect(newVal);
            setStation(newVal);
          }
        }
      }
    };

    makeList();
  }, [disAutoComplete, wqAutoComplete, selected]);

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
        Station: Station.id,
        characteristic: showCharacteristic,
        load: showLoad,
        startDate: startDate,
        endDate: endDate,
        stationName: StationName,
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
      {select !== null && select !== "" ? (
        <Autocomplete
          key={selected} // Add this to force re-render when selected changes
          value={select}
          options={list || []} // Ensure options is never null
          getOptionLabel={(option) => option?.name || ""}
          onChange={(event, newValue) => {
            setSelect(newValue);
            setStation(newValue);
            setShowGraph("");
            setShowLoad("");
            setShowCharacteristic("");
            setStationName(newValue?.stationName || "");
          }}
          renderInput={(params) => (
            <TextField {...params} label="Select Station" variant="outlined" />
          )}
          isOptionEqualToValue={(option, value) => {
            if (!option || !value) return false;
            return option.name === value.name;
          }}
        />
      ) : (
        <Autocomplete
          options={list}
          getOptionLabel={(option) => option.name}
          onChange={(event, newValue) => {
            setStation(newValue);
            setShowGraph("");
            setShowLoad("");
            setShowCharacteristic("");
            setStationName(newValue?.stationName || "");
          }}
          renderInput={(params) => (
            <TextField {...params} label="Select Station" variant="outlined" />
          )}
          isOptionEqualToValue={(option, value) => option.name === value.name}
        />
      )}

      <div>
        {Station !== null &&
          Station !== "" &&
          Station.name.at(Station.name.length - 1) === "q" && (
            <div>
              <CustomSelect
                placeholder={"Select Graph"}
                ops={["Water Quality vs Time - Box Plot"]}
                style={{ top: "7px", width: "90%", minWidth: "fit-content" }}
                onSelect={HandleGraph}
              />
              <CustomSelect
                placeholder={"Select Characteristic"}
                ops={characteristics}
                style={{ top: "7px", width: "90%", minWidth: "fit-content" }}
                onSelect={HandleCharacteristic}
              />
              <Link
                to={
                  "/map?lat=" +
                  Station.latitude +
                  "&&long=" +
                  Station.longitude +
                  "&&zoom=15"
                }
              >
                View on Map
              </Link>
            </div>
          )}
        {Station !== null &&
          Station !== "" &&
          Station.name.at(Station.name.length - 1) === "s" && (
            <div>
              <CustomSelect
                placeholder={"Select Graph"}
                ops={[
                  "Discharge vs Time - Line Graph",
                  "Discharge vs Time - Box Plot",
                  "Discharge vs Time - Violin Chart",
                ]}
                style={{ top: "7px", width: "90%", minWidth: "fit-content" }}
                onSelect={HandleGraph}
              />
              <Link
                to={
                  "/map?lat=" +
                  Station.latitude +
                  "&&long=" +
                  Station.longitude +
                  "&&zoom=15"
                }
              >
                View on Map
              </Link>
            </div>
          )}
        {Station !== null &&
          Station !== "" &&
          Station.name.at(Station.name.length - 1) === "d" && (
            <div>
              <CustomSelect
                placeholder={"Select Graph"}
                ops={[
                  "Flux Q - Scatter Plot",
                  "Conc Q - Scatter Plot",
                  "Flux vs Time - Line Graph",
                  "Conc vs Time - Line Graph",
                ]}
                style={{ top: "7px", width: "90%", minWidth: "fit-content" }}
                onSelect={HandleGraph}
              />
              <CustomSelect
                placeholder={"Select Characteristic"}
                ops={characteristics}
                style={{ top: "7px", width: "90%", minWidth: "fit-content" }}
                onSelect={HandleLoad}
              />
              <CustomSelect
                placeholder={"Select Model Type"}
                ops={["WRTDS"]}
                style={{ top: "7px", width: "90%", minWidth: "fit-content" }}
                onSelect={HandleLoad}
              />
            </div>
          )}
      </div>

      <div>
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
        {Station !== null && Station !== "" && (
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
