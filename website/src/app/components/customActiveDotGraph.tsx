'use client';

export const customActiveDotGraph = (props: any) => {
  const widthDiv = document.getElementById("div-acquisitions")?.offsetWidth;
  const heightDiv = document.getElementById("div-acquisitions")?.offsetHeight;
  // console.log(document.getElementById("div-acquisitions")?.offsetWidth);

  // console.log(props);
  const { cx, cy, value, payload } = props;
  // const [isPositionOnTOP, setPositionOnTOP] = useState<boolean>(true);
  // console.log("ordonnée point: "+cy + " |taille div: "+heightDiv);

  const tootlipXCalculate = (): number => {
    // return cx-110
    // console.log(cx);
    if (cx < 110 )
      return 0;
    else if (widthDiv && cx > widthDiv-110)
      return widthDiv -220;
    else
     return cx-110;
  }

  const activeDotXCalculate = (): number => {
    
    // console.log(cx);
    if (cx < 110 )
      return cx-7;
    else if (widthDiv && cx > widthDiv-110)
      return (103+110)-(widthDiv-cx);
    else
     return 103;
  }



  return (
    // <div className="custom-tooltip font-mono text-base bg-gradient-to-tr from-[#c5f8ef]/5 to-[#49aee0]/5 p-3 bg-white/30 shadow-md ring-1 backdrop-blur-sm rounded-xl ring-black/5">
    //     {/* <p className="label relative text-opacity-100">{`${(new Date(payload[0].payload.DateHeureMesure).getHours()<10)?'0':''}${new Date(payload[0].payload.DateHeureMesure).getHours()}:${(new Date(payload[0].payload.DateHeureMesure).getMinutes()<10)?'0':''}${new Date(payload[0].payload.DateHeureMesure).getMinutes()} ${Number(payload[0].value).toFixed(2)}${payload[0].payload.Unite}`}</p> */}
    //     <p className="label relative text-opacity-100">{`${(new Date(payload.DateHeureMesure).getHours()<10)?'0':''}${new Date(payload.DateHeureMesure).getHours()}:${(new Date(payload.DateHeureMesure).getMinutes()<10)?'0':''}${new Date(payload.DateHeureMesure).getMinutes()} ${Number(payload.Valeur).toFixed(2)}${payload.Unite}`}</p>
    //   </div>
    <svg
      x={(tootlipXCalculate()) as unknown as number}
      // x={cx - 110}
      y={cy - 125}
      width="220"
      height="250"
      
      viewBox=" 0 -20 220 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* <rect
        x="13"
        y="40"
        width="28"
        height="28"
        rx="14"
        fill="#58CD91"
        fillOpacity="0.3"
      /> */}
      <foreignObject  width="100%" height="100%" className={`${(cy< (heightDiv??0)*0.22)?'translate-y-11':'-translate-y-20'} -transslate-y-20 overflow-visible fixed z-[99999999999] bg-bdlack`}>
        <div className="m-5 custom-tooltip font-mono text-base bg-gradient-to-tr from-[#c5f8ef]/5 to-[#49aee0]/5 p-3 bg-white/30 shadow-md outline outline-1 backdrop-blur-[7px] rounded-xl outline-black/5">
          {/* <p className="label relative text-opacity-100">{`${(new Date(payload[0].payload.DateHeureMesure).getHours()<10)?'0':''}${new Date(payload[0].payload.DateHeureMesure).getHours()}:${(new Date(payload[0].payload.DateHeureMesure).getMinutes()<10)?'0':''}${new Date(payload[0].payload.DateHeureMesure).getMinutes()} ${Number(payload[0].value).toFixed(2)}${payload[0].payload.Unite}`}</p> */}
            <p className="label relative text-opacity-100">{`${(new Date(payload.DateHeureMesure).getDate()<10)?'0':''}${new Date(payload.DateHeureMesure).getDate()}/${(new Date(payload.DateHeureMesure).getMonth()+1<10)?'0':''}${new Date(payload.DateHeureMesure).getMonth()+1}/${new Date(payload.DateHeureMesure).getFullYear()} ${(new Date(payload.DateHeureMesure).getHours()<10)?'0':''}${new Date(payload.DateHeureMesure).getHours()}:${(new Date(payload.DateHeureMesure).getMinutes()<10)?'0':''}${new Date(payload.DateHeureMesure).getMinutes()}`}</p>
            <p className="label relative text-opacity-100">{`${Number(payload.Valeur).toFixed(2)}${payload.Unite}`}</p>
        </div>

      </foreignObject>
      {/* <path
        d="M25.7929 44.2071L26.5 44.9142L27.2071 44.2071L34.4142 37H40C47.1797 37 53 31.1797 53 24V14C53 6.8203 47.1797 1 40 1H14C6.8203 1 1 6.8203 1 14V24C1 31.1797 6.8203 37 14 37H18.5858L25.7929 44.2071Z"
        fill="#F2F2F2"
        stroke="white"
        strokeWidth="2"
      /> */}
      {/* <text textAnchor="middle" dy={26} dx={27} fontSize={20}>
        {value}
        <p className="label relative text-opacity-100">{`${(new Date(payload.DateHeureMesure).getHours()<10)?'0':''}${new Date(payload.DateHeureMesure).getHours()}:${(new Date(payload.DateHeureMesure).getMinutes()<10)?'0':''}${new Date(payload.DateHeureMesure).getMinutes()} ${Number(payload.Valeur).toFixed(2)}${payload.Unite}`}</p>
      </text> */}
      <rect
        x={(activeDotXCalculate()) as unknown as number}
        // x={103}
        y="32"
        width="14"
        height="14"
        rx="7"
        fill="#FFBD50"
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  );
};