const Home = () => {
  return (
    <div className="container mx-auto gap-4 p-20  bg-slate-200  ">
      <p className="text-2xl">About Clawave</p>
      <p>
        CLAWAVE is a visualization toolkit developed to transform water quality
        monitoring and decision-making within Canada and beyond, It utilizes
        both historical and newly gathered water quality data to streamline
        processes for watershed managers, thus expediting the transfer of water
        quality knowledge into actionable strategies. This prototype is designed
        to demonstrate its robust capabilities in various assessing nutrient
        loads in Lake Winnipeg. Additionally, CLAWAVE’s advanced storytelling
        and visualization features are engineered to make water quality data
        more accessible and interpretable for all stakeholders, enhancing
        community involvement and empowering especially Indigenous communities
        to take a more active role in managing their water resources
        effectively.
      </p>
      <br />
      <p> Current Version 1.1</p>
      <p>Things to come in next versions: </p>
      <ul className="list-disc list-inside">
        <li>Comparision between stations</li>
        <li>testing Automation integration of data from currnet sources</li>
      </ul>
    </div>
  );
};
export default Home;
