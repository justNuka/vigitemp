'use client'

import { use, useEffect, useLayoutEffect, useState } from "react";
import axios from "axios";
import { Button, DatePicker, Divider, Skeleton } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useTransitionRouter } from "next-view-transitions";
import {fromDate, getLocalTimeZone, now, ZonedDateTime} from "@internationalized/date";
import {I18nProvider} from "@react-aria/i18n";
import NotificationBellDelay from "@/app/components/notificationBellDelay-dropdown";
import InfoTooltipLieu from "@/app/components/infoTooltip-lieu";
import SideBarAlertHistoric from "@/app/components/sideBar-alert-history";
// import MonitoringGraphFullScreen from "@/app/components/monitoring-graph-fullScreen";
// import MonitoringGraphFullScreen_EventHighlight from "@/app/components/monitoring-graph-fullScreen-eventHighlight";
// import MonitoringGraphFullScreenZoomRefine from "@/app/components/monitoring-graph-fullScreen-zoom-refine";
import MonitoringGraphFullScreenZoomRefineCleanUp from "@/app/components/monitoring-graph-fullScreen-zoom-refine_cleanUp";
// import MonitoringGraphFullScreen_EventHighlightCopy from "@/app/components/monitoring-graph-fullScreen-eventHighlight copy";


interface interface_infosLieux {
    IdLieu: string; // Assuming there's a unique ID property
    IdModule: string; // Assuming there's a unique ID property
    IdSonde: string; // Assuming there's a unique ID property
    SondeNumeroSerie:string;
    Nom_Lieu:string;
    ModuleNumeroSerie:string;
    notification_active:boolean;
    DateHeure_reactivationAlarme:string;

    // Add other properties if needed
}

interface type_EventHistory {
    alert?: string;
    endDate?: string;
    startDate?: string;
    key?: number;
    // Add other properties if needed
}


