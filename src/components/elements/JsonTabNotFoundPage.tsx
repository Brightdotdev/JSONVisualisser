"use client";


import { Button } from "@/components/ui/button";

export default function JsonTabNotFoundPage() {
  return (
    <main className="flex h-screen flex-col items-center justify-center p-6">
      {/* ASCII Art */}
      <pre className="whitespace-pre leading-tight font-mono text-[6px]  select-none text-muted-foreground overflow-x-auto ">
{String.raw`                                                                                                    
                                       ::::                                                         
                              :::;;;;;;;;+++++++;;+;                                                
                           ::;;;;;;;;;;;+++;;;+++++xx+;                                             
                        :;;;::::::::;X&&&&&&&x+;++++++xX&&&&&&x                                     
                     :;;;::::::::::;X&&&$Xxxxx+;;++++++XXX$$&&&                                     
                   :;;::::::::::::::xXx;;;;;;;;;+++++++++xxxX$&                                     
                  ;;;::::::::::::::::::;;;;;;;++++++++++++xxxxxx                                    
                ;;;;:::::::::::::::::;;;;;;;;;+++++++++;+++xxxxXx                                   
               ;;;;:::::::::::::::;;;;::::::;;;+xxx++;;::;;;+xXXXx                                  
              ;;;;;::::::::::::::;;;::::::::;;;++xXx+;::::;;++xXXXx                                 
              ;;;;;::::::::::::;;;;::::::::;;;;+++xxx;:::;;+++xxXXXx                                
             ;;;;;;::::::::::;;;;;;::::;;;++xxxxxxxXX+;;+Xx++++xX$XX                                
             ++;;;;:::::;;;;;;;;;;;;++x$X+xX;;;;;++xxXX+X&&X;;+xxXXX+                               
            +++;;;;;;;;;;;;;;;;++;+;:;$&&$$&+;;;+++xx+$&&&&X;++xx+XX+                               
            +++;;;;;;;;;;;;;;;;++++;;:+$&&&X;;;++xxx+++$$$X;;+xxxxXX;                               
            ++++;;;;;;;;;;;;;;+++++++;;:;+;:;++xxxx++x+;;;;+xxxxxXXX;             ..                
            ++++;;;;;;;;+++++++++++++xxx++++xxxXXx++xxxxxxXXxx+xXXXX;           ::..:;              
            +x+++;;;;;++++++++++++++++xxXXXXXXxx++xxxxxxxxxxxxxXXXXX           .:..:;+              
          ..:+x+++;;;;;;+++++++++++++++++++;;+++x++++++xxxxxXXXXXXXx          ....:;;               
         ::.:;+x++;;;;;;;;;++++++++++++++++++++++++++++xxxxxXXXXXXXx         :...:;;                
          +++;;+x+++;;;;;;;;;;;+;+++++;;;;;;;;;;+++;+++xxxxXXXXXXXX:        .....:::...::::::::::   
           ++;;;++x+++++;;;;;;;;;;;;;;;;;;;:;;;;+++++++xxxXXXXXXXXX        ........::....:...:..::  
            +x++++xxx+++++++;;;;;;;;;;;;;;;;;;+++++xxxxxxXXXXXXXXX;       ;::.::.......:::::::;;++  
             ;;;;;;+xx+++++++++++++++++++++xxxXXXXXXXXXXXXXXXXXXXx        ;:::::.:::::::...:..:+x   
      .:;::;;:;;+++x+xxxxxxxxxxxxxxxxxxxxx+++++++++++++xxXXXXXXXx          ;;+xxxxXXXXxxxxxxx+++    
    ...:;++:+++++;;+xx++xxxxxxxxxxxxxxxXXXXXXxxxxxxxxxXXXXXXXXXx            XXXX$                   
    :..:;;..:;+x+xxx+;;;+xXXxxxxxxxxxXXXXXX$$$$$$$$$$$$XXXXXXx+                                     
     +++xx::;;+xx+::;++xxxxxXXXXXXXXXXXXXXX$$$$$$$$$$XXXXXXXx                                       
           +XXX+:...:+xxxXXXXXXXXXXXXXXXXXXXXXXXX$$XXXXXXXX                                         
                 ;+xxxx+X$&$$$$XXXXXXXXXXXXXXXXXXX$XXX$$X                                           
                          $$&&&&&&$$$$$$$$$$$$$$$$$$$$$                                             
                              $&&&&&&&&&&&&$$$$$$$X                                                 
                                        ++x      X&&&$&&&$x                                         
                                                 X$&&&&&&&&$$$                                      
                                                 XXxX&&&$$$$&$                                      
                           $$&&&&&&&&$$X$        XxxXX&&$$$$$X                                      
                          ;xxxX&&&&&$$$$$$      .xxxxxx&$$$$$X;;                                    
                          :+xxxX$&$$$$$$$X      :x++++++xxxx++xx+;;:::                              
                          :+xxxxX$$$$$$&X       ;x+++++++;:;+;xxXxxxxXXXx                           
                          ;xxxx++x$$$$$$Xxx+   ;xx++++++++++++++++++xxXXX                           
                          +++++++++x++++xXXXXXXxxx++++++++++++++++++xxXXXx                          
                          +++++++++++++;+xxxxxxxxXXX+++++xx++++++++++xxXXX                          
                         +xx+++++++++xx+++++++xxxxXXxXXxx++++;;;;++xxxXXX                           
                         ++++++x+++++++++++++xxxxxXXXx   xXxxxxxXX+                                 
                          xx+;;++xxxxxxx+xxxxxx+++xXX                                               
                            ;xxxx++;;;;;;;;;+++xxXX+                                                
                                ++++xxxxxxxxx++x                                                    
                                                                                                    
                                                                                                    
                                                                                                    `}
      </pre>

      {/* Title */}
      <h1 className="select-none mt-4 heading-1">404</h1>

      {/* Subtitle */}
      <p className="select-none mt-2 text-center body-text">
        The JSON file/tab you&apos;re looking for does not exist <br />
        or must have been deleted.
      </p>


  <div className="mt-6 flex items-center justify-center gap-4 ">



      {/* Button */}
      <Button
        onClick={() => (window.location.href = "/")}
        variant="default"
        className="rounded-sm"
      >
        Let&apos;s go back home, shall we?
      </Button>

      
      {/* Button */}
      <Button
        onClick={() => (window.location.href = "/tabs")}
        variant="ghost-info"
        className=" rounded-sm bg-background-lighter"
      >
        Return to your tabs
      </Button>

  </div>
    </main>
  );
}
