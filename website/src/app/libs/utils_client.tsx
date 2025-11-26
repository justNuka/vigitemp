'use client'

import { ZonedDateTime } from "@internationalized/date";


// http://www.dte.web.id/2013/02/event-mouse-wheel.html

// (function() {
    export function scrollHorizontally(e:WheelEvent, element:HTMLElement) {
        // console.log("scroll")
    
        e = e;
        var delta = Math.max(-1, Math.min(1, (e.deltaY || -e.detail)));
        // console.log("delta: " + delta)
        element.scrollLeft += (delta*400); // Multiplied by 40
    }

    export function ZonedDateTimeToString(date:ZonedDateTime, typephrase:number = 0){
            let tmp:string = "";
            tmp+=(date.day < 10)?"0"+date.day: date.day;
            tmp+="/";
            tmp+=(date.month < 10)?"0"+date.month: date.month;
            tmp+="/";
            tmp+=date.year;
            tmp+=" ";
            if(typephrase == 1) {
                tmp+="à"
                tmp+=" "
            }
            tmp+=(date.hour < 10)?"0"+date.hour: date.hour;
            tmp+=":";
            tmp+=(date.minute < 10)?"0"+date.minute: date.minute;
    
            return tmp;
        }

// })();

  
// export formatDate;