export default function Surveillance(
    { params }: { params: Promise<{ idLieu: number }>}
) {
    const {idLieu} = use(params); // user id
    // const [eventHistory, setEventHitory] = useState<type_EventHistory[]>([]);
    const [infosLieux, setInfosLieux] = useState<interface_infosLieux>();
    const [isDataLoaded, setDataLoaded] = useState<boolean>(false);
    const [isNotified, setNotified] = useState<boolean>(false);
    const [isDataNeedReload, setDataNeedReload] = useState<boolean>(false);
    const [isHistorySizeLocked, setHistorySizeLocked] = useState<boolean>(false);
    const [eventHistory, setEventHitory] = useState<type_EventHistory[]>([]);
    // const [data, setData] = useState<type_Data[]>([]);

    // useEffect(() => {
    //     console.log("useeffect")
    //     console.log(eventHistory)
    // }, [eventHistory]);

    useLayoutEffect(() => {
        axios.get('/api/lieux/getInfos/'+idLieu)
            .then((res_api) => {
                // console.log(res_api)
                setInfosLieux(res_api.data[0]);
                setNotified(res_api.data[0].notification_active)
                setDataLoaded(true);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
    }, []);
    useEffect(() => {
        var tmp_startDate = sessionStorage.getItem('startDate');
        var tmp_endDate = sessionStorage.getItem('endDate');
        
        if (tmp_startDate){
            // console.log("setstartDate" + fromDate(new Date(Date.parse(tmp_startDate)), 'CET'));
            setstartDate(fromDate(new Date(Date.parse(tmp_startDate)), 'CET'));
        }

        if (tmp_endDate){
            // console.log("setendDate" + fromDate(new Date(Date.parse(tmp_endDate)), 'CET'));
            setendDate(fromDate(new Date(Date.parse(tmp_endDate)), 'CET'));
        }

    }, []);

    const router = useTransitionRouter();

    const timeNow = now(getLocalTimeZone())
    // timeNow.subtract({ days: 7 })
    const [startDate, setstartDate] = useState<ZonedDateTime>(timeNow.subtract({ days: 7 }));
    const [endDate, setendDate] = useState<ZonedDateTime>(timeNow);


    return (
        <>
            <main className="h-screen pt-24 px-10 pb-8 relative">
                <div className="h-full flex flex-col">
                    {!isDataLoaded
                    ? 
                        
                      
                        <Skeleton className="rounded-lg h-[7%] my-3">
                            <div className="h-full rounded-lg bg-default-300" />
                        </Skeleton>
                    :
                    <>  
                        <div className="h-[10%] flex flex-row justify-between">
                            <div id="settings" className="h-full align-middle items-center flex flex-row gap-5">
                                <Button 
                                    className='transition-colors-opacity px-0 mx-0 min-w-14 min-h-10 rounded-full data-[hover=true]:bg-gray-50 group-data-[focus=true]:bg-white bg-white border-[#d6d6d6] border-1'
                                    disableRipple
                                    startContent={
                                        <ArrowLeft  size={25}/>
                                    }
                                    onPress={()=>router.push('/surveillance')}
                                />
                                <div className="font-black text-3xl text-black flex flex-row align-middle items-center gap-5">
                                    {/* Frigo labo 3 */}
                                    {infosLieux?.Nom_Lieu}
                                </div>
                                <InfoTooltipLieu moduleName={infosLieux?.ModuleNumeroSerie ?? ''} sondeName={infosLieux?.SondeNumeroSerie ?? ''}/>
                                <Divider orientation="vertical" className="h-[40%]"/>
                                <NotificationBellDelay idLieu={idLieu} isNotified={isNotified} setNotified={setNotified} infosLieux={infosLieux} setInfosLieu={setInfosLieux}/>
                            </div>
                            <div id="settings" inert = {false} className=" bg-background-date h-full align-middle items-center flex flex-row gap-3 bg-grxeen-500">
                                    <I18nProvider locale="fr-FR">
                                        <div>
                                            <DatePicker
                                                inert={false}
                                                hideTimeZone
                                                showMonthAndYearPickers
                                                defaultValue={now(getLocalTimeZone())}
                                                label="Début de l'historique"
                                                className="w-48"
                                                disableAnimation
                                                size="sm"
                                                radius="md"
                                                value={startDate}
                                                onChange={(_startDate) => {
                                                    if (_startDate) {
                                                        sessionStorage.setItem('startDate', _startDate.toDate().toISOString())
                                                        setstartDate(_startDate);
                                                        setDataNeedReload(true);
                                                    }
                                                }}
                                            />
                                        </div>
                                        
                                    </I18nProvider>
                                    <I18nProvider locale="fr-FR">
                                        <DatePicker
                                            inert={false}
                                            hideTimeZone
                                            showMonthAndYearPickers
                                            defaultValue={now(getLocalTimeZone())}
                                            label="Fin de l'historique"
                                            className="w-48"
                                            disableAnimation
                                            size="sm"
                                            radius="md"
                                            value={endDate}
                                            onChange={(_endDate) => {
                                                if (_endDate) {
                                                    setendDate(_endDate);
                                                    setDataNeedReload(true);
                                                }
                                            }}
                                        />
                                        
                                    </I18nProvider>
                            
                            </div>
                        </div>
                    </>
                    }     
                    
                    <div className="h-full w-full flex flex-row gap-2">
                        <MonitoringGraphFullScreenZoomRefineCleanUp NomLieu="kdkdk" idLieu={idLieu} stateNeedReload={isDataNeedReload} setStateNeedReload={setDataNeedReload} _startDate={startDate} _endDate={endDate} eventHistory={eventHistory} setEventHistory={setEventHitory}/>
                        {/* <MonitoringGraphFullScreen_EventHighlightCopy NomLieu="kdkdk" idLieu={idLieu} stateNeedReload={isDataNeedReload} setStateNeedReload={setDataNeedReload} _startDate={startDate} _endDate={endDate} eventHistory={eventHistory} setEventHistory={setEventHitory}/> */}
                        {/* <MonitoringGraphFullScreen NomLieu="kdkdk" idLieu={idLieu} stateNeedReload={isDataNeedReload} setStateNeedReload={setDataNeedReload} _startDate={startDate} _endDate={endDate} eventHistory={eventHistory} setEventHistory={setEventHitory}/> */}
                        {/* <MonitoringGraphFullScreen_EventHighlight NomLieu="kdkdk" idLieu={idLieu} stateNeedReload={isDataNeedReload} setStateNeedReload={setDataNeedReload} _startDate={startDate} _endDate={endDate} eventHistory={eventHistory} setEventHistory={setEventHitory}/> */}
                        {/* <MonitoringGraphFullScreen_EventHighlight NomLieu="kdkdk" idLieu={idLieu} stateNeedReload={isDataNeedReload} setStateNeedReload={setDataNeedReload} _startDate={startDate} _endDate={endDate} eventHistory={eventHistory} setEventHistory={setEventHitory}/> */}
                        {/* <MonitoringGraphFullScreenZoomRefine NomLieu="kdkdk" idLieu={idLieu} stateNeedReload={isDataNeedReload} setStateNeedReload={setDataNeedReload} _startDate={startDate} _endDate={endDate} eventHistory={eventHistory} setEventHistory={setEventHitory}/> */}
                        {!isDataLoaded
                        ? 
                            <Skeleton className="rounded-lg h-100% w-[1%] min-w-10">
                                <div className="h-full rounded-lg bg-default-300" />
                            </Skeleton>
                        :
                        <>
                            <div className="w-0 flex items-center z-10 mr-3">
                                <Button 
                                    className=' px-0 mx-0 min-w-10 min-h-14 rounded-full  group-data-[focus=true]:bg-white data-[hover=true]:opacity-100 opacity-hover:[data-hover=true]:opacity-100 bg-white border-[#d6d6d6] border-1'
                                    disableRipple
                                    startContent={
                                        <ArrowLeft size={25} className={`${isHistorySizeLocked?'rotate-180':'rotate-0'} transition-all`}/>
                                    }
                                    onPress={()=>setHistorySizeLocked(!isHistorySizeLocked)}
                                />
                            </div>
                            <SideBarAlertHistoric idLieu={idLieu} isHistorySizeLocked={isHistorySizeLocked} setHistorySizeLocked={setHistorySizeLocked} eventHistory={eventHistory} setEventHistory={setEventHitory} />
                        </>
                        }
                    </div>
                </div>
            </main>
        </>
    )
}