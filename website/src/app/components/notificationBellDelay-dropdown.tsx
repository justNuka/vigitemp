'use client'
import React, { useEffect, useState } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Tooltip} from "@heroui/react";
import { Bell, BellOff, ChevronDown, Moon } from "lucide-react";
import axios from "axios";
import { POST_disableNotification, POST_enableNotification } from "@/app/libs/utils_server";
import { fromDate } from "@internationalized/date";

// function DateToString(date:ZonedDateTime, typephrase:number = 0){
//     let tmp:string = "";
//     tmp+=(date.day < 10)?"0"+date.day: date.day;
//     tmp+="/";
//     tmp+=(date.month < 10)?"0"+date.month: date.month;
//     tmp+="/";
//     tmp+=date.year;
//     tmp+=" ";
//     if(typephrase == 1) {
//         tmp+="à"
//         tmp+=" "
//     }
//     tmp+=(date.hour < 10)?"0"+date.hour: date.hour;
//     tmp+=":";
//     tmp+=(date.minute < 10)?"0"+date.minute: date.minute;

//     return tmp;
// }

// const getTimeBetweenDxates = (startDate: Date, endDate: Date) => {
//     console.log("getTimeBdsdsdetweenDates startdate : "+startDate.getTime())
//     console.log("getTimeBetwedsdsdenDates enddate : "+endDate.getTime())
//     if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//         console.warn("Invalid dates provided to getTimeBetweenDates");
//         return { seconds: 0, minutes: 0, hours: 0, days: 0 };
//     }
    
//     const diffMs = endDate.getTime() - startDate.getTime();
//     const seconds = Math.floor(diffMs / 1000);
//     const minutes = Math.floor(seconds / 60);
//     const hours = Math.floor(minutes / 60);
//     const days = Math.floor(hours / 24);
    
//     return { 
//         seconds: seconds %60,
//         minutes: minutes %60,
//         hours: hours %24,
//         days 
//     };
// };
      

