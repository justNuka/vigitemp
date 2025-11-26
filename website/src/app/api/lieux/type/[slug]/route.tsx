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
        
        // const query = 'select * from t_lieu where IdLieu = ?';
        const query =   'SELECT t_types_lieux.* FROM t_lieu '+
                        'inner join t_types_lieux on t_lieu.id_type_lieu = t_types_lieux.id_type_lieu '+
                        'where idLieu = ?';
        const [rows] = await db.execute(query,[slug]);
        db.release();
        
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({
            error: error
        }, { status: 500 });
    }
}