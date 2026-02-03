import { COUNTRIES } from '@/lib/countries'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function PhoneCountrySelect({ value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {COUNTRIES.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            <span className="mr-2">{c.flag}</span>
            {c.name} <span className="ml-2 text-xs text-muted-foreground">{c.dial}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
