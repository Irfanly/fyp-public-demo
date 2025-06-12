import { NextRequest, NextResponse } from 'next/server';
import { Client } from "@gradio/client";
export async function POST(req: NextRequest) {
    const data = await req.json();
    console.log("Pass data",data);
    try{
        const client = await Client.connect("irfanly/event-description-ai", { hf_token: process.env.NEXT_PUBLIC_HF_TOKEN as `hf_${string}` });
        const result = await client.predict("/predict", { 		
            event_title: data.event_title, 		
            event_type: data.event_type, 		
            event_date: data.event_date, 		
            event_location: data.event_location, 		
            event_organizer: data.event_organizer, 		
            existing_description: data.existing_description || "", 
        });
        console.log(result);
        return NextResponse.json( result.data );
    } catch (error) {
        console.error('Error with API:', error);
        return new NextResponse('Error', { status: 500 });
    }
}