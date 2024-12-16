import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link, useSearchParams } from "react-router-dom";
import { Icon, divIcon } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@mui/material";
import CustomSelect from "../components/Select";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

// Create axios instance with default config
const axiosInstance = axios.create({
  //baseURL: "https://api-jemx.onrender.com",
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

// Helper component to update the map view
function SetViewOnClick({ coords, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, zoom); // Update map view when coords or zoom change
  }, [coords, zoom, map]);
  return null;
}

export default function Mapa() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [wqdata, setWQData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState([
    parseFloat(searchParams.get("lat")) || 43.4723,
    parseFloat(searchParams.get("long")) || -80.5449,
  ]);
  const [zoom, setZoom] = useState(parseInt(searchParams.get("zoom")) || 5);
  const [list, setList] = useState([]);
  const [search, setSearch] = useState(null);
  const [checkedItems, setCheckedItems] = useState({
    Discharge_Stations: true,
    WQ_Stations: true,
    Load: false,
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          "/lw-discharge-station-data?",
          {
            headers: {
              Accept: "application/json",
            },
          }
        );
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    const fetchDatawq = async () => {
      try {
        const response = await axiosInstance.get("/wqs-data?hub=lakewinnipeg", {
          headers: {
            Accept: "application/json",
          },
        });
        setWQData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
    fetchDatawq();
  }, []);
  useEffect(() => {
    const makeList = async () => {
      if (wqdata.length > 0) {
        let temp = [];
        wqdata.map((value) => {
          temp.push({
            name: value.name + " - " + value.locationId + " wq",
            id: value.locationId,
            latitude: value.latitude,
            longitude: value.longitude,
          });
        });
        data.map((value) => {
          temp.push({
            name: value.stationName + " - " + value.stationNo + " dis",
            id: value.stationNo,
            latitude: value.latitude,
            longitude: value.longitude,
          });
        });
        console.log(temp);
        setList(temp);
      }
    };
    makeList();
  }, [data, wqdata]);
  useEffect(() => {
    const getCoords = () => {
      if (search === null) return;
      if (search.name.substring(search.name.length - 1) === "q") {
        setCoords([search.latitude, search.longitude]);
      }
      if (search.name.substring(search.name.length - 1) === "s") {
        setCoords([search.latitude, search.longitude]);
      }
    };
    getCoords();
  }, [search]);

  const customIcon = new Icon({
    iconUrl: "assets/orangecircle.svg",
    iconSize: [20, 20],
    iconAnchor: [0, 0],
    popupAnchor: [0, -10],
  });

  const customIcon1 = new Icon({
    iconUrl: "assets/bluecircle.svg",
    iconSize: [20, 20],
    iconAnchor: [0, 0],
    popupAnchor: [0, -10],
  });

  const createClusterCustomIcon = function (cluster) {
    return divIcon({
      html: `<div>${cluster.getChildCount()}</div>`,
      className: "custom-marker-cluster",
      iconSize: [48, 48],
    });
  };

  const createClusterCustomIcon1 = function (cluster) {
    return divIcon({
      html: `<div>${cluster.getChildCount()}</div>`,
      className: "custom-marker-cluster-1",
      iconSize: [48, 48],
    });
  };

  const HandleClick = (latitude, longitude, e) => {
    setCoords([latitude, longitude]); // Update coords to center the map
    setZoom(15); // Update zoom level
    console.log(checkedItems);
  };
  const handleChange = (event) => {
    setCheckedItems({
      ...checkedItems,
      [event.target.name]: event.target.checked,
    });
  };
  return (
    <div className="">
      {!loading ? (
        <div className="relative w-full">
          <MapContainer center={coords} zoom={zoom} className="">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <SetViewOnClick coords={coords} zoom={zoom} />

            {checkedItems.Discharge_Stations && (
              <MarkerClusterGroup
                chunkedLoading
                maxClusterRadius={150}
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
                iconCreateFunction={createClusterCustomIcon}
              >
                {data.map((d) => (
                  <Marker
                    position={[d.latitude, d.longitude]}
                    icon={customIcon1}
                    key={`data-${d.stationNo}`}
                    eventHandlers={{
                      click: (e) => {
                        HandleClick(d.latitude, d.longitude, e);
                      },
                      mouseover: (e) => {
                        e.target
                          .bindTooltip(
                            d.stationName + ", (" + d.stationNo + ")"
                          )
                          .openTooltip();
                      },
                      mouseout: (e) => {
                        e.target.closeTooltip();
                      },
                    }}
                  >
                    <Popup>
                      <div className="text-black font-semibold text-lg w-80">
                        <Link
                          to={"/dis-data/" + d.stationNo}
                          className="text-blue-500 underline cursor-pointer"
                        >
                          {" "}
                          {d.stationName}
                        </Link>
                        <br /> Station No. : {d.stationNo}
                        <br /> Province : {d.province}
                        <br /> Status : {d.status}
                        <br /> Latitude : {d.latitude.toFixed(4)}
                        <br /> Longitude : {d.longitude.toFixed(4)}
                        <br />
                        <Link
                          to={
                            "/graph?station=" +
                            d.stationName +
                            " - " +
                            d.stationNo +
                            " dis"
                          }
                        >Plot</Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            )}
            {checkedItems.WQ_Stations && (
              <MarkerClusterGroup
                chunkedLoading
                maxClusterRadius={150}
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
                iconCreateFunction={createClusterCustomIcon1}
              >
                {wqdata.map((d) => (
                  <Marker
                    key={`wqdata-${d.locationId}`}
                    position={[d.latitude, d.longitude]}
                    icon={customIcon}
                    eventHandlers={{
                      click: (e) => {
                        HandleClick(d.latitude, d.longitude, e);
                      },
                      mouseover: (e) => {
                        e.target
                          .bindTooltip(d.name + ", (" + d.locationId + ")")
                          .openTooltip();
                      },
                      mouseout: (e) => {
                        e.target.closeTooltip();
                      },
                    }}
                  >
                    <Popup>
                      <div className="text-black text-lg font-semibold w-80">
                        <Link
                          to={"/wq/" + d.locationId}
                          className="text-blue-500 underline cursor-pointer"
                        >
                          {" "}
                          {d.name}
                        </Link>
                        <br /> DOI :{" "}
                        <Link
                          to={"/wqs/" + d.doi.slice(9)}
                          className="text-blue-500 underline cursor-pointer"
                        >
                          {" "}
                          {d.doi}
                        </Link>
                        <br /> ID: {d.locationId}
                        <br /> Monitoring Location Type :{" "}
                        {d.monitoringLocationType}
                        <br /> Latitude : {d.latitude.toFixed(4)}
                        <br /> Longitude : {d.longitude.toFixed(4)}
                        <br />
                        <Link
                          to={
                            "/graph?station=" +
                            d.name +
                            " - " +
                            d.locationId +
                            " wq"
                          }
                        >Plot</Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            )}
          </MapContainer>
          <Card className="absolute top-3 left-20 z-[1000] w-96 p-6 bg-white/90 backdrop-blur-sm shadow-xl">
            <h2 className="text-xl font-bold mb-4">Map Overlay</h2>
            {/*<p>zoom: {zoom}</p>*/}
            <p>Search Bar</p>
            <Autocomplete
              options={list}
              getOptionLabel={(option) => option.name}
              onChange={(event, newValue) => {
                setSearch(newValue);
                console.log(newValue);
                setZoom(15);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Station"
                  variant="outlined"
                />
              )}
              isOptionEqualToValue={(option, value) =>
                option.name === value.name
              }
            />
            <p>Filter Box</p>
            <div>
              <input
                type="checkbox"
                id="Discharge_Stations"
                name="Discharge_Stations"
                checked={checkedItems.Discharge_Stations}
                onChange={handleChange}
              />
              <label htmlFor="Discharge_Stations">Discahrge Stations</label>
            </div>

            <div>
              <input
                type="checkbox"
                id="WQ_Stations"
                name="WQ_Stations"
                checked={checkedItems.WQ_Stations}
                onChange={handleChange}
              />
              <label htmlFor="WQ_Stations">WQ Stations</label>
            </div>

            <div>
              <input
                type="checkbox"
                id="Load"
                name="Load"
                checked={checkedItems.Load}
                onChange={handleChange}
              />
              <label htmlFor="Load">Load</label>
            </div>
          </Card>
        </div>
      ) : (
        <div>{error ? error : "Loading..."}</div>
      )}
    </div>
  );
}
