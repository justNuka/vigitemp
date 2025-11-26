import { NextRequest, NextResponse } from "next/server";
import {pool_vigitemp} from "@/app/libs/mysql";

export async function GET(request:  NextRequest){
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        // console.log(searchParams);
        var enSurveillance = searchParams.get('enSurveillance')
        enSurveillance = enSurveillance=='1'?"S":"D"
        // const enSurveillance = searchParams.get('enSurveillance')=="true"?"S":"D"; 

        const db = await pool_vigitemp.getConnection();
        const query = 'Select * from t_lieu where Lieu_Etat= ?';
        const [rows] = await db.execute(query, [enSurveillance]);
        
        // console.log(query);
        db.release();
        
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({
            error: error
        }, { status: 500 });
    }
}



// import { NextResponse } from "next/server";
// import {pool_vigitemp} from "@/app/libs/mysql";

// export async function GET() {
//     try {
//         const db = await pool_vigitemp.getConnection();
//         const query = 'select * from t_lieu;';
//         const [rows] = await db.execute(query);
//         db.release();
        
//         return NextResponse.json(rows);
//     } catch (error) {
//         return NextResponse.json({
//             error: error
//         }, { status: 500 });
//     }
// }