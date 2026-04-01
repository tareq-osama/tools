import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline"

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl text-foreground">
            $1,250.00
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600 bg-green-500/5 border-green-500/20">
              <ArrowTrendingUpIcon className="size-3.5 mr-1" />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-foreground">
            Trending up this month <ArrowTrendingUpIcon className="size-4 text-green-500" />
          </div>
          <div className="text-muted-foreground">
            Visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Customers</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl text-foreground">
            1,234
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-red-600 bg-red-500/5 border-red-500/20">
              <ArrowTrendingDownIcon className="size-3.5 mr-1" />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-foreground">
            Down 20% this period <ArrowTrendingDownIcon className="size-4 text-red-500" />
          </div>
          <div className="text-muted-foreground">
            Acquisition needs attention
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Accounts</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl text-foreground">
            45,678
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600 bg-green-500/5 border-green-500/20">
              <ArrowTrendingUpIcon className="size-3.5 mr-1" />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-foreground">
            Strong user retention <ArrowTrendingUpIcon className="size-4 text-green-500" />
          </div>
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl text-foreground">
            4.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600 bg-green-500/5 border-green-500/20">
              <ArrowTrendingUpIcon className="size-3.5 mr-1" />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-foreground">
            Steady performance increase <ArrowTrendingUpIcon className="size-4 text-green-500" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card>
    </div>
  )
}
