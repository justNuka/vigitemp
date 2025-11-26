'use client'
import { Skeleton } from "@heroui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import CustomTooltip from "./customTooltipGraph";
import { FaRegSnowflake } from "react-icons/fa";
import { TiHomeOutline } from "react-icons/ti";
import { CgSmartHomeRefrigerator } from "react-icons/cg";
import { TbWashTemperature1 } from "react-icons/tb";
import { PiOven, PiThermometerHotFill } from "react-icons/pi";
import { EtuveIcon } from "./svg/EtuveIcon";
import { useTransitionRouter } from "next-view-transitions";

interface type_Data {
    id: string; // Assuming there's a unique ID property
    Valeur: number; // Update this based on your API response,
    Unite:string;
    DateHeureMesure: string;
    DateHeureMesureXaxis:string;
    Consigne_Sup:number;
    Consigne_Inf:number;

    // Add other properties if needed
}


export default function MonitoringGraph({ idLieu, NomLieu } : {
    idLieu:string,
    NomLieu:string,
}){
    // const mountedRef = useRef(true);
    const [containerWidth, setcontainerWidth] = useState<number>();

    const [data, setData] = useState<type_Data[]>([]);
    const [isDataLoaded, setDataLoaded] = useState<boolean>(false);
    // const [dataType, setdataType] = useState<string>();
    const [dataXaxis, setdataXaxis] = useState<string[]>([]);
    const [consigneSup, setconsigneSup] = useState<number>();
    const [consigneInf, setconsigneInf] = useState<number>();
    const [unite, setUnite] = useState<string>("");

    // const [ip, setIp] = useState<string>("");
    // const [isNotified, setNotified] = useState<boolean>(false);
    const [typeLieu, setTypeLieu] = useState<string>("");

    const [YaxisMin, setYaxisMin] = useState<number>(0);
    const [YaxisMax, setYaxisMax] = useState<number>(0);
    
    useEffect(() => {
        setTypeLieu("")
        axios.get('/api/lieux/type/'+idLieu)
        .then((res_api) => {
            if (res_api.data.length > 0){
                console.log(res_api.data[0].nom_type_lieu)
                setTypeLieu(res_api.data[0].nom_type_lieu)
            }
        })

        // getLocalIP().
        // then((res_ip) => {
        //     // console.log("response "+response)
        //     setIp(res_ip);
        //     axios.get('/api/lieux/alerte/'+idLieu, {
        //         params: {
        //             ip:res_ip
        //         }
        //     })
        //     .then((res_api) => {
        //         // console.log(res_api);
        //         if(res_api.data.length == 1){
        //             setNotified(true)
        //         } else if (res_api.data.length == 0){
        //             setNotified(false)
        //         }
        //     })
        //     .catch(error => {
        //         console.error("Error fetching data:", error);
        //     });
        // });

        
        axios.get('/api/mesures/'+idLieu, {
            params: {
                rowNumber:20
            }
        })
        .then(response => {
            if (Array.isArray(response.data)) {
                // console.log(response.data);
                setData(response.data);
                // setData(response.data.map((datas) => ({
                //     ...datas,
                //     // HeureMesure: (new Date(datas.DateHeureMesure).getHours() < 10 ? '0' : '') + new Date(datas.DateHeureMesure).getHours() + ":" + (new Date(datas.DateHeureMesure).getMinutes() < 10 ? '0' : '') + new Date(datas.DateHeureMesure).getMinutes(),
                //     // DateMesureXaxis: (new Date(datas.DateHeureMesure).getDate() < 10 ? '0' : '') + new Date(datas.DateHeureMesure).getDate() + "/" + (new Date(datas.DateHeureMesure).getMonth() < 10 ? '0' : '') + new Date(datas.DateHeureMesure).getMonth()
                // })));
                
                if (response.data.length > 0){

                    // console.log(response.data);
                    var tmp_xAxis:string[] = [];
                    var dateFormatee;
                    var tmp_Ymin=response.data[0].Valeur;
                    var tmp_Ymax=response.data[0].Valeur;
                    for(let mesure of response.data.reverse()){
                        dateFormatee = (new Date(mesure.DateHeureMesure).getDate() < 10 ? '0' : '') + new Date(mesure.DateHeureMesure).getDate() + "/" + (new Date(mesure.DateHeureMesure).getMonth()+1 < 10 ? '0' : '') + (new Date(mesure.DateHeureMesure).getMonth()+1).toString()
                        if (!tmp_xAxis.includes(dateFormatee) && tmp_xAxis.length != 0){
                            tmp_xAxis.push(dateFormatee);
                        } else {
                            tmp_xAxis.push("00/00");
                        }

                        if (mesure.Valeur > tmp_Ymax){
                            tmp_Ymax = mesure.Valeur
                        }
    
                        if (mesure.Valeur < tmp_Ymin){
                            tmp_Ymin = mesure.Valeur
                        }
                    }
                    // console.log(tmp_xAxis);
                    setdataXaxis(tmp_xAxis);
                    setconsigneSup(response.data[0].Consigne_Sup);
                    setconsigneInf(response.data[0].Consigne_Inf);
                    setUnite(response.data[0].Unite);
                    // setYaxisMax(Math.round(tmp_Ymax*1.2)+1)
                    // setYaxisMin(Math.round(tmp_Ymin*0.8)-1)
                    // console.log(Math.round(response.data[0].Consigne_Sup*1.2)+1)
                    // console.log(Math.round(response.data[0].Consigne_Inf*0.8)-1)

                    // if(tmp_Ymax > response.data[0].Consigne_Sup){
                    //     setYaxisMax(Math.round(tmp_Ymax*1.1)+1)
                    // }else{
                    //     setYaxisMax(Math.round(response.data[0].Consigne_Sup*1.1)+1)
                    // }

                    // if(tmp_Ymin < response.data[0].Consigne_Inf){
                    //     setYaxisMin(Math.round(tmp_Ymin*1.1)+1)
                    // }else{
                    //     setYaxisMin(Math.round(response.data[0].Consigne_Inf*0.6)-1)
                    // }

                    let chart_minimum = (tmp_Ymin < response.data[0].Consigne_Inf)? tmp_Ymin: response.data[0].Consigne_Inf
                    let chart_maximum = (tmp_Ymax > response.data[0].Consigne_Sup)? tmp_Ymax: response.data[0].Consigne_Sup
                    setYaxisMax(Math.ceil( chart_maximum+(0.25*(chart_maximum-chart_minimum)) ))
                    setYaxisMin(Math.floor( chart_minimum-(0.6*(chart_maximum-chart_minimum)) ))
                    // setYaxisMax(Math.round(response.data[0].Consigne_Sup*1.1)+1)
                    // setYaxisMin(Math.round(response.data[0].Consigne_Inf*0.6)-1)
                    
                    // switch (response.data[0].Unite) {
                    //     case "°C":
                    //         setdataType("Température")
                            
                    //         break;
                    //     case "%CO2":
                    //         setdataType("Hygromètrie")
                            
                    //         break;
                    //     case "%HR":
                    //         setdataType("Hydromètrie")
                            
                    //         break;
                    
                    //     default:
                    //         break;
                    // }
                    
                    // setdataXaxis([0, Math.trunc(new Date(response.data[0].DateHeureMesure).getHours()/4), Math.trunc(new Date(response.data[0].DateHeureMesure).getHours()/2), Math.trunc(3*new Date(response.data[0].DateHeureMesure).getHours()/4), new Date(response.data[0].DateHeureMesure).getHours()]);
                }else{
                    // setdataType("Pas de données")
                }
               


            } else {
                console.error("Unexpected data format:", response.data);
            }
            setTimeout(() => { setDataLoaded(true); }, 1000);

            
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
        
        // mountedRef.current = false;
    }, [idLieu]);

    

    // useEffect(() => {
    //     if (isDataLoaded){   
    //         if (isNotified){
    //             toast.success("Vous recevrez les alertes concernant le lieu " + NomLieu, {
    //                 position: "top-center",
    //                 duration:3000,
    //                 style:{
    //                     background:"#E6FAF0",
    //                     color: "#1A8853",
    //                     border: "#1A8853"
    //                 }
    //             });
    //         } else if(!isNotified){
    //             toast.success("Vous ne recevrez plus les alertes concernant le lieu " + NomLieu, {
    //                 position: "top-center",
    //                 duration:3000,
    //                 style:{
    //                     background:"#E6FAF0",
    //                     color: "#1A8853",
    //                     border: "#1A8853"
    //                 }
    //             });
    //         }         // ← the trick
    //     }
    // }, [isNotified])

    const router = useTransitionRouter();
    return (
        <div id="div-acquisitions h-full " 
            className={`relative bg-white rounded-lg  w-full subpixel-antialiased ${isDataLoaded?'pt-[85%]':''} transition hover:shadow-[0px_5px_15px_0px_rgba(33,33,33,0.2)] hover:scale-[101%] transform outline-1 outline outline-[#d6d6d6] border-solid border-[#d6d6d6]`}>
            {isDataLoaded
                    ? <>
                        <div onClick={()=>router.push('/surveillance/'+idLieu)} className="absolute top-0 left-0 px-4 py-[10px] flex justify-between w-full transition-colors hover:cursor-pointer hover:bg-slate-100 rounded-t-lg z-10">
                            <div className="relative text-[#2a2a2a] font-bold grow subpixel-antialiased">
                                {NomLieu}
                            </div>
                            <div className="absolute flex text-center items-center align-middle justify-center h-full w-[20%] right-0 top-0 rounded-tr-lg rounded-l-lg transition-background">
                            
                            {(typeLieu == "AMBIANCE")? <TiHomeOutline size={24} title="Ambiance"/>:""}
                            {(typeLieu == "RÉFRIGÉRATEUR_CONGÉLATEUR")? <CgSmartHomeRefrigerator size={24} title="Réfrigérateur/Congélateur"/>:""}
                            {/* {(typeLieu == "ÉTUVE_ENCEINTE_CLIMATIQUE")? <div title="Étuve/Enceinte climatique"><EtuveIcon size={24} /></div>:""} */}
                            {(typeLieu == "ÉTUVE_ENCEINTE_CLIMATIQUE")? <PiThermometerHotFill  size={24} title="Étuve/Enceinte climatique"/>:""}
                            {(typeLieu == "CHAMBRE_FROIDE")? <FaRegSnowflake size={22} title="Chambre froide"/>:""}
                            {(typeLieu == "BAIN_MARIE_CUVE")? <TbWashTemperature1 size={24} title="Bain marie/Cuve"/>:""}
                            {(typeLieu == "FOUR")? <PiOven  size={24} title="Four"/>:""}
                             
                            {/* onClick={() =>{
                            //     if(!isNotified == true){
                            //         // console.log('/api/lieux/alerte/'+idLieu + "?ip="+ip+"&value=true");
                            //         // console.log("ip: " + ip);
                            //         axios.post('/api/lieux/alerte/'+idLieu, null, {
                            //             params: {
                            //                 ip:ip,
                            //                 value:"true"
                            //             }
                            //         })
                            //         .then(()=>setNotified(!isNotified))
                            //     } else if(!isNotified == false){
                            //         // console.log('/api/lieux/alerte/'+idLieu);
                            //         axios.post('/api/lieux/alerte/'+idLieu, null, {
                            //             params: {
                            //                 ip:ip,
                            //                 value:"false"
                            //             }
                            //         })
                            //         .then(()=>setNotified(!isNotified))
                            //         axios.post('http://'+ip+':8000/alarm', null, {
                            //             params: {
                            //                 action:"hide",
                            //                 idLieu:idLieu
                            //             }
                            //         })
                            //     }
                                
                            //     setNotified(!isNotified);
                            // }}>
                            //     {isNotified?
                            //         <FaBell size={20}/>
                            //     :
                            //         <FaRegBell size={20}/>
                            //     } */}
                            </div>
                            {/* <div className="relative text-[#7f7f7f]">
                                {dataType}
                            </div> */}
                        </div>
                        
                        <ResponsiveContainer id={'container-'+idLieu} width="100%" height="100%" className="absolute top-0 left-0 w-full h-full object-cover pt-12"
                            onResize={() =>{
                                var container = document.getElementById("container-" + idLieu)
                                if (container){
                                    // console.log(data)
                                    setcontainerWidth(container.offsetWidth)
                                }
                            }}
                        >
                            
                            <AreaChart width={730} height={250} data={data} margin={{ top: 0, left: -5, right: 40, bottom: 0 }} className="font-mono">
                                <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#FFBD50" stopOpacity={0.1}/>
                                    <stop offset="100%" stopColor="#FFBD50" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="DateHeureMesure" interval={0} allowDuplicatedCategory={true} tick={{ dx: 5 }} tickMargin={30} angle={-90} mirror axisLine={false} padding="no-gap"  tickFormatter={(tick, index)=> {return (dataXaxis[index] != '00/00')?dataXaxis[index]:''}} />
                                <YAxis hide type='number' domain={[() => YaxisMin,() => YaxisMax]}/>
                                <CartesianGrid strokeDasharray="5 5"  horizontal={false} vertical ={false} />
                                <Tooltip  
                                    content={<CustomTooltip/>}
                                    position={{x:(containerWidth)?containerWidth-140:0,y:0}}
                                    defaultIndex={data.length-1}
                                    isAnimationActive={false}
                                    // cursor={<Rectangle fill="red" stroke="red" x={xMouse} y={50} width={50} height={50} /> }
                                    active={true}
                                    // cursor={<CustomCursor activeDotPos={activeDotPos}/>}
                                    
                                    // allowEscapeViewBox={{x:false, y:false}}
                                />
                                <Area type="monotone" dataKey="Valeur" stroke="#FFBD50" strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" />
                                <ReferenceLine y={consigneInf} label={{value: consigneInf+ unite, dy:-12,dx:10, position:'insideLeft'}} stroke="red" strokeDasharray="3 4"/>
                                <ReferenceLine y={consigneSup} label={{value: consigneSup+ unite, dy:-12,dx:10, position:'insideLeft'}} stroke="red" strokeDasharray="3 4"/>
                            </AreaChart>
                        </ResponsiveContainer>
                        
                    </>
                    :  
                    <Skeleton className="rounded-lg h-full pt-[85%]">
                        <div className="h-full rounded-lg bg-default-300"></div>
                    </Skeleton>
            }         
        </div>
    );
}
