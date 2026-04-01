'use client'

import React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { InformationCircleIcon } from '@heroicons/react/24/solid'

interface KpiInfoProps {
  description: string
}

export function KpiInfo({ description }: KpiInfoProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="cursor-help text-muted-foreground/50 hover:text-primary transition-colors focus:outline-none">
            <InformationCircleIcon className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px] p-3 text-xs leading-relaxed border bg-background text-foreground shadow-lg">
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
