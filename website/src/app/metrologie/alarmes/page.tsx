'use client'

import SideBar from "@/app/components/sideBarMetrology";
import CardAlarm from '@/app/components/card-alarm';
import { Grid3x3, List } from "lucide-react";

// import { useHorizontalScroll } from "@/app/libs/utils_client";
import { scrollHorizontally } from "@/app/libs/utils_client";
import { useEffect, useState } from 'react';
// import Metrologie from '../page';
import { Tab, Tabs } from "@heroui/react";
import ListAlarms from '@/app/components/list-Alarms';

export default function Alarmes() {

    // const scrollRef:MutableRefObject<undefined> = (useHorizontalScroll());
    

    const alarms = [
        {
            NomLieu: 'IN25KB',
            description: "L'alarme a été déclenchée par un dépassement de la tolérance supérieure.",
            date: "Depuis le 24/04/2024 à 23h44",
            type:'metrologique',
            status:'en cours'
        },
        {
            NomLieu: 'IN25KC',
            description: "L'alarme a été déclenchée par une panne de capteur.",
            date: "Depuis le 25/04/2024 à 08h15",
            type:'technique',
            status:'en cours'
        },
        {
            NomLieu: 'IN25KD',
            description: "L'alarme a été déclenchée par un problème de connectivité.",
            date: "Depuis le 26/04/2024 à 10h05",
            type:'technique',
            status:'en cours'
        },
        {
            NomLieu: 'IN25KZ',
            description: "L'alarme a été déclenchée par une panne de capteur.",
            date: "Depuis le 25/04/2024 à 08h15",
            type:'technique',
            status:'en cours'
        },
        {
            NomLieu: 'IN25KX',
            description: "L'alarme a été déclenchée par un problème de connectivité.",
            date: "Depuis le 26/04/2024 à 10h05",
            type:'technique',
            status:'en cours'
        },
        {
            NomLieu: 'IN25KY',
            description: "L'alarme a été déclenchée par une panne de capteur.",
            date: "Depuis le 25/04/2024 à 08h15",
            type:'technique',
            status:'en cours'
        },
        {
            NomLieu: 'IN25KW',
            description: "L'alarme a été déclenchée par un problème de connectivité.",
            date: "Depuis le 26/04/2024 à 10h05",
            type:'technique',
            status:'en cours'
        }
    ];
    const alarms2 = [
        {
            NomLieu: 'IN25KE',
            description: "L'alarme a été déclenchée par un dépassement de la tolérance supérieure.",
            date: "Depuis le 24/04/2024 à 23h44",
            type:'metrologique',
            status:'attente acquittement'
        },
        {
            NomLieu: 'IN25KF',
            description: "L'alarme a été déclenchée par une panne de capteur.",
            date: "Depuis le 25/04/2024 à 08h15",
            type:'technique',
            status:'attente acquittement'
        },
        {
            NomLieu: 'IN25KG',
            description: "L'alarme a été déclenchée par un problème de connectivité.",
            date: "Depuis le 26/04/2024 à 10h05",
            type:'technique',
            status:'attente acquittement'
        },
        {
            NomLieu: 'IN25KH',
            description: "L'alarme a été déclenchée par un dépassement de la tolérance supérieure.",
            date: "Depuis le 24/04/2024 à 23h44",
            type:'metrologique',
            status:'attente acquittement'
        },
        {
            NomLieu: 'IN25KI',
            description: "L'alarme a été déclenchée par une panne de capteur.",
            date: "Depuis le 25/04/2024 à 08h15",
            type:'technique',
            status:'attente acquittement'
        },
        {
            NomLieu: 'IN25KJ',
            description: "L'alarme a été déclenchée par un problème de connectivité.",
            date: "Depuis le 26/04/2024 à 10h05",
            type:'technique',
            status:'attente acquittement'
        },
        {
            NomLieu: 'IN25KK',
            description: "L'alarme a été déclenchée par un dépassement de la tolérance supérieure.",
            date: "Depuis le 24/04/2024 à 23h44",
            type:'metrologique',
            status:'attente acquittement'
        },
        {
            NomLieu: 'IN25KL',
            description: "L'alarme a été déclenchée par une panne de capteur.",
            date: "Depuis le 25/04/2024 à 08h15",
            type:'technique',
            status:'attente acquittement'
        },
        {
            NomLieu: 'IN25KM',
            description: "L'alarme a été déclenchée par un problème de connectivité.",
            date: "Depuis le 26/04/2024 à 10h05",
            type:'technique',
            status:'attente acquittement'
        }
    ];

    useEffect(()=>{
        const carousel1 = document.getElementById('carousel-1');
        const carousel2 = document.getElementById('carousel-2');
        
        if (carousel1 && carousel1.addEventListener) {
            carousel1.addEventListener("wheel", (event) => {scrollHorizontally(event, carousel1)});
        }
        if (carousel2 && carousel2.addEventListener) {
            carousel2.addEventListener("wheel", (event) => {scrollHorizontally(event, carousel2)});
        }
    },[])
    // const carousel = document.getElementById('carousel');

    const viewModeChoices:String[]= [
        'carousel',
        'liste'
    ]

   
    const [viewMode, setViewMode] = useState<string>('carousel');

    
    return (
        <>
            <main className="h-screen pt-28 px-24 pb-12">
                <SideBar />
                <div className='ml-[288px] flex flex-col relative h-full gap-2'>
                    <div className='text-end'>
                        <Tabs aria-label="Options" onSelectionChange={(key)=> {setViewMode(key.toString());console.log(viewMode);}}>
                            <Tab 
                                className='py-0 px-5'
                                key="carousel" 
                                title={
                                    <div className="flex items-center space-x-2">
                                        <Grid3x3 size={20} color='dimgray'/>
                                    </div>
                                } 
                            />
                            <Tab 
                                className='py-0 px-5'
                                key="liste" 
                                title={
                                    <div className="flex items-center space-x-2">
                                        <List size={20} color='dimgray'/>
                                    </div>
                                } 
                            />
                        </Tabs>
                    </div>
                    {(viewMode=='carousel')?
                    <div className={`h-full w-full flex flex-col ${viewMode=='carousel'?'opacity-100':'opacity-0'} transition-opacity`}>
                        
                        <div className='relative flex flex-col h-full gap-6 justify-center'>
                            <div id='alarmesEnCours' className='bg-gray-50 grow flex-1 rounded-3xl shadow-md outline outline-1 outline-gray-200 flex flex-col'>
                                <div id='titre' className='bg-transparent h-[17%] rounded-3xl outline-gray-200 flex flex-row items-end pl-7 font-black text-3xl'>
                                    Alarmes en cours
                                </div>
                                {/* Carousel section, set to grow and take up remaining space */}
                                <div id='carousel-1' className='bg-transparent flex-grow rounded-3xl outline-gray-200 flex flex-row gap-5 bg-slate-300 p-5 pl-6 overflow-x-scroll scrollbar-hide scroll-smooth'>
                                {alarms.map((alarm, index) => (
                                    <CardAlarm
                                        key={index}
                                        type={alarm.type}
                                        NomLieu={alarm.NomLieu}
                                        descriptionAlarme={alarm.description}
                                        dateAlarme={alarm.date}
                                    />
                                ))}                        
                                </div>
                            </div>
                            <div id='alarmesNonAcquites' className='bg-gray-50 grow flex-1 rounded-3xl shadow-md outline outline-1 outline-gray-200 flex flex-col'>
                                <div id='titre' className='bg-transparent h-[17%] rounded-3xl outline-gray-200 flex flex-row items-end pl-7 font-black text-3xl'>
                                    Alarmes non acquittés
                                </div>
                                <div id='carousel-2' className='bg-transparent flex-grow rounded-3xl outline-gray-200 flex flex-row gap-5 bg-slate-300 p-5 pl-6 overflow-x-scroll scrollbar-hide scroll-smooth'>
                                {alarms2.map((alarm, index) => (
                                    <CardAlarm
                                        key={index}
                                        type={alarm.type}
                                        NomLieu={alarm.NomLieu}
                                        descriptionAlarme={alarm.description}
                                        dateAlarme={alarm.date}
                                    />
                                ))}                        
                                </div>
                            </div>
                        </div>
                    </div>
                    :
                    // <ListAlarms/>
                    <div className={`h-full w-full pb-12 ${viewMode=='liste'?'opacity-100':'opacity-0'} transition-opacity`}>
                        <ListAlarms data={[...alarms, ...alarms2]}/>
                    </div>
                        
                    //     {/* <div className=' h-full gap-6'>
                    //         {/* <div id='alarmesNonAcquites' className='bg-gray-50 grow flex-1 rounded-3xl shadow-md outline outline-1 outline-gray-200 flex flex-col'>
                    //             <div id='titre' className='bg-transparent h-[17%] rounded-3xl outline-gray-200 flex flex-row items-end pl-7 font-black text-3xl'>
                    //                 Alarmes non acquittés
                    //             </div>
                    //             <div id='carousel-2' className='bg-transparent flex-grow rounded-3xl outline-gray-200 flex flex-row gap-5 bg-slate-300 p-5 pl-6 overflow-x-scroll scrollbar-hide scroll-smooth'>
                    //             {alarms2.map((alarm, index) => (
                    //                 <CardAlarm
                    //                     key={index}
                    //                     metrologique={alarm.TypeMetroOUTechnique}
                    //                     technique={!alarm.TypeMetroOUTechnique}
                    //                     NomLieu={alarm.NomLieu}
                    //                     descriptionAlarme={alarm.descriptionAlarme}
                    //                     dateAlarme={alarm.dateAlarme}
                    //                 />
                    //             ))}                        
                    //             </div>
                    //         </div> 
                    //     </div> */}
                    // </div>
                    
                    }
                </div>
            </main>
        </>
    )
}