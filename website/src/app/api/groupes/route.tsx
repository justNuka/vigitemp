import { NextRequest, NextResponse } from "next/server";
import {pool_vigitemp} from "@/app/libs/mysql";

export async function GET(
    request:  NextRequest
){
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        // console.log(searchParams);
        var id_to_find = searchParams.get('idToFind')
        // var id_to_find = params.id_to_find
        // console.log(params)
        console.log("Select * from t_groupe where IdGroupe in ("+id_to_find+")")

        const db = await pool_vigitemp.getConnection();
        const query = 'Select * from t_groupe where IdGroupe in ('+id_to_find+')';
        const [rows] = await db.execute(query);
        
        // console.log(query);
        db.release();
        
        return NextResponse.json(rows);
        return NextResponse.json({});

        // return true;
    } catch (error) {
        return NextResponse.json({
            error: error
        }, { status: 500 });
    }
}
