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

        
      <div className="fixed top-5 md:right-5 right-3 z-50 flex gap-2">
          <Button 
            onClick={handleFitView}
            variant="outline"
            className='rounded-xs px-2 py-1'
            size="sm"
        title="fit json nodes in view"
            disabled={isLayoutAnimating}
          >
            {isLayoutAnimating ? <Hourglass className="mr-2 size-4" /> :<Focus />}
            
            <span className='md:flex hidden' > 
             Fit View
            </span>
          </Button>
          <Button 
            onClick={handleReLayout}
            variant="outline"
            className='rounded-xs px-2 py-1'
        title="Arrannge json Nodes"
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
            <span className='md:flex hidden' > 
            Arange Nodes
            </span>
            </>
            }
          </Button>
          <Button 
            onClick={handleJsonRemove} 
            variant="destructive"
            className='rounded-xs px-2 py-1'
        title="Clear json Nodes"
            size="sm"
          >
            <Eraser />
            <span className='md:flex hidden'> 
            Clear Nodes
            </span>
          </Button>
        </div>
  )


export default ControlsNav