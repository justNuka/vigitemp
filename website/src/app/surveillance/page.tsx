'use client'

import { useEffect } from "react";
import ButtonScrollToTop from "@/app/components/buttonScrollToTop";
import GridMonitoringGraphs from "@/app/components/grid-monitoring-graphs";
// import { setLocalIP } from "@/app/libs/utils_server";
// import axios from "axios";

export default function Surveillance() {

    useEffect(() => {
        // axios.get('/api/getIP')
        //     .then((res_api) => {
        //         // console.log(res_api);
        //         setLocalIP(res_api.data);
        // })
        // .catch(error => {
        //     console.error("Error fetching data:", error);
        // });
    }, []);

    return (
        <>
            <main className="h-full pt-32 px-[5%] pb-12">
                <ButtonScrollToTop/>
                <GridMonitoringGraphs/>
            </main>
        </>
    )
}