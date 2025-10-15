"use client"


import React from 'react'
import JsonFormatterInput from '../ui/JsonFormatterInput'



const JsonFormaterPage = () => {
  return (
    <div className="w-full flex flex-col h-screen items-center justify-center md:gap-16 gap-8 p-1">    
    
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