import { NextRequest, NextResponse } from "next/server";
import { pool_vigitemp, pool_vigitemp_mesure} from "@/app/libs/mysql";


export async function GET(
    request:  NextRequest,
    context: { params: Promise<{ IdLieu: string }> }
) {
    const params = await context.params;
    try {

        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const rowNumber = searchParams.get('rowNumber'); 
        const startDate = searchParams.get('startDate'); 
        const endDate = searchParams.get('endDate'); 

        const {IdLieu} = await params ; 

        const db = await pool_vigitemp_mesure.getConnection();
        let query = "";
        let [rows]: any[] = [];
        if(rowNumber != null){
            query = 'select * from ts_mesure where IdLieu = ? ORDER BY DateHeureMesure DESC LIMIT ?';
            // console.log(query);
            [rows] = await db.execute(query,[IdLieu, rowNumber]);
            // console.log([rows]);
        }
        if(startDate != null && endDate != null){
            query = 'select * from ts_mesure '+
                    'where IdLieu = ? '+
                    'AND DateHeureMesure > from_unixtime(floor(?/1000)) '+
                    'AND DateHeureMesure < from_unixtime(floor(?/1000)) '+
                    'ORDER BY DateHeureMesure DESC;';
            [rows] = await db.execute(query,[IdLieu, startDate, endDate]);
            // console.log([rows]);
            if (rows.length < 100){
                query = 'select * from ts_mesure where IdLieu = ? ORDER BY DateHeureMesure DESC LIMIT 100';
                // console.log(query);
                [rows] = await db.execute(query,[IdLieu]);
            }
        }
        
        db.release();
        
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({
            error: error
        }, { status: 500 });
    }
}