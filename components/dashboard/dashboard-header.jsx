'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, RefreshCw } from 'lucide-react'

export function DashboardHeader() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard de Leads
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestión y análisis de leads inmobiliarios
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Select defaultValue="14d">
          <SelectTrigger className="w-[160px] bg-secondary/50">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 días</SelectItem>
            <SelectItem value="14d">Últimos 14 días</SelectItem>
            <SelectItem value="30d">Últimos 30 días</SelectItem>
            <SelectItem value="90d">Últimos 90 días</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" className="bg-secondary/50">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
