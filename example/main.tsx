import React from 'react'
import { createRoot } from 'react-dom/client'
import { TidemanVisualizer } from '../src'
import '../src/styles.css'

const root = createRoot(document.getElementById('root')!)
root.render(<TidemanVisualizer />)