export default function NotificationBellDelay({ idLieu, isNotified, setNotified, infosLieux, setInfosLieu } : {
    idLieu:number,
    isNotified:boolean,
    setNotified:(p_1:boolean)=>void,
    infosLieux: any,
    setInfosLieu: (p_1:any)=>void
}) {

    // const [days, setDays] = useState<number | null>(null);
    // const [hours, setHours] = useState<number | null>(null);
    // const [minutes, setMinutes] = useState<number | null>(null);
    const [seconds, setSeconds] = useState<number>(0);

    const getTimeDifference = (p_endDate?: string):boolean => {
        var startDate = new Date();
        let endDate;
        if (p_endDate != undefined){
            endDate = new Date(Date.parse(p_endDate));
        }else{
            endDate = new Date(Date.parse(infosLieux.DateHeure_reactivationAlarme));
        }
        // let endDate = new Date(Date.parse(deadline));

        // console.log("getTime startdate : "+startDate.getTime())
        if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            // console.warn("Invalid dates provided to getTimeBetweenDates");
            return false;
        }
        
        console.log("getTime enddate : "+endDate.getTime())
    
        const diffMs = endDate.getTime() - startDate.getTime();
        const seconds = Math.floor(diffMs / 1000);
        // const minutes = Math.floor(seconds / 60);
        // const hours = Math.floor(minutes / 60);
        // const days = Math.floor(hours / 24);
        
        // setDays(days);
        // setHours(hours);
        // setMinutes(minutes);
        setSeconds(seconds);
        return true;

        // return { 
        //     seconds: seconds %60,
        //     minutes: minutes %60,
        //     hours: hours %24,
        //     days 
        // };
    };
    

    useEffect(() => {
        const res: boolean = getTimeDifference(undefined);
        if (res){
            const interval = setInterval(() => {
                // let tmp_seconds = (seconds !== null ? seconds - 1 : 0);
                // console.log(tmp_seconds);
                // if(seconds != null)
                // console.log("timer");
                // if(seconds > 0 )
                    setSeconds(seconds => {
                        if (seconds >0){
                            return (seconds !== null ? seconds - 1 : 0)
                        }
                        enableNotification();
                        clearInterval(interval);
                        return 0;
                    });
                // setMinutes(seconds => (seconds !== null ? seconds - 1 : 0));
                // setHours(tmp_seconds => (tmp_seconds !== null ? Math.floor(tmp_seconds / 60 / 60) : 0));
                // setDays(tmp_seconds => (tmp_seconds !== null ? Math.floor(tmp_seconds / 60 / 60 / 24) : 0));
            }, 1000);
            return () => clearInterval(interval);
        }
    },[infosLieux.DateHeure_reactivationAlarme]);

    // useEffect(() => {
    //     console.log("useeffect")
    //     console.log(infosLieux)
    // }, [infosLieux]);
    // useEffect(() => {
    //     console.log("seconds")
    //     console.log(seconds)
    //     // if(seconds == 0){
    //     //     enableNotification();
    //     // }
    // }, [seconds]);
    // useEffect(() => {
    //     console.log("minutes")
    //     console.log(seconds)
    // }, [minutes]);
    // const [isNotified, setNotified] = useState<boolean>(false);
    // const [dateReactivationAlarme, setDateReactionAlarme] = useState<boolean>(false);

    function addHours(date:Date, hours: number) {
        const hoursToAdd = hours * 60 * 60 * 1000;
        date.setTime(date.getTime() + hoursToAdd);
        return date;
    }

    const enableNotification = () => {
        axios.get('/api/mesures/'+idLieu, {
            params : {
                rowNumber:1
            }
        })
        .then((res_api) => {
            console.log(res_api.data)
            console.log(res_api.data[0].Valeur)
            if(res_api.data[0].Valeur < res_api.data[0].Consigne_Inf || res_api.data[0].Valeur > res_api.data[0].Consigne_Sup){
                axios.get('/api/postes_clients')
                .then((res_api) => {
                    console.log(res_api.data)
                    for (let index = 0; index < res_api.data.length; index++) {
                        const element = res_api.data[index].AdresseIPConnexion;
                        console.log(element);
                        POST_enableNotification(element, idLieu);                        
                    }
                    console.log("boucle for terminée")
                })
                .catch(error => {
                    console.error("Error fetching data:", error);
                }); 
            }
            axios.post('/api/lieux/alerte/'+idLieu, null, {
                params: {
                    value:"true"
                }
            })
            .then(()=>{
                setInfosLieu({ ...infosLieux, DateHeure_reactivationAlarme: null })
                setNotified(true);
            })
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        }); 
    } 

    const disableNotification = () => {
        axios.get('/api/postes_clients')
        .then((res_api) => {
            console.log(res_api.data)
            for (let index = 0; index < res_api.data.length; index++) {
                const element = res_api.data[index].AdresseIPConnexion;
                console.log(element);
                POST_disableNotification(element, idLieu);                
            }
            axios.post('/api/lieux/alerte/'+idLieu, null, {
                params: {
                    value:"false"
                }
            })
            .then(()=>{
                setInfosLieu({ ...infosLieux, DateHeure_reactivationAlarme: null })
                setNotified(false);
            })
            console.log("boucle for terminée")
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        }); 
    } 

    const setSnoozeTime = (delayInHours: any) => {
        console.log(Array.from(delayInHours)[0]);


        axios.get('/api/postes_clients')
        .then((res_api) => {
            console.log(res_api.data)
            for (let index = 0; index < res_api.data.length; index++) {
                const element = res_api.data[index].AdresseIPConnexion;
                console.log(element);
                POST_disableNotification(element, idLieu);                
            }
            axios.post('/api/lieux/alerte/'+idLieu, null, {
                params: {
                    snoozeDelay: Array.from(delayInHours)[0]
                }
            })
            .then(()=>{
                console.log(infosLieux)
                const date:Date = new Date();
                const newDate1 = addHours(date, parseInt(Array.from(delayInHours)[0] as string));
                let newDate1_string: string = fromDate(newDate1, "CET").toDate().toISOString()
                console.log(newDate1)
                setInfosLieu({ ...infosLieux, DateHeure_reactivationAlarme: newDate1_string })
                setNotified(false)
                getTimeDifference(newDate1_string)
                console.log("setInfosLieu")
                // console.log(infosLieux)
            })
            console.log("boucle for terminée: ")
            console.log(infosLieux)
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        }); 

        // axios.post('/api/lieux/alerte/'+idLieu, null, {
        //     params: {
        //         snoozeDelay: Array.from(delayInHours)[0]
        //     }
        // }).then(

        // )
    }



  return (
    <div className="cursor-pointer flex-row flex items-center justify-between hover:outlidne-1 hover:outsline hover:outlsine-[#d6d6d6] rounded-xl outdline outline-1 outline-black/25">
        <div className="hover:bg-white/75 flex min-w-8 items-center justify-between roundsed-full transition-colors rounded-l-xl">
            <Tooltip 
                    content={
                    isNotified?
                        "Vous recevez des alertes pour ce lieu"
                    :
                        infosLieux.DateHeure_reactivationAlarme == null?
                            "Vous ne recevez pas d'alertes pour ce lieu"
                        :
                            (() => {
                                // const timeDiff = getTimeBetweenDates(
                                //     new Date(),
                                //     new Date(Date.parse(infosLieux.DateHeure_reactivationAlarme))
                                // );
                                // return `Les alertes seront réactivées dans ${timeDiff.hours}h${timeDiff.minutes}m` + `Les alertes seront réactivées dans ${hours}h${minutes}m${seconds}sec`;
                                return `Les alertes seront réactivées dans 
                                        ${Math.floor((seconds+60)/3600/24) > 0?Math.floor((seconds+60)/3600/24)+' jours ':''}
                                        ${Math.floor((seconds+60)/3600%24) > 0?Math.floor((seconds+60)/3600%24)+'h':''}
                                        ${Math.floor((seconds+60)/60%60) > 0?Math.floor((seconds+60)/60%60)+'m ':''}
                                        `;
                                        // ${seconds?seconds%60+'s':'pas longtemps'}
                                        // `;
                            })()                            // "Les alertes pour ce lieu seront réactivées dans "+DateToString(fromDate(new Date(infosLieux.DateHeure_reactivationAlarme), "CET"))
                            
                } 
                showArrow={true} 
                placement="bottom"
            >
                <Button 
                    className='px-0 mx-0 min-w-10 data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent bg-transparent'
                    disableRipple
                    startContent={
                        isNotified?
                            <Bell size={22} color="black"/>
                        :
                            infosLieux.DateHeure_reactivationAlarme == null?
                                <BellOff size={22} color="black"/>
                            :
                                <div>
                                    <BellOff size={22} color="black" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                                    <Moon size={20} color="black" className="absolute top-1/3 left-2/3 -translate-x-1/2 -translate-y-1/2"/>
                                </div >
                    }
                    onPress={ () => {
                        if(!isNotified == true){
                            enableNotification();
                        } else if(!isNotified == false){
                            disableNotification();
                        }
                        setNotified(!isNotified);}
                    }
                />
            </Tooltip>
        </div>
        <div className="hover:bg-white/75 rounded-r-xl transition-colors">
            <Dropdown>
                <DropdownTrigger>
                    <Button 
                        className='px-0 mx-0 min-w-6 data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent bg-transparent'
                        disableRipple
                        startContent={
                            <ChevronDown size={25}/>
                        }
                    />
                </DropdownTrigger>
                <DropdownMenu
                    disallowEmptySelection
                    aria-label="Single selection example"
                    // selectedKeys={selectedKeys}
                    selectionMode="single"
                    variant="flat"
                    onSelectionChange={(keys) => setSnoozeTime(keys)}
                >
                    <DropdownItem key="1">Désactiver pendant 1h</DropdownItem>
                    <DropdownItem key="4">Désactiver pendant 4h</DropdownItem>
                    <DropdownItem key="12">Désactiver pendant 12h</DropdownItem>
                    <DropdownItem key="24">Désactiver pendant 24h</DropdownItem>
                    <DropdownItem key="168">Désactiver pendant 1 semaine</DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
    </div>
  );
}
