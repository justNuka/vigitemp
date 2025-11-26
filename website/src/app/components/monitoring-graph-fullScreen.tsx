'use client'
import { Button, Skeleton } from "@heroui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {customActiveDotGraph} from "./customActiveDotGraph";
import { RxShare2 } from "react-icons/rx";
import {ZonedDateTime, fromDate} from "@internationalized/date";
import { ZonedDateTimeToString } from "@/app/libs/utils_client";


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

interface type_EventHistory {
    alert?: string;
    endDate?: string;
    startDate?: string;
    key?: number;
    // Add other properties if needed
}

export default function MonitoringGraphFullScreen(this: any, { idLieu, NomLieu, stateNeedReload, setStateNeedReload, _startDate, _endDate, eventHistory, setEventHistory } : {
    idLieu:number,
    NomLieu:string,
    stateNeedReload:boolean,
    setStateNeedReload:Function,
    _startDate:ZonedDateTime,
    _endDate:ZonedDateTime,
    eventHistory:type_EventHistory[],
    setEventHistory:Function
}){

    const [data, setData] = useState<type_Data[]>([]);
    const [isDataLoaded, setDataLoaded] = useState<boolean>(false);
    const [isAnimated, setAnimation] = useState<boolean>(true);
    // const [tickInterval, settickInterval] = useState<number>(0);
    const [dataXaxis, setdataXaxis] = useState<string[]>([]);
    const [consigneSup, setconsigneSup] = useState<number>();
    const [consigneInf, setconsigneInf] = useState<number>();
    const [unite, setUnite] = useState<string>("");

    const [YaxisMin, setYaxisMin] = useState<number>(0);
    const [YaxisMax, setYaxisMax] = useState<number>(0);

    const [zoomState, setZoomState] = useState({
        data: data.slice(),
        left: '',
        right: '',
        refAreaLeft: ''!,
        refAreaRight: ''!
      });

    useEffect(()=>{
        console.log(eventHistory)
        if(eventHistory[0] != undefined){
            console.log(eventHistory[0].alert)
        }
        
    }, [eventHistory])

    useEffect(()=>{
        console.log(zoomState.data)
        
    }, [zoomState.data])


    function updateXaxisLabels(){
        var firstXaxisShift:boolean; // en fonction du nombres de tick, décalage du premier label pour pas qu'il soit coupé par le bord de la div
        if (zoomState.data.length != data.length && zoomState.data.length < 150){
            firstXaxisShift = false;
        } else {
            firstXaxisShift = true;
        }

        if (Array.isArray(zoomState.data)) {                
            if (zoomState.data.length > 0){

                // console.log(zoomState.data);
                var tmp_xAxis:string[] = [];
                var dateFormatee;
                for(let mesure of zoomState.data){
                    dateFormatee = (new Date(mesure.DateHeureMesure).getDate() < 10 ? '0' : '') + new Date(mesure.DateHeureMesure).getDate() + "/" + (new Date(mesure.DateHeureMesure).getMonth()+1 < 10 ? '0' : '') + (new Date(mesure.DateHeureMesure).getMonth()+1).toString()
                    // console.log(Math.ceil(tmp_arrayData.length/5));
                    if(zoomState.data.length>0){
                        if (firstXaxisShift) {
                            if (!tmp_xAxis.includes(dateFormatee) && tmp_xAxis.length > Math.ceil(zoomState.data.length/100)){
                                // console.log("longueur: " + tmp_xAxis.length)
                                // if (!tmp_xAxis.includes(dateFormatee)){
                                tmp_xAxis.push(dateFormatee);
                            } else {
                                tmp_xAxis.push("00/00");
                            }
                        } else if(!firstXaxisShift){
                            if (!tmp_xAxis.includes(dateFormatee) && tmp_xAxis.length > 0){
                                // console.log("longueur: " + tmp_xAxis.length)
                                // if (!tmp_xAxis.includes(dateFormatee)){
                                tmp_xAxis.push(dateFormatee);
                            } else {
                                tmp_xAxis.push("00/00");
                            }
                        }
                        
                    } else {
                        if (!tmp_xAxis.includes(dateFormatee) && tmp_xAxis.length > 0){
                            // if (!tmp_xAxis.includes(dateFormatee)){
                                tmp_xAxis.push(dateFormatee);
                            } else {
                                tmp_xAxis.push("00/00");
                            }
                    }
                }
                // console.log(tmp_xAxis);
                setdataXaxis(tmp_xAxis);
            }
        }           
    }


    function reloadGraphics(){

        var tmp_startDate = sessionStorage.getItem('startDate');
        var tmp_endDate = sessionStorage.getItem('endDate');
        
        if (tmp_startDate){
            _startDate = fromDate(new Date(Date.parse(tmp_startDate)), 'CET');
        }

        if (tmp_endDate){
            _endDate = fromDate(new Date(Date.parse(tmp_endDate)), 'CET');
        }

        setDataLoaded(false);
        setStateNeedReload(false);
        setData([]);
        setdataXaxis([]);
        setconsigneSup(0);
        setconsigneInf(0);
        setUnite("");
        setYaxisMax(0);
        setYaxisMin(0);
        let _params = {};
        if (_startDate.toDate().getTime() != _endDate.toDate().getTime()){
            _params = {
                startDate: _startDate.toDate().getTime(),
                endDate: _endDate.toDate().getTime()
            }
        } else{
            // console.log("rowNumber:100")
            _params = {
                rowNumber:100
            }
        }
        
        axios.get('/api/mesures/'+idLieu, {
            params: _params
        })
        .then(response => {
            if (Array.isArray(response.data)) {
                // console.log(response.data);
                let tmp_arrayData = [];
                if (response.data.length >1000){
                    // console.log("tickInterval: "+ tickInterval)
                    // settickInterval((response.data.length)/1000);
                    for(var i = 0; i < response.data.length; i += Math.floor((response.data.length)/1000)) {  // take every second element
                        tmp_arrayData.push(response.data[i]);
                    }
                } else {
                    tmp_arrayData = response.data
                }
                setData(tmp_arrayData);
                
                if (tmp_arrayData.length > 0){
    
                    // console.log(response.data);
                    var tmp_xAxis:string[] = [];
                    var dateFormatee;
                    var tmp_Ymin=tmp_arrayData[0].Valeur;
                    var tmp_Ymax=tmp_arrayData[0].Valeur;
                    for(let mesure of tmp_arrayData.reverse()){
                        dateFormatee = (new Date(mesure.DateHeureMesure).getDate() < 10 ? '0' : '') + new Date(mesure.DateHeureMesure).getDate() + "/" + (new Date(mesure.DateHeureMesure).getMonth()+1 < 10 ? '0' : '') + (new Date(mesure.DateHeureMesure).getMonth()+1).toString()
                        // console.log(Math.ceil(tmp_arrayData.length/5));
                        if(tmp_arrayData.length>0){
                            if (!tmp_xAxis.includes(dateFormatee) && tmp_xAxis.length > Math.ceil(tmp_arrayData.length/100)){
                                    tmp_xAxis.push(dateFormatee);
                                } else {
                                    tmp_xAxis.push("00/00");
                                }
                        } else {
                            if (!tmp_xAxis.includes(dateFormatee) && tmp_xAxis.length > 0){
                                // if (!tmp_xAxis.includes(dateFormatee)){
                                    tmp_xAxis.push(dateFormatee);
                                } else {
                                    tmp_xAxis.push("00/00");
                                }
                        }
                        
    
                        if (mesure.Valeur > tmp_Ymax){
                            tmp_Ymax = mesure.Valeur
                        }
    
                        if (mesure.Valeur < tmp_Ymin){
                            tmp_Ymin = mesure.Valeur
                        }
                    }
                    setdataXaxis(tmp_xAxis);
                    setconsigneSup(tmp_arrayData[0].Consigne_Sup);
                    setconsigneInf(tmp_arrayData[0].Consigne_Inf);
                    setUnite(tmp_arrayData[0].Unite);
                    let chart_minimum = (tmp_Ymin < tmp_arrayData[0].Consigne_Inf)? tmp_Ymin: tmp_arrayData[0].Consigne_Inf
                    let chart_maximum = (tmp_Ymax > tmp_arrayData[0].Consigne_Sup)? tmp_Ymax: tmp_arrayData[0].Consigne_Sup
                    // if(tmp_Ymax > tmp_arrayData[0].Consigne_Sup){
                    //     setYaxisMax(Math.ceil(tmp_Ymax*1.1))
                    // }else{
                    //     setYaxisMax(Math.ceil(tmp_arrayData[0].Consigne_Sup*1.1))
                    // }
                    setYaxisMax(Math.ceil( chart_maximum+(0.25*(chart_maximum-chart_minimum)) ))


                    // if(tmp_Ymin < tmp_arrayData[0].Consigne_Inf){
                    //     // console.log("valeur inferieure")
                    //     setYaxisMin(Math.floor(tmp_Ymin*0.7))
                    // }else{
                    //     // console.log("valeur supérieure")
                    //     setYaxisMin(Math.floor(tmp_arrayData[0].Consigne_Inf*0.7))
                    // }
                    setYaxisMin(Math.floor( chart_minimum-(0.3*(chart_maximum-chart_minimum)) ))

                }    
            } else {
                console.error("Unexpected data format:", response.data);
            }
            setTimeout(() => { setDataLoaded(true); }, 200);
    
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
    }
    
    useEffect(() => {
        // console.log("startDate: "+_startDate.toAbsoluteString())
        // console.log("endDate: "+_endDate.toAbsoluteString())

        reloadGraphics();
    }, []);

    useEffect(() => {
        if(data.length > 0 ){
            setZoomState((prevState) => ({
                ...prevState,
                data: data.slice(),
                refAreaLeft: '',
                refAreaRight: '',
                left: data[0].DateHeureMesure,
                right: data[data.length-2].DateHeureMesure
            }));
        }
        
    }, [data]); // Only run when data changes

    useEffect(() => {
        // console.log(zoomState);
        updateXaxisLabels();

    }, [zoomState]); // Only run when data changes

    function zoom() {
        setAnimation(false);
        var { refAreaLeft, refAreaRight } = zoomState;
        const { data } = zoomState;
    
        if (refAreaLeft === refAreaRight || refAreaRight === '') {
            setZoomState(prevState => ({ 
                ...prevState,
                refAreaLeft: '',
                refAreaRight: '',
            }))
            return;
        }
    
        // xAxis domain
        if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];
    
        // yAxis domain
        var finderStart:number = data.findIndex(obj => obj.DateHeureMesure === refAreaLeft);
        if (finderStart === -1) finderStart = 0;

        var finderEnd:number = data.findIndex(obj => obj.DateHeureMesure === refAreaRight);
        if (finderEnd === -1) finderEnd = data.length - 1;
    
        setZoomState({
            data: data.slice(finderStart, finderEnd+1),
            left: refAreaLeft,
            right: refAreaRight,
            refAreaLeft: '',
            refAreaRight: ''
        });
    }
    
    function zoomOut() {
        setAnimation(false);
        // const { data } = zoomState;
        setZoomState(() => ({
            data: data.slice(),
            left: data[0].DateHeureMesure,
            right: data[data.length-1].DateHeureMesure,
            refAreaLeft: '',
            refAreaRight: ''
        }));
    }

    function glassEffect() {
    setAnimation(false);
    // const { data } = zoomState;
    setZoomState(() => ({
        data: data.slice(),
        left: data[0].DateHeureMesure,
        right: data[data.length-1].DateHeureMesure,
        refAreaLeft: '',
        refAreaRight: ''
    }));
    }


    return (
        <div id="div-acquisitions" 
            className={`transform-gpu transition-all overflow-hidden relative bg-white rounded-xl h-full w-full antialiased transitison-shadow shadow-[0px_5px_11px_0px_rgba(33,33,33,0.1)] outline-1 outline outline-[#d6d6d6] border-solid border-[#d6d6d6]`}
        >
            {isDataLoaded
            ? 
                <>  
                    {zoomState.data.length == 0 || data.length == 0
                    ? 
                        <>
                            <div className="rounded-lg absolute h-full w-full">
                                <div className="h-full rounded-lg bg-white text-center content-center text-base font-mono">
                                    Il n'y a pas de données à afficher
                                </div>
                            </div>
                            {stateNeedReload
                            ? 
                                <div className="bg-blacks/25 absolute z-10 h-full w-full rounded-xl flex items-center justify-center backdrop-blur-md">
                                    <div onClick={() => reloadGraphics()}
                                        className="bg-white px-5 py-3 rounded-full outline outline-1 outline-black/10 cursor-pointer hover:bg-gray-50 transition-colors">
                                        Mettre à jour le graphique
                                    </div>
                                </div>
                            : 
                                ''
                            }          
                        </>
                    : 
                        <>
                            {stateNeedReload
                            ? 
                                <div className="bg-blacks/25 absolute z-10 h-full w-full rounded-xl flex items-center justify-center backdrop-blur-md">
                                    <div onClick={() => reloadGraphics()}
                                        className="bg-white px-5 py-3 rounded-full outline outline-1 outline-black/10 cursor-pointer hover:bg-gray-50 transition-colors">
                                        Mettre à jour le graphique
                                    </div>
                                </div>
                            : 
                                ''
                            }           
                            {!stateNeedReload
                            ? 
                                <div className="transition-opacity bg-blacks/25 absolute z-10 left-full top-full -translate-y-full opacity-25 hover:opacity-100 -translate-x-full">
                                    <Button 
                                        size='md'
                                        // className='bg-white m-3 p-2 min-w-12 max-w-12 rounded-full outline outline-1 outline-black/10 cursor-pointer hover:bg-gray-50 transition-colors'
                                        className='transition-colors-opacity m-3 p-2 min-w-14 max-w-17 min-h-14 max-h-14 rounded-full bg-white border-[#d6d6d6] border-1'
                                        disableRipple
                                        startContent={
                                            <RxShare2  size={25}/>
                                        }
                                        onPress={() => {}}
                                    />
                                </div>
                            :
                                ''
                            }                   
                            
                            <ResponsiveContainer  debounce={200} id={'container-'+idLieu} width="100%" height="100%" className="absolute overflow-hidden top-0 left-0 w-full h-full object-cover">
                                
                                <AreaChart width={730} height={250} data={zoomState.data} margin={{ top: 0, left: 0, right: 40, bottom: 0 }} className="font-mono overflow-visible"
                                    onMouseDown={(e) => setZoomState(prevState => ({ 
                                        ...prevState,
                                        refAreaLeft: e.activeLabel || ''
                                    }))}
                                    onMouseMove={(e) => zoomState.refAreaLeft && setZoomState(prevState => ({
                                        ...prevState,
                                        refAreaRight: e.activeLabel || ''
                                    }))}
                                    // eslint-disable-next-line react/jsx-no-bind
                                    onMouseUp={zoom.bind(this)}
                                >
                                    <defs>
                                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FFBD50" stopOpacity={0.1}/>
                                            <stop offset="100%" stopColor="#FFBD50" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="DateHeureMesure" interval={0} allowDuplicatedCategory={true} allowDataOverflow={false} tick={{ dx: 5 }} tickMargin={30} angle={-90} mirror axisLine={false} padding="no-gap"  tickFormatter={(tick, index)=> {return (dataXaxis[index] != '00/00')?dataXaxis[index]:''}} />
                                    <YAxis hide type='number' domain={[() => YaxisMin,() => YaxisMax]}/>
                                    <CartesianGrid strokeDasharray="5 5"  horizontal={false} vertical ={false} />
                                    <Tooltip  
                                        content={() => null}
                                        // position={{x:(containerWidth)?containerWidth-140:0,y:0}}
                                        defaultIndex={data.length-1}
                                        isAnimationActive={false}
                                        // cursor={<Rectangle fill="red" stroke="red" x={xMouse} y={50} width={50} height={50} /> }
                                        active={true}
                                        // cursor={<CustomCursor activeDotPos={activeDotPos}/>}
                                        
                                        // allowEscapeViewBox={{x:false, y:false}}
                                    />
                                    
                                    <ReferenceLine y={consigneInf} label={{value: consigneInf+ unite, dy:-12,dx:10, position:'insideLeft'}} stroke="red" strokeDasharray="3 4"/>
                                    <ReferenceLine y={consigneSup} label={{value: consigneSup+ unite, dy:-12,dx:10, position:'insideLeft'}} stroke="red" strokeDasharray="3 4"/>
                                    {eventHistory[0] != undefined && eventHistory[0].startDate != undefined && eventHistory[0].endDate != undefined ? (
                                        <ReferenceArea x1={eventHistory[0].startDate} x2={eventHistory[0].endDate} opacity={0.2} fill="#49aee0" strokeOpacity={1} strokeWidth={1}/>
                                    ) : null}


                                    {eventHistory[0] != undefined && eventHistory[0].startDate != "" && eventHistory[0].endDate == ""
                                    ? (
                                        <div>
                                            <ReferenceLine x={eventHistory[0].startDate} stroke="red" strokeDasharray="3 4"/>
                                            <ReferenceLine x={"2025-03-10 11:24:00.874"} stroke="red" strokeDasharray="3 4">

                                            </ReferenceLine>
                                            <ReferenceLine x={"2025-03-10T07:27:30.453Z"} stroke="red" strokeDasharray="3 4"/>
                                        </div>
                                        
                                    ) : null}
                                    
                                    {/* <ReferenceLine x={"2025-03-10T10:24:00.874Z"} stroke="red" segment={[{x:15,y:25}]} ifOverflow="visible">
                                        <YAxis height={50}/>
                                    </ReferenceLine> */}
                                    
                                    <Area type="monotone" dataKey="Valeur" stroke="#FFBD50" strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" activeDot={customActiveDotGraph} isAnimationActive={isAnimated}/>


                                    {zoomState.refAreaLeft && zoomState.refAreaRight ? (
                                        <ReferenceArea x1={zoomState.refAreaLeft} x2={zoomState.refAreaRight} opacity={0.2} fill="#49aee0" strokeOpacity={1} strokeWidth={1}/>
                                    ) : null}
                                </AreaChart>
                            </ResponsiveContainer>

                            <div className="absolute left-full -translate-x-full text-right py-3 px-4 font-mono">
                                <div className="flex items-center justify-end whitespace-nowrap">
                                    <Button 
                                        size='sm'
                                        className={`${zoomState.data.length != data.length?'opacity-100 pointer-events-auto':'opacity-0 pointer-events-none'} transition-opacity min-w-14 max-w-17 z-50 rounded-full text-[0.90rem] bg-white border-[#d6d6d6] border-1 font-sans mr-5`}
                                        disableRipple
                                        onPress={() => zoomOut()}
                                    >
                                        Réinitialiser le zoom
                                    </Button>
                                    Historique des mesures du {ZonedDateTimeToString(fromDate(new Date(zoomState.left), "CET"))} au {ZonedDateTimeToString(fromDate(new Date(zoomState.right), "CET"))}
                                </div>
                                <div>
                                    Dernière mesure du {ZonedDateTimeToString(fromDate(new Date(data[data.length-1].DateHeureMesure), "CET"), 1)} : <b>{data[data.length-1].Valeur}{data[data.length-1].Unite}</b>
                                </div>
                            </div>
                        </>
                    }     
                </>
            :  
                <Skeleton className="rounded-lg h-full">
                    <div className="h-full rounded-lg bg-default-300"></div>
                </Skeleton>
            }         
        </div>
    );
}

