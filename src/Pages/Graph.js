import React, { useEffect, useState } from "react";
import LineChart from "../components/LineChart";
import ViolinChart from "../components/ViolinChart";
import BoxPlot from "../components/BoxPlot";
import TypeCard from "../components/TypeCard";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

const Graph = () => {
  const [graph1, setGraph1] = useState(null);
  const [graph2, setGraph2] = useState(null);
  const [url1, setUrl1] = useState("");
  const [url2, setUrl2] = useState("");
  const [data, setData] = useState(null);
  const [data2, setData2] = useState(null);
  const [loading1, setLoading1] = useState(false);
  const [error1, setError1] = useState(null);
  const [loading2, setLoading2] = useState(false);
  const [error2, setError2] = useState(null);
  const [menu, setMenu] = useState(true);

  const buildUrl = (graph) => {
    if (!graph) return "";

    const {
      graph: graphType,
      wqStation,
      disStation,
      characteristic,
      load,
    } = graph;

    switch (graphType) {
      case "Load Estimation":
        return load
          ? `load-calculation?nutrients=` + encodeURIComponent(load)
          : "";
      case "Hydrograph":
        return wqStation && disStation && characteristic ? "" : "";
      case "Discharge Gap - Line Graph":
        return disStation ? `/discharge-gap-data/${disStation}` : "";
      case "Discharge - Line Graph":
      case "Discharge - Box Plot":
      case "Discharge - Violin Chart":
        return disStation ? `/discharge-data/${disStation}` : "";
      case "Water Quality - Box Plot":
      case "Water Quality - Scatter Plot":
        return wqStation && characteristic
          ? `/wq-data/${wqStation}?nutrients=${characteristic}`
          : "";
      default:
        return "";
    }
  };

  useEffect(() => {
    setUrl1(buildUrl(graph1));
  }, [graph1]);

  useEffect(() => {
    setUrl2(buildUrl(graph2));
  }, [graph2]);

  useEffect(() => {
    const fetchData = async () => {
      if (url1 === "") return;

      setLoading1(true);
      try {
        const response = await axiosInstance.get(url1, {
          headers: {
            Accept: "application/json",
          },
        });
        if (response.data) {
          setData(response.data);
          setError1(null);
        } else {
          throw new Error("No data available for the selected range.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError1(err.message);
        setData(null);
      } finally {
        setLoading1(false);
      }
    };
    fetchData();
  }, [url1]);

  useEffect(() => {
    const fetchData = async () => {
      if (url2 === "") return;

      setLoading2(true);
      try {
        const response = await axiosInstance.get(url2, {
          headers: {
            Accept: "application/json",
          },
        });
        if (response.data) {
          setData2(response.data);
          setError2(null);
        } else {
          throw new Error("No data available for the selected range.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError2(err.message);
        setData2(null);
      } finally {
        setLoading2(false);
      }
    };
    fetchData();
  }, [url2]);

  const renderGraph = (graphType, data) => {
    switch (graphType.graph) {
      case "Load Estimation":
        return (
          <LineChart
            data={data}
            width={1300}
            height={450}
            xLabel={"Date"}
            yLabel={"Flux"}
            title={`Flux graph for Saskatchewan River at Grand Rapids`}
            startDate={`${graphType.startDate}-01-01`}
            endDate={`${graphType.endDate}2013-01-01`}
          />
        );

      case "Hydrograph":
        return <div></div>;

      case "Discharge Gap - Line Graph":
        return (
          <LineChart
            data={data}
            width={1200}
            height={450}
            xLabel={"Date"}
            yLabel={"Discharge"}
            title={`Discharge Gap for ${graphType.disStation}`}
          />
        );

      case "Discharge - Line Graph":
        return (
          <LineChart
            data={data}
            width={1300}
            height={450}
            xLabel={"Date"}
            yLabel={"Discharge"}
            title={`Discharge Graph for ${graphType.disStation}`}
            startDate={"2000-01-01"}
            endDate={"2001-01-01"}
          />
        );

      case "Discharge - Box Plot":
        return (
          <BoxPlot
            data={data}
            width={1300}
            height={450}
            xLabel={"Year"}
            yLabel={"Discharge"}
            title={`Discharge Graph for ${graphType.disStation}`}
            startDate={"2000-01-01"}
            endDate={"2005-12-31"}
          />
        );

      case "Discharge - Violin Chart":
        return (
          <ViolinChart
            data={data}
            width={1300}
            height={450}
            xLabel={"Year"}
            yLabel={"Discharge"}
            title={`Discharge Graph for ${graphType.disStation}`}
          />
        );

      case "Water Quality - Box Plot":
        return (
          <BoxPlot
            data={data}
            width={1300}
            height={450}
            xLabel={"Year"}
            yLabel={"Values"}
            title={`WQ graph for ${graphType.wqStation}: ${graphType.characteristic}`}
            startDate={"2000-01-01"}
            endDate={"2005-12-31"}
          />
        );

      case "Water Quality - Scatter Plot":
        return <div></div>;

      default:
        return <div></div>;
    }
  };

  const handleGraph1Click = (value) => setGraph1(value);
  const handleGraph2Click = (value) => setGraph2(value);

  return (
    <div className="flex w-full h-screen">
      <div
        className="w-1/5 bg-slate-500 p-5 border-black border-r-2"
        style={{ display: !menu ? "none" : "" }}
      >
        <button onClick={() => setMenu(false)}>Collapse</button>
        <div className="mt-5">
          <div>Graph 1</div>
          <TypeCard onGenerate={handleGraph1Click} />
        </div>
        <div className="mt-20">
          <div>
            <div>Graph 2</div>
            <TypeCard onGenerate={handleGraph2Click} />
          </div>
        </div>
      </div>
      <div className="py-5 px-5" style={{ display: menu ? "none" : "" }}>
        <button onClick={() => setMenu(true)}>expand</button>
      </div>

      <div className="flex-1">
        {loading1 && <div>Loading...</div>}
        {error1 && <div>Error: {error1}</div>}
        {graph1 && !loading1 && data && renderGraph(graph1, data)}
        <div className="mt-0">
          {loading2 && <div>Loading...</div>}
          {error2 && <div>Error: {error2}</div>}
          {graph2 && !loading2 && data2 && renderGraph(graph2, data2)}
        </div>
      </div>
    </div>
  );
};

export default Graph;
