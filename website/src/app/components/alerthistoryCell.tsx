'use client'
// import { Button, getKeyValue, Skeleton, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
// import axios from "axios";
import { useState } from "react";
import {ZonedDateTime} from "@internationalized/date";
import { ZonedDateTimeToString } from "@/app/libs/utils_client";

const rows = [
    {
      key: "1",
      datestart:"2025-03-10 11:35:54.302",
      endstart:"2025-03-10 12:35:54.302",
      alert: "Consigne haute dépassé",
    },
    {
      key: "2",
      datestart:"2025-03-02 15:10:49.291",
      endstart:"2025-03-07 11:35:54.302",
      alert: "Désactivation de l'alarme",
    },
    {
      key: "3",
      datestart:"2025-02-20 12:07:07.132",
      endstart:"",
      alert: "Changement de consigne haute (22°C -> 25°C)",
    },
    {
      key: "4",
      datestart:"2025-02-20 12:07:15.132",
      endstart:"",
      alert: "Changement de consigne basse (12°C -> 15°C)",
    },
  ];
  
  const columns = [
    {
      key: "alert",
      label: "Alert",
    }
  ];
  


export default function AlertHistoryCell(this: any, { _startDate, _endDate, _alert, _areaOrLine } : {
    _startDate:ZonedDateTime|string,
    _endDate:ZonedDateTime|string,
    _alert:string
    _areaOrLine:string
}){

    const [isDataLoaded, setDataLoaded] = useState<boolean>(false);

    // useEffect(()=>{
    //     console.log(_startDate)
    //     console.log(typeof _startDate === 'string' ? _startDate : ZonedDateTimeToString(_startDate));
    // }, [])


    return (
        <div className="flex flex-col">
            <div className="text-xs text-gray-500 font-medium">
                {typeof _startDate === 'string' ? _startDate : ZonedDateTimeToString(_startDate)}
                {typeof _endDate === 'string' ? _endDate : " -> " + ZonedDateTimeToString(_endDate)}
            </div>
            <div>
                {_alert}
            </div>
        </div>
    );
}

