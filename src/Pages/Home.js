const Home = () => {
  return (
    <div className="container mx-auto gap-4 p-20  bg-slate-200  ">
      <p className="text-2xl">Clawave Prototype</p>

      <p>Overview</p>
      <p>
        Chemical Load Assessments for Watersheds - Automation and Visualization
        Experience (CLAWAVE).
        <br />
        The project is aiming to provide automation, extraction, treatment and visuzalization of
        concentrations, flow chemical loads and related water quality indicators
        in watersheds.
        
      </p>

      <p>The Prototype</p>
      The prototype provides access to Water Quality and discharge data collected from DataStream and ECCC (Hydat database) thorugh tabular and graphical interfaces. 
      It currently uses WRTDS method for load calculations based on matched stations with sufficient data in the lake Winnipeg region. 
      The load calculations are done only on data from the year 2000.

      <p>Partners</p>
      <div>Put Images of the partners</div>

      <p> Current Version 1.1</p>
      <p>Things to come in next versions: </p>
      <ul className="list-disc list-inside">
        <li>Comparision between stations</li>
        <li>Seasonal Graph filter</li>
        <li>Data for more stations</li>
        <li>Automation integration of data from currnet sources</li>
      </ul>
    </div>
  );
};
export default Home;
