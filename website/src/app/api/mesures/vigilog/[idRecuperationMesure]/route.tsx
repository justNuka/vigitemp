import { NextRequest, NextResponse } from "next/server";
import {pool_vigitemp, pool_vigitemp_mesure} from "@/app/libs/mysql";


export async function GET(
    request:  NextRequest,
    context: { params: Promise<{ idRecuperationMesure: string }> }
) {
    const params = await context.params;
    const id_recuperationMesure = params.idRecuperationMesure; // user id
    
    try {
        const db = await pool_vigitemp_mesure.getConnection();
        
        const query = 'select * from ts_mesuresvigiloghugo where id_recuperationMesure = ? ORDER BY heure_mesure DESC';
        const [rows] = await db.execute(query,[id_recuperationMesure]);
        db.release();
        
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({
            error: error
        }, { status: 500 });
    }
}