import React from 'react'
import { Button } from '../ui/button'
import { Eraser, Focus, Hourglass, LayoutGrid } from 'lucide-react'
import { FaMagnifyingGlass } from 'react-icons/fa6'
import { FaProjectDiagram } from 'react-icons/fa'

const ControlsNav = (
    { handleFitView, handleReLayout,
    handleJsonRemove, isLayoutAnimating} :
    
    {handleFitView: () => void, handleReLayout: () => void,
     handleJsonRemove: () => void, isLayoutAnimating: boolean }) => (

        
      <div className="md:fixed top-5 right-5 z-50 flex gap-2">
          <Button 
            onClick={handleFitView}
            variant="outline"
            className='rounded-xs px-2 py-1'
            size="sm"
            disabled={isLayoutAnimating}
          >
            {isLayoutAnimating ? <Hourglass className="mr-2 size-4" /> :<Focus />}
            
            <>
             Fit View
            </>
          </Button>
          <Button 
            onClick={handleReLayout}
            variant="outline"
            className='rounded-xs px-2 py-1'
            size="sm"
            disabled={isLayoutAnimating}
          >
            {isLayoutAnimating ? 
            <>
            <Hourglass className="mr-2 size-4" />
            Arranging
            </>
            : 
            <>
            <FaProjectDiagram />
            Arange Nodes
            </>
            }
          </Button>
          <Button 
            onClick={handleJsonRemove} 
            variant="destructive"
            className='rounded-xs px-2 py-1'

            size="sm"
          >
            <Eraser />
            Clear Nodes
          </Button>
        </div>
  )


export default ControlsNav