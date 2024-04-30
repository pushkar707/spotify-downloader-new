"use client"
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


const Page = ({ params }: { params: any }) => {
  const { id } = params;

  const [playlistName, setPlaylistName] = useState("");
  const [tracks, settracks] = useState<any[]>([])

  useEffect(() => {
    const getData = async () => {
      const res = await axios.get("http://localhost:8000/playlist/" + id);
      const data = res.data
      setPlaylistName(data.data.playlistName)
      settracks(data.data.tracks)
      console.log(data);
    }

    getData()
  }, [])

  return (
    <main className='max-w-screen min-h-screen px-10 py-12'>
      <p className='text-4xl font-medium text-center'>{playlistName}</p>

      <div className='mt-10'>
        <Table className='max-w-[1200px] mx-auto'>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">S.No</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Artist(s)</TableHead>
              <TableHead>Album</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tracks.map((track, index) =>
              <TableRow className='cursor-pointer'>
                <TableCell className="font-medium py-4">{index + 1}</TableCell>
                <TableCell className='max-w-56'>{track.name}</TableCell>
                <TableCell>{track.artists.slice(0, 2).join(", ")}</TableCell>
                <TableCell>{track.album.name.slice(0, 25)}{track.album.name.length > 25 ? '...' : ''}</TableCell>
                <TableCell className="justify-center flex">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}

export default Page