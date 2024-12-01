import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import { Icon, divIcon } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useState, useEffect } from "react";
import axios from "axios";

// Create axios instance with default config
const axiosInstance = axios.create({
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
  const [data, setData] = useState([]);
  const [wqdata, setWQData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState([43.4723, -80.5449]);
  const [zoom, setZoom] = useState(5);

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

  const customIcon = new Icon({
    iconUrl: "assets/orangecircle.svg",
    iconSize: [16, 16],
    iconAnchor: [0, 0],
    popupAnchor: [0, -10],
  });

  const customIcon1 = new Icon({
    iconUrl: "assets/bluecircle.svg",
    iconSize: [16, 16],
    iconAnchor: [0, 0],
    popupAnchor: [0, -10],
  });

  const createClusterCustomIcon = function (cluster) {
    return divIcon({
      html: `<div>${cluster.getChildCount()}</div>`,
      className: "custom-marker-cluster",
      iconSize: [40, 40],
    });
  };

  const createClusterCustomIcon1 = function (cluster) {
    return divIcon({
      html: `<div>${cluster.getChildCount()}</div>`,
      className: "custom-marker-cluster-1",
      iconSize: [40, 40],
    });
  };

  const HandleClick = (latitude, longitude, e) => {
    setCoords([latitude, longitude]); // Update coords to center the map
    setZoom(12); // Update zoom level
  };

  return (
    <div className="">
      {!loading ? (
        <MapContainer center={coords} zoom={zoom} className="">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <SetViewOnClick coords={coords} zoom={zoom} />
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={300}
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
                }}
              >
                <Popup>
                  <div className="text-black font-semibold">
                    <Link
                      to={"/dis-data/"+d.stationNo}
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
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>

          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={200}
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
                }}
              >
                <Popup>
                  <div className="text-black font-semibold">
                    <Link
                      to={"/wq/"+d.locationId}
                      className="text-blue-500 underline cursor-pointer"
                    >
                      {" "}
                      {d.name}
                    </Link>
                    <br /> DOI :{" "}
                    <Link
                      to={"/wqs/"+ d.doi.slice(9)}
                      className="text-blue-500 underline cursor-pointer"
                    >
                      {" "}
                      {d.doi}
                    </Link>
                    <br /> ID: {d.locationId}
                    <br /> Monitoring Location Type : {d.monitoringLocationType}
                    <br /> Latitude : {d.latitude.toFixed(4)}
                    <br /> Longitude : {d.longitude.toFixed(4)}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      ) : (
        <div>{error ? error : "Loading..."}</div>
      )}
    </div>
  );
}
