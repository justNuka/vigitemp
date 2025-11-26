import { NextRequest, NextResponse } from "next/server";
import {pool_vigitemp} from "@/app/libs/mysql";


export async function GET(
    request:  NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    const params = await context.params;
    const {slug} = params; // user id
    
    try {
        const db = await pool_vigitemp.getConnection();
        
        const query =   'select t_lieu.*, t_sonde.IdSonde, t_sonde.SondeNumeroSerie, t_module.IdModule,t_module.ModuleNumeroSerie from t_lieu '+
                        'LEFT JOIN t_sonde on t_lieu.SondeNumeroSerie = t_sonde.SondeNumeroSerie '+
                        'LEFT JOIN t_module on t_sonde.IdModule = t_module.IdModule '+
                        'where IdLieu = ?';
                        console.log(query);
        const [rows] = await db.execute(query,[slug]);
        db.release();
        
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({
            error: error
        }, { status: 500 });
    }
}