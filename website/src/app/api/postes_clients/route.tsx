import { NextRequest, NextResponse } from "next/server";
import {pool_vigitemp} from "@/app/libs/mysql";

export async function GET(request:  NextRequest){
    try {
        const url = new URL(request.url);

        const db = await pool_vigitemp.getConnection();
        const query = 'SELECT AdresseIPConnexion FROM vigitemp.t_postes_clients';
        const [rows] = await db.execute(query);
        
        // console.log(query);
        db.release();
        
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({
            error: error
        }, { status: 500 });
    }
}