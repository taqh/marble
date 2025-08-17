import { type Activity, ActivityCalendar } from "react-activity-calendar"
import { memo, useMemo } from "react"
import { useTheme } from "next-themes"

type PostGraphProps = {
  blockMargin?: number
  data: Activity[]
  isLoading: boolean
}

const generatePast12MonthsData = (existingData: Activity[]): Activity[] => {
  const today = new Date()
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  
  const dataMap = new Map((existingData || []).map(entry => [entry.date, entry]))
  
  const completeData: Activity[] = []
  const currentDate = new Date(oneYearAgo)
  
  while (currentDate <= today) {
    const dateString = currentDate.toISOString().split('T')[0]
    
    if (dateString) {
      const existingEntry = dataMap.get(dateString)
      if (existingEntry) {
        completeData.push(existingEntry)
      } else {
        completeData.push({
          date: dateString,
          count: 0,
          level: 0,
        })
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return completeData
}

const DEFAULT_LIGHT_PALETTE = ["#ebedf0", "#c4d2f4", "#9cb6f8", "#759bfb", "#4d7fff"]
const DEFAULT_DARK_PALETTE = ["#131315", "#222e50", "#30498a", "#3f64c5", "#4d7fff"]

export const PostGraph = memo(
  ({
    blockMargin = 2,
    data,
    isLoading,
  }: PostGraphProps) => { 
    const { theme } = useTheme()
    const completeData = useMemo(() => {
      return generatePast12MonthsData(data || [])
    }, [data])

    const label = {
      totalCount: `{{count}} ${data?.length === 1 ? 'post' : 'posts'} published in the last year`,
    }

    return (
      <div className="w-full">
          <ActivityCalendar
            data={completeData}
            maxLevel={4}
            blockMargin={blockMargin}
            loading={isLoading}
            colorScheme={theme === 'dark' ? 'dark' : 'light'}
            labels={label}
            theme={{
              light: DEFAULT_LIGHT_PALETTE,
              dark: DEFAULT_DARK_PALETTE,
            }}
          />
      </div>
    )
  },
)
