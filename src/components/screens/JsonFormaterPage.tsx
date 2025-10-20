"use client"


import React, { useEffect } from 'react'
import JsonFormatterInput from '../JsonFormatter/JsonFormatterInput'



const JsonFormaterPage = () => {

  // app/layout.tsx or a client component
useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
}, []);


  return (
    <div className="w-screen flex flex-col h-screen items-center justify-start md:justify-center md:gap-12 sm:gap-8 gap-4 p-1">    
    
    <h1 className="hero-text">
      <span className='md:flex hidden'>
        Paste or drop your JSON file here
      </span>
      <span className='flex md:hidden'>
      Input Your Json File or Text
      </span>
    </h1>

      <div className=" w-full items-center flex flex-col gap-2">
            <JsonFormatterInput />
         <p className="text-xs text-muted-foreground">
            The input expect json objects not json arrays
          </p>
      </div>


    </div>
)
}

export default JsonFormaterPage