"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";

export default function Home() {
  const [link, setLink] = useState("")
  const getData = async (e: FormEvent) => {
    e.preventDefault()
    const id = link.split("?")[0].split("/").pop()
    const requestFor = link.includes("playlist") ? "playlist" : link.includes("track") ? "track" : null
    window.location.href = `/${requestFor}/${id}`
  }
  return (
    <main className="flex min-h-screen flex-col items-center gap-y-10 p-24">
      <form onSubmit={getData} className="flex gap-x-2 max-w-xl w-3/4">
        <Input value={link} onChange={(e) => setLink(e.target.value)} type="text" placeholder="Enter a playlist or song URL here" className="w-full border-slate-400" />
        <Button>Find</Button>
      </form>
      <div>
        <p className="mb-4 text-xl font-medium">Featured Playlists</p>
        <div className="flex flex-wrap gap-4">
          <div className="w-60 h-72 bg-slate-100"></div>
          <div className="w-60 h-72 bg-slate-100"></div>
          <div className="w-60 h-72 bg-slate-100"></div>
          <div className="w-60 h-72 bg-slate-100"></div>
          <div className="w-60 h-72 bg-slate-100"></div>
          <div className="w-60 h-72 bg-slate-100"></div>
          <div className="w-60 h-72 bg-slate-100"></div>
          <div className="w-60 h-72 bg-slate-100"></div>
          <div className="w-60 h-72 bg-slate-100"></div>
        </div>
      </div>
    </main >
  );
}
