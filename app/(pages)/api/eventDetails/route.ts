import { NextRequest, NextResponse } from 'next/server';
import { Client } from "@gradio/client";

export async function POST(req: NextRequest) {
    const data = await req.json();
    try{
        const client = await Client.connect("irfanly/testSpace", { hf_token: process.env.NEXT_PUBLIC_HF_TOKEN as `hf_${string}` });
        const result =await client.predict("/predict", {
            text: data.text,
        });
        console.log(result);
        const aiSummary = (result.data as string[]).join(' ');
        return NextResponse.json( aiSummary );
    } catch (error) {
        console.error('Error with API:', error);
        return new NextResponse('Error', { status: 500 });
    }
}