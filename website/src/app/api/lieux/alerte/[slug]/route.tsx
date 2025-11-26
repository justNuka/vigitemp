import { NextRequest, NextResponse } from "next/server";
import {pool_vigitemp} from "@/app/libs/mysql";



function addHours(date:Date, hours: number) {
    const hoursToAdd = hours * 60 * 60 * 1000;
    date.setTime(date.getTime() + hoursToAdd);
    return date;
}

export async function POST(
    request:  NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    // console.log()
    const params = await context.params;
    const {slug} = params; // user id 

    const url = new URL(request.url); 
    const searchParams = new URLSearchParams(url.searchParams); 
    // console.log(searchParams) 
    // const clientIP = searchParams.get('ip'); 
    const value:string | null = searchParams.get('value'); 
    const snoozeDelay:string | null = searchParams.get('snoozeDelay'); 
    console.log("value: "+value);
    console.log("snozzeDelay: "+snoozeDelay);
    
    try {
        const db = await pool_vigitemp.getConnection();
        var query:string;
        var [rows]: any[] = [];
        if (value != null){
            query = 'Update t_lieu set notification_active=?, DateHeure_reactivationAlarme=null where idLieu = ?';
            console.log("Update t_lieu set notification_active="+value+", DateHeure_reactivationAlarme=null where idLieu = "+slug);
            [rows] = await db.query(query,[(value==="true")?'1':'0',slug]);
        }else if(snoozeDelay){
            const date:Date = new Date();
            const newDate1 = addHours(date, parseInt(snoozeDelay));
            let newDate1_string: string = newDate1.getFullYear()+"-"+(newDate1.getMonth()+1)+"-"+newDate1.getDate()+" "+newDate1.getHours() + ":"+newDate1.getMinutes() + ":" + newDate1.getSeconds();
            // console.log(newDate1.getFullYear()+"-"+newDate1.getMonth()+"-"+newDate1.getDate()+" "+newDate1.getHours() + " "+newDate1.getMinutes() + " " + newDate1.getSeconds()); 
            query = "Update t_lieu set notification_active=0,DateHeure_reactivationAlarme ='"+newDate1_string+"'  where idLieu = ?";
            console.log("Update t_lieu set notification_active=0,DateHeure_reactivationAlarme ='"+newDate1_string+"'  where idLieu = ?");
            [rows] = await db.query(query,[slug]);
        }

        
        db.release();
        return NextResponse.json(rows);
        
        // return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({
            error: error
        }, { status: 500 });
    }
}


// export async function GET(
//     request:  NextRequest,
//     { params }: { 
//         params: { 
//             slug: string
//         } 
//     }
// ) {
//     // console.log()
//     const {slug} = await params; // user id

//     const url = new URL(request.url);
//     const searchParams = new URLSearchParams(url.searchParams);
//     const clientIP = searchParams.get('ip');
    
//     try {
//         const db = await pool_vigitemp.getConnection();
//         var query:string = "";
//         // var [rows]:any = [];
//         query = 'select * from t_clients_notifications where id_Lieu = ? and ip_client = ?';
//         // const [rows] = await db.query({sql:query, rowsAsArray:true},[slug, clientIP]);
//         const [rows] = await db.query(query,[slug, clientIP]);
//         db.release();
//         return NextResponse.json(rows);
        
//         // return NextResponse.json(rows);
//     } catch (error) {
//         return NextResponse.json({
//             error: error
//         }, { status: 500 });
//     }
// }