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
    Valeur_2?: number; // Update this based on your API response,
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
    areaOrline?: string;
    // Add other properties if needed
}

export default function MonitoringGraphFullScreenZoomRefineCleanUp(this: any, { idLieu, NomLieu, stateNeedReload, setStateNeedReload, _startDate, _endDate, eventHistory, setEventHistory } : {
    idLieu:number,
    NomLieu:string,
    stateNeedReload:boolean,
    setStateNeedReload:Function,
    _startDate:ZonedDateTime,
    _endDate:ZonedDateTime,
    eventHistory:type_EventHistory[],
    setEventHistory:Function
}){

    const NUMBER_OF_TICK_DISPLAYED:number = 300; //improves performances

    const [data, setData] = useState<type_Data[]>([]);
    const [isDataLoaded, setDataLoaded] = useState<boolean>(false);
    const [isDataZoomed, setDataZoomed] = useState<boolean>(false);
    const [isAnimated, setAnimation] = useState<boolean>(true);
    // const [tickInterval, settickInterval] = useState<number>(0);
    const [dataXaxis, setdataXaxis] = useState<string[]>([]);
    const [consigneSup, setconsigneSup] = useState<number>();
    const [consigneInf, setconsigneInf] = useState<number>();
    const [unite, setUnite] = useState<string>("");
    

    const [YaxisMin, setYaxisMin] = useState<number>(0);
    const [YaxisMax, setYaxisMax] = useState<number>(0);

    const [zoomState, setZoomState] = useState({
        data: [] as type_Data[],
        left: '',
        right: '',
        refAreaLeft: ''!,
        refAreaRight: ''!
    });
    // const [zoomState, setZoomState] = useState<{
    //     data: type_Data[];
    //     left: string;
    //     right: string;
    //     refAreaLeft: string;
    //     refAreaRight: string;
    // }>({
    //     data: [],
    //     left: 'undefined',
    //     right: 'undefined',
    //     refAreaLeft: 'undefined',
    //     refAreaRight: 'undefined'
    // });

    useEffect(()=>{
        console.log("useeffect initiale")
        fetchData();
    }, [])

    // useEffect(()=>{
    //     updateGraphic();
    // }, [data])

    useEffect(()=>{
        console.log("useeffect zoomState.data")
        // console.log(zoomState.data)
        updateGraphic();
        // fetchData();
    }, [zoomState.data])

    useEffect(()=>{
        // console.log(eventHistory)
        var zoomState_tmp = zoomState;
        zoomState_tmp.data.forEach(obj => {
            delete obj.Valeur_2;
            });
        if(eventHistory[0] != undefined){
            var nbOfValueAdded:number = 0;
            if(eventHistory[0].startDate != "" && eventHistory[0].endDate != ""){
                console.log("start + end: " + eventHistory[0].startDate +" | "+ eventHistory[0].endDate)
                var res = zoomState.data.map((elem)=>{
                    var startDate = eventHistory[0].startDate ? new Date(eventHistory[0].startDate) : new Date()
                    var endDate = eventHistory[0].endDate ? new Date(eventHistory[0].endDate) : new Date()
                    var elem_tmp = {...elem};
                    var measureDate = elem.DateHeureMesure ? new Date(elem.DateHeureMesure) : new Date()
                    // console.log(measureDate)
                    // console.log(measureDate >= startDate && measureDate <= endDate)
                    if(measureDate >= startDate && (measureDate <= endDate || nbOfValueAdded < 2)){
                        elem_tmp = {...elem, Valeur_2:elem.Valeur}
                        nbOfValueAdded++
                    }
                    
                    return elem_tmp
                })
                // zoomState.data = res;
                zoomState_tmp.data = res
                // setZoomState({...zoomState, data: res})
    
                // console.log(zoomState.data);
            } else if (eventHistory[0].startDate != "" && eventHistory[0].endDate == ""){
                // console.log("start: " + eventHistory[0].startDate)
                
                var eventIsInData:boolean = false;
                var res = zoomState.data.map((elem)=>{
                    var startDate = eventHistory[0].startDate ? new Date(eventHistory[0].startDate) : new Date()
                    var elem_tmp = {...elem};
                    var measureDate = elem.DateHeureMesure ? new Date(elem.DateHeureMesure) : new Date()
                    // console.log(measureDate + " | " + startDate)
                    // console.log(measureDate.getTime() == startDate.getTime())
                    // console.log("-------------------------")
                    // if(measureDate.getTime() >= startDate.getTime() && mappingDone != true){
                    //     console.log("measureDate.getTime() >= startDate.getTime()")
                    //     console.log(measureDate.getTime() + " >= " + startDate.getTime())
                    //     console.log("mappingDone")
                    //     console.log(mappingDone)
                    //     console.log("addNext")
                    //     console.log(addNext)
                    // }
                    if (measureDate.getTime() <= startDate.getTime()){
                        eventIsInData = true;
                    }

                    if (eventIsInData && measureDate.getTime() >= startDate.getTime() && nbOfValueAdded < 2 ){
                        elem_tmp = {...elem, Valeur_2:elem.Valeur}
                        nbOfValueAdded++
                        console.log("elem_tmp")
                        console.log(elem_tmp)
                        console.log("nbOfValueAdded")
                        console.log(nbOfValueAdded)
                    }

                    // if(measureDate.getTime() >= startDate.getTime() && mappingDone != true){
                    //     elem_tmp = {...elem, Valeur_2:elem.Valeur}
                    //     addNext = !addNext
                    // } else if (measureDate.getTime() >= startDate.getTime() && addNext == true){
                    //     mappingDone = true
                    // }

                    // console.log(elem_tmp)
                    
                    return elem_tmp
                })
    
                // zoomState.data = res;
                zoomState_tmp.data = res
    
            }
        }
        // console.log(zoomState_tmp.data);
        setZoomState({...zoomState, data:zoomState_tmp.data})
        // console.log(zoomState_tmp)
        
    }, [eventHistory, zoomState.left])

    function fetchData(){
        console.log("fetchData")
        var tmp_startDate = sessionStorage.getItem('startDate');
        var tmp_endDate = sessionStorage.getItem('endDate');

        if (tmp_startDate){
            _startDate = fromDate(new Date(Date.parse(tmp_startDate)), 'CET');
        }
        
        if (tmp_endDate){
            _endDate = fromDate(new Date(Date.parse(tmp_endDate)), 'CET');
        }
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
                response.data = response.data.reverse();
                let processedData = response.data.slice();
                if (response.data.length > NUMBER_OF_TICK_DISPLAYED) {
                    const step = Math.floor(response.data.length / (NUMBER_OF_TICK_DISPLAYED-1) );
                    processedData =  response.data.filter((_: any, index: number) => index % step === 0);
                }
                // console.log(processedData)
                // console.log(response.data)
                setData(response.data);
                setZoomState({...zoomState, 
                    data:processedData,
                    left: response.data[0].DateHeureMesure,
                    right: response.data[response.data.length-1].DateHeureMesure
                });
                
            } else {
                console.error("Unexpected data format:", response.data);
            }
            // setTimeout(() => { setDataLoaded(true); }, 200);
    
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
    }

    function resetZoom() {
        let processedData = data.slice();
        if (data.length > NUMBER_OF_TICK_DISPLAYED) {
            const step = Math.floor(data.length / (NUMBER_OF_TICK_DISPLAYED-1) );
            processedData =  data.filter((_: any, index: number) => index % step === 0);
        }
        setData(data);
        setZoomState({...zoomState, 
            data:processedData,
            left: data[0].DateHeureMesure,
            right: data[data.length-1].DateHeureMesure
        });
        setDataZoomed(false)
    }

    function zoom() {
        console.log("zoom")

        setAnimation(false);
        var { refAreaLeft, refAreaRight } = zoomState;
        const data_tmp = data.slice();
    
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
        var finderStart:number = data_tmp.findIndex(obj => obj.DateHeureMesure === refAreaLeft);
        if (finderStart === -1) finderStart = 0;

        var finderEnd:number = data_tmp.findIndex(obj => obj.DateHeureMesure === refAreaRight);
        if (finderEnd === -1) finderEnd = data_tmp.length - 1;

        let processedData = data.slice(finderStart, finderEnd+1);
        if (processedData.length > NUMBER_OF_TICK_DISPLAYED) {
            const step = Math.floor(processedData.length / (NUMBER_OF_TICK_DISPLAYED-1) );
            processedData =  processedData.filter((_: any, index: number) => index % step === 0);
        }
        setZoomState({...zoomState, 
            data:processedData,
            left: processedData[0].DateHeureMesure,
            right: processedData[processedData.length-1].DateHeureMesure,
            refAreaLeft: '',
            refAreaRight: ''
        });
        setDataZoomed(true)
        updateGraphic()
    }



    function updateGraphic(){

        console.log("updateGraphic")      
        var tmp_sliceData = zoomState.data.slice()
        if (tmp_sliceData.length > 0){

            // console.log(response.data);
            var tmp_xAxis:string[] = [];
            var dateFormatee;
            var tmp_Ymin=tmp_sliceData[0].Valeur;
            var tmp_Ymax=tmp_sliceData[0].Valeur;
            for(let mesure of tmp_sliceData){
                dateFormatee = (new Date(mesure.DateHeureMesure).getDate() < 10 ? '0' : '') + new Date(mesure.DateHeureMesure).getDate() + "/" + (new Date(mesure.DateHeureMesure).getMonth()+1 < 10 ? '0' : '') + (new Date(mesure.DateHeureMesure).getMonth()+1).toString()
                // console.log(Math.ceil(tmp_arrayData.length/5));
                if(tmp_sliceData.length>0){
                    if (!tmp_xAxis.includes(dateFormatee) && tmp_xAxis.length >= Math.ceil(tmp_sliceData.length/100)){
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
            // console.log("tmp_sliceData")
            // console.log(tmp_sliceData)
            // console.log("tmp_xAxis")
            // console.log(tmp_xAxis)
            setdataXaxis(tmp_xAxis);
            setconsigneSup(tmp_sliceData[0].Consigne_Sup);
            setconsigneInf(tmp_sliceData[0].Consigne_Inf);
            setUnite(tmp_sliceData[0].Unite);
            let chart_minimum = (tmp_Ymin < tmp_sliceData[0].Consigne_Inf)? tmp_Ymin: tmp_sliceData[0].Consigne_Inf
            let chart_maximum = (tmp_Ymax > tmp_sliceData[0].Consigne_Sup)? tmp_Ymax: tmp_sliceData[0].Consigne_Sup
            // console.log(chart_minimum)
            // console.log(chart_maximum)
            
            setYaxisMax(Math.ceil( chart_maximum+(0.25*(chart_maximum-chart_minimum)) ))
            setYaxisMin(Math.floor( chart_minimum-(0.3*(chart_maximum-chart_minimum)) ))
            setTimeout(() => { 
                setDataLoaded(true); 
                setStateNeedReload(false) 
            }, 200);

        }    
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
                                <div className="h-full rounded-lg bg-white text-center content-center text-base font-mono" onClick={()=>{console.log(zoomState.data.length);console.log(data.length);}}>
                                    Il n'y a pas de données à afficher
                                </div>
                            </div>
                            {stateNeedReload
                            ? 
                                <div className="bg-blacks/25 absolute z-10 h-full w-full rounded-xl flex items-center justify-center backdrop-blur-md">
                                    <div onClick={() => fetchData()}
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
                                    <div onClick={() => fetchData()}
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
                                    onMouseDown={(e) => {setZoomState(prevState => ({ 
                                        ...prevState,
                                        refAreaLeft: String(e.activeLabel || '')
                                    }));/*console.log("onMouseDown")*/}}
                                    onMouseMove={(e) => {zoomState.refAreaLeft && setZoomState(prevState => ({
                                        ...prevState,
                                        refAreaRight: String(e.activeLabel || '')
                                    }));/*console.log("onMouseMove")*/}}
                                    // // eslint-disable-next-line react/jsx-no-bind
                                    onMouseUp={zoom.bind(this)}
                                    // onMouseUp={zoom.bind(this)}
                                >
                                    <defs>
                                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FFBD50" stopOpacity={0.1}/>
                                            <stop offset="100%" stopColor="#FFBD50" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorUv_red_light" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#C62128" stopOpacity={0.2}/>
                                            <stop offset="100%" stopColor="#C62128" stopOpacity={0.05}/>
                                        </linearGradient> 
                                        {/* <linearGradient id="colorUv_red" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0.01%" stopColor="#E5202D" stopOpacity={0.5}/>
                                            <stop offset="2%" stopColor="#E5202D" stopOpacity={0.8}/>
                                            <stop offset="100%" stopColor="#E5202D" stopOpacity={0.2}/>
                                        </linearGradient> */}
                                        <linearGradient id="colorUv_red2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0" stopColor="#E5202D" stopOpacity={1}/>
                                            <stop offset="100%" stopColor="#E5202D" stopOpacity={1}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="DateHeureMesure" interval={0} allowDuplicatedCategory={true} allowDataOverflow={false} tick={{ dx: 5 }} tickMargin={30} angle={-90} mirror axisLine={false} padding="no-gap"  tickFormatter={(tick, index)=> {return (dataXaxis[index] != '00/00')?dataXaxis[index]:''}} />
                                    <YAxis hide type='number' domain={[() => YaxisMin,() => YaxisMax]}/>
                                    {/* <YAxis hide type='number' domain={[10,30]}/> */}
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
                                    
                                    {/* {eventHistory[0] != undefined && eventHistory[0].startDate != undefined && eventHistory[0].endDate != undefined ? (
                                        <ReferenceArea x1={eventHistory[0].startDate} x2={eventHistory[0].endDate} opacity={0.2} fill="#49aee0" strokeOpacity={1} strokeWidth={1}/>
                                    ) : null} */}

                                    <Area type="monotone" dataKey="Valeur" stroke="#FFBD50" strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" activeDot={customActiveDotGraph} isAnimationActive={isAnimated}/>
                                    <Area connectNulls type="monotone" dataKey="Valeur_2" stroke="#E5202D" strokeWidth={eventHistory[0] != undefined && eventHistory[0].areaOrline=='line'?'0':'2'} dot={false} activeDot={{r: 7 }}  fillOpacity={1} fill={eventHistory[0] != undefined && eventHistory[0].areaOrline=='line'?'url(#colorUv_red2)':'url(#colorUv_red_light)'}  isAnimationActive={isAnimated}/>

                                    {zoomState.refAreaLeft && zoomState.refAreaRight ? (
                                        <ReferenceArea x1={zoomState.refAreaLeft} x2={zoomState.refAreaRight} opacity={0.2} fill="#49aee0" strokeOpacity={1} strokeWidth={1}/>
                                    ) : null}

                                    
                                </AreaChart>
                            </ResponsiveContainer>

                            <div className="absolute left-full -translate-x-full text-right py-3 px-4 font-mono">
                                <div className="flex items-center justify-end whitespace-nowrap">
                                    <Button 
                                        size='sm'
                                        className={`${isDataZoomed?'opacity-100 pointer-events-auto':'opacity-0 pointer-events-none'} transition-opacity min-w-14 max-w-17 z-50 rounded-full text-[0.90rem] bg-white border-[#d6d6d6] border-1 font-sans mr-5`}
                                        disableRipple
                                        onPress={() => resetZoom()}
                                    >
                                        Réinitialiser le zoom
                                    </Button>
                                    Historique des mesures du {ZonedDateTimeToString(fromDate(new Date(zoomState.left?zoomState.left:data[data.length-1].DateHeureMesure), "CET"))} au {ZonedDateTimeToString(fromDate(new Date(zoomState.right?zoomState.right:data[0].DateHeureMesure), "CET"))}
                                </div>
                                <div>
                                    Dernière mesure du {ZonedDateTimeToString(fromDate(new Date(data[data.length-1].DateHeureMesure), "CET"), 1)} : <b>{data[data.length-1].Valeur}{data[data.length-1].Unite}</b>
                                </div>
                            </div>
                        </>
                    }     
                </>
            :  
                <Skeleton className={`rounded-lg h-full transition ${isDataLoaded?'opacity-0':'opacity-100'}`}>
                    <div className="h-full rounded-lg "></div>
                </Skeleton>
            }         
        </div>
    );
}

