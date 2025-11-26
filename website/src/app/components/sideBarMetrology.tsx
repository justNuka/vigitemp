'use client'

import {  Tab, Tabs } from "@heroui/react";
import { Link, useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";

export default function SideBarMetrology() {

    const pathname = usePathname();
    const router = useTransitionRouter();

    return (
        <div className="bg-white fixed flex flex-col shrink-0 flex-grow left-0 bottom-0 h-full pt-20 w-[18rem] shadow-lg outline-1 outline-gray-100 outline content-center align-middle items-center">
            
            <Tabs 
                isVertical
                selectedKey={pathname} 
                size="lg" fullWidth 
                onSelectionChange={(key)=> router.push(key.toString())}
                classNames={{
                    base:"justify-center items-center flex-grow group-data-[selected=true]:text-red-500 group-data-[selected=false]:opacity-100 group-data-hover-[unselected=true]:text-black data-[hover-unselected=true]:opacity-100",
                    panel:"flex-grow group-data-[selected=false]:opacity-100 group-data-hover-[unselected=true]:text-black data-[hover-unselected=true]:opacity-100",
                    tabList:"w-full px-5 flex-grow group-data-[selected=false]:opacity-100 bg-white group-data-hover-[unselected=true]:text-black data-[hover-unselected=true]:opacity-100",
                    tabWrapper:"w-full flex-grow group-data-[selected=false]:opacity-100 group-data-hover-[unselected=true]:text-black data-[hover-unselected=true]:opacity-100",
                    tab:"w-full flex-grow group-data-[selected=false]:opacity-100 group-data-hover-[unselected=true]:text-black group-[hover=true]:text-black data-[hover-unselected=true]:opacity-100",
                    cursor:"rounded-lg flex-grow group-data-[selected=true]:opacity-100 group-data-[selected=true]:bg-[#e5e7ebc4] group-data-[selected=true]:border-none group-data-[unselected=true]:bg-[#e5e7eb00] group-data-hover-[unselected=true]:text-black data-[hover-unselected=true]:opacity-100",
                    tabContent:"rounded-lg text-gray-950 group-data-[selected=true]:text-gray-950 group-data-[selected=true]:opacity-100 group-data-hover-[unselected=true]:text-black data-[hover-unselected=true]:opacity-100",
                }}
            >
                <Tab key="/metrologie/lieux" title="Lieux"/>
                <Tab key="/metrologie/alarmes" title="Alarmes"/>
                <Tab key="/metrologie/calibrages" title="Calibrages"/>
                <Tab key="/metrologie/sondes" title="Sondes"/>
            </Tabs>
            <div className="w-full h-44 bg-[#FFBD50] rounded-t-xl opacity-100 flex flex-col justify-between text-center text-black">
                <div className="text-left pt-3 pl-3 tracking-tight text-medium">
                    Prochain étalonnage
                </div>
                <div className="text-left text-[32px] leading-normal pl-3 font-black">
                    25 septembre <br />
                    2025
                </div>
                <Link 
                href={"/metrologie/calibrages"}
                className="tracking-tight text-medium cursor-pointer bg-white bg-opacity-0 h-10 flex items-center justify-center hover:cursor-pointer hover:bg-opacity-50 transition ease-in duration-100">
                    Voir détails
                </Link>
            </div>
        </div>
    );
